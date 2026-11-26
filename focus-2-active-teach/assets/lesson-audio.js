/* A single human-recording transport survives task/list navigation. UI controls
 * are disposable; the media element and its position are not. No account data. */
(function(root){
'use strict';
const player=document.createElement('audio');player.id='lessonAudioTransport';player.preload='metadata';player.hidden=true;document.body.append(player);
let current=null,error='',pending=false,loopA=0,loopB=null,fragment=false;const positions=new Map();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const views=()=>[...document.querySelectorAll('[data-lesson-audio]')];
const time=n=>Number.isFinite(n)?Math.floor(n/60)+':'+String(Math.floor(n%60)).padStart(2,'0'):'0:00';
function html(m,title,src){return `<section class="lesson-audio" data-lesson-audio="${esc(m.path)}" data-src="${esc(src)}" data-title="${esc(title)}" aria-label="Запись ${esc(title)}"><b>${esc(title)}</b><div class="lesson-audio-controls"><button type="button" data-audio-play>▶ Слушать ${esc(m.track||'запись')}</button><button type="button" data-audio-back aria-label="Назад на пять секунд">−5 с</button><button type="button" data-audio-repeat aria-label="Повторить запись сначала">↺ Сначала</button><button type="button" data-audio-mute aria-pressed="false">Выключить звук</button><details class="lesson-audio-options"><summary>Скорость и повтор фрагмента</summary><div class="lesson-audio-controls"><label>Скорость <select data-audio-rate aria-label="Скорость записи"><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option></select></label><button type="button" data-audio-loop aria-pressed="false">Повтор</button><button type="button" data-audio-a>Начало A</button><button type="button" data-audio-b>Конец B</button><button type="button" data-audio-ab aria-pressed="false">Повтор A–B</button></div></details></div><label class="lesson-audio-progress">Позиция записи <input type="range" data-audio-seek aria-label="Позиция записи" min="0" max="0" value="0" step="0.1" disabled><output>0:00</output></label><span data-audio-error role="status"></span></section>`}
function update(){for(const v of views()){
 const active=current?.path===v.dataset.lessonAudio,q=s=>v.querySelector(s),playing=active&&!player.paused;
 q('[data-audio-play]').textContent=playing?'❚❚ Пауза':active?'▶ Продолжить':'▶ Слушать';q('[data-audio-play]').setAttribute('aria-label',(playing?'Пауза: ':'Слушать: ')+v.dataset.title);
 q('[data-audio-mute]').textContent=player.muted?'Включить звук':'Выключить звук';q('[data-audio-mute]').setAttribute('aria-pressed',String(player.muted));
 for(const sel of ['[data-audio-back]','[data-audio-seek]'])q(sel).disabled=!active||!Number.isFinite(player.duration);
 q('[data-audio-seek]').max=active&&Number.isFinite(player.duration)?player.duration:0;q('[data-audio-seek]').value=active?player.currentTime:0;q('output').textContent=active?time(player.currentTime)+' / '+time(player.duration):'0:00';
 q('[data-audio-ab]').setAttribute('aria-pressed',String(active&&fragment));q('[data-audio-a]').disabled=!active;q('[data-audio-b]').disabled=!active;q('[data-audio-ab]').disabled=!active||loopB===null;q('[data-audio-ab]').textContent=active&&loopB!==null?'A–B '+time(loopA)+' – '+time(loopB):'Повтор A–B';q('[data-audio-loop]').setAttribute('aria-pressed',String(active&&player.loop));q('[data-audio-rate]').value=String(player.playbackRate);q('[data-audio-error]').textContent=active?error:'';
 }const dock=document.querySelector('#lessonAudioDock');if(dock)dock.hidden=!current||!!document.querySelector('dialog[open]');}
async function play(v,restart=false){
 if(pending)return;error='';
 if(current?.path!==v.dataset.lessonAudio){if(current)positions.set(current.path,player.currentTime);player.pause();current={path:v.dataset.lessonAudio,title:v.dataset.title,src:v.dataset.src};player.src=current.src;player.loop=false;loopA=0;loopB=null;fragment=false;player.addEventListener('loadedmetadata',()=>{player.currentTime=restart?0:Math.min(positions.get(current.path)||0,player.duration||0)},{once:true});dock();}
 else if(restart)player.currentTime=0;
 else if(!player.paused){player.pause();update();return;}
 pending=true;try{await player.play()}catch{error='Запись не запустилась. Нажми «Слушать», чтобы повторить.'}finally{pending=false;update()}
}
function bind(host=document){for(const v of host.querySelectorAll('[data-lesson-audio]')){if(v.dataset.bound)continue;v.dataset.bound='true';const q=s=>v.querySelector(s);
 q('[data-audio-a]').onclick=()=>{loopA=player.currentTime;loopB=null;fragment=false;update()};q('[data-audio-b]').onclick=()=>{if(player.currentTime>loopA+.2)loopB=player.currentTime;update()};q('[data-audio-ab]').onclick=()=>{fragment=!fragment;update()};q('[data-audio-play]').onclick=()=>play(v);q('[data-audio-repeat]').onclick=()=>play(v,true);q('[data-audio-back]').onclick=()=>{player.currentTime=Math.max(0,player.currentTime-5)};
 q('[data-audio-mute]').onclick=()=>{player.muted=!player.muted;update()};q('[data-audio-rate]').onchange=e=>{player.defaultPlaybackRate=Number(e.target.value);player.playbackRate=Number(e.target.value);update()};q('[data-audio-loop]').onclick=()=>{if(current?.path!==v.dataset.lessonAudio)return;player.loop=!player.loop;update()};q('[data-audio-seek]').oninput=e=>{if(current?.path===v.dataset.lessonAudio)player.currentTime=Number(e.target.value)};
 }update();}
function dock(){let el=document.querySelector('#lessonAudioDock');if(!el){el=document.createElement('aside');el.id='lessonAudioDock';el.setAttribute('aria-label','Текущая запись');document.body.append(el)}if(current){el.innerHTML=html(current,current.title,current.src);bind(el)}update()}
for(const event of ['timeupdate','play','pause','loadedmetadata','durationchange','ratechange','volumechange','ended'])player.addEventListener(event,update);
player.addEventListener('timeupdate',()=>{if(fragment&&loopB!==null&&player.currentTime>=loopB)player.currentTime=loopA});
player.addEventListener('error',()=>{error='Не удалось загрузить запись. Проверь соединение и повтори.';update()});
document.addEventListener('play',e=>{if(e.target===player)document.querySelectorAll('audio,video').forEach(a=>{if(a!==player)a.pause()});else if(e.target.matches?.('audio,video'))player.pause()},true);
new MutationObserver(update).observe(document.body,{attributes:true,subtree:true,attributeFilter:['open']});
root.Focus2Audio={html,bind,update,current:()=>current,player};
})(window);
