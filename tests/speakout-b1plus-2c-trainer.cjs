const assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('speakout-b1plus-2c-trainer.html','utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function setup(saved){const dom=new JSDOM(html.replace(/<script>[\s\S]*?<\/script>/,''),{url:'https://example.test/trainer',runScripts:'outside-only'});const w=dom.window;w.scrollTo=()=>{};w.HTMLMediaElement.prototype.pause=()=>{};if(saved)w.localStorage.setItem('asya-2c-v1',saved);w.eval(script);return dom;}
const dom=setup(),w=dom.window,d=w.document;
const go=i=>{d.querySelector('#jump').value=String(i);d.querySelector('#jump').dispatchEvent(new w.Event('change'));};
const click=(selector)=>{const e=d.querySelector(selector);assert(e,selector);e.click();};
const check=()=>{click('#check');return d.querySelector('#feedback').textContent;};
const choose=values=>values.forEach((v,i)=>click(`[data-choice="${i}"][data-value="${v}"]`));
const fill=values=>values.forEach((v,i)=>{click(`[data-slot="${i}"]`);click(`[data-fill="${v}"]`);});
const pair=(a,b)=>{[...d.querySelectorAll('[data-left]')].find(x=>x.textContent===a).click();[...d.querySelectorAll('[data-right]')].find(x=>x.textContent===b).click();};
for(const i of [0,3,4,5,6,7,8]){go(i);assert.match(check(),/Сначала/,'blank task'+i);assert(!d.querySelector('#feedback').textContent.includes('Верно:'));}
go(0);choose([0]);assert.match(check(),/Сначала/,'partial choice does not reveal remaining keys');choose([1,0]);assert.match(check(),/Можно спокойно/);choose([0,1]);assert.match(check(),/Всё верно/);
go(1);for(const p of [['be in','a hurry'],['get in','the way'],['hear','public announcements'],['jump','a queue'],['drop','litter'],['argue','with someone']])pair(...p);assert.match(check(),/Всё верно/);
go(2);for(const p of [['be in a hurry','be in a rush'],['react to a situation','respond to a situation'],['drop litter','throw litter on the ground'],['disagree with someone','have a different opinion']])pair(...p);assert.match(check(),/Всё верно/);
go(3);fill(['with','with','with','with']);assert.match(check(),/Можно спокойно/);fill(['in','out of','with','to']);assert.match(check(),/Всё верно/);
go(4);choose([1,2,0,1,2,1,2,0]);assert.match(check(),/Всё верно/);
go(5);for(const [i,words]of [['People','jump','the','queue.'],['Please','get','out','of','the','way.'],['I','am','in','a','rush.']].entries())for(const word of words)[...d.querySelectorAll(`[data-word="${i}"]`)].find(x=>x.textContent===word).click();assert.match(check(),/Всё верно/);
go(6);choose([0,1,0,1,0,1]);assert.match(check(),/Всё верно/);
go(7);for(const n of [0,1,2,3])click(`[data-multi="${n}"]`);assert.match(check(),/Всё верно/);assert.equal(d.querySelector('audio').autoplay,false);
go(8);fill(['stand','when','nerves','annoys','bugs']);assert.match(check(),/Всё верно/);assert.equal(d.querySelector('audio').autoplay,false);
go(9);assert.match(check(),/Выбери своё мнение/);choose([2,1,0]);check();assert.equal(d.querySelector('textarea').required,false);assert.match(d.querySelector('#progress').textContent,/10 из 10/);
const restored=setup(w.localStorage.getItem('asya-2c-v1'));assert.match(restored.window.document.querySelector('#progress').textContent,/10 из 10/);restored.window.document.querySelector('#reset').click();assert.match(restored.window.document.querySelector('#progress').textContent,/9 из 10/);restored.window.close();
for(const i of [1,2,3,6,7,8]){go(i);const hint=[...d.querySelectorAll('.panel details')].find(x=>x.querySelector('summary').textContent==='Подсказка').textContent;assert(!/jump a queue|rush и hurry|in a rush, out of|четыре жалобы|can’t stand =/.test(hint));}
dom.window.close();console.log('PASS ten 2C tasks: source fixtures, blank/partial attempt protection, matching, choices, sorting, assembly, listening selections, optional personal notes, persistence/reset, no autoplay.');
