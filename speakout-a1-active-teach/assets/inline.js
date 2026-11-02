/* Editable fields stay in the coordinate system of the printed page. */
(function(root){
'use strict';
const I=root.SpeakoutInteractive,escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function optionText(q,value){const o=q?.options?.find(o=>I.normalize(o.value)===I.normalize(value));return o?o.label.replace(/^[a-d]\.\s*/i,''):value}
function canonical(q,value){const o=q?.options?.find(o=>I.normalize(optionText(q,o.value))===I.normalize(value));return o?o.value:value}
function fromTemplate(template,value){const pattern=template.split('{}').map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('(.*?)');return new RegExp('^'+pattern+'$','i').exec(value||'')?.slice(1)}
function model(id,spec){
 const source=root.SPEAKOUT_INLINE_DATA?.[id];if(!source?.fields.length)return null;
 const fields=source.fields.map(f=>({...f})),groups={};
 const items=spec.items.filter(q=>!source.given?.includes(q.n)).map(q=>source.rank?{...q,originalAnswer:q.answer,answer:q.n,options:undefined}:q);
 for(const f of fields)if(f.n)(groups[f.n]||=[]).push(f);
 let complete=spec.mode==='auto'&&!(source.letters&&!source.vowels&&!source.templates&&fields.some(f=>f.kind==='shortline'));
 for(const q of items){const group=groups[q.n];if(!group){complete=false;continue}
  if(source.templates?.[q.n]){const parts=fromTemplate(source.templates[q.n],q.answer)||[];if(parts.length===group.length)group.forEach((f,i)=>f.answer=parts[i]);else complete=false}
  else if(source.vowels){const parts=q.answer.match(/[aeiou]+/gi)||[];if(parts.length===group.length)group.forEach((f,i)=>f.answer=parts[i]);else complete=false}
  else if(group.length===1)group[0].answer=optionText(q,q.answer);
  else{const parts=q.answer.split(/\s*[;,]\s*/);if(parts.length===group.length)group.forEach((f,i)=>f.answer=parts[i]);else complete=false}
 }
 if(fields.some(f=>f.answer===undefined))complete=false;
 return {box:source.box,fields,groups,items,rank:source.rank,vowels:source.vowels,templates:source.templates,instruction:source.instruction,auto:complete};
}
function mount({container,data,page,exercise,state,spec,key,keyHTML,url,teacher,index,last,onChange}){
 state.inline=state.inline||{};spec={...spec,items:data.items};
 for(const q of spec.items)if(q.originalAnswer&&I.matches(state.values[q.n]||'',q.originalAnswer))state.values[q.n]=q.answer;
 const byId=new Map(data.fields.map(f=>[f.id,f]));let selected=data.fields[0].id,full=false,zoom=1;
 const value=f=>{if(Object.hasOwn(state.inline,f.id))return state.inline[f.id];if(!f.n)return state.values[f.id]||'';const group=data.groups[f.n];if(data.templates?.[f.n])return fromTemplate(data.templates[f.n],state.values[f.n])?.[group.indexOf(f)]||'';if(data.vowels){const q=spec.items.find(q=>q.n===f.n);if(!q)return '';const pattern=q.answer.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/[aeiou]+/gi,'(.*?)');const match=new RegExp('^'+pattern+'$','i').exec(state.values[f.n]||'');return match?.[group.indexOf(f)+1]||''}if(group.length===1)return optionText(spec.items.find(q=>q.n===f.n),state.values[f.n]||'');const parts=String(state.values[f.n]||'').split(/\s*[;,]\s*/);return parts.length===group.length?parts[group.indexOf(f)]||'':''};
 container.classList.add('has-inline');
 container.innerHTML=`<div class="inline-instruction">${data.instruction?`<strong>${escape(data.instruction)}</strong><br>`:''}Нажми на пропуск в задании и напиши ответ. Клавиша Tab переводит к следующему пропуску.</div><div class="exercise-source inline-source" tabindex="-1" aria-label="Оригинал задания с полями для ответов"><div class="inline-stage"><img class="inline-original" src="${url(page.image)}" alt="Оригинал упражнения ${escape(exercise.label)}" draggable="false">${data.fields.map(f=>`<input class="inline-field" data-inline="${escape(f.id)}" value="${escape(value(f))}" aria-label="${f.n&&!data.rank?'Ответ '+escape(f.n):'Пропуск '+(data.fields.indexOf(f)+1)}" aria-describedby="inlineFeedback" autocomplete="off" spellcheck="false">`).join('')}</div></div><div class="exercise-response inline-response"><div class="inline-tools"><span id="inlineCurrent"></span><button id="inlineNextBlank">Следующий пропуск →</button><button id="inlineHint">Подсказка</button></div><div id="inlineOptions"></div><p id="inlineFeedback" role="status" aria-live="polite"></p><div class="actions">${data.auto?'<button id="check" class="primary">Проверить</button><button id="retryMistakes">Повторить ошибки</button>':'<button id="inlineCompare">Сверить с ключом</button>'}<button id="retry">Начать заново</button></div><p id="checkResult" class="statusline" role="status"></p><div class="actions"><button id="done">${state.done?'✓ Выполнено':'Отметить после сверки'}</button><button id="exercisePrevious" ${index===0?'disabled':''}>← Назад</button><button id="exerciseNext">Следующее →</button></div>${state.note?`<details><summary>Сохранённые заметки</summary><p class="inline-old-note">${escape(state.note)}</p></details>`:''}<div id="keyArea" ${teacher?'':'hidden'}>${keyHTML}</div></div>`;
 const $=s=>container.querySelector(s),inputs=[...container.querySelectorAll('[data-inline]')],stage=$('.inline-stage'),measure=document.createElement('canvas').getContext('2d');
 function fit(input,f){measure.font='10px Arial';const size=Math.max(6,Math.min(10,10*(f.box[2]-.5)/(measure.measureText(input.value).width||1)));input.style.fontSize=`${(size/(full?595:data.box[2])*100).toFixed(4)}cqw`}
 function layout(){
  const [x,y,w,h]=full?[0,0,595,842]:data.box;stage.style.width=(zoom*100)+'%';stage.style.aspectRatio=`${w}/${h}`;
  Object.assign($('.inline-original').style,{width:(595/w*100)+'%',left:(-x/w*100)+'%',top:(-y/h*100)+'%'});
  for(const input of inputs){const f=byId.get(input.dataset.inline),[a,b,c,d]=f.box;Object.assign(input.style,{left:((a-x)/w*100)+'%',top:((b-y)/h*100)+'%',width:(c/w*100)+'%',height:(d/h*100)+'%',fontSize:`${(10/w*100).toFixed(4)}cqw`});fit(input,f)}
 }
 function clearFeedback(){for(const input of inputs){input.classList.remove('correct','incorrect','revealed');input.removeAttribute('aria-invalid')}$('#checkResult').textContent='';$('#inlineFeedback').textContent=''}
 function write(f,v){fit(inputs.find(input=>input.dataset.inline===f.id),f);state.inline[f.id]=v;const group=f.n&&data.groups[f.n];if(group){const q=spec.items.find(q=>q.n===f.n),parts=group.map(value);let part=0;state.values[f.n]=data.templates?.[f.n]?data.templates[f.n].replace(/\{\}/g,()=>parts[part++]||''):data.vowels&&q?q.answer.replace(/[aeiou]+/gi,()=>parts[part++]||''):canonical(q,parts.join(', '))}else state.values[f.id]=v;state.done=false;state.score=null;clearFeedback();onChange()}
 function activate(f){
  selected=f.id;$('#inlineCurrent').textContent=`Пропуск ${data.fields.indexOf(f)+1} из ${data.fields.length}${f.n&&!data.rank?' · № '+f.n:''}`;
  $('#inlineHint').disabled=f.answer===undefined;
  const q=spec.items.find(q=>q.n===f.n),options=q?.options||[];
  $('#inlineOptions').innerHTML=options.length?`<div class="choicegroup" role="group" aria-label="Варианты для выбранного пропуска">${options.map(o=>`<button type="button" data-inline-option="${escape(o.value)}">${escape(o.label)}</button>`).join('')}</div>`:'';
  for(const b of $('#inlineOptions').querySelectorAll('button'))b.onclick=()=>{const input=inputs.find(i=>i.dataset.inline===f.id);input.value=optionText(q,b.dataset.inlineOption);write(f,input.value);input.focus({preventScroll:true})};
 }
 for(const input of inputs){const f=byId.get(input.dataset.inline);input.onfocus=()=>activate(f);input.oninput=()=>write(f,input.value);input.onkeydown=event=>{if(event.key==='Enter'){event.preventDefault();const next=inputs[(inputs.indexOf(input)+1)%inputs.length];next.focus()}};
  input.ondragover=e=>e.preventDefault();input.ondrop=e=>{e.preventDefault();const text=e.dataTransfer.getData('text/plain');if(text){input.value=text;write(f,text);input.focus()}};
 }
 $('#inlineNextBlank').onclick=()=>inputs[(data.fields.findIndex(f=>f.id===selected)+1)%inputs.length].focus();
 $('#inlineHint').onclick=()=>{const f=byId.get(selected);if(f.answer===undefined)return;state.revealed[f.n]=true;state.done=false;state.score=null;const input=inputs.find(i=>i.dataset.inline===f.id);input.classList.remove('correct','incorrect');input.classList.add('revealed');$('#inlineFeedback').textContent=`Ответ${f.n&&!data.rank?' '+f.n:''}: ${f.answer}`;$('#checkResult').textContent='';onChange()};
 function correct(f){return data.groups[f.n]?.length===1?I.matches(state.values[f.n]||'',spec.items.find(q=>q.n===f.n).answer):I.matches(value(f),f.answer)}
 function check(){
  let right=0;for(const q of spec.items)if(I.matches(state.values[q.n]||'',q.answer))right++;
  for(const input of inputs){const f=byId.get(input.dataset.inline),ok=correct(f);input.classList.remove('revealed');input.classList.toggle('correct',ok);input.classList.toggle('incorrect',!ok);input.setAttribute('aria-invalid',!ok)}
  const helped=spec.items.some(q=>state.revealed[q.n]);state.score=right;state.total=spec.items.length;state.done=right===state.total&&!helped;
  $('#checkResult').textContent=`Верно: ${right} из ${state.total}${helped?' · Есть подсказки. Повтори эти ответы самостоятельно.':state.done?' · Всё выполнено!':''}`;
  $('#inlineFeedback').textContent=right===state.total?'Все ответы верны.':'Неверные и незаполненные пропуски выделены красным.';onChange();
 }
 if($('#check'))$('#check').onclick=check;
 if($('#retryMistakes'))$('#retryMistakes').onclick=()=>{for(const q of spec.items)if(!I.matches(state.values[q.n]||'',q.answer)||state.revealed[q.n]){delete state.values[q.n];delete state.revealed[q.n];for(const f of data.groups[q.n]||[])delete state.inline[f.id]}state.done=false;state.score=null;for(const input of inputs)input.value=value(byId.get(input.dataset.inline));layout();clearFeedback();onChange();inputs[0].focus()};
 $('#retry').onclick=()=>{state.values={};state.inline={};state.revealed={};state.done=false;state.score=null;for(const input of inputs)input.value='';layout();clearFeedback();onChange()};
 if($('#inlineCompare'))$('#inlineCompare').onclick=()=>document.querySelector('#exerciseKeys').click();
 activate(data.fields[0]);layout();
 return {report(){return data.fields.map(f=>({label:data.rank?'Пропуск '+(data.fields.indexOf(f)+1):f.n||f.id,text:value(f),result:data.auto&&typeof state.score==='number'?(correct(f)?'✓ Верно':'✕ Ошибка'):''}))},setZoom(value){zoom=value;layout()},setFullPage(on){full=on;layout()},get full(){return full}};
}
root.SpeakoutInline={model,mount};
})(window);
