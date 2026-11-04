const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const {CourseWorkStore}=require('../coursework-store.js');
(async()=>{
 for(const course of ['speakout-a1','speakout-b1','speakout-b1plus']){
  const data=new Map(),storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};let user={id:'alice'},watch,oldState;
  const api={presentationSession:async()=>user,watchPresentationAuth:fn=>(watch=fn,()=>{}),loadCourseWork:async()=>({ok:true,answers:{}}),saveCourseWork:async()=>({ok:true})};
  const env={localStorage:storage,COURSE:{books:{sb:{pages:[]}}},dispatchEvent(){},Event,console,setTimeout,clearTimeout,CourseWorkUI:{bind(){},accountChanged(){env.B1Store.save(oldState)}}};env.window=env;
  env.CourseWorkStore=class extends CourseWorkStore{constructor(opts){super({...opts,storage,api,delay:60000})}};
  env.document={currentScript:{dataset:{course,app:'app.js'}},getElementById:()=>({textContent:''}),querySelector:()=>({append(){}}),body:{append(script){script.onload?.()}},createElement:()=>({append(){},dataset:{}})};
  await vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../speakout-store.js'),'utf8'),env);
  oldState={answers:{'sb:8:2A':{values:{1:'alice only'}}},drawing:{}};env.B1Store.save(oldState);
  user={id:'bob'};await watch(user);
  assert.equal(storage.getItem(course+'-v1:bob'),null,course+' unload must not copy old raw answers into new account');
  assert.deepEqual(env.B1Store.store.records,{},course+' new account remains empty');
  const alice=JSON.parse(storage.getItem(course+'-v1:alice'));assert.equal(alice.answers['sb:8:2A'].values[1],'alice only');env.B1Store.store.destroy();
 }
 console.log('PASS A1/B1/B1+ boot, immediate cache and account-change/unload isolation');
})().catch(e=>{console.error(e);process.exitCode=1});
