'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../speakout-a1-active-teach');
const D=require(path.join(root,'assets/review-data.js'));
assert.equal(D.units.length,8);
const ids=new Set();
for(const u of D.units){
  assert.equal(u.missions.length,8);let count=0;
  assert(u.speaking&&u.writing&&u.rubric.length===3);
  for(const m of u.missions){
    if(m.image){assert(fs.existsSync(path.join(root,m.image.src)));const [x,y,w,h]=m.image.box;assert(x>=0&&y>=0&&x+w<=100.01&&y+h<=100.01);}
    if(m.media){assert(fs.existsSync(path.join(root,m.media.src)));assert(m.media.source&&m.media.summary);}
    for(const q of m.questions){
      assert(!ids.has(q.id));ids.add(q.id);
      if(q.type==='choice'){assert.equal(new Set(q.options).size,3);assert(q.options.includes(q.answer));assert(q.why);count++;}
      else if(q.type==='order'){assert(q.answer.split(' ').length>=4);count++;}
      else if(q.type==='match'){assert.equal(new Set(q.pairs.map(p=>p[1])).size,4);count+=q.pairs.length;}
      else assert.fail(q.type);
    }
  }
  assert.equal(count,24,`Unit ${u.id}`);
}
console.log('PASS: 8 quests, 192 auto-graded items, 16 teacher tasks, local photos/audio/video, unique answers.');
if(process.argv.includes('--browser'))(async()=>{
  const {chromium}=require('/Users/mak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try{
    const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    const base=(process.env.A1_REVIEW_ORIGIN||'http://127.0.0.1:8774')+'/speakout-a1-active-teach/';
    const go=async n=>{await page.locator(`[data-mission="${n}"]`).click();};
    async function fillMission(m,wrong=false){
      for(const q of m.questions){
        if(q.type==='choice')await page.locator(`#${q.id} input`).filter({visible:true}).evaluateAll((els,value)=>{const el=els.find(el=>el.value===value);el.click();},wrong?q.options[1]:q.answer);
        else if(q.type==='order'){
          const norm=s=>s.toLowerCase().replace(/[.!?,]/g,''),tokens=q.answer.split(' '),used=new Set();
          for(const word of (q.accepted?.[0]||q.answer).split(' ')){const i=tokens.findIndex((t,n)=>!used.has(n)&&norm(t)===norm(word));assert(i>=0);used.add(i);await page.locator(`#${q.id} [data-token="${i}"]`).click();}
        }
        else for(let i=0;i<q.pairs.length;i++){await page.locator(`#${q.id} [data-left="${i}"]`).click();await page.locator(`#${q.id} [data-right="${i}"]`).click();}
      }
      assert(await page.locator('#submit-mission').isEnabled());await page.locator('#submit-mission').click();
    }
    await page.goto(base+'review.html?unit=1');await page.locator('[data-unit="1"]').waitFor();
    await page.screenshot({path:'/private/tmp/speakout-a1-review-home.png',fullPage:true});
    await page.locator('#learner').fill('<Sasha & Asya>');await page.locator('[data-unit="1"]').click();
    assert(await page.locator('#submit-mission').isDisabled());
    await fillMission(D.units[0].missions[0],true);assert.match(await page.locator('#feedback').textContent(),/0 из 3/);
    await page.locator('#retry').click();await fillMission(D.units[0].missions[0]);
    assert.match(await page.locator('#feedback').textContent(),/3 из 3.*первая проверка: 0\/3/s);
    await page.reload();assert.match(await page.locator('#feedback').textContent(),/первая проверка: 0\/3/);
    await page.screenshot({path:'/private/tmp/speakout-a1-review-desktop.png',fullPage:true});
    for(let i=1;i<7;i++){
      await go(i);await fillMission(D.units[0].missions[i]);
      if(i===1){
        await page.locator('#memory-open').click();const seen={};
        for(let n=0;n<8;n++){const b=page.locator(`[data-card="${n}"]`);if(await b.isEnabled())await b.click();seen[await b.textContent()]=n;}
        for(const [left,right]of D.units[0].pairs){const a=page.locator(`[data-card="${seen[left]}"]`);if(await a.isEnabled()){await a.click();await page.locator(`[data-card="${seen[right]}"]`).click();}}
        assert.equal(await page.locator('[data-card]:disabled').count(),8);assert.match(await page.locator('#memory-status').textContent(),/Все пары найдены/);await page.keyboard.press('Escape');await page.locator('dialog').waitFor({state:'detached'});assert.equal(await page.evaluate(()=>document.activeElement.id),'memory-open');
      }
    }
    await go(7);await page.locator('#speaking').fill('Introduce myself; ask two questions.');await page.locator('#writing').fill("Hi, I’m Lina. I am from Italy. I am a student. What’s your name?");
    await page.locator('#finish').click();assert.match(await page.locator('.result-score').textContent(),/21\s*\/ 24/);
    const dl=page.waitForEvent('download');await page.locator('#download').click();const file=await dl;const filePath=await file.path();const report=fs.readFileSync(filePath,'utf8');assert(report.includes('<Sasha & Asya>'));assert(report.includes('Первая проверка: 21/24'));assert(report.includes('Introduce myself'));
    // Assessment mode locks each submission, withholds keys until all 7 missions, and covers every unit.
    for(const u of D.units){
      await page.goto(base+`review.html?unit=${u.id}`);await page.locator('input[value="check"]').check();await page.locator(`[data-unit="${u.id}"]`).click();
      for(let i=0;i<7;i++){
        if(i)await go(i);
        const m=u.missions[i];
        if(m.media){await page.waitForFunction(()=>{const p=document.querySelector('audio,video');return p&&p.readyState>=1&&p.duration>0;},{},{timeout:20000});assert(!(await page.locator('#media-error').isVisible()));}
        await fillMission(m);
        assert.equal(await page.locator('#retry').count(),0);
        if(i<6)assert.match(await page.locator('#feedback').textContent(),/Разбор откроется/);
      }
      await page.locator('#report-open').click();assert.match(await page.locator('.result-score').textContent(),/24\s*\/ 24/);
      assert.equal(await page.locator('.answer-review').count(),1);
    }
    // Mobile: each interaction and photo is reachable without horizontal overflow.
    await page.setViewportSize({width:390,height:844});await page.goto(base+'review.html?unit=6');await page.locator('[data-unit="6"]').click();
    for(let i=0;i<8;i++){
      if(i)await go(i);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Mobile mission ${i}`);
      if(i===0)await page.screenshot({path:'/private/tmp/speakout-a1-review-mobile.png',fullPage:true});
    }
    await page.goto(base+'review.html?unit=banana');assert.equal(await page.locator('.unit-row').count(),8);
    // Reloading an incomplete mission preserves selected answers, isolated from other attempts.
    await page.locator('[data-unit="2"]').click();const q=D.units[1].missions[0].questions[0];await page.locator(`#${q.id} input`).evaluateAll((els,value)=>els.find(el=>el.value===value).click(),q.answer);await page.reload();assert.equal(await page.locator(`#${q.id} input:checked`).inputValue(),q.answer);
    // Saving disabled must leave the quiz usable and report the persistence failure.
    const blocked=await browser.newContext();await blocked.addInitScript(()=>{Storage.prototype.setItem=function(){throw Error('blocked');};});const b=await blocked.newPage();await b.goto(base+'review.html');await b.locator('[data-unit="1"]').click();assert.match(await b.locator('#save-status').textContent(),/Хранилище браузера недоступно/);await blocked.close();
    await page.goto(base+'index.html?unit=4',{waitUntil:'domcontentloaded'});await page.locator('#reviewQuest').waitFor();await page.waitForFunction(()=>document.querySelector('#reviewQuest').getAttribute('href')==='review.html?unit=4');await page.locator('#reviewQuest').click();assert.equal(await page.locator('.recommended .unit-label').textContent(),'Unit 4 · Every day');
    assert.deepEqual(errors,[]);console.log('PASS: full 8-unit browser flows, scoring, first attempts, retries, assessment, persistence, report, all media, mobile.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
