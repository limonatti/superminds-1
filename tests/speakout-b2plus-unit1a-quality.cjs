const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../speakout-b2plus-active-teach/assets/answer-checker.js');const c={window:{}};
for(const f of ['data/exercises.js','assets/exercise-sources.js'])vm.runInNewContext(fs.readFileSync('speakout-b2plus-active-teach/'+f,'utf8'),c);
const bank=c.window.SPEAKOUT_EXERCISES,source=c.window.EXERCISE_SOURCES;
const tasks=['sb:7','sb:8','sb:9'].flatMap(k=>bank[k]);assert.equal(tasks.length,23);
const ex=label=>tasks.find(e=>e.label===label);assert.equal(bank['sb:9'].map(e=>e.label).join(','),'6A,6B,6C,7A,7B,7C,7D,8A,8B,8C');
assert.equal(ex('6B').fields.map(f=>f.n).join(''),'abcd');assert.equal(ex('6C').referencePage,110);assert.equal(ex('5C').referencePage,134);
for(const t of tasks){assert(t.hint&&t.responseMode);assert(source[t.id]);for(const s of source[t.id].sources){assert(fs.existsSync('speakout-b2plus-active-teach/'+s.image));const[x,y,w,h]=s.box;assert(x>=0&&y>=0&&x+w<=1&&y+h<=1);}if(t.audio)assert(fs.existsSync('speakout-b2plus-active-teach/content/'+t.audio),t.audio);}
for(const l of ['1A','1B','1C','3C','5B','7A','7C','8B','8C'])assert.equal(ex(l).responseMode,'oral');
assert.equal(ex('5A').minResponses,5);assert(ex('5A').fields.every(f=>f.optional));
const examples=[['2B',['b','c','a','b','a']],['4A',['socialise with','party with','on the same wavelength','hit it off with','have a mutual friend','bonded over','confide in','click with']],['4B',['confide in','hit it off,are just not on the same wavelength','party,socialise','clicked with','bonded over','socialise with','have a mutual friend','hit it off,clicked']],['7B',["'d","'ll","'ll","'d","'d","'ll"]]];
let checked=0;for(const[label,values]of examples)for(const[i,v]of values.entries()){assert(C.correct(v,ex(label).fields[i]),label+'/'+i);assert(!C.correct('',ex(label).fields[i]));assert(!C.correct('wrong answer',ex(label).fields[i]));checked++;}
assert(!C.correct('hit it off',ex('4B').fields[1]),'both possible requires both selections');assert(C.correct('click with',ex('4A').fields[3]));assert(C.correct('hit it off with',ex('4A').fields[7]));
// Execute the actual dialog-opening logic without a browser: old records stay
// separate from the new answer model and are never rewritten by opening a task.
const js=fs.readFileSync('speakout-b2plus-active-teach/assets/exercises.js','utf8');const body=js.slice(js.indexOf('open(s,page){')+13,js.indexOf('\n    close(){'));const fn=body.slice(0,body.lastIndexOf('},'));
const saved={};saved[ex('6B').id+':1']={value:'old grammar notes',checked:true};saved[ex('6B').id+':_count']=12;
const ctx={window:{B2Store:{answers:()=>saved}},dialog:{open:true},render(){}};vm.createContext(ctx);vm.runInContext('function open(s,page){'+fn+'}',ctx);const before=JSON.stringify(saved);ctx.open(ex('6B'),'sb:9');assert.equal(ctx.fields.length,4);assert.equal(ctx.archived[0].value.value,'old grammar notes');assert.equal(JSON.stringify(saved),before);
saved[ex('1A').id+':notes']={value:'old personal notes',checked:false};ctx.open(ex('1A'),'sb:7');assert.equal(ctx.fields.length,0);assert.equal(ctx.archived[0].value.value,'old personal notes');
console.log(`PASS Unit1A:23 source tasks,27 keyed answers, alternatives/multiple choice/empty and wrong input; original audio; legacy records stay intact.`);
