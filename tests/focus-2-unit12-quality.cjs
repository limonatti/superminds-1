const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const base='focus-2-active-teach/',read=f=>fs.readFileSync(f,'utf8');
const D=JSON.parse(read(base+'assets/course.js').split('=').slice(1).join('=').trim().replace(/;$/,''));
const tasks=D.pages.find(p=>p.id==='sb-6').exercises,M=require('../focus-2-active-teach/assets/marking.js'),UI=require('../focus-2-active-teach/assets/interactions.js');
assert.equal(tasks.length,7);assert(tasks.every(e=>e.reviewedUnit12));
const expected={2:['f','b','a','c','e'],3:['do','is','Have','inspires'],4:[['is','she'],['do','you','admire','her'],['is','she','trying','to','do'],['you','ever','seen','her','in person'],['is','she','doing','now']],5:[['has','joined','Amnesty International'],['has','Neil','joined'],['can','speak','three languages'],['can','Rosie','speak'],['has','visited','London'],['has','Dave','visited'],['is','reading','Barack Obama’s biography'],['is','Tom','reading'],['admires','Emma Watson'],['does','Viv','admire']]};
const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));
const html=read(base+'index.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
const dom=new JSDOM(html,{url:'https://test.invalid/focus-2-active-teach/index.html?book=sb&unit=1&page=6&ex=sb-6-1',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc}),w=dom.window;
w.ResizeObserver=class{observe(){}disconnect(){}};w.CSS={escape:String};w.HTMLElement.prototype.scrollIntoView=()=>{};w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};w.HTMLMediaElement.prototype.pause=function(){this._paused=true};w.HTMLMediaElement.prototype.play=async function(){assert(this.muted,'all test media must be muted');this._paused=false;this.dispatchEvent(new w.Event('play'))};Object.defineProperty(w.HTMLMediaElement.prototype,'paused',{get(){return this._paused!==false}});w.HTMLCanvasElement.prototype.getContext=()=>({measureText:s=>({width:s.length*8})});
let store;w.CourseWorkStore=class{constructor(){store=this;this.user=null;this.records={};}async start(){}key(){return'test'}capture(rows){this.records=rows}async flush(){return{ok:true}}};w.CourseWorkUI={bind(){},accountChanged(){}};w.Focus2Assign={create:()=>({init(){},refresh(){},has(){return false}})};
for(const f of ['exercise-source.js','exercise-play.js',base+'assets/exercise-sources.js',base+'assets/exercise-gaps.js',base+'assets/course.js',base+'assets/interactions.js',base+'assets/marking.js','focus-2-homework.js','course-focus.js',base+'assets/focus-models.js',base+'assets/lesson-audio.js',base+'assets/app.js']){const script=w.document.createElement('script');script.src='https://test.invalid/'+f;Object.defineProperty(w.document,'currentScript',{configurable:true,value:script});w.eval(read(f));}
const q=s=>w.document.querySelector(s),qa=s=>[...w.document.querySelectorAll(s)],open=id=>{const s=q('[aria-label="Выбрать задание"]');s.value=id;s.dispatchEvent(new w.Event('change'))},clickText=(host,text)=>{const b=[...host.querySelectorAll('button')].find(b=>b.textContent===text);assert(b,text);b.click();};
(async()=>{await new Promise(r=>setImmediate(r));let count=0;
for(const e of tasks){open(e.id);assert.equal(q('#keyPanel').hidden,true);assert(qa('#fields [data-answer]').every(x=>!x.value));assert.equal(qa('#fields input[required],#fields textarea[required]').length,0);
 const show=q('[aria-label="Показать все пункты задания"]');show?.click();
 if(expected[e.label]){
  q('#check').click();assert.match(q('#feedback').textContent,/Сначала/);assert(q('#keyPanel').hidden);
  const rows=qa('#fields .answer-row');
  rows.forEach((row,i)=>{
   const spec=e.answerSpec[i];assert(!M.checkField('',spec));
   if(e.interaction.type==='choices'){row.querySelector('button').click();clickText(row,e.interaction.rows[i].options.find(o=>o.value===expected[e.label][i]).label);}
   else{clickText(row,e.interaction.rows[i].tokens.find(t=>!M.checkField(t,spec)));assert(!M.checkField(row.querySelector('[data-answer]').value,spec));clickText(row,'Очистить');for(const t of expected[e.label][i])clickText(row,t);}
   assert(M.checkField(row.querySelector('[data-answer]').value,spec),e.id+'/'+i);count++;
  });
  q('#check').click();assert.equal(store.records[e.id].score.correct,rows.length);assert.equal(q('#keyPanel').hidden,false);
  const vals=qa('#fields [data-answer]').map(x=>x.value);open(e.id);assert.deepEqual(qa('#fields [data-answer]').map(x=>x.value),vals,'reopen preserves answers');
  q('#resetAnswer').click();assert(qa('#fields [data-answer]').every(x=>!x.value));assert(q('#keyPanel').hidden);
 }else{
  assert.equal(e.answerSpec.length,0);assert(q('#check').hidden);const b=q('.practice-mark');b.click();assert.equal(b.getAttribute('aria-pressed'),'true');q('#reflection').value='Personal test note';q('#reflection').dispatchEvent(new w.Event('input',{bubbles:true}));open(e.id);assert.equal(q('#reflection').value,'Personal test note');assert.equal(q('.practice-mark').getAttribute('aria-pressed'),'true');assert(!store.records[e.id].score);q('#resetAnswer').click();assert.equal(q('#reflection').value,'');assert(q('#keyPanel').hidden);
 }
 if(['1','5','6','7'].includes(e.label)){const old={values:['Previously typed answer'],answerVersion:'4f53cda18c2b'};assert.equal(M.saved(e,old).previous[0].values[0],'Previously typed answer');}
}
assert.equal(count,24);assert.deepEqual(tasks[4].answerSpec.map(f=>f.label),['2a','2b','3a','3b','4a','4b','5a','5b','6a','6b']);
assert.deepEqual(tasks.map(e=>e.audioTracks),[[],['1.06'],[],['1.07'],[],[],[]]);
for(const e of tasks)for(const t of e.audioTracks)assert(fs.existsSync(base+'media/sb-'+t+'.mp3'));
open('sb-6-2');q('#exerciseAudio [data-audio-mute]').click();assert(w.Focus2Audio.player.muted);q('#exerciseAudio [data-audio-play]').click();await new Promise(r=>setImmediate(r));const player=w.Focus2Audio.player;player.currentTime=31;assert(!player.paused);q('#exercise').close();assert.equal(w.Focus2Audio.player,player);assert.equal(player.currentTime,31);assert(!player.paused);q('#allTracks').value='1.06';q('#allTracks').dispatchEvent(new w.Event('change'));q('[data-ex="sb-6-2"]').click();assert.equal(player.currentTime,31);assert(!player.paused);assert.equal(q('#exerciseAudio [data-audio-play]').getAttribute('aria-label'),'Пауза: Трек 1.06');q('#exerciseAudio [data-audio-repeat]').click();await new Promise(r=>setImmediate(r));assert.equal(player.currentTime,0);q('#exerciseAudio [data-audio-play]').click();assert(player.paused);
assert.deepEqual(errors,[]);dom.window.close();console.log('PASS 7 source-reviewed tasks;24 keyed responses;empty/wrong/correct/restore/reset;oral notes without grading;legacy preservation;audio navigation and repeat (mock transport, silent).');})().catch(e=>{console.error(e);dom.window.close();process.exitCode=1});
