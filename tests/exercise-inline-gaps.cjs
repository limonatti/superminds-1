const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||require.resolve('playwright',{paths:[require('node:path').join(require('node:os').homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node')]}));
const base=process.env.EXERCISE_TEST_BASE||'http://127.0.0.1:8772';
(async()=>{
 const b=await chromium.launch({channel:'chrome',headless:true});
 try{
  const p=await b.newPage({viewport:{width:1280,height:950}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**',r=>r.abort());
  const open=async()=>{if(!await p.locator('dialog[open]').count())await p.locator('[data-ex="wb-12-1"]').first().click()};
  await p.goto(base+'/focus-1-active-teach/index.html?book=wb&page=12');await open();
  assert.equal(await p.locator('.play-gap-layer input').count(),8);
  assert.equal(await p.locator('.play-manual input:visible,.play-answer-strip .play-slot:visible').count(),0);
  assert.deepEqual((await p.locator('.play-word').allTextContents()).sort(),['go','have','listen','play','read','watch']);
  for(const [i,word]of ['play','listen','watch','read','read','go','have','listen'].entries()){
   await p.locator(`input.play-slot[data-field="${i}"]`).click();await p.getByRole('button',{name:word,exact:true}).click();
  }
  await p.locator('.play-check').click();assert.match(await p.locator('.play-feedback').innerText(),/8.*8/);
  await p.reload();await open();assert.equal(await p.locator('input.play-slot[data-field="7"]').inputValue(),'listen');
  await p.locator('.focus-source-controls button').last().click();assert.equal(await p.locator('input.play-slot').count(),8);
  await p.setViewportSize({width:390,height:844});assert(await p.locator('dialog[open]').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
  await p.screenshot({path:'/private/tmp/inline-gaps-focus-mobile.png'});
  await p.setViewportSize({width:1280,height:950});
  // An exercise without precomputed positions still has no second answer form.
  await p.evaluate(()=>localStorage.clear());await p.reload();await p.keyboard.press('Escape');await p.evaluate(()=>{window.EXERCISE_GAPS['wb-12-1']={}});await open();
  assert.equal(await p.locator('.play-slot').count(),0);
  await p.getByRole('button',{name:'play',exact:true}).click();
  const point=async(a,b)=>p.locator('.play-canvas').first().evaluate((el,[a,b])=>{const[x,y,w,h]=el._source.box,r=el.getBoundingClientRect();return{x:r.x+(a-x)/w*r.width,y:r.y+(b-y)/h*r.height}},[a,b]);
  let pos=await point(.222,.328);await p.mouse.click(pos.x,pos.y);await p.waitForFunction(()=>document.querySelector('input.play-slot')?.value==='play');
  const placed=await p.evaluate(()=>JSON.parse(localStorage.getItem('exercise-positions-v1:'+location.pathname+':wb-12-1'))['1']);assert(placed.box[2]<.065,'tap snaps to the actual printed blank');
  const canvas=p.locator('.play-canvas').first(),rect=await canvas.boundingBox();pos=await point(.183,.355);
  await p.getByRole('button',{name:'listen',exact:true}).dragTo(canvas,{targetPosition:{x:pos.x-rect.x,y:pos.y-rect.y}});
  await p.waitForFunction(()=>document.querySelector('input.play-slot[data-field="1"]')?.value==='listen');
  await p.locator('input.play-slot[data-field="1"]').click();await p.locator('.play-type-toggle').click();await p.locator('input.play-slot[data-field="1"]').fill('edited');
  assert.equal(await p.locator('[data-answer]').nth(1).inputValue(),'edited');
  await p.locator('.play-reposition').click();assert.equal(await p.locator('input.play-slot[data-field="1"]').count(),0);pos=await point(.183,.355);await p.mouse.click(pos.x,pos.y);await p.waitForFunction(()=>document.querySelector('input.play-slot[data-field="1"]')?.value==='edited');
  await p.screenshot({path:'/private/tmp/inline-gaps-focus-desktop.png'});
  // Explicit multi-part source positions keep one original grading/storage contract.
  const f=await b.newPage({viewport:{width:1280,height:950}});f.on('pageerror',e=>errors.push(e.message));
  await f.goto(base+'/__inline_test_fixture__');await f.setContent('<dialog id="exercise"><div id="columns"><section id="source"></section><section id="responses"><div id="row"><input id="answer"></div><button id="check">Проверить</button><button id="exerciseKeys">Ключ</button><div id="keyArea">key</div></section></div></dialog>');
  await f.addStyleTag({url:base+'/exercise-source.css'});await f.addStyleTag({url:base+'/exercise-play.css'});await f.addScriptTag({url:base+'/exercise-source.js'});await f.addScriptTag({url:base+'/exercise-play.js'});
  await f.evaluate(()=>{
   const pic=n=>'data:image/svg+xml;base64,'+btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="white"/><text x="50" y="65" font-size="32">Page ${n}: Complete the words.</text><path d="M240 240H540 M240 440H540" stroke="black" stroke-width="3"/></svg>`);
   window.fixtureModel={label:'1',sources:[1,2].map(n=>({image:pic(n),page:n,size:[1200,800],box:[0,0,1,1]}))};const $=s=>document.querySelector(s),dialog=$('#exercise'),source=$('#source'),responses=$('#responses');
   ExerciseSource.columns(dialog,$('#columns'),source,responses);ExerciseSource.mount(source,'fixture-parts',fixtureModel);ExerciseSource.controls(source);
   ExercisePlay.attach({dialog,source,responses,id:'fixture-parts',text:'Complete the words.',fields:[ExercisePlay.inputField('1',$('#answer'),['one; two'],undefined,$('#row'))],geometry:{'1.1':{image:fixtureModel.sources[0].image,page:1,box:[.2,.25,.25,.05]},'1.2':{image:fixtureModel.sources[1].image,page:2,box:[.2,.25,.25,.05]}}});dialog.showModal();
  });
  assert.equal(await f.locator('input.play-slot').count(),2);assert(await f.locator('#exerciseKeys').isDisabled());assert.equal(await f.locator('.play-word').count(),0);
  await f.locator('input.play-slot').nth(0).fill('one');await f.locator('input.play-slot').nth(1).fill('two');assert.equal(await f.locator('#answer').inputValue(),'one; two');
  await f.locator('.play-check').click();assert.equal(await f.locator('#exerciseKeys').isDisabled(),false);await f.locator('input.play-slot').nth(1).fill('edited');assert(await f.locator('#exerciseKeys').isDisabled());
  await f.locator('.focus-source-controls button').last().click();assert.equal(await f.locator('.focus-sheet').count(),2);assert.equal(await f.locator('input.play-slot').count(),2);
  // Unkeyed cloze notes also live on the page and retain their existing draft field.
  await f.evaluate(()=>{
   document.querySelector('#responses').innerHTML='<label for="notes">Ответ</label><textarea id="notes"></textarea><button id="check">Проверить</button><button id="exerciseKeys">Ключ</button>';
   ExerciseSource.mount(document.querySelector('#source'),'fixture-free',{label:'Free',sources:[fixtureModel.sources[0]]});
   window.mountFree=()=>ExercisePlay.attach({dialog:document.querySelector('#exercise'),source:document.querySelector('#source'),responses:document.querySelector('#responses'),id:'fixture-free',text:'Complete the sentences.',fields:[]});mountFree();
  });
  const freeCanvas=f.locator('.play-canvas').first(),r=await freeCanvas.boundingBox();await f.mouse.click(r.x+r.width*.325,r.y+r.height*.275);await f.locator('input.play-slot').waitFor();await f.locator('input.play-slot').fill('one');await f.locator('input.play-slot').press('Enter');
  await freeCanvas.press('ArrowDown');await freeCanvas.press('Enter');await f.locator('input.play-slot[data-field="1"]').waitFor();await f.locator('input.play-slot[data-field="1"]').fill('two');
  assert.equal(await f.locator('#notes').inputValue(),'1. one\n2. two');assert.equal(await f.locator('#notes').isVisible(),false);
  await f.evaluate(()=>mountFree());assert.deepEqual(await f.locator('input.play-slot').evaluateAll(xs=>xs.map(x=>x.value)),['one','two']);
  await f.evaluate(()=>{const t=document.querySelector('#notes');t.value='1. remote\n2. draft\n3. restored';t.dispatchEvent(new Event('input',{bubbles:true}));});assert.equal(await f.locator('input.play-slot').first().inputValue(),'remote');
  assert.equal(await f.locator('.play-manual input:visible,.play-answer-strip .play-slot:visible').count(),0);
  await f.evaluate(()=>{
   const responses=document.querySelector('#responses');responses.innerHTML='<div id="row"><textarea id="group"></textarea></div><button id="check">Проверить</button><button id="exerciseKeys">Ключ</button>';
   ExerciseSource.mount(document.querySelector('#source'),'fixture-set',{label:'Set',sources:[fixtureModel.sources[0]]});
   window.mountSet=()=>ExercisePlay.attach({dialog:document.querySelector('#exercise'),source:document.querySelector('#source'),responses,id:'fixture-set',text:'Complete the phrases.',fields:[ExercisePlay.inputField('Words',document.querySelector('#group'),[],undefined,document.querySelector('#row'),{kind:'set',count:2})],geometry:{'Words.1':{image:fixtureModel.sources[0].image,box:[.2,.25,.25,.05]},'Words.2':{image:fixtureModel.sources[0].image,box:[.2,.5,.25,.05]}}});mountSet();
  });
  await f.locator('input.play-slot').nth(0).fill('yes, it is');assert(await f.locator('#exerciseKeys').isDisabled());await f.locator('input.play-slot').nth(1).fill("no, it isn't");
  const grouped=await f.locator('#group').inputValue();assert.equal(grouped,"yes, it is; no, it isn't");assert(require('../solutions-int-active-teach/assets/marking.js').checkField(grouped,{kind:'set',members:[['yes, it is'],["no, it isn't"]]}));
  await f.evaluate(()=>mountSet());assert.deepEqual(await f.locator('input.play-slot').evaluateAll(xs=>xs.map(x=>x.value)),['yes, it is',"no, it isn't"]);
  await f.close();
  assert.deepEqual(errors,[]);
  console.log('PASS on-image card fill, grading, persistence, full page, mobile, unmarked tap/drop snapping, direct typing, repositioning, multipart storage, key gating, two full pages, keyboard placement and restored free drafts');
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
