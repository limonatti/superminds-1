const fs=require('fs'),assert=require('assert/strict'),path=require('path'),{JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'..'),base=path.join(root,'solutions-int-active-teach');
const html=fs.readFileSync(path.join(base,'index.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(html,{url:'https://example.test/solutions-int-active-teach/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc}),w=dom.window;
w.ResizeObserver=class{observe(){}disconnect(){}};w.CSS={escape:String};w.HTMLElement.prototype.scrollIntoView=()=>{};w.HTMLMediaElement.prototype.pause=function(){this._paused=true};w.HTMLMediaElement.prototype.play=async function(){this._paused=false;this.dispatchEvent(new w.Event('play'))};Object.defineProperty(w.HTMLMediaElement.prototype,'paused',{get(){return this._paused!==false}});w.HTMLCanvasElement.prototype.getContext=()=>({measureText:s=>({width:s.length*8})});w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
let store,live;
w.CourseWorkStore=class{constructor(o){store=this;this.records={};this.user=null;this.message='Test';}async start(){}key(){return 'test'}capture(records){this.records=records}async flush(){return{ok:true}}};w.CourseWorkUI={bind(s,save){this.save=save},accountChanged(){}};w.LiveCourse={connect(o){live=o}};w.SM={getUser:async()=>null};w.SolutionsAssign={create:()=>({init(){},refresh(){},has(){return false},allowed:false})};
function run(file){const script=w.document.createElement('script');script.src='https://example.test/'+file;Object.defineProperty(w.document,'currentScript',{value:script,configurable:true});w.eval(fs.readFileSync(path.join(root,file),'utf8'))}
for(const file of ['exercise-play.js','exercise-source.js','course-focus.js','solutions-int-active-teach/assets/course.js','solutions-int-active-teach/assets/exercise-sources.js','solutions-int-active-teach/assets/exercise-gaps.js','solutions-int-active-teach/assets/marking.js','solutions-int-active-teach/assets/interactions.js','solutions-homework.js','solutions-int-active-teach/assets/lesson-audio.js','solutions-int-active-teach/assets/app.js'])run(file);
const q=s=>w.document.querySelector(s),qa=s=>[...w.document.querySelectorAll(s)];

(async()=>{await new Promise(r=>setImmediate(r));
const exercises=w.SOLUTIONS.pages.find(p=>p.id==='sb-11').exercises;
const open=id=>live.apply({book:'sb',page:11,exercise:id});
const vals=()=>qa('[data-answer]').map(x=>x.value);
const submit=()=>q('#answerForm').onsubmit({preventDefault(){}});
for(const e of exercises){
 open(e.id);assert(q('#exercise').open);assert.equal(qa('.choice-buttons button[aria-pressed="true"]').length,0);assert.equal(qa('input:not([type=hidden])[data-answer],textarea[data-answer]').length,0);assert(q('#keyPanel').hidden,e.id+' keys hidden before attempt');assert.equal(q('#solutionOriginal').dataset.sourceFit,'width');
 const spec=e.answerSpec||[];assert.equal(vals().length,spec.length||e.responseFields.length);
 assert.deepEqual(qa('#exerciseAudio [data-lesson-audio]').map(el=>el.dataset.lessonAudio),e.audioTracks.map(t=>'media/sb-'+t+'.mp3').slice().reduce((a,x)=>[...a,x],[]));
 q('#answerForm').onsubmit({preventDefault(){}});assert(!store.records[e.id]?.score);assert(q('#keyPanel').hidden);
 if(spec.length){
  // A complete but wrong attempt; compare to source keys only for verification.
  spec.forEach((f,i)=>{const input=qa('[data-answer]')[i];input.value=f.kind==='set'?'wrong':e.interaction.rows[i].options.find(o=>!w.SolutionsMarking.checkField(o.value,f)).value;input.dispatchEvent(new w.Event('input',{bubbles:true}))});
  submit();assert.equal(store.records[e.id].score.correct,0);assert(!q('#keyPanel').hidden||!e.key);
  q('#resetAnswer').click();assert(vals().every(v=>!v));assert(q('#keyPanel').hidden);
  spec.forEach((f,i)=>{const buttons=qa('.choice-row')[i].querySelectorAll('.choice-buttons button');e.interaction.rows[i].options.forEach((o,j)=>{if(f.kind==='set'?f.members.some(a=>w.SolutionsMarking.checkText(o.value,a)):w.SolutionsMarking.checkField(o.value,f))buttons[j].click()})});
  submit();assert.equal(store.records[e.id].score.correct,spec.length,e.id+' correct cards accepted');
 }else{
  qa('.choice-row').forEach(row=>row.querySelector('button').click());q('#saveAnswer').click();assert.equal(store.records[e.id].score,undefined);assert(vals().every(Boolean));
 }
 const before=vals();open(e.id);assert.deepEqual(vals(),before,e.id+' reopen preserves values');await w.CourseWorkUI.save();assert.deepEqual(vals(),before);
 q('#resetAnswer').click();assert(vals().every(v=>!v));assert(q('#keyPanel').hidden);assert.equal(qa('.choice-buttons button[aria-pressed="true"]').length,0);
 if([1,2,5,8,9].includes(Number(e.label))){store.records[e.id]={answerVersion:'4f53cda18c2b',values:['Previous free answer'],reflection:'My original note'};open(e.id);assert.match(q('.previous-answers').textContent,/Previous free answer/);assert.match(q('.previous-answers').textContent,/My original note/);q('#saveAnswer').click();assert.equal(store.records[e.id].previousAnswers.length,1);}
}
open('sb-11-5');const transport=q('#lessonAudioTransport');q('#exerciseAudio [data-audio-mute]').click();assert(transport.muted);q('#exerciseAudio [data-audio-play]').click();await new Promise(r=>setImmediate(r));assert(!transport.paused);transport.currentTime=12;
q('#openAudioList').click();assert(q('#recordings').open);q('#returnToExercise').click();assert(!q('#recordings').open);assert.equal(q('#lessonAudioTransport'),transport);assert.equal(transport.currentTime,12);assert(!transport.paused);open('sb-11-6');assert.equal(transport.currentTime,12);assert(!transport.paused);q('#close').click();assert(!transport.paused);assert(!q('#lessonAudioDock').hidden);transport.pause();
assert.equal(w.EXERCISE_SOURCES['sb-11-1'].sources.length,2);assert.equal(w.EXERCISE_SOURCES['sb-11-2'].sources.length,3);assert.equal(w.EXERCISE_SOURCES['sb-11-9'].sources.length,2);assert.deepEqual(errors,[]);console.log('PASS Solutions1C: nine tasks, exact tracks, empty/wrong/correct, no default answers, cards, manual assessment, reset/reopen, archived legacy answers and persistent muted transport.');dom.window.close();
})().catch(e=>{console.error(e);dom.window.close();process.exitCode=1});
