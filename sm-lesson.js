/* sm-lesson.js — урок целиком в конструкторе.
   Было: плоский список всех упражнений курса, новые сверху, порядок не виден
   и не меняется. Стало: выбранный юнит показан разделами, внутри разделов —
   задания в том порядке, в котором их увидит ученик, с перетаскиванием.

   Порядок хранится в exercises.position, раздел — в exercises.section.
   Оба поля уже были в базе, конструктор их просто не использовал.

   Подключать в builder.html ПОСЛЕ основного скрипта. */
(function () {
  "use strict";

  var NOSEC = "Без раздела";
  var STEP = 10;
  var rows = [];          // текущий урок: [{id, type, title, section, position, status, data}]
  var dragId = null;
  var busy = false;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return (s || "").replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function typeLabel(t) { var T = window.TYPES || {}; return T[t] ? T[t].label : t; }

  function itemCount(e) {
    try { if (typeof window.itemCount === "function") return window.itemCount(e); } catch (x) {}
    var d = e.data || {};
    if (Array.isArray(d.items)) return d.items.length;
    if (Array.isArray(d.pairs)) return d.pairs.length;
    if (Array.isArray(d.qs)) return d.qs.length;
    return 1;
  }

  /* ---------- группировка ---------- */

  function groups() {
    var order = [], map = {};
    rows.forEach(function (r) {
      var s = (r.section || "").trim() || NOSEC;
      if (!map[s]) { map[s] = []; order.push(s); }
      map[s].push(r);
    });
    return order.map(function (s) { return { name: s, items: map[s] }; });
  }

  /* ---------- отрисовка ---------- */

  function css() {
    if ($("lessonCss")) return;
    var st = document.createElement("style");
    st.id = "lessonCss";
    st.textContent =
      ".lsec{background:#fff;border-radius:18px;box-shadow:0 5px 0 #cfcecd;padding:14px 15px;margin-bottom:14px}" +
      ".lsec.over{box-shadow:0 5px 0 #ec3013}" +
      ".lsec-hd{display:flex;align-items:center;gap:8px;margin-bottom:10px}" +
      ".lsec-hd .nm{font:900 12px 'Archivo',sans-serif;color:#6e6a68;letter-spacing:.6px;text-transform:uppercase;flex:1;border:0;background:none;padding:2px 0}" +
      ".lsec-hd .nm:focus{outline:none;color:#ec3013}" +
      ".lrow{display:flex;align-items:center;gap:9px;background:#f3f2f2;border-radius:12px;padding:9px 11px;margin-bottom:7px;cursor:grab}" +
      ".lrow:last-child{margin-bottom:0}" +
      ".lrow.drag{opacity:.4}" +
      ".lrow .gr{color:#b8b4b2;font-size:15px;flex:none;line-height:1}" +
      ".lrow .tt{flex:1;font:800 13.5px 'Archivo',sans-serif;min-width:100px;color:#201e1d}" +
      ".lrow .bg{background:#cfcecd;color:#4a4644;border-radius:999px;padding:3px 8px;font:900 10px 'Archivo',sans-serif;flex:none}" +
      ".lrow .dr{background:#ffe9c9;color:#8a5a12;border-radius:999px;padding:3px 8px;font:900 10px 'Archivo',sans-serif;flex:none}" +
      ".lrow .ac{background:none;color:#8a8785;font-size:14px;padding:4px 5px;border-radius:8px;flex:none;line-height:1}" +
      ".lrow .ac:hover{background:#e4e2e0;color:#201e1d}" +
      ".lempty{font:700 12px 'Archivo',sans-serif;color:#a8a4a2;padding:8px 2px}" +
      ".ladd{background:#eae9e9;color:#4a8b34;border-radius:999px;padding:8px 15px;font:800 13px 'Archivo',sans-serif;margin-top:4px}" +
      ".lbar{display:flex;align-items:center;gap:10px;margin:0 2px 12px;font:700 12px 'Archivo',sans-serif;color:#6e6a68}";
    document.head.appendChild(st);
  }

  function draw() {
    var host = $("list"); if (!host) return;
    css();
    var gs = groups();

    if (!rows.length) {
      host.innerHTML = '<div class="empty">В этом юните заданий пока нет. Создай первое выше 👆</div>';
      return;
    }

    var pub = rows.filter(function (r) { return r.status !== "draft"; }).length;
    var html = '<div class="lbar"><span>Заданий: <b>' + rows.length + '</b></span>' +
      '<span>Опубликовано: <b>' + pub + '</b></span>' +
      (rows.length - pub ? '<span style="color:#8a5a12">Черновиков: <b>' + (rows.length - pub) + '</b></span>' : "") +
      '<span style="flex:1"></span><span>перетаскивай задания мышкой</span></div>';

    gs.forEach(function (g) {
      html += '<div class="lsec" data-sec="' + esc(g.name) + '">' +
        '<div class="lsec-hd"><input class="nm" value="' + esc(g.name) + '" data-old="' + esc(g.name) + '"></div>';
      g.items.forEach(function (r) {
        var n = itemCount(r);
        html += '<div class="lrow" draggable="true" data-id="' + r.id + '">' +
          '<span class="gr">⠿</span>' +
          '<span class="bg">' + esc(typeLabel(r.type)) + '</span>' +
          (n > 1 ? '<span class="bg">' + n + '</span>' : "") +
          '<span class="tt">' + esc(r.title || typeLabel(r.type)) + '</span>' +
          (r.status === "draft" ? '<span class="dr">черновик</span>' : "") +
          '<button class="ac st" data-id="' + r.id + '" title="' + (r.status === "draft" ? "опубликовать" : "убрать в черновики") + '">' + (r.status === "draft" ? "☁" : "✓") + '</button>' +
          '<button class="ac ed" data-id="' + r.id + '" title="изменить">✎</button>' +
          '<button class="ac du" data-id="' + r.id + '" title="дублировать">⧉</button>' +
          '<button class="ac de" data-id="' + r.id + '" title="удалить">🗑</button>' +
          '</div>';
      });
      if (!g.items.length) html += '<div class="lempty">Пусто — перетащи сюда задание</div>';
      html += "</div>";
    });
    html += '<button class="ladd" id="addSec">+ раздел</button>';
    host.innerHTML = html;
    wire();
  }

  /* ---------- действия ---------- */

  function wire() {
    var host = $("list"); if (!host) return;

    host.querySelectorAll(".ed").forEach(function (b) {
      b.onclick = function (e) {
        e.stopPropagation();
        var r = rows.filter(function (x) { return x.id === b.dataset.id; })[0];
        if (r && typeof window.loadForEdit === "function") window.loadForEdit(r);
      };
    });

    host.querySelectorAll(".du").forEach(function (b) {
      b.onclick = async function (e) {
        e.stopPropagation();
        if (busy) return; busy = true;
        var r = await SM.duplicateExercise(b.dataset.id);
        busy = false;
        if (!r.ok) { note(r.error || "Не получилось скопировать", true); return; }
        note("Копия создана — лежит черновиком");
        load();
      };
    });

    host.querySelectorAll(".de").forEach(function (b) {
      b.onclick = async function (e) {
        e.stopPropagation();
        var r = rows.filter(function (x) { return x.id === b.dataset.id; })[0];
        if (!confirm("Удалить «" + ((r && r.title) || "задание") + "»?")) return;
        await SM.deleteExercise(b.dataset.id);
        load();
      };
    });

    host.querySelectorAll(".st").forEach(function (b) {
      b.onclick = async function (e) {
        e.stopPropagation();
        var r = rows.filter(function (x) { return x.id === b.dataset.id; })[0]; if (!r) return;
        var next = r.status === "draft" ? "published" : "draft";
        var res = await SM.setExerciseStatus(r.id, next);
        if (!res.ok) { note(res.error || "Не вышло", true); return; }
        r.status = next;
        note(next === "draft" ? "Убрано в черновики — ученик не видит" : "Опубликовано — ученик видит");
        draw();
      };
    });

    /* переименование раздела */
    host.querySelectorAll(".nm").forEach(function (inp) {
      inp.onkeydown = function (e) { if (e.key === "Enter") inp.blur(); };
      inp.onblur = async function () {
        var was = inp.dataset.old, now = inp.value.trim();
        if (now === was) return;
        if (!now) { inp.value = was; return; }
        var list = rows.filter(function (r) { return ((r.section || "").trim() || NOSEC) === was; })
          .map(function (r) { return { id: r.id, position: r.position, section: now === NOSEC ? null : now }; });
        var res = await SM.setPositions(list);
        if (!res.ok) { note(res.error || "Не переименовалось", true); inp.value = was; return; }
        note("Раздел переименован");
        load();
      };
    });

    var addSec = $("addSec");
    if (addSec) addSec.onclick = function () {
      var name = prompt("Название раздела", "Новый раздел");
      if (!name || !name.trim()) return;
      var sel = $("section"); if (sel) sel.value = name.trim();
      note("Раздел «" + name.trim() + "» подставлен в форму — заполни задание и сохрани");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    dragWire(host);
  }

  /* ---------- перетаскивание ---------- */

  function dragWire(host) {
    host.querySelectorAll(".lrow").forEach(function (el) {
      el.ondragstart = function (e) {
        dragId = el.dataset.id;
        el.classList.add("drag");
        try { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", dragId); } catch (x) {}
      };
      el.ondragend = function () { el.classList.remove("drag"); dragId = null; clearOver(); };
      el.ondragover = function (e) {
        if (!dragId || dragId === el.dataset.id) return;
        e.preventDefault();
        var box = el.getBoundingClientRect();
        var after = (e.clientY - box.top) > box.height / 2;
        var moving = host.querySelector('.lrow[data-id="' + dragId + '"]');
        if (!moving) return;
        el.parentNode.insertBefore(moving, after ? el.nextSibling : el);
      };
    });

    host.querySelectorAll(".lsec").forEach(function (sec) {
      sec.ondragover = function (e) { if (dragId) { e.preventDefault(); sec.classList.add("over"); } };
      sec.ondragleave = function () { sec.classList.remove("over"); };
      sec.ondrop = function (e) {
        e.preventDefault();
        sec.classList.remove("over");
        var moving = host.querySelector('.lrow[data-id="' + dragId + '"]');
        if (moving && !sec.contains(moving)) sec.appendChild(moving);
        commit();
      };
    });
  }

  function clearOver() {
    var host = $("list"); if (!host) return;
    host.querySelectorAll(".lsec.over").forEach(function (s) { s.classList.remove("over"); });
  }

  /* Записать новый порядок: читаем DOM сверху вниз и раздаём позиции. */
  async function commit() {
    var host = $("list"); if (!host || busy) return;
    busy = true;
    var patch = [], i = 0;
    host.querySelectorAll(".lsec").forEach(function (sec) {
      var name = sec.dataset.sec;
      sec.querySelectorAll(".lrow").forEach(function (el) {
        i += 1;
        patch.push({ id: el.dataset.id, position: i * STEP, section: name === NOSEC ? null : name });
      });
    });
    var res = await SM.setPositions(patch);
    busy = false;
    if (!res.ok) { note(res.error || "Порядок не сохранился", true); load(); return; }
    note("Порядок сохранён");
    patch.forEach(function (p) {
      var r = rows.filter(function (x) { return x.id === p.id; })[0];
      if (r) { r.position = p.position; r.section = p.section; }
    });
    rows.sort(function (a, b) { return a.position - b.position; });
  }

  /* ---------- загрузка ---------- */

  function note(txt, bad) {
    var m = $("msg"); if (!m) return;
    m.className = "msg " + (bad ? "err" : "ok");
    m.textContent = txt;
  }

  async function load() {
    var host = $("list"); if (!host) return;
    var course = $("course") && $("course").value;
    var unit = $("unit") && $("unit").value;
    if (!course || !unit) { host.innerHTML = '<div class="empty">Выбери курс и юнит</div>'; return; }
    host.innerHTML = '<div class="empty">Загружаю урок…</div>';
    try { rows = await SM.exercisesFor(course, unit); } catch (e) { rows = []; }
    rows = (rows || []).slice().sort(function (a, b) { return (a.position || 0) - (b.position || 0); });
    draw();
  }

  /* ---------- подключение ---------- */

  function hook() {
    if (typeof window.loadList !== "function" || !$("list")) return false;

    window.loadList = load;

    var title = document.querySelector(".sec-title");
    if (title) title.textContent = "УРОК ЦЕЛИКОМ — ЧТО УВИДИТ УЧЕНИК";

    var u = $("unit");
    if (u) u.addEventListener("change", function () { setTimeout(load, 0); });

    load();
    return true;
  }

  var tries = 0;
  var iv = setInterval(function () {
    if (hook() || ++tries > 60) clearInterval(iv);
  }, 200);

  window.SM_LESSON = { load: load, rows: function () { return rows; } };
})();
