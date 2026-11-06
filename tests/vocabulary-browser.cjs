const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{
 const root=process.cwd(),server=http.createServer((req,res)=>{let f=path.join(root,decodeURIComponent(req.url.split('?')[0]));try{res.setHeader('Content-Type',f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(f));}catch{res.statusCode=404;res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
 browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 // No requests or progress writes to real student accounts.
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url()),name=path.basename(url.pathname);
  if(url.hostname!=='127.0.0.1')return route.abort();
  const stubs={
   'sm-auth.js':`window.SM={listCourses:async()=>({courses:[],units:[]}),getUser:async()=>null,loadProgress:async()=>({}),saveProgress:async()=>({ok:true}),pickCourse:async id=>SM_useCourse(id),isCloud:false};`,
   'sm-shell.js':`window.SMUI={mount(){},icon:()=>'',esc:s=>String(s||'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]))};`,
   'sm-play.js':`window.SMP={sfx(){}};`,
   'sm-mywords.js':'','sm-pwa.js':'','sm-lookup.js':''};
  if(Object.hasOwn(stubs,name))return route.fulfill({contentType:'text/javascript',body:stubs[name]});
  return route.continue();
 });
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base=`http://127.0.0.1:${server.address().port}`;
 await page.addInitScript(()=>{localStorage.setItem('sm-course','sm1');window.SM_speak=()=>{};});
 await page.goto(base+'/vocabulary.html?course=outcomes-beginner&unit=outc-u5');
 await page.locator('.wgrid .w').first().waitFor();assert.equal(await page.locator('.wgrid .w').count(),106);
 assert.equal(await page.locator('.li.on .t').innerText(),'Unit 5 · Going places');
 const cardLink=await page.locator('a.go').getAttribute('href');assert(cardLink.includes('course=outcomes-beginner'));assert(cardLink.includes('unit=outc-u5'));
 await page.locator('a.go').click();await page.waitForFunction(()=>typeof pool==='function'&&pool().length===106);
 assert.deepEqual(await page.evaluate(()=>[SM_COURSE.id,selectedUnits]),['outcomes-beginner',['outc-u5']]);
 assert(await page.locator('#greet').innerText().then(t=>t.includes('Unit 5')));
 // Explicit all -> clicking Unit 5 must select ONLY Unit 5, never all except 5.
 await page.getByRole('button',{name:'Все юниты · вперемешку',exact:true}).click();
 await page.getByRole('button',{name:'📘 · Unit 5 · Going places',exact:true}).click();
 assert.deepEqual(await page.evaluate(()=>selectedUnits),['outc-u5']);
 const game=await page.locator('#modes a').getAttribute('href');assert(game.includes('course=outcomes-beginner')&&game.includes('unit=outc-u5'));
 await page.reload();await page.waitForFunction(()=>typeof pool==='function'&&pool().length===106);
 assert.deepEqual(await page.evaluate(()=>selectedUnits),['outc-u5']);
 // All modes share the same pool; even answer distractors stay in the unit.
 assert(await page.evaluate(()=>pool().every(w=>distractors(w,3).every(x=>x.unitId==='outc-u5'&&x.ru!==w.ru))));
 for(const m of ['flash','listen','chooseEn','chooseRu','type','assemble','pairs','mix']){
  await page.evaluate(m=>{mode=m;renderModes();nextRound()},m);
  assert.deepEqual(await page.evaluate(()=>[...new Set(pool().map(w=>w.unitId))]),['outc-u5']);
  assert(await page.locator('#stage').innerText());
 }
 // A small unit must not pull distractors from other units.
 assert.equal(await page.evaluate(()=>{const w=pool()[0];SM_ALL_WORDS=SM_ALL_WORDS.filter(x=>x.unitId!==w.unitId||x.id===w.id);return distractors(w,3).length}),0);
 for(const query of ['course=outcomes-beginner&unit=outc-u99','course=outcomes-beginner&unit=sel-u5','course=missing&unit=outc-u5']){
  await page.goto(base+'/trainer.html?'+query);await page.waitForFunction(()=>document.getElementById('stage').textContent.includes('не найден'));
  assert.equal(await page.evaluate(()=>pool().length),0);
 }
 // Every available unit on every bundled course opens the exact dictionary bank.
 await page.goto(base+'/vocabulary.html?course=solutions-el&unit=sel-u5');await page.locator('.wgrid .w').first().waitFor();
 const routes=await page.evaluate(()=>Object.entries(SM_COURSE_DATA).flatMap(([course,units])=>units.map(u=>({course,id:u.id,count:u.words.length}))));
 for(const r of routes){
  await page.evaluate(r=>{SM_useCourse(r.course);sel=units().findIndex(u=>u.id===r.id);drawList();drawPane();},r);
  assert.equal(await page.locator('.wgrid .w').count(),r.count,`${r.course}/${r.id}`);
  const href=await page.locator('a.go').getAttribute('href');assert(href.includes(`course=${r.course}`)&&href.includes(`unit=${r.id}`));
 }
 await page.goto(base+'/vocabulary.html?course=outcomes-beginner&unit=outc-u5');await page.locator('.wgrid .w').first().waitFor();
 await page.screenshot({path:'/tmp/unit-vocabulary-verified.png',fullPage:false});
 assert.deepEqual(errors,[]);console.log(`Browser: ${routes.length} dictionary links, isolated Unit 5 in 8 modes, reload, choices, invalid links passed.`);
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
