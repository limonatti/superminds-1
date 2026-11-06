'use strict';
/* ═══════════════════════════════════════════════════════════════════
   Speakout B2+ Presentation Tool
   Работает полностью офлайн: страницы — JPEG, медиа — из папки content/
   ═══════════════════════════════════════════════════════════════════ */
const D  = window.SPEAKOUT || null;
const TB = window.SPEAKOUT_TB || {};
const KEYS = window.SPEAKOUT_KEYS || {};
const ITEMS = window.SPEAKOUT_ITEMS || {};
const CONTENT = 'content/';
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const enc = p => p.split('/').map(encodeURIComponent).join('/');

if (!D) { $('#empty').style.display = 'grid'; }
else    { $('#empty').style.display = 'none'; }

/* ---------- состояние ---------- */
const S = {
  book: 'sb', page: 1, code: null,
  tool: 'cursor', color: '#e2574c',
  zoom: 1, tx: 0, ty: 0, fit: 1,
  tab: 'lesson', marking: false,
  spot: null, drawing: false,
};
const LS = {
  get(k,d) { return window.B2Store?.get(k,d) ?? d; },
  set(k,v) { window.B2Store?.set(k,v); }
};
let INK   = LS.get('ink', {});     // "sb:12" -> [strokes]
let SPOTS = LS.get('spots', {});   // "sb:12" -> [{x,y,w,h,label,audio,type,data}]
const pkey = () => S.book + ':' + S.page;

/* ═══════════ левый список уроков ═══════════ */
function buildRail() {
  if (!D) return;
  const r = $('#rail'); let h = '';
  h += '<div class="rsec"><h4>Юниты</h4>';
  for (let u = 1; u <= 8; u++) {
    h += `<details class="unit" ${u === 1 ? 'open' : ''}><summary>
            <span class="unum">${u}</span><span>Unit ${u}</span>
            <span class="uname">${D.unitNames[u] || ''}</span></summary>`;
    D.lessons.filter(l => l.unit === u).forEach(l => {
      h += `<button class="les" data-code="${l.code}">
              <span class="dot"></span><b>${l.code}</b>${l.title}
              <span class="pp">с.${l.sb}</span></button>`;
    });
    const rv = D.reviews[u];
    if (rv) h += `<button class="les" data-sb="${rv.sbIdx}">
                    <span class="dot"></span>Unit ${u} Review<span class="pp">с.${rv.sb}</span></button>`;
    h += '</details>';
  }
  h += '</div><div class="rsec"><h4>Разделы книги</h4>';
  D.extras.forEach(e => {
    h += `<button class="qbtn" data-sb="${e.sbIdx}">${e.title}<span class="pp">с.${e.sb}</span></button>`;
  });
  h += `<button class="qbtn" data-wbkeys="1">Workbook: ответы и скрипты</button></div>`;
  h += '<div class="rsec"><h4>Ещё</h4>' +
       '<button class="qbtn" data-open="files">Фотокопии, тесты, PDF</button>' +
       '<button class="qbtn" id="expBtn">Экспорт разметки и заметок</button>' +
       '<button class="qbtn" id="impBtn">Импорт разметки</button></div>';
  r.innerHTML = h;

  r.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.code) { openLesson(b.dataset.code); }
    else if (b.dataset.sb) { S.code = null; setBook('sb'); goPage(+b.dataset.sb + 1); }
    else if (b.dataset.wbkeys) { const target=S.book==='wb'?Math.max(2,Math.min(65,S.page)):2;setBook('wb');goPage(target);setTab('ans'); }
    else if (b.dataset.open) { setTab(b.dataset.open); }
    else if (b.id === 'expBtn') exportData();
    else if (b.id === 'impBtn') importData();
    if (b.dataset.code || b.dataset.sb || b.dataset.wbkeys) closeDrawers();
  });
  markRail();
}
function markRail() {
  $$('#rail .les').forEach(b => {
    b.classList.toggle('on', b.dataset.code && b.dataset.code === S.code);
    if (b.dataset.code) {
      const l = lesson(b.dataset.code);
      const k = 'sb:' + (l.sbIdx + 1);
      b.classList.toggle('hasmark', !!(SPOTS[k] && SPOTS[k].length) || !!(INK[k] && INK[k].length));
    }
  });
}
const lesson = c => D.lessons.find(l => l.code === c);

/* ═══════════ страницы ═══════════ */
function setBook(b) {
  S.book = b = b === 'wb' ? 'wb' : 'sb';
  $('#bSB').classList.toggle('on', b === 'sb');
  $('#bWB').classList.toggle('on', b === 'wb');
  $('#pgTotal').textContent = '/ ' + D.pages[b];
}
function goPage(n) {
  const max = D.pages[S.book];
  S.page = Math.max(1, Math.min(max, Number.isFinite(n) ? Math.trunc(n) : 1));
  S.activeSpot = null;
  S.code = lessonAt(S.book, S.page)?.code || null;
  const pageVersion=window.SPEAKOUT_PAGE_VERSIONS?.[pkey()];
  const src = 'pages/' + S.book + '/' + String(S.page).padStart(3, '0') + '.jpg'+(pageVersion?'?v='+pageVersion:'');
  const img = $('#pageImg');
  img.onload = () => { $('#empty').style.display = 'none'; sizeInk(); fit(); drawInk(); renderSpots(); };
  img.onerror = () => { $('#empty').style.display = 'grid'; };
  img.src = src;
  $('#pgInput').value = S.page;
  const printed = S.page - 1 + D.pages[S.book === 'sb' ? 'sbOffset' : 'wbOffset'];
  img.alt = (S.book === 'sb' ? 'Student’s Book' : 'Workbook') + ', страница ' + printed;
  $('#bPrev').disabled = S.page === 1;
  $('#bNext').disabled = S.page === max;
  $('#crumb').innerHTML = (S.code ? '<b>' + S.code + '</b> ' + lesson(S.code).title + ' · ' : '') +
                          'печатная стр. ' + printed;
  markRail(); renderPanel();
  LS.set('last', {book: S.book, page: S.page});
  const url = new URL(location.href);
  ['unit', 'u', 'lesson', 'sheet', 'section'].forEach(k => url.searchParams.delete(k));
  url.searchParams.set('book', S.book); url.searchParams.set('page', printed);
  history.replaceState(null, '', url);
  if (window.B2Store?.ready) window.B2Store.openPage(pkey());
}
function lessonAt(book, sheet) {
  const printed = sheet - 1 + D.pages[book === 'sb' ? 'sbOffset' : 'wbOffset'];
  const candidates = D.lessons.filter(l => l[book] <= printed);
  const l = candidates[candidates.length - 1];
  if (!l) return null;
  const end = book === 'sb' ? D.reviews[l.unit]?.sb : l.wb + (l.letter === 'D' ? 1 : 2);
  return printed < end ? l : null;
}
function openLesson(code) {
  const l = lesson(code); if (!l) return;
  S.code = code;
  setBook('sb'); goPage(l.sbIdx + 1);
  setTab('lesson');
}
function openLessonWB(code) {
  const l = lesson(code); if (!l) return;
  S.code = code;
  setBook('wb'); goPage(l.wbIdx + 1);
}

