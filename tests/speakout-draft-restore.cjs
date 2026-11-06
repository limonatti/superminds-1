const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const {CourseWorkStore}=require('../coursework-store');
const source=fs.readFileSync('speakout-store.js','utf8'),copy=v=>JSON.parse(JSON.stringify(v));
(async()=>{
 for(const course of ['speakout-a1','speakout-b1','speakout-b1plus']){
  const cloud={};
  async function boot(user){
   const data=new Map(),storage={get length(){return data.size},key:i=>[...data.keys()][i],getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
   const api={presentationSession:async()=>({id:user}),watchPresentationAuth:()=>()=>{},loadCourseWork:async()=>({ok:true,answers:copy(cloud[user]||{})}),saveCourseWork:async(c,rows,u)=>{Object.assign(cloud[u]||={},copy(rows));return{ok:true,answers:copy(cloud[u])}}};
   const env={localStorage:storage,COURSE:{books:{sb:{pages:[]}}},dispatchEvent(){},Event,console,setTimeout,clearTimeout,CourseWorkUI:{bind(){},accountChanged(){}}};env.window=env;
   env.CourseWorkStore=class extends CourseWorkStore{constructor(opts){super({...opts,storage,api,delay:60000})}};
   env.document={currentScript:{dataset:{course,app:'app.js'}},getElementById:()=>({textContent:''}),querySelector:()=>({append(){}}),body:{append(script){script.onload?.()}},createElement:()=>({append(){},dataset:{}})};
   await vm.runInNewContext(source,env);return env.B1Store;
  }
  const a=await boot('alice'),draft={values:{1:'unfinished',2:''},note:'continue here',done:false,exercises:{part:{values:{a:'nested answer'},done:false}}};
  a.save({answers:{'sb:8:2A':draft},drawing:{}});await a.flush();a.store.destroy();
  const restored=await boot('alice');assert.equal(restored.state.answers['sb:8:2A'].values[1],'unfinished');assert.equal(restored.state.answers['sb:8:2A'].note,'continue here');assert.equal(restored.state.answers['sb:8:2A'].exercises.part.values.a,'nested answer');assert.equal(restored.state.answers['sb:8:2A'].done,false);restored.store.destroy();
  const b=await boot('bob');assert.equal(Object.keys(b.state.answers).length,0);b.store.destroy();
 }
 console.log('PASS A1/B1/B1+ fresh-device restore of partial answers, notes and nested work; separate pupil accounts.');
})().catch(e=>{console.error(e);process.exit(1)});
