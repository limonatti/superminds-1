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
 const api={migrate};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.OutcomesAnswerMigration=api;
})(typeof window==='undefined'?globalThis:window);
