/* Эта страница сама ждёт SM_ready и перерисовывается — перезагрузка не нужна */
window.SM_HANDLES_COURSE = true;


const esc = SMUI.esc, icon = SMUI.icon;
const TARGET = 4;
let PROG = {}, sel = -1;   /* -1 = все слова */
let ASSIGNED = null;       /* курс, назначенный учителем — показываем как подсказку */

function st(id){ return PROG[id] || null; }
function isLearned(id){ const p = st(id); return !!(p && p.status === "learned"); }
function isRepeat(id){ const p = st(id); return !!(p && p.status !== "learned" && (p.seen||0) > 0); }

function units(){ return window.SM_UNITS || []; }
function allWords(){ return window.SM_ALL_WORDS || []; }

/* Переключатель учебника — в шапке правой панели, там же где имя курса.
   В левой ленте юнитов ему не место: на широком экране она горизонтальная
   и выпадающий список в ней схлопывается. */
function courseSwitch(){
  const list = (window.SM_COURSES||[]).filter(c => c.ready && (window.SM_COURSE_DATA[c.id]||[]).length);
  const cur = (window.SM_COURSE||{}).id;
  /* Курс назначен учителем — менять его ученик не должен */
  if (ASSIGNED) return '<span>'+esc((window.SM_COURSE||{}).title||"")+' · от учителя</span>';
  if (list.length < 2) return '<span>'+esc((window.SM_COURSE||{}).title||"")+'</span>';
  return '<select id="crsSel" title="Мой учебник" style="border:2px solid var(--color-text);' +
      'background:var(--color-bg);color:var(--color-text);padding:6px 9px;' +
      'font:800 11px \'Archivo\',sans-serif;letter-spacing:.06em;text-transform:uppercase;max-width:230px">' +
    list.map(c => '<option value="'+esc(c.id)+'"'+(c.id===cur?" selected":"")+'>' +
      esc((c.emoji?c.emoji+" ":"")+c.title)+'</option>').join("") +
    '</select>';
}

function drawList(){
  const us = units();
  const rows = ['<button class="li'+(sel===-1?" on":"")+'" data-i="-1">' +
    '<span class="t">Все слова курса</span><span class="s">'+allWords().length+' слов</span></button>'];
  us.forEach((u,i) => {
    const ids = u.words.map((w,j) => u.id+"-"+j);
    const done = ids.filter(isLearned).length;
    rows.push('<button class="li'+(sel===i?" on":"")+'" data-i="'+i+'">' +
      '<span class="t">'+esc(u.title)+'</span>' +
      '<span class="s">'+done+' из '+ids.length+' выучено</span>' +
      '<span class="bar"><i style="width:'+(ids.length?done/ids.length*100:0)+'%"></i></span></button>');
  });
  const box = document.getElementById("uList");
  box.innerHTML = rows.join("");
  box.querySelectorAll(".li").forEach(b => b.onclick = () => { sel = +b.dataset.i; drawList(); drawPane(); });
}

/* Вешаем обработчик на выпадающий список курса (он живёт в шапке правой панели) */
function bindCourseSwitch(){
  const cs = document.getElementById("crsSel");
  if (!cs) return;
  cs.onchange = async () => {
    cs.disabled = true;
    await SM.pickCourse(cs.value);   /* выбор запоминается на сервере */
    sel = -1;
    drawList(); drawPane();
  };
}

/* Экран первого входа: ученик сам решает, какой учебник учить.
   Ничего не подставляем за него — иначе он попадёт в чужие слова. */
function drawPick(){
  const list = (window.SM_COURSES||[]).filter(c => c.ready && (window.SM_COURSE_DATA[c.id]||[]).length);
  const p = document.getElementById("pane");
  document.getElementById("uList").innerHTML = "";

  p.innerHTML =
    '<div class="pane-hd"><span>Шаг 1 · Твой учебник</span><span>учитель ещё не назначил курс</span></div>' +
    '<div class="pick"><h2>Учитель пока не назначил тебе курс</h2>' +
    '<p class="lead">Можешь выбрать учебник сам — в словаре появятся его слова. ' +
    'Когда учитель назначит курс, словарь переключится на него.</p>' +
    '<div class="grid">' + list.map(c => {
      const words = (window.SM_COURSE_DATA[c.id]||[]).reduce((a,u)=>a+(u.words||[]).length, 0);
      const units = (window.SM_COURSE_DATA[c.id]||[]).length;
      const rec = false;
      return '<button class="crd'+(rec?" rec":"")+'" data-c="'+esc(c.id)+'">' +
        '<span class="em">'+esc(c.emoji||"📘")+'</span>' +
        '<span class="t">'+esc(c.title)+'</span>' +
        '<span class="d">'+esc(c.subtitle||"")+'</span>' +
        '<span class="n">'+units+' юнитов · '+words+' слов</span>' +
        (rec ? '<span class="tag">Назначил учитель</span>' : "") +
      '</button>';
    }).join("") + '</div>' +
    '<p class="note">Не уверен, что выбрать? Спроси учителя в разделе «Сообщения».</p></div>';

  p.querySelectorAll(".crd").forEach(b => b.onclick = async () => {
    p.querySelectorAll(".crd").forEach(x => x.disabled = true);
    await SM.pickCourse(b.dataset.c);
    sel = -1;
    drawList(); drawPane();
  });
}

