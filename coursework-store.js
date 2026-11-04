/* Durable account drafts. Saving a draft never submits a homework assignment. */
(function(root){
'use strict';
const request=async p=>{let timer;try{return await Promise.race([p,new Promise((_,reject)=>timer=setTimeout(()=>reject(Error('Нет связи')),10000))])}finally{clearTimeout(timer)}};
const copy=v=>JSON.parse(JSON.stringify(v)),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),time=v=>Number(v?.updatedAt)||0;
class CourseWorkStore{
 constructor({course,api=root.SM,storage=root.localStorage,delay=700,onChange=()=>{},onStatus=()=>{},onAccountChange=()=>{},legacy}={}){
  Object.assign(this,{course,api,storage,delay,onChange,onStatus,onAccountChange,legacy});
  this.records={};this.pending={};this.known={};this.epoch=0;this.user=undefined;this.loaded=false;this.busy=null;this.timer=null;this.localOK=true;this.message='Загрузка ответов…';
 }
 key(){return `coursework-v2:${this.course}:${this.user?.id||'guest'}`}
 status(message){this.message=message;this.onStatus(message);return message}
 persist(){try{this.storage.setItem(this.key(),JSON.stringify({records:this.records,pending:this.pending}));this.localOK=true}catch{this.localOK=false}return this.localOK}
 announce(){return this.status(!this.localOK?'Не удалось сохранить на устройстве · сохраните копию ответов':!this.user?'Гость · ответы только в этом браузере':Object.keys(this.pending).length?'Ответы на устройстве · ожидают синхронизации':this.loaded?'Ответы сохранены в аккаунте':'Ответы на устройстве · нет подтверждения из аккаунта')}
 async start(){
  this.unwatch=this.api.watchPresentationAuth?.(u=>this.switchUser(u));
  const epoch=this.epoch;
  try{const u=await (this.api.presentationSession?this.api.presentationSession():this.api.getUser());if(epoch===this.epoch)await this.switchUser(u)}catch{if(this.user===undefined)await this.switchUser(null)}
  // Supabase may announce INITIAL_SESSION before presentationSession resolves.
  // Wait for that initial load too, before an adapter opens an empty exercise.
  while(this.busy){const pending=this.busy;await pending;if(this.busy===pending)break}
  this.online=()=>this.flush();root.addEventListener?.('online',this.online);
  this.visibility=()=>{if(root.document?.visibilityState==='hidden')this.flush()};root.document?.addEventListener('visibilitychange',this.visibility);
  root.addEventListener?.('pagehide',this.online);return this;
 }
 async switchUser(user){
  if(this.user!==undefined&&(user?.id||null)===(this.user?.id||null))return;
  const changed=this.user!==undefined;clearTimeout(this.timer);this.epoch++;this.user=user||null;this.loaded=false;this.busy=null;this.records={};this.pending={};
  try{const cached=JSON.parse(this.storage.getItem(this.key())||'{}');this.records=cached.records||{};this.pending=cached.pending||{}}catch{}
  if(this.legacy){try{for(const[id,value]of Object.entries(this.legacy(this.user)||{}))if(!this.records[id]||time(value)>time(this.records[id])){this.records[id]=copy(value);this.pending[id]=copy(value)}}catch{}}
  this.remember();this.persist();this.onChange(this.records,{account:true});this.announce();if(changed){this.onAccountChange(this.user);if(root.__courseworkAccountChanged)return;}
  if(this.user)await this.flush();
 }
 set(id,value){
  if(root.__courseworkAccountChanged)return;
  if(this.user===undefined)throw Error('Answers are still loading');
  if(this.known[id]===JSON.stringify(value))return;
  const record=copy(value);record.updatedAt=Math.max(Date.now(),time(this.records[id])+1,time(record));
  this.records[id]=record;this.pending[id]=copy(record);this.known[id]=JSON.stringify(record);this.persist();this.onChange(this.records,{local:true});this.announce();
  clearTimeout(this.timer);if(this.user)this.timer=setTimeout(()=>this.flush(),this.delay);return record;
 }
 capture(records){for(const[id,value]of Object.entries(records||{}))if(this.known[id]!==JSON.stringify(value))this.set(id,value)}
 remember(){this.known=Object.fromEntries(Object.entries(this.records).map(([id,v])=>[id,JSON.stringify(v)]))}
 async flush(){
  clearTimeout(this.timer);if(!this.user){this.announce();return{ok:false,guest:true}}
  if(this.busy)return this.busy;
  const epoch=this.epoch,userId=this.user.id,current=()=>epoch===this.epoch&&userId===this.user?.id;
  const run=async()=>{
   try{
    this.status('Сохранение в аккаунт…');
    if(!this.loaded){
     const remote=await request(this.api.loadCourseWork(this.course,userId));if(!current())return{ok:false,changed:true};if(!remote?.ok)throw Error(remote?.error||'Нет связи');
     for(const[id,v]of Object.entries(remote.answers||{}))if(!this.records[id]||time(v)>time(this.records[id])){this.records[id]=copy(v);delete this.pending[id]}
     for(const[id,v]of Object.entries(this.records))if(time(v)>time(remote.answers?.[id]))this.pending[id]=copy(v);
     this.loaded=true;this.remember();this.persist();this.onChange(this.records,{remote:true});
    }
    while(current()&&Object.keys(this.pending).length){
     // Bounded patches; retain all other pending records during an in-flight save.
     const batch={};let bytes=0;for(const[id,v]of Object.entries(this.pending)){const size=JSON.stringify(v).length*3;if(bytes+size>700000&&Object.keys(batch).length)break;batch[id]=copy(v);bytes+=size}
     const result=await request(this.api.saveCourseWork(this.course,batch,userId));if(!current())return{ok:false,changed:true};if(!result?.ok)throw Error(result?.error||'Нет связи');
     for(const[id,v]of Object.entries(batch))if(same(this.pending[id],v))delete this.pending[id];
     for(const[id,v]of Object.entries(result.answers||{}))if(!this.pending[id]&&(!this.records[id]||time(v)>time(this.records[id])))this.records[id]=copy(v);
     this.remember();this.persist();this.onChange(this.records,{remote:true});
    }
    if(current())this.announce();return{ok:current()};
   }catch(error){if(current())this.status(this.localOK?'Ответы на устройстве · нет связи, нажмите «Сохранить ответы» для повтора':'Не удалось сохранить · скачайте копию ответов');return{ok:false,error:error.message}}
  };
  const promise=run();this.busy=promise;try{return await promise}finally{if(current()&&this.busy===promise)this.busy=null}
 }
 destroy(){this.epoch++;clearTimeout(this.timer);this.unwatch?.();root.removeEventListener?.('online',this.online);root.removeEventListener?.('pagehide',this.online);root.document?.removeEventListener('visibilitychange',this.visibility)}
}
root.CourseWorkStore=CourseWorkStore;
if(typeof module!=='undefined')module.exports={CourseWorkStore};
})(typeof window==='undefined'?globalThis:window);
