const {JSDOM}=require('jsdom'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const d=new JSDOM('<body><main><input></main><dialog open class="coursework-dialog"></dialog></body>',{url:'https://school.test',runScripts:'outside-only'}),w=d.window;
 try{w.eval(fs.readFileSync('coursework-ui.js','utf8'));const store={user:undefined,message:'Не удалось проверить аккаунт',onStatus(){},flush(){},async reconnect(){this.user={id:'alice'};this.onStatus('Ответы загружены')}};
 w.CourseWorkUI.bind(store);assert(w.document.querySelector('main').inert);assert(w.document.querySelector('dialog').inert);assert(w.document.querySelector('#coursework-auth-retry'));
 w.document.querySelector('#coursework-auth-retry button').click();await new Promise(r=>setImmediate(r));assert(!w.document.querySelector('main').inert);assert(!w.document.querySelector('#coursework-auth-retry'));
 store.user=null;store.onStatus('Гостевой режим');assert(!w.document.querySelector('main').inert);
 console.log('PASS unknown-account editing guard, explicit reconnect and known guest mode.');
 }finally{w.close()}
})().catch(e=>{console.error(e);process.exit(1)});