/* ═══════════ зум и панорама ═══════════ */
function applyT() {
  $('#wrap').style.transform =
    `translate(${S.tx}px,${S.ty}px) scale(${S.zoom}) translate(-50%,-50%)`;
}
function fit() {
  const img = $('#pageImg'), st = $('#stage');
  if (!img.naturalWidth) return;
  const pad = 24;
  S.fit = Math.min((st.clientWidth - pad) / img.naturalWidth,
                   (st.clientHeight - pad) / img.naturalHeight);
  img.style.width = img.naturalWidth + 'px';
  img.style.height = img.naturalHeight + 'px';
  const w = $('#wrap');
  w.style.width = img.naturalWidth + 'px';
  w.style.height = img.naturalHeight + 'px';
  S.zoom = S.fit; S.tx = 0; S.ty = 0; applyT();
  layoutOverlays();
}
function zoomBy(f, cx, cy) {
  const st = $('#stage').getBoundingClientRect();
  cx = cx ?? st.width / 2; cy = cy ?? st.height / 2;
  const ox = cx - st.width / 2 - S.tx, oy = cy - st.height / 2 - S.ty;
  const nz = Math.max(S.fit * .5, Math.min(S.fit * 8, S.zoom * f));
  const k = nz / S.zoom;
  S.tx -= ox * (k - 1); S.ty -= oy * (k - 1); S.zoom = nz; applyT();
}
function focusRect(r) { // r в долях 0..1
  const img = $('#pageImg'), st = $('#stage');
  const pw = img.naturalWidth, ph = img.naturalHeight;
  const w = r.w * pw, h = r.h * ph;
  const z = Math.min((st.clientWidth - 60) / w, (st.clientHeight - 60) / h, S.fit * 6);
  S.zoom = z;
  const cx = (r.x + r.w / 2) * pw - pw / 2, cy = (r.y + r.h / 2) * ph - ph / 2;
  S.tx = -cx * z; S.ty = -cy * z; applyT();
}

/* ═══════════ рисование ═══════════ */
function sizeInk() {
  const img = $('#pageImg'), c = $('#ink');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  c.style.width = img.naturalWidth + 'px'; c.style.height = img.naturalHeight + 'px';
}
function drawInk() {
  const c = $('#ink'), g = c.getContext('2d');
  g.clearRect(0, 0, c.width, c.height);
  (INK[pkey()] || []).forEach(s => {
    g.save();
    g.globalAlpha = s.hl ? .32 : 1;
    g.strokeStyle = s.c; g.lineWidth = s.w; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath();
    s.p.forEach((p, i) => i ? g.lineTo(p[0] * c.width, p[1] * c.height)
                            : g.moveTo(p[0] * c.width, p[1] * c.height));
    g.stroke(); g.restore();
  });
}
function saveInk() { LS.set('ink', INK); markRail(); }

/* координаты указателя в долях страницы */
function ptOf(e) {
  const r = $('#pageImg').getBoundingClientRect();
  return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height].map(n => Math.max(0, Math.min(1, n)));
}

(function pointerLogic() {
  const stage = $('#stage'); let cur = null, pan = null, selBox = null;
  stage.addEventListener('pointerdown', e => {
    if(window.B2Store&&!B2Store.ready)return;
    if (e.target.closest('.shade, #light, .spot')) return;
    S.drawing=true;
    stage.setPointerCapture(e.pointerId);
    if (S.marking) {
      const p = ptOf(e); selBox = { x: p[0], y: p[1] };
      const s = $('#sel'); s.style.display = 'block';
      return;
    }
    if (S.tool === 'cursor') { pan = { x: e.clientX - S.tx, y: e.clientY - S.ty }; return; }
    if (S.tool === 'erase') { eraseAt(ptOf(e)); cur = 'erasing'; return; }
    cur = { c: S.color, w: S.tool === 'hl' ? 26 : 4, hl: S.tool === 'hl', p: [ptOf(e)] };
    (INK[pkey()] = INK[pkey()] || []).push(cur);
  });
  stage.addEventListener('pointermove', e => {
    if (selBox) {
      const p = ptOf(e);
      const x1 = Math.min(selBox.x, p[0]), y1 = Math.min(selBox.y, p[1]);
      const s = $('#sel');
      s.style.left = x1 * $('#pageImg').naturalWidth + 'px';
      s.style.top = y1 * $('#pageImg').naturalHeight + 'px';
      s.style.width = Math.abs(p[0] - selBox.x) * $('#pageImg').naturalWidth + 'px';
      s.style.height = Math.abs(p[1] - selBox.y) * $('#pageImg').naturalHeight + 'px';
      selBox.x2 = p[0]; selBox.y2 = p[1]; return;
    }
    if (pan) { S.tx = e.clientX - pan.x; S.ty = e.clientY - pan.y; applyT(); return; }
    if (cur === 'erasing') { eraseAt(ptOf(e)); return; }
    if (cur) { cur.p.push(ptOf(e)); drawInk(); }
  });
  stage.addEventListener('pointerup', e => {
    if(!cur&&!pan&&!selBox)return;
    S.drawing=false;
    if (selBox) {
      const x1 = Math.min(selBox.x, selBox.x2 ?? selBox.x), y1 = Math.min(selBox.y, selBox.y2 ?? selBox.y);
      const w = Math.abs((selBox.x2 ?? selBox.x) - selBox.x), h = Math.abs((selBox.y2 ?? selBox.y) - selBox.y);
      $('#sel').style.display = 'none'; selBox = null;
      if (w > .02 && h > .01) editSpot({ x: x1, y: y1, w, h }, -1);
      return;
    }
    if (cur && cur !== 'erasing') saveInk();
    if (cur === 'erasing') saveInk();
    cur = null; pan = null;
    if(window.B2Store)refreshAccountMarks();
  });
  stage.addEventListener('pointercancel',()=>{S.drawing=false;if(cur)saveInk();cur=null;pan=null;selBox=null;$('#sel').style.display='none';});
  stage.addEventListener('wheel', e => {
    if (!e.ctrlKey && !e.metaKey && Math.abs(e.deltaY) < 2) return;
    e.preventDefault();
    const st = stage.getBoundingClientRect();
    zoomBy(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - st.left, e.clientY - st.top);
  }, { passive: false });
})();
function eraseAt(p) {
  const arr = INK[pkey()] || [];
  INK[pkey()] = arr.filter(s => !s.p.some(q => Math.hypot(q[0] - p[0], (q[1] - p[1]) * 1.4) < .022));
  drawInk();
}

