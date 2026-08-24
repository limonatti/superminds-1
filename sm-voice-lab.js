/* ===========================================================================
   sm-voice-lab.js — разбор произношения для English with Asya.

   Считает по записи две кривые во времени:
     • высоту тона (интонацию) — где голос поднимается и падает
     • громкость — где стоят ударения и паузы
   Затем сравнивает запись ученика с эталоном и выдаёт числа и текст разбора.

   Всё считается в браузере ученика. Никуда ничего не отправляется.

   API:
     VL.record()                       -> Promise<{blob, url, buffer}>  (стоп — VL.stop())
     VL.stop()
     VL.analyse(arrayBufferOrBlob)     -> Promise<Track>
     VL.compare(refTrack, myTrack)     -> {pitch, tempo, stress, total, notes[]}
     VL.draw(canvas, refTrack, myTrack)

   Track = { dur, pitch:[{t,hz}], rms:[{t,v}], voiced, words }
   =========================================================================== */
(function () {
  "use strict";

  var WIN   = 2048;   // окно анализа
  var HOP   = 512;    // шаг
  var FMIN  = 70;     // нижняя граница голоса, Гц
  var FMAX  = 400;    // верхняя
  var SR    = 16000;  // частота, к которой приводим

  var ctxCache = null;
  function actx() {
    if (!ctxCache) {
      var AC = window.AudioContext || window.webkitAudioContext;
      ctxCache = new AC();
    }
    if (ctxCache.state === "suspended") { try { ctxCache.resume(); } catch (e) {} }
    return ctxCache;
  }

  /* ---------- запись с микрофона ---------- */

  var rec = null, chunks = [], stopFn = null;

  function record() {
    return new Promise(function (resolve, reject) {
      if (!navigator.mediaDevices || !window.MediaRecorder) {
        reject(new Error("Браузер не умеет записывать звук"));
        return;
      }
      navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false }
      }).then(function (stream) {
        chunks = [];
        var mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus"
                 : MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "";
        rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
        rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
        rec.onstop = function () {
          stream.getTracks().forEach(function (t) { t.stop(); });
          var blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
          resolve({ blob: blob, url: URL.createObjectURL(blob) });
          rec = null;
        };
        rec.onerror = function (e) { reject(e.error || new Error("Ошибка записи")); };
        rec.start();
      }).catch(function (err) {
        reject(err && err.name === "NotAllowedError"
          ? new Error("Нужно разрешить доступ к микрофону")
          : err);
      });
    });
  }

  function stop() { if (rec && rec.state !== "inactive") rec.stop(); }
  function recording() { return !!(rec && rec.state === "recording"); }

  /* ---------- разбор ---------- */

  function toBuffer(src) {
    if (src instanceof ArrayBuffer) return actx().decodeAudioData(src.slice(0));
    if (src instanceof Blob) return src.arrayBuffer().then(function (ab) { return actx().decodeAudioData(ab); });
    if (typeof src === "string") {
      return fetch(src, { mode: "cors" }).then(function (r) {
        if (!r.ok) throw new Error("Не удалось загрузить звук (" + r.status + ")");
        return r.arrayBuffer();
      }).then(function (ab) { return actx().decodeAudioData(ab); });
    }
    return Promise.reject(new Error("Неизвестный источник звука"));
  }

  /* Приводим к моно и к частоте SR — быстрее считать и легче сравнивать */
  function mono(buf) {
    var ch = buf.getChannelData(0);
    var ratio = buf.sampleRate / SR;
    if (ratio <= 1.01) return { data: ch, sr: buf.sampleRate };
    var n = Math.floor(ch.length / ratio);
    var out = new Float32Array(n);
    for (var i = 0; i < n; i++) {
      var p = i * ratio, i0 = Math.floor(p), frac = p - i0;
      out[i] = ch[i0] * (1 - frac) + (ch[Math.min(i0 + 1, ch.length - 1)] || 0) * frac;
    }
    return { data: out, sr: SR };
  }

  /* Высота тона окна — автокорреляция с нормировкой.
     Возвращает 0, если голоса нет (пауза или шум). */
  function pitchAt(buf, start, sr) {
    var n = Math.min(WIN, buf.length - start);
    if (n < 256) return 0;

    var rms = 0, i;
    for (i = 0; i < n; i++) rms += buf[start + i] * buf[start + i];
    rms = Math.sqrt(rms / n);
    if (rms < 0.008) return 0;             // тишина

    var minLag = Math.floor(sr / FMAX);
    var maxLag = Math.min(Math.floor(sr / FMIN), n - 1);

    var best = -1, bestLag = -1, c0 = 0;
    for (i = 0; i < n; i++) c0 += buf[start + i] * buf[start + i];
    if (c0 <= 0) return 0;

    for (var lag = minLag; lag <= maxLag; lag++) {
      var c = 0, e = 0;
      for (i = 0; i + lag < n; i++) {
        c += buf[start + i] * buf[start + i + lag];
        e += buf[start + i + lag] * buf[start + i + lag];
      }
      var norm = c / (Math.sqrt(c0 * e) + 1e-9);
      if (norm > best) { best = norm; bestLag = lag; }
    }
    if (best < 0.35 || bestLag <= 0) return 0;   // не похоже на голос

    /* уточняем вершину параболой по соседям */
    return sr / bestLag;
  }

  function analyse(src) {
    return toBuffer(src).then(function (audio) {
      var m = mono(audio), data = m.data, sr = m.sr;
      var pitch = [], rmsArr = [], voiced = 0;

      for (var s = 0; s + WIN < data.length; s += HOP) {
        var t = s / sr;
        var e = 0;
        for (var i = 0; i < WIN; i++) e += data[s + i] * data[s + i];
        var r = Math.sqrt(e / WIN);
        rmsArr.push({ t: t, v: r });
        var hz = pitchAt(data, s, sr);
        if (hz) voiced++;
        pitch.push({ t: t, hz: hz });
      }

      /* сглаживаем тон: убираем одиночные выбросы октавой */
      for (var k = 1; k < pitch.length - 1; k++) {
        var a = pitch[k - 1].hz, b = pitch[k].hz, c = pitch[k + 1].hz;
        if (!a || !c || !b) continue;
        if (b > a * 1.7 && b > c * 1.7) pitch[k].hz = b / 2;
        if (b * 1.7 < a && b * 1.7 < c) pitch[k].hz = b * 2;
      }

      return {
        dur: data.length / sr,
        pitch: pitch,
        rms: rmsArr,
        voiced: pitch.length ? voiced / pitch.length : 0
      };
    });
  }

  /* ---------- сравнение ---------- */

  /* Растягиваем ряд к нужной длине — чтобы сравнивать записи разной длительности */
  function resample(arr, key, len) {
    var out = new Array(len);
    if (!arr.length) { for (var z = 0; z < len; z++) out[z] = 0; return out; }
    for (var i = 0; i < len; i++) {
      var p = i / (len - 1 || 1) * (arr.length - 1);
      var i0 = Math.floor(p), frac = p - i0;
      var a = arr[i0][key], b = arr[Math.min(i0 + 1, arr.length - 1)][key];
      out[i] = a * (1 - frac) + b * frac;
    }
    return out;
  }

  /* Тон в полутонах от собственной средней — так голоса разной высоты сравнимы */
  function semitones(hzArr) {
    var vals = hzArr.filter(function (h) { return h > 0; });
    if (!vals.length) return hzArr.map(function () { return null; });
    vals.sort(function (a, b) { return a - b; });
    var med = vals[Math.floor(vals.length / 2)];
    return hzArr.map(function (h) { return h > 0 ? 12 * Math.log2(h / med) : null; });
  }

  function corr(a, b) {
    var pairs = [];
    for (var i = 0; i < a.length; i++) if (a[i] !== null && b[i] !== null) pairs.push([a[i], b[i]]);
    if (pairs.length < 6) return null;
    var ma = 0, mb = 0, n = pairs.length;
    pairs.forEach(function (p) { ma += p[0]; mb += p[1]; });
    ma /= n; mb /= n;
    var num = 0, da = 0, db = 0;
    pairs.forEach(function (p) {
      var x = p[0] - ma, y = p[1] - mb;
      num += x * y; da += x * x; db += y * y;
    });
    if (da <= 0 || db <= 0) return null;
    return num / Math.sqrt(da * db);
  }

  /* Доля времени с голосом до и после — грубая оценка пауз */
  function pauseRatio(track) {
    var n = track.pitch.length;
    if (!n) return 0;
    var silent = track.pitch.filter(function (p) { return !p.hz; }).length;
    return silent / n;
  }

  function compare(ref, my) {
    var N = 120;
    var notes = [];

    /* --- интонация --- */
    var pitchScore = null;
    if (ref && ref.pitch.length && my.pitch.length) {
      var rs = semitones(resample(ref.pitch, "hz", N));
      var ms = semitones(resample(my.pitch, "hz", N));
      var c = corr(rs, ms);
      if (c !== null) {
        pitchScore = Math.round(Math.max(0, Math.min(1, (c + 1) / 2)) * 100);
        if (pitchScore >= 80) notes.push("Интонация повторяет образец — отлично.");
        else if (pitchScore >= 60) notes.push("Интонация похожа, но в середине фразы расходится с образцом.");
        else notes.push("Мелодия фразы своя: у носителя голос движется иначе. Послушай ещё раз и повтори движение тона.");
      }
    }

    /* --- темп --- */
    var tempoScore = null;
    if (ref && ref.dur > 0 && my.dur > 0) {
      var ratio = my.dur / ref.dur;
      var dev = Math.abs(Math.log2(ratio));         // 0 = точь-в-точь
      tempoScore = Math.round(Math.max(0, 1 - dev * 1.6) * 100);
      if (ratio > 1.25)      notes.push("Ты говоришь заметно медленнее образца — попробуй не растягивать.");
      else if (ratio < 0.8)  notes.push("Ты торопишься: фраза короче образца, звуки съедаются.");
      else                   notes.push("Темп близок к образцу.");
    }

    /* --- ударения и паузы --- */
    var stressScore = null;
    if (ref && ref.rms.length && my.rms.length) {
      var rr = resample(ref.rms, "v", N), mr = resample(my.rms, "v", N);
      var nrm = function (a) {
        var mx = Math.max.apply(null, a) || 1;
        return a.map(function (v) { return v / mx; });
      };
      var cc = corr(nrm(rr), nrm(mr));
      if (cc !== null) {
        stressScore = Math.round(Math.max(0, Math.min(1, (cc + 1) / 2)) * 100);
        if (stressScore < 60) notes.push("Ударения падают не туда: посмотри на график — у носителя громче другие места.");
      }
      var pr = pauseRatio(ref), pm = pauseRatio(my);
      if (pm - pr > 0.18) notes.push("Много пауз внутри фразы — попробуй сказать её на одном дыхании.");
    }

    var parts = [pitchScore, tempoScore, stressScore].filter(function (x) { return x !== null; });
    var total = parts.length ? Math.round(parts.reduce(function (a, b) { return a + b; }, 0) / parts.length) : null;

    return { pitch: pitchScore, tempo: tempoScore, stress: stressScore, total: total, notes: notes };
  }

  /* ---------- график ---------- */

  function draw(canvas, ref, my, opts) {
    opts = opts || {};
    var css = getComputedStyle(document.documentElement);
    var colRef = opts.colorRef || (css.getPropertyValue("--color-neutral-700") || "#6a6664").trim();
    var colMy  = opts.colorMy  || (css.getPropertyValue("--color-accent") || "#7c2340").trim();
    var colBg  = opts.colorBg  || "transparent";

    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth || 600, h = canvas.clientHeight || 190;
    canvas.width = w * dpr; canvas.height = h * dpr;
    var g = canvas.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    if (colBg !== "transparent") { g.fillStyle = colBg; g.fillRect(0, 0, w, h); }

    var N = 160, padL = 34, padR = 10, padT = 12, padB = 26;
    var iw = w - padL - padR, ih = h - padT - padB;

    /* середина — ноль полутонов */
    g.strokeStyle = "rgba(0,0,0,.12)"; g.lineWidth = 1;
    g.beginPath(); g.moveTo(padL, padT + ih / 2); g.lineTo(padL + iw, padT + ih / 2); g.stroke();

    g.font = "700 10px Nunito, sans-serif";
    g.fillStyle = "rgba(0,0,0,.45)";
    g.fillText("выше", 2, padT + 10);
    g.fillText("ниже", 2, padT + ih - 2);

    var RANGE = 9; // полутонов вверх и вниз

    function line(track, color, dashed) {
      if (!track || !track.pitch.length) return;
      var st = semitones(resample(track.pitch, "hz", N));
      g.strokeStyle = color; g.lineWidth = dashed ? 2 : 3;
      g.setLineDash(dashed ? [5, 4] : []);
      g.lineJoin = "round"; g.lineCap = "round";
      g.beginPath();
      var started = false;
      for (var i = 0; i < N; i++) {
        var v = st[i];
        if (v === null) { started = false; continue; }
        var x = padL + iw * (i / (N - 1));
        var y = padT + ih / 2 - Math.max(-RANGE, Math.min(RANGE, v)) / RANGE * (ih / 2);
        if (!started) { g.moveTo(x, y); started = true; } else g.lineTo(x, y);
      }
      g.stroke();
      g.setLineDash([]);
    }

    /* громкость — заливкой снизу, чтобы видеть ударения */
    function volume(track, color, alpha) {
      if (!track || !track.rms.length) return;
      var r = resample(track.rms, "v", N);
      var mx = Math.max.apply(null, r) || 1;
      g.fillStyle = color; g.globalAlpha = alpha;
      g.beginPath(); g.moveTo(padL, padT + ih);
      for (var i = 0; i < N; i++) {
        var x = padL + iw * (i / (N - 1));
        var y = padT + ih - (r[i] / mx) * (ih * 0.32);
        g.lineTo(x, y);
      }
      g.lineTo(padL + iw, padT + ih); g.closePath(); g.fill();
      g.globalAlpha = 1;
    }

    volume(ref, colRef, .13);
    volume(my,  colMy,  .16);
    line(ref, colRef, true);
    line(my,  colMy,  false);

    /* подпись */
    g.font = "800 11px Nunito, sans-serif";
    g.fillStyle = colRef; g.fillText("— — носитель", padL, h - 8);
    g.fillStyle = colMy;  g.fillText("——— ты", padL + 96, h - 8);
  }

  window.VL = {
    record: record, stop: stop, recording: recording,
    analyse: analyse, compare: compare, draw: draw,
    supported: function () {
      return !!(navigator.mediaDevices && window.MediaRecorder &&
                (window.AudioContext || window.webkitAudioContext));
    }
  };
})();
