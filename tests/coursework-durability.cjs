const assert=require('node:assert/strict'),{CourseWorkStore}=require('../coursework-store');
const copy=x=>JSON.parse(JSON.stringify(x));
function memory(){const data=new Map();return{data,get length(){return data.size},key:i=>[...data.keys()][i],getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}}
(async()=>{
 const cloud={},storage=memory(),stores=[];let offline=true,lose=false,hold=null,watch;
 const api={presentationSession:async()=>({id:'alice'}),watchPresentationAuth:fn=>(watch=fn,()=>{}),loadCourseWork:async(c,u)=>offline?{ok:false}:{ok:true,answers:copy(cloud[u]?.[c]||{})},saveCourseWork:async(c,rows,u)=>{
  if(offline)return{ok:false};const target=(cloud[u]??={})[c]??={};for(const[id,v]of Object.entries(rows))if(!target[id]||target[id].updatedAt<=v.updatedAt)target[id]=copy(v);
  if(hold)await hold;if(lose){lose=false;return{ok:false}}return{ok:true,answers:copy(target)};
 }};
 const make=async(c='book',extra={})=>{const s=new CourseWorkStore({course:c,api,storage,delay:1e6,...extra});stores.push(s);await s.start();return s};
 try{
  const a=await make(),b=await make();a.set('one',{values:['from tab one']});b.set('two',{values:['from tab two']});for(let i=0;i<200;i++)a.set('essay',{values:['x'.repeat(i+1)]});assert.equal([...storage.data.keys()].filter(k=>k.includes(':edit:')).length,3,'typing keeps one durable draft per exercise');a.destroy();b.destroy();
  // Simulate a stale tab overwriting the shared cache while offline.
  storage.setItem('coursework-v2:book:alice',JSON.stringify({records:{},pending:{}}));
  const fresh=await make();assert.equal(fresh.records.one.values[0],'from tab one');assert.equal(fresh.records.two.values[0],'from tab two');
  offline=false;await fresh.flush();assert.equal(Object.keys(cloud.alice.book).length,3);assert.equal([...storage.data.keys()].filter(k=>k.includes(':edit:')).length,0);
  fresh.set('three',{values:['committed before response lost']});lose=true;assert.equal((await fresh.flush()).ok,false);fresh.destroy();
  const ack=await make();assert.equal(ack.records.three.values[0],'committed before response lost');assert.equal(Object.keys(ack.pending).length,0);
  let release;hold=new Promise(r=>release=r);ack.set('race',{values:['old']});const flight=ack.flush();await new Promise(r=>setImmediate(r));ack.set('race',{values:['new']});release();hold=null;await flight;assert.equal(cloud.alice.book.race.values[0],'new');
  await ack.switchUser({id:'bob'});assert.deepEqual(ack.records,{});ack.set('private',{values:['bob only']});await ack.flush();assert(!cloud.alice.book.private);
  // A failed auth read is not a guest session and must not load guest drafts.
  storage.setItem('coursework-v2:unknown:guest',JSON.stringify({records:{private:{values:['guest secret'],updatedAt:1}}}));
  const unknown=await make('unknown',{api:{...api,presentationSession:async()=>{throw Error('auth offline')}}});assert.equal(unknown.user,undefined);assert.deepEqual(unknown.records,{});assert.equal(unknown.set('wrong-owner',{values:['do not assign']}),false);
  // INITIAL_SESSION can precede a stale getSession response.
  let finish;const initial=new Promise(r=>finish=r);let listener;
  const late=new CourseWorkStore({course:'race-account',storage,delay:1e6,api:{...api,presentationSession:()=>initial,watchPresentationAuth:fn=>(listener=fn,()=>{})}});stores.push(late);
  const starting=late.start();await listener({id:'bob'});finish({id:'alice'});await starting;assert.equal(late.user.id,'bob');
  console.log('PASS offline multi-tab journal, overwritten snapshot recovery, reload, lost ACK, in-flight edits, separate accounts, auth failure and initial-session race.');
 }finally{stores.forEach(s=>s.destroy())}
})().catch(e=>{console.error(e);process.exit(1)});
