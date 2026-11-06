/* Shared boot adapter for Speakout A1, B1 and B1+. Preserve raw course states. */
(async()=>{
'use strict';
const boot=document.currentScript,course=boot.dataset.course,base=course+'-v1';
const parse=s=>{try{return JSON.parse(s)||{}}catch{return {}}},state={answers:{},drawing:{}};
const fingerprints={};let inkSeen={},inkClock=0,activeUser,storageKey='',started=false,suspended=false;
const copy=v=>JSON.parse(JSON.stringify(v)),inkKey=(page,id)=>'__ink:'+page+':'+id;
const uid=()=>window.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
function cleanStroke(s){
 if(!s||!['pen','marker','cover'].includes(s.type)||!Array.isArray(s.points)||!s.points.length||!s.points.every(p=>Array.isArray(p)&&p.length===2&&p.every(n=>Number.isFinite(n)&&n>=0&&n<=1)))return null;
 const createdAt=Number.isSafeInteger(Number(s.createdAt))&&Number(s.createdAt)>0?Number(s.createdAt):Math.max(Date.now(),inkClock+1);inkClock=Math.max(inkClock,createdAt);
 return {id:typeof s.id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(s.id)?s.id:uid(),createdAt,type:s.type,points:s.points.map(p=>p.map(n=>Math.round(n*100000)/100000))};
}
// Stable IDs let old copies of the same drawing meet the server's deletion tombstones.
function oldId(page,stroke,index){let a=2166136261,b=5381;for(const ch of JSON.stringify([page,index,stroke.type,stroke.points])){a=Math.imul(a^ch.charCodeAt(0),16777619);b=Math.imul(b,33)^ch.charCodeAt(0)}return 'legacy-'+(a>>>0).toString(36)+'-'+(b>>>0).toString(36)}
function inkRecords(drawing){
 const rows={};for(const[page,strokes]of Object.entries(drawing||{})){
  if(!/^(sb|wb):[1-9][0-9]{0,2}$/.test(page)||!Array.isArray(strokes))continue;
  strokes.forEach((s,i)=>{const st=cleanStroke({...s,id:s?.id||oldId(page,s||{},i),createdAt:s?.createdAt||i+1});if(st)rows[inkKey(page,st.id)]={kind:'ink',book:page.split(':')[0],page:Number(page.split(':')[1]),stroke:st,updatedAt:1}});
 }return rows;
}
function inkRecord(id,r){return r?.kind==='ink'&&['sb','wb'].includes(r.book)&&Number.isInteger(r.page)&&r.page>0&&r.page<1000&&id.startsWith('__ink:'+r.book+':'+r.page+':')}
function restoreInk(rows){
 const pages={},seen={};for(const[id,r]of Object.entries(rows)){
  if(!inkRecord(id,r))continue;const page=r.book+':'+r.page;pages[page]||=[];
  if(r.stroke===null)continue;const st=cleanStroke(r.stroke);if(!st||id!==inkKey(page,st.id))continue;
  pages[page].push(st);seen[id]=JSON.stringify(st);
 }
 let changed=false;for(const[page,strokes]of Object.entries(pages)){
  strokes.sort((a,b)=>a.createdAt-b.createdAt||a.id.localeCompare(b.id));
  if(JSON.stringify(state.drawing[page])!==JSON.stringify(strokes)){state.drawing[page]=strokes;changed=true;}
 }
 inkSeen=seen;return changed;
}
function saveInk(drawing){
 const seen={};for(const[page,strokes]of Object.entries(drawing||{})){
  if(!/^(sb|wb):[1-9][0-9]{0,2}$/.test(page)||!Array.isArray(strokes))continue;
  drawing[page]=strokes.map(cleanStroke).filter(Boolean);
  for(const st of drawing[page]){const id=inkKey(page,st.id),signature=JSON.stringify(st);seen[id]=signature;
   if(inkSeen[id]!==signature)store.set(id,{kind:'ink',book:page.split(':')[0],page:Number(page.split(':')[1]),stroke:st});
  }
 }
 // Delete only marks this tab has actually displayed, never unseen work from another device.
 for(const id of Object.keys(inkSeen))if(!seen[id]){const previous=store.records[id];if(previous)store.set(id,{...previous,stroke:null});}
 inkSeen=seen;
}
function record(id,value){
 const[book,num,...labels]=id.split(':'),page=Number(num),p=window.COURSE.books[book]?.pages.find(p=>p.page===page),fieldLabels=Object.keys(value.values||{}).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
 return{book,page:Number.isFinite(page)?page:0,unit:Number(/^\d/.exec(p?.lesson||'')?.[0])||'extra',exercise:labels.join(':'),values:fieldLabels.map(k=>String(value.values[k])),fieldLabels,reflection:value.note||'',done:!!value.done,score:Number.isFinite(value.score)?{correct:value.score,total:value.total,assisted:Object.values(value.revealed||{}).some(Boolean)}:null,updatedAt:Number(value.updatedAt)||1,state:value};
}
const store=new CourseWorkStore({course,onStatus:t=>{const el=document.getElementById('saved');if(el)el.textContent=t.replace(/Ответы/g,'Ответы и пометки').replace(/ответы/g,'ответы и пометки')},onAccountChange:()=>{suspended=true;CourseWorkUI.accountChanged()},
 legacy(user){storageKey=base+':'+(user?.id||'guest');const cached=parse(localStorage.getItem(storageKey));if(!started){Object.assign(state,cached);state.answers=cached.answers||{};state.drawing={}}return {...Object.fromEntries(Object.entries(cached.answers||{}).map(([id,v])=>[id,record(id,v)])),...inkRecords(cached.drawing)}},
 onChange(rows,change){if(change.account){if(started&&activeUser!==undefined&&activeUser!==(store.user?.id||null)){suspended=true;return}activeUser=store.user?.id||null;}if(change.local||suspended)return;const inkChanged=restoreInk(rows);let changed=false;for(const[id,r]of Object.entries(rows)){if(!r.state)continue;if(JSON.stringify(state.answers[id])!==JSON.stringify(r.state)){state.answers[id]=JSON.parse(JSON.stringify(r.state));changed=true}fingerprints[id]=JSON.stringify(state.answers[id])}if(started&&changed)window.dispatchEvent(new Event('coursework-restored'));if(started&&inkChanged)window.dispatchEvent(new Event('coursework-ink-restored'))}
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
 if(next.drawing)saveInk(next.drawing);
 try{localStorage.setItem(storageKey,JSON.stringify(state))}catch{store.localOK=false;store.announce()}
 return true;
}
window.B1Store={storageKey,state,save,flush:()=>store.flush(),store};
CourseWorkUI.bind(store);
const app=document.createElement('script');app.src=boot.dataset.app;
app.onload=()=>{
 started=true;store.announce();
 if(boot.dataset.live){const live=document.createElement('script');live.src=boot.dataset.live;document.body.append(live)}
 // Unowned browser copies are never silently assigned to the next pupil who signs in.
 for(const key of [base,...(store.user?[base+':guest']:[])]){
  const legacy=parse(localStorage.getItem(key)),oldInk=inkRecords(legacy.drawing);
  if(!Object.keys(legacy.answers||{}).length&&!Object.keys(oldInk).length)continue;
  const notice=document.createElement('details');notice.className='answer-backup';const summary=document.createElement('summary');summary.textContent='Прежние ответы и пометки этого браузера';
  const text=document.createElement('p');text.textContent='У этой копии нет владельца. Переносите её только если это ваши ответы и пометки. Исходная копия сохранится.';
  const button=document.createElement('button');button.textContent='Это мои ответы и пометки — перенести';button.onclick=async()=>{
   button.disabled=true;
   try{
    if(store.user)store.loaded=false;const synced=await store.reconnect();if(suspended||store.user===undefined||store.user&&!synced.ok)throw Error();
    for(const[id,v]of Object.entries(legacy.answers||{}))if(!store.records[id]){state.answers[id]=copy(v);store.set(id,record(id,v));}
    for(const[id,v]of Object.entries(oldInk))if(!store.records[id])store.set(id,v);
    restoreInk(store.records);save(state);await store.flush();window.dispatchEvent(new Event('coursework-restored'));window.dispatchEvent(new Event('coursework-ink-restored'));button.textContent='Перенесено · статус сохранения показан сверху';
   }catch{button.disabled=false;button.textContent='Не удалось подключиться — повторить перенос';}
  };
  notice.append(summary,text,button);(document.querySelector('.answer-backup')||document.querySelector('main')).append(notice);
 }

};
app.onerror=()=>store.status('Не удалось загрузить курс. Обновите страницу.');document.body.append(app);
})();
