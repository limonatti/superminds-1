/* The lesson room relays navigation and responses; students keep their own work. */
(()=>{
 const params=new URLSearchParams(location.search),role=params.get('embedded')==='1'&&parent!==window?params.get('lessonRole'):null;
 const send=data=>{if(role)parent.postMessage({type:'outcomes-lesson',...data},location.origin)};
 let applying=false,online=false,remote=null,timer,audioApplying=false;
 function links(){const n=Number(/^\d/.exec(page().lesson)?.[0])||1;$('#flashcards').href=`../trainer.html?unit=sb1-u${n}&mode=flash`;$('#onlineLesson').href=`../room.html?course=speakout-b1&unit=${n}`}
 function view(){
  links();if(role==='t'&&!applying){clearTimeout(timer);timer=setTimeout(()=>send({kind:'view',book:S.book,page:S.page,exercise:$('#exerciseDialog').open?recordId(selectedEx):null}),70)}
  panel();
 }
 function answer(){
  if(role!=='s'||!$('#exerciseDialog').open||!selectedEx)return;
  const r=answers[recordId(selectedEx)]||{},labels=Object.keys(r.values||{}).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
  send({kind:'answers',exercise:recordId(selectedEx),labels,values:labels.map(k=>String(r.values[k])),note:r.note||'',done:!!r.done,updatedAt:Date.now()});
 }
 function panel(){
  if(!role||!$('#exerciseDialog').open)return;let el=$('#liveAnswers');
  if(!el){el=document.createElement('section');el.id='liveAnswers';el.className='source-note';$('#exerciseBody').prepend(el)}
  if(role==='s'){el.textContent=online?'Онлайн-урок · преподаватель видит ваши ответы':'Онлайн-урок · связь восстанавливается';return}
  const r=remote?.exercise===recordId(selectedEx)?remote:null;
  el.innerHTML='<strong>Ответы ученика · онлайн</strong>'+(r?'<ol>'+r.values.map((v,i)=>'<li>'+esc(r.labels?.[i]||i+1)+': '+esc(v||'—')+'</li>').join('')+'</ol>'+(r.note?'<p style="white-space:pre-wrap">'+esc(r.note)+'</p>':''):'<p>Ожидаем ответ ученика…</p>');
 }
 window.addEventListener('b1-view',view);window.addEventListener('b1-save',answer);
 window.addEventListener('message',ev=>{
  if(!role||ev.source!==parent||ev.origin!==location.origin||ev.data?.type!=='outcomes-lesson')return;
  const d=ev.data;
  if(d.kind==='connection'){online=!!d.online;panel();return}
  if(d.kind==='snapshot'){answer();return}
  if(d.kind==='answers'&&role==='t'){
   if(typeof d.exercise!=='string'||!Array.isArray(d.values)||d.values.length>200||d.values.some(v=>typeof v!=='string'||v.length>20000))return;
   if(d.note!==undefined&&(typeof d.note!=='string'||d.note.length>100000))return;
   remote=d;panel();return;
  }
  if(d.kind==='view'&&role==='s'){
   const p=D.books[d.book]?.pages.find(p=>p.page===d.page);if(!p)return;
   const index=d.exercise?p.exercises.findIndex(e=>`${d.book}:${p.page}:${e.label}`===d.exercise):-1;if(d.exercise&&index<0)return;
   applying=true;
   if($('#exerciseDialog').open)$('#exerciseDialog').close();S.book=d.book;go(d.page);
   if(index>=0)openExercise(index);applying=false;answer();return;
  }
  if(d.kind==='audio'&&role==='s'){
   if(!D.media.some(m=>m.path===d.path)||!['play','pause','seek','rate'].includes(d.action))return;
   let player=$$('audio,video').find(p=>p.getAttribute('src')===url(d.path));
   if(!player){S.view='media';$('#mediaFilter').value='all';$('#mediaSearch').value='';renderMedia();showView('media');player=$$('audio,video').find(p=>p.getAttribute('src')===url(d.path))}
   if(!player)return;audioApplying=true;
   const apply=()=>{if(Number.isFinite(d.time)&&d.time>=0)player.currentTime=d.time;if(Number.isFinite(d.rate))player.playbackRate=Math.min(2,Math.max(.5,d.rate));if(d.action==='play')player.play().catch(()=>toast('Нажмите Play, чтобы включить запись урока.'));else if(d.action==='pause')player.pause();setTimeout(()=>audioApplying=false,300)};
   if(player.readyState)apply();else{player.addEventListener('loadedmetadata',apply,{once:true});player.load()}
  }
 });
 for(const [event,action] of [['play','play'],['pause','pause'],['seeked','seek'],['ratechange','rate']])document.addEventListener(event,ev=>{
  if(role!=='t'||audioApplying||!ev.target.matches('audio,video'))return;
  const player=ev.target,m=D.media.find(m=>url(m.path)===player.getAttribute('src'));if(m)send({kind:'audio',action,path:m.path,time:player.currentTime,rate:player.playbackRate});
 },true);
 view();send({kind:'ready'});send({kind:'audio-ready'});
})();
