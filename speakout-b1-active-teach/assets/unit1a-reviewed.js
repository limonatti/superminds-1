/* Speakout Third Edition B1, SB p.8, 1A–2D. Source: original page and keys.pdf p.2.
   Candidate sets are transcribed from the task, not synthesized from grading keys. */
(function(root){
'use strict';
const phrases=['stay in touch with','look up to','be friendly with','take after','get on well with'];
const people=['teammates','colleagues','manager','grandparents','partner','close friends'];
const categories=['work','sport','friendships/personal life','family'];
const photos=[['A','Розовое фото слева сверху',[335,10,550,315]],['B','Синее фото справа сверху',[925,10,700,300]],['C','Синее фото слева снизу',[5,590,420,380]],['D','Розовое фото справа в центре',[1180,275,440,400]],['E','Розовое фото слева снизу',[350,780,560,255]],['F','Синее фото справа снизу',[1060,715,575,315]]];
const configs={
 '1A':{format:'personal-prompt-cards',instruction:'Выберите группы людей из своей жизни. Откройте три вопроса и обсудите их; можно отметить пройденные вопросы. Свой вариант и заметки — по желанию. Оценки за личный ответ нет.'},
 '1B':{format:'photo-selection-and-oral-explanation',instruction:'Выберите фотографии, которые помогут рассказать, что, по вашему мнению, важно для Pedro. Объясните выбор устно. Возможны разные ответы; автоматической оценки нет.'},
 '2A':{format:'paragraph-photo-matching',instruction:'Прочитайте четыре абзаца Pedro. Для каждого выберите фотографии людей и занятий из этого абзаца: одну для 1, по две для 2–4. Одно фото может относиться к нескольким абзацам.'},
 '2B':{format:'word-category-sorting',instruction:'Распределите шесть слов и фраз, выделенных жирным в тексте 2A, по четырём категориям. Затем добавьте свои примеры устно или в необязательной заметке.'},
 '2C':{format:'phrase-matching',instruction:'Соедините значения 1–4 с выделенными выражениями из текста 2A. Для значения 1 выберите ДВА выражения, для остальных — по одному. Порядок двух выражений в пункте 1 не важен.'},
 '2D':{format:'personal-sentence-prompts',instruction:'Выберите человека и выражение из 2B–2C. Используйте получившуюся опору, чтобы рассказать о знакомом человеке и объяснить почему. Заметка необязательна; личный ответ не оценивается.'}
};
function get(id){const m=/^sb:8:(1A|1B|2A|2B|2C|2D)$/.exec(id);return m?{...configs[m[1]],label:m[1],graded:['2A','2B','2C'].includes(m[1])}:null}
function split(v){return String(v||'').split(/\s*(?:,|;|\band\b)\s*/i).map(s=>s.trim()).filter(Boolean)}
function norm(v){return String(v||'').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ')}
function sameSet(a,b){return a.length===b.length&&new Set(a.map(norm)).size===a.length&&b.every(x=>a.map(norm).includes(norm(x)))}
function grade(id,values){
 const c=get(id);if(!c?.graded)return null;
 let actual,expected;
 if(c.label==='2A'){actual=[1,2,3,4].map(n=>split(values['photo:'+n]));expected=[['B'],['C','D'],['E','F'],['A','F']];}
 if(c.label==='2B'){actual=people.map(w=>[values['category:'+w]||'']);expected=[['sport'],['work'],['work'],['family'],['friendships/personal life'],['friendships/personal life']];}
 if(c.label==='2C'){actual=[1,2,3,4].map(n=>split(values[n]));expected=[['get on well with','be friendly with'],['take after'],['look up to'],['stay in touch with']];}
 const complete=actual.every((v,i)=>v.length===expected[i].length&&v.every(Boolean));return {complete,correct:actual.map((v,i)=>sameSet(v,expected[i])),total:expected.length};
}
function mount(host,id,state,changed){
 const c=get(id);if(!c)return false;
 const d=host.ownerDocument,values=state.values||(state.values={});host.classList.add('b1-reviewed');
 const el=(tag,text,cls)=>{const e=d.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e};
 const controls=[];let feedback,refreshPrompt=()=>{};
 function saved(){state.done=false;state.score=null;state.reviewAttempted=false;state.revealed={};if(feedback)feedback.textContent='';host.querySelectorAll('[data-result]').forEach(e=>e.removeAttribute('data-result'));sync();changed()}
 function sync(){for(const {button,key,value,multi} of controls){const on=multi?split(values[key]).includes(value):values[key]===value;button.setAttribute('aria-pressed',String(on))}refreshPrompt()}
 function choice(parent,label,key,value,multi=false,limit=Infinity){const b=el('button',label);b.type='button';b.dataset.response=key;b.dataset.value=value;b.onclick=()=>{if(multi){let a=split(values[key]);if(a.includes(value))a=a.filter(x=>x!==value);else if(a.length<limit)a.push(value);else{feedback.textContent=`Здесь можно выбрать ${limit}. Сначала снимите лишний вариант.`;return}values[key]=a.join(', ')}else values[key]=values[key]===value?'':value;saved()};controls.push({button:b,key,value,multi});parent.append(b);return b}
 function row(label,key){const f=el('fieldset');f.dataset.row=key;f.append(el('legend',label));host.append(f);const b=el('div',undefined,'b1-cards');f.append(b);return b}
 function gallery(select){const box=el('div',undefined,'b1-photo-grid');for(const [letter,caption,rect]of photos){const figure=select?choice(box,'','photos',letter,true):el('figure');const frame=el('span',undefined,'b1-photo');frame.style.aspectRatio=rect[2]+'/'+rect[3];const img=el('img');img.src='assets/sb-8.jpg';img.alt=caption;img.style.cssText=`width:${1652/rect[2]*100}%;left:${-rect[0]/rect[2]*100}%;top:${-rect[1]/rect[3]*100}%`;frame.append(img);figure.append(frame,el('span',letter+' · '+caption));if(!select)box.append(figure)}host.append(box)}
 host.append(el('p',c.instruction,'instruction'));
 if(c.label==='1A'){
  const b=row('Люди в моей жизни','groups');for(const x of ['work','college','family','hobbies'])choice(b,x,'groups',x,true);
  const qs=['1 · What different groups of people are there in your life?','2 · How often do you see each group?','3 · What activities do you do together?'];
  qs.forEach((q,i)=>{const a=el('details'),s=el('summary',q);a.append(s,el('p',i===0?'Think about work, college, family, hobbies, etc.':'Ответьте о выбранных группах людей. Можно сказать вслух.'));choice(a,'Обсудили','prompt:'+i,'done');host.append(a)})
 }else if(c.label==='1B')gallery(true);
 else if(c.label==='2A'){
  gallery(false);for(let n=1;n<=4;n++){const b=row(`Абзац ${n} · ${n===1?'одно фото':'два фото'}`,'photo:'+n);for(const [letter]of photos)choice(b,'Фото '+letter,'photo:'+n,letter,true,n===1?1:2)}
 }else if(c.label==='2B'){
  for(const w of people){const b=row(w,'category:'+w);for(const cat of categories)choice(b,cat,'category:'+w,cat)}
 }else if(c.label==='2C'){
  const meanings=['1 · have a good relationship with someone · два выражения','2 · be similar to a parent or relative','3 · respect someone','4 · see, talk or write to someone'];
  meanings.forEach((m,i)=>{const key=String(i+1),b=row(m,key);for(const p of phrases)choice(b,p,key,p,i===0,i===0?2:1);
   const old=split(values[key]);if(old.length&&old.some(v=>!phrases.includes(v))){const legacy=el('p','Прежний ответ: '+values[key],'b1-legacy');b.parentElement.append(legacy)}});
 }else if(c.label==='2D'){
  const a=row('О ком расскажете?','person');for(const p of ['teammate','colleague','manager','grandparent','partner','close friend'])choice(a,p,'person',p);
  const b=row('Какое выражение используете?','phrase');for(const p of phrases)choice(b,p,'phrase',p);
  const model=el('p','Выберите человека и выражение выше.','b1-model');host.append(model);refreshPrompt=()=>{const p=values.person,v=values.phrase;model.textContent=p&&v?`I ${v==='be friendly with'?'am friendly with':v} my ${p} because …`:'Выберите человека и выражение выше.'};
 }
 const actions=el('div',undefined,'actions'),check=el('button',c.graded?'Проверить':'Я ответил(а) устно','primary'),reset=el('button','Начать заново');check.type=reset.type='button';check.dataset.reviewCheck='';reset.dataset.reviewReset='';actions.append(check,reset);host.append(actions);feedback=el('p',undefined,'statusline');feedback.setAttribute('role','status');feedback.dataset.reviewFeedback='';host.append(feedback);
 check.onclick=()=>{
  const result=grade(id,values);
  if(result){if(!result.complete){feedback.textContent='Сначала выберите все ответы. В пунктах с двумя вариантами нужны оба.';return}state.reviewAttempted=true;state.score=result.correct.filter(Boolean).length;state.total=result.total;state.done=state.score===state.total;feedback.textContent=state.done?'Всё верно. Можно продолжать.':`Верно: ${state.score} из ${state.total}. Попробуйте ещё раз.`;[...host.querySelectorAll('fieldset')].forEach((f,i)=>f.dataset.result=result.correct[i]?'correct':'incorrect');}
  else{if(c.label==='1B'&&!split(values.photos).length||c.label==='2D'&&(!values.person||!values.phrase)){feedback.textContent='Сначала выберите опоры для своего ответа.';return}state.reviewAttempted=true;state.done=true;state.score=null;feedback.textContent='Отмечено. Личный ответ не оценивается автоматически.'}
  changed();
 };
 reset.onclick=()=>{state.values={};for(const k of Object.keys(values))delete values[k];state.values=values;state.reviewAttempted=false;state.revealed={};state.done=false;state.score=null;feedback.textContent='Выбор сброшен. Прежняя заметка сохранена.';host.querySelectorAll('[data-result]').forEach(e=>e.removeAttribute('data-result'));sync();changed()};
 if(state.reviewAttempted)feedback.textContent=state.done?(c.graded?'Задание выполнено. Можно повторить.':'Личный ответ отмечен без оценки.'):'Можно продолжить попытку.';
 sync();return true;
}
const api={get,grade,mount};root.B1Unit1A=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window==='undefined'?globalThis:window);
