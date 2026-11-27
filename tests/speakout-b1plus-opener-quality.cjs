/* Isolated DOM regression: real app rendering, personal values, legacy notes,
 * source geometry and media identity. Real playback/layout verified via CUA. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');const root=path.resolve(__dirname,'..'),dir=path.join(root,'speakout-b1plus-active-teach');
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const dom=new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g,''),{url:'http://localhost/speakout-b1plus-active-teach/index.html?book=sb&page=7',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,d=w.document;
w.ResizeObserver=class{observe(){}disconnect(){}};w.HTMLElement.prototype.scrollIntoView=function(){};w.HTMLElement.prototype.scrollTo=function(){};
w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:()=>()=>{}});
w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
Object.defineProperty(w.HTMLMediaElement.prototype,'paused',{get(){return this._paused!==false}});
w.HTMLMediaElement.prototype.pause=function(){this._paused=true;this.dispatchEvent(new w.Event('pause'))};w.HTMLMediaElement.prototype.play=function(){this._paused=false;this.dispatchEvent(new w.Event('play'));return Promise.resolve()};
w.B1Store={storageKey:'test',state:{answers:{'sb:7:1':{values:{old:'kept'},note:'Previous personal answer',done:false}}},save(s){this.state=JSON.parse(JSON.stringify(s))}};
function load(p){w.eval(fs.readFileSync(path.join(root,p),'utf8'))}
for(const p of ['exercise-source.js','exercise-play.js','course-focus.js','speakout-b1plus-active-teach/assets/inline-gaps.js','speakout-b1plus-active-teach/assets/exercise-gaps.js','speakout-b1plus-active-teach/assets/exercise-sources.js','speakout-b1plus-active-teach/assets/interactive.js','speakout-b1plus-active-teach/assets/course.js','speakout-b1plus-active-teach/assets/unit1-opener.js','speakout-b1plus-active-teach/assets/app.js'])load(p);
const q=s=>d.querySelector(s),qa=s=>[...d.querySelectorAll(s)];
q('[data-ex-index="0"]').click();
assert.equal(q('#freeNote').value,'Previous personal answer');assert(!q('#freeNote').required);assert.equal(qa('[data-gift]').length,10);assert.equal(qa('[data-gift][aria-pressed=true]').length,0);assert.equal(q('#check'),null);
assert(!q('.cf-instruction').textContent.includes('Pronunciation'));assert.equal(q('.cf-source').dataset.sourceFit,'width');assert.equal(qa('.focus-source-controls').length,1);
q('[data-gift="a puppy"]').click();assert.equal(w.B1Store.state.answers['sb:7:1'].values.openerGift,'a puppy');assert.equal(w.B1Store.state.answers['sb:7:1'].score,null);assert(!w.B1Store.state.answers['sb:7:1'].done);
q('[data-gift="a camera"]').click();assert.equal(qa('[data-gift][aria-pressed=true]').length,1);
q('#done').click();assert(w.B1Store.state.answers['sb:7:1'].done);assert(q('#done').textContent.includes('Обсудили'));
q('#closeExercise').click();q('[data-ex-index="0"]').click();assert.equal(q('[data-gift="a camera"]').getAttribute('aria-pressed'),'true');assert.equal(q('#freeNote').value,'Previous personal answer');
q('[data-opener-reset]').click();assert.equal(qa('[data-gift][aria-pressed=true]').length,0);assert.equal(w.B1Store.state.answers['sb:7:1'].values.old,'kept');assert.equal(q('#freeNote').value,'Previous personal answer');
const video=q('#openerVideo');assert(video.src.endsWith('so3-b1-u1-bbc-vlogs.mp4'));assert.equal(qa('#openerVideo').length,1);
q('#openerMedia [data-opener-mute]').click();assert(video.muted);q('#openerMedia [data-opener-play]').click();assert(!video.paused);video.currentTime=19;
q('#exerciseAllMedia').click();assert(video.isConnected);assert(!video.paused);assert.equal(video.currentTime,19);assert(q('.opener-library'));
q('[data-opener-return]').click();assert.equal(q('#openerVideo'),video);assert(!video.paused);assert.equal(video.currentTime,19);
q('#openerMedia [data-opener-rate]').value='0.75';q('#openerMedia [data-opener-rate]').dispatchEvent(new w.Event('change'));assert.equal(video.playbackRate,.75);video.currentTime=5;q('#openerMedia [data-opener-a]').click();video.currentTime=9;q('#openerMedia [data-opener-b]').click();q('#openerMedia [data-opener-ab]').click();assert.equal(video.currentTime,5);video.currentTime=10;video.dispatchEvent(new w.Event('timeupdate'));assert.equal(video.currentTime,5);q('#openerMedia [data-opener-repeat]').click();assert.equal(video.currentTime,0);assert(video.muted);assert.equal(q('#openerMedia [data-opener-ab]').getAttribute('aria-pressed'),'false');
q('#openerMedia [data-opener-play]').click();assert(video.paused);q('#exerciseAllMedia').click();q('.opener-library [data-opener-play]').click();assert(q('#exerciseDialog').open);assert(!video.paused);assert.equal(q('#openerVideo'),video);q('#openerMedia [data-opener-play]').click();assert(video.paused);
q('#exerciseNext').click();assert.equal(qa('[data-prompt]').length,4);assert.equal(q('#check'),null);assert.equal(qa('[data-prompt][aria-pressed=true]').length,0);q('[data-prompt="0"]').click();assert.equal(w.B1Store.state.answers['sb:7:2'].values.openerPrompt0,'done');q('[data-prompt="0"]').click();assert.equal(w.B1Store.state.answers['sb:7:2'].values.openerPrompt0,'');
q('[data-prompt="2"]').click();q('#closeExercise').click();q('[data-ex-index="1"]').click();assert.equal(q('[data-prompt="2"]').getAttribute('aria-pressed'),'true');q('[data-opener-reset]').click();assert.equal(qa('[data-prompt][aria-pressed=true]').length,0);
const p=w.COURSE.books.sb.pages.find(p=>p.page===7);for(const e of p.exercises){assert(e.box[0]+e.box[2]<42);assert(e.box[1]+e.box[3]<95);assert.equal(w.SpeakoutInteractive.spec(e,null).mode,'review')}
console.log('PASS 2 personal tasks;10 gift choices/4 oral prompts; no automatic grading or required typing; legacy notes, selection, reset, reopen; source controls; muted persistent video identity through library/return/repeat.');setImmediate(()=>dom.window.close());
