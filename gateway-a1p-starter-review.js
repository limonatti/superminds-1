/* Reviewed author-created Starter practice; not a transcription of textbook pages. */
(function(root){
'use strict';
const norm=s=>String(s??'').normalize('NFKC').replace(/[‘’]/g,"'").toLowerCase().replace(/[.!?,]/g,'').replace(/\s+/g,' ').trim();
const hash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return(h>>>0).toString(36)};
function legacyId(spec,meta){return meta.id||`practice:${meta.unit}:${meta.section||'lesson'}:${hash(JSON.stringify([spec.html||spec.prompt,spec.fields.map(f=>[f.prompt,f.options?.map(o=>o.label).sort(),f.tokens])]))}`;}
const gapConfigs=[
 {prompt:'Напиши число 7 английским словом. Здесь тренируем правописание.',accepted:['seven']},
 {prompt:'Напиши порядковое числительное 2nd английским словом.',accepted:['second']},
 {prompt:"It's half ___ six (6:30). Выбери слово для пропуска.",accepted:['past'],options:['to','past']},
 {prompt:"It's quarter ___ nine (8:45). Выбери слово для пропуска.",accepted:['to'],options:['past','to']},
 {prompt:'How ___ you spell that? Выбери слово для пропуска.',accepted:['do'],options:['are','do','is']},
 {prompt:'Напиши «понедельник» по-английски. Начни с большой буквы.',accepted:['Monday'],caseSensitive:true}
];
function grade(config,value){if(!String(value??'').trim())return 'blank';const normalize=config.caseSensitive?s=>String(s).normalize('NFKC').trim():norm;return config.accepted.some(a=>normalize(a)===normalize(value))?'correct':'incorrect';}
const objects=['bag','board','book','chair','computer','desk','dictionary','door','pen','pencil','ruler','window'];
const colours=['black','blue','brown','green','grey','orange','pink','purple','red','white','yellow'];
const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const copy=v=>JSON.parse(JSON.stringify(v));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let active=null;
function card(oldSpec,meta,config){
 const id=legacyId(oldSpec,meta),button=root.CoursePractice.card(oldSpec,{...meta,id});
 if(config.prompt)button.firstElementChild.textContent=config.prompt;
 button.onclick=async()=>{button.disabled=true;try{const ctx=root.CoursePractice.storeFor(meta.course);await ctx.ready;open(oldSpec,{...meta,id},config,ctx.store,button);}finally{button.disabled=false;}};
 return button;
}
function open(oldSpec,meta,config,store,trigger){
 active?.dialog.close();
 const dialog=document.createElement('dialog');dialog.className='gsr-dialog';dialog.setAttribute('aria-label',meta.title||'Упражнение');
 let record=copy(store.records[meta.id]||{}),values=copy(record.values||['']),support=copy(record.support||{}),done=!!record.done;
 let result=record.starterReviewVersion===1?record.results?.[0]||'':'',feedback='';
 const isOral=Number.isInteger(config.oral);
 if(isOral)done=record.starterReviewVersion===1&&!!record.done;
 const initial=copy(record);
 if(Object.keys(record).length&&record.starterReviewVersion!==1)feedback='Сохранённый ответ восстановлен. Проверь его по уточнённому условию; прежняя запись сохранена.';
 const q=s=>dialog.querySelector(s);
 const b=(label,action,value,pressed=false,extra='')=>`<button type="button" data-action="${action}" data-value="${esc(value)}" aria-pressed="${pressed}" ${extra}>${esc(label)}</button>`;
 function persist(){
  const r={...record,book:'practice',unit:meta.unit,section:meta.section,exercise:meta.title,values:copy(values),support:copy(support),done,results:isOral?[]:result?[result]:[],score:isOral?null:result?{correct:result==='correct'?1:0,total:1}:null,starterReviewVersion:1,updatedAt:Date.now()};
  if(initial.starterReviewVersion!==1&&Object.keys(initial).length&&!r.previousStarterReview)r.previousStarterReview=initial;
  store.set(meta.id,r);record=copy(store.records[meta.id]||r);
 }
 function changed(){done=false;result='';feedback='';persist();refresh();}
 function clock(h,m){const a=m*6*Math.PI/180,c=(h%12*30+m*.5)*Math.PI/180;return `<svg viewBox="0 0 100 100" width="110" height="110" aria-label="Часы ${h}:${String(m).padStart(2,'0')}" role="img"><circle cx="50" cy="50" r="46" fill="#faf3e9" stroke="#7c2340" stroke-width="3"/><text x="50" y="18" text-anchor="middle">12</text><text x="86" y="55" text-anchor="middle">3</text><text x="50" y="90" text-anchor="middle">6</text><text x="14" y="55" text-anchor="middle">9</text><path d="M50 50L${50+25*Math.sin(c)} ${50-25*Math.cos(c)}M50 50L${50+34*Math.sin(a)} ${50-34*Math.cos(a)}" stroke="#7c2340" stroke-width="3" stroke-linecap="round"/></svg>`;}
 function oral(){
  if(config.oral===0)return `<p>Выбери шесть предметов и назови цвет каждого вслух. Карточки — опора; цвет выбери по тому, что видишь рядом.</p><div class="gsr-bank" role="group" aria-label="Предметы класса">${objects.map(w=>b(w,'object',w,(support.objects||[]).includes(w))).join('')}</div><p>Выбрано ${support.objects?.length||0} из 6.</p><div class="gsr-bank" role="group" aria-label="Цвета">${colours.map(w=>b(w,'colour',w,support.colour===w,`style="--swatch:${w}" class="gsr-colour"`)).join('')}</div><p lang="en">The … is …</p>`;
  if(config.oral===1)return `<p>Выбери сегодняшний день, затем скажи день недели и дату целиком. Дату можно произнести без записи.</p><div class="gsr-bank" role="group" aria-label="Дни недели">${days.map(w=>b(w,'day',w,support.day===w)).join('')}</div><p lang="en">Today is …<br>It’s the … of …</p>${b('Дату произнёс / произнесла','mark','date',!!support.date)}`;
  if(config.oral===2)return `<p>Посмотри на часы, произнеси время и отметь каждую карточку. Ответ оцениваете с преподавателем.</p><div class="gsr-clocks">${[[3,15],[7,0],[12,30]].map(([h,m],i)=>`<div>${clock(h,m)}<p>${h}:${String(m).padStart(2,'0')}</p>${b(support['clock'+i]?'Произнесено ✓':'Я назвал(а) время','mark','clock'+i,!!support['clock'+i])}</div>`).join('')}</div>`;
  return `<p>Произнеси по буквам своё имя и имя друга. Нажимай буквы как опору; это не проверка произношения.</p><div class="gsr-bank" role="group" aria-label="Алфавит">${alphabet.map(w=>b(w,'letter',w,support.letter===w)).join('')}</div>${b('Своё имя произнёс / произнесла','mark','own',!!support.own)} ${b('Имя друга произнёс / произнесла','mark','friend',!!support.friend)}`;
 }
 function refresh(){
  const focused=document.activeElement,action=focused?.dataset.action,value=focused?.dataset.value;
  q('.gsr-controls').innerHTML=isOral?oral():config.options?`<div class="gsr-bank" role="group" aria-label="Варианты для пропуска">${config.options.map(w=>b(w,'answer',w,values[0]===w)).join('')}</div>`:`<label>Твой ответ<input data-answer type="text" autocomplete="off" spellcheck="false" value="${esc(values[0]||'')}"></label>`;
  q('[data-action=complete]').textContent=isOral?(done?'Выполнено вслух ✓':'Отметить: выполнено вслух'):'Проверить';
  q('[data-action=undo]').hidden=!record.starterUndo;
  q('.gsr-feedback').textContent=feedback||(isOral?(done?'Отметка сохранена. Автоматической оценки устного ответа нет.':''):({correct:'Верно!',incorrect:config.caseSensitive?'Проверь написание: первая буква должна быть большой.':'Проверь ответ и попробуй ещё раз.',blank:'Сначала дай ответ.'}[result]||''));
  q('.gsr-feedback').dataset.result=result;
  const input=q('[data-answer]');if(input)input.oninput=()=>{values[0]=input.value;done=false;result='';feedback='';persist();q('.gsr-feedback').textContent='';q('.gsr-feedback').dataset.result='';};
  if(action)[...q('.gsr-controls').querySelectorAll('[data-action]')].find(x=>x.dataset.action===action&&x.dataset.value===value)?.focus({preventScroll:true});
 }
 dialog.innerHTML=`<button type="button" data-action="close" class="gsr-close" aria-label="Закрыть упражнение">×</button><h2>${esc(meta.title||'Упражнение')}</h2><p class="gsr-prompt">${esc(config.prompt||oldSpec.prompt)}</p><div class="gsr-controls"></div>${isOral?`<details><summary>Мои заметки — необязательно</summary><label>Сохранённый ответ / заметки<textarea rows="3">${esc(values[0]||'')}</textarea></label></details>`:''}<div class="gsr-actions"><button type="button" data-action="complete"></button><button type="button" data-action="reset">Начать заново</button><button type="button" data-action="undo" hidden>Вернуть ответ до сброса</button></div><p class="gsr-feedback" role="status" aria-live="polite"></p>`;
 if(isOral)q('textarea').oninput=e=>{values[0]=e.target.value;persist();};
 dialog.addEventListener('click',e=>{
  const el=e.target.closest('[data-action]');if(!el)return;const {action:a,value:v}=el.dataset;
  if(a==='close'){dialog.close();return;}
  if(a==='answer'){values[0]=v;changed();}
  if(a==='object'){const set=new Set(support.objects||[]);if(set.has(v))set.delete(v);else if(set.size<6)set.add(v);support.objects=[...set];changed();}
  if(['colour','day','letter'].includes(a)){support[a]=v;changed();}
  if(a==='mark'){support[v]=!support[v];changed();}
  if(a==='complete'){
   if(isOral){done=config.oral===0?support.objects?.length===6:config.oral===1?!!support.day&&!!support.date:config.oral===2?[0,1,2].every(i=>support['clock'+i]):!!support.own&&!!support.friend;feedback=done?'Отметка сохранена. Автоматической оценки устного ответа нет.':'Сначала выполни и отметь пункты задания.';}
   else{result=grade(config,values[0]);done=result==='correct';feedback='';if(meta.log&&result!=='blank')meta.log(meta.section,meta.attempt,oldSpec.html,values[0],done);}
   persist();refresh();
  }
  if(a==='reset'){const previous=copy(record);delete previous.starterUndo;record.starterUndo=previous;values=[''];support={};result='';done=false;feedback='Ответ сброшен. Его можно вернуть.';persist();if(isOral)q('textarea').value='';refresh();}
  if(a==='undo'&&record.starterUndo){record=copy(record.starterUndo);values=copy(record.values||['']);support=copy(record.support||{});result=record.results?.[0]||'';done=!!record.done;feedback='Предыдущий ответ возвращён.';persist();if(isOral)q('textarea').value=values[0]||'';refresh();}
 });
 const close=()=>{dialog.remove();if(active?.dialog===dialog)active=null;trigger.focus();};dialog.addEventListener('close',close,{once:true});
 document.body.append(dialog);dialog.showModal();active={dialog,store,id:meta.id,restore(){record=copy(store.records[meta.id]||{});values=copy(record.values||['']);support=copy(record.support||{});result=record.starterReviewVersion===1?record.results?.[0]||'':'';done=record.starterReviewVersion===1&&!!record.done;if(isOral)q('textarea').value=values[0]||'';refresh();}};
 if(!store._starterReviewObserver){const original=store.onChange;store.onChange=(rows,change)=>{original(rows,change);if(change?.remote&&active?.store===store)active.restore();};store._starterReviewObserver=true;}
 root.CourseWorkUI.bind(store);root.CourseWorkUI.mount();refresh();
}
root.GatewayStarterReviewed={card,gapConfigs,legacyId,grade};
if(typeof module!=='undefined')module.exports={legacyId,grade,gapConfigs};
})(typeof window==='undefined'?globalThis:window);
