/* The same explicit draft-save action in every exercise window. */
(function(root){
'use strict';
let current=null;const observed=new WeakSet();
const blocked=new Map();
function guard(){
 const unknown=current&&'user' in current.store&&current.store.user===undefined;
 if(unknown){
  for(const el of document.querySelectorAll('main,dialog,.coursework-preview'))if(!blocked.has(el)){blocked.set(el,el.inert);el.inert=true;}
  if(!document.getElementById('coursework-auth-retry')){
   const box=document.createElement('div');box.id='coursework-auth-retry';box.className='coursework-savebar';box.setAttribute('role','alert');
   const text=document.createElement('span');text.textContent='Не удалось проверить аккаунт. Подключитесь, чтобы ответы сохранились у нужного ученика.';
   const retry=document.createElement('button');retry.className='coursework-save';retry.textContent='Повторить подключение';retry.onclick=async()=>{retry.disabled=true;try{await current.store.reconnect()}finally{retry.disabled=false;guard()}};
   box.append(text,retry);document.body.prepend(box);
  }
 }else{for(const[el,inert]of blocked)el.inert=inert;blocked.clear();document.getElementById('coursework-auth-retry')?.remove();}
}
function update(message){document.querySelectorAll('.coursework-status').forEach(el=>{if(el.textContent!==message)el.textContent=message});guard()}

function mount(){
 if(!current)return;guard();
 for(const dialog of document.querySelectorAll('dialog[open]')){
  if(!dialog.matches('.play-dialog,.coursework-dialog')&&!dialog.querySelector('[data-answer],[data-response],#practiceBody,#freeNote'))continue;
  if(dialog.querySelector('.coursework-savebar'))continue;
  const bar=document.createElement('div');bar.className='coursework-savebar';
  const button=document.createElement('button');button.type='button';button.className='coursework-save';button.textContent='Сохранить ответы';
  const status=document.createElement('span');status.className='coursework-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.textContent=current.message;
  button.onclick=async()=>{const owner=current;button.disabled=true;try{await owner.save()}finally{button.disabled=false;update(current.message)}};
  bar.append(button,status);dialog.append(bar);
 }
}
root.CourseWorkUI={bind(store,save){current={store,get message(){return store.message},save:save||(()=>store.flush())};if(!observed.has(store)){observed.add(store);const old=store.onStatus;store.onStatus=message=>{old?.(message);if(current?.store===store)update(message)}}mount()},status:update,
 accountChanged(){root.__courseworkAccountChanged=true;for(const audio of document.querySelectorAll('audio,video'))audio.pause();document.body.replaceChildren(Object.assign(document.createElement('p'),{textContent:'Аккаунт изменился. Загружаем ваши ответы…'}));location.reload()},
 mount};
if(root.MutationObserver){new MutationObserver(mount).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['open','class']})}
})(window);
