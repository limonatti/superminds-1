const assert=require('node:assert/strict');
const Store=require('../speakout-b2plus-active-teach/assets/account-store.js');
const clone=x=>JSON.parse(JSON.stringify(x));
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};};
const stroke=(c='red')=>({p:[[.2,.3],[.4,.5]],w:3,c});
(async()=>{
 const server=new Map(),stores=[];let fail=false,readFail=false,hold=null;
 function device(user='a',storage=memory()){
  const api={presentationSession:async()=>({id:user}),watchPresentationAuth:()=>()=>{},
   loadPresentationPage:async(u,c,p)=>{if(readFail)throw Error('offline');return clone(server.get(u+p)||{});},
   loadPresentationPages:async(u)=>[...server].filter(([k])=>k.startsWith(u)).map(([k,data])=>({page:k.slice(u.length),data:clone(data)})),
   savePresentationPage:async(u,c,p,patch)=>{if(fail)throw Error('offline');const value={...server.get(u+p),...clone(patch)};server.set(u+p,value);if(hold)await hold;return clone(value);}};
  const s=new Store({api,storage,delay:1e6});stores.push(s);return s;
 }
 try{
  const a=device(),b=device();await a.start();await b.start();
  let ink=a.get('ink',{});ink['sb:7']=[stroke()];a.set('ink',ink);await a.flush();
  await b.pull();assert.equal(b.get('ink',{})['sb:7'].length,1,'second device downloads marks');
  const stale=b.get('ink',{});ink=a.get('ink',{});ink['sb:7']=[];a.set('ink',ink);await a.flush();
  stale['sb:7'].push(stroke('blue'));b.set('ink',stale);await b.flush();await a.pull();
  assert.deepEqual(a.get('ink',{})['sb:7'].map(s=>s.c),['blue'],'stale snapshot does not resurrect an erased stroke');
  a.answer('ex1:1','answer one');b.answer('ex1:2','answer two');await Promise.all([a.flush(),b.flush()]);await a.pull();
  assert.deepEqual(a.answers(),{'ex1:1':'answer one','ex1:2':'answer two'},'different answers merge atomically');
  fail=true;a.answer('ex1:3','offline draft');await a.flush();const restored=device('a',a.storage);await restored.start();
  assert.equal(restored.answers()['ex1:3'],'offline draft','pending work survives reload');fail=false;await restored.flush();await b.pull();assert.equal(b.answers()['ex1:3'],'offline draft');
  await a.switchUser({id:'b'});assert.deepEqual(a.get('ink',{}),{'sb:7':[]});assert.deepEqual(a.answers(),{},'no cross-account data');
  a.answer('private','account b');await a.flush();await b.pull();assert.equal(b.answers().private,undefined);
  await a.switchUser(null);assert.deepEqual(a.answers(),{},'logout clears previous account');
  const legacy=memory();legacy.setItem('ewa_speakout_b2plus_ink',JSON.stringify({'wb:2':[stroke('old')]}));
  const c=device('c',legacy);readFail=true;await c.start();assert.equal(server.get('cwb:2'),undefined,'failed initial download cannot overwrite cloud during migration');
  const unavailable=device('missing-table');let lastStatus;unavailable.onStatus=(state)=>lastStatus=state;await unavailable.start();assert.equal(lastStatus,'error','failed cloud load must never claim saved, even with no pending edits');
  readFail=false;await c.flush();await c.openPage('wb:2');assert.equal(c.get('ink',{})['wb:2'][0].c,'old');
  await c.switchUser({id:'d'});assert(!c.get('ink',{})['wb:2']?.length,'legacy marks imported once, not into every account');
  const guestStorage=memory();guestStorage.setItem('ewa_speakout_b2plus_ink',JSON.stringify({'sb:7':[stroke('erased')]}));const guest=device('guest-owner',guestStorage);
  await guest.switchUser(null);let guestInk=guest.get('ink',{});guestInk['sb:7']=[];guest.set('ink',guestInk);await guest.switchUser({id:'guest-owner'});
  assert.equal(guest.get('ink',{})['sb:7'].length,0,'guest deletion takes precedence over legacy import');
  await guest.switchUser(null);guest.answer('new-guest-answer','new draft');await guest.switchUser({id:'guest-owner'});assert.equal(guest.answers()['new-guest-answer'],'new draft','new guest work transfers on a later login too');
  let release;hold=new Promise(r=>release=r);b.answer('race','first');const saving=b.flush();await new Promise(r=>setImmediate(r));b.answer('race','second');release();hold=null;await saving;await b.flush();
  assert.equal(server.get('asb:7')['answer:race'],'second','late acknowledgement does not discard a newer edit');
  let finish;hold=new Promise(r=>finish=r);b.answer('late','old account');const old=b.flush();await new Promise(r=>setImmediate(r));await b.switchUser({id:'z'});finish();hold=null;await old;
  assert.deepEqual(b.answers(),{},'late response cannot hydrate a different account');
  console.log('PASS cloud restore, per-field merge, tombstones, offline retry, migration, account isolation and in-flight races');
 } finally {stores.forEach(s=>s.destroy());}
})().catch(e=>{console.error(e);process.exitCode=1});
