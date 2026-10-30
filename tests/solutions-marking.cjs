const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const M=require('../solutions-int-active-teach/assets/marking.js');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('solutions-int-active-teach/assets/course.js','utf8'),ctx);
const D=ctx.window.SOLUTIONS,ex=new Map(D.pages.flatMap(p=>p.exercises.map(e=>[e.id,e])));
let fields=0,variants=0;const attemptIds=new Set();
for(const e of ex.values()){
 assert.notEqual(e.marking.mode,'pending',e.id);assert.equal(!!e.answerSpec?.length,['automatic','mixed'].includes(e.marking.mode),e.id);
 assert(e.answerVersion);assert.equal(e.answerSpec?.length||0,e.answers.length);
 for(const f of e.answerSpec||[]){
  fields++;assert(f.label);assert(!M.checkField('',f),e.id);assert(!M.checkField('zzzz invalid answer',f),e.id);
  const index=M.attemptIndex(e.id,f.label);assert(!attemptIds.has(index),'attempt collision '+e.id);attemptIds.add(index);
  for(const value of f.accepted||[f.members.map(m=>m[0]).join('; ')]){variants++;assert(M.checkField(value,f),e.id+' '+f.label+' '+value);}
 }
}
const field=(id,label)=>ex.get(id).answerSpec.find(f=>f.label===String(label));
assert(M.checkField('WILL NOT', {accepted:["won't"]}));assert(M.checkField('I would rather', {accepted:["I'd rather"]}));
assert(M.checkField('He has already seen it',{accepted:["He's already seen it"]}));
assert(!M.checkField('He is already seen it',{accepted:["He's already seen it"]}));
assert(M.checkField('Is your favourite subject maths? they asked her.',{accepted:["‘Is your favourite subject maths?’ they asked her."]}));
assert(!M.checkField('students',{accepted:["students'"]}));
assert(!M.checkField('127',{accepted:['1.27']}));assert(!M.checkField('15',{accepted:['1/5']}));
assert(!M.checkField('40°C',{accepted:['−40°C']}));assert(M.checkField('-40°C',{accepted:['−40°C']}));
assert(!M.checkField('none',{accepted:['0']}));assert(M.checkField('0',{accepted:['no article']}));assert(!M.checkField('',{accepted:['no article']}));
assert(M.checkField('4,500',{accepted:['4500']}));assert(M.checkField('true',{accepted:['T']}));assert(M.checkField('not given',{accepted:['NG']}));
assert(M.checkField('correct',{accepted:['✓']}));assert(!M.checkField('',{accepted:['✓']}));
const set={kind:'set',members:[['bus','coach'],['train'],['taxi']]};
assert(M.checkField('taxi; train; coach',set));assert(!M.checkField('bus; coach; train',set));assert(!M.checkField('bus; train; taxi; extra',set));assert(!M.checkField('bus; train',set));
assert(M.checkField('train; taxi',{...set,minimum:2}));assert(!M.checkField('train; train',{...set,minimum:2}));
assert(M.checkField('could become',field('sb-32-7',4)));assert(!M.checkField('could',field('sb-32-7',4)));
assert(M.checkField('learned, bought',field('sb-10-5',2)));assert(!M.checkField('had learned',field('sb-10-5',2)));
assert(M.checkField('ideal; idealistic',field('sb-15-5',6)));assert(!M.checkField('idealistic',field('sb-15-5',6)));
assert(M.checkField('2 million',field('wb-32-3',1)));assert(!M.checkField('12 million',field('wb-32-3',1)));
assert(M.checkField('said',field('sb-141-2',6)));assert(!M.checkField('say',field('sb-141-2',6)));
assert.equal(ex.get('sb-127-2').answerSpec.length,10);assert.equal(ex.get('sb-127-3').answerSpec.length,12);
assert.equal(ex.get('wb-68-2').answerSpec.length,6);assert.equal(ex.get('wb-68-2').answers[4],'Speaking');
assert.equal(ex.get('wb-73-9').answerSpec.length,6);assert.equal(ex.get('wb-32-6').marking.mode,'mixed');
for(const id of ['sb-143-11','wb-126-1','sb-31-2','sb-31-3','sb-31-4','sb-120-2-b2'])assert(!ex.has(id));
for(const id of ['wb-121-3','sb-123-1-b2','sb-14-2'])assert(ex.get(id).answerSpec.length);
let old={values:['My old homework'],reflection:'My explanation'};const snapshot=JSON.stringify(old);
let migrated=M.saved(ex.get('sb-127-2'),old);assert.equal(migrated.values.length,0);assert.equal(migrated.previous[0].values[0],old.values[0]);assert.equal(JSON.stringify(old),snapshot);
let record={values:['works'],answerVersion:ex.get('sb-127-2').answerVersion,previousAnswers:migrated.previous};
assert.equal(M.saved(ex.get('sb-127-2'),record).values[0],'works');assert.equal(M.saved(ex.get('sb-127-2'),record).previous.length,1);
assert.equal(M.saved(ex.get('wb-4-1'),{values:['statue']}).values[0],'statue');
const compiler=fs.readFileSync('solutions-int-active-teach/compile-marking.py','utf8');assert(compiler.includes('geometry-overrides.json'));
console.log(`Solutions marking: ${fields} fields, ${variants} accepted variants; fractions, decimals, contractions, sets, source corrections, stable attempt IDs and legacy homework passed.`);
const teacher=fs.readFileSync('teacher-class.html','utf8');const teacherCode=teacher.slice(teacher.indexOf('function solutionsResponses(data){'),teacher.indexOf('const PAGE_COURSES'));
const t={esc:s=>String(s).replace(/</g,'&lt;'),data:{__coursework:{'solutions-int':{'sb-127-2':{book:'sb',page:127,unit:'extra',values:['works'],fieldLabels:['1a'],reflection:'<my explanation>',score:{correct:1,total:10},previousAnswers:[{values:['my previous answer']}]}}}}};
vm.runInNewContext(teacherCode+';output=solutionsResponses(data)',t);assert(t.output.includes('Reference &amp; banks'));assert(t.output.includes('&lt;my explanation>'));assert(t.output.includes('my previous answer'));assert(t.output.includes('Автопроверка: 1 из 10'));
