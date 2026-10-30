/* Student answers belong to the signed-in account, independently of teacher ink. */
(()=>{
 const COURSE='outcomes-beginner', bank=window.OUTCOMES_EXERCISES||{};
 let user=null, ready=false, answers={}, dirty={}, timer, busy=false, active=null, enabled=true, role='student', checked=false, revealed=false;
 const status=s=>document.getElementById('courseworkStatus').textContent=s;
 const key=()=>`outcomes-work-v1:${user?.id||'guest'}`;
 const pageTasks=()=>bank[pageKey()]||[];
 const parse=s=>{try{return JSON.parse(s)||{}}catch{return {}}};
 function localSave(){try{localStorage.setItem(key(),JSON.stringify(answers));return true}catch{status('Не удалось сохранить на устройстве. Скачайте ответы.');return false}}
 function renderTasks(){
  const list=pageTasks(), visible=enabled&&['sb','wb','grammar'].includes(S.book);
  $('#wordCards').href=`../trainer.html?unit=outc-u${S.unit||S.lastUnit||1}&mode=flash`;
  $('#exerciseHotspots').hidden=!visible;
  $('#exerciseHotspots').innerHTML=visible?list.map(e=>`<button class="exercisePin ${answers[e.id]?.done?'done':''}" data-exercise="${e.id}" style="left:${Math.max(0,e.x-.047)*100}%;top:${e.y*100}%" aria-label="Открыть упражнение ${e.n}${answers[e.id]?.done?', выполнено':''}">${e.n}${answers[e.id]?.done?' ✓':''}</button>`).join(''):'';
  $('#exerciseList').hidden=!visible;
  $('#exerciseList').innerHTML=visible?`<h3>Задания страницы</h3><p class="exerciseHelp">Нажмите номер на странице или выберите задание ниже.</p>${list.length?list.map(e=>`<button data-exercise="${e.id}" class="exerciseRow"><span>№ ${e.n}</span><span>${esc(e.instruction)}</span><small>${workLabel(e)}</small></button>`).join(''):'<p>На этой странице нет упражнений.</p>'}<button id="workDownload">Скачать мои ответы</button>`:'';
  $$('[data-exercise]').forEach(b=>b.onclick=()=>openTask(list.find(e=>e.id===b.dataset.exercise)));
  if($('#workDownload'))$('#workDownload').onclick=download;
 }
 function download(){const blob=new Blob([JSON.stringify({course:COURSE,answers},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='outcomes-my-answers.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 function workLabel(e){const r=answers[e.id];if(r?.grade?.revision===e.check?.revision&&r.grade.total)return `${r.grade.correct}/${r.grade.total} верно`;return r?.done?'Выполнено':r?'Черновик':e.check?.mode==='items'?'Проверить':'Открыть'}
 function responseFields(e,record){
  const fields=e.check?.mode==='items'?e.check.items:Array.from({length:Math.max(e.count,record.values?.length||0)},(_,i)=>({label:i+1}));
  return fields.map((field,i)=>`<label class="responseField" id="response-${i}"><span>${esc(field.label||i+1)}</span>${field.options?`<select data-response="${i}" aria-label="Ответ ${esc(field.label||i+1)}" aria-describedby="feedback-${i}"><option value="">Выберите…</option>${field.options.map(v=>`<option value="${esc(v)}" ${record.values?.[i]===v?'selected':''}>${esc(v)}</option>`).join('')}</select>`:`<textarea data-response="${i}" aria-label="Ответ ${esc(field.label||i+1)}" aria-describedby="feedback-${i}" rows="${e.kind==='writing'?5:2}" maxlength="10000" placeholder="${field.match==='set'?'Слова или номера через запятую…':e.kind==='writing'?'Напишите свой текст…':'Введите ответ…'}">${esc(record.values?.[i]||'')}</textarea>`}<small id="feedback-${i}" class="answerFeedback"></small></label>`).join('');
 }
 function openTask(e){
  if(!ready){toast('Дождитесь загрузки ответов.');return}if(!e)return;
  active=e;const p=current(),record=answers[e.id]||{values:[],done:false},auto=e.check?.mode==='items';
  checked=Boolean(record.grade&&record.grade.revision===e.check?.revision);revealed=false;
  const tracks=/listen/i.test(e.instruction)?D.media.filter(m=>m.book===source()&&m.pages.includes(p.page)):[];
  const help=auto?(e.check.note||'Заполните ответы и нажмите «Проверить».'):"У этого задания нет единственного правильного ответа. Запишите свой вариант и откройте самопроверку.";
  openModal(`${names[S.book]} · стр. ${p.page} · № ${e.n}`,`<div class="exerciseDialog"><section class="exerciseSource"><p>Оригинальное задание № ${e.n}. Изображение можно прокручивать.</p><img src="${p.image}" alt="${esc(names[S.book])}, страница ${p.page}, упражнение ${e.n}"></section><section class="responsePanel"><div class="checkType">${auto?'Практика с проверкой':'Свободный ответ · самопроверка'}</div><h3>${esc(e.instruction)}</h3><p>${esc(help)}</p>${e.check?.items?.some(f=>f.soft)?'<p class="openAnswerNote">В ответах на вопросы возможны другие формулировки. Их можно сравнить с образцом; несовпадение не считается ошибкой.</p>':''}${tracks.map(m=>`<label>Аудио ${esc(m.track)}<audio class="taskAudio" controls preload="none" src="${m.path}"></audio></label>`).join('')}<div id="responseFields">${responseFields(e,record)}</div>${auto?'':'<button id="addResponse">+ Ещё ответ</button>'}<div class="checkActions"><button id="checkTask">${auto?'Проверить ответы':'Самопроверка'}</button>${auto?'<button id="revealAnswers" hidden>Показать ответы</button>':''}<p id="checkSummary" class="checkSummary" role="status" aria-live="polite"></p></div><div id="selfCheck" hidden></div><label class="workDone" ${auto&&!e.check.items.some(f=>f.soft)?'hidden':''}><input type="checkbox" id="workDone" ${record.done?'checked':''}> ${auto?'Я также проверил(а) свободные ответы':'Я выполнил(а) задание и проверил(а) себя'}</label><p id="taskSaveStatus" role="status"></p><button id="saveTask">Сохранить и закрыть</button></section></div>`);
  const sourceImage=$('.exerciseSource img');const scrollSource=()=>{const box=$('.exerciseSource');box.scrollTop=Math.max(0,e.y*sourceImage.clientHeight-42);box.scrollLeft=Math.max(0,(e.x-.04)*sourceImage.clientWidth)};sourceImage.onload=scrollSource;if(sourceImage.complete)scrollSource();
  bindResponses();$('#workDone').onchange=()=>saveDraft();
  if($('#addResponse'))$('#addResponse').onclick=()=>{saveDraft();const r=answers[e.id];r.values.push('');$('#responseFields').innerHTML=responseFields(e,r);bindResponses()};
  $('#checkTask').onclick=checkTask;
  if($('#revealAnswers'))$('#revealAnswers').onclick=()=>{revealed=!revealed;checkTask()};
  $('#saveTask').onclick=()=>{saveDraft();flush();$('#modal').close()};
  if(checked)renderFeedback(OutcomesGrader.check(e.check,record.values));
 }
 function bindResponses(){$$('[data-response]').forEach(el=>{el.oninput=()=>saveDraft();el.onblur=()=>{if(checked&&active?.check?.mode==='items')checkTask()}})}
 function keyText(field){if(field.self)return 'Ответ зависит от вас. Проверьте его по примеру на странице.';return Array.isArray(field.key)?field.key.join(' / '):field.key}
 function renderFeedback(grade){
  if(!active)return;
  grade.items.forEach((result,i)=>{const field=active.check.items[i],box=$(`#response-${i}`),input=box.querySelector('[data-response]'),feedback=$(`#feedback-${i}`);box.dataset.result=result;input.setAttribute('aria-invalid',result==='incorrect'?'true':'false');feedback.innerHTML=({correct:'✓ Верно',incorrect:'✕ Есть ошибка — попробуйте ещё раз',blank:'Заполните этот пункт',review:'Сравните свою формулировку с образцом'})[result]+((revealed||result==='review')?`<span class="answerKey">${field.self?'Самопроверка':field.soft?'Образец':'Ответ'}: ${esc(keyText(field))}</span>`:'')});
  const blanks=grade.items.filter(v=>v==='blank').length,wrong=grade.items.filter(v=>v==='incorrect').length;
  $('#checkSummary').textContent=grade.total?`${grade.correct} из ${grade.total} верно.${blanks?' Не заполнено: '+blanks+'.':''}${wrong?' Исправьте отмеченные пункты.':''}${grade.needsReview?' Свободные ответы сравните с образцом.':''}${grade.complete?' Всё верно!':''}`:'Сравните ответы с образцами. Другие верные формулировки тоже возможны.';
  $('#revealAnswers').hidden=false;$('#revealAnswers').textContent=revealed?'Скрыть ответы':'Показать ответы';
  if(active.check.model&&revealed){$('#selfCheck').hidden=false;$('#selfCheck').innerHTML=`<h4>Пояснение к ключу</h4><p class="modelAnswer">${esc(active.check.model)}</p>`}
 }
 function checkTask(){
  if(!active)return;
  if(active.check?.mode!=='items'){
   $('#selfCheck').hidden=false;$('#selfCheck').innerHTML=`${active.check?.model?`<h4>Образец для сравнения</h4><p class="modelAnswer">${esc(active.check.model)}</p>`:''}<h4>Проверьте себя</h4><ul><li>Ответили на все части задания?</li><li>Использовали слова и грамматику из примера на странице?</li><li>Проверили порядок слов, форму глагола и написание?</li>${/listen|repeat|practise|conversation/i.test(active.instruction)?'<li>Произнесли ответ вслух и сравнили с записью или примером?</li>':''}</ul><p>Это самопроверка. Автоматический балл за свободный ответ не выставляется.</p>`;$('#selfCheck').scrollIntoView({block:'nearest'});saveDraft();return;
  }
  checked=true;const grade={...OutcomesGrader.check(active.check,$$('[data-response]').map(el=>el.value)),revision:active.check.revision,checkedAt:Date.now(),revealed:revealed||Boolean(answers[active.id]?.assisted||answers[active.id]?.grade?.revealed)};
  renderFeedback(grade);saveDraft(grade);
 }
 function saveDraft(newGrade){
  if(!active||!ready||!$('#workDone'))return;
  const previous=answers[active.id]||{},values=$$('[data-response]').map(el=>el.value),changed=JSON.stringify(values)!==JSON.stringify(previous.values||[]),auto=active.check?.mode==='items';
  const grade=newGrade?.mode?newGrade:(!changed&&previous.grade?.revision===active.check?.revision?previous.grade:null);
  const done=auto?(Boolean(grade)&&grade.correct===grade.total&&!grade.items.includes('blank')&&(!active.check.items.some(f=>f.soft)||$('#workDone').checked)):$('#workDone').checked;
  const record={...previous,book:active.book||source(),page:active.page||current().page,unit:active.unit||S.unit,exercise:active.n,values,done,grade,assisted:Boolean(previous.assisted||previous.grade?.revealed||grade?.revealed),updatedAt:Date.now()};
  if(previous.values?.length>values.length&&!previous.legacyValues)record.legacyValues=previous.values;
  if(changed&&!newGrade?.mode){$$('.responseField').forEach(el=>{delete el.dataset.result;el.querySelector('[data-response]').removeAttribute('aria-invalid')});$$('.answerFeedback').forEach(el=>el.textContent='');if($('#checkSummary'))$('#checkSummary').textContent=checked?'Ответ изменён. Проверим после выхода из поля.':'';}
  answers[active.id]=record;dirty[active.id]=record;const saved=localSave();renderTasks();if($('#taskSaveStatus'))$('#taskSaveStatus').textContent=saved?(user?'Сохранено на устройстве. Синхронизация…':'Сохранено в этом браузере. Войдите для сохранения в аккаунте.'):'Не удалось сохранить. Скачайте ответы.';clearTimeout(timer);timer=setTimeout(flush,900);
 }
 async function flush(){
  if(!user||busy||!Object.keys(dirty).length)return;
  busy=true;const batch={...dirty};
  try{
   const result=await SM.saveCourseWork(COURSE,batch,user.id);
   if(!result.ok)throw Error(result.error||'network');
   for(const [id,v] of Object.entries(batch))if(dirty[id]===v)delete dirty[id];
   status('Ответы сохранены в вашем аккаунте');if($('#taskSaveStatus'))$('#taskSaveStatus').textContent='Сохранено в аккаунте';
  }catch{status('Ответы сохранены на устройстве. Нет связи с аккаунтом — повторим при восстановлении сети.');if($('#taskSaveStatus'))$('#taskSaveStatus').textContent='Сохранено на устройстве; синхронизация пока недоступна.'}
  finally{busy=false}
 }
 $('#exerciseToggle').onclick=()=>{enabled=!enabled;$('#exerciseToggle').setAttribute('aria-pressed',enabled);renderTasks()};
 window.addEventListener('outcomes-page',renderTasks);window.addEventListener('online',flush);
 $('#modal').addEventListener('close',()=>{$$('.taskAudio').forEach(a=>a.pause());active=null});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush()});
 $('#keys').hidden=true;
 async function init(){
  try{user=await SM.getUser();if(user){const profile=await SM.myProfile();role=profile?.role||'student'}}catch{}
  try{answers=parse(localStorage.getItem(key()))}catch{answers={}}
  if(user){
   try{const cloud=await SM.loadCourseWork(COURSE);if(!cloud.ok)throw Error();for(const [id,v] of Object.entries(cloud.answers)){if(!answers[id]||Number(v.updatedAt)>Number(answers[id].updatedAt||0))answers[id]=v}for(const [id,v] of Object.entries(answers))if(!cloud.answers[id]||Number(v.updatedAt)>Number(cloud.answers[id].updatedAt||0))dirty[id]=v;localSave();status('Ответы загружены из аккаунта');}catch{status('Открыты ответы с этого устройства. Синхронизация пока недоступна.')}
  }else status('Гостевой режим: ответы сохраняются только в этом браузере.');
  $('#keys').hidden=!['teacher','admin'].includes(role);$('#notesTab').hidden=!['teacher','admin'].includes(role);
  if(!['teacher','admin'].includes(role))$('#resources').onclick=()=>{openModal('Материалы ученика',`<p>Student’s Book, Workbook и словарь доступны через вкладки. Нажимайте номера заданий, чтобы записывать ответы.</p><p>В комплекте Workbook ©2019 (ISBN 9780357042243). Название архива «3ed» не меняет издание книги.</p><a href="resources/workbook.pdf" target="_blank" rel="noopener">Workbook PDF</a> · <a href="resources/vocabulary.pdf" target="_blank" rel="noopener">Vocabulary Builder PDF</a>`)};
  ready=true;renderTasks();flush();
 }
 renderTasks();init();
})();
