/* Explicit assessment of all blocks in a teacher-authored exercise.
   CSS feedback and elapsed time never constitute completion. */
(function(root){
'use strict';
const submitted=new Map(),sending=new Map();
function collect(exercise,items,records){
 const parts=[],values=[];
 for(let i=0;i<items.length;i++){
  const spec=root.CourseAuthored.model(exercise.type,items[i]);
  if(!spec?.fields.length||spec.fields.some(f=>!f.accepted?.length))return {review:true};
  const record=records[`authored:${exercise.id}:${i}`];
  if(!record||record.results?.length!==spec.fields.length)return {incomplete:true};
  const results=root.CoursePractice.grade(spec,record.values||[]);
  if(results.some(r=>r==='blank'))return {incomplete:true};
  parts.push({part:i+1,results});values.push(record.values);
 }
 if(!parts.length)return {incomplete:true};
 const results=parts.flatMap(p=>p.results);
 return {correct:results.every(r=>r==='correct'),signature:JSON.stringify([values,parts]),
   details:{items:parts,answered:results.length,correct:results.filter(r=>r==='correct').length}};
}
async function report(meta,exercise,items){
 const store=root.CoursePractice.storeFor(meta.course).store;
 if(!store.user)return {ok:false,guest:true};
 const result=collect(exercise,items,store.records);
 if(result.incomplete||result.review)return {ok:true,...result};
 const key=store.user.id+':'+meta.course+':'+exercise.id;
 if(submitted.get(key)===result.signature)return {ok:true,duplicate:true};
 if(sending.get(key)?.signature===result.signature)return sending.get(key).promise;
 const promise=(async()=>{
  try{
   const saved=await root.SM.saveAttempt({course:meta.course,unit_id:meta.unit,exercise_id:exercise.id,
     ex_type:exercise.type,correct:result.correct,details:result.details});
   // Accepted into the durable queue is different from a server acknowledgement.
   if(saved.ok||saved.pending)submitted.set(key,result.signature);
   return saved;
  }catch(error){return {ok:false,error:error.message||'Не удалось сохранить результат'};}
 })().finally(()=>{if(sending.get(key)?.promise===promise)sending.delete(key);});
 sending.set(key,{signature:result.signature,promise});return promise;
}
root.SMProgress={collect,report};
if(typeof module!=='undefined')module.exports={collect,report};
})(typeof window==='undefined'?globalThis:window);
