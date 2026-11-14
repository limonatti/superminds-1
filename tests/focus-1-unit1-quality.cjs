const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=path.join(__dirname,'../focus-1-active-teach'),D=JSON.parse(fs.readFileSync(path.join(base,'assets/course.js'),'utf8').split('=').slice(1).join('=').trim().replace(/;$/,'')),M=require(path.join(base,'assets/marking.js'));
const E=Object.fromEntries(D.pages.flatMap(p=>p.exercises).map(e=>[e.id,e])),e=E['sb-13-6'];
// Independent fixture: SB13 ex6, printed example1=spend, eight teacher red answers.
assert.equal(e.wordStore,null);assert.deepEqual(e.answerSpec.map(f=>f.label),['2','3','4','5','6','7','8','9']);
const expected=['visit','play','watch','go','go','have','read','play'];
expected.forEach((v,i)=>{assert(M.checkField(v,e.answerSpec[i]));assert(M.checkField(' '+v.toUpperCase()+' ',e.answerSpec[i]));assert(!M.checkField('',e.answerSpec[i]));assert(!M.checkField('wrong',e.answerSpec[i]))});
assert.deepEqual(e.activity.bank,['go','have','play','read','spend','visit','watch']);assert.equal(e.marking.mode,'mixed');
const old={answerVersion:'old-key',values:['go','play','have'],score:{correct:3,total:3},fieldLabels:['1','2','3']};
const restored=M.saved(e,old);assert.deepEqual(restored.values,[]);assert.deepEqual(restored.previous[0].values,old.values);assert.deepEqual(old.score,{correct:3,total:3});
assert.equal(E['sb-12-2'].activity.cards.length,20);assert.equal(E['sb-12-2'].answerSpec.length,0);assert.equal(E['sb-13-8'].activity.cards.length,3);
assert.deepEqual(E['sb-13-3'].answerSpec.map(f=>f.accepted[0]),['go','play','have']);assert.deepEqual(E['sb-13-5'].answerSpec.map(f=>f.label),['2','3','4']);assert.deepEqual(E['sb-13-7'].answerSpec.map(f=>f.label),['2','3','4a','4b','5']);
console.log('PASS: exact SB12–13 fixtures, eight real gaps, printed examples excluded, source bank, personal cards, legacy values preserved.');
