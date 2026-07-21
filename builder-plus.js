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
      b.style.cssText = "background:#fff;border:3px solid #2980b9;border-radius:18px;padding:13px 16px;margin:0 0 14px;font:800 14px 'Nunito',sans-serif;color:#1c1310;line-height:1.6";
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
   Заполняет те же поля формы, что учитель заполняет вручную.
   Учитель проверяет и жмёт «Сохранить». Поддержка: choice, gap, tf, order, match.
   ============================================================ */
(function () {
  var SUPPORTED = { choice: 1, gap: 1, tf: 1, order: 1, match: 1 };

  function setVal(el, v) {
    if (!el) return;
    var proto = el.tagName === "SELECT" ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype;
    var setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    setter.call(el, v == null ? "" : String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function unitWords(unitId) {
    var out = [];
    try {
      (window.SM_ALL_WORDS || []).forEach(function (w) {
        if (w.unitId === unitId && w.en) out.push(w.en);
      });
    } catch (e) {}
    // запасной путь — из SM_UNITS
    if (!out.length) {
      try {
        (window.SM_UNITS || []).forEach(function (u) {
          if ((u.slug === unitId || u.id === unitId) && u.words) u.words.forEach(function (w) { if (w.en) out.push(w.en); });
        });
      } catch (e) {}
    }
    return out;
  }

  function status(txt, cls) {
    var m = document.getElementById("msg");
    if (m) { m.className = "msg " + (cls || ""); m.textContent = txt; }
  }

  /* ---- заполнение блоков по типам ---- */
  function fillChoice(blk, it) {
    setVal(blk.querySelector(".q"), it.q || "");
    var opts = it.opts || [];
    var addBtn = blk.querySelector(".addOpt");
    while (blk.querySelectorAll(".optrow").length < opts.length && addBtn) addBtn.click();
    // лишние строки убираем (если их больше, чем вариантов)
    var rows = [].slice.call(blk.querySelectorAll(".optrow"));
    for (var k = rows.length - 1; k >= opts.length && k >= 2; k--) { var rm = rows[k].querySelector(".rm"); if (rm) rm.click(); }
    rows = blk.querySelectorAll(".optrow");
    opts.forEach(function (o, i) {
      if (!rows[i]) return;
      setVal(rows[i].querySelector(".otext"), o);
      var radio = rows[i].querySelector(".corr input");
      if (radio) { radio.checked = (i === (it.correct || 0)); radio.dispatchEvent(new Event("change", { bubbles: true })); }
    });
  }
  function fillGap(blk, it) { setVal(blk.querySelector(".q"), it.q || ""); setVal(blk.querySelector(".answer"), it.answer || ""); }
  function fillTf(blk, it) {
    setVal(blk.querySelector(".statement"), it.q || it.statement || "");
    var val = (it.answer === true || it.answer === "true" || it.answer === 1) ? "true" : "false";
    setVal(blk.querySelector("select.correct"), val);
  }
  function fillOrder(blk, it) { setVal(blk.querySelector(".answer"), it.answer || it.q || ""); }

  function fillBlockTypes(type, items) {
    var addBlock = document.getElementById("addBlock");
    if (!addBlock) return 0;
    // переиспользуем уже существующие блоки (первый пустой удалить нельзя),
    // недостающие — добавляем
    var existing = [].slice.call(document.querySelectorAll("#blocks .qblock"));
    var n = 0;
    items.forEach(function (it, i) {
      var blk;
      if (i < existing.length) { blk = existing[i]; }
      else { addBlock.click(); var all = document.querySelectorAll("#blocks .qblock"); blk = all[all.length - 1]; }
      if (!blk) return;
      if (type === "choice") fillChoice(blk, it);
      else if (type === "gap") fillGap(blk, it);
      else if (type === "tf") fillTf(blk, it);
      else if (type === "order") fillOrder(blk, it);
      n++;
    });
    // удалить лишние блоки, если их было больше, чем заданий
    var blocks = [].slice.call(document.querySelectorAll("#blocks .qblock"));
    for (var k = blocks.length - 1; k >= items.length && k >= 1; k--) {
      var rm = blocks[k].querySelector(".rmq"); if (rm) rm.click();
    }
    return n;
  }

  function fillMatch(pairs) {
    var pairsBox = document.getElementById("pairs");
    var addPair = document.getElementById("addPair");
    if (!pairsBox) return 0;
    while (pairsBox.querySelectorAll(".optrow").length < pairs.length && addPair) addPair.click();
    var rows = pairsBox.querySelectorAll(".optrow");
    var n = 0;
    pairs.forEach(function (p, i) {
      if (!rows[i]) return;
      setVal(rows[i].querySelector(".pa"), p.l || p.en || "");
      setVal(rows[i].querySelector(".pb"), p.r || p.ru || "");
      n++;
    });
    // убрать лишние пустые пары
    rows = [].slice.call(pairsBox.querySelectorAll(".optrow"));
    for (var k = rows.length - 1; k >= pairs.length && k >= 2; k--) { var rm = rows[k].querySelector(".rm"); if (rm) rm.click(); }
    return n;
  }

  async function generate(btn) {
    var type = document.getElementById("type").value;
    if (!SUPPORTED[type]) { status("Для этого типа автосборка пока недоступна", "err"); return; }
    var unitSel = document.getElementById("unit");
    var unitId = unitSel && unitSel.value;
    if (!unitId) { status("Сначала выбери юнит вверху", "err"); return; }
    var words = unitWords(unitId);
    if (!words.length) { status("В этом юните нет слов — добавь их в конструкторе учебников", "err"); return; }
    var title = unitSel.options[unitSel.selectedIndex].text.replace(/^📖\s*/, "");

    var old = btn.textContent;
    btn.disabled = true; btn.textContent = "🤖 собираю задания…"; status("Ассистент придумывает задания из слов юнита…", "");

    var task = (type === "match") ? "exercise" : "exercise";
    var res = await SM_AI.call("exercise", { type: type, words: words, title: title, count: Math.min(6, Math.max(4, words.length)) });
    btn.disabled = false; btn.textContent = old;

    if (!res.ok) { status(res.error, "err"); return; }
    var data = res.data || {};
    var made = 0;
    if (type === "match") made = fillMatch(data.pairs || []);
    else made = fillBlockTypes(type, data.items || []);

    if (!made) { status("Ассистент не вернул задания — попробуй ещё раз", "err"); return; }
    status("Готово: собрано заданий — " + made + ". Проверь, поправь и нажми «Сохранить». 👇", "ok");
    try { document.getElementById("save").scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
  }

  function injectButton(type) {
    var fields = document.getElementById("fields");
    if (!fields) return;
    var existing = document.getElementById("aiGenWrap");
    if (existing) existing.remove();
    if (!SUPPORTED[type]) return;

    var wrap = document.createElement("div");
    wrap.id = "aiGenWrap";
    wrap.style.cssText = "margin:0 0 14px";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "🤖 Собрать задания из слов юнита";
    btn.style.cssText = "width:100%;background:#2980b9;color:#fff;border:0;border-radius:14px;padding:13px;font:800 15px 'Nunito',sans-serif;cursor:pointer;box-shadow:0 4px 0 #1c5a85";
    btn.onclick = function () { generate(btn); };
    var hint = document.createElement("div");
    hint.style.cssText = "font:700 12px 'Nunito',sans-serif;color:#8a7a68;margin:7px 2px 0;line-height:1.5";
    hint.textContent = "Claude придумает задания из слов выбранного юнита и заполнит форму. Ты проверяешь и сохраняешь.";
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
    // и сразу для текущего типа
    var t = document.getElementById("type");
    if (t && document.getElementById("fields")) { try { injectButton(t.value); } catch (e) {} }
    return true;
  }

  var tries = 0;
  var iv = setInterval(function () {
    if (hook() || ++tries > 60) clearInterval(iv);
  }, 200);
})();
