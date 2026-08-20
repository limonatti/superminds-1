/* sm-draft.js — черновики конструктора упражнений.
   Задача: не терять работу. Форма живёт в DOM, поэтому закрытая вкладка,
   случайная смена типа или перезагрузка стирали всё введённое.
   Теперь снимок формы пишется в localStorage на каждое изменение,
   а при возврате предлагается восстановить.

   Черновик хранится по ключу курс+юнит+тип — на каждый свой.
   Подключать в builder.html ПОСЛЕ основного скрипта. */
(function () {
  "use strict";

  var PREFIX = "sm-draft:";
  var SAVE_DELAY = 600;          // мс тишины перед записью
  var KEEP_DAYS = 14;            // старше — выбрасываем
  var timer = null, lastKey = null, statusEl = null;

  function $(id) { return document.getElementById(id); }
  function val(id) { var e = $(id); return e ? e.value : ""; }

  function key() {
    var c = val("course"), u = val("unit"), t = val("type");
    if (!u || !t) return null;
    return PREFIX + c + "|" + u + "|" + t;
  }

  /* ---------- снимок формы ---------- */

  /* Путь до поля внутри #fields: последовательность позиций среди соседей.
     Устойчив, пока разметка типа не меняется — а она у нас статична. */
  function pathOf(el, root) {
    var parts = [];
    while (el && el !== root) {
      var p = el.parentNode;
      if (!p) break;
      var i = 0, n = p.firstElementChild;
      while (n && n !== el) { i++; n = n.nextElementSibling; }
      parts.unshift(i);
      el = p;
    }
    return parts.join(".");
  }

  function nodeAt(path, root) {
    var parts = path.split(".");
    var el = root;
    for (var i = 0; i < parts.length && el; i++) {
      var idx = +parts[i], n = el.firstElementChild;
      while (n && idx-- > 0) n = n.nextElementSibling;
      el = n;
    }
    return el;
  }

  function counts() {
    var f = $("fields"); if (!f) return null;
    var out = { qblock: f.querySelectorAll(".qblock").length, opts: [], pairs: 0 };
    [].forEach.call(f.querySelectorAll(".qblock"), function (b) {
      out.opts.push(b.querySelectorAll(".optrow").length);
    });
    var pb = $("pairs");
    if (pb) out.pairs = pb.querySelectorAll(".optrow").length;
    return out;
  }

  function snapshot() {
    var f = $("fields"); if (!f) return null;
    var fields = [];
    [].forEach.call(f.querySelectorAll("input,textarea,select"), function (el) {
      if (el.type === "file" || el.type === "button") return;
      fields.push({
        p: pathOf(el, f),
        v: (el.type === "checkbox" || el.type === "radio") ? "" : el.value,
        c: (el.type === "checkbox" || el.type === "radio") ? !!el.checked : null
      });
    });
    return {
      v: 1, ts: Date.now(),
      course: val("course"), unit: val("unit"), book: val("book"),
      type: val("type"), title: val("title"), section: val("section"),
      counts: counts(), fields: fields
    };
  }

  function isEmpty(snap) {
    if (!snap) return true;
    if ((snap.title || "").trim()) return false;
    for (var i = 0; i < snap.fields.length; i++) {
      var x = snap.fields[i];
      if ((x.v || "").trim()) return false;
    }
    return true;
  }

  /* ---------- запись и чтение ---------- */

  function write() {
    var k = key(); if (!k) return;
    var snap = snapshot();
    if (isEmpty(snap)) { try { localStorage.removeItem(k); } catch (e) {} say(""); return; }
    try { localStorage.setItem(k, JSON.stringify(snap)); } catch (e) { return; }
    var d = new Date();
    say("черновик сохранён " + ("" + d.getHours()).padStart(2, "0") + ":" + ("" + d.getMinutes()).padStart(2, "0"));
  }

  function read(k) {
    try {
      var raw = localStorage.getItem(k); if (!raw) return null;
      var snap = JSON.parse(raw);
      if (!snap || snap.v !== 1) return null;
      if (Date.now() - snap.ts > KEEP_DAYS * 864e5) { localStorage.removeItem(k); return null; }
      return snap;
    } catch (e) { return null; }
  }

  function drop() {
    var k = key(); if (!k) return;
    try { localStorage.removeItem(k); } catch (e) {}
    say("");
  }

  function sweep() {
    try {
      var kill = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(PREFIX) === 0) {
          var s = read(k); if (!s) kill.push(k);
        }
      }
      kill.forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
    } catch (e) {}
  }

  /* ---------- восстановление ---------- */

  function restore(snap) {
    var f = $("fields"); if (!f || !snap) return false;

    if ($("title")) $("title").value = snap.title || "";
    if ($("section")) $("section").value = snap.section || "";
    if ($("book") && snap.book) $("book").value = snap.book;

    /* Динамические строки: дожимаем кнопки до нужного количества.
       Форма только что отрисована, DOM готов — клики отрабатывают сразу. */
    var c = snap.counts || {};
    var addBlock = $("addBlock");
    if (addBlock && c.qblock) {
      var guard = 0;
      while (f.querySelectorAll(".qblock").length < c.qblock && guard++ < 60) addBlock.click();
    }
    (c.opts || []).forEach(function (n, i) {
      var blk = f.querySelectorAll(".qblock")[i]; if (!blk) return;
      var add = blk.querySelector(".addOpt"); if (!add) return;
      var guard = 0;
      while (blk.querySelectorAll(".optrow").length < n && guard++ < 30) add.click();
    });
    var addPair = $("addPair"), pb = $("pairs");
    if (addPair && pb && c.pairs) {
      var g2 = 0;
      while (pb.querySelectorAll(".optrow").length < c.pairs && g2++ < 60) addPair.click();
    }

    snap.fields.forEach(function (x) {
      var el = nodeAt(x.p, f); if (!el) return;
      if (x.c !== null && x.c !== undefined) {
        if (el.type === "checkbox" || el.type === "radio") {
          el.checked = !!x.c;
          el.dispatchEvent(new Event("change", { bubbles: true }));
        }
        return;
      }
      el.value = x.v == null ? "" : x.v;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });

    /* Картинки к парам свёрнуты по умолчанию — раскрываем те, где что-то есть,
       иначе восстановленная картинка останется невидимой. */
    [].forEach.call(f.querySelectorAll(".pimgbox"), function (bx) {
      var has = [].some.call(bx.querySelectorAll(".img"), function (i) { return (i.value || "").trim(); });
      if (has) bx.style.display = "block";
    });
    return true;
  }

  /* ---------- полоска состояния ---------- */

  function bar() {
    if (statusEl && document.body.contains(statusEl)) return statusEl;
    var host = $("fields"); if (!host) return null;
    statusEl = document.createElement("div");
    statusEl.id = "draftBar";
    statusEl.style.cssText = "font:700 12px 'Nunito',sans-serif;color:#8a7a68;margin:0 2px 10px;display:flex;align-items:center;gap:10px;min-height:18px";
    host.parentNode.insertBefore(statusEl, host);
    return statusEl;
  }

  function say(txt) {
    var b = bar(); if (!b) return;
    b.textContent = txt || "";
  }

  function offer(snap) {
    var b = bar(); if (!b) return;
    b.innerHTML = "";
    var t = document.createElement("span");
    var d = new Date(snap.ts);
    t.textContent = "Есть несохранённый черновик от " +
      ("" + d.getHours()).padStart(2, "0") + ":" + ("" + d.getMinutes()).padStart(2, "0") + ".";
    var yes = document.createElement("button");
    yes.type = "button"; yes.textContent = "восстановить";
    yes.style.cssText = "background:#7c2340;color:#fff;border:0;border-radius:999px;padding:5px 13px;font:800 12px 'Nunito',sans-serif;cursor:pointer";
    var no = document.createElement("button");
    no.type = "button"; no.textContent = "удалить";
    no.style.cssText = "background:#eae9e9;color:#5a4f47;border:0;border-radius:999px;padding:5px 13px;font:800 12px 'Nunito',sans-serif;cursor:pointer";
    yes.onclick = function () { restore(snap); say("черновик восстановлен"); };
    no.onclick = function () { drop(); };
    b.appendChild(t); b.appendChild(yes); b.appendChild(no);
  }

  function check() {
    var k = key(); if (!k) return;
    lastKey = k;
    var snap = read(k);
    if (snap && !isEmpty(snap)) offer(snap); else say("");
  }

  /* ---------- подключение ---------- */

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(write, SAVE_DELAY);
  }

  function hook() {
    if (!$("fields") || typeof window.renderForm !== "function") return false;

    var orig = window.renderForm;
    window.renderForm = function (type, data) {
      var r = orig.apply(this, arguments);
      /* renderForm(type, data) — это загрузка на редактирование, черновик не нужен.
         renderForm(type) без data — новая форма, показываем предложение. */
      setTimeout(function () { if (data) say(""); else check(); }, 0);
      return r;
    };

    document.addEventListener("input", function (e) {
      if ($("fields") && $("fields").contains(e.target)) schedule();
    }, true);
    document.addEventListener("change", function (e) {
      var f = $("fields");
      if (f && f.contains(e.target)) schedule();
      if (e.target && (e.target.id === "title" || e.target.id === "section")) schedule();
    }, true);

    /* сохранение прошло — черновик больше не нужен */
    var save = $("save");
    if (save) save.addEventListener("click", function () { setTimeout(drop, 1200); });

    sweep();
    check();
    return true;
  }

  var tries = 0;
  var iv = setInterval(function () {
    if (hook() || ++tries > 60) clearInterval(iv);
  }, 200);

  window.SM_DRAFT = { write: write, drop: drop, snapshot: snapshot, restore: restore };
})();
