/* Interaction models use only the supplied exercise and answer key. */
(function(root){
'use strict';
function normalize(value){
 let s=String(value??'').normalize('NFKC').replace(/[‘’`]/g,"'").toLowerCase().trim();
 if(/^(t|true)$/.test(s))return 'true';if(/^(f|false)$/.test(s))return 'false';
 if(/^(?:[-–—]|no match|none|∅)$/.test(s))return '∅';
 s=s.replace(/\bcan't\b/g,'cannot').replace(/\bwon't\b/g,'will not').replace(/n't\b/g,' not').replace(/\bcan not\b/g,'cannot')
 .replace(/'m\b/g,' am').replace(/'re\b/g,' are').replace(/'ve\b/g,' have').replace(/'ll\b/g,' will')
 .replace(/\b(he|she|it|that|there|what|where|who|how)'s\b/g,'$1 is');
 if(s==="'s")s='is';
 return s.replace(/\.(?!\d)|(?<!\d)\./g,'').replace(/[!?;,()"“”]/g,' ').replace(/\s+/g,' ').trim();
}
// These keys use a slash inside a shared phrase, rather than between full answers.
const phraseAlternatives={
 'Can I make you some/a tea?':['Can I make you some tea?','Can I make you a tea?'],
 'Could you make me some/a coffee, please?':['Could you make me some coffee, please?','Could you make me a coffee, please?'],
 'question word + was / were + subject':['question word + was + subject','question word + were + subject'],
 'I, he/she/it':['I, he, she, it'],
 'Yes, I was / we were.':['Yes, I was.','Yes, we were.'],
 'Why was she / your aunt your favourite person?':['Why was she your favourite person?','Why was your aunt your favourite person?'],
 'When / What time do you meet?':['When do you meet?','What time do you meet?'],
 'Why do you eat pizza/it?':['Why do you eat pizza?','Why do you eat it?'],
 'When / What time do you go home?':['When do you go home?','What time do you go home?'],
 'She isn’t / She’s not an office worker. She’s a shop assistant.':['She isn’t an office worker. She’s a shop assistant.','She’s not an office worker. She’s a shop assistant.']
};
function variants(answer){return phraseAlternatives[answer]||String(answer).split(/\s*\/\s*|\s+OR\s+/).map(s=>s.trim()).filter(Boolean)}
function matches(value,answer,literal=false){const canonical=literal?s=>String(s).normalize('NFKC').replace(/[‘’`]/g,"'").toLowerCase().trim():normalize;return !!String(value).trim()&&variants(answer).some(a=>canonical(a)===canonical(value))}
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
function cleanKey(key){
 if(!key?.items||!key.pdf?.endsWith('/194.pdf'))return key;
 return {...key,items:key.items.map(q=>{const m=/^(.+\D)\s+(\d{1,2})$/.exec(q.answer);return m&&Number(m[2])===key.pdfPage?{...q,answer:m[1].trim()}:q})};
}
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
 if(ex.responseSpec)return ex.responseSpec;
 key=cleanKey(key);const text=String(ex.text||'').normalize('NFKC'),items=key?.items||[];
 // Crossed-out corrections, stress/intonation and model answers need human review.
 const review=/correct (?:the )?mistakes|correct the spelling|stressed syllable|word stress|underline|sample answer|students.? own|possible answers/i.test(text+' '+(key?.raw||''));
 if(!items.length||review||items.some(q=>/\/[s zɪ]+\//.test(q.answer))||(!items.every(q=>/^\d+$/.test(q.n))&&!items.every(q=>/^[a-z]$/i.test(q.n)))||new Set(items.map(q=>q.n)).size!==items.length)return {mode:'review',items:[]};
 const allTF=items.every(q=>/^(T|F|true|false)$/i.test(q.answer))&&(/true|false/i.test(text)||items.some(q=>/^T$/i.test(q.answer)));
 const letterMatch=/match/i.test(text)&&items.every(q=>/^(?:[A-J]|[–—-])$/.test(q.answer));
 let letters=[];
 if(letterMatch){
  const range=/\b([A-J])\s*[-–—]\s*([A-J])\b/.exec(text);
  if(range)for(let i=range[1].charCodeAt(0);i<=range[2].charCodeAt(0);i++)letters.push(String.fromCharCode(i));
  else letters=[...new Set([...text.matchAll(/^\s*([A-J])\s*$/gm)].map(m=>m[1]).concat([...text.matchAll(/\b[A-J](?:\s*(?:,|and|or)\s*[A-J])+\b/g)].flatMap(m=>m[0].match(/[A-J]/g)||[])))].sort();
  if(items.some(q=>/^[–—-]$/.test(q.answer)))letters.push('–');
 }
 const bank=sourceBank(text,items);
 const reorder=/correct order|put.*words.*order/i.test(text)&&!/letters.*order/i.test(text);
 const fields=items.slice().sort((a,b)=>a.n.localeCompare(b.n,undefined,{numeric:true})).map(q=>{
  const field={n:q.n,answer:q.answer,kind:'text'};
  if(allTF){field.kind='choice';field.options=[{value:'T',label:'True'},{value:'F',label:'False'}]}
  else if(letterMatch&&letters.length>1){field.kind='match';field.options=letters.map(a=>({value:a,label:a==='–'?'Нет соответствия':a}))}
  else if(/^[a-d]$/.test(q.answer)){const opts=optionsFor(text,q.n);if(opts?.some(o=>o.value===q.answer)){field.kind='choice';field.options=opts}}
  else if(reorder&&(numbered(text)[q.n]||'').split('/').length>2){field.kind='order';field.tokens=numbered(text)[q.n].split('/').map(s=>s.trim()).filter(Boolean)}
  else if(bank){field.kind='bank';field.options=bank.map(a=>({value:a,label:a}))}
  return field;
 });
 return {mode:'auto',items:fields};
}
const api={normalize,variants,matches,cleanKey,spec};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.SpeakoutInteractive=api;
})(typeof window==='undefined'?globalThis:window);
