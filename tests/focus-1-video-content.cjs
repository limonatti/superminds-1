/* Independent video/content regressions: no network, accounts or playback. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),base=path.join(root,'focus-1-active-teach'),w={};
for(const file of ['course.js','videos.js'])vm.runInNewContext(fs.readFileSync(path.join(base,'assets',file),'utf8'),{window:w});
const videos=w.FOCUS_VIDEOS,ex=new Map(w.FOCUS.pages.flatMap(p=>p.exercises.map(e=>[e.id,e]))),M=require(path.join(base,'assets/marking.js'));
assert.equal(videos.length,51);assert.equal(new Set(videos.map(v=>v.number)).size,37);
for(const v of videos){assert(v.exerciseIds.length);for(const id of v.exerciseIds)assert(ex.has(id),`${v.number}: missing ${id}`);}
const attached=id=>videos.filter(v=>v.exerciseIds.includes(id)).map(v=>v.number);
assert(!attached('sb-67-3').includes(24),'Audio 2.45 has different prices and tours from video 24');
assert(attached('sb-67-6').includes(24));assert.equal(attached('sb-19-1').length,0);assert(attached('sb-19-2').includes(5));
assert(!attached('sb-91-4').includes(31));assert(attached('sb-91-4').includes(32));
assert(videos.find(v=>v.number===2).youtubeId==='51ltEBMwcc8');
const plans=ex.get('sb-123-4');
assert(M.checkField('Senthan; Ini',plans.answerSpec[2]));assert(M.checkField('Ini; Senthan',plans.answerSpec[2]));
for(const v of ['Senthan','Ini','Senthan; Senthan','Senthan; Ini; Peter'])assert(!M.checkField(v,plans.answerSpec[2]),v);
assert(M.checkField('Peter',plans.answerSpec[3]));assert(!M.checkField('Senthan',plans.answerSpec[3]));
assert.match(plans.activity.fields[2].prompt,/both/);assert.match(plans.activity.fields[3].prompt,/explicitly/);
assert.match(ex.get('sb-120-4').activity.fields[5].prompt,/between £500 and £1,000/);
for(const word of ['sights','sites'])assert(M.checkField(word,ex.get('sb-120-5').answerSpec[3]));
assert.equal(M.saved(plans,{answerVersion:'a452f885de27',values:['Asia','Badminton','Ini','Senthan']}).previous.length,1);
console.log('PASS: 51 video bindings, distinct audio/video versions, complete multi-answer grading, clarified video facts, saved-answer migration.');
