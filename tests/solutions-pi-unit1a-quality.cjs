const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require(process.env.JSDOM_PATH||'jsdom');
const base=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(base,p),'utf8'),D=require('../solutions-pi-unit1a/data.js');
let checks=0;function ok(v,msg){assert.ok(v,msg);checks++;}
const snapshot={records:{'practice:1:listening:legacy':{values:['1'],done:true,updatedAt:1}}};
async function open(cache=snapshot){
 const dom=new JSDOM(read('solutions-pi-unit1a/index.html'),{url:'http://localhost/solutions-pi-unit1a/',runScripts:'outside-only'}),w=dom.window;
 w.localStorage.setItem('coursework-v2:solutions-pi:guest',JSON.stringify(cache));
 w.SM={presentationSession:async()=>null};w.CourseWorkUI={bind(){},mount(){},accountChanged(){}};
 w.HTMLMediaElement.prototype.pause=function(){};
 w.HTMLMediaElement.prototype.play=function(){throw Error('Audio playback is forbidden in QA');};
 for(const p of ['coursework-store.js','solutions-pi-unit1a/data.js','solutions-pi-unit1a/app.js'])w.eval(read(p));
 await new Promise(r=>setTimeout(r,10));
 const $=s=>w.document.querySelector(s),click=s=>{const el=$(s);assert.ok(el,s);el.click();};
 const task=n=>{$('#task').value=n;$('#task').dispatchEvent(new w.Event('change'));};
 const saved=()=>JSON.parse(w.localStorage.getItem('coursework-v2:solutions-pi:guest'));
 return {dom,w,$,click,task,saved};
}
(async()=>{
 ok(D.words.length===16,'Exact original bank');ok(D.grade({}).every(x=>x==='blank'),'Blank answers');
 ok(D.grade({0:'anxious',1:'suspicious',2:'excited',3:'cross'}).every(x=>x==='correct'),'Printed key 1a 2c 3c 4b');
 let t=await open();const {$,click,task}=t;
 ok($('#lesson').getAttribute('aria-busy')==='false','Loaded guest');
 click('#complete');ok(!t.saved().records['sb:unit1:1a:ex1:v1'].done,'Incomplete speaking not marked done');
 for(const p of D.photos)click(`[data-action=spoken][data-value=${p}]`);
 click('#complete');ok(t.saved().records['sb:unit1:1a:ex1:v1'].done,'Speaking marks saved');
 task(2);click('[data-action=feeling][data-value=anxious]');click('[data-action=feeling][data-value=upset]');click('[data-action=photo][data-value=B]');click('[data-action=feeling][data-value=anxious]');
 ok(t.saved().records['sb:unit1:1a:ex2:v1'].values.A.length===2,'Many feelings per photo');ok(t.saved().records['sb:unit1:1a:ex2:v1'].values.B[0]==='anxious','Reuse across photos');click('#complete');ok(t.saved().records['sb:unit1:1a:ex2:v1'].results.length===0,'Open interpretations ungraded');
 task(3);for(const w of D.words){click(`[data-action=word][data-value=${w}]`);click('[data-action=category][data-value=A]');}
 click('[data-action=word][data-value=shocked]');click('[data-action=category][data-value=B]');click('#complete');ok(t.saved().records['sb:unit1:1a:ex3:v1'].done,'Sort and move');ok(t.saved().records['sb:unit1:1a:ex3:v1'].results.length===0,'No invented key');
 task(4);ok($('#reveal').hidden,'No early key');click('#complete');ok($('#reveal').hidden,'Blank attempt cannot reveal');ok([...t.w.document.querySelectorAll('[data-result=blank]')].length===4,'Four blank states');
 for(let i=0;i<4;i++)click(`[data-action=quiz][data-value="${i}:${D.quiz[i][0]}"]`);
 click('#complete');ok(!$('#reveal').hidden,'Complete attempt can compare');ok(t.saved().records['sb:unit1:1a:ex4:v1'].results.filter(x=>x==='incorrect').length===3,'Wrong answers');click('#reveal');ok(t.w.document.querySelectorAll('.quiz-card').length===4,'Key view');
 click('#retry');ok($('#reveal').hidden,'Retry hides key');
 for(let i=0;i<4;i++)click(`[data-action=quiz][data-value="${i}:${D.key[i]}"]`);
 click('#complete');ok(t.saved().records['sb:unit1:1a:ex4:v1'].done,'Correct attempt');
 click('#reset');ok(Object.keys(t.saved().records['sb:unit1:1a:ex4:v1'].values).length===0,'Reset only current task');click('#undo');ok(t.saved().records['sb:unit1:1a:ex4:v1'].done,'Undo restores results');
 task(5);ok(t.w.document.querySelectorAll('[data-action=gap]').length===5,'Five real gaps, printed example intact');click('#complete');ok(!t.saved().records['sb:unit1:1a:ex5:v1'].done,'Incomplete hashtags');
 for(let i=1;i<=5;i++){click(`[data-action=gap][data-value="${i}"]`);click('[data-action=hashtag][data-value=confused]');}click('#complete');ok(t.saved().records['sb:unit1:1a:ex5:v1'].done,'Multiple-answer exercise self review');ok(t.saved().records['sb:unit1:1a:ex5:v1'].results.length===0,'No false hashtag grading');
 $('#notes').value='My own explanation';$('#notes').dispatchEvent(new t.w.Event('input'));
 ok(t.w.document.querySelectorAll('input,textarea[required]').length===0,'No mandatory typing');
 const cache=t.saved();ok(JSON.stringify(cache.records['practice:1:listening:legacy'])===JSON.stringify(snapshot.records['practice:1:listening:legacy']),'Older coursework untouched');t.dom.window.close();
 t=await open(cache);t.task(5);ok(t.$('#notes').value==='My own explanation','Reload notes');ok(t.$('[data-action=gap][data-value="5"]').textContent==='#confused','Reload choices');t.task(4);ok(t.$('#feedback').textContent.includes('4 из 4'),'Reload grading');t.dom.window.close();
 const legacy=read('solutions-pi-u1.html');ok(!/speechSynthesis|SpeechSynthesisUtterance|=>say\(/.test(legacy),'No synthetic playback path in legacy Unit 1');ok(legacy.includes('section:sec||"grammar"'),'Legacy storage sections retained');
 for(const p of ['solutions-pi-unit1a/app.js','solutions-pi-unit1a/index.html'])ok(!/speechSynthesis|\.play\(/.test(read(p)),'No synthetic/autoplay audio');
 console.log(`Solutions PI 1A quality: ${checks} checks passed; guest fixtures only, no media playback.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
