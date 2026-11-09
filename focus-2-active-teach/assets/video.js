/* One on-demand YouTube player; no autoplay, downloads or tracking iframe until opened. */
(() => {
 'use strict';
 const $=s=>document.querySelector(s), D=window.FOCUS2;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let currentPage=null;
 function items(scope){return D.videos.filter(v=>scope==='all'||scope==='unit'&&v.unit===Number(currentPage?.unit)||scope==='page'&&currentPage?.book==='sb'&&v.pages.includes(currentPage.page));}
 function buttons(list){return list.map(v=>`<button type="button" data-video="${esc(v.number)}">${esc(v.number)} · ${esc(v.category)}<span>${esc(v.title)}</span></button>`).join('');}
 function bind(container){container.querySelectorAll('[data-video]').forEach(b=>b.onclick=()=>open(b.dataset.video));}
 function draw(){
  const list=items($('#videoScope').value),query=$('#videoSearch').value.trim().toLowerCase();
  $('#videoList').innerHTML=buttons(list.filter(v=>(v.number+' '+v.title+' '+v.category).toLowerCase().includes(query)))||'<p>В этом разделе нет видео. Выбери «Весь курс».</p>';bind($('#videoList'));
 }
 function open(number){
  const v=D.videos.find(v=>v.number===number);if(!v)return;
  document.querySelectorAll('audio').forEach(a=>a.pause());
  $('#videoTitle').textContent=`${v.number} · ${v.category} · ${v.title}`;
  $('#videoExternal').href=v.url;$('#videoWorksheet').href=`?book=sb&page=${(v.category==='BBC'?v.pages.at(-1):v.pages[0])}`;
  $('#videoPlayer').replaceChildren();
  const frame=document.createElement('iframe');frame.src=`https://www.youtube-nocookie.com/embed/${v.youtube}?rel=0`;
  frame.title=v.title;frame.allow='accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';
  $('#videoPlayer').append(frame);$('#videoDetails').hidden=false;
  if(!$('#videosDialog').open)$('#videosDialog').showModal();
 }
 $('#videos').onclick=()=>{draw();$('#videosDialog').showModal();};
 $('#closeVideos').onclick=()=>$('#videosDialog').close();
 $('#videosDialog').addEventListener('close',()=>{$('#videoPlayer').replaceChildren();$('#videoDetails').hidden=true;});
 $('#videoScope').onchange=draw;$('#videoSearch').oninput=draw;
 window.Focus2Video={render(page){currentPage=page;const list=items('page');$('#pageVideos').innerHTML=buttons(list);$('#pageVideosSection').hidden=!list.length;bind($('#pageVideos'));draw();}};
})();
