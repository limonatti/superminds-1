const assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM}=require('jsdom'),{parts,render}=require('../sm-chat-content');
const doc=new JSDOM().window.document;
const urls=['https://www.youtube.com/watch?v=SVmYLIcUdBo','https://www.youtube.com/watch?v=PNvVfdzPIjg','https://www.youtube.com/watch?v=-XnG5_Co4vE'];
for(const url of urls){const el=render(url,doc),link=el.querySelector('a');assert.equal(link.href,url);assert.equal(link.textContent,url);assert.equal(link.target,'_blank');assert.equal(link.rel,'noopener noreferrer');}
const body='Посмотри: (https://example.com/lesson_(one)?a=1&b=2).\nИ www.example.org/path#task!';
const rendered=render(body,doc);assert.equal(rendered.textContent,body);assert.deepEqual([...rendered.querySelectorAll('a')].map(a=>a.href),['https://example.com/lesson_(one)?a=1&b=2','https://www.example.org/path#task']);
for(const value of ['javascript:alert(1)','data:text/html,<svg onload=alert(1)>','javascript:https://example.com','https://user:password@example.com','name@www.example.com'])assert.equal(render(value,doc).querySelectorAll('a').length,0,value);
const unsafe='<img src=x onerror=alert(1)> https://example.com/?x=<script>alert(1)</script>';
const escaped=render(unsafe,doc);assert.equal(escaped.textContent,unsafe);assert.equal(escaped.querySelectorAll('img,script').length,0);
assert.deepEqual(parts('https://пример.рф/урок').map(p=>p.href),['https://xn--e1afmkfd.xn--p1ai/%D1%83%D1%80%D0%BE%D0%BA']);
const tick=()=>new Promise(resolve=>setImmediate(resolve));
async function page(role){
 const dom=new JSDOM(fs.readFileSync('chat.html','utf8'),{url:'https://school.test/chat.html',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 const teacher='teacher',student='student',me=role==='teacher'?teacher:student,sends=[];
 const rows=urls.map((url,i)=>({id:'message-'+i,teacher_id:teacher,student_id:student,sender_id:teacher,body:url,created_at:'2026-11-24T10:00:00Z'}));
 w.SMUI={esc:s=>String(s),icon:()=>'',mount(){},requireAuth:async()=>({id:me}),empty:()=>''};
 w.SM={myProfile:async()=>({role}),myStudents:async()=>[{student_id:student,name:'Карима'}],myTeacher:async()=>({teacher_id:teacher,name:'Ася'}),teacherUnread:async()=>({}),watchPresentationAuth(){},chatReactions:async()=>({}),chatMarkRead:async()=>({ok:true}),chatPage:async()=>rows,chatSubscribe:()=>()=>{},chatSend:async(t,s,body)=>{sends.push(body);return {ok:false,error:'Test offline'};}};
 for(const file of ['sm-chat.js','sm-chat-content.js','sm-homework.js','sm-chat-recorder.js'])w.eval(fs.readFileSync(file,'utf8'));
 w.eval([...w.document.scripts].find(s=>!s.src&&s.textContent.includes('function startChat')).textContent);
 await tick();await tick();
 assert.equal(w.document.querySelectorAll('.message-link').length,3,'existing history links for '+role);
 assert(w.document.getElementById('chatOlder').hidden,'short history has no empty pagination');
 assert.equal(w.document.querySelector('.cols').classList.contains('solo'),role==='student');
 const input=w.document.getElementById('chatText'),emoji=w.document.getElementById('btnEmo');
 input.value='text';input.setSelectionRange(0,0);emoji.click();assert.equal(emoji.getAttribute('aria-expanded'),'true');
 w.document.querySelector('.emopan button').click();assert.equal(input.value,'🥰text','emoji at cursor zero');
 input.value='abcdef';input.setSelectionRange(1,4);w.document.querySelector('.emopan button').click();assert.equal(input.value,'a🥰ef','emoji replaces selected text');
 input.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(emoji.getAttribute('aria-expanded'),'false');
 input.value='Line one\nLine two';input.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',shiftKey:true,bubbles:true}));assert.equal(sends.length,0);
 input.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',isComposing:true,bubbles:true}));assert.equal(sends.length,0);
 input.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));await tick();assert.deepEqual(sends,['Line one\nLine two']);assert(w.document.querySelector('.failed'));
 w.document.querySelector('.rx-open').click();assert.equal(w.document.querySelectorAll('.rxpick button').length,8);assert.equal(w.document.querySelector('.rxpick').parentNode,w.document.body,'picker escapes scrolling message area');
 w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert(!w.document.querySelector('.rxpick'));
 dom.window.close();
}
(async()=>{await page('teacher');await page('student');console.log('PASS link safety, old YouTube messages, punctuation, Unicode, multiline, emoji insertion, both roles and reaction popover.');})().catch(e=>{console.error(e);process.exit(1);});
