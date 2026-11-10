/* Each exercise declares its interaction. Original controls own saved values. */
window.FocusActivity=(()=>{
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const norm=s=>String(s).trim().toLowerCase(),metadata=(ex,i)=>ex.activity?.fields?.[i]||{};
 function render(ex,values){
  const a=ex.activity||{},spec=ex.answerSpec||[];
  if(!spec.length){
   const oral=['speaking','listening','reading'].includes(a.kind);
   return (oral?`<p class="activity-purpose">${esc(a.help||'Выполни задание по оригиналу. Здесь можно сохранить заметки.')}</p><button type="button" class="activity-complete" data-complete="${esc(a.kind)}">${a.kind==='speaking'?'Отметить устное задание выполненным':a.kind==='listening'?'Отметить прослушивание':'Отметить прочтение'}</button>`:'')+`<label class="written-label" for="written">${oral?'Заметки к заданию':'Мой ответ'}</label><textarea id="written" data-answer maxlength="12000" placeholder="${oral?'Заметки, примеры или вопросы преподавателю…':'Напиши ответ по условию…'}">${esc(values[0]||'')}</textarea>`;
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
   return `<div class="answer-row" data-field="${i}"><label id="label-${i}" for="${id}"><span class="answer-number">${esc(label)}</span>${f.kind==='set'?`<span class="answer-count">${f.minimum||f.members.length} ${f.members.length===1?'ответ':'ответа/слов'}</span>`:''}${m.prompt?`<span class="answer-prompt">${esc(m.prompt)}</span>`:''}</label>${tokens.length?`<div class="activity-tokens" role="group" aria-label="Собрать предложение ${esc(label)}">${tokens.map((t,j)=>`<button type="button" data-token="${i}:${j}">${esc(t)}</button>`).join('')}<button type="button" data-undo="${i}" aria-label="Убрать последнее слово">↶</button></div>`:''}${control}<button type="button" class="answer-clear" data-clear="${i}" aria-label="Очистить ответ ${esc(label)}">Очистить</button></div>`;
  }).join('');
 }
 function bind(host,ex){
  const fields=[...host.querySelectorAll('[data-answer]')],bank=ex.activity?.bank||[],history=new Map();let active=0;
  function select(i){active=i;host.querySelectorAll('[data-field]').forEach(row=>row.classList.toggle('answer-active',+row.dataset.field===i))}
  function update(){
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
  host.querySelectorAll('[data-clear]').forEach(b=>b.onclick=()=>{const i=+b.dataset.clear;history.delete(i);host.querySelectorAll(`[data-token^="${i}:"]`).forEach(x=>x.disabled=false);select(i);set(i,'')});
  host.querySelectorAll('[data-token]').forEach(b=>b.onclick=()=>{const [i,j]=b.dataset.token.split(':').map(Number);select(i);const changes=history.get(i)||[];changes.push({value:fields[i].value,token:j});history.set(i,changes);set(i,[fields[i].value.trim(),metadata(ex,i).tokens[j]].filter(Boolean).join(' ').replace(/\s+([,.!?;:])/g,'$1'));b.disabled=true});
  host.querySelectorAll('[data-undo]').forEach(b=>b.onclick=()=>{const i=+b.dataset.undo,changes=history.get(i)||[],last=changes.pop();if(last){host.querySelector(`[data-token="${i}:${last.token}"]`).disabled=false;set(i,last.value)}else set(i,fields[i].value.trim().split(/\s+/).slice(0,-1).join(' '))});
  host.querySelector('[data-complete]')?.addEventListener('click',ev=>{const phrases={speaking:'Устное задание выполнено.',listening:'Запись прослушана, задание выполнено.',reading:'Текст прочитан, задание выполнено.'},phrase=phrases[ev.currentTarget.dataset.complete];if(!fields[0].value.includes(phrase))set(0,[phrase,fields[0].value].filter(Boolean).join('\n'));ev.currentTarget.textContent='Выполнено ✓'});
  if(fields.length)select(0);update();
 }
 return {render,bind};
})();
