/* Outcomes-only presentation. Stored answer indices and original rubrics remain authoritative. */
(function(root){
'use strict';
const q=(s,host=document)=>host.querySelector(s),qa=(s,host=document)=>[...host.querySelectorAll(s)];
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let current=null,save=()=>{};
function isPersonal(e){return e.responseMode==='oral'||(e.check?.mode!=='items'&&e.kind!=='writing'&&!/\bwrite|\bcomplete|\bcorrect|\bspell|\bfill|\brewrite/i.test(e.instruction))}
function tracks(e,course,book,page){
 const text=root.OUTCOMES_INTERACTIONS?.[e.id]?.text||'';
 const explicit=e.audioTracks||e.practice?.tracks;
 if(explicit)return course.media.filter(m=>m.book===book&&explicit.map(String).includes(String(m.track)));
 const heading=text.split('\n').slice(0,3).join(' ');
 const sourceTracks=book==='wb'?course.media.filter(m=>m.book===book&&new RegExp(String(m.track).replace('.','\\.')+'\\b').test(heading)).map(m=>String(m.track)):[...heading.matchAll(/\b(\d{1,3})[\]|]?\s+(?:Listen|Read and listen|Learn to say|Work in pairs)/gi)].map(m=>m[1]);
 if(sourceTracks.length)return course.media.filter(m=>m.book===book&&sourceTracks.includes(String(m.track)));
 return course.media.filter(m=>m.book===book&&(sourceTracks.includes(String(m.track))||(/listen|repeat|pronunciation/i.test(e.instruction)&&m.pages.includes(page.page))));
}
function capture(previous={}){
 if(!current)return previous;
 return {...previous,mode:q('#answerMode')?.value||'tap',oneAtATime:!!q('#taskOne')?.checked,step:current.step||0,stages:qa('[data-stage][aria-pressed="true"]').map(b=>b.dataset.stage),helpUsed:!!current.helpUsed,optionalNotes:q('#personalNotes')?.value??previous?.optionalNotes??''};
}
function enhance({exercise:e,record,save:onSave,course}){
 current={e,step:record.practice?.step||0,helpUsed:record.practice?.helpUsed||false};save=onSave;
 const panel=q('.responsePanel'),fields=q('#responseFields'),ui=root.OutcomesInteractions.spec(e,root.OUTCOMES_INTERACTIONS?.[e.id]);
 const partsClickable=Object.entries(e.practice?.parts||{}).some(([i,parts])=>parts.some(p=>p.options)||e.practice.bank||e.practice.banks?.[i]);
 const toolbar=document.createElement('div');toolbar.className='practiceSettings';
 toolbar.innerHTML=`<label><input type="checkbox" id="taskOne" ${record.practice?.oneAtATime?'checked':''}> По одному пункту</label>${(partsClickable||ui.some(f=>f.options||f.kind==='order'))?'<label>Способ ответа <select id="answerMode"><option value="tap">Нажатия</option><option value="type">Ввод текста</option></select></label>':''}<label ${(partsClickable||ui.some(f=>f.kind==='order'||f.kind==='bank'||f.kind==='match'))?'':'hidden'}><input type="checkbox" id="taskDrag"> Перетаскивание</label><p>Нажатия работают пальцем, мышью и клавишами Tab + Enter. Переключение сохраняет ответы.</p>`;
 fields.before(toolbar);const helpStatus=document.createElement('p');helpStatus.id='practiceHelpStatus';helpStatus.setAttribute('role','status');helpStatus.textContent=current.helpUsed?'Попытка с подсказкой':'';toolbar.after(helpStatus);
 if(q('#answerMode')){q('#answerMode').value=record.practice?.mode||'tap';q('#answerMode').onchange=()=>{setMode();save()}}
 q('#taskDrag').onchange=()=>{qa('[data-token],[data-choice],[data-part-for]').forEach(b=>b.style.touchAction=q('#taskDrag').checked?'none':'pan-y')};
 const stepper=document.createElement('nav');stepper.className='responseStepper';stepper.setAttribute('aria-label','Пункты упражнения');stepper.innerHTML='<button type="button" data-step="-1" aria-label="Предыдущий пункт">←</button><span role="status" aria-live="polite"></span><button type="button" data-step="1" aria-label="Следующий пункт">→</button>';fields.before(stepper);
 qa('[data-step]',stepper).forEach(b=>b.onclick=()=>{current.step+=+b.dataset.step;showStep();save()});q('#taskOne').onchange=()=>{showStep();save()};
 for(const [i,parts] of Object.entries(e.practice?.parts||{}))splitField(+i,parts,e.practice?.banks?.[i]||e.practice?.bank);
 if(isPersonal(e)){if(q('#addResponse'))q('#addResponse').hidden=true;
  const old=qa('[data-response]',fields);if(e.responseMode!=='oral'){const details=document.createElement('details');details.className='optionalWriting';details.innerHTML='<summary>Мои заметки · по желанию</summary>';while(fields.firstChild)details.append(fields.firstChild);fields.append(details)}
  const activity=document.createElement('section');activity.className='personalPractice';
  const listening=/listen|repeat/i.test(e.instruction),speaking=/say|speak|talk|discuss|pairs|groups|partner|conversation|ask/i.test(e.instruction);
  const labels=listening?['Послушал(а) запись','Повторил(а) или ответил(а) вслух','Сравнил(а) с записью / примером']:speaking?['Выбрал(а) пример на странице','Составил(а) свой ответ вслух','Ответил(а) на все части задания']:['Рассмотрел(а) материал на странице','Подготовил(а) свой ответ','Сравнил(а) с примером / обсудил(а)'];
  activity.innerHTML='<h4>Мой маршрут</h4><p>Выполните задание на странице. Отмечайте пройденные шаги; это самопроверка без оценки.</p><div class="personalStages">'+labels.map((label,i)=>`<button type="button" data-stage="${i}" aria-pressed="${(record.practice?.stages||[]).includes(String(i))}">${safe(label)}</button>`).join('')+'</div>'+(e.responseMode==='oral'?`<details><summary>Заметка по желанию</summary><textarea id="personalNotes" aria-label="Личная заметка" rows="3">${safe(record.practice?.optionalNotes||'')}</textarea></details>`:'');fields.prepend(activity);
  qa('[data-stage]').forEach(b=>b.onclick=()=>{b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')!=='true');save()});if(q('#personalNotes'))q('#personalNotes').oninput=save;
 }
 // Source banks are explicit printed material, never answer-key-derived.
 if(e.practice?.helpBank?.length){const help=document.createElement('details');help.className='sourceHelp';help.innerHTML='<summary>Подсказка · слова из задания</summary><p>Этот режим помогает вспомнить слова. Использование подсказки сохраняется отдельно от самостоятельной попытки. Выберите поле, затем карточку.</p><div>'+e.practice.helpBank.map(word=>`<button type="button" data-help-word="${safe(word)}">${safe(word)}</button>`).join('')+'</div>';fields.before(help);let target=null;qa('[data-response]:not([type=hidden]),[data-part]').forEach(el=>el.addEventListener('focus',()=>target=el));help.ontoggle=()=>{if(help.open){current.helpUsed=true;q('#practiceHelpStatus').textContent='Попытка с подсказкой';save()}};qa('[data-help-word]',help).forEach(b=>b.onclick=()=>{if(!target){q('#checkSummary').textContent='Сначала выберите поле ответа.';return}target.value=[target.value.trim(),b.dataset.helpWord].filter(Boolean).join(' ');target.dispatchEvent(new Event('input',{bubbles:true}));target.focus({preventScroll:true})})}
 for(const audio of qa('.taskAudio'))addTranscript(audio,course);
 const context=document.createElement('details');context.className='sourceContext';context.innerHTML='<summary>Контекст · страницы к заданию</summary><p>Если задание ссылается на предыдущий текст, таблицу или фотографию, откройте нужную страницу.</p>';
 const book=course.books[e.book],page=book.pages.find(p=>p.page===e.page),at=book.pages.indexOf(page);
 const related=[...new Set([...book.pages.slice(Math.max(0,at-1),at+2).map(p=>p.page),...[...(root.OUTCOMES_INTERACTIONS?.[e.id]?.text||'').matchAll(/\bpages?\s+(\d{1,3})/gi)].map(m=>+m[1])])];
 for(const p of book.pages.filter(p=>related.includes(p.page))){const d=document.createElement('details');d.innerHTML=`<summary>Страница ${p.page}</summary><a href="${safe(p.image)}" target="_blank" rel="noopener">Открыть изображение крупно</a><img loading="lazy" src="${safe(p.image)}" alt="${e.book==='wb'?'Workbook':'Student’s Book'}, страница ${p.page}">`;context.append(d)}q('.exerciseSource').append(context);
 q('.exerciseSource').dataset.sourceFit='width';root.ExerciseSource.fit?.(q('.exerciseSource'));
 setMode();showStep();
}
function splitField(i,parts,bank){
 const input=q(`[data-response="${i}"]`),box=q(`#response-${i}`);if(!input||box.classList.contains('printedExample'))return;
 const values=input.value?input.value.split(/[,;]\s*/):[];if(input.tagName==='INPUT')input.type='hidden';input.hidden=true;
 qa('.exerciseChoices,.sentenceSlots,.wordPool',box).forEach(el=>el.remove());
 const group=document.createElement('div');group.className='partFields';
 group.innerHTML=parts.map((p,j)=>p.given?`<p class="printedExample">${safe(p.label||j+1)} · ${safe(p.given)} <small>пример в книге</small></p>`:`<label>${safe(p.label||'Пропуск '+(j+1))}<input data-part="${i}:${j}" value="${safe(values[j]||'')}" autocomplete="off" spellcheck="false" aria-label="Пункт ${safe(box.querySelector('label')?.textContent)} · ${safe(p.label||'пропуск '+(j+1))}"></label>${(p.options||bank)?.length?'<div class="partChoices">'+(p.options||bank).map(v=>`<button type="button" data-part-for="${i}:${j}" data-part-value="${safe(v)}" aria-pressed="false">${safe(v)}</button>`).join('')+'</div>':''}`).join('');input.before(group);
 const update=()=>{input.value=parts.map((p,j)=>p.given||q(`[data-part="${i}:${j}"]`)?.value||'').join((current.e.practice?.separator||',')+' ');input.dispatchEvent(new Event('input',{bubbles:true}));mark()};
 const mark=()=>qa('[data-part-for]',group).forEach(b=>b.setAttribute('aria-pressed',root.OutcomesGrader.normalize(q(`[data-part="${b.dataset.partFor}"]`).value)===root.OutcomesGrader.normalize(b.dataset.partValue)));
 qa('[data-part]',group).forEach(el=>el.oninput=update);qa('[data-part-for]',group).forEach(b=>b.onclick=()=>{q(`[data-part="${b.dataset.partFor}"]`).value=b.dataset.partValue;update()});qa('[data-part-for]',group).forEach(b=>partDrag(b,q(`[data-part="${b.dataset.partFor}"]`)));mark();
}
function partDrag(button,target){
 let ignoreClick=false;button.addEventListener('click',event=>{if(ignoreClick){event.preventDefault();event.stopImmediatePropagation()}},true);
 button.onpointerdown=event=>{if(!q('#taskDrag')?.checked||event.button!==0)return;const start=[event.clientX,event.clientY];let moved=false,ghost;button.setPointerCapture(event.pointerId);
 const clean=()=>{ghost?.remove();button.onpointermove=null;button.onpointerup=null;button.onpointercancel=null};
 button.onpointermove=move=>{if(!moved&&Math.hypot(move.clientX-start[0],move.clientY-start[1])<6)return;moved=true;move.preventDefault();if(!ghost){ghost=document.createElement('div');ghost.className='exerciseDragGhost';ghost.textContent=button.dataset.partValue;q('#modal').append(ghost)}ghost.style.left=move.clientX+12+'px';ghost.style.top=move.clientY+12+'px'};
 button.onpointerup=up=>{const hit=document.elementFromPoint(up.clientX,up.clientY);if(button.hasPointerCapture(up.pointerId))button.releasePointerCapture(up.pointerId);clean();if(!moved)return;ignoreClick=true;setTimeout(()=>ignoreClick=false,0);if(hit===target){target.value=button.dataset.partValue;target.dispatchEvent(new Event('input',{bubbles:true}))}};button.onpointercancel=clean;
 };
}
function setMode(){const typed=q('#answerMode')?.value==='type';q('.responsePanel')?.classList.toggle('typedAnswers',typed);qa('.responseField:not(.printedExample)').forEach(box=>{const input=q('[data-response]',box);if(!input)return;if(q('[data-part]',box)){qa('[data-part]',box).forEach(p=>p.readOnly=!typed&&!!q(`[data-part-for="${p.dataset.part}"]`,box));return;}const ui=root.OutcomesInteractions.spec(current.e,root.OUTCOMES_INTERACTIONS?.[current.e.id])[+input.dataset.response];if(input.tagName==='INPUT'&&['choice','multi','order','bank','match'].includes(ui?.kind)){input.type=typed||['bank','match'].includes(ui.kind)?'text':'hidden';input.readOnly=!typed&&['bank','match'].includes(ui.kind)}})}
function showStep(){const rows=qa('#responseFields > .responseField:not(.printedExample)'),enabled=q('#taskOne')?.checked&&rows.length>1;current.step=Math.max(0,Math.min(current.step,rows.length-1));rows.forEach((el,i)=>el.hidden=enabled&&i!==current.step);const nav=q('.responseStepper');nav.hidden=!enabled;q('span',nav).textContent=`Пункт ${current.step+1} из ${rows.length}`;q('[data-step="-1"]',nav).disabled=current.step===0;q('[data-step="1"]',nav).disabled=current.step>=rows.length-1}
function addTranscript(audio,course,host){const m=course.media.find(m=>audio.getAttribute('src')===m.path);if(!m)return;const entry=root.OUTCOMES_TRANSCRIPTS?.[m.book+':'+m.track];const d=document.createElement('details');d.className='audioTranscript';d.innerHTML=`<summary>Текст записи ${safe(m.track)}</summary><p>${entry?.kind==='printed'?'Текст / слова записи напечатаны в самом задании.':'Оригинальная расшифровка из книги. Номер трека указан на странице; продолжение может быть на следующей.'}</p>`;
 for(const region of entry?.regions||[]){const p=course.books[m.book].pages.find(p=>p.id===region.page);if(!p)continue;const [x,y,width,height]=region.box;d.insertAdjacentHTML('beforeend',`<svg class="transcriptCrop" role="img" aria-label="Оригинальный текст записи ${safe(m.track)} · стр. ${p.page}" viewBox="${x*1281} ${y*1643} ${width*1281} ${height*1643}"><image href="${safe(p.image)}" width="1281" height="1643"></image></svg>`)}
 for(const id of entry?.pages||[]){const p=course.books[m.book].pages.find(p=>p.id===id);if(!p)continue;d.insertAdjacentHTML('beforeend',`<a href="${safe(p.image)}" target="_blank" rel="noopener">Открыть текст крупно · стр. ${p.page}</a>${entry.regions?'<details><summary>Вся страница оригинала</summary>':''}<img loading="lazy" src="${safe(p.image)}" alt="Текст записи ${safe(m.track)}, страница ${p.page}">${entry.regions?'</details>':''}`)}
 if(!entry?.pages?.length)d.insertAdjacentHTML('beforeend','<p>Выберите раздел «Справочники и тексты» в книге.</p>');(host||audio.parentElement).append(d);
}
function partFeedback(i,results){results.forEach((r,j)=>{const input=q(`[data-part="${i}:${j}"]`);if(!input)return;input.setAttribute('aria-invalid',r==='incorrect');let feedback=q(`#part-feedback-${i}-${j}`);if(!feedback){feedback=document.createElement('small');feedback.id=`part-feedback-${i}-${j}`;input.after(feedback);input.setAttribute('aria-describedby',feedback.id)}feedback.textContent=({correct:'✓ Верно',incorrect:'Попробуйте ещё раз',blank:'Этот пропуск пока пустой'})[r]||''})}
q('#player')?.addEventListener('loadstart',()=>{let host=q('#playerTranscript');if(!host){host=document.createElement('div');host.id='playerTranscript';q('#audioPanel').append(host)}host.replaceChildren();addTranscript(q('#player'),root.OUTCOMES,host)});
root.OutcomesPractice={refresh:()=>{setMode();showStep()},partFeedback,isPersonal,tracks,capture,enhance,addTranscript};
})(window);
