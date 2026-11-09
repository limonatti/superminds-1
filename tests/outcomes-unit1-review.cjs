const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const M=require('../outcomes-beginner-active-teach/assets/answer-migration.js');
const G=require('../outcomes-beginner-active-teach/assets/grader.js');
const c={window:{}};for(const f of ['exercises','course','exercise-sources'])vm.runInNewContext(fs.readFileSync('outcomes-beginner-active-teach/assets/'+f+'.js','utf8'),c);
const tasks=JSON.parse(JSON.stringify(Object.values(c.window.OUTCOMES_EXERCISES).flat()));const get=id=>tasks.find(e=>e.id===id);
const old={values:['son','husband','doctor; teacher','sister; friend'],done:true,grade:{correct:4,total:4}};
const migrated=M.migrate(get('sb-12-66-71'),old);
assert.deepEqual(migrated.values,['son','husband','doctor','teacher','sister','friend']);assert.equal(migrated.grade,null);assert.equal(migrated.done,false);
assert.deepEqual(migrated.answerHistory[0].values,old.values);assert.equal(old.done,true);assert.deepEqual(old.values,['son','husband','doctor; teacher','sister; friend']);
assert.equal(M.migrate(get('sb-12-66-71'),migrated),migrated,'Migration must be idempotent');
assert.deepEqual(M.migrate(get('wb-6-59-754'),{values:['husband','teacher, daughter','brother, friend','mother, father']}).values,['teacher','daughter','brother','friend','mother','father']);
assert.equal(G.check(get('wb-6-59-754').check,['daughter','teacher','brother','friend','mother','father']).complete,false,'The source sentence requires teacher before daughter');
assert.deepEqual(M.migrate(get('sb-g-116-66-224'),{values:['I','My','you','your','he','their','our','they','my; It’s','My; He’s','She; our','Her; my']}).values,['My','you','your','he','their','our','they','my','It’s','My','He’s','She','our','Her','my']);
assert.deepEqual(M.migrate(get('wb-5-74-500'),{values:['3,5,6,9,11,12']}).values,['5, 6, 9, 11, 12']);
const pron=get('sb-g-116-513-70');assert.equal(G.checkField(pron.check.items[0],"'s he"),'correct');assert.equal(G.checkField(pron.check.items[0],"Who's he?"),'incorrect');
const oldQuestion={values:["Who's he?"],done:true};const newQuestion=M.migrate(pron,oldQuestion);assert.equal(newQuestion.values[0],'');assert.equal(newQuestion.answerHistory[0].values[0],"Who's he?");
const u=tasks.filter(e=>e.unit===1);assert.equal(u.length,114);
for(const e of u){
 assert(Array.isArray(e.audioTracks),e.id+' must have an explicit track mapping');
 for(const n of e.audioTracks){const m=c.window.OUTCOMES.media.find(m=>m.book===e.book&&String(m.track)===String(n));assert(m,e.id+' recording '+n);assert(fs.existsSync('outcomes-beginner-active-teach/'+m.path));assert(m.pages.includes(e.page));}
 if(e.responseMode==='oral')assert.notEqual(e.check.mode,'items');
 assert(c.window.EXERCISE_SOURCES[e.id].sources.length,e.id+' source');
}
assert.deepEqual(JSON.parse(JSON.stringify(get('sb-13-66-467').audioTracks)),[10]);
assert.equal(get('sb-13-64-683').check.items.length,16);
assert.equal(get('sb-12-501-429').check.items.length,8);
assert.equal(get('sb-12-62-650').responseMode,'oral');
assert(c.window.EXERCISE_SOURCES['sb-14-503-70'].sources.some(s=>s.context&&s.page===11&&s.box[3]>.5));
assert(c.window.EXERCISE_SOURCES['sb-g-115-513-443'].sources.some(s=>s.page===116));
console.log('Unit 1: 114 tasks; exact audio, source context, original examples, gap-only grading and lossless/idempotent answer migrations passed.');
