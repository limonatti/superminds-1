/* Each exercise declares its interaction. Original controls own saved values. */
window.FocusActivity=(()=>{
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const norm=s=>String(s).trim().toLowerCase(),metadata=(ex,i)=>ex.activity?.fields?.[i]||{};
 function render(ex,values){
  const a=ex.activity||{},spec=ex.answerSpec||[];
  if(a.kind==='wordsearch')return `<div class="wordsearch" role="group" aria-label="Найди слова"><div class="wordsearch-grid" style="--columns:${a.grid[0].length}">${a.grid.flatMap((row,r)=>Array.from(row,(letter,c)=>`<button type="button" data-cell="${r*a.grid[0].length+c}" aria-label="Строка ${r+1}, столбец ${c+1}: ${letter}">${letter}</button>`)).join('')}</div><p class="wordsearch-status" role="status">Выбери первую и последнюю букву слова.</p><div class="wordsearch-words">${a.paths.map(p=>`<span data-found-word="${esc(p.word)}">${esc(p.word)}</span>`).join('')}</div></div><div class="answer-row" data-field="0"><label id="label-0" for="answer-0">Найденные слова</label><input type="hidden" id="answer-0" data-answer value="${esc(values[0]||'')}"><button type="button" data-clear="0" class="answer-clear">Начать заново</button></div>`;
  if(!spec.length){
   const cards=a.cards||[],writing=a.kind==='writing-plan';
   return `<div class="guided-navigation"><button type="button" data-card-prev aria-label="Предыдущая карточка">←</button><span data-card-counter></span><button type="button" data-card-next aria-label="Следующая карточка">→</button></div>`+cards.map((c,i)=>`<section class="guided-card" data-card="${i}" ${i?'hidden':''}><p class="guided-prompt">${esc(c.prompt)}</p><p class="guided-hint">${esc(c.hint||'Выбери опору и продолжи фразу своими словами.')}</p><div class="activity-options">${(c.options||[]).map((v,j)=>`<button type="button" data-support="${i}:${j}" aria-pressed="false">${esc(v)}</button>`).join('')}</div><p data-card-support></p><div class="guided-status"><button type="button" data-card-done="${i}">Выполнено ✓</button><button type="button" data-card-help="${i}">Разобрать с преподавателем</button></div></section>`).join('')+`<details class="guided-notes" ${writing?'open':''}><summary>${writing?'Мой текст и план':'Мои опоры и заметки'}</summary><label class="written-label" for="written">${writing?'Напиши текст по заданию':'Можно дополнить заметки'}</label><textarea id="written" data-answer maxlength="12000" placeholder="${writing?'Твой текст…':'Необязательно: примеры, вопросы, свой ответ…'}">${esc(values[0]||'')}</textarea></details>`;
  }
  const bank=a.bank||[],head=bank.length?`<div class="activity-bank" role="group" aria-label="Слова из задания"><p>${esc(a.bankHint||'Выбери поле, затем слово. Можно также вписать ответ.')}</p><div>${bank.map((word,i)=>`<button type="button" draggable="true" data-bank="${i}">${esc(word)}</button>`).join('')}</div></div>`:'';
  return head+spec.map((f,i)=>{
   const m=metadata(ex,i),v=values[i]||'',options=m.options||[],multi=m.multiOptions||[],id='answer-'+i,label=m.label||f.displayLabel||f.label;
   let control;
   if(multi.length){
    const selected=window.FocusMarking.splitSet(v).map(norm);
    control=`<input type="hidden" id="${id}" data-answer value="${esc(v)}" aria-label="Ответ ${esc(label)}"><div class="activity-options" role="group" aria-labelledby="label-${i}">${multi.map((o,j)=>`<button type="button" aria-pressed="${selected.includes(norm(o.value))}" data-multi="${i}:${j}">${esc(o.label)}</button>`).join('')}</div>`;
   }else if(options.length){
    control=`<input type="hidden" id="${id}" data-answer value="${esc(v)}" aria-label="Ответ ${esc(label)}"><div class="activity-options" role="radiogroup" aria-labelledby="label-${i}">${options.map((o,j)=>`<button type="button" role="radio" aria-checked="${norm(v)===norm(o.value)}" data-option="${i}:${j}">${o.image?`<img src="${esc(o.image)}" alt="${esc(o.alt||o.label)}" loading="lazy">`:''}<span>${esc(o.label)}</span></button>`).join('')}</div><p class="activity-old-choice" ${!v||options.some(o=>norm(o.value)===norm(v))?'hidden':''}>Сохранённый ответ: <span>${esc(v)}</span></p>`;
   }else if(f.kind==='set')control=`<textarea id="${id}" data-answer rows="2" aria-label="Ответ ${esc(label)}" placeholder="Ответы через ;">${esc(v)}</textarea>`;
   else if((f.accepted||[]).some(t=>t.length>45))control=`<textarea id="${id}" data-answer rows="3" maxlength="2000" aria-label="Ответ ${esc(label)}">${esc(v)}</textarea>`;
   else control=`<input id="${id}" data-answer value="${esc(v)}" maxlength="2000" autocomplete="off" spellcheck="false" aria-label="Ответ ${esc(label)}">`;
   const tokens=m.tokens||[];
   return `<div class="answer-row" data-field="${i}"><label id="label-${i}" for="${id}"><span class="answer-number">${esc(label)}</span>${f.kind==='set'?`<span class="answer-count">${f.minimum||f.members.length} ${f.members.length===1?'ответ':'ответа/слов'}</span>`:''}${m.prompt?`<span class="answer-prompt">${esc(m.prompt)}</span>`:''}</label>${tokens.length?`<div class="activity-tokens" role="group" aria-label="Собрать ответ ${esc(label)}">${tokens.map((t,j)=>`<button type="button" data-token="${i}:${j}" ${t===' '?'aria-label="Пробел"':''}>${t===' '?'␣':esc(t)}</button>`).join('')}<button type="button" data-undo="${i}" aria-label="Убрать последний элемент">↶</button></div>`:''}${control}<button type="button" class="answer-clear" data-clear="${i}" aria-label="Очистить ответ ${esc(label)}">Очистить</button></div>`;
  }).join('');
 }
 function bind(host,ex){
  const fields=[...host.querySelectorAll('[data-answer]')],bank=ex.activity?.bank||[],history=new Map();let active=0;
  function select(i){active=i;host.querySelectorAll('[data-field]').forEach(row=>row.classList.toggle('answer-active',+row.dataset.field===i))}
  function update(){
   if(ex.activity?.kind==='wordsearch'){
    const selected=[...(ex.activity.given||[]),...window.FocusMarking.splitSet(fields[0].value)].map(norm),cells=new Set(ex.activity.paths.filter(p=>selected.includes(norm(p.word))).flatMap(p=>p.cells));
    host.querySelectorAll('[data-cell]').forEach(b=>b.classList.toggle('wordsearch-found',cells.has(+b.dataset.cell)));
    host.querySelectorAll('[data-found-word]').forEach(el=>el.classList.toggle('wordsearch-found',selected.includes(norm(el.dataset.foundWord))));
   }
   for(let i=0;i<fields.length;i++){
    const m=metadata(ex,i);if(!m.tokens)continue;
    const used=m.tokenJoin===''?Array.from(fields[i].value):fields[i].value.trim().split(/\s+/).filter(Boolean);
    host.querySelectorAll(`[data-token^="${i}:"]`).forEach(b=>{const j=+b.dataset.token.split(':')[1],n=used.findIndex(v=>norm(v)===norm(m.tokens[j]));b.disabled=n>=0;if(n>=0)used.splice(n,1)});
   }
   host.querySelectorAll('[data-multi]').forEach(b=>{const [i,j]=b.dataset.multi.split(':').map(Number),v=metadata(ex,i).multiOptions[j].value;b.setAttribute('aria-pressed',String(window.FocusMarking.splitSet(fields[i].value).map(norm).includes(norm(v))))});
   host.querySelectorAll('[data-option]').forEach(b=>{const [i,j]=b.dataset.option.split(':').map(Number),o=metadata(ex,i).options[j];b.setAttribute('aria-checked',String(norm(fields[i].value)===norm(o.value)))});
   host.querySelectorAll('.activity-old-choice').forEach(p=>{const i=+p.closest('[data-field]').dataset.field,v=fields[i].value;p.hidden=!v||metadata(ex,i).options.some(o=>norm(v)===norm(o.value));p.querySelector('span').textContent=v});
  }
  function set(i,value){fields[i].value=value;fields[i].dispatchEvent(new Event('input',{bubbles:true}));update()}
  function put(word){const f=fields[active];if(!f)return;word=(ex.activity?.bankPrefix||'')+word;set(active,ex.answerSpec[active]?.kind==='set'?(()=>{const xs=window.FocusMarking.splitSet(f.value);return (xs.some(x=>norm(x)===norm(word))?xs.filter(x=>norm(x)!==norm(word)):[...xs,word]).join('; ')})():word);if(ex.answerSpec[active]?.kind!=='set'){const next=fields.findIndex((f,i)=>i>active&&!f.value.trim());if(next>=0)select(next)}}
  fields.forEach((f,i)=>{f.addEventListener('focus',()=>select(i));f.addEventListener('input',update);const row=f.closest('[data-field]');row?.addEventListener('click',ev=>{if(!ev.target.closest('[data-option],[data-multi],[data-clear],[data-token]'))select(i)});row?.addEventListener('dragover',ev=>{if(ev.dataTransfer.types.includes('application/x-focus-word'))ev.preventDefault()});row?.addEventListener('drop',ev=>{const n=Number(ev.dataTransfer.getData('application/x-focus-word'));if(!Number.isInteger(n)||!bank[n])return;ev.preventDefault();select(i);put(bank[n])})});
  host.querySelectorAll('[data-bank]').forEach(b=>{b.onclick=()=>put(bank[+b.dataset.bank]);b.ondragstart=ev=>ev.dataTransfer.setData('application/x-focus-word',b.dataset.bank)});
  host.querySelectorAll('[data-option]').forEach(b=>{b.onclick=()=>{const [i,j]=b.dataset.option.split(':').map(Number);select(i);set(i,metadata(ex,i).options[j].value)};b.onkeydown=ev=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(ev.key))return;ev.preventDefault();const group=[...b.parentElement.querySelectorAll('[data-option]')],next=group[(group.indexOf(b)+(ev.key==='ArrowLeft'||ev.key==='ArrowUp'?-1:1)+group.length)%group.length];next.focus();next.click()}});
  host.querySelectorAll('[data-multi]').forEach(b=>b.onclick=()=>{const [i,j]=b.dataset.multi.split(':').map(Number),word=metadata(ex,i).multiOptions[j].value,xs=window.FocusMarking.splitSet(fields[i].value);select(i);set(i,(xs.some(x=>norm(x)===norm(word))?xs.filter(x=>norm(x)!==norm(word)):[...xs,word]).join('; '))});
  host.querySelectorAll('[data-clear]').forEach(b=>b.onclick=()=>{const i=+b.dataset.clear;history.delete(i);if(ex.activity?.kind==='wordsearch'){wordStart=null;host.querySelectorAll('.wordsearch-start').forEach(x=>x.classList.remove('wordsearch-start'));host.querySelector('.wordsearch-status').textContent='Выбери первую и последнюю букву слова.';}host.querySelectorAll(`[data-token^="${i}:"]`).forEach(x=>x.disabled=false);select(i);set(i,'')});
  host.querySelectorAll('[data-token]').forEach(b=>b.onclick=()=>{const [i,j]=b.dataset.token.split(':').map(Number),m=metadata(ex,i);select(i);const changes=history.get(i)||[];changes.push({value:fields[i].value,token:j});history.set(i,changes);set(i,m.tokenJoin===''?fields[i].value+m.tokens[j]:[fields[i].value.trim(),m.tokens[j]].filter(Boolean).join(' '));});
  host.querySelectorAll('[data-undo]').forEach(b=>b.onclick=()=>{const i=+b.dataset.undo,changes=history.get(i)||[],last=changes.pop();if(last)set(i,last.value);else set(i,metadata(ex,i).tokenJoin===''?fields[i].value.slice(0,-1):fields[i].value.trim().split(/\s+/).slice(0,-1).join(' '))});
  let wordStart=null;
  host.querySelectorAll('[data-cell]').forEach(b=>{b.onclick=()=>{
   const cell=+b.dataset.cell,status=host.querySelector('.wordsearch-status');
   if(wordStart===null){wordStart=cell;b.classList.add('wordsearch-start');status.textContent='Теперь выбери последнюю букву.';return}
   const path=ex.activity.paths.find(p=>(p.cells[0]===wordStart&&p.cells.at(-1)===cell)||(p.cells[0]===cell&&p.cells.at(-1)===wordStart));
   host.querySelectorAll('.wordsearch-start').forEach(el=>el.classList.remove('wordsearch-start'));wordStart=null;
   if(path){const found=window.FocusMarking.splitSet(fields[0].value);if(![...found,...(ex.activity.given||[])].map(norm).includes(norm(path.word)))set(0,[...found,path.word].join('; '));status.textContent=path.word+' — найдено!'}else status.textContent='Здесь нет целого слова из списка. Попробуй ещё раз.';
  };b.onkeydown=ev=>{const steps={ArrowLeft:-1,ArrowRight:1,ArrowUp:-ex.activity.grid[0].length,ArrowDown:ex.activity.grid[0].length};if(!(ev.key in steps))return;ev.preventDefault();const next=+b.dataset.cell+steps[ev.key];host.querySelector(`[data-cell="${next}"]`)?.focus()}});
  const cards=ex.activity?.cards||[];let card=0;
  function cardLine(i){return fields[0].value.split('\n').find(v=>v.startsWith(`[${i+1}] `))||''}
  const oneLine=s=>String(s).replace(/\s+/g,' ').trim();
  function cardSupport(i){const line=cardLine(i),prefix=oneLine(cards[i].prompt)+' · ',start=line.indexOf(prefix);return start<0?'':line.slice(start+prefix.length)}
  function showCard(){host.querySelectorAll('[data-card]').forEach((el,i)=>{el.hidden=i!==card;const support=cardSupport(i);el.querySelector('[data-card-support]').textContent=support;el.querySelectorAll('[data-support]').forEach(b=>b.setAttribute('aria-pressed',String(oneLine(b.textContent)===support)))});const counter=host.querySelector('[data-card-counter]');if(counter)counter.textContent=`${card+1} / ${cards.length}`;const prev=host.querySelector('[data-card-prev]'),next=host.querySelector('[data-card-next]');if(prev)prev.disabled=card===0;if(next)next.disabled=card===cards.length-1;host.querySelectorAll('[data-card-done]').forEach(b=>b.setAttribute('aria-pressed',String(fields[0].value.includes(`[${+b.dataset.cardDone+1}] ✓`))));host.querySelectorAll('[data-card-help]').forEach(b=>b.setAttribute('aria-pressed',String(fields[0].value.includes(`[${+b.dataset.cardHelp+1}] Разобрать`))))}
  function note(i,text){const prefix=`[${i+1}] `,lines=fields[0].value.split('\n').filter(v=>!v.startsWith(prefix));set(0,[...lines.filter(Boolean),prefix+text].join('\n'));showCard()}
  host.querySelector('[data-card-prev]')?.addEventListener('click',()=>{card=Math.max(0,card-1);showCard()});host.querySelector('[data-card-next]')?.addEventListener('click',()=>{card=Math.min(cards.length-1,card+1);showCard()});
  host.querySelectorAll('[data-support]').forEach(b=>b.onclick=()=>{const [i,j]=b.dataset.support.split(':').map(Number),v=oneLine(cards[i].options[j]);note(i,oneLine(cards[i].prompt)+' · '+v);b.closest('[data-card]').querySelector('[data-card-support]').textContent=v});
  function markCard(i,status){const support=cardSupport(i);note(i,status+oneLine(cards[i].prompt)+(support?' · '+support:''))}
  host.querySelectorAll('[data-card-done]').forEach(b=>b.onclick=()=>{const i=+b.dataset.cardDone;markCard(i,'✓ ');if(card<cards.length-1){card++;showCard()}});
  host.querySelectorAll('[data-card-help]').forEach(b=>b.onclick=()=>{const i=+b.dataset.cardHelp;markCard(i,'Разобрать: ')});
  if(fields.length)select(0);update();if(cards.length)showCard();
 }
 return {render,bind};
})();
