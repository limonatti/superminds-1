/* Deterministic practice checker. Only explicit alternatives are accepted. */
(function(root){
 'use strict';
 const VERSION=2;
 function normalize(value){
  let s=String(value??'').normalize('NFKC').replace(/[‘’ʼ`]/g,"'").replace(/[−–—]/g,'-').toLowerCase().trim();
  s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const contractions={"can't":"cannot","won't":"will not","shan't":"shall not","i'm":"i am","you're":"you are","we're":"we are","they're":"they are","i'll":"i will","you'll":"you will","he'll":"he will","she'll":"she will","it'll":"it will","we'll":"we will","they'll":"they will","i'd":"i would","you'd":"you would","he'd":"he would","she'd":"she would","we'd":"we would","they'd":"they would"};
  for(const [a,b] of Object.entries(contractions))s=s.replace(new RegExp('\\b'+a+'\\b','g'),b);
  s=s.replace(/\b(he|she|it|that|there|what|who|where|how)'s\b/g,'$1 is').replace(/\b(are|is|was|were|do|does|did|could|should|would|must)n't\b/g,'$1 not');
  s=s.replace(/\b([a-z]+)'s not\b/g,'$1 is not');
  s=s.replace(/(^|[\s;,])'(m|re|s|ll)\b/g,(_,before,a)=>before+({m:'am',re:'are',s:'is',ll:'will'}[a]));
  if(s==="n't")s='not';
  s=s.replace(/(\d),(?=\d{3}(?:\D|$))/g,'$1').replace(/(\d)[,:](?=\d{2}(?:\D|$))/g,'$1.');
  s=s.replace(/\b\d+\.\d+\b/g,n=>String(Number(n))).replace(/(?<=\D)-(?=\D)/g,' ');
  // Preserve decimal points, minus signs and apostrophes: cant and can't differ.
  s=s.replace(/\.(?!\d)|(?<!\d)\./g,'').replace(/[!?;,():\[\]"“”£€$]/g,' ').replace(/\s+/g,' ').trim();
  return s;
 }
 function variants(key){
  if(Array.isArray(key))return key.flatMap(variants);
  const groups=String(key).split(';').map(part=>part.split(/\s*\/\s*/).map(s=>s.trim()));
  // Slashes around IPA symbols are notation, never alternatives.
  if(/^\/?[əɪʊʃʒɑɔæɜŋa-z:ː]+\/$/i.test(String(key).trim()))return [String(key)];
  return groups.reduce((all,group)=>all.flatMap(prefix=>group.map(v=>[prefix,v].filter(Boolean).join('; '))),['']);
 }
 function list(value,simple){
  let parts=String(value).split(/[,;\n]+/);
  if(simple&&parts.length===1)parts=String(value).trim().split(/\s+/);
  return parts.map(normalize).filter(Boolean).sort();
 }
 function checkField(field,value){
  if(field.given)return 'given';
  if(!String(value??'').trim())return 'blank';
  if(field.self)return 'review';
  if(field.requireContraction&&!/[a-z][’'](?:m|re|s|ll|t)\b/i.test(String(value)))return 'incorrect';
  if(field.requireUppercase&&/[a-z]/.test(String(value)))return 'incorrect';
  const acceptable=variants(field.key).concat(field.accept||[]);
  const correct=acceptable.some(key=>{
   if(field.match==='set'){
    const expected=String(key).split(/[,;\n]+/),simple=expected.every(x=>/^\s*(?:\d+|[a-z])\s*$/i.test(x));
    return JSON.stringify(list(value,simple))===JSON.stringify(list(key,simple));
   }
   return normalize(value)===normalize(key);
  });
  return correct?'correct':field.soft?'review':'incorrect';
 }
 function check(spec,values){
  if(spec?.mode!=='items')return {version:VERSION,mode:'self',items:[],correct:0,total:0,complete:false};
  const parts=spec.items.map((f,i)=>f.parts&&!f.given?f.parts.map((p,j)=>checkField(p,String(values[i]||'').split(/[,;]\s*/)[j])):null);
  parts.forEach((part,i)=>{if(part&&checkField(spec.items[i],values[i])==='correct')parts[i]=part.map((_,j)=>spec.items[i].parts[j].given?'given':'correct')});
  const items=spec.items.map((f,i)=>parts[i]?(parts[i].every(x=>x==='correct'||x==='given')?'correct':parts[i].includes('incorrect')?'incorrect':parts[i].includes('blank')?'blank':'review'):checkField(f,values[i]));
  const scored=spec.items.flatMap((f,i)=>f.soft||f.given?[]:parts[i]?parts[i].filter((_,j)=>!f.parts[j].given):[items[i]]);
  return {version:VERSION,mode:'auto',items,parts,correct:scored.filter(s=>s==='correct').length,total:scored.length,complete:items.every(x=>x==='correct'||x==='given'),needsReview:items.includes('review')};
 }
 function isComplete(spec,record){return Boolean(record?.done&&(spec?.mode!=='items'||(record.grade?.revision===spec.revision&&record.grade.correct===record.grade.total&&record.grade.items.every(s=>s==='correct'||s==='review'||s==='given'))))}
 const api={VERSION,normalize,variants,checkField,check,isComplete};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 root.OutcomesGrader=api;
})(typeof window==='undefined'?globalThis:window);