/* ═══════════ хотспоты ═══════════ */
function renderSpots() {
  const box = $('#spots'); const img = $('#pageImg');
  box.innerHTML = '';
  (window.SPEAKOUT_EXERCISES?.[pkey()] || []).forEach(s=>{
    const d=document.createElement('button');d.type='button';d.className='spot book-exercise';
    d.setAttribute('aria-label','Открыть упражнение '+s.label);
    Object.assign(d.style,{left:s.x*img.naturalWidth+'px',top:s.y*img.naturalHeight+'px',width:s.w*img.naturalWidth+'px',height:s.h*img.naturalHeight+'px'});
    d.innerHTML='<span class="tag">'+esc(s.label)+'</span>';
    d.onclick=ev=>{ev.stopPropagation();window.B2Exercises?.open(s,pkey());};box.appendChild(d);
  });
  (SPOTS[pkey()] || []).forEach((s, i) => {
    const d = document.createElement('div');
    d.className = 'spot';
    d.setAttribute('role', 'button'); d.tabIndex = 0;
    d.setAttribute('aria-label', 'Упражнение ' + (s.label || i + 1));
    d.style.left = s.x * img.naturalWidth + 'px';
    d.style.top = s.y * img.naturalHeight + 'px';
    d.style.width = s.w * img.naturalWidth + 'px';
    d.style.height = s.h * img.naturalHeight + 'px';
    d.innerHTML = '<span class="tag">' + esc(s.label || '?') + '</span>';
    d.onclick = ev => { ev.stopPropagation(); S.marking ? editSpot(s, i) : openSpot(i); };
    box.appendChild(d);
  });
}
function editSpot(rect, idx) {
  const list = SPOTS[pkey()] || [];
  const cur = idx >= 0 ? list[idx] : Object.assign({}, rect, { label: '', audio: '', type: 'none', data: '' });
  S.spot = { idx, rect: idx >= 0 ? list[idx] : rect, cur };
  $('#spLabel').value = cur.label || '';
  $('#spType').value = cur.type || 'none';
  $('#spData').value = cur.data || '';
  const l = S.code ? lesson(S.code) : null;
  const tracks = l ? (S.book === 'wb' ? l.wbAudio : l.audio) : [];
  $('#spAudio').innerHTML = '<option value="">— нет —</option>' +
    tracks.map(t => `<option value="${t.path}" ${cur.audio === t.path ? 'selected' : ''}>${t.track}</option>`).join('');
  $('#spDel').style.display = idx >= 0 ? '' : 'none';
  hintFor($('#spType').value);
  open$('#mdSpot');
}
const HINTS = {
  none: 'Клик по рамке просто приблизит упражнение и покажет ответы из книги учителя.',
  reveal: 'По одному ответу в строке. На уроке открываются кликом по очереди.',
  gap: 'Пишите текст, а правильные слова — в фигурных скобках: I {had been} waiting.',
  match: 'Пары через вертикальную черту, одна пара в строке: hit it off | подружиться',
  quiz: 'Блоки: вопрос, затем варианты со звёздочкой у правильного.\n\nWhat time?\n*half past six\nquarter to six'
};
function hintFor(t) { $('#spHint').textContent = HINTS[t] || ''; }
$('#spType').onchange = e => hintFor(e.target.value);
$('#spSave').onclick = () => {
  const list = SPOTS[pkey()] = SPOTS[pkey()] || [];
  const o = Object.assign({}, S.spot.rect, {
    label: $('#spLabel').value.trim(), audio: $('#spAudio').value,
    type: $('#spType').value, data: $('#spData').value
  });
  if (S.spot.idx >= 0) list[S.spot.idx] = o; else list.push(o);
  LS.set('spots', SPOTS); renderSpots(); markRail(); close$('#mdSpot');
};
$('#spDel').onclick = () => {
  const list = SPOTS[pkey()] || [];
  if (S.spot.idx >= 0) list.splice(S.spot.idx, 1);
  LS.set('spots', SPOTS); renderSpots(); close$('#mdSpot');
};
$('#spFill').onclick = () => {
  const label = $('#spLabel').value.trim();
  const txt = findAnswer(label);
  if (!txt) { alert('Не нашла ответ для «' + label + '» в этом уроке.'); return; }
  $('#spData').value = txt;
  if ($('#spType').value === 'none') { $('#spType').value = 'reveal'; hintFor('reveal'); }
};

function openSpot(i) {
  const s = (SPOTS[pkey()] || [])[i]; if (!s) return;
  S.activeSpot = s;
  window.B2Exercises?.open(s, pkey());
}

/* поиск ответа по номеру упражнения в текущем уроке */
function findAnswer(label) {
  if (S.book === 'wb') return '';
  if (!S.code) return '';
  const items = ITEMS[S.code] || [];
  if (!label) return items.map(i => (i.label ? i.label + ' ' : '') + i.text).join('\n\n').slice(0, 1500);
  const L = label.trim().toUpperCase();
  let hit = items.find(i => i.label === L);
  if (!hit) hit = items.find(i => i.label && i.label.replace(/[A-E]$/, '') === L.replace(/[A-E]$/, '')
                                  && i.label[0] === L[0]);
  if (hit) return hit.text;
  const src = ((TB[S.code] || {}).answers || []).join('\n\n');
  const re = new RegExp('(^|\\n)\\s*' + L.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
                        '\\b[\\s\\S]{0,500}?(?=\\n\\n|$)', 'i');
  const m = src.match(re);
  return m ? m[0].trim() : '';
}

