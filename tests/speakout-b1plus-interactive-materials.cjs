const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../speakout-b1plus-active-teach');
const read=file=>{const text=fs.readFileSync(path.join(root,file),'utf8');return JSON.parse(text.slice(text.indexOf('=')+1).replace(/;\s*$/,''))};
const M=read('assets/material-interactions.js').materials,D=read('assets/materials-data.js');
const I=require(path.join(root,'assets/material-exercises.js'));
const section=(id,ex)=>M['tests-so3-b1p-'+id].sections.find(s=>s.id===ex);
assert.equal(Object.keys(M).length,75);
assert.equal(JSON.parse(fs.readFileSync(path.join(root,'audit/material-interactions.json'))).issues.length,0);
for(let u=1;u<=8;u++)for(const variant of 'abc')for(const type of ['unit-test','quick-quiz'])assert(M[`tests-so3-b1p-${type}-u${u}${variant}`]);
for(const [id,spec]of Object.entries(M)){
 const source=D.items.find(m=>m.id===id);assert(source&&!source.teacher);
 assert(spec.sections.length>0,id);assert.equal(new Set(spec.sections.map(s=>s.id)).size,spec.sections.length);
 for(const ex of spec.sections){
  assert(ex.sourcePage>=1&&ex.sourcePage<=source.pageCount,`${id} ${ex.id}`);
  assert(ex.key.path&&ex.key.raw,`${id} ${ex.id}`);
  if(ex.part==='C')assert.equal(ex.mode,'review');
  if(ex.skill==='Listening')assert(ex.audio.length,`${id} ${ex.id}: missing audio`);
  for(const a of ex.audio)assert(source.audio.some(m=>m.path===a.path));
  assert.equal(new Set(ex.fields.map(f=>f.n)).size,ex.fields.length);
  for(const f of ex.fields){
   if(/Choose|Circle/.test(ex.instruction))assert.notEqual(f.type,'text',`${id} ${ex.id} ${f.n}: missing source choices`);
   assert(f.answers.length&&f.answers.every(a=>a.trim()),`${id} ${ex.id} ${f.n}`);
   assert(!I.matches('',f));assert(!I.matches('definitely incorrect 918273',f));
   for(const a of f.answers)assert(I.matches(a.toUpperCase()+'  ',f));
   if(f.options){assert(f.options.length>=2);assert.equal(new Set(f.options.map(o=>o.value)).size,f.options.length);assert(f.options.some(o=>I.matches(o.value,f)),`${id} ${ex.id} ${f.n}: no correct option`);}
  }
 }
}
// Source fixtures: variants are different tests; blanks in the tick key mean no.
assert.deepEqual(section('unit-test-u1a','a-1').fields.map(f=>f.sourceAnswer),['went','was walking','was raining','had seen','arrived','heard','had hidden']);
assert.equal(section('unit-test-u1a','a-7').sourcePage,2);
assert.equal(section('unit-test-u1a','b-1').audio[0].track,'UT1.01');
assert.equal(section('unit-test-u1a','b-6').mode,'review');
assert.equal(section('unit-test-u4b','b-6').mode,'review');
assert.equal(section('quick-quiz-u1a','q-1').fields.length,10);assert.equal(section('quick-quiz-u1c','q-1').fields.length,8);
assert.deepEqual(section('unit-test-u6a','b-3').fields.map(f=>f.answers[0]),['–','✓','✓','✓','–']);
assert.deepEqual(section('unit-test-u8a','b-1').fields.map(f=>f.answers[0]),['–','✓','✓','–','✓']);
assert.deepEqual(section('unit-test-u3a','b-1').fields[0].options.map(o=>o.value),['K','S','B']);
assert.equal(section('quick-end-of-course-test-u1-8a','q-3').fields.at(-1).n,'100');
const allFields=Object.values(M).flatMap(m=>m.sections.flatMap(s=>s.fields));
const phrase=allFields.find(f=>f.sourceAnswer==='I’ve been working/I’ve worked as a waiter for three years.');
assert(I.matches('I have worked as a waiter for three years',phrase));assert(I.matches('I have been working as a waiter for three years.',phrase));assert(!I.matches('I work as a waiter for three years',phrase));
console.log(`PASS all 75 tests: ${allFields.length} auto-checked responses, source variants, tick keys, audio and original-page mapping.`);

