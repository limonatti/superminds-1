/* Account-scoped drafts. Each edit has its own durable key, shared by tabs. */
(function(root){
'use strict';
const request=async p=>{let timer;try{return await Promise.race([p,new Promise((_,reject)=>timer=setTimeout(()=>reject(Error('Нет связи')),10000))])}finally{clearTimeout(timer)}};
const copy=v=>JSON.parse(JSON.stringify(v)),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),time=v=>Number(v?.updatedAt)||0;
const token=()=>root.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
class CourseWorkStore{
 constructor({course,api=root.SM,storage=root.localStorage,delay=700,onChange=()=>{},onStatus=()=>{},onAccountChange=()=>{},legacy}={}){
  Object.assign(this,{course,api,storage,delay,onChange,onStatus,onAccountChange,legacy});
  this.records={};this.pending={};this.known={};this.events=new Map();this.epoch=0;this.user=undefined;this.loaded=false;this.busy=null;this.timer=null;this.retry=null;this.localOK=true;this.message='Загрузка ответов…';
 }
 key(){return `coursework-v2:${this.course}:${this.user?.id||'guest'}`}
 prefix(){return this.key()+':edit:'}
 status(message){this.message=message;this.onStatus(message);return message}
 readCache(){try{const v=JSON.parse(this.storage.getItem(this.key())||'{}');return v&&typeof v==='object'?v:{}}catch{return {}}}
 // The snapshot is only a cache. Unacknowledged edits live under independent keys.
 journal(id,value){const key=this.prefix()+token(),event={id,value:copy(value)};this.events.set(key,event);try{this.storage.setItem(key,JSON.stringify(event));event.persisted=true;for(const[old,e]of this.events)if(old!==key&&e.id===id&&time(e.value)<=time(value)){this.storage.removeItem?.(old);this.events.delete(old)}return true}catch{return false}}
 readJournal(){
  if(this.user===undefined)return;
  try{if(typeof this.storage.key==='function'){
   const present=new Set();for(let i=0;i<this.storage.length;i++){const key=this.storage.key(i);if(!key?.startsWith(this.prefix()))continue;present.add(key);const e=JSON.parse(this.storage.getItem(key));if(e&&typeof e.id==='string'&&e.value&&typeof e.value==='object')this.events.set(key,{...e,persisted:true});}
   for(const[key,e]of this.events)if(e.persisted&&!present.has(key))this.events.delete(key);
  }}catch{this.localOK=false}
  this.pending={};
  for(const[key,e]of [...this.events].sort((a,b)=>time(a[1].value)-time(b[1].value)||a[0].localeCompare(b[0]))){
   if(!this.pending[e.id]||time(e.value)>=time(this.pending[e.id]))this.pending[e.id]=copy(e.value);
   if(!this.records[e.id]||time(e.value)>time(this.records[e.id]))this.records[e.id]=copy(e.value);
  }
 }
 persist(){
  if(this.user===undefined)return false;
  try{
   // A stale tab must not erase another tab's cached exercises.
   for(const[id,v]of Object.entries(this.readCache().records||{}))if(!this.records[id]||time(v)>time(this.records[id])){this.records[id]=copy(v);this.known[id]=JSON.stringify(v)}
   this.storage.setItem(this.key(),JSON.stringify({records:this.records,pending:this.pending}));this.localOK=true;
  }catch{this.localOK=false}return this.localOK;
 }
 acknowledge(batch,events){
  for(const[key,e]of events)if(batch[e.id]&&time(e.value)<=time(batch[e.id])){try{this.storage.removeItem?.(key);this.events.delete(key)}catch{this.localOK=false}}
  for(const[id,v]of Object.entries(batch))if(this.pending[id]&&time(this.pending[id])<=time(v))delete this.pending[id];
  this.readJournal();
 }
 announce(){return this.status(this.user===undefined?'Не удалось проверить аккаунт · повторяем подключение':!this.localOK?'Не удалось сохранить на устройстве · сохраните копию ответов':!this.user?'Гость · ответы только в этом браузере':Object.keys(this.pending).length?'Ответы на устройстве · ожидают синхронизации':this.loaded?'Ответы сохранены в аккаунте':'Ответы на устройстве · нет подтверждения из аккаунта')}
 retryLater(){clearTimeout(this.retry);if(!this.destroyed){this.retry=setTimeout(()=>this.reconnect(),10000);this.retry?.unref?.();}}
 async reconnect(){
  if(this.destroyed)return {ok:false};
  if(this.user===undefined){try{const epoch=this.epoch,u=await request(this.api.presentationSession?this.api.presentationSession():this.api.getUser());if(epoch===this.epoch)await this.switchUser(u)}catch{this.announce();this.retryLater();return {ok:false}}}
  return this.flush();
 }
 async start(){
  this.unwatch=this.api.watchPresentationAuth?.(u=>this.switchUser(u));
  this.online=()=>this.reconnect();root.addEventListener?.('online',this.online);
  this.resume=()=>{if(this.user)this.loaded=false;this.reconnect()};root.addEventListener?.('focus',this.resume);
  this.visibility=()=>{if(root.document?.visibilityState==='hidden')this.flush();else this.resume()};root.document?.addEventListener('visibilitychange',this.visibility);
  root.addEventListener?.('pagehide',this.online);
  this.storageChanged=e=>{if(this.user===undefined||!e.key?.startsWith(this.prefix()))return;const before=JSON.stringify(this.records);this.readJournal();this.persist();if(before!==JSON.stringify(this.records)){this.remember();this.onChange(this.records,{remote:true})}this.announce();this.schedule()};
  root.addEventListener?.('storage',this.storageChanged);
  await this.reconnect();while(this.busy){const p=this.busy;await p;if(this.busy===p)break}return this;
 }
 async switchUser(user){
  if(this.destroyed||this.user!==undefined&&(user?.id||null)===(this.user?.id||null))return;
  const changed=this.user!==undefined;clearTimeout(this.timer);clearTimeout(this.retry);this.epoch++;this.user=user||null;this.loaded=false;this.busy=null;this.events=new Map();
  const cache=this.readCache();this.records=cache.records||{};this.pending=cache.pending||{};for(const[id,v]of Object.entries(this.pending))this.journal(id,v);this.readJournal();
  if(this.legacy){try{for(const[id,value]of Object.entries(this.legacy(this.user)||{}))if(!this.records[id]||time(value)>time(this.records[id])){this.records[id]=copy(value);this.pending[id]=copy(value)}}catch{}}
  for(const[id,v]of Object.entries(this.pending))if(![...this.events.values()].some(e=>e.id===id&&same(e.value,v)))this.journal(id,v);
  this.remember();this.persist();this.onChange(this.records,{account:true});this.announce();if(changed){this.onAccountChange(this.user);if(root.__courseworkAccountChanged)return;}
  if(this.user)await this.flush();
 }
 schedule(){clearTimeout(this.timer);if(this.user&&!this.destroyed){this.timer=setTimeout(()=>this.flush(),this.delay);this.timer?.unref?.();}}
 set(id,value){
  if(this.destroyed||root.__courseworkAccountChanged)return;
  if(this.user===undefined){this.announce();return false}
  if(this.known[id]===JSON.stringify(value))return;
  const record=copy(value),disk=this.readCache().records?.[id];record.updatedAt=Math.max(Date.now(),time(this.records[id])+1,time(disk)+1,time(record));
  this.records[id]=record;this.pending[id]=copy(record);const durable=this.journal(id,record);this.known[id]=JSON.stringify(record);this.persist();if(!durable)this.localOK=false;
  this.onChange(this.records,{local:true});this.announce();this.schedule();return record;
 }
 capture(records){for(const[id,value]of Object.entries(records||{}))if(this.known[id]!==JSON.stringify(value))this.set(id,value)}
 remember(){this.known=Object.fromEntries(Object.entries(this.records).map(([id,v])=>[id,JSON.stringify(v)]))}
 async flush(){
  clearTimeout(this.timer);if(this.destroyed)return{ok:false};if(!this.user){this.announce();return{ok:false,guest:this.user===null}}
  if(this.busy)return this.busy;
  const epoch=this.epoch,userId=this.user.id,current=()=>!this.destroyed&&epoch===this.epoch&&userId===this.user?.id;
  const run=async()=>{
   try{
    this.readJournal();this.status('Сохранение в аккаунт…');
    if(!this.loaded){
     const remote=await request(this.api.loadCourseWork(this.course,userId));if(!current())return{ok:false,changed:true};if(!remote?.ok)throw Error(remote?.error||'Нет связи');
     const obsolete={};for(const[id,v]of Object.entries(remote.answers||{}))if(!this.records[id]||time(v)>time(this.records[id])||same(v,this.pending[id])){this.records[id]=copy(v);obsolete[id]=v}
     this.acknowledge(obsolete,[...this.events]);
     for(const[id,v]of Object.entries(this.records))if(time(v)>time(remote.answers?.[id])&&!this.pending[id]){this.pending[id]=copy(v);this.journal(id,v)}
     this.loaded=true;this.remember();this.persist();this.onChange(this.records,{remote:true});
    }
    while(current()){
     this.readJournal();if(!Object.keys(this.pending).length)break;
     const batch={};let bytes=0;for(const[id,v]of Object.entries(this.pending)){const size=JSON.stringify(v).length*3;if(bytes+size>700000&&Object.keys(batch).length)break;batch[id]=copy(v);bytes+=size}
     const sent=[...this.events];
     const result=await request(this.api.saveCourseWork(this.course,batch,userId));if(!current())return{ok:false,changed:true};if(!result?.ok)throw Error(result?.error||'Нет связи');
     this.acknowledge(batch,sent);
     for(const[id,v]of Object.entries(result.answers||{}))if(!this.pending[id]&&(!this.records[id]||time(v)>time(this.records[id])))this.records[id]=copy(v);
     this.remember();this.persist();this.onChange(this.records,{remote:true});
    }
    if(current()){clearTimeout(this.retry);this.announce()}return{ok:current()};
   }catch(error){if(current()){this.status(this.localOK?'Ответы на устройстве · повторим сохранение после восстановления связи':'Не удалось сохранить · скачайте копию ответов');this.retryLater()}return{ok:false,error:error.message}}
  };
  const promise=run();this.busy=promise;try{return await promise}finally{if(current()&&this.busy===promise)this.busy=null}
 }
 destroy(){this.destroyed=true;this.epoch++;clearTimeout(this.timer);clearTimeout(this.retry);this.unwatch?.();root.removeEventListener?.('online',this.online);root.removeEventListener?.('focus',this.resume);root.removeEventListener?.('storage',this.storageChanged);root.removeEventListener?.('pagehide',this.online);root.document?.removeEventListener('visibilitychange',this.visibility)}
}
root.CourseWorkStore=CourseWorkStore;
if(typeof module!=='undefined')module.exports={CourseWorkStore};
})(typeof window==='undefined'?globalThis:window);
