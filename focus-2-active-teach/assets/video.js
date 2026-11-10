/* One on-demand video player; no autoplay, downloads or tracking iframe until opened. */
(() => {
 'use strict';
 const $=s=>document.querySelector(s), D=window.FOCUS2;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let currentPage=null;
 function items(scope){const unit=Number(currentPage?.unit);return D.videos.filter(v=>scope==='all'||scope==='unit'&&v.unit===unit||(scope==='page'||scope==='unit'&&!Number.isFinite(unit))&&currentPage?.book==='sb'&&v.pages.includes(currentPage.page));}
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
  const note=$('#videoEdition');note.replaceChildren();note.hidden=!v.editionNote;
  if(v.editionNote){
   const description=document.createElement('p');description.textContent=v.editionNote;note.append(description);
   if(v.worksheetTimings?.length){const timings=document.createElement('ul');v.worksheetTimings.forEach(t=>{const li=document.createElement('li');li.textContent=`${t.label}: ${t.range}`;timings.append(li);});note.append(timings);}
  }
  $('#videoExternal').href=v.url;
  $('#videoExternal').textContent=`Открыть на ${v.provider==='vk'?'VK Видео':'YouTube'} ↗`;
  const worksheet=new URL(location.href);worksheet.searchParams.set('book','sb');worksheet.searchParams.set('page',v.category==='BBC'?v.pages.at(-1):v.pages[0]);worksheet.searchParams.delete('ex');
  $('#videoWorksheet').href=worksheet.pathname+worksheet.search;
  $('#videoPlayer').replaceChildren();
  const frame=document.createElement('iframe');frame.src=v.provider==='vk'?v.embedUrl:`https://www.youtube-nocookie.com/embed/${v.youtube}?rel=0`;
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
