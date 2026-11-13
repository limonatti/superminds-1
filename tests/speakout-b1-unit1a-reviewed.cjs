const assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom');
const M=require('../speakout-b1-active-teach/assets/unit1a-reviewed.js');
const cases={
 '2A':{'photo:1':'B','photo:2':'C, D','photo:3':'E, F','photo:4':'F, A'},
 '2B':{'category:teammates':'sport','category:colleagues':'work','category:manager':'work','category:grandparents':'family','category:partner':'friendships/personal life','category:close friends':'friendships/personal life'},
 '2C':{'1':'be friendly with and get on well with','2':'take after','3':'look up to','4':'stay in touch with'}
};
function mount(label,state={values:{},note:'previous personal note'}){const dom=new JSDOM('<main></main>');let changes=0;const host=dom.window.document.querySelector('main');M.mount(host,'sb:8:'+label,state,()=>changes++);return {dom,host,state,changes:()=>changes};}
function click(h,key,value){const b=[...h.querySelectorAll('[data-response]')].find(b=>b.dataset.response===key&&b.dataset.value===value);assert(b,`${key}:${value}`);b.click();}
for(const label of ['1A','1B','2A','2B','2C','2D']){
 const {dom,host,state}=mount(label);assert.equal(host.querySelectorAll('input,textarea,select').length,0);assert.equal(host.querySelectorAll('[aria-pressed=true]').length,0);assert(host.querySelector('button'));
 if(cases[label]){host.querySelector('[data-review-check]').click();assert.match(host.querySelector('[role=status]').textContent,/Сначала/);assert(!state.reviewAttempted);assert.equal(M.grade('sb:8:'+label,{}).complete,false)}
 dom.window.close();
}
for(const [label,values]of Object.entries(cases)){
 const correct=M.grade('sb:8:'+label,values);assert(correct.complete);assert(correct.correct.every(Boolean));
 const wrong=Object.fromEntries(Object.entries(values).map(([k,v])=>[k,k==='1'?'look up to, stay in touch with':k.startsWith('photo:')?v.split(',').length===2?'A, B':'A':'wrong']));assert(!M.grade('sb:8:'+label,wrong).correct.every(Boolean));
 const {dom,host,state}=mount(label,{values:{...values},note:'keep original',done:true});assert.equal(state.note,'keep original');host.querySelector('[data-review-check]').click();assert(state.done);assert(state.reviewAttempted);
 const copy=JSON.parse(JSON.stringify(state)),again=mount(label,copy);assert.equal(copy.note,'keep original');assert(M.grade('sb:8:'+label,copy.values).correct.every(Boolean));again.dom.window.close();
 host.querySelector('[data-review-reset]').click();assert.deepEqual(state.values,{});assert.equal(state.note,'keep original');assert(!state.done);assert(!state.reviewAttempted);dom.window.close();
}
{
 const {dom,host,state}=mount('2C');for(const p of ['be friendly with','get on well with'])click(host,'1',p);click(host,'2','take after');click(host,'3','look up to');click(host,'4','stay in touch with');host.querySelector('[data-review-check]').click();assert(state.done);click(host,'1','be friendly with');assert(!state.done);assert(!state.reviewAttempted);assert(!M.grade('sb:8:2C',state.values).complete);dom.window.close();
}
{
 const {dom,host,state}=mount('2A');for(const [k,v]of Object.entries(cases['2A']))for(const a of v.split(/,\s*/))click(host,k,a);host.querySelector('[data-review-check]').click();assert(state.done);assert.equal(host.querySelectorAll('.b1-photo img').length,6);dom.window.close();
}
{
 const {dom,host,state}=mount('2B');for(const [k,v]of Object.entries(cases['2B']))click(host,k,v);host.querySelector('[data-review-check]').click();assert(state.done);dom.window.close();
}
for(const label of ['1A','1B','2D']){
 const {dom,host,state}=mount(label);if(label==='1A'){click(host,'groups','family');click(host,'prompt:0','done')}if(label==='1B')click(host,'photos','A');if(label==='2D'){click(host,'person','colleague');click(host,'phrase','be friendly with');assert.match(host.querySelector('.b1-model').textContent,/I am friendly with my colleague because/)}host.querySelector('[data-review-check]').click();assert(state.done);assert.equal(state.score,null);assert.equal(M.grade('sb:8:'+label,state.values),null);assert.match(host.querySelector('[role=status]').textContent,/не оценивается/);dom.window.close();
}
assert.equal(M.get('sb:9:3A'),null);assert.equal(M.get('wb:8:2C'),null);
const app=fs.readFileSync('speakout-b1-active-teach/assets/app.js','utf8');assert(app.includes("responseMode:reviewed?'manual':undefined"));
console.log('PASS six source-reviewed SB8 interactions: click responses, photos, sorting, unordered pair, blank/partial/wrong/correct grading, optional personal activity, legacy note/answers, reset and restoration.');
// Shared key gating must recognise a completed click attempt without requiring optional notes.
{
 const dom=new JSDOM('<dialog id="exerciseDialog"><button id="exerciseKeys">Key</button><div id="exerciseBody"><div class="exercise-source"></div><div class="exercise-response"><div id="review"></div><textarea></textarea><div id="keyArea">key</div></div></div></dialog>',{url:'https://example.test',runScripts:'outside-only'});
 const w=dom.window,d=w.document,state={values:{},note:''};w.ExerciseSource={change(){}};w.eval(fs.readFileSync('exercise-play.js','utf8'));
 const host=d.querySelector('#review');M.mount(host,'sb:8:2C',state,()=>{});w.ExercisePlay.speakout({dialog:d.querySelector('dialog'),id:'sb:8:2C',page:{},spec:{items:[]},text:'Match the phrases.',responseMode:'manual',isComplete:()=>!!state.reviewAttempted});
 assert(d.querySelector('#exerciseKeys').disabled);host.querySelector('[data-review-check]').click();assert(d.querySelector('#exerciseKeys').disabled);
 for(const [k,v]of [['1','be friendly with'],['1','get on well with'],['2','take after'],['3','look up to'],['4','stay in touch with']])click(host,k,v);
 host.querySelector('[data-review-check]').click();assert(!d.querySelector('#exerciseKeys').disabled);click(host,'2','take after');assert(d.querySelector('#exerciseKeys').disabled);dom.window.close();
 console.log('PASS shared key gate opens after a complete attempt and relocks when the answer changes.');
}
