const {JSDOM}=require('jsdom'),assert=require('node:assert/strict'),fs=require('node:fs');
const S=require('../sm-schedule'),tick=()=>new Promise(r=>setImmediate(r));
const dates=S.weekDates(),original=new Date(dates[0]);original.setDate(original.getDate()-7);
const lessons=[{id:'lesson',student_id:'student',weekday:1,at_msk:'10:00',minutes:50,active:true}];
const changes=[{lesson_id:'lesson',on_date:S.iso(original),status:'moved',new_date:S.iso(dates[2]),new_at_msk:'23:00'}];
(async()=>{
 for(const file of ['teacher-schedule.html','schedule.html']){
  const dom=new JSDOM(fs.readFileSync(file,'utf8'),{url:'https://school.test/'+file,runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
  try{
   w.SMUI={esc:s=>String(s??''),icon:()=>'',mount(){},requireAuth:async()=>({id:'teacher'})};
   w.SM={myStudents:async()=>[{student_id:'student',name:'Test pupil'}],myLessons:async()=>lessons,myLessonsAsStudent:async()=>lessons,lessonChanges:async()=>changes};
   w.eval(fs.readFileSync('sm-schedule.js','utf8'));for(const script of w.document.scripts)if(!script.src)w.eval(script.textContent);
   await tick();await tick();assert(w.document.querySelector('#pane').textContent.includes('23:00'),file+' renders incoming move');
   if(file==='teacher-schedule.html'){
    const moved=w.document.querySelector('.les.moved');assert(moved);assert.equal(moved.dataset.date,S.iso(original));
    assert.equal(moved.parentElement.querySelector('.slot').dataset.date,S.iso(dates[2]));
    w.SM.lessonChanges=async()=>{throw Error('offline')};await w.eval('load()');assert(w.document.querySelector('#retrySchedule'));assert(!w.document.querySelector('.les'));
   }
  }finally{w.close();}
 }
 // Real exercise dialog: one choice never produces a complete attempt.
 const dom=new JSDOM('<body></body>',{url:'https://school.test',runScripts:'outside-only'}),w=dom.window;
 try{
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
  w.CourseWorkUI={bind(){},mount(){},accountChanged(){}};
  w.CourseWorkStore=class{constructor(){this.user={id:'student'};this.records={};}async start(){}set(id,data){this.records[id]=data;}watch(){return ()=>{}}};
  for(const file of ['course-practice.js','course-authored.js','sm-progress.js'])w.eval(fs.readFileSync(file,'utf8'));
  let attempts=0;w.SM={saveAttempt:async()=>{attempts++;return {ok:true}}};
  const exercise={id:'e',type:'reading'},items=[{text:'Story',qs:[0,1,2].map(i=>({q:'Question '+i,opts:['yes','no'],correct:0}))}];
  const card=w.CoursePractice.card(w.CourseAuthored.model('reading',items[0]),{id:'authored:e:0',course:'test',unit:'u',onCheck:()=>w.SMProgress.report({course:'test',unit:'u'},exercise,items)});
  w.document.body.append(card);card.click();await tick();
  w.document.querySelector('.practice-choices button').click();w.document.querySelector('.practice-check').click();await tick();assert.equal(attempts,0);
  for(const row of w.document.querySelectorAll('.practice-choices'))row.querySelector('button').click();w.document.querySelector('.practice-check').click();await tick();assert.equal(attempts,1);
  w.document.querySelector('.practice-check').click();await tick();assert.equal(attempts,1);
 }finally{w.close();}
 console.log('PASS actual teacher/student calendar pages, cross-week date ownership, failed-load retry, and real exercise dialog completeness/deduplication.');
})().catch(e=>{console.error(e);process.exit(1)});
