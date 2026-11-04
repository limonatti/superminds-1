const assert=require('node:assert/strict');
const {CourseWorkStore}=require('../coursework-store.js');
const clone=v=>JSON.parse(JSON.stringify(v)),later=()=>new Promise(r=>setImmediate(r));
function deferred(){let resolve;return {promise:new Promise(r=>resolve=r),resolve}}
function memory(){const data=new Map();return{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)}}
(async()=>{
 const cloud={},storage=memory();let user={id:'alice'},offline=false,block=null,watch;
 const api={presentationSession:async()=>user,watchPresentationAuth:fn=>(watch=fn,()=>{}),loadCourseWork:async(course,id)=>offline?{ok:false}:{ok:true,answers:clone(cloud[id]?.[course]||{})},saveCourseWork:async(course,patch,id)=>{
  if(block){const b=block;block=null;await b.promise}if(offline)return{ok:false};if(id!==user?.id)return{ok:false};
  const rows=(cloud[id]??={})[course]??={};for(const[k,v]of Object.entries(patch))if(!rows[k]||v.updatedAt>=rows[k].updatedAt)rows[k]=clone(v);return{ok:true,answers:clone(rows)};
 }};
 const make=(opts={})=>new CourseWorkStore({course:'test',api,storage,delay:60000,...opts});
 const initialGate=deferred();let booted=false;
 const initial=make({course:'initial',api:{...api,watchPresentationAuth:fn=>{fn(user);return()=>{}},loadCourseWork:async()=>{await initialGate.promise;return{ok:true,answers:{old:{values:['existing answer'],updatedAt:1}}}}}});
 const boot=initial.start().then(()=>booted=true);await later();assert.equal(booted,false);initialGate.resolve();await boot;assert.equal(initial.records.old.values[0],'existing answer');initial.destroy();
 const a=await make().start();a.set('partial',{values:['wrong',''],done:false});a.set('open',{values:['My own answer'],done:true});
 const pause=deferred();block=pause;const flushing=a.flush();await later();a.set('partial',{values:['correct','other'],done:true});assert(!a.message.includes('сохранены в аккаунте'));pause.resolve();await flushing;
 assert.deepEqual(cloud.alice.test.partial.values,['correct','other']);assert.equal(Object.keys(a.pending).length,0);assert(a.message.includes('сохранены в аккаунте'));
 a.destroy();const reopened=await make().start();assert.equal(reopened.records.open.values[0],'My own answer');
 const device=await make({storage:memory()}).start();assert.deepEqual(device.records.partial.values,['correct','other']);device.destroy();
 offline=true;reopened.set('offline',{values:['draft']});assert.equal((await reopened.flush()).ok,false);assert(!reopened.message.includes('сохранены в аккаунте'));reopened.destroy();
 const retry=await make().start();assert(retry.pending.offline);offline=false;await retry.flush();assert.equal(cloud.alice.test.offline.values[0],'draft');
 const held=deferred();block=held;retry.set('private',{values:['alice only']});const pending=retry.flush();await later();user={id:'bob'};await retry.switchUser(user);held.resolve();await pending;
 assert.deepEqual(retry.records,{});assert(!cloud.bob?.test?.private);retry.set('bob',{values:['bob only']});await retry.flush();
 user=null;await retry.switchUser(user);assert.deepEqual(retry.records,{});user={id:'alice'};await retry.switchUser(user);assert.equal(retry.records.private.values[0],'alice only');assert(!retry.records.bob);
 assert.equal(cloud.alice.test.private.values[0],'alice only');retry.destroy();
 const captured=await make().start();captured.records.partial.values[0]='edited in place';captured.capture(captured.records);await captured.flush();assert.equal(cloud.alice.test.partial.values[0],'edited in place');
 globalThis.__courseworkAccountChanged=true;captured.set('stale',{values:['old tab unload']});assert(!captured.records.stale);delete globalThis.__courseworkAccountChanged;captured.destroy();
 // Account navigation removes the old UI; do not start another load against it.
 let loads=0;const navigating=await make({api:{...api,loadCourseWork:async()=>{loads++;return{ok:true,answers:{}}}},onAccountChange:()=>{globalThis.__courseworkAccountChanged=true},onStatus:()=>{if(globalThis.__courseworkAccountChanged)throw Error('detached UI')}}).start();
 const before=loads;await navigating.switchUser({id:'next-account'});assert.equal(loads,before);delete globalThis.__courseworkAccountChanged;navigating.destroy();
 // Concurrent courses are independent; older server ACKs cannot overwrite new edits.
 const first=await make({course:'first'}).start(),second=await make({course:'second'}).start();first.set('e',{values:['1']});second.set('e',{values:['2']});await Promise.all([first.flush(),second.flush()]);assert(cloud.alice.first.e&&cloud.alice.second.e);first.destroy();second.destroy();
 const quota=await make({storage:{getItem:()=>null,setItem:()=>{throw Error('quota')}}}).start();quota.set('quota',{values:['cloud survives']});await quota.flush();assert(cloud.alice.test.quota);assert(!quota.message.includes('сохранены в аккаунте'));quota.destroy();
 console.log('PASS drafts, completed/open/wrong answers, ACK, in-flight edit, reload, fresh device, offline queue, retry, signout/in, account isolation, cross-course writes, quota');
})().catch(e=>{console.error(e);process.exitCode=1});
