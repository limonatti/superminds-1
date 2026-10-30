const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
(async () => {
  const state = {assigned: 'sm1', needsChoice: false};
  const saved = [{id:'existing', en:'keep', ru:'сохранять'}];
  const ctx = vm.createContext({console, setTimeout, localStorage:{getItem:()=>null},
    CustomEvent: class {}, dispatchEvent(){},
    SM: {listCourses(){}, getUser:async()=>({id:'student'}),
      myWords:async()=>saved.slice(), addWord:async(w)=>{saved.unshift({...w,id:'new'});return {ok:true};}}});
  ctx.window=ctx;
  // Use real course assembly without its unrelated cloud/voice initialization.
  const words=fs.readFileSync('words.js','utf8');
  vm.runInContext(words.slice(0, words.indexOf('/* Какой курс просил ученик')),ctx);
  ctx.SM_useCourse('sm1');
  ctx.SM_ready=Promise.resolve(state);
  vm.runInContext(fs.readFileSync('sm-mywords.js','utf8'),ctx);
  assert.equal(await ctx.SM_ready,state,'loader preserves assigned course metadata');
  assert.equal(ctx.SM_ALL_WORDS.filter(w=>w.own).length,1);
  await ctx.SM_addMyWord({en:'stubborn',ru:'упрямый'});
  assert.deepEqual(Array.from(ctx.SM_ALL_WORDS.filter(w=>w.own),w=>w.id),['own-new','own-existing']);
  ctx.SM_useCourse('sm1');
  assert.equal(ctx.SM_ALL_WORDS.filter(w=>w.unitId==='own').length,2,'trainer personal pool includes new and existing words');
  const elements={root:{innerHTML:''},personal:{innerHTML:''}};
  ctx.document={getElementById:id=>elements[id]};
  ctx.SM.loadProgress=async()=>({}); // Brand new words have no practice history.
  const html=fs.readFileSync('review.html','utf8');
  const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
  vm.runInContext(scripts.at(-1)[1],ctx);
  await new Promise(resolve=>setImmediate(resolve));
  assert.match(elements.personal.innerHTML,/stubborn/);
  assert.match(elements.personal.innerHTML,/keep/);
  assert.match(elements.personal.innerHTML,/trainer.html\?unit=own/);
  assert.match(elements.root.innerHTML,/На сегодня всё повторено/,'personal words visible even when nothing is due');
  console.log('PASS: existing words, add → personal list → trainer pool, readiness metadata');
})().catch(e=>{console.error(e);process.exitCode=1;});
