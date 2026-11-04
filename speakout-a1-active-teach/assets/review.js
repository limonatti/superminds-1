(async function(){
  'use strict';
  const D=window.SPEAKOUT_REVIEW,main=document.querySelector('#main'),status=document.querySelector('#save-status');
  const KEY='speakout-a1-review-v1',esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let attempts=[],active=null,unit=null,missionIndex=0,selectedPair=null,storageError=false;
  let suspended=false,booted=false;
  const courseStore=new CourseWorkStore({course:'speakout-a1-review',onAccountChange:()=>{suspended=true;CourseWorkUI.accountChanged()},onStatus:t=>status.textContent=t,onChange(rows,change){if(change.account&&active){suspended=true;return}if(change.local)return;const old=active;attempts=Object.values(rows).map(r=>r.attempt?JSON.parse(JSON.stringify(r.attempt)):null).filter(Boolean).map(a=>old?.id===a.id&&JSON.stringify(a)===JSON.stringify(old)?old:a);if(old)active=attempts.find(a=>a.id===old.id)||null;if(booted&&old!==active)route();}});
  await courseStore.start();
  CourseWorkUI.bind(courseStore,()=>{save();return courseStore.flush()});
  function save(){
    if(suspended)return;if(active)active.updated=new Date().toISOString();
    for(const a of attempts)if(JSON.stringify(courseStore.records[a.id]?.attempt)!==JSON.stringify(a))courseStore.set(a.id,{unit:a.unit,book:'review',exercise:a.id,attempt:JSON.parse(JSON.stringify(a)),updatedAt:Date.now()});
  }
  const saveButton=document.createElement('button');saveButton.textContent='Сохранить ответы';saveButton.onclick=()=>{save();courseStore.flush()};status.before(saveButton);
  try{const old=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(old)&&old.length){const transfer=document.createElement('button');transfer.textContent='Перенести мои прежние прохождения';transfer.onclick=()=>{for(const a of old)if(a?.id&&a.work&&!attempts.some(b=>b.id===a.id))attempts.push(a);save();route();transfer.remove()};status.before(transfer)}}catch{}
  const stamp=a=>new Date(a.started).toLocaleString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
  const mode=a=>a.mode==='check'?'Проверка':'Тренировка';
  const points=m=>m.questions.reduce((n,q)=>n+(q.type==='match'?q.pairs.length:1),0);
  function work(m){const w=active.work[m.id];if(!w||typeof w!=='object'||!w.answers||typeof w.answers!=='object')active.work[m.id]={answers:{}};return active.work[m.id];}
  function allDone(){return unit.missions.slice(0,7).every(m=>!!work(m).first);}
  function normalize(s){return String(s).toLowerCase().replace(/[’‘]/g,"'").replace(/[.,!?]/g,'').replace(/\s+/g,' ').trim();}
  function grade(m,answers){
    const rows=[];
    for(const q of m.questions){
      if(q.type==='match')q.pairs.forEach(([left,right],i)=>rows.push({prompt:left,answer:answers[q.id]?.[i]||'',correct:right,ok:answers[q.id]?.[i]===right,why:`${left} → ${right}`}));
      else{const a=q.type==='order'?(Array.isArray(answers[q.id])?answers[q.id].map(i=>q.answer.split(' ')[i]||'').join(' '):''):(answers[q.id]||'');rows.push({prompt:q.prompt,answer:a,correct:q.answer,ok:[q.answer,...(q.accepted||[])].some(value=>normalize(a)===normalize(value)),why:q.why});}
    }
    return {score:rows.filter(r=>r.ok).length,total:rows.length,rows};
  }
  function answered(m){return m.questions.every(q=>q.type==='match'?q.pairs.every((_,i)=>!!work(m).answers[q.id]?.[i]):q.type==='order'?Array.isArray(work(m).answers[q.id])&&work(m).answers[q.id].length===q.answer.split(' ').length:!!work(m).answers[q.id]);}
  function shuffle(items,seed){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;const a=items.slice();for(let i=a.length-1;i>0;i--){h=(Math.imul(h,1664525)+1013904223)>>>0;const j=h%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
  function imgHTML(img,small=false){const [x,y,w,h]=img.box;return `${small?'<div class="thumbnail">':''}<div class="photo" style="aspect-ratio:${w*1190}/${h*1684}"><img src="${img.src}" alt="${esc(img.alt)}" loading="lazy" style="width:${10000/w}%;left:${-x/w*100}%;top:${-y/h*100}%"></div>${small?'</div>':''}`;}
  function focusTitle(){main.querySelector('h1')?.focus();window.scrollTo({top:0,behavior:'instant'});}
  function stopMedia(){main.querySelectorAll('audio,video').forEach(p=>p.pause());}
  function navigate(query){stopMedia();history.pushState(null,'',`review.html${query}`);route();}
  function route(){
    const p=new URLSearchParams(location.search),a=attempts.find(a=>a.id===p.get('attempt'));
    if(a){active=a;unit=D.units.find(u=>u.id===a.unit);const n=Number(p.get('mission')||a.mission||0);missionIndex=Number.isInteger(n)&&n>=0&&n<8?n:0;selectedPair=null;renderQuest();}
    else{active=null;unit=D.units.find(u=>u.id===Number(p.get('unit')))||null;renderHome();}
    document.querySelector('#book-link').href='index.html'+(unit?'?unit='+unit.id:'');
    if(storageError)status.textContent='Хранилище браузера недоступно или повреждено. Скачивай отчёт, чтобы сохранить ответы.';
    focusTitle();
  }
  function renderHome(){
    main.innerHTML=`<section class="intro"><p class="eyebrow">Speakout A1 / Extra practice</p><h1 tabindex="-1">Твой английский.<br>В деле.</h1><p class="lead">Восемь квестов с фотографиями, играми, аудио и видео. Проверь, что умеешь после каждого юнита.</p><div class="facts"><span><b>8</b> квестов</span><span><b>192</b> ответа с проверкой</span><span><b>16</b> открытых заданий</span></div></section>
      <section class="setup" aria-labelledby="setup-title"><div><h2 id="setup-title">Выбери свой маршрут</h2><p>Один юнит: примерно 30–45 минут. Можно пройти часть сейчас и вернуться позже.</p></div><div class="settings"><label for="learner">Имя ученика или псевдоним<input id="learner" maxlength="60" placeholder="Например, Саша" autocomplete="off"></label><fieldset><legend>Как проходить</legend><label class="mode"><input type="radio" name="mode" value="practice" checked><span><strong>Тренировка</strong><small>Разбор после каждой миссии, можно исправлять ошибки.</small></span></label><label class="mode"><input type="radio" name="mode" value="check"><span><strong>Проверка</strong><small>Одна попытка. Ответы и разбор после всех семи миссий.</small></span></label></fieldset></div></section>
      <div class="unit-list">${D.units.map(u=>`<article class="unit-row${unit?.id===u.id?' recommended':''}">${imgHTML(u.image,true)}<div><p class="unit-label">Unit ${u.id} · ${esc(u.name)}</p><h2>${esc(u.title)}</h2><p>${esc(u.story)}</p><small>24 ответа с автопроверкой + речь и письмо</small></div><button class="primary start" data-unit="${u.id}">Начать квест ${u.id} →</button></article>`).join('')}</div>
      <section class="saved"><h2>Мои прохождения</h2><p class="muted">Каждое прохождение сохраняется в вашем аккаунте. Автоматической отправки преподавателю нет.</p>${attempts.length?`<ul>${attempts.slice().reverse().map(a=>`<li><div><strong>${esc(a.name||'Без имени')}</strong> · Unit ${a.unit} · ${mode(a)}<small>${esc(stamp(a))} · ${Object.values(a.work).filter(w=>w?.first).length}/7 миссий проверено</small></div><button data-resume="${esc(a.id)}">Открыть</button></li>`).join('')}</ul>`:'<p>Здесь появятся начатые квесты.</p>'}</section>`;
    main.querySelectorAll('.start').forEach(b=>b.onclick=()=>{
      const name=main.querySelector('#learner').value.trim(),selected=main.querySelector('input[name="mode"]:checked').value;
      const a={id:globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`,unit:+b.dataset.unit,name,mode:selected,started:new Date().toISOString(),mission:0,work:{},speaking:'',writing:''};
      attempts.push(a);active=a;save();navigate('?attempt='+encodeURIComponent(a.id));
    });
    main.querySelectorAll('[data-resume]').forEach(b=>b.onclick=()=>navigate('?attempt='+encodeURIComponent(b.dataset.resume)));
  }
  function renderQuest(){
    const m=unit.missions[missionIndex],w=work(m),submitted=!!w.current,locked=submitted,completed=unit.missions.slice(0,7).filter(m=>work(m).first).length;
    main.innerHTML=`<div class="quest-head"><div><a href="review.html?unit=${unit.id}" class="back">← Все квесты</a><p class="unit-label">Unit ${unit.id} · ${esc(unit.name)} · ${mode(active)}</p><h1 tabindex="-1">${esc(unit.title)}</h1><p>${esc(active.name||'Без имени')} · ${esc(unit.story)}</p></div><div class="passport"><span>Твой маршрут</span><strong>${completed}<small> / 7</small></strong><span>миссий проверено</span><button id="report-open">Мой результат</button></div></div>
      <nav class="mission-nav" aria-label="Миссии квеста">${unit.missions.map((x,i)=>`<button data-mission="${i}" ${i===missionIndex?'aria-current="step"':''}><span>${work(x).first?'✓':i+1}</span>${esc(x.name)}</button>`).join('')}</nav>
      <section class="mission"><div class="mission-title"><p class="unit-label">${esc(m.skill)} · Миссия ${missionIndex+1} из 8</p><h2>${esc(m.name)}</h2><p>${esc(m.brief)}</p></div>${m.id==='final'?finalHTML():`<div class="mission-body${m.image||m.media?' with-media':''}">${m.image?`<figure>${imgHTML(m.image)}<figcaption>Фото из Student’s Book, стр. ${m.image.page}.<br><a href="index.html?unit=${unit.id}&book=sb&page=${m.image.page}" target="_blank" rel="noopener">Открыть страницу учебника ↗</a></figcaption></figure>`:m.media?mediaHTML(m.media):''}<div class="questions">${m.questions.map((q,i)=>questionHTML(q,i,locked,w)).join('')}</div></div><div id="feedback" role="status" tabindex="-1">${feedbackHTML(m,w)}</div><div class="mission-actions">${!submitted?`<button id="submit-mission" class="primary" ${answered(m)?'':'disabled'}>${active.mode==='check'?'Зафиксировать ответы':'Проверить миссию'}</button><span id="answer-hint">${answered(m)?'Все ответы готовы.':'Сначала ответь на все вопросы миссии.'}</span>`:active.mode==='practice'?'<button id="retry">Попробовать ещё раз</button>':'<p>Ответы зафиксированы для этой попытки.</p>'}<button id="next" ${missionIndex===7?'hidden':''}>${missionIndex===6?'Финальный вызов':'Следующая миссия'} →</button></div>`}</section>
      <div class="quest-bottom"><p>Первая проверка сохраняется отдельно от исправлений. Речь и письмо оценивает преподаватель.</p><button id="download">Скачать отчёт</button></div>`;
    main.querySelectorAll('[data-mission]').forEach(b=>b.onclick=()=>openMission(+b.dataset.mission));
    main.querySelector('#report-open').onclick=renderReport;
    main.querySelector('#download').onclick=download;
    if(m.id==='final'){bindFinal();showMission();return;}
    main.querySelector('#next').onclick=()=>openMission(missionIndex+1);
    main.querySelector('#submit-mission')?.addEventListener('click',()=>submit(m));
    main.querySelector('#retry')?.addEventListener('click',()=>{w.current=null;save();renderQuest();main.querySelector('.questions input,.questions button')?.focus();});
    main.querySelector('#memory-open')?.addEventListener('click',()=>openMemory(m.questions[0].pairs));
    main.querySelectorAll('input[data-choice]').forEach(el=>el.onchange=()=>{w.answers[el.dataset.choice]=el.value;save();updateSubmit(m);});
    main.querySelectorAll('[data-token]').forEach(b=>b.onclick=()=>{
      const id=b.dataset.question,arr=w.answers[id]||(w.answers[id]=[]);arr.push(+b.dataset.token);save();refreshQuestion(m,id);
    });
    main.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{w.answers[b.dataset.question].splice(+b.dataset.remove,1);save();refreshQuestion(m,b.dataset.question);});
    main.querySelectorAll('[data-left]').forEach(b=>b.onclick=()=>{selectedPair={id:b.dataset.question,index:+b.dataset.left};renderPairs(m,b.dataset.question);});
    main.querySelectorAll('[data-right]').forEach(b=>b.onclick=()=>choosePair(m,b));
    main.querySelectorAll('audio,video').forEach(p=>{
      p.onplay=()=>main.querySelectorAll('audio,video').forEach(other=>{if(other!==p)other.pause();});
      p.onerror=()=>{main.querySelector('#media-error').hidden=false;};
    });
    const speed=main.querySelector('#speed');if(speed)speed.onchange=()=>{main.querySelector('audio,video').playbackRate=+speed.value;};
    showMission();
  }
  function showMission(){
    const mission=main.querySelector('.mission'),dialog=document.createElement('dialog'),preview=document.createElement('button'),close=document.createElement('button');
    dialog.className='coursework-dialog review-exercise';dialog.setAttribute('aria-label',unit.missions[missionIndex].name);preview.className='coursework-preview';preview.textContent='Открыть упражнение · '+unit.missions[missionIndex].name;close.className='coursework-close';close.textContent='×';close.setAttribute('aria-label','Закрыть упражнение');close.onclick=()=>dialog.close();
    mission.replaceWith(preview,dialog);dialog.append(close,mission);preview.onclick=()=>dialog.showModal();dialog.addEventListener('close',()=>{stopMedia();preview.focus()});dialog.showModal();CourseWorkUI.mount();
  }
  function mediaHTML(media){return `<aside class="media"><p class="media-label">${esc(media.label)}</p><${media.type} controls preload="metadata" ${media.type==='video'?'playsinline':''} src="${media.src}" aria-label="${esc(media.label)}"></${media.type}><label class="speed" for="speed">Скорость<select id="speed"><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option></select></label><p>Можно поставить на паузу и вернуться к любому фрагменту.</p><p id="media-error" class="error" hidden>Запись не загрузилась. <a href="${media.src}" target="_blank" rel="noopener">Открыть файл отдельно</a> или вернуться к миссии позже. Без записи результат будет неполным.</p></aside>`;}
  function questionHTML(q,i,locked,w){
    const disabled=locked?'disabled':'',id=q.id;
    if(q.type==='choice')return `<fieldset class="question" id="${id}"><legend><span>${i+1}.</span> <span lang="en">${esc(q.prompt)}</span></legend>${shuffle(q.options,active.id+id).map((o,j)=>`<label class="option${w.answers[id]===o?' chosen':''}"><input type="radio" data-choice="${id}" name="${id}" value="${esc(o)}" ${w.answers[id]===o?'checked':''} ${disabled}><span lang="en">${esc(o)}</span></label>`).join('')}</fieldset>`;
    if(q.type==='order'){
      const tokens=q.answer.split(' '),chosen=Array.isArray(w.answers[id])?w.answers[id]:[];
      return `<fieldset class="question" id="${id}"><legend>${i+1}. ${esc(q.prompt)}</legend><div class="sentence" aria-label="Твой ответ" aria-live="polite">${chosen.length?chosen.map((n,k)=>`<button data-question="${id}" data-remove="${k}" aria-label="Убрать ${esc(tokens[n])}" ${disabled} lang="en">${esc(tokens[n])}</button>`).join(''):'<span class="muted">Собери предложение из слов ниже</span>'}</div><div class="tokens" aria-label="Слова для предложения">${shuffle(tokens.map((t,n)=>({t,n})),active.id+id).map(({t,n})=>`<button data-question="${id}" data-token="${n}" ${locked||chosen.includes(n)?'disabled':''} lang="en">${esc(t)}</button>`).join('')}</div></fieldset>`;
    }
    const a=w.answers[id]||{};
    return `<fieldset class="question" id="${id}"><legend>${esc(q.prompt)}</legend><div class="pairs"><div>${q.pairs.map(([left],n)=>`<button data-left="${n}" data-question="${id}" aria-pressed="${selectedPair?.id===id&&selectedPair.index===n}" ${disabled}><span>${n+1}. ${esc(left)}</span><small>${a[n]?esc(a[n]):'Выбери пару →'}</small></button>`).join('')}</div><div>${shuffle(q.pairs.map((p,n)=>({right:p[1],n})),active.id+id).map(({right,n})=>`<button data-right="${n}" data-question="${id}" ${disabled} ${selectedPair?'':'aria-disabled="true"'}>${esc(right)}${Object.values(a).includes(right)?' ✓':''}</button>`).join('')}</div></div><p class="pair-hint" role="status">${selectedPair?'Теперь выбери соответствие справа.':'Сначала нажми слово слева.'}</p></fieldset>`;
  }
  function refreshQuestion(m,id){
    const scroll=window.scrollY;renderQuest();window.scrollTo({top:scroll,behavior:'instant'});
    const q=m.questions.find(q=>q.id===id);if(q?.type==='order')main.querySelector(`#${id} .tokens button:not(:disabled)`)?.focus({preventScroll:true});
  }
  function renderPairs(m,id){const y=window.scrollY;renderQuest();window.scrollTo({top:y,behavior:'instant'});main.querySelector(`#${id} [data-right]`)?.focus({preventScroll:true});}
  function choosePair(m,b){
    if(!selectedPair||selectedPair.id!==b.dataset.question)return;
    const q=m.questions.find(q=>q.id===selectedPair.id),a=work(m).answers[q.id]||(work(m).answers[q.id]={}),right=q.pairs[+b.dataset.right][1];
    for(const k of Object.keys(a))if(a[k]===right)delete a[k];a[selectedPair.index]=right;selectedPair=null;save();renderPairs(m,q.id);
    main.querySelector(`#${q.id} [data-left]`)?.focus({preventScroll:true});
  }
  function updateSubmit(m){const b=main.querySelector('#submit-mission');if(b){b.disabled=!answered(m);main.querySelector('#answer-hint').textContent=answered(m)?'Все ответы готовы.':'Сначала ответь на все вопросы миссии.';}}
  function submit(m){if(!answered(m)||work(m).current)return;const w=work(m),snapshot=JSON.parse(JSON.stringify(w.answers));w.current={answers:snapshot,at:new Date().toISOString()};if(!w.first)w.first=JSON.parse(JSON.stringify(w.current));save();renderQuest();main.querySelector('#feedback').focus();}
  function feedbackHTML(m,w){
    if(!w.current)return '';
    if(active.mode==='check'&&!allDone())return '<p class="submitted">Ответы сохранены. Разбор откроется после всех семи миссий.</p>';
    const g=grade(m,w.current.answers),first=grade(m,w.first.answers);
    return `<div class="feedback"><h3>${g.score} из ${g.total} верно${active.mode==='practice'&&g.score!==first.score?` · первая проверка: ${first.score}/${first.total}`:''}</h3><ul>${g.rows.map(r=>`<li class="${r.ok?'correct':'incorrect'}"><strong>${r.ok?'✓ Верно':'↺ Повтори'}:</strong> ${esc(r.prompt)}<br>${!r.ok?`Твой ответ: <span lang="en">${esc(r.answer)}</span>. Верный: <b lang="en">${esc(r.correct)}</b>.<br>`:''}${esc(r.why)}</li>`).join('')}</ul>${m.media?`<p class="media-summary">Детали записи: ${esc(m.media.summary)}</p>`:''}${m.id==='pairs'?'<button id="memory-open">Бонус: сыграть в Memory →</button><p class="muted">Закрепи пары по памяти. Игра не меняет результат проверки.</p>':''}</div>`;
  }
  function openMemory(pairs){
    const dialog=document.createElement('dialog');dialog.className='memory-dialog';dialog.setAttribute('aria-labelledby','memory-title');
    document.body.append(dialog);let cards,flipped,found,moves;
    function reset(){cards=shuffle(pairs.flatMap((p,i)=>p.map(text=>({text,pair:i}))),active.id+Date.now());flipped=[];found=new Set();moves=0;render();}
    function render(){
      dialog.innerHTML=`<div class="memory-head"><h2 id="memory-title">Memory: собери пары</h2><button id="memory-close" aria-label="Закрыть игру">Закрыть</button></div><p>Открывай по две карточки и находи соответствия из задания. Время не ограничено.</p><div class="memory-grid">${cards.map((c,i)=>{const open=flipped.includes(i)||found.has(c.pair);return `<button class="memory-card${open?' revealed':''}" data-card="${i}" aria-label="${open?esc(c.text):'Закрытая карточка '+(i+1)}" ${found.has(c.pair)?'disabled':''}>${open?esc(c.text):'?'}</button>`;}).join('')}</div><p id="memory-status" role="status">${found.size===4?`Все пары найдены за ${moves} ходов!`:flipped.length===2?`Пара не совпала. Нажми следующую карточку. Найдено ${found.size}/4.`:`Найдено ${found.size}/4 · Ходов: ${moves}`}</p><button id="memory-again">Сыграть заново</button>`;
      dialog.querySelector('#memory-close').onclick=()=>dialog.close();dialog.querySelector('#memory-again').onclick=reset;
      dialog.querySelectorAll('[data-card]').forEach(b=>b.onclick=()=>{
        const i=+b.dataset.card;if(flipped.length===1&&flipped[0]===i)return;
        if(flipped.length===2)flipped=[];flipped.push(i);
        if(flipped.length===2){moves++;if(cards[flipped[0]].pair===cards[flipped[1]].pair){found.add(cards[i].pair);flipped=[];}}
        render();(dialog.querySelector(`[data-card="${i}"]:not(:disabled)`)||dialog.querySelector('[data-card]:not(:disabled)')||dialog.querySelector('#memory-again')).focus();
      });
    }
    dialog.addEventListener('close',()=>{dialog.remove();main.querySelector('#memory-open')?.focus();});reset();dialog.showModal();
  }
  function openMission(n){stopMedia();missionIndex=Math.max(0,Math.min(7,n));active.mission=missionIndex;selectedPair=null;save();history.replaceState(null,'',`review.html?attempt=${encodeURIComponent(active.id)}&mission=${missionIndex}`);renderQuest();main.querySelector('.mission h2').setAttribute('tabindex','-1');main.querySelector('.mission h2').focus();main.querySelector('.mission').scrollIntoView({block:'start',behavior:'instant'});}
  function finalHTML(){return `<div class="final-tasks"><section><p class="unit-label">Speaking · 30–60 секунд</p><h3>Расскажи вслух</h3><p>${esc(unit.speaking)}</p><label for="speaking">Твой план ответа или заметки преподавателя<textarea id="speaking" rows="5" maxlength="4000">${esc(active.speaking)}</textarea></label></section><section><p class="unit-label">Writing · 5–10 минут</p><h3>Напиши сам</h3><p>${esc(unit.writing)}</p><label for="writing">Твой текст на английском<textarea id="writing" lang="en" rows="7" maxlength="6000">${esc(active.writing)}</textarea></label></section></div><aside class="rubric"><h3>На что обратит внимание преподаватель</h3><ul>${unit.rubric.map(r=>`<li>${esc(r)}</li>`).join('')}</ul><p>Речь и письмо не входят в автоматический балл. План ответа не подтверждает выполнение устной части.</p></aside><div class="mission-actions"><button id="finish" class="primary">Посмотреть результат →</button></div>`;}
  function bindFinal(){for(const k of ['speaking','writing'])main.querySelector('#'+k).oninput=e=>{active[k]=e.target.value;save();};main.querySelector('#finish').onclick=renderReport;}
  function results(){return unit.missions.slice(0,7).map(m=>({m,first:work(m).first?grade(m,work(m).first.answers):null,current:work(m).current?grade(m,work(m).current.answers):null}));}
  function renderReport(){
    stopMedia();const rows=results(),done=rows.filter(r=>r.first).length,score=rows.reduce((n,r)=>n+(r.first?.score||0),0),total=rows.reduce((n,r)=>n+points(r.m),0),complete=done===7;
    const pending=rows.filter(r=>!r.first),weak=rows.filter(r=>r.first&&r.first.score<r.first.total);
    main.innerHTML=`<section class="report"><a class="back" href="review.html?unit=${unit.id}">← Все квесты</a><p class="eyebrow">${mode(active)} · Unit ${unit.id}</p><h1 tabindex="-1">${complete?'Твой результат':'Квест ещё в пути'}</h1><p>${esc(active.name||'Без имени')} · ${esc(unit.title)}</p><div class="result-score"><strong>${score}<span> / ${total}</span></strong><div><b>${complete?'Первая проверка':'Промежуточный результат'}</b><p>${done} из 7 миссий проверено.${complete?'':' Непройденные миссии ещё не оценены.'}</p></div></div>${complete?`<p class="reward">Маршрут собран: ${esc(unit.reward)}. ${score>=20?'Основные задания получились. Закрепи их в финальном вызове.':'Вернись к темам ниже и обсуди вопросы с преподавателем.'}</p>`:''}<div class="table-scroll"><table><caption>Результаты по навыкам</caption><thead><tr><th>Миссия / навык</th><th>Первая проверка</th><th>После исправлений</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.m.name)}<small>${esc(r.m.skill)}</small></td><td>${r.first?`${r.first.score} / ${r.first.total}`:'Не пройдена'}</td><td>${r.current?`${r.current.score} / ${r.current.total}`:'Нет проверки'}</td></tr>`).join('')}</tbody></table></div>
      ${pending.length?`<section><h2>Осталось пройти</h2><div class="report-links">${pending.map(r=>`<button data-go="${unit.missions.indexOf(r.m)}">${esc(r.m.name)} →</button>`).join('')}</div></section>`:''}
      <section><h2>Что повторить</h2>${weak.length?`<ul>${weak.map(r=>`<li><button class="text-button" data-go="${unit.missions.indexOf(r.m)}">${esc(r.m.name)}: ${esc(r.m.skill.toLowerCase())} →</button></li>`).join('')}</ul>`:`<p>${complete?'В проверенных заданиях ошибок нет. Теперь проверь речь и письмо с преподавателем.':'В уже проверенных миссиях ошибок нет.'}</p>`}<p>${esc(unit.focus)}</p><a href="index.html?unit=${unit.id}&book=sb">Повторить Unit ${unit.id} в учебнике →</a></section>
      <section><h2>Речь и письмо</h2><p>Проверяет преподаватель. Автоматический балл не оценивает разговорный английский.</p><p>План устного ответа: ${active.speaking?.trim()?'сохранён':'не добавлен'}. Письменный ответ: ${active.writing?.trim()?'сохранён':'не добавлен'}.</p><button data-go="7">Открыть финальный вызов →</button></section>
      ${complete||active.mode==='practice'?`<details class="answer-review"><summary>Разбор первой проверки</summary>${rows.filter(r=>r.first).map(r=>`<section><h3>${esc(r.m.name)}</h3>${r.first.rows.map(x=>`<p><b>${x.ok?'✓':'↺'} ${esc(x.prompt)}</b><br>Ответ: ${esc(x.answer)}${x.ok?'':` → ${esc(x.correct)}`}<br>${esc(x.why)}</p>`).join('')}</section>`).join('')}</details>`:'<p>Разбор ответов появится после семи миссий. В режиме проверки ответы изменить нельзя.</p>'}
      <div class="mission-actions"><button id="download" class="primary">Скачать отчёт</button><button id="continue">Продолжить квест</button><a href="review.html?unit=${unit.id}">Новое прохождение</a></div><p class="muted">Отчёт содержит ответы, баллы первой проверки, исправления и текст финального задания. Передай файл преподавателю самостоятельно.</p></section>`;
    main.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>openMission(+b.dataset.go));main.querySelector('#continue').onclick=()=>openMission(missionIndex);main.querySelector('#download').onclick=download;focusTitle();
  }
  function download(){
    const rows=results(),complete=allDone(),allowKeys=active.mode==='practice'||complete;
    const lines=['SPEAKOUT A1 • REVIEW QUEST',`Ученик: ${active.name||'Без имени'}`,`Unit ${unit.id}: ${unit.name} • ${unit.title}`,`Режим: ${mode(active)}`,`Начало: ${new Date(active.started).toLocaleString('ru-RU')}`,`Статус: ${complete?'Все 7 автоматических миссий пройдены':'Неполное прохождение'}`,'','ПЕРВАЯ ПРОВЕРКА (сохранена до исправлений)'];
    for(const r of rows){
      lines.push('',`${r.m.name} / ${r.m.skill}: ${r.first?`${r.first.score}/${r.first.total}`:'не проверено'}`);
      if(r.first)r.first.rows.forEach(x=>lines.push(`Вопрос: ${x.prompt}`,`Ответ: ${x.answer}`,...(allowKeys?[`Верно: ${x.ok?'да':'нет'}`,`Ключ: ${x.correct}`,`Пояснение: ${x.why}`]:[])));
      else if(Object.keys(work(r.m).answers).length)lines.push('Есть незавершённые ответы: '+JSON.stringify(work(r.m).answers));
      if(r.current&&r.first){lines.push(`Последняя проверка: ${r.current.score}/${r.current.total}`);r.current.rows.forEach((x,i)=>{if(x.answer!==r.first.rows[i].answer)lines.push(`Исправление: ${x.prompt}`,`Новый ответ: ${x.answer}`);});}
    }
    const score=rows.reduce((n,r)=>n+(r.first?.score||0),0);lines.push('',`Первая проверка: ${score}/24. Проверено ${rows.filter(r=>r.first).length}/7 миссий.`,'',`SPEAKING: ${unit.speaking}`,active.speaking||'План / заметки не добавлены.','Устное выполнение должен подтвердить преподаватель.','',`WRITING: ${unit.writing}`,active.writing||'Ответ не добавлен.','','Критерии для преподавателя:',...unit.rubric.map(r=>'• '+r),'Речь и письмо не оценены автоматически.','','Самопроверка в браузере; не является защищённым экзаменом.');
    const blob=new Blob(['\uFEFF'+lines.join('\n')],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`speakout-a1-unit-${unit.id}-review-${active.started.slice(0,10)}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Отчёт подготовлен для скачивания. Передай файл преподавателю.';
  }
  window.addEventListener('popstate',()=>{stopMedia();route();});
  route();booted=true;
})();