/* ═══════════ правая панель ═══════════ */
function setTab(t) {
  if(t==='ex'){
    const ex=S.activeSpot || window.SPEAKOUT_EXERCISES?.[pkey()]?.[0];
    if(ex)window.B2Exercises?.open(ex,pkey());
    else alert('На этой странице нет готовой области задания. Нажмите «Разметка» и обведите нужное упражнение.');
    return;
  }
  S.tab = t;
  $$('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
  renderPanel();
}
$('#tabs').addEventListener('click', e => {
  const b = e.target.closest('button'); if (b) setTab(b.dataset.tab);
});

function renderPanel() {
  if (!D) return;
  const b = $('#pbody'); const l = S.code ? lesson(S.code) : null;
  if (S.tab === 'lesson') b.innerHTML = viewLesson(l);
  else if (S.tab === 'audio') b.innerHTML = viewAudio(l);
  else if (S.tab === 'ans') b.innerHTML = viewAnswers(l);
  else if (S.tab === 'ex') b.innerHTML = viewExercise();
  else b.innerHTML = viewFiles();
  wirePanel();
  $('#pbody').querySelectorAll('[data-a], [data-reveal], [data-rv], [data-gap], [data-l], [data-r], [data-q]').forEach(el => {
    if (!el.matches('button, a')) { el.setAttribute('role', 'button'); el.tabIndex = 0; }
  });
}

function viewLesson(l) {
  if (!l) return `<div class="card"><h5>Урок не выбран</h5>
    <div class="mini">Выберите урок слева — сюда подтянутся аудио, видео, ответы и фотокопии.</div></div>`;
  const v = l.video.map(x => `<button class="btn blu" data-video="${x.path}" data-t="${x.kind}"
       style="width:100%;margin-bottom:5px">▶ ${x.kind}</button>`).join('') || '';
  const tr = l.audio.slice(0, 4).map(a =>
      `<span class="pill" data-a="${a.path}" style="cursor:pointer">♪ ${a.track}</span>`).join('');
  const tb = TB[l.code];
  return `
  <div class="card">
    <h5>Урок ${l.code}</h5>
    <div style="font-size:17px;font-weight:700;margin-bottom:4px">${l.title}</div>
    <div class="mini">Student's Book c. ${l.sb} · Workbook c. ${l.wb} · Teacher's Book c. ${l.tb}</div>
    <div class="row" style="margin-top:9px">
      <button class="btn pri" data-go="sb">Открыть SB</button>
      <button class="btn" data-go="wb">Открыть WB</button>
    </div>
  </div>
  ${v ? `<div class="card"><h5>Видео</h5>${v}</div>` : ''}
  <div class="card"><h5>Аудио урока</h5>${tr || '<span class="mini">нет</span>'}
    <div class="mini" style="margin-top:6px">Все треки — во вкладке «Аудио».</div></div>
  ${l.pc.length ? `<div class="card"><h5>Фотокопии</h5>${
      l.pc.map(p => `<a class="btn" style="width:100%;margin-bottom:5px"
        href="${CONTENT + enc(p.path)}" target="_blank">${p.type}</a>`).join('')}</div>` : ''}
  ${tb ? `<div class="card"><h5>План урока (Teacher's Book)</h5>
      <div class="ans" style="max-height:340px;overflow:auto">${esc(tb.pages[0].text.slice(0, 1600))}</div>
      ${D.media.docs.tb ? `<a class="btn" style="margin-top:8px" target="_blank"
         href="${CONTENT + enc(D.media.docs.tb)}#page=${tb.start}">Открыть TB PDF на с. ${tb.start}</a>` : ''}
      </div>` : ''}`;
}

function viewAudio(l) {
  const grp = (arr, t) => arr.length ? `<div class="card"><h5>${t}</h5>` + arr.map(a =>
      `<div class="trk" data-a="${a.path}"><span class="n">${a.track}</span>
        <span class="k">${a.kind || ''}</span></div>`).join('') + '</div>' : '';
  if (!l) return grp(D.media.classAudio, 'Аудио Student’s Book') + grp(D.media.wbAudio, 'Аудио Workbook');
  const les = l.audio.filter(a => a.kind === 'lesson');
  const ext = l.audio.filter(a => a.kind !== 'lesson');
  return grp(les, 'Аудио урока ' + l.code) + grp(ext, 'Vocabulary / Mediation bank') +
         grp(l.wbAudio.map(a => ({ track: a.track, path: a.path, kind: 'WB' })), 'Workbook');
}

function viewAnswers(l) {
  const exercises=window.SPEAKOUT_EXERCISES?.[pkey()]||[];
  const saved=window.B2Store?.answers(pkey())||{};
  const printed=S.page+(S.book==='sb'?1:2);
  return `<div class="card"><h5>Ответы ${S.book==='sb'?"Student’s Book":'Workbook'} · стр. ${printed}</h5><p class="mini">Нажмите на упражнение на странице, заполните ответы и нажмите «Проверить» или «Сохранить ответы». После попытки здесь появится ключ, если он доступен.</p></div>`+
    exercises.filter(e=>e.key).map(e=>window.B2ExercisePolicy?.attempted(e,saved)
      ? `<details class="card"><summary>Упражнение ${esc(e.label)}</summary><p class="mini" style="white-space:pre-wrap">${esc(e.key)}</p></details>`
      : `<div class="card"><b>Упражнение ${esc(e.label)}</b><p class="mini">Ключ доступен после заполнения и проверки ответов.</p></div>`).join('');
}

function viewExercise() {
  const s = S.activeSpot;
  if (!s) return `<div class="card"><h5>Упражнение</h5><div class="mini">
      Нажмите «Разметка» вверху и обведите упражнение на странице — потом клик по рамке
      будет приближать его и открывать ответы и интерактив.</div></div>`;
  let body = '';
  if (s.type === 'reveal') {
    body = s.data.split('\n').filter(x => x.trim()).map((x, i) =>
      `<div class="rvl" data-rv><span class="num">${i + 1}</span><span class="val">${esc(x)}</span></div>`).join('') +
      `<div class="row"><button class="btn" data-allrv>Показать все</button></div>`;
  } else if (s.type === 'gap') {
    body = `<div class="ans" style="font-size:15px;line-height:2">${
      esc(s.data).replace(/\{([^}]*)\}/g, (m, w) => `<span class="gap" data-gap>${esc(w)}</span>`)}</div>
      <div class="row" style="margin-top:9px"><button class="btn" data-allgap>Показать все</button></div>`;
  } else if (s.type === 'match') {
    const pairs = s.data.split('\n').map(x => x.split('|').map(y => y.trim())).filter(x => x.length === 2);
    const right = pairs.map((p, i) => ({ t: p[1], i })).sort(() => Math.random() - .5);
    body = '<div class="row" style="align-items:flex-start;gap:9px">' +
      '<div style="flex:1">' + pairs.map((p, i) =>
        `<div class="mitem" data-l="${i}">${esc(p[0])}</div>`).join('') + '</div>' +
      '<div style="flex:1">' + right.map(p =>
        `<div class="mitem" data-r="${p.i}">${esc(p.t)}</div>`).join('') + '</div></div>';
  } else if (s.type === 'quiz') {
    const blocks = s.data.split(/\n\s*\n/).filter(x => x.trim());
    body = blocks.map(bl => {
      const lines = bl.split('\n').filter(x => x.trim());
      const q = lines[0];
      return `<div class="card"><h5>${esc(q)}</h5>` + lines.slice(1).map(o =>
        `<div class="mitem" data-q="${o.trim().startsWith('*') ? 1 : 0}">${
          esc(o.replace(/^\*/, '').trim())}</div>`).join('') + '</div>';
    }).join('');
  } else {
    const t = findAnswer(s.label);
    body = t ? `<div class="ans blur" data-reveal>${esc(t)}</div>`
              : '<div class="mini">Ответ не найден автоматически — откройте вкладку «Ответы».</div>';
  }
  return `<div class="card"><h5>Упражнение ${esc(s.label || '')}</h5>
      <div class="row">
        ${s.audio ? `<button class="btn blu" data-a="${s.audio}">▶ трек</button>` : ''}
        <button class="btn" data-unfocus>Вся страница</button>
      </div></div>
    <div class="card">${body}</div>`;
}

function viewFiles() {
  const m = D.media;
  const list = (arr, t, f) => `<div class="card"><h5>${t}</h5>` +
    arr.map(f).join('') + '</div>';
  const groups = {};
  m.tests.forEach(t => (groups[t.group] = groups[t.group] || []).push(t));
  return `
  <div class="card"><h5>Книги</h5>
    ${['sb', 'wb', 'tb', 'sbKeys', 'audioscripts', 'wbScripts', 'videoscripts', 'pcKeys'].filter(k => m.docs[k]).map(k =>
      `<a class="btn" style="width:100%;margin-bottom:5px" target="_blank"
          href="${CONTENT + enc(m.docs[k])}">${
        ({sb:"Student's Book PDF",wb:'Workbook PDF',tb:"Teacher's Book PDF",
          sbKeys:'Answer Key PDF',audioscripts:'Student’s Book: аудиоскрипты',wbScripts:'Workbook: аудиоскрипты',videoscripts:'Videoscripts PDF',pcKeys:'Photocopiables: ключи'})[k]}</a>`).join('')}
  </div>
  <div class="card"><h5>Видео BBC</h5>${m.video.map(v =>
    `<button class="btn" style="width:100%;margin-bottom:5px" data-video="${v.path}"
       data-t="Unit ${v.unit} · ${v.kind}">Unit ${v.unit} · ${v.kind}</button>`).join('')}</div>
  <div class="card"><h5>Фотокопии</h5>${m.pc.map(p =>
    `<a class="pill" style="cursor:pointer" target="_blank"
       href="${CONTENT + enc(p.path)}">${p.code} ${p.type}</a>`).join('')}</div>
  ${Object.keys(groups).map(g => `<div class="card"><h5>${esc(g)}</h5>` +
     groups[g].map(t => `<a class="btn" style="width:100%;margin-bottom:4px;justify-content:flex-start"
        target="_blank" href="${CONTENT + enc(t.path)}">${esc(t.name)}</a>`).join('') + '</div>').join('')}`;
}

function wirePanel() {
  const b = $('#pbody');
  b.onclick = e => {
    const t = e.target;
    const a = t.closest('[data-a]');
    if (a) {
      const n = a.querySelector('.n');
      playTrack(a.dataset.a, 'Трек ' + (n ? n.textContent : a.textContent).trim());
      return;
    }
    if (t.closest('[data-allans]')) { $$('#pbody .ans').forEach(x => x.classList.remove('blur')); return; }
    if (t.closest('[data-hideans]')) { $$('#pbody .ans').forEach(x => x.classList.add('blur')); return; }
    const sf = t.closest('[data-spotfill]');
    if (sf) {
      S.activeSpot = { x:.04,y:.04,w:.92,h:.9,label: sf.dataset.spotfill, type: 'reveal', audio: '',
                       data: findAnswer(sf.dataset.spotfill) };
      setTab('ex'); return;
    }
    const v = t.closest('[data-video]'); if (v) { openVideo(v.dataset.video, v.dataset.t); return; }
    const g = t.closest('[data-go]');
    if (g) { g.dataset.go === 'sb' ? openLesson(S.code) : openLessonWB(S.code); return; }
    if (t.closest('[data-reveal]')) { t.closest('[data-reveal]').classList.toggle('blur'); return; }
    const rv = t.closest('[data-rv]'); if (rv) { rv.classList.toggle('open'); return; }
    if (t.closest('[data-allrv]')) { $$('#pbody .rvl').forEach(x => x.classList.add('open')); return; }
    const gp = t.closest('[data-gap]'); if (gp) { gp.classList.toggle('show'); return; }
    if (t.closest('[data-allgap]')) { $$('#pbody .gap').forEach(x => x.classList.add('show')); return; }
    if (t.closest('[data-unfocus]')) { fit(); return; }
    const q = t.closest('[data-q]');
    if (q) { q.classList.add(q.dataset.q === '1' ? 'good' : 'bad'); return; }
    const li = t.closest('[data-l]'), ri = t.closest('[data-r]');
    if (li || ri) {
      const el = li || ri;
      const side = li ? 'l' : 'r';
      const sel = b.querySelector('.mitem.sel');
      if (sel && sel !== el) {
        const ok = sel.dataset.l !== undefined ? sel.dataset.l === el.dataset.r
                                               : sel.dataset.r === el.dataset.l;
        if (ok) { sel.classList.remove('sel'); sel.classList.add('good'); el.classList.add('good'); }
        else { el.classList.add('bad'); setTimeout(() => el.classList.remove('bad'), 400);
               sel.classList.remove('sel'); }
      } else el.classList.toggle('sel');
    }
  };
}
const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/* ═══════════ аудиоплеер ═══════════ */
const AU = new Audio(); let abA = null, abB = null, curPath = '';
function playTrack(path, title) {
  if (!path) return;
  if (curPath !== path) { curPath = path; AU.src = CONTENT + enc(path); abA = abB = null; upAB(); }
  $('#pTitle').textContent = title || path.split('/').pop();
  $('#player').classList.add('on');
  AU.play().catch(() => {});
}
AU.addEventListener('error', () => {
  $('#pTitle').textContent = 'Не удалось загрузить аудио. Проверьте соединение и выберите трек ещё раз.';
});
AU.addEventListener('timeupdate', () => {
  const d = AU.duration || 0;
  $('#barIn').style.width = (AU.currentTime / d * 100 || 0) + '%';
  $('#pTime').textContent = fmt(AU.currentTime) + ' / ' + fmt(d);
  if (abA != null && abB != null && AU.currentTime > abB) AU.currentTime = abA;
});
AU.addEventListener('play', () => $('#pPlay').innerHTML =
  '<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>');
AU.addEventListener('pause', () => $('#pPlay').innerHTML =
  '<svg viewBox="0 0 24 24"><path d="M7 4l12 8-12 8z" fill="currentColor" stroke="none"/></svg>');
const fmt = t => isFinite(t) ? Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0') : '0:00';
$('#pPlay').onclick = () => { if (AU.src) AU.paused ? AU.play().catch(() => {}) : AU.pause(); };
$('#pBack').onclick = () => AU.currentTime = Math.max(0, AU.currentTime - 5);
$('#pFwd').onclick  = () => AU.currentTime = Math.min(AU.duration || 0, AU.currentTime + 5);
$('#bar').onclick = e => {
  const r = e.currentTarget.getBoundingClientRect();
  AU.currentTime = (e.clientX - r.left) / r.width * (AU.duration || 0);
};
const RATES = [0.75, 0.9, 1, 1.15, 1.35]; let ri = 2;
$('#pRate').onclick = () => { ri = (ri + 1) % RATES.length; AU.playbackRate = RATES[ri];
  $('#pRate').textContent = RATES[ri].toFixed(2).replace(/0$/, '') + '×'; };
$('#pLoop').onclick = () => {
  if (abA == null) { abA = AU.currentTime; $('#pLoop').classList.add('on'); $('#pLoop').textContent = 'A…'; }
  else if (abB == null) { if (AU.currentTime <= abA + .25) return; abB = AU.currentTime; $('#pLoop').textContent = 'A–B'; }
  else { abA = abB = null; $('#pLoop').classList.remove('on'); $('#pLoop').textContent = 'A–B'; }
  upAB();
};
function upAB() {
  const e = $('#barAB'); const d = AU.duration || 1;
  if (abA != null && abB != null) {
    e.style.display = 'block'; e.style.left = abA / d * 100 + '%';
    e.style.width = (abB - abA) / d * 100 + '%';
  } else e.style.display = 'none';
}

/* ═══════════ видео ═══════════ */
function openVideo(path, title) {
  AU.pause();
  $('#vTitle').textContent = title || 'Видео';
  $('#vEl').src = CONTENT + enc(path);
  open$('#mdVideo');
}
$$('[data-vrate]').forEach(b => b.onclick = () => $('#vEl').playbackRate = +b.dataset.vrate);

/* ═══════════ модалки ═══════════ */
function open$(sel) { const d = $(sel); d.classList.add('on'); if (!d.open) d.showModal(); }
function close$(sel) {
  $(sel).classList.remove('on');
  if ($(sel).open) $(sel).close();
  const v = $(sel).querySelector('video');
  if (v) { v.pause(); v.removeAttribute('src'); v.load(); }
}
$$('.modal').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) close$('#' + m.id); });
  m.addEventListener('cancel', e => { e.preventDefault(); close$('#' + m.id); });
});

