const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),course=path.join(root,'solutions-el-active-teach');
const manifest=JSON.parse(fs.readFileSync(path.join(course,'manifest.js'),'utf8').replace(/^window\.SOL=/,'').replace(/;\s*$/,''));
assert.equal(manifest.sb.length,141);assert.equal(manifest.wb.length,58);assert.equal(manifest.video.length,9);
for(const [book,count] of [['sb',164],['wb',129]])for(let page=1;page<=count;page++)assert(fs.existsSync(path.join(course,'pages',book,String(page).padStart(3,'0')+'.jpg')));
for(const entry of Object.values(manifest).flat())assert(fs.statSync(path.join(course,entry.f)).size>1000,entry.f);
assert(fs.statSync(path.join(course,'Solutions_Elementary_WB_Keys.pdf')).size>1000);
console.log('PASS all 293 source pages, 199 audio tracks, 9 videos and Workbook keys present.');
if(process.argv.includes('--browser'))(async()=>{
 const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/mak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const origin=process.env.SOLUTIONS_EL_ORIGIN||'http://127.0.0.1:8897',base=origin+'/solutions-el-active-teach/index.html';
  const ready=()=>page.waitForFunction(()=>document.getElementById('pgimg')?.naturalWidth>0);
  await page.goto(origin+'/solutions-el-course.html?book=wb&unit=3');await page.waitForURL('**/solutions-el-active-teach/**');await ready();
  assert.equal(await page.locator('#jump').inputValue(),'30');assert.equal(await page.locator('.bkbtn.on').getAttribute('data-b'),'wb');
  for(const book of ['sb','wb'])for(let unit=0;unit<=9;unit++){
   await page.goto(base+`?book=${book}&unit=${unit}`);await ready();
   assert.match(await page.locator('#pginfo').textContent(),new RegExp(unit===0?'Introduction':`^${unit} ·`));
  }
  await page.goto(base+'?book=sb&page=8');await ready();
  await page.screenshot({path:'/private/tmp/solutions-el-desktop.png'});
  await page.locator('#pgtracks button').first().click();await page.waitForFunction(()=>document.querySelector('#aud').readyState>=1);assert(await page.locator('#aud').evaluate(a=>a.duration>0));
  await page.locator('#spd').selectOption('0.75');assert.equal(await page.locator('#aud').evaluate(a=>a.playbackRate),.75);
  await page.locator('#vids button').click();await page.waitForFunction(()=>document.querySelector('#vid').readyState>=1);assert(await page.locator('#vid').evaluate(v=>v.duration>0));assert(await page.locator('#aud').evaluate(a=>a.paused));
  await page.keyboard.press('Escape');assert(!(await page.locator('#voverlay').isVisible()));assert(await page.locator('#vid').evaluate(v=>v.paused));
  await page.locator('#next').click();assert.equal(await page.locator('#jump').inputValue(),'9');
  await page.locator('#jump').fill('120');await page.locator('#jump').press('Enter');await page.locator('#jump').blur();assert.match(await page.locator('#pginfo').textContent(),/Vocabulary Builder/);
  await page.reload();await ready();assert.equal(await page.locator('#jump').inputValue(),'120');
  await page.goto(base+'?book=wb&page=128');await ready();assert(await page.locator('#next').isDisabled());
  await page.setViewportSize({width:390,height:844});await page.goto(base+'?unit=2');await ready();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('#sideToggle').click();assert.equal(await page.locator('#sideToggle').getAttribute('aria-expanded'),'true');
  await page.locator('#tracks button').first().click();await page.waitForFunction(()=>document.querySelector('#aud').readyState>=1);
  await page.locator('#sideToggle').click();await page.waitForFunction(()=>getComputedStyle(document.getElementById('side')).transform==='matrix(1, 0, 0, 1, 290, 0)');await page.screenshot({path:'/private/tmp/solutions-el-mobile.png'});
  // Real room message contract without connecting to a student or creating a live lesson.
  await page.setViewportSize({width:1440,height:1000});
  await page.route('**/solutions-el-test-parent',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><body></body>'}));
  await page.goto(origin+'/solutions-el-test-parent');
  await page.evaluate(src=>{window.messages=[];window.addEventListener('message',e=>{if(e.origin===location.origin)window.messages.push(e.data)});const f=document.createElement('iframe');f.id='course';f.style='width:100%;height:900px';f.src=src;document.body.append(f);},base+'?unit=1&embedded=1&lessonRole=s');
  const frame=page.frameLocator('#course');await frame.locator('#pgimg').waitFor();
  await page.waitForFunction(()=>window.messages.some(d=>d.kind==='ready'));
  await page.evaluate(()=>document.querySelector('#course').contentWindow.postMessage({type:'outcomes-lesson',kind:'view',book:'wb',page:40,exercise:null},location.origin));
  await frame.locator('#jump').waitFor();await page.waitForFunction(()=>document.querySelector('#course').contentDocument.querySelector('#jump').value==='40');
  const video=base.replace('index.html','')+manifest.video[0].f;
  await page.evaluate(src=>document.querySelector('#course').contentWindow.postMessage({type:'outcomes-lesson',kind:'audio',mediaType:'video',src,time:1,rate:1,paused:true,at:Date.now()},location.origin),video);
  await frame.locator('#liveLessonAudio').waitFor();await page.waitForFunction(()=>document.querySelector('#course').contentDocument.querySelector('#liveLessonAudio').readyState>=1);
  assert.equal(await frame.locator('#liveLessonAudio').evaluate(v=>v.tagName),'VIDEO');
  await page.evaluate(src=>{window.messages=[];document.querySelector('#course').src=src;},base+'?unit=2&embedded=1&lessonRole=t');
  await page.waitForFunction(()=>window.messages.some(d=>d.kind==='view'&&d.page===18));
  await frame.locator('#next').click();await page.waitForFunction(()=>window.messages.some(d=>d.kind==='view'&&d.page===19));
  assert.deepEqual(errors,[]);
  console.log('PASS browser: entry redirect, all units, audio/video playback, page links, mobile, and teacher/student page/media synchronization.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
