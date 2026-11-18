const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root={window:{}};vm.runInNewContext(fs.readFileSync('speakout-b2plus-active-teach/data/exercises.js','utf8'),root);vm.runInNewContext(fs.readFileSync('speakout-b2plus-active-teach/data/notes.js','utf8'),root);
const id='sb-133-2A-1',exercise=root.window.SPEAKOUT_EXERCISES['sb:133'].find(e=>e.id===id),check=require('../speakout-b2plus-active-teach/assets/answer-checker.js'),policy=require('../speakout-b2plus-active-teach/assets/exercise-policy.js');
const answers=['hang around','drifted apart','fallen out','take to, warm to','invited, along','bumped into','stop by','come between'];
assert.equal(exercise.lesson,'1A');assert.deepEqual(Array.from(exercise.fields,f=>f.n),['1','2','3','4','5','6','7','8']);
for(let i=0;i<8;i++){assert(check.correct(answers[i],exercise.fields[i]));assert(!check.correct('wrong answer',exercise.fields[i]));assert(root.window.SPEAKOUT_KEYS['1A'].includes(answers[i]));assert.equal((exercise.fields[i].prompt.match(/_____/g)||[]).length,[3,4].includes(i)?2:1)}
assert(!check.correct('take to',exercise.fields[3]));assert(!check.correct('along, invited',exercise.fields[4]));assert(check.correct('invited; along',exercise.fields[4]));assert(!policy.attempted(exercise,{}));
console.log('PASS supplied vocabulary key, eight stable fields, complete prompts and ordered two-gap grading.');
if(process.argv.includes('--browser'))(async()=>{
 const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),base=process.env.FOCUS_BASE||'http://127.0.0.1:8787/',out=process.env.FOCUS_QA_DIR||'/tmp/course-focus-qa';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio']}),context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true});
 await context.route('**/*',r=>['GET','HEAD'].includes(r.request().method())&&[new URL(base).hostname,'cdn.jsdelivr.net'].includes(new URL(r.request().url()).hostname)?r.continue():r.abort());
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
 await page.goto(base+'speakout-b2plus-active-teach/index.html?book=sb&page=134');await page.waitForFunction(()=>B2Store.ready&&document.querySelector('#pageImg').naturalWidth>0);
 const open=async()=>{await page.locator('[data-focus-open="'+id+'"]').click();await page.waitForSelector('#mdExercise.cf-dialog[open]')};await open();
 const d=page.locator('#mdExercise'),step=d.locator('.cf-stepper select');await d.locator('.cf-view-tools>button').filter({hasText:/^Ответ$/}).click();
 assert.equal(await d.locator('.play-slot,.play-workbench').count(),0,'no floating image-gap editors');assert.equal(await d.locator('[data-answer]').count(),8);assert.equal(await d.locator('.exercise-key details,details.exercise-key').count(),0,'key hidden before attempt');
 for(let i=0;i<8;i++){await step.selectOption(String(i));await d.locator('[data-answer="'+(i+1)+'"]').fill(i===1?'wrong answer':answers[i]);assert.equal(await d.locator('.exercise-field:visible').count(),1,'only the selected question remains visible')}
 await d.locator('#exerciseCheck').click();await step.selectOption('1');assert.equal(await d.locator('.exercise-field:visible .field-result').innerText(),'Попробуйте ещё раз');
 await step.selectOption('0');assert.equal(await d.locator('.exercise-field:visible .field-result').innerText(),'Верно');
 await d.locator('details.exercise-key summary').click();assert((await d.locator('details.exercise-key p').innerText()).includes('2 drifted apart'));
 await step.selectOption('1');await d.locator('[data-answer="2"]').fill('drifted apart');assert.equal(await d.locator('details.exercise-key').count(),0,'editing resets key gate');await d.locator('#exerciseCheck').click();assert.equal(await d.locator('.exercise-field:visible .field-result').innerText(),'Верно');
 for(const width of [320,820,1440]){await page.setViewportSize({width,height:width===1440?1000:1180});assert(await d.evaluate(d=>d.scrollWidth<=d.clientWidth+2));if(width<760)assert(await d.evaluate(d=>d.querySelector('.cf-responses').getBoundingClientRect().width>d.clientWidth*.75));await step.selectOption('3');assert.equal(await d.locator('.exercise-field:visible [data-answer]').inputValue(),'take to, warm to');await step.selectOption('4');assert.equal(await d.locator('.exercise-field:visible [data-answer]').inputValue(),'invited, along')}
 await page.setViewportSize({width:390,height:844});await step.selectOption('1');await page.screenshot({path:out+'/speakout-b2plus-vocabulary-1a-fixed.png'});
 await d.locator('.cf-head>button').click();await page.waitForTimeout(50);assert(!await d.isVisible());await page.reload();await page.waitForFunction(()=>B2Store.ready&&document.querySelector('#pageImg').naturalWidth>0);await open();assert.deepEqual(await d.locator('[data-answer]').evaluateAll(nodes=>nodes.map(n=>n.value)),answers);await page.keyboard.press('Escape');assert(!await d.isVisible());assert.deepEqual(errors,[]);
 console.log('PASS browser: correct/wrong/reveal/reset, one visible question, 320/820/1440 widths, close/Escape, saved responses after reload; no remote writes.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
