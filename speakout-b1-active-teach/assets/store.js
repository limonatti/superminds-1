/* Account-scoped drafts; use the platform's merge API without touching other courses. */
(async()=>{
 const COURSE='speakout-b1';let user=null,dirty={},busy=false,timer;
 const parse=t=>{try{return JSON.parse(t)||{}}catch{return {}}};
 try{user=await Promise.race([SM.getUser(),new Promise(resolve=>setTimeout(()=>resolve(null),6000))])}catch{}
 const storageKey=`speakout-b1-v1:${user?.id||'guest'}`;
 let state={};try{state=parse(localStorage.getItem(storageKey))}catch{}
 state.answers=state.answers||{};
 const status=t=>{const el=document.getElementById('saved');if(el)el.textContent=t};
 const records={};
 function record(id,value){
  const [book,number,...labels]=id.split(':'),page=Number(number),p=window.COURSE.books[book]?.pages.find(p=>p.page===page);
  const fieldLabels=Object.keys(value.values||{}).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
  return {book,page,unit:Number(/^\d/.exec(p?.lesson||'')?.[0])||'extra',exercise:labels.join(':'),values:fieldLabels.map(k=>String(value.values[k])),fieldLabels,reflection:value.note||'',done:Boolean(value.done),score:Number.isFinite(value.score)?{correct:value.score,total:value.total,assisted:Object.values(value.revealed||{}).some(Boolean)}:null,updatedAt:Number(value.updatedAt)||0,state:value};
 }
 let cloudStatus=user?'Ответы сохранены на устройстве':'Гостевой режим · ответы сохраняются в этом браузере';
 if(user){
  try{
   const cloud=await Promise.race([SM.loadCourseWork(COURSE),new Promise((_,reject)=>setTimeout(()=>reject(Error('timeout')),8000))]);if(!cloud.ok)throw Error();
   for(const [id,r] of Object.entries(cloud.answers||{}))if(r?.state&&(!state.answers[id]||Number(r.updatedAt)>Number(state.answers[id].updatedAt||0)))state.answers[id]=r.state;
   for(const [id,v] of Object.entries(state.answers))if(Number(v.updatedAt||0)>Number(cloud.answers?.[id]?.updatedAt||0))dirty[id]=record(id,v);
   cloudStatus='Ответы загружены из аккаунта';
  }catch{cloudStatus='Ответы с этого устройства · синхронизация пока недоступна'}
 }
 for(const [id,v] of Object.entries(state.answers))records[id]=JSON.stringify(v);
 async function flush(){
  if(!user||busy||!Object.keys(dirty).length)return;busy=true;const batch={...dirty};
  try{const r=await SM.saveCourseWork(COURSE,batch,user.id);if(!r.ok)throw Error();for(const [id,v] of Object.entries(batch))if(dirty[id]===v)delete dirty[id];status('Ответы сохранены в аккаунте')}
  catch{status('Сохранено на устройстве · синхронизация пока недоступна')}
  finally{busy=false}
 }
 window.B1Store={storageKey,state,save(next){
  for(const [id,v] of Object.entries(next.answers)){
   if(records[id]===JSON.stringify(v))continue;
   // Opening a task creates a blank record; it is not a submitted response.
   const existing=records[id]!==undefined;
   if(!existing&&!v.done&&!v.note&&!Object.values(v.values||{}).some(Boolean))continue;
   v.updatedAt=Date.now();records[id]=JSON.stringify(v);dirty[id]=record(id,v);
  }
  state=next;
  try{localStorage.setItem(storageKey,JSON.stringify(next));status(user?'Сохранено на устройстве':'Сохранено в этом браузере')}
  catch{status('Не удалось сохранить · скачайте ответы');return false}
  clearTimeout(timer);timer=setTimeout(flush,900);return true;
 }};
 window.addEventListener('online',flush);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush()});
 const boot=document.querySelector('script[data-app]');
 const app=document.createElement('script');app.src=boot.dataset.app;
 app.onload=()=>{status(cloudStatus);flush();const live=document.createElement('script');live.src=boot.dataset.live;document.body.append(live)};
 app.onerror=()=>status('Не удалось загрузить курс. Обновите страницу.');document.body.append(app);
})();
