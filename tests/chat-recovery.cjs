const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {JSDOM}=require('jsdom'),{connect,compare}=require('../sm-chat');
const id=n=>'00000000-0000-0000-0000-'+String(n).padStart(12,'0');
const teacher=id(90000),student=id(90001),other=id(90002);
const msg=(n,extra={})=>({id:id(n),teacher_id:teacher,student_id:student,sender_id:student,created_at:'2026-11-05T10:00:00.123456+00:00',body:'Message '+n,read_at:null,...extra});
const tick=()=>new Promise(r=>setImmediate(r));
function server(initial=[]){
 const state={data:initial,fail:false,subs:[],timers:new Map(),number:0,shown:[],states:[],errors:[],hold:null};
 const api={
  async chatPage(t,s,o){if(state.fail)throw Error('offline');if(state.hold){const h=state.hold;state.hold=null;return h;}
   let rows=state.data.filter(m=>m.teacher_id===t&&m.student_id===s).sort(compare);
   if(o.ids)return rows.filter(m=>o.ids.includes(m.id));if(o.before)return rows.filter(m=>compare(m,o.before)<0).slice(-o.limit);
   if(o.after)return rows.filter(m=>compare(m,o.after)>0).slice(0,o.limit);return rows.slice(-o.limit);},
  chatSubscribe(t,s,insert,update,status){const sub={insert,update,status,stopped:false};state.subs.push(sub);return ()=>sub.stopped=true;}
 };
 state.open=()=>connect({api,teacherId:teacher,studentId:student,onRows:(r,m)=>{state.shown=r;state.meta=m;},onState:s=>state.states.push(s),onError:e=>state.errors.push(e),setTimeout:(fn,ms)=>{const n=++state.number;state.timers.set(n,{fn,ms});return n;},clearTimeout:n=>state.timers.delete(n)});
 return state;
}
(async()=>{
 const race=server([msg(1)]);let resolve;race.hold=new Promise(r=>resolve=r);const session=race.open();
 race.subs[0].insert(msg(2));resolve([msg(1)]);await session.sync();assert.deepEqual(race.shown.map(x=>x.id),[id(1),id(2)],'snapshot retains live arrival');
 assert(!race.states.includes('online'),'creating a channel is not a confirmed connection');
 race.subs[0].status('SUBSCRIBED');await session.sync();assert.equal(race.states.at(-1),'online');
 race.fail=true;race.subs[0].status('CHANNEL_ERROR');await session.sync();assert.equal(race.states.at(-1),'offline');
 race.data=[msg(1,{deleted_at:'2026-11-05T11:00Z'}),msg(2),msg(3),msg(4)];race.fail=false;
 await session.sync();assert.equal(race.shown.length,4);assert(race.shown[0].deleted_at,'missed deletion reconciled');
 race.subs[0].insert(msg(4));assert.equal(race.shown.length,4,'live/REST duplicate ignored');
 const rejoin=[...race.timers.values()].find(t=>t.ms===2000);assert(rejoin);rejoin.fn();assert(race.subs[0].stopped);assert.equal(race.subs.length,2);
 race.subs[0].status('SUBSCRIBED');assert.notEqual(race.states.at(-1),'online','stale subscription callback ignored');
 race.subs[1].status('SUBSCRIBED');await session.sync();assert.equal(race.states.at(-1),'online');session.stop();assert.equal(race.timers.size,0);
 const history=server(Array.from({length:1205},(_,i)=>msg(i+1))),h=history.open();await h.sync();assert.equal(history.shown[0].id,id(1106));
 while(history.meta.hasOlder)await h.older();assert.equal(history.shown.length,1205);assert.equal(history.shown[0].id,id(1));
 history.data.push(...Array.from({length:205},(_,i)=>msg(1206+i)));await h.sync();assert.equal(history.shown.length,1410,'same-timestamp catchup traverses every page');h.stop();
 const stale=server();let finish;stale.hold=new Promise(r=>finish=r);const dead=stale.open();dead.stop();finish([msg(1)]);await dead.sync();await tick();assert.equal(stale.shown.length,0);assert.equal(stale.timers.size,0);
 assert(compare(msg(1),msg(2,{created_at:'2026-11-05T10:00:00.123457Z'}))<0);
 // Exercise the actual Supabase adapters, including explicit error propagation.
 const source=fs.readFileSync('sm-auth.js','utf8');let queryCalls=[],response={data:[msg(2),msg(1)]};
 const query=new Proxy({}, {get:(target,key)=>key==='then'?resolve=>Promise.resolve(resolve(response)):(...args)=>{queryCalls.push([key,...args]);return query;}});
 const ctx={useCloud:true,ensureClient:()=>({from:()=>query}),AbortController,setTimeout,clearTimeout,crypto:require('node:crypto')};
 const method=source.slice(source.indexOf('    async chatPage('),source.indexOf('\n\t/* att —'));
 vm.runInNewContext('api={'+method+'}',ctx);assert.deepEqual((await ctx.api.chatMessages(teacher,student)).map(x=>x.id),[id(1),id(2)]);
 await ctx.api.chatPage(teacher,student,{after:msg(2)});assert(queryCalls.some(c=>c[0]==='or'&&c[1].includes('id.gt.'+id(2))));
 response={error:Error('offline')};await assert.rejects(ctx.api.chatMessages(teacher,student),/offline/);
 const sendMethod=source.slice(source.indexOf('\tasync chatSend('),source.indexOf('\n\t/* Удалить своё сообщение'));
 vm.runInNewContext('sendApi={'+sendMethod+'}',ctx);ctx.sendApi.presentationSession=async()=>({id:teacher});
 let sent=null;const prior=msg(42,{sender_id:teacher});ctx.ensureClient=()=>({from:()=>({insert(row){sent=row;return {select:()=>({single:async()=>({error:{code:'23505'}})})};},select(){return {eq(){return this;},maybeSingle:async()=>({data:prior})};}})});
 const ack=await ctx.sendApi.chatSend(teacher,student,'once',null,id(42));assert(ack.ok);assert.equal(sent.id,id(42));assert.equal(ack.msg.id,id(42));
 const subMethod=source.slice(source.indexOf('    chatSubscribe('),source.indexOf('\n\t/* Получатель'));
 let handlers=[],statusCallback,received=0,lastStatus,removed=false;
 const channel={on(event,filter,callback){handlers.push({filter,callback});return this;},subscribe(fn){statusCallback=fn;return this;}};
 ctx.ensureClient=()=>({channel:()=>channel,removeChannel:()=>{removed=true;}});
 vm.runInNewContext('subApi={'+subMethod+'}',ctx);
 const unsub=ctx.subApi.chatSubscribe(teacher,student,()=>received++,()=>received++,s=>lastStatus=s);
 assert.equal(handlers[0].filter.filter,'student_id=eq.'+student);
 handlers[0].callback({new:msg(1,{teacher_id:other})});assert.equal(received,0);
 handlers[0].callback({new:msg(1)});assert.equal(received,1);statusCallback('SUBSCRIBED');assert.equal(lastStatus,'SUBSCRIBED');
 unsub();assert(removed);handlers[0].callback({new:msg(2)});assert.equal(received,1);
 // Actual chat page: switching chats ignores late sends, retry preserves the current draft.
 const dom=new JSDOM(fs.readFileSync('chat.html','utf8'),{url:'https://school.test/chat.html',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;let sends=[],statuses=[],pageRows=[msg(15)],authChanged;
 w.SMUI={esc:s=>String(s),icon:()=>'',mount(){},requireAuth:async()=>({id:teacher})};
 w.SM={myProfile:async()=>({role:'teacher'}),myStudents:async()=>[{student_id:student,name:'One'},{student_id:other,name:'Two'}],teacherUnread:async()=>({}),
  watchPresentationAuth:fn=>{authChanged=fn;},chatReactions:async()=>({}),chatMarkRead:async()=>({ok:false}),chatPage:async()=>pageRows,
  chatSubscribe:(t,s,insert,update,status)=>{statuses.push(status);return ()=>{};},
  chatSend:(t,s,body,att,clientId)=>new Promise(resolve=>sends.push({t,s,body,clientId,resolve}))};
 w.eval(fs.readFileSync('sm-chat.js','utf8'));w.eval([...w.document.scripts].find(s=>!s.src&&s.textContent.includes('function startChat')).textContent+';window.__readMessages=()=>MSGS;');
 await tick();await tick();assert(w.document.querySelector('#chatText'));assert.equal(w.__readMessages()[0].read_at,null,'failed read acknowledgement remains unread');assert(!w.document.querySelector('#chatState').textContent.includes('подключено'));
 statuses[0]('SUBSCRIBED');await tick();assert.equal(w.document.querySelector('#chatState').textContent,'подключено');
 w.document.querySelector('#chatText').value='Original';w.document.querySelector('#chatSend').click();await tick();assert.equal(sends.length,1);
 sends[0].resolve({ok:false,error:'offline'});await tick();w.document.querySelector('#chatText').value='Next draft';w.document.querySelector('.again').click();await tick();
 assert.equal(sends[1].body,'Original');assert.equal(sends[1].clientId,sends[0].clientId);assert.equal(w.document.querySelector('#chatText').value,'Next draft');
 w.document.querySelector('.li[data-i="1"]').click();await tick();sends[1].resolve({ok:true,msg:msg(50,{sender_id:teacher,body:'Original'})});await tick();assert(!w.document.querySelector('#chatScroll').textContent.includes('Original'));
 authChanged(null);assert(!w.document.querySelector('#chatText'));assert(w.document.querySelector('#pane').textContent.includes('Аккаунт изменился'));w.close();
 console.log('PASS chat snapshot/realtime race, reconnect, missed messages/deletions, 1205-message history, 205 same-timestamp catchup, account/conversation guards, idempotent retry and actual page draft preservation.');
})().catch(e=>{console.error(e);process.exit(1);});
