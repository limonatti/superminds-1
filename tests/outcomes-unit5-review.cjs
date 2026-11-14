/* No browser or audio playback: DOM unit tests with disposable in-memory storage. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom'),base=path.join(__dirname,'../outcomes-beginner-active-teach/unit5-review');
const key='asya-outcomes-u5-surprise-v1';
function start(saved){
 const dom=new JSDOM(fs.readFileSync(path.join(base,'index.html'),'utf8'),{url:'https://quality.invalid/',runScripts:'outside-only'}),w=dom.window;
 w.CSS={escape:v=>String(v).replace(/["\\]/g,'\\$&')};w.HTMLElement.prototype.scrollIntoView=function(){};
 w.HTMLMediaElement.prototype.pause=function(){};w.HTMLMediaElement.prototype.play=function(){throw Error('QA must not play audio')};
 if(saved)w.localStorage.setItem(key,saved);
 w.eval(fs.readFileSync(path.join(base,'data.js'),'utf8'));w.eval(fs.readFileSync(path.join(base,'app.js'),'utf8'));
 return {dom,w,d:w.document};
}
let {dom,w,d}=start();const click=s=>{assert(d.querySelector(s),s);d.querySelector(s).click()},go=i=>click('[data-go="'+i+'"]');
assert.equal(w.QUEST.tasks.length,15);
// Empty work is not graded. Every task has a reversible per-stage retry.
for(let i=0;i<15;i++){go(i);assert(d.querySelector('#retry'));assert(d.querySelector('#undoRetry').hidden);assert.equal(d.querySelectorAll('[aria-pressed="true"]').length,0);if(i<14){click('#check');assert.match(d.querySelector('#result').textContent,/Сначала заполни/);}}
go(0);click('[data-target="2"]');assert.equal(d.activeElement.dataset.target,'2');click('[data-card="use the ticket machine"]');assert.equal(d.activeElement.dataset.card,'use the ticket machine');
assert.match(d.querySelector('[data-target="2"]').textContent,/use the ticket machine/);
// Wrong completed work is rejected; resetting it retains a recoverable snapshot.
for(let i=0;i<4;i++){click('[data-target="'+i+'"]');click('[data-card="use the ticket machine"]')}
click('#check');assert.match(d.querySelector('#result').textContent,/ещё раз/);
click('#retry');assert(d.querySelector('#task').textContent.includes('Предыдущую попытку можно вернуть'));assert(!d.querySelector('#undoRetry').hidden);
let stored=w.localStorage.getItem(key);dom.window.close();({dom,w,d}=start(stored));click('#undoRetry');assert.match(d.querySelector('[data-target="2"]').textContent,/use the ticket machine/);
// Solve all objective tasks by the configured controls: structural coverage, not source validation.
for(let i=0;i<14;i++){
 go(i);click('#retry');const t=w.QUEST.tasks[i];
 for(let j=0;j<t.rows.length;j++){
  const r=t.rows[j];if(['match','gaps'].includes(t.kind)){click('[data-target="'+j+'"]');const b=[...d.querySelectorAll('[data-card]')].find(b=>b.dataset.card===r.a);assert(b);b.click()}
  else if(t.kind==='choice'){[...d.querySelectorAll('[data-row="'+j+'"]')].find(b=>b.dataset.choice===r.a).click()}
  else r.a.forEach((_,k)=>click('[data-add="'+j+'"][data-token="'+k+'"]'));
 }
 click('#check');assert.match(d.querySelector('#result').textContent,/Всё получилось/,t.title);
 click('#retry');click('#undoRetry');click('#check');assert.match(d.querySelector('#result').textContent,/Всё получилось/,t.title+' retry');
}
// Personal responses stay ungraded; optional notes and reflection survive retry and undo.
go(14);click('[data-personal="visit a museum"]');d.querySelector('#notes').value='My own idea';d.querySelector('#notes').dispatchEvent(new w.Event('input',{bubbles:true}));d.querySelector('[data-reflect="0"]').click();click('#retry');assert.equal(d.querySelector('#notes').value,'');click('#undoRetry');assert.equal(d.querySelector('#notes').value,'My own idea');assert(d.querySelector('[data-reflect="0"]').checked);click('#check');assert.match(d.querySelector('#result').textContent,/не оцениваем автоматически/);
// Reviewed hint fixtures: no ordered solution or exact time/invitation answers before an attempt.
assert(!w.QUEST.tasks[7].hint.includes('Сначала направление'));assert(!w.QUEST.tasks[11].hint.includes('on Saturday'));assert(!w.QUEST.tasks[11].hint.includes('OK. Great!'));
for(const t of w.QUEST.tasks.filter(t=>['match','gaps'].includes(t.kind)))assert(t.bank.length>1);
dom.window.close();console.log('PASS: 15 tasks, empty/wrong/correct checks, retry/undo, persistence, focus, personal notes; no audio playback.');
