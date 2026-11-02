/* Choices share the original page coordinates and the existing answer records. */
(function(root){
'use strict';
const I=root.SpeakoutInteractive,esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const equal=(a,b)=>I.normalize(a)===I.normalize(b);
function model(id,spec){
 const source=root.SPEAKOUT_CHOICE_DATA?.[id];if(!source?.groups.length)return null;
 const groups=source.groups.map(g=>({...g,options:g.options.map(o=>({...o}))})),byNumber={};for(const g of groups)(byNumber[g.n]||=[]).push(g);
 let auto=spec.mode==='auto'&&spec.items.length>0;
 const items=spec.items.map(q=>({...q}));
 for(const q of items){const gs=byNumber[q.n];if(!gs){auto=false;continue}const parts=gs.length===1?[q.answer]:q.answer.split(/\s*[,;]\s*/);if(parts.length!==gs.length){auto=false;continue}
  gs.forEach((g,j)=>{let expected=parts[j];if(!g.options.some(o=>I.matches(o.value,expected))&&expected.includes(':'))expected=expected.slice(expected.indexOf(':')+1).trim();const option=g.options.find(o=>I.matches(o.value,expected));if(option)g.correct=option.value;else auto=false});
 }
 if(groups.some(g=>g.correct===undefined))auto=false;
 const gaps=(root.SPEAKOUT_INLINE_DATA?.[id]?.fields||[]).filter(f=>byNumber[f.n]?.length===1&&!byNumber[f.n][0].options.some(o=>o.text));
 // A selected word may also be entered in its printed gap, where one exists.
 const box=source.box.slice();for(const f of gaps){const[x,y,w,h]=f.box;const right=Math.max(box[0]+box[2],x+w+1),bottom=Math.max(box[1]+box[3],y+h+1);box[0]=Math.min(box[0],x-1);box[1]=Math.min(box[1],y-1);box[2]=right-box[0];box[3]=bottom-box[1]}
 return {box,groups,byNumber,items,gaps,auto};
}
function mount({container,data,page,exercise,state,keyHTML,url,teacher,index,onChange}){
 state.values||={};state.inline||={};state.revealed||={};state.choices||={};let full=false,zoom=1,active=data.groups[0];
 function value(g){if(data.byNumber[g.n].length===1)return state.values[g.n]||'';if(Object.hasOwn(state.choices,g.id))return state.choices[g.id];return String(state.values[g.n]||'').split(/\s*[,;]\s*/)[g.part]||''}
 function selected(g){return g.options.find(o=>equal(value(g),o.value)||equal(value(g),o.label))}
 const gapText=f=>{const g=data.byNumber[f.n][0],o=selected(g);return o?o.label:value(g)};
 container.classList.add('has-inline');
 container.innerHTML=`<p class="inline-instruction">Нажми на вариант ответа прямо в задании. Выбор можно изменить. Клавиши ← и → переключают варианты.</p><div class="exercise-source inline-source" tabindex="-1" aria-label="Оригинал задания с выбором ответов"><div class="inline-stage"><img class="inline-original" src="${url(page.image)}" alt="Оригинал упражнения ${esc(exercise.label)}" draggable="false">${data.groups.map((g,i)=>`<div class="page-choice-group" role="radiogroup" aria-label="Пункт ${esc(g.id)}">${g.options.map((o,j)=>`<button type="button" class="page-choice" role="radio" data-page-choice="${i}:${j}" aria-label="Пункт ${esc(g.id)}: ${esc(o.label)}" aria-checked="false" tabindex="${j===0?0:-1}">${o.boxes.map((b,k)=>`<span class="choice-hit${o.text?' choice-letter':''}" data-part="${k}">${o.text?esc(o.text):''}</span>`).join('')}</button>`).join('')}</div>`).join('')}${data.gaps.map(f=>`<input class="inline-field" data-inline="${esc(f.id)}" aria-label="Ответ ${esc(f.n)}" value="${esc(gapText(f))}" autocomplete="off" spellcheck="false">`).join('')}</div></div><div class="exercise-response inline-response"><div class="inline-tools"><span id="inlineCurrent"></span><button id="inlineNextBlank">Следующий пункт →</button><button id="inlineHint">Подсказка</button></div><p id="inlineFeedback" role="status" aria-live="polite"></p><div class="actions">${data.auto?'<button id="check" class="primary">Проверить</button><button id="retryMistakes">Повторить ошибки</button>':'<button id="inlineCompare">Сверить с ключом</button>'}<button id="retry">Начать заново</button></div><p id="checkResult" class="statusline" role="status"></p><div class="actions"><button id="done">${state.done?'✓ Выполнено':'Отметить после сверки'}</button><button id="exercisePrevious" ${index===0?'disabled':''}>← Назад</button><button id="exerciseNext">Следующее →</button></div>${state.note?`<details><summary>Сохранённые заметки</summary><p>${esc(state.note)}</p></details>`:''}<div id="keyArea" ${teacher?'':'hidden'}>${keyHTML}</div></div>`;
 const $=s=>container.querySelector(s),buttons=[...container.querySelectorAll('[data-page-choice]')],inputs=[...container.querySelectorAll('[data-inline]')],stage=$('.inline-stage'),measure=document.createElement('canvas').getContext('2d');
 const meta=button=>{const[i,j]=button.dataset.pageChoice.split(':').map(Number);return {g:data.groups[i],o:data.groups[i].options[j],i,j}};
 function place(el,b,region){const[x,y,w,h]=region;Object.assign(el.style,{left:((b[0]-x)/w*100)+'%',top:((b[1]-y)/h*100)+'%',width:(b[2]/w*100)+'%',height:(b[3]/h*100)+'%'})}
 function fit(input,f){measure.font='10px Arial';const size=Math.max(6,Math.min(10,10*(f.box[2]-.5)/(measure.measureText(input.value).width||1)));input.style.fontSize=size/(full?595:data.box[2])*100+'cqw'}
 function layout(){const region=full?[0,0,595,842]:data.box,[x,y,w,h]=region;stage.style.width=zoom*100+'%';stage.style.aspectRatio=`${w}/${h}`;Object.assign($('.inline-original').style,{width:595/w*100+'%',left:-x/w*100+'%',top:-y/h*100+'%'});
  for(const button of buttons){const{o}=meta(button),first=o.boxes[0];place(button,first,region);button.style.fontSize=8.5/w*100+'cqw';for(const part of button.children)place(part,o.boxes[+part.dataset.part],first)}
  for(const input of inputs){const f=data.gaps.find(f=>f.id===input.dataset.inline);place(input,f.box,region);fit(input,f)}
 }
 function activate(g){active=g;$('#inlineCurrent').textContent=`Пункт ${g.id} · ${data.groups.indexOf(g)+1} из ${data.groups.length}`;$('#inlineHint').disabled=g.correct===undefined}
 function sync(typing){for(const button of buttons){const{g,o,j}=meta(button),chosen=selected(g),on=chosen===o;button.classList.toggle('selected',on);button.setAttribute('aria-checked',on);button.tabIndex=(chosen?on:j===0)?0:-1}for(const input of inputs){const f=data.gaps.find(f=>f.id===input.dataset.inline);if(input!==typing)input.value=gapText(f);fit(input,f)}}
 function clearFeedback(){for(const el of [...buttons,...inputs]){el.classList.remove('correct','incorrect','revealed','missing');el.removeAttribute('aria-invalid')}$('#checkResult').textContent='';$('#inlineFeedback').textContent=''}
 function choose(g,v,typing){state.choices[g.id]=v;const siblings=data.byNumber[g.n];state.values[g.n]=siblings.length===1?v:siblings.map(s=>s===g?v:value(s)).join(', ');for(const f of data.gaps.filter(f=>f.n===g.n))state.inline[f.id]=gapText(f);state.done=false;state.score=null;clearFeedback();sync(typing);activate(g);onChange()}
 for(const button of buttons){const{g,o,j,i}=meta(button);button.onclick=()=>choose(g,o.value);button.onfocus=()=>activate(g);button.onkeydown=e=>{let next;if(['ArrowRight','ArrowDown'].includes(e.key))next=(j+1)%g.options.length;else if(['ArrowLeft','ArrowUp'].includes(e.key))next=(j-1+g.options.length)%g.options.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=g.options.length-1;else return;e.preventDefault();const target=buttons.find(b=>b.dataset.pageChoice===`${i}:${next}`);choose(g,g.options[next].value);target.focus()}}
 for(const input of inputs){const f=data.gaps.find(f=>f.id===input.dataset.inline),g=data.byNumber[f.n][0];input.onfocus=()=>activate(g);input.oninput=()=>{const v=input.value,o=g.options.find(o=>equal(o.label,v)||equal(o.value,v));choose(g,o?.value||v,input)};input.onblur=()=>sync();input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();inputs[(inputs.indexOf(input)+1)%inputs.length]?.focus()}}}
 function next(){const g=data.groups[(data.groups.indexOf(active)+1)%data.groups.length];buttons.find(b=>meta(b).g===g&&b.tabIndex===0)?.focus()}
 $('#inlineNextBlank').onclick=next;
 $('#inlineHint').onclick=()=>{if(active.correct===undefined)return;state.revealed[active.n]=true;state.done=false;state.score=null;clearFeedback();for(const button of buttons){const{g,o}=meta(button);if(g===active&&equal(o.value,g.correct))button.classList.add('revealed')}$('#inlineFeedback').textContent=`Ответ ${active.id}: ${active.options.find(o=>equal(o.value,active.correct)).label}`;onChange()};
 const correct=g=>g.correct!==undefined&&equal(selected(g)?.value||value(g),g.correct);
 function check(){let right=0;for(const q of data.items)if(data.byNumber[q.n].every(correct))right++;for(const button of buttons){const{g,o}=meta(button),on=selected(g)===o;button.classList.remove('revealed');button.classList.toggle('correct',on&&correct(g));button.classList.toggle('incorrect',on&&!correct(g));button.classList.toggle('missing',!value(g));if(on||!value(g))button.setAttribute('aria-invalid',!correct(g))}for(const input of inputs){const f=data.gaps.find(f=>f.id===input.dataset.inline),ok=correct(data.byNumber[f.n][0]);input.classList.toggle('correct',ok);input.classList.toggle('incorrect',!ok);input.setAttribute('aria-invalid',!ok)}const helped=data.items.some(q=>state.revealed[q.n]);state.score=right;state.total=data.items.length;state.done=right===state.total&&!helped;$('#checkResult').textContent=`Верно: ${right} из ${state.total}${helped?' · Есть подсказки. Повтори эти ответы самостоятельно.':state.done?' · Всё выполнено!':''}`;$('#inlineFeedback').textContent=right===state.total?'Все ответы верны.':'Неверные ответы выделены красным. Заполни оставшиеся пункты.';onChange()}
 if($('#check'))$('#check').onclick=check;
 function clearNumber(n){delete state.values[n];delete state.revealed[n];for(const g of data.byNumber[n])delete state.choices[g.id];for(const f of data.gaps.filter(f=>f.n===n))delete state.inline[f.id]}
 if($('#retryMistakes'))$('#retryMistakes').onclick=()=>{for(const q of data.items)if(state.revealed[q.n]||!data.byNumber[q.n].every(correct))clearNumber(q.n);state.done=false;state.score=null;clearFeedback();sync();onChange()};
 $('#retry').onclick=()=>{for(const n of Object.keys(data.byNumber))clearNumber(n);state.done=false;state.score=null;clearFeedback();sync();onChange()};
 if($('#inlineCompare'))$('#inlineCompare').onclick=()=>document.querySelector('#exerciseKeys').click();
 activate(active);sync();layout();
 return {setZoom(v){zoom=v;layout()},setFullPage(v){full=v;layout()},get full(){return full},report(){return data.groups.map(g=>({label:g.id,text:selected(g)?.label||value(g),result:data.auto&&typeof state.score==='number'?(correct(g)?'✓ Верно':'✕ Ошибка'):''}))}};
}
root.SpeakoutChoices={model,mount};
})(window);
