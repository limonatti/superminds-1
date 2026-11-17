(function(){
'use strict';
const D=window.SPI1A,$=s=>document.querySelector(s),copy=v=>JSON.parse(JSON.stringify(v));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let task=Math.max(1,Math.min(5,Number(location.hash.slice(1))||1)),target='A',word=null,gap=1,loaded=false;
const id=()=>`sb:unit1:1a:ex${task}:v1`;
const store=new CourseWorkStore({course:'solutions-pi',onAccountChange:()=>CourseWorkUI.accountChanged(),onStatus:message=>$('#saved').textContent=message,onChange(_r,change){if(loaded&&(change?.remote||change?.account))render();}});
const record=()=>({...D.empty(),...(store.records[id()]||{})});
function save(r){store.set(id(),{...r,book:'sb',unit:1,section:'1A',exercise:`SB ${task<4?'8':'9'} · ${task}`,format:['photo-prompts','photo-word-matching','word-sorting','picture-choice','hashtag-word-bank'][task-1],requiredTextFields:0});}
const button=(label,action,value,pressed=false,extra='')=>`<button type="button" data-action="${action}" data-value="${esc(value)}" aria-pressed="${pressed}" ${extra}>${esc(label)}</button>`;
const photos=()=>'<img class="photos" src="media/sb8-photos.jpg" width="775" height="770" alt="Оригинальные фотографии A–D: болельщики на матче; девушки с результатами; мужчина у стойки в аэропорту; девушка за школьной партой.">';
const glossary=()=>`<details><summary>Значения слов — нажми на нужное</summary><div class="glossary">${D.words.map((w,i)=>`<details><summary lang="en">${w}</summary>${D.translations[i]}</details>`).join('')}</div></details>`;
function activity(r){const v=r.values;
 if(task===1)return `<p>Рассмотри четыре фотографии. Ответь вслух на оба вопроса, используя подсказки. Затем отметь каждую обсуждённую фотографию.</p>${photos()}<p lang="en"><b>1.</b> How do you think these people are feeling?<br><b>2.</b> What is making them feel that way?</p>${D.photos.map((p,i)=>`<div class="photo-prompt"><h3>Photo ${p}</h3><p lang="en">${D.cues[i].join(' · ')}</p>${button(v[p]?'Обсудили фото '+p:'Отметить: обсудили фото '+p,'spoken',p,!!v[p])}</div>`).join('')}`;
 if(task===2)return `<p>Проверь значения слов и послушай оригинальную запись. Выбери фото, затем подходящие чувства. Для одной фотографии можно выбрать несколько слов; одно слово может подходить нескольким фотографиям. Объясни выбор вслух.</p>${photos()}${glossary()}<div class="tabs" role="group" aria-label="Выбрать фото">${D.photos.map(p=>button('Photo '+p,'photo',p,target===p)).join('')}</div><p lang="en">The people in photo ${target} look …</p><div class="bank" role="group" aria-label="Чувства для фото ${target}">${D.words.map(w=>button(w,'feeling',w,(v[target]||[]).includes(w))).join('')}</div><p>Фото ${target}: <b>${esc((v[target]||[]).join(', ')||'слова пока не выбраны')}</b></p><p>Это твоя интерпретация фотографии. Сравни её с ответом партнёра.</p>`;
 if(task===3)return `<p>Выбери карточку, затем категорию. Чтобы перенести слово, выбери его снова и нажми другую категорию. Обсуди спорные случаи и добавь собственные примеры устно или в заметках.</p>${glossary()}<div class="bank" role="group" aria-label="Слова без категории">${D.words.filter(w=>!v[w]).map(w=>button(w,'word',w,word===w)).join('')}</div><p role="status">${word?'Выбрано: '+esc(word)+'. Нажми категорию.':'Выбери слово.'} Распределено ${D.words.filter(w=>v[w]).length} из 16.</p><div class="grid">${['A','B'].map((c,i)=>`<section class="category"><h3>${c} · ${i?'Negative':'Positive'} feelings</h3>${button('Поместить сюда','category',c,false,word?'':'disabled')}<div class="bank">${D.words.filter(w=>v[w]===c).map(w=>button(w,'word',w,word===w)).join('')}</div></section>`).join('')}</div><p>Категории обсуждаются с партнёром: объясни, что означает каждое чувство в выбранном контексте.</p>`;
 if(task===4)return `<p lang="en">For each photo, choose the adjective (a–c) that matches how the person is feeling.</p><p>Выбери по одному слову. После попытки можно сверить все четыре ответа с печатным ключом.</p><div class="grid">${D.quiz.map((opts,i)=>`<section class="quiz-card"><h3>Photo ${i+1}</h3><img src="media/sb9-eyes${i+1}.jpg" alt="Оригинальное фото глаз ${i+1}; рассмотри выражение" width="500" height="150"><div class="bank" role="group" aria-label="Ответ для фото ${i+1}">${opts.map((w,j)=>button(`${'abc'[j]} · ${w}`,'quiz',`${i}:${w}`,v[i]===w)).join('')}</div><p class="status" data-result="${r.results[i]||''}">${({correct:'Верно',incorrect:'Попробуй другой вариант',blank:'Выбери слово'}[r.results[i]])||''}</p>${r.reveal?`<p>Ключ ${i+1}: <b>${'abc'[opts.indexOf(D.key[i])]} · ${D.key[i]}</b></p>`:''}</section>`).join('')}</div>`;
 return `<p>Нажми на хештег с пропуском, затем на слово из банка. В первом сообщении уже есть пример. У остальных сообщений возможны разные ответы — сравни и объясни их партнёру.</p>${D.tweets.map(([name,text],i)=>`<article class="tweet ${i?'':'example'} ${i===gap?'active':''}"><b>${i+1} · ${name}</b><p lang="en">${esc(text)}</p>${i?button('#'+(v[i]||'_____'),'gap',i,gap===i,`aria-label="Хештег ${i+1}: ${esc(v[i]||'выбери слово')}"`):'<b lang="en">#envious</b> <small>— пример</small>'}</article>`).join('')}<p>Выбрано сообщение ${gap+1}.</p><div class="bank" role="group" aria-label="Слова для хештега">${D.words.map(w=>button(w,'hashtag',w,v[gap]===w)).join('')}</div>${glossary()}`;
}
function render(){
 const active=document.activeElement,action=active?.dataset.action,value=active?.dataset.value;
 const r=record();$('#task').value=task;$('#prev').disabled=task===1;$('#next').disabled=task===5;
 $('#heading').textContent=`${task}. ${D.titles[task-1]}`;$('#original').textContent=D.instructions[task-1];
 $('#recording').hidden=task!==2;$('#activity').innerHTML=activity(r);$('#notes').value=r.notes;
 $('#complete').textContent=task===4?'Проверить':r.done?'Обсуждение завершено ✓':'Отметить: обсудили задание';
 $('#retry').hidden=task!==4||!r.results.length;$('#reveal').hidden=task!==4||r.results.length!==4||r.results.includes('blank')||r.reveal;
 $('#undo').hidden=!r.undo;$('#feedback').textContent=r.feedback||(r.done?(task===4?'Все четыре ответа верны.':'Отметка сохранена. Автоматическая оценка не выставляется.'):'');
 if(action){const next=[...$('#activity').querySelectorAll('[data-action]')].find(b=>b.dataset.action===action&&b.dataset.value===value);next?.focus({preventScroll:true});}
}
function change(fn){if(!loaded)return;const r=record();fn(r.values);r.results=[];r.done=false;r.reveal=false;r.feedback='';save(r);render();}
$('#activity').addEventListener('click',event=>{
 const b=event.target.closest('button[data-action]');if(!b||!loaded)return;const v=b.dataset.value,a=b.dataset.action;
 if(a==='photo'){target=v;render();return;}if(a==='word'){word=v;render();return;}if(a==='gap'){gap=Number(v);render();return;}
 if(a==='spoken')change(r=>r[v]=!r[v]);
 if(a==='feeling')change(r=>{const items=new Set(r[target]||[]);items.has(v)?items.delete(v):items.add(v);r[target]=[...items];});
 if(a==='category'&&word){const selected=word;word=null;change(r=>r[selected]=v);$('#activity').querySelector('[data-action="word"]')?.focus({preventScroll:true});}
 if(a==='quiz'){const [i,w]=v.split(':');change(r=>r[i]=w);}
 if(a==='hashtag')change(r=>r[gap]=v);
});
function navigate(n){if(!loaded)return;const player=$('audio');player.pause();task=n;target='A';word=null;gap=1;history.replaceState(null,'','#'+n);render();$('#heading').focus();}
$('#prev').onclick=()=>navigate(task-1);$('#next').onclick=()=>navigate(task+1);$('#task').onchange=e=>navigate(Number(e.target.value));
$('#notes').oninput=e=>{if(loaded){const r=record();r.notes=e.target.value;save(r);}};
$('#complete').onclick=()=>{if(!loaded)return;const r=record();if(task===4){r.results=D.grade(r.values);r.done=r.results.every(s=>s==='correct');r.feedback=`Верно: ${r.results.filter(s=>s==='correct').length} из 4.${r.results.includes('blank')?' Выбери слова во всех четырёх пунктах.':''}`;}else{r.done=D.ready(task,r.values);r.feedback=r.done?'Обсуждение отмечено. Это не автоматическая оценка.':task===1?'Сначала обсуди и отметь все четыре фотографии.':task===3?'Распредели все 16 слов и обсуди свой выбор.':'Выбери слова для пяти пропусков и обсуди варианты.';}save(r);render();};
$('#retry').onclick=()=>{const r=record();r.results=[];r.reveal=false;r.done=false;r.feedback='Можно изменить ответы и проверить снова.';save(r);render();};
$('#reveal').onclick=()=>{const r=record();if(task!==4||r.results.length!==4||r.results.includes('blank'))return;r.reveal=true;save(r);render();};
$('#reset').onclick=()=>{if(!loaded)return;const r=record();delete r.undo;save({...D.empty(),undo:r,feedback:'Задание сброшено. Предыдущий ответ можно вернуть.'});word=null;render();};
$('#undo').onclick=()=>{const r=record();if(r.undo){save(r.undo);render();}};
$('audio').addEventListener('error',()=>$('#audioError').hidden=false);
window.addEventListener('pagehide',()=>store.flush());
CourseWorkUI.bind(store);CourseWorkUI.mount();
store.start().then(()=>{loaded=true;$('#lesson').setAttribute('aria-busy','false');render();}).catch(()=>{$('#saved').textContent='Не удалось загрузить ответы. Обнови страницу.';});
})();
