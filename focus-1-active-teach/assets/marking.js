/* Pure marking rules shared by the player and regression tests. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FocusMarking=api;})(typeof window==='undefined'?globalThis:window,()=>{
'use strict';
function normalize(value){
 let s=String(value??'').normalize('NFKC').toLowerCase().replace(/[‘’`]/g,"'").trim().replace(/^'(.+)'$/,'$1');
 if(/^(?:[-–—−]|no article|zero article|none|no match|∅)$/.test(s))return '∅';
 if(/^(?:✓|✔|correct|no change|no changes)$/.test(s))return '✓';
 if(/^(?:true|t)$/.test(s))return 'true';if(/^(?:false|f)$/.test(s))return 'false';
 if(/^(?:ng|not given)$/.test(s))return 'not given';
 s=s.replace(/[–—−]/g,'-').replace(/\bwon't\b/g,'will not').replace(/\bcan't\b/g,'cannot').replace(/\bshan't\b/g,'shall not').replace(/n't\b/g,' not').replace(/\bcan not\b/g,'cannot')
 .replace(/'re\b/g,' are').replace(/'m\b/g,' am').replace(/'ve\b/g,' have').replace(/'ll\b/g,' will')
 .replace(/'s(?=\s+been\b)/g,' has').replace(/'s(?=\s+(?:being|going)\b)/g,' is')
 .replace(/'d(?=\s+(?:(?:really|also)\s+)?(?:rather|have|like|be|say|buy|paint|use)\b)/g,' would')
 .replace(/'d(?=\s+(?:been|better|had|finished|found|saved|spent|worn|stayed|remembered|gone)\b)/g,' had')
 .replace(/'s(?=\s+(?:(?:already|never|just)\s+)?(?:been|had|missed|done|tidied|seen)\b)/g,' has')
 .replace(/'s(?=\s+(?:about|the|a|an|very|amazing|no|illegal|shorter|middle-aged|elderly|in|obviously|that|looking|qualified|ridiculous|hurting|hard|clear|clever|your|brilliant|quite|not|more|kind|like|OK|late|having|playing)\b)/g,' is')
 .replace(/(?<=\d),(?=\d{3}(?:\D|$))/g,'').replace(/(?<=[a-z])-(?=[a-z])/g,' ')
 .replace(/[“”"]/g,'').replace(/(^|\s)'(?!(?:s|d|m|re|ve|ll)\b)(?=[a-z])/g,'$1').replace(/(?<=[.!?])'/g,'').replace(/\s*\/\s*/g,'/').replace(/(?<=\d)\s*°\s*/g,'°').replace(/\b([ap])\.\s*m\.?/g,'$1m')
 .replace(/(?<!\d)[.,:](?!\d)|[.,:]$/g,' ').replace(/[!?;(),]/g,' ').replace(/\s+/g,' ').trim();
 return s;
}
function checkText(value,accepted){const v=normalize(value);return !!String(value??'').trim()&&accepted.some(a=>v===normalize(a)||(v==='0'&&normalize(a)==='∅'));}
function splitSet(value){const s=String(value).trim();if(/[;\n]/.test(s))return s.split(/[;\n]+/).map(x=>x.trim()).filter(Boolean);return s.replace(/(?<=\d),(?=\d{3}(?:\D|$))/g,'').split(/\s*,\s*|\s+and\s+/i).map(x=>x.trim()).filter(Boolean);}
function checkField(value,spec){
 if(!String(value??'').trim()||!spec)return false;
 if(spec.kind!=='set')return checkText(value,spec.accepted||[]);
 const parts=splitSet(value),members=spec.members||[],required=spec.minimum??members.length;
 if(parts.length<required||parts.length>members.length)return false;
 // Bipartite matching permits overlapping alternatives without accepting duplicates.
 const owner=Array(members.length).fill(-1);
 function assign(i,seen){for(let j=0;j<members.length;j++){if(seen.has(j)||!checkText(parts[i],members[j]))continue;seen.add(j);if(owner[j]<0||assign(owner[j],seen)){owner[j]=i;return true;}}return false;}
 return parts.every((_,i)=>assign(i,new Set()));
}
function saved(ex,record={}){
 const compatible=record.answerVersion===ex.answerVersion||(!record.answerVersion&&(ex.legacyCompatible||!ex.answerSpec?.length));
 const previous=[...(record.previousAnswers||[])];
 if(!compatible&&(record.values?.some(v=>String(v).trim())||record.reflection))previous.push({values:record.values||[],reflection:record.reflection||'',labels:record.fieldLabels||[],version:record.answerVersion||'original'});
 return {values:compatible?(record.values||[]):[],reflection:compatible?(record.reflection||''):'',previous};
}
function attemptIndex(id,label){let hash=2166136261;for(const c of id+':'+label){hash^=c.charCodeAt(0);hash=Math.imul(hash,16777619);}return hash>>>1;}
return {normalize,checkText,splitSet,checkField,saved,attemptIndex};
});
