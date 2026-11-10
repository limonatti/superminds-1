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
 for(const pg of pages){await p.evaluate(()=>localStorage.clear());await p.goto(BASE+`focus-1-active-teach/index.html?book=${book}&page=${pg.page}&ex=${pg.exercises[0].id}`);await p.waitForSelector('#exercise[open]');for(const e of pg.exercises){const result=await p.evaluate(({e,width})=>{
  const q=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)],problem=[];
  if(new URL(location.href).searchParams.get('ex')!==e.id)problem.push('Wrong exercise URL');
  if(width<760)q('[data-exercise-pane="answers"]').click();
  const inputs=all('[data-answer]');if(inputs.length!==(e.answerSpec.length||1))problem.push('Wrong field count');
  if(e.answerSpec.length){
   const mark=window.FocusMarking;
   if(e.activity.kind==='wordsearch'){
    for(const path of e.activity.paths){q(`[data-cell="${path.cells[0]}"]`).click();q(`[data-cell="${path.cells.at(-1)}"]`).click();}
   }else inputs.forEach((el,i)=>{
    const field=e.answerSpec[i],m=e.activity.fields[i],wanted=field.kind==='set'?field.members.map(x=>x[0]):field.accepted;
    if(m.options?.length){const j=m.options.findIndex(o=>mark.checkField(o.value,field));if(j<0)problem.push('No correct option '+i);else q(`[data-option="${i}:${j}"]`).click();}
    else if(m.multiOptions?.length){for(const member of field.members){const j=m.multiOptions.findIndex(o=>mark.checkText(o.value,member));if(j<0)problem.push('No set member '+i);else q(`[data-multi="${i}:${j}"]`).click();}}
    else if(e.activity.bank?.length){el.focus();const j=e.activity.bank.findIndex(v=>mark.checkField(v,field));if(j<0)problem.push('No bank word '+i);else q(`[data-bank="${j}"]`).click();}
    else if(m.tokens?.length){
     let order=null;
     if(m.tokenJoin===''){
      const available=m.tokens.map((t,j)=>({t,j}));order=Array.from(wanted[0]).map(t=>{const at=available.findIndex(x=>x.t===t);return at<0?-1:available.splice(at,1)[0].j});
     }else{
      // Token composition is literal. Contextual marking normalization (e.g.
      // What's the -> what is the, or a standalone dash -> zero article)
      // cannot be applied to one token at a time.
      const literal=v=>v.normalize('NFKC').replace(/[‘’]/g,"'").replace(/[–—−]/g,'-').toLowerCase().trim();
      function arrange(rest,unused,normalize){if(!rest)return [];for(const j of unused){const t=normalize(m.tokens[j]);if(!t)continue;if(rest===t||rest.startsWith(t+' ')){const result=arrange(rest.slice(t.length).trim(),unused.filter(k=>k!==j),normalize);if(result)return [j,...result];}}return null;}
      for(const normalize of [literal,mark.normalize]){for(const value of wanted){order=arrange(normalize(value),m.tokens.map((_,j)=>j),normalize);if(order)break;}if(order)break;}
     }
     if(!order||order.includes(-1))problem.push('Unbuildable tokens '+i);else for(const j of order){const b=q(`[data-token="${i}:${j}"]`);if(b.disabled)problem.push('Token prematurely disabled '+i+':'+j);b.click();}
    }else problem.push('No click interaction '+i);
   });
   q('#answerForm').dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}));
   if(all('.answer-row.correct').length!==e.answerSpec.length)problem.push('Correct values rejected: '+q('#feedback').textContent);
   inputs[0].value='wrong test answer zxq';inputs[0].dispatchEvent(new Event('input',{bubbles:true}));q('#answerForm').dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}));
   if(!q('.answer-row.incorrect'))problem.push('Wrong value accepted');
  }else {
   for(let i=0;i<e.activity.cards.length;i++){
    const choice=q(`[data-support="${i}:0"]`);choice?.click();q(`[data-card-done="${i}"]`).click();
   }
   if(!inputs[0].value.includes('✓'))problem.push('Card completion not saved');
  }
  for(const selector of ['#exercise','#solutionColumns','.focus-responses']){const el=q(selector);if(el.scrollWidth>el.clientWidth+2)problem.push(selector+' horizontal overflow '+el.scrollWidth+'/'+el.clientWidth);}
  const pane=q('.focus-responses');pane.scrollTop=pane.scrollHeight;const last=q('#keyPanel')?.hidden?q('#feedback'):q('#keyPanel');if(last&&last.getBoundingClientRect().bottom>pane.getBoundingClientRect().bottom+3)problem.push('Bottom controls unreachable');
  if(width<760)q('[data-exercise-pane="source"]').click();const source=q('#solutionOriginal');if(source.scrollWidth>source.clientWidth+2)problem.push('Source overflow at fit');
  if(!q('.focus-sheet svg'))problem.push('Missing original');
  for(const svg of all('.focus-sheet svg'))if(svg.dataset.box!=='[0,0,1,1]')problem.push('Original page cropped');
  for(const el of all('.answer-number,.answer-prompt,.activity-options button,.activity-tokens button,.activity-bank button,.guided-prompt'))if(el.clientWidth&&el.scrollWidth>el.clientWidth+2)problem.push('Clipped text '+el.textContent.slice(0,40));
  const ids=all('input[id],textarea[id],button[id],label[id]').map(x=>x.id);if(ids.length!==new Set(ids).size)problem.push('Duplicate control IDs');
  q('#exerciseNext').click();return {id:e.id,width,fields:inputs.length,kind:e.activity.kind,problem};
 },{e,width});report.push(result);n++;if(result.problem.length)console.log('FAIL',JSON.stringify(result));if(n%200===0)console.log(width,n,'exercises checked');
 }}
 }
 await c.close();console.log(width,n,'completed');
 }
 fs.writeFileSync(process.env.FOCUS_QA_REPORT||'/private/tmp/focus-1-qa/all-exercises.json',JSON.stringify({tested:report.length,errors,results:report},null,2));
 await browser.close();assert.deepEqual(errors,[]);assert.equal(report.filter(r=>r.problem.length).length,0,'See per-exercise audit report');console.log('PASS:',report.length,'desktop/mobile exercise runs');
})().catch(e=>{console.error(e);process.exitCode=1});
