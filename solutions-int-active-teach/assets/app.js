(() => {
'use strict';
const D=window.SOLUTIONS,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const params=new URLSearchParams(location.search), NS='solutions-int:responses:v1';
let book=params.get('book')==='wb'?'wb':'sb',unit=params.get('unit')||'0',page=null,active=null,user=null,responses={},storageKey='',ready=false,syncTimer,queue=Promise.resolve();
const M=window.SolutionsMarking;
let previousAnswers=[];
const list=()=>D.pages.filter(p=>p.book===book&&String(p.unit)===String(unit));
function status(text){$('#saveStatus').textContent=text;}
function merge(a,b){const out={...a};Object.entries(b||{}).forEach(([k,v])=>{if(!out[k]||(v.updatedAt||0)>(out[k].updatedAt||0))out[k]=v;});return out;}
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(responses));status(user?'Сохранено на устройстве':'Гостевой режим · сохранено на устройстве');}catch{status('Не удалось сохранить на устройстве — скачай ответы');}renderProgress();}
function sync(){queue=queue.then(async()=>{if(!user){status('Войди в аккаунт платформы для синхронизации');return;}try{const current=await SM.getUser();if(!current||current.id!==user.id){status('Аккаунт изменился. Обнови страницу перед продолжением.');return;}status('Синхронизация…');const remote=await SM.loadCourseWork('solutions-int');if(!remote?.ok)throw new Error();const combined=merge(remote.answers,responses);const result=await SM.saveCourseWork('solutions-int',combined,user.id);if(!result?.ok)throw new Error();responses=merge(responses,combined);persist();status('Ответы сохранены в аккаунте');}catch{status('Нет связи · ответы на устройстве, повтори синхронизацию');}});return queue;}
function renderProgress(){const all=D.pages.filter(p=>p.unit===page?.unit).flatMap(p=>p.exercises);const done=all.filter(e=>(responses[e.id]?.values?.some(v=>v.trim())||responses[e.id]?.reflection?.trim())).length;$('#progress').textContent=`${done} из ${all.length} упражнений с ответами в этом разделе.`;}
function url(){return `${location.pathname}?book=${book}&unit=${unit}&page=${page.page}`;}
function render(){
 if(!page||page.book!==book||String(page.unit)!==String(unit))page=list()[0];
 if(!page){unit='0';page=list()[0];}
 history.replaceState(null,'',url());
 $('#heading').textContent=unit==='extra'?(page.bank||'Дополнительные материалы'):(unit==='0'?'Introduction':`Unit ${unit} · ${D.units[Number(unit)]}`);
 $('#units').innerHTML=D.units.map((t,i)=>`<button data-unit="${i}" class="${String(i)===String(unit)?'active':''}" aria-pressed="${String(i)===String(unit)}">${i===0?'Intro':i+' · '+esc(t)}</button>`).join('')+`<button data-unit="extra" aria-pressed="${unit==='extra'}">Reference & banks</button>`;
 $$('#units button').forEach(b=>b.onclick=()=>{unit=b.dataset.unit;page=null;render();});
 $$('[data-book]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.book===book));
 $('#pages').innerHTML=list().map(p=>`<option value="${p.id}" ${p.id===page.id?'selected':''}>${p.page} · ${esc(p.title)}</option>`).join('');
 $('#prev').disabled=list().indexOf(page)===0;$('#next').disabled=list().indexOf(page)===list().length-1;
 $('#pageImage').src=page.image;$('#pageImage').alt=`${book==='sb'?'Student’s Book':'Workbook'}, страница ${page.page}`;$('#imageError').hidden=true;
 $('#hotspots').innerHTML=page.exercises.map(e=>`<button class="hotspot ${responses[e.id]?'done':''}" data-ex="${e.id}" style="left:${e.x*100}%;top:${e.y*100}%" aria-label="Открыть упражнение ${e.label}">${e.label}</button>`).join('');
 $('#exerciseList').innerHTML=page.exercises.length?page.exercises.map(e=>`<button class="exercise-link" data-ex="${e.id}">Упражнение ${e.label}<span>${responses[e.id]?'Есть ответ':e.marking.mode==='mixed'?'Проверка + свой ответ':e.answerSpec?.length?'Автопроверка':'Свой ответ'}</span></button>`).join(''):'<p>Справочная страница. Слова доступны в словаре и карточках.</p>';
 $$('[data-ex]').forEach(b=>b.onclick=()=>openExercise(b.dataset.ex));$('#count').textContent=page.exercises.length;
 $('#audio').innerHTML=page.tracks.length?page.tracks.map(t=>`<label>Трек ${esc(t)}<audio controls preload="none" src="media/${book}-${t}.mp3"></audio></label>`).join(''):'<p>Выбери аудио по номеру трека в учебнике.</p>';
 $('#allTracks').innerHTML='<option value="">Выбери трек</option>'+D.tracks[book].map(t=>`<option value="${t}">${book.toUpperCase()} · ${t}</option>`).join('');$('#libraryAudio').pause();$('#libraryAudio').removeAttribute('src');
 $('#trainer').href='../trainer.html?course=solutions-int'+(unit==='extra'?'':'&unit=solu-u'+unit);$('#vocabulary').href='../vocabulary.html?course=solutions-int';
 $('#curtain').hidden=true;$('#cover').setAttribute('aria-pressed','false');renderProgress();
}
function resizeCrop(){if(!active||!$('#exerciseImage').naturalWidth)return;const [x,y,w,h]=$('#fullPage').getAttribute('aria-pressed')==='true'?[0,0,1,1]:active.box;const width=$('#crop').clientWidth;const full=width/w;const height=full*$('#exerciseImage').naturalHeight/$('#exerciseImage').naturalWidth;$('#crop').style.height=`${height*h}px`;Object.assign($('#exerciseImage').style,{width:`${full}px`,left:`${-full*x}px`,top:`${-height*y}px`});}
function openExercise(id){
 active=page.exercises.find(e=>e.id===id);if(!active||!ready)return;
 $('#exerciseTitle').textContent=`Упражнение ${active.label}`;$('#exerciseLocation').textContent=`${book==='sb'?'Student’s Book':'Workbook'} · стр. ${page.page}`;
 $('#exerciseAudio').innerHTML=page.tracks.map(t=>`<label>Трек ${esc(t)}<audio controls preload="none" src="media/${book}-${t}.mp3"></audio></label>`).join('');$('#fullPage').setAttribute('aria-pressed','false');$('#exerciseImage').src=page.image;$('#exerciseImage').onload=resizeCrop;
 const restored=M.saved(active,responses[id]);previousAnswers=restored.previous;
 const vals=restored.values,spec=active.answerSpec||[],automatic=spec.length>0,mixed=active.marking.mode==='mixed';
 $('#instruction').textContent=active.marking.instruction||(automatic?'Впиши ответы в поля с номерами из задания. Несколько пропусков одного пункта разделяй запятой.':'Выполни задание по условию. Сохрани письменный ответ или заметки для устного ответа.');
 if(spec.some(f=>f.kind==='set'))$('#instruction').textContent+=' В полях «Список» разделяй ответы точкой с запятой; порядок не важен.';
 if(mixed)$('#instruction').textContent+=' Собственные примеры и объяснения запиши отдельно — их проверит преподаватель.';
 const allLetters=automatic&&!spec.every(f=>f.accepted?.every(v=>/^(T|F)$/i.test(v)))&&spec.every(f=>f.kind!=='set'&&f.accepted.every(v=>/^[a-z]$/i.test(v)));
 const maxLetter=allLetters?Math.max(100,...spec.flatMap(f=>f.accepted.map(v=>v.toLowerCase().charCodeAt(0)))):0;
 $('#fields').innerHTML=automatic?spec.map((f,i)=>{
  const tf=f.kind!=='set'&&f.accepted.every(v=>/^(T|F|true|false|NG|not given)$/i.test(v));
  const choices=allLetters?Array.from({length:maxLetter-96},(_,n)=>String.fromCharCode(97+n)):tf?['T','F',...(spec.some(a=>a.accepted?.some(v=>/^(NG|not given)$/i.test(v)))?['NG']:[])]:null;
  return `<label class="answer-row"><span>${esc(f.label)}${f.kind==='set'?'<small>Список</small>':''}</span>${choices?`<select data-answer aria-label="Ответ ${esc(f.label)}"><option value="">—</option>${choices.map(v=>`<option value="${v}" ${String(vals[i]||'').toLowerCase()===v.toLowerCase()?'selected':''}>${v}</option>`).join('')}</select>`:f.kind==='set'?`<textarea data-answer rows="2" maxlength="4000" aria-label="Ответ ${esc(f.label)}" placeholder="Ответы через ;" spellcheck="false">${esc(vals[i]||'')}</textarea>`:`<input data-answer aria-label="Ответ ${esc(f.label)}" value="${esc(vals[i]||'')}" maxlength="2000" autocomplete="off" spellcheck="false">`}</label>`;
 }).join(''):`<label for="written">Мой ответ</label><textarea id="written" data-answer maxlength="12000" placeholder="Напиши ответ…">${esc(vals[0]||'')}</textarea>`;
 if(mixed)$('#fields').insertAdjacentHTML('beforeend',`<label class="reflection-label" for="reflection">Объяснения и собственные примеры · проверяет преподаватель</label><textarea id="reflection" maxlength="12000" placeholder="Напиши свободную часть ответа…">${esc(restored.reflection)}</textarea>`);
 if(previousAnswers.length)$('#fields').insertAdjacentHTML('beforeend',`<details class="previous-answers"><summary>Ранее сохранённые ответы</summary><p>Поля задания уточнены. Твои предыдущие ответы сохранены; перенеси нужные в новые поля для проверки.</p>${previousAnswers.map(r=>`<ol>${r.values.map((v,i)=>`<li>${r.labels?.[i]?esc(r.labels[i])+': ':''}${esc(v||'—')}</li>`).join('')}</ol>${r.reflection?`<p>${esc(r.reflection)}</p>`:''}`).join('')}</details>`);
 $('#check').hidden=!automatic;$('#keyPanel').hidden=!active.key;$('#keyPanel').open=false;$('#keyText').textContent=active.key;$('#feedback').textContent='';
 $$('[data-answer],#reflection').forEach(el=>el.addEventListener('input',()=>{clearMarking();save(false);}));
 $('#exercise').showModal();resizeCrop();
}
function clearMarking(){$$('.answer-row').forEach(row=>{row.classList.remove('correct','incorrect');row.querySelector('.answer-result')?.remove();row.querySelector('[data-answer]')?.removeAttribute('aria-invalid');});$('#feedback').textContent='';}
function save(explicit){
 if(!active||!ready)return;
 const values=$$('[data-answer]').map(e=>e.value),old=responses[active.id];
 const score=old?.answerVersion===active.answerVersion&&JSON.stringify(old.values)===JSON.stringify(values)?old.score:undefined;
 responses[active.id]={values,score,reflection:$('#reflection')?.value||'',previousAnswers,answerVersion:active.answerVersion,fieldLabels:(active.answerSpec||[]).map(f=>f.label),updatedAt:Date.now(),page:page.page,book,unit:page.unit,exercise:active.label};
 persist();clearTimeout(syncTimer);if(user)syncTimer=setTimeout(sync,1800);
 if(explicit)$('#feedback').textContent=user?'Ответ сохранён. Синхронизация с аккаунтом…':'Ответ сохранён на этом устройстве.';
}
$('#answerForm').onsubmit=ev=>{
 ev.preventDefault();const spec=active?.answerSpec;if(!spec?.length){save(true);return;}
 const values=$$('[data-answer]').map(el=>el.value);save(false);
 if(values.some(v=>!v.trim())){$('#feedback').textContent='Сначала заполни все поля для автопроверки. Черновик сохранён.';return;}
 const results=values.map((v,i)=>M.checkField(v,spec[i])),correct=results.filter(Boolean).length;
 $$('.answer-row').forEach((row,i)=>{const ok=results[i];row.classList.toggle('correct',ok);row.classList.toggle('incorrect',!ok);row.querySelector('[data-answer]').setAttribute('aria-invalid',String(!ok));row.querySelector('.answer-result')?.remove();const result=document.createElement('span');result.className='answer-result';result.textContent=ok?'Верно':'Проверь ответ и форму записи';row.append(result);});
 $('#feedback').textContent=`${active.marking.mode==='mixed'?'Закрытая часть. ':''}Верно: ${correct} из ${values.length}.${active.marking.mode==='mixed'?' Свободную часть проверяет преподаватель.':''}`;
 responses[active.id].score={correct,total:values.length};persist();
 if(user)recordAttempts(values.map((answer,i)=>({course:'solutions-int',unit:Number(page.unit)||0,section:(book==='wb'?'workbook':'lesson')+':solutions',ex_index:M.attemptIndex(active.id,spec[i].label),question:`${book.toUpperCase()} p.${page.page} ex.${active.label}, ${spec[i].label}`,answer,correct:results[i]}))).catch(()=>{});
};
async function recordAttempts(rows){const current=await SM.getUser();if(current?.id!==user?.id){status('Аккаунт изменился. Обнови страницу перед продолжением.');return;}return SM.saveHwAttempts(rows);}
$('#fullPage').onclick=()=>{$('#fullPage').setAttribute('aria-pressed',$('#fullPage').getAttribute('aria-pressed')!=='true');resizeCrop();};
$('#saveAnswer').onclick=()=>save(true);$('#close').onclick=()=>$('#exercise').close();$('#exercise').addEventListener('close',()=>{active=null;render();});
$('#pages').onchange=ev=>{page=list().find(p=>p.id===ev.target.value);render();};
for(const [id,dir] of [['prev',-1],['next',1]])$('#'+id).onclick=()=>{page=list()[list().indexOf(page)+dir]||page;render();};
$$('[data-book]').forEach(b=>b.onclick=()=>{book=b.dataset.book;page=null;render();});
$('#zoom').onchange=ev=>$('#paper').style.width=Number(ev.target.value)*100+'%';
$('#cover').onclick=()=>{const hide=!$('#curtain').hidden;$('#curtain').hidden=hide;$('#cover').setAttribute('aria-pressed',String(!hide));};$('#uncover').onclick=()=>{$('#curtain').hidden=true;$('#cover').setAttribute('aria-pressed','false');};
$('#allTracks').onchange=ev=>{if(ev.target.value){$('#libraryAudio').src=`media/${book}-${ev.target.value}.mp3`;$('#libraryAudio').play().catch(()=>{});}};
$('#copy').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);status('Ссылка на страницу скопирована');}catch{status('Скопируй адрес страницы из строки браузера');}};
$('#present').onclick=async()=>{const on=document.body.classList.toggle('present');$('#present').setAttribute('aria-pressed',on);try{if(on)await document.documentElement.requestFullscreen();else if(document.fullscreenElement)await document.exitFullscreen();}catch{}};
$('#sync').onclick=sync;
$('#export').onclick=()=>{const data=JSON.stringify({course:'Solutions Intermediate 3rd edition',responses},null,2);const href=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=document.createElement('a');a.href=href;a.download='solutions-intermediate-answers.json';a.click();setTimeout(()=>URL.revokeObjectURL(href),1000);};
$('#pageImage').onerror=()=>$('#imageError').hidden=false;$('#retryImage').onclick=()=>{$('#pageImage').src=page.image+'?retry='+Date.now();$('#imageError').hidden=true;};
window.addEventListener('resize',resizeCrop);document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement){document.body.classList.remove('present');$('#present').setAttribute('aria-pressed','false');}});
document.addEventListener('play',ev=>{if(ev.target.tagName==='AUDIO')$$('audio').forEach(a=>{if(a!==ev.target)a.pause();});},true);
window.addEventListener('storage',ev=>{if(ev.key===storageKey){try{responses=merge(responses,JSON.parse(ev.newValue)||{});renderProgress();}catch{}}});
(async()=>{try{user=await SM.getUser();}catch{}storageKey=NS+':'+(user?.id||'guest');try{responses=JSON.parse(localStorage.getItem(storageKey)||'{}')||{};}catch{}if(user){try{const remote=await SM.loadCourseWork('solutions-int');if(remote?.ok)responses=merge(responses,remote.answers);}catch{}}ready=true;page=D.pages.find(p=>p.book===book&&p.page===Number(params.get('page')));if(page)unit=String(page.unit);render();persist();})();
})();