function say(text){
  try { if (window.SM_speak) return SM_speak(text);
    const u = new SpeechSynthesisUtterance(text); u.lang = "en-GB"; speechSynthesis.speak(u);
  } catch(e){}
}

/* ---------- Поиск слова и добавление в «Мои слова» ---------- */
let FOUND = null;

function addPanelHtml(){
  return '<div class="add">' +
    '<div class="fr">' +
      '<input class="q" id="qw" placeholder="слово или фраза — например: stubborn, get along with" autocomplete="off">' +
      '<button class="find" id="qgo">Найти</button>' +
    '</div>' +
    '<div class="hint">Впиши что угодно на английском — покажу перевод, произношение и значение. Работают и словосочетания.</div>' +
    '<div class="sug" id="qsug"></div>' +
    '<div id="qcard"></div>' +
  '</div>';
}

function cardHtml(r){
  const varHtml = (r.variants||[]).filter(v => v.en.toLowerCase() !== (r.en||"").toLowerCase())
    .slice(0,5).map(v => '<button data-v="'+esc(v.en)+'">'+esc(v.en)+' — '+esc(v.ru)+'</button>').join("");
  return '<div class="card">' +
    '<div class="top"><span class="en">'+esc(r.en)+'</span>' +
      (r.ipa ? '<span class="ipa">'+esc(r.ipa)+'</span>' : '') +
      (r.pos ? '<span class="pos">'+esc(r.pos)+'</span>' : '') +
      '<button class="snd" id="qsay">'+icon("sound",14)+' послушать</button></div>' +
    (r.img ? '<img class="pic" src="'+esc(r.img)+'" alt="">' : '') +
    '<label>Перевод — можно поправить</label>' +
    '<input id="qru" value="'+esc(r.ru||"")+'" placeholder="впиши перевод">' +
    (r.meaning ? '<div class="mean"><b>Значение:</b> '+esc(r.meaning)+'</div>' : '') +
    (r.example ? '<div class="mean"><b>Пример:</b> '+esc(r.example)+'</div>' : '') +
    '<label>Своя заметка — где встретил, свой пример</label>' +
    '<input id="qnote" placeholder="необязательно">' +
    '<div class="src">' + (r.source==="course" ? "нашлось в словах твоего курса"
                         : r.source==="auto" ? "перевод автоматический — проверь и поправь"
                         : "перевод не нашёлся — впиши сам") +
      (r.dictDown ? ' · словарь произношения не ответил, попробуй поискать ещё раз' : '') + '</div>' +
    (varHtml ? '<label>Похожее в курсе</label><div class="sug">'+varHtml+'</div>' : '') +
    '<button class="save" id="qsave">Добавить в мои слова</button>' +
    '<div class="err" id="qerr" style="display:none"></div>' +
  '</div>';
}

function bindAddPanel(){
  const q = document.getElementById("qw"), go = document.getElementById("qgo");
  if (!q || !go) return;
  const sug = document.getElementById("qsug"), card = document.getElementById("qcard");

  q.oninput = () => {
    const hits = (window.SM_lookupSuggest ? SM_lookupSuggest(q.value) : []).slice(0,6);
    sug.innerHTML = q.value.trim().length < 2 ? "" :
      hits.map(h => '<button data-v="'+esc(h.en)+'">'+esc(h.en)+' — '+esc(h.ru)+'</button>').join("");
    sug.querySelectorAll("button").forEach(b => b.onclick = () => { q.value = b.dataset.v; run(); });
  };
  q.onkeydown = e => { if (e.key === "Enter") run(); };
  go.onclick = run;

  async function run(){
    const text = q.value.trim();
    if (!text) return;
    go.disabled = true; go.textContent = "ищу…";
    card.innerHTML = '<div class="hint" style="margin-top:12px">Ищу «'+esc(text)+'»…</div>';
    try { FOUND = await SM_lookup(text); } catch(e){ FOUND = null; }
    go.disabled = false; go.textContent = "Найти";
    if (!FOUND){ card.innerHTML = '<div class="hint" style="margin-top:12px">Ничего не нашлось. Попробуй ещё раз.</div>'; return; }
    card.innerHTML = cardHtml(FOUND);
    wireCard();
  }

  function wireCard(){
    const sayBtn = document.getElementById("qsay");
    if (sayBtn) sayBtn.onclick = () => {
      if (FOUND.audio){ try { new Audio(FOUND.audio).play(); return; } catch(e){} }
      say(FOUND.en);
    };
    card.querySelectorAll(".sug button").forEach(b => b.onclick = () => { q.value = b.dataset.v; run(); });
    const save = document.getElementById("qsave");
    save.onclick = async () => {
      const err = document.getElementById("qerr");
      const ru = document.getElementById("qru").value.trim();
      if (!ru){ err.style.display="block"; err.textContent="Впиши перевод — без него слово не потренируешь."; return; }
      save.disabled = true; save.textContent = "добавляю…";
      const r = await SM_addMyWord({
        en: FOUND.en, ru: ru, note: document.getElementById("qnote").value.trim() || null,
        ipa: FOUND.ipa, meaning: FOUND.meaning, img: FOUND.img, audio: FOUND.audio,
        source: FOUND.source
      });
      save.disabled = false; save.textContent = "Добавить в мои слова";
      if (!r.ok){ err.style.display="block"; err.textContent = r.error || "Не получилось добавить"; return; }
      q.value = ""; FOUND = null;
      sel = units().findIndex(u => u.id === "own");
      drawList(); drawPane();
    };
  }
}

