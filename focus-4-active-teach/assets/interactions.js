/* Reviewed interaction controls. Candidates are authored from the source, never from keys. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FocusInteractions=api;})(typeof window==='undefined'?globalThis:window,()=>{
'use strict';
function mount(host,exercise,values=[],reflection='',source={}){
 const model=exercise.interaction;if(!model||!['bank','choices','opinion','multi','fields','oral','order'].includes(model.type))return false;
 const doc=host.ownerDocument;host.replaceChildren();
 const make=(tag,text,cls)=>{const el=doc.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
 const button=(text,label)=>{const el=make('button',text);el.type='button';if(label)el.setAttribute('aria-label',label);return el;};
 const emit=input=>input.dispatchEvent(new doc.defaultView.Event('input',{bubbles:true}));
 const inputFor=(row,i,label)=>{const input=make('input');input.type='hidden';input.dataset.answer='';input.value=values[i]||'';input.setAttribute('aria-label','Ответ '+label);row.append(input);return input;};
 const fields=exercise.answerSpec?.length?exercise.answerSpec:exercise.responseFields||[];
 if(model.type==='oral'){
  const label=make('label','Мои мысли и заметки к обсуждению');label.htmlFor='reflection';
  const notes=make('textarea');notes.id='reflection';notes.value=reflection;notes.rows=5;notes.maxLength=12000;notes.placeholder='Запиши идеи или ответ. Заметка — необязательно.';
  const help=make('p','Обсуди задание с преподавателем или партнёром, затем отметь выполнение.','interaction-help');
  host.append(label,notes,help);return true;
 }
 if(model.type==='order'){
  model.rows.forEach((item,i)=>{
   const row=make('div',undefined,'answer-row order-row'),prompt=make('p',item.prompt,'interaction-prompt');
   const input=make('input');input.type='text';input.dataset.answer='';input.value=values[i]||'';input.setAttribute('aria-label','Ответ '+fields[i].label);input.autocomplete='off';input.spellcheck=false;
   const bank=make('div',undefined,'choice-buttons order-bank');bank.setAttribute('role','group');bank.setAttribute('aria-label','Собери ответ по порядку');
   const separator=item.separator||' ',tokens=item.tokens.map(t=>typeof t==='string'?{label:t,value:t}:t);let chosen=[];
   const parse=()=>{let rest=input.value,used=[];while(rest){const j=tokens.findIndex((t,j)=>!used.includes(j)&&(rest===t.value||rest.startsWith(t.value+separator)));if(j<0)return null;used.push(j);rest=rest.slice(tokens[j].value.length+(rest===tokens[j].value?0:separator.length));}return used;};
   const refresh=()=>{chosen=parse();[...bank.children].forEach((b,j)=>{b.disabled=!!chosen?.includes(j);b.setAttribute('aria-pressed',String(b.disabled));});};
   tokens.forEach(token=>{const b=button(token.label);bank.append(b);b.onclick=()=>{input.value=[input.value,token.value].filter(Boolean).join(separator);refresh();emit(input);};});
   const undo=button('Убрать последнее','Убрать последнюю карточку'),clear=button('Очистить','Очистить ответ '+fields[i].label);
   undo.onclick=()=>{input.value=chosen?chosen.slice(0,-1).map(j=>tokens[j].value).join(separator):input.value.split(separator).slice(0,-1).join(separator);refresh();emit(input);};
   clear.onclick=()=>{input.value='';refresh();emit(input);};input.addEventListener('input',refresh);
   const help=make('p','Нажимай на карточки в нужном порядке. Ответ также можно отредактировать.','interaction-help');
   row.append(prompt,help,bank,input,undo,clear);host.append(row);refresh();
  });return true;
 }
 if(model.type==='fields'){
  fields.forEach((field,i)=>{
   const row=make('label',undefined,'answer-row field-row');row.append(make('span',field.label));
   const multiline=field.long||field.kind==='set'||!exercise.answerSpec?.length;
   const input=make(multiline?'textarea':'input');input.dataset.answer='';input.value=values[i]||'';input.setAttribute('aria-label','Ответ '+field.label);input.autocomplete='off';input.spellcheck=false;input.maxLength=field.long?12000:4000;
   if(multiline)input.rows=field.long?6:2;else input.type='text';
   if(field.kind==='set')input.placeholder='Ответы через ;';
   row.append(input);host.append(row);
  });return true;
 }
 if(model.type==='bank'){
  const help=make('p',model.help||'Выбери пропуск, затем нажми на подходящую карточку.','interaction-help');host.append(help);
  const bank=make('div',undefined,'interaction-bank');bank.setAttribute('role','group');bank.setAttribute('aria-label',model.bankLabel||'Карточки для вставки');host.append(bank);
  const status=make('p','','interaction-status');status.setAttribute('aria-live','polite');host.append(status);
  let selected=0;const rows=[];
  const refresh=()=>{rows.forEach((r,i)=>{r.slot.textContent=r.input.value||'Выбрать карточку';r.slot.setAttribute('aria-pressed',String(selected===i));r.slot.setAttribute('aria-label','Пропуск '+r.label+': '+(r.input.value||'не заполнен'));r.clear.disabled=!r.input.value;});status.textContent='Выбран пропуск '+rows[selected].label+(model.prompts?.[selected]?' · '+model.prompts[selected]:'');};
  fields.forEach((field,i)=>{
   const row=make('div',undefined,'answer-row bank-row');row.append(make('p',field.label+(source.prompts?.[field.label]||model.prompts?.[i]?' · '+(source.prompts?.[field.label]||model.prompts[i]):''),'interaction-prompt'));
   const input=inputFor(row,i,field.label),controls=make('div',undefined,'bank-controls'),slot=button('','Пропуск '+field.label),clear=button('×','Очистить пропуск '+field.label);slot.className='choice-slot';controls.append(slot,clear);row.append(controls);host.append(row);rows.push({row,input,slot,clear,label:field.label});
   slot.onclick=()=>{selected=i;refresh();bank.querySelector('button')?.focus();};
   input.onfocus=()=>{selected=i;refresh();};
   clear.onclick=()=>{input.value='';selected=i;refresh();emit(input);};
  });
  model.items.forEach(text=>{const b=button(text);bank.append(b);b.onclick=()=>{const input=rows[selected].input;input.value=text;const dialog=host.closest('.cf-dialog');if(!dialog||dialog.classList.contains('cf-all-items')){const next=rows.findIndex((r,i)=>i>selected&&!r.input.value);if(next>=0)selected=next;}refresh();emit(input);};});
  refresh();return true;
 }
 if(model.type==='choices'||model.type==='opinion'||model.type==='multi'){
  model.rows.forEach((item,i)=>{
   const row=make('fieldset',undefined,'answer-row choice-row');row.append(make('legend',item.prompt));const label=fields[i]?.label||'Мой выбор',input=inputFor(row,i,label),choices=make('div',undefined,'choice-buttons');row.append(choices);host.append(row);
   const options=item.options.map(option=>{const b=button(option.label);choices.append(b);b.onclick=()=>{if(model.type==='multi'){const chosen=new Set(input.value.split(';').map(v=>v.trim()).filter(Boolean));if(chosen.has(option.value))chosen.delete(option.value);else chosen.add(option.value);input.value=[...chosen].join('; ');}else input.value=option.value;refresh();emit(input);};return {b,option};});
   const previous=make('p','','interaction-previous');row.append(previous);
   const selected=option=>model.type==='multi'?input.value.split(';').map(v=>v.trim()).includes(option.value):[option.value,...option.aliases||[]].includes(input.value);
   const refresh=()=>{options.forEach(({b,option})=>b.setAttribute('aria-pressed',String(selected(option))));previous.textContent=input.value&&!options.some(({option})=>selected(option))?'Ранее сохранённый ответ: '+input.value:'';previous.hidden=!previous.textContent;};refresh();
  });
  if(model.type==='opinion'){
   const label=make('label','Почему? Можно объяснить устно или оставить заметку.');label.htmlFor='reflection';const notes=make('textarea');notes.id='reflection';notes.value=reflection;notes.maxLength=12000;notes.placeholder='Заметка — необязательно';host.append(label,notes);
  }
  return true;
 }
 return false;
}
return {mount};
});
