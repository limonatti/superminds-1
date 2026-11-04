const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||require.resolve('playwright',{paths:[require('node:path').join(require('node:os').homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node')]}));
const base=process.env.EXERCISE_TEST_BASE||'http://127.0.0.1:8772';
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const p=await browser.newPage({viewport:{width:1280,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**',r=>r.request().url().startsWith(base)?r.continue():r.abort());
 const open=async()=>{if(!await p.locator('dialog[open]').count())await p.locator('[data-exercise="wb-6-59-754"]').first().click()};
 await p.goto(base+'/outcomes-beginner-active-teach/index.html?book=wb&page=6');await open();
 assert.equal(await p.locator('[data-response="0"]').inputValue(),'husband','retain the printed example');
 assert(await p.locator('.play-canvas').evaluate(el=>el.getBoundingClientRect().width>750),'the exercise uses the available dialog width');
 assert.equal(await p.locator('#responseFields textarea:visible,.play-manual input:visible').count(),0);
 const positions=[[485,1323],[310,1373],[390,1400],[275,1423],[472,1473],[375,1499]];
 for(const [i,word]of ['teacher','daughter','brother','friend','mother','father'].entries()){
  const [a,b]=positions[i],canvas=p.locator('.play-canvas').first();await canvas.scrollIntoViewIfNeeded();
  const pos=await canvas.evaluate((el,[a,b])=>{const[x,y,w,h]=el._source.box,panel=el.closest('.focus-columns'),bank=el.closest('dialog').querySelector('.play-workbench');let r=el.getBoundingClientRect();const target=r.y+(b/1643-y)/h*r.height,top=panel.getBoundingClientRect().top+55,bottom=Math.min(panel.getBoundingClientRect().bottom,bank.getBoundingClientRect().top)-20;panel.scrollTop+=target-(top+bottom)/2;r=el.getBoundingClientRect();return{x:r.x+(a/1281-x)/w*r.width,y:r.y+(b/1643-y)/h*r.height}},[a,b]);
  await p.mouse.click(pos.x,pos.y);const input=p.locator(`input.play-slot[data-field="${i}"]`);await input.waitFor();if(await input.evaluate(el=>el.readOnly))await input.dblclick();await input.fill(word);if(i<5)await input.press('Enter');
 }
 assert.equal(await p.locator('[data-response="1"]').inputValue(),'teacher; daughter');
 await p.locator('.play-check').click();assert.match(await p.locator('.play-feedback').innerText(),/4.*4/);
 await p.reload();await open();assert.deepEqual(await p.locator('input.play-slot').evaluateAll(xs=>xs.map(x=>x.value)),['teacher','daughter','brother','friend','mother','father']);
 await p.screenshot({path:'/private/tmp/inline-outcomes-grouped.png'});
 await p.goto(base+'/solutions-int-active-teach/index.html?book=wb&page=34');await p.locator('[data-ex="wb-34-3"]').first().click();
 assert.match(await p.locator('.play-current').innerText(),/из 18/);assert.equal(await p.locator('.answer-row textarea:visible,.play-manual input:visible').count(),0);
 assert.deepEqual((await p.locator('.play-word').allTextContents()).sort(),['annoy','bore','care','disgust','excite','help','hope','pain','power','surprise']);
 assert.deepEqual(errors,[]);console.log('PASS grouped cloze words on the original page, original example, set grading/storage, reload, and 18 separate adjective slots');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
