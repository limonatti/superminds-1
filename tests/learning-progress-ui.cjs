const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
(async()=>{
 for(const page of ['trainer.html','pet.html','cabinet.html']){
  const dom=new JSDOM(fs.readFileSync(page,'utf8'),{url:'https://school.test/'+page,runScripts:'outside-only'}),w=dom.window;
  let reads=0,writes=0;
  w.SM_UNITS=[{id:'u1',title:'Тест',words:[{en:'cat',ru:'кот'}]}];w.SM_ALL_WORDS=[{id:'u1-0',unit:'u1',en:'cat',ru:'кот'}];
  w.SM_COURSE={id:'test',title:'Тест'};w.SM_COURSE_DATA={};
  w.SM={isCloud:true,getUser:async()=>({id:'synthetic',name:'Тестовый ученик'}),
   loadProgress:async()=>{reads++;throw Error('Не удалось загрузить прогресс. Проверьте подключение и попробуйте снова.');},
   saveProgress:()=>{writes++;}};
  for(const script of w.document.querySelectorAll('script:not([src])'))w.eval(script.textContent);
  for(let n=0;n<5;n++)await new Promise(resolve=>setImmediate(resolve));
  const root=w.document.getElementById(page==='trainer.html'?'banner':'root');
  assert.match(root.textContent,/Не удалось загрузить прогресс/);assert.match(root.textContent,/Повторить загрузку/);
  assert.equal(writes,0);assert.equal(reads,1);
  if(page==='trainer.html'){assert.equal(w.document.querySelector('.stats').style.display,'none');assert.equal(w.document.getElementById('stage').children.length,0);}
  else {root.querySelector('button').click();for(let n=0;n<5;n++)await new Promise(resolve=>setImmediate(resolve));assert.equal(reads,2);}
  dom.window.close();
 }
 console.log('PASS real trainer, cabinet and pet HTML: readable load error, retry, no false zero statistics, no writes on failure.');
})().catch(error=>{console.error(error);process.exitCode=1;});
