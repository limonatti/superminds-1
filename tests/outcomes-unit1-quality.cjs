// Regressions from source comparison: SB pp.6–7, five non-writing tasks.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c={window:{}};
for(const name of ['exercises','course','exercise-sources'])vm.runInNewContext(fs.readFileSync(`outcomes-beginner-active-teach/assets/${name}.js`,'utf8'),c);
const tasks=c.window.OUTCOMES_EXERCISES['sb:10'];
assert.equal(tasks.length,5);
for(const [i,e] of tasks.entries()){
 assert.equal(e.responseMode,'oral');assert.equal(e.check.mode,'self');
 assert.match(e.check.note,/вписывать не нужно/i);
 const media=c.window.OUTCOMES.media.filter(m=>m.book==='sb'&&e.audioTracks.includes(m.track));
 assert.deepEqual(Array.from(media,m=>m.track),[[1],[1],[],[2],[]][i]);
 for(const m of media)assert(fs.existsSync('outcomes-beginner-active-teach/'+m.path));
}
const models=c.window.EXERCISE_SOURCES;
for(const n of [3,5]){
 const sources=models[tasks[n-1].id].sources;
 assert(sources.some(s=>s.page===6&&s.box[2]===1),'all page6 photos');
 assert(sources.some(s=>s.page===7&&s.box[0]===0),'page7 photos3,4,11');
 assert(sources.some(s=>s.page===7&&s.box[1]>.6),'page7 photo12');
}
assert.equal(models[tasks[1].id].sources.length,2,'repetition retains number list');
assert.equal(models[tasks[3].id].sources.length,2,'repetition retains word list');
// Old typed notes must stay available after an activity is corrected to oral mode.
const src=fs.readFileSync('outcomes-beginner-active-teach/assets/student.js','utf8');
const context={esc:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;'),active:tasks[0],ready:true,answers:{},dirty:{},user:null,S:{unit:1},timer:null,source:()=> 'sb',current:()=>({page:7}),liveAnswer:()=>{},localSave:()=>true,renderTasks:()=>{},clearTimeout:()=>{},setTimeout:()=>0,flush:()=>{}};
const done={checked:true};context.$=selector=>selector==='#workDone'?done:null;context.$$=()=>[];
vm.createContext(context);
vm.runInContext(src.slice(src.indexOf(' function responseFields('),src.indexOf(' function cropExercise('))+src.slice(src.indexOf(' function saveDraft('),src.indexOf(' async function flush(')),context);
assert.equal(context.responseFields(tasks[0],{values:[]}), '');
const oldValues=['one','<my note>'];
const html=context.responseFields(tasks[0],{values:oldValues});
assert.match(html,/Мои прежние записи/);assert.match(html,/&lt;my note>/);assert.doesNotMatch(html,/<input|<textarea/);
context.answers[tasks[0].id]={values:oldValues,done:false};
context.saveDraft();assert.equal(context.answers[tasks[0].id].done,true);assert.deepEqual(context.answers[tasks[0].id].values,oldValues);
done.checked=false;context.saveDraft();assert.equal(context.answers[tasks[0].id].done,false);assert.deepEqual(context.answers[tasks[0].id].values,oldValues);
console.log('Outcomes Unit1 opener: five oral tasks, exact recordings, complete visual context; legacy notes preserved on completion and undo.');
