// Exercise bodies, not only badges, must open the existing answer dialog.
const assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),base=process.env.COURSE_TEST_BASE||'http://127.0.0.1:8768';
const {chromium}=require(require.resolve('playwright',{paths:[root,path.join(require('node:os').homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node')]}));
const cases=[
 ['speakout-a1',8,3,'#hotspots .exercise-region'],
 ['speakout-b1',8,4,'#hotspots .exercise-region'],
 ['speakout-b1plus',8,4,'#hotspots .exercise-region'],
 ['solutions-int',4,4,'#hotspots .exercise-region'],
 ['outcomes-beginner',10,5,'#exerciseHotspots .exercise-region'],
 ['speakout-b2plus',9,4,'.spot.book-exercise']
];
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{for(const [course,sb,wb,selector]of cases)for(const book of ['sb','wb']){
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route('https://**',r=>r.abort());
  const url=`${base}/${course}-active-teach/index.html?book=${book}&page=${book==='sb'?sb:wb}`;
  await page.goto(url);await page.locator(selector).first().waitFor();
  const target=page.locator(selector).first();await target.scrollIntoViewIfNeeded();
  const box=await target.boundingBox();assert(box.width>60,course+' body must extend beyond its badge');
  // Right edge lies outside the number badge, even for a short instruction.
  await target.click({position:{x:box.width*.8,y:Math.max(3,box.height*.45)}});
  const dialog=page.locator('dialog[open].focus-dialog');await dialog.waitFor();
  assert(await dialog.locator('.focus-responses input,.focus-responses textarea,.focus-responses select,.focus-responses button').count(),course+' answer controls');
  const d=await dialog.boundingBox();assert(Math.abs(d.x+d.width/2-720)<4,course+' centered');
  await page.keyboard.press('Escape');assert.equal(await page.locator('dialog[open]').count(),0);
  // The same target remains accessible by keyboard after closing.
  await target.focus();await page.keyboard.press('Enter');await dialog.waitFor();
  await page.keyboard.press('Escape');
  if(course!=='speakout-b2plus'){
   const tool=page.locator('[data-tool="pen"]');
   if(await tool.count()){
    await tool.first().click();
    assert(!(await target.isVisible())||await target.evaluate(el=>getComputedStyle(el.closest('#hotspots,#exerciseHotspots')).visibility==='hidden'||getComputedStyle(el).pointerEvents==='none'),course+' drawing must not open exercises');
   }
  }
  assert.deepEqual(errors,[],course);await page.close();console.log('PASS '+course+' '+book+' body click, centered answers, Escape and keyboard');
 }
 const restored=require('../speakout-a1-active-teach/audit/regions-restored.json').restored;
 assert.equal(restored.length,49);
 const p=await browser.newPage({viewport:{width:1440,height:1000}});await p.route('https://**',r=>r.abort());
 let current='';
 for(const entry of restored){
  const [book,n,label]=entry.id.split(':');
  if(current!==book+':'+n){await p.goto(`${base}/speakout-a1-active-teach/index.html?book=${book}&page=${n}`);current=book+':'+n}
  const target=p.locator('#hotspots .exercise-region').filter({hasText:new RegExp('^'+label+'$')});
  await target.scrollIntoViewIfNeeded();const box=await target.boundingBox();
  await target.click({position:{x:box.width*.65,y:box.height*.4}});
  assert.match(await p.locator('#exerciseTitle').innerText(),new RegExp('\\b'+label+'\\b'));
  await p.keyboard.press('Escape');
 }
 await p.close();console.log('PASS 49 restored A1 exercise regions open their own task');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
