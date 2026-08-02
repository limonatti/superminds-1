/* ===========================================================================
   sm-speech.js — движок оценки произношения для English with Asya.
   Ученик произносит слово/фразу — движок распознаёт речь, сверяет с эталоном
   и выдаёт оценку 0–100 с пословной подсветкой (верно / близко / мимо).

   Без зависимостей. Если на странице подключён sm-play.js (SMP) — использует
   его звук и конфетти; если нет — работает и так.

   API:
     SMS.supported()                         -> true/false (есть ли распознавание)
     SMS.listen(target, opts)                -> Promise<{score, words, heard}>
        opts: { lang:"en-GB", timeout:6000 }
     SMS.button(target, opts)                -> DOM-кнопка «🎤», сама показывает
        результат рядом. opts: { lang, onResult(res), threshold:80 }
     SMS.score(target, heard)                -> {score, words, heard} (без микрофона)

   Пример на странице:
     <script src="sm-play.js"></script>   // необязательно, для звука/конфетти
     <script src="sm-speech.js"></script>
     <span id="w">apple</span>
     <script>
       document.getElementById('w')
         .after(SMS.button('apple', {threshold:80}));
     </script>
   =========================================================================== */
(function () {
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;

  function norm(s) {
    return (s || "").toLowerCase()
      .replace(/[’'`]/g, "'")
      .replace(/[^a-z0-9'\s]/g, " ")
      .replace(/\s+/g, " ").trim();
  }

  // расстояние Левенштейна между двумя словами
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

  // похожесть 0..1 для одного слова
  function sim(a, b) {
    var d = lev(a, b), L = Math.max(a.length, b.length) || 1;
    return 1 - d / L;
  }

  /* Сравнить эталон и услышанное. Возвращает общий балл 0–100
     и разбор по словам эталона: state = "ok" | "near" | "miss". */
  function score(target, heard) {
    var T = norm(target).split(" ").filter(Boolean);
    var H = norm(heard).split(" ").filter(Boolean);
    var used = [], words = [], sum = 0;
    T.forEach(function (t) {
      var best = -1, bi = -1;
      H.forEach(function (h, i) {
        if (used[i]) return;
        var s = sim(t, h);
        if (s > best) { best = s; bi = i; }
      });
      if (bi >= 0 && best >= 0.5) used[bi] = true;
      var st = best >= 0.85 ? "ok" : best >= 0.6 ? "near" : "miss";
      words.push({ word: t, sim: Math.max(0, best), state: st });
      sum += Math.max(0, best);
    });
    var pct = T.length ? Math.round((sum / T.length) * 100) : 0;
    return { score: pct, words: words, heard: norm(heard) };
  }

  /* Запустить микрофон и вернуть Promise с результатом. */
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
        var alts = e.results[0], best = null, bestScore = -1;
        for (var i = 0; i < alts.length; i++) {
          var r = score(target, alts[i].transcript);
          if (r.score > bestScore) { bestScore = r.score; best = r; }
        }
        resolve(best);
      };
      rec.onerror = function (e) {
        if (done) return; done = true; clearTimeout(timer);
        reject(new Error(e.error || "speech-error"));
      };
      try { rec.start(); } catch (e) { clearTimeout(timer); reject(e); }
    });
  }

  function fb(res, threshold) {
    // обратная связь через существующий движок SMP, если он есть
    var win = res.score >= threshold;
    try {
      if (window.SMP) {
        if (win) { SMP.sfx && SMP.sfx("ok"); SMP.confetti && SMP.confetti(); }
        else { SMP.sfx && SMP.sfx("no"); }
      }
    } catch (e) {}
    return win;
  }

  /* Готовая кнопка-микрофон с инлайновым результатом. */
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

  window.SMS = {
    supported: function () { return !!SR; },
    listen: listen,
    button: button,
    score: score
  };
})();
