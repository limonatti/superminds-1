const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const timers=new Map();let seq=0,offline=true,writes=0;const data=new Map();
 const env={module:{exports:{}},console,Date,setTimeout:(fn,ms)=>{const id=++seq;timers.set(id,{fn,ms});return id},clearTimeout:id=>timers.delete(id)};
 vm.runInNewContext(fs.readFileSync('coursework-store.js','utf8'),env);
 const store=new env.module.exports.CourseWorkStore({course:'book',storage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)},api:{watchPresentationAuth:()=>()=>{},presentationSession:async()=>({id:'alice'}),loadCourseWork:async()=>offline?{ok:false}:{ok:true,answers:{}},saveCourseWork:async()=>{writes++;return{ok:true}}}});
 try{await store.start();store.set('draft',{values:['unfinished']});await store.flush();const retry=[...timers.values()].find(t=>t.ms===10000);assert(retry,'failed requests schedule automatic retry');offline=false;await retry.fn();assert.equal(writes,1);assert.equal(Object.keys(store.pending).length,0);assert(store.message.includes('сохранены в аккаунте'));console.log('PASS automatic retry without reload, click or a browser online event.');}finally{store.destroy()}
})().catch(e=>{console.error(e);process.exit(1)});
