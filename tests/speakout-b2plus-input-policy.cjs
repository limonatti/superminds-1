const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {presentation,attempted}=require('../speakout-b2plus-active-teach/assets/exercise-policy.js');
const {candidates}=require('../exercise-play.js');
const {correct}=require('../speakout-b2plus-active-teach/assets/answer-checker.js');
const context={window:{}};vm.createContext(context);
vm.runInContext(fs.readFileSync('speakout-b2plus-active-teach/data/exercises.js','utf8'),context);
const bank=context.window.SPEAKOUT_EXERCISES,totals={sb:{exercises:0,typed:0,choice:0,set:0},wb:{exercises:0,typed:0,choice:0,set:0}};
for(const [page,exercises]of Object.entries(bank))for(const ex of exercises){
 const stats=totals[page.split(':')[0]];stats.exercises++;
 const display=ex.fields.map(presentation);
 ex.fields.forEach((f,i)=>{
  const options=candidates(display[i],display,ex.text);
  assert.equal(display[i].answers.length,0,ex.id+' passes no grading answers to word-bank generation');
  if(f.choices){
   stats[f.mode==='set'?'set':'choice']++;
   assert.equal(options.length,new Set(f.choices.map(c=>c.toLowerCase().trim())).size,ex.id+' retains every original option');
   assert(options.every(o=>f.choices.includes(o.value)),ex.id+' adds no answer-derived choices');
  }else{stats.typed++;assert.equal(options.length,0,ex.id+' must use editable free input');}
 });
 assert(!attempted(ex,{}),'fresh task must not expose its key');
 const saved=Object.fromEntries(ex.fields.map(f=>[ex.id+':'+f.n,{value:'my attempt',checked:true}]));
 assert(attempted(ex,saved),'completed attempts may reveal a key');
 const first=ex.id+':'+ex.fields[0].n;
 for(const value of [null,{value:'',checked:true},{value:'   ',checked:true},{value:'edited',checked:false},'legacy unsubmitted answer']){
  assert(!attempted(ex,{...saved,[first]:value}),ex.id+' reset/blank/edited answers must not unlock keys');
 }
 assert(!attempted(ex,{[ex.id+':extra']:{value:'done',checked:true}}),'extra fields cannot unlock unanswered tasks');
}
assert.equal(totals.sb.exercises,721);assert.equal(totals.wb.exercises,393);
const ex=id=>Object.values(bank).flat().find(e=>e.id===id),field=(id,n)=>ex(id).fields.find(f=>f.n===n);
const review=ex('sb-17-2A-2');
for(const [i,answer]of ['working','designed','shaped','positioned','creating','acting'].entries()){
 assert(correct(answer,review.fields[i]));
 assert(!correct(['work','design','shape','position','create','act'][i],review.fields[i]));
}
assert(correct('do you keep doing',field('sb-17-1A-0','3')));
assert(correct('do you keep on doing',field('sb-17-1A-0','3')));
assert(!correct('do you keep to do',field('sb-17-1A-0','3')));
assert(correct('As a rule',field('sb-17-1A-0','5')));
assert(correct('like',field('sb-41-1-0','8')));
assert(correct('b',field('sb-77-1A-0','5')));
assert(correct('At the same time',field('sb-101-2A-2','8')));
for(const f of ex('sb-122-3-1').fields){assert.equal(f.choices.join(''),'abc');assert(correct(f.answer.toLowerCase(),f));}
assert(correct('F',field('sb-67-2B-2','2')));
assert(correct('forever',field('sb-86-2B-0','1')));assert(!correct('Eloise',field('sb-86-2B-0','1')));
assert.equal(ex('sb-137-1B-1').fields.map(f=>f.n).join(''),'abcdefghi');
assert(correct('be on the right track',field('sb-137-1B-1','a')));
// Long task crops retain the available text width instead of shrinking to fit height.
const view={window:{}};vm.createContext(view);vm.runInContext(fs.readFileSync('exercise-source.js','utf8'),view);
let width;
const figure={style:{setProperty:(name,value)=>{if(name==='width')width=value;}}};
const doc={_focus:{zoom:1},querySelectorAll:()=>[figure]};
const host={dataset:{sourceFit:'width'},clientWidth:800,querySelector:()=>doc};
view.window.ExerciseSource.fit(host);assert.equal(width,'800px');
doc._focus.zoom=1.25;view.window.ExerciseSource.fit(host);assert.equal(width,'1000px');
doc._focus.zoom=.5;view.window.ExerciseSource.fit(host);assert.equal(width,'400px');
console.log('PASS all 1,114 exercises: no answer-derived suggestions; original choices retained; key access follows saved attempts.',totals);
