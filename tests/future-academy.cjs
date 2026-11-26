const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'..'),Q=require('../quests/focus4-live-and-learn/quest.js');
const html=fs.readFileSync(path.join(root,'quests/focus4-live-and-learn/index.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
const cloud={alice:{'sb-4-1':{values:['existing textbook answer'],updatedAt:1}}};let offline=false,who='alice';
const copy=x=>JSON.parse(JSON.stringify(x));
async function open(cache={}){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://english-with-asya.com/quests/focus4-live-and-learn/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc}),w=dom.window;
 w.HTMLElement.prototype.scrollIntoView=()=>{};w.HTMLMediaElement.prototype.pause=()=>{};w.print=()=>{};
 for(const [k,v]of Object.entries(cache))w.localStorage.setItem(k,v);
 w.SM={presentationSession:async()=>who?{id:who}:null,watchPresentationAuth:()=>()=>{},loadCourseWork:async()=>offline?{ok:false}:{ok:true,answers:copy(cloud[who]||{})},saveCourseWork:async(c,rows,user)=>{assert.equal(c,'focus-4');if(offline)return{ok:false};cloud[user]={...cloud[user],...copy(rows)};return{ok:true,answers:copy(cloud[user])};}};
 for(const file of ['coursework-store.js','quests/focus4-live-and-learn/quest.js','quests/assets/quest-player.js'])w.eval(fs.readFileSync(path.join(root,file),'utf8'));
 for(let i=0;i<15&&w.document.querySelector('#taskControls').disabled;i++)await new Promise(r=>setImmediate(r));
 await new Promise(r=>setImmediate(r));
 const q=s=>w.document.querySelector(s),qa=s=>[...w.document.querySelectorAll(s)];
 const change=(el,value)=>{el.value=value;el.dispatchEvent(new w.Event('input',{bubbles:true}));};
 return {dom,w,q,qa,errors,change,cache:()=>Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)])),close:()=>{w.QuestPlayer.getStore().destroy();dom.window.close();}};
}
(async()=>{
 let x=await open();const K=id=>'quest:'+Q.id+':'+id;
 try{
 assert.equal(Q.tasks.length,12);assert.equal(Q.tasks.filter(t=>t.rows[0].accepted).reduce((n,t)=>n+t.rows.length,0),47);
 assert.equal(x.qa('.choice[aria-pressed=true]').length,0);
 for(let index=0;index<Q.tasks.length;index++){
  const t=Q.tasks[index];if(!t.rows[0].accepted)continue;x.w.QuestPlayer.go(index);
  assert.equal(x.qa('[data-row]').length,t.rows.length);assert(!/[А-Яа-яЁё]/.test(x.q('#workbench').textContent));
  assert.equal(x.qa('.choice[aria-pressed=true]').length,0,'no answer is preselected');
  x.q('#checkAnswers').click();assert(!x.w.QuestPlayer.getStore().records[K(t.id)].reviewed);
  if(t.type==='choice')x.qa('[data-choice]')[0].click();else{x.q('[data-slot="0"]').click();const wrong=t.bank.findIndex(o=>o.value!==t.rows[0].accepted[0]);x.q(`[data-token="${wrong}"]`).click();}
  for(const [i,row]of t.rows.entries()){
   if(t.type==='choice'){const j=row.options.findIndex(o=>o.value===row.accepted[0]);x.q(`[data-choice="${i}:${j}"]`).click();}
   else{x.q(`[data-slot="${i}"]`).click();const j=t.bank.findIndex(o=>o.value===row.accepted[0]);assert(j>=0);x.q(`[data-token="${j}"]`).click();}
  }
  x.q('#checkAnswers').click();assert.equal(x.qa('[data-result=correct]').length,t.rows.length,t.id+' correct answers');
  assert.deepEqual(Array.from(x.w.QuestPlayer.getStore().records[K(t.id)].values),t.rows.map(r=>r.accepted[0]));
  if(index%2){x.change(x.q('#codeLetter'),Q.stations[Math.floor(index/2)].letter.toLowerCase());x.q('#checkLetter').click();assert.match(x.q('#letterFeedback').textContent,/collected/);}
 }
 // Moving a unique card clears its former gap, and clear is reversible.
 x.w.QuestPlayer.go(0);x.q('[data-slot="1"]').click();x.q('[data-token="3"]').click();assert.equal(x.w.QuestPlayer.getStore().records[K('01')].values[0],'');
 x.q('#clearAnswer').click();assert(x.qa('[data-slot]').every(e=>e.dataset.filled==='false'));x.q('#clearAnswer').click();assert.equal(x.w.QuestPlayer.getStore().records[K('01')].values[1],'a lecture');
 // Copying relevant words accepts the PDF variants without exact-case traps.
 x.w.QuestPlayer.go(10);for(const [i,v]of ['Architecture.','scholarship','My tutor never gave up on me.','entrance exam'].entries())x.change(x.q(`[data-written="${i}"]`),v);x.q('#checkAnswers').click();assert.equal(x.qa('[data-result=correct]').length,4);
 // Dialogue: notes are durable, oral mode is explicit, no automatic grade.
 x.w.QuestPlayer.go(9);x.q('#checkAnswers').click();assert.match(x.q('#feedback').textContent,/Complete/);
 ['I fell behind.','Settle down and make a plan.','I can deepen my knowledge.','Do not give up on your goal.'].forEach((v,i)=>x.change(x.q(`[data-written="${i}"]`),v));
 x.qa('[data-criterion]').forEach(el=>el.click());x.q('#checkAnswers').click();assert(x.w.QuestPlayer.getStore().records[K('10')].reviewed);assert.equal(x.w.QuestPlayer.getStore().records[K('10')].score,undefined);
 x.w.QuestPlayer.go(11);x.change(x.q('[data-written]'),'short draft');x.qa('[data-criterion]').forEach(el=>el.click());x.q('#checkAnswers').click();assert.match(x.q('#feedback').textContent,/60–80/);assert(!x.w.QuestPlayer.getStore().records[K('12')].reviewed);
 const sample='I have a passion for architecture, so I want to enrol on a design course. I am self-disciplined, but I sometimes fall behind when I have several deadlines. I plan to attend extra lectures and deepen my knowledge of sustainable buildings. I will not give up on my goal. In the future, I hope to get a scholarship and work in the field of environmentally friendly design.';
 x.change(x.q('[data-written]'),sample);x.q('#checkAnswers').click();assert(x.w.QuestPlayer.getStore().records[K('12')].reviewed);assert.equal(x.w.QuestPlayer.getStore().records[K('12')].score,undefined);
 const editor=x.q('[data-written]');editor.focus();editor.setSelectionRange(15,15);await x.w.QuestPlayer.getStore().flush();assert.equal(x.q('[data-written]'),editor,'sync acknowledgement must preserve the editor');assert.equal(x.w.document.activeElement,editor);assert.equal(editor.selectionStart,15);
 x.w.QuestPlayer.showFinal();x.change(x.q('#password'),'future');x.q('#unlockForm').dispatchEvent(new x.w.Event('submit',{cancelable:true}));assert.match(x.q('#lockFeedback').textContent,/gate is open/);x.qa('[data-outcome]')[0].click();
 await x.w.QuestPlayer.getStore().flush();assert.deepEqual(cloud.alice['sb-4-1'].values,['existing textbook answer']);
 let cache=x.cache();x.close();x=await open(cache);x.w.QuestPlayer.go(11);assert.equal(x.q('[data-written]').value,sample);x.w.QuestPlayer.showFinal();assert(x.q('[data-outcome="0"]').checked);assert.equal(x.q('#password').value,'FUTURE');
 // Offline edits survive reload; account changes never expose another learner's work.
 offline=true;x.w.QuestPlayer.go(9);x.change(x.q('[data-written="0"]'),'Offline idea');await x.w.QuestPlayer.getStore().flush();cache=x.cache();x.close();x=await open(cache);x.w.QuestPlayer.go(9);assert.equal(x.q('[data-written="0"]').value,'Offline idea');offline=false;await x.w.QuestPlayer.getStore().flush();assert.equal(cloud.alice[K('10')].values[0],'Offline idea');
 who='bob';await x.w.QuestPlayer.getStore().switchUser({id:'bob'});assert.equal(x.q('[data-written="0"]').value,'');assert(!x.q('#printSheet').textContent.includes('Offline idea'));
 assert.deepEqual(x.errors,[]);console.log('PASS 47 answers, variants, 12 challenges, unique cards, undo, dialogue/writing review, password, reload, offline sync, account isolation and textbook preservation.');
 }finally{x.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
