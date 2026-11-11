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
assert.match(w.FOCUS.videoTranscripts['111'].text,/M: So, every single week,/);
const plans=ex.get('sb-123-4');
assert(M.checkField('Senthan; Ini',plans.answerSpec[2]));assert(M.checkField('Ini; Senthan',plans.answerSpec[2]));
for(const v of ['Senthan','Ini','Senthan; Senthan','Senthan; Ini; Peter'])assert(!M.checkField(v,plans.answerSpec[2]),v);
assert(M.checkField('Peter',plans.answerSpec[3]));assert(!M.checkField('Senthan',plans.answerSpec[3]));
assert.match(plans.activity.fields[2].prompt,/both/);assert.match(plans.activity.fields[3].prompt,/explicitly/);
assert.match(ex.get('sb-120-4').activity.fields[5].prompt,/between £500 and £1,000/);
// Direct recording review: unsupported claims must not be graded as B/C.
const school=ex.get('sb-116-2'),schoolKeys=['C','C','C','C','B','NG','NG','B'];
schoolKeys.forEach((key,i)=>{
  assert(M.checkField(key,school.answerSpec[i]));
  for(const other of ['B','C','NG'].filter(v=>v!==key))assert(!M.checkField(other,school.answerSpec[i]));
  assert(school.activity.fields[i].options.some(o=>o.value===key));
  assert(school.activity.fields[i].prompt);
});
assert.match(school.key,/6 NG\n7 NG/);
assert.equal(M.saved(school,{answerVersion:'0d07a43ef400',values:['C','C','C','C','B','B','C','B']}).previous.length,1);
assert.match(w.FOCUS.videoTranscripts['116'].text,/Na = Neave/);
assert.match(ex.get('sb-120-4').activity.fields[3].prompt,/Six giraffes can fit/);
const verified={
  'sb-116-5':['village','secondary','five','fifty','twelve','two','Maths'],
  'sb-120-3':['massive','beautiful','cute'],
  'sb-120-4':['F','F','T','T','T','T','F','F'],
  'sb-120-5':['guests','attractions','museums','sights','guide','visit']
};
for(const [id,answers] of Object.entries(verified)){
  const e=ex.get(id);assert.equal(e.answerSpec.length,answers.length);
  answers.forEach((v,i)=>{assert(M.checkField(v,e.answerSpec[i]));assert(e.activity.fields[i].prompt);});
}
assert.match(ex.get('sb-116-5').activity.instruction,/00:12–02:16/);
assert.match(ex.get('sb-120-3').activity.instruction,/01:29–02:59/);
assert.match(ex.get('sb-120-5').activity.instruction,/02:59–03:22/);
const direct=JSON.parse(fs.readFileSync(path.join(base,'audit/videos-20-28-direct.json'),'utf8'));
assert.equal(direct.videos.reduce((n,v)=>n+v.exercises.length,0),14);
assert.equal(direct.videos.reduce((n,v)=>n+v.fields.length,0),33);
for(const v of direct.videos)for(const f of v.fields){
  const spec=ex.get(f.exercise).answerSpec.find(s=>s.label===f.field);
  for(const a of Array.isArray(f.answer)?f.answer:[f.answer])assert(M.checkField(a,spec),`${f.exercise}.${f.field}`);
  assert(f.time&&f.evidence);
}
for(const word of ['sights','sites'])assert(M.checkField(word,ex.get('sb-120-5').answerSpec[3]));
assert.equal(M.saved(plans,{answerVersion:'a452f885de27',values:['Asia','Badminton','Ini','Senthan']}).previous.length,1);
console.log('PASS: 51 video bindings, distinct audio/video versions, complete multi-answer grading, clarified video facts, saved-answer migration.');