if(process.argv.includes('--browser'))(async()=>{
 const {chromium}=require('/Users/mak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1540,height:1080}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const base='http://127.0.0.1:8768/speakout-b1plus-active-teach/index.html';
  const open=async id=>{await page.goto(base+'?materials=tests&material=tests-so3-b1p-'+id);await page.waitForSelector('#practiceSelect')};
  await open('unit-test-u1a');assert.equal(await page.locator('#practiceSelect').inputValue(),'a-1');
  const expected=['went','was walking','was raining','had seen','arrived','heard','had hidden'];
  for(let i=0;i<expected.length;i++)await page.locator(`[data-answer-number="${i+1}"]`).filter({hasText:new RegExp('^'+expected[i]+'$')}).click();
  await page.locator('#practiceCheck').click();assert.match(await page.locator('#practiceResult').textContent(),/7 из 7/);
  await page.locator('[data-answer-number="1"][data-answer-value="was going"]').click();
  await page.locator('#practiceCheck').click();assert.match(await page.locator('#practiceResult').textContent(),/6 из 7/);
  await page.locator('#practiceRetry').click();assert.equal(await page.locator('[data-answer-number="1"][aria-pressed="true"]').count(),0);
  assert.equal(await page.locator('[data-answer-number="2"][aria-pressed="true"]').count(),1);
  await page.locator('#practiceSelect').selectOption('a-2');await page.locator('[data-practice-input="1"]').fill('to complete');await page.locator('#practiceCheck').click();
  assert.equal(await page.locator('[data-field="1"]').getAttribute('class'),'practice-field correct');
  await page.locator('#practiceSelect').selectOption('a-3');await page.locator('[data-practice-input="1"]').selectOption('c');await page.locator('#practiceCheck').click();
  assert.equal(await page.locator('[data-field="1"]').getAttribute('class'),'practice-field correct');
  await page.locator('#practiceSelect').selectOption('b-1');
  const audio=page.locator('.practice-track audio');await audio.evaluate(a=>a.load());await page.waitForFunction(()=>document.querySelector('.practice-track audio')?.readyState>=1);
  await page.locator('#practiceSelect').selectOption('b-6');assert.equal(await page.locator('#practiceCheck').count(),0);
  await page.locator('#practiceNote').fill('My own advert.');await page.locator('#practiceDone').click();
  await page.waitForTimeout(350);await page.reload();await page.waitForSelector('#practiceNote');assert.equal(await page.locator('#practiceNote').inputValue(),'My own advert.');
  await page.locator('#practiceSelect').selectOption('a-1');
  await page.screenshot({path:'/private/tmp/b1plus-interactive-unit1.png'});
  await open('unit-test-u2a');await page.locator('#practiceSelect').selectOption('b-5');
  for(const token of ['Sorry,','I’m','going','out','with','a','friend','then'])await page.locator('[data-token-number="1"]').filter({hasText:new RegExp('^'+token+'$')}).click();
  await page.locator('#practiceCheck').click();assert.equal(await page.locator('[data-field="1"]').getAttribute('class'),'practice-field correct');
  const firstAnswers=['D','C','B','D','D','A','B','D'];
  for(let u=1;u<=8;u++){
   await open(`quick-quiz-u${u}a`);await page.locator(`[data-answer-number="1"][data-answer-value="${firstAnswers[u-1]}"]`).click();await page.locator('#practiceCheck').click();
   assert.equal(await page.locator('[data-field="1"]').getAttribute('class'),'practice-field correct',`Unit ${u}`);
  }
  await open('quick-quiz-u1c');assert.equal(await page.locator('[data-answer-number="1"][aria-pressed="true"]').count(),0);
  await page.locator('[data-answer-number="1"][data-answer-value="C"]').click();await page.locator('#practiceCheck').click();assert.equal(await page.locator('[data-field="1"]').getAttribute('class'),'practice-field correct');
  await open('unit-test-u8a');await page.locator('#practiceSelect').selectOption('b-1');
  await page.locator('[data-answer-number="1"][data-answer-value="–"]').click();await page.locator('#practiceCheck').click();assert.equal(await page.locator('[data-field="1"]').getAttribute('class'),'practice-field correct');
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/private/tmp/b1plus-interactive-mobile.png'});
  const dims=await page.locator('#modal').evaluate(d=>[d.scrollWidth,d.clientWidth,d.getBoundingClientRect().width]);assert(dims[0]<=dims[1]+1&&dims[2]<=390,JSON.stringify(dims));
  await page.locator('#closeModal').click();await page.locator('.answer-backup summary').click();
  const downloaded=page.waitForEvent('download');await page.locator('#export').click();
  const backup=JSON.parse(fs.readFileSync(await (await downloaded).path(),'utf8'));
  const restored=await browser.newPage();await restored.goto(base);
  await restored.locator('#import').setInputFiles({name:'answers.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
  await restored.waitForFunction(()=>JSON.parse(localStorage.getItem('speakout-b1plus-v1'))?.answers['material:tests-so3-b1p-unit-test-u1a']?.exercises?.['b-6']?.done);
  await restored.goto(base+'?materials=tests&material=tests-so3-b1p-unit-test-u1a');
  await restored.locator('#practiceSelect').selectOption('a-2');assert.equal(await restored.locator('[data-practice-input="1"]').inputValue(),'to complete');
  assert.equal(await restored.locator('[data-field="1"]').getAttribute('class'),'practice-field correct');
  await restored.locator('#practiceSelect').selectOption('b-6');assert.equal(await restored.locator('#practiceNote').inputValue(),'My own advert.');assert.equal(await restored.locator('#practiceDone').getAttribute('aria-pressed'),'true');
  await restored.close();assert.deepEqual(errors,[]);console.log('PASS browser: Units 1–8, distinct variants, choice/gap/match/order grading, retry, audio, manual writing, persistence, backup/import and mobile.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
