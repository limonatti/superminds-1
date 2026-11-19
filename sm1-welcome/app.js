(function(){
'use strict';
const D=window.SM1Welcome,$=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const first=Number(location.hash.slice(1));
let task=Number.isInteger(first)&&first>=1&&first<=5?first:1,hero=null,gap=null,question=0,loaded=false,track=null;
const spec=()=>D.tasks[task-1],record=()=>({...D.empty(),...(store.records[spec().id]||{})});
const store=new CourseWorkStore({course:'sm1',onStatus:m=>$('#saved').textContent=m,onAccountChange:()=>CourseWorkUI.accountChanged(),onChange(_r,c){if(loaded&&(c?.remote||c?.account))render();}});
const save=r=>store.set(spec().id,{...r,book:'sb',unit:'welcome',page:spec().page,exercise:spec().exercise,format:spec().format,requiredTextFields:0});
const btn=(text,action,value,pressed=false,extra='')=>`<button type="button" data-action="${action}" data-value="${esc(value)}" aria-pressed="${pressed}" ${extra}>${esc(text)}</button>`;
const portrait=h=>`<img src="media/${h.toLowerCase()}.jpg" alt="${h}" width="440" height="580">`;
function activity(r){const v=r.values;
 if(task===1||task===2){const order=task===1?D.heroes:['Whisper','Thunder','Flash','Misty'];return `${task===1?'<img class="source-context friends" src="media/friends-context.jpg" alt="Герои знакомятся в школе — рисунок из задания 1">':''}<div class="hero-grid" role="group" aria-label="Выбрать героя">${order.map(h=>`<button type="button" data-action="hero" data-value="${h}" aria-pressed="${hero===h}">${portrait(h)}<b>${task===1?D.heroes.indexOf(h)+1+'. ':''}${h}</b><small>${v[h]?'✓ Повторили':'Выбрать героя'}</small></button>`).join('')}</div>${hero?`<section class="prompt"><h3>${hero}</h3><p lang="en" class="chant">${task===1?'Hi, I’m '+hero+'.':D.chant[hero].map(esc).join('\n')}</p>${btn(v[hero]?'✓ Повторили — снять отметку':'Отметить: повторили '+(task===1?'имя':'реплики'),'mark-hero',hero,!!v[hero])}</section>`:'<p>Выбери героя на карточке.</p>'}`;}
 if(task===3)return `<img class="source-context" src="media/numbers-context.jpg" alt="Дети с числами от 1 до 10 на футболках — рисунок из задания 1"><div class="number-grid" role="group" aria-label="Покажи число из записи">${D.words.map((w,i)=>`<button type="button" data-action="point" data-value="${i+1}" class="${v[i+1]?'visited':''}" aria-label="${i+1}, ${w}${v[i+1]?', уже показали':''}"><b>${i+1}</b><small lang="en">${w}</small><small>${v[i+1]?'✓':'\u00a0'}</small></button>`).join('')}</div><p role="status">${v.last?'Ты показал: '+v.last+' — '+D.words[v.last-1]+'.':'Нажми на число, которое слышишь.'}</p>`;
 if(task===4)return `<div class="age-grid">${D.ageOrder.map((h,i)=>`<section class="age-card ${gap===i?'active':''}"><h3>${h}</h3>${portrait(h)}${btn('I’m '+(v[i]||'_____')+'.','gap',i,gap===i,`aria-label="${h}: ${esc(v[i]||'выбрать возраст')}"`)}<p class="status" data-result="${r.results[i]||''}">${({blank:'Выбери число',incorrect:'Послушай ещё раз',correct:'Верно'}[r.results[i]])||''}</p></section>`).join('')}</div><p id="gap-hint">${gap===null?'Сначала выбери пропуск под героем.':'Выбран пропуск: '+D.ageOrder[gap]+'. Теперь нажми число.'}</p><div class="bank" role="group" aria-label="Числа для пропуска">${D.words.map((_,i)=>btn(i+1,'age',i+1,gap!==null&&D.normalize(v[gap])===i+1,gap===null?'disabled':'')).join('')}${btn('Убрать число','clear','',false,gap===null||!v[gap]?'disabled':'')}</div>`;
 return `<div class="tabs" role="group" aria-label="Выбрать вопрос">${D.questions.map((q,i)=>btn((i+1)+'. '+q.question,'question',i,question===i)).join('')}</div><section class="prompt"><p lang="en" class="question">${D.questions[question].question}</p><details><summary>Пример из учебника</summary><p lang="en">${D.questions[question].model}</p><p>Это ответ Карлоса. Расскажи о себе.</p></details><p lang="en">${D.questions[question].cue}</p><div class="bank">${btn(v['ask'+question]?'✓ Задал вопрос':'Я задал вопрос','personal','ask'+question,!!v['ask'+question])}${btn(v['answer'+question]?'✓ Ответил о себе':'Я ответил о себе','personal','answer'+question,!!v['answer'+question])}</div></section><p>Вопросы обсуждены: ${D.questions.filter((_,i)=>v['ask'+i]&&v['answer'+i]).length} из 2. Здесь нет единственного правильного ответа.</p>`;
}
function render(){
 const active=document.activeElement,a=active?.dataset.action,value=active?.dataset.value,r=record(),s=spec();
 $('#task').value=task;$('#prev').disabled=task===1;$('#next').disabled=task===5;
 $('#heading').textContent=`Стр. ${s.page} · ${s.exercise}. ${s.title}`;$('#original').textContent=s.original;$('#instruction').textContent=s.instruction;
 $('#recording').hidden=!s.track;
 if(track!==s.track){$('#audio').pause();track=s.track;$('#transcript').open=false;$('#audio-error').hidden=true;if(track){$('#audio').src='media/'+track+'.mp3';$('#audio').setAttribute('aria-label','Оригинальная запись '+track);$('#audio-label').textContent='Запись '+track;$('#audio-link').href='media/'+track+'.mp3';$('.transcript').innerHTML=SM1Transcripts[track].map(line=>`<p>${esc(line)}</p>`).join('');}else $('#audio').removeAttribute('src');}
 const gated=task===4&&(r.results.length!==4||r.results.includes('blank'));
 $('#transcript').hidden=gated;$('#transcript-help').hidden=!gated;if(gated)$('#transcript').open=false;
 $('#activity').innerHTML=activity(r);$('#notes').value=r.notes;$('#complete').textContent=task===4?'Проверить':r.done?'Задание отмечено ✓':'Отметить: закончили';$('#retry').hidden=task!==4||!r.results.length;$('#undo').hidden=!r.undo;$('#feedback').textContent=r.feedback;
 if(a)[...$('#activity').querySelectorAll('[data-action]')].find(b=>b.dataset.action===a&&b.dataset.value===value)?.focus({preventScroll:true});
}
function change(fn){if(!loaded)return;const r=record();fn(r.values);r.results=[];r.done=false;r.feedback='';save(r);render();}
$('#activity').onclick=e=>{const b=e.target.closest('[data-action]');if(!b||!loaded)return;const a=b.dataset.action,v=b.dataset.value;
 if(a==='hero'){hero=v;render();}else if(a==='gap'){gap=Number(v);render();}else if(a==='question'){question=Number(v);render();}
 else if(a==='mark-hero'||a==='personal')change(x=>x[v]=!x[v]);
 else if(a==='point')change(x=>{x[v]=true;x.last=Number(v);});
 else if(a==='age'&&gap!==null)change(x=>x[gap]=v);
 else if(a==='clear'&&gap!==null)change(x=>delete x[gap]);
};
function navigate(n){if(!loaded||n<1||n>5||!Number.isInteger(n))return;$('#audio').pause();task=n;hero=null;gap=null;question=0;history.replaceState(null,'','#'+n);render();$('#heading').focus();}
$('#prev').onclick=()=>navigate(task-1);$('#next').onclick=()=>navigate(task+1);$('#task').onchange=e=>navigate(Number(e.target.value));
$('#notes').oninput=e=>{if(loaded){const r=record();r.notes=e.target.value;save(r);}};
$('#complete').onclick=()=>{if(!loaded)return;const r=record();if(task===4){r.results=D.grade(r.values);r.done=r.results.every(x=>x==='correct');r.feedback=r.done?'Все четыре ответа верны.':r.results.includes('blank')?'Выбери возраст для каждого героя.':'Послушай запись ещё раз и проверь отмеченные ответы.';}else{r.done=D.ready(task,r.values);r.feedback=r.done?'Отметки сохранены. Можно продолжать.':task<=2?'Повтори и отметь всех четырёх героев.':task===3?'Послушай запись и покажи все десять чисел.':'Задай оба вопроса и ответь о себе, затем отметь их.';}save(r);render();};
$('#retry').onclick=()=>{if(!loaded)return;const r=record();r.results=[];r.done=false;r.feedback='Можно изменить ответы и проверить снова.';save(r);render();};
$('#reset').onclick=()=>{if(!loaded)return;const r=record();delete r.undo;save({...D.empty(),undo:r,feedback:'Задание сброшено. Предыдущий ответ можно вернуть.'});hero=null;gap=null;render();};
$('#undo').onclick=()=>{if(loaded&&record().undo){save(record().undo);render();}};
$('#rewind').onclick=()=>{$('#audio').pause();$('#audio').currentTime=0;};
$('#audio').addEventListener('error',()=>{if(track)$('#audio-error').hidden=false;});
window.addEventListener('pagehide',()=>store.flush());CourseWorkUI.bind(store);CourseWorkUI.mount();
store.start().then(()=>{loaded=true;$('#lesson').setAttribute('aria-busy','false');render();}).catch(()=>$('#saved').textContent='Не удалось загрузить ответы. Обнови страницу.');
})();
