const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {JSDOM}=require(process.env.JSDOM_PATH||'jsdom'),root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8'),M=require('../gateway-a1p-starter-review.js');
let checks=0;const ok=(value,msg)=>{assert.ok(value,msg);checks++;};
const arrays=Object.fromEntries(['GAPS','SPEAK'].map(name=>[name,JSON.parse(read('gateway-a1p-u0.html').match(new RegExp('^const '+name+'=(.*);$','m'))[1]) ]));
const oldSpec=i=>({html:arrays.GAPS[i].q,fields:[{accepted:arrays.GAPS[i].a}]});
const mondayId=M.legacyId(oldSpec(5),{unit:0,section:'gap'}),originalMonday={values:['monday'],results:['correct'],done:true,score:{correct:1,total:1},updatedAt:1};
async function page(file,cache={records:{[mondayId]:originalMonday}}){
 const html=read(file),dom=new JSDOM(html,{runScripts:'outside-only',url:'https://qa.example/'+file}),w=dom.window;
 w.SM={presentationSession:async()=>null,isCloud:false};w.CourseWorkUI={bind(){},mount(){},accountChanged(){}};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
 w.localStorage.setItem('coursework-v2:gateway-a1p:guest',JSON.stringify(cache));
 for(const f of ['coursework-store.js','course-practice.js','gateway-a1p-starter-review.js'])w.eval(read(f));
 for(const match of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g))w.eval(match[1]);
 await new Promise(r=>setImmediate(r));
 const $=s=>w.document.querySelector(s),all=s=>[...w.document.querySelectorAll(s)],click=s=>{assert.ok($(s),s);$(s).click();};
 const open=async text=>{const b=all('.coursework-preview').find(b=>b.textContent.includes(text));assert.ok(b,text);b.click();await new Promise(r=>setImmediate(r));assert.ok($('.gsr-dialog'));};
 const cacheOut=()=>JSON.parse(w.localStorage.getItem('coursework-v2:gateway-a1p:guest'));
 return {dom,w,$,all,click,open,cacheOut};
}
(async()=>{
 ok(M.grade(M.gapConfigs[5],'monday')==='incorrect','Lowercase rejected where capital explicitly taught');ok(M.grade(M.gapConfigs[5],' Monday ')==='correct','Whitespace tolerated');ok(M.grade(M.gapConfigs[0],'7')==='incorrect','Numbers require spelling');
 let t=await page('gateway-a1p-u0-grammar.html');
 await t.open('Напиши «понедельник»');ok(t.$('[data-answer]').value==='monday','Old value restored');ok(t.$('.gsr-feedback').textContent.includes('Сохранённый ответ'),'Legacy attempt asks recheck');ok(JSON.stringify(t.cacheOut().records[mondayId])===JSON.stringify(originalMonday),'Open does not change prior answer/grade');t.click('[data-action=close]');
 for(let i=0;i<6;i++){
  const c=M.gapConfigs[i];await t.open(c.prompt);t.click('[data-action=reset]');t.click('[data-action=complete]');ok(t.$('.gsr-feedback').dataset.result==='blank','Blank '+i);
  if(c.options)t.click('[data-action=answer][data-value="'+c.options.find(x=>x!==c.accepted[0])+'"]');else{t.$('[data-answer]').value=i===5?'monday':'wrong';t.$('[data-answer]').dispatchEvent(new t.w.Event('input'));}
  t.click('[data-action=complete]');ok(t.$('.gsr-feedback').dataset.result==='incorrect','Wrong '+i);
  if(c.options)t.click('[data-action=answer][data-value="'+c.accepted[0]+'"]');else{t.$('[data-answer]').value=c.accepted[0];t.$('[data-answer]').dispatchEvent(new t.w.Event('input'));}
  t.click('[data-action=complete]');ok(t.$('.gsr-feedback').dataset.result==='correct','Correct '+i);
  const id=M.legacyId(oldSpec(i),{unit:0,section:'gap'});ok(t.cacheOut().records[id].values[0]===c.accepted[0],'Original key and string value shape '+i);
  t.click('[data-action=reset]');ok(t.cacheOut().records[id].values[0]==='','Reset '+i);t.click('[data-action=undo]');ok(t.cacheOut().records[id].done,'Undo '+i);t.click('[data-action=close]');
 }
 const cache=t.cacheOut();ok(cache.records[mondayId].previousStarterReview.values[0]==='monday','Original attempt archived on edit');t.dom.window.close();
 t=await page('gateway-a1p-u0-grammar.html',cache);await t.open('Напиши «понедельник»');ok(t.$('[data-answer]').value==='Monday','Reload');t.dom.window.close();
 t=await page('gateway-a1p-u0.html',cache);
 ok(t.all('.coursework-preview').some(b=>b.textContent.includes('What two objects does Adam name?')),'Dialogue question asks only what its text supports');
 ok(!t.all('.coursework-preview').some(b=>b.textContent.includes('What is on the desk?')),'Unsupported location removed');
 for(let i=0;i<4;i++){
  await t.open((i+1)+' '+arrays.SPEAK[i]);ok(!t.$('[data-answer]'),'Oral no required text '+i);t.click('[data-action=complete]');ok(t.$('.gsr-feedback').textContent.includes('Сначала'),'Oral incomplete '+i);
  if(i===0)for(const value of t.all('[data-action=object]').slice(0,6).map(b=>b.dataset.value))t.click('[data-action=object][data-value='+value+']');
  if(i===1){t.click('[data-action=day][data-value=Monday]');t.click('[data-action=mark][data-value=date]');}
  if(i===2)for(let k=0;k<3;k++)t.click('[data-action=mark][data-value=clock'+k+']');
  if(i===3){t.click('[data-action=mark][data-value=own]');t.click('[data-action=mark][data-value=friend]');}
  t.click('[data-action=complete]');ok(t.$('.gsr-feedback').textContent.includes('Автоматической оценки'),'No false score '+i);t.click('[data-action=reset]');t.click('[data-action=undo]');ok(t.$('[data-action=complete]').textContent.includes('✓'),'Oral undo '+i);t.click('[data-action=close]');
 }
 ok(t.cacheOut().records[mondayId].values[0]==='Monday','Other exercises preserved');t.dom.window.close();
 for(const f of ['gateway-a1p-u0.html','gateway-a1p-u0-grammar.html'])ok(!/speechSynthesis|SpeechSynthesisUtterance|=>say\(/.test(read(f)),'No synthetic speech '+f);
 console.log('Gateway Starter: '+checks+' checks passed; guest fixtures only, no audio playback.');
})().catch(e=>{console.error(e);process.exitCode=1;});
