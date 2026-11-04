/* Presentation receives only choices from the task, never grading answers. */
(function(root){
  'use strict';
  function presentation(field){
    return {answers:[],options:field.choices?.map(value=>({value,label:value}))};
  }
  function attempted(exercise,saved={}){
    const id=exercise.id||exercise.uid||'custom-'+exercise.label;
    return !!exercise.fields?.length&&exercise.fields.every(field=>{
      const answer=saved[field.storageKey||id+':'+field.n];
      return answer?.checked===true&&String(answer.value??'').trim().length>0;
    });
  }
  root.B2ExercisePolicy={presentation,attempted};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.B2ExercisePolicy;
})(typeof window==='undefined'?globalThis:window);
