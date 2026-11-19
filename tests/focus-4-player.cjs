const fs=require('fs'),assert=require('assert/strict'),path=require('path'),{JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'..'),base=path.join(root,'focus-4-active-teach');
const html=fs.readFileSync(path.join(base,'index.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(html,{url:'https://example.test/focus-4-active-teach/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc}),w=dom.window;
w.ResizeObserver=class{observe(){}disconnect(){}};w.CSS={escape:String};w.HTMLElement.prototype.scrollIntoView=()=>{};w.HTMLMediaElement.prototype.pause=()=>{};w.HTMLCanvasElement.prototype.getContext=()=>({measureText:s=>({width:s.length*8})});w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
let store,live;
w.CourseWorkStore=class{constructor(o){store=this;this.records={};this.user=null;this.message='Test';}async start(){}key(){return 'test'}capture(records){this.records=records}async flush(){return{ok:true}}};w.CourseWorkUI={bind(s,save){this.save=save},accountChanged(){}};w.LiveCourse={connect(o){live=o}};w.SM={getUser:async()=>null};w.Focus4Assign={create:()=>({init(){},refresh(){},has(){return false},allowed:false})};
function run(file){const script=w.document.createElement('script');script.src='https://example.test/'+file;Object.defineProperty(w.document,'currentScript',{value:script,configurable:true});w.eval(fs.readFileSync(path.join(root,file),'utf8'))}
for(const file of ['exercise-play.js','exercise-source.js','course-focus.js','focus-4-active-teach/assets/course.js','focus-4-active-teach/assets/focus-models.js','focus-4-active-teach/assets/exercise-sources.js','focus-4-active-teach/assets/exercise-gaps.js','focus-4-active-teach/assets/marking.js','focus-4-active-teach/assets/interactions.js','focus-4-homework.js','focus-4-active-teach/assets/app.js'])run(file);
const q=s=>w.document.querySelector(s),qa=s=>[...w.document.querySelectorAll(s)];
(async()=>{await new Promise(r=>setImmediate(r));const fail=[],coverage={},tasks=w.FOCUS4.pages.flatMap(p=>p.exercises.map(e=>({p,e}))).filter(({e})=>!process.env.AUDIT_KIND||e.interaction?.type===process.env.AUDIT_KIND);let n=0;
for(const {p,e}of tasks){try{
 live.apply({book:p.book,page:p.page,exercise:null});
 q('#hotspots [data-ex="'+e.id+'"]').click();assert(q('#exercise').open);assert(q('#solutionOriginal svg'));let fields=qa('[data-answer]');
 assert.equal(q('#exerciseTitle').textContent,'Упражнение '+e.label,e.id+' opens the selected exercise');
 assert.equal(q('#hotspots [data-ex="'+e.id+'"] .exercise-region-label').textContent,e.label,e.id+' marker keeps its exercise number');
 assert(w.document.body.classList.contains('focus-exercise-open'),e.id+' background scrolling locked');
 assert(!q('.play-workbench'),e.id+' answers are separate from the scrolling source');
 assert(!q('#solutionOriginal .focus-document>.focus-sheet[data-context="true"]'),e.id+' full pages are not mixed with the selected task');
 assert(qa('#solutionOriginal .task-context').every(d=>!d.open),e.id+' supplementary pages start collapsed');
 assert(qa('#solutionOriginal .focus-document>.focus-sheet').length,e.id+' selected task remains visible');
 assert(fields.length||e.responseMode==='oral',e.id+' no answer controls');
 if(e.answerSpec.length)assert.equal(fields.length,e.answerSpec.length,e.id+' all answer fields');
 if(e.responseFields)assert.equal(fields.length,e.responseFields.length,e.id+' all manual fields');
 if(e.responseMode==='oral'){
  const note='My ideas for '+e.id;q('#reflection').value=note;q('#reflection').dispatchEvent(new w.Event('input',{bubbles:true}));assert.equal(store.records[e.id]?.reflection,note,e.id+' oral note autosaved');assert(!store.records[e.id]?.completed,e.id+' a draft does not complete an oral task');
  q('#saveAnswer').click();assert(store.records[e.id]?.completed,e.id+' oral completed');await w.CourseWorkUI.save();assert(store.records[e.id]?.completed,e.id+' save bar loses oral completion');
  assert.equal(q('#reflection').value,note,e.id+' note survives completion');assert(w.Focus4HW.renderAnswer(e.id,store.records[e.id]).includes(note),e.id+' teacher can read oral notes');
  q('#saveAnswer').click();assert(!store.records[e.id]?.completed,e.id+' oral completion can be undone');assert.equal(q('#reflection').value,note,e.id+' note survives undo');
 }else{
  fields.forEach((input,i)=>{
   const stepper=q('.cf-stepper select');if(stepper){stepper.value=String(i);stepper.dispatchEvent(new w.Event('change',{bubbles:true}))}
   const correct=value=>!e.answerSpec[i]||w.Focus4Marking.checkField(value,e.answerSpec[i]);
   if(['choices','opinion'].includes(e.interaction?.type)){
    const options=e.interaction.rows[i].options,buttons=[...input.closest('.answer-row').querySelectorAll('.choice-buttons button')];
    assert.equal(buttons.length,options.length,e.id+' printed options rendered');
    buttons[0].click();assert.equal(input.value,options[0].value,e.id+' first choice can be selected');
    const j=options.findIndex(o=>correct(o.value));assert(j>=0,e.id+' correct choice is available');buttons[j].click();
    assert.equal(input.value,options[j].value,e.id+' choice updates response');assert.equal(buttons[j].getAttribute('aria-pressed'),'true');
   }else if(e.interaction?.type==='multi'){
    const buttons=[...input.closest('.answer-row').querySelectorAll('.choice-buttons button')],options=e.interaction.rows[i].options,spec=e.answerSpec[i];
    const selected=options.map((o,j)=>spec?.kind==='set'?(spec.members.some(a=>w.Focus4Marking.checkText(o.value,a))?j:-1):(correct(o.value)?j:-1)).filter(j=>j>=0);
    selected.forEach(j=>buttons[j].click());assert(correct(input.value),e.id+' all required options checked');buttons[selected[0]].click();assert(!correct(input.value),e.id+' multiple selection toggles off');buttons[selected[0]].click();
   }else if(e.interaction?.type==='order'){
    const buttons=[...input.closest('.answer-row').querySelectorAll('.order-bank button')];
    const sequences={'wb-86-3':[[1,2,3,0,4],[6,0,2,1,3,5,4],[0,4,2,1,3,5],[3,0,2,1,4],[1,0,3,2]],'wb-111-7':[[1,3,0,2]],'sb-43-1':[[0,1,2,3,4,5]]};
    for(const j of sequences[e.id][i])buttons[j].click();assert(correct(input.value),e.id+' ordered cards form a valid answer');assert(buttons.every(b=>b.disabled),e.id+' a card cannot be used twice');
    const undo=input.closest('.answer-row').querySelector('[aria-label="Убрать последнюю карточку"]');const before=input.value;undo.click();assert.notEqual(input.value,before);buttons[sequences[e.id][i].at(-1)].click();assert.equal(input.value,before,e.id+' undo and reinsert');
   }else if(e.interaction?.type==='bank'){
    input.closest('.answer-row').querySelector('.choice-slot').click();
    const word=[...q('.interaction-bank').querySelectorAll('button')].find(b=>correct(b.textContent));assert(word,e.id+' answer in printed bank');word.click();assert.equal(input.value,word.textContent,e.id+' word card fills selected gap');assert.equal(q('.interaction-status').textContent,'Выбран пропуск '+e.answerSpec[i].label,e.id+' selected gap matches visible item');
   }else{input.value=input.tagName==='SELECT'?[...input.options].find(o=>correct(o.value))?.value||'':e.answerSpec[i]?.accepted[0]||'Test answer '+(i+1);input.dispatchEvent(new w.Event('input',{bubbles:true}))}
  });
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
if(process.env.FOCUS4_AUDIT_REPORT)fs.writeFileSync(process.env.FOCUS4_AUDIT_REPORT,JSON.stringify({checked:n,fail,errors:[...new Set(errors)],coverage},null,2)+'\n');console.log(JSON.stringify({checked:n,failCount:fail.length,sample:fail.slice(0,15),errors:[...new Set(errors)],coverage},null,2));dom.window.close();process.exitCode=fail.length||errors.length?1:0;
})();
