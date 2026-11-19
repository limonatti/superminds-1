const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const base = path.join(root, 'focus-4-active-teach');
const read = file => JSON.parse(fs.readFileSync(path.join(base, file), 'utf8').split('=').slice(1).join('=').trim().replace(/;$/, ''));
const D = read('assets/course.js');
const S = read('assets/exercise-sources.js');
const M = require(path.join(base, 'assets/marking.js'));
const H = require('../focus-4-homework.js');
H.setData(D);
global.Focus4Marking = M;
const pages = new Map(D.pages.map(p => [p.id, p]));
const exercises = D.pages.flatMap(p => p.exercises);
assert.equal(D.id, 'focus-4');
assert.equal(D.units.length, 9);
assert.equal(pages.size, D.pages.length);
assert.equal(new Set(exercises.map(e => e.id)).size, exercises.length);
for (let u = 1; u <= 8; u++) {
  for (const book of ['sb', 'wb']) {
    for (let p = 4 + (u - 1) * 16; p < 4 + u * 16; p++) assert.equal(pages.get(book + '-' + p)?.unit, u);
    assert(D.pages.some(p => p.unit === u && p.book === book && p.exercises.length), book + ' unit ' + u);
  }
  for (const p of [u * 2, u * 2 + 1]) assert.equal(pages.get('ws-' + p)?.unit, u);
}
const required = new Set(D.pages.map(p => p.image));
for (const e of exercises) {
  assert(S[e.id]?.sources.length, e.id + ' has source');
  for (const source of S[e.id].sources) {
    required.add(source.image);
    const [x, y, w, h] = source.box;
    assert(source.box.every(Number.isFinite) && x >= 0 && y >= 0 && w > 0 && h > 0 && x + w <= 1.001 && y + h <= 1.001, e.id + ' crop');
  }
  assert(e.responseMode === 'oral' || e.answerSpec.length || e.responseFields.length, e.id + ' accepts a response');
  assert(!(e.answerSpec.length && e.responseFields), e.id + ' has a single answer schema');
  if(e.interaction?.type === 'choices') {
    assert.equal(e.interaction.rows.length, (e.answerSpec.length ? e.answerSpec : e.responseFields).length);
    e.interaction.rows.forEach((r,i) => {
      assert(r.options.length >= 2, e.id + ' has printed alternatives');
      if(e.answerSpec[i]) assert(r.options.some(o => M.checkField(o.value,e.answerSpec[i])), e.id + ' includes correct printed option');
    });
  }
  for (const field of e.answerSpec) {
    assert(!M.checkField('', field));
    assert(!M.checkField('incorrect zxq', field));
    for (const answer of field.accepted) assert(M.checkField(answer, field));
  }
}
for (const t of D.tracks.sb) required.add('media/sb-' + t + '.mp3');
for (const r of D.resources) required.add(r.path);
for (const p of D.pages) for (const t of p.tracks) assert(D.tracks.sb.includes(t), p.id + ' audio ' + t);
assert.deepEqual(D.tracks.wb, ['1.08', '1.24', '2.05', '2.20', '2.37', '3.05', '3.17', '3.36']);

