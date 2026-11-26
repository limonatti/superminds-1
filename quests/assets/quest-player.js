(function(root){
'use strict';
const Q=root.AcademyQuest,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normal=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/[‐‑–]/g,'-').replace(/[.!?]+$/g,'').trim().replace(/\s+/g,' ');
const matches=(value,row)=>(row.accepted||[]).some(a=>normal(a)===normal(value));
const key=id=>'quest:'+Q.id+':'+id;
let store=null,records={},active=0,selectedSlot=0,selectedWord=null,ready=false,view='map',undo=null,shownRecord='',shownFinal='';
const task=()=>Q.tasks[active],record=id=>records[key(id)]||{},values=t=>t.rows.map((r,i)=>String(record(t.id).values?.[i]||''));
const isOpen=t=>['dialogue','writing'].includes(t.type);
function reviewed(t){const r=record(t.id);return isOpen(t)?!!r.reviewed:!!r.checked&&t.rows.every((row,i)=>matches(r.values?.[i],row));}
function write(id,patch){if(!store||store.user===undefined)return false;store.set(key(id),{...record(id),...patch,quest:Q.id,version:1});records=store.records;renderMap();printSheet();return true;}
function status(message=''){
 const text=!store?'Connecting to your saved work…':store.user===undefined?'Your account could not be checked. Reconnecting…':!store.localOK?'This browser could not save your draft. Download a copy of your answers.':!store.user?'Guest mode: answers saved in this browser only. Sign in to your course account to sync on another computer.':message.startsWith('Сохранение')?'Syncing answers to your account…':Object.keys(store.pending||{}).length?'Answers saved on this device. Waiting to sync to your account.':store.loaded?'Answers saved in your account.':'Answers saved on this device. Account sync is not confirmed yet.';
 $('#saveStatus').textContent=text;$('#taskControls').disabled=!ready||store?.user===undefined;$('#unlockForm button').disabled=!ready||store?.user===undefined;
 $('#sync').disabled=!ready||store?.user===undefined;
}
function renderMap(){
 const done=Q.tasks.filter(reviewed).length;$('#progress').textContent=`${done} of ${Q.tasks.length} challenges reviewed`;
 $('#stationMap').innerHTML=Q.stations.map((s,i)=>{const n=Q.tasks.slice(i*2,i*2+2).filter(reviewed).length;return `<button type="button" data-station="${i}"><span class="station-number">${String(i+1).padStart(2,'0')}</span><span><strong>${esc(s.name)}</strong><small>${esc(s.description)} · ${n}/2 reviewed</small></span><span class="station-arrow" aria-hidden="true">${n===2?'✓':'↗'}</span></button>`}).join('')+'<button class="final-link" id="openFinal" type="button"><span>Collected your letters?</span><strong>Open the final lock →</strong></button>';
 $$('[data-station]').forEach(b=>b.onclick=()=>go(Number(b.dataset.station)*2));$('#openFinal').onclick=showFinal;
 $('#startQuest').textContent=Q.tasks.some(t=>values(t).some(Boolean)||record(t.id).spoken)?'Continue quest →':'Start quest →';
}
function address(id){history.replaceState(null,'','#'+id);}
function map(){pause();view='map';$('#workbench').hidden=true;$('#finale').hidden=true;$('#welcome').hidden=false;$('#mission').hidden=false;$('#map').hidden=false;address('map');$('#map').scrollIntoView({block:'start'});}
function pause(){$$('audio').forEach(a=>a.pause());}
function go(index,focus=true){
 if(index>=Q.tasks.length){showFinal();return;}active=Math.max(0,index);selectedSlot=0;selectedWord=null;undo=null;view='task';pause();
 $('#welcome').hidden=true;$('#mission').hidden=true;$('#map').hidden=true;$('#finale').hidden=true;$('#workbench').hidden=false;renderTask();address('challenge-'+task().id);
 if(focus){$('#workbench').scrollIntoView({block:'start'});$('#taskTitle').focus({preventScroll:true});}
}
function rowPrompt(r){if(!r.wrong)return esc(r.prompt);const at=r.prompt.indexOf(r.wrong);return esc(r.prompt.slice(0,at))+'<strong>'+esc(r.wrong)+'</strong>'+esc(r.prompt.slice(at+r.wrong.length));}
function renderTask(){
 const t=task(),r=record(t.id),v=values(t),station=Q.stations[Math.floor(active/2)];
 $('#stationTitle').textContent=`Station ${Math.floor(active/2)+1} / ${Q.stations.length} · ${station.name}`;
 $('#stationStory').textContent=station.story;$('#taskTitle').textContent=`${t.id} / ${t.title}`;$('#taskPicker').value=String(active);$('#previous').disabled=active===0;$('#next').setAttribute('aria-label',active===Q.tasks.length-1?'Open the final lock':'Next challenge');
 $('#hintText').textContent=t.hint;$('#hintPanel').open=false;$('#feedback').textContent='';$('#checkAnswers').textContent=isOpen(t)?'Save my review':'Check answers';$('#clearAnswer').textContent='Clear this challenge';
 let html=`<p class="instruction">${esc(t.instruction)}</p>`;
 if(t.image)html+=`<figure class="picture-clues"><div class="picture-grid"><img src="${esc(t.image)}" width="1536" height="1024" alt="${esc(t.imageAlt)}"><div class="picture-labels" aria-hidden="true"><span>A</span><span>B</span><span>C</span><span>D</span></div></div><figcaption>${esc(t.imageCaption||'Use both the scene and the phrase bank to choose each caption.')}</figcaption></figure>`;
 if(t.passage)html+=`<p class="passage">${esc(t.passage)}</p>`;
 if(root.QuestTaskAudio?.[t.id]){const a=root.QuestTaskAudio[t.id];html+=`<section class="transcript"><h3>Listen to the four speakers</h3><p>${esc(a.track)}</p><div class="audio-actions"><audio id="courseAudio" controls preload="none" src="${esc(a.source)}" aria-label="Memory: four speakers"></audio><button id="repeatAudio" type="button">↺ Repeat</button><a href="${esc(a.source)}" download>Download recording</a></div><p id="audioStatus" role="status"></p><details><summary>Read the transcript</summary><p>${esc(a.transcriptSource)}</p>${a.transcript.map(line=>`<p>${esc(line)}</p>`).join('')}</details></section>`;}
 if(t.bank)html+=`<div class="bank" aria-label="Phrase bank"><p id="bankInstruction">Select a gap, then a card. You can also choose a card first, then its gap. Used cards can move to a new gap.</p><div class="bank-buttons">${t.bank.map((o,i)=>`<button type="button" data-token="${i}" aria-pressed="false">${esc(o.label)}</button>`).join('')}</div></div>`;
 if(t.type==='dialogue')html+=`<fieldset class="mode-choices"><legend>Choose how to practise</legend><label><input type="radio" name="dialogueMode" value="written" ${!r.spoken?'checked':''}>Write both roles</label><label><input type="radio" name="dialogueMode" value="spoken" ${r.spoken?'checked':''}>Speak with a partner</label></fieldset><p class="review-note">${r.spoken?'Use the four turn cards below. Add optional notes, then mark the criteria after your conversation.':'Write your four turns below. Your teacher will review the language; there is no automatic mark.'}</p>`;
 html+='<div class="answer-rows">'+t.rows.map((row,i)=>{
  const label=`${row.id}. ${row.prompt}`,rid='answer-'+t.id+'-'+i;
  let control;
  if(t.type==='choice')control=`<fieldset><legend>${esc(label)}</legend><div class="choices">${row.options.map((o,j)=>`<button type="button" class="choice" data-choice="${i}:${j}" aria-pressed="${v[i]===o.value}">${esc(o.label)}</button>`).join('')}</div></fieldset>`;
  else if(isOpen(t))control=`<label for="${rid}">${esc(row.prompt)}${t.type==='dialogue'&&r.spoken?' · optional notes':''}</label><textarea id="${rid}" data-written="${i}" rows="${t.type==='writing'?8:3}" maxlength="${t.type==='writing'?6000:2000}" class="${t.type==='writing'?'writing-area':''}">${esc(v[i])}</textarea>`;
  else control=`<span class="row-label" id="prompt-${i}"><span class="row-number">${esc(row.id)}.</span>${rowPrompt(row)}</span><button id="${rid}" type="button" class="slot" data-slot="${i}" aria-pressed="${i===selectedSlot}" data-filled="${!!v[i]}" aria-label="${esc(label)} Answer: ${esc(v[i]||'empty')}">${esc(v[i]||'Choose a card…')}</button>${t.type==='reading'?`<label class="sr-only" for="typed-${i}">Type answer ${esc(row.id)}</label><input class="typed-answer" id="typed-${i}" data-written="${i}" value="${esc(v[i])}" maxlength="180" autocomplete="off" placeholder="Or type a short answer">`:''}`;
  return `<div class="answer-row" data-row="${i}">${control}<p id="result-${i}" class="row-result" aria-live="polite"></p></div>`;
 }).join('')+'</div>';
 if(t.type==='writing')html+='<p id="wordCount" class="word-count" role="status"></p>';
 if(t.criteria)html+=`<fieldset class="criteria"><legend>Review your work</legend>${t.criteria.map((c,i)=>`<label><input type="checkbox" data-criterion="${i}" ${r.criteria?.[i]?'checked':''}>${esc(c)}</label>`).join('')}</fieldset><p class="review-note">These are your own review notes. Your teacher will give feedback on meaning, vocabulary and accuracy.</p>`;
 if(t.id===(Q.audioTask||'08')&&root.QuestAudio){const a=root.QuestAudio;html+=`<details class="transcript"><summary>Listen again: the original Unit 1.1 conversation</summary><p>${esc(a.track)}</p><p>Listen for the words that describe the father and daughter. Pause and repeat a phrase you want to use in your own conversation.</p><div class="audio-actions"><audio id="courseAudio" controls preload="none" src="${esc(a.source)}" aria-label="Father and daughter conversation"></audio><button id="repeatAudio" type="button">↺ Repeat</button><a href="${esc(a.source)}" download>Download recording</a></div><p id="audioStatus" role="status"></p><details><summary>Read the transcript</summary><p>${esc(a.transcriptSource)}</p>${a.transcript.map(line=>`<p>${esc(line)}</p>`).join('')}</details></details>`;}
 $('#taskContent').innerHTML=html;
 $$('[data-slot]').forEach(b=>b.onclick=()=>{selectedSlot=+b.dataset.slot;if(selectedWord!==null){put(selectedSlot,t.bank[selectedWord].value);selectedWord=null;}paint();});
 $$('[data-token]').forEach(b=>b.onclick=()=>{const i=+b.dataset.token;if(selectedSlot===null){selectedWord=i;paint();}else{put(selectedSlot,t.bank[i].value);selectedWord=null;selectedSlot=null;paint();}});
 $$('[data-choice]').forEach(b=>b.onclick=()=>{const [i,j]=b.dataset.choice.split(':').map(Number);put(i,t.rows[i].options[j].value);});
 $$('[data-written]').forEach(el=>el.addEventListener('input',()=>{put(+el.dataset.written,el.value,false);wordCount();}));
 $$('[data-criterion]').forEach(el=>el.onchange=()=>{const criteria=t.criteria.map((_,i)=>$(`[data-criterion="${i}"]`).checked);write(t.id,{criteria,reviewed:false});$('#feedback').textContent='Review notes saved. Use “Save my review” when you are ready.';});
 $$('[name=dialogueMode]').forEach(el=>el.onchange=()=>{write(t.id,{spoken:el.value==='spoken',reviewed:false});renderTask();});
 if($('#courseAudio')){const audio=$('#courseAudio');$('#repeatAudio').onclick=()=>{audio.currentTime=0;audio.play().catch(()=>$('#audioStatus').textContent='Playback could not start. Use the audio controls or download the recording.');};audio.onerror=()=>$('#audioStatus').textContent='The recording could not load. Try again when you are online.';}
 paint();wordCount();renderFragment();if(r.checked)mark();
 if(r.reviewed)$('#feedback').textContent='Your review is saved. Discuss your work with your teacher.';
 shownRecord=JSON.stringify(record(t.id));
 status();
}
function paint(){
 const t=task(),v=values(t);
 $$('[data-slot]').forEach(b=>{const i=+b.dataset.slot;b.textContent=v[i]||'Choose a card…';b.dataset.filled=String(!!v[i]);b.setAttribute('aria-pressed',String(i===selectedSlot));b.setAttribute('aria-label',`${t.rows[i].id}. ${t.rows[i].prompt} Answer: ${v[i]||'empty'}`);});
 $$('[data-token]').forEach(b=>{const i=+b.dataset.token;b.dataset.used=String(v.includes(t.bank[i].value));b.setAttribute('aria-pressed',String(i===selectedWord));});
 $$('[data-choice]').forEach(b=>{const [i,j]=b.dataset.choice.split(':').map(Number);b.setAttribute('aria-pressed',String(v[i]===t.rows[i].options[j].value));});
}
function clearFeedback(){$$('[data-row]').forEach(el=>{delete el.dataset.result;el.querySelector('.row-result').textContent='';el.querySelectorAll('[aria-invalid]').forEach(x=>x.removeAttribute('aria-invalid'));});$('#feedback').textContent='';}
function put(i,value,repaint=true){
 const t=task(),v=values(t);if(t.bank&&!t.reuse&&value){const previous=v.indexOf(value);if(previous>=0&&previous!==i)v[previous]='';}v[i]=value;
 write(t.id,{values:v,checked:false,reviewed:false});clearFeedback();paint();if(repaint){$$('[data-written]').forEach(el=>el.value=v[+el.dataset.written]);}
 undo=null;$('#clearAnswer').textContent='Clear this challenge';
}
function wordCount(){const el=$('#wordCount');if(el){const t=task(),n=values(t).join(' ').trim().split(/\s+/).filter(Boolean).length,range=t.wordRange===undefined?[60,80]:t.wordRange;el.textContent=range?`${n} words · aim for ${range[0]}–${range[1]}`:`${n} words across your drafts · use the criteria below`;}}
function mark(){const t=task(),v=values(t);t.rows.forEach((row,i)=>{const host=$(`[data-row="${i}"]`),ok=matches(v[i],row);host.dataset.result=ok?'correct':v[i]?'incorrect':'blank';$('#result-'+i).textContent=ok?'✓ That expression fits.':v[i]?'Try again. Read the surrounding words or open the hint.':'Choose an answer when you are ready.';const input=host.querySelector('.slot,input');if(input)input.setAttribute('aria-invalid',String(!!v[i]&&!ok));});}
function check(){
 const t=task(),r=record(t.id),v=values(t);
 if(isOpen(t)){
  const content=t.type==='dialogue'&&r.spoken||v.every(s=>s.trim());
  if(!content){$('#feedback').textContent=t.type==='dialogue'?'Complete the four turns, or choose “Speak with a partner” to review an oral dialogue.':'Complete each writing draft before saving your review.';return;}
  if(t.type==='writing'){const range=t.wordRange===undefined?[60,80]:t.wordRange,count=v[0].trim().split(/\s+/).filter(Boolean).length;if(range&&(count<range[0]||count>range[1])){$('#feedback').textContent=`Your ${count}-word draft is saved. Revise it to ${range[0]}–${range[1]} words before marking your review complete.`;return;}}
  if(!t.criteria.every((_,i)=>r.criteria?.[i])){$('#feedback').textContent='Your work is saved. Read the criteria and tick the ones you have met; keep revising any others.';return;}
  write(t.id,{reviewed:true});$('#feedback').textContent='Your review is saved. Discuss your work with your teacher; this is not an automatic grade.';
 }else{write(t.id,{checked:true});mark();$('#feedback').textContent=v.every((val,i)=>matches(val,t.rows[i]))?'All the expressions fit. Read them aloud, then move on when you are ready.':'Your choices are saved. Keep the ones that fit and try the other items again.';}
 renderFragment();
}
function renderFragment(){
 const el=$('#fragment'),stationIndex=Math.floor(active/2);el.hidden=active%2===0;if(el.hidden){el.replaceChildren();return;}
 const s=Q.stations[stationIndex],id='fragment-'+stationIndex,r=record(id);
 el.innerHTML=`<h3>Code fragment ${stationIndex+1}</h3><p>${esc(s.clue)}</p><label class="sr-only" for="codeLetter">Code fragment ${stationIndex+1}</label><input id="codeLetter" maxlength="1" autocomplete="off" autocapitalize="characters" spellcheck="false" value="${esc(r.value||'')}"><button id="checkLetter" type="button">Check letter</button><p id="letterFeedback" class="feedback" role="status"></p><button id="continueStation" type="button">${active===Q.tasks.length-1?'Open the final lock':'Continue to the next station'} →</button>`;
 $('#codeLetter').oninput=e=>{write(id,{value:e.target.value.toUpperCase()});$('#letterFeedback').textContent='';};
 $('#checkLetter').onclick=()=>{$('#letterFeedback').textContent=normal($('#codeLetter').value)===normal(s.letter)?'Letter collected. Keep it for the final lock.':'Follow the clue back to the challenge, then try again.';};
 $('#continueStation').onclick=()=>go(active+1);
}
function showFinal(){
 pause();view='final';$('#welcome').hidden=true;$('#mission').hidden=true;$('#map').hidden=true;$('#workbench').hidden=true;$('#finale').hidden=false;
 const r=record('final');$('#password').value=r.password||'';$('#lockFeedback').textContent=r.unlocked?'The gate is open. Your next chapter starts here.':'';
 $('#outcomes').innerHTML=Q.outcomes.map((o,i)=>`<label><input type="checkbox" data-outcome="${i}" ${r.outcomes?.[i]?'checked':''}>${esc(o)}</label>`).join('');
 $$('[data-outcome]').forEach(el=>el.onchange=()=>write('final',{outcomes:Q.outcomes.map((_,i)=>$(`[data-outcome="${i}"]`).checked)}));
 shownFinal=JSON.stringify(record('final'));
 address('final');$('#finale').scrollIntoView({block:'start'});$('#finalTitle').focus({preventScroll:true});status();
}
function printSheet(){
 $('#printSheet').innerHTML=`<h1>${esc(Q.title)}</h1><p>${esc(Q.edition)} · ${esc(Q.section)}<br>My saved answers</p>`+Q.tasks.map(t=>`<article><h2>${esc(t.id)} / ${esc(t.title)}</h2><p>${esc(t.instruction)}</p>${t.passage?`<p>${esc(t.passage)}</p>`:''}<ol>${t.rows.map((r,i)=>`<li><strong>${esc(r.prompt)}</strong><p>${esc(values(t)[i]||'(No written answer)')}</p></li>`).join('')}</ol>${record(t.id).spoken?'<p>Dialogue practised orally; written entries are optional notes.</p>':''}${isOpen(t)?'<small>Open response for teacher feedback. No automatic grade.</small>':''}</article>`).join('')+`<article><h2>Mission debrief</h2>${Q.outcomes.map((o,i)=>`<p>${record('final').outcomes?.[i]?'☑':'☐'} ${esc(o)}</p>`).join('')}</article>`;
}
function download(){const answers=Object.fromEntries(Object.entries(records).filter(([id])=>id.startsWith(key(''))));const blob=new Blob([JSON.stringify({quest:Q.id,course:Q.course,answers},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=Q.id+'-my-answers.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('#story').textContent=Q.story;
$('#taskPicker').innerHTML=Q.stations.map((s,i)=>`<optgroup label="${i+1}. ${esc(s.name)}">${Q.tasks.slice(i*2,i*2+2).map((t,j)=>`<option value="${i*2+j}">${t.id} · ${esc(t.title)}</option>`).join('')}</optgroup>`).join('');
$('#startQuest').onclick=()=>go(Math.max(0,Q.tasks.findIndex(t=>!reviewed(t))));$('#showMap').onclick=map;$('#finalMap').onclick=map;$('#previous').onclick=()=>go(active-1);$('#next').onclick=()=>go(active+1);$('#taskPicker').onchange=e=>go(+e.target.value);$('#checkAnswers').onclick=check;
$('#clearAnswer').onclick=()=>{if(undo){write(task().id,undo);undo=null;renderTask();$('#feedback').textContent='Your previous answers are restored.';return;}undo=JSON.parse(JSON.stringify(record(task().id)));write(task().id,{values:[],criteria:[],checked:false,reviewed:false});const previous=undo;renderTask();undo=previous;$('#clearAnswer').textContent='Undo clear';$('#feedback').textContent='This challenge was cleared. Use “Undo clear” to restore it.';};
$('#password').oninput=e=>{write('final',{password:e.target.value.toUpperCase(),unlocked:false});$('#lockFeedback').textContent='';};
$('#unlockForm').onsubmit=e=>{e.preventDefault();const unlocked=normal($('#password').value)===normal(Q.stations.map(s=>s.letter).join(''));write('final',{password:$('#password').value.toUpperCase(),unlocked});$('#lockFeedback').textContent=unlocked?'The gate is open. Your next chapter starts here.':'Check the letters from stations 1–6 in order. You can return to any clue.';};
$('#sync').onclick=()=>store?.reconnect();$('#exportAnswers').onclick=download;$('#printAnswers').onclick=()=>{printSheet();root.print();};root.addEventListener('beforeprint',printSheet);
renderMap();printSheet();
// Same account storage and server-side rules as the parent course. Each quest
// record has its own prefix, so existing textbook answers are never replaced.
(async()=>{
 try{
  if(!root.CourseWorkStore||!root.SM)throw Error('Storage unavailable');
  store=new root.CourseWorkStore({course:Q.course,onStatus:status,onAccountChange(){selectedWord=null;undo=null;},onChange(rows,change){records=rows;if(ready){renderMap();printSheet();if(change.local){shownRecord=JSON.stringify(record(task().id));shownFinal=JSON.stringify(record('final'));}if(change.account||change.remote){if(view==='task'&&(change.account||shownRecord!==JSON.stringify(record(task().id))))renderTask();else if(view==='final'&&(change.account||shownFinal!==JSON.stringify(record('final'))))showFinal();}}}});
  await store.start();records=store.records;ready=true;status();renderMap();printSheet();
  const match=location.hash.match(/^#challenge-(\d+)$/);if(match){const i=Q.tasks.findIndex(t=>t.id===match[1]);if(i>=0)go(i,false);}else if(location.hash==='#final')showFinal();
 }catch{ready=false;$('#saveStatus').textContent='Saved work is unavailable. Reload to try again, or use the downloadable PDF.';$('#taskControls').disabled=true;$('#startQuest').disabled=true;$('#sync').disabled=true;}
})();
root.QuestPlayer={matches,normal,getStore:()=>store,go,showFinal};
})(window);
