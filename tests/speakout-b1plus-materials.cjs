const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../speakout-b1plus-active-teach');
const data=JSON.parse(fs.readFileSync(path.join(root,'assets/materials-data.js'),'utf8').split('=',2)[1].replace(/;\s*$/,''));
const items=data.items,find=id=>items.find(r=>r.id===id);
assert.equal(items.length,132);assert.equal(data.audio.length,18);
assert.equal(items.filter(r=>r.category==='tests'&&!r.teacher).length,75);
assert.equal(items.filter(r=>r.category==='photocopiables'&&!r.teacher).length,40);
assert.deepEqual(items.filter(r=>r.category==='literature'&&!r.teacher).map(r=>r.literatureLesson).sort((a,b)=>a-b),[7,8,9,10]);
for(const r of items){
 assert.equal(r.pageCount,r.images.length);
 for(const p of [r.path,r.editable,...r.images,...r.audio.map(m=>m.path)].filter(Boolean)){
  assert(!p.includes('..')&&!/^https?:/.test(p));assert(fs.existsSync(path.join(root,p)),p);
 }
 if(!r.teacher){assert(find(r.keyId)?.teacher,r.name);assert.equal(find(r.keyId).category,r.category);}
 if(r.category==='tests'&&!r.teacher)assert.equal(r.missingAudio.length,0,r.name);
 if(r.category==='literature'&&!r.teacher)assert(r.missingAudio.length>=2);
}
for(let u=1;u<=8;u++)for(const variant of 'ABC'){
 const r=find(`tests-so3-b1p-unit-test-u${u}${variant.toLowerCase()}`);
 assert.deepEqual(r.units,[u]);assert.deepEqual(r.audio.map(a=>a.track),[`UT${u}.01`]);
 assert.equal(r.keyId,'tests-so3-b1p-tests-answer-key'+(variant==='C'?'-c':''));
}
assert.deepEqual(find('tests-so3-b1p-progress-test-3a').units,[5,6]);
assert.deepEqual(find('tests-so3-b1p-progress-test-3a').audio.map(a=>a.track),['PT3.01','PT3.02']);
for(const row of JSON.parse(fs.readFileSync(path.join(root,'audit/materials.json'))).files){
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,row.path))).digest('hex'),row.sha256,row.path);
}
console.log('PASS materials: source hashes, 132 PDFs, local previews, levels, variants, answer keys and audio mappings.');

if(process.argv.includes('--browser'))(async()=>{
 const {chromium}=require('/Users/mak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1050}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const base='http://127.0.0.1:8768/speakout-b1plus-active-teach/index.html';
  await page.goto(base+'?materials=tests&materialUnit=1');
  assert(await page.locator('#modal').isVisible());
  assert.equal(await page.locator('#materialUnit').inputValue(),'1');
  assert.equal(await page.locator('[data-material="tests-so3-b1p-unit-test-u2a"]').count(),0);
  assert.equal(await page.locator('[data-material="tests-so3-b1p-tests-answer-key"]').count(),0);
  await page.locator('[data-material="tests-so3-b1p-unit-test-u1a"]').click();
  await page.waitForFunction(()=>document.querySelector('#materialImage')?.naturalWidth>0);
  const player=page.locator('.material-audio audio').first();assert((await player.getAttribute('src')).includes('ut1-01'));
  await player.evaluate(p=>p.load());await page.waitForFunction(()=>document.querySelector('.material-audio audio').readyState>=1);
  assert(await player.evaluate(p=>p.duration>0));
  await page.locator('.focus-source-controls button').last().click();assert.equal(await page.locator('.focus-source-controls button').last().getAttribute('aria-pressed'),'true');await page.locator('.material-answer summary').click();
  await page.locator('#materialNote').fill('1. went\n2. was walking');await page.locator('#materialDone').click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('speakout-b1plus-v1')).answers['material:tests-so3-b1p-unit-test-u1a']?.done);
  await page.locator('#materialKey').click();assert.match(await page.locator('#modalTitle').textContent(),/Answer Key/);
  await page.locator('#materialBack').click();assert.equal(await page.locator('#materialNote').inputValue(),'1. went\n2. was walking');
  await page.screenshot({path:'/private/tmp/speakout-b1plus-test-material.png'});
  await page.reload();await page.locator('[data-material="tests-so3-b1p-unit-test-u1a"]').click();
  assert.equal(await page.locator('#materialDone').getAttribute('aria-pressed'),'true');
  await page.locator('#materialBack').click();await page.locator('[data-category="photocopiables"]').click();
  await page.locator('[data-material="photocopiables-so3-b1p-pc-1a-grammar"]').click();
  await page.waitForFunction(()=>document.querySelector('#materialImage')?.naturalWidth>0);
  await page.screenshot({path:'/private/tmp/speakout-b1plus-worksheet.png'});
  await page.locator('#materialBack').click();await page.locator('[data-category="literature"]').click();
  assert.equal(await page.locator('#materialList .material-card').count(),4);
  await page.locator('[data-material="literature-so3-lit-lesson-09-b1p-b2p"]').click();
  assert.match(await page.locator('#modalBody').textContent(),/LL9\.01, LL9\.02/);
  await page.setViewportSize({width:390,height:844});
  await page.waitForFunction(()=>document.querySelector('#materialImage')?.naturalWidth>0);
  await page.screenshot({path:'/private/tmp/speakout-b1plus-literature-mobile.png'});
  const dims=await page.locator('#modal').evaluate(d=>[d.scrollWidth,d.clientWidth,d.getBoundingClientRect().width]);
  assert(dims[0]<=dims[1]+1&&dims[2]<=390,JSON.stringify(dims));
  await page.locator('#materialZoomIn').click();assert.equal(await page.locator('#materialZoomFit').textContent(),'125%');
  await page.keyboard.press('Escape');await page.goto(base+'?book=sb&page=8');
  await page.locator('#lessonWorksheets').click();assert.equal(await page.locator('#materialUnit').inputValue(),'1');
  assert.equal(await page.locator('#materialSearch').inputValue(),'1A');
  assert.equal(await page.locator('#materialList .material-card').count(),2);
  await page.locator('#materialSearch').fill('Grammar');
  assert.equal(await page.locator('#materialList .material-card').count(),2);
  await page.locator('#closeModal').click();
  // Supplemental notes survive the same answer backup/import used by book exercises.
  await page.locator('.answer-backup summary').click();
  const download=page.waitForEvent('download');await page.locator('#export').click();
  const saved=await download;const backup=JSON.parse(fs.readFileSync(await saved.path(),'utf8'));
  assert.equal(backup.answers['material:tests-so3-b1p-unit-test-u1a'].note,'1. went\n2. was walking');
  await page.evaluate(()=>localStorage.removeItem('speakout-b1plus-v1'));
  const second=await browser.newPage();await second.goto(base);
  await second.locator('#import').setInputFiles({name:'answers.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
  await second.waitForFunction(()=>JSON.parse(localStorage.getItem('speakout-b1plus-v1'))?.answers['material:tests-so3-b1p-unit-test-u1a']?.done);
  await second.close();assert.deepEqual(errors,[]);
  console.log('PASS materials browser: filters, original pages, test audio, separate keys, saved answers, backup/import and mobile.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