function drawPane(){
  const p = document.getElementById("pane");
  const us = units();
  const list = sel === -1 ? allWords()
    : (us[sel] ? us[sel].words.map((w,j) => Object.assign({ id: us[sel].id+"-"+j }, w)) : []);
  const title = sel === -1 ? "Все слова курса" : (us[sel] ? us[sel].title : "");
  const rep = list.filter(w => isRepeat(w.id));
  const done = list.filter(w => isLearned(w.id));

  p.innerHTML =
    '<div class="pane-hd"><span>Шаг 2 · '+esc(title)+'</span>'+courseSwitch()+'</div>' +
    '<div class="ink"><div><div class="k">Словарь / Vocabulary</div>' +
      '<h2>'+(rep.length ? rep.length+" слов ждут повторения" : "Всё повторено")+'</h2>' +
      '<p>'+(rep.length ? "Красным отмечены слова, которые ты уже видел, но ещё не закрепил."
                        : "Новые слова появятся здесь, как только начнёшь тренажёр.")+'</p></div>' +
      '<a class="go" href="trainer.html">'+icon("play",15)+' Карточки</a></div>' +
    '<div class="tiles">' +
      '<div class="tile"><span class="k">Всего слов</span><span class="n">'+list.length+'</span></div>' +
      '<div class="tile"><span class="k">Выучено</span><span class="n">'+done.length+'</span></div>' +
      '<div class="tile"><span class="k">На повторение</span><span class="n acc">'+rep.length+'</span></div>' +
    '</div>' +
    addPanelHtml() +
    '<div class="sect"><span>Слова / Words</span><span>красным — на повторение</span></div>' +
    (list.length ? '<div class="wgrid">' + list.map(w => {
      const p2 = st(w.id) || {};
      const lvl = Math.min(100, Math.round((p2.level||0)/TARGET*100));
      const own = String(w.id||"").indexOf("own-") === 0;
      return '<div class="w'+(isRepeat(w.id)?" rep":"")+'">' +
        '<button class="say" data-w="'+esc(w.en)+'" title="Послушать">'+icon("sound",15)+'</button>' +
        (own ? '<button class="del" data-del="'+esc(String(w.id).slice(4))+'" title="Убрать из моих слов">✕</button>' : '') +
        '<div class="en">'+esc(w.en)+'</div><div class="ru">'+esc(w.ru||"")+'</div>' +
        (own && w.note ? '<div class="mynote">'+esc(w.note)+'</div>' : '') +
        (p2.seen ? '<div class="lvl"><i style="width:'+lvl+'%"></i></div>' : "") +
        '</div>';
    }).join("") + '</div>'
    : '<div class="pick" style="padding:22px 28px"><p class="lead" style="margin:0">'+
      (sel !== -1 && us[sel] && us[sel].id === "own"
        ? 'Здесь будут слова, которые ты добавишь сам или пришлёт учитель. Найди первое через поиск выше.'
        : 'В этом юните пока нет слов.')+'</p></div>');

  p.querySelectorAll(".say").forEach(b => b.onclick = () => say(b.dataset.w));
  p.querySelectorAll("[data-del]").forEach(b => b.onclick = async () => {
    if (!confirm("Убрать слово из твоего словаря?")) return;
    await SM_removeMyWord(b.dataset.del);
    if (sel >= units().length) sel = -1;
    drawList(); drawPane();
  });
  bindAddPanel();
  bindCourseSwitch();
}

(async function(){
  SMUI.mount({ role:"student", active:"vocab" });
  /* Ждём, пока определится учебник ученика. Без этого страница успевает
     нарисоваться на курсе по умолчанию и показать чужие слова. */
  let st = {};
  try { st = (await (window.SM_ready || Promise.resolve({}))) || {}; } catch(e){}
  ASSIGNED = st.assigned || null;
  try { PROG = (await SM.loadProgress()) || {}; } catch(e){ PROG = {}; }

  /* Первый вход: курс ещё не выбран — предлагаем выбрать, а не решаем за ученика */
  if (st.needsChoice) { drawPick(); return; }

  drawList(); drawPane();
})();