/* ═══════════ шторка ═══════════ */
(function curtain() {
  let top = 0, bot = 40;
  const upd = () => {
    $('#shTop').style.height = top + '%';
    $('#shBot').style.height = bot + '%';
  };
  upd();
  const drag = (el, set) => {
    el.querySelector('.grip').addEventListener('pointerdown', e => {
      e.preventDefault(); const st = $('#stage').getBoundingClientRect();
      const mv = ev => { set(ev.clientY, st); upd(); };
      const up = () => { document.removeEventListener('pointermove', mv);
                         document.removeEventListener('pointerup', up); };
      document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up);
    });
  };
  drag($('#shTop'), (y, st) => top = Math.max(0, Math.min(95, (y - st.top) / st.height * 100)));
  drag($('#shBot'), (y, st) => bot = Math.max(0, Math.min(95, (st.bottom - y) / st.height * 100)));
})();

/* ═══════════ прожектор ═══════════ */
let hole = { x: .25, y: .3, w: .5, h: .25 };
function layoutOverlays() {
  const st = $('#stage').getBoundingClientRect();
  const L = hole.x * st.width, T = hole.y * st.height,
        W = hole.w * st.width, H = hole.h * st.height;
  $('#hole').style.cssText = `left:${L}px;top:${T}px;width:${W}px;height:${H}px`;
  $('#mT').style.cssText = `left:0;top:0;right:0;height:${T}px`;
  $('#mB').style.cssText = `left:0;top:${T + H}px;right:0;bottom:0`;
  $('#mL').style.cssText = `left:0;top:${T}px;width:${L}px;height:${H}px`;
  $('#mR').style.cssText = `left:${L + W}px;top:${T}px;right:0;height:${H}px`;
}
(function holeDrag() {
  const h = $('#hole');
  h.addEventListener('pointerdown', e => {
    e.preventDefault(); e.stopPropagation();
    const st = $('#stage').getBoundingClientRect();
    const rz = e.target.classList.contains('rz');
    const sx = e.clientX, sy = e.clientY, o = Object.assign({}, hole);
    const mv = ev => {
      const dx = (ev.clientX - sx) / st.width, dy = (ev.clientY - sy) / st.height;
      if (rz) { hole.w = Math.max(.05, o.w + dx); hole.h = Math.max(.04, o.h + dy); }
      else { hole.x = o.x + dx; hole.y = o.y + dy; }
      layoutOverlays();
    };
    const up = () => { document.removeEventListener('pointermove', mv);
                       document.removeEventListener('pointerup', up); };
    document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up);
  });
})();

