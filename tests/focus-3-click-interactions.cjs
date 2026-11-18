const assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom');
const D=JSON.parse(fs.readFileSync('focus-3-active-teach/assets/course.js','utf8').replace(/^window\.FOCUS3 = /,'').trim().replace(/;$/,''));
const M=require('../focus-3-active-teach/assets/marking.js'),UI=require('../focus-3-active-teach/assets/interactions.js');
const tasks=D.pages.flatMap(p=>p.exercises).filter(e=>e.interaction);let count=0;
for(const e of tasks){
 const dom=new JSDOM('<div id="fields"></div>'),host=dom.window.document.getElementById('fields');let changes=0;host.addEventListener('input',()=>changes++);assert(UI.mount(host,e));
 const vals=()=>[...host.querySelectorAll('[data-answer]')].map(x=>x.value);
 assert(vals().every(x=>x===''));if(e.interaction.type!=='fields')assert.equal(host.querySelectorAll('input:not([type=hidden]),select').length,0);
 if(e.interaction.type==='fields'){
  [...host.querySelectorAll('[data-answer]')].forEach((input,i)=>{input.value=e.answerSpec[i]?.accepted[0]||'My answer '+(i+1);input.dispatchEvent(new dom.window.Event('input',{bubbles:true}));count++;});
 }else if(e.interaction.type==='bank'){
  e.answerSpec.forEach((f,i)=>{host.querySelectorAll('.choice-slot')[i].click();const candidate=e.interaction.items.find(x=>M.checkField(x,f));assert(candidate,e.id);[...host.querySelectorAll('.interaction-bank button')].find(b=>b.textContent===candidate).click();assert(M.checkField(vals()[i],f));count++;});
 }else if(['choices','multi'].includes(e.interaction.type)){
  e.interaction.rows.forEach((row,i)=>{const f=e.answerSpec[i];const options=!f?[row.options[0]]:e.interaction.type==='multi'&&f.kind==='set'?row.options.filter(o=>f.members.some(a=>M.checkText(o.value,a))):[row.options.find(o=>M.checkField(o.value,f))];
   for(const o of options){assert(o,e.id+' '+i);[...host.querySelectorAll('.choice-row')[i].querySelectorAll('button')].find(b=>b.textContent===o.label).click();}if(f)assert(M.checkField(vals()[i],f),e.id+' correct click '+i);else assert(vals()[i]);count++;
  });
 }else{assert.equal(e.answerSpec.length,0);host.querySelectorAll('.choice-row').forEach(row=>row.querySelector('button').click());assert(vals().every(Boolean));assert(!host.querySelector('#reflection').required);}
 assert(changes>=vals().length);const saved=vals();UI.mount(host,e,saved,'My explanation');assert.deepEqual(vals(),saved,e.id+' restore');
 if(e.interaction.type==='multi'){const row=host.querySelector('.choice-row');row.querySelector('button[aria-pressed=true]').click();assert(!M.checkField(vals()[0],e.answerSpec[0]),e.id+' toggle removes selection');}
 if(e.interaction.type==='choices'&&e.answerSpec.length){const f=e.answerSpec[0],wrong=e.interaction.rows[0].options.find(o=>!M.checkField(o.value,f));assert(wrong);[...host.querySelector('.choice-row').querySelectorAll('button')].find(b=>b.textContent===wrong.label).click();assert(!M.checkField(vals()[0],f),e.id+' wrong choices stay selectable');}
 UI.mount(host,e,[]);assert(vals().every(x=>x===''));dom.window.close();
}
console.log(`PASS ${tasks.length} Focus 3 interactive tasks / ${count} fields: empty, correct, wrong, multi-toggle, events, restore and reset.`);
