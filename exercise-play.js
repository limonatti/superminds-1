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
 const values=()=>fields.length?fields.filter(f=>!f.optional||String(f.get?.()||'').trim()).map(f=>String(f.get?.()||'')):[...responses.querySelectorAll('textarea,input:not([type=checkbox])')].map(el=>el.value);
 const allowed=()=>{const v=values();return v.length&&v.every(s=>s.trim())&&JSON.stringify(v)===attempted};
 const update=()=>{const open=allowed();dialog.querySelectorAll(keySelector).forEach(el=>el.classList.toggle('play-key-locked',!open));dialog.querySelectorAll(buttonSelector).forEach(el=>{el.disabled=!open;el.title=open?'':'Сначала заполните и проверьте упражнение'});};
 const capture=ev=>{if(ev.target.closest(buttonSelector)&&!allowed()){ev.preventDefault();ev.stopImmediatePropagation()}};
 const checked=ev=>{if(ev.target.closest('#check,#checkTask,#exerciseCheck,#practiceCheck,#practiceCheckAll,#practiceDone,#done,#saveAnswer,.coursework-save'))attempted=JSON.stringify(values());update()};
 dialog.addEventListener('click',capture,true);dialog.addEventListener('click',checked);dialog.addEventListener('input',update);dialog.addEventListener('change',update);update();
 return()=>{dialog.removeEventListener('click',capture,true);dialog.removeEventListener('click',checked);dialog.removeEventListener('input',update);dialog.removeEventListener('change',update);dialog.querySelectorAll(keySelector).forEach(el=>el.classList.remove('play-key-locked'));dialog.querySelectorAll(buttonSelector).forEach(el=>el.disabled=false)};
}
// For a previously unmarked blank, snap a tap/drop to the printed underline.
// The picture is read locally; no OCR service, generated answer or grading key is involved.
const imagePixels=new Map();
async function printedGap(url,px,py,crop){
 const [x,y,w,h]=crop,width=Math.min(w*.8,.095),height=Math.min(h*.7,.018);
 const fallback=[Math.max(x,Math.min(x+w-width,px-width/2)),Math.max(y,Math.min(y+h-height,py-height/2)),width,height];
 if(!url)return fallback;
 try{
  if(!imagePixels.has(url)){if(imagePixels.size>=3)imagePixels.clear();imagePixels.set(url,new Promise(resolve=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');const scale=Math.min(1,1400/im.naturalWidth,2000/im.naturalHeight);c.width=Math.round(im.naturalWidth*scale);c.height=Math.round(im.naturalHeight*scale);const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,0,0,c.width,c.height);try{resolve({data:ctx.getImageData(0,0,c.width,c.height).data,W:c.width,H:c.height})}catch{resolve(null)}};im.onerror=()=>resolve(null);im.src=url;}));}
  const pixels=await imagePixels.get(url);if(!pixels)return fallback;const {data,W,H}=pixels,cx=Math.round(px*W),cy=Math.round(py*H),radius=Math.max(12,Math.round(H*.013)),minX=Math.ceil(x*W),maxX=Math.floor((x+w)*W)-1;
  const ink=(a,b)=>{if(a<0||a>=W||b<0||b>=H)return false;const i=(b*W+a)*4;return data[i]*.299+data[i+1]*.587+data[i+2]*.114<190};let best=null;
  for(let row=Math.max(Math.ceil(y*H),cy-radius);row<=Math.min((y+h)*H-1,cy+radius);row++){
   if(![-3,-2,-1,0,1,2,3].some(dx=>ink(cx+dx,row)))continue;
   let l=cx,r=cx,gap=0;for(let a=cx;a>=minX;a--){gap=ink(a,row)?0:gap+1;if(gap>Math.max(4,W*.004))break;l=a+gap}gap=0;for(let a=cx;a<=maxX;a++){gap=ink(a,row)?0:gap+1;if(gap>Math.max(4,W*.004))break;r=a-gap}
   // A dotted underline can run into punctuation or the next printed word.
   // Trim those glyphs before judging the empty space above the line.
   const inkAbove=a=>{let n=0;for(let b=row-Math.round(H*.012);b<row-4;b+=2)if(ink(a,b)&&++n>=2)return true;return false};
   for(let a=cx;a>=l;a--)if(inkAbove(a)){l=a+1;break}for(let a=cx;a<=r;a++)if(inkAbove(a)){r=a-1;break}
   if(r-l<W*.02||r-l>W*.55)continue;
   let above=0,total=0,line=0;for(let a=l+2;a<r-2;a+=2){if(ink(a,row))line++;for(let b=row-Math.round(H*.012);b<row-4;b+=2){above+=ink(a,b)?1:0;total++;}}
   if(above/Math.max(1,total)>.04||line/Math.max(1,(r-l-4)/2)<.25)continue;
   const score=Math.abs(row-cy-H*.004)-Math.min((r-l)/W,.15)*H*.02;if(!best||score<best.score)best={score,box:[l/W,Math.max(y,row/H-.013),(r-l)/W,Math.min(.016,y+h-(row/H-.013))]};
  }
  return best?.box||fallback;
 }catch{return fallback}
}
function attach(config){
 const {dialog,source,responses,id,text=''}=config;if(!dialog||!source||!responses)return;
 mounted.get(dialog)?.destroy();dialog.classList.add('play-dialog');dialog.classList.toggle('play-native',!!config.native);
 const geometry=config.geometry||root.EXERCISE_GAPS?.[id]||{};
 const layout=root.EXERCISE_INLINE?.[id];
 const inline=!!layout||Object.keys(geometry).length>0||(config.fields||[]).some(f=>f.geometry)||/\b(?:complet\w*|fill|insert|gaps?|blanks?|missing)\b|_{2,}|\.{4,}|\bwrite\b.{0,80}\b(?:word|verb|preposition|article)\b|\b(?:use|put)\b.{0,80}\bcorrect forms?\b|\b(?:put|write|use)\b.{0,100}\b(?:verbs?|past simple|present simple|present perfect)\b/i.test(text.slice(0,500).replace(/\s+/g,' '));
 const setCloze=inline&&/\b(?:complet\w*|missing|gaps|blanks|fill (?:in|the))\b/i.test(text.slice(0,300).replace(/\s+/g,' '));
 const givenFields=(config.fields||[]).filter(f=>f&&f.get&&f.set&&Object.hasOwn(layout?.given||{},f.id)&&(!f.get()||norm(f.get())===norm(layout.given[f.id])));
 for(const f of givenFields)if(!f.get())f.set(layout.given[f.id]);
 const fields=(config.fields||[]).filter(f=>f&&f.get&&f.set&&!givenFields.includes(f)&&f.kind!=='multi'&&(f.kind!=='set'||setCloze)&&(inline||f.input?.tagName!=='TEXTAREA'));
 // A cloze item may store several words as one unordered answer. Keep that
 // grading contract while giving each printed blank its own editable slot.
 for(let i=fields.length-1;i>=0;i--){const f=fields[i];if(f.kind!=='set')continue;
  const read=()=>{const value=String(f.get()),parts=value.split(/[;\n]/.test(value)?/[;\n]/:/,/).map(s=>s.trim());while(parts.length>1&&!parts.at(-1))parts.pop();return parts},count=Math.max(1,Number(f.count)||1,read().length);
  fields.splice(i,1,...Array.from({length:count},(_,j)=>({...f,id:f.id+'.'+(j+1),label:count===1?f.label:f.label+'.'+(j+1),kind:'set-part',get:()=>read()[j]||'',set:value=>{const values=read();while(values.length<count)values.push('');values[j]=value;return f.set(values.some(v=>v.trim())?values.join('; ')+(count===1?';':''):'')}})));
 }
 // Split a legacy combined answer only when the source explicitly locates its parts.
 for(let i=fields.length-1;i>=0;i--){
  const f=fields[i],mapped=layout?.slots?.filter(g=>g.field===f.id&&g.parts>1)||[],parts=mapped.length?mapped:Object.keys(geometry).filter(key=>key.startsWith(f.id+'.')&&/^\d+$/.test(key.slice(f.id.length+1))).sort((a,b)=>Number(a.slice(f.id.length+1))-Number(b.slice(f.id.length+1))).map(key=>geometry[key]);
  if(parts.length<2||f.options?.length||f.kind==='set')continue;
  const join=mapped[0]?.join||(f.answers?.[0]?.includes(';')?'; ':', '),read=()=>String(f.get()).split(/\s*[,;]\s*/);
  fields.splice(i,1,...parts.map((g,j)=>({...f,id:f.id+'.'+(j+1),label:f.label+'.'+(j+1),geometry:g,get:()=>read()[j]||'',set:value=>{const values=read();while(values.length<parts.length)values.push('');values[j]=value;return f.set(values.join(join))}})));
 }
 // Placement is saved separately from answers; the original inputs keep their sync and grading.
 let freeAnswer=null,freeValues=[];
 // A writing task can mention words/articles without containing printed blanks.
 const instruction=text.slice(0,400).replace(/\s+/g,' '),writingTask=/\bwrite\s+(?:(?:a|an|the|your|own|short|three|two|more)\s+)*(?:articles?|essays?|e-?mails?|letters?|stor(?:y|ies)|paragraphs?|reports?|blog posts?|comments?|summar(?:y|ies))\b/i.test(instruction)&&!/\b(?:each|every)\s+(?:gap|blank)\b/i.test(instruction);
 if(inline&&!writingTask&&!config.native&&!fields.length&&!(config.fields||[]).length){
  const note=responses.querySelector('textarea');
  if(note){freeAnswer=note;freeValues=readFree();for(let i=0;i<freeValues.length;i++)fields.push(freeField(i));}
 }
 function readFree(){const value=freeAnswer.value,lines=value.replace(/\r/g,'').split('\n'),numbered=lines.every((line,i)=>line.startsWith((i+1)+'. '));return numbered?lines.map(line=>line.slice(line.indexOf('. ')+2)):value?[value]:[''];}
 function freeField(i){return inputField(String(i+1),freeAnswer,[],undefined,freeAnswer.closest('.responseField,.exercise-field,.answer-row')||freeAnswer,{optional:true,get:()=>readFree()[i]||'',set:value=>{if(freeAnswer.disabled)return false;freeValues=readFree();while(freeValues.length<=i)freeValues.push('');freeValues[i]=value;freeAnswer.value=freeValues.map((v,n)=>(n+1)+'. '+v).join('\n');freeAnswer.dispatchEvent(new Event('input',{bubbles:true}));return true}})}
 const positionKey='exercise-positions-v1:'+location.pathname+':'+id;
 let positions={};try{positions=JSON.parse(localStorage.getItem(positionKey)||'{}')}catch{}
 if(!positions||typeof positions!=='object'||Array.isArray(positions))positions={};
 const savePositions=()=>{try{localStorage.setItem(positionKey,JSON.stringify(positions))}catch{}};
 if(layout)for(const f of fields){const g=layout.slots?.find(g=>g.field===f.id&&g.parts===1);if(g)f.geometry=g;if(layout.bank?.length&&!f.options?.length)f.options=layout.bank.map(value=>({value,label:value}));}
 source.dataset.sourceFit='width';
 const releaseKeys=dialog.id==='mdExercise'?()=>{}:gateKeys(dialog,responses,fields.length?fields:config.fields||[]);
 if(!fields.length){dialog.classList.add('play-open-answer');const destroy=()=>{releaseKeys();dialog.classList.remove('play-dialog','play-open-answer','play-native');dialog.removeEventListener('close',destroy)};mounted.set(dialog,{destroy});dialog.addEventListener('close',destroy,{once:true});root.ExerciseSource?.change(source,{});return}
 dialog.classList.remove('play-open-answer');
 let selected=Math.max(0,fields.findIndex(f=>!String(f.get()).trim())),ignoreClickUntil=0,destroyed=false,drag=null,hintMessage='',pendingWord=null,typingRequested=null;
 const doc=source.querySelector('.focus-document'),slots=new Map(),hidden=new Map();
 const hide=el=>{if(el&&!hidden.has(el)){hidden.set(el,el.hidden);el.hidden=true;el.classList.add('play-original-control')}};
 const bench=document.createElement('section');bench.className='play-workbench';bench.classList.toggle('play-inline-only',inline);bench.setAttribute('aria-label','Слова и ответы');
 bench.innerHTML='<div class="play-answer-strip" aria-label="Пропуски"></div><div class="play-bank-head"><span class="play-current"></span><button type="button" class="play-erase" aria-label="Очистить выбранный пропуск">Убрать слово</button></div><button type="button" class="play-reposition" hidden>Выбрать другое место</button><div class="play-bank" role="group" aria-label="Варианты ответа"></div><div class="play-manual"><label>Свой вариант <input autocomplete="off" spellcheck="false" aria-label="Написать ответ в выбранный пропуск"></label></div><div class="play-bottom"><span class="play-hint">Выбери пропуск и слово — или перетащи карточку.</span><button type="button" class="play-check">Проверить</button></div><p class="play-feedback" role="status" aria-live="polite"></p>';
 if(config.instruction){const instruction=document.createElement('p');instruction.className='play-task-instruction';instruction.textContent=config.instruction;bench.prepend(instruction)}
 source.after(bench);const q=s=>bench.querySelector(s),strip=q('.play-answer-strip'),bank=q('.play-bank'),manual=q('.play-manual input');
 for(const f of [...fields,...givenFields])hide(f.scope);
 if(freeAnswer?.id)hide(responses.querySelector('label[for="'+CSS.escape(freeAnswer.id)+'"]'));
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
  if(destroyed)return;for(const [f,buttons]of slots)for(const button of buttons){const v=display(f),status=state(f);if(button.tagName==='INPUT'){if(button.value!==v)button.value=v}else button.textContent=(button.closest('.play-answer-strip')?f.label+' · ':'')+(v||'…');button.dataset.result=status;button.classList.toggle('is-active',fields.indexOf(f)===selected);if(button.tagName!=='INPUT')button.setAttribute('aria-pressed',String(fields.indexOf(f)===selected));button.setAttribute('aria-label',`Пропуск ${f.label}: ${v||'не заполнен'}${status==='correct'?', верно':status==='incorrect'?', попробуй ещё раз':''}`);button.disabled=!!f.input?.disabled}
  for(const [f,buttons]of slots)for(const button of buttons)fitWord(button,display(f));
  q('.play-current').textContent=`Пропуск ${current().label} · ${selected+1} из ${fields.length}${!inline&&current().get()?' · '+display(current()):''}`;
  if(document.activeElement!==manual)manual.value=current().get();
  q('.play-reposition').hidden=!inline||!positions[current().id];
  if(inline&&!slots.get(current())?.length)q('.play-hint').textContent=`Нажми на пропуск ${current().label} на картинке — или перетащи туда слово.`;
  q('.play-check').disabled=!!originalCheck?.disabled;
  const hint=q('.play-hint-button'),trigger=originalHint||current().scope?.querySelector('[data-reveal],[data-practice-reveal]');if(hint)hint.disabled=!trigger||trigger.disabled;
  if(feedback)q('.play-feedback').textContent=hintMessage||feedback.textContent;else {const statuses=fields.map(state);q('.play-feedback').textContent=hintMessage||(statuses.some(s=>s==='correct'||s==='incorrect')?`Верно: ${statuses.filter(s=>s==='correct').length} из ${fields.length}.`:'')}
 }
 function activate(index){hintMessage='';pendingWord=null;typingRequested=null;selected=index;manual.value=current().get();current().activate?.();renderBank();refresh()}
 function commit(f,option,advance=true){
  if(f.input?.disabled)return;
  hintMessage='';
  selected=fields.indexOf(f);
  const choices=f.options||[],matching=choices.find(o=>norm(o.label??o)===norm(option.label));
  if(choices.length&&!matching){q('.play-feedback').textContent='Выбери пропуск, чтобы увидеть его варианты.';activate(fields.indexOf(f));return}
  const value=matching?(matching.value??matching):option.value;
  if(inline&&!slots.get(f)?.length){pendingWord=option;q('.play-hint').textContent=`Нажми на пропуск ${f.label} на картинке, чтобы вставить «${option.label}».`;return}
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
  const end=e=>{if(!drag||drag.pointer!==e.pointerId)return;const d=drag;drag=null;if(d.ghost){d.ghost.remove();ignoreClickUntil=Date.now()+350;const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('.play-slot');if(e.type==='pointerup'&&target&&dialog.contains(target))commit(fields[+target.dataset.field],option);else if(e.type==='pointerup'&&inline){const canvas=document.elementFromPoint(e.clientX,e.clientY)?.closest('.play-canvas');if(canvas&&doc.contains(canvas))placeAt(canvas,e.clientX,e.clientY,option)}}};
  button.addEventListener('pointerup',end);button.addEventListener('pointercancel',end);
 }
 function renderBank(){
  const f=current(),options=shuffle(candidates(f,fields,text),id),used=f.tokens?f.get().trim().split(/\s+/):[];bank.replaceChildren();
  for(const option of options){const b=document.createElement('button');b.type='button';b.className='play-word';b.textContent=option.label;const index=option.append?used.findIndex(w=>norm(w)===norm(option.value)):-1;if(index>=0)used.splice(index,1);b.disabled=!!f.input?.disabled||index>=0;b.onclick=e=>{if(Date.now()>ignoreClickUntil){commit(current(),option);if(e.detail===0)bank.querySelector('button:not(:disabled)')?.focus({preventScroll:true})}};wireDrag(b,option);bank.append(b)}
  bank.hidden=!options.length;bench.classList.toggle('has-word-bank',!!options.length);q('.play-hint').textContent=options.length?'Выбери пропуск и слово — или перетащи карточку.':'Нажми на пропуск и впиши свой ответ.';
  q('.play-manual').hidden=inline||!!options.length;
  // Keyboard entry remains available without bringing back a second form.
  let toggle=bench.querySelector('.play-type-toggle');if(!toggle){toggle=document.createElement('button');toggle.type='button';toggle.className='play-type-toggle';toggle.textContent='Написать самому';toggle.onclick=()=>{if(inline){const input=slots.get(current())?.[0];if(input?.tagName==='INPUT'){input.readOnly=false;input.focus()}else{typingRequested=current();q('.play-hint').textContent=`Нажми на пропуск ${current().label} на картинке и напиши ответ.`}}else{q('.play-manual').hidden=!q('.play-manual').hidden;if(!q('.play-manual').hidden)manual.focus()}};q('.play-bank-head').append(toggle)}toggle.hidden=!options.length||!f.input||f.input.tagName==='SELECT';
 }
 function slot(f,index){const editable=inline&&f.input?.tagName!=='SELECT'&&!f.options?.some(o=>typeof o==='object'&&o.value!==o.label),b=document.createElement(editable?'input':'button');b.type=editable?'text':'button';b.className='play-slot';b.dataset.field=index;
  if(editable){b.autocomplete='off';b.spellcheck=false;b.placeholder='…';b.readOnly=!!candidates(f,fields,text).length;b.ondblclick=()=>{b.readOnly=false;b.focus();b.select()};b.onfocus=()=>{if(selected!==index)activate(index)};b.oninput=()=>{hintMessage='';f.set(b.value);refresh()};b.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();if(freeAnswer&&index===fields.length-1&&f.get()){freeValues.push('');fields.push(freeField(fields.length));}activate(Math.min(fields.length-1,index+1));(slots.get(current())?.[0]||doc.querySelector('.play-canvas[tabindex="0"]'))?.focus()}};}
  b.onclick=()=>activate(index);b.ondragover=e=>{if([...e.dataTransfer.types].includes('application/x-exercise-word')){e.preventDefault();e.dataTransfer.dropEffect='copy'}};b.ondrop=e=>{e.preventDefault();try{const data=JSON.parse(e.dataTransfer.getData('application/x-exercise-word'));if(data.exercise===id)commit(f,data,false)}catch{}};(slots.get(f)||slots.set(f,[]).get(f)).push(b);return b}
 function makeCanvas(sheet,item){
  let canvas=sheet.querySelector('.play-canvas');if(canvas)return canvas;
  const svg=sheet.querySelector('svg');canvas=document.createElement('div');canvas.className='play-canvas';canvas._source=item;svg.replaceWith(canvas);canvas.append(svg);
  if(inline){
   canvas.setAttribute('role','group');canvas.setAttribute('aria-label','Задание. Стрелками выбери место пропуска и нажми Enter.');
   canvas.onfocus=()=>{if(canvas.querySelector('.play-target'))return;const r=canvas.getBoundingClientRect(),bottom=Math.min(r.bottom,bench.getBoundingClientRect().top);canvas._cursor={x:r.width/2,y:Math.max(12,(Math.max(r.top,0)+bottom)/2-r.top)};target();};
   canvas.onblur=()=>canvas.querySelector('.play-target')?.remove();
   const target=()=>{let marker=canvas.querySelector('.play-target');if(!marker){marker=document.createElement('span');marker.className='play-target';marker.setAttribute('aria-hidden','true');canvas.append(marker)}Object.assign(marker.style,{left:canvas._cursor.x+'px',top:canvas._cursor.y+'px'});};
   canvas.onkeydown=e=>{if(e.target!==canvas)return;const r=canvas.getBoundingClientRect(),c=canvas._cursor||{x:r.width/2,y:r.height/2},step=e.shiftKey?64:16;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();e.stopPropagation();c.x=Math.max(1,Math.min(r.width-1,c.x+(e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0)));c.y=Math.max(1,Math.min(r.height-1,c.y+(e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0)));canvas._cursor=c;target()}else if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();placeAt(canvas,r.left+c.x,r.top+c.y,pendingWord)}};
   canvas.onclick=e=>{if(!e.target.closest('.play-slot'))placeAt(canvas,e.clientX,e.clientY,pendingWord)};canvas.ondragover=e=>{if([...e.dataTransfer.types].includes('application/x-exercise-word')){e.preventDefault();e.dataTransfer.dropEffect='copy'}};canvas.ondrop=e=>{if(e.target.closest('.play-slot'))return;e.preventDefault();try{const data=JSON.parse(e.dataTransfer.getData('application/x-exercise-word'));if(data.exercise===id)placeAt(canvas,e.clientX,e.clientY,data)}catch{}};}
  return canvas;
 }
 async function placeAt(canvas,clientX,clientY,option){
  canvas.querySelector('.play-target')?.remove();
  if(freeAnswer&&slots.get(current())?.length&&current().get()){freeValues.push('');fields.push(freeField(fields.length));selected=fields.length-1;}
  const f=current(),item=canvas._source;if(!item||f.input?.disabled)return;
  // An already placed answer is edited in place, never moved by an accidental page tap.
  if(slots.get(f)?.length){slots.get(f)[0].focus();return}
  const rect=canvas.getBoundingClientRect(),[x,y,w,h]=item.box;
  const px=x+(clientX-rect.left)/rect.width*w,py=y+(clientY-rect.top)/rect.height*h;
  const box=await printedGap(canvas.querySelector('image')?.getAttribute('href'),px,py,item.box);
  if(destroyed||current()!==f||f.input?.disabled)return;
  positions[f.id]={image:item.image,page:item.page,box};savePositions();pendingWord=null;place();
  const input=slots.get(f)?.[0];if(option)commit(f,option);else if(input){input.readOnly=!!candidates(f,fields,text).length&&typingRequested!==f;typingRequested=null;input.focus()}
 }
 function place(){
  if(!doc)return;slots.clear();strip.replaceChildren();doc.querySelectorAll('.play-gap-layer').forEach(el=>el.remove());
  const sheets=[...doc.querySelectorAll('.focus-sheet')],model=doc._focus;
  fields.forEach((f,index)=>{
   const g=positions[f.id]||f.geometry||geometry[f.id],spec=Array.isArray(g)?{box:g}:g;let placed=false;
   if(spec?.box)sheets.some((sheet,si)=>{const item=model?.renderedSources?.[si]||model?.model.sources[si];if(!item||spec.page&&spec.page!==item.page||spec.image&&spec.image!==item.image)return false;const [x,y,w,h]=item.box,[a,b,c,d]=spec.box;if(a<x-.002||b<y-.002||a+c>x+w+.003||b+d>y+h+.003)return false;
    const canvas=makeCanvas(sheet,item);let layer=canvas.querySelector('.play-gap-layer');if(!layer){layer=document.createElement('div');layer.className='play-gap-layer';canvas.append(layer)}const button=slot(f,index);Object.assign(button.style,{left:(a-x)/w*100+'%',top:(b-y)/h*100+'%',width:c/w*100+'%',height:d/h*100+'%'});layer.append(button);placed=true;return true;
   });
   if(!placed&&!inline)strip.append(slot(f,index));
  });if(inline)sheets.forEach((sheet,si)=>makeCanvas(sheet,model?.renderedSources?.[si]||model?.model.sources[si]));for(const canvas of doc.querySelectorAll('.play-canvas'))canvas.tabIndex=inline&&fields.some(f=>!slots.get(f)?.length)?0:-1;strip.hidden=!strip.children.length;renderBank();refresh();
 }
 manual.addEventListener('input',()=>{hintMessage='';current().set(manual.value);refresh()});manual.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();activate(Math.min(fields.length-1,selected+1));manual.focus()}});
 q('.play-reposition').onclick=()=>{delete positions[current().id];savePositions();place()};
 q('.play-erase').onclick=()=>{hintMessage='';const f=current(),words=f.get().trim().split(/\s+/);words.pop();f.set(f.tokens?words.join(' '):'');renderBank();refresh()};
 const observer=new MutationObserver(refresh);for(const f of fields)if(f.scope)observer.observe(f.scope,{subtree:true,childList:true,attributes:true,attributeFilter:['class','aria-invalid','aria-pressed','data-result','disabled']});if(feedback)observer.observe(feedback,{childList:true,subtree:true,characterData:true});
 const resize=new ResizeObserver(()=>{root.ExerciseSource?.fit(source);refresh()});resize.observe(source);resize.observe(bench);const onInput=()=>{if(freeAnswer){const values=readFree();if(values.length>fields.length){while(fields.length<values.length)fields.push(freeField(fields.length));place();return}}refresh()};responses.addEventListener('input',onInput);responses.addEventListener('change',onInput);doc?.addEventListener('exercise-source-render',place);
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
 return attach({dialog,source,responses,id,text,fields,instruction:inline?.instruction});
}
root.ExercisePlay={attach,inputField,candidates,shuffle,sourceLetters,speakout};
if(typeof module!=='undefined'&&module.exports)module.exports={candidates,shuffle,sourceLetters};
})(typeof window==='undefined'?globalThis:window);
