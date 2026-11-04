(function(){
  'use strict';
  let active=null,fields=[],key='',revealed=false;
  const dialog=document.createElement('dialog');dialog.id='mdExercise';dialog.className='exercise-dialog';
  dialog.setAttribute('aria-labelledby','exerciseTitle');document.body.appendChild(dialog);
  const correct=(value,field)=>window.B2AnswerCheck.correct(value,field);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function custom(s){
    let fs=[],k='';
    if(s.type==='gap')fs=[...s.data.matchAll(/\{([^}]+)\}/g)].map((m,i)=>({n:String(i+1),answer:m[1]}));
    else if(s.type==='match'){
      const pairs=s.data.split('\n').map(x=>x.split('|').map(v=>v.trim())).filter(p=>p.length===2);
      fs=pairs.map((p,i)=>({n:String(i+1),prompt:p[0],answer:p[1],choices:[...pairs.map(v=>v[1])].sort()}));
    }else if(s.type==='quiz')fs=s.data.split(/\n\s*\n/).filter(Boolean).map((block,i)=>{
      const [prompt,...choices]=block.split('\n').filter(Boolean);return {n:String(i+1),prompt,answer:choices.find(c=>c.startsWith('*'))?.slice(1)||'',choices:choices.map(c=>c.replace(/^\*/,''))};
    });
    else if(s.type==='reveal'){k=s.data;fs=s.data.split('\n').filter(Boolean).map((a,i)=>({n:String(i+1),answer:a}));}
    if(!fs.length)fs=[{n:'notes',answer:''}];
    if(!k)k=fs.filter(f=>f.answer).map(f=>`${f.n} ${f.answer}`).join('\n');
    return {fields:fs,key:k};
  }
  function storageKey(f){return f.storageKey||active.id+':'+f.n;}
  function value(f){const a=window.B2Store?.answers(active.page)[storageKey(f)];return typeof a==='object'&&a?a:{value:a??'',checked:false};}
  function render(){
    if(!active)return;const s=active.s,img=document.querySelector('#pageImg');
    const [book,sheet]=active.page.split(':'),printed=Number(sheet)+(book==='sb'?1:2),disabled=!window.B2Store?.ready;
    const result=f=>{const a=value(f);return !a.checked?'':!f.answer?'Сохранено для обсуждения':!String(a.value).trim()?'Введите ответ':correct(a.value,f)?'Верно':'Попробуйте ещё раз';};
    dialog.innerHTML=`<header class="exercise-head"><div><p>${book==='sb'?"Student’s Book":'Workbook'} · стр. ${printed}</p><h2 id="exerciseTitle">Упражнение ${esc(s.label||'')}</h2></div><button class="btn" id="exerciseClose" aria-label="Закрыть упражнение">✕</button></header>
      <div class="exercise-content"><div class="exercise-original"><svg role="img" aria-label="Оригинал упражнения ${esc(s.label)}" viewBox="${s.x*img.naturalWidth} ${s.y*img.naturalHeight} ${s.w*img.naturalWidth} ${s.h*img.naturalHeight}"><image href="${esc(img.src)}" width="${img.naturalWidth}" height="${img.naturalHeight}"/></svg></div>
      <div class="focus-responses">${s.hint?`<p class="exercise-note">${esc(s.hint)}</p>`:''}${s.type==='gap'?`<p class="exercise-prompt">${esc(s.data.replace(/\{[^}]+\}/g,'_____'))}</p>`:''}
      <div class="exercise-fields ${fields.length===1?'single':''}">${fields.map(f=>{
        const a=value(f),id='exercise-field-'+f.n,message=result(f),ok=message==='Верно';
        const selected=String(a.value||'').split(',').map(v=>v.trim());
        const control=f.mode==='set'?`<div class="exercise-multiple" role="group" aria-labelledby="${id}-label">${f.choices.map((c,i)=>`<label><input type="checkbox" data-multi="${f.n}" value="${esc(c)}" ${selected.includes(c)?'checked':''} ${disabled?'disabled':''}><span>${esc(c)}</span></label>`).join('')}</div>`:f.choices?`<select id="${id}" data-answer="${f.n}" ${disabled?'disabled':''}><option value="">Выберите ответ</option>${f.choices.map(c=>`<option ${a.value===c?'selected':''} value="${esc(c)}">${esc(c)}</option>`).join('')}</select>`:
          (f.n==='notes'||fields.length===1&&!f.answer)?`<textarea rows="4" id="${id}" data-answer="${f.n}" ${disabled?'disabled':''}>${esc(a.value)}</textarea>`:
          `<input id="${id}" data-answer="${f.n}" value="${esc(a.value)}" autocomplete="off" spellcheck="false" ${disabled?'disabled':''}>`;
        return `<div class="exercise-field ${f.prompt||f.n==='notes'||f.mode==='set'?'expanded':'compact'} ${message?(ok?'correct':f.answer?'retry':'discussion'):''}"><label id="${id}-label" ${f.mode==='set'?'':`for="${id}"`}>${f.n==='notes'?'Ваш ответ / заметки':esc(f.prompt||'Ответ '+f.n)}</label>${control}<span class="field-result" aria-live="polite">${message}</span></div>`;
      }).join('')}</div>
      ${!fields.some(f=>f.answer)?'<p class="exercise-note">Ответы сохраняются. Это задание можно обсудить с преподавателем или сверить с образцом, если он доступен.</p>':''}
      ${key?`<details class="exercise-key" ${revealed?'open':''}><summary>Показать ключ / образец ответа</summary><p>${esc(key)}</p></details>`:''}</div></div>
      <footer class="exercise-footer"><span class="exercise-status">${esc(document.querySelector('#saveStatus').textContent)}</span>${s.audio?'<button class="btn" id="exerciseAudio">▶ Аудио / пауза</button>':''}${s.video?'<button class="btn" id="exerciseVideo">▶ Видео</button>':''}<button class="btn" id="exerciseAdd">+ Ответ</button><button class="btn" id="exerciseReset">Сбросить ответы</button><button class="btn pri" id="exerciseCheck" ${disabled?'disabled':''}>${fields.some(f=>f.answer)?'Проверить':'Сохранить ответы'}</button></footer>`;
    window.ExerciseSource.columns(dialog,dialog.querySelector('.exercise-content'),dialog.querySelector('.exercise-original'),dialog.querySelector('.focus-responses'));
    window.ExerciseSource.mount(dialog.querySelector('.exercise-original'),active.id,{label:s.label,sources:[{image:img.src,size:[img.naturalWidth,img.naturalHeight],box:[s.x,s.y,s.w,s.h],page:printed}]});
    window.ExerciseSource.controls(dialog.querySelector('.exercise-original'));
    dialog.querySelector('#exerciseClose').onclick=()=>dialog.close();
    dialog.querySelectorAll('[data-answer]').forEach(el=>el.oninput=()=>{
      window.B2Store.answer(storageKey(fields.find(f=>f.n===el.dataset.answer)),{value:el.value,checked:false});
      el.closest('.exercise-field').classList.remove('correct','retry');el.parentElement.querySelector('.field-result').textContent='';
    });
    dialog.querySelectorAll('[data-multi]').forEach(el=>el.onchange=()=>{
      const field=el.closest('.exercise-field');
      const chosen=[...field.querySelectorAll('input:checked')].map(input=>input.value).join(',');
      window.B2Store.answer(active.id+':'+el.dataset.multi,{value:chosen,checked:false});
      field.classList.remove('correct','retry');field.querySelector('.field-result').textContent='';
    });
    dialog.querySelector('#exerciseCheck').onclick=()=>{
      for(const f of fields){const a=value(f);window.B2Store.answer(storageKey(f),{value:a.value,checked:true});}
      render();window.B2Store.flush();
    };
    dialog.querySelector('#exerciseReset').onclick=()=>{for(const f of fields)window.B2Store.answer(storageKey(f),null);render();};
    dialog.querySelector('#exerciseAdd').onclick=()=>{if(fields.length>=40)return;let n=fields.length+1;while(fields.some(f=>f.n===String(n)))n++;fields.push({n:String(n),answer:''});window.B2Store.answer(active.id+':_count',fields.length);render();};
    if(s.audio)dialog.querySelector('#exerciseAudio').onclick=()=>{if(!AU.src.endsWith(enc(s.audio)))playTrack(s.audio,'Упражнение '+s.label);else if(!AU.paused)AU.pause();else AU.play().catch(()=>{});};
    if(s.video)dialog.querySelector('#exerciseVideo').onclick=()=>openVideo(s.video,'Видео к упражнению '+s.label);
    const detail=dialog.querySelector('details');if(detail)detail.ontoggle=()=>{revealed=detail.open;};
    window.ExercisePlay.attach({dialog,source:dialog.querySelector('.exercise-original'),responses:dialog.querySelector('.focus-responses'),id:active.id,text:s.text||s.data||'',fields:fields.filter(f=>f.n!=='notes'&&f.mode!=='set').map(f=>{const input=[...dialog.querySelectorAll('[data-answer]')].find(el=>el.dataset.answer===f.n);return input&&window.ExercisePlay.inputField(f.n,input,f.accepted||f.answers||[f.answer],f.choices?.map(v=>({value:v,label:v})),input.closest('.exercise-field'))}).filter(Boolean)});
  }
  dialog.onkeydown=e=>e.stopPropagation();
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{active=null;window.B2Store?.flush();});
  window.B2Exercises={
    open(s,page){active={s,page,id:s.id||s.uid||'custom-'+s.label};const model=s.type==='book'?s:custom(s);fields=model.fields.map(f=>({...f}));key=model.key;revealed=false;
      const saved=window.B2Store?.answers(page)||{};
      // Previously saved notes/extra fields survive changes to the reviewed model.
      for(const [id,answer]of Object.entries(saved)){const n=id.slice(active.id.length+1);if(id.startsWith(active.id+':')&&/^(?:\d+[a-z]?|notes)$/.test(n)&&answer!=null&&!fields.some(f=>f.n===n))fields.push({n,answer:'',prompt:'Сохранённый ответ '+n});}
      for(const oldId of s.legacyIds||[])for(const [id,answer]of Object.entries(saved)){const n=id.slice(oldId.length+1);if(id.startsWith(oldId+':')&&/^(?:\d+[a-z]?|notes)$/.test(n)&&answer!=null)fields.push({n:'legacy-'+fields.length,storageKey:id,answer:'',prompt:'Ранее сохранённый ответ '+n});}
      const count=Math.min(40,Number(saved[active.id+':_count'])||0);while(fields.length<count){let n=1;while(fields.some(f=>f.n===String(n)))n++;fields.push({n:String(n),answer:''});}render();if(!dialog.open)dialog.showModal();},
    close(){if(dialog.open)dialog.close();active=null;},
    refresh(){if(dialog.open&&!dialog.contains(document.activeElement))render();}
  };
})();
