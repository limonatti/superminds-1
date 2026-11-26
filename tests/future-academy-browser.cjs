const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const base=process.env.QUEST_BASE||'http://127.0.0.1:8766/',out=process.env.QUEST_QA_DIR||'/tmp/future-academy-qa';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio']});const ctx=await browser.newContext({viewport:{width:1440,height:1000}});
 // Use a fresh guest session. Never touch real student records.
 if(!process.env.QUEST_LIVE){await ctx.route('**/sm-auth.js?*',r=>r.fulfill({contentType:'text/javascript',body:'window.SM={presentationSession:async()=>null,getUser:async()=>null,watchPresentationAuth:()=>()=>{}};'}));await ctx.route('**/npm/@supabase/**',r=>r.fulfill({body:''}));}
 await ctx.addInitScript(()=>{document.addEventListener('loadedmetadata',e=>{if(e.target instanceof HTMLMediaElement){e.target.muted=true;e.target.volume=0;}},true);});
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
 await page.goto(base+'quests/focus4-live-and-learn/',{waitUntil:'domcontentloaded',timeout:60000});await page.waitForFunction(()=>document.querySelector('#saveStatus').textContent.includes('Guest'),{timeout:30000});
 await page.screenshot({path:path.join(out,'desktop.png'),fullPage:true});
 await page.getByRole('button',{name:'Start quest',exact:false}).click();await page.locator('[data-slot="0"]').focus();await page.keyboard.press('Enter');await page.locator('[data-token="3"]').focus();await page.keyboard.press('Space');
 assert.equal(await page.locator('[data-slot="0"]').textContent(),'a lecture');await page.reload({waitUntil:'domcontentloaded',timeout:60000});await page.waitForFunction(()=>document.querySelector('[data-slot="0"]')?.textContent==='a lecture');
 let layouts=0;for(const width of [320,390,820,1440]){await page.setViewportSize({width,height:1000});for(let i=0;i<12;i++){await page.locator('#taskPicker').selectOption(String(i));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow at ${width}, challenge ${i+1}`);assert(!/[А-Яа-яЁё]/.test(await page.locator('#workbench').innerText()),'English learner text');layouts++;}}
 await page.locator('#taskPicker').selectOption('2');await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>{const i=document.querySelector('.picture-clues img');return i?.complete&&i.naturalWidth>0;},{},{timeout:60000});await page.screenshot({path:path.join(out,'mobile-gallery.png'),fullPage:true});
 await page.locator('#taskPicker').selectOption('7');await page.locator('.transcript>summary').click();
 // Silence is established and verified before Play, including the repeat control.
 await page.locator('#courseAudio').evaluate(a=>{a.muted=true;a.volume=0;a.preload='metadata';a.load();});await page.waitForFunction(()=>document.querySelector('#courseAudio').readyState>=1,{},{timeout:60000});
 const media=await page.locator('#courseAudio').evaluate(a=>({muted:a.muted,volume:a.volume,duration:a.duration}));assert(media.muted&&media.volume===0);assert(media.duration>30);
 await page.locator('#repeatAudio').click();await page.waitForFunction(()=>document.querySelector('#courseAudio').currentTime>0);await page.locator('#courseAudio').evaluate(a=>a.pause());
 await page.evaluate(()=>{window.print=()=>{window.__printAsked=true;};});await page.locator('#printAnswers').click();assert(await page.evaluate(()=>window.__printAsked));await page.emulateMedia({media:'print'});assert(await page.locator('#printSheet').isVisible());assert.equal(await page.locator('#printSheet article').count(),13);await page.pdf({path:path.join(out,'answers-print.pdf'),format:'A4',printBackground:true});await page.emulateMedia({media:'screen'});
 const pdf=await ctx.request.get(base+'quests/focus4-live-and-learn/focus4-live-and-learn-quest.pdf',{timeout:120000});assert.equal(pdf.status(),200);const bytes=await pdf.body();assert(bytes.subarray(0,5).toString()==='%PDF-');
 // The entry follows all tasks on SB page 5 and is absent from Word Store.
 await page.goto(base+'focus-4-active-teach/index.html?book=sb&unit=1&page=5',{waitUntil:'domcontentloaded',timeout:60000});await page.waitForSelector('[data-cf-home-page="5"] [data-quest="focus4-live-and-learn"]');
 assert(await page.locator('[data-cf-home-page="5"]').evaluate(g=>g.lastElementChild.dataset.quest==='focus4-live-and-learn'));await page.locator('[data-book="ws"]').click();assert.equal(await page.locator('.course-quest-entry').count(),0);
 assert.deepEqual(errors,[]);const result={layouts,keyboard:true,reload:true,english:true,print:true,pdfBytes:bytes.length,pdfSHA256:require('crypto').createHash('sha256').update(bytes).digest('hex'),audio:media,placement:'after SB page 5; absent from Word Store',errors};fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
