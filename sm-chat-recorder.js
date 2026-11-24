/* A recorder owns its tracks and draft. Async permission replies cannot revive a closed dialog. */
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;else root.SMChatRecorder=api;})(typeof window==='undefined'?globalThis:window,root=>{
'use strict';
const MAX_BYTES=25*1024*1024;
async function request(p){let t;try{return await Promise.race([p,new Promise((_,reject)=>{t=setTimeout(()=>reject(Error('Сервер не ответил вовремя.')),45000)})]);}finally{clearTimeout(t)}}
function mime(kind,Recorder=root.MediaRecorder){const types=kind==='video'?['video/webm;codecs=vp8,opus','video/mp4','video/webm']:['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus'];return types.find(t=>Recorder?.isTypeSupported?.(t))||'';}
const time=n=>Math.floor(n/60)+':'+String(Math.floor(n%60)).padStart(2,'0');
class Capture{
 constructor({kind,onState=()=>{},media=root.navigator?.mediaDevices,Recorder=root.MediaRecorder,now=()=>Date.now()}={}){Object.assign(this,{kind,onState,media,Recorder,now});this.epoch=0;this.state='idle';this.limit=kind==='video'?60:300;}
 emit(state,extra={}){this.state=state;this.onState({state,...extra});}
 tracks(){this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;}
 async start(){
  const epoch=++this.epoch;this.emit('requesting');
  try{
   if(!this.Recorder||!this.media?.getUserMedia)throw Error('Запись недоступна в этом браузере. Открой платформу в Safari или Chrome либо прикрепи готовый файл.');
   const stream=await this.media.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:this.kind==='video'?{facingMode:'user',width:{ideal:480},height:{ideal:480},frameRate:{ideal:24,max:30}}:false});
   if(epoch!==this.epoch){stream.getTracks().forEach(t=>t.stop());return;}
   this.stream=stream;const type=mime(this.kind,this.Recorder),options={...(type?{mimeType:type}:{}),audioBitsPerSecond:64000,...(this.kind==='video'?{videoBitsPerSecond:600000}:{})};
   const recorder=this.recorder=new this.Recorder(stream,options);const chunks=[];let bytes=0;this.started=this.now();
   recorder.ondataavailable=e=>{if(e.data?.size){bytes+=e.data.size;chunks.push(e.data);if(bytes>MAX_BYTES&&recorder.state==='recording')this.stop();}};
   recorder.onerror=()=>{if(epoch!==this.epoch)return;this.cancel();this.emit('error',{error:'Запись прервалась. Попробуй ещё раз.'});};
   recorder.onstop=()=>{this.tracks();clearInterval(this.timer);if(epoch!==this.epoch)return;const duration=Math.min(this.limit,(this.now()-this.started)/1000);const blob=new Blob(chunks,{type:recorder.mimeType||type||chunks[0]?.type});if(!blob.size||bytes>MAX_BYTES){this.emit('error',{error:bytes>MAX_BYTES?'Запись больше 25 МБ. Запиши короткий фрагмент.':'Не удалось получить запись. Попробуй ещё раз.'});return;}this.blob=blob;this.emit('preview',{blob,duration});};
   recorder.start(500);this.emit('recording',{stream,seconds:0});
   this.timer=setInterval(()=>{if(epoch!==this.epoch)return;const seconds=(this.now()-this.started)/1000;if(seconds>=this.limit)this.stop();else this.emit('recording',{stream,seconds});},250);
  }catch(e){if(epoch!==this.epoch)return;this.tracks();this.emit('error',{error:({NotAllowedError:'Разреши доступ к микрофону'+(this.kind==='video'?' и камере':'')+' в настройках сайта, затем повтори.',NotFoundError:'Камера или микрофон не найдены.',NotReadableError:'Камера или микрофон заняты другим приложением.'})[e.name]||e.message});}
 }
 stop(){clearInterval(this.timer);if(this.recorder?.state==='recording'){this.emit('stopping');this.recorder.stop();}}
 cancel(){++this.epoch;clearInterval(this.timer);if(this.recorder?.state==='recording')this.recorder.stop();this.tracks();this.blob=null;this.state='idle';}
}
function open({kind,teacherId,studentId,userId,onSent,isActive=()=>true}){
 const trigger=document.activeElement,d=document.createElement('dialog');d.className='record-dialog';d.setAttribute('aria-labelledby','recordTitle');
 d.innerHTML='<h2 id="recordTitle">'+(kind==='video'?'Видеокружок':'Голосовое сообщение')+'</h2><p class="record-hint">'+(kind==='video'?'До 1 минуты':'До 5 минут')+' · сначала проверь запись, затем отправь</p><div class="record-preview"></div><p class="record-status" role="status"></p><div class="record-actions"><button data-start>Начать запись</button><button data-stop hidden>Остановить</button><button data-send hidden>Отправить</button><button data-cancel>Закрыть</button></div>';
 document.body.append(d);const $=s=>d.querySelector(s),host=$('.record-preview'),status=$('.record-status'),start=$('[data-start]'),stop=$('[data-stop]'),send=$('[data-send]'),cancel=$('[data-cancel]');let url,blob,duration,uploaded,sending=false,closed=false,clientId=crypto.randomUUID();
 const release=()=>{host.querySelectorAll('audio,video').forEach(m=>{m.pause();m.srcObject=null;m.removeAttribute('src');});if(url)URL.revokeObjectURL(url);url=null;host.replaceChildren();};
 const capture=new Capture({kind,onState(s){if(closed)return;window.SM_CHAT_RECORDING=['requesting','recording','stopping'].includes(s.state);start.hidden=['requesting','recording','stopping'].includes(s.state);stop.hidden=s.state!=='recording';send.hidden=s.state!=='preview';start.textContent=s.state==='preview'?'Перезаписать':'Начать запись';cancel.textContent=s.state==='preview'?'Удалить запись':'Отмена';
  if(s.state==='requesting'){release();blob=null;uploaded=null;clientId=crypto.randomUUID();status.textContent='Запрашиваю доступ…';}
  if(s.state==='recording'){status.textContent='Запись · '+time(s.seconds)+' / '+time(capture.limit);if(kind==='video'&&!host.firstChild){const v=document.createElement('video');v.muted=true;v.playsInline=true;v.autoplay=true;v.srcObject=s.stream;host.append(v);v.play().catch(()=>{});}}
  if(s.state==='stopping')status.textContent='Готовлю предпросмотр…';
  if(s.state==='error'){release();status.textContent=s.error;}
  if(s.state==='preview'){release();blob=s.blob;duration=s.duration;url=URL.createObjectURL(blob);const player=document.createElement(kind==='video'?'video':'audio');player.src=url;player.controls=true;player.preload='metadata';player.playsInline=true;host.append(player);status.textContent='Запись готова · '+time(duration);}
 }});
 function destroy(){if(closed)return;closed=true;capture.cancel();window.SM_CHAT_RECORDING=false;release();if(d.open)d.close();d.remove();if(trigger?.isConnected)trigger.focus();window.removeEventListener('pagehide',destroy);document.removeEventListener('visibilitychange',hidden);}
 function hidden(){if(document.hidden&&capture.state==='recording')capture.stop();}
 start.onclick=()=>capture.start();stop.onclick=()=>capture.stop();cancel.onclick=()=>{if(!sending)destroy();};d.addEventListener('cancel',e=>{e.preventDefault();if(!sending)destroy();});
 send.onclick=async()=>{if(!blob||sending||!isActive())return;sending=true;start.disabled=send.disabled=cancel.disabled=true;host.querySelectorAll('audio,video').forEach(m=>m.pause());status.textContent='Отправляю…';
  try{if(!uploaded){uploaded=await request(SM.recordingUpload(blob,teacherId,studentId,userId,clientId,{recording:kind==='video'?'circle':'voice',duration:Math.round(duration)}));if(!uploaded?.ok){const msg=uploaded?.error;uploaded=null;throw Error(msg||'Не удалось загрузить запись.');}}
   if(!isActive()||closed)return;
   const r=await request(SM.chatSend(teacherId,studentId,'',uploaded,clientId,userId));if(!r?.ok)throw Error(r?.error||'Не удалось отправить.');if(isActive()){onSent(r.msg);destroy();}
  }catch(e){if(!closed)status.textContent=e.message+' Запись сохранена здесь — можно повторить отправку.';}
  finally{sending=false;if(!closed)start.disabled=send.disabled=cancel.disabled=false;}
 };
 window.addEventListener('pagehide',destroy);document.addEventListener('visibilitychange',hidden);d.showModal();start.focus();return {destroy};
}
return {Capture,mime,time,open,MAX_BYTES};
});
