const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
global.SolutionsMarking=require('../solutions-int-active-teach/assets/marking.js');
const H=require('../solutions-homework.js'),ctx={window:{}};vm.runInNewContext(fs.readFileSync('solutions-int-active-teach/assets/course.js','utf8'),ctx);const catalog=H.setData(ctx.window.SOLUTIONS);
const note=H.makeNote(['sb-32-7','wb-32-6','wb-4-5','sb-32-7'],'2026-11-08','<Keep my comment>');const hw={id:'test',course:'solutions-int',note,status:'new'};
assert.equal(H.ids(hw).length,3);assert.deepEqual(H.ids({course:'other',note}),[]);assert.deepEqual(H.ids({course:'solutions-int',note:'old comment'}),[]);assert.throws(()=>H.makeNote([],null,''));assert.throws(()=>H.makeNote(['sb-999-1'],null,''));
assert.match(H.link('sb-32-7','test'),/ex=sb-32-7&hw=test/);
const responses={};for(const id of H.ids(hw)){const e=catalog.get(id);responses[id]={values:e.answers.length?[...e.answers]:['My written answer'],answerVersion:e.answerVersion,score:e.answers.length?{correct:e.answers.length,total:e.answers.length}:undefined,reflection:e.marking.mode==='mixed'?'My explanation':''};assert.equal(H.readiness(id,responses[id]),'');}
const r=responses['sb-32-7'];delete r.score;assert.match(H.readiness('sb-32-7',r),/Проверить/);assert.throws(()=>H.snapshot(hw,responses));r.score={correct:5,total:6};r.values[0]='wrong <script>';const shot=H.snapshot(hw,responses);assert.equal(shot.exercises['sb-32-7'].values[0],'wrong <script>');
responses[H.snapshotKey(hw.id)]=shot;r.values[0]='can';hw.status='submitted';let html=H.renderAssignment(hw,responses);assert(html.includes('wrong &lt;script&gt;'));assert(html.includes('✕ Ошибка'));assert(html.includes('копия сданной работы'));assert(html.includes('My explanation'));
hw.status='rework';html=H.renderAssignment(hw,responses);assert(!html.includes('wrong &lt;script&gt;'));assert(html.includes('последние сохранённые ответы'));
const legacy={values:['old'],answerVersion:'old',score:{correct:1,total:1}};assert(!H.renderAnswer('sb-32-7',legacy).includes('✓ Верно'));
console.log('Solutions homework: selection, stable deep links, old-note compatibility, readiness, immutable submission, draft/submitted reports and escaped answers passed.');
