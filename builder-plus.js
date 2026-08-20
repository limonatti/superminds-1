/* builder-plus.js — приём «эстафеты» из конструктора учебников.
   Если из юнита нажали «🧩 Добавить упражнения», нужный юнит выбирается сам. */
(function () {
  var KEY = "sm-builder-unit", slug = null;
  try { slug = localStorage.getItem(KEY); } catch (e) {}
  if (!slug) return;
  try { localStorage.removeItem(KEY); } catch (e) {}

  var tries = 0;
  var timer = setInterval(function () {
    var sel = document.getElementById("unit");
    var ok = sel && Array.prototype.some.call(sel.options, function (o) { return o.value === slug; });
    if (ok) {
      clearInterval(timer);
      sel.value = slug;
      sel.dispatchEvent(new Event("change", { bubbles: true }));
      var name = sel.options[sel.selectedIndex].text;

      var b = document.createElement("div");
      b.style.cssText = "background:#fff;border:3px solid #2980b9;border-radius:18px;padding:13px 16px;margin:0 0 14px;font:800 14px 'Archivo',sans-serif;color:#1c1310;line-height:1.6";
      b.innerHTML = "Юнит <b>" + name.replace(/[<>]/g, "") + "</b> выбран автоматически. " +
        "Выбери тип упражнения ниже, заполни и нажми «Сохранить» — задание встанет в этот урок. " +
        "Так можно добавить сколько угодно упражнений подряд." +
        '<div style="margin-top:9px"><a href="admin.html" style="color:#7c2340;font-weight:900">← вернуться к юнитам</a></div>';

      var host = sel.closest(".panel") || sel.parentNode;
      host.parentNode.insertBefore(b, host);
      sel.style.outline = "3px solid #2980b9";
      setTimeout(function () { sel.style.outline = ""; }, 2500);
      try { b.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
    }
    if (++tries > 60) clearInterval(timer);
  }, 200);
})();

/* ============================================================
   🤖 Ассистент: «Собрать задания из слов юнита»

   Раньше он притворялся пользователем: жал addOpt/rm, подсовывал значения
   через хак с value-сеттером и ждал появления элементов в цикле по 200 мс.
   Если вёрстка отрисовывалась медленно — молча ничего не происходило,
   а принять можно было только всё разом.

   Теперь проще и надёжнее: ассистент отдаёт готовый JSON, мы показываем
   задания списком, учитель отмечает нужные — и форма строится через
   renderForm(type, data), который сам создаёт столько блоков, сколько надо.
   ============================================================ */
(function () {
  "use strict";

  var SUPPORTED = { choice: 1, gap: 1, tf: 1, order: 1, match: 1 };
  var cand = [];      // что придумал ассистент
  var keep = [];      // отмеченные галочкой
  var curType = null;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return (s == null ? "" : String(s)).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }

  function status(txt, cls) {
    var m = $("msg");
    if (m) { m.className = "msg " + (cls || ""); m.textContent = txt; }
  }

  function unitWords(unitId) {
    var out = [];
    try {
      (window.SM_ALL_WORDS || []).forEach(function (w) {
        if (w.unitId === unitId && w.en) out.push(w.en);
      });
    } catch (e) {}
    if (!out.length) {
      try {
        (window.SM_UNITS || []).forEach(function (u) {
          if ((u.slug === unitId || u.id === unitId) && u.words) u.words.forEach(function (w) { if (w.en) out.push(w.en); });
        });
      } catch (e) {}
    }
    /* запасной путь — словарь курса, который уже загружен на странице */
    if (!out.length) {
      try {
        var cid = $("course") && $("course").value;
        ((window.SM_COURSE_DATA || {})[cid] || []).forEach(function (u) {
          if (u.id === unitId) (u.words || []).forEach(function (w) { if (w.en) out.push(w.en); });
        });
      } catch (e) {}
    }
    return out;
  }

  /* ---------- как показать задание одной строкой ---------- */
  function preview(type, it) {
    if (type === "choice") {
      var opts = it.opts || [];
      var right = opts[it.correct || 0] || "";
      return esc(it.q || "") + '<br><span class="cand-a">верно: ' + esc(right) +
        (opts.length > 1 ? " · из " + opts.length : "") + "</span>";
    }
    if (type === "gap") return esc(it.q || "") + '<br><span class="cand-a">ответ: ' + esc(it.answer || "") + "</span>";
    if (type === "tf") {
      var yes = (it.answer === true || it.answer === "true" || it.answer === 1);
      return esc(it.q || it.statement || "") + '<br><span class="cand-a">' + (yes ? "верно" : "неверно") + "</span>";
    }
    if (type === "order") return esc(it.answer || it.q || "");
    if (type === "match") return esc(it.l || it.a || it.en || "") + " — " + esc(it.r || it.b || it.ru || "");
    return esc(JSON.stringify(it).slice(0, 80));
  }

  /* ---------- панель выбора ---------- */
  function css() {
    if ($("candCss")) return;
    var st = document.createElement("style");
    st.id = "candCss";
    st.textContent =
      "#candBox{background:#fff;border:3px solid #2980b9;border-radius:18px;padding:14px 15px;margin:0 0 14px}" +
      "#candBox .hd{font:900 13px 'Archivo',sans-serif;color:#1c5a85;margin-bottom:4px}" +
      "#candBox .sub{font:700 12px 'Archivo',sans-serif;color:#6e6a68;margin-bottom:10px;line-height:1.5}" +
      ".cand{display:flex;gap:10px;align-items:flex-start;background:#f3f2f2;border-radius:12px;padding:10px 12px;margin-bottom:7px;cursor:pointer}" +
      ".cand.off{opacity:.45}" +
      ".cand .bx{width:20px;height:20px;border-radius:6px;border:2px solid #2980b9;background:#fff;flex:none;color:#fff;font:900 13px 'Archivo',sans-serif;text-align:center;line-height:17px;margin-top:1px}" +
      ".cand.on .bx{background:#2980b9}" +
      ".cand .tx{flex:1;font:700 13.5px 'Archivo',sans-serif;line-height:1.45;min-width:0}" +
      ".cand .cand-a{font:800 12px 'Archivo',sans-serif;color:#4a8b34}" +
      "#candBox .foot{display:flex;gap:8px;align-items:center;margin-top:11px;flex-wrap:wrap}" +
      "#candBox .go{background:#2980b9;color:#fff;border:0;border-radius:12px;padding:11px 17px;font:800 14px 'Archivo',sans-serif;cursor:pointer;box-shadow:0 4px 0 #1c5a85}" +
      "#candBox .go:disabled{opacity:.5;box-shadow:none;cursor:default}" +
      "#candBox .gh{background:#eae9e9;color:#4a4644;border:0;border-radius:12px;padding:11px 15px;font:800 13px 'Archivo',sans-serif;cursor:pointer}" +
      "#candBox .cnt{font:800 12px 'Archivo',sans-serif;color:#6e6a68;margin-left:auto}";
    document.head.appendChild(st);
  }

  function drawCands() {
    var box = $("candBox"); if (!box) return;
    var list = box.querySelector(".list");
    list.innerHTML = cand.map(function (it, i) {
      return '<div class="cand ' + (keep[i] ? "on" : "off") + '" data-i="' + i + '">' +
        '<span class="bx">' + (keep[i] ? "✓" : "") + "</span>" +
        '<span class="tx">' + preview(curType, it) + "</span></div>";
    }).join("");
    list.querySelectorAll(".cand").forEach(function (el) {
      el.onclick = function () { var i = +el.dataset.i; keep[i] = !keep[i]; drawCands(); };
    });
    var n = keep.filter(Boolean).length;
    box.querySelector(".cnt").textContent = "отмечено " + n + " из " + cand.length;
    box.querySelector(".go").disabled = !n;
    box.querySelector(".go").textContent = n ? ("Добавить в форму — " + n) : "Ничего не отмечено";
  }

  function showCands(type, items) {
    css();
    curType = type;
    cand = items;
    keep = items.map(function () { return true; });

    var old = $("candBox"); if (old) old.remove();
    var box = document.createElement("div");
    box.id = "candBox";
    box.innerHTML =
      '<div class="hd">🤖 Ассистент придумал ' + items.length + " " + (type === "match" ? "пар" : "заданий") + "</div>" +
      '<div class="sub">Нажми на строку, чтобы убрать её или вернуть. Останутся только отмеченные — форма заполнится ими, а ты проверишь и сохранишь.</div>' +
      '<div class="list"></div>' +
      '<div class="foot"><button type="button" class="go"></button>' +
      '<button type="button" class="gh">отменить</button>' +
      '<span class="cnt"></span></div>';

    var fields = $("fields");
    fields.parentNode.insertBefore(box, fields);
    box.querySelector(".gh").onclick = function () { box.remove(); status("", ""); };
    box.querySelector(".go").onclick = function () { applyKept(); };
    drawCands();
    try { box.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
  }

  /* ---------- перенос в форму ---------- */
  function applyKept() {
    var chosen = cand.filter(function (_, i) { return keep[i]; });
    if (!chosen.length) return;
    if (typeof window.renderForm !== "function") { status("Форма не готова — обнови страницу", "err"); return; }

    var data;
    if (curType === "match") {
      /* ассистент отдаёт {l,r}, форма ждёт {a,b} */
      data = { pairs: chosen.map(function (p) { return { a: p.l || p.a || p.en || "", b: p.r || p.b || p.ru || "" }; }) };
    } else {
      data = { items: chosen.map(function (it) {
        if (curType === "tf") {
          return { statement: it.q || it.statement || "",
                   correct: (it.answer === true || it.answer === "true" || it.answer === 1) };
        }
        return it;
      }) };
    }

    /* renderForm сам создаст нужное число блоков и заполнит их —
       никаких кликов по кнопкам и ожиданий DOM */
    window.renderForm(curType, data);
    var box = $("candBox"); if (box) box.remove();
    status("Перенесено заданий: " + chosen.length + ". Проверь и нажми «Сохранить».", "ok");
    try { $("save").scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
  }

  /* ---------- запрос к ассистенту ---------- */
  async function generate(btn) {
    var type = $("type").value;
    if (!SUPPORTED[type]) { status("Для этого типа автосборка пока недоступна", "err"); return; }
    var unitSel = $("unit");
    var unitId = unitSel && unitSel.value;
    if (!unitId) { status("Сначала выбери юнит вверху", "err"); return; }
    var words = unitWords(unitId);
    if (!words.length) { status("В этом юните нет слов — добавь их в конструкторе учебников", "err"); return; }
    var title = unitSel.options[unitSel.selectedIndex].text.replace(/^📖\s*/, "");

    var old = btn.textContent;
    btn.disabled = true; btn.textContent = "🤖 собираю задания…";
    status("Ассистент придумывает задания из слов юнита…", "");

    var res;
    try { res = await SM_AI.call("exercise", { type: type, words: words, title: title, count: Math.min(6, Math.max(4, words.length)) }); }
    catch (e) { res = { ok: false, error: "не получилось — попробуй ещё раз" }; }
    btn.disabled = false; btn.textContent = old;

    if (!res || !res.ok) { status((res && res.error) || "Ассистент не ответил", "err"); return; }
    var data = res.data || {};
    var items = (type === "match") ? (data.pairs || []) : (data.items || []);
    if (!items.length) { status("Ассистент не вернул задания — попробуй ещё раз", "err"); return; }

    status("", "");
    showCands(type, items);
  }

  /* ---------- кнопка ---------- */
  function injectButton(type) {
    var fields = $("fields");
    if (!fields) return;
    var existing = $("aiGenWrap");
    if (existing) existing.remove();
    var oldBox = $("candBox"); if (oldBox) oldBox.remove();
    if (!SUPPORTED[type]) return;

    var wrap = document.createElement("div");
    wrap.id = "aiGenWrap";
    wrap.style.cssText = "margin:0 0 14px";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "🤖 Собрать задания из слов юнита";
    btn.style.cssText = "width:100%;background:#2980b9;color:#fff;border:0;border-radius:14px;padding:13px;font:800 15px 'Archivo',sans-serif;cursor:pointer;box-shadow:0 4px 0 #1c5a85";
    btn.onclick = function () { generate(btn); };
    var hint = document.createElement("div");
    hint.style.cssText = "font:700 12px 'Archivo',sans-serif;color:#8a7a68;margin:7px 2px 0;line-height:1.5";
    hint.textContent = "Ассистент придумает задания из слов юнита и покажет списком. Отметишь нужные — они попадут в форму.";
    wrap.appendChild(btn); wrap.appendChild(hint);
    fields.insertBefore(wrap, fields.firstChild);
  }

  /* перехватываем renderForm, чтобы кнопка появлялась при каждой смене типа */
  function hook() {
    if (typeof window.renderForm !== "function") return false;
    var orig = window.renderForm;
    window.renderForm = function (type, data) {
      var r = orig.apply(this, arguments);
      try { injectButton(type); } catch (e) {}
      return r;
    };
    var t = $("type");
    if (t && $("fields")) { try { injectButton(t.value); } catch (e) {} }
    return true;
  }

  var tries = 0;
  var iv = setInterval(function () {
    if (hook() || ++tries > 60) clearInterval(iv);
  }, 200);
})();
