/* Keep a readable copy when a reviewed exercise changes its answer fields. */
(function(root){
 'use strict';
 function migrate(exercise,record={values:[],done:false}){
  const rule=exercise.answerMigration;
  if(!rule||record.answerSchema===rule.version)return record;
  const old=Array.isArray(record.values)?record.values:[];
  const values=rule.mapping.map(map=>{
   if(!map)return '';
   const value=String(old[map.index]??'');
   if(map.removeSet)return value.split(/[,;\n]+/).map(v=>v.trim()).filter(v=>v&&!map.removeSet.includes(v.toLowerCase())).join(', ');
   return Number.isInteger(map.part)?value.split(map.separator||';')[map.part]?.trim()||'':value;
  });
  const history=[...(record.answerHistory||[])];
  if(old.some(v=>String(v).trim()))history.push({schema:record.answerSchema||rule.fromRevision||'previous',values:old.slice(),grade:record.grade||null});
  return {...record,values,answerSchema:rule.version,answerHistory:history,grade:null,done:false};
 }
 function regrade(exercise,record,grader){
  if(!record?.grade||exercise.check?.mode!=='items'||record.grade.revision===exercise.check.revision)return record;
  const next=grader.check(exercise.check,record.values||[]);
  // Preserve the previous assessed work; only the rubric revision changes.
  return {...record,answerHistory:[...(record.answerHistory||[]),{schema:record.grade.revision||'previous-rubric',values:(record.values||[]).slice(),grade:record.grade}],grade:{...record.grade,...next,revision:exercise.check.revision},done:Boolean(record.done&&next.correct===next.total&&!next.items.includes('blank')&&!next.items.includes('incorrect'))};
 }
 const api={migrate,regrade};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.OutcomesAnswerMigration=api;
})(typeof window==='undefined'?globalThis:window);
