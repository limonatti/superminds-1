/* Reviewed interaction controls. Candidates are authored from the source, never from keys. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FocusInteractions=api;})(typeof window==='undefined'?globalThis:window,()=>{
'use strict';
function mount(host,exercise,values=[],reflection=''){
 const model=exercise.interaction;if(!model||!['bank','choices','opinion'].includes(model.type))return false;
 const doc=host.ownerDocument;host.replaceChildren();
 const make=(tag,text,cls)=>{const el=doc.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
 const button=(text,label)=>{const el=make('button',text);el.type='button';if(label)el.setAttribute('aria-label',label);return el;};
 const emit=input=>input.dispatchEvent(new doc.defaultView.Event('input',{bubbles:true}));
 const inputFor=(row,i,label)=>{const input=make('input');input.type='hidden';input.dataset.answer='';input.value=values[i]||'';input.setAttribute('aria-label','Ответ '+label);row.append(input);return input;};
 if(model.type==='bank'){
  const help=make('p',model.help||'Выбери пропуск, затем нажми на подходящую карточку.','interaction-help');host.append(help);
  const bank=make('div',undefined,'interaction-bank');bank.setAttribute('role','group');bank.setAttribute('aria-label',model.bankLabel||'Карточки для вставки');host.append(bank);
  const status=make('p','','interaction-status');status.setAttribute('aria-live','polite');host.append(status);
  let selected=0;const rows=[];
  const refresh=()=>{rows.forEach((r,i)=>{r.slot.textContent=r.input.value||'Выбрать карточку';r.slot.setAttribute('aria-pressed',String(selected===i));r.slot.setAttribute('aria-label','Пропуск '+r.label+': '+(r.input.value||'не заполнен'));r.clear.disabled=!r.input.value;});status.textContent='Выбран пропуск '+rows[selected].label+(model.prompts?.[selected]?' · '+model.prompts[selected]:'');};
  exercise.answerSpec.forEach((field,i)=>{
   const row=make('div',undefined,'answer-row bank-row');row.append(make('p',field.label+(model.prompts?.[i]?' · '+model.prompts[i]:''),'interaction-prompt'));
   const input=inputFor(row,i,field.label),controls=make('div',undefined,'bank-controls'),slot=button('','Пропуск '+field.label),clear=button('×','Очистить пропуск '+field.label);slot.className='choice-slot';controls.append(slot,clear);row.append(controls);host.append(row);rows.push({row,input,slot,clear,label:field.label});
   slot.onclick=()=>{selected=i;refresh();bank.querySelector('button')?.focus();};
   clear.onclick=()=>{input.value='';selected=i;refresh();emit(input);};
  });
  model.items.forEach(text=>{const b=button(text);bank.append(b);b.onclick=()=>{const input=rows[selected].input;input.value=text;const next=rows.findIndex((r,i)=>i>selected&&!r.input.value);if(next>=0)selected=next;refresh();emit(input);};});
  refresh();return true;
 }
 if(model.type==='choices'||model.type==='opinion'){
  model.rows.forEach((item,i)=>{
   const row=make('fieldset',undefined,'answer-row choice-row');row.append(make('legend',item.prompt));const label=exercise.answerSpec?.[i]?.label||'Мой выбор',input=inputFor(row,i,label),choices=make('div',undefined,'choice-buttons');row.append(choices);host.append(row);
   const options=item.options.map(option=>{const b=button(option.label);choices.append(b);b.onclick=()=>{input.value=option.value;refresh();emit(input);};return {b,option};});
   const previous=make('p','','interaction-previous');row.append(previous);
   const selected=option=>[option.value,...option.aliases||[]].includes(input.value);
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
