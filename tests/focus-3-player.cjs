const fs=require('fs'),assert=require('assert/strict'),path=require('path'),{JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'..'),base=path.join(root,'focus-3-active-teach');
const html=fs.readFileSync(path.join(base,'index.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(html,{url:'https://example.test/focus-3-active-teach/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc}),w=dom.window;
w.ResizeObserver=class{observe(){}disconnect(){}};w.CSS={escape:String};w.HTMLElement.prototype.scrollIntoView=()=>{};w.HTMLMediaElement.prototype.pause=()=>{};w.HTMLCanvasElement.prototype.getContext=()=>({measureText:s=>({width:s.length*8})});w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
let store,live;
w.CourseWorkStore=class{constructor(o){store=this;this.records={};this.user=null;this.message='Test';}async start(){}key(){return 'test'}capture(records){this.records=records}async flush(){return{ok:true}}};w.CourseWorkUI={bind(s,save){this.save=save},accountChanged(){}};w.LiveCourse={connect(o){live=o}};w.SM={getUser:async()=>null};w.Focus3Assign={create:()=>({init(){},refresh(){},has(){return false},allowed:false})};
function run(file){const script=w.document.createElement('script');script.src='https://example.test/'+file;Object.defineProperty(w.document,'currentScript',{value:script,configurable:true});w.eval(fs.readFileSync(path.join(root,file),'utf8'))}
for(const file of ['exercise-play.js','exercise-source.js','focus-3-active-teach/assets/course.js','focus-3-active-teach/assets/exercise-sources.js','focus-3-active-teach/assets/exercise-gaps.js','focus-3-active-teach/assets/marking.js','focus-3-active-teach/assets/interactions.js','focus-3-homework.js','focus-3-active-teach/assets/app.js'])run(file);
const q=s=>w.document.querySelector(s),qa=s=>[...w.document.querySelectorAll(s)];
(async()=>{await new Promise(r=>setImmediate(r));const fail=[],coverage={},tasks=w.FOCUS3.pages.flatMap(p=>p.exercises.map(e=>({p,e})));let n=0;
for(const {p,e}of tasks){try{
 live.apply({book:p.book,page:p.page,exercise:e.id});assert(q('#exercise').open);assert(q('#solutionOriginal svg'));let fields=qa('[data-answer]');
 assert(fields.length||e.responseMode==='oral',e.id+' no answer controls');
 if(e.answerSpec.length)assert.equal(fields.length,e.answerSpec.length,e.id+' all answer fields');
 if(e.responseFields)assert.equal(fields.length,e.responseFields.length,e.id+' all manual fields');
 if(e.responseMode==='oral'){
  q('#saveAnswer').click();assert(store.records[e.id]?.completed,e.id+' oral completed');await w.CourseWorkUI.save();assert(store.records[e.id]?.completed,e.id+' save bar loses oral completion');
 }else{
  fields.forEach((input,i)=>{input.value=input.tagName==='SELECT'?[...input.options].find(o=>w.Focus3Marking.checkField(o.value,e.answerSpec[i]))?.value||'':e.answerSpec[i]?.accepted[0]||'Test answer '+(i+1);input.dispatchEvent(new w.Event('input',{bubbles:true}))});
  const values=fields.map(x=>x.value);await w.CourseWorkUI.save();assert.deepEqual(Array.from(store.records[e.id].values),values,e.id+' saved values');
  if(e.answerSpec.length){q('#answerForm').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(store.records[e.id]?.score?.correct,e.answerSpec.length,e.id+' all keys can be checked')}
  live.apply({book:p.book,page:p.page,exercise:e.id});assert.deepEqual(qa('[data-answer]').map(x=>x.value),values,e.id+' reopen restores all values');
 }
 if(e.responseMode!=='oral'){q('#resetAnswer').click();assert(qa('[data-answer]').every(x=>x.value===''),e.id+' reset');}
 const k=p.book+' unit '+p.unit;coverage[k]=(coverage[k]||0)+1;
}catch(err){fail.push({id:e.id,error:err.message})}
 if(++n%100===0)console.log(n+'/'+tasks.length+' audited, failures '+fail.length);
 if(process.env.AUDIT_LIMIT&&n>=+process.env.AUDIT_LIMIT)break;
}
if(process.env.FOCUS3_AUDIT_REPORT)fs.writeFileSync(process.env.FOCUS3_AUDIT_REPORT,JSON.stringify({checked:n,fail,errors:[...new Set(errors)],coverage},null,2)+'\n');console.log(JSON.stringify({checked:n,failCount:fail.length,sample:fail.slice(0,15),errors:[...new Set(errors)],coverage},null,2));dom.window.close();process.exitCode=fail.length||errors.length?1:0;
})();
