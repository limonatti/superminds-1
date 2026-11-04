const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {chromium}=require('/Users/mak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const data={window:{}};vm.createContext(data);vm.runInContext(fs.readFileSync('speakout-b2plus-active-teach/data/exercises.js','utf8'),data);
const exercises=data.window.SPEAKOUT_EXERCISES;
for(const [page,exs] of Object.entries(exercises))for(const ex of exs){
 assert(ex.fields.length);assert(ex.x>=0&&ex.y>=0&&ex.w>0&&ex.h>0&&ex.x+ex.w<=1&&ex.y+ex.h<=1,page+ex.label);
 if(page.startsWith('wb:'))assert(ex.reviewedWorkbook,'Workbook fields must come from the independently reviewed answer set');
}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,timeout:30000}),server=new Map(),errors=[];
 let offline=false;
 async function device(user='test-a',viewport={width:1440,height:960}){
  const context=await browser.newContext({viewport});
  await context.route('**/supabase-js@2',r=>r.fulfill({contentType:'text/javascript',body:'window.supabase={};'}));
  await context.route('**/sm-auth.js?*',r=>r.fulfill({contentType:'text/javascript',body:`window.SM={presentationSession:async()=>({id:'${user}'}),watchPresentationAuth:()=>()=>{},loadPresentationPage:async(u,c,p)=>{let r=await fetch('/__sync/'+u+'/'+p);if(!r.ok)throw Error('offline');return r.json()},savePresentationPage:async(u,c,p,data)=>{let r=await fetch('/__sync/'+u+'/'+p,{method:'POST',body:JSON.stringify(data)});if(!r.ok)throw Error('offline');return r.json()},loadPresentationPages:async()=>[]};`}));
  await context.route('**/__sync/**',async route=>{
   if(offline)return route.fulfill({status:503,body:'offline'});
   const key=new URL(route.request().url()).pathname;
   if(route.request().method()==='POST')server.set(key,{...server.get(key),...route.request().postDataJSON()});
   await route.fulfill({contentType:'application/json',body:JSON.stringify(server.get(key)||{})});
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));return page;
 }
 const url=(process.env.B2PLUS_TEST_BASE||'http://127.0.0.1:8772')+'/speakout-b2plus-active-teach/index.html?book=sb&page=9';
 const ready=page=>page.waitForFunction(()=>B2Store.ready&&document.querySelector('#pageImg').naturalWidth>0);
 try{
  const a=await device();await a.goto(url);await ready(a);
  const exercise=exercises['sb:8'].find(e=>e.fields.some(f=>f.answer));assert(exercise);
  await a.getByRole('button',{name:'Открыть упражнение '+exercise.label,exact:true}).first().click();
  assert(await a.locator('#mdExercise').evaluate(d=>d.open));
  const box=await a.locator('#mdExercise').boundingBox();assert(Math.abs(box.x+box.width/2-720)<4,'centered dialog');
  const f=exercise.fields.find(f=>f.answer),input=a.locator('[data-answer="'+f.n+'"]');
  if(f.choices)await a.locator('.play-word').filter({hasText:new RegExp('^'+f.answer+'$')}).click();else {await a.locator('.play-type-toggle').click();await a.locator('.play-manual input').fill(f.answer.split('/')[0].trim());}
  await a.locator('.play-check').click();assert.match(await a.locator('#mdExercise').innerText(),/Верно/);
  await a.evaluate(()=>B2Store.flush());
  await a.screenshot({path:'/private/tmp/b2-exercise-desktop.png'});
  const b=await device();await b.goto(url);await ready(b);await b.getByRole('button',{name:'Открыть упражнение '+exercise.label,exact:true}).first().click();
  assert.equal(await b.locator('[data-answer="'+f.n+'"]').inputValue(),f.answer.split('/')[0].trim(),'answer restored on second device');
  await b.keyboard.press('Escape');assert(!(await b.locator('#mdExercise').evaluate(d=>d.open)));
  const c=await device('test-b');await c.goto(url);await ready(c);assert.deepEqual(await c.evaluate(()=>B2Store.answers()),{},'isolated account');
  await a.locator('#exerciseClose').click();await a.locator('[data-tool="pen"]').click();
  const image=await a.locator('#pageImg').boundingBox();await a.mouse.move(image.x+image.width*.2,image.y+image.height*.3);await a.mouse.down();await a.mouse.move(image.x+image.width*.4,image.y+image.height*.35,{steps:8});await a.mouse.up();
  await a.evaluate(()=>B2Store.flush());await b.evaluate(()=>B2Store.pull());assert(await b.evaluate(()=>INK['sb:8']?.length>0),'drawing restored');
  offline=true;await a.evaluate(()=>B2Store.answer('offline-test','draft'));await a.evaluate(()=>B2Store.flush());assert.match(await a.locator('#saveStatus').innerText(),/не удалось|устройстве/i);
  offline=false;await a.evaluate(()=>B2Store.flush());await b.evaluate(()=>B2Store.pull());assert.equal(await b.evaluate(()=>B2Store.answers()['offline-test']),'draft');
  await b.setViewportSize({width:390,height:844});await b.getByRole('button',{name:'Открыть упражнение '+exercise.label,exact:true}).first().click();
  const mobile=await b.locator('#mdExercise').boundingBox();assert(mobile.width<=390&&mobile.x>=0);assert(await b.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await b.screenshot({path:'/private/tmp/b2-exercise-mobile.png'});
  assert.deepEqual(errors,[]);
  console.log('PASS exercise popup, marking, checks, keyboard, mobile, two-device restore, account isolation and offline retry');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
