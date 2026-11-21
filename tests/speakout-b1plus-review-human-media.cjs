const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const root=path.resolve('speakout-b1plus-active-teach/review'),KEY='asya-speakout-b1plus-quest-v1';
let assertions=0;
function ok(x,message){assert(x,message);assertions++;}
function setup(saved){const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://qa.invalid/review/',runScripts:'outside-only'});const w=dom.window;w.HTMLElement.prototype.scrollIntoView=function(){};w.HTMLMediaElement.prototype.pause=function(){};w.HTMLMediaElement.prototype.play=function(){ok(this.muted,'test playback must be muted first');this.dataset.played='true';return Promise.resolve();};w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};if(saved)w.localStorage.setItem(KEY,JSON.stringify(saved));for(const f of ['data.js','quest.js'])w.eval(fs.readFileSync(path.join(root,f),'utf8'));return dom;}
let dom=setup(),w=dom.window,d=w.document;
const click=s=>{const e=d.querySelector(s);ok(e,s);e.click();};
const go=i=>{d.querySelector('#jump').value=String(i);d.querySelector('#jump').dispatchEvent(new w.Event('change',{bubbles:true}));};
const state=()=>JSON.parse(w.localStorage.getItem(KEY));
const choose=(id,index)=>click(`[data-choice="${id}"][data-index="${index}"]`);
// Expected answers derive independently from the original scripts, not the implementation's keys.
const expected={4:[['m5q1-original',1],['m5q2-original',0],['m5q3-original',2]],5:[['m6q1-original',2],['m6q2-original',1]],8:[['m9q2-original',0],['m9q3-original',1]],9:[['m10q1-original',1]]};
click('#start');
for(const [idx,answers] of Object.entries(expected)){
 go(+idx);ok(!d.querySelector('.transcript'),'no transcript before attempt');ok(!d.querySelector('button[aria-pressed="true"][data-choice]'),'no preselection');ok(!d.querySelector('#player').autoplay,'no autoplay');click('#check');ok(!d.querySelector('.transcript'),'empty attempt stays locked');
 click('#teacher');ok(!d.querySelector('#teacher-body').textContent.includes('Marcelo says'),'no answer explanations before attempt');click('#close-teacher');
 answers.slice(0,-1).forEach(([id,index])=>choose(id,(index+1)%3));click('#check');ok(!d.querySelector('.transcript'),'partial attempt stays locked');
 answers.forEach(([id,index])=>choose(id,(index+1)%3));click('#check');ok(d.querySelector('.transcript'),'wrong complete attempt opens transcript');ok(!state().done.includes(+idx),'wrong answers do not finish mission');
 answers.forEach(([id,index])=>choose(id,index));click('#check');answers.forEach(([id])=>ok(d.querySelector('#feedback-'+id).classList.contains('good'),'source answer accepted: '+id));
 const before=state();click('#reset-mission');ok(!d.querySelector('.transcript'),'reset hides transcript');answers.forEach(([id])=>ok(!(id in state().answers),'reset current answer'));click('#undo-reset');ok(JSON.stringify(state().answers)===JSON.stringify(before.answers),'undo preserves answers');ok(d.querySelector('.transcript'),'undo restores attempted state');
 if(!d.querySelector('#player').muted)click('[data-mute]');ok(d.querySelector('#player').muted,'mute confirmed');click('[data-replay]');ok(d.querySelector('#player').dataset.played==='true','replay');click('[data-speed]');ok(d.querySelector('#player').playbackRate===.85,'slower');click('[data-speed]');ok(d.querySelector('#player').playbackRate===1,'normal speed');
 ok(fs.statSync(path.resolve(root,d.querySelector('#player').getAttribute('src'))).size>10000,'source asset exists');
}
// Personal oral responses must not require text or be falsely exact-graded.
go(4);for(let i=0;i<2;i++)click(`[data-checklist="m5q4"][data-index="${i}"]`);click('#check');ok(/Practice recorded/.test(d.querySelector('#feedback-m5q4').textContent),'oral response uses checklist without typing');
const saved=state();dom.window.close();dom=setup(saved);w=dom.window;d=w.document;ok(d.querySelector('.transcript'),'attempt restored on reload');ok(d.querySelector('#player').muted===false,'fresh session leaves learner sound usable');
const legacy={version:1,current:8,started:true,answers:{m9q2:1,m5q1:2,m1q2:0},notes:{m5q4:'My existing response',reflection:'remember'},checks:{m5q4:[true,true]},done:[0,4,5,8,9],final:true};dom.window.close();dom=setup(legacy);w=dom.window;d=w.document;ok(JSON.stringify(state().answers)===JSON.stringify(legacy.answers),'all legacy answers preserved');ok(JSON.stringify(state().notes)===JSON.stringify(legacy.notes),'all legacy notes preserved');ok(JSON.stringify(state().checks)===JSON.stringify(legacy.checks),'all legacy checklists preserved');ok(JSON.stringify(state().done)==='[0]','unaffected completion retained; changed questions require attempt');ok(JSON.stringify(state().legacyMediaV1.done)===JSON.stringify(legacy.done),'old completion archived');ok(state().legacyMediaV1.final===true,'old final archived');ok(!d.querySelector('.transcript'),'legacy question IDs cannot unlock new transcript');
click('#reset-mission');ok(state().answers.m9q2===1,'reset never deletes legacy records');ok(state().notes.m5q4==='My existing response','reset leaves other mission alone');click('#undo-reset');
const media=Object.values(w.QUEST.media);ok(media.length===4,'four human sources');for(const a of media)ok(a.src.startsWith('../media/'),'original source path');ok(!fs.existsSync(path.join(root,'assets/story.mp4')),'synthetic film removed');ok(!fs.readdirSync(path.join(root,'assets')).some(f=>/\.(mp3|srt|vtt)$/.test(f)),'synthetic speech/timing removed');
dom.window.close();console.log(`PASS: ${assertions} human-media/source-answer, attempt-gate, reset/undo, muted replay, reload and legacy compatibility assertions.`);