/* ═══════════ таймер ═══════════ */
let tLeft = 180, tInt = null;
function tShow() {
  const m = Math.floor(tLeft / 60), s = tLeft % 60;
  $('#timerBig').textContent = m + ':' + String(s).padStart(2, '0');
  $('#timerBig').classList.toggle('warn', tLeft <= 10);
}
function tGo() {
  clearInterval(tInt); $('#timerBig').classList.add('on'); tShow();
  tInt = setInterval(() => {
    tLeft--; tShow();
    if (tLeft <= 0) { clearInterval(tInt); beep(); setTimeout(() => $('#timerBig').classList.remove('on'), 4000); }
  }, 1000);
}
function beep() {
  try {
    const c = new (window.AudioContext || window.webkitAudioContext)();
    [0, .25, .5].forEach(d => {
      const o = c.createOscillator(), g = c.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(c.destination);
      g.gain.setValueAtTime(.0001, c.currentTime + d);
      g.gain.exponentialRampToValueAtTime(.25, c.currentTime + d + .02);
      g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + d + .18);
      o.start(c.currentTime + d); o.stop(c.currentTime + d + .2);
    });
  } catch {}
}
$$('#mdTimer [data-min]').forEach(b => b.onclick = () => { tLeft = +b.dataset.min * 60; $('#tSec').value = tLeft; tShow(); });
$('#tStart').onclick = () => { tLeft = +$('#tSec').value || 60; tGo(); close$('#mdTimer'); };
$('#tStop').onclick  = () => clearInterval(tInt);
$('#tReset').onclick = () => { clearInterval(tInt); $('#timerBig').classList.remove('on'); };

/* ═══════════ рандомайзер ═══════════ */
let used = [];
$('#names').value = LS.get('names', '');
$('#names').oninput = e => LS.set('names', e.target.value);
$('#pickGo').onclick = () => {
  let all = $('#names').value.split('\n').map(x => x.trim()).filter(Boolean);
  if (!all.length) return;
  if ($('#noRepeat').checked) {
    const left = all.filter(n => !used.includes(n));
    if (!left.length) used = [];
    all = used.length ? all.filter(n => !used.includes(n)) : all;
  }
  const n = all[Math.floor(Math.random() * all.length)];
  used.push(n);
  close$('#mdPick');
  const big = $('#pickBig'); $('#pickName').textContent = '…';
  big.classList.add('on');
  let i = 0;
  const spin = setInterval(() => {
    $('#pickName').textContent = all[Math.floor(Math.random() * all.length)];
    if (++i > 12) { clearInterval(spin); $('#pickName').textContent = n; }
  }, 70);
};
$('#pickBig').onclick = () => $('#pickBig').classList.remove('on');

/* ═══════════ счёт ═══════════ */
let TEAMS = LS.get('teams', [{ n: 'Команда 1', s: 0 }, { n: 'Команда 2', s: 0 }]);
function drawTeams() {
  $('#teams').innerHTML = TEAMS.map((t, i) => `
    <div class="team"><input value="${esc(t.n)}" data-tn="${i}">
      <button class="btn" data-td="${i}">−</button>
      <div class="sc">${t.s}</div>
      <button class="btn pri" data-tu="${i}">+</button>
      <button class="btn" data-tx="${i}">✕</button></div>`).join('');
}
$('#teams').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.tu != null) TEAMS[b.dataset.tu].s++;
  if (b.dataset.td != null) TEAMS[b.dataset.td].s--;
  if (b.dataset.tx != null) TEAMS.splice(b.dataset.tx, 1);
  LS.set('teams', TEAMS); drawTeams();
});
$('#teams').addEventListener('input', e => {
  if (e.target.dataset.tn != null) { TEAMS[e.target.dataset.tn].n = e.target.value; LS.set('teams', TEAMS); }
});
$('#addTeam').onclick = () => { TEAMS.push({ n: 'Команда ' + (TEAMS.length + 1), s: 0 }); LS.set('teams', TEAMS); drawTeams(); };
$('#zeroTeams').onclick = () => { TEAMS.forEach(t => t.s = 0); LS.set('teams', TEAMS); drawTeams(); };
drawTeams();

