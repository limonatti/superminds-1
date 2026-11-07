'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const w={},c={window:w};
for(const name of ['course-web','exercise-text','interactive','answer-map','inline-data','inline','choices-data','choices','activities-data','activities','exercise-sources','task-corrections'])vm.runInNewContext(fs.readFileSync(`speakout-a1-active-teach/assets/${name}.js`,'utf8'),c);
w.SpeakoutTaskCorrections.apply(w.COURSE);
const I=w.SpeakoutInteractive;
function get(id){const[b,p,n]=id.split(':'),page=w.COURSE.books[b].pages.find(x=>x.page===+p),e=page.exercises.find(x=>x.label===n);e.text||=w.SPEAKOUT_EXERCISE_TEXT[id]||'';const key=I.cleanKey(w.SpeakoutActivities.key(id,w.COURSE.keys[`${b}|${page.lesson}|${n}`])),spec=I.spec(e,key),activity=w.SpeakoutActivities.model(id,spec),choice=!activity&&w.SpeakoutChoices.model(id,spec),inline=!activity&&!choice&&w.SpeakoutInline.model(id,spec);return {id,e,key,spec,activity,choice,inline,model:activity?.inline||activity||choice||inline};}
// Expected structures and answers are independently transcribed from printed pages, not generated from the patch.
for(const[id,count]of [['sb:18:1C',4],['sb:21:5A',6],['sb:26:3A',20],['wb:10:1C',10],['wb:12:1',10],['wb:13:5B',7]])assert.equal(get(id).model.fields.length,count,id);
assert.equal(get('sb:21:5A').model.fields.some(f=>f.n==='1'),false,'printed our must not be editable');
assert.deepEqual(Array.from(get('wb:10:1C').model.fields,f=>f.n),['1','2','3','4','5','6','7','8','9','10']);
assert.equal(get('wb:10:1C').model.fields.find(f=>f.n==='5').answer,'30');
assert.equal(get('wb:12:1').model.fields.find(f=>f.n==='9').answer,'aughter','only the missing suffix belongs after printed d');
assert.equal(get('sb:26:3A').model.groups['4'][0].answer,'ou');
assert.deepEqual(Array.from(get('sb:26:3A').model.groups['7'],f=>f.answer),['a','ou','i','e']);
const dialog=get('sb:26:1').model;
for(const n of ['7','11']){const q=dialog.items.find(q=>q.n===n);assert.equal(dialog.groups[n][0].answer,'are');assert(I.matches('Are',q.answer,q.literal));assert(!I.matches("'re",q.answer,q.literal));}
assert.equal(dialog.groups['10'][0].answer,"'re");assert(!I.matches('are',dialog.items.find(q=>q.n==='10').answer,true));
assert(I.matches("'s",get('sb:22:2C').model.groups['4'][0].answer));
for(const id of ['sb:20:4B','sb:22:2D','sb:23:3B','sb:26:6B']){const r=get(id);assert.equal(r.spec.mode,'review');assert(!r.model);assert.equal(r.e.responseMode,'manual');}
assert.equal(get('sb:20:4C').spec.items.length,9);
assert.equal(get('sb:21:5B').spec.items.length,6);
const turns=get('wb:10:4D').spec.items;assert.equal(turns.length,12);assert.equal(turns[0].answer,'Where are you and Zeynep from?');assert.equal(turns[1].answer,'We are from Turkey.');
assert.equal(get('wb:11:5B').spec.items[0].answer,'A');assert(!get('wb:11:5B').inline);
const match=get('wb:15:2C').activity;assert.equal(match.items.length,6);assert.equal(match.left.length,6);assert.equal(match.right.length,6);
for(const id of ['sb:20:1','sb:20:4A','sb:20:4B','sb:20:4D'])assert(w.EXERCISE_SOURCES[id].sources.some(s=>s.image==='assets/sb-21.webp'),'photo D must be available');
assert(get('sb:20:1').activity.frames.some(f=>f.page===21),'native matching must render photo D');
assert(get('sb:22:2A').activity.frames.some(f=>f.page===23),'native matching must render photos B and C');
assert.equal(get('sb:22:2B').activity.left.length,3,'work — 1 is a printed example');
for(const id of ['sb:24:2B','sb:24:2C','sb:24:2D'])assert.deepEqual(Array.from(get(id).e.mediaPaths),['web/199.mp4']);
assert.deepEqual(Array.from(get('sb:22:2D').e.mediaPaths),['web/072.mp3']);
let count=0,auto=0,fields=0;
for(const[b,book]of Object.entries(w.COURSE.books))for(const page of book.pages.filter(p=>p.lesson.startsWith('2')))for(const e of page.exercises){
 const r=get(`${b}:${page.page}:${e.label}`);count++;assert(r.e.text.length>10,`${r.id}: missing instruction`);
 const m=r.model;if(m){assert(m.auto||r.id==='sb:26:2B',`${r.id}: unresolved grading`);if(m.auto)auto++;for(const f of m.fields||[]){fields++;assert(f.n,`${r.id}: unnumbered gap`);assert(f.answer!==undefined||r.id==='sb:26:2B',`${r.id}: unkeyed gap`);const[x,y,width,height]=f.box;assert(x>=0&&y>=0&&x+width<=595&&y+height<=842,`${r.id}: geometry`);}}
 else if(r.spec.mode==='auto')auto++;
 for(const q of m?.items||r.spec.items){assert(I.matches(I.variants(q.answer)[0],q.answer,q.literal));assert(!I.matches('',q.answer,q.literal));assert(!I.matches('wrong answer 9387',q.answer,q.literal));}
 for(const q of r.spec.items)if(q.kind==='choice')assert(q.options.some(o=>I.matches(o.value,q.answer,q.literal)),`${r.id} ${q.n}: correct option absent`);
 for(const path of r.e.mediaPaths||[])assert(fs.existsSync('speakout-a1-active-teach/'+path),`${r.id}: media absent`);
 for(const s of w.EXERCISE_SOURCES[r.id].sources){assert(fs.existsSync('speakout-a1-active-teach/'+s.image));const[x,y,width,height]=s.box;assert(x>=0&&y>=0&&x+width<=1.001&&y+height<=1.001,`${r.id}: source crop`);}
}
assert.equal(count,138);console.log(`PASS: ${count} Unit 2 definitions; ${auto} auto-graded tasks; ${fields} real gaps; source contexts, literal forms, examples, media and answer variants.`);
