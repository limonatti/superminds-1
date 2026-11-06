const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..'),cloud={},copy=v=>JSON.parse(JSON.stringify(v));
async function open(course,user){
 const folder=course+'-active-teach',dom=new JSDOM(fs.readFileSync(path.join(root,folder,'index.html'),'utf8'),{url:'https://school.test/'+folder+'/index.html?book=sb&page=8',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,context=dom.getInternalVMContext(),calls=[];
 w.HTMLCanvasElement.prototype.getContext=function(){return new Proxy({canvas:this,measureText:s=>({width:String(s).length*8})},{get:(o,k)=>k in o?o[k]:(...args)=>calls.push([k,...args])})};
 w.HTMLElement.prototype.getBoundingClientRect=function(){return {left:0,top:0,width:1000,height:1400,right:1000,bottom:1400}};w.HTMLElement.prototype.setPointerCapture=function(){};w.HTMLElement.prototype.scrollIntoView=function(){};
 w.ResizeObserver=class{observe(){}disconnect(){}};w.HTMLMediaElement.prototype.pause=function(){};w.HTMLMediaElement.prototype.load=function(){};w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 w.SM={presentationSession:async()=>({id:user}),watchPresentationAuth:()=>()=>{},myProfile:async()=>({role:'student'}),loadCourseWork:async()=>({ok:true,answers:copy(cloud[course]?.[user]||{})}),saveCourseWork:async(c,rows,u)=>{const target=((cloud[c]||={})[u]||={});for(const[id,r]of Object.entries(rows))if(!target[id]||r.updatedAt>=target[id].updatedAt)target[id]=copy(r);return {ok:true,answers:copy(target)}}};
 let current=null;Object.defineProperty(w.document,'currentScript',{get:()=>current});
 const run=script=>{const url=new URL(script.src,w.location.href);if(url.origin!=='https://school.test'||/\/sm-(auth|live-audio|live-course)\.js$|\/live\.js$/.test(url.pathname))return;current=script;return vm.runInContext(fs.readFileSync(path.join(root,url.pathname),'utf8'),context,{filename:url.pathname})};
 const append=w.document.body.append.bind(w.document.body);w.document.body.append=(...nodes)=>{append(...nodes);for(const n of nodes)if(n.tagName==='SCRIPT'){run(n);n.onload?.()}};
 for(const script of [...w.document.scripts]){
  if(!script.src||script.src.includes('/loader.js'))continue;
  await run(script);
 }
 if(course==='speakout-a1'){
  const source=w.document.createElement('script');source.src='assets/course-web.js';run(source);
  const adapter=w.document.createElement('script');adapter.src='../speakout-store.js';adapter.dataset.course=course;adapter.dataset.app='assets/app.js';await run(adapter);
 }
 assert(w.B1Store,course+' booted');
 return {w,calls,adapter:w.B1Store,eval:s=>vm.runInContext(s,context),close(){w.B1Store.store.destroy();w.close()}};
}
(async()=>{
 for(const course of ['speakout-a1','speakout-b1','speakout-b1plus']){
  let a=await open(course,'alice');const board=a.w.document.getElementById('board');
  function draw(type,id=1,end=true){a.w.document.querySelector('[data-tool="'+type+'"]').click();board.onpointerdown({pointerId:id,clientX:100,clientY:280});board.onpointermove({pointerId:id,clientX:300,clientY:560});if(end)board.onpointerup({pointerId:id});}
  draw('pen');draw('marker');draw('cover');assert.equal(a.adapter.state.drawing['sb:8'].length,3);await a.adapter.flush();a.close();
  a=await open(course,'alice');assert.deepEqual(copy(a.adapter.state.drawing['sb:8'].map(s=>s.type)),['pen','marker','cover']);assert(a.calls.some(c=>c[0]==='lineTo'&&c[1]===.3&&c[2]===.4));assert(a.calls.some(c=>c[0]==='fillRect'));
  a.w.document.getElementById('undo').click();await a.adapter.flush();assert.equal(a.adapter.state.drawing['sb:8'].length,2);
  a.w.document.getElementById('clearDrawing').click();await a.adapter.flush();assert.equal(a.adapter.state.drawing['sb:8'].length,0);a.w.document.getElementById('clearDrawing').click();await a.adapter.flush();assert.equal(a.adapter.state.drawing['sb:8'].length,2);
  // Pointer cancellation retains the written portion; navigation cannot move it onto another page.
  const current=a.w.document.getElementById('board');a.w.document.querySelector('[data-tool="pen"]').click();current.onpointerdown({pointerId:2,clientX:400,clientY:500});current.onpointermove({pointerId:2,clientX:450,clientY:600});current.onpointercancel();assert.equal(a.adapter.state.drawing['sb:8'].length,3);
  current.onpointerdown({pointerId:3,clientX:400,clientY:500});current.onpointermove({pointerId:3,clientX:500,clientY:650});a.eval('go(9)');assert.equal(a.adapter.state.drawing['sb:8'].length,4);assert.equal(a.adapter.state.drawing['sb:9'].length,0);
  a.w.document.querySelector('[data-tool="marker"]').click();current.onpointerdown({pointerId:4,clientX:50,clientY:50});current.onpointermove({pointerId:4,clientX:100,clientY:100});a.w.dispatchEvent(new a.w.Event('pagehide'));await a.adapter.flush();assert.equal(a.adapter.state.drawing['sb:9'].length,1);a.close();
  a=await open(course,'alice');assert.equal(a.adapter.state.drawing['sb:8'].length,4);assert.equal(a.adapter.state.drawing['sb:9'].length,1);
  // A sync repaint leaves the chosen tool active.
  a.w.document.querySelector('[data-tool="pen"]').click();a.w.dispatchEvent(new a.w.Event('coursework-ink-restored'));assert.equal(a.eval('S.tool'),'pen');a.close();
  a=await open(course,'bob');assert.equal(a.adapter.state.drawing['sb:8'].length,0);a.close();
 }
 console.log('PASS real A1/B1/B1+ HTML and canvas handlers: drawing, restored rendering at normalized coordinates, undo, clear/restore, interrupted stroke, page change, pagehide and account isolation.');
})().catch(e=>{console.error(e);process.exit(1)});
