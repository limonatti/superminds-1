const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('sm-live-audio.js','utf8');
function setup(role,folder){
 const events={},docEvents={},sent=[],elements=[];let poll;
 class Element{constructor(tag){this.tagName=tag.toUpperCase();this.style={};this.hidden=false;this.children=[];this.handlers={};this.paused=true;this.ended=false;this.currentTime=0;this.playbackRate=1;this.readyState=1;this.duration=100;this.isConnected=true;}setAttribute(){}append(...es){this.children.push(...es)}prepend(e){e.parentElement=this;}addEventListener(n,f){this.handlers[n]=f}pause(){this.paused=true}play(){this.paused=false;return Promise.resolve()}load(){}}
 const body=new Element('body'),window={addEventListener:(n,f)=>events[n]=f},parent={postMessage:d=>sent.push(structuredClone(d))};
 const document={body,createElement:t=>{const e=new Element(t);elements.push(e);return e},querySelector:()=>null,querySelectorAll:()=>elements.filter(e=>e.tagName==='AUDIO'),addEventListener:(n,f)=>docEvents[n]=f};
 const ctx={URL,URLSearchParams,Date,Number,Math,String,window,parent,document,location:{origin:'https://school.test',href:'https://school.test/'+folder+'/index.html',search:'?embedded=1&lessonRole='+role},setInterval:f=>(poll=f,1),clearInterval:()=>{}};vm.runInNewContext(source,ctx);
 return {sent,events,docEvents,elements,Element,poll:()=>poll(),receive(d,origin='https://school.test',sender=parent){events.message({origin,source:sender,data:{type:'outcomes-lesson',...d}})}};
}
(async()=>{for(const folder of ['outcomes-beginner-active-teach','solutions-int-active-teach','speakout-a1-active-teach']){
 const t=setup('t',folder),s=setup('s',folder),a=new t.Element('audio');a.src='https://school.test/'+folder+'/media/test.mp3';a.currentTime=12;a.paused=false;t.docEvents.play({target:a});s.receive(t.sent.at(-1));await Promise.resolve();const player=s.elements[0];assert.equal(player.paused,false);assert(Math.abs(player.currentTime-12)<.1);
 a.paused=true;t.docEvents.pause({target:a});s.receive(t.sent.at(-1));assert.equal(player.paused,true);a.currentTime=38;t.docEvents.seeked({target:a});s.receive(t.sent.at(-1));assert.equal(player.currentTime,38);
 a.playbackRate=.75;t.docEvents.ratechange({target:a});s.receive(t.sent.at(-1));assert.equal(player.playbackRate,.75);
 const before=player.src;s.receive({...t.sent.at(-1),src:'https://evil.test/audio.mp3'});assert.equal(player.src,before);s.receive({...t.sent.at(-1),time:99},'https://evil.test');assert.equal(player.currentTime,38);
 player.readyState=0;a.currentTime=45;t.docEvents.seeked({target:a});s.receive(t.sent.at(-1));assert.equal(player.currentTime,38);player.readyState=1;player.handlers.loadedmetadata();assert.equal(player.currentTime,45);
 const play=player.play.bind(player);player.play=()=>Promise.reject({name:'NotAllowedError'});a.paused=false;t.docEvents.play({target:a});s.receive(t.sent.at(-1));await new Promise(r=>setImmediate(r));assert.equal(s.elements[3].hidden,false);player.play=play;s.elements[3].onclick();await Promise.resolve();assert.equal(player.paused,false);
 t.docEvents.emptied({target:a});assert.equal(t.sent.at(-1).stop,true);t.docEvents.play({target:a});a.isConnected=false;t.poll();s.receive(t.sent.at(-1));assert.equal(player.paused,true);assert.equal(s.elements[1].hidden,true);
 }
 console.log('Audio: all 3 course roots; play, pause, seek, rate, removed-player stop, source and origin guards passed.');})().catch(e=>{console.error(e);process.exitCode=1});
