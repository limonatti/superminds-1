const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=__dirname;
const course=JSON.parse(fs.readFileSync(path.join(root,'assets/course.js'),'utf8').slice(14,-1));
for(const [book,data] of Object.entries(course.books)){
 assert.equal(new Set(data.pages.map(p=>p.page)).size,data.pages.length);
 for(let u=1;u<=8;u++)for(const suffix of 'ABCD')assert(data.pages.some(p=>p.lesson===u+suffix),`${book} ${u}${suffix}`);
 for(const p of data.pages){assert(fs.existsSync(path.join(root,p.image)));assert.equal(new Set(p.exercises.map(e=>e.label)).size,p.exercises.length);for(const e of p.exercises){assert(e.box.every(Number.isFinite));assert(e.box[2]>0&&e.box[3]>0);}}
}
for(const m of course.media)assert(fs.existsSync(path.join(root,m.path)),m.path);
for(const k of Object.values(course.keys))assert(fs.existsSync(path.join(root,k.pdf)),k.pdf);
const code=fs.readFileSync(path.join(root,'assets/app.js'),'utf8');
const context={window:{COURSE:course},document:{querySelector(){return {}}},localStorage:{getItem(){return null}},URLSearchParams,location:{search:'?unit=8&book=wb'}};
vm.createContext(context);vm.runInContext(code.slice(0,code.indexOf('function render(){')),context);
assert.equal(vm.runInContext("matchAnswer('I am','I’m')",context),true);
assert.equal(vm.runInContext("matchAnswer('', 'am')",context),false);
vm.runInContext(code.slice(code.indexOf('const entry=new URLSearchParams'),code.indexOf("if(!['sb','wb'].includes(S.book))")),context);
assert.equal(vm.runInContext('S.book',context),'wb');assert.equal(vm.runInContext('S.page',context),52);
const loader=fs.readFileSync(path.join(root,'assets/loader.js'),'utf8');
function harness(){const scripts=[],layers=[];const input={},status={};const ctx={window:{},URL:{createObjectURL:f=>'blob:'+f.webkitRelativePath},document:{createElement:tag=>({tag,querySelector:q=>q==='input'?input:status,remove(){this.removed=true}}),head:{appendChild:x=>scripts.push(x)},body:{appendChild:x=>x.tag==='script'?scripts.push(x):layers.push(x)}}};vm.runInNewContext(loader,ctx);return {ctx,scripts,layers,input,status};}
(async()=>{
 let h=harness();h.ctx.window.COURSE={};h.scripts[0].onload();assert.equal(h.scripts[1].src,'assets/app.js');
 h=harness();h.scripts[0].onerror();h.scripts[0].onerror();assert.equal(h.layers.length,1);
 await h.input.onchange({target:{files:[]}});assert.match(h.status.textContent,/нет assets/);
 const data={books:{sb:{path:'source/book.pdf',pages:[{image:'assets/sb-8.webp'}]}},media:[],resources:[]};
 const files=['assets/course.js','source/book.pdf','assets/sb-8.webp'].map(p=>({webkitRelativePath:'folder/'+p,text:async()=> 'window.COURSE='+JSON.stringify(data)+';'}));
 await h.input.onchange({target:{files:files.slice(0,1)}});assert.match(h.status.textContent,/Не хватает/);
 await h.input.onchange({target:{files}});assert.equal(h.layers[0].removed,true);assert(h.ctx.window.SPEAKOUT_FILES.has('source/book.pdf'));assert.equal(h.scripts.at(-1).src,'assets/app.js');
 console.log('PASS: 8 units in both books, all local media and key paths, exercise IDs and bounds, answer normalization, unit/book deep links, direct and folder loading, missing-file handling.');
})().catch(e=>{console.error(e);process.exitCode=1});