// Source-verified Workbook samples and immutable homework submission across books.
const E = new Map(exercises.map(e => [e.id, e]));
assert.match(fs.readFileSync(path.join(base,'index.html'),'utf8'), /Focus <span>4<\/span>/);
for(const id of ['wb-6-4','wb-6-5','wb-68-2']) assert(E.has(id), id+' printed heading recovered');
assert(E.get('sb-37-4').answerSpec.length,'printed comprehension keys are graded');
const coverage=JSON.parse(fs.readFileSync(path.join(base,'audit/key-coverage.json'),'utf8'));
assert.equal(coverage.workbook.length,598,'complete printed Workbook catalogue');
assert.equal(coverage.workbook.filter(r=>r.automatic).length,589);
assert.equal(coverage.workbook.filter(r=>!r.automatic).length,9,'only explicit Students’ own answers are manual');
assert.deepEqual(coverage.unresolvedExtractedKeys,[]);
for(const row of coverage.workbook)assert.equal(!!E.get(row.exercise)?.answerSpec.length,row.automatic,row.record);
assert(D.pages.filter(p=>p.book==='ws').flatMap(p=>p.exercises).every(e=>e.answerSpec.length));
function accepts(id,label,yes,no=[]){const f=E.get(id)?.answerSpec.find(f=>f.label===label);assert(f,id+' '+label);for(const v of yes)assert(M.checkField(v,f),id+' accepts '+v);for(const v of no)assert(!M.checkField(v,f),id+' rejects '+v);}
accepts('ws-3-2','2',['lenient'],['L E N I E N T (T)','strict']);
accepts('ws-7-4','4',['multi-storey','multi storey'],['u i o e']);
accepts('ws-17-4','7',['resemble'],['esemble']);
accepts('wb-54-5','1',['would you?'],['do you?','do you? would you?']);
accepts('wb-85-8','1',['with'],['on','tampered on with']);
accepts('wb-118-6','5',['was','were'],['is']);
accepts('wb-110-3','a',['7'],['6']);
accepts('wb-123-4','Beginning B',['5'],['6']);
accepts('wb-123-4','Ending B',['6'],['5']);
accepts('wb-30-3','Пары предложений',['G E; B F; H D'],['F B; H D; G E','B F; B F; G E']);
accepts('sb-8-4','1',['C'],['E']);
accepts('sb-90-5','2',['b; a','a, b'],['a','b','a; a']);
accepts('sb-87-2','1',['?','not confirmed'],['!!!','✓']);
accepts('sb-71-10','export · verb',['exPORT'],['EXport','export']);
accepts('sb-160-1','1',['I need to fill out an application form','we need to fill out an application form'],['I','we']);
accepts('wb-178-1','9',['that camera were less expensive','that camera was cheaper'],['less expensive','wasn’t']);
const punct=E.get('wb-111-8').answerSpec[0];assert.equal(punct.kind,'punctuation');
assert(M.checkField(punct.accepted[0].replace(/‘|’/g,"'"),punct));
assert(M.checkField(punct.accepted[0].replace(/‘/g,'“').replace(/’(?=[ ,.!?]|$)/g,'”'),punct));
assert(!M.checkField(punct.accepted[0].replace(/[.,!?‘’]/g,''),punct),'punctuation is the subject of this task');
assert(!M.checkField(punct.accepted[0].toLowerCase(),punct),'punctuation exercise checks capitals');
const changed=E.get('ws-3-2'),old={answerVersion:'previous-version',values:['old answer'],reflection:'my note',fieldLabels:['2']};
const restored=M.saved(changed,old);assert.deepEqual(restored.values,[]);assert.equal(restored.previous[0].values[0],'old answer');assert.equal(restored.previous[0].reflection,'my note');
assert(!M.canReveal(changed,{...old,score:{correct:1,total:1}}),'old grading cannot reveal updated keys');
assert.equal(E.get('sb-4-1').interaction.type,'choices','collocations can be matched by clicking');
assert.equal(E.get('wb-4-1').interaction.type,'choices','Workbook alternatives can be clicked');
for(let u=1;u<=8;u++) for(const b of ['sb','wb']) assert(D.pages.some(p=>p.book===b&&p.unit===u&&p.exercises.some(e=>e.interaction?.type==='choices')), b+' unit '+u+' interactive choices');
assert.deepEqual(E.get('wb-4-1').answerSpec.map(f => f.accepted[0]), ['go', 'person', 'further', 'prove', 'course']);
assert.deepEqual(E.get('wb-7-3').answerSpec.map(f => f.accepted[0]), ['back', 'escape', 'heart', 'bear', 'draw', 'bell']);
const auto = E.get('wb-4-1');
const open = exercises.find(e => e.id.startsWith('sb-') && !e.answerSpec.length && e.responseFields?.length);
const oral = exercises.find(e => e.responseMode === 'oral');
assert(open && oral);
const responses = Object.fromEntries([auto, open, oral].map(e => [e.id, {
  values: e.answerSpec.length ? e.answerSpec.map(f => f.accepted[0]) : (e.responseFields || []).map(() => 'My response'),
  answerVersion: e.answerVersion,
  ...(e.answerSpec.length ? {score: {correct: e.answerSpec.length, total: e.answerSpec.length}} : {}),
  ...(e.responseMode === 'oral' ? {completed: true} : {})
}]));
const hw = {id: 'qa-focus4', course: 'focus-4', note: H.makeNote([auto.id, open.id, oral.id], '', ''), status: 'new'};
assert(require('../focus-3-homework.js').ids(hw).length === 0);
assert.throws(() => H.snapshot(hw, {}));
const snapshot = H.snapshot(hw, responses);
responses[auto.id].values[0] = 'changed';
assert.equal(snapshot.exercises[auto.id].values[0], 'go');
assert.match(H.renderAssignment({...hw, status: 'submitted'}, {[H.snapshotKey(hw.id)]: snapshot}), /копия сданной работы/);
const homeworkPage = fs.readFileSync(path.join(root, 'homework.html'), 'utf8');
const dispatch = homeworkPage.match(/const bookHW=([^;]+);/)[1];
assert.equal(vm.runInNewContext(dispatch, {x: {course: 'focus-4'}, Focus4HW: H}), H);
assert.match(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), /hub:"focus-4-active-teach\/index.html"/);
assert.match(fs.readFileSync(path.join(root, 'room.html'), 'utf8'), /"focus-4":\{path:"focus-4-active-teach"/);

const missing = [...required].filter(file => !fs.existsSync(path.join(base, file)));
if (process.argv.includes('--metadata-only')) {
  console.log(`PASS metadata and homework: ${D.pages.length} pages, ${exercises.length} tasks. Asset verification skipped; ${missing.length} files missing.`);
} else {
  assert.equal(missing.length, 0, 'Preparation incomplete: ' + missing.length + ' missing files, including ' + missing.slice(0, 5).join(', '));
  for (const file of required) assert(fs.statSync(path.join(base, file)).size < 100 * 1024 * 1024, file + ' GitHub size limit');
  console.log(`PASS Focus 4: ${D.pages.length} pages, ${exercises.length} tasks, all media/resources present and homework snapshots verified.`);
}
