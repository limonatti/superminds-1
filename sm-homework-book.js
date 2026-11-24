/* A contextual route into the same assignment picker; students return to their exact homework. */
(async()=>{
'use strict';
const script=document.currentScript,course=script.dataset.course,base=new URL('..',script.src),q=new URLSearchParams(location.search);
if(!window.SMChatSounds&&!document.querySelector('script[data-chat-sounds]')){const sounds=document.createElement('script');sounds.dataset.chatSounds='1';sounds.src=new URL('sm-chat-sounds.js?v=5a3837e5',script.src);document.head.append(sounds);}
const u=await SM.getUser();if(!u)return;const p=await SM.myProfile(),teacher=['teacher','admin'].includes(p?.role);
const bar=document.createElement('div');bar.className='homework-book-bar';bar.style.cssText='position:relative;z-index:4;display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:12px 20px;background:#f4e7d5;color:#6e2438;font:700 14px Nunito,sans-serif;border-bottom:1px solid #d1b6b9';
if(teacher&&document.getElementById('assignToggle'))return;
if(teacher){const a=document.createElement('a');a.textContent='Задать упражнения с этой страницы →';a.style.cssText='color:inherit;padding:8px 0';a.href=new URL('teacher-class.html?course='+encodeURIComponent(course),base);a.onclick=()=>{const context=window.SMHomeworkContext?.()||{};const url=new URL('teacher-class.html',base);url.search=new URLSearchParams({course,...context});a.href=url;};bar.append(a);}
else if(q.has('hw')){const a=document.createElement('a');a.textContent='Моя домашка · список упражнений и отправка на проверку →';a.href=new URL('homework.html?hw='+encodeURIComponent(q.get('hw')),base);a.style.cssText='color:inherit;padding:8px 0';bar.append(a);}
else return;
document.body.prepend(bar);
})();
