/* Original Focus Second Edition recordings, embedded only on request. */
window.FocusVideo=(()=>{
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const catalogue=window.FOCUS_VIDEOS||[];
 const url=v=>v.rutubeId?`https://rutube.ru/video/${v.rutubeId}/`:`https://www.youtube.com/watch?v=${v.youtubeId}`;
 function stop(host){host.querySelectorAll('.focus-video iframe').forEach(f=>f.remove());host.querySelectorAll('.focus-video[open]').forEach(d=>d.open=false);}
 function mount(host,page,data){
  if(page.book!=='sb')return;
  const videos=catalogue.filter(v=>v.pages.includes(page.page)),numbers=[...new Set(videos.map(v=>v.number))];
  for(const n of numbers){
   const variants=videos.filter(v=>v.number===n),v=variants.find(v=>!v.role)||variants[0],script=data.videoTranscripts?.[v.transcriptPage];
   const details=document.createElement('details');details.className='focus-video';details.dataset.video=n;
   details.innerHTML=`<summary>Видео ${n} · ${esc(v.label)}</summary><p>${esc(v.kind)} · Lesson ${esc(v.lesson)}</p>${variants.length>1?`<label>Вариант диалога<select aria-label="Вариант видео ${n}">${variants.map(x=>`<option value="${esc(x.youtubeId)}">${x.role?'Практика · Person '+esc(x.role):'Полный диалог'}</option>`).join('')}</select></label>`:''}<div class="focus-video-frame"></div><div class="focus-video-actions"><button type="button" data-video-repeat>К началу</button><a data-video-link target="_blank" rel="noopener">Открыть на ${v.rutubeId?'RUTUBE':'YouTube'} ↗</a></div>${script?`<details class="audio-transcript"><summary>Текст видео</summary><div>${esc(script.text)}</div></details>`:''}`;
   host.append(details);
   function load(){
    const id=details.querySelector('select')?.value||v.youtubeId,frame=document.createElement('iframe');
    frame.src=v.rutubeId?`https://rutube.ru/play/embed/${v.rutubeId}/?autoplay=false&skinColor=7b2341`:`https://www.youtube-nocookie.com/embed/${id}?autoplay=0&playsinline=1&rel=0&hl=en&cc_lang_pref=en`;
    frame.title=`Focus 1 · Видео ${n} · ${v.label}`;frame.allow='encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';
    details.querySelector('.focus-video-frame').replaceChildren(frame);details.querySelector('[data-video-link]').href=url(v.rutubeId?v:{youtubeId:id});
   }
   details.addEventListener('toggle',()=>{if(details.open){host.querySelectorAll('.focus-video').forEach(d=>{if(d!==details){d.open=false;d.querySelector('iframe')?.remove();}});if(!details.querySelector('iframe'))load();}else details.querySelector('iframe')?.remove();});
   details.querySelector('select')?.addEventListener('change',load);details.querySelector('[data-video-repeat]').addEventListener('click',load);
  }
  const script=data.videoTranscripts?.[page.page];
  if(script&&!numbers.includes(script.video))host.insertAdjacentHTML('beforeend',`<details class="audio-transcript video-script"><summary>Текст видео ${script.video} · ${esc(script.title)}</summary><p>Ссылка на оригинальное видео пока не найдена. Задания по содержанию можно выполнить по тексту; для вопросов о кадрах нужен сам ролик.</p><div>${esc(script.text)}</div></details>`);
 }
 return {mount,stop,url};
})();
