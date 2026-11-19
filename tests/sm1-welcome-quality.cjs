const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require(process.env.JSDOM_PATH||'jsdom');
const base=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(base,p),'utf8'),D=require('../sm1-welcome/data.js');
let checks=0;function ok(v,m){assert.ok(v,m);checks++;}
const legacy={id:'old-author-exercise',values:['my answer'],done:true,score:1,updatedAt:1};
async function open(cache={records:{legacy}}){
 const dom=new JSDOM(read('sm1-welcome/index.html'),{url:'http://localhost/sm1-welcome/',runScripts:'outside-only'}),w=dom.window;
 w.localStorage.setItem('coursework-v2:sm1:guest',JSON.stringify(cache));w.SM={presentationSession:async()=>null};w.CourseWorkUI={bind(){},mount(){},accountChanged(){}};
 w.HTMLMediaElement.prototype.pause=function(){};w.HTMLMediaElement.prototype.play=function(){throw Error('No playback in QA')};
 for(const p of ['coursework-store.js','sm1-welcome/transcripts.js','sm1-welcome/data.js','sm1-welcome/app.js'])w.eval(read(p));
 await new Promise(r=>setTimeout(r,10));const $=s=>w.document.querySelector(s),click=s=>{ok(!!$(s),s);$(s).click()},task=n=>{$('#task').value=n;$('#task').dispatchEvent(new w.Event('change'));};
 return {dom,w,$,click,task,saved:()=>JSON.parse(w.localStorage.getItem('coursework-v2:sm1:guest'))};
}
(async()=>{
 ok(D.tasks.length===5,'Five exact source exercises');ok(D.words.join(' ')==='one two three four five six seven eight nine ten','Printed candidate bank');
 ok(D.grade({}).every(x=>x==='blank'),'Empty age responses');ok(D.grade({0:'six',1:' EIGHT ',2:8,3:'Seven'}).every(x=>x==='correct'),'Original accepted variants');ok(D.grade({0:1,1:2,2:3,3:4}).every(x=>x==='incorrect'),'Wrong age responses');
 let t=await open();let {$,click,task}=t;ok($('#lesson').getAttribute('aria-busy')==='false','Guest ready');
 for(let n=1;n<=2;n++){task(n);click('#complete');ok(!t.saved().records[D.tasks[n-1].id].done,'Incomplete oral practice');for(const h of D.heroes){click(`[data-action=hero][data-value=${h}]`);click(`[data-action=mark-hero][data-value=${h}]`);}click('#complete');ok(t.saved().records[D.tasks[n-1].id].done,'All roles marked');ok(t.saved().records[D.tasks[n-1].id].results.length===0,'Oral task not scored');}
 task(3);for(let n=1;n<=10;n++)click(`[data-action=point][data-value="${n}"]`);click('[data-action=point][data-value="8"]');click('#complete');ok(t.saved().records[D.tasks[2].id].done,'Repeated points allowed');
 task(4);ok($('#transcript').hidden,'No early listening answer');ok(t.w.document.querySelectorAll('.age-card').length===4,'Exactly four real gaps');ok(t.w.document.querySelectorAll('[data-action=age][aria-pressed=true]').length===0,'No default answer');
 click('#complete');ok($('#transcript').hidden,'Empty check cannot reveal transcript');for(let i=0;i<4;i++){click(`[data-action=gap][data-value="${i}"]`);click('[data-action=age][data-value="1"]');}click('#complete');ok(t.saved().records[D.tasks[3].id].results.every(x=>x==='incorrect'),'Wrong state shown');ok(!$('#transcript').hidden,'Transcript after full attempt');$('#transcript').open=true;click('#retry');ok($('#transcript').hidden&&!$('#transcript').open,'Retry closes answer support');
 for(let i=0;i<4;i++){click(`[data-action=gap][data-value="${i}"]`);click(`[data-action=age][data-value="${D.ageKey[i]}"]`);}click('#complete');ok(t.saved().records[D.tasks[3].id].done,'All correct, reusable eight');click('[data-action=clear]');ok($('#transcript').hidden,'Clear invalidates attempt');click('#complete');ok(t.saved().records[D.tasks[3].id].results[3]==='blank','Clear creates actual blank');click('[data-action=age][data-value="7"]');click('#complete');
 click('#reset');ok(Object.keys(t.saved().records[D.tasks[3].id].values).length===0,'Reset only selected task');click('#undo');ok(t.saved().records[D.tasks[3].id].done,'Undo restores answer and feedback');
 task(5);click('#complete');ok(!t.saved().records[D.tasks[4].id].done,'Blank dialogue not completed');for(let i=0;i<2;i++){click(`[data-action=question][data-value="${i}"]`);click(`[data-action=personal][data-value=ask${i}]`);click(`[data-action=personal][data-value=answer${i}]`);}click('#complete');ok(t.saved().records[D.tasks[4].id].done,'Both questions, both roles');ok(t.saved().records[D.tasks[4].id].results.length===0,'Personal answer not graded');
 $('#notes').value='My own answer';$('#notes').dispatchEvent(new t.w.Event('input'));const cache=t.saved();ok(JSON.stringify(cache.records.legacy)===JSON.stringify(legacy),'Previous authored response unchanged');
 for(let n=1;n<=5;n++){task(n);ok(t.w.document.querySelectorAll('input,textarea[required]').length===0,'No required typing');const before=JSON.stringify(t.saved().records[D.tasks[n-1].id].values);click('#reset');click('#undo');ok(JSON.stringify(t.saved().records[D.tasks[n-1].id].values)===before,'Undo works for each format');}
 const final=t.saved();t.dom.window.close();t=await open(final);for(let n=1;n<=5;n++){t.task(n);ok(t.saved().records[D.tasks[n-1].id].done,'Reload done '+n);}ok(t.$('#notes').value==='My own answer','Reload notes');t.task(4);ok(t.$('#feedback').textContent.includes('Все четыре'),'Reload result');t.dom.window.close();
 for(const f of ['app.js','index.html'])ok(!/speechSynthesis|\.play\(|autoplay/.test(read('sm1-welcome/'+f)),'No generated/autoplay audio');
 console.log(`Super Minds Welcome: ${checks} assertions passed, five source tasks; guest fixtures only, no playback.`);
})().catch(e=>{console.error(e);process.exitCode=1});
