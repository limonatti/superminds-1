/* Persistent exercises for the older course pages and teacher-authored homework. */
(function(root){
'use strict';
const stores=new Map(),cards=[],norm=s=>String(s??'').normalize('NFKC').replace(/[‘’]/g,"'").toLowerCase().replace(/[.!?,]/g,'').replace(/\s+/g,' ').trim();
const hash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return(h>>>0).toString(36)};
const shuffle=a=>a.map((v,i)=>({v,i,h:hash(JSON.stringify(v)+':practice')})).sort((a,b)=>a.h.localeCompare(b.h)||a.i-b.i).map(x=>x.v);
const el=(tag,text,cls)=>Object.assign(document.createElement(tag),{textContent:text||'',className:cls||''});
let dialog=null;
function storeFor(course){
 if(!stores.has(course)){
  const store=new CourseWorkStore({course,onAccountChange:()=>CourseWorkUI.accountChanged(),onChange(){for(const c of cards)if(c.course===course)c.refresh();const score=document.getElementById('sc');if(score)score.textContent=[...new Map(cards.map(c=>[c.course+':'+c.id,c])).values()].reduce((n,c)=>n+(stores.get(c.course)?.store.records[c.id]?.score?.correct||0),0)}});
  stores.set(course,{store,ready:store.start()});
 }
 return stores.get(course);
}
function grade(spec,values){return spec.fields.map((f,i)=>{
 const value=values[i];if(f.kind==='open'||!f.accepted?.length)return 'review';
 if(Array.isArray(value)){if(!value.length)return 'blank';return f.accepted.some(a=>Array.isArray(a)&&JSON.stringify([...a].map(String).sort())===JSON.stringify([...value].map(String).sort()))?'correct':'incorrect'}
 if(!String(value??'').trim())return 'blank';return f.accepted.some(a=>(spec.normalize||norm)(value)===(spec.normalize||norm)(a))?'correct':'incorrect';
})}
function card(spec,meta){
 const source=JSON.stringify([spec.html||spec.prompt,spec.fields.map(f=>[f.prompt,f.options?.map(o=>o.label).sort(),f.tokens])]);
 const id=meta.id||`practice:${meta.unit}:${meta.section||'lesson'}:${hash(source)}`,course=meta.course;
 const button=el('button','','coursework-preview');button.type='button';
 const title=el('span');if(spec.html)title.innerHTML=spec.html;else title.textContent=spec.prompt||'Открыть упражнение';
 const caption=el('small','Открыть упражнение');button.append(title,caption);
 const ctx={id,course,refresh(){const r=stores.get(course)?.store.records[id];caption.textContent=r?.done?'Выполнено · открыть':r?'Есть сохранённый ответ · продолжить':'Открыть упражнение'}};cards.push(ctx);
 button.onclick=async()=>{button.disabled=true;try{const s=storeFor(course);await s.ready;open(spec,{...meta,id},s.store,button)}finally{button.disabled=false}};
 storeFor(course).ready.then(()=>ctx.refresh());return button;
}
function open(spec,meta,store,trigger){
 if(dialog?.open)dialog.close();dialog?.remove();
 dialog=el('dialog','','coursework-dialog');dialog.setAttribute('aria-label','Упражнение');
 const close=el('button','×','coursework-close');close.type='button';close.setAttribute('aria-label','Закрыть упражнение');close.onclick=()=>dialog.close();dialog.append(close,el('h2',meta.title||'Упражнение'));
 const instruction=el('div');instruction.style.whiteSpace='pre-wrap';if(spec.html)instruction.innerHTML=spec.html;else instruction.textContent=spec.prompt||'';dialog.append(instruction);
 if(spec.image){const img=el('img');img.src=spec.image;img.alt='Иллюстрация к упражнению';img.style.maxWidth='100%';dialog.append(img)}
 if(spec.audio){const audio=el('audio');audio.src=spec.audio;audio.controls=true;audio.preload='none';dialog.append(audio)}
 else if(spec.speech){const audio=el('button','Прослушать');audio.type='button';audio.onclick=()=>root.SM_speak?root.SM_speak(spec.speech):speechSynthesis.speak(Object.assign(new SpeechSynthesisUtterance(spec.speech),{lang:'en-US'}));dialog.append(audio)}
 const prior=store.records[meta.id]||{},values=JSON.parse(JSON.stringify(prior.values||[]));let results=prior.results||[],done=!!prior.done,revision=0;
 const rows=[],refreshers=[];
 const feedback=el('p','','practice-feedback');feedback.setAttribute('role','status');
 function save(){store.set(meta.id,{...store.records[meta.id],book:meta.book||'practice',unit:meta.unit,exercise:meta.title||spec.prompt||'Практика',section:meta.section,values,results,done,score:results.length?{correct:results.filter(r=>r==='correct').length,total:spec.fields.filter(f=>f.accepted?.length).length}:null,updatedAt:Date.now()})}
 function changed(){revision++;results=[];done=false;rows.forEach(r=>delete r.dataset.result);feedback.textContent='';save();refreshers.forEach(fn=>fn())}
 function showResults(){rows.forEach((r,i)=>r.dataset.result=results[i]||'');feedback.textContent=results.length?`Верно: ${results.filter(r=>r==='correct').length} из ${spec.fields.filter(f=>f.accepted?.length).length}.${results.includes('blank')?' Заполните все пункты.':''}${results.includes('incorrect')?' Исправьте отмеченные ответы.':''}${results.includes('review')?' Свободный ответ сохранён для обсуждения с преподавателем.':''}`:''}
 spec.fields.forEach((f,i)=>{
  const row=el('div','','practice-field'),label=el('label',f.prompt||String(i+1));rows.push(row);row.append(label);if(f.image){const img=el('img');img.src=f.image;img.alt=f.prompt||'Иллюстрация';img.style.maxWidth='140px';row.append(img)}
  if(f.kind==='choice'||f.kind==='multi'){
   const group=el('div','','practice-choices');group.setAttribute('role','group');group.setAttribute('aria-label',f.prompt||'Варианты ответа');
   for(const o of f.options||[]){const b=el('button',o.label);b.type='button';if(o.image){const img=el('img');img.src=o.image;img.alt=o.label;img.style.maxWidth='120px';b.append(img)}b.onclick=()=>{if(f.kind==='multi'){const set=new Set(values[i]||[]);set.has(o.value)?set.delete(o.value):set.add(o.value);values[i]=[...set]}else values[i]=o.value;changed()};const refresh=()=>b.setAttribute('aria-pressed',String(f.kind==='multi'?(values[i]||[]).includes(o.value):String(values[i]??'')===String(o.value)));refresh();refreshers.push(refresh);group.append(b)}row.append(group);
  }else if(f.options?.length){const input=el('select');input.setAttribute('aria-label',f.prompt||`Ответ ${i+1}`);input.append(new Option('Выберите…',''));for(const o of f.options)input.append(new Option(o.label,String(o.value)));input.value=String(values[i]??'');input.onchange=()=>{values[i]=input.value;changed()};row.append(input);
  }else{
   const input=el(f.kind==='open'?'textarea':'input');input.id='practice-answer-'+i;label.htmlFor=input.id;input.value=values[i]||'';input.autocomplete='off';input.oninput=()=>{values[i]=input.value;changed()};row.append(input);
   if(f.tokens?.length){const bank=el('div','','practice-choices');for(const token of shuffle(f.tokens)){const b=el('button',token);b.type='button';b.onclick=()=>{input.value=(input.value+(f.join??' ')+token).trim();values[i]=input.value;changed()};bank.append(b)}row.append(bank)}
  }
  dialog.append(row);
 });
 const check=el('button',spec.fields.some(f=>f.accepted?.length)?'Проверить':'Отметить как выполненное','practice-check');check.type='button';
 check.onclick=()=>{results=grade(spec,values);done=spec.fields.every((f,i)=>f.accepted?.length?results[i]==='correct':!!String(values[i]||'').trim());showResults();save();
 const checked=++revision;
 Promise.resolve(meta.onCheck?.({values,results,done})).then(r=>{
  if(checked!==revision||!feedback.isConnected)return;
  if(r?.incomplete)feedback.textContent+=' Ответьте на остальные блоки упражнения.';
  else if(r&&r.ok===false&&!r.pending&&!r.guest)feedback.textContent+=' Результат не сохранён. Нажмите «Проверить» ещё раз.';
 }).catch(()=>{if(checked===revision&&feedback.isConnected)feedback.textContent+=' Не удалось сохранить результат. Повторите проверку.';});
 if(meta.log)spec.fields.forEach((f,i)=>{if(f.accepted?.length&&results[i]!=='blank')meta.log(meta.section||'practice',meta.attempt||i+1,f.prompt||spec.prompt||'Упражнение',Array.isArray(values[i])?values[i].join(', '):String(values[i]||''),results[i]==='correct')})};
 dialog.append(check,feedback);dialog.addEventListener('close',()=>{dialog.querySelectorAll('audio').forEach(a=>a.pause());trigger.focus()},{once:true});document.body.append(dialog);CourseWorkUI.bind(store);dialog.showModal();CourseWorkUI.mount();showResults();
}
function wrap(node,meta){
 const holder=el('div'),preview=el('button',meta.title||'Открыть упражнение','coursework-preview');preview.type='button';holder.append(preview);
 preview.onclick=async()=>{const ctx=storeFor(meta.course);await ctx.ready;if(dialog?.open)dialog.close();dialog?.remove();dialog=el('dialog','','coursework-dialog');dialog.setAttribute('aria-label',meta.title||'Упражнение');const close=el('button','×','coursework-close');close.setAttribute('aria-label','Закрыть упражнение');close.onclick=()=>dialog.close();dialog.append(close,node);dialog.addEventListener('close',()=>{node.remove();preview.focus()},{once:true});document.body.append(dialog);CourseWorkUI.bind(ctx.store);dialog.showModal();CourseWorkUI.mount()};return holder;
}
function legacy(kind,t,n,meta){
 let spec={html:t.q||'Соедини пары',fields:[],normalize:meta.normalize};
 if(kind==='mc')spec.fields=[{kind:'choice',options:t.o.map((label,i)=>({label,value:String(i)})),accepted:[String(t.a)]}];
 else if(kind==='gap')spec.fields=[{accepted:t.a}];
 else if(kind==='tf')spec.fields=[{kind:'choice',options:[{label:'True',value:'T'},{label:'False',value:'F'}],accepted:[t.a===true||t.a==='T'||t.a===1?'T':'F']}];
 else if(kind==='tfng')spec.fields=[{kind:'choice',options:['T','F','NG'].map(value=>({value,label:{T:'True',F:'False',NG:'Not Given'}[value]})),accepted:[String(t.a).toUpperCase()]}];
 else if(kind==='match')spec.fields=t.map(p=>({prompt:p[0],options:shuffle(t.map(p=>({label:p[1],value:p[1]}))),accepted:[p[1]]}));
 return card(spec,{...meta,title:'Упражнение '+n});
}
root.CoursePractice={card,legacy,shuffle,grade,storeFor,wrap,flush:()=>Promise.all([...stores.values()].map(s=>s.store.flush())).then(rs=>({ok:rs.every(r=>r.ok)}))};
if(typeof module!=='undefined')module.exports={grade,hash,shuffle};
})(typeof window==='undefined'?globalThis:window);
