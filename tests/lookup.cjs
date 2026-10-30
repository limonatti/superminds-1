const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function setup(handler, data = {}) {
  const calls = [], store = {};
  const ctx = vm.createContext({AbortController, setTimeout, clearTimeout,
    localStorage: {getItem:k=>store[k] || null, setItem:(k,v)=>{store[k]=v;}},
    SM_COURSE_DATA:data,
    fetch:async(url,options)=>{
      calls.push(url);
      if (url.includes('dictionaryapi')) return {ok:false,status:404};
      return handler(url,options);
    }});
  ctx.window = ctx;
  vm.runInContext(fs.readFileSync('sm-lookup.js','utf8'),ctx);
  return {ctx,calls,store};
}
const response = j => ({ok:true,status:200,json:async()=>j});
(async()=>{
  const local = setup(()=>{throw Error('should not translate');}, {course:[{words:[{en:'Have fun',ru:'веселиться'}]}]});
  assert.equal((await local.ctx.SM_lookup('have fun!')).ru,'веселиться');
  assert.equal(local.calls.length,0,'phrase in course works without network');
  const idiom = setup(()=>{throw Error('no network');});
  assert.match((await idiom.ctx.SM_lookup('Break the ice!')).ru,/разрядить обстановку/);
  assert.equal(idiom.calls.length,0);
  const main = setup(url=>response([[[new URL(url).searchParams.get('q')==='US'?'США':'нас']]]));
  assert.equal((await main.ctx.SM_lookup('US')).ru,'США');
  assert.equal((await main.ctx.SM_lookup('us')).ru,'нас','case-sensitive cache');
  assert.match(main.calls.find(x=>x.includes('googleapis')),/q=US/);
  const fallback=setup(url=>url.includes('googleapis')?response([[['unchanged']]]):response({responseStatus:200,responseData:{translatedText:'новая фраза'}}));
  assert.equal((await fallback.ctx.SM_lookup('new phrase')).ru,'новая фраза');
  const failed=setup(url=>url.includes('googleapis')?response(null):response({responseStatus:429,responseData:{translatedText:'Превышена квота'}}));
  assert.equal((await failed.ctx.SM_lookup('new phrase')).ru,'');
  assert.equal((await failed.ctx.SM_lookup('new phrase')).ru,'');
  assert.equal(failed.calls.length,4,'empty translations are retried, not cached');
  const split=setup(()=>response([[['Первая часть. '],['Вторая часть.']]]));
  const [a,b]=await Promise.all([split.ctx.SM_lookup('First part. Second part.'),split.ctx.SM_lookup('First part. Second part.')]);
  assert.equal(a.ru,'Первая часть. Вторая часть.');assert.equal(a,b);
  assert.equal(split.calls.length,1,'concurrent searches share request');
  await split.ctx.SM_lookup('First part. Second part.');
  assert.equal(split.calls.length,1,'successful translation cached');
  const special=setup(()=>response([[['конструктор']]]));
  assert.equal(typeof (await special.ctx.SM_lookup('constructor')).ru,'string');
  console.log('PASS: course, idioms, primary/fallback, case, multi-sentence, cache recovery, deduplication');
})().catch(e=>{console.error(e);process.exitCode=1;});
