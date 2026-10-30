/* Student answers belong to the signed-in account, independently of teacher ink. */
(()=>{
 const COURSE='outcomes-beginner', bank=window.OUTCOMES_EXERCISES||{};
 let user=null, ready=false, answers={}, dirty={}, timer, busy=false, active=null, enabled=true, role='student';
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
  $('#exerciseList').innerHTML=visible?`<h3>Задания страницы</h3><p class="exerciseHelp">Нажмите номер на странице или выберите задание ниже.</p>${list.length?list.map(e=>`<button data-exercise="${e.id}" class="exerciseRow"><span>№ ${e.n}</span><span>${esc(e.instruction)}</span><small>${answers[e.id]?.done?'Выполнено':answers[e.id]?'Черновик':'Открыть'}</small></button>`).join(''):'<p>На этой странице нет упражнений.</p>'}<button id="workDownload">Скачать мои ответы</button>`:'';
  $$('[data-exercise]').forEach(b=>b.onclick=()=>openTask(list.find(e=>e.id===b.dataset.exercise)));
  if($('#workDownload'))$('#workDownload').onclick=download;
 }
 function download(){const blob=new Blob([JSON.stringify({course:COURSE,answers},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='outcomes-my-answers.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 function responseFields(e,record){const count=Math.max(e.count,record.values?.length||0);return Array.from({length:count},(_,i)=>`<label class="responseField"><span>${count===1?'Мой ответ':`Ответ ${i+1}`}</span>${e.options?`<select data-response="${i}" aria-label="Ответ ${i+1}"><option value="">Выберите…</option>${e.options.map(v=>`<option value="${esc(v)}" ${record.values?.[i]===v?'selected':''}>${esc(v)}</option>`).join('')}</select>`:`<textarea data-response="${i}" rows="${e.kind==='writing'?6:2}" maxlength="10000" placeholder="${e.kind==='writing'?'Напишите свой текст…':'Введите ответ, слово, букву или номер…'}">${esc(record.values?.[i]||'')}</textarea>`}</label>`).join('')}
 function openTask(e){
  if(!ready){toast('Дождитесь загрузки ответов.');return}if(!e)return;
  active=e;const p=current(),record=answers[e.id]||{values:[],done:false};
  const tracks=/listen/i.test(e.instruction)?D.media.filter(m=>m.book===source()&&m.pages.includes(p.page)):[];
  openModal(`${names[S.book]} · стр. ${p.page} · № ${e.n}`,`<div class="exerciseDialog"><section class="exerciseSource"><p>Задание № ${e.n} на оригинальной странице. Изображение можно прокручивать.</p><img src="${p.image}" alt="${esc(names[S.book])}, страница ${p.page}, упражнение ${e.n}"></section><section class="responsePanel"><h3>${esc(e.instruction)}</h3><p>Впишите ответы по номерам. Для устного задания можно записать свой вариант. Ответы сохраняются автоматически; правильность проверяется с преподавателем.</p>${tracks.map((m,i)=>`<label>Аудио ${esc(m.track)}<audio class="taskAudio" controls preload="none" src="${m.path}"></audio></label>`).join('')}<div id="responseFields">${responseFields(e,record)}</div><button id="addResponse">+ Ещё ответ</button><label class="workDone"><input type="checkbox" id="workDone" ${record.done?'checked':''}> Я выполнил(а) это задание</label><p id="taskSaveStatus" role="status"></p><button id="saveTask">Сохранить и закрыть</button></section></div>`);
  const sourceImage=$('.exerciseSource img');sourceImage.onload=()=>{const box=$('.exerciseSource');box.scrollTop=Math.max(0,e.y*sourceImage.clientHeight-42);box.scrollLeft=Math.max(0,(e.x-.04)*sourceImage.clientWidth)};
  bindResponses();$('#workDone').onchange=saveDraft;
  $('#addResponse').onclick=()=>{saveDraft();const r=answers[e.id];r.values.push('');$('#responseFields').innerHTML=responseFields(e,r);bindResponses()};
  $('#saveTask').onclick=()=>{saveDraft();flush();$('#modal').close()};
 }
 function bindResponses(){$$('[data-response]').forEach(el=>el.oninput=saveDraft)}
 function saveDraft(){if(!active||!ready||!$('#workDone'))return;const record={book:source(),page:current().page,unit:S.unit,exercise:active.n,values:$$('[data-response]').map(el=>el.value),done:$('#workDone').checked,updatedAt:Date.now()};answers[active.id]=record;dirty[active.id]=record;const saved=localSave();renderTasks();if($('#taskSaveStatus'))$('#taskSaveStatus').textContent=saved?(user?'Сохранено на устройстве. Синхронизация…':'Сохранено в этом браузере. Войдите для сохранения в аккаунте.'):'Не удалось сохранить. Скачайте ответы.';clearTimeout(timer);timer=setTimeout(flush,900)}
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
