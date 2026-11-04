/* Adapt the existing teacher-authored exercise formats without inventing keys. */
(function(root){
'use strict';
const options=xs=>xs.map((label,i)=>({label:String(label),value:String(i)}));
const choice=d=>({prompt:d.q,kind:'choice',options:options(d.opts),accepted:[String(d.correct)]});
function model(type,d){
 const s={prompt:d.q||d.statement||d.hint||'',image:d.img,fields:[]},split=a=>String(a||'').split(',').map(v=>v.trim()).filter(Boolean);
 switch(type){
 case 'choice':s.fields=[choice(d)];break;
 case 'gap':s.fields=[{accepted:split(d.answer)}];break;
 case 'open':s.fields=[{kind:'open'}];break;
 case 'listen':s.prompt='Послушайте и запишите ответ';s.audio=d.src;s.speech=d.audio;s.fields=[{accepted:split(d.answer)}];break;
 case 'tf':s.fields=[{kind:'choice',options:[{label:'True',value:'true'},{label:'False',value:'false'}],accepted:[String(d.correct)]}];break;
 case 'multi':s.fields=[{kind:'multi',options:options(d.opts),accepted:[d.correct.map(String)]}];break;
 case 'match':s.prompt='Соедините пары';s.fields=d.pairs.map((p,i)=>({prompt:p.a||'Картинка '+(i+1),kind:d.pairs.some(p=>p.ib)?'choice':undefined,options:root.CoursePractice.shuffle(d.pairs.map((p,j)=>({label:p.b||'Картинка '+(j+1),value:String(j),image:p.ib}))),accepted:[String(i)],image:p.ia}));break;
 case 'categorize':s.prompt='Распределите по категориям';s.fields=root.CoursePractice.shuffle(d.cats.flatMap((c,i)=>c.items.map(prompt=>({prompt,options:options(d.cats.map(c=>c.name)),accepted:[String(i)]}))));break;
 case 'cloze':{let i=0;s.prompt=d.q.replace(/\[\[(.*?)\]\]/g,(_,inner)=>{const bank=inner.split('|').map(s=>s.trim());s.fields.push({prompt:String(++i),options:root.CoursePractice.shuffle(bank.map(label=>({label,value:label}))),accepted:[bank[0]]});return `___ (${i})`});break;}
 case 'fillbox':s.fields=d.answers.map((answer,i)=>({prompt:String(i+1),accepted:[answer]}));break;
 // In these two authored game formats the answer field is also the source token
 // sequence (there is no separate book/key). Only these explicit formats use it.
 case 'order':s.prompt='Соберите предложение из слов';s.fields=[{tokens:d.words||d.answer.split(/\s+/),accepted:[d.answer]}];break;
 case 'letters':s.prompt='Соберите слово'+(d.hint?' · '+d.hint:'');s.fields=[{tokens:[...d.word.replace(/ /g,'')],join:'',accepted:[d.word.replace(/ /g,'')]}];break;
 case 'reading':s.prompt=d.text;s.fields=d.qs.map(choice);break;
 case 'tfns':s.prompt=d.text;s.fields=d.sts.map(st=>({prompt:st.s,kind:'choice',options:[{label:'True',value:'T'},{label:'False',value:'F'},{label:'Not stated',value:'N'}],accepted:[st.a]}));break;
 case 'wordform':s.prompt='Образуйте нужную форму слова';s.fields=(d.items||[d]).map(it=>({prompt:it.q+' ('+it.base+')',accepted:split(it.answer)}));break;
 case 'headings':s.prompt='Подберите заголовок к каждому абзацу';s.fields=d.paras.map((prompt,i)=>({prompt,options:root.CoursePractice.shuffle(options(d.heads)),accepted:[String(i)]}));break;
 default:return null;
 }
 return s;
}
function render(e,item,index,meta,fallback){const spec=model(e.type,item);if(!spec)return fallback({type:e.type,data:item});return root.CoursePractice.card(spec,{...meta,id:`authored:${e.id}:${index}`,title:e.title||'Упражнение',onCheck:meta.onCheck})}
root.CourseAuthored={model,render};if(typeof module!=='undefined')module.exports={model};
})(typeof window==='undefined'?globalThis:window);
