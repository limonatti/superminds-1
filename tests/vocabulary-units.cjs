const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={document:{readyState:"loading",addEventListener(){}},URLSearchParams,localStorage:{getItem:()=>null,setItem(){}},SM:{listCourses:async()=>({courses:[],units:[]})},setTimeout,console};ctx.window=ctx;vm.createContext(ctx);
for(const f of ['course-words.js','speakout-words.js','words.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
(async()=>{
 await ctx.SM_ready;
 const clean=x=>JSON.parse(JSON.stringify(x)), allUnitIds=new Set();let count=0;
 for(const [course,units] of Object.entries(ctx.SM_COURSE_DATA)){
  if(!units.length)continue;
  const ids=new Set();
  for(const u of units){
   assert(!ids.has(u.id),`${course}: duplicate unit ${u.id}`);ids.add(u.id);
   assert(!allUnitIds.has(u.id),`cross-course collision ${u.id}`);allUnitIds.add(u.id);
   ctx.SM_useCourse('sm1');
   const selection=ctx.SM_resolveVocabularyLink(`?course=${course}&unit=${u.id}`);
   assert.equal(selection.error,null);assert.equal(ctx.SM_COURSE.id,course);assert.deepEqual(clean(selection.unitIds),[u.id]);
   const actual=ctx.SM_ALL_WORDS.filter(w=>w.unitId===u.id);
   assert.deepEqual(clean(actual.map(w=>[w.en,w.ru])),clean(u.words.map(w=>[w.en,w.ru])));
   assert.equal(new Set(actual.map(w=>w.id)).size,actual.length);
   count++;
  }
 }
 ctx.SM_useCourse('sm1');assert.deepEqual(clean(ctx.SM_resolveVocabularyLink('?unit=outc-u5').unitIds),['outc-u5']);assert.equal(ctx.SM_COURSE.id,'outcomes-beginner');
 assert.deepEqual(clean(ctx.SM_resolveVocabularyLink('?course=outcomes-beginner&unit=5').unitIds),['outc-u5']);
 for(const query of ['?course=outcomes-beginner&unit=sel-u5','?course=outcomes-beginner&unit=outc-u99','?course=missing&unit=outc-u5','?course=outcomes-beginner&units=outc-u5,outc-u99']){
  const bad=ctx.SM_resolveVocabularyLink(query);assert(bad.error);assert.deepEqual(clean(bad.unitIds),[]);
 }
 const source=JSON.parse(fs.readFileSync('tests/fixtures/outcomes-vocabulary-units.json'));
 const words=JSON.parse(fs.readFileSync('outcomes-beginner-active-teach/assets/words.json'));
 assert.deepEqual(clean(ctx.COURSE_WORDS['outcomes-beginner'].units),words.units);
 for(const u of source.units){
  const actual=words.units.find(x=>x.n===u.n);
  assert.deepEqual(actual.words.filter(w=>w[2]!=='c').map(w=>w[0]),u.headwords,`Unit ${u.n}: Vocabulary Builder membership/order`);
 }
 const u5=words.units.find(u=>u.n===5);const byEn=Object.fromEntries(u5.words);
 assert.equal(byEn.single,'билет в одну сторону');assert.equal(byEn.return,'билет туда и обратно');
 for(const word of ['change trains','pay by card','the Old Town','first class','second class','wait for the bus','enter your number'])assert(byEn[word]);
 // Every added chunk has an explicit Student's Book page; no extra topic words.
 assert.deepEqual(u5.words.filter(w=>w[2]==='c').map(w=>w[0]),u5.practiceSources.flatMap(s=>s.phrases));
 console.log(`Vocabulary: ${count} course/unit routes isolated; 12 Outcomes source lists verified; invalid links fail closed.`);
})().catch(e=>{console.error(e);process.exitCode=1});
