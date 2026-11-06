/* Shared boot adapter for Speakout A1, B1 and B1+. Preserve raw course states. */
(async()=>{
'use strict';
const boot=document.currentScript,course=boot.dataset.course,base=course+'-v1';
const parse=s=>{try{return JSON.parse(s)||{}}catch{return {}}},state={answers:{},drawing:{}};
const fingerprints={};let storageKey='',started=false,suspended=false;
function record(id,value){
 const[book,num,...labels]=id.split(':'),page=Number(num),p=window.COURSE.books[book]?.pages.find(p=>p.page===page),fieldLabels=Object.keys(value.values||{}).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
 return{book,page:Number.isFinite(page)?page:0,unit:Number(/^\d/.exec(p?.lesson||'')?.[0])||'extra',exercise:labels.join(':'),values:fieldLabels.map(k=>String(value.values[k])),fieldLabels,reflection:value.note||'',done:!!value.done,score:Number.isFinite(value.score)?{correct:value.score,total:value.total,assisted:Object.values(value.revealed||{}).some(Boolean)}:null,updatedAt:Number(value.updatedAt)||1,state:value};
}
const store=new CourseWorkStore({course,onStatus:t=>{const el=document.getElementById('saved');if(el)el.textContent=t},onAccountChange:()=>{suspended=true;CourseWorkUI.accountChanged()},
 legacy(user){storageKey=base+':'+(user?.id||'guest');const cached=parse(localStorage.getItem(storageKey));if(!started){Object.assign(state,cached);state.answers=cached.answers||{};state.drawing=cached.drawing||{}}return Object.fromEntries(Object.entries(cached.answers||{}).map(([id,v])=>[id,record(id,v)]))},
 onChange(rows,change){if(started&&change.account){suspended=true;return}if(change.local||suspended)return;let changed=false;for(const[id,r]of Object.entries(rows)){if(!r.state)continue;if(JSON.stringify(state.answers[id])!==JSON.stringify(r.state)){state.answers[id]=JSON.parse(JSON.stringify(r.state));changed=true}fingerprints[id]=JSON.stringify(state.answers[id])}if(started&&changed)window.dispatchEvent(new Event('coursework-restored'))}
});
await store.start();
function save(next){
 if(suspended||store.user===undefined)return false;
 Object.assign(state,next);
 for(const[id,v]of Object.entries(next.answers||{})){
  if(fingerprints[id]===JSON.stringify(v))continue;
  const material=Object.values(v.exercises||{}).some(s=>s.done||s.note||Object.values(s.values||{}).some(Boolean));
  if(fingerprints[id]===undefined&&!v.done&&!v.note&&!material&&!Object.values(v.values||{}).some(Boolean))continue;
  v.updatedAt=Date.now();fingerprints[id]=JSON.stringify(v);store.set(id,record(id,v));
 }
 try{localStorage.setItem(storageKey,JSON.stringify(state))}catch{store.localOK=false;store.announce()}
 return true;
}
window.B1Store={storageKey,state,save,flush:()=>store.flush(),store};
CourseWorkUI.bind(store);
const app=document.createElement('script');app.src=boot.dataset.app;
app.onload=()=>{
 started=true;store.announce();
 if(boot.dataset.live){const live=document.createElement('script');live.src=boot.dataset.live;document.body.append(live)}
 const legacy=parse(localStorage.getItem(base));
 if(Object.keys(legacy.answers||{}).length){
  const notice=document.createElement('details');notice.className='answer-backup';const summary=document.createElement('summary');summary.textContent='Прежние ответы этого браузера';
  const text=document.createElement('p');text.textContent='У старой копии нет владельца. Переносите её только если это ваши ответы. Исходная копия сохранится.';
  const button=document.createElement('button');button.textContent='Это мои ответы — перенести';button.onclick=()=>{for(const[id,v]of Object.entries(legacy.answers))if(!state.answers[id])state.answers[id]=v;save(state);store.flush();window.dispatchEvent(new Event('coursework-restored'));button.disabled=true;button.textContent='Перенесено в текущий профиль'};
  notice.append(summary,text,button);(document.querySelector('.answer-backup')||document.querySelector('main')).append(notice);
 }
};
app.onerror=()=>store.status('Не удалось загрузить курс. Обновите страницу.');document.body.append(app);
})();
