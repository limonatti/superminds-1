// The real browser store + real PostgreSQL functions, with synthetic accounts.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto'),{PGlite}=require('@electric-sql/pglite'),{JSDOM}=require('jsdom');
const source=fs.readFileSync('sm-auth.js','utf8').split('/* BEGIN LEARNING STORE:')[1].split('/* END LEARNING STORE */')[0];
const storeSource='/* BEGIN LEARNING STORE:'+source;
const A='00000000-0000-0000-0000-000000000001',B='00000000-0000-0000-0000-000000000002';
class Storage{
  data=new Map();get length(){return this.data.size;}key(n){return [...this.data.keys()][n];}
  getItem(k){return this.data.get(k)||null;}setItem(k,v){this.data.set(k,v);}removeItem(k){this.data.delete(k);}
}
(async()=>{
 const db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create schema auth;grant usage on schema auth to anon,authenticated;
 create table auth.users(id uuid primary key);insert into auth.users values('${A}'),('${B}');
 create function auth.uid() returns uuid language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),nullif(current_setting('app.student_id',true),''))::uuid$$;
 create table public.progress(user_id uuid primary key references auth.users,data jsonb not null default '{}',updated_at timestamptz not null default now());
 alter table public.progress enable row level security;
 create policy own on public.progress to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
 grant select,insert,update on public.progress to authenticated;`);
 await db.exec(fs.readFileSync('sql/coursework-atomic.sql','utf8'));
 const migration=fs.readdirSync('supabase/migrations').find(x=>x.endsWith('_durable_learning_progress.sql'));
 await db.exec(fs.readFileSync('supabase/migrations/'+migration,'utf8'));
 const as=async(id,fn)=>db.transaction(async tx=>{await tx.exec(`set local role authenticated;select set_config('app.student_id','${id}',true);`);return fn(tx);});
 const read=id=>as(id,async tx=>(await tx.query('select data from progress where user_id=$1',[id])).rows[0]?.data||{});
 const apply=(id,events)=>as(id,async tx=>(await tx.query('select apply_learning_events($1,$2) as ids',[id,JSON.stringify(events)])).rows[0].ids);
 const event=actions=>({id:randomUUID(),at:Date.now(),actions});
 const browsers=[];
 function browser(id=A,storage=new Storage()){
   const dom=new JSDOM('<body></body>',{url:'https://school.test'});browsers.push(dom);
   const state={id,readError:false,writeError:false,loseResponse:false,requests:0,listeners:[],beforeRpc:null};
   const c={auth:{getSession:async()=>({data:{session:state.id?{user:{id:state.id}}:null}}),onAuthStateChange:fn=>{state.listeners.push(fn);return {data:{subscription:{unsubscribe(){}}}};}},
     from:()=>({select:()=>({eq:(k,uid)=>({maybeSingle:async()=>state.readError?{error:{message:'offline'}}:{data:{data:await read(uid)}}})})}),
     rpc:async(name,args)=>{state.requests++;if(state.beforeRpc)await state.beforeRpc();if(state.writeError)return {error:{message:'offline'}};
       if(state.id!==args.p_user)return {error:{message:'account changed'}};
       const data=await apply(args.p_user,args.p_events);if(state.loseResponse){state.loseResponse=false;return {error:{message:'response lost'}};}return {data};}
   };
   const ctx={window:dom.window,document:dom.window.document,CustomEvent:dom.window.CustomEvent,localStorage:storage,crypto:{randomUUID},AbortController,Date,console,
     setTimeout:()=>1,clearTimeout:()=>{}};
   vm.runInNewContext(storeSource+';globalThis.store=SM_createLearningStore(client);',{...ctx,client:c,globalThis:ctx});
   return {store:ctx.store,state,storage,dom,switch(next){state.id=next;state.listeners.forEach(fn=>fn('SIGNED_IN',next?{user:{id:next}}:null));}};
 }
 const first=browser();await first.store.load();
 first.state.readError=true;await assert.rejects(first.store.load(),/загрузить/);
 assert.equal((await first.store.save({word:{seen:1}})).ok,false);assert.equal(first.state.requests,0);
 first.state.readError=false;
 // Before any network await, a click must be on disk. Survives a new tab/page.
 first.store.answer('u1-1',true);assert.equal(first.storage.length,1);
 first.state.writeError=true;assert.equal((await first.store.flush()).ok,false);assert.equal(first.storage.length,1);
 const reloaded=browser(A,first.storage);await reloaded.store.flush();assert.equal(first.storage.length,0);
 assert.equal((await read(A))['u1-1'].seen,1);
 assert.equal((await read(A))['u1-1'].level,0);
 // The quest chest is recorded even if reading progress is currently impossible.
 reloaded.state.readError=true;reloaded.state.writeError=true;
 await reloaded.store.quest('offline-quest',3);await reloaded.store.flush();assert.equal(reloaded.storage.length,1);
 reloaded.state.readError=false;reloaded.state.writeError=false;await reloaded.store.flush();
 assert.equal((await read(A)).__quest['offline-quest'].stars,3);
 // Lost HTTP response after a committed transaction must not double-count.
 reloaded.store.answer('u1-1',true);reloaded.state.loseResponse=true;
 assert.equal((await reloaded.store.flush()).ok,false);assert.equal(reloaded.storage.length,1);
 assert.equal((await reloaded.store.flush()).ok,true);assert.equal((await read(A))['u1-1'].seen,2);
 assert.equal((await read(A))['u1-1'].b,2);
 // New answers arriving while a batch is in flight are drained separately.
 let release;reloaded.state.beforeRpc=()=>new Promise(resolve=>release=resolve);
 reloaded.store.answer('u1-2',false);const pending=reloaded.store.flush();
 while(!release)await new Promise(resolve=>setImmediate(resolve));
 reloaded.store.answer('u1-3',true);reloaded.state.beforeRpc=null;release();await pending;
 assert.equal((await read(A))['u1-2'].seen,1);assert.equal((await read(A))['u1-3'].seen,1);
 // Two stale snapshots of the same word retain both answers and their points.
 const x=browser(),y=browser();const px=await x.store.load(),py=await y.store.load();
 function correct(p,word){const old=p[word]||{seen:0,correct:0,level:0,b:0};p[word]={...old,seen:old.seen+1,correct:old.correct+1,level:Math.min(4,old.level+1),b:Math.min(5,old.b+1),status:'learning'};p.__meta={...(p.__meta||{}),totalPoints:(p.__meta?.totalPoints||0)+10,weekKey:'2026-45',weekPoints:(p.__meta?.weekPoints||0)+10};}
 correct(px,'trainer');correct(py,'trainer');await x.store.save(px);await y.store.save(py);
 await x.store.flush();await y.store.flush();let data=await read(A);
 assert.equal(data.trainer.seen,2);assert.equal(data.trainer.level,2);assert.equal(data.__meta.totalPoints,20);assert.equal(data.__meta.weekPoints,20);
 // A late answer from the previous week must not reset this week's score.
 await apply(A,[event([{type:'weekly',week:'2026-46',value:10}]),event([{type:'weekly',week:'2026-45',value:50}])]);
 assert.equal((await read(A)).__meta.weekPoints,10);
 // Independent quest completions, badges, pet changes and coursework coexist.
 const p1=await x.store.load(),p2=await y.store.load();
 p1.__quest={unit:{done:true,stars:3,at:1}};p1.__meta.badges=['a'];
 p2.__quest={unit:{done:true,stars:1,at:2},other:{done:true,stars:2,at:2}};p2.__meta.badges=['b'];p2.__pet={name:'Сова',fed:'2026-11-04',fedCount:1,streak:1};
 await x.store.save(p1);await y.store.save(p2);await x.store.flush();await y.store.flush();
 await as(A,tx=>tx.query('select save_course_work($1,$2,$3)',[A,'a',JSON.stringify({q:{updatedAt:5,values:['hello']}})]));
 await apply(A,[event([{type:'answer',word:'extra',correct:true},{type:'feed',date:'2026-11-04'}])]);
 data=await read(A);assert.equal(data.__quest.unit.stars,3);assert.equal(data.__quest.other.stars,2);assert.deepEqual(data.__meta.badges.sort(),['a','b']);assert.equal(data.__pet.fedCount,1);assert.equal(data.__pet.name,'Сова');assert.equal(data.__coursework.a.q.values[0],'hello');
 // An error in an event rolls back its receipt and all earlier actions.
 const invalid=event([{type:'answer',word:'rollback',correct:true},{type:'set',path:['__coursework'],value:{}}]);
 await assert.rejects(apply(A,[invalid]),/Invalid path/);assert.equal((await read(A)).rollback,undefined);
 assert.equal((await db.query('select 1 from learning_event_receipts where event_id=$1',[invalid.id])).rows.length,0);
 // Account switches and guest snapshots cannot create another pupil's work.
 const old=await x.store.load();x.switch(B);old.someWord={seen:1};assert.equal((await x.store.save(old)).ok,false);
 assert.equal((await x.store.answer('wrong-account',true)).ok,false);assert.deepEqual(await read(B),{});
 const guest=browser(null),empty=await guest.store.load();guest.switch(B);empty.guest={seen:1};assert.equal((await guest.store.save(empty)).ok,false);
 // Queued answers remain with the original account when someone else signs in.
 const offline=browser();await offline.store.load();offline.store.answer('waiting-for-a',true);offline.switch(B);await offline.store.flush();assert.equal(offline.storage.length,1);assert.deepEqual(await read(B),{});
 const originalAgain=browser(A,offline.storage);await originalAgain.store.flush();assert.equal((await read(A))['waiting-for-a'].seen,1);
 // A shared outbox may be retried by two tabs; server receipts remain authoritative.
 const shared=new Storage(),tab1=browser(A,shared),tab2=browser(A,shared);await tab1.store.load();await tab2.store.load();
 tab1.store.answer('shared',true);const ids=[...shared.data.values()].map(JSON.parse);
 await apply(A,ids);await apply(A,ids);await tab2.store.flush();assert.equal((await read(A)).shared.seen,1);
 // RLS and grants: no cross-account writes, reading receipts, or anonymous RPC.
 await assert.rejects(as(B,tx=>tx.query('select apply_learning_events($1,$2)',[A,'[]'])),/Not authorized/);
 assert.equal((await as(B,tx=>tx.query('select * from learning_event_receipts'))).rows.length,0);
 await assert.rejects(as(B,tx=>tx.query('insert into learning_event_receipts(user_id,event_id) values($1,$2)',[A,randomUUID()])),/row-level security/);
 await assert.rejects(db.transaction(async tx=>{await tx.exec('set local role anon');await tx.query('select apply_learning_events($1,$2)',[A,'[]']);}),/permission denied/);
 // Storage failure is reported, while the in-memory copy can still be saved.
 const brokenStorage=new Storage();brokenStorage.setItem=()=>{throw Error('quota');};const full=browser(A,brokenStorage);await full.store.load();
 assert.equal((await full.store.answer('quota',true)).durable,false);assert.match(full.dom.window.document.body.textContent,/Оставьте страницу открытой/);
 await full.store.flush();assert.equal((await read(A)).quota.seen,1);
 await db.exec(fs.readFileSync('tests/learning-progress-production.sql','utf8'));
 for(const dom of browsers)dom.window.close();await db.close();
 console.log('PASS: failed reads, synchronous outbox, reload, offline retry, lost acknowledgements, in-flight answers, concurrent snapshots, points/weeks, quest/badge/pet merges, coursework, transaction rollback, account isolation, RLS and storage quota.');
})().catch(error=>{console.error(error);process.exitCode=1;});
