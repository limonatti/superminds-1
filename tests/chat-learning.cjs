const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {JSDOM}=require('jsdom'),{Capture,mime}=require('../sm-chat-recorder');const tick=()=>new Promise(r=>setImmediate(r));
class Recorder{static isTypeSupported(t){return t==='audio/mp4'||t==='video/mp4'}constructor(stream,options){this.mimeType=options.mimeType;this.state='inactive';}start(){this.state='recording'}stop(){this.state='inactive';this.ondataavailable({data:new Blob(['recorded'],{type:this.mimeType})});queueMicrotask(()=>this.onstop());}}
(async()=>{
 assert.equal(mime('audio',Recorder),'audio/mp4');assert.equal(mime('video',Recorder),'video/mp4');
 let resolve,stopped=0,states=[];const stream={getTracks:()=>[{stop(){stopped++}}]};
 const c=new Capture({kind:'audio',Recorder,media:{getUserMedia:()=>new Promise(r=>resolve=r)},onState:s=>states.push(s)});
 const pending=c.start();c.cancel();resolve(stream);await pending;assert.equal(stopped,1);assert(!states.some(s=>s.state==='recording'),'late camera permission cannot revive draft');
 let clock=0;const c2=new Capture({kind:'video',Recorder,media:{getUserMedia:async()=>stream},now:()=>clock,onState:s=>states.push(s)});await c2.start();clock=65000;c2.stop();await tick();assert.equal(states.at(-1).state,'preview');assert.equal(states.at(-1).duration,60);assert.equal(stopped,2);assert.equal(states.at(-1).blob.type,'video/mp4');c2.cancel();
 const denied=new Capture({kind:'audio',Recorder,media:{getUserMedia:async()=>{const e=Error();e.name='NotAllowedError';throw e}},onState:s=>states.push(s)});await denied.start();assert.equal(states.at(-1).state,'error');assert.match(states.at(-1).error,/Разреши/);
 const dom=new JSDOM('<div id="picker"></div><select id="unit"></select>',{url:'https://school.test/teacher-class.html',runScripts:'outside-only'}),w=dom.window;
 w.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(new URL(url).pathname.slice(1),'utf8'))});w.eval(fs.readFileSync('sm-homework.js','utf8'));const H=w.SMHomework,host=w.document.getElementById('picker'),unit=w.document.getElementById('unit');
 await H.mountPicker(host,unit,'speakout-b1',{unit:'1'});assert(host.querySelector('[data-section]').textContent.includes('1A'));assert.equal(host.selectedIds().length,0);
 const section=host.querySelector('[data-section]');section.value='1A';section.dispatchEvent(new w.Event('change'));let check=host.querySelector('[data-id]');check.checked=true;check.dispatchEvent(new w.Event('change'));const selected=host.selectedIds()[0];section.value='1B';section.dispatchEvent(new w.Event('change'));assert.equal(host.selectedIds()[0],selected,'selection survives sections');
 const note=JSON.parse(H.makeNote('speakout-b1',host.selectedIds(),'2026-11-25','<img onerror=x>'));assert.equal(note.textbookExercises[0],selected);assert(note.selectionSummary.includes('1A'));assert.throws(()=>H.makeNote('speakout-b1',[],null,''));
 for(const file of fs.readdirSync('.').filter(f=>f.startsWith('homework-catalog-'))){const d=JSON.parse(fs.readFileSync(file));assert.equal(new Set(d.items.map(e=>e.id)).size,d.items.length);for(const e of d.items){const u=new URL(e.href,'https://school.test/');assert(fs.existsSync(u.pathname.slice(1)),e.href);assert(u.searchParams.get('exercise')||u.searchParams.get('ex'));assert(e.section&&e.book&&e.label);}}
 for(const course of ['focus-3','focus-4']){
  await H.mountPicker(host,unit,course,{unit:'1'});
  assert(unit.selectedOptions[0].textContent.includes(course==='focus-3'?'A new look':'Live and learn'));
  const sections=host.querySelector('[data-section]');assert(sections.textContent.includes('1.2 · Grammar'));
  const first=host.querySelector('[data-id]');first.checked=true;first.dispatchEvent(new w.Event('change'));
  const chosen=first.dataset.id;
  sections.value='1.2 · Grammar';sections.dispatchEvent(new w.Event('change'));
  assert(host.querySelector('a').href.includes('page=6'));
  assert.equal(host.selectedIds()[0],chosen);
  const book=host.querySelector('[data-book]');book.value='wb';book.dispatchEvent(new w.Event('change'));
  assert(host.querySelector('[data-section]').textContent.includes('1.10 ·'));
  assert.equal(host.selectedIds()[0],chosen,'selection survives book switch');
 }
 const hw={id:'hw',course:'speakout-b1',student_id:'student',status:'new',note:JSON.stringify(note)};let saves=[],submits=0;w.SM={homeworkCards:async()=>[hw],loadCourseWork:async()=>({ok:true,answers:{}}),saveCourseWork:async(c,patch,id)=>{saves.push({c,patch,id});return{ok:true}},hwSubmit:async()=>{submits++;return {ok:true}}};
 await assert.rejects(H.submit(hw,'student'),/Сначала выполни/);assert.equal(submits,0);
 w.SM.loadCourseWork=async()=>({ok:true,answers:{[selected]:{values:['my answer'],done:true}}});await H.submit(hw,'student');assert.equal(submits,1);assert.equal(saves[0].patch['__homework:hw'].exercises[selected].values[0],'my answer');assert.equal(saves[0].id,'student');
 hw.status='done';await H.submit(hw,'student');assert.equal(saves.length,1,'accepted snapshot is not replaced by retry');
 dom.window.close();console.log('PASS recording permissions/cancellation/MIME/limits, exact catalogs, section selection, incomplete submission and immutable submitted snapshot retries.');
})().catch(e=>{console.error(e);process.exit(1)});
