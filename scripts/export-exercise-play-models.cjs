/* Read the existing answer models; never change their keys or saved IDs. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),out={};
const load=(base,files)=>{const c={window:{},console};vm.createContext(c);for(const file of files)vm.runInContext(fs.readFileSync(path.join(root,base,file),'utf8'),c);return c.window};
for(const course of ['speakout-b1','speakout-b1plus']){
 const base=course+'-active-teach',w=load(base,['assets/course.js','assets/interactive.js','assets/exercise-sources.js']),d=w.COURSE;out[course]=[];
 for(const[book,b]of Object.entries(d.books))for(const p of b.pages)for(const e of p.exercises){const id=book+':'+p.page+':'+e.label,spec=w.SpeakoutInteractive.spec(e,d.keys[e.keyId||book+'|'+p.lesson+'|'+e.label]);if(spec.mode==='auto'&&w.EXERCISE_SOURCES[id])out[course].push({id,fields:spec.items.map(f=>({id:f.n,answers:w.SpeakoutInteractive.variants(f.answer)})),sources:w.EXERCISE_SOURCES[id].sources,pdf:p.pdf||b.path,pdfPage:p.pdfPage,text:e.text})}
}
{
 const c='solutions-int',w=load(c+'-active-teach',['assets/course.js','assets/exercise-sources.js']);out[c]=w.SOLUTIONS.pages.flatMap(p=>p.exercises.filter(e=>e.answerSpec?.length).map(e=>({id:e.id,fields:e.answerSpec.filter(f=>f.kind!=='set').map(f=>({id:f.label,answers:f.accepted})),sources:w.EXERCISE_SOURCES[e.id].sources,text:e.text})))
}
{
 const c='outcomes-beginner',w=load(c+'-active-teach',['assets/exercises.js','assets/exercise-sources.js']),d=Object.values(w).find(x=>x&&x['sb:10']);out[c]=Object.values(d).flat().filter(e=>e.check?.mode==='items').map(e=>({id:e.id,fields:e.check.items.filter(f=>!f.soft&&!f.self&&f.match!=='set').map(f=>({id:String(f.label),answers:[f.key].flat(Infinity)})),sources:w.EXERCISE_SOURCES[e.id].sources,text:e.instruction}))
}
{
 const c='speakout-b2plus',w=load(c+'-active-teach',['data/exercises.js','assets/exercise-sources.js']),d=Object.values(w).find(x=>x&&x['sb:7']);out[c]=Object.values(d).flat().filter(e=>e.fields.some(f=>f.answer)).map(e=>({id:e.id,fields:e.fields.filter(f=>f.answer&&f.mode!=='set').map(f=>({id:f.n,answers:[f.answer]})),sources:w.EXERCISE_SOURCES[e.id].sources,text:e.text}))
}
{
 const c='speakout-b1plus-tests',w=load('speakout-b1plus-active-teach',['assets/materials-data.js','assets/material-interactions.js','assets/material-sources.js']),library=Object.values(w).find(v=>v?.items?.some?.(x=>x.category==='tests'));out[c]=[];for(const item of library.items){const model=w.SPEAKOUT_MATERIAL_INTERACTIONS.materials[item.id];if(!model)continue;for(const e of model.sections)if(e.mode==='auto')out[c].push({id:item.id+':'+e.id,fields:e.fields.map(f=>({id:f.n,answers:f.answers})),sources:w.MATERIAL_EXERCISE_SOURCES[item.id+':'+e.id].sources,pdf:item.path,pdfPage:e.sourcePage,material:true,text:e.instruction})}
}
fs.writeFileSync(process.argv[2]||'/private/tmp/exercise-play-models.json',JSON.stringify(out));
console.log(Object.fromEntries(Object.entries(out).map(([k,v])=>[k,v.length])));
