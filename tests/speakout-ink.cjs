const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const copy=v=>JSON.parse(JSON.stringify(v)),storeSource=fs.readFileSync('coursework-store.js','utf8'),adapter=fs.readFileSync('speakout-store.js','utf8');
const memory=()=>{const data=new Map();return {data,get length(){return data.size},key:i=>[...data.keys()][i],getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}};
const line=(type='pen',x=.1)=>({type,points:[[x,.2],[x+.1,.3]]});
(async()=>{
 for(const course of ['speakout-a1','speakout-b1','speakout-b1plus']){
  const cloud={},opened=[];let lostAck=false;
  async function boot(user,storage=memory(),online=true,authError=false){
   const controls=[],events=[],listeners={};let auth;
   const device={online,user,storage,authError};
   const api={presentationSession:async()=>{if(device.authError)throw Error('auth unavailable');return device.user?{id:device.user}:null},watchPresentationAuth:fn=>(auth=fn,()=>{}),loadCourseWork:async()=>device.online?{ok:true,answers:copy(cloud[device.user]||{})}:{ok:false},saveCourseWork:async(c,rows,u)=>{
    assert.equal(c,course);assert.equal(u,device.user);if(!device.online)return {ok:false};
    for(const[id,r]of Object.entries(rows))if(!cloud[u]?.[id]||r.updatedAt>=cloud[u][id].updatedAt)(cloud[u]||={})[id]=copy(r);
    if(lostAck){lostAck=false;return {ok:false}}return {ok:true,answers:copy(cloud[u])};
   }};
   const env={localStorage:storage,SM:api,COURSE:{books:{sb:{pages:[]}}},crypto:require('node:crypto').webcrypto,dispatchEvent(e){events.push(e.type);listeners[e.type]?.forEach(fn=>fn(e))},addEventListener(type,fn){(listeners[type]||=[]).push(fn)},removeEventListener(){},Event,console,setTimeout,clearTimeout,CourseWorkUI:{bind(){},accountChanged(){env.__courseworkAccountChanged=true}}};env.window=env;
   env.document={currentScript:{dataset:{course,app:'app.js'}},visibilityState:'visible',addEventListener(){},removeEventListener(){},getElementById:()=>({textContent:''}),querySelector:()=>({append(){}}),body:{append(script){script.onload?.()}},createElement:tag=>{const e={tag,append(){},dataset:{}};controls.push(e);return e}};
   vm.createContext(env);vm.runInContext(storeSource,env);await vm.runInContext(adapter,env);device.adapter=env.B1Store;device.events=events;device.controls=controls;device.switchUser=async next=>{device.user=next;await auth(next?{id:next}:null)};opened.push(device);return device;
  }
  const a=await boot('alice');a.adapter.state.drawing={'sb:8':[line(),line('marker')],'wb:4':[line('cover')]};a.adapter.state.answers={'sb:8:2A':{values:{1:'answer remains'}}};a.adapter.save(a.adapter.state);await a.adapter.flush();
  const b=await boot('alice');assert.deepEqual(copy(b.adapter.state.drawing),copy(a.adapter.state.drawing));assert.equal(b.adapter.state.answers['sb:8:2A'].values[1],'answer remains');
  const bob=await boot('bob',a.storage);assert.deepEqual(copy(bob.adapter.state.drawing),{});
  // Two independent offline devices add to the same page without replacing one another.
  a.online=b.online=false;a.adapter.state.drawing['sb:8'].push(line('pen',.3));a.adapter.save(a.adapter.state);b.adapter.state.drawing['sb:8'].push(line('marker',.5));b.adapter.save(b.adapter.state);
  a.online=true;await a.adapter.flush();b.online=true;await b.adapter.flush();a.adapter.store.loaded=false;await a.adapter.flush();assert.equal(a.adapter.state.drawing['sb:8'].length,4);assert.equal(b.adapter.state.drawing['sb:8'].length,4);
  // A stale device saving something else must not resurrect an erased stroke.
  const deleted=a.adapter.state.drawing['sb:8'].pop().id;a.adapter.save(a.adapter.state);await a.adapter.flush();b.adapter.state.drawing['wb:4'].push(line());b.adapter.save(b.adapter.state);await b.adapter.flush();assert(!b.adapter.state.drawing['sb:8'].some(s=>s.id===deleted));
  a.adapter.state.drawing['sb:8']=[];a.adapter.save(a.adapter.state);await a.adapter.flush();const fresh=await boot('alice');assert.equal(fresh.adapter.state.drawing['sb:8'].length,0);assert.equal(fresh.adapter.state.drawing['wb:4'].length,2);
  // Reopening a stale raw browser snapshot respects server tombstones.
  const stale=await boot('alice',b.storage);assert.equal(stale.adapter.state.drawing['sb:8'].length,0);
  // Offline journal survives a reload; a lost acknowledgement is idempotent.
  fresh.online=false;fresh.adapter.state.drawing['sb:9']=[line()];fresh.adapter.save(fresh.adapter.state);fresh.adapter.store.destroy();const reopened=await boot('alice',fresh.storage,false);assert.equal(reopened.adapter.state.drawing['sb:9'].length,1);reopened.online=true;lostAck=true;assert.equal((await reopened.adapter.flush()).ok,false);await reopened.adapter.flush();const after=await boot('alice');assert.equal(after.adapter.state.drawing['sb:9'].length,1);
  // Raw account-owned drawings migrate once with deterministic identities.
  const old=memory(),raw={drawing:{'sb:12':[line(),line('cover')]}};old.setItem(course+'-v1:alice',JSON.stringify(raw));const migrated=await boot('alice',old);assert.equal(migrated.adapter.state.drawing['sb:12'].length,2);migrated.adapter.state.drawing['sb:12']=[];migrated.adapter.save(migrated.adapter.state);await migrated.adapter.flush();const oldAgain=memory();oldAgain.setItem(course+'-v1:alice',JSON.stringify(raw));const deletedAgain=await boot('alice',oldAgain);assert.equal(deletedAgain.adapter.state.drawing['sb:12'].length,0);
  // Unowned and guest marks require an explicit claim, retaining the original backup.
  for(const suffix of ['',':guest']){const guest=memory();guest.setItem(course+'-v1'+suffix,JSON.stringify({drawing:{'wb:16':[line()]}}));const owner=await boot('carol'+suffix,guest);assert.equal(owner.adapter.state.drawing['wb:16'],undefined);const button=owner.controls.find(e=>e.tag==='button');assert(button);await button.onclick();assert.equal(owner.adapter.state.drawing['wb:16'].length,1);assert(guest.getItem(course+'-v1'+suffix));}
  const guestLater=memory(),lateRaw={drawing:{'sb:20':[line()]}};guestLater.setItem(course+'-v1',JSON.stringify(lateRaw));const lateOwner=await boot('late',guestLater),peerDisk=memory();peerDisk.setItem(course+'-v1:late',JSON.stringify(lateRaw));const peer=await boot('late',peerDisk);peer.adapter.state.drawing['sb:20']=[];peer.adapter.save(peer.adapter.state);await peer.adapter.flush();await lateOwner.controls.find(e=>e.tag==='button').onclick();assert.equal(lateOwner.adapter.state.drawing['sb:20'].length,0,'claim reads current cloud tombstones');
  // Old event handlers cannot save Alice's marks after an account switch.
  const original=after.adapter.state;await after.switchUser('dave');assert.equal(after.adapter.save(original),false);assert.deepEqual(copy(after.adapter.store.records),{});assert.equal(after.storage.getItem(course+'-v1:dave'),null);
  const failedAuth=await boot('reconnected',memory(),true,true);assert.equal(failedAuth.adapter.save({drawing:{'sb:8':[line()]}}),false);failedAuth.authError=false;await failedAuth.adapter.store.reconnect();failedAuth.adapter.state.drawing['sb:8']=[line()];assert.equal(failedAuth.adapter.save(failedAuth.adapter.state),true);await failedAuth.adapter.flush();assert.equal((await boot('reconnected')).adapter.state.drawing['sb:8'].length,1);
  assert(b.events.includes('coursework-ink-restored'));
  for(const d of opened)d.adapter.store.destroy();
 }
 console.log('PASS A1/B1/B1+ pen, marker and cover: fresh device, own account, pages/books, offline reload, merged devices, clear/undo tombstones, lost ACK, legacy migration and explicit guest ownership.');
})().catch(e=>{console.error(e);process.exitCode=1});
