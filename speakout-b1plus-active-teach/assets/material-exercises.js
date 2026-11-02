/* Interactive responses are compiled from the supplied tasks and original keys. */
(function(root){
'use strict';
function normalize(value){
 return String(value??'').normalize('NFKC').replace(/[‘’`]/g,"'").toLowerCase().trim()
  .replace(/\bcan't\b/g,'cannot').replace(/\bwon't\b/g,'will not').replace(/n't\b/g,' not')
  .replace(/\bcan not\b/g,'cannot').replace(/'m\b/g,' am').replace(/'re\b/g,' are').replace(/'ve\b/g,' have').replace(/'ll\b/g,' will')
  .replace(/\b(he|she|it|that|there|what|where|who|how)'s(?= been\b)/g,'$1 has')
  .replace(/[.!?,;:"“”()]/g,'').replace(/[–—]/g,'-').replace(/\s+/g,' ').trim();
}
function matches(value,field){return !!String(value??'').trim()&&field.answers.some(a=>normalize(a)===normalize(value))}
function totals(sections,states){
 let correct=0,checked=0,total=0,reviewed=0,manual=0;
 for(const ex of sections){
  const s=states[ex.id]||{};
  if(ex.mode==='review'){manual++;if(s.done)reviewed++;continue;}
  total+=ex.fields.length;
  for(const f of ex.fields)if(s.checked?.[f.n]){checked++;if(matches(s.values?.[f.n],f))correct++;}
 }
 return {correct,checked,total,reviewed,manual};
}
function mount(container,config){
 const {item,answer,persist,esc,url,setPage,bindExclusivePlayers}=config;
 const spec=root.SPEAKOUT_MATERIAL_INTERACTIONS?.materials[item.id];
 if(!spec?.sections?.length)return false;
 const sections=spec.sections;
 answer.exercises=answer.exercises&&typeof answer.exercises==='object'?answer.exercises:{};
 const states=answer.exercises;
 let selected=sections.find(s=>s.id===answer.activeExercise)||sections[0];
 const $=s=>container.querySelector(s),$$=s=>[...container.querySelectorAll(s)];
 const label=ex=>`${ex.part?'Part '+ex.part+' · ':''}${ex.skill||'Test'} · ${ex.n}`;
 function state(){return states[selected.id]||(states[selected.id]={values:{},checked:{},revealed:{},note:'',done:false})}
 container.innerHTML=`<div class="practice-summary"><div><p class="eyebrow">ИНТЕРАКТИВНЫЙ ТЕСТ</p><p id="practiceTotal" role="status"></p></div><button id="practiceCheckAll">Проверить весь тест</button></div><label class="practice-select-label" for="practiceSelect">Упражнение<select id="practiceSelect">${sections.map(ex=>`<option value="${esc(ex.id)}">${esc(label(ex))}${ex.mode==='review'?' · с преподавателем':''}</option>`).join('')}</select></label><div id="practiceBody"></div>`;
 $('#practiceSelect').onchange=e=>{selected=sections.find(s=>s.id===e.target.value);render()};
 $('#practiceCheckAll').onclick=()=>{
  for(const ex of sections){if(ex.mode!=='auto')continue;const st=states[ex.id]||(states[ex.id]={values:{},checked:{},revealed:{},note:'',done:false});st.checked=Object.fromEntries(ex.fields.map(f=>[f.n,true]));}
  feedback();summary();persist();
 };
 function summary(){
  const t=totals(sections,states);
  $('#practiceTotal').textContent=`Верных ответов: ${t.correct} из ${t.total}. Проверено: ${t.checked}.${t.manual?` Открытых заданий подготовлено: ${t.reviewed} из ${t.manual}.`:''}`;
  for(const option of $('#practiceSelect').options){const ex=sections.find(s=>s.id===option.value),s=states[ex.id];const done=ex.mode==='review'?s?.done:ex.fields.every(f=>s?.checked?.[f.n]&&matches(s.values?.[f.n],f));option.textContent=(done?'✓ ':'')+label(ex)+(ex.mode==='review'?' · с преподавателем':'');}
 }
 function updateValue(n,value){
  const st=state();st.values[n]=value;delete st.checked[n];delete st.revealed[n];st.done=false;
  feedback();summary();persist();
 }
 function render(){
  answer.activeExercise=selected.id;$('#practiceSelect').value=selected.id;const st=state();
  st.values=st.values||{};st.checked=st.checked||{};st.revealed=st.revealed||{};
  let html=`<h3 tabindex="-1" id="practiceTitle">${esc(label(selected))}</h3><p class="practice-instruction">${esc(selected.instruction)}</p>`;
  html+=selected.audio.map(a=>`<label class="practice-track">${esc(a.track)}<audio controls preload="none" src="${url(a.path)}"></audio></label>`).join('');
  html+=`<details class="practice-source-text"><summary>Текст задания</summary><div>${esc(selected.text)}</div></details>`;
  if(selected.mode==='auto'){
   html+='<p class="practice-help">Выбери варианты или впиши ответ целиком. Нумерация соответствует оригиналу.</p>';
   html+=selected.fields.map((f,i)=>{
    const id='practice-answer-'+i,value=st.values[f.n]||'';
    let control;
    if(f.type==='choice')control=`<div class="practice-options" role="group" aria-label="Ответ ${esc(f.n)}">${f.options.map(o=>`<button type="button" data-answer-number="${esc(f.n)}" data-answer-value="${esc(o.value)}" aria-pressed="${normalize(value)===normalize(o.value)}">${esc(o.label)}</button>`).join('')}</div>`;
    else if(f.type==='match'||f.type==='bank')control=`<select id="${id}" data-practice-input="${esc(f.n)}" aria-describedby="practice-feedback-${i}"><option value="">Выбери ответ…</option>${f.options.map(o=>`<option value="${esc(o.value)}" ${normalize(value)===normalize(o.value)?'selected':''}>${esc(f.type==='match'?o.value+'. '+o.label:o.label)}</option>`).join('')}</select>`;
    else control=(f.type==='order'?`<div class="practice-tokens" role="group" aria-label="Слова для предложения ${esc(f.n)}">${f.tokens.map((token,j)=>`<button type="button" data-token-number="${esc(f.n)}" data-token-index="${j}">${esc(token)}</button>`).join('')}</div>`:'')+`<input id="${id}" data-practice-input="${esc(f.n)}" value="${esc(value)}" autocomplete="off" spellcheck="false" aria-describedby="practice-feedback-${i}" placeholder="${f.type==='order'?'Нажимай слова или напиши предложение':'Твой ответ'}">`;
    return `<section class="practice-field" data-field="${esc(f.n)}"><label ${f.type==='choice'?'':`for="${id}"`}><strong>${esc(f.n)}.</strong> ${esc(f.prompt||(/order/i.test(selected.instruction)?'Позиция '+f.n:'Пропуск '+f.n))}</label>${control}<div class="practice-feedback-row"><span class="practice-feedback" id="practice-feedback-${i}" role="status"></span><button class="practice-reveal" data-practice-reveal="${esc(f.n)}">Показать ответ</button></div></section>`;
   }).join('');
   html+='<div class="practice-actions"><button id="practiceCheck" class="primary">Проверить</button><button id="practiceRetry">Повторить ошибки</button><button id="practiceReset">Очистить ответы</button></div><p id="practiceResult" role="status"></p>';
  }else{
   html+=`<p class="practice-help">Подготовь ответ по оригиналу. Это задание проверяется с преподавателем; автоматическая оценка за него не выставляется.</p><label for="practiceNote">Твой ответ или план выступления</label><textarea id="practiceNote" rows="7" placeholder="Напиши ответ…">${esc(st.note||'')}</textarea><button id="practiceDone" aria-pressed="${!!st.done}" class="${st.done?'selected':''}">${st.done?'✓ Подготовлено':'Ответ подготовлен'}</button>`;
  }
  html+=`<details class="practice-key"><summary>Ключ и образец ответа</summary><div>${esc(selected.key.raw||'Сверь ответ с оригинальным ключом.')}</div></details><nav class="practice-nav" aria-label="Следующее упражнение"><button id="practicePrevious" ${selected===sections[0]?'disabled':''}>← Предыдущее</button><button id="practiceNext" ${selected===sections.at(-1)?'disabled':''}>Следующее →</button></nav>`;
  $('#practiceBody').innerHTML=html;
  $$('[data-practice-input]').forEach(el=>el.addEventListener(el.tagName==='SELECT'?'change':'input',()=>updateValue(el.dataset.practiceInput,el.value)));
  $$('[data-answer-value]').forEach(b=>b.onclick=()=>updateValue(b.dataset.answerNumber,b.dataset.answerValue));
  $$('[data-token-index]').forEach(b=>b.onclick=()=>{const f=selected.fields.find(f=>f.n===b.dataset.tokenNumber);const input=$$('[data-practice-input]').find(el=>el.dataset.practiceInput===f.n);input.value=(input.value.trim()+' '+f.tokens[+b.dataset.tokenIndex]).trim();updateValue(f.n,input.value)});
  $$('[data-practice-reveal]').forEach(b=>b.onclick=()=>{st.revealed[b.dataset.practiceReveal]=!st.revealed[b.dataset.practiceReveal];feedback();persist()});
  if($('#practiceCheck')){
   $('#practiceCheck').onclick=()=>{st.checked=Object.fromEntries(selected.fields.map(f=>[f.n,true]));feedback();summary();persist()};
   $('#practiceRetry').onclick=()=>{for(const f of selected.fields)if(st.checked[f.n]&&!matches(st.values[f.n],f)){delete st.values[f.n];delete st.checked[f.n];delete st.revealed[f.n];}render()};
   $('#practiceReset').onclick=()=>{st.values={};st.checked={};st.revealed={};render()};
  }else{
   $('#practiceNote').oninput=e=>{st.note=e.target.value;st.done=false;$('#practiceDone').textContent='Ответ подготовлен';$('#practiceDone').setAttribute('aria-pressed','false');$('#practiceDone').classList.remove('selected');summary();persist()};
   $('#practiceDone').onclick=e=>{st.done=!st.done;e.target.textContent=st.done?'✓ Подготовлено':'Ответ подготовлен';e.target.setAttribute('aria-pressed',!!st.done);e.target.classList.toggle('selected',!!st.done);summary();persist()};
  }
  $('#practicePrevious').onclick=()=>navigate(-1);$('#practiceNext').onclick=()=>navigate(1);
  setPage(selected.sourcePage);feedback();summary();bindExclusivePlayers();persist();
 }
 function navigate(delta){
  container.querySelectorAll('audio').forEach(a=>a.pause());selected=sections[sections.indexOf(selected)+delta];render();$('#practiceTitle').focus({preventScroll:true});container.scrollIntoView({block:'nearest'});
 }
 function feedback(){
  if(selected.mode!=='auto')return;
  const st=state();let correct=0,checked=0;
  selected.fields.forEach((f,i)=>{
   const value=st.values[f.n]||'',isChecked=st.checked[f.n],ok=matches(value,f),el=$$('[data-field]').find(el=>el.dataset.field===f.n);
   el.classList.toggle('correct',!!isChecked&&ok);el.classList.toggle('incorrect',!!isChecked&&!ok);
   if(isChecked){checked++;if(ok)correct++;}
   const status=$('#practice-feedback-'+i);status.textContent=st.revealed[f.n]?'Ответ: '+f.sourceAnswer:isChecked?(ok?'Верно':value?'Пока неверно. Попробуй ещё раз.':'Добавь ответ.'):'';
   el.querySelectorAll('[data-answer-value]').forEach(b=>{const on=normalize(value)===normalize(b.dataset.answerValue);b.classList.toggle('selected',on);b.setAttribute('aria-pressed',on)});
   el.querySelector('[data-practice-reveal]').textContent=st.revealed[f.n]?'Скрыть ответ':'Показать ответ';
  });
  $('#practiceResult').textContent=checked?`Верных ответов: ${correct} из ${selected.fields.length}.`:'';
 }
 render();return true;
}
const api={normalize,matches,totals,mount};root.SpeakoutMaterialExercises=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window==='undefined'?globalThis:window);
