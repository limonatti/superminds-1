/* Independent classroom warm-up. Never reads or writes course/student answer records. */
(() => {
  'use strict';
  const tasks = window.FOCUS3_QUEST, audioData = window.FOCUS3_AUDIO || {};
  const key = 'asya:focus3:style-quest:2026-11-19:v1';
  const q = s => document.querySelector(s), esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let saved = {}, current = Math.max(0, Math.min(9, Math.floor(Number(new URLSearchParams(location.search).get('step')) || 1) - 1)), selected = null, muted = false;
  try { saved = JSON.parse(localStorage.getItem(key) || '{}'); if (!saved || typeof saved !== 'object' || Array.isArray(saved)) saved = {}; }
  catch { saved = {}; q('#storageWarning').hidden = false; }
  function state() { const t = tasks[current]; if (!saved[t.id] || typeof saved[t.id] !== 'object') saved[t.id] = {}; const s = saved[t.id]; s.answers ||= {}; s.chosen ||= []; s.order ||= []; s.checks ||= []; return s; }
  function persist() { try { localStorage.setItem(key, JSON.stringify(saved)); } catch { q('#storageWarning').hidden = false; } progress(); }
  function progress() { const n = tasks.filter(t => saved[t.id]?.done).length; q('#progress').textContent = `Выполнено ${n} из 10`; q('#finished').hidden = n !== 10; q('#taskSelect').innerHTML = tasks.map((t,i) => `<option value="${i}" ${i===current?'selected':''}>${i+1}. ${esc(t.title)}${saved[t.id]?.done?' · готово':''}</option>`).join(''); q('#prevTask').disabled = current===0; q('#nextTask').disabled = current===9; }
  function changed() { const s = state(); s.done = false; s.message = ''; s.kind = ''; persist(); }
  function feedback(text, kind) { const s=state(); s.message=text; s.kind=kind; persist(); q('#feedback').textContent=text; q('#feedback').dataset.kind=kind; }
  function toggle(arr,value) { const i=arr.indexOf(value); if(i<0)arr.push(value);else arr.splice(i,1); }
  function sound(id, model=false) {
    const a=audioData[id]; if(!a)return '';
    return `<section class="audio-block ${model?'model-audio':''}" aria-label="${esc(a.label)}"><strong>${esc(a.label)}</strong><p class="selection-note">${esc(a.source)}</p><audio id="questAudio" controls preload="metadata" ${muted?'muted':''} src="${esc(a.file)}"></audio><div class="audio-tools"><button type="button" id="repeatAudio">Повторить с начала</button><button type="button" id="muteAudio" aria-pressed="${muted}">${muted?'Включить звук':'Без звука'}</button></div><p id="audioError" class="notice" hidden>Не удалось загрузить запись. Открой текстовую опору или <a href="${esc(a.file)}" download>скачай MP3</a>.</p><details><summary>${esc(a.textLabel)}</summary><p class="transcript" lang="en">${esc(a.text)}</p></details></section>`;
  }
  function bankAudio(t,s) {
    return s.attempted?sound(t.audio):'<p class="selection-note">Сначала заполни все семь пропусков и проверь свою попытку. Затем откроются запись 1.3 и фразы для сверки и повторения.</p>';
  }
  function picture(t) { return `<figure class="visual ${t.image.includes('flatlay')?'wide':'portrait'}" style="margin:0"><img src="assets/${t.image}" alt="${esc(t.alt)}" width="${t.image.includes('flatlay')?'1536':'1122'}" height="${t.image.includes('flatlay')?'1024':'1402'}"><details><summary>Описание иллюстрации</summary><p>${esc(t.description)}</p></details></figure>`; }
  function button(text,attrs='',pressed=false) { return `<button type="button" ${attrs} aria-pressed="${pressed}">${text}</button>`; }
  function content(t,s) {
    if(t.type==='sort')return `<div class="card-bank" aria-label="Слова">${t.items.map(([word],i)=>button(`${esc(word)}${s.answers[i]!==undefined?`<small>${esc(t.categories[s.answers[i]])}</small>`:''}`,`data-word="${i}"`,selected===i)).join('')}</div><p class="selection-note">${selected===null?'Выбери слово, затем категорию.':'Куда отнести '+esc(t.items[selected][0])+'?'}</p><div class="category-buttons" aria-label="Категории">${t.categories.map((cat,i)=>`<button type="button" data-category="${i}" ${selected===null?'disabled':''}>${esc(cat)}</button>`).join('')}</div>`;
    if(t.type==='multi')return `<div class="choice-grid" aria-label="Вещи на иллюстрации">${t.options.map((v,i)=>button(esc(v),`data-multi="${i}"`,s.chosen.includes(i))).join('')}</div><p class="selection-note">Выбрано: ${s.chosen.length} из ${t.correct.length}</p>`;
    if(t.type==='match')return `<p class="selection-note">${selected===null?'Выбери выражение слева.':'Теперь выбери пару справа.'}</p><div class="match-grid"><div class="match-column" aria-label="Выражения">${t.pairs.map(([left],i)=>button(`${esc(left)}${s.answers[i]!==undefined?`<small>Твой выбор: ${esc(t.pairs[s.answers[i]][1])}</small>`:''}`,`data-left="${i}"`,selected===i)).join('')}</div><div class="match-column" aria-label="Значения">${t.order.map(i=>button(esc(t.pairs[i][1]),`data-right="${i}"`,Object.values(s.answers).includes(i))).join('')}</div></div>`;
    if(t.type==='bank')return `<p lang="en" class="personal-model">He/she …</p><p class="source-example" lang="en">1. ${esc(t.example)} <span lang="ru">(пример)</span></p><div class="gap-lines">${t.gaps.map((g,i)=>`<p lang="en">${g.n}. ${esc(g.before)} <button type="button" data-gap="${i}" aria-label="Пропуск ${g.n}: ${esc(g.before)} … ${esc(g.after)}. ${s.answers[i]?'Выбрано: '+esc(s.answers[i]):'Не заполнено'}" aria-pressed="${selected===i}">${esc(s.answers[i]||'…')}</button> ${esc(g.after)}</p>`).join('')}</div><p id="bankSelection" class="selection-note" role="status">${selected===null?'Выбери пропуск, затем слово из банка.':'Выбран пропуск '+t.gaps[selected].n+'. Теперь выбери слово.'}</p><div class="card-bank" aria-label="Слова из Style trial quiz">${t.bank.map((word,i)=>`<button type="button" data-bank-word="${i}" ${selected===null?'disabled':''}>${esc(word)}</button>`).join('')}</div><div id="bankAudio">${bankAudio(t,s)}</div>`;
    if(t.type==='questions')return `${t.audio?sound(t.audio):''}${t.questions.map((item,i)=>`<fieldset class="question"><legend lang="en">${i+1}. ${esc(item.q)}</legend><div class="choice-grid">${item.options.map((v,j)=>button(esc(v),`data-question="${i}" data-option="${j}"`,s.answers[i]===j)).join('')}</div></fieldset>`).join('')}`;
    if(t.type==='order')return `<div class="order-answer" aria-label="Твой ответ">${s.order.length?s.order.map((i,j)=>`<button type="button" data-remove="${j}" aria-label="Убрать ${esc(t.tokens[i])}">${esc(t.tokens[i])}</button>`).join(''):'<span class="empty">Здесь появится твоя фраза</span>'}</div><div class="card-bank" aria-label="Карточки слов">${t.order.filter(i=>!s.order.includes(i)).map(i=>`<button type="button" data-token="${i}">${esc(t.tokens[i])}</button>`).join('')}</div>`;
    if(t.type==='personal')return `<fieldset class="question"><legend>Где ты собираешься быть?</legend><div class="choice-grid">${t.occasions.map((v,i)=>button(esc(v),`data-occasion="${i}"`,s.occasion===i)).join('')}</div></fieldset><fieldset class="question"><legend>Что ты выберешь? Минимум две вещи.</legend><div class="choice-grid">${t.options.map((v,i)=>button(esc(v),`data-personal="${i}"`,s.chosen.includes(i))).join('')}</div></fieldset><p class="personal-model" lang="en">I would wear ${s.chosen.length?s.chosen.map(i=>esc(t.options[i])).join(' and '):'…'} because …</p><p class="selection-note">Обсуди свой выбор с преподавателем, затем отметь выполнение.</p>`;
    if(t.type==='oral')return `<div class="choice-grid" aria-label="Кого описывать">${['Человек слева','Человек справа'].map((v,i)=>button(v,`data-person="${i}"`,s.person===i)).join('')}</div><p class="personal-model" lang="en">This is … . He / She has … .<br>He / She wears … . He / She is … because … .</p><div class="check-list">${t.checklist.map((v,i)=>`<label><input type="checkbox" data-spoken="${i}" ${s.checks.includes(i)?'checked':''}>${esc(v)}</label>`).join('')}</div><details class="model-audio"><summary>Повторить слова о характере перед рассказом</summary>${sound(t.audio,true)}</details>`;
    return '';
  }
  function render(focusSelector) {
    const old=q('#questAudio'); if(old)old.pause();
    const t=tasks[current],s=state();
    q('#task').innerHTML=`<div class="task-meta"><span class="task-number">${String(current+1).padStart(2,'0')} / 10 · ${t.format}</span><span>${esc(t.source)}</span></div><h2 id="taskTitle" tabindex="-1">${esc(t.title)}</h2><p class="instruction">${esc(t.instruction)}</p><div class="task-layout ${t.image?'with-image':''}">${t.image?picture(t):''}<div class="work-area">${content(t,s)}<div class="task-actions"><button type="button" class="primary" id="checkTask">${['personal','oral'].includes(t.type)?'Я рассказал(а)':'Проверить задание'}</button><button type="button" id="hintTask" aria-expanded="false" aria-controls="taskHint">Подсказка</button><button type="button" class="linkish small" id="resetTask">Начать задание заново</button></div><p id="feedback" class="feedback" role="status" aria-live="polite" data-kind="${s.kind||''}">${esc(s.message||'')}</p><div id="taskHint" class="hint" hidden>${esc(t.hint)}</div></div></div>`;
    progress(); bind(); if(focusSelector)q(focusSelector)?.focus({preventScroll:true});
  }
  function check() {
    const t=tasks[current],s=state();let all=false,correct=false;
    if(t.type==='bank'){all=t.gaps.every((_,i)=>typeof s.answers[i]==='string'&&s.answers[i].length>0);correct=t.gaps.every((g,i)=>s.answers[i]===g.answer);if(all&&!s.attempted){s.attempted=true;q('#bankAudio').innerHTML=bankAudio(t,s);bindAudio();}}
    if(t.type==='sort'){all=t.items.every((_,i)=>s.answers[i]!==undefined);correct=t.items.every((v,i)=>s.answers[i]===v[1]);}
    if(t.type==='multi'){all=s.chosen.length===t.correct.length;correct=all&&t.correct.every(i=>s.chosen.includes(i));}
    if(t.type==='match'){all=t.pairs.every((_,i)=>s.answers[i]!==undefined);correct=t.pairs.every((_,i)=>s.answers[i]===i);}
    if(t.type==='questions'){all=t.questions.every((_,i)=>s.answers[i]!==undefined);correct=t.questions.every((v,i)=>s.answers[i]===v.correct);}
    if(t.type==='order'){all=s.order.length===t.tokens.length;correct=all&&s.order.every((v,i)=>v===i);}
    if(t.type==='personal'){all=s.occasion!==undefined&&s.chosen.length>=2;if(!all)return feedback('Выбери ситуацию и хотя бы две вещи. Затем объясни свой выбор вслух.','retry');s.done=true;return feedback('Выполнено. Это твой выбор: обсудите с преподавателем, насколько ясно получилось его объяснить.','good');}
    if(t.type==='oral'){all=s.person!==undefined&&t.checklist.every((_,i)=>s.checks.includes(i));if(!all)return feedback('Выбери человека, расскажи о нём и отметь три пункта, которые удалось раскрыть.','retry');s.done=true;return feedback('Описание готово. Преподаватель поможет уточнить формулировки. Спасибо за твой рассказ!','good');}
    if(!all)return feedback(t.type==='multi'?`Отметь ровно ${t.correct.length} вещи.`:'Пока заполнено не всё. Закончи задание, затем проверь ответ.','retry');
    if(!correct){s.done=false;return feedback('Почти! Есть неточность. Пересмотри свой выбор или открой подсказку и попробуй ещё раз.','retry');}
    s.done=true;feedback('Получилось! Все ответы в этом задании верны. Можно переходить дальше.','good');
  }
  function bind() {
    q('#task').onclick=event=>{
      const b=event.target.closest('button');if(!b)return; const d=b.dataset,s=state();
      if('gap' in d){selected=+d.gap;q('#task').querySelectorAll('[data-gap]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));q('#task').querySelectorAll('[data-bank-word]').forEach(x=>x.disabled=false);q('#bankSelection').textContent='Выбран пропуск '+tasks[current].gaps[selected].n+'. Теперь выбери слово.';return;}
      if('bankWord' in d&&selected!==null){const t=tasks[current],word=t.bank[+d.bankWord],slot=selected;Object.keys(s.answers).forEach(k=>{if(s.answers[k]===word)delete s.answers[k]});s.answers[slot]=word;selected=null;changed();q('#task').querySelectorAll('[data-gap]').forEach((x,i)=>{const g=t.gaps[i];x.textContent=s.answers[i]||'…';x.setAttribute('aria-pressed','false');x.setAttribute('aria-label',`Пропуск ${g.n}: ${g.before} … ${g.after}. ${s.answers[i]?'Выбрано: '+s.answers[i]:'Не заполнено'}`)});q('#task').querySelectorAll('[data-bank-word]').forEach(x=>x.disabled=true);q('#bankSelection').textContent='Слово вставлено. Можно выбрать следующий пропуск или заменить ответ.';q('#feedback').textContent='';q(`[data-gap="${slot}"]`).focus();return;}
      if('word' in d){selected=+d.word;return render(`[data-word="${selected}"]`);}
      if('category' in d&&selected!==null){s.answers[selected]=+d.category;selected=null;changed();return render('[data-word]');}
      if('multi' in d){toggle(s.chosen,+d.multi);changed();return render(`[data-multi="${d.multi}"]`);}
      if('left' in d){selected=+d.left;return render(`[data-left="${selected}"]`);}
      if('right' in d){if(selected===null)return feedback('Сначала выбери слово или выражение слева.','retry');Object.keys(s.answers).forEach(k=>{if(s.answers[k]===+d.right)delete s.answers[k]});s.answers[selected]=+d.right;selected=null;changed();return render('[data-left]');}
      if('question' in d){s.answers[d.question]=+d.option;changed();b.parentElement.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));q('#feedback').textContent='';return;}
      if('token' in d){s.order.push(+d.token);changed();return render('[data-token]');}
      if('remove' in d){s.order.splice(+d.remove,1);changed();return render('[data-token]');}
      if('occasion' in d){s.occasion=+d.occasion;changed();return render(`[data-occasion="${d.occasion}"]`);}
      if('personal' in d){toggle(s.chosen,+d.personal);changed();return render(`[data-personal="${d.personal}"]`);}
      if('person' in d){s.person=+d.person;changed();return render(`[data-person="${d.person}"]`);}
      if(b.id==='checkTask')return check();
      if(b.id==='resetTask'){saved[tasks[current].id]={};selected=null;persist();return render('#taskTitle');}
      if(b.id==='hintTask'){const h=q('#taskHint');h.hidden=!h.hidden;b.setAttribute('aria-expanded',String(!h.hidden));return;}
      if(b.id==='muteAudio'){const a=q('#questAudio');muted=!muted;a.muted=muted;b.setAttribute('aria-pressed',String(muted));b.textContent=muted?'Включить звук':'Без звука';return;}
      if(b.id==='repeatAudio'){const a=q('#questAudio');a.currentTime=0;const p=a.play();p?.catch(()=>q('#audioError').hidden=false);}
    };
    q('#task').onchange=event=>{const input=event.target;if(input.matches('[data-spoken]')){const s=state();toggle(s.checks,+input.dataset.spoken);changed();q('#feedback').textContent='';}};
    bindAudio();
  }
  function bindAudio() {
    const audio=q('#questAudio');if(audio){audio.muted=muted;audio.addEventListener('error',()=>q('#audioError').hidden=false);}
  }
  function navigate(i){current=i;selected=null;history.replaceState(null,'',location.pathname+'?step='+(i+1));render('#taskTitle');q('#taskTitle').scrollIntoView({block:'start',behavior:'instant'});}
  q('#prevTask').onclick=()=>{if(current>0)navigate(current-1)};q('#nextTask').onclick=()=>{if(current<9)navigate(current+1)};q('#taskSelect').onchange=e=>navigate(+e.target.value);
  render();
})();
