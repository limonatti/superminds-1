(() => {
'use strict';
const D=window.SOLUTIONS,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const params=new URLSearchParams(location.search), NS='solutions-int:responses:v1';
let book=params.get('book')==='wb'?'wb':'sb',unit=params.get('unit')||'0',page=null,active=null,user=null,responses={},storageKey='',ready=false,syncTimer,queue=Promise.resolve();
const normalize=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/\b(can't)\b/g,'cannot').replace(/\bwon't\b/g,'will not').replace(/n't\b/g,' not').replace(/'re\b/g,' are').replace(/'m\b/g,' am').replace(/'ve\b/g,' have').replace(/'ll\b/g,' will').replace(/[^a-z0-9\s'-]/g,' ').replace(/\s+/g,' ').trim();
const matches=(value,key)=>key.split(/\s*\/\s*/).some(k=>normalize(value).replace(/^true$/,'t').replace(/^false$/,'f')===normalize(k).replace(/^true$/,'t').replace(/^false$/,'f'));
const list=()=>D.pages.filter(p=>p.book===book&&String(p.unit)===String(unit));
function status(text){$('#saveStatus').textContent=text;}
function merge(a,b){const out={...a};Object.entries(b||{}).forEach(([k,v])=>{if(!out[k]||(v.updatedAt||0)>(out[k].updatedAt||0))out[k]=v;});return out;}
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(responses));status(user?'Сохранено на устройстве':'Гостевой режим · сохранено на устройстве');}catch{status('Не удалось сохранить на устройстве — скачай ответы');}renderProgress();}
function sync(){queue=queue.then(async()=>{if(!user){status('Войди в аккаунт платформы для синхронизации');return;}try{const current=await SM.getUser();if(!current||current.id!==user.id){status('Аккаунт изменился. Обнови страницу перед продолжением.');return;}status('Синхронизация…');const remote=await SM.loadCourseWork('solutions-int');if(!remote?.ok)throw new Error();const combined=merge(remote.answers,responses);const result=await SM.saveCourseWork('solutions-int',combined,user.id);if(!result?.ok)throw new Error();responses=merge(responses,combined);persist();status('Ответы сохранены в аккаунте');}catch{status('Нет связи · ответы на устройстве, повтори синхронизацию');}});return queue;}
function renderProgress(){const all=D.pages.filter(p=>p.unit===page?.unit).flatMap(p=>p.exercises);const done=all.filter(e=>responses[e.id]?.values?.some(v=>v.trim())).length;$('#progress').textContent=`${done} из ${all.length} упражнений с ответами в этом разделе.`;}
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
 $('#exerciseList').innerHTML=page.exercises.length?page.exercises.map(e=>`<button class="exercise-link" data-ex="${e.id}">Упражнение ${e.label}<span>${responses[e.id]?'Есть ответ':e.answers.length?'Проверка':'Свой ответ'}</span></button>`).join(''):'<p>Справочная страница. Слова доступны в словаре и карточках.</p>';
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
 const vals=responses[id]?.values||[];const automatic=active.answers.length>0;
 $('#instruction').textContent=automatic?'Запиши ответы по порядку. Для нескольких пропусков в одном пункте используй запятую.':'Выполни задание по условию. Сохрани письменный ответ или заметки для устного ответа.';
 $('#fields').innerHTML=automatic?active.answers.map((a,i)=>{const choice=active.answers.every(v=>/^[a-d]$/i.test(v))?['a','b','c','d']:active.answers.every(v=>/^(T|F|true|false)$/i.test(v))?['T','F']:null;return `<label class="answer-row"><span>${i+1}</span>${choice?`<select data-answer aria-label="Ответ ${i+1}"><option value="">—</option>${choice.map(v=>`<option ${vals[i]===v?'selected':''}>${v}</option>`).join('')}</select>`:`<input data-answer aria-label="Ответ ${i+1}" value="${esc(vals[i]||'')}" autocomplete="off" spellcheck="false">`}</label>`;}).join(''):`<label for="written">Мой ответ</label><textarea id="written" data-answer maxlength="12000" placeholder="Напиши ответ…">${esc(vals[0]||'')}</textarea>`;
 $('#check').hidden=!automatic;$('#keyPanel').hidden=!active.key;$('#keyPanel').open=false;$('#keyText').textContent=active.key;$('#feedback').textContent='';
 $$('[data-answer]').forEach(el=>el.addEventListener('input',()=>save(false)));
 $('#exercise').showModal();resizeCrop();
}
function save(explicit){if(!active||!ready)return;const values=$$('[data-answer]').map(e=>e.value);responses[active.id]={values,updatedAt:Date.now(),page:page.page,book,unit:page.unit,exercise:active.label};persist();clearTimeout(syncTimer);if(user)syncTimer=setTimeout(sync,1800);if(explicit)$('#feedback').textContent=user?'Ответ сохранён. Синхронизация с аккаунтом…':'Ответ сохранён на этом устройстве.';}
$('#answerForm').onsubmit=ev=>{ev.preventDefault();const values=$$('[data-answer]').map(el=>el.value);if(values.some(v=>!v.trim())){$('#feedback').textContent='Сначала заполни все ответы.';return;}save(false);let correct=0;$$('.answer-row').forEach((row,i)=>{const ok=matches(values[i],active.answers[i]);if(ok)correct++;row.classList.toggle('correct',ok);row.classList.toggle('incorrect',!ok);row.querySelector('.answer-result')?.remove();const result=document.createElement('span');result.className='answer-result';result.textContent=ok?'Верно':'Не совпадает с ключом — проверь форму ответа';row.append(result);});$('#feedback').textContent=`Совпало с ключом: ${correct} из ${values.length}.`;responses[active.id].score={correct,total:values.length};persist();if(user)SM.saveHwAttempts(values.map((answer,i)=>({course:'solutions-int',unit:Number(page.unit)||0,section:(book==='wb'?'workbook':'lesson')+':solutions',ex_index:page.page*1000+Number(active.label)*30+i,question:`${book.toUpperCase()} p.${page.page} ex.${active.label}, ${i+1}`,answer,correct:matches(answer,active.answers[i])}))).catch(()=>{});};
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
