const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {correct}=require('../speakout-b2plus-active-teach/assets/answer-checker.js');
const context={window:{}};vm.createContext(context);
for(const file of ['data/exercises.js','assets/exercise-sources.js'])vm.runInContext(fs.readFileSync('speakout-b2plus-active-teach/'+file,'utf8'),context);
const bank=context.window.SPEAKOUT_EXERCISES,sources=context.window.EXERCISE_SOURCES;
const wb=Object.entries(bank).filter(([key])=>key.startsWith('wb:'));
assert.equal(wb.length,64);
let closed=0,open=0,total=0;const ids=new Set();
for(const [page,exercises]of wb){
 const labels=new Set();
 for(const ex of exercises){
  total++;assert(!ids.has(ex.id));ids.add(ex.id);assert(!labels.has(ex.label),page+' duplicate '+ex.label);labels.add(ex.label);
  assert(ex.reviewedWorkbook);assert(sources[ex.id]);assert(new Set(ex.fields.map(f=>f.n)).size===ex.fields.length);
  assert(ex.x>=0&&ex.y>=0&&ex.x+ex.w<=1&&ex.y+ex.h<=1);
  if(ex.audio)assert(fs.existsSync(path.join('speakout-b2plus-active-teach/content',ex.audio)));
  for(const source of sources[ex.id].sources)assert(fs.existsSync(path.join('speakout-b2plus-active-teach',source.image)));
  for(const f of ex.fields){
   if(!f.answer){open++;assert(!correct('any opinion',f));continue;}
   closed++;assert(!correct('',f));assert(!correct('definitely wrong answer xyz',f));
   for(const accepted of f.answer.split('/'))assert(correct(accepted,f),page+' '+ex.label+' '+f.n+' '+accepted);
   if(f.choices&&f.mode!=='set')for(const accepted of f.answer.split('/'))assert(f.choices.includes(accepted),page+' missing choice '+accepted);
   if(f.mode==='set'){assert(correct(f.answer.split(',').reverse().join(','),f));assert(!correct(f.answer+',wrong',f));}
  }
 }
}
assert.equal(total,393);assert.equal(closed,1681);assert.equal(open,61);
const field=(page,label,n='1')=>bank['wb:'+(page-2)].find(e=>e.label===label).fields.find(f=>f.n===n);
assert(correct('OFF!',field(4,'1A')));assert(!correct('up',field(4,'1A')));
assert(correct('would',field(4,'3C')));assert(!correct('used',field(4,'3C')));
assert(correct('5,2,3',field(8,'2A')));assert(!correct('2,3',field(8,'2A')));
assert(correct("I would have contacted",{...field(32,'2B','2'),answer:"I'd have contacted"}));
assert(correct('built up',field(6,'2','3')));assert(correct('modernized',field(6,'1')));
assert(correct('was prone to having',field(16,'1','4')));assert(!correct('was prone to',field(16,'1','4')));
assert(correct("There are only 10 minutes of bidding time left!",field(11,'5C')));
assert(!correct("There are only eleven minutes of bidding time left!",field(11,'5C')));
assert(correct('Seeing as it is twelve thirty, why do not we have lunch?',field(48,'3B','2')));
assert(correct("If I liked Sam, I would have invited him to my party.",field(62,'1','2')));
assert(!correct("If I liked Sam, I would invite him to my party.",field(62,'1','2')));
assert(!correct("Interesting though the government is proposals on taxation are, I don't agree with them.",field(52,'2B','5')));
// Workbook leniency must not alter existing Student's Book exact grading.
assert(!correct('will',{answer:"'ll"}));assert(correct('A',{answer:'a/b'}));
console.log(`PASS WB coverage: ${total} exercises, ${closed} checked fields, ${open} open tasks, sources/audio, variants, negative cases and SB compatibility`);
if(!process.argv.includes('--browser'))process.exit(0);
const {chromium}=require('/Users/mak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true}),server=new Map(),errors=[];
 const base=process.env.B2PLUS_TEST_BASE||'http://127.0.0.1:8897';
 async function device(user='wb-test'){
  const ctx=await browser.newContext({viewport:{width:1440,height:1000}});
  await ctx.route('**/supabase-js@2',r=>r.fulfill({contentType:'text/javascript',body:'window.supabase={};'}));
  await ctx.route('**/sm-auth.js?*',r=>r.fulfill({contentType:'text/javascript',body:`window.SM={presentationSession:async()=>({id:'${user}'}),watchPresentationAuth:()=>()=>{},loadPresentationPage:async(u,c,p)=>(await fetch('/__wb/'+u+'/'+p)).json(),savePresentationPage:async(u,c,p,data)=>(await fetch('/__wb/'+u+'/'+p,{method:'POST',body:JSON.stringify(data)})).json(),loadPresentationPages:async()=>[]};`}));
  await ctx.route('**/__wb/**',async r=>{const k=new URL(r.request().url()).pathname;if(r.request().method()==='POST')server.set(k,{...server.get(k),...r.request().postDataJSON()});await r.fulfill({contentType:'application/json',body:JSON.stringify(server.get(k)||{})});});
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/speakout-b2plus-active-teach/index.html?book=wb&page=4');await page.waitForFunction(()=>B2Store.ready&&document.querySelector('#pageImg').naturalWidth>0);return page;
 }
 async function visit(page,printed){await page.evaluate(n=>{setBook('wb');goPage(n-2)},printed);await page.waitForFunction(n=>B2Store.current==='wb:'+(n-2)&&document.querySelector('#pageImg').src.includes('/'+String(n-2).padStart(3,'0')+'.jpg')&&document.querySelector('#pageImg').complete&&document.querySelector('#pageImg').naturalWidth>0,printed);await page.evaluate(()=>B2Store.pull());}
 async function openTask(page,label){const target=page.getByRole('button',{name:'Открыть упражнение '+label,exact:true});const box=await target.boundingBox();await page.mouse.click(box.x+box.width*.65,box.y+box.height*.3);await assert.equal(await page.locator('#exerciseTitle').innerText(),'Упражнение '+label);}
 try{
  const a=await device();let inspected=0;
  for(const [page,exercises]of wb){
   await visit(a,Number(page.split(':')[1])+2);
   assert.equal(await a.locator('#spots .book-exercise').count(),exercises.length);
   for(const ex of exercises){
    await openTask(a,ex.label);assert.equal(await a.locator('#mdExercise .exercise-field').count(),ex.fields.length);
    assert.equal(await a.locator('#exerciseCheck').innerText(),ex.fields.some(f=>f.answer)?'Проверить':'Сохранить ответы');
    await a.keyboard.press('Escape');inspected++;
   }
  }
  await visit(a,4);await openTask(a,'1A');await a.locator('[data-answer="1"]').fill('up');await a.locator('#exerciseCheck').click();assert.equal(await a.locator('.field-result').first().innerText(),'Попробуйте ещё раз');
  await a.locator('[data-answer="1"]').fill('off');await a.locator('#exerciseCheck').click();assert.equal(await a.locator('.field-result').first().innerText(),'Верно');await a.keyboard.press('Escape');
  await visit(a,8);await openTask(a,'2A');for(const v of ['2','3','5'])await a.locator(`[data-multi="1"][value="${v}"]`).check();await a.locator('#exerciseCheck').click();assert.equal(await a.locator('.field-result').first().innerText(),'Верно');await a.evaluate(()=>B2Store.flush());
  await a.screenshot({path:'/private/tmp/b2-workbook-desktop.png'});
  const b=await device();await visit(b,8);await openTask(b,'2A');assert.equal(await b.locator('[data-multi]:checked').count(),3);assert.equal(await b.locator('.field-result').first().innerText(),'Верно');
  await b.keyboard.press('Escape');await visit(b,4);await openTask(b,'1A');assert.equal(await b.locator('[data-answer="1"]').inputValue(),'off');await b.reload();await b.waitForFunction(()=>B2Store.ready&&document.querySelector('#pageImg').complete);await openTask(b,'1A');assert.equal(await b.locator('[data-answer="1"]').inputValue(),'off');
  const c=await device('separate-account');await openTask(c,'1A');assert.equal(await c.locator('[data-answer="1"]').inputValue(),'');
  await a.keyboard.press('Escape');
  const [legacyPage,legacyTasks]=wb.find(([,exs])=>exs.some(e=>e.legacyIds?.length));const legacyTask=legacyTasks.find(e=>e.legacyIds?.length),legacyKey=legacyTask.legacyIds[0]+':1';
  await visit(a,Number(legacyPage.split(':')[1])+2);await a.evaluate(k=>B2Store.answer(k,{value:'Previously saved answer',checked:false}),legacyKey);await openTask(a,legacyTask.label);
  const legacyInput=a.locator('[data-answer^="legacy-"]');assert.equal(await legacyInput.inputValue(),'Previously saved answer');await legacyInput.fill('Updated old answer');await a.evaluate(()=>B2Store.flush());
  await a.keyboard.press('Escape');await openTask(a,legacyTask.label);assert.equal(await legacyInput.inputValue(),'Updated old answer');await a.keyboard.press('Escape');
  await b.keyboard.press('Escape');await visit(b,48);await openTask(b,'3B');await b.locator('#exerciseAdd').click();const fieldIds=await b.locator('[data-answer]').evaluateAll(els=>els.map(e=>e.dataset.answer));assert.equal(new Set(fieldIds).size,fieldIds.length);
  await b.setViewportSize({width:390,height:844});assert(await b.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await b.screenshot({path:'/private/tmp/b2-workbook-mobile.png'});
  assert.deepEqual(errors,[]);console.log(`PASS ${inspected} real body-click dialogs across all 64 WB pages, wrong/correct answers, multiple choices, two-device sync, reload, account isolation, extra fields and mobile`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
