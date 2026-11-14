(() => {
'use strict';
const D=window.FOCUS,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const params=new URLSearchParams(location.search), NS='focus-1:responses:v1';
let book=['wb','ws'].includes(params.get('book'))?params.get('book'):'sb',unit=params.get('unit')||'0',page=null,active=null,user=null,responses={},storageKey='',ready=false,syncTimer,queue=Promise.resolve(),workStore=null;
const M=window.FocusMarking;
let shownRecord='',previousAnswers=[],homework=null,submitting=false,assigner=null;
const H=window.FocusHW;H.setData(D);
const list=()=>D.pages.filter(p=>p.book===book&&String(p.unit)===String(unit));
function status(text){$('#saveStatus').textContent=text;}
function merge(a,b){const out={...a};Object.entries(b||{}).forEach(([k,v])=>{if(!out[k]||(v.updatedAt||0)>(out[k].updatedAt||0))out[k]=v;});return out;}
function persist(){if(workStore){workStore.capture(responses);responses=workStore.records;if(active)shownRecord=JSON.stringify(responses[active.id]||{});}renderProgress();}
function sync(){persist();return workStore.flush();}
function renderProgress(){renderHomework();const all=D.pages.filter(p=>p.unit===page?.unit).flatMap(p=>p.exercises);const done=all.filter(e=>(responses[e.id]?.values?.some(v=>v.trim())||responses[e.id]?.reflection?.trim())).length;$('#progress').textContent=`${done} из ${all.length} упражнений с ответами в этом разделе.`;}
function url(){const q=new URLSearchParams(location.search);q.set("book",book);q.set("unit",unit);q.set("page",page.page);q.delete("ex");return location.pathname+"?"+q;}
function render(){
 if(!page||page.book!==book||String(page.unit)!==String(unit))page=list()[0];
 if(!page){unit='0';page=list()[0];}
 const nextUrl=new URL(url(),location.href);for(const key of ['embedded','lessonRole','hw'])if(params.has(key))nextUrl.searchParams.set(key,params.get(key));history.replaceState(null,'',nextUrl);
 $('#heading').textContent=unit==='extra'?(page.bank||'Дополнительные материалы'):(unit==='0'?'Intro Unit':`Unit ${unit} · ${D.units[Number(unit)]}`);
 $('#units').innerHTML=D.units.map((t,i)=>`<button data-unit="${i}" class="${String(i)===String(unit)?'active':''}" aria-pressed="${String(i)===String(unit)}">${i===0?'Intro':i+' · '+esc(t)}</button>`).join('')+`<button data-unit="extra" aria-pressed="${unit==='extra'}">Reference & banks</button>`;
 $$('#units button').forEach(b=>b.onclick=()=>{unit=b.dataset.unit;page=null;render();});
 $$('[data-book]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.book===book));
 $('#pages').innerHTML=list().map(p=>`<option value="${p.id}" ${p.id===page.id?'selected':''}>${p.page} · ${esc(p.title)}</option>`).join('');
 $('#prev').disabled=list().indexOf(page)===0;$('#next').disabled=list().indexOf(page)===list().length-1;
 $('#pageImage').src=page.image;$('#pageImage').alt=`${book==='sb'?'Student’s Book':book==='ws'?'Word Store':'Workbook'}, страница ${page.page}`;$('#imageError').hidden=true;
 $('#hotspots').innerHTML=page.exercises.map(e=>`<button class="hotspot ${responses[e.id]?'done':''}" data-ex="${e.id}" style="left:${e.x*100}%;top:${e.y*100}%" aria-label="Открыть упражнение ${e.label}">${e.label}</button>`).join('');
 window.ExerciseSource.regions($('#hotspots'),page.exercises.map(e=>e.box));
 $('#exerciseList').innerHTML=page.exercises.length?page.exercises.map(e=>`<button class="exercise-link" data-ex="${e.id}">Упражнение ${e.label}<span>${responses[e.id]?'Есть ответ':e.marking.mode==='mixed'?'Проверка + свой ответ':e.answerSpec?.length?'Автопроверка':'Свой ответ'}</span></button>`).join(''):'<p>Справочная страница. Слова доступны в словаре и карточках.</p>';
 $$('[data-ex]').forEach(b=>b.onclick=()=>assigner?.mode?assigner.toggle(b.dataset.ex):openExercise(b.dataset.ex));$('#count').textContent=page.exercises.length;
 $('#audio').innerHTML=page.tracks.length?page.tracks.map(t=>`<label>Трек ${esc(t)}<audio controls preload="none" src="media/sb-${t}.mp3"></audio></label>`).join(''):book==='wb'?'<p>В этой книге задания выполняются по текстам и диалогам на странице.</p>':'<p>Выбери аудио по номеру трека в учебнике.</p>';
 $('#allTracks').innerHTML='<option value="">Выбери трек</option>'+D.tracks[book==='ws'?'sb':book].map(t=>`<option value="${t}">${book.toUpperCase()} · ${t}</option>`).join('');$('#libraryAudio').pause();$('#libraryAudio').removeAttribute('src');
 $('#trainer').href='../trainer.html?course=focus-1'+(unit==='extra'?'':'&unit=f1-u'+unit);$('#vocabulary').href='../vocabulary.html?course=focus-1';
 $('#curtain').hidden=true;$('#cover').setAttribute('aria-pressed','false');renderProgress();assigner?.refresh();
}
function openExercise(id){
 $$('audio').forEach(a=>a.pause());
 active=page.exercises.find(e=>e.id===id)||(D.legacyExercises||[]).find(e=>e.id===id&&e.book===page.book&&e.page===page.page);if(!active||!ready)return;shownRecord=JSON.stringify(responses[active.id]||{});const q=new URL(location.href);q.searchParams.set('ex',id);history.replaceState(null,'',q);
 $('#exerciseTitle').textContent=`Упражнение ${active.label}`;$('#exerciseLocation').textContent=`${book==='sb'?'Student’s Book':book==='ws'?'Word Store':'Workbook'} · стр. ${page.page}`;
 $('#exerciseAudio').innerHTML=(active.tracks||[]).map(t=>`<div class="exercise-track"><label>Трек ${esc(t)}<audio controls preload="metadata" src="media/sb-${t}.mp3"></audio></label><button type="button" class="audio-repeat">Повторить сначала</button>${D.transcripts?.[t]?`<details class="audio-transcript"><summary>Текст записи</summary><div>${esc(typeof D.transcripts[t]==='string'?D.transcripts[t]:D.transcripts[t].text)}</div></details>`:''}</div>`).join('');
 $$('#exerciseAudio .audio-repeat').forEach(b=>b.onclick=()=>{const a=b.parentElement.querySelector('audio');a.currentTime=0;a.play().catch(()=>{});});
 window.FocusVideo.mount($('#exerciseAudio'),page,D,active);
 const restored=M.saved(active,responses[id]);previousAnswers=restored.previous;
 const vals=restored.values,spec=active.answerSpec||[],automatic=spec.length>0,mixed=active.marking.mode==='mixed';
 $('#instruction').textContent=active.activity?.instruction||active.marking.instruction||(automatic?'Выполни задание по оригиналу. Номера полей соответствуют пунктам упражнения.':'Выполни задание по оригиналу. Сохрани свой ответ или заметки.');
 if(mixed)$('#instruction').textContent+=' Собственные примеры и объяснения можно проговорить; заметки необязательны.';
 $('#fields').innerHTML=window.FocusActivity.render(active,vals);
 if(mixed)$('#fields').insertAdjacentHTML('beforeend',`<button type="button" id="oralComplete" aria-pressed="${restored.reflection.includes('Свободная часть выполнена устно.')}">Свободную часть выполнил(а) устно ✓</button><details class="guided-notes"><summary>Свои примеры и объяснения</summary><label class="reflection-label" for="reflection">Необязательные заметки для преподавателя</label><textarea id="reflection" maxlength="12000" placeholder="Примеры, вопросы, объяснение…">${esc(restored.reflection)}</textarea></details>`);
 if(previousAnswers.length)$('#fields').insertAdjacentHTML('beforeend',`<details class="previous-answers"><summary>Ранее сохранённые ответы</summary><p>Поля задания уточнены. Твои предыдущие ответы сохранены; перенеси нужные в новые поля для проверки.</p>${previousAnswers.map(r=>`<ol>${r.values.map((v,i)=>`<li>${r.labels?.[i]?esc(r.labels[i])+': ':''}${esc(v||'—')}</li>`).join('')}</ol>${r.reflection?`<p>${esc(r.reflection)}</p>`:''}`).join('')}</details>`);
 $('#check').hidden=!automatic;$('#keyPanel').hidden=!active.key||(!assigner?.allowed&&!(responses[id]?.score&&responses[id]?.answerVersion===active.answerVersion)&&!vals.some(v=>v.trim()));$('#keyPanel').open=false;$('#keyText').textContent=active.key;$('#feedback').textContent='';
 $$('[data-answer],#reflection').forEach(el=>el.addEventListener('input',()=>{clearMarking();save(false);}));
 $('#oralComplete')?.addEventListener('click',ev=>{const field=$('#reflection'),marker='Свободная часть выполнена устно.',done=field.value.includes(marker);field.value=done?field.value.replace(marker,'').trim():[field.value,marker].filter(Boolean).join('\n');ev.currentTarget.setAttribute('aria-pressed',String(!done));field.dispatchEvent(new Event('input',{bubbles:true}));});
 window.ExerciseSource.columns($('#exercise'),$('#solutionColumns'),$('#solutionOriginal'),$('#solutionColumns .focus-responses'));if(!$('#exercise').open)$('#exercise').showModal();window.FocusSource.mount($('#solutionOriginal'),active.id);window.FocusActivity.bind($('#fields'),active);updateExerciseNavigation();updateAssignMarkers();

}

function exerciseSequence(){return D.pages.filter(p=>p.book===book).flatMap(p=>p.exercises.map(e=>({page:p,id:e.id})));}
function updateExerciseNavigation(){const all=exerciseSequence(),i=all.findIndex(e=>e.id===(active?.canonicalId||active?.id));$('#exercisePrev').disabled=i<=0;$('#exerciseNext').disabled=i<0||i===all.length-1;$('#solutionColumns').scrollTop=0;$('#solutionColumns .focus-responses').scrollTop=0;}
function moveExercise(delta){const all=exerciseSequence(),i=all.findIndex(e=>e.id===(active?.canonicalId||active?.id)),next=all[i+delta];if(!next)return;page=next.page;unit=String(page.unit);render();openExercise(next.id);}
$('#exercisePrev').onclick=()=>moveExercise(-1);$('#exerciseNext').onclick=()=>moveExercise(1);
$$('[data-exercise-pane]').forEach(button=>button.onclick=()=>{$('#exercise').dataset.pane=button.dataset.exercisePane;$$('[data-exercise-pane]').forEach(b=>b.setAttribute('aria-selected',String(b===button)))});

function clearMarking(){$$('.answer-row').forEach(row=>{row.classList.remove('correct','incorrect');row.querySelector('.answer-result')?.remove();row.querySelector('[data-answer]')?.removeAttribute('aria-invalid');});$('#feedback').textContent='';}
function save(explicit){
 if(!active||!ready)return;
 const values=$$('[data-answer]').map(e=>e.value),old=responses[active.id];
 const score=old?.answerVersion===active.answerVersion&&JSON.stringify(old.values)===JSON.stringify(values)?old.score:undefined;
 responses[active.id]={values,score,checks:old?.checks||[],reflection:$('#reflection')?.value||'',previousAnswers,answerVersion:active.answerVersion,fieldLabels:(active.answerSpec||[]).map(f=>f.label),updatedAt:Date.now(),page:page.page,book,unit:page.unit,exercise:active.label};
 persist();$('#keyPanel').hidden=!active.key||(!assigner?.allowed&&!values.some(v=>v.trim()));clearTimeout(syncTimer);if(user)syncTimer=setTimeout(sync,1800);
 if(explicit)$('#feedback').textContent=user?'Ответ сохранён. Синхронизация с аккаунтом…':'Ответ сохранён на этом устройстве.';
}
$('#answerForm').onsubmit=ev=>{
 ev.preventDefault();const spec=active?.answerSpec;if(!spec?.length){save(true);return;}
 const values=$$('[data-answer]').map(el=>el.value);save(false);
 if(values.some(v=>!v.trim())){$('#feedback').textContent='Сначала заполни все поля для автопроверки. Черновик сохранён.';return;}
 const results=values.map((v,i)=>M.checkField(v,spec[i])),correct=results.filter(Boolean).length;
 $$('.answer-row').forEach((row,i)=>{const ok=results[i];row.classList.toggle('correct',ok);row.classList.toggle('incorrect',!ok);row.querySelector('[data-answer]').setAttribute('aria-invalid',String(!ok));row.querySelector('.answer-result')?.remove();const result=document.createElement('span');result.className='answer-result';result.textContent=ok?'Верно':'Проверь ответ и форму записи';row.append(result);});
 $('#feedback').textContent=`${active.marking.mode==='mixed'?'Закрытая часть. ':''}Верно: ${correct} из ${values.length}.${active.marking.mode==='mixed'?' Свободную часть проверяет преподаватель.':''}`;
 responses[active.id].score={correct,total:values.length};
 const checks=responses[active.id].checks||[],last=checks.at(-1);
 if(!last||last.answerVersion!==active.answerVersion||JSON.stringify(last.values)!==JSON.stringify(values))checks.push({checkedAt:Date.now(),answerVersion:active.answerVersion,labels:spec.map(f=>f.label),values:[...values],results});
 responses[active.id].checks=checks.slice(-10);persist();
 if(user)recordAttempts(values.map((answer,i)=>({course:'focus-1',unit:Number(page.unit)||0,section:(book==='wb'?'workbook':'lesson')+':focus',ex_index:M.attemptIndex(active.id,spec[i].label),question:`${book.toUpperCase()} p.${page.page} ex.${active.label}, ${spec[i].label}`,answer,correct:results[i]}))).catch(()=>{});
};
async function recordAttempts(rows){const current=await SM.getUser();if(current?.id!==user?.id){status('Аккаунт изменился. Обнови страницу перед продолжением.');return {ok:false};}return SM.saveHwAttempts(rows);}

$('#saveAnswer').onclick=()=>{save(true);sync()};$('#close').onclick=()=>$('#exercise').close();$('#exercise').addEventListener('close',()=>{$$('audio').forEach(a=>a.pause());window.FocusVideo.stop($('#exerciseAudio'));active=null;render();});
$('#pages').onchange=ev=>{page=list().find(p=>p.id===ev.target.value);render();};
for(const [id,dir] of [['prev',-1],['next',1]])$('#'+id).onclick=()=>{page=list()[list().indexOf(page)+dir]||page;render();};
$$('[data-book]').forEach(b=>b.onclick=()=>{book=b.dataset.book;page=null;render();});
$('#zoom').onchange=ev=>$('#paper').style.width=Number(ev.target.value)*100+'%';
$('#cover').onclick=()=>{const hide=!$('#curtain').hidden;$('#curtain').hidden=hide;$('#cover').setAttribute('aria-pressed',String(!hide));};$('#uncover').onclick=()=>{$('#curtain').hidden=true;$('#cover').setAttribute('aria-pressed','false');};
$('#allTracks').onchange=ev=>{if(ev.target.value){$('#libraryAudio').src=`media/${book==='ws'?'sb':book}-${ev.target.value}.mp3`;$('#libraryAudio').play().catch(()=>{});}};
$('#copy').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);status('Ссылка на страницу скопирована');}catch{status('Скопируй адрес страницы из строки браузера');}};
$('#present').onclick=async()=>{const on=document.body.classList.toggle('present');$('#present').setAttribute('aria-pressed',on);try{if(on)await document.documentElement.requestFullscreen();else if(document.fullscreenElement)await document.exitFullscreen();}catch{}};
$('#sync').onclick=sync;
$('#export').onclick=()=>{const data=JSON.stringify({course:'Focus 1 2nd edition',responses},null,2);const href=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=document.createElement('a');a.href=href;a.download='focus-1-answers.json';a.click();setTimeout(()=>URL.revokeObjectURL(href),1000);};
$('#pageImage').onerror=()=>$('#imageError').hidden=false;$('#retryImage').onclick=()=>{$('#pageImage').src=page.image+'?retry='+Date.now();$('#imageError').hidden=true;};
window.addEventListener('online',sync);document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement){document.body.classList.remove('present');$('#present').setAttribute('aria-pressed','false');}});
document.addEventListener('play',ev=>{if(ev.target.tagName==='AUDIO')$$('audio').forEach(a=>{if(a!==ev.target)a.pause();});},true);
function updateAssignMarkers(){
 const choosing=!!assigner?.mode;
 $$('[data-ex]').forEach(b=>{const e=page?.exercises.find(e=>e.id===b.dataset.ex);if(!e)return;
  const picked=choosing&&assigner.has(e.id);b.classList.toggle('assign-selected',picked);b.classList.toggle('assign-choosing',choosing);
  b.setAttribute('aria-label',`${choosing?'Выбрать':'Открыть'} упражнение ${e.label}`);
  if(choosing)b.setAttribute('aria-pressed',String(picked));else b.removeAttribute('aria-pressed');
  const span=b.querySelector('span');if(span)span.textContent=choosing?(picked?'✓ Выбрано':'Выбрать'):(responses[e.id]?'Есть ответ':e.marking.mode==='mixed'?'Проверка + свой ответ':e.answerSpec?.length?'Автопроверка':'Свой ответ');
 });
 $('#assignExercise').hidden=!assigner?.allowed;
 $('#assignExercise').textContent=active&&assigner?.has(active.id)?'Убрать из домашки':'В домашку';
}
$('#assignExercise').onclick=()=>{if(active&&assigner?.allowed){assigner.toggle(active.id,true);$('#exercise').close();}};
function renderHomework(){
 if(!homework)return;
 const ids=H.ids(homework),meta=H.meta(homework),finished=['submitted','done'].includes(homework.status||(homework.done?'done':'new')),done=ids.filter(id=>!H.readiness(id,responses[id])).length;
 $('#assignment').hidden=false;
 $('#assignment').innerHTML=`<h2>Домашнее задание · ${ids.length} упр.</h2><p>${esc(meta.msg||'Выполни назначенные упражнения и отправь ответы преподавателю.')}</p>${meta.due?`<p>Срок: ${esc(meta.due)}</p>`:''}${homework.feedback?`<p>Комментарий преподавателя: ${esc(homework.feedback)}</p>`:''}<div class="sh-links">${ids.map(id=>`<a href="${esc('../'+H.link(id,homework.id))}">${esc(H.label(id))} · ${esc(H.readiness(id,responses[id])||'Готово')}</a>`).join('')}</div><p>Готово к отправке: ${done} из ${ids.length}. Ошибки не мешают отправить работу.</p><button id="submitHomework" ${finished||submitting?'disabled':''}>${submitting?'Отправляю…':finished?'Работа отправлена':'Отправить преподавателю'}</button><p id="homeworkStatus" role="status"></p>`;
 $('#submitHomework').onclick=submitHomework;
}
async function submitHomework(){
 if(!homework||submitting)return;
 let shot;try{shot=H.snapshot(homework,responses);}catch(e){$('#homeworkStatus').textContent=e.message;return;}
 submitting=true;renderHomework();
 try{
  const current=await SM.getUser();if(!current||current.id!==user?.id)throw Error('Аккаунт изменился. Обнови страницу.');
  // Save the exact submitted answers before changing the assignment status.
  responses[H.snapshotKey(homework.id)]=shot;persist();clearTimeout(syncTimer);
  const saved=await sync();if(!saved?.ok)throw Error('Не удалось синхронизировать ответы. Работа не отправлена; повтори попытку.');
  const result=await SM.hwSubmit(homework.id);if(!result?.ok)throw Error(result?.error||'Не удалось отправить работу. Повтори попытку.');
  homework.status='submitted';submitting=false;renderHomework();$('#homeworkStatus').textContent='Работа отправлена. Преподаватель увидит ответы и результаты проверки.';
 }catch(e){submitting=false;renderHomework();$('#homeworkStatus').textContent=e.message;}
}
async function loadHomework(){
 if(!params.get('hw'))return;
 $('#assignment').hidden=false;
 try{if(!user)throw Error('Войди в аккаунт ученика, чтобы открыть назначенную домашку.');
  const assignments=await SM.myHW();homework=assignments.find(h=>String(h.id)===params.get('hw')&&H.ids(h).length);
  if(!homework)throw Error('Эта домашка не найдена в твоём аккаунте. Открой её из раздела «Моя домашка».');renderHomework();
 }catch(e){$('#assignment').textContent=e.message;}
}
(async()=>{
 workStore=new CourseWorkStore({course:"focus-1",legacy(u){try{return JSON.parse(localStorage.getItem(NS+':'+(u?.id||'guest'))||'{}')}catch{return {}}},onStatus:status,onAccountChange:()=>CourseWorkUI.accountChanged(),onChange(rows,change){responses=rows;if(ready&&change.remote){renderProgress();if(active&&$('#exercise').open&&shownRecord!==JSON.stringify(rows[active.id]||{}))openExercise(active.id);}}});
 await workStore.start();user=workStore.user;responses=workStore.records;storageKey=workStore.key();CourseWorkUI.bind(workStore,()=>{save(false);return sync()});
 ready=true;page=params.has('page')?D.pages.find(p=>p.book===book&&p.page===Number(params.get('page'))):null;if(page)unit=String(page.unit);render();persist();assigner=window.FocusAssign.create({getUser:()=>user,getPage:()=>page,onChange:updateAssignMarkers});assigner.init();await loadHomework();const wanted=params.get('ex');if(wanted&&(page.exercises.some(e=>e.id===wanted)||(D.legacyExercises||[]).some(e=>e.id===wanted&&e.book===page.book&&e.page===page.page)))openExercise(wanted);})();
