/* Presentation interactions preserve the existing answer strings and grading rubrics. */
(function(root){
'use strict';
const norm=s=>String(s||'').replace(/[‘’]/g,"'").toLowerCase().replace(/[?.!,]/g,'').trim();
function numbered(text){const rows={};let label=null;for(const line of text.split('\n')){const m=/^\s*(\d{1,2}|[a-p])\s+(.+)$/i.exec(line);if(m){label=m[1];rows[label]=m[2]}else if(label)rows[label]+=' '+line}return rows}
function shuffled(tokens,seed=''){let h=Array.from(seed).reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,17);const a=tokens.map((text,id)=>({text,id}));for(let i=a.length-1;i>0;i--){h=(Math.imul(h,1664525)+1013904223)>>>0;const j=h%(i+1);[a[i],a[j]]=[a[j],a[i]]}if(a.length>1&&a.every((v,i)=>v.id===i))a.push(a.shift());return a}
function spec(e,source={}){
 const text=source.text||'',rows=numbered(text),fields=e.check?.items||[];
 const matching=/match/i.test(e.instruction),ordering=/put.*words.*order|words.*correct order|order.*words/i.test(e.instruction);
 const range=/\b([a-p])\s*[-–—]\s*([a-p])\b/i.exec(text),letters=range?Array.from({length:range[2].toLowerCase().charCodeAt(0)-range[1].toLowerCase().charCodeAt(0)+1},(_,i)=>String.fromCharCode(range[1].toLowerCase().charCodeAt(0)+i)):Object.keys(rows).filter(k=>/^[a-p]$/.test(k)).sort();
 let wordBank=source.wordBank||[];const box=/\bbox[.!]?\s*\n([\s\S]+)/i.exec(text);
 if(box){const lines=[];for(const line of box[1].split('\n').slice(0,4)){if(!/^[A-Za-z’' ,–-]+$/.test(line.trim()))break;lines.push(line)}const words=[...new Set(lines.join(' ').split(/\s+/).filter(Boolean))];if(words.length>=2&&words.length<=24&&fields.length&&fields.every(f=>typeof f.key==='string'&&!f.soft&&!f.match&&words.some(w=>norm(w)===norm(f.key))))wordBank=words}
 return fields.map((f,i)=>{
  const r={kind:'text',prompt:''},key=Array.isArray(f.key)?f.key[0]:f.key;if(f.self||f.soft)return r;
  if(f.options?.length){return {...r,kind:'choice',options:f.options.map(v=>({value:v,label:v==='T'?'True':v==='F'?'False':v==='DS'?'Doesn’t say':v}))}}
  if(matching&&letters.length>=2&&letters.length<=16&&/^[a-p]$/i.test(key)&&letters.includes(norm(key)))return {...r,kind:'match',options:letters.map(v=>({value:v,label:rows[v]?v+'. '+rows[v]:v}))};
  if(ordering&&typeof key==='string'&&!/[;/]/.test(key)&&key.split(/\s+/).length>=3)return {...r,kind:'order',tokens:key.trim().split(/\s+/)};
  if(/number.*order|sentences.*correct order/i.test(e.instruction)&&fields.length>1&&fields.length<=20&&fields.every(q=>/^\d+$/.test(q.key)&&+q.key>=1&&+q.key<=fields.length))return {...r,kind:'match',options:fields.map((_,j)=>({value:String(j+1),label:String(j+1)}))};
  const line=rows[String(f.label)]||'';
  if(/choose|circle|correct word/i.test(e.instruction)&&line){
   const groups=[...line.matchAll(/[A-Za-z’'-]+(?:\s*\/\s*[A-Za-z’'-]+)+/g)];
   const hit=groups.find(m=>m[0].split(/\s*\/\s*/).some(v=>norm(v)===norm(key)));
   if(hit){const choices=hit[0].split(/\s*\/\s*/);return {...r,kind:'choice',prompt:line,options:choices.map(v=>({value:v,label:v}))}}
  }
  if(/^(a|b|c|d)$/i.test(key)&&line){const opts=[...line.matchAll(/(?:^|\s)([a-d])\s+(.+?)(?=\s+[a-d]\s+|$)/g)];if(opts.length>=2&&opts.every((v,j)=>v[1]===String.fromCharCode(97+j))&&opts.some(v=>v[1]===key))return {...r,kind:'choice',options:opts.map(m=>({value:m[1],label:m[1]+'. '+m[2]}))}}
  if(f.match==='set'&&typeof key==='string'&&/^\d+(?:,\s*\d+)+$/.test(key)){
   const m=/\b1\s*[-–—]\s*(\d+)\b/.exec(text);if(m&&+m[1]<=24&&key.split(',').every(v=>+v<=+m[1]))return {...r,kind:'multi',options:Array.from({length:+m[1]},(_,j)=>({value:String(j+1),label:String(j+1)}))}
  }
  if(wordBank.length)return {...r,kind:'bank',options:wordBank.map(v=>({value:v,label:v}))};
  return r;
 });
}
const api={norm,numbered,shuffled,spec};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.OutcomesInteractions=api;
})(typeof window==='undefined'?globalThis:window);
