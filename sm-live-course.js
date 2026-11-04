/* Semantic exercise adapter for the platform's one-to-one lesson rooms. */
window.LiveCourse={connect(adapter){
 const params=new URLSearchParams(location.search),role=params.get('embedded')==='1'&&parent!==window?params.get('lessonRole'):null;
 const link=document.createElement('a');link.textContent='Онлайн-урок ↗';link.href='../room.html?course='+encodeURIComponent(adapter.course);link.style.cssText='display:inline-block;margin:8px;padding:10px;color:#7c2340;font-weight:bold';
 if(!role){(document.querySelector('header')||document.body).append(link);return;}
 let lastView='',lastAnswer='',remote=null,online=false,started=false,panel=null,painted='';
 const send=data=>parent.postMessage({type:'outcomes-lesson',...data},location.origin);
 function paint(){
  const host=adapter.host();if(!host){panel?.remove();panel=null;painted='';return;}
  if(!panel?.isConnected){panel=document.createElement('section');panel.style.cssText='border:2px solid #7c2340;border-radius:12px;background:#fff7e9;padding:14px;margin:12px 0;overflow-wrap:anywhere';host.prepend(panel);painted='';}
  const view=adapter.view(),r=remote&&remote.book===view.book&&remote.page===view.page&&remote.exercise===view.exercise?remote:null;
  const signature=JSON.stringify([online,r]);if(painted===signature)return;painted=signature;
  panel.replaceChildren();const title=document.createElement('h3');title.textContent=role==='t'?'Ответы ученика · онлайн':'Онлайн-урок';panel.append(title);
  const note=document.createElement('p');note.textContent=!online?'Связь восстанавливается. Ответы сохраняются на устройстве.':role==='s'?'Учитель видит ваши ответы по мере ввода.':r?'Обновляются по мере ввода.':'Ожидаем ответы ученика…';panel.append(note);
  if(role==='t'&&r){const list=document.createElement('ol');for(const item of r.items){const li=document.createElement('li');li.style.whiteSpace='pre-wrap';li.textContent=item.label+': '+(item.text||'—')+(item.result?' · '+item.result:'');list.append(li)}panel.append(list);}
 }
 function tick(force=false){const view=adapter.view();if(!view)return;
  if(!started){started=true;send({kind:'ready'});}
  if(role==='t'){const key=JSON.stringify(view);if(force||key!==lastView){lastView=key;send({kind:'view',...view});}}
  else {const answer=adapter.answer();if(answer){const data={kind:'answers',book:view.book,page:view.page,...answer},key=JSON.stringify(data);if(force||key!==lastAnswer){lastAnswer=key;send(data);}}}
  paint();
 }
 window.addEventListener('message',e=>{
  if(e.origin!==location.origin||e.source!==parent||e.data?.type!=='outcomes-lesson')return;
  const d=e.data;if(d.kind==='connection'){online=!!d.online;paint();}
  else if(d.kind==='snapshot')tick(true);
  else if(d.kind==='view'&&role==='s'&&adapter.view()){
   if(!['sb','wb','ws'].includes(d.book)||!Number.isInteger(d.page)||!(d.exercise===null||typeof d.exercise==='string'))return;
   const view={book:d.book,page:d.page,exercise:d.exercise};if(JSON.stringify(view)!==JSON.stringify(adapter.view()))adapter.apply(view);tick(true);
  }else if(d.kind==='answers'&&role==='t'){
   if(!Array.isArray(d.items)||d.items.length>200||d.items.some(i=>!i||typeof i.text!=='string'||i.text.length>12000||typeof i.label!=='string'||i.label.length>100||i.result&&typeof i.result!=='string'))return;
   remote=d;paint();
  }
 });
 // Read the course's own answer model: buttons, drag/drop, free text and checks
 // all use the same path. This never mutates the teacher's saved coursework.
 const timer=setInterval(()=>tick(),150);window.addEventListener('pagehide',()=>clearInterval(timer));tick();
}};
