const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const I=require('../speakout-a1-active-teach/assets/interactive.js');
const c={window:{}};vm.runInNewContext(fs.readFileSync('speakout-a1-active-teach/assets/course-web.js','utf8'),c);vm.runInNewContext(fs.readFileSync('speakout-a1-active-teach/assets/exercise-text.js','utf8'),c);const D=c.window.COURSE;
const get=(b,p,l)=>{const page=D.books[b].pages.find(x=>x.page===p),e=page.exercises.find(x=>x.label===l);if(!e.text)e.text=c.window.SPEAKOUT_EXERCISE_TEXT[`${b}:${p}:${l}`]||'';return I.spec(e,D.keys[`${b}|${page.lesson}|${l}`])};
assert.equal(I.matches('I am from India.',"I'm from India."),true);assert.equal(I.matches('I cant swim',"I can't swim"),false);assert.equal(I.matches('true','T'),true);assert.equal(I.matches('am','‘m'),true);assert.equal(I.matches('51','15'),false);assert.equal(I.matches('','am'),false);assert.equal(I.matches("my father's name","my father is name"),false);assert.equal(I.matches('Hi','Hi / Hey'),true);
assert.equal(I.matches('Don’t eat or drink','Don’t eat or drink'),true);assert.equal(I.matches('drink','Don’t eat or drink'),false);
assert.equal(I.matches('Can I make you a tea?','Can I make you some/a tea?'),true);assert.equal(I.matches('a tea','Can I make you some/a tea?'),false);
assert.equal(I.matches('What time do you meet?','When / What time do you meet?'),true);assert.equal(I.matches('When','When / What time do you meet?'),false);
assert.deepEqual(get('sb',8,'1A').items[0].options.map(o=>o.value),['A','B']);
assert.deepEqual(get('wb',4,'2').items[0].options.map(o=>o.value),['a','b']);
assert.equal(get('wb',4,'3').items[0].kind,'order');
assert.equal(get('wb',7,'8C').items[0].kind,'choice');
assert.equal(get('wb',6,'5').mode,'review');
assert.equal(get('sb',8,'3C').mode,'review');
assert.equal(I.cleanKey({pdf:'web/194.pdf',pdfPage:7,items:[{n:'3',answer:'good 7'}]}).items[0].answer,'good');
assert.equal(I.cleanKey({pdf:'web/194.pdf',pdfPage:24,items:[{n:'1',answer:'place 4'}]}).items[0].answer,'place 4');
assert.equal(I.spec({text:'Complete the sentences with the words in the box.\nmy his your their\n1 ____ name is Ben.'},{items:[{n:'1',answer:'my'},{n:'2',answer:'his'}]}).items[0].options.length,4);
assert.equal(I.spec({text:'Complete the correct form of verbs in the box.\nhelp get take\n1 She ___ us.'},{items:[{n:'1',answer:'helps'}]}).items[0].kind,'text');
let counts={},units={sb:new Set(),wb:new Set()};
for(const [b,book] of Object.entries(D.books))for(const p of book.pages)for(const e of p.exercises){
 const spec=get(b,p.page,e.label);counts[spec.mode]=(counts[spec.mode]||0)+1;
 for(const f of spec.items){assert.ok(I.matches(I.variants(f.answer)[0],f.answer));assert.equal(I.matches('definitely wrong answer 9387',f.answer),false);assert.equal(I.matches('',f.answer),false);if(f.options)assert.ok(f.options.some(o=>I.matches(o.value,f.answer)),`${b} ${p.page} ${e.label}/${f.n} choices omit key`);counts[f.kind]=(counts[f.kind]||0)+1}
 if(spec.mode==='auto'&&/^[1-8]/.test(p.lesson))units[b].add(p.lesson[0]);
}
assert.equal(units.sb.size,8);assert.equal(units.wb.size,8);console.log('Speakout interactive coverage:',counts,'All 8 units in both books.');
