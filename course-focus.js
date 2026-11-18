/* The approved Focus presentation. Original course controls own answers and grading. */
(function(root){
'use strict';
const states=new WeakMap(),positions=new Map(),homePages=new Map(),q=(s,h=document)=>h.querySelector(s),qa=(s,h=document)=>[...h.querySelectorAll(s)];
const node=(tag,text,cls)=>Object.assign(document.createElement(tag),{textContent:text||'',className:cls||''});
const button=(text,label,fn)=>{const b=node('button',text);b.type='button';if(label)b.setAttribute('aria-label',label);b.onclick=fn;return b};
const title=e=>{const text=String(e?.activity?.title||e?.title||e?.instruction||instruction(e)||e?.activity?.instruction||'Упражнение '+(e?.displayLabel||e?.label||e?.n||'')).replace(/\s+/g,' ').trim();return text.length>150?text.slice(0,147).replace(/\s+\S*$/,'')+'…':text};
function instruction(e){if(e?.instruction)return e.instruction;const lines=String(e?.text||'').split('\n').map(s=>s.trim()).filter(Boolean),start=lines.findIndex(s=>s.length>14);if(start<0)return e?.activity?.instruction||'';let text=lines[start];for(let i=start+1;i<Math.min(start+4,lines.length)&&!/[.!?]$/.test(text);i++){if(/^\d+[.)]?\s/.test(lines[i]))break;text+=' '+lines[i]}return text;}
function prepareFields(config){
 const owned=[],listeners=[];
 for(const f of config.fields||[]){
  const scope=f.scope;if(!scope||scope===config.responses||!scope.isConnected)continue;
  scope.classList.add('cf-field');
  if(f.input?.tagName==='SELECT'||scope.querySelector('[data-choice],[data-option],[data-token],.choice-buttons,.wordbank,.page-choice-group'))continue;
  const options=f.options||[],tokens=f.tokens||[];
  if(!options.length&&!tokens.length)continue;
  const bank=node('div','','cf-choice-bank');bank.setAttribute('role','group');bank.setAttribute('aria-label','Варианты для пункта '+f.label);if(String(f.id).includes('.'))bank.append(node('p','Часть '+f.label,'cf-part-label'));
  const values=options.length?options.map(o=>typeof o==='string'?{value:o,label:o}:o):tokens.map(t=>({value:t.text||t,label:t.text||t}));
  const update=()=>{[...bank.querySelectorAll('[data-cf-choice]')].forEach((b,i)=>b.setAttribute('aria-pressed',String(options.length&&String(f.get())===String(values[i].value))))};
  values.forEach((v,i)=>{const b=button(v.label,null,()=>{f.set(options.length?v.value:[f.get(),v.value].filter(Boolean).join(' '));update()});b.dataset.cfChoice=String(i);bank.append(b)});
  if(tokens.length&&!options.length)bank.append(button('Убрать последнее слово',null,()=>{f.set(String(f.get()).trim().split(/\s+/).slice(0,-1).join(' '));update()}));
  scope.append(bank);owned.push(bank);if(f.input){f.input.addEventListener('input',update);listeners.push(()=>f.input.removeEventListener('input',update))}update();
 }
 return()=>{listeners.forEach(fn=>fn());owned.forEach(el=>el.remove());for(const f of config.fields||[])f.scope?.classList.remove('cf-field')};
}
function reset(dialog){states.get(dialog)?.destroy();states.delete(dialog)}
function mount(config){
 const {dialog,id}=config;if(!dialog||dialog.classList.contains('focusLesson'))return;
 reset(dialog);
 const source=config.source||q('#solutionOriginal,.exercise-source,.exercise-original,.exerciseSource',dialog);
 const responses=config.responses||q('.focus-responses,.exercise-response,.responsePanel',dialog)||dialog;
 const originalHeads=qa(':scope>.dialog-head,:scope>.exercise-head,:scope>.modalhead,:scope>h2,:scope>.coursework-close',dialog);
 const oldPanels=dialog.classList.contains('focus-task-panels'),oldPane=dialog.dataset.pane,oldView=dialog.dataset.view;
 dialog.classList.remove('focus-task-panels');dialog.dataset.pane='focus';dialog.dataset.view='focus';
 const existingTitle=q('#exerciseTitle,#modalTitle,h2',dialog)?.textContent||config.title||'Упражнение';
 const owned=[],changed=new Map(),listeners=[],listen=(el,event,fn,opts)=>{el?.addEventListener(event,fn,opts);listeners.push(()=>el?.removeEventListener(event,fn,opts))};
 const own=el=>{owned.push(el);return el};
 const mark=(el,cls)=>{if(!el)return;if(!changed.has(el))changed.set(el,new Set());if(!el.classList.contains(cls)){changed.get(el).add(cls);el.classList.add(cls)}};
 mark(dialog,'cf-dialog');mark(document.body,'cf-course');originalHeads.forEach(el=>mark(el,'cf-original-head'));
 if(source)mark(source,'cf-source');mark(responses,'cf-responses');
 const head=own(node('header','','cf-head')),brand=node('div','english','cf-brand');brand.append(node('small','with Asya'));
 const course=node('div',config.course||document.title.split('·')[0],'cf-course-name');course.append(node('small',config.location||q('#exerciseLocation',dialog)?.textContent||''));
 head.append(brand,course,button('×','Закрыть упражнение',()=>dialog.close()));
 const nav=own(node('nav','','cf-task-nav'));nav.setAttribute('aria-label','Задания раздела');
 const sequence=config.tasks||[],at=sequence.findIndex(t=>t.id===id),select=node('select');select.setAttribute('aria-label','Выбрать задание');
 if(sequence.length){for(const t of sequence)select.add(new Option((t.page?'стр. '+t.page+' · ':'')+'№ '+t.label+' · '+t.title,t.id));select.value=id;select.onchange=()=>config.navigate?.(select.value)}else{select.add(new Option(existingTitle,id));select.disabled=true}
 const previous=button('←','Предыдущее задание',()=>config.navigate?.(sequence[at-1]?.id));previous.disabled=at<=0;
 const next=button('→','Следующее задание',()=>config.navigate?.(sequence[at+1]?.id));next.disabled=at<0||at>=sequence.length-1;nav.append(previous,select,next);
 const heading=own(node('div','','cf-heading'));heading.append(node('p',config.location||'Практика в своём темпе','cf-location'),node('h2',config.title||existingTitle));
 if(config.instruction&&config.instruction!==config.title)heading.append(node('p',config.instruction+(config.model?.note?' '+config.model.note:''),'cf-instruction'));
 dialog.prepend(head,nav,heading);
 const tools=own(node('div','','cf-view-tools'));
 let materialButton,answerButton;
 function pane(material){dialog.classList.toggle('cf-material-view',material);dialog.classList.toggle('cf-answer-focus',!material&&dialog.dataset.cfComplete==='true');materialButton?.setAttribute('aria-pressed',String(material));answerButton?.setAttribute('aria-pressed',String(!material));if(material)root.ExerciseSource?.fit?.(source)}
 if(source){materialButton=button('Задание','Условие и иллюстрации',()=>pane(true));answerButton=button('Ответ','Перейти к ответу',()=>pane(false));tools.append(materialButton,answerButton)}
 const settings=node('details','','cf-settings'),summary=node('summary','Параметры');settings.append(summary);tools.append(settings);
 const originalTools=qa('.exercise-toolbar,.exerciseTools,.exercise-pane-tabs,#exerciseViews,.exercise-navigation,.u1-nav',dialog);
 if(originalTools.length){originalTools.forEach(t=>mark(t,'cf-original-tools'));const toggle=button('Инструменты учебника','Открыть инструменты учебника',()=>{const open=dialog.classList.toggle('cf-tools-open');toggle.setAttribute('aria-expanded',String(open))});toggle.setAttribute('aria-expanded','false');settings.append(toggle)}
 heading.after(tools);
 const bench=q('.play-workbench',dialog),existingSteps=q('.responseStepper,.guided-navigation,.u1-navigation',responses);
 const candidates=qa('.answer-row,.answerrow,.exercise-field,.practice-field,.responseField,.focus-answer-list>div,.cf-field,.page-choice-group',responses);
 const rows=candidates.filter(el=>!el.hidden&&!el.matches('.printedExample,.cf-given')&&!candidates.some(other=>other!==el&&other.contains(el)));
 // Presentation text and word cards come only from the printed source model.
 const model=config.model, answerInputs=qa('[data-answer]',responses);
 let sourceBanks=0;
 for(const row of rows){
  const input=q('[data-answer]',row),index=answerInputs.indexOf(input),label=String(config.fieldLabels?.[index]??'');
  if(!input||!model)continue;
  const prompt=model.prompts?.[label];
  if(prompt&&!q('.answer-prompt,.printedPrompt,.interaction-prompt,legend',row)){
   const text=own(node('span',prompt,'cf-authored-prompt'));row.prepend(text);if(model.standalone)mark(text,'cf-complete-prompt');mark(row,'cf-authored-row');
  }
  // Multi-gap and list answers retain their existing semantics and controls.
  if(!model.bank?.length||!prompt||prompt.split('_____').length!==2||config.fieldKinds?.[index]==='set'||input.type==='hidden'||input.tagName==='SELECT'||q('.choice-buttons,.activity-options,.cf-choice-bank',row))continue;
  const bank=own(node('div','','cf-source-bank'));bank.setAttribute('role','group');bank.setAttribute('aria-label','Слова из задания');
  bank.append(node('span','Слова из задания','cf-bank-label'));
  const update=()=>qa('button',bank).forEach(b=>b.setAttribute('aria-pressed',String(b.textContent===input.value)));
  for(const word of model.bank){const b=button(word,null,()=>{input.value=word;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));update()});b.setAttribute('aria-pressed','false');bank.append(b)}
  input.after(bank);listen(input,'input',update);update();sourceBanks++;
 }
 if(sourceBanks){const control=button('Только ввод текста','Показать или скрыть карточки слов',()=>{const typing=dialog.classList.toggle('cf-source-typing');control.textContent=typing?'Показать карточки слов':'Только ввод текста';control.setAttribute('aria-pressed',String(typing))});control.setAttribute('aria-pressed','false');settings.append(control)}
 const completePrompt=!!config.completePrompt||rows.length&&rows.every(row=>qa('.answer-prompt,.printedPrompt,.interaction-prompt,legend,.cf-complete-prompt,label',row).some(p=>{const text=p.textContent.trim();return text.length>(p.tagName==='LABEL'?35:2)&&!/^(?:Пункт|Ответ|Пропуск|Мой выбор)?\s*\d*[a-z]?[.)]?$/i.test(text)}));
 dialog.dataset.cfComplete=String(!!completePrompt);pane(!!source&&!completePrompt);
 if(config.instruction)qa('#instruction,.instruction,.practice-help',responses).forEach(el=>mark(el,'cf-original-instruction'));
 qa('#exerciseAudio,#exerciseMedia',dialog).filter(el=>!q('audio,video,a,button,summary',el)).forEach(el=>mark(el,'cf-empty-media'));
 let step=Math.min(positions.get(location.pathname+':'+id)||0,Math.max(0,rows.length-1)),all=false;
 let rowSelect,prevItem,nextItem,count,checkCurrent,stepNumber;
 const currentFeedback=new Map();
 function activate(){
  if(!rows.length||bench||existingSteps)return;
  rows.forEach((row,i)=>row.classList.toggle('cf-away',!all&&i!==step));dialog.classList.toggle('cf-all-items',all);
  if(stepNumber)stepNumber.textContent=String(step+1).padStart(2,'0');
  if(rowSelect)rowSelect.value=String(step);if(count)count.textContent=all?'Все пункты':(step+1)+' из '+rows.length;
  if(prevItem)prevItem.disabled=step===0;if(nextItem)nextItem.disabled=step===rows.length-1;
  const input=q('[data-answer],input,textarea,select',rows[step]);input?.dispatchEvent(new FocusEvent('focus'));
  positions.set(location.pathname+':'+id,step);
 }
 if(rows.length>1&&!bench&&!existingSteps){
  const stepper=own(node('nav','','cf-stepper'));stepper.setAttribute('aria-label','Пункты задания');
  prevItem=button('←','Предыдущий пункт',()=>{step--;activate()});nextItem=button('→','Следующий пункт',()=>{step++;activate()});
  rowSelect=node('select');rowSelect.setAttribute('aria-label','Выбрать пункт задания');rows.forEach((row,i)=>{const label=q('label,legend,.interaction-prompt',row)?.textContent?.trim();rowSelect.add(new Option(label&&label.length<50?label:'Пункт '+(i+1),String(i)))});rowSelect.onchange=()=>{step=+rowSelect.value;activate()};
  stepNumber=own(node('span',String(step+1).padStart(2,'0'),'cf-step-number'));stepNumber.setAttribute('aria-hidden','true');
  count=node('span','','cf-count');count.setAttribute('role','status');stepper.append(stepNumber,prevItem,rowSelect,nextItem,count);if(responses===dialog)rows[0].before(stepper);else responses.prepend(stepper);
  const showAll=button('Все пункты','Показать все пункты задания',()=>{all=!all;showAll.setAttribute('aria-pressed',String(all));activate()});showAll.setAttribute('aria-pressed','false');settings.append(showAll);
  const footer=own(node('div','','cf-step-footer'));const advance=button('Следующий пункт →','Перейти к следующему пункту',()=>{if(step<rows.length-1){step++;activate();rowSelect.focus({preventScroll:true});responses.scrollIntoView({block:'start',behavior:'instant'})}});footer.append(advance);rows.at(-1).after(footer);
  const nativeCheck=config.checkButton||q('#check',dialog);
  if(config.checkItem&&nativeCheck&&!nativeCheck.hidden){
   const currentCheck=button('Проверить пункт','Проверить текущий пункт',()=>checkCurrent());currentCheck.className='cf-current-check';footer.prepend(currentCheck);mark(nativeCheck,'cf-native-check');
   let committing=false;
   checkCurrent=()=>{const row=rows[step],input=q('[data-answer]',row);if(!input)return;
    const inputs=qa('[data-answer]',responses),i=inputs.indexOf(input),value=String(input.value||'');
    let message=currentFeedback.get(row);if(!message){message=own(node('p','','cf-item-feedback'));message.setAttribute('role','status');row.append(message);currentFeedback.set(row,message)}
    if(!value.trim()){message.textContent='Сначала выберите или впишите ответ.';message.dataset.result='blank';return}
    const result=config.checkItem(i,value);message.textContent=result===true?'Верно. Можно переходить дальше.':result===false?'Попробуйте ещё раз. Ответ можно изменить.':'Ответ сохранён для обсуждения с преподавателем.';message.dataset.result=result===true?'correct':result===false?'incorrect':'review';
    if(inputs.length&&inputs.every(el=>String(el.value).trim())){committing=true;nativeCheck.click();committing=false;}
   };
   listen(nativeCheck.form,'submit',ev=>{if(!all&&!committing){ev.preventDefault();ev.stopImmediatePropagation();checkCurrent()}},true);
   listen(responses,'input',ev=>{for(const[row,message]of currentFeedback)if(row.contains(ev.target)){message.textContent='';delete message.dataset.result}});
  }
  const refreshAdvance=()=>{advance.hidden=all||step===rows.length-1};listen(rowSelect,'change',refreshAdvance);listen(prevItem,'click',refreshAdvance);listen(nextItem,'click',refreshAdvance);listen(advance,'click',refreshAdvance);listen(showAll,'click',refreshAdvance);refreshAdvance();
  const targetBank=ev=>{if(!ev.target.closest('.activity-bank,.interaction-bank'))return;const slot=q('.choice-slot',rows[step]);if(slot)slot.click();else q('[data-answer]',rows[step])?.dispatchEvent(new FocusEvent('focus'))};listen(responses,'click',targetBank,true);
 }
 // Turn authored select options into touch cards. No answer keys are inspected.
 const choices=[];
 qa('select[data-answer],.practice-field select',responses).forEach(input=>{
  const options=[...input.options].filter(o=>o.value&&!/^Сохранённый ответ:/i.test(o.text));if(!options.length||options.length>30)return;
  const bank=own(node('div','','cf-choice-bank'));bank.setAttribute('role','group');bank.setAttribute('aria-label',input.getAttribute('aria-label')||input.labels?.[0]?.textContent||'Варианты ответа');
  const update=()=>{[...bank.children].forEach((b,i)=>{b.setAttribute('aria-pressed',String(input.value===options[i].value));b.disabled=input.disabled})};
  options.forEach(o=>bank.append(button(o.text,null,()=>{input.value=o.value;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));update()})));
  input.after(bank);mark(input,'cf-select-original');choices.push({input,bank});listen(input,'change',update);listen(input,'input',update);update();
 });
 if(config.singleChoice)for(const row of rows){
  const group=q('.choice-buttons,.activity-options',row),input=q('[data-answer]',row);if(!group||!input||q('.cf-choice-bank',row))continue;
  const buttons=qa('button',group).filter(b=>b.hasAttribute('aria-pressed')||b.hasAttribute('aria-checked'));if(buttons.length<2)continue;
  const proxy=own(node('select','','cf-native-proxy'));proxy.setAttribute('aria-label',input.getAttribute('aria-label')||'Выбрать ответ');proxy.add(new Option('Выберите ответ',''));buttons.forEach((b,i)=>proxy.add(new Option(b.textContent,String(i))));
  const update=()=>{const selected=buttons.findIndex(b=>b.getAttribute('aria-pressed')==='true'||b.getAttribute('aria-checked')==='true');proxy.value=selected<0?'':String(selected)};
  proxy.onchange=()=>{if(proxy.value!=='')buttons[+proxy.value].click();update()};group.after(proxy);mark(group,'cf-card-options');listen(row,'input',ev=>{if(ev.target===input)update()});update();choices.push({input:proxy,bank:group});
 }
 if(config.bankTyping){const originals=[];for(const row of rows){const input=q('input[data-answer]',row);if(input?.type==='hidden'){originals.push([input,input.type]);listen(input,'input',()=>{const slot=q('.choice-slot',row);if(slot)slot.textContent=input.value||'Выбрать карточку'})}}
  if(originals.length){const mode=button('Ввести текст','Переключить карточки и ввод текста',()=>{const typing=dialog.classList.toggle('cf-typing');for(const[input]of originals)input.type=typing?'text':'hidden';mode.textContent=typing?'Выбирать карточками':'Ввести текст';mode.setAttribute('aria-pressed',String(typing))});mode.setAttribute('aria-pressed','false');settings.append(mode);listeners.push(()=>{for(const[input,type]of originals)input.type=type})}
 }
 if(choices.length){const control=button('Список вместо карточек','Переключить карточки и список вариантов',()=>{const native=dialog.classList.toggle('cf-native-select');control.textContent=native?'Карточки вместо списка':'Список вместо карточек';control.setAttribute('aria-pressed',String(native))});control.setAttribute('aria-pressed','false');settings.append(control)}
 // The existing native interaction keeps keyboard, matching, order and writing semantics.
 qa('audio',dialog).forEach(audio=>{
  if(audio.closest('.focusPlayer')||audio.classList.contains('taskAudio')&&dialog.classList.contains('focusLesson'))return;
  const repeat=own(button('↺ Повторить','Повторить запись сначала',()=>{audio.currentTime=0;audio.play().catch(()=>{})}));repeat.className='cf-repeat';audio.after(repeat);
 });
 const changedInput=()=>{if(rows.length&&!all&&!bench&&!existingSteps){const visible=rows.findIndex(row=>row.contains(document.activeElement));if(visible>=0&&visible!==step){step=visible;activate()}}};listen(responses,'input',changedInput);
 activate();
 const destroy=()=>{listeners.forEach(fn=>fn());rows.forEach(row=>row.classList.remove('cf-away'));for(const [el,classes]of changed)for(const cls of classes)if(el!==document.body)el.classList.remove(cls);owned.forEach(el=>el.remove());dialog.classList.remove('cf-source-folded','cf-tools-open','cf-native-select','cf-material-view','cf-answer-focus','cf-all-items','cf-typing','cf-source-typing');delete dialog.dataset.cfComplete;if(oldPanels)dialog.classList.add('focus-task-panels');if(oldPane===undefined)delete dialog.dataset.pane;else dialog.dataset.pane=oldPane;if(oldView===undefined)delete dialog.dataset.view;else dialog.dataset.view=oldView;};
 states.set(dialog,{destroy,current:()=>({index:step,row:rows[step],all})});listen(dialog,'close',()=>{if(dialog.open)return;reset(dialog);config.onClose?.()},{once:true});dialog.scrollTop=0;
 root.ExerciseSource?.fit?.(source);
}
function home(config){
 const {host,items=[],open}=config;if(!host)return;
 document.body.classList.add('cf-course');let section=q(':scope>.cf-home',host);
 if(!section){section=node('section','','cf-home');host.prepend(section)}
 section.replaceChildren();section.hidden=!items.length;if(!items.length){qa('.cf-book-surface',host).forEach(el=>el.classList.remove('cf-book-surface'));return;}
 for(const surface of config.surfaces||[])surface?.classList.add('cf-book-surface');
 const unitButtons=qa('#units [data-unit]'),units=config.units||unitButtons.map(b=>({value:b.dataset.unit,label:b.textContent.trim(),selected:b.getAttribute('aria-pressed')==='true'||b.matches('.selected,.active')}));
 if(units.length){const label=node('label','Раздел курса','cf-unit-picker'),select=node('select');select.dataset.cfUnit='';select.setAttribute('aria-label','Выбрать раздел курса');for(const u of units)select.add(new Option(u.label,String(u.value),false,!!u.selected));select.onchange=()=>{if(config.selectUnit)config.selectUnit(select.value);else unitButtons.find(b=>b.dataset.unit===select.value)?.click()};label.append(select);section.append(label)}
 const intro=node('div','','cf-home-intro');intro.append(node('p',config.location||config.course,'cf-location'),node('h1',config.title||config.course));
 intro.append(node('p','Выберите задание и занимайтесь в своём темпе.','cf-home-description'));
 const next=items.find(t=>!t.done)||items[0],start=button(next.hasAnswer?'Продолжить задание →':'Начать занятие →',null,()=>open(next.id));start.className='cf-primary';
  const book=button('Книга и инструменты',null,()=>{const on=host.classList.toggle('cf-book-mode');book.setAttribute('aria-pressed',String(on));book.textContent=on?'Вернуться к заданиям':'Книга и инструменты';root.dispatchEvent(new Event('resize'))});book.setAttribute('aria-pressed',String(host.classList.contains('cf-book-mode')));
 const actions=node('div','','cf-home-actions');actions.append(start,book);intro.append(actions);section.append(intro);
 const list=node('div','','cf-home-list'),pages=[...new Set(items.map(t=>t.page))],pageKey=location.pathname+':'+config.location;
 let selectedPage=String(config.page??homePages.get(pageKey)??pages[0]);if(!pages.some(p=>String(p)===selectedPage)&&selectedPage!=='all')selectedPage=String(pages[0]);
 const picker=node('nav','','cf-page-picker');picker.setAttribute('aria-label','Страницы раздела');
 const pageSelect=node('select');pageSelect.dataset.cfPage='';pageSelect.setAttribute('aria-label','Выбрать страницу раздела');pages.forEach(page=>pageSelect.add(new Option('Страница '+page,String(page))));pageSelect.add(new Option('Все задания раздела','all'));pageSelect.value=selectedPage;
 const prev=button('←','Предыдущая страница заданий',()=>changePage(pages[pages.findIndex(p=>String(p)===selectedPage)-1])),nextPage=button('→','Следующая страница заданий',()=>changePage(pages[pages.findIndex(p=>String(p)===selectedPage)+1]));
 function changePage(value){if(value===undefined)return;selectedPage=String(value);const visibleItems=items.filter(t=>selectedPage==='all'||String(t.page||'')===selectedPage),first=visibleItems.find(t=>!t.done)||visibleItems[0]||next;start.onclick=()=>open(first.id);start.textContent=first.hasAnswer?'Продолжить задание →':'Начать занятие →';homePages.set(pageKey,selectedPage);pageSelect.value=selectedPage;for(const group of list.children)group.hidden=selectedPage!=='all'&&group.dataset.cfHomePage!==selectedPage;const i=pages.findIndex(p=>String(p)===selectedPage);prev.disabled=i<=0;nextPage.disabled=i<0||i>=pages.length-1;list.classList.toggle('cf-all-pages',selectedPage==='all')}
 pageSelect.onchange=()=>changePage(pageSelect.value);picker.append(prev,pageSelect,nextPage);section.append(picker);
 for(const page of pages){const group=node('section');group.dataset.cfHomePage=String(page);group.append(node('h2',page?'Страница '+page:'Задания'));for(const t of items.filter(t=>t.page===page)){
  const b=button('',null,()=>open(t.id));b.dataset.focusOpen=t.id;b.disabled=config.ready===false;const label=node('span',t.label,'cf-task-number'),content=node('span',t.title||'Упражнение '+t.label);if(t.kind)content.append(node('small',t.kind));b.append(label,content,node('span',t.done?'✓':t.hasAnswer?'Продолжить':'→','cf-task-state'));group.append(b)
 }list.append(group)}section.append(list);changePage(selectedPage);start.disabled=config.ready===false;
}
root.CourseFocus={mount,reset,home,title,instruction,prepareFields,current:dialog=>states.get(dialog)?.current?.()};
})(window);
