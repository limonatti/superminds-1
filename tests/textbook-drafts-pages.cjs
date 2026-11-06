const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..'),cloud={};const tick=()=>new Promise(r=>setImmediate(r));
async function page(book,user){
 const file=path.join(root,book+'-active-teach/index.html'),dom=new JSDOM(fs.readFileSync(file,'utf8'),{url:'https://school.test/'+book+'-active-teach/index.html?book=wb&unit=1',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,stores=[];
 w.HTMLCanvasElement.prototype.getContext=function(){return new Proxy({canvas:this,measureText:s=>({width:String(s).length*8})},{get:(o,k)=>k in o?o[k]:()=>{}})};
 w.ResizeObserver=class{observe(){}disconnect(){}};w.HTMLElement.prototype.scrollIntoView=function(){};
 w.HTMLMediaElement.prototype.pause=function(){};w.HTMLMediaElement.prototype.load=function(){};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
 let currentScript=null;Object.defineProperty(w.document,'currentScript',{get:()=>currentScript});
 const api={presentationSession:async()=>({id:user}),watchPresentationAuth:()=>()=>{},getUser:async()=>({id:user}),myProfile:async()=>({role:'student'}),myStudents:async()=>[],myHW:async()=>[],
  loadCourseWork:async(c,u)=>({ok:true,answers:structuredClone(cloud[u]?.[c]||{})}),saveCourseWork:async(c,rows,u)=>{const target=(cloud[u]??={})[c]??={};Object.assign(target,structuredClone(rows));return{ok:true,answers:structuredClone(target)}}};w.SM=api;
 for(const script of w.document.scripts){
  if(!script.src)continue;const url=new URL(script.src);if(url.origin!=='https://school.test'||/\/sm-(auth|live-audio|live-course)\.js$/.test(url.pathname))continue;
  currentScript=script;const local=path.join(root,url.pathname);vm.runInContext(fs.readFileSync(local,'utf8'),dom.getInternalVMContext(),{filename:local});
  if(url.pathname.endsWith('/coursework-store.js')){const Original=w.CourseWorkStore;w.CourseWorkStore=class extends Original{constructor(opts){super({...opts,api,delay:60000});stores.push(this)}};}
 }
 for(let i=0;i<5;i++)await tick();
 return{w,stores,close(){stores.forEach(s=>s.destroy());w.close()}};
}
(async()=>{
 for(const book of ['focus-1','solutions-el','solutions-int','outcomes-beginner']){
  let p=await page(book,'alice');try{
   p.w.document.querySelector('#exerciseList [data-ex],#exerciseList [data-exercise]').click();await tick();
   const input=p.w.document.querySelector('[data-answer],[data-response]');assert(input,book+' input opens');const value=input.tagName==='SELECT'?input.options[1].value:'Unfinished personal draft';input.value=value;input.dispatchEvent(new p.w.Event('input',{bubbles:true}));
   const store=p.stores[0],record=Object.values(store.records).find(r=>r.values?.includes(value));assert(record,book+' captures typing before checking');assert(!record.score,book+' draft has no fabricated score');await store.flush();p.close();
   p=await page(book,'alice');p.w.document.querySelector('#exerciseList [data-ex],#exerciseList [data-exercise]').click();await tick();assert.equal(p.w.document.querySelector('[data-answer],[data-response]').value,value,book+' restores on a fresh device');
   const opened=p.w.document.querySelector('[data-answer],[data-response]'),newValue=opened.tagName==='SELECT'?opened.options.at?.(-1)?.value||opened.options[opened.options.length-1].value:'Updated on another device';
   const target=Object.values(cloud.alice[book]).find(r=>r.values?.includes(value));target.values[0]=newValue;target.updatedAt+=1000;p.stores[0].loaded=false;await p.stores[0].flush();
   assert.equal(p.w.document.querySelector('[data-answer],[data-response]').value,newValue,book+' refreshes an already-open exercise');p.close();
   p=await page(book,'bob');p.w.document.querySelector('#exerciseList [data-ex],#exerciseList [data-exercise]').click();await tick();assert.equal(p.w.document.querySelector('[data-answer],[data-response]').value,'',book+' keeps another student separate');
  }finally{p.close()}
 }
 console.log('PASS real Focus 1 / Solutions Elementary / Solutions Intermediate / Outcomes Beginner HTML: typing saves unfinished drafts, fresh-device restore and second-account isolation.');
})().catch(e=>{console.error(e);process.exit(1)});
