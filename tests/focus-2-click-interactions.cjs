const assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom');
const base='focus-2-active-teach/',read=f=>fs.readFileSync(base+f,'utf8');
const D=JSON.parse(read('assets/course.js').split('=').slice(1).join('=').trim().replace(/;$/,''));
const M=require('../focus-2-active-teach/assets/marking.js'),UI=require('../focus-2-active-teach/assets/interactions.js');
const tasks=D.pages.flatMap(p=>p.exercises).filter(e=>e.interaction);assert.equal(tasks.length,10);
const expected={'sb-5-5':['cheerful','generous','hard-working','outgoing','sensible'],'sb-5-6':['caring','miserable','hard-working','generous','shy','silly'],'sb-5-8':['independent','dishonest','polite','popular','irresponsible','sensitive','wise'],'sb-5-9':['honest','wise','independent','polite','unadventurous','popular'],'sb-5-11':['She’s wise, sensitive and has a lot of experience.','He’s got tattoos and long hair.','I like being with young people.']};
for(const [ws,sb]of [['ws-3-1','sb-5-5'],['ws-3-2','sb-5-8'],['ws-3-3','sb-5-11']])expected[ws]=expected[sb];
let count=0;
for(const e of tasks){
 const dom=new JSDOM('<div id="fields"></div>'),host=dom.window.document.getElementById('fields');
 let changes=0;host.addEventListener('input',()=>changes++);assert(UI.mount(host,e,[]));
 assert.equal(host.querySelectorAll('input:not([type=hidden]),select').length,0,'no required typing/select fallback');
 assert([...host.querySelectorAll('[data-answer]')].every(x=>x.value===''),'nothing prefilled');
 const vals=()=>[...host.querySelectorAll('[data-answer]')].map(x=>x.value);
 if(e.interaction.type==='bank'){
  for(const [i,text]of expected[e.id].entries()){
   host.querySelectorAll('.choice-slot')[i].click();[...host.querySelectorAll('.interaction-bank button')].find(b=>b.textContent===text).click();
   assert(M.checkField(vals()[i],e.answerSpec[i]));count++;
  }
  assert.equal(changes,e.answerSpec.length);const saved=vals();assert(UI.mount(host,e,saved));assert.deepEqual(vals(),saved);
  host.querySelector('[aria-label="Очистить пропуск '+e.answerSpec[0].label+'"]').click();assert.equal(vals()[0],'');assert(!M.checkField(vals()[0],e.answerSpec[0]));
  // Wrong candidates remain selectable and are graded as wrong rather than filtered out.
  host.querySelector('.choice-slot').click();const wrong=e.interaction.items.find(x=>!M.checkField(x,e.answerSpec[0]));assert(wrong);[...host.querySelectorAll('.interaction-bank button')].find(b=>b.textContent===wrong).click();assert(!M.checkField(vals()[0],e.answerSpec[0]));
 }else if(e.interaction.type==='choices'){
  const labels=['Без like','Вставить like','Без like','Вставить like','Вставить like'];
  host.querySelectorAll('.choice-row').forEach((row,i)=>{[...row.querySelectorAll('button')].find(b=>b.textContent===labels[i]).click();assert(M.checkField(vals()[i],e.answerSpec[i]));count++;});
  const saved=vals();UI.mount(host,e,saved);assert.equal(host.querySelectorAll('button[aria-pressed=true]').length,5);assert.deepEqual(vals(),saved);
  UI.mount(host,e,['✓','My mum looks like her mum.','✓','My grandmother looks like Queen Elizabeth.','I like chocolate.']);assert.equal(host.querySelectorAll('button[aria-pressed=true]').length,5,'legacy ticks remain selected');
 }else{
  assert.equal(e.answerSpec.length,0,'opinion has no exact grade');host.querySelector('.choice-buttons button').click();assert.equal(vals()[0],'Young people');assert.equal(host.querySelector('#reflection').required,false);
  UI.mount(host,e,['An earlier personal response'],'Earlier explanation');assert.equal(vals()[0],'An earlier personal response');assert(host.textContent.includes('An earlier personal response'));assert.equal(host.querySelector('#reflection').value,'Earlier explanation');
 }
 UI.mount(host,e,[]);assert(vals().every(v=>v===''),'reset returns empty controls');dom.window.close();
}
assert.equal(count,47);
console.log('PASS 10 adapted tasks, 47 no-typing keyed fields, empty/wrong/correct clicks, choice/clear/restore, legacy ticks and personal notes.');
