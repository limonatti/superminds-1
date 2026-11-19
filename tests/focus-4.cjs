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
assert.equal(E.get('sb-37-4').marking.mode,'open','free comprehension answers need teacher review');
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
