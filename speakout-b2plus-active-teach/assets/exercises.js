(function(){
  'use strict';
  let active=null,fields=[],key='',revealed=false;
  const dialog=document.createElement('dialog');dialog.id='mdExercise';dialog.className='exercise-dialog';
  dialog.setAttribute('aria-labelledby','exerciseTitle');document.body.appendChild(dialog);
  const norm=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[’‘`]/g,"'").replace(/[.,!?;:]/g,'').replace(/\s+/g,' ').trim();
  const correct=(value,answer)=>answer.split(/\s*\/\s*/).some(a=>norm(a)===norm(value));
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
  function value(f){const a=window.B2Store?.answers(active.page)[active.id+':'+f.n];return typeof a==='object'&&a?a:{value:a??'',checked:false};}
  function render(){
    if(!active)return;const s=active.s,img=document.querySelector('#pageImg');
    const [book,sheet]=active.page.split(':'),printed=Number(sheet)+(book==='sb'?1:2),disabled=!window.B2Store?.ready;
    const result=f=>{const a=value(f);return !a.checked?'':!f.answer?'Сохранено для обсуждения':!String(a.value).trim()?'Введите ответ':correct(a.value,f.answer)?'Верно':'Попробуйте ещё раз';};
    dialog.innerHTML=`<header class="exercise-head"><div><p>${book==='sb'?"Student’s Book":'Workbook'} · стр. ${printed}</p><h2 id="exerciseTitle">Упражнение ${esc(s.label||'')}</h2></div><button class="btn" id="exerciseClose" aria-label="Закрыть упражнение">✕</button></header>
      <div class="exercise-content"><div class="exercise-original"><svg role="img" aria-label="Оригинал упражнения ${esc(s.label)}" viewBox="${s.x*img.naturalWidth} ${s.y*img.naturalHeight} ${s.w*img.naturalWidth} ${s.h*img.naturalHeight}"><image href="${esc(img.src)}" width="${img.naturalWidth}" height="${img.naturalHeight}"/></svg></div>
      ${s.type==='gap'?`<p class="exercise-prompt">${esc(s.data.replace(/\{[^}]+\}/g,'_____'))}</p>`:''}
      <div class="exercise-fields ${fields.length===1?'single':''}">${fields.map(f=>{
        const a=value(f),id='exercise-field-'+f.n,message=result(f),ok=message==='Верно';
        const control=f.choices?`<select id="${id}" data-answer="${f.n}" ${disabled?'disabled':''}><option value="">Выберите ответ</option>${f.choices.map(c=>`<option ${a.value===c?'selected':''} value="${esc(c)}">${esc(c)}</option>`).join('')}</select>`:
          (f.n==='notes'||fields.length===1&&!f.answer)?`<textarea rows="4" id="${id}" data-answer="${f.n}" ${disabled?'disabled':''}>${esc(a.value)}</textarea>`:
          `<input id="${id}" data-answer="${f.n}" value="${esc(a.value)}" autocomplete="off" spellcheck="false" ${disabled?'disabled':''}>`;
        return `<div class="exercise-field ${message?(ok?'correct':f.answer?'retry':'discussion'):''}"><label for="${id}">${f.n==='notes'?'Ваш ответ / заметки':esc(f.prompt||'Ответ '+f.n)}</label>${control}<span class="field-result" aria-live="polite">${message}</span></div>`;
      }).join('')}</div>
      ${!fields.some(f=>f.answer)?'<p class="exercise-note">Ответы сохраняются. Это задание можно обсудить с преподавателем или сверить с образцом, если он доступен.</p>':''}
      ${key?`<details class="exercise-key" ${revealed?'open':''}><summary>Показать ключ / образец ответа</summary><p>${esc(key)}</p></details>`:''}</div>
      <footer class="exercise-footer"><span class="exercise-status">${esc(document.querySelector('#saveStatus').textContent)}</span>${s.audio?'<button class="btn" id="exerciseAudio">▶ Аудио / пауза</button>':''}${s.video?'<button class="btn" id="exerciseVideo">▶ Видео</button>':''}<button class="btn" id="exerciseAdd">+ Ответ</button><button class="btn" id="exerciseReset">Сбросить ответы</button><button class="btn pri" id="exerciseCheck" ${disabled?'disabled':''}>${fields.some(f=>f.answer)?'Проверить':'Сохранить ответы'}</button></footer>`;
    dialog.querySelector('#exerciseClose').onclick=()=>dialog.close();
    dialog.querySelectorAll('[data-answer]').forEach(el=>el.oninput=()=>{
      window.B2Store.answer(active.id+':'+el.dataset.answer,{value:el.value,checked:false});
      el.closest('.exercise-field').classList.remove('correct','retry');el.parentElement.querySelector('.field-result').textContent='';
    });
    dialog.querySelector('#exerciseCheck').onclick=()=>{
      for(const f of fields){const a=value(f);window.B2Store.answer(active.id+':'+f.n,{value:a.value,checked:true});}
      render();window.B2Store.flush();
    };
    dialog.querySelector('#exerciseReset').onclick=()=>{for(const f of fields)window.B2Store.answer(active.id+':'+f.n,null);render();};
    dialog.querySelector('#exerciseAdd').onclick=()=>{if(fields.length>=40)return;fields.push({n:String(fields.length+1),answer:''});window.B2Store.answer(active.id+':_count',fields.length);render();};
    if(s.audio)dialog.querySelector('#exerciseAudio').onclick=()=>{if(!AU.src.endsWith(enc(s.audio)))playTrack(s.audio,'Упражнение '+s.label);else if(!AU.paused)AU.pause();else AU.play().catch(()=>{});};
    if(s.video)dialog.querySelector('#exerciseVideo').onclick=()=>openVideo(s.video,'Видео к упражнению '+s.label);
    const detail=dialog.querySelector('details');if(detail)detail.ontoggle=()=>{revealed=detail.open;};
  }
  dialog.onkeydown=e=>e.stopPropagation();
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{active=null;window.B2Store?.flush();});
  window.B2Exercises={
    open(s,page){active={s,page,id:s.id||s.uid||'custom-'+s.label};const model=s.type==='book'?s:custom(s);fields=model.fields.map(f=>({...f}));key=model.key;revealed=false;const count=Math.min(40,Number(window.B2Store?.answers(page)[active.id+':_count'])||0);while(fields.length<count)fields.push({n:String(fields.length+1),answer:''});render();if(!dialog.open)dialog.showModal();},
    close(){if(dialog.open)dialog.close();active=null;},
    refresh(){if(dialog.open&&!dialog.contains(document.activeElement))render();}
  };
})();
