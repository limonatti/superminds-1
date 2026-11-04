/* One interaction surface; the course's original controls still own answers and grading. */
(function(root){
'use strict';
const mounted=new WeakMap(),norm=s=>String(s??'').normalize('NFKC').replace(/[‘’]/g,"'").trim().toLowerCase();
function shuffle(values,seed){let n=2166136261;for(const c of seed)n=Math.imul(n^c.charCodeAt(0),16777619);return values.map((v,i)=>{n^=n<<13;n^=n>>>17;n^=n<<5;return{v,r:n>>>0,i}}).sort((a,b)=>a.r-b.r||a.i-b.i).map(x=>x.v)}
function unique(values){const seen=new Set();return values.filter(v=>{const k=norm(v.label);if(!k||seen.has(k))return false;seen.add(k);return true})}
function candidates(field,fields,text){
 if(field.options?.length)return unique(field.options.map(o=>typeof o==='string'?{value:o,label:o}:o));
 if(field.tokens?.length)return field.tokens.map(t=>({value:t.text||t,label:t.text||t,append:true}));
 // Suggestions are authored by the exercise, never reconstructed from grading keys.
 return [];
}

function sourceLetters(text=''){
 const labels=new Set();for(const m of text.matchAll(/\b([a-j])\s*[–—-]\s*([b-j])\b/gi)){const from=m[1].toLowerCase().charCodeAt(0),to=m[2].toLowerCase().charCodeAt(0);if(to>from)for(let n=from;n<=to;n++)labels.add(String.fromCharCode(n))}
 for(const m of text.matchAll(/(?:^|\n)\s*([A-Ja-j])(?:[.)]\s+|\s*\n)/g))labels.add(m[1].toLowerCase());return [...labels].sort();
}
function inputField(id,input,answers=[],options,scope,extra={}){
 return {id:String(id),label:String(id),input,scope:scope||input?.parentElement,answers:answers.flat(Infinity).filter(v=>typeof v==='string'),options,
  get:()=>input?.value||'',activate:()=>input?.dispatchEvent(new FocusEvent('focus')),set:v=>{if(!input||input.disabled)return false;input.value=v;input.dispatchEvent(new Event(input.tagName==='SELECT'?'change':'input',{bubbles:true}));if(input.tagName==='SELECT')input.dispatchEvent(new Event('input',{bubbles:true}));return true},...extra};
}
// A key is a comparison after a filled attempt, never an initial suggestion.
function gateKeys(dialog,responses,fields){
 const keySelector='#keyArea,#keyPanel,.practice-key,.exercise-key',buttonSelector='#exerciseKeys,#inlineHint,#inlineCompare,[data-reveal],[data-practice-reveal]';
 let attempted='';
 const values=()=>fields.length?fields.map(f=>String(f.get?.()||'')):[...responses.querySelectorAll('textarea,input:not([type=checkbox])')].map(el=>el.value);
 const allowed=()=>{const v=values();return v.length&&v.every(s=>s.trim())&&JSON.stringify(v)===attempted};
 const update=()=>{const open=allowed();dialog.querySelectorAll(keySelector).forEach(el=>el.classList.toggle('play-key-locked',!open));dialog.querySelectorAll(buttonSelector).forEach(el=>{el.disabled=!open;el.title=open?'':'Сначала заполните и проверьте упражнение'});};
 const capture=ev=>{if(ev.target.closest(buttonSelector)&&!allowed()){ev.preventDefault();ev.stopImmediatePropagation()}};
 const checked=ev=>{if(ev.target.closest('#check,#checkTask,#exerciseCheck,#practiceCheck,#practiceCheckAll,#practiceDone,#done,#saveAnswer,.coursework-save'))attempted=JSON.stringify(values());update()};
 dialog.addEventListener('click',capture,true);dialog.addEventListener('click',checked);dialog.addEventListener('input',update);dialog.addEventListener('change',update);update();
 return()=>{dialog.removeEventListener('click',capture,true);dialog.removeEventListener('click',checked);dialog.removeEventListener('input',update);dialog.removeEventListener('change',update);dialog.querySelectorAll(keySelector).forEach(el=>el.classList.remove('play-key-locked'));dialog.querySelectorAll(buttonSelector).forEach(el=>el.disabled=false)};
}
function attach(config){
 const {dialog,source,responses,id,text=''}=config;if(!dialog||!source||!responses)return;
 mounted.get(dialog)?.destroy();dialog.classList.add('play-dialog');dialog.classList.toggle('play-native',!!config.native);
 const geometry=config.geometry||root.EXERCISE_GAPS?.[id]||{};
 const fields=(config.fields||[]).filter(f=>f&&f.get&&f.set&&f.kind!=='multi'&&f.kind!=='set'&&f.input?.tagName!=='TEXTAREA');
 source.dataset.sourceFit='width';
 const releaseKeys=dialog.id==='mdExercise'?()=>{}:gateKeys(dialog,responses,config.fields||[]);
 if(!fields.length){dialog.classList.add('play-open-answer');const destroy=()=>{releaseKeys();dialog.classList.remove('play-dialog','play-open-answer','play-native');dialog.removeEventListener('close',destroy)};mounted.set(dialog,{destroy});dialog.addEventListener('close',destroy,{once:true});root.ExerciseSource?.change(source,{});return}
 dialog.classList.remove('play-open-answer');
 let selected=0,ignoreClickUntil=0,destroyed=false,drag=null,hintMessage='';
 const doc=source.querySelector('.focus-document'),slots=new Map(),hidden=new Map();
 const hide=el=>{if(el&&!hidden.has(el)){hidden.set(el,el.hidden);el.hidden=true;el.classList.add('play-original-control')}};
 const bench=document.createElement('section');bench.className='play-workbench';bench.setAttribute('aria-label','Слова и ответы');
 bench.innerHTML='<div class="play-answer-strip" aria-label="Пропуски"></div><div class="play-bank-head"><span class="play-current"></span><button type="button" class="play-erase" aria-label="Очистить выбранный пропуск">Убрать слово</button></div><div class="play-bank" role="group" aria-label="Варианты ответа"></div><div class="play-manual"><label>Свой вариант <input autocomplete="off" spellcheck="false" aria-label="Написать ответ в выбранный пропуск"></label></div><div class="play-bottom"><span class="play-hint">Выбери пропуск и слово — или перетащи карточку.</span><button type="button" class="play-check">Проверить</button></div><p class="play-feedback" role="status" aria-live="polite"></p>';
 source.after(bench);const q=s=>bench.querySelector(s),strip=q('.play-answer-strip'),bank=q('.play-bank'),manual=q('.play-manual input');
 for(const f of fields)hide(f.scope);
 for(const selector of ['.instruction','.inline-instruction','.activity-bank-tray','.practice-help','.checkType','.responsePanel>h3','.responsePanel>p:not([role])'])responses.querySelectorAll(selector).forEach(hide);
 const originalCheck=config.check||dialog.querySelector('#check,#checkTask,#exerciseCheck,#practiceCheck');
 dialog.classList.toggle('play-graded',!!originalCheck);
 if(originalCheck){hide(originalCheck);q('.play-check').onclick=()=>{hintMessage='';originalCheck.click();if(!destroyed)refresh()}}else q('.play-check').hidden=true;
 const feedback=config.feedback||dialog.querySelector('#checkResult,#feedback,#checkSummary,#practiceResult');if(feedback)hide(feedback);
 const originalHint=dialog.querySelector('#inlineHint');if(originalHint||fields.some(f=>f.scope?.querySelector('[data-reveal],[data-practice-reveal]'))){const b=document.createElement('button');b.type='button';b.className='play-hint-button';b.textContent='Подсказка';b.onclick=()=>{current().activate?.();const trigger=originalHint||current().scope?.querySelector('[data-reveal],[data-practice-reveal]');trigger?.click();const message=originalHint?dialog.querySelector('#inlineFeedback'):current().scope?.querySelector('.feedback,.practice-feedback');hintMessage=message?.textContent||'';refresh()};q('.play-bank-head').append(b)}
 const current=()=>fields[selected],measure=document.createElement('canvas').getContext('2d');
 for(const [delta,label,icon]of [[-1,'Предыдущий пропуск','‹'],[1,'Следующий пропуск','›']]){const b=document.createElement('button');b.type='button';b.className='play-step';b.textContent=icon;b.setAttribute('aria-label',label);b.onclick=()=>{activate((selected+delta+fields.length)%fields.length);slots.get(current())?.[0]?.scrollIntoView({block:'nearest',inline:'nearest'})};q('.play-current').before(b)}
 function fitWord(button,value){if(!button.closest('.play-gap-layer')||!button.clientWidth)return;const width=button.clientWidth-6,height=button.clientHeight-2;let size=Math.min(24,Math.max(10,height*.8));measure.font=`600 ${size}px Arial`;const natural=measure.measureText(value||'…').width;size=Math.max(9,Math.min(size,size*width/Math.max(1,natural)));button.style.fontSize=size+'px';button.title=value||'Выбери слово';}
 function display(f){const value=f.get();return f.options?.find(o=>norm(o.value??o)===norm(value))?.label||value}
 function state(f){if(f.status)return f.status();const el=f.input,s=f.scope;if(s?.dataset.result)return s.dataset.result;for(const k of ['correct','incorrect','retry','revealed'])if(s?.classList.contains(k)||el?.classList.contains(k))return k==='retry'?'incorrect':k;if(el?.getAttribute('aria-invalid')==='true')return 'incorrect';return ''}
 function refresh(){
  if(destroyed)return;for(const [f,buttons]of slots)for(const button of buttons){const v=display(f),status=state(f);button.textContent=(button.closest('.play-answer-strip')?f.label+' · ':'')+(v||'…');button.dataset.result=status;button.classList.toggle('is-active',fields.indexOf(f)===selected);button.setAttribute('aria-pressed',String(fields.indexOf(f)===selected));button.setAttribute('aria-label',`Пропуск ${f.label}: ${v||'не заполнен'}${status==='correct'?', верно':status==='incorrect'?', попробуй ещё раз':''}`);button.disabled=!!f.input?.disabled}
  for(const [f,buttons]of slots)for(const button of buttons)fitWord(button,display(f));
  q('.play-current').textContent=`Пропуск ${current().label} · ${selected+1} из ${fields.length}${current().get()?' · '+display(current()):''}`;
  if(document.activeElement!==manual)manual.value=current().get();
  q('.play-check').disabled=!!originalCheck?.disabled;
  const hint=q('.play-hint-button'),trigger=originalHint||current().scope?.querySelector('[data-reveal],[data-practice-reveal]');if(hint)hint.disabled=!trigger||trigger.disabled;
  if(feedback)q('.play-feedback').textContent=hintMessage||feedback.textContent;else {const statuses=fields.map(state);q('.play-feedback').textContent=hintMessage||(statuses.some(s=>s==='correct'||s==='incorrect')?`Верно: ${statuses.filter(s=>s==='correct').length} из ${fields.length}.`:'')}
 }
 function activate(index){hintMessage='';selected=index;manual.value=current().get();current().activate?.();renderBank();refresh()}
 function commit(f,option,advance=true){
  if(f.input?.disabled)return;
  hintMessage='';
  selected=fields.indexOf(f);
  const choices=f.options||[],matching=choices.find(o=>norm(o.label??o)===norm(option.label));
  if(choices.length&&!matching){q('.play-feedback').textContent='Выбери пропуск, чтобы увидеть его варианты.';activate(fields.indexOf(f));return}
  const value=matching?(matching.value??matching):option.value;
  if(f.set(option.append?`${f.get()} ${value}`.trim():value)===false)return;
  if(advance&&!option.append){const next=fields.findIndex((g,i)=>i>fields.indexOf(f)&&!g.get());if(next>=0)selected=next}
  current().activate?.();renderBank();refresh();slots.get(current())?.[0]?.scrollIntoView({block:'nearest',inline:'nearest'});
 }
 function wireDrag(button,option){
  button.draggable=true;
  button.addEventListener('dragstart',e=>{e.dataTransfer.setData('application/x-exercise-word',JSON.stringify({exercise:id,...option}));e.dataTransfer.setData('text/plain',option.label);e.dataTransfer.effectAllowed='copy';button.classList.add('is-dragging')});
  button.addEventListener('dragend',()=>button.classList.remove('is-dragging'));
  button.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||e.button!==0)return;drag={pointer:e.pointerId,startX:e.clientX,startY:e.clientY,option,button};button.setPointerCapture(e.pointerId)});
  button.addEventListener('pointermove',e=>{if(!drag||drag.pointer!==e.pointerId)return;if(!drag.ghost&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>7){drag.ghost=document.createElement('span');drag.ghost.className='play-drag-ghost';drag.ghost.textContent=option.label;dialog.append(drag.ghost)}if(drag.ghost){drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px';e.preventDefault()}});
  const end=e=>{if(!drag||drag.pointer!==e.pointerId)return;const d=drag;drag=null;if(d.ghost){d.ghost.remove();ignoreClickUntil=Date.now()+350;const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('.play-slot');if(e.type==='pointerup'&&target&&dialog.contains(target))commit(fields[+target.dataset.field],option)}};
  button.addEventListener('pointerup',end);button.addEventListener('pointercancel',end);
 }
 function renderBank(){
  const f=current(),options=shuffle(candidates(f,fields,text),id),used=f.tokens?f.get().trim().split(/\s+/):[];bank.replaceChildren();
  for(const option of options){const b=document.createElement('button');b.type='button';b.className='play-word';b.textContent=option.label;const index=option.append?used.findIndex(w=>norm(w)===norm(option.value)):-1;if(index>=0)used.splice(index,1);b.disabled=!!f.input?.disabled||index>=0;b.onclick=e=>{if(Date.now()>ignoreClickUntil){commit(current(),option);if(e.detail===0)bank.querySelector('button:not(:disabled)')?.focus({preventScroll:true})}};wireDrag(b,option);bank.append(b)}
  bank.hidden=!options.length;bench.classList.toggle('has-word-bank',!!options.length);q('.play-hint').textContent=options.length?'Выбери пропуск и слово — или перетащи карточку.':'Нажми на пропуск и впиши свой ответ.';
  q('.play-manual').hidden=!!options.length;
  // Keyboard entry remains available without bringing back a second form.
  let toggle=bench.querySelector('.play-type-toggle');if(!toggle){toggle=document.createElement('button');toggle.type='button';toggle.className='play-type-toggle';toggle.textContent='Написать самому';toggle.onclick=()=>{q('.play-manual').hidden=!q('.play-manual').hidden;if(!q('.play-manual').hidden)manual.focus()};q('.play-bank-head').append(toggle)}toggle.hidden=!options.length||!f.input||f.input.tagName==='SELECT';
 }
 function slot(f,index){const b=document.createElement('button');b.type='button';b.className='play-slot';b.dataset.field=index;b.onclick=()=>activate(index);b.ondragover=e=>{if([...e.dataTransfer.types].includes('application/x-exercise-word')){e.preventDefault();e.dataTransfer.dropEffect='copy'}};b.ondrop=e=>{e.preventDefault();try{const data=JSON.parse(e.dataTransfer.getData('application/x-exercise-word'));if(data.exercise===id)commit(f,data,false)}catch{}};(slots.get(f)||slots.set(f,[]).get(f)).push(b);return b}
 function place(){
  if(!doc)return;slots.clear();strip.replaceChildren();doc.querySelectorAll('.play-gap-layer').forEach(el=>el.remove());
  const sheets=[...doc.querySelectorAll('.focus-sheet')],model=doc._focus;
  fields.forEach((f,index)=>{
   const g=f.geometry||geometry[f.id],spec=Array.isArray(g)?{box:g}:g;let placed=false;
   if(spec?.box)sheets.some((sheet,si)=>{const item=model?.full?{...model.model.sources[0],box:[0,0,1,1]}:model?.model.sources[si];if(!item||spec.page&&spec.page!==item.page||spec.image&&spec.image!==item.image)return false;const [x,y,w,h]=item.box,[a,b,c,d]=spec.box;if(a<x-.002||b<y-.002||a+c>x+w+.003||b+d>y+h+.003)return false;
    const svg=sheet.querySelector('svg');let canvas=sheet.querySelector('.play-canvas');if(!canvas){canvas=document.createElement('div');canvas.className='play-canvas';svg.replaceWith(canvas);canvas.append(svg)}let layer=canvas.querySelector('.play-gap-layer');if(!layer){layer=document.createElement('div');layer.className='play-gap-layer';canvas.append(layer)}const button=slot(f,index);Object.assign(button.style,{left:(a-x)/w*100+'%',top:(b-y)/h*100+'%',width:c/w*100+'%',height:d/h*100+'%'});layer.append(button);placed=true;return true;
   });
   if(!placed)strip.append(slot(f,index));
  });strip.hidden=!strip.children.length;renderBank();refresh();
 }
 manual.addEventListener('input',()=>{hintMessage='';current().set(manual.value);refresh()});manual.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();activate(Math.min(fields.length-1,selected+1));manual.focus()}});
 q('.play-erase').onclick=()=>{hintMessage='';const f=current(),words=f.get().trim().split(/\s+/);words.pop();f.set(f.tokens?words.join(' '):'');renderBank();refresh()};
 const observer=new MutationObserver(refresh);for(const f of fields)if(f.scope)observer.observe(f.scope,{subtree:true,childList:true,attributes:true,attributeFilter:['class','aria-invalid','aria-pressed','data-result','disabled']});if(feedback)observer.observe(feedback,{childList:true,subtree:true,characterData:true});
 const resize=new ResizeObserver(()=>{root.ExerciseSource?.fit(source);refresh()});resize.observe(source);resize.observe(bench);const onInput=()=>refresh();responses.addEventListener('input',onInput);responses.addEventListener('change',onInput);doc?.addEventListener('exercise-source-render',place);
 const resetButtons=[...dialog.querySelectorAll('#retry,#retryMistakes,#exerciseReset,#practiceRetry,#practiceReset')],onReset=()=>{hintMessage='';if(!destroyed)activate(Math.max(0,fields.findIndex(f=>!f.get())))};for(const b of resetButtons)b.addEventListener('click',onReset);
 function destroy(){releaseKeys();destroyed=true;observer.disconnect();resize.disconnect();drag?.ghost?.remove();bench.remove();doc?.querySelectorAll('.play-gap-layer').forEach(el=>el.remove());for(const [el,wasHidden]of hidden){el.hidden=wasHidden;el.classList.remove('play-original-control')}for(const b of resetButtons)b.removeEventListener('click',onReset);responses.removeEventListener('input',onInput);responses.removeEventListener('change',onInput);doc?.removeEventListener('exercise-source-render',place);dialog.removeEventListener('close',destroy);dialog.classList.remove('play-dialog','play-open-answer','play-graded')}
 mounted.set(dialog,{destroy,refresh});dialog.addEventListener('close',destroy,{once:true});place();root.ExerciseSource?.change(source,{});return {refresh,destroy};
}
function speakout({dialog,id,page,spec,inline,choice,activity,text}){
 const body=dialog.querySelector('#exerciseBody'),source=body.querySelector('.exercise-source'),responses=body.querySelector('.exercise-response');
 if(activity?.kind==='match')return attach({dialog,source,responses,id,text,fields:[],native:true});
 let fields=[];
 if(choice){
  fields=choice.groups.map((g,i)=>{const buttons=[...body.querySelectorAll('[data-page-choice]')].filter(b=>b.dataset.pageChoice.startsWith(i+':')),scope=buttons[0]?.closest('.page-choice-group').parentElement;
   const gap=choice.gaps.find(f=>f.n===g.n),boxes=g.options.flatMap(o=>o.boxes),top=Math.min(...boxes.map(b=>b[1])),bottom=Math.max(...boxes.map(b=>b[1]+b[3])),left=Math.min(...boxes.map(b=>b[0])),right=Math.max(...boxes.map(b=>b[0]+b[2]));
   const box=gap?.box||(bottom-top<24&&right-left<300?[left,top,right-left,bottom-top]:null);
   return {id:g.id,label:g.id,scope,options:g.options.map(o=>({value:o.value,label:o.label})),answers:g.correct?[g.correct]:[],geometry:box?{box:box.map((v,i)=>v/(i%2?842:595)),image:page.image,page:page.page}:null,
    activate:()=>buttons[0]?.dispatchEvent(new FocusEvent('focus')),get:()=>{const j=buttons.findIndex(b=>b.getAttribute('aria-checked')==='true');return j>=0?g.options[j].value:''},
    set:v=>{const j=g.options.findIndex(o=>norm(o.value)===norm(v));if(j<0)return false;buttons[j].click();return true},
    status:()=>buttons.some(b=>b.classList.contains('incorrect'))?'incorrect':buttons.some(b=>b.classList.contains('correct'))?'correct':''};
  });body.querySelectorAll('[data-inline]').forEach(el=>{el.parentElement.hidden=true});
 }else if(inline){
  fields=inline.fields.map(f=>{const input=[...body.querySelectorAll('[data-inline]')].find(el=>el.dataset.inline===f.id),item=spec.items.find(q=>q.n===f.n);return inputField(f.id,input,f.answer===undefined?[]:[f.answer],inline.vowels?undefined:item?.options?.map(o=>({value:o.label.replace(/^[a-d]\.\s*/i,''),label:o.label.replace(/^[a-d]\.\s*/i,'')})),input?.parentElement,{geometry:{box:f.box.map((v,i)=>v/(i%2?842:595)),image:page.image,page:page.page}})});
 }else fields=spec.items.map(f=>{const input=[...body.querySelectorAll('[data-answer]')].find(el=>el.dataset.answer===f.n);return input&&inputField(f.n,input,root.SpeakoutInteractive.variants(f.answer),f.options,input.closest('.answerrow'),{tokens:f.tokens})}).filter(Boolean);
 if(activity?.kind==='bank')for(const f of fields)f.options=activity.bank.map(o=>({value:o.value,label:o.label}));
 return attach({dialog,source,responses,id,text,fields});
}
root.ExercisePlay={attach,inputField,candidates,shuffle,sourceLetters,speakout};
if(typeof module!=='undefined'&&module.exports)module.exports={candidates,shuffle,sourceLetters};
})(typeof window==='undefined'?globalThis:window);
