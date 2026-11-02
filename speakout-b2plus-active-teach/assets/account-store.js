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
      this.user=undefined;this.epoch=0;this.seq=0;this.current='sb:7';this.pages={};this.local={};this.baseline={};this.ready=false;
    }
    read(key,fallback){try{return JSON.parse(this.storage.getItem(PREFIX+key)) ?? fallback;}catch{return fallback;}}
    saveCache(){
      if(this.user===undefined)return;
      try{this.storage.setItem(PREFIX+'account-v2:'+(this.user||'guest'),JSON.stringify({pages:this.pages,local:this.local}));this.cacheError=false;}
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
      try{this.unsubscribe=this.api.watchPresentationAuth(u=>this.switchUser(u));await this.switchUser(await this.api.presentationSession());}
      catch{await this.switchUser(null);this.onStatus('error','Не удалось подключить аккаунт. Пометки пока сохраняются на устройстве.');}
      this.ready=true;this.onChange();return this;
    }
    async switchUser(user){
      const id=user?.id||null;if(this.user===id)return;
      this.epoch++;clearTimeout(this.timer);this.user=id;this.busy=false;this.connected=false;this.baseline={};
      const cache=this.read('account-v2:'+(id||'guest'),{});this.pages=cache.pages||{};this.local=cache.local||{};
      this.seq=Math.max(this.seq,...Object.values(this.pages).flatMap(p=>Object.values(p.pending).map(e=>e.seq||0)));
      const owner=this.read('legacy-owner',null);
      if(!owner){
        for(const kind of ['ink','spots']){
          const old=this.read(kind,{});
          for(const[page,items]of Object.entries(old))if(/^(sb|wb):\d+$/.test(page)&&Array.isArray(items)){
            for(const[itemIndex,item]of items.entries()){
              const value={...item,uid:item.uid||legacyId(item,itemIndex)};
              const key=kind+':'+value.uid,p=this.page(page);
              if(!(key in p.data)&&!(key in p.pending))p.pending[key]={value,seq:++this.seq,imported:true};
            }
          }
        }
      }
      if(id){
          const guest=this.read('account-v2:guest',{});
          for(const[page,p]of Object.entries(guest.pages||{}))for(const[k,v]of Object.entries({...p.data,...Object.fromEntries(Object.entries(p.pending||{}).map(([k,e])=>[k,e.value]))})){
            const existing=this.page(page).pending[k];
            if(!existing||existing.imported)this.page(page).pending[k]={value:v,seq:++this.seq,imported:true};
          }
          this.saveCache();
          if(!this.cacheError){if(!owner)this.storage.setItem(PREFIX+'legacy-owner',JSON.stringify(id));this.storage.removeItem(PREFIX+'account-v2:guest');}
      }
      this.saveCache();this.onChange({accountChanged:true});this.status();
      if(id){await this.pull();await this.flush();}
    }
    get(kind,fallback){
      if(!['ink','spots'].includes(kind))return this.local[kind]??fallback;
      const out={};
      for(const page of Object.keys(this.pages))out[page]=Object.entries(this.view(page)).filter(([k,v])=>k.startsWith(kind+':')&&v!==null).map(([,v])=>copy(v));
      this.baseline[kind]=copy(out);return out;
    }
    set(kind,value){
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
      this.page(page).pending[key]={value:copy(value),seq:++this.seq};this.saveCache();this.status();this.schedule();if(notify)this.onChange();
    }
    answer(id,value){this.patch(this.current,'answer:'+id,value,false);}
    answers(page=this.current){return Object.fromEntries(Object.entries(this.view(page)).filter(([k,v])=>k.startsWith('answer:')&&v!==null).map(([k,v])=>[k.slice(7),copy(v)]));}
    schedule(){clearTimeout(this.timer);if(this.user)this.timer=setTimeout(()=>this.flush(),this.delay);}
    async openPage(page){this.current=page;await this.pull();}
    async pull(page=this.current){
      if(!this.user)return;const epoch=this.epoch;
      try{
        const data=await this.api.loadPresentationPage(this.user,COURSE,page);if(epoch!==this.epoch)return;
        const p=this.page(page);p.data=data;
        for(const[k,e]of Object.entries(p.pending))if(e.imported&&k in data)delete p.pending[k];
        this.connected=true;this.saveCache();this.onChange();this.status();return true;
      }catch{if(epoch===this.epoch){this.connected=false;this.onStatus('error','Нет связи с аккаунтом. Изменения остаются на устройстве; повторим отправку.');}return false;}
    }
    async flush(){
      if(!this.user||this.busy)return;clearTimeout(this.timer);this.busy=true;const epoch=this.epoch;
      try{
        for(const[page,p]of Object.entries(this.pages)){
          if(!Object.keys(p.pending).length)continue;
          // Pull first for the one-time import: cloud tombstones must win.
          if(Object.values(p.pending).some(e=>e.imported)&&!await this.pull(page))throw Error('Import requires a successful read');
          if(epoch!==this.epoch)return;
          const sent=copy(p.pending);if(!Object.keys(sent).length)continue;
          this.onStatus('saving','Сохраняем в аккаунт…');
          const data=await this.api.savePresentationPage(this.user,COURSE,page,Object.fromEntries(Object.entries(sent).map(([k,e])=>[k,e.value])));
          if(epoch!==this.epoch)return;
          p.data=data;this.connected=true;
          for(const[k,e]of Object.entries(sent))if(p.pending[k]?.seq===e.seq)delete p.pending[k];
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
    destroy(){clearTimeout(this.timer);this.unsubscribe?.();this.epoch++;}
  }
  if(typeof module!=='undefined')module.exports=AccountStore;
  else root.SpeakoutAccountStore=AccountStore;
})(typeof window!=='undefined'?window:globalThis);
