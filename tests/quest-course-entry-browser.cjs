const assert=require('node:assert/strict'),fs=require('node:fs'),{chromium}=require('playwright');
const base=process.env.QUEST_BASE||'http://127.0.0.1:8766/',out=process.env.QUEST_QA_DIR||'/tmp/future-academy-entry';
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio']});
try{const ctx=await browser.newContext({viewport:{width:1440,height:1000}}),page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
if(!process.env.QUEST_LIVE){await ctx.route('**/sm-auth.js?*',r=>r.fulfill({contentType:'text/javascript',body:'window.SM={presentationSession:async()=>null,getUser:async()=>null,watchPresentationAuth:()=>()=>{}};'}));await ctx.route('**/npm/@supabase/**',r=>r.fulfill({body:''}));}
await page.goto(base+'focus-4-active-teach/index.html',{waitUntil:'networkidle'});await page.waitForSelector('.course-quest-shortcuts');
assert.equal(await page.locator('[data-cf-page]').inputValue(),'4');
const nav=page.locator('.course-quest-shortcuts'),start=nav.getByRole('link',{name:'Start The Future Academy',exact:true}),pdf=nav.getByRole('link',{name:'Open or print The Future Academy PDF',exact:true});
assert(await start.isVisible());assert(await pdf.isVisible());assert((await nav.boundingBox()).y<600);
assert.equal(await start.getAttribute('href'),'/quests/focus4-live-and-learn/');assert.equal(await pdf.getAttribute('href'),'/quests/focus4-live-and-learn/focus4-live-and-learn-quest.pdf');
await page.screenshot({path:out+'/desktop.png',fullPage:true});
await page.setViewportSize({width:390,height:844});assert(await start.isVisible());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:out+'/mobile.png',fullPage:true});
await page.locator('[data-cf-page]').selectOption('5');assert(await page.locator('[data-cf-home-page="5"] [data-quest="focus4-live-and-learn"]').isVisible());
assert.equal(await page.locator('[data-cf-home-page="5"] [data-quest="focus4-live-and-learn"]').count(),1);
await page.locator('[data-cf-unit]').selectOption('2');assert.equal(await page.locator('.course-quest-shortcuts').count(),0);
await page.locator('[data-book="ws"]').click();assert.equal(await page.locator('.course-quest-shortcuts').count(),0);assert.equal(await page.locator('.course-quest-entry').count(),0);
assert.deepEqual(errors,[]);console.log(JSON.stringify({defaultPage:4,shortcut:true,pdf:true,afterPage5:true,mobile:true,otherUnitAbsent:true,wordStoreAbsent:true,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