/* ═══════════ экспорт / импорт ═══════════ */
async function exportData() {
  let all={ink:INK,spots:SPOTS};
  try { if(window.B2Store) all=await window.B2Store.exportAll(); }
  catch { alert('Нет связи с аккаунтом. В экспорт войдут страницы, сохранённые на этом устройстве.'); }
  const blob = new Blob([JSON.stringify({ course: 'speakout-b2plus', version: 2, ...all, names: LS.get('names', ''), teams: TEAMS }, null, 1)],
                        { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'speakout-b2plus-backup.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function validateBackup(d) {
  if (!d || typeof d !== 'object' || (d.course && d.course !== 'speakout-b2plus')) throw Error('Неверный курс');
  const position = x => Number.isFinite(x) && x >= 0 && x <= 1;
  for (const kind of ['ink', 'spots']) {
    if (d[kind] === undefined) continue;
    if (!d[kind] || typeof d[kind] !== 'object' || Array.isArray(d[kind])) throw Error('Неверные данные');
    for (const [key, rows] of Object.entries(d[kind])) {
      const match = /^(sb|wb):(\d+)$/.exec(key);
      if (!match || +match[2] < 1 || +match[2] > D.pages[match[1]] || !Array.isArray(rows)) throw Error('Неверная страница');
      for (const r of rows) {
        if (!r || typeof r !== 'object') throw Error('Неверная запись');
        if (kind === 'spots') {
          if (!['none','reveal','gap','match','quiz'].includes(r.type) || ![r.x,r.y,r.w,r.h].every(position) || !r.w || !r.h ||
              r.x+r.w>1.001 || r.y+r.h>1.001 || typeof r.label !== 'string' || typeof r.data !== 'string' || typeof r.audio !== 'string') throw Error('Неверная разметка');
          if (r.audio && ![...D.media.classAudio,...D.media.wbAudio].some(a => a.path === r.audio)) throw Error('Неизвестный аудиотрек');
        } else if (!Array.isArray(r.p) || !r.p.every(p => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite)) ||
                   !Number.isFinite(r.w) || r.w <= 0 || typeof r.c !== 'string') throw Error('Неверные пометки');
      }
    }
  }
  if (d.names !== undefined && typeof d.names !== 'string') throw Error('Неверный список имён');
  if (d.teams !== undefined && (!Array.isArray(d.teams) || !d.teams.every(t => t && typeof t.n === 'string' && Number.isFinite(t.s)))) throw Error('Неверные команды');
  if(d.answers!==undefined){
    if(!d.answers||typeof d.answers!=='object'||Array.isArray(d.answers))throw Error('Неверные ответы');
    for(const [page,answers]of Object.entries(d.answers)){
      const match=/^(sb|wb):(\d+)$/.exec(page);
      if(!match||+match[2]<1||+match[2]>D.pages[match[1]]||!answers||typeof answers!=='object'||Array.isArray(answers))throw Error('Неверная страница ответов');
      for(const[id,value]of Object.entries(answers)){
        if(!/^[A-Za-z0-9:_-]{1,150}$/.test(id))throw Error('Неверное задание');
        if(id.endsWith(':_count')){if(!Number.isInteger(value)||value<1||value>40)throw Error('Неверное число ответов');}
        else if(value!==null&&typeof value!=='string'&&!(value&&typeof value.value==='string'&&typeof value.checked==='boolean'))throw Error('Неверный ответ');
      }
    }
  }
  return d;
}
function importData() {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json';
  inp.onchange = () => {
    const f = inp.files[0]; if (!f) return;
    if (f.size > 10 * 1024 * 1024) { alert('Файл больше 10 МБ. Выберите экспорт разметки Speakout B2+.'); return; }
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = validateBackup(JSON.parse(r.result));
        if (d.ink) { INK = d.ink; LS.set('ink', INK); }
        if (d.spots) { SPOTS = d.spots; LS.set('spots', SPOTS); }
        if (d.names !== undefined) { LS.set('names', d.names); $('#names').value = d.names; }
        if (d.teams) { TEAMS = d.teams; LS.set('teams', TEAMS); drawTeams(); }
        if (d.answers && window.B2Store) for(const [page,answers] of Object.entries(d.answers))
          if(/^(sb|wb):\d+$/.test(page)) for(const [id,value] of Object.entries(answers)) window.B2Store.patch(page,'answer:'+id,value,false);
        drawInk(); renderSpots(); markRail(); alert('Загружено.');
      } catch { alert('Не получилось прочитать файл.'); }
    };
    r.readAsText(f);
  };
  inp.click();
}

/* ═══════════ верхние и нижние кнопки ═══════════ */
$('#bSB').onclick = () => { setBook('sb'); goPage(S.code ? lesson(S.code).sbIdx + 1 : 1); };
$('#bWB').onclick = () => { setBook('wb'); goPage(S.code ? lesson(S.code).wbIdx + 1 : 1); };
$('#bPrev').onclick = () => goPage(S.page - 1);
$('#bNext').onclick = () => goPage(S.page + 1);
$('#pgInput').onchange = e => goPage(+e.target.value || 1);
function syncDrawers() {
  $('#bRail').setAttribute('aria-expanded', !document.body.classList.contains('no-rail'));
  $('#bPanel').setAttribute('aria-expanded', !document.body.classList.contains('no-panel'));
  requestAnimationFrame(fit);
}
function closeDrawers() {
  if (matchMedia('(max-width: 1100px)').matches) document.body.classList.add('no-rail', 'no-panel');
  syncDrawers();
}
$('#bRail').onclick = () => {
  document.body.classList.toggle('no-rail');
  if (matchMedia('(max-width: 1100px)').matches) document.body.classList.add('no-panel');
  syncDrawers();
};
$('#bPanel').onclick = () => {
  document.body.classList.toggle('no-panel');
  if (matchMedia('(max-width: 1100px)').matches) document.body.classList.add('no-rail');
  syncDrawers();
};
$('#drawerDismiss').onclick = closeDrawers;
$('#bFull').onclick = async () => {
  try { if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    else { document.body.classList.add('no-rail', 'no-panel'); syncDrawers(); }
  } catch { document.body.classList.add('no-rail', 'no-panel'); syncDrawers(); }
};
$('#bMark').onclick = () => {
  S.marking = !S.marking;
  document.body.classList.toggle('marking', S.marking);
  $('#bMark').classList.toggle('on', S.marking);
  if (S.marking) setTool('cursor');
};
$$('.dbtn[data-tool]').forEach(b => b.onclick = () => setTool(b.dataset.tool));
function setTool(t) {
  S.tool = t;
  document.body.classList.toggle('drawing-tool',t!=='cursor');
  $$('.dbtn[data-tool]').forEach(b => b.classList.toggle('on', b.dataset.tool === t));
  $('#stage').style.cursor = t === 'cursor' ? 'grab' : 'crosshair';
}
$$('.swatch').forEach(b => b.onclick = () => {
  S.color = b.dataset.color;
  $$('.swatch').forEach(x => x.classList.toggle('on', x === b));
  if (S.tool === 'cursor' || S.tool === 'erase') setTool('pen');
});
$('#bUndo').onclick = () => { (INK[pkey()] || []).pop(); saveInk(); drawInk(); };
$('#bClear').onclick = () => { INK[pkey()] = []; saveInk(); drawInk(); };
$('#bCurtain').onclick = () => { document.body.classList.toggle('curtain');
  $('#bCurtain').classList.toggle('on', document.body.classList.contains('curtain')); };
