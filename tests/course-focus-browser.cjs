const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.FOCUS_BASE||'http://127.0.0.1:8787/',out=process.env.FOCUS_QA_DIR||'/tmp/course-focus-qa';fs.mkdirSync(out,{recursive:true});
const courses=(process.env.COURSES||'focus-1,focus-2,focus-3,solutions-el,solutions-int,speakout-a1,speakout-b1,speakout-b1plus,speakout-b2plus,outcomes-beginner').split(',');
const signature=d=>[...d.querySelectorAll('[data-answer],[data-response],[data-inline]')].map(f=>[f.tagName,f.getAttribute('data-answer'),f.getAttribute('data-response'),f.getAttribute('data-inline'),f.value]);
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio']});const report=[],failures=[];
try{for(const course of courses){const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true});await context.route('**/*',r=>{const u=new URL(r.request().url());return ['GET','HEAD'].includes(r.request().method())&&[new URL(base).hostname,'cdn.jsdelivr.net'].includes(u.hostname)?r.continue():r.abort()});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{await page.goto(base+course+'-active-teach/?book=sb&unit=1',{waitUntil:'domcontentloaded'});await page.waitForSelector('.cf-home [data-focus-open]',{timeout:45000});
const books=course.startsWith('focus-')?['sb','wb','ws']:['sb','wb'];
for(const book of books){
 let units;
 if(course==='speakout-b2plus')units=Array.from({length:8},(_,i)=>String(i+1));
 else{const b=page.locator('[data-book="'+book+'"]').first();if(!await b.count())continue;await b.click();await page.waitForTimeout(20);units=await page.locator('#units [data-unit]').evaluateAll(nodes=>nodes.map(n=>n.dataset.unit).filter(v=>/^\d+$/.test(v)));}
 for(const unit of units.slice(0,Number(process.env.MAX_UNITS)||units.length)){
 try{
 if(course==='speakout-b2plus'){const printed=await page.evaluate(({book,unit})=>SPEAKOUT.lessons.find(l=>String(l.unit)===unit&&l.letter==='A')[book],{book,unit});await page.goto(base+course+'-active-teach/?book='+book+'&page='+printed,{waitUntil:'domcontentloaded'});}
 else if(await page.locator('[data-cf-unit]').isVisible())await page.locator('[data-cf-unit]').selectOption(unit);else await page.locator('#units [data-unit="'+unit+'"]').click();
 if(course==='outcomes-beginner'&&book==='wb'&&unit==='0'){assert(await page.locator('.workspace').isVisible(),'Workbook reference pages remain available');assert.equal(await page.locator('main>.cf-book-surface').count(),0);console.log('Outcomes WB reference: original pages visible');continue;}
 if(course==='outcomes-beginner'&&book==='wb'&&unit==='5'){await page.waitForSelector('#focusUnitHome');console.log('Outcomes WB5: covered by dedicated 148-layout regression');continue;}
 await page.waitForSelector('.cf-home [data-focus-open]',{timeout:12000});await page.setViewportSize({width:320,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),course+' home overflows at 320px');const ids=await page.locator('.cf-home [data-focus-open]').evaluateAll(nodes=>nodes.map(n=>n.dataset.focusOpen));
 const picked=[...new Set([ids[0],ids[Math.floor(ids.length/2)],ids.at(-1)])];
 for(const id of picked){
 await page.locator('.cf-home [data-focus-open]').evaluateAll((nodes,id)=>nodes.find(n=>n.dataset.focusOpen===id).click(),id);
 await page.waitForSelector('dialog.cf-dialog[open]',{timeout:20000});const dialog=page.locator('dialog.cf-dialog[open]');
 assert.equal(await dialog.locator('.cf-task-nav select').inputValue(),id);
 const before=await dialog.evaluate(signature),layouts=[];
 for(const width of [320,820,1440]){await page.setViewportSize({width,height:width===1440?1000:1180});const answer=dialog.locator('.cf-view-tools>button').filter({hasText:/^Ответ$/});if(await answer.count())await answer.click();
 const layout=await dialog.evaluate(d=>({overflow:d.scrollWidth>d.clientWidth+2,response:d.querySelector('.cf-responses')?.getBoundingClientRect().width,dialogWidth:d.clientWidth,heading:d.querySelector('.cf-heading')?.textContent}));assert(!layout.overflow,course+' '+id+' overflow '+width);assert(layout.response>0,course+' '+id+' hidden responses '+width);if(width<760)assert(layout.response>layout.dialogWidth*.75,course+' '+id+' compressed response column '+width);layouts.push({width,overflow:layout.overflow});assert.deepEqual(await dialog.evaluate(signature),before,course+' '+id+' values changed during layout');
 }
 const material=dialog.locator('.cf-view-tools>button').filter({hasText:/^Задание$/});if(await material.count()){await material.click();assert((await dialog.locator('.cf-source').boundingBox())?.width>0,course+' '+id+' material inaccessible')}
 report.push({course,book,unit,id,fields:before.length,layouts});await dialog.locator('.cf-head>button').click();await page.waitForTimeout(30);
 }
 console.log(course+' '+book+' unit '+unit+': '+picked.length+' tasks passed');
 }catch(e){failures.push({course,book,unit,error:e.message,errors:[...errors]});console.log(JSON.stringify(failures.at(-1)));await page.screenshot({path:out+'/'+course+'-'+book+'-'+unit+'-failure.png'}).catch(()=>{});await page.locator('dialog[open]').evaluateAll(nodes=>nodes.forEach(d=>d.close())).catch(()=>{});await page.waitForTimeout(30);if(process.env.FAIL_FAST)throw e}
 }
}
if(errors.length)failures.push({course,errors});
}catch(e){failures.push({course,error:e.message,errors})}await context.close();}
fs.writeFileSync(out+'/course-focus-coverage.json',JSON.stringify({checks:report.length,layouts:report.length*3,courses,report,failures},null,2));console.log(JSON.stringify({checked:report.length,layouts:report.length*3,failures},null,2));assert.deepEqual(failures,[]);
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
