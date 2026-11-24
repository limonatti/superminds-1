/* Source-authored SB14–15 photo prompts. No exact grading of spoken answers. */
(function(root){
'use strict';
let state=null,save=()=>{},host=null,exercise=null,zoom=1;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function clear(){document.querySelector('#modal')?.classList.remove('photo-opener');state=null;host=null;exercise=null;zoom=1}
function capture(){return state?{selected:state.selected,attempted:[...state.attempted],revealed:[...state.revealed]}:null}
function mount(e,record,onSave){
 clear();if(!e.photoPractice)return;document.querySelector('#modal').classList.add('photo-opener');exercise=e;save=onSave;
 const previous=record.photoPractice||{},valid=values=>[...new Set((Array.isArray(values)?values:[]).filter(n=>Number.isInteger(n)&&n>=1&&n<=12))];
 state={selected:Math.min(12,Math.max(1,Number(previous.selected)||1)),attempted:valid(previous.attempted),revealed:valid(previous.revealed)};
 state.revealed=state.revealed.filter(n=>state.attempted.includes(n));
 host=document.createElement('section');host.className='photo-practice';host.setAttribute('aria-label','Фотографии к упражнению');
 document.querySelector('#responseFields').prepend(host);
 const old=document.querySelector('.personalPractice');const notes=old?.querySelector('details');if(notes)host.after(notes);old?.remove();document.querySelector('.practiceSettings')?.setAttribute('hidden','');document.querySelector('.responseStepper')?.setAttribute('hidden','');
 render();
}
function render(){
 if(!state||!host)return;const n=state.selected,photo=exercise.photoPractice.photos[n-1],recall=exercise.photoPractice.recall,done=state.attempted.includes(n),show=!recall||state.revealed.includes(n),[x,y,w,h]=photo.box;
 host.innerHTML=`<h4>Фотографии · стр. 14–15</h4><nav class="photo-numbers" aria-label="Выбрать фотографию">${exercise.photoPractice.photos.map(p=>`<button type="button" data-photo="${p.n}" aria-label="Фотография ${p.n}" aria-pressed="${p.n===n}">${p.n}${state.attempted.includes(p.n)?' ✓':''}</button>`).join('')}</nav><div class="photo-zoom"><button type="button" data-photo-out aria-label="Уменьшить фотографию" ${zoom<=1?'disabled':''}>−</button><button type="button" data-photo-fit>По ширине</button><button type="button" data-photo-in aria-label="Увеличить фотографию" ${zoom>=3?'disabled':''}>+</button></div><div class="photo-scroll"><figure style="width:${zoom*100}%"><svg viewBox="${x*1191} ${y*1684} ${w*1191} ${h*1684}" role="img" aria-label="Фотография ${n} из учебника, страница ${photo.page}"><image href="${esc(photo.image)}" width="1191" height="1684"></image></svg><figcaption>Фото ${n} · стр. ${photo.page}</figcaption></figure></div><p class="photo-word" ${show?'':'hidden'}>${show?esc(photo.text):''}</p><button type="button" data-photo-attempt aria-pressed="${done}">${done?'Отметка сделана · отменить':exercise.photoPractice.mode==='observe'?'Рассмотрел(а) фото и прочитал(а) подпись':exercise.photoPractice.mode==='repeat'?'Повторил(а) вслух':'Я назвал(а) слово или фразу'}</button>${recall?`<button type="button" data-photo-reveal ${!done?'disabled':''}>${show?'Скрыть подпись':'Сравнить с подписью'}</button>`:''}<div class="photo-navigation"><button type="button" data-photo-prev ${n===1?'disabled':''}>← Предыдущая</button><span role="status">${state.attempted.length} из 12 · без оценки</span><button type="button" data-photo-next ${n===12?'disabled':''}>Следующая →</button></div><button type="button" data-photo-reset>Повторить все фотографии</button>`;
 const q=s=>host.querySelector(s),act=(selector,fn)=>{const el=q(selector);if(el)el.onclick=()=>{fn();render();save();host.querySelector(selector)?.focus({preventScroll:true})}};
 for(const b of host.querySelectorAll('[data-photo]'))b.onclick=()=>{state.selected=Number(b.dataset.photo);zoom=1;render();save();host.querySelector(`[data-photo="${state.selected}"]`).focus({preventScroll:true})};
 act('[data-photo-out]',()=>zoom=Math.max(1,zoom-.25));act('[data-photo-in]',()=>zoom=Math.min(3,zoom+.25));act('[data-photo-fit]',()=>zoom=1);
 act('[data-photo-attempt]',()=>{state.attempted=done?state.attempted.filter(i=>i!==n):[...state.attempted,n];if(done)state.revealed=state.revealed.filter(i=>i!==n)});
 act('[data-photo-reveal]',()=>state.revealed=show?state.revealed.filter(i=>i!==n):[...state.revealed,n]);
 act('[data-photo-prev]',()=>{state.selected--;zoom=1});act('[data-photo-next]',()=>{state.selected++;zoom=1});
 act('[data-photo-reset]',()=>{state={selected:1,attempted:[],revealed:[]};zoom=1;const done=document.querySelector('#workDone');if(done)done.checked=false});
}
root.OutcomesPhotos={mount,capture,clear,active:()=>!!state};
})(window);
