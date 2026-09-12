/* ===========================================================================
   sm-speech.js — произношение для English with Asya.

   1) Оценка по распознаванию речи браузера: ученик говорит — движок сверяет
      с эталоном и выдаёт 0–100 с пословной подсветкой (ok / near / miss).
   2) Разбор связной речи: где слова сцепляются, какие звуки выпадают,
      сливаются или ослабевают, и как фраза звучит в потоке.

   Без зависимостей и без платных сервисов. Если на странице есть sm-play.js
   (SMP) — берёт оттуда звук и конфетти.

   API:
     SMS.supported()                  -> есть ли распознавание речи
     SMS.listen(target, opts)         -> Promise<{score, words, heard}>
        opts: { lang:"en-GB", timeout:6000 }
     SMS.session(target, opts)        -> {stop(): Promise<res|null>, abort()} | null
        слушает, пока не вызовут stop(). opts: { lang, onInterim(text) }
     SMS.button(target, opts)         -> DOM-кнопка «🎤» с результатом рядом
     SMS.score(target, heard)         -> {score, words, heard} (без микрофона)
     SMS.flow(text, {accent:"GB"|"US"}) -> разбор связной речи, см. ниже
   =========================================================================== */
(function () {
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;

  /* ====================== ОЦЕНКА ====================== */

  var NUM = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];

  /* Разговорные формы и сокращения приводим к полным — чтобы «gonna»
     и «going to», «don't» и «do not» считались одним и тем же. */
  var EXPAND = [
    [/\bgonna\b/g, "going to"], [/\bwanna\b/g, "want to"], [/\bgotta\b/g, "got to"],
    [/\bhafta\b/g, "have to"], [/\bkinda\b/g, "kind of"], [/\bsorta\b/g, "sort of"],
    [/\boutta\b/g, "out of"], [/\blemme\b/g, "let me"], [/\bgimme\b/g, "give me"],
    [/\bdunno\b/g, "don't know"], [/\bya\b/g, "you"], [/\bcuz\b/g, "because"],
    [/\bwon't\b/g, "will not"], [/\bcan't\b/g, "can not"], [/\bcannot\b/g, "can not"],
    [/\bain't\b/g, "is not"], [/n't\b/g, " not"], [/'re\b/g, " are"], [/'ve\b/g, " have"],
    [/'ll\b/g, " will"], [/'m\b/g, " am"], [/'d\b/g, " would"], [/\blet's\b/g, "let us"],
    [/\b(it|that|what|there|here|he|she|who|where|how)'s\b/g, "$1 is"],
    [/\bok\b/g, "okay"]
  ];

  function norm(s) {
    s = (s || "").toLowerCase().replace(/[’‘`´]/g, "'");
    s = s.replace(/\b\d+\b/g, function (d) { return +d <= 20 ? NUM[+d] : d; });
    s = s.replace(/[^a-z0-9'\s-]/g, " ").replace(/-/g, " ");
    EXPAND.forEach(function (r) { s = s.replace(r[0], r[1]); });
    return s.replace(/'/g, "").replace(/\s+/g, " ").trim();
  }

  function lev(a, b) {
    if (a === b) return 0;
    var m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur[0] = i;
      for (j = 1; j <= n; j++) {
        var cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      }
      for (j = 0; j <= n; j++) prev[j] = cur[j];
    }
    return cur[n];
  }

  function sim(a, b) {
    var d = lev(a, b), L = Math.max(a.length, b.length) || 1;
    return 1 - d / L;
  }

  /* Сравнение с учётом порядка слов: выравнивание как в diff,
     максимизируем суммарную похожесть. */
  function score(target, heard) {
    var T = norm(target).split(" ").filter(Boolean);
    var H = norm(heard).split(" ").filter(Boolean);
    var n = T.length, m = H.length, i, j;
    var D = [], B = [];
    for (i = 0; i <= n; i++) { D[i] = []; B[i] = []; for (j = 0; j <= m; j++) { D[i][j] = 0; B[i][j] = 0; } }
    for (i = 1; i <= n; i++) {
      for (j = 1; j <= m; j++) {
        var s = sim(T[i - 1], H[j - 1]);
        var diag = s >= 0.5 ? D[i - 1][j - 1] + s : -1;
        var up = D[i - 1][j], left = D[i][j - 1];
        if (diag >= up && diag >= left) { D[i][j] = diag; B[i][j] = 1; }
        else if (up >= left) { D[i][j] = up; B[i][j] = 2; }
        else { D[i][j] = left; B[i][j] = 3; }
      }
    }
    var match = [];
    i = n; j = m;
    while (i > 0 && j > 0) {
      if (B[i][j] === 1) { match[i - 1] = sim(T[i - 1], H[j - 1]); i--; j--; }
      else if (B[i][j] === 2) i--;
      else j--;
    }
    var sum = 0, words = T.map(function (t, k) {
      var v = match[k] || 0;
      sum += v;
      return { word: t, sim: v, state: v >= 0.85 ? "ok" : v >= 0.6 ? "near" : "miss" };
    });
    return { score: n ? Math.round(sum / n * 100) : 0, words: words, heard: H.join(" ") };
  }

  function bestOf(target, alts) {
    var best = null;
    alts.forEach(function (a) {
      var r = score(target, a);
      if (!best || r.score > best.score) best = r;
    });
    return best;
  }

  function listen(target, opts) {
    opts = opts || {};
    return new Promise(function (resolve, reject) {
      if (!SR) { reject(new Error("no-speech-recognition")); return; }
      var rec = new SR();
      rec.lang = opts.lang || "en-GB";
      rec.interimResults = false;
      rec.maxAlternatives = 3;
      var done = false;
      var timer = setTimeout(function () {
        if (!done) { done = true; try { rec.stop(); } catch (e) {} reject(new Error("timeout")); }
      }, opts.timeout || 6000);
      rec.onresult = function (e) {
        if (done) return; done = true; clearTimeout(timer);
        var alts = [], r = e.results[0];
        for (var i = 0; i < r.length; i++) alts.push(r[i].transcript);
        resolve(bestOf(target, alts));
      };
      rec.onerror = function (e) {
        if (done) return; done = true; clearTimeout(timer);
        reject(new Error(e.error || "speech-error"));
      };
      try { rec.start(); } catch (e) { clearTimeout(timer); reject(e); }
    });
  }

  /* Слушает, пока не скажут stop(). Нужен там, где параллельно
     идёт запись звука и длину фразы решает сам ученик. */
  function session(target, opts) {
    opts = opts || {};
    if (!SR) return null;
    var rec;
    try { rec = new SR(); } catch (e) { return null; }
    rec.lang = opts.lang || "en-GB";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 3;

    var finals = [], interim = "", ended = false, onEnd = null, err = null;

    function text() {
      return finals.filter(Boolean).map(function (a) { return a[0]; }).join(" ") + (interim ? " " + interim : "");
    }
    rec.onresult = function (e) {
      interim = "";
      for (var i = e.resultIndex; i < e.results.length; i++) {
        var r = e.results[i];
        if (r.isFinal) {
          var alts = [];
          for (var k = 0; k < r.length; k++) alts.push(r[k].transcript);
          finals[i] = alts;
        } else interim += r[0].transcript + " ";
      }
      interim = interim.trim();
      if (typeof opts.onInterim === "function") { try { opts.onInterim(text().trim()); } catch (x) {} }
    };
    rec.onerror = function (e) { err = e.error || "speech-error"; };
    rec.onend = function () { ended = true; if (onEnd) onEnd(); };
    try { rec.start(); } catch (e) { return null; }

    function result() {
      var got = finals.filter(Boolean);
      if (!got.length && !interim) return null;
      if (got.length === 1 && !interim) return bestOf(target, got[0]);
      return score(target, text());
    }

    return {
      stop: function () {
        return new Promise(function (resolve) {
          var fin = function () { onEnd = null; var r = result(); if (!r && err) r = null; resolve(r); };
          if (ended) { fin(); return; }
          onEnd = fin;
          try { rec.stop(); } catch (e) { fin(); return; }
          setTimeout(function () { if (onEnd) fin(); }, 2500);
        });
      },
      abort: function () { try { rec.abort(); } catch (e) {} },
      error: function () { return err; }
    };
  }

  function fb(res, threshold) {
    var win = res.score >= threshold;
    try {
      if (window.SMP) {
        if (win) { SMP.sfx && SMP.sfx("ok"); SMP.confetti && SMP.confetti(); }
        else { SMP.sfx && SMP.sfx("no"); }
      }
    } catch (e) {}
    return win;
  }

  function button(target, opts) {
    opts = opts || {};
    var threshold = opts.threshold || 80;
    var wrap = document.createElement("span");
    wrap.className = "sms-wrap";
    wrap.style.cssText = "display:inline-flex;align-items:center;gap:8px;vertical-align:middle";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sms-btn";
    btn.setAttribute("aria-label", "Проверить произношение: " + target);
    btn.textContent = "🎤";
    btn.style.cssText = "border:0;cursor:pointer;font-size:18px;line-height:1;padding:8px 10px;border-radius:12px;background:#eef1f6;transition:transform .1s";

    var out = document.createElement("span");
    out.className = "sms-out";
    out.setAttribute("aria-live", "polite");
    out.style.cssText = "font:13px/1.3 -apple-system,Segoe UI,Roboto,sans-serif;min-width:0";

    if (!SR) {
      btn.disabled = true; btn.style.opacity = ".5"; btn.style.cursor = "not-allowed";
      out.textContent = "Распознавание речи не поддерживается этим браузером (нужен Chrome/Edge).";
      wrap.appendChild(btn); wrap.appendChild(out); return wrap;
    }

    btn.addEventListener("click", function () {
      out.textContent = "Слушаю…"; btn.style.transform = "scale(1.1)"; btn.disabled = true;
      listen(target, opts).then(function (res) {
        btn.style.transform = ""; btn.disabled = false;
        var win = fb(res, threshold);
        var color = res.score >= threshold ? "#12b76a" : res.score >= 50 ? "#e0a800" : "#d92d20";
        var wl = res.words.map(function (w) {
          var c = w.state === "ok" ? "#12b76a" : w.state === "near" ? "#e0a800" : "#d92d20";
          return '<span style="color:' + c + ';font-weight:600">' + w.word + "</span>";
        }).join(" ");
        out.innerHTML = '<b style="color:' + color + '">' + res.score + "%</b> &nbsp;" + wl +
          (win ? ' &nbsp;✅' : "");
        if (typeof opts.onResult === "function") opts.onResult(res, win);
      }).catch(function (err) {
        btn.style.transform = ""; btn.disabled = false;
        var msg = err && err.message === "timeout" ? "Не расслышала — попробуй ещё раз."
          : err && err.message === "not-allowed" ? "Нужен доступ к микрофону."
          : "Не получилось распознать. Ещё раз?";
        out.textContent = msg;
      });
    });

    wrap.appendChild(btn); wrap.appendChild(out);
    return wrap;
  }

  /* ====================== СВЯЗНАЯ РЕЧЬ ======================
     Разбор по правилам: смотрим, каким звуком кончается слово и каким
     начинается следующее. Правила учебные (как в Rachel's English и
     English Pronunciation in Use) — это подсказка, где искать, а не фонетическая
     транскрипция конкретного диктора.

     SMS.flow(text, {accent}) -> {
       tokens: [{raw, w, stress, weak:{ipa,say}|null, cutStart, cutEnd, endMark, brk}],
       links:  [pattern|null]   — между словом i и i+1
       spans:  [{from, to, say}] — разговорные сокращения (gonna …)
       items:  [{type, name, words, note, sound}] — список для легенды
       say:    «звучит примерно как»
       chunks: [строка]          — смысловые кусочки для отработки
     }                                                                    */

  var FUNC_TH = /^(the|this|that|these|those|they|them|their|theirs|there|then|than|though|thus|themselves)$/;

  /* слабые формы: [IPA, как примерно звучит латиницей]; (r) — только в американском
     или перед гласной */
  var WEAK = {
    a: ["ə", "ə"], an: ["ən", "ən"], the: ["ðə", "thə"], and: ["ən", "ən"], or: ["ə(r)", "ə(r)"],
    but: ["bət", "bət"], as: ["əz", "əz"], at: ["ət", "ət"], "for": ["fə(r)", "fə(r)"],
    from: ["frəm", "frəm"], of: ["əv", "əv"], to: ["tə", "tə"], than: ["ðən", "thən"],
    some: ["səm", "səm"], them: ["ðəm", "thəm"], her: ["hə(r)", "hə(r)"], him: ["hɪm", "him"],
    his: ["hɪz", "hiz"], you: ["jə", "yə"], your: ["jə(r)", "yə(r)"], are: ["ə(r)", "ə(r)"],
    was: ["wəz", "wəz"], were: ["wə(r)", "wə(r)"], can: ["kən", "kən"], could: ["kəd", "kəd"],
    would: ["wəd", "wəd"], should: ["ʃəd", "shəd"], must: ["məst", "məst"], have: ["həv", "həv"],
    has: ["həz", "həz"], had: ["həd", "həd"], "do": ["də", "də"], does: ["dəz", "dəz"], am: ["əm", "əm"]
  };
  var UNSTRESSED = /^(i|me|my|it|its|in|on|with|by|we|us|he|she|they|their|our|is|be|been|will|if|into|onto|who|which|that|there|it's|i'm|you're|we're|they're|he's|she's|i've|i'll|you'll|we'll)$/;
  var PARTICIPLE = /^(been|got|gotten|done|seen|had|gone|made|said|told|taken|given|known|shown|found|left|lost|met|heard|thought|bought|brought|put|read|come|become|eaten|written|spoken|broken|chosen|driven|flown|forgotten|begun|drunk|sung|swum|worn|won)$|ed$|en$/;
  var DETERMINER = /^(the|a|an|my|your|his|her|our|their|this|that|these|those|school|work|bed|church|london|paris|there|here|home)$/;
  var PRONOUN = /^(i|you|we|they|he|she|it)$/;
  var WH = /^(what|where|when|why|how|who|which)$/;

  var REDUCE = [
    { w: ["what", "do", "you"], say: "whaddaya" },
    { w: ["what", "are", "you"], say: "whatcha" },
    { w: ["a", "lot", "of"], say: "alotta" },
    { w: ["going", "to"], say: "gonna", need: "verb" },
    { w: ["want", "to"], say: "wanna" },
    { w: ["got", "to"], say: "gotta", need: "verb" },
    { w: ["have", "to"], say: "hafta" },
    { w: ["has", "to"], say: "hasta" },
    { w: ["kind", "of"], say: "kinda" },
    { w: ["sort", "of"], say: "sorta" },
    { w: ["out", "of"], say: "outta" },
    { w: ["lots", "of"], say: "lotsa" },
    { w: ["let", "me"], say: "lemme" },
    { w: ["give", "me"], say: "gimme" },
    { w: ["don't", "know"], say: "dunno" },
    { w: ["did", "you"], say: "didja" },
    { w: ["would", "you"], say: "wouldja" },
    { w: ["could", "you"], say: "couldja" },
    { w: ["don't", "you"], say: "donchu" },
    { w: ["got", "you"], say: "gotcha" },
    { w: ["bet", "you"], say: "betcha" }
  ];

  var NAMES = {
    link: "Сцепление", linkr: "Связующий r", glide: "Вставной звук", elide: "Выпадение t / d",
    hold: "Один звук на двоих", assim: "Слияние звуков", flap: "Американский t",
    hdrop: "Выпадение h", reduce: "Разговорная форма", weak: "Слабые формы"
  };

  function soundWord(w) {
    w = w.toLowerCase().replace(/[’‘`]/g, "'");
    if (/^\d+$/.test(w)) w = +w <= 20 ? NUM[+w] : "number";
    return w;
  }

  function startInfo(w) {
    if (/^(hour|honest|honou?r|heir)/.test(w)) return { v: true };
    if (/^(one|once)$/.test(w)) return { c: "w" };
    if (/^(uni|use|usu|uti|ura|euro|eu|ewe)/.test(w)) return { c: "j" };
    var f = w.charAt(0), f2 = w.slice(0, 2);
    if ("aeiou".indexOf(f) >= 0) return { v: true };
    if (f === "y") return { c: "j" };
    if (f2 === "wh" || f === "w") return { c: "w" };
    if (f2 === "wr") return { c: "r" };
    if (f2 === "kn" || f2 === "gn") return { c: "n" };
    if (f2 === "ph") return { c: "f" };
    if (f2 === "sh") return { c: "ʃ" };
    if (f2 === "ch") return { c: "tʃ" };
    if (f2 === "th") return { c: FUNC_TH.test(w) ? "ð" : "θ" };
    if (f2 === "qu") return { c: "k" };
    if (f === "c") return { c: /^c[eiy]/.test(w) ? "s" : "k" };
    if (f === "x") return { c: "z" };
    if (f === "j") return { c: "dʒ" };
    return { c: f };
  }

  var CONS = /[bcdfghjklmnpqrstvwxz]$/;

  /* каким звуком кончается слово. v — гласная, g — после неё легко
     появляется [j] или [w], r — связующий r, c — согласный,
     cl — t/d стоит после другого согласного (может выпасть), n — сколько
     букв занимает этот согласный на конце */
  function endInfo(w) {
    if (/n't$/.test(w)) return { c: "t", cl: true, n: 1 };
    if (/'s$/.test(w)) return { c: "z", n: 1 };
    if (/'re$/.test(w)) return { r: true };
    if (/'ve$/.test(w)) return { c: "v", n: 1 };
    if (/'ll$/.test(w)) return { c: "l", n: 2 };
    if (/'d$/.test(w)) return { c: "d", n: 1 };
    if (/'m$/.test(w)) return { c: "m", n: 1 };
    if (/^(the|be|he|me|she|we)$/.test(w) || /ee$/.test(w)) return { v: true, g: "j" };
    if (/^(though|although|dough|through|thorough)$/.test(w)) return { v: true, g: "w" };
    if (/(augh|ough)$/.test(w)) return { c: "f", n: 2 };
    if (/igh$/.test(w)) return { v: true, g: "j" };
    if (/(ay|ey|oy|uy|ie|i)$/.test(w)) return { v: true, g: "j" };
    if (/[^aeiou]y$/.test(w)) return { v: true, g: "j" };
    if (/(ow|ew|oo|ue|oe|o|u)$/.test(w)) return { v: true, g: "w" };
    if (/a$/.test(w)) return { v: true };
    if (/(r|re)$/.test(w) && !/[^aeiou]re$/.test(w.replace(/(ere|ire|ore|ure|are)$/, "r"))) return { r: true };
    if (/ng$/.test(w)) return { c: "ŋ", n: 2 };
    if (/mb$/.test(w)) return { c: "m", n: 2 };
    if (/ck$/.test(w)) return { c: "k", n: 2 };
    if (/tch$/.test(w)) return { c: "tʃ", n: 3 };
    if (/ch$/.test(w)) return { c: "tʃ", n: 2 };
    if (/sh$/.test(w)) return { c: "ʃ", n: 2 };
    if (/th$/.test(w)) return { c: /^(with|smooth|bathe)$/.test(w) ? "ð" : "θ", n: 2 };
    if (/ph$/.test(w)) return { c: "f", n: 2 };
    if (/ght$/.test(w)) return { c: "t", n: 1 };
    if (/ed$/.test(w) && w.length > 3 && !/eed$/.test(w)) {
      if (/[td]ed$/.test(w)) return { c: "d", n: 1 };
      if (/(p|k|ss|sh|ch|x|f|c)ed$/.test(w)) return { c: "t", cl: true, n: 2 };
      return { c: "d", cl: CONS.test(w.slice(0, -2)), n: 2 };
    }
    if (w.length > 2 && /[^aeiou]e$/.test(w)) {
      var st = w.slice(0, -1), last = st.slice(-1);
      if (last === "c") return { c: "s", n: 2 };
      if (last === "g") return { c: "dʒ", n: 2 };
      if (last === "s") return { c: "z", n: 2 };
      if (last === "l" && /[^aeiou]le$/.test(w)) return { c: "l", n: 2 };
      var inner = endInfo(st);
      if (inner.c) inner.n = (inner.n || 1) + 1;
      return inner;
    }
    var L = w.slice(-1);
    if (!CONS.test(L)) return { v: true };
    var dbl = w.length > 1 && w.slice(-2, -1) === L;
    var info = { c: L === "c" ? "k" : L === "x" ? "ks" : L, n: dbl ? 2 : 1 };
    if ((L === "t" || L === "d") && !dbl) {
      info.cl = /[bcfgjklmnpqsvxz]$/.test(w.slice(0, -1));
    }
    return info;
  }

  var FAMILY = { t: "td", d: "td", p: "pb", b: "pb", k: "kg", g: "kg", s: "sz", z: "sz", f: "fv", v: "fv", "θ": "θð", "ð": "θð" };
  function sameFamily(a, b) {
    if (!a || !b) return false;
    if (a === b) return true;
    return !!FAMILY[a] && FAMILY[a] === FAMILY[b];
  }

  function flow(text, opts) {
    opts = opts || {};
    var US = opts.accent === "US";
    var src = String(text || "").replace(/[’‘`´]/g, "'");
    var re = /[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*|[.,!?;:—–…()"«»]/g, m, tokens = [];
    while ((m = re.exec(src))) {
      if (/^[A-Za-z0-9]/.test(m[0])) {
        tokens.push({ raw: m[0], w: soundWord(m[0]), brk: false });
      } else if (tokens.length) {
        tokens[tokens.length - 1].brk = true;
      }
    }
    var n = tokens.length;
    if (n) tokens[n - 1].brk = true;

    tokens.forEach(function (t, i) {
      t.s = startInfo(t.w.replace(/^[^a-z]+/, ""));
      t.e = endInfo(t.w);
      t.first = i === 0 || tokens[i - 1].brk;
      t.cutStart = 0; t.cutEnd = 0; t.endMark = null;
    });

    /* --- разговорные сокращения --- */
    var spans = [], inSpan = [];
    for (var i = 0; i < n; i++) {
      if (inSpan[i]) continue;
      for (var r = 0; r < REDUCE.length; r++) {
        var R = REDUCE[r], L = R.w.length, ok = i + L <= n;
        for (var k = 0; ok && k < L; k++) {
          if (tokens[i + k].w !== R.w[k]) ok = false;
          if (ok && k < L - 1 && tokens[i + k].brk) ok = false;
        }
        if (!ok) continue;
        if (R.need === "verb") {
          var nx = tokens[i + L];
          if (!nx || tokens[i + L - 1].brk || DETERMINER.test(nx.w) || /^[A-Z]/.test(nx.raw) && nx.w !== "i") continue;
        }
        spans.push({ from: i, to: i + L - 1, say: R.say, words: tokens.slice(i, i + L).map(function (t) { return t.raw; }).join(" ") });
        for (k = 0; k < L; k++) inSpan[i + k] = spans.length;
        break;
      }
    }

    /* --- ударение и слабые формы --- */
    tokens.forEach(function (t, i) {
      var nx = tokens[i + 1];
      t.weak = null;
      var clauseEnd = t.brk;
      var wk = WEAK[t.w];
      if (wk && !clauseEnd && !inSpan[i]) {
        var use = true;
        if (/^(have|has|had)$/.test(t.w)) use = !!nx && PARTICIPLE.test(nx.w);
        if (/^(do|does)$/.test(t.w)) use = !!nx && ((t.first && PRONOUN.test(nx.w)) || (i > 0 && WH.test(tokens[i - 1].w)));
        if (t.w === "some") use = !t.first;
        if (t.w === "that") use = false;
        if (t.w === "you" && nx && nx.s.v) use = false;     // you‿(w)‿about — гласная полная
        if (use) {
          var ipa = wk[0], say = wk[1];
          var beforeVowel = nx && nx.s.v;
          if (t.w === "the" && beforeVowel) { ipa = "ði"; say = "thee"; }
          if (t.w === "to" && beforeVowel) { ipa = "tu"; say = "tu"; }
          if (t.w === "of" && nx && !nx.s.v) { ipa = "ə"; say = "ə"; }
          var rOn = US || beforeVowel;
          ipa = ipa.replace("(r)", rOn ? "r" : "");
          say = say.replace("(r)", rOn ? "r" : "");
          t.weak = { ipa: ipa, say: say };
          if (t.w === "of" && nx && !nx.s.v) { t.e = { v: true }; }
        }
      }
      var fn = !!WEAK[t.w] || UNSTRESSED.test(t.w);
      t.stress = !fn || (clauseEnd && !UNSTRESSED.test(t.w) && t.w !== "a" && t.w !== "the") || /n't$/.test(t.w) || t.w === "not";
      if (t.weak) t.stress = false;
    });

    /* --- стыки слов --- */
    var links = [];
    for (i = 0; i < n - 1; i++) {
      var A = tokens[i], B = tokens[i + 1], p = null;
      links[i] = null;
      if (A.brk) continue;
      if (inSpan[i] && inSpan[i] === inSpan[i + 1]) { links[i] = { type: "in-span" }; continue; }
      if (inSpan[i] || inSpan[i + 1]) continue;

      var ae = A.e, bs = B.s;

      /* h и th в безударных him/her/his/have/has/had/them */
      if (B.weak && /^(him|her|his|have|has|had)$/.test(B.w) && (ae.c || ae.r)) {
        B.cutStart = 1;
        B.weak.ipa = B.weak.ipa.replace(/^h/, ""); B.weak.say = B.weak.say.replace(/^h/, "");
        p = { type: "hdrop", sound: B.weak.say,
          note: "В безударном «" + B.w + "» h не произносится — слово прилипает к предыдущему." };
      } else if (B.weak && B.w === "them" && (ae.c || ae.r)) {
        B.cutStart = 2; B.weak.say = "əm"; B.weak.ipa = "əm";
        p = { type: "hdrop", sound: "'em",
          note: "В быстрой речи «them» теряет th и звучит как «'em»." };
      }
      else if (ae.c && bs.c) {
        if (bs.c === "j" && /^(you|your|yours|yourself|yet)$/.test(B.w) && /^(t|d|s|z)$/.test(ae.c)) {
          var MAP = { t: ["tʃ", "ch", "t + y сливаются в [tʃ] — «ч»."], d: ["dʒ", "j", "d + y сливаются в [dʒ] — «дж»."],
            s: ["ʃ", "sh", "s + y сливаются в [ʃ] — «ш»."], z: ["ʒ", "zh", "z + y сливаются в [ʒ] — мягкое «ж»."] };
          var mp = MAP[ae.c];
          A.cutEnd = ae.n || 1; A.endMark = { cls: "as", label: mp[0] };
          B.cutStart = 1;
          p = { type: "assim", glue: mp[1], sound: mp[0], note: mp[2] };
        } else if (ae.c === "t" && ae.cl && sameFamily("t", bs.c) === false && !A.weak ||
                   ae.c === "d" && ae.cl && !A.weak && !sameFamily("d", bs.c)) {
          A.cutEnd = ae.n || 1; A.endMark = { cls: "el" };
          p = { type: "elide", note: "Между согласными " + ae.c + " почти не слышен: язык готовится, но звук не «взрывается»." };
        } else if (sameFamily(ae.c, bs.c)) {
          A.endMark = { cls: "hd" };
          p = { type: "hold", note: "Одинаковые согласные на стыке не повторяются: держишь один звук чуть дольше и сразу говоришь следующее слово." };
          if ((ae.c === "t" || ae.c === "d") && ae.cl) p.note = "Здесь " + ae.c + " сливается со следующим — звучит один согласный.";
        } else if (ae.c === "n" && /^(p|b|m)$/.test(bs.c) && /n$/.test(A.w)) {
          A.endMark = { cls: "as", label: "m" };
          p = { type: "assim", glue: "m", sound: "m", note: "n перед p, b, m губы уже сомкнуты — получается [m]." };
          A.cutEnd = 1;
        }
      }
      else if ((ae.c || ae.r) && bs.v) {
        if (ae.r) {
          p = { type: "linkr", sound: "r", note: US
            ? "r на конце цепляется к гласной следующего слова."
            : "В британском r на конце не читается, но перед гласной появляется и связывает слова." };
        } else if (US && ae.c === "t" && !ae.cl && !/tt$/.test(A.w)) {
          A.endMark = { cls: "fl", label: "d" };
          p = { type: "flap", sound: "d", note: "t между гласными звучит как быстрый мягкий [d]." };
        } else {
          p = { type: "link", note: "Согласный на конце перетекает в гласную следующего слова — звучит как одно слово." };
        }
      }
      else if (ae.v && bs.v && ae.g) {
        p = { type: "glide", glue: ae.g === "j" ? "y" : "w", sound: ae.g,
          note: "Между гласными появляется лёгкий [" + ae.g + "], чтобы голос не обрывался." };
        if (A.w === "the") p.note += " «The» перед гласной читается [ði].";
        if (A.w === "to" && A.weak) p.note += " «To» перед гласной — [tu].";
      }
      if (p) {
        p.words = A.raw + "‿" + B.raw;
        links[i] = p;
      }
    }

    /* --- «звучит примерно как» --- */
    function cut(s, a, b) { return s.slice(a, s.length - b); }
    var out = [], sep = "";
    for (i = 0; i < n; i++) {
      var t = tokens[i];
      if (inSpan[i]) {
        var sp = spans[inSpan[i] - 1];
        if (sp.from === i) { out.push(sep + sp.say); }
        sep = sp.to === i ? (t.brk ? " / " : " ") : "";
        continue;
      }
      var base = /^i($|')/.test(t.w) ? "I" + t.w.slice(1) : t.w;
      var say = t.weak ? t.weak.say : base;
      if (!t.weak && t.cutStart) say = say.slice(t.cutStart);
      var lk = links[i];
      if (lk && lk.type === "elide") say = t.w.slice(0, -(t.e.n || 1)).replace(/'$/, "");
      if (lk && lk.type === "assim") say = cut(t.weak ? t.weak.say : base, 0, t.cutEnd) + lk.glue;
      if (lk && lk.type === "flap") say = say.replace(/t(e?)$/, "d");
      if (lk && lk.type === "hold") say = say.replace(/(ck|[bcdfgkpstvz])$/, "");
      /* немая e на конце перед сцеплением не нужна: have‿a → havə */
      if (lk && /^(link|hdrop|flap)$/.test(lk.type) && !t.weak && /[aeiou][bcdfgkmnpstvz]e$/.test(say)) say = say.slice(0, -1);
      var prev = links[i - 1];
      if (prev && prev.type === "assim" && t.cutStart) say = say.slice(1);
      out.push(sep + say);
      sep = t.brk ? " / "
        : !lk ? " "
        : lk.type === "elide" ? " "
        : lk.type === "glide" ? "‿" + lk.glue + "‿"
        : lk.type === "link" || lk.type === "linkr" ? "‿"
        : "";
    }
    var sayStr = out.join("").replace(/\s*\/\s*$/, "").replace(/\s+/g, " ").trim();

    /* --- кусочки для отработки --- */
    var groups = [], cur = [];
    for (i = 0; i < n; i++) {
      cur.push(i);
      var joined = links[i] && !tokens[i].brk;
      if (!joined || i === n - 1) { groups.push({ idx: cur, brk: tokens[i].brk }); cur = []; }
    }
    var chunks = [], ch = [];
    groups.forEach(function (g, gi) {
      if (ch.length && ch.length + g.idx.length > 4) { chunks.push(ch); ch = []; }
      ch = ch.concat(g.idx);
      if (g.brk || gi === groups.length - 1) { chunks.push(ch); ch = []; }
    });
    chunks = chunks.filter(function (c) { return c.length; }).map(function (c) {
      return c.map(function (k) { return tokens[k].raw; }).join(" ");
    });

    /* --- список для легенды --- */
    var items = [];
    spans.forEach(function (s) {
      items.push({ type: "reduce", name: NAMES.reduce, words: s.words, sound: s.say,
        note: "Так говорят в быстрой разговорной речи. Понимать нужно обязательно, писать так — только в переписке." });
    });
    links.forEach(function (l) {
      if (!l || l.type === "in-span") return;
      items.push({ type: l.type, name: NAMES[l.type], words: l.words, sound: l.sound || "", note: l.note });
    });
    var weakList = tokens.filter(function (t) { return t.weak; });
    if (weakList.length) {
      items.push({ type: "weak", name: NAMES.weak,
        words: weakList.map(function (t) { return t.raw + " [" + t.weak.ipa + "]"; }).join(", "),
        note: "Служебные слова без ударения: гласная сжимается до короткого [ə]. Ударение получают смысловые слова." });
    }

    return { tokens: tokens, links: links, spans: spans, items: items, say: sayStr, chunks: chunks, accent: US ? "US" : "GB" };
  }

  window.SMS = {
    supported: function () { return !!SR; },
    listen: listen,
    session: session,
    button: button,
    score: score,
    norm: norm,
    flow: flow,
    names: NAMES
  };
})();
