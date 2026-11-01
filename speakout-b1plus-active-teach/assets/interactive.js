/* Interaction models use only the supplied exercise and answer key. */
(function(root){
'use strict';
function normalize(value){
 let s=String(value??'').normalize('NFKC').replace(/[‘’`]/g,"'").toLowerCase().trim();
 if(/^(t|true)$/.test(s))return 'true';if(/^(f|false)$/.test(s))return 'false';
 if(/^(?:[-–—]|no match|none|∅)$/.test(s))return '∅';
 s=s.replace(/\bcan't\b/g,'cannot').replace(/\bwon't\b/g,'will not').replace(/n't\b/g,' not').replace(/\bcan not\b/g,'cannot')
 .replace(/'m\b/g,' am').replace(/'re\b/g,' are').replace(/'ve\b/g,' have').replace(/'ll\b/g,' will')
 .replace(/\b(he|she|it|that|there|what|where|who|how)'s(?= been\b)/g,'$1 has')
 .replace(/\b(he|she|it|that|there|what|where|who|how)'s\b/g,'$1 is');
 if(s==="'s")s='is';
 return s.replace(/\.(?!\d)|(?<!\d)\./g,'').replace(/[!?;,()"“”]/g,' ').replace(/\s+/g,' ').trim();
}
const phraseAlternatives={};
function variants(answer){return phraseAlternatives[answer]||String(answer).split(/\s*\/\s*|\s+OR\s+/).map(s=>s.trim()).filter(Boolean)}
function matches(value,answer){return !!String(value).trim()&&variants(answer).some(a=>normalize(a)===normalize(value))}
function numbered(text){
 const rows={};let n=null;
 for(const line of text.split('\n')){const m=/^\s*(\d{1,2})\s+(.+)$/.exec(line);if(m){n=m[1];rows[n]=m[2]}else if(n)rows[n]+=' '+line}
 return rows;
}
function optionsFor(text,n){
 const line=numbered(text)[n]||'';const parts=[...line.matchAll(/(?:^|\s)([a-d])\s+(.+?)(?=\s+[a-d]\s+|$)/g)];
 if(parts.length>=2&&parts.every((m,i)=>m[1]===String.fromCharCode(97+i)))return parts.map(m=>({value:m[1],label:m[1]+'. '+m[2].trim()}));
 return null;
}
function cleanKey(key){return key}
function sourceBank(text,items){
 // Keep the printed alternatives, including distractors. Never offer inflected
 // answers as a bank when the book asks the student to form them independently.
 if(items.some(q=>q.answer.trim().split(/\s+/).length!==1))return null;
 const match=/\bbox[.!]?\s*\n([\s\S]+)/i.exec(text);if(!match)return null;
 const lines=[];for(const line of match[1].split('\n').slice(0,3)){const clean=line.replace(/\(x\d+\)/gi,'').replace(/[\[\]]/g,'').trim();if(!/^[a-zA-Z‘’' ,–-]+$/.test(clean))break;lines.push(clean)}
 const words=[...new Set(lines.join(' ').split(/\s+/).filter(Boolean))];
 return words.length>=2&&words.length<=22&&items.every(q=>words.some(w=>normalize(w)===normalize(q.answer)))?words:null;
}
function spec(ex,key){
 key=cleanKey(key);const text=String(ex.text||'').normalize('NFKC'),items=key?.items||[];
 // Crossed-out corrections, stress/intonation and model answers need human review.
 const review=/correct (?:the )?mistakes|correct the spelling|stressed syllable|word stress|underline|sample answer|students.? own|possible answers/i.test(text+' '+(key?.raw||''));
 if(!items.length||review||items.some(q=>q.answer.includes('/'))||items.some(q=>/\/[s zɪ]+\//.test(q.answer))||(!items.every(q=>/^\d+$/.test(q.n))&&!items.every(q=>/^[a-z]$/i.test(q.n)))||new Set(items.map(q=>q.n)).size!==items.length)return {mode:'review',items:[]};
 const allTF=items.every(q=>/^(T|F|true|false)$/i.test(q.answer))&&(/true|false/i.test(text)||items.some(q=>/^T$/i.test(q.answer)));
 const letterMatch=/match/i.test(text)&&items.every(q=>/^(?:[A-J]|[–—-])$/.test(q.answer));
 let letters=[];
 if(letterMatch){
  const range=/\b([A-J])\s*[-–—]\s*([A-J])\b/.exec(text);
  if(range)for(let i=range[1].charCodeAt(0);i<=range[2].charCodeAt(0);i++)letters.push(String.fromCharCode(i));
  else letters=[...new Set([...text.matchAll(/^\s*([A-J])\s*$/gm)].map(m=>m[1]).concat(items.map(q=>q.answer).filter(a=>/^[A-J]$/.test(a))))].sort();
  if(items.some(q=>/^[–—-]$/.test(q.answer)))letters.push('–');
 }
 const bank=sourceBank(text,items);
 const reorder=/correct order|put.*words.*order/i.test(text)&&!/letters.*order/i.test(text);
 const fields=items.slice().sort((a,b)=>a.n.localeCompare(b.n,undefined,{numeric:true})).map(q=>{
  const field={n:q.n,answer:q.answer,kind:'text'};
  if(allTF){field.kind='choice';field.options=[{value:'T',label:'True'},{value:'F',label:'False'}]}
  else if(letterMatch&&letters.length>1){field.kind='match';field.options=letters.map(a=>({value:a,label:a==='–'?'Нет соответствия':a}))}
  else if(/^[a-d]$/.test(q.answer)){const opts=optionsFor(text,q.n);if(opts?.some(o=>o.value===q.answer)){field.kind='choice';field.options=opts}}
  else if(reorder&&!q.answer.includes('/')&&q.answer.trim().split(/\s+/).length>2){field.kind='order';field.tokens=q.answer.trim().split(/\s+/)}
  else if(bank){field.kind='bank';field.options=bank.map(a=>({value:a,label:a}))}
  return field;
 });
 return {mode:'auto',items:fields};
}
const api={normalize,variants,matches,cleanKey,spec};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.SpeakoutInteractive=api;
})(typeof window==='undefined'?globalThis:window);
