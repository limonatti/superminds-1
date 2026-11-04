'use strict';
window.SpeakoutMaterials = (() => {
 const categories = {books:'Книги и ключи',tests:'Тесты',photocopiables:'Доп. задания',literature:'Чтение'};
 function open(config) {
  const {esc,url,answers,persist,stopMedia,bindExclusivePlayers} = config;
  const dialog=document.querySelector('#modal'),body=document.querySelector('#modalBody'),heading=document.querySelector('#modalTitle');
  const entries=(window.SPEAKOUT_MATERIALS?.items||[]).concat(config.books.map((r,i)=>({...r,id:'book-'+i,category:'books',teacher:/key|teacher/i.test(r.name),units:[]})));
  let category=categories[config.category]?config.category:'books',unit=config.unit||'all',query=config.query||'',teachers=!!config.keys;
  let active=null,source=null,pageNumber=0,zoom=100;
  const get=id=>entries.find(r=>r.id===id);
  const $=selector=>body.querySelector(selector);
  const $$=selector=>[...body.querySelectorAll(selector)];
  function title(value){heading.textContent=value;heading.tabIndex=-1;dialog.scrollTop=0;}
  function list(){dialog.classList.remove('focus-material-dialog');
   stopMedia();active=null;title('Материалы Speakout B1+');
   body.innerHTML=`<div class="material-categories" role="group" aria-label="Виды материалов">${Object.entries(categories).map(([id,label])=>`<button data-category="${id}" aria-pressed="${category===id}" class="${category===id?'selected':''}">${label}</button>`).join('')}</div>
    <div class="material-filters"><label>Юнит<select id="materialUnit"><option value="all">Все юниты</option>${Array.from({length:8},(_,i)=>`<option value="${i+1}">Unit ${i+1}</option>`).join('')}</select></label><label>Поиск<input id="materialSearch" type="search" placeholder="Например, 1A, Unit 3, Grammar…" value="${esc(query)}"></label><label class="material-teacher"><input id="materialTeacher" type="checkbox" ${teachers?'checked':''}> Ключи и рекомендации</label></div>
    <p id="materialCount" role="status"></p><div id="materialList"></div>
    <details class="material-coverage"><summary>Состав комплекта</summary><p>Student’s Book: страницы 6–137 и 139–175; Workbook: 3–96. Пока не хватает страницы 138 Student’s Book и записи L.01 к Lead-in.</p><p>В разделе чтения выбраны четыре урока, охватывающие уровень B1+. Записи Literature Lessons в присланном архиве отсутствуют; задания на аудирование отмечены отдельно.</p></details>`;
   $('#materialUnit').value=unit;$('#materialUnit').disabled=['books','literature'].includes(category);
   $$('[data-category]').forEach(b=>b.onclick=()=>{category=b.dataset.category;query='';list()});
   $('#materialUnit').onchange=e=>{unit=e.target.value;results()};
   $('#materialSearch').oninput=e=>{query=e.target.value;results()};
   $('#materialTeacher').onchange=e=>{teachers=e.target.checked;results()};
   results();
  }
  function results(){
   const found=entries.filter(r=>r.category===category&&(!r.teacher||teachers)&&(unit==='all'||['books','literature'].includes(category)||!r.units.length||r.units.includes(+unit))&&(`${r.name} ${r.id} ${r.lesson||''} ${r.level||''}`).toLowerCase().includes(query.trim().toLowerCase()));
   if(category==='tests')found.sort((a,b)=>Math.max(0,...a.units)-Math.max(0,...b.units)||a.id.localeCompare(b.id,undefined,{numeric:true}));
   $('#materialCount').textContent=`Материалов: ${found.length}`;
   $('#materialList').innerHTML=found.length?found.map(r=>`<article class="material-card"><div><h3>${esc(r.name)}</h3><p>${esc([r.level,r.lesson?'Урок '+r.lesson:'',r.teacher?'Для преподавателя':'',r.pageCount?r.pageCount+' стр.':'',!r.teacher&&r.audio?.length?r.audio.length+' аудио':''].filter(Boolean).join(' · '))}</p>${window.SPEAKOUT_MATERIAL_INTERACTIONS?.materials[r.id]?'<span class="material-interactive-badge">Интерактивный тест</span>':''}</div><div>${r.images?`<button data-material="${r.id}">Открыть</button>`:`<a href="${url(r.path)}" target="_blank" rel="noopener">Открыть PDF</a>`}</div></article>`).join(''):'<p>Материалы не найдены. Попробуй другой юнит или поисковый запрос.</p>';
   $$('[data-material]').forEach(b=>b.onclick=()=>show(get(b.dataset.material)));
  }
  function show(item,from=null){
   if(!item?.images)return;
   stopMedia();active=item;source=from;pageNumber=0;zoom=100;title(item.name);
   const key=get(item.keyId),answerId='material:'+item.id;
   const answer=answers[answerId]||(answers[answerId]={values:{},note:'',done:false});
   body.innerHTML=`<div class="material-actions"><button id="materialBack">${from?'← К заданию':'← К списку'}</button><a href="${url(item.path)}" download>Скачать PDF</a>${item.editable?`<a href="${url(item.editable)}" download>Скачать Word</a>`:''}${key?'<button id="materialKey">Показать ключи</button>':''}</div>
    ${item.level?`<p class="source-note">Уровень оригинала: ${esc(item.level)}</p>`:''}
    <div class="material-audio">${(item.teacher?[]:item.audio).map(m=>`<label>Аудио ${esc(m.track)}<audio controls preload="none" src="${url(m.path)}"></audio></label>`).join('')}</div>
    ${item.missingAudio?.length?`<p class="source-note">Записей ${esc(item.missingAudio.join(', '))} нет в архиве. Доступны чтение и обсуждение; задания на аудирование требуют этих записей.</p>`:''}
    <div class="material-study"><div class="material-original"><div class="material-pager"><button id="materialPrev" aria-label="Предыдущая страница материала">‹</button><label>Страница <select id="materialPage">${item.images.map((_,i)=>`<option value="${i}">${i+1}</option>`).join('')}</select> из ${item.pageCount}</label><button id="materialNext" aria-label="Следующая страница материала">›</button><button id="materialZoomOut" aria-label="Уменьшить материал">−</button><button id="materialZoomFit">100%</button><button id="materialZoomIn" aria-label="Увеличить материал">+</button></div>
    <div class="material-viewport"><img id="materialImage" alt="${esc(item.name)}"></div></div><div class="material-practice"></div></div>
    ${!item.teacher?`<div class="material-answer"><label for="materialNote">Ответы и заметки к заданию</label><textarea id="materialNote" rows="5" placeholder="Запиши ответы по номерам упражнений…">${esc(answer.note||'')}</textarea><p>Проверка с преподавателем или по оригинальному ключу. Ответы сохраняются в аккаунте и входят в файл «Мои ответы».</p><button id="materialDone" class="${answer.done?'selected':''}" aria-pressed="${!!answer.done}">${answer.done?'✓ Выполнено':'Отметить выполненным'}</button></div>`:''}`;
   $('#materialBack').onclick=()=>source?show(source):list();
   if(key){
    const sections=window.SPEAKOUT_MATERIAL_INTERACTIONS?.materials[item.id]?.sections;
    const attempted=()=>sections?.length?sections.every(ex=>{const st=answer.exercises?.[ex.id];return ex.mode==='review'?!!(st?.note?.trim()&&st.done):ex.fields.every(f=>st?.checked?.[f.n]&&String(st.values?.[f.n]||'').trim())}):!!(answer.note?.trim()&&answer.done);
    const refreshKey=()=>{const b=$('#materialKey');if(b){const disabled=!attempted();if(b.disabled!==disabled)b.disabled=disabled;b.title=disabled?'Ключ ко всему материалу доступен после заполнения и проверки всех разделов':''}};
    $('#materialKey').onclick=()=>{if(attempted())show(key,item)};refreshKey();
    const observer=new MutationObserver(refreshKey);observer.observe(body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','aria-pressed']});$('#modal').addEventListener('close',()=>observer.disconnect(),{once:true});
   }
   $('#materialPrev').onclick=()=>{pageNumber--;renderPage()};$('#materialNext').onclick=()=>{pageNumber++;renderPage()};
   $('#materialPage').onchange=e=>{pageNumber=+e.target.value;renderPage()};
   $('#materialZoomOut').onclick=()=>setZoom(zoom-25);$('#materialZoomIn').onclick=()=>setZoom(zoom+25);$('#materialZoomFit').onclick=()=>setZoom(100);
   if($('#materialNote')){
    $('#materialNote').oninput=e=>{answer.note=e.target.value;answer.done=false;syncDone();persist()};
    $('#materialDone').onclick=()=>{answer.done=!answer.done;syncDone();persist()};
   }
   function syncDone(){const b=$('#materialDone');b.textContent=answer.done?'✓ Выполнено':'Отметить выполненным';b.classList.toggle('selected',answer.done);b.setAttribute('aria-pressed',!!answer.done)}
   renderPage();
   const interactive=window.SpeakoutMaterialExercises?.mount($('.material-practice'),{item,answer,persist,esc,url,bindExclusivePlayers,setPage:(n,section)=>{pageNumber=n-1;renderPage();const spec=window.MATERIAL_EXERCISE_SOURCES?.[item.id+':'+section.id];if(spec)window.ExerciseSource.mount($('.material-original'),item.id+':'+section.id,spec)}});
   $('.material-study').classList.toggle('has-practice',!!interactive);if(interactive){dialog.classList.add('focus-material-dialog');$('.material-study').classList.add('focus-columns');$('.material-practice').classList.add('focus-responses');window.ExerciseSource.controls($('.material-original'));const notes=$('.material-answer');if(notes){const detail=document.createElement('details'),summary=document.createElement('summary');detail.className='material-answer';summary.textContent='Общие заметки к тесту';detail.append(summary,...notes.childNodes);notes.replaceWith(detail)}}else dialog.classList.remove('focus-material-dialog');
   bindExclusivePlayers();heading.focus({preventScroll:true});
  }
  function setZoom(value){zoom=Math.max(75,Math.min(250,value));$('#materialImage').style.width=zoom+'%';$('#materialZoomFit').textContent=zoom+'%';$('#materialZoomOut').disabled=zoom<=75;$('#materialZoomIn').disabled=zoom>=250}
  function renderPage(){
   $('#materialImage').src=url(active.images[pageNumber]);$('#materialImage').alt=`${active.name} · страница ${pageNumber+1}`;
   $('#materialPage').value=pageNumber;$('#materialPrev').disabled=pageNumber===0;$('#materialNext').disabled=pageNumber===active.images.length-1;
   $('.material-viewport').scrollTo(0,0);setZoom(zoom);
  }
  stopMedia();dialog.classList.add('materials-dialog');
  dialog.addEventListener('close',()=>{stopMedia();dialog.classList.remove('materials-dialog')},{once:true});
  list();if(!dialog.open)dialog.showModal();
  if(config.material&&get(config.material)?.images)show(get(config.material));
 }
 return {open};
})();
