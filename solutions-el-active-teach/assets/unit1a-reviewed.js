/* Source-reviewed controls: Solutions Elementary Third Edition SB pp8–9.
 * Banks are transcribed from ex1 / Learn this / Recycle, not grading keys.
 * Existing data-answer values remain the persistence and marking contract. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SolutionsElUnit1A=api;})(typeof window==='undefined'?globalThis:window,()=>{
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const family=['aunt','brother','child / children','cousin','daughter','father (dad)','grandchild / grandchildren','granddaughter','grandfather (grandad)','grandmother (grandma)','grandparent','grandson','husband','mother (mum)','nephew','niece','parent','sister','son','uncle','wife'];
const aliases=family.map(s=>s.replace(/[()]/g,'/').split('/').map(s=>s.trim()).filter(Boolean));
const familyBank=['aunt','aunts','brother','brothers','child','children','cousin','cousins','daughter','daughters','father','dad','grandchild','grandchildren','granddaughter','grandfather','grandad','grandmother','grandma','grandparent','grandparents','grandson','husband','mother','mum','nephew','nephews','niece','nieces','parent','parents','sister','sisters','son','sons','uncle','uncles','wife'];
const relatives=["Ella’s grandfather","Ella’s great-aunt","Ella’s sister","Bruno and Maria","Ella","Ella’s parents"], endings=['a sister?','children?','a husband?','children?','four nieces?','a son?'];
const names=['Martin is Tom','Nathan and Rosie are Sophie','Harry is Liz','Lisa is Mia','Clare and Liz are Jessica','Poppy, Harry and Mia are Rosie'];
const spoken=['a stepbrother','cousins','a brother-in-law','a great-uncle','a great-grandmother','a step-grandfather'];
const quizPrompts=['1a · Is he Beyoncé’s c_____?','1b · Is he Beyoncé’s h______?','1c · Is he Beyoncé’s b______?','2 · These girls have got a famous f_____.','3a · uncle and _____','3b · father and ________','3c · _______ and wife','4a · her s__?','4b · her n_____?','4c · her g_______?'];
const configs={
 'sb-8-1':{kind:'sort',requiredTyping:0},
 'sb-8-2':{kind:'gaps',parts:2,requiredTyping:0},
 'sb-9-3':{kind:'oral',prompts:['Сверка упражнения 2'],options:['Послушал(а) и сверил(а)','Есть вопросы'],requiredTyping:0},
 'sb-9-4':{kind:'writing',prompts:['Предложение 1','Предложение 2','Предложение 3','Предложение 4'],options:['Готово','Нужна помощь'],requiredTyping:1},
 'sb-9-5':{kind:'choice',prompts:['This family photo includes Ella’s …'],options:[['stepmother','great-grandmother','brother-in-law']],labels:[['a · stepmother','b · great-grandmother','c · brother-in-law']],requiredTyping:0},
 'sb-9-6':{kind:'gaps',parts:2,requiredTyping:0},
 'sb-9-7':{kind:'choice',prompts:relatives.map((r,i)=>(i+1)+' · '+r+' · '+endings[i]),options:['he','she','she','they','she','they'].map(p=>[`Yes, ${p} ${p==='they'?'have':'has'}.`,`No, ${p} ${p==='they'?"haven’t":"hasn’t"}.`]),requiredTyping:0},
 'sb-9-8':{kind:'quiz',requiredTyping:0},
 'sb-9-9':{kind:'oral',prompts:spoken.map((r,i)=>`${i+1} · Have you got ${r}?`),options:['Yes, I have.','No, I haven’t.','Пропустить личный вопрос'],requiredTyping:0},
 'sb-9-10':{kind:'oral',prompts:['What’s his / her name?','How old is he / she?'],options:['Обсудили','Нужна помощь','Не было ответа yes'],requiredTyping:0}
};
const norm=s=>String(s||'').toLowerCase().replace(/[’‘]/g,"'").replace(/[.,!?]/g,'').replace(/\s+/g,' ').trim();
const input=(v,i)=>`<input type="hidden" data-answer data-index="${i}" value="${esc(v)}">`;
const buttons=(options,attr,labels)=>options.map((o,i)=>`<button type="button" ${attr}="${i}" aria-pressed="false">${esc(labels?.[i]||o)}</button>`).join('');
function parts(id,value){if(id==='sb-8-2'){const m=String(value||'').replace(/[’‘]/g,"'").match(/^('s|')\s*(.*)$/);return m?[m[1],m[2]]:['',value||''];}const s=String(value||'');return (/[;,]/.test(s)?s.split(/\s*[,;]\s*/):s.trim().split(/\s+/)).concat(['','']).slice(0,2);}
function readOpen(value){const marker='Карточки:\n',separator='\n\nЗаметки:\n';if(!String(value||'').startsWith(marker))return {marks:[],notes:value||''};const [head,...tail]=value.slice(marker.length).split(separator);return {marks:head.split('\n').map(s=>s.slice(s.indexOf(' — ')+3)),notes:tail.join(separator)};}
function render(ex,values){const c=configs[ex.id];if(!c)return null;let html='';
 if(c.kind==='sort'){
  html=`<p>Нажми на слово, затем на название группы. Чтобы перенести слово, выбери его снова.</p><div class="u1-bank" aria-label="Слова о семье">${buttons(family,'data-word')}</div><p data-current role="status"></p>`;
  html+=['female','male','male or female'].map((g,i)=>`<div class="answer-row u1-group">${input(values[i]||'',i)}<button type="button" data-group="${i}">${g}</button><p data-members="${i}"></p></div>`).join('');
  html+=`<details><summary>Свой вариант / прежние ответы</summary>${['female','male','male or female'].map((g,i)=>`<label>${g}<textarea data-manual="${i}">${esc(values[i]||'')}</textarea></label>`).join('')}</details>`;
 }else if(c.kind==='gaps'||c.kind==='quiz'){
  if(ex.id==='sb-8-2')html+='<p class="u1-model">1 · Harry is Tom’s son. — пример</p>';
  const rows=c.kind==='quiz'?10:6;
  for(let i=0;i<rows;i++){
   const count=c.kind==='quiz'?1:2;let line='';
   const slot=j=>`<button type="button" class="u1-slot" data-slot="${i}:${j}" aria-label="Пропуск ${esc(ex.answerSpec[i].label)}${count>1?'.'+(j+1):''}" aria-pressed="false">…</button>`;
   if(ex.id==='sb-8-2')line=`${i+2} · ${names[i]}${slot(0)} ${slot(1)}.`;
   else if(ex.id==='sb-9-6')line=`${i+1} · ${slot(0)} ${relatives[i]} ${slot(1)} ${endings[i]}`;
   else line=`${esc(quizPrompts[i])} ${slot(0)}`;
   html+=`<div class="answer-row u1-gap-row">${input(values[i]||'',i)}<div>${line}</div></div>`;
  }
  html+='<div class="u1-bank-panel"><p data-current role="status">Выбери пропуск, затем карточку.</p><div class="u1-bank" data-bank></div><button type="button" data-erase>Убрать выбранное слово</button></div>';
  if(c.kind==='quiz')html+='<h3>Теперь выбери ответ викторины</h3>'+['Who is Beyoncé’s …?','Who is their father?','Jon Voight and Angelina Jolie','The man and Queen Elizabeth II'].map((p,i)=>choiceRow(i+10,`${i+1} · ${p}`,['a','b','c'],values[i+10])).join('');
 }else if(c.kind==='choice')html=c.prompts.map((p,i)=>choiceRow(i,p,c.options[i],values[i],c.labels?.[i])).join('');
 else {
  html=input(values[0]||'',0)+c.prompts.map((p,i)=>`<fieldset class="u1-personal"><legend>${esc(p)}</legend><div class="u1-choices" data-personal="${i}">${buttons(c.options,'data-option')}</div></fieldset>`).join('');
  if(ex.id==='sb-9-3')html+='<a class="u1-back" href="?book=sb&unit=1&page=8&ex=sb-8-2">Вернуться к упражнению 2 →</a>';
  if(c.kind==='writing')html+='<p>Посмотри на дерево рядом. Проверь: имена, is / are, притяжательное ’s и слово о семье. Пиши свои предложения — возможных ответов много.</p>';
  html+=`<label class="u1-notes">${c.kind==='writing'?'Мои четыре предложения':'Необязательные заметки'}<textarea data-notes rows="${c.kind==='writing'?6:2}" maxlength="12000">${esc(readOpen(values[0]).notes)}</textarea></label>`;
 }
 return `<section class="u1-reviewed" data-kind="${c.kind}" aria-label="Задание ${esc(ex.label)}">${html}<div class="u1-tools"><button type="button" data-reset>Начать заново</button><button type="button" data-undo disabled>Отменить действие</button></div></section>`;
}
function choiceRow(i,p,options,value,labels){return `<div class="answer-row u1-choice-row">${input(value||'',i)}<p>${esc(p)}</p><div class="u1-choices" data-choice="${i}">${buttons(options,'data-option',labels)}</div></div>`;}
function bind(container,ex){const c=configs[ex.id],host=container.querySelector('.u1-reviewed');if(!c||!host)return;const fields=[...host.querySelectorAll('[data-answer]')];let selected=null,word=null,undo=null;
 const values=()=>fields.map(f=>f.value);
 const set=(i,v)=>{fields[i].value=v;fields[i].dispatchEvent(new Event('input',{bubbles:true}));};
 const remember=()=>{undo=values();host.querySelector('[data-undo]').disabled=false;};
 const familyIndex=w=>aliases.findIndex(a=>a.some(s=>norm(s)===norm(w)));
 const groups=()=>values().map(v=>v.split(/[;\n,]+/).map(w=>w.trim()).filter(Boolean));
 const optionsFor=i=>c.kind==='quiz'?['a','b','c']:c.options[i];
 function refresh(){
  if(c.kind==='sort'){
   const g=groups();host.querySelectorAll('[data-word]').forEach(b=>{const n=+b.dataset.word,group=g.findIndex(a=>a.some(v=>familyIndex(v)===n));b.setAttribute('aria-pressed',String(word===n));b.dataset.assigned=String(group>=0);b.textContent=family[n]+(group>=0?' · '+['female','male','male or female'][group]:'');});
   g.forEach((a,i)=>{host.querySelector(`[data-members="${i}"]`).textContent=a.join(' · ')||'Пока пусто';host.querySelector(`[data-manual="${i}"]`).value=fields[i].value;});
   host.querySelector('[data-current]').textContent=word===null?'Выбери слово из банка.':`Выбрано: ${family[word]}. Теперь выбери группу.`;
  }
  host.querySelectorAll('[data-slot]').forEach(b=>{const [i,j]=b.dataset.slot.split(':').map(Number),v=c.kind==='quiz'?fields[i].value:parts(ex.id,fields[i].value)[j];b.textContent=v||'…';b.setAttribute('aria-pressed',String(b.dataset.slot===selected));});
  host.querySelectorAll('[data-choice]').forEach(row=>{const i=+row.dataset.choice;row.querySelectorAll('button').forEach((b,n)=>{const v=fields[i].value,option=optionsFor(i)[n];b.setAttribute('aria-pressed',String(norm(v)===norm(option)||(ex.id==='sb-9-5'&&norm(v)==='abc'[n])));});});
  if(['oral','writing'].includes(c.kind)){const o=readOpen(fields[0].value);host.querySelector('[data-notes]').value=o.notes;host.querySelectorAll('[data-personal]').forEach(row=>row.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(o.marks[+row.dataset.personal]===c.options[i]))));}
 }
 function bank(){if(!selected)return;const [i,j]=selected.split(':').map(Number),options=ex.id==='sb-9-6'?['have','has','got']:ex.id==='sb-8-2'&&j===0?["'s","'"]:familyBank;
  host.querySelector('[data-current]').textContent=`Пропуск ${ex.answerSpec[i].label}${c.kind==='gaps'?'.'+(j+1):''}: выбери карточку.`;
  host.querySelector('[data-bank]').innerHTML=options.map(v=>`<button type="button" data-token="${esc(v)}">${esc(v)}</button>`).join('');
 }
 const writeOpen=o=>set(0,o.marks.some(Boolean)||o.notes.trim()?'Карточки:\n'+c.prompts.map((p,i)=>p+' — '+(o.marks[i]||'')).join('\n')+'\n\nЗаметки:\n'+o.notes:'');
 host.addEventListener('click',ev=>{
  const b=ev.target.closest('button');if(!b||!host.contains(b))return;
  if(b.hasAttribute('data-word')){word=+b.dataset.word;refresh();return;}
  if(b.hasAttribute('data-slot')){selected=b.dataset.slot;refresh();bank();return;}
  if(b.hasAttribute('data-undo')){if(undo){const current=values();undo.forEach((v,i)=>set(i,v));undo=current;refresh();}return;}
  if(b.hasAttribute('data-group')){if(word===null)return;remember();const g=groups().map(a=>a.filter(v=>familyIndex(v)!==word));g[+b.dataset.group].push(aliases[word][0]);g.forEach((a,i)=>set(i,a.join('; ')));word=null;}
  else if(b.hasAttribute('data-token')||b.hasAttribute('data-erase')){if(!selected)return;remember();const [i,j]=selected.split(':').map(Number),v=b.dataset.token||'';if(c.kind==='quiz')set(i,v);else{const p=parts(ex.id,fields[i].value);p[j]=v;set(i,p.some(Boolean)?(ex.id==='sb-8-2'?p[0]+' '+p[1]:p.join(', ')):'');}}
  else if(b.hasAttribute('data-option')){remember();const row=b.closest('[data-choice],[data-personal]'),n=+b.dataset.option;if(row.hasAttribute('data-choice')){const i=+row.dataset.choice;set(i,optionsFor(i)[n]);}else{const o=readOpen(fields[0].value);o.marks[+row.dataset.personal]=c.options[n];writeOpen(o);}}
  else if(b.hasAttribute('data-reset')){remember();fields.forEach((_,i)=>set(i,''));}
  refresh();
 });
 host.addEventListener('input',ev=>{if(ev.target.hasAttribute('data-manual')){remember();set(+ev.target.dataset.manual,ev.target.value);refresh();}else if(ev.target.hasAttribute('data-notes')){remember();const o=readOpen(fields[0].value);o.notes=ev.target.value;writeOpen(o);}});
 host.isComplete=()=>{
  if(c.kind==='sort'){const indices=groups().flat().map(familyIndex);return indices.length===21&&indices.every(i=>i>=0)&&new Set(indices).size===21;}
  if(c.kind==='gaps')return fields.every(f=>parts(ex.id,f.value).every(v=>v.trim()));
  return fields.every(f=>f.value.trim());
 };
 refresh();return host;
}
return {configs,family,familyBank,parts,readOpen,render,bind};
});
