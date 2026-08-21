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
      /* sm-skin.css задаёт полям рамку через !important — заголовок раздела
         должен читаться как заголовок, поэтому перебиваем тем же весом */
      ".lsec-hd .nm{font:900 12px 'Archivo',sans-serif !important;color:#6e6a68 !important;letter-spacing:.6px;text-transform:uppercase;flex:1;width:auto !important;border:0 !important;background:transparent !important;padding:2px 0 !important;box-shadow:none !important}" +
      ".lsec-hd .nm:hover{color:#201e1d !important}" +
      ".lsec-hd .nm:focus{outline:none;color:#ec3013 !important;border-bottom:2px solid #ec3013 !important}" +
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
          '<button class="ac pv" data-id="' + r.id + '" title="посмотреть глазами ученика">👁</button>' +
          '<button class="ac ed" data-id="' + r.id + '" title="изменить">✎</button>' +
          '<button class="ac du" data-id="' + r.id + '" title="дублировать">⧉</button>' +
          '<button class="ac mv" data-id="' + r.id + '" title="перенести в другой юнит">↗</button>' +
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
        if (!r) return;
        /* Удаляем сразу, но держим копию — десять секунд можно передумать.
           Спрашивать подтверждение при этом уже не нужно. */
        var backup = {
          course: r.course, unit_id: r.unit_id, book: r.book, type: r.type,
          title: r.title, section: r.section, data: r.data, status: r.status
        };
        var res = await SM.deleteExercise(r.id);
        if (!res.ok) { note(res.error || "Не удалось удалить", true); return; }
        load();
        offerUndo(backup);
      };
    });

    host.querySelectorAll(".pv").forEach(function (b) {
      b.onclick = function (e) {
        e.stopPropagation();
        var r = rows.filter(function (x) { return x.id === b.dataset.id; })[0];
        if (r) showPreview(r);
      };
    });

    host.querySelectorAll(".mv").forEach(function (b) {
      b.onclick = function (e) {
        e.stopPropagation();
        var r = rows.filter(function (x) { return x.id === b.dataset.id; })[0];
        if (r) showMove(r);
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

  /* ---------- отмена удаления ---------- */

  var undoTimer = null;
  function offerUndo(backup) {
    var host = $("list"); if (!host) return;
    var old = $("undoBar"); if (old) old.remove();
    clearTimeout(undoTimer);

    var bar = document.createElement("div");
    bar.id = "undoBar";
    bar.style.cssText = "display:flex;align-items:center;gap:10px;background:#fff2ef;border:2px solid #ffc9c0;border-radius:12px;padding:10px 13px;margin:0 0 12px;font:800 13px 'Archivo',sans-serif;color:#7b190d";
    bar.innerHTML = '<span style="flex:1">Задание «' + esc(backup.title || typeLabel(backup.type)) + '» удалено</span>';

    var back = document.createElement("button");
    back.type = "button"; back.textContent = "вернуть";
    back.style.cssText = "background:#7b190d;color:#fff;border:0;border-radius:999px;padding:7px 15px;font:800 13px 'Archivo',sans-serif;cursor:pointer";
    back.onclick = async function () {
      back.disabled = true; back.textContent = "возвращаю…";
      var r = await SM.saveExercise(backup);
      bar.remove();
      if (!r.ok) { note(r.error || "Не вышло вернуть", true); return; }
      note("Задание возвращено");
      load();
    };
    bar.appendChild(back);
    host.parentNode.insertBefore(bar, host);
    undoTimer = setTimeout(function () { var b = $("undoBar"); if (b) b.remove(); }, 12000);
  }

  /* ---------- просмотр задания глазами ученика ---------- */

  function showPreview(r) {
    var old = $("lsnPrev"); if (old) old.remove();
    var ov = document.createElement("div");
    ov.id = "lsnPrev";
    ov.style.cssText = "position:fixed;inset:0;z-index:80;background:rgba(32,30,29,.55);display:flex;align-items:center;justify-content:center;padding:18px";
    ov.innerHTML = '<div style="background:#f3f2f2;border-radius:20px;max-width:640px;width:100%;max-height:88vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 12px 0 rgba(0,0,0,.2)">' +
      '<div style="display:flex;align-items:center;gap:10px;padding:14px 18px;background:#fff;border-bottom:2px solid #cfcecd">' +
        '<b style="font:900 15px \'Archivo\',sans-serif">👁 ' + esc(r.title || typeLabel(r.type)) + "</b>" +
        '<span style="flex:1"></span>' +
        '<button id="lsnPrevClose" style="background:#ec3013;color:#fff;border:0;border-radius:999px;padding:7px 15px;font:800 13px \'Archivo\',sans-serif;cursor:pointer">закрыть</button>' +
      "</div>" +
      '<iframe id="lsnPrevFrame" style="flex:1;width:100%;border:0;background:#f3f2f2;min-height:420px" src="exercises.html?preview=1"></iframe>' +
    "</div>";
    document.body.appendChild(ov);
    ov.onclick = function (e) { if (e.target === ov) ov.remove(); };
    ov.querySelector("#lsnPrevClose").onclick = function () { ov.remove(); };
    document.addEventListener("keydown", function esc2(e) {
      if (e.key === "Escape") { var o = $("lsnPrev"); if (o) o.remove(); document.removeEventListener("keydown", esc2); }
    });
    /* exercises.html в режиме preview ждёт задание сообщением — тем же, что и кнопка «Как увидит ученик» */
    var fr = ov.querySelector("#lsnPrevFrame");
    fr.onload = function () {
      try { fr.contentWindow.postMessage({ smPreview: { id: r.id, type: r.type, title: r.title, section: r.section, data: r.data } }, "*"); }
      catch (err) { note("Предпросмотр не открылся", true); }
    };
  }

  /* ---------- перенос в другой юнит ---------- */

  function showMove(r) {
    var old = $("lsnMove"); if (old) old.remove();

    /* курсы и юниты берём из тех же данных, что и селекты вверху страницы */
    var courses = (window.SM_COURSES || []).filter(function (c) {
      return c.id !== "own" && ((window.SM_COURSE_DATA || {})[c.id] || []).length;
    });
    if (!courses.length) { note("Список учебников ещё не загрузился", true); return; }

    var ov = document.createElement("div");
    ov.id = "lsnMove";
    ov.style.cssText = "position:fixed;inset:0;z-index:80;background:rgba(32,30,29,.55);display:flex;align-items:center;justify-content:center;padding:18px";
    ov.innerHTML = '<div style="background:#fff;border-radius:20px;max-width:460px;width:100%;padding:20px;box-shadow:0 12px 0 rgba(0,0,0,.2)">' +
      '<div style="font:900 15px \'Archivo\',sans-serif;margin-bottom:4px">↗ Перенести задание</div>' +
      '<div style="font:700 13px \'Archivo\',sans-serif;color:#6e6a68;margin-bottom:14px;line-height:1.5">«' + esc(r.title || typeLabel(r.type)) + '» — куда положить копию?</div>' +
      '<label style="display:block;font:800 11px \'Archivo\',sans-serif;color:#6e6a68;letter-spacing:.08em;margin-bottom:5px">УЧЕБНИК</label>' +
      '<select id="mvCourse" style="width:100%;border:2px solid #cfcecd;border-radius:12px;padding:10px 12px;font:600 15px \'Archivo\',sans-serif;background:#f3f2f2;margin-bottom:12px">' +
        courses.map(function (c) { return '<option value="' + esc(c.id) + '"' + (c.id === $("course").value ? " selected" : "") + ">" + esc((c.emoji || "📘") + " " + c.title) + "</option>"; }).join("") +
      "</select>" +
      '<label style="display:block;font:800 11px \'Archivo\',sans-serif;color:#6e6a68;letter-spacing:.08em;margin-bottom:5px">ЮНИТ</label>' +
      '<select id="mvUnit" style="width:100%;border:2px solid #cfcecd;border-radius:12px;padding:10px 12px;font:600 15px \'Archivo\',sans-serif;background:#f3f2f2;margin-bottom:6px"></select>' +
      '<label style="display:flex;align-items:center;gap:8px;font:700 13px \'Archivo\',sans-serif;color:#4a4644;margin:12px 0 16px;cursor:pointer">' +
        '<input type="checkbox" id="mvCut" style="width:auto"> убрать из этого юнита (перенести, а не копировать)</label>' +
      '<div style="display:flex;gap:8px">' +
        '<button id="mvGo" style="flex:1;background:#ec3013;color:#fff;border:0;border-radius:12px;padding:12px;font:800 14px \'Archivo\',sans-serif;cursor:pointer;box-shadow:0 4px 0 #ae1800">Перенести</button>' +
        '<button id="mvNo" style="background:#eae9e9;color:#4a4644;border:0;border-radius:12px;padding:12px 16px;font:800 13px \'Archivo\',sans-serif;cursor:pointer">отмена</button>' +
      "</div></div>";
    document.body.appendChild(ov);

    function fillUnits() {
      var cid = ov.querySelector("#mvCourse").value;
      var us = (window.SM_COURSE_DATA || {})[cid] || [];
      ov.querySelector("#mvUnit").innerHTML = us.length
        ? us.map(function (u) { return '<option value="' + esc(u.id) + '">' + esc((u.emoji || "📖") + " " + u.title) + "</option>"; }).join("")
        : '<option value="">— в этом учебнике нет юнитов —</option>';
    }
    fillUnits();
    ov.querySelector("#mvCourse").onchange = fillUnits;
    ov.onclick = function (e) { if (e.target === ov) ov.remove(); };
    ov.querySelector("#mvNo").onclick = function () { ov.remove(); };

    ov.querySelector("#mvGo").onclick = async function () {
      var go = this;
      var cid = ov.querySelector("#mvCourse").value;
      var uid = ov.querySelector("#mvUnit").value;
      var cut = ov.querySelector("#mvCut").checked;
      if (!uid) { note("В этом учебнике нет юнитов", true); return; }
      if (cid === $("course").value && uid === $("unit").value) { note("Это тот же юнит", true); return; }

      go.disabled = true; go.textContent = "переношу…";
      /* копия создаётся черновиком: в новом юните её надо проверить и опубликовать */
      var res = await SM.saveExercise({
        course: cid, unit_id: uid, book: r.book || "sb", type: r.type,
        title: r.title, section: r.section, data: r.data, status: "draft"
      });
      if (!res.ok) { go.disabled = false; go.textContent = "Перенести"; note(res.error || "Не получилось", true); return; }
      if (cut) { try { await SM.deleteExercise(r.id); } catch (e) {} }
      ov.remove();
      note(cut ? "Задание перенесено — в новом юните лежит черновиком" : "Копия создана — в новом юните лежит черновиком");
      load();
    };
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
