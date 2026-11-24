/* Sound is opt-in, account-scoped, and deduplicated across open tabs. No closed-site push. */
(function(root){
'use strict';
let enabledAt=Date.now(),user,context,enabled=false,timer,busy=false,pair=null,reading=()=>false,button,epoch=0;
const startTime=new Date().toISOString(),tabId=crypto.randomUUID();
const get=k=>{try{return localStorage.getItem(k)}catch{return null}},put=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
function label(){if(button){button.textContent=enabled?'Звук: вкл':'Звук: выкл';button.setAttribute('aria-pressed',String(enabled));button.title='Сигнал нового сообщения, пока платформа открыта';}}
async function unlock(){if(!enabled)return;try{const AC=root.AudioContext||root.webkitAudioContext;if(!AC)throw Error();context||=new AC();await context.resume();}catch{}}
function beep(){if(!context||context.state!=='running'||root.SM_CHAT_RECORDING||[...document.querySelectorAll('audio,video')].some(p=>!p.paused&&!p.muted))return;const o=context.createOscillator(),g=context.createGain(),t=context.currentTime;o.type='sine';o.frequency.setValueAtTime(660,t);o.frequency.setValueAtTime(880,t+.09);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.07,t+.015);g.gain.exponentialRampToValueAtTime(.001,t+.22);o.connect(g);g.connect(context.destination);o.start(t);o.stop(t+.23);}
function heartbeat(){if(user&&pair&&reading()&&!document.hidden&&document.hasFocus())put('chat-reading:'+user,JSON.stringify({...pair,at:Date.now(),tabId}));}
function isRead(m){let p;try{p=JSON.parse(get('chat-reading:'+user)||'null')}catch{}return p&&Date.now()-p.at<6000&&p.teacherId===m.teacher_id&&p.studentId===m.student_id;}
async function poll(){if(!user||busy)return;busy=true;const version=epoch,uid=user;
 try{const rows=await SM.chatIncoming(startTime);if(version!==epoch)return;heartbeat();if(!enabled||context?.state!=='running')return;
  const notify=()=>{let seen;try{seen=JSON.parse(get('chat-sound-seen:'+uid)||'[]')}catch{seen=[]}const fresh=rows.filter(m=>!seen.includes(m.id));put('chat-sound-seen:'+uid,JSON.stringify([...new Set([...rows.map(m=>m.id),...seen])].slice(0,400)));if(fresh.some(m=>Date.parse(m.created_at)>=enabledAt&&!m.read_at&&!isRead(m)))beep();};
  if(navigator.locks)await navigator.locks.request('chat-sound:'+uid,notify);else {await new Promise(r=>setTimeout(r,Math.random()*200));notify();}
 }catch{}finally{if(version===epoch)busy=false;}
}
async function start(id){if(user===id)return;epoch++;user=id;busy=false;clearInterval(timer);enabled=get('chat-sound:'+id)==='on';label();await unlock();if(user)timer=setInterval(()=>{heartbeat();poll();},4000);}
function bind(b){button=b;label();b.onclick=async()=>{enabled=!enabled;if(enabled)enabledAt=Date.now();put('chat-sound:'+user,enabled?'on':'off');label();await unlock();if(enabled&&context?.state!=='running')b.title='Нажми ещё раз после разрешения звука в браузере';};}
function active(p,fn){pair=p;reading=fn||(()=>false);heartbeat();}
window.addEventListener('storage',e=>{if(e.key==='chat-sound:'+user){enabled=e.newValue==='on';label();unlock();}});
document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('keydown',unlock);window.addEventListener('focus',()=>{heartbeat();poll();});
root.SMChatSounds={start,bind,active,poll};root.dispatchEvent(new Event('chat-sounds-ready'));
if(root.SM){SM.getUser().then(u=>start(u?.id));SM.watchPresentationAuth?.(u=>start(u?.id));}
})(window);
