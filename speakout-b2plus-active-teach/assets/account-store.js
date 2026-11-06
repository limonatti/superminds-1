/* Per-account offline queue. The server merges patches, never whole books. */
(function(root){
  'use strict';
  const PREFIX='ewa_speakout_b2plus_', COURSE='speakout-b2plus';
  const copy=x=>JSON.parse(JSON.stringify(x));
  const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const uid=()=>globalThis.crypto?.randomUUID?.() || Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
  function legacyId(value,index){let h=2166136261;for(const c of JSON.stringify(value))h=Math.imul(h^c.charCodeAt(0),16777619);return 'legacy-'+index+'-'+(h>>>0).toString(36);}
  class AccountStore {
    constructor({api,storage,onChange=()=>{},onStatus=()=>{},delay=700}) {
      Object.assign(this,{api,storage,onChange,onStatus,delay});
      this.events=new Map();this.user=undefined;this.epoch=0;this.seq=0;this.current='sb:7';this.pages={};this.local={};this.baseline={};this.ready=false;
    }
    read(key,fallback){try{return JSON.parse(this.storage.getItem(PREFIX+key)) ?? fallback;}catch{return fallback;}}
    eventPrefix(user=this.user){return PREFIX+'edit-v3:'+(user||'guest')+':';}
    journal(page,key,entry){
      const name=this.eventPrefix()+uid(),event={page,key,entry:copy(entry)};this.events.set(name,event);
      try{this.storage.setItem(name,JSON.stringify(event));event.persisted=true;for(const[old,e]of this.events)if(old!==name&&e.page===page&&e.key===key&&(e.entry.at||e.entry.seq||0)<=(entry.at||entry.seq||0)){this.storage.removeItem?.(old);this.events.delete(old)}}catch{this.cacheError=true;}
    }
    readEvents(){
      try{if(typeof this.storage.key==='function'){
        const found=new Set();for(let i=0;i<this.storage.length;i++){const name=this.storage.key(i);if(!name?.startsWith(this.eventPrefix()))continue;found.add(name);const e=JSON.parse(this.storage.getItem(name));if(e?.entry&&typeof e.page==='string'&&typeof e.key==='string')this.events.set(name,{...e,persisted:true});}
        for(const[name,e]of this.events)if(e.persisted&&!found.has(name))this.events.delete(name);
      }}catch{this.cacheError=true;}
      for(const p of Object.values(this.pages))p.pending={};
      for(const[name,e]of [...this.events].sort((a,b)=>(a[1].entry.at||a[1].entry.seq||0)-(b[1].entry.at||b[1].entry.seq||0)||a[0].localeCompare(b[0])))this.page(e.page).pending[e.key]=copy(e.entry);
    }
    acknowledge(page,sent,events){
      for(const[name,e]of events)if(e.page===page&&sent[e.key]&&(e.entry.at||e.entry.seq||0)<=(sent[e.key].at||sent[e.key].seq||0)){
        try{this.storage.removeItem?.(name);this.events.delete(name);}catch{this.cacheError=true;}
      }
      this.readEvents();
    }
    saveCache(){
      if(this.user===undefined)return;
      try{
        const prior=this.read('account-v2:'+(this.user||'guest'),{});
        for(const[key,old]of Object.entries(prior.pages||{})){const current=this.page(key);if((old.syncedAt||0)>(current.syncedAt||0)){current.data=copy(old.data);current.syncedAt=old.syncedAt;}}
        this.storage.setItem(PREFIX+'account-v2:'+(this.user||'guest'),JSON.stringify({pages:this.pages,local:this.local}));this.cacheError=false;}
      catch{this.cacheError=true;this.onStatus('error','Не удалось записать запасную копию в браузере. Скачайте экспорт.');}
    }
    status(){
      const pending=Object.values(this.pages).some(p=>Object.keys(p.pending).length);
      if(this.cacheError)return;
      if(this.user&&!this.connected){this.onStatus('error','Сохранение в аккаунт пока недоступно. Изменения остаются на устройстве. Повторить');return;}
      this.onStatus(!this.user?'guest':pending?'pending':'saved',!this.user?'Войдите в аккаунт для сохранения на всех устройствах.':pending?'Изменения ждут отправки в аккаунт…':'Разметка и ответы сохранены в аккаунте');
    }
    page(key=this.current){return this.pages[key]||(this.pages[key]={data:{},pending:{}});}
    view(key=this.current){const p=this.page(key),v={...p.data};for(const[k,e]of Object.entries(p.pending))v[k]=e.value;return v;}
    async start(){
      const epoch=this.epoch;this.unsubscribe=this.api.watchPresentationAuth(u=>this.switchUser(u));
      this.storageChanged=e=>{if(this.user===undefined||!e.key?.startsWith(this.eventPrefix()))return;this.readEvents();this.saveCache();this.onChange();this.status();this.schedule();};root.addEventListener?.('storage',this.storageChanged);
      try{const user=await this.api.presentationSession();if(epoch===this.epoch)await this.switchUser(user);if(this.initialLoad)await this.initialLoad;}
      catch{this.onStatus('error','Не удалось проверить аккаунт. Обновите страницу перед вводом ответов.');return this;}
      this.ready=true;this.onChange();return this;
    }
    async switchUser(user){
      const id=user?.id||null;if(this.user===id)return;
      this.epoch++;clearTimeout(this.timer);this.user=id;this.busy=false;this.connected=false;this.baseline={};
      const cache=this.read('account-v2:'+(id||'guest'),{});this.pages=cache.pages||{};this.local=cache.local||{};this.events=new Map();
      for(const[page,p]of Object.entries(this.pages))for(const[key,e]of Object.entries(p.pending||{}))this.journal(page,key,e);this.readEvents();
      this.seq=Math.max(this.seq,...Object.values(this.pages).flatMap(p=>Object.values(p.pending).map(e=>e.seq||0)));
      this.saveCache();this.onChange({accountChanged:true});this.status();
      if(id){const initial=(async()=>{await this.pull();await this.flush()})();this.initialLoad=initial;await initial;if(this.initialLoad===initial)this.initialLoad=null;}
    }
    guestCache(){
      const guest=this.read('account-v2:guest',{});guest.pages=guest.pages||{};
      try{for(let i=0;i<this.storage.length;i++){const key=this.storage.key(i);if(!key?.startsWith(this.eventPrefix(null)))continue;const e=JSON.parse(this.storage.getItem(key));if(!e?.entry)continue;const p=guest.pages[e.page]||={data:{},pending:{}};const old=p.pending[e.key];if(!old||(e.entry.at||e.entry.seq||0)>=(old.at||old.seq||0))p.pending[e.key]=e.entry;}}catch{}
      return guest;
    }
    guestAvailable(){
      if(!this.user)return false;
      const guest=this.guestCache(),owner=this.read('legacy-owner',null);
      return Object.values(guest.pages||{}).some(p=>Object.keys(p.data||{}).length||Object.keys(p.pending||{}).length)||(!owner||owner===this.user)&&['ink','spots'].some(k=>Object.keys(this.read(k,{})).length);
    }
    async importGuest(){
      if(!this.user)return false;const epoch=this.epoch,owner=this.read('legacy-owner',null),guest=this.guestCache(),pages={};
      if(!owner||owner===this.user)for(const kind of ['ink','spots'])for(const[page,items]of Object.entries(this.read(kind,{})))if(Array.isArray(items))for(const[i,item]of items.entries()){
        const value={...item,uid:item.uid||legacyId(item,i)};(pages[page]||={})[kind+':'+value.uid]=value;
      }
      for(const[page,p]of Object.entries(guest.pages||{}))pages[page]={...pages[page],...p.data,...Object.fromEntries(Object.entries(p.pending||{}).map(([k,e])=>[k,e.value]))};
      for(const[page,values]of Object.entries(pages)){
        if(!await this.pull(page)||epoch!==this.epoch)return false;
        const current=this.view(page);for(const[k,v]of Object.entries(values))if(!(k in current))this.patch(page,k,v,false);
      }
      if(epoch!==this.epoch)return false;
      this.saveCache();await this.flush();this.onChange();return true;
    }
    get(kind,fallback){
      if(!['ink','spots'].includes(kind))return this.local[kind]??fallback;
      const out={};
      for(const page of Object.keys(this.pages))out[page]=Object.entries(this.view(page)).filter(([k,v])=>k.startsWith(kind+':')&&v!==null).map(([,v])=>copy(v));
      this.baseline[kind]=copy(out);return out;
    }
    set(kind,value){
      if(this.user===undefined)return false;
      if(!['ink','spots'].includes(kind)){this.local[kind]=copy(value);this.saveCache();return;}
      const base=this.baseline[kind]||{};
      for(const page of new Set([...Object.keys(base),...Object.keys(value)])){
        const before=Object.fromEntries((base[page]||[]).map(v=>[v.uid,v]));
        const after={};for(const v of value[page]||[]){if(!/^[a-zA-Z0-9_-]{1,100}$/.test(v.uid||'')||['__proto__','constructor','prototype'].includes(v.uid))v.uid=uid();after[v.uid]=v;}
        for(const id of new Set([...Object.keys(before),...Object.keys(after)]))if(!equal(before[id],after[id]))this.patch(page,kind+':'+id,after[id]||null,false);
      }
      this.baseline[kind]=copy(value);this.saveCache();this.status();this.schedule();
    }
    patch(page,key,value,notify=true){
      if(this.user===undefined)return false;
      const prior=this.read('account-v2:'+(this.user||'guest'),{}).pages?.[page]?.pending?.[key];
      const entry={value:copy(value),seq:++this.seq,at:Math.max(Date.now(),(prior?.at||0)+1,(this.page(page).pending[key]?.at||0)+1)};
      this.page(page).pending[key]=entry;this.journal(page,key,entry);this.saveCache();this.status();this.schedule();if(notify)this.onChange();
    }
    answer(id,value){this.patch(this.current,'answer:'+id,value,false);}
    answers(page=this.current){return Object.fromEntries(Object.entries(this.view(page)).filter(([k,v])=>k.startsWith('answer:')&&v!==null).map(([k,v])=>[k.slice(7),copy(v)]));}
    schedule(){clearTimeout(this.timer);if(this.user)this.timer=setTimeout(()=>this.flush(),this.delay);}
    async openPage(page){this.current=page;await this.pull();}
    async pull(page=this.current){
      if(!this.user)return;const epoch=this.epoch;
      try{
        const data=await this.api.loadPresentationPage(this.user,COURSE,page);if(epoch!==this.epoch)return;
        const p=this.page(page);p.data=data;p.syncedAt=Date.now();this.readEvents();
        for(const[k,e]of Object.entries(p.pending))if(e.imported&&k in data)delete p.pending[k];
        this.connected=true;this.saveCache();this.onChange();this.status();return true;
      }catch{if(epoch===this.epoch){this.connected=false;this.onStatus('error','Нет связи с аккаунтом. Изменения остаются на устройстве; повторим отправку.');}return false;}
    }
    async flush(){
      if(!this.user||this.busy)return;clearTimeout(this.timer);this.readEvents();this.busy=true;const epoch=this.epoch;
      try{
        for(const[page,p]of Object.entries(this.pages)){
          if(!Object.keys(p.pending).length)continue;
          // Pull first for the one-time import: cloud tombstones must win.
          if(Object.values(p.pending).some(e=>e.imported)&&!await this.pull(page))throw Error('Import requires a successful read');
          if(epoch!==this.epoch)return;
          const sent=copy(p.pending),events=[...this.events];if(!Object.keys(sent).length)continue;
          this.onStatus('saving','Сохраняем в аккаунт…');
          const data=await this.api.savePresentationPage(this.user,COURSE,page,Object.fromEntries(Object.entries(sent).map(([k,e])=>[k,e.value])));
          if(epoch!==this.epoch)return;
          p.data=data;p.syncedAt=Date.now();this.connected=true;
          this.acknowledge(page,sent,events);
          this.saveCache();this.onChange();
        }
        this.status();
      }catch{if(epoch===this.epoch){this.connected=false;this.onStatus('error','Не удалось отправить изменения. Они сохранены на устройстве. Повторить');}}
      finally{if(epoch===this.epoch){this.busy=false;clearTimeout(this.timer);if(Object.values(this.pages).some(p=>Object.keys(p.pending).length))this.timer=setTimeout(()=>this.flush(),15000);}}
    }
    async exportAll(){
      const epoch=this.epoch;if(this.user){
        const rows=await this.api.loadPresentationPages(this.user,COURSE);if(epoch!==this.epoch)throw Error('Аккаунт изменился');
        for(const r of rows)this.page(r.page).data=r.data;
        this.saveCache();
      }
      return {ink:this.get('ink',{}),spots:this.get('spots',{}),answers:Object.fromEntries(Object.keys(this.pages).map(p=>[p,this.answers(p)]))};
    }
    destroy(){clearTimeout(this.timer);this.unsubscribe?.();root.removeEventListener?.('storage',this.storageChanged);this.epoch++;}
  }
  if(typeof module!=='undefined')module.exports=AccountStore;
  else root.SpeakoutAccountStore=AccountStore;
})(typeof window!=='undefined'?window:globalThis);
