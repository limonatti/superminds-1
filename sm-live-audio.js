/* One-way audio transport for the three presentation tools in a lesson room. */
(()=>{
 const params=new URLSearchParams(location.search),role=params.get('lessonRole');
 if(params.get('embedded')!=='1'||parent===window||!['s','t'].includes(role))return;
 const root=new URL('.',location.href).pathname;
 const send=data=>parent.postMessage({type:'outcomes-lesson',...data},location.origin);
 function valid(d){try{const u=new URL(d.src);return u.origin===location.origin&&u.pathname.startsWith(root)&&/\.(mp3|m4a|ogg|wav|aac)$/i.test(u.pathname)&&Number.isFinite(d.time)&&d.time>=0&&Number.isFinite(d.rate)&&d.rate>=.25&&d.rate<=4&&typeof d.paused==='boolean'&&Number.isFinite(d.at)}catch{return false}}
 let current=null,state=null,blocked=false,online=true,version=0,playingRequest=false,failed=false;
 function publish(reason){if(!current)return;const src=current.currentSrc||current.src;if(!src)return;
  const data={kind:'audio',src,time:current.currentTime||0,rate:current.playbackRate,paused:current.paused||current.ended,loop:current.loop,at:Date.now(),reason};if(valid(data))send(data);
 }
 if(role==='t'){
  for(const event of ['play','pause','seeked','ratechange','ended','emptied'])document.addEventListener(event,e=>{
   if(e.target.tagName!=='AUDIO')return;
   if(event==='emptied'&&e.target===current){current=null;send({kind:'audio',stop:true});return;}
   if(event==='play'||!current)current=e.target;
   if(e.target===current)publish(event);
  },true);
  const timer=setInterval(()=>{if(current){if(!current.isConnected){current=null;send({kind:'audio',stop:true});}else publish('progress');}},1000);
  window.addEventListener('pagehide',()=>{send({kind:'audio',stop:true});clearInterval(timer)});return;
 }
 const player=document.createElement('audio');player.preload='auto';player.id='liveLessonAudio';
 const box=document.createElement('section');box.setAttribute('aria-label','Аудио учителя');box.style.cssText='position:sticky;top:0;z-index:10000;background:#fff7e9;color:#241a18;border:2px solid #7c2340;border-radius:12px;padding:10px;margin:8px;font:600 14px sans-serif';box.hidden=true;
 const label=document.createElement('span'),enable=document.createElement('button');enable.type='button';enable.textContent='Включить звук урока';enable.hidden=true;enable.style.cssText='margin-left:10px;padding:8px;border-radius:8px';box.append(label,enable,player);
 function mount(){const host=document.querySelector('dialog[open]')||document.body;if(box.parentElement!==host)host.prepend(box);}
 function time(n){n=Math.floor(n||0);return Math.floor(n/60)+':'+String(n%60).padStart(2,'0')}
 function target(){const age=state.paused?0:Math.max(0,Math.min(5,(Date.now()-state.at)/1000));let t=state.time+age*state.rate;if(Number.isFinite(player.duration)&&player.duration>0)t=state.loop?t%player.duration:Math.min(t,player.duration);return t;}
 function display(){mount();box.hidden=!state;if(!state)return;label.textContent=(failed?'Запись не загрузилась. Повторите загрузку · ':!online?'Связь восстанавливается · ':blocked?'Нажмите, чтобы разрешить звук · ':state.paused?'Аудио учителя · Пауза · ':'Аудио учителя · ')+time(player.currentTime)+' · '+state.rate+'×';enable.hidden=!(blocked||failed);enable.textContent=failed?'Повторить загрузку':'Включить звук урока';}
 function apply(force=false){if(!state)return;player.playbackRate=state.rate;player.loop=!!state.loop;
  if(player.readyState>=1){const t=target();if(force||Math.abs(player.currentTime-t)>.7)try{player.currentTime=t}catch{}}
  if(state.paused){player.pause();display();return;}
  if(!blocked&&!failed&&player.paused&&!playingRequest){const v=version;playingRequest=true;player.play().then(()=>{playingRequest=false;if(v!==version){apply();return}display()}).catch(e=>{playingRequest=false;if(v!==version)return;if(e.name==='NotAllowedError'){blocked=true;display();}});}
  display();
 }
 enable.onclick=()=>{blocked=false;if(failed){failed=false;player.load();}apply(true)};
 player.addEventListener('loadedmetadata',()=>apply(true));player.addEventListener('timeupdate',display);
 player.addEventListener('error',()=>{failed=true;display()});
 window.addEventListener('message',e=>{
  if(e.origin!==location.origin||e.source!==parent||e.data?.type!=='outcomes-lesson')return;
  const d=e.data;if(d.kind==='connection'){online=!!d.online;display();return}if(d.kind!=='audio')return;
  if(d.stop){version++;player.pause();state=null;box.hidden=true;return;}if(!valid(d))return;
  const changed=!state||state.src!==d.src;state=d;version++;
  if(changed){failed=false;player.pause();player.src=d.src;playingRequest=false;}
  if(!d.paused)document.querySelectorAll('audio').forEach(a=>{if(a!==player)a.pause()});
  apply(changed||d.reason==='seeked');
 });
 const timer=setInterval(display,1000);window.addEventListener('pagehide',()=>{player.pause();clearInterval(timer)});
 send({kind:'audio-ready'});
})();
