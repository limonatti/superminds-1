/* admin-plus.js — дополнение к конструктору учебников
   1) редактор слов построчно: эмодзи / english / перевод / картинка с компьютера
   2) явный переход из юнита в конструктор упражнений
   Подключается последним в admin.html и переопределяет unitForm/showUnits/parseWords. */
(function () {

  /* ---------- стили ---------- */
  var css = document.createElement("style");
  css.textContent =
    ".wrow{display:grid;grid-template-columns:62px 1fr 1fr auto auto auto;gap:8px;align-items:center;margin-bottom:9px}" +
    ".wrow input{padding:9px 10px;font-size:15px}" +
    ".wrow .w-em{text-align:center;font-size:19px}" +
    ".wrow .bt{padding:8px 11px}" +
    ".w-prev{grid-column:1/-1;display:flex;align-items:center;gap:8px;margin:-3px 0 4px}" +
    ".w-prev img{max-height:64px;max-width:120px;border-radius:10px;border:2px solid #e3d3ba;display:block}" +
    ".wbar{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}" +
    ".okpanel{text-align:center}" +
    ".okpanel .big{font:900 22px 'Nunito',sans-serif;color:#3f7a20;margin:6px 0 4px}" +
    ".okpanel .bt,.okpanel .primary{margin:6px 5px}" +
    "@media(max-width:620px){.wrow{grid-template-columns:56px 1fr auto auto}.wrow .w-ru{grid-column:1/-1}}";
  document.head.appendChild(css);

  /* ---------- вспомогательное ---------- */
  function isImgSrc(s) { return /^(https?:\/\/|data:image)/i.test(s || ""); }

  /* картинки теперь можно и загруженные файлом (data:) */
  window.parseWords = function (txt) {
    return txt.split("\n").map(function (s) { return s.trim(); }).filter(Boolean).map(function (line) {
      var p = line.split(/\s*[—–]\s*|\s+-\s+/).map(function (x) { return x.trim(); });
      var w = { en: p[0] || "", ru: p[1] || "" };
      for (var i = 2; i < p.length; i++) {
        if (isImgSrc(p[i])) w.img = p[i]; else if (p[i]) w.emoji = p[i];
      }
      if (!w.emoji) w.emoji = "⭐";
      return w;
    }).filter(function (w) { return w.en; });
  };

  function toBuilder(courseSlug, unitSlug) {
    try {
      localStorage.setItem("sm-course", courseSlug);
      if (unitSlug) localStorage.setItem("sm-builder-unit", unitSlug);
    } catch (e) {}
    location.href = "builder.html";
  }

  /* ---------- список юнитов ---------- */
  window.unitRow = function (u, i, n) {
    return '<div class="crow"><span class="ce" style="background:' + (u.color || "#eee") + '">' + (u.emoji || "📖") + "</span>" +
      '<span class="ct">' + esc((u.unit_label ? u.unit_label + " · " : "") + u.title) + "<small>" + ((u.words && u.words.length) || 0) + " слов</small></span>" +
      '<button id="ux-' + u.id + '" class="bt main">🧩 Упражнения</button>' +
      (i > 0 ? '<button id="uu-' + u.id + '" class="bt">↑</button>' : "") +
      (i < n - 1 ? '<button id="un-' + u.id + '" class="bt">↓</button>' : "") +
      '<button id="ue-' + u.id + '" class="bt" title="слова и настройки">✎ Слова</button>' +
      '<button id="ud-' + u.id + '" class="bt" title="удалить">🗑</button></div>';
  };

  window.showUnits = async function (c) {
    curCourse = c;
    root.innerHTML = '<div class="empty">Загрузка…</div>';
    var us = await SM.myUnits(c.slug);
    root.innerHTML = '<button class="bt" id="back">← учебники</button>' +
      '<div class="sec-title" style="margin-top:14px">' + esc((c.emoji || "📘") + " " + c.title) + " · юниты</div>" +
      (us.length ? us.map(function (u, i) { return unitRow(u, i, us.length); }).join("") : '<div class="empty">Пока нет юнитов. Добавь первый 👇</div>') +
      '<button class="primary" id="newU">＋ Новый юнит</button><div class="msg" id="msg"></div>' +
      '<div class="hint">У каждого юнита две кнопки: <b>✎ Слова</b> — список слов, картинки и настройки; <b>🧩 Упражнения</b> — конструктор заданий именно для этого юнита (выбор ответа, пропуски, пары, аудио и остальные типы). Слова автоматически попадают в тренажёр, игры и листы.</div>';
    document.getElementById("back").onclick = showCourses;
    document.getElementById("newU").onclick = function () { unitForm(null); };
    us.forEach(function (u, i) {
      document.getElementById("ue-" + u.id).onclick = function () { unitForm(u); };
      document.getElementById("ux-" + u.id).onclick = function () { toBuilder(c.slug, u.slug); };
      document.getElementById("ud-" + u.id).onclick = async function () {
        if (!confirm("Удалить юнит «" + u.title + "»?")) return;
        var r = await SM.deleteUnit(u.id);
        if (r.ok) { await refresh(); showUnits(c); } else alert(r.error || "Ошибка");
      };
      var up = document.getElementById("uu-" + u.id), dn = document.getElementById("un-" + u.id);
      if (up) up.onclick = function () { moveUnit(us, i, -1); };
      if (dn) dn.onclick = function () { moveUnit(us, i, 1); };
    });
  };

  /* ---------- форма юнита со словами ---------- */
  window.unitForm = function (u) {
    var W = (u && u.words || []).map(function (w) {
      return { en: w.en || "", ru: w.ru || "", emoji: w.emoji || "", img: w.img || "" };
    });
    if (!W.length) W = [{ en: "", ru: "", emoji: "", img: "" }, { en: "", ru: "", emoji: "", img: "" }, { en: "", ru: "", emoji: "", img: "" }];
    var bulk = false;

    root.innerHTML = '<div class="panel"><div class="sec-title">' + (u ? "Редактировать юнит" : "Новый юнит") + " · " + esc(curCourse.title) + "</div>" +
      '<div class="row2" style="margin-top:0"><div style="flex:1"><label>Номер</label><input id="lb" value="' + esc(u && u.unit_label || "") + '" placeholder="Unit 1"></div>' +
      '<div style="width:110px"><label>Эмодзи</label><input id="em" value="' + esc(u && u.emoji || "📖") + '" maxlength="4" style="text-align:center;font-size:22px"></div></div>' +
      "<label>Название юнита</label><input id=\"t\" value=\"" + esc(u && u.title || "") + "\" placeholder=\"At school\">" +
      "<label>Цвет</label>" + colorPicker("usw", u && u.color || COLORS[2]) +
      '<label>Слова юнита</label><div id="wlist"></div>' +
      '<div class="wbar"><button type="button" class="bt" id="addW">＋ слово</button>' +
      '<button type="button" class="bt" id="mode">⇄ ввести списком</button>' +
      '<button type="button" class="bt" id="aiFill" style="background:#2980b9;border-color:#2980b9;color:#fff">🤖 Заполнить переводы и эмодзи</button></div>' +
      '<div class="hint" id="whint">У каждого слова: эмодзи, английское, перевод. <b>📁</b> — загрузить картинку с компьютера (сожмётся автоматически), <b>🔗</b> — вставить ссылку на картинку.</div>' +
      '<div class="row2"><button class="primary" id="save" style="margin-top:0">💾 Сохранить юнит</button><button class="bt" id="cancel">Отмена</button></div>' +
      '<div class="msg" id="msg"></div></div>';
    bindSw("usw");

    var box = document.getElementById("wlist");

    function rowHTML(w, i) {
      return '<div class="wrow">' +
        '<input class="w-em" data-i="' + i + '" data-k="emoji" value="' + esc(w.emoji) + '" maxlength="4" placeholder="🐱">' +
        '<input class="w-en" data-i="' + i + '" data-k="en" value="' + esc(w.en) + '" placeholder="cat">' +
        '<input class="w-ru" data-i="' + i + '" data-k="ru" value="' + esc(w.ru) + '" placeholder="кошка">' +
        '<button type="button" class="bt" data-act="genimg" data-i="' + i + '" title="сгенерировать картинку ИИ" style="background:#eafaf0;border-color:#b6e0c7">🎨</button>' +
        '<button type="button" class="bt" data-act="file" data-i="' + i + '" title="картинка с компьютера">📁</button>' +
        '<button type="button" class="bt" data-act="del" data-i="' + i + '" title="убрать слово">🗑</button>' +
        (w.img
          ? '<div class="w-prev"><img src="' + esc(w.img) + '" alt=""><button type="button" class="bt" data-act="rmimg" data-i="' + i + '">✕ убрать картинку</button></div>'
          : '<div class="w-prev"><button type="button" class="bt" data-act="url" data-i="' + i + '">🔗 картинка по ссылке</button></div>') +
        "</div>";
    }

    function renderRows() {
      box.innerHTML = W.map(rowHTML).join("");
    }
    function renderBulk() {
      var txt = W.filter(function (w) { return w.en; })
        .map(function (w) { return [w.en, w.ru, w.emoji, w.img].filter(Boolean).join(" — "); }).join("\n");
      box.innerHTML = '<textarea id="ws" rows="12" placeholder="cat — кошка — 🐱&#10;dog — собака — 🐶">' + esc(txt) + "</textarea>";
    }
    function syncFromBulk() {
      var ta = document.getElementById("ws");
      if (ta) W = parseWords(ta.value).map(function (w) { return { en: w.en, ru: w.ru, emoji: w.emoji === "⭐" ? "" : w.emoji, img: w.img || "" }; });
    }

    renderRows();

    box.addEventListener("input", function (e) {
      var el = e.target;
      if (el.dataset && el.dataset.k) W[+el.dataset.i][el.dataset.k] = el.value;
    });
    box.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-act]");
      if (!b) return;
      var i = +b.dataset.i, act = b.dataset.act;
      if (act === "del") { W.splice(i, 1); if (!W.length) W = [{ en: "", ru: "", emoji: "", img: "" }]; renderRows(); }
      else if (act === "rmimg") { W[i].img = ""; renderRows(); }
      else if (act === "url") {
        var v = prompt("Ссылка на картинку (https://…)", "");
        if (v && isImgSrc(v.trim())) { W[i].img = v.trim(); renderRows(); }
        else if (v) alert("Нужна ссылка, начинающаяся с https://");
      } else if (act === "file") {
        var tmp = document.createElement("input");
        pickImage(tmp, function () { W[i].img = tmp.value; renderRows(); });
      } else if (act === "genimg") {
        var en = (W[i].en || "").trim();
        if (!en) { alert("Сначала впиши английское слово в этой строке"); return; }
        if (typeof SM_AI === "undefined") { alert("Модуль ассистента не загрузился, обнови страницу"); return; }
        b.textContent = "⏳"; b.disabled = true;
        m("", "🎨 Рисую картинку для «" + en + "»… это ~20 секунд, не закрывай страницу");
        SM_AI.call("image", { en: en, ru: (W[i].ru || "").trim() }).then(function (res) {
          if (!res.ok || !res.image) { b.disabled = false; b.textContent = "🎨"; m("err", res.error || "Не удалось нарисовать"); return; }
          SM_AI.compress(res.image, function (small) {
            W[i].img = small; renderRows();
            m("ok", "Картинка готова для «" + en + "» 🎨 Не забудь сохранить юнит.");
          });
        });
      }
    });

    document.getElementById("addW").onclick = function () {
      if (bulk) return;
      W.push({ en: "", ru: "", emoji: "", img: "" });
      renderRows();
      var ins = box.querySelectorAll(".w-en"); if (ins.length) ins[ins.length - 1].focus();
    };
    document.getElementById("mode").onclick = function () {
      if (bulk) { syncFromBulk(); renderRows(); bulk = false; this.textContent = "⇄ ввести списком";
        document.getElementById("addW").style.display = "";
        document.getElementById("whint").innerHTML = "У каждого слова: эмодзи, английское, перевод. <b>📁</b> — загрузить картинку с компьютера, <b>🔗</b> — вставить ссылку."; }
      else { renderBulk(); bulk = true; this.textContent = "⇄ вернуться к списку";
        document.getElementById("addW").style.display = "none";
        document.getElementById("whint").innerHTML = "Быстрый ввод: одно слово в строке, формат <b>английское — перевод — эмодзи</b>. Потом вернись к списку, чтобы добавить картинки."; }
    };

    // 🤖 ассистент: заполнить пустые переводы и эмодзи
    var aiBtn = document.getElementById("aiFill");
    if (aiBtn) aiBtn.onclick = async function () {
      if (bulk) syncFromBulk();
      var need = W.filter(function (w) { return (w.en || "").trim() && (!(w.ru || "").trim() || !(w.emoji || "").trim()); });
      if (!need.length) { m("ok", "Всё уже заполнено 👍"); return; }
      var old = aiBtn.textContent;
      aiBtn.disabled = true; aiBtn.textContent = "🤖 думаю…"; m("", "Ассистент подбирает переводы…");
      var res = await SM_AI.call("translate", { words: need.map(function (w) { return w.en.trim(); }) });
      aiBtn.disabled = false; aiBtn.textContent = old;
      if (!res.ok) { m("err", res.error); return; }
      var items = (res.data && res.data.items) || [];
      var map = {};
      items.forEach(function (it) { if (it.en) map[it.en.toLowerCase().trim()] = it; });
      var filled = 0;
      W.forEach(function (w) {
        var it = map[(w.en || "").toLowerCase().trim()];
        if (!it) return;
        if (!(w.ru || "").trim() && it.ru) { w.ru = it.ru; filled++; }
        if (!(w.emoji || "").trim() && it.emoji) { w.emoji = it.emoji; }
      });
      if (bulk) { document.getElementById("mode").click(); } else { renderRows(); }
      m("ok", "Готово: заполнено переводов — " + filled + ". Проверь и поправь, если нужно.");
    };

    document.getElementById("cancel").onclick = function () { showUnits(curCourse); };

    document.getElementById("save").onclick = async function () {
      var t = document.getElementById("t").value.trim();
      if (!t) { m("err", "Впиши название юнита"); return; }
      if (bulk) syncFromBulk();
      var ws = W.filter(function (w) { return (w.en || "").trim(); }).map(function (w) {
        return { en: w.en.trim(), ru: (w.ru || "").trim(), emoji: (w.emoji || "").trim() || "⭐", img: w.img || undefined };
      });
      if (!ws.length) { m("err", "Добавь хотя бы одно слово"); return; }
      m("", "Сохраняю…");
      var r = await SM.saveUnit({
        id: u && u.id, course_slug: curCourse.slug,
        unit_label: document.getElementById("lb").value.trim(), title: t,
        emoji: document.getElementById("em").value.trim() || "📖",
        color: swVal("usw"), words: ws
      });
      if (!r.ok) { m("err", r.error || "Ошибка"); return; }
      await refresh();
      var list = await SM.myUnits(curCourse.slug);
      var savedId = (u && u.id) || r.id;
      var saved = list.filter(function (x) { return x.id === savedId; })[0] || list[list.length - 1];
      done(saved, t, ws.length);
    };

    function done(saved, title, n) {
      root.innerHTML = '<div class="panel okpanel">' +
        '<div style="font-size:44px">✅</div><div class="big">Юнит сохранён</div>' +
        '<div class="hint" style="text-align:center">«' + esc(title) + "» · " + n + " слов. Слова уже работают в тренажёре, играх и листах.</div>" +
        '<div style="margin:18px 0 4px"><button class="primary" id="toEx">🧩 Добавить упражнения к этому юниту</button></div>' +
        '<div><button class="bt" id="toList">← к списку юнитов</button>' +
        '<button class="bt" id="again">✎ доработать слова</button>' +
        (saved ? '<button class="bt" id="view">👀 посмотреть глазами ученика</button>' : "") +
        "</div></div>";
      document.getElementById("toEx").onclick = function () { toBuilder(curCourse.slug, saved && saved.slug); };
      document.getElementById("toList").onclick = function () { showUnits(curCourse); };
      document.getElementById("again").onclick = function () { unitForm(saved); };
      var v = document.getElementById("view");
      if (v) v.onclick = function () {
        try { localStorage.setItem("sm-course", curCourse.slug); } catch (e) {}
        location.href = "exercises.html?u=" + encodeURIComponent(saved.slug);
      };
    }
  };

})();
