/* Reviewed against Speakout Third Edition B1+ SB7 and the original Unit 1
 * BBC Vlog (videoscript SB170). Both responses are personal, never graded.
 * Keep the video node connected in the exercise dialog, even in the library. */
(function(root){
'use strict';
const ids=['sb:7:1','sb:7:2'],path='media/so3-b1-u1-bbc-vlogs.mp4';
const gifts=['a laptop','an engagement ring','a puppy','a saxophone','a son born on my birthday','a set of golf clubs','a music studio','a holiday to South Africa','a car','a camera'];
const prompts=['What was the present?','Who gave it to you?','When did you receive it?','Why was it special?'];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
let host,video,active=false,error='',loopA=0,loopB=null,fragment=false;
function has(id){return ids.includes(id)}
function apply(course,sources){
 const p=course.books.sb.pages.find(p=>p.page===7);
 const texts=['Watch the video. Which do you think is the best present?',"What’s the best present you’ve ever received?"];
 const boxes=[[.079,.858,.325,.039],[.079,.901,.325,.045]];
 p.exercises.forEach((e,i)=>{e.text=texts[i];e.instruction=texts[i];e.box=boxes[i].map(v=>v*100);
  sources[ids[i]]={label:e.label,sources:[{image:p.image,page:7,box:boxes[i],size:[1406,1988]},...(i===0?[{image:p.image,page:7,box:[.079,.618,.325,.239],size:[1406,1988],context:true}]:[])]};
 });
}
function controls(){return '<div class="opener-controls"><button type="button" data-opener-play>▶ Смотреть</button><button type="button" data-opener-mute aria-pressed="false">Выключить звук</button><button type="button" data-opener-repeat>↺ Сначала</button><button type="button" data-opener-back>−5 с</button><output data-opener-time>0:00</output><details class="opener-options"><summary>Скорость и повтор фрагмента</summary><label>Скорость <select data-opener-rate aria-label="Скорость видео"><option value="0.75">0.75×</option><option value="0.9">0.9×</option><option value="1" selected>1×</option><option value="1.1">1.1×</option><option value="1.25">1.25×</option></select></label><button type="button" data-opener-a>Начало A</button><button type="button" data-opener-b>Конец B</button><button type="button" data-opener-ab aria-pressed="false" disabled>Повтор A–B</button></details><span data-opener-error role="status"></span></div>'}
function ensure(){
 if(host)return;
 host=document.createElement('section');host.id='openerMedia';host.hidden=true;host.setAttribute('aria-label','BBC Vlogs · Unit 1');
 host.innerHTML='<details class="opener-video"><summary>BBC Vlogs · What’s the best present you’ve ever received?</summary><video id="openerVideo" controls playsinline preload="metadata" src="'+path+'"></video><details class="opener-script"><summary>Текст видео · Student’s Book, стр. 170</summary><div><svg viewBox="85 135 690 800" role="img" aria-label="Оригинальный текст BBC Vlogs Unit 1 на странице 170"><image href="assets/sb-170.jpg" width="1556" height="2200"></image></svg></div><a href="assets/sb-170.jpg" target="_blank" rel="noopener">Открыть текст крупно</a></details></details>'+controls();
 q('#exerciseBody').before(host);video=q('#openerVideo');bindControls(host);
 for(const event of ['play','pause','timeupdate','loadedmetadata','ended','volumechange'])video.addEventListener(event,sync);
 video.addEventListener('timeupdate',()=>{if(fragment&&loopB!==null&&video.currentTime>=loopB)video.currentTime=loopA});
 video.addEventListener('error',()=>{error='Видео не загрузилось. Проверь соединение и попробуй ещё раз.';sync()});
 // Pausing other recordings preserves the familiar one-recording-at-a-time rule.
 document.addEventListener('play',e=>{if(e.target===video)qa('audio,video').forEach(p=>{if(p!==video)p.pause()});else if(e.target.matches?.('audio,video'))video.pause()},true);
}
function clock(n){return Number.isFinite(n)?Math.floor(n/60)+':'+String(Math.floor(n%60)).padStart(2,'0'):'0:00'}
function sync(){
 if(!video)return;
 qa('[data-opener-play]').forEach(b=>{b.textContent=video.paused?'▶ Смотреть':'❚❚ Пауза';b.setAttribute('aria-label',video.paused?'Смотреть BBC Vlogs Unit 1':'Пауза BBC Vlogs Unit 1')});
 qa('[data-opener-mute]').forEach(b=>{b.textContent=video.muted?'Включить звук':'Выключить звук';b.setAttribute('aria-pressed',String(video.muted))});
 qa('[data-opener-time]').forEach(o=>o.textContent=clock(video.currentTime)+' / '+clock(video.duration));
 qa('[data-opener-error]').forEach(o=>o.textContent=error);
 qa('[data-opener-rate]').forEach(s=>s.value=String(video.playbackRate));qa('[data-opener-ab]').forEach(b=>{b.disabled=loopB===null;b.setAttribute('aria-pressed',String(fragment));b.textContent=loopB===null?'Повтор A–B':'A–B '+clock(loopA)+' – '+clock(loopB)});
 host.hidden=!active&&video.paused;
}
async function play(restart=false){
 ensure();error='';if(restart){fragment=false;video.currentTime=0;}
 if(!restart&&!video.paused){video.pause();return}
 if(active)host.querySelector('.opener-video').open=true;
 try{await video.play()}catch{error='Нажми «Смотреть», чтобы запустить видео.'}sync();
}
function bindControls(el){
 el.querySelector('[data-opener-play]').onclick=()=>play();
 el.querySelector('[data-opener-mute]').onclick=()=>{video.muted=!video.muted;sync()};
 el.querySelector('[data-opener-repeat]').onclick=()=>play(true);
 el.querySelector('[data-opener-back]').onclick=()=>{video.currentTime=Math.max(0,video.currentTime-5)};
 el.querySelector('[data-opener-rate]').onchange=e=>{video.playbackRate=Number(e.target.value);sync()};
 el.querySelector('[data-opener-a]').onclick=()=>{loopA=video.currentTime;loopB=null;fragment=false;sync()};
 el.querySelector('[data-opener-b]').onclick=()=>{if(video.currentTime>loopA+.2)loopB=video.currentTime;sync()};
 el.querySelector('[data-opener-ab]').onclick=()=>{fragment=!fragment;if(fragment)video.currentTime=loopA;sync()};
}
function show(on){active=on;ensure();sync()}
function libraryHTML(){return '<article class="mediaitem opener-library"><h3>BBC Vlogs · Unit 1 · Best present</h3>'+controls()+'<button type="button" data-opener-return>Открыть видео и задание 1</button><p>Видео и позиция сохраняются при возврате к заданию.</p></article>'}
function bindLibrary(open){const el=q('.opener-library');if(!el)return;ensure();bindControls(el);el.querySelector('[data-opener-play]').onclick=()=>{if(video.paused){open();play()}else video.pause()};el.querySelector('[data-opener-repeat]').onclick=()=>{open();play(true)};el.querySelector('[data-opener-return]').onclick=open;sync()}
function decorate({id,state,body,persist,updateProgress}){
 const dialog=q('#exerciseDialog');dialog.classList.toggle('reviewed-opener',has(id));if(!has(id))return;
 const source=body.querySelector('.exercise-source');source.dataset.sourceFit='width';source.tabIndex=0;source.setAttribute('role','region');source.setAttribute('aria-label','Оригинал задания');root.ExerciseSource.controls(source);
 const responses=body.querySelector('.exercise-response'),label=id===ids[0]?'Выбери подарок из видео, который кажется тебе лучшим. Объясни свой выбор устно.':'Расскажи о своём подарке. Нажимай на опоры, когда ответишь на вопрос.';
 const activity=document.createElement('section');activity.className='opener-activity';activity.innerHTML='<p>'+label+'</p>'+(id===ids[0]?'<div class="opener-gifts" role="group" aria-label="Мой выбор подарка">'+gifts.map(g=>'<button type="button" data-gift="'+esc(g)+'" aria-pressed="false">'+esc(g)+'</button>').join('')+'</div><p class="opener-model">I think … is the best present because …</p>':'<div class="opener-prompts">'+prompts.map((p,i)=>'<button type="button" data-prompt="'+i+'" aria-pressed="false">'+p+'</button>').join('')+'</div><p class="opener-model">The best present I’ve ever received was …</p>')+'<p>Это личный ответ. Правильного варианта и оценки нет.</p><button type="button" data-opener-reset>Сбросить выбор и отметки</button>';
 responses.prepend(activity);
 const note=responses.querySelector('#freeNote'),noteLabel=responses.querySelector('label[for="freeNote"]');if(note){note.placeholder='Необязательные заметки';note.required=false;noteLabel.textContent='Заметки (необязательно)'}
 const teacherNote=responses.querySelector('.teacher-note');if(teacherNote)teacherNote.textContent='Ответ можно дать устно. Печатать ответ не обязательно.';
 responses.querySelector('#done').textContent=state.done?'✓ Обсудили':'Отметить: обсудили';
 const refresh=()=>{activity.querySelectorAll('[data-gift]').forEach(b=>b.setAttribute('aria-pressed',String(state.values.openerGift===b.dataset.gift)));activity.querySelectorAll('[data-prompt]').forEach(b=>b.setAttribute('aria-pressed',String(state.values['openerPrompt'+b.dataset.prompt]==='done')))};
 const save=()=>{state.done=false;state.score=null;refresh();responses.querySelector('#done').textContent='Отметить: обсудили';updateProgress();persist()};
 activity.querySelectorAll('[data-gift]').forEach(b=>b.onclick=()=>{state.values.openerGift=state.values.openerGift===b.dataset.gift?'':b.dataset.gift;save()});
 activity.querySelectorAll('[data-prompt]').forEach(b=>b.onclick=()=>{const k='openerPrompt'+b.dataset.prompt;state.values[k]=state.values[k]==='done'?'':'done';save()});
 activity.querySelector('[data-opener-reset]').onclick=()=>{for(const k of Object.keys(state.values))if(k.startsWith('opener'))delete state.values[k];save()};refresh();
}
function afterFocus(id){if(!has(id))return;const source=q('#exerciseBody .exercise-source');root.ExerciseSource.fit(source);}
root.B1PlusOpener={apply,has,show,decorate,afterFocus,libraryHTML,bindLibrary,isMedia:m=>m.path===path};
})(window);
