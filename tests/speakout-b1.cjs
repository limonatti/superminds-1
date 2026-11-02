const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../speakout-b1-active-teach');
const src=fs.readFileSync(path.join(root,'assets/course.js'),'utf8');
const D=JSON.parse(src.slice(src.indexOf('=')+1).trim().replace(/;$/,''));
assert.equal(D.books.sb.pages.length,149);assert.equal(D.books.wb.pages.length,94);
assert.deepEqual(D.missingSourcePages,{sb:[146,147,148,149,...Array.from({length:16},(_,i)=>158+i)],wb:[]});
for(const [b,book] of Object.entries(D.books)){
 assert.equal(new Set(book.pages.map(p=>p.page)).size,book.pages.length);
 for(let u=1;u<=8;u++)for(const l of 'ABCD')assert(book.pages.some(p=>p.lesson===u+l),`${b}:${u}${l}`);
 for(const p of book.pages){
  assert(fs.existsSync(path.join(root,p.image)),p.image);
  assert.equal(new Set(p.exercises.map(e=>e.label)).size,p.exercises.length);
  for(const e of p.exercises){const [x,y,w,h]=e.box;assert(e.box.every(Number.isFinite));assert(x>=0&&y>=0&&w>0&&h>0&&x+w<=100&&y+h<=100,`${b}:${p.page}:${e.label}`)}
 }
}
for(let u=1;u<=8;u++)assert(D.books.sb.pages.some(p=>p.lesson===u+'C Mediation'));
assert.equal(D.media.filter(m=>m.type==='audio').length,177);assert.equal(D.media.filter(m=>m.type==='video').length,16);
for(const m of [...D.media,...D.resources])assert(fs.existsSync(path.join(root,m.path)),m.path);
assert.deepEqual(D.keys['wb|1A|1A'].items.map(i=>i.answer),['b','b','c','a','b','c']);
assert.deepEqual(D.keys['wb|1B|2B'].items.map(i=>i.answer),['b','a','b','a','c','c']);
assert.equal(D.books.sb.pages.find(p=>p.page===34).pdfPage,49);
assert.equal(D.books.sb.pages.find(p=>p.page===174).lesson,'Irregular verbs');
assert.equal(D.books.wb.pages.find(p=>p.page===96).pdf,'resources/wb-keys.pdf');
assert(!D.books.wb.pages.some(p=>p.group==='grammar'));
for(const p of D.books.sb.pages.filter(p=>p.group==='vocabulary'))for(const e of p.exercises)assert(e.keyLesson,e.label);
const I=require(path.join(root,'assets/interactive.js'));assert(I.matches('TRUE','T'));assert(!I.matches('','F'));
assert.equal(I.spec({reviewOnly:true,text:'Read.'},{items:[{n:'1',answer:'a'}]}).mode,'review');
console.log('PASS source pages, 8 units, keys, banks, all local media/resources and hotspot bounds.');
if(process.argv.includes('--browser'))(async()=>{
 const {chromium}=require('/Users/mak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 await context.route('**/cdn.jsdelivr.net/**',r=>r.fulfill({body:'',contentType:'text/javascript'}));
 await context.route('**/sm-auth.js*',r=>r.fulfill({contentType:'text/javascript',body:`window.SM={getUser:async()=>{const id=localStorage.getItem('test-user');return id?{id}:null},loadCourseWork:async()=>({ok:true,answers:JSON.parse(localStorage.getItem('mock-cloud:'+localStorage.getItem('test-user'))||'{}')}),saveCourseWork:async(c,b,id)=>{if(id!==localStorage.getItem('test-user'))return {ok:false};const k='mock-cloud:'+id;localStorage.setItem(k,JSON.stringify({...JSON.parse(localStorage.getItem(k)||'{}'),...b}));return {ok:true}}};` }));
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const origin=process.env.B1_TEST_ORIGIN||'http://127.0.0.1:8770',base=origin+'/speakout-b1-active-teach/index.html';
 const ready=()=>page.locator('#exerciseNav button').first().waitFor();
 await page.goto(origin+'/speakout-book.html?course=speakout-b1&u=3');await page.waitForURL('**/speakout-b1-active-teach/index.html?unit=3&book=sb');await ready();assert.equal(await page.locator('#unit').inputValue(),'3');
 await page.goto(base+'?book=wb&page=4');await ready();await page.screenshot({path:'/private/tmp/speakout-b1-desktop.png'});
 await page.locator('#exerciseNav button').filter({hasText:/^1A$/}).click();
 for(const q of D.keys['wb|1A|1A'].items)await page.locator(`[data-answer="${q.n}"]`).fill(q.n==='1'?'a':q.answer);
 await page.locator('#check').click();assert.match(await page.locator('#checkResult').textContent(),/5 из 6/);
 await page.locator('[data-answer="1"]').fill('b');await page.locator('#check').click();assert.match(await page.locator('#checkResult').textContent(),/6 из 6/);
 await page.waitForTimeout(400);await page.keyboard.press('Escape');await page.reload();await ready();await page.locator('#exerciseNav button').filter({hasText:/^1A/}).click();assert.equal(await page.locator('[data-answer="1"]').inputValue(),'b');
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/private/tmp/speakout-b1-mobile.png'});
 assert(await page.locator('#exerciseDialog').evaluate(d=>d.scrollWidth<=d.clientWidth+1&&d.getBoundingClientRect().width<=390));
 await page.keyboard.press('Escape');await page.setViewportSize({width:1440,height:1000});
 await page.goto(base+'?book=sb&page=6&exercise=1A');await page.locator('#exerciseDialog[open]').waitFor();
 for(const q of D.keys['sb|Lead-in|1A'].items)await page.locator(`[data-answer="${q.n}"]`).fill(q.answer);
 await page.locator('#check').click();assert.match(await page.locator('#checkResult').textContent(),/8 из 8/);
 await page.screenshot({path:'/private/tmp/speakout-b1-exercise.png'});await page.keyboard.press('Escape');
 for(const book of ['sb','wb'])for(let n=1;n<=8;n++){
  await page.goto(base+`?book=${book}&unit=${n}`);await ready();assert.equal(await page.locator('#unit').inputValue(),String(n));
  const broken=await page.locator('#pageImage').evaluate(img=>img.complete&&img.naturalWidth===0);assert(!broken);
 }
 await page.goto(base+'?book=sb&page=104');await ready();assert.equal(await page.locator('#unit').inputValue(),'grammar');
 await page.goto(base+'?book=sb&page=136');await ready();assert.equal(await page.locator('#unit').inputValue(),'vocabulary');
 await page.goto(base+'?book=sb&page=150');await ready();assert.equal(await page.locator('#unit').inputValue(),'mediation');
 await page.locator('#exerciseNav button').filter({hasText:/^1$/}).click();await page.locator('#freeNote').fill('A community project.');await page.locator('#done').click();await page.waitForTimeout(400);await page.keyboard.press('Escape');
 await page.goto(base+'?book=sb&unit=1');await ready();await page.locator('#mediaTab').click();await page.locator('#mediaFilter').selectOption('unit');
 for(const type of ['audio','video']){const player=page.locator('#mediaList '+type).first();await player.evaluate(p=>p.load());await page.waitForFunction(t=>document.querySelector('#mediaList '+t)?.readyState>=1,type);assert((await player.evaluate(p=>p.duration))>0)}
 await page.locator('#resources').click();await page.locator('#resourceSearch').fill('Photocopiable');assert(await page.locator('#resourceList a').count()>0);await page.keyboard.press('Escape');
 // Account drafts neither inherit guest work nor leak into a second account.
 await page.evaluate(()=>localStorage.setItem('test-user','student-a'));await page.goto(base+'?book=sb&page=8&exercise=1A');await page.locator('#freeNote').waitFor();assert.equal(await page.locator('#freeNote').inputValue(),'');await page.locator('#freeNote').fill('Student A personal answer');
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('mock-cloud:student-a')||'{}')['sb:8:1A']?.reflection==='Student A personal answer');
 await page.evaluate(()=>localStorage.setItem('test-user','student-b'));await page.reload();await page.locator('#freeNote').waitFor();assert.equal(await page.locator('#freeNote').inputValue(),'');
 await page.evaluate(()=>localStorage.setItem('test-user','student-a'));await page.reload();await page.locator('#freeNote').waitFor();assert.equal(await page.locator('#freeNote').inputValue(),'Student A personal answer');
 // Use the real room message contract, without opening an actual lesson or contacting students.
 await page.route('**/b1-test-parent',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html><body></body></html>'}));
 await page.goto(origin+'/b1-test-parent');
 await page.evaluate(src=>{document.body.innerHTML='<iframe id="test-frame" style="width:100%;height:850px"></iframe>';window.received=[];window.addEventListener('message',e=>{if(e.origin===location.origin)window.received.push(e.data)});document.getElementById('test-frame').src=src},base+'?book=sb&unit=1&embedded=1&lessonRole=s');
 const frame=page.frameLocator('#test-frame');await frame.locator('#exerciseNav button').first().waitFor();
 await page.evaluate(()=>document.getElementById('test-frame').contentWindow.postMessage({type:'outcomes-lesson',kind:'view',book:'wb',page:4,exercise:'wb:4:1A'},location.origin));
 await frame.locator('#exerciseDialog[open]').waitFor();await frame.locator('[data-answer="1"]').fill('b');
 await page.waitForFunction(()=>window.received.some(d=>d.kind==='answers'&&d.exercise==='wb:4:1A'&&d.values[0]==='b'));
 assert.equal(await frame.locator('#pageSelect').inputValue(),'4');
 assert.deepEqual(errors,[]);console.log('PASS browser: SB/WB grading, saved answers, all units, banks, mobile, media, resources and account isolation.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
