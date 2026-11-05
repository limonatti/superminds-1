/* Realtime is a notification channel; REST cursors recover missed messages. */
(function(root){
'use strict';
const fraction=m=>(/\.(\d+)/.exec(m.created_at)?.[1]||'').padEnd(6,'0');
const compare=(a,b)=>Date.parse(a.created_at)-Date.parse(b.created_at)||fraction(a).localeCompare(fraction(b))||a.id.localeCompare(b.id);
function connect(options){
 const {api,teacherId,studentId,onRows=()=>{},onState=()=>{},onError=()=>{}}=options;
 const later=options.setTimeout||setTimeout,cancel=options.clearTimeout||clearTimeout;
 const rows=new Map();let stopped=false,subscribed=false,loaded=false,more=false,cursor=null,busy=null,olderBusy=null,unsubscribe=null,poll=null,rejoin=null,subscription=0,retries=0;
 const values=()=>[...rows.values()].sort(compare);
 const state=()=>onState(subscribed&&loaded?'online':loaded?'polling':'connecting');
 function merge(incoming,reason='live'){
  if(stopped)return;
  for(const m of incoming)if(m?.id&&m.teacher_id===teacherId&&m.student_id===studentId){
   const old=rows.get(m.id);
   // A delayed snapshot must not undo a deletion or read receipt received live.
   rows.set(m.id,old?.deleted_at?old:{...old,...m,read_at:m.read_at||old?.read_at||null});
  }
  onRows(values(),{reason,loaded,hasOlder:more});
 }
 function schedule(){cancel(poll);if(!stopped)poll=later(()=>sync(),subscribed?30000:10000);}
 function sync(){
  if(stopped)return Promise.resolve({ok:false});if(busy)return busy;
  busy=(async()=>{
   try{
    if(!loaded){
     const page=await api.chatPage(teacherId,studentId,{limit:100});if(stopped)return {ok:false};
     loaded=true;more=page.length===100;cursor=page.at(-1)||null;merge(page,'initial');
    }else if(cursor){
     let page;
     do{
      page=await api.chatPage(teacherId,studentId,{after:cursor,limit:100});if(stopped)return {ok:false};
      if(page.length)cursor=page.at(-1);merge(page,'catchup');
     }while(page.length===100);
    }else{
     const page=await api.chatPage(teacherId,studentId,{limit:100});if(stopped)return {ok:false};
     cursor=page.at(-1)||null;more=page.length===100;merge(page,'catchup');
    }
    // Refresh loaded messages too: reads/deletions can occur while disconnected.
    const ids=values().map(m=>m.id);
    for(let i=0;i<ids.length;i+=100){
     const latest=await api.chatPage(teacherId,studentId,{ids:ids.slice(i,i+100),limit:100});
     if(stopped)return {ok:false};merge(latest,'refresh');
    }
    state();onError(null);return {ok:true};
   }catch(error){if(!stopped){onState('offline');onError(error.message||'Не удалось обновить переписку');}return {ok:false};}
  })().finally(()=>{busy=null;schedule();});return busy;
 }
 function older(){
  if(stopped||!loaded||!more)return Promise.resolve({ok:true});if(olderBusy)return olderBusy;
  olderBusy=(async()=>{
   try{const page=await api.chatPage(teacherId,studentId,{before:values()[0],limit:100});if(stopped)return {ok:false};more=page.length===100;merge(page,'older');return {ok:true};}
   catch(error){if(!stopped)onError('Не удалось загрузить предыдущие сообщения. Повторите загрузку.');return {ok:false};}
  })().finally(()=>{olderBusy=null;});return olderBusy;
 }
 function reconnect(){
  if(stopped)return;cancel(rejoin);const generation=++subscription;
  unsubscribe?.();unsubscribe=null;subscribed=false;state();
  const retry=()=>{cancel(rejoin);rejoin=later(reconnect,Math.min(30000,2000*2**Math.min(retries++,4)));};
  try{
   unsubscribe=api.chatSubscribe(teacherId,studentId,m=>merge([m]),m=>merge([m]),status=>{
    if(stopped||generation!==subscription)return;
    if(status==='SUBSCRIBED'){subscribed=true;retries=0;cancel(rejoin);sync();}
    else if(['CHANNEL_ERROR','TIMED_OUT','CLOSED'].includes(status)){subscribed=false;state();sync();retry();}
   });
   if(!unsubscribe)retry();
  }catch(error){retry();}
  schedule();
 }
 const online=()=>{reconnect();sync();};
 root.addEventListener?.('online',online);
 reconnect();sync();
 return {sync,older,merge,values,stop(){stopped=true;subscription++;cancel(poll);cancel(rejoin);unsubscribe?.();root.removeEventListener?.('online',online);}};
}
root.SMChat={connect,compare};if(typeof module!=='undefined')module.exports=root.SMChat;
})(typeof window==='undefined'?globalThis:window);
