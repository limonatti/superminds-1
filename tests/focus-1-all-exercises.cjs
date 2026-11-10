/* Exhaustive player smoke test, with no real account or remote writes.
   Semantic keys have independent source fixtures in focus-1.cjs. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..'),BASE=process.env.FOCUS_TEST_BASE||'http://127.0.0.1:8788/';
const D=JSON.parse(fs.readFileSync(path.join(ROOT,'focus-1-active-teach/assets/course.js'),'utf8').split('=').slice(1).join('=').trim().replace(/;$/,''));
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio']}),errors=[],report=[];
 for(const width of [1440,390]){const c=await browser.newContext({viewport:{width,height:width===390?844:1000}});
 await c.addInitScript(()=>{const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){this.muted=true;this.volume=0;if(!this.muted||this.volume!==0)throw Error('Silent QA required');return play.call(this)}});
 await c.route('**/cdn.jsdelivr.net/**',r=>r.fulfill({body:''}));await c.route('**/sm-auth.js*',r=>r.fulfill({body:'window.SM={getUser:async()=>null};'}));
 const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));let n=0;
 for(const book of ['sb','wb','ws']){const pages=D.pages.filter(q=>q.book===book&&q.exercises.length),first=pages[0];await p.goto(BASE+`focus-1-active-teach/index.html?book=${book}&page=${first.page}&ex=${first.exercises[0].id}`);await p.waitForSelector('#exercise[open]');
 for(const pg of pages)for(const e of pg.exercises){const result=await p.evaluate(({e,width})=>{
  const q=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)],problem=[];
  if(new URL(location.href).searchParams.get('ex')!==e.id)problem.push('Wrong exercise URL');
  if(width<760)q('[data-exercise-pane="answers"]').click();
  const inputs=all('[data-answer]');if(inputs.length!==(e.answerSpec.length||1))problem.push('Wrong field count');
  if(e.answerSpec.length){
   inputs.forEach((el,i)=>el.value=e.answerSpec[i].kind==='set'?e.answerSpec[i].members.map(m=>m[0]).join('; '):e.answerSpec[i].accepted[0]);
   q('#answerForm').dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}));
   if(all('.answer-row.correct').length!==e.answerSpec.length)problem.push('Correct values rejected: '+q('#feedback').textContent);
   inputs[0].value='wrong test answer zxq';inputs[0].dispatchEvent(new Event('input',{bubbles:true}));q('#answerForm').dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}));
   if(!q('.answer-row.incorrect'))problem.push('Wrong value accepted');
  }else {inputs[0].value='QA: free response';inputs[0].dispatchEvent(new Event('input',{bubbles:true}));}
  for(const selector of ['#exercise','#solutionColumns','.focus-responses']){const el=q(selector);if(el.scrollWidth>el.clientWidth+2)problem.push(selector+' horizontal overflow '+el.scrollWidth+'/'+el.clientWidth);}
  const pane=q('.focus-responses');pane.scrollTop=pane.scrollHeight;const last=q('#keyPanel')?.hidden?q('#feedback'):q('#keyPanel');if(last&&last.getBoundingClientRect().bottom>pane.getBoundingClientRect().bottom+3)problem.push('Bottom controls unreachable');
  if(width<760)q('[data-exercise-pane="source"]').click();const source=q('#solutionOriginal');if(source.scrollWidth>source.clientWidth+2)problem.push('Source overflow at fit');
  if(!q('.focus-sheet svg'))problem.push('Missing original');
  const ids=all('input[id],textarea[id],button[id],label[id]').map(x=>x.id);if(ids.length!==new Set(ids).size)problem.push('Duplicate control IDs');
  q('#exerciseNext').click();return {id:e.id,width,fields:inputs.length,kind:e.activity.kind,problem};
 },{e,width});report.push(result);n++;if(result.problem.length)console.log('FAIL',JSON.stringify(result));if(n%200===0)console.log(width,n,'exercises checked');
 }
 }
 await c.close();console.log(width,n,'completed');
 }
 fs.writeFileSync(process.env.FOCUS_QA_REPORT||'/private/tmp/focus-1-qa/all-exercises.json',JSON.stringify({tested:report.length,errors,results:report},null,2));
 await browser.close();assert.deepEqual(errors,[]);assert.equal(report.filter(r=>r.problem.length).length,0,'See per-exercise audit report');console.log('PASS:',report.length,'desktop/mobile exercise runs');
})().catch(e=>{console.error(e);process.exitCode=1});
