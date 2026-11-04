const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};
for(const name of ['course-web','exercise-text','interactive','inline-data','inline','answer-map','activities-data','activities'])vm.runInNewContext(fs.readFileSync(`speakout-a1-active-teach/assets/${name}.js`,'utf8'),context);
const w=context.window,models={},units=new Set(),counts={bank:0,match:0,auto:0};
for(const[book,data]of Object.entries(w.COURSE.books))for(const page of data.pages)for(const exercise of page.exercises){
 const id=`${book}:${page.page}:${exercise.label}`;exercise.text||=w.SPEAKOUT_EXERCISE_TEXT[id];
 const key=w.SpeakoutActivities.key(id,w.COURSE.keys[`${book}|${page.lesson}|${exercise.label}`]);
 const m=w.SpeakoutActivities.model(id,w.SpeakoutInteractive.spec(exercise,key));if(!m)continue;
 models[id]=m;counts[m.kind]++;if(m.auto||m.inline?.auto)counts.auto++;if(/^[1-8]/.test(page.lesson))units.add(book+page.lesson[0]);
 const elements=[...(m.inline?.fields||[]),...(m.bank||[]),...(m.left||[]),...(m.right||[]),...(m.gaps||[])];
 for(const node of elements)if(node.box){assert.ok(node.box.every(Number.isFinite),`${id}: finite coordinates`);assert.ok(node.box[2]>0&&node.box[3]>0,`${id}: positive targets`);assert.ok(node.box[0]>=0&&node.box[1]>=0&&node.box[0]+node.box[2]<596&&node.box[1]+node.box[3]<843,`${id}: targets within page`)}
 for(const side of [m.left,m.right,m.inline?.fields].filter(Boolean))assert.equal(new Set(side.map(n=>n.id)).size,side.length,`${id}: distinct controls`);
 if(m.auto||m.inline?.auto)assert.ok((m.inline?.items||m.items).length,`${id}: nonempty grading`);
}
assert.equal(units.size,16);assert.ok(counts.bank>=65);assert.ok(counts.match>=80);
assert.equal(models['wb:17:12A'].kind,'match','Family pictures must not use the gaps of 12B');
assert.equal(models['wb:17:12A'].left.length,4);assert.equal(models['wb:17:12A'].right.length,7,'Keep the three printed distractors');
assert.equal(models['wb:9:4B'].inline.fields.length,8);assert.equal(models['sb:74:4A'].inline.fields.length,5);
assert.equal(models['sb:6:2A'].inline.fields.length,10,'Leave the printed zero example alone');
assert.equal(models['wb:59:11'].inline.fields[0].answer,'last','Correct review key, not past-tense verbs');
assert.equal(models['sb:29:5A'].items.find(q=>q.n==='2').answer,'/s/');
assert.ok(models['sb:36:2B'].right.every(n=>!n.box||n.box[1]>300),'Question numbers cannot point to the page heading');
assert.equal(models['sb:36:2B'].gaps.length,5,'Both short answers and pair connections');
assert.equal(models['sb:59:3C'].frames[0].page,58);
assert.equal(models['sb:14:3A'].right.find(n=>n.id==='A').page,14);
assert.equal(models['sb:14:3A'].right.find(n=>n.id==='I').page,15);
assert.ok(models['wb:67:12'].inline.auto);assert.equal(models['wb:67:12'].bank.length,10,'Keep the extra map words');
console.log('PASS activity geometry, keyed fixtures, complete tables, distractors, examples, all units:',counts);