$('#bLight').onclick = () => { document.body.classList.toggle('spotlight');
  $('#bLight').classList.toggle('on', document.body.classList.contains('spotlight')); layoutOverlays(); };
$('#bZoomIn').onclick = () => zoomBy(1.25);
$('#bZoomOut').onclick = () => zoomBy(1 / 1.25);
$('#bZoomFit').onclick = () => fit();
$('#bTimer').onclick = () => open$('#mdTimer');
$('#bPick').onclick  = () => open$('#mdPick');
$('#bScore').onclick = () => { drawTeams(); open$('#mdScore'); };

/* ═══════════ клавиатура ═══════════ */
document.addEventListener('keydown', e => {
  if (e.defaultPrevented || document.querySelector('dialog[open]')) return;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); $('#bUndo').click(); return; }
  if (e.altKey && e.key.toLowerCase() === 'l') { e.preventDefault(); $('#bRail').click(); return; }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
  if ((e.key === ' ' || e.key === 'Enter') && document.activeElement.closest('button, a, summary, [role="button"]')) return;
  const k = e.key.toLowerCase();
  if (k === 'arrowright' || k === 'pagedown') goPage(S.page + 1);
  else if (k === 'arrowleft' || k === 'pageup') goPage(S.page - 1);
  else if (k === 'v') setTool('cursor');
  else if (k === 'p') setTool('pen');
  else if (k === 'h') setTool('hl');
  else if (k === 'e') setTool('erase');
  else if (k === 'c') $('#bCurtain').click();
  else if (k === 's') $('#bLight').click();
  else if (k === 't') $('#bTimer').click();
  else if (k === 'r') $('#bPick').click();
  else if (k === 'f') $('#bFull').click();
  else if (k === '0') fit();
  else if (k === ' ') { e.preventDefault(); $('#pPlay').click(); }
  else if (k === 'escape') { fit(); closeDrawers(); }
});
document.addEventListener('keydown', e => {
  const el = e.target.closest('[role="button"]');
  if (el && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); el.click(); }
});
window.addEventListener('resize', () => { fit(); layoutOverlays(); });
matchMedia('(max-width: 1100px)').addEventListener('change',e=>{if(e.matches)closeDrawers();});

/* ═══════════ старт ═══════════ */
if (D) {
  buildRail(); closeDrawers(); setTool('cursor');
  const params = new URLSearchParams(location.search), last = LS.get('last', {});
  const explicit = ['book','page','sheet','lesson','unit','u','section'].some(k => params.has(k));
  setBook(explicit ? params.get('book') : last.book);
  let sheet = explicit ? 1 : last.page || 1;
  const code = params.get('lesson') || (Math.max(1, Math.min(8, parseInt(params.get('unit') || params.get('u'), 10) || 1)) + 'A');
  if (explicit && lesson(code) && (params.has('lesson') || params.has('unit') || params.has('u'))) sheet = lesson(code)[S.book + 'Idx'] + 1;
  if (params.get('section') === 'grammar') { setBook('sb'); sheet = D.extras.find(e => e.title === 'Grammar bank').sbIdx + 1; }
  if (params.has('page')) sheet = Number(params.get('page')) - D.pages[S.book === 'sb' ? 'sbOffset' : 'wbOffset'] + 1;
  else if (params.has('sheet')) sheet = Number(params.get('sheet'));
  goPage(Number(sheet));
  layoutOverlays(); renderPanel();
}

/* Account storage starts after the page is usable; each account has its own cache. */
function refreshAccountMarks(event) {
  if(event?.accountChanged){
    S.drawing=false;S.spot=null;
    if($('#mdSpot').open)close$('#mdSpot');
    window.B2Exercises?.close();
    $('#names').value=LS.get('names','');
    TEAMS=LS.get('teams',[{n:'Команда 1',s:0},{n:'Команда 2',s:0}]);drawTeams();
  }
  if(S.drawing || $('#mdSpot').open)return;
  INK=LS.get('ink',{});SPOTS=LS.get('spots',{});
  drawInk();renderSpots();markRail();
  window.B2Exercises?.refresh();
}
if(window.SpeakoutAccountStore) {
  $('#dock').inert=true;$('#bMark').disabled=true;
  window.B2Store=new SpeakoutAccountStore({api:window.SM||{
    presentationSession:async()=>null,watchPresentationAuth:()=>()=>{}
  },storage:localStorage,onChange:refreshAccountMarks,onStatus:(state,text)=>{
    window.CourseWorkUI?.status(text);$('#saveStatus').textContent=text;$('#saveStatus').dataset.state=state;
    const modalStatus=$('#mdExercise .exercise-status');if(modalStatus)modalStatus.textContent=text;
    $('#accountLogin').hidden=!!window.B2Store?.user;
    $('#syncRetry').hidden=!['error','pending'].includes(state);
  }});
  CourseWorkUI.bind({get message(){return $('#saveStatus').textContent},flush:async()=>{await B2Store.pull();await B2Store.flush()}});
  B2Store.current=pkey();
  B2Store.start().then(()=>{
    if(!B2Store.ready)return;
    $('#dock').inert=false;$('#bMark').disabled=false;refreshAccountMarks();
    if(B2Store.guestAvailable()){
      const box=document.createElement('details'),label=document.createElement('summary'),text=document.createElement('p'),button=document.createElement('button');
      label.textContent='Прежние черновики этого браузера';text.textContent='У этих ответов нет подтверждённого владельца. Переносите их только если это ваша работа. Ответы из аккаунта останутся на месте.';
      button.textContent='Это мои черновики — перенести';button.onclick=async()=>{button.disabled=true;const ok=await B2Store.importGuest();button.disabled=!!ok;button.textContent=ok?'Черновики перенесены':'Повторить перенос';};
      box.append(label,text,button);$('#saveStatus').parentElement.append(box);
    }
  });
  $('#syncRetry').onclick=async()=>{await B2Store.pull();await B2Store.flush();};
  const sync=()=>{if(!document.hidden){B2Store.pull();B2Store.flush();}};
  window.addEventListener('online',sync);window.addEventListener('focus',sync);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)B2Store.flush();else sync();});
  setInterval(sync,30000);
  window.addEventListener('storage',e=>{
    if(e.key?.startsWith('sb-')&&e.key.endsWith('-auth-token'))window.SM?.presentationSession().then(u=>B2Store.switchUser(u));
  });
}
