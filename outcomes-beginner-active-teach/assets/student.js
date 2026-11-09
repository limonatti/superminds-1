/* Student answers belong to the signed-in account, independently of teacher ink. */
(()=>{
 const COURSE='outcomes-beginner', bank=window.OUTCOMES_EXERCISES||{};
 let shownRecord='',workStore=null, user=null, ready=false, answers={}, dirty={}, timer, busy=false, active=null, enabled=true, role='student', checked=false, revealed=false, exerciseTrigger=null, exerciseZoom=1, fullSource=false;
 const status=s=>document.getElementById('courseworkStatus').textContent=s;
 const key=()=>`outcomes-work-v1:${user?.id||'guest'}`;
 const pageTasks=()=>bank[pageKey()]||[];
 const parse=s=>{try{return JSON.parse(s)||{}}catch{return {}}};
 function localSave(){workStore.capture(answers);answers=workStore.records;if(active)shownRecord=JSON.stringify(answers[active.id]||{});return workStore.localOK}
 function renderTasks(){
  const list=pageTasks(), visible=enabled&&['sb','wb','grammar'].includes(S.book);
  $('#wordCards').href=`../trainer.html?course=outcomes-beginner&unit=outc-u${S.unit||S.lastUnit||1}&mode=flash`;
  $('#exerciseHotspots').hidden=!visible;
  $('#exerciseHotspots').innerHTML=visible?list.map(e=>`<button class="exercisePin ${OutcomesGrader.isComplete(e.check,answers[e.id])?'done':''}" data-exercise="${e.id}" style="left:${(e.x+.005)*100}%;top:${e.y*100}%" aria-label="Открыть упражнение ${e.n}${OutcomesGrader.isComplete(e.check,answers[e.id])?', выполнено':''}">${e.n}${OutcomesGrader.isComplete(e.check,answers[e.id])?' ✓':''}</button>`).join(''):'';
  window.ExerciseSource.regions($('#exerciseHotspots'),list.map(e=>window.OUTCOMES_INTERACTIONS?.[e.id]?.box));
  $('#exerciseList').hidden=!visible;
  $('#exerciseList').innerHTML=visible?`<h3>Задания страницы</h3><p class="exerciseHelp">Нажмите на упражнение на странице или выберите задание ниже.</p>${list.length?list.map(e=>`<button data-exercise="${e.id}" class="exerciseRow"><span>№ ${e.n}</span><span>${esc(e.instruction)}</span><small>${workLabel(e)}</small></button>`).join(''):'<p>На этой странице нет упражнений.</p>'}<button id="workDownload">Скачать мои ответы</button>`:'';
  $$('[data-exercise]').forEach(b=>b.onclick=()=>openTask(list.find(e=>e.id===b.dataset.exercise)));
  if($('#workDownload'))$('#workDownload').onclick=download;
 }
 function download(){const blob=new Blob([JSON.stringify({course:COURSE,answers},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='outcomes-my-answers.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 function workLabel(e){const r=answers[e.id];if(r?.grade?.revision===e.check?.revision&&r.grade.total)return `${r.grade.correct}/${r.grade.total} верно`;return OutcomesGrader.isComplete(e.check,r)?'Выполнено':r?'Черновик':e.check?.mode==='items'?'Проверить':'Открыть'}
 function responseFields(e,record){
  if(e.responseMode==='oral')return record.values?.some(v=>String(v).trim())?`<details class="previousResponses"><summary>Мои прежние записи</summary><ol>${record.values.map(v=>`<li>${esc(v)}</li>`).join('')}</ol></details>`:'';
  const fields=e.check?.mode==='items'?e.check.items:Array.from({length:Math.max(e.count,record.values?.length||0)},(_,i)=>({label:i+1})),ui=OutcomesInteractions.spec(e,window.OUTCOMES_INTERACTIONS?.[e.id]);
  return fields.map((field,i)=>{const f=ui[i]||{kind:'text'},value=record.values?.[i]||'',long=e.kind==='writing'||field.self||field.soft||field.match==='set';return `<div class="responseField" id="response-${i}" data-interaction="${f.kind}"><label for="answer-${i}">${esc(field.label||i+1)}${f.kind==='order'?' · Соберите предложение':f.kind==='match'?' · Найдите соответствие':''}</label>${f.prompt?`<p class="printedPrompt">${esc(f.prompt)}</p>`:''}${f.kind==='order'?`<div class="sentenceSlots" data-drop="${i}" data-sentence="${i}" role="group" aria-label="Предложение ${esc(field.label)}"></div><div class="wordPool" data-word-pool="${i}" role="group" aria-label="Слова для предложения ${esc(field.label)}"></div>`:''}${f.options?`<div class="exerciseChoices" role="group" aria-label="Варианты ответа ${esc(field.label)}">${f.options.map(o=>`<button type="button" data-choice="${esc(o.value)}" data-for="${i}" draggable="${f.kind==='match'||f.kind==='bank'}" aria-pressed="false">${esc(o.label)}</button>`).join('')}</div>`:''}${long?`<textarea id="answer-${i}" data-response="${i}" aria-label="Ответ ${esc(field.label)}" aria-describedby="feedback-${i}" rows="${e.kind==='writing'?5:2}" maxlength="10000">${esc(value)}</textarea>`:`<input type="${f.kind==='choice'||f.kind==='multi'?'hidden':'text'}" id="answer-${i}" data-response="${i}" data-drop="${i}" aria-label="Ответ ${esc(field.label)}" aria-describedby="feedback-${i}" value="${esc(value)}" autocomplete="off" spellcheck="false" maxlength="10000">`}<small id="feedback-${i}" class="answerFeedback"></small></div>`}).join('');
 }
 function cropExercise(){
  window.ExerciseSource.change($('.exerciseSource'),{zoom:exerciseZoom,full:fullSource});
  if(!active)return;const img=$('#exerciseImage');if(!img?.naturalWidth)return;
  const box=fullSource?[0,0,1,1]:window.OUTCOMES_INTERACTIONS?.[active.id]?.box||[0,0,1,1];
  const [x,y,w,h]=box,frame=$('#exerciseCrop'),width=frame.parentElement.clientWidth*exerciseZoom,full=width/w,height=full*img.naturalHeight/img.naturalWidth;
  Object.assign(frame.style,{width:width+'px',height:height*h+'px'});Object.assign(img.style,{width:full+'px',left:-full*x+'px',top:-height*y+'px'});
  $('#taskZoomReset').textContent=Math.round(exerciseZoom*100)+'%';$('#taskFullPage').textContent=fullSource?'Только задание':'Вся страница';$('#taskFullPage').setAttribute('aria-pressed',fullSource);
 }
 function navigateTask(delta){const tasks=pageTasks(),i=tasks.findIndex(e=>e.id===active?.id);if(tasks[i+delta]){saveDraft();openTask(tasks[i+delta])}}
 function openTask(e){
  if(!ready){toast('Дождитесь загрузки ответов.');return}if(!e)return;shownRecord=JSON.stringify(answers[e.id]||{});
  if(!$('#modal').open)exerciseTrigger=document.activeElement;$$('audio').forEach(a=>a.pause());exerciseZoom=1;fullSource=false;active=e;const p=current(),record=answers[e.id]||{values:[],done:false},auto=e.check?.mode==='items',oral=e.responseMode==='oral';
  checked=Boolean(record.grade&&record.grade.revision===e.check?.revision);revealed=false;
  const tracks=D.media.filter(m=>m.book===source()&&(Array.isArray(e.audioTracks)?e.audioTracks.map(String).includes(String(m.track)):/listen/i.test(e.instruction)&&m.pages.includes(p.page)));
  const kinds=new Set(OutcomesInteractions.spec(e,window.OUTCOMES_INTERACTIONS?.[e.id]).map(f=>f.kind));
  const interactionHelp=kinds.has('order')?'Нажимайте или перетаскивайте слова, чтобы собрать предложение. Нажмите слово в ответе, чтобы убрать его. ':kinds.has('match')||kinds.has('bank')?'Нажимайте на варианты или перетаскивайте их в поле ответа. ':kinds.has('choice')||kinds.has('multi')?'Выберите ответ кнопкой и нажмите «Проверить ответы». ':'';
  const help=oral?e.check.note:interactionHelp+(auto?(e.check.note||'Заполните ответы и нажмите «Проверить».'):"У этого задания нет единственного правильного ответа. Запишите свой вариант и откройте самопроверку.");
  openModal(`${names[S.book]} · стр. ${p.page} · № ${e.n}`,`<nav class="exerciseTools" aria-label="Управление упражнением"><button id="taskPrev" ${pageTasks()[0]?.id===e.id?'disabled':''}>← Предыдущее</button><button id="taskNext" ${pageTasks().at(-1)?.id===e.id?'disabled':''}>Следующее →</button><button id="taskZoomOut" aria-label="Уменьшить задание">−</button><button id="taskZoomReset">100%</button><button id="taskZoomIn" aria-label="Увеличить задание">+</button><button id="taskFullPage" aria-pressed="false">Вся страница</button><button id="taskCurtain" aria-pressed="false">Скрыть задание</button></nav><div class="exerciseDialog"><section class="exerciseSource"><div id="exerciseCrop"><img id="exerciseImage" src="${p.image}" alt="${esc(names[S.book])}, страница ${p.page}, упражнение ${e.n}"></div><button id="taskUncover" hidden>Открыть задание</button></section><section class="responsePanel"><div class="checkType">${oral?'Без письменного ответа':auto?'Практика с проверкой':'Свободный ответ · самопроверка'}</div><h3>${esc(e.instruction)}</h3><p>${esc(help)}</p>${e.check?.items?.some(f=>f.soft)?'<p class="openAnswerNote">В ответах на вопросы возможны другие формулировки. Их можно сравнить с образцом; несовпадение не считается ошибкой.</p>':''}${tracks.map(m=>`<label>Аудио ${esc(m.track)}<audio class="taskAudio" controls preload="none" src="${m.path}"></audio></label>`).join('')}<div id="responseFields">${responseFields(e,record)}</div>${auto||oral?'':'<button id="addResponse">+ Ещё ответ</button>'}<div class="checkActions"><button id="checkTask" ${oral?'hidden':''}>${auto?'Проверить ответы':'Самопроверка'}</button>${auto?'<button id="revealAnswers" hidden>Показать ответы</button>':''}<p id="checkSummary" class="checkSummary" role="status" aria-live="polite"></p></div><div id="selfCheck" hidden></div><label class="workDone" ${auto&&!e.check.items.some(f=>f.soft)?'hidden':''}><input type="checkbox" id="workDone" ${OutcomesGrader.isComplete(e.check,record)?'checked':''}> ${auto?'Я также проверил(а) свободные ответы':'Я выполнил(а) задание и проверил(а) себя'}</label><p id="taskSaveStatus" role="status"></p><button id="saveTask">Сохранить и закрыть</button></section></div>`);
  window.ExerciseSource.columns($('#modal'),$('.exerciseDialog'),$('.exerciseSource'),$('.responsePanel'));window.ExerciseSource.mount($('.exerciseSource'),e.id);$('#exerciseImage').onload=cropExercise;cropExercise();
  $('#taskPrev').onclick=()=>navigateTask(-1);$('#taskNext').onclick=()=>navigateTask(1);
  $('#taskFullPage').onclick=()=>{fullSource=!fullSource;cropExercise()};
  $('#taskZoomIn').onclick=()=>{exerciseZoom=Math.min(3,exerciseZoom+.25);cropExercise()};$('#taskZoomOut').onclick=()=>{exerciseZoom=Math.max(.5,exerciseZoom-.25);cropExercise()};$('#taskZoomReset').onclick=()=>{exerciseZoom=1;cropExercise()};
  const curtain=on=>{$('.focus-document').style.visibility=on?'hidden':'';$('#exerciseCrop').style.visibility=on?'hidden':'';$('#taskUncover').hidden=!on;$('#taskCurtain').setAttribute('aria-pressed',on)};
  $('#taskCurtain').onclick=()=>curtain($('#taskUncover').hidden);$('#taskUncover').onclick=()=>curtain(false);
  $$('.taskAudio').forEach(a=>{const controls=document.createElement('div');controls.className='taskAudioTools';controls.innerHTML='<label>Скорость <select aria-label="Скорость аудио"><option value=".75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option></select></label><button type="button" aria-pressed="false">Повтор</button>';a.after(controls);controls.querySelector('select').onchange=ev=>a.playbackRate=Number(ev.target.value);controls.querySelector('button').onclick=ev=>{a.loop=!a.loop;ev.target.setAttribute('aria-pressed',a.loop)};a.onplay=()=>$$('audio').forEach(other=>{if(other!==a)other.pause()})});
  bindResponses();$('#workDone').onchange=()=>saveDraft();
  if($('#addResponse'))$('#addResponse').onclick=()=>{saveDraft();const r=answers[e.id];r.values.push('');$('#responseFields').innerHTML=responseFields(e,r);bindResponses()};
  $('#checkTask').onclick=checkTask;
  if($('#revealAnswers'))$('#revealAnswers').onclick=()=>{revealed=!revealed;checkTask()};
  $('#saveTask').onclick=async()=>{saveDraft();const saved=await flush();if(saved?.ok||!user)$('#modal').close()};
  if(checked)renderFeedback(OutcomesGrader.check(e.check,record.values));
  liveView();renderLiveAnswers();
  const playUI=OutcomesInteractions.spec(e,window.OUTCOMES_INTERACTIONS?.[e.id]);window.ExercisePlay.attach({dialog:$('#modal'),source:$('.exerciseSource'),responses:$('.responsePanel'),id:e.id,text:e.instruction,native:oral,fields:(e.check?.mode==='items'?e.check.items:[]).map((f,i)=>window.ExercisePlay.inputField(String(f.label||i+1),$(`[data-response="${i}"]`),f.soft||f.self?[]:[f.key],playUI[i]?.options,$(`#response-${i}`),{kind:f.match==='set'?'set':playUI[i]?.kind,count:f.match==='set'?OutcomesGrader.variants(f.key)[0]?.split(/[,;\n]+/).length:undefined,tokens:playUI[i]?.tokens}))});
  $('#modalTitle').tabIndex=-1;$('#modalTitle').focus({preventScroll:true});
 }
 let skipDragClick=false;
 document.addEventListener('click',ev=>{if(skipDragClick){ev.preventDefault();ev.stopImmediatePropagation();skipDragClick=false}},true);
 function bindDrag(button,value,append){
  button.draggable=false;button.style.touchAction='none';
  button.onpointerdown=ev=>{
   if(ev.button!==0||button.disabled)return;const start=[ev.clientX,ev.clientY],task=active.id,index=+button.dataset.for;let moved=false,ghost=null;
   button.setPointerCapture(ev.pointerId);
   const clean=()=>{ghost?.remove();button.onpointermove=null;button.onpointerup=null;button.onpointercancel=null};
   button.onpointermove=move=>{if(Math.hypot(move.clientX-start[0],move.clientY-start[1])<6&&!moved)return;moved=true;move.preventDefault();if(!ghost){ghost=document.createElement('div');ghost.className='exerciseDragGhost';ghost.textContent=value;$('#modal').append(ghost)}ghost.style.left=move.clientX+12+'px';ghost.style.top=move.clientY+12+'px'};
   button.onpointerup=up=>{const target=document.elementFromPoint(up.clientX,up.clientY)?.closest('[data-drop]');if(button.hasPointerCapture(up.pointerId))button.releasePointerCapture(up.pointerId);clean();if(!moved)return;skipDragClick=true;setTimeout(()=>skipDragClick=false,0);if(active?.id===task&&target&&+target.dataset.drop===index)applyChoice(index,value,append)};
   button.onpointercancel=clean;
  };
 }
 function refreshWidgets(){
  if(!active)return;const ui=OutcomesInteractions.spec(active,window.OUTCOMES_INTERACTIONS?.[active.id]);
  $$('[data-choice]').forEach(b=>{const i=+b.dataset.for,value=$(`[data-response="${i}"]`).value;b.setAttribute('aria-pressed',ui[i]?.kind==='multi'?value.split(/,\s*/).includes(b.dataset.choice):OutcomesGrader.normalize(value)===OutcomesGrader.normalize(b.dataset.choice))});
  ui.forEach((f,i)=>{if(f.kind!=='order')return;const input=$(`[data-response="${i}"]`),words=input.value.trim()?input.value.trim().split(/\s+/):[],remaining=[...words];
   $(`[data-sentence="${i}"]`).innerHTML=words.length?words.map((w,j)=>`<button type="button" data-remove="${j}" data-for="${i}" aria-label="Убрать слово ${esc(w)}">${esc(w)}</button>`).join(''):'<span>Нажимайте или перетаскивайте слова сюда</span>';
   $(`[data-word-pool="${i}"]`).innerHTML=OutcomesInteractions.shuffled(f.tokens,active.id+':'+i).map(t=>{const j=remaining.findIndex(w=>OutcomesInteractions.norm(w)===OutcomesInteractions.norm(t.text)),used=j>=0;if(used)remaining.splice(j,1);return `<button type="button" data-token="${esc(t.text)}" data-for="${i}" draggable="true" ${used?'disabled':''}>${esc(t.text)}</button>`}).join('');
  });
  $$('[data-token]').forEach(b=>{b.onclick=()=>applyChoice(+b.dataset.for,b.dataset.token,true);bindDrag(b,b.dataset.token,true)});
  $$('[data-remove]').forEach(b=>b.onclick=()=>{const i=+b.dataset.for,input=$(`[data-response="${i}"]`),words=input.value.trim().split(/\s+/);words.splice(+b.dataset.remove,1);input.value=words.join(' ');saveDraft();refreshWidgets();if(checked)checkTask();($(`[data-sentence="${i}"] button`)||$(`[data-word-pool="${i}"] button:not(:disabled)`)||input).focus({preventScroll:true})});
 }
 function applyChoice(i,value,append=false){const input=$(`[data-response="${i}"]`),ui=OutcomesInteractions.spec(active,window.OUTCOMES_INTERACTIONS?.[active.id])[i];
  if(ui?.kind==='multi'){const selected=input.value?input.value.split(/,\s*/):[];input.value=(selected.includes(value)?selected.filter(v=>v!==value):[...selected,value]).join(', ')}else input.value=append?[input.value.trim(),value].filter(Boolean).join(' '):value;
  saveDraft();refreshWidgets();if(checked)checkTask();if(append)($(`[data-word-pool="${i}"] button:not(:disabled)`)||input).focus({preventScroll:true});
 }
 function bindResponses(){
  $$('[data-response]').forEach(el=>{el.oninput=()=>{saveDraft();refreshWidgets()};el.onblur=()=>{if(checked&&active?.check?.mode==='items')checkTask()}});
  $$('[data-choice]').forEach(b=>{b.onclick=()=>applyChoice(+b.dataset.for,b.dataset.choice);if(b.getAttribute('draggable')==='true')bindDrag(b,b.dataset.choice,false)});
  $$('[data-drop]').forEach(el=>{el.ondragover=ev=>{if([...ev.dataTransfer.types].includes('application/x-outcomes'))ev.preventDefault()};el.ondrop=ev=>{ev.preventDefault();try{const d=JSON.parse(ev.dataTransfer.getData('application/x-outcomes'));if(d.id!==active.id||d.index!==+el.dataset.drop||typeof d.value!=='string')return;applyChoice(d.index,d.value,d.append)}catch{}}});
  refreshWidgets();
 }
 function keyText(field){if(field.self)return 'Ответ зависит от вас. Проверьте его по примеру на странице.';return Array.isArray(field.key)?field.key.join(' / '):field.key}
 function renderFeedback(grade){
  if(!active)return;
  grade.items.forEach((result,i)=>{const field=active.check.items[i],box=$(`#response-${i}`),input=box.querySelector('[data-response]'),feedback=$(`#feedback-${i}`);box.dataset.result=result;input.setAttribute('aria-invalid',result==='incorrect'?'true':'false');feedback.innerHTML=({correct:'✓ Верно',incorrect:'✕ Есть ошибка — попробуйте ещё раз',blank:'Заполните этот пункт',review:'Сравните свою формулировку с образцом'})[result]+((revealed||result==='review')?`<span class="answerKey">${field.self?'Самопроверка':field.soft?'Образец':'Ответ'}: ${esc(keyText(field))}</span>`:'')});
  const blanks=grade.items.filter(v=>v==='blank').length,wrong=grade.items.filter(v=>v==='incorrect').length;
  $('#checkSummary').textContent=grade.total?`${grade.correct} из ${grade.total} верно.${blanks?' Не заполнено: '+blanks+'.':''}${wrong?' Исправьте отмеченные пункты.':''}${grade.needsReview?' Свободные ответы сравните с образцом.':''}${grade.complete?' Всё верно!':''}`:'Сравните ответы с образцами. Другие верные формулировки тоже возможны.';
  $('#revealAnswers').hidden=grade.items.some(v=>v==='blank');$('#revealAnswers').textContent=revealed?'Скрыть ответы':'Показать ответы';
  if(active.check.model&&revealed){$('#selfCheck').hidden=false;$('#selfCheck').innerHTML=`<h4>Пояснение к ключу</h4><p class="modelAnswer">${esc(active.check.model)}</p>`}
 }
 function checkTask(){
  if(!active)return;
  if(active.check?.mode!=='items'){
   if(!$$('[data-response]').some(el=>el.value.trim())){$('#checkSummary').textContent='Сначала запишите свой ответ.';return;}
   $('#selfCheck').hidden=false;$('#selfCheck').innerHTML=`${active.check?.model?`<h4>Образец для сравнения</h4><p class="modelAnswer">${esc(active.check.model)}</p>`:''}<h4>Проверьте себя</h4><ul><li>Ответили на все части задания?</li><li>Использовали слова и грамматику из примера на странице?</li><li>Проверили порядок слов, форму глагола и написание?</li>${/listen|repeat|practise|conversation/i.test(active.instruction)?'<li>Произнесли ответ вслух и сравнили с записью или примером?</li>':''}</ul><p>Это самопроверка. Автоматический балл за свободный ответ не выставляется.</p>`;$('#selfCheck').scrollIntoView({block:'nearest'});saveDraft();return;
  }
  checked=true;const grade={...OutcomesGrader.check(active.check,$$('[data-response]').map(el=>el.value)),revision:active.check.revision,checkedAt:Date.now(),revealed:revealed||Boolean(answers[active.id]?.assisted||answers[active.id]?.grade?.revealed)};
  renderFeedback(grade);saveDraft(grade);
 }
 function saveDraft(newGrade){
  if(!active||!ready||!$('#workDone'))return;
  const previous=answers[active.id]||{},values=active.responseMode==='oral'?(previous.values||[]):$$('[data-response]').map(el=>el.value),changed=JSON.stringify(values)!==JSON.stringify(previous.values||[]),auto=active.check?.mode==='items';
  const grade=newGrade?.mode?newGrade:(!changed&&previous.grade?.revision===active.check?.revision?previous.grade:null);
  const done=auto?(Boolean(grade)&&grade.correct===grade.total&&!grade.items.includes('blank')&&(!active.check.items.some(f=>f.soft)||$('#workDone').checked)):$('#workDone').checked;
  const record={...previous,book:active.book||source(),page:active.page||current().page,unit:active.unit||S.unit,exercise:active.n,values,done,grade,assisted:Boolean(previous.assisted||previous.grade?.revealed||grade?.revealed),updatedAt:Date.now()};
  if(previous.values?.length>values.length&&!previous.legacyValues)record.legacyValues=previous.values;
  if(changed&&!newGrade?.mode){revealed=false;if($('#revealAnswers'))$('#revealAnswers').hidden=true;$('#selfCheck').hidden=true;$$('.responseField').forEach(el=>{delete el.dataset.result;el.querySelector('[data-response]').removeAttribute('aria-invalid')});$$('.answerFeedback').forEach(el=>el.textContent='');if($('#checkSummary'))$('#checkSummary').textContent=checked?'Ответ изменён. Проверим после выхода из поля.':'';}
  liveAnswer(record);
  answers[active.id]=record;dirty[active.id]=record;const saved=localSave();renderTasks();if($('#taskSaveStatus'))$('#taskSaveStatus').textContent=saved?(user?'Сохранено на устройстве. Синхронизация…':'Сохранено в этом браузере. Войдите для сохранения в аккаунте.'):'Не удалось сохранить. Скачайте ответы.';clearTimeout(timer);timer=setTimeout(flush,900);
 }
 async function flush(){return workStore?.flush()}
 $('#exerciseToggle').onclick=()=>{enabled=!enabled;$('#exerciseToggle').setAttribute('aria-pressed',enabled);renderTasks()};
 window.addEventListener('outcomes-page',renderTasks);window.addEventListener('online',flush);
 $('#modal').addEventListener('close',()=>{$$('.taskAudio').forEach(a=>a.pause());const trigger=exerciseTrigger?.isConnected?exerciseTrigger:$$('[data-exercise]').find(b=>b.dataset.exercise===exerciseTrigger?.dataset.exercise);active=null;liveView();(trigger||$('#exerciseToggle')).focus({preventScroll:true})});
 window.addEventListener('resize',cropExercise);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush()});
 $('#keys').hidden=true;
 async function init(){
  workStore=new CourseWorkStore({course:COURSE,legacy(u){try{return parse(localStorage.getItem(`outcomes-work-v1:${u?.id||'guest'}`))}catch{return {}}},onStatus:t=>{status(t);if($('#taskSaveStatus'))$('#taskSaveStatus').textContent=t},onAccountChange:()=>CourseWorkUI.accountChanged(),onChange(rows,change){answers=rows;if(ready&&change.remote){renderTasks();if(active&&$('#modal').open&&shownRecord!==JSON.stringify(rows[active.id]||{}))openTask(active)}}});
  await workStore.start();user=workStore.user;answers=workStore.records;CourseWorkUI.bind(workStore,()=>{saveDraft();return flush()});
  try{if(user){const profile=await SM.myProfile();role=profile?.role||'student'}}catch{}
  $('#keys').hidden=!['teacher','admin'].includes(role);$('#notesTab').hidden=!['teacher','admin'].includes(role);
  if(!['teacher','admin'].includes(role))$('#resources').onclick=()=>{openModal('Материалы ученика',`<p>Student’s Book, Workbook и словарь доступны через вкладки. Нажимайте номера заданий, чтобы записывать ответы.</p><p>В комплекте Workbook ©2019 (ISBN 9780357042243). Название архива «3ed» не меняет издание книги.</p><a href="resources/workbook.pdf" target="_blank" rel="noopener">Workbook PDF</a> · <a href="resources/vocabulary.pdf" target="_blank" rel="noopener">Vocabulary Builder PDF</a>`)};
  ready=true;renderTasks();flush();liveSend({kind:"ready"});liveView();
 }
 // The room mediates transport; no student response is merged into the
 // teacher's coursework. Outside a room this adapter remains inactive.
 const liveRole=params.get('embedded')==='1'&&window.parent!==window?params.get('lessonRole'):null;
 let liveApplying=false,liveTimer,liveAnswerTimer,liveRemote=null,liveOnline=false;
 function liveSend(data){if(liveRole)parent.postMessage({type:'outcomes-lesson',...data},location.origin)}
 function liveView(){
  if(liveRole!=='t'||liveApplying||!ready)return;
  clearTimeout(liveTimer);liveTimer=setTimeout(()=>liveSend({kind:'view',book:S.book,page:S.id,exercise:active?.id||null}),80);
 }
 function liveAnswer(record){
  if(liveRole!=='s'||!active)return;
  const data={kind:'answers',exercise:active.id,values:record.values,checked:Boolean(record.grade),updatedAt:Date.now()};
  clearTimeout(liveAnswerTimer);liveAnswerTimer=setTimeout(()=>liveSend(data),120);
 }
 function renderLiveAnswers(){
  if(!liveRole||!active)return;
  let panel=$('#liveLessonAnswers');
  if(!panel){panel=document.createElement('section');panel.id='liveLessonAnswers';panel.className='liveLessonAnswers';$('.responsePanel').prepend(panel)}
  if(liveRole==='s'){panel.textContent=liveOnline?'Онлайн-урок · Учитель видит ваши ответы по мере ввода.':'Связь с уроком восстанавливается. Ответы сохраняются на устройстве.';return}
  const r=liveRemote?.exercise===active.id?liveRemote:null;
  panel.innerHTML='<h3>Ответы ученика · онлайн</h3><p>'+(!liveOnline?'Связь с уроком восстанавливается. Показаны последние полученные ответы.':r?'Обновляются по мере ввода.':'Ожидаем ответы ученика…')+'</p>';
  if(r){
   const grade=r.checked&&active.check?.mode==='items'?OutcomesGrader.check(active.check,r.values):null;
   const list=document.createElement('ol');
   r.values.forEach((value,i)=>{const li=document.createElement('li');li.textContent=(value||'—')+(grade?' · '+({correct:'✓ Верно',incorrect:'✕ Ошибка',blank:'Нет ответа',review:'Свободный ответ'}[grade.items[i]]||''):'');list.append(li)});panel.append(list);
  }
 }
 window.addEventListener('outcomes-page',()=>{if(active){saveDraft();active=null;$('#modal').close()}liveView()});
 window.addEventListener('message',ev=>{
  if(!liveRole||ev.origin!==location.origin||ev.source!==parent||ev.data?.type!=='outcomes-lesson')return;
  const d=ev.data;
  if(d.kind==='connection'){liveOnline=Boolean(d.online);renderLiveAnswers();return}
  if(d.kind==='snapshot'){if(active)liveAnswer(answers[active.id]||{values:[]});return}
  if(d.kind==='answers'&&liveRole==='t'){
   if(typeof d.exercise!=='string'||!Array.isArray(d.values)||d.values.length>200||d.values.some(v=>typeof v!=='string'||v.length>10000))return;
   liveRemote=d;renderLiveAnswers();return;
  }
  if(d.kind!=='view'||liveRole!=='s'||!ready||!names[d.book])return;
  const src=['grammar','reference'].includes(d.book)?'sb':d.book;
  if(!D.books[src]?.pages.some(p=>p.id===d.page))return;
  const task=(bank[src+':'+d.page]||[]).find(e=>e.id===d.exercise);
  if(d.exercise&&!task)return;
  if(S.book===d.book&&S.id===d.page&&active?.id===d.exercise){liveAnswer(answers[active.id]||{values:[]});return}
  liveApplying=true;
  try{
   saveDraft();S.book=d.book;S.id=d.page;
   // Avoid an asynchronous dialog close event wiping a newly opened task.
   active=null;render();
   if(task){openTask(task);liveAnswer(answers[task.id]||{values:[]})}
   else if($('#modal').open)$('#modal').close();
  }finally{liveApplying=false}
 });

 renderTasks();init();
})();