function renderMaterials(){const category=$('#resourceCategory').value,query=$('#resourceSearch').value.toLowerCase();if(category==='videos'){$('#resourceList').innerHTML=(window.FOCUS_VIDEOS||[]).filter(v=>`${v.number} ${v.lesson} ${v.label} ${v.kind} ${v.role}`.toLowerCase().includes(query)).map(v=>`<a class="resource" href="${esc(FocusVideo.url(v))}" target="_blank" rel="noopener">${esc(v.lesson)} · Видео ${v.number} · ${esc(v.label)}${v.role?' · Person '+esc(v.role):''} ↗</a>`).join('')||'<p>Видео по этому запросу нет.</p>';return;}$('#resourceList').innerHTML=D.resources.filter(r=>r.category===category&&r.title.toLowerCase().includes(query)).map(r=>`<a class="resource" href="${esc(r.path)}" target="_blank" rel="noopener">${esc(r.title)} ↗</a>`).join('')||'<p>Материалов по этому запросу нет.</p>';}
$('#materials').onclick=()=>{renderMaterials();$('#materialsDialog').showModal();};$('#closeMaterials').onclick=()=>$('#materialsDialog').close();$('#resourceCategory').onchange=renderMaterials;$('#resourceSearch').oninput=renderMaterials;
window.LiveCourse?.connect({
 course:'focus-1',
 view:()=>ready&&page?{book,page:page.page,exercise:$('#exercise').open?active?.id||null:null}:null,
 apply(v){const target=D.pages.find(p=>p.book===v.book&&p.page===v.page);if(!target||v.exercise&&!target.exercises.some(e=>e.id===v.exercise))return;
  book=v.book;page=target;unit=String(page.unit);render();if(v.exercise)openExercise(v.exercise);else if($('#exercise').open)$('#exercise').close();},
 host:()=>$('#exercise').open?$('#answerForm'):null,
 answer(){if(!active||!$('#exercise').open)return null;const r=responses[active.id]||{},values=r.values||[];return {exercise:active.id,items:values.map((text,i)=>({label:String(active.answerSpec?.[i]?.label||i+1),text,result:r.score?(M.checkField(text,active.answerSpec[i])?'✓ Верно':'✕ Ошибка'):''})).concat(r.reflection?[{label:'Свободная часть',text:r.reflection}]:[])};}
});

})();
