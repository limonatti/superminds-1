const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const C=require('../speakout-b2plus-active-teach/assets/answer-checker.js');
const base='speakout-b2plus-active-teach/';const c={window:{}};
for(const f of ['data/exercises.js','assets/exercise-sources.js'])vm.runInNewContext(fs.readFileSync(base+f,'utf8'),c);
const bank=c.window.SPEAKOUT_EXERCISES,sources=c.window.EXERCISE_SOURCES;
const ids=['sb-109-1-0','sb-109-2-1','sb-109-3-2','sb-109-4-reviewed','sb-133-1A-0','sb-133-1B-reviewed','sb-133-2A-1','sb-133-2B-reviewed'];
const tasks=Object.entries(bank).flatMap(([page,es])=>es.filter(e=>ids.includes(e.id)).map(e=>({page,e})));
assert.equal(tasks.length,8);assert.equal(bank['sb:109'].map(e=>e.label).join(','),'1,2,3,4');assert.equal(bank['sb:133'].slice(0,4).map(e=>e.label).join(','),'1A,1B,2A,2B');
const dom=new JSDOM('<img id="pageImg" src="pages/sb/109.jpg"><span id="saveStatus">Local QA</span>',{url:'https://qa.invalid/',runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window;
w.ResizeObserver=class{observe(){}disconnect(){}};w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
Object.defineProperties(w.document.querySelector('img'),{naturalWidth:{value:1600},naturalHeight:{value:2262}});
w.EXERCISE_SOURCES=sources;let page='sb:109',store={},writes=0;
w.B2Store={ready:true,answers:p=>store[p]||{},answer:(k,v)=>{writes++;(store[page]||={})[k]=v},flush(){}};
w.B2Focus={tasks:()=>tasks.map(t=>({id:t.e.id,label:t.e.label,page:+t.page.split(':')[1]+1,title:t.e.label})),open(){}};
for(const f of ['exercise-source.js','exercise-play.js','course-focus.js',base+'assets/answer-checker.js',base+'assets/exercise-policy.js',base+'assets/exercises.js'])w.eval(fs.readFileSync(f,'utf8'));
let keyed=0;
for(const t of tasks){
 page=t.page;const e=t.e;assert.equal(e.lesson,'1A');assert(!e.audio);assert(e.hint);assert(sources[e.id]);
 for(const s of sources[e.id].sources){assert(fs.existsSync(base+s.image));let[x,y,width,height]=s.box;assert(x>=0&&y>=0&&x+width<=1&&y+height<=1)}
 store[page]||={};store[page][e.id+':notes']={value:'previous personal note',checked:false};const before=JSON.stringify(store),w0=writes;
 w.B2Exercises.open(e,page);assert.equal(writes,w0);assert.equal(JSON.stringify(store),before);const dialog=w.document.querySelector('#mdExercise');assert(dialog.textContent.includes('previous personal note'));assert.equal(dialog.querySelectorAll('details.exercise-key').length,0);
 dialog.querySelector('#exerciseCheck').click();assert.equal(dialog.querySelectorAll('.exercise-field.correct').length,0);assert.equal(dialog.querySelectorAll('details.exercise-key').length,0);
 for(const f of e.fields){
  if(!f.answer)continue;keyed++;assert(!C.correct('',f));assert(!C.correct('unrelated answer',f));
  const val=f.answer.split('/')[0];assert(C.correct(val,f));
  if(f.mode==='set'){
   for(const input of dialog.querySelectorAll('[data-multi="'+f.n+'"]')){input.checked=val.split(',').includes(input.value);input.dispatchEvent(new w.Event('change',{bubbles:true}))}
  }else{const el=dialog.querySelector('[data-answer="'+f.n+'"]');el.value=val;el.dispatchEvent(new w.Event('input',{bubbles:true}));}
 }
 if(e.fields.some(f=>f.answer)){dialog.querySelector('#exerciseCheck').click();assert.equal(dialog.querySelectorAll('.exercise-field.correct').length,e.fields.length,e.id);assert.equal(dialog.querySelectorAll('details.exercise-key').length,1);}
 // Reopening restores values; reset is scoped to current task and preserves old notes.
 w.B2Exercises.close();w.B2Exercises.open(e,page);assert(dialog.textContent.includes('previous personal note'));
 dialog.querySelector('#exerciseReset').click();assert(e.fields.every(f=>store[page][e.id+':'+f.n]===null));assert.equal(store[page][e.id+':notes'].value,'previous personal note');
 w.B2Exercises.close();
}
const grammar=bank['sb:109'][2];assert(C.correct("Anna's always forgetting my birthday these days",grammar.fields[0]));assert(C.correct("I'm always leaving my phone in strange places",grammar.fields[4]));
const vb=bank['sb:133'][0];assert(!C.correct('take to',vb.fields[6]));assert(C.correct('warm to,take to',vb.fields[6]));assert(!C.correct('2,4',bank['sb:109'][1].fields[6]));
const typed=tasks.reduce((n,{e})=>n+e.fields.filter(f=>!f.choices&&!f.optional).length,0);assert.equal(typed,6);
console.log('PASS eight bank tasks, '+keyed+' keyed responses, original contexts, empty/correct/wrong, set completeness, contractions, card save/reopen/reset and preserved legacy notes; six required writing fields.');dom.window.close();
