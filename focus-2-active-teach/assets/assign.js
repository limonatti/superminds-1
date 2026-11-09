/* Teacher-only assignment controls for the open SB/WB page. */
'use strict';
window.Focus2Assign={create({getUser,getPage,onChange}){
 const $=s=>document.querySelector(s),H=window.Focus2HW;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const selected=new Set(),exercises=new Map(window.FOCUS2.pages.flatMap(p=>p.exercises.map(e=>[e.id,{...e,unit:p.unit}])));
 let allowed=false,mode=false,sending=false,students=[],owner=null;
 const button=$('#assignToggle'),panel=$('#teacherAssignment');
 function message(text){$('#assignStatus').textContent=text;}
 function edited(){message('Выбери ученика и нажми «Выдать домашку», когда список готов.');$('#assignResultLink').hidden=true;}
 function update(){
  button.hidden=!allowed;panel.hidden=!allowed||!mode;button.setAttribute('aria-pressed',String(mode));
  button.textContent=mode?'Выйти из выбора':selected.size?`Домашка (${selected.size})`:'Задать домашку';
  $('#assignReview').hidden=!allowed||!mode;$('#assignReview').textContent=`Выбрано: ${selected.size} → назначить`;$('#assignReview').disabled=sending||!selected.size;
  $('#assignCount').textContent=`Выбрано: ${selected.size}`;
  $('#assignItems').innerHTML=[...selected].map(id=>`<li><span>${esc(H.label(id))}</span><button type="button" data-remove-assignment="${id}" aria-label="Убрать ${esc(H.label(id))}" ${sending?'disabled':''}>×</button></li>`).join('');
  panel.querySelectorAll('[data-remove-assignment]').forEach(b=>b.onclick=()=>toggle(b.dataset.removeAssignment));
  $('#assignSend').disabled=!allowed||sending||!selected.size||!$('#assignStudent').value;
  $('#assignClear').disabled=sending||!selected.size;$('#assignPage').disabled=sending||!getPage()?.exercises.length;
  for(const id of ['assignStudent','assignDue','assignComment','assignReload'])$('#'+id).disabled=sending;
  $('#assignSend').textContent=sending?'Назначаю…':'Выдать домашку';button.disabled=sending;
  onChange();
 }
 function toggle(id,enable=false){if(!allowed||sending||!exercises.has(id))return;if(enable)mode=true;edited();
  if(selected.has(id))selected.delete(id);else if(selected.size<100)selected.add(id);else message('В одну домашку можно добавить до 100 упражнений.');
  update();
 }
 async function loadStudents(){
  message('Загружаю учеников…');$('#assignReload').disabled=true;
  try{const list=await SM.myStudents();const previous=$('#assignStudent').value;students=Array.isArray(list)?list.filter(s=>s.student_id):[];
   $('#assignStudent').innerHTML='<option value="">Выбери ученика</option>'+students.map(s=>`<option value="${esc(s.student_id)}">${esc(s.name||'Без имени')}</option>`).join('');
   if(students.some(s=>s.student_id===previous))$('#assignStudent').value=previous;
   message(students.length?'Нажимай на номера упражнений на странице или в списке. Выбор сохранится при смене страницы и книги.':'В классе пока нет учеников. Добавь ученика в «Моём классе», затем обнови список.');
  }catch{message('Не удалось загрузить учеников. Нажми «Обновить список».');}
  finally{update();}
 }
 async function send(ev){
  ev.preventDefault();if(!allowed||sending)return;
  const sid=$('#assignStudent').value,student=students.find(s=>s.student_id===sid),ids=[...selected];
  let note;try{if(!student)throw Error('Выбери ученика.');note=H.makeNote(ids,$('#assignDue').value,$('#assignComment').value.trim());}catch(e){message(e.message);return;}
  sending=true;update();message('Назначаю домашку…');
  try{
   const user=await SM.getUser();if(!user||user.id!==owner)throw Error('Аккаунт изменился. Обнови страницу перед назначением.');
   const profile=await SM.myProfile();if(!['teacher','admin'].includes(profile?.role))throw Error('Назначать домашку может преподаватель.');
   const current=await SM.myStudents();if(!current?.some(s=>s.student_id===sid))throw Error('Ученик не найден в твоём классе. Обнови список учеников.');
   const r=await SM.addHW(sid,'focus-2',Number(exercises.get(ids[0]).unit)||0,note);
   if(!r?.ok)throw Error(r?.error||'Не удалось назначить домашку. Попробуй ещё раз.');
   selected.clear();message(`Домашка назначена: ${student.name||'ученик'} · ${ids.length} упр. Она появится в «Моей домашке» ученика.`);
   $('#assignResultLink').href='../teacher-class.html?s='+encodeURIComponent(sid);$('#assignResultLink').hidden=false;
  }catch(e){message(e.message);}
  finally{sending=false;update();}
 }
 $('#assignReview').onclick=()=>{panel.scrollIntoView({behavior:'smooth',block:'start'});$('#assignStudent').focus({preventScroll:true});};
 button.onclick=()=>{if(!allowed||sending)return;mode=!mode;update();};
 $('#assignForm').onsubmit=send;$('#assignStudent').onchange=()=>{edited();update();};$('#assignDue').oninput=edited;$('#assignComment').oninput=edited;$('#assignReload').onclick=loadStudents;
 $('#assignClear').onclick=()=>{if(sending)return;selected.clear();edited();update();};
 $('#assignPage').onclick=()=>{if(!allowed||sending)return;const ids=(getPage()?.exercises||[]).map(e=>e.id);if(new Set([...selected,...ids]).size>100){message('В одну домашку можно добавить до 100 упражнений.');return;}ids.forEach(id=>selected.add(id));edited();update();};
 return {get mode(){return allowed&&mode;},get allowed(){return allowed;},has:id=>selected.has(id),toggle,refresh:()=>{if(allowed)update();},
  async init(){const user=getUser();if(!user)return;owner=user.id;try{const p=await SM.myProfile();if(!['teacher','admin'].includes(p?.role))return;allowed=true;update();await loadStudents();}catch{/* Keep teacher controls hidden when the role cannot be verified. */}}
 };
}};
