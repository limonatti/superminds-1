/* ===========================================================================
   sm-play.js — общий движок игр платформы English with Asya.
   Даёт всем играм одинаковый звук, анимации, счёт, жизни, таймер и финал.
   Ничего не грузит из интернета: звуки синтезируются на лету.

   Как пользоваться:
     SMP.sfx("ok" | "no" | "click" | "pop" | "tick" | "whoosh" | "win" | "lose" | "coin" | "streak")
     SMP.say("apple")                       — озвучить по-английски
     SMP.confetti()                         — салют на весь экран
     SMP.burst(x, y)                        — искры в точке
     SMP.pop(el, "+10")                     — всплывающая надпись у элемента
     SMP.good(el) / SMP.bad(el)             — реакция на верный и неверный ответ
     SMP.hud({score:true, lives:3, time:60, onTime:fn})
     SMP.hud.add(10) / .hit() / .stop() / .value()
     SMP.result({score, total, title, onAgain, onHome, save:{course,unit,type}})
     SMP.words("u1")                        — слова юнита Super Minds
     SMP.words("speakout-b1plus|3")         — слова юнита Speakout
     SMP.shuffle(list)
   =========================================================================== */
(function () {
  const SMP = {};

  /* ---------------- звук ---------------- */
  let actx = null, master = null;
  let muted = false;
  try { muted = localStorage.getItem("smp-mute") === "1"; } catch (e) {}

  function ctx() {
    if (!actx) {
      try {
        actx = new (window.AudioContext || window.webkitAudioContext)();
        master = actx.createGain();
        master.gain.value = muted ? 0 : 0.9;
        master.connect(actx.destination);
      } catch (e) { return null; }
    }
    if (actx.state === "suspended") { try { actx.resume(); } catch (e) {} }
    return actx;
  }
  function noiseBuf() {
    const c = ctx(); if (!c) return null;
    if (noiseBuf._b) return noiseBuf._b;
    const n = c.sampleRate * 0.4, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return (noiseBuf._b = b);
  }
  function tone(freq, start, dur, type, vol, glide) {
    const c = ctx(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || "triangle";
    const t0 = c.currentTime + start;
    o.frequency.setValueAtTime(freq, t0);
    if (glide) o.frequency.exponentialRampToValueAtTime(Math.max(40, glide), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.22, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function noise(start, dur, vol, hz, type) {
    const c = ctx(); if (!c) return;
    const b = noiseBuf(); if (!b) return;
    const s = c.createBufferSource(); s.buffer = b;
    const f = c.createBiquadFilter(); f.type = type || "bandpass"; f.frequency.value = hz || 1200;
    const g = c.createGain();
    const t0 = c.currentTime + start;
    g.gain.setValueAtTime(vol || 0.2, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t0); s.stop(t0 + dur + 0.02);
  }

  const SFX = {
    ok:     () => { tone(660, 0, .16, "triangle", .22); tone(880, .09, .22, "triangle", .2); },
    streak: () => { tone(660, 0, .12, "triangle", .2); tone(880, .08, .12, "triangle", .2); tone(1174, .16, .26, "triangle", .22); },
    no:     () => { tone(220, 0, .22, "sawtooth", .16, 110); noise(0, .12, .10, 500, "lowpass"); },
    click:  () => { noise(0, .04, .16, 2600); },
    pop:    () => { tone(900, 0, .10, "sine", .22, 320); noise(0, .05, .12, 1800); },
    tick:   () => { tone(1500, 0, .045, "square", .10); },
    whoosh: () => { noise(0, .28, .12, 900, "bandpass"); },
    coin:   () => { tone(988, 0, .08, "square", .16); tone(1319, .07, .18, "square", .16); },
    win:    () => { [[523,0],[659,.11],[784,.22],[1046,.34]].forEach(([f,t]) => tone(f, t, .42, "triangle", .26));
                    setTimeout(() => { tone(1568, 0, .5, "sine", .12); }, 420); },
    lose:   () => { [[440,0],[370,.14],[294,.3]].forEach(([f,t]) => tone(f, t, .34, "sawtooth", .16)); }
  };
  SMP.sfx = function (name) { if (muted) return; const f = SFX[name]; if (f) { ctx(); try { f(); } catch (e) {} } };
  SMP.muted = () => muted;
  SMP.mute = function (on) {
    muted = (on === undefined) ? !muted : !!on;
    try { localStorage.setItem("smp-mute", muted ? "1" : "0"); } catch (e) {}
    if (master) master.gain.value = muted ? 0 : 0.9;
    const b = document.getElementById("smp-sound"); if (b) b.textContent = muted ? "🔇" : "🔊";
    return muted;
  };

  /* ---------------- речь ---------------- */
  SMP.say = function (text, rate) {
    if (window.SM_speak) { try { return SM_speak(text, rate || .95); } catch (e) {} }
    try {
      const u = new SpeechSynthesisUtterance(text);
      const vs = speechSynthesis.getVoices() || [];
      const v = vs.find(x => /en-GB/i.test(x.lang)) || vs.find(x => /^en/i.test(x.lang));
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = "en-GB";
      u.rate = rate || .95;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch (e) {}
  };

  /* ---------------- стили ---------------- */
  const CSS = `
  @keyframes smp-fall{to{transform:translateY(115vh) rotate(760deg);opacity:.9}}
  .smp-cf{position:fixed;top:-30px;z-index:9999;pointer-events:none;animation:smp-fall linear forwards}
  @keyframes smp-spark{to{transform:translate(var(--dx),var(--dy)) scale(.2);opacity:0}}
  .smp-sp{position:fixed;width:10px;height:10px;border-radius:50%;z-index:9999;pointer-events:none;animation:smp-spark .6s ease-out forwards}
  @keyframes smp-up{0%{transform:translateY(0);opacity:1}100%{transform:translateY(-46px);opacity:0}}
  .smp-pop{position:fixed;z-index:9999;pointer-events:none;font:800 22px 'Archivo',system-ui,sans-serif;color:#4a8b34;text-shadow:0 2px 0 #fff;animation:smp-up .9s ease-out forwards}
  .smp-pop.bad{color:#ec3013}
  @keyframes smp-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
  @keyframes smp-bump{0%{transform:scale(1)}45%{transform:scale(1.14)}100%{transform:scale(1)}}
  .smp-shake{animation:smp-shake .38s}
  .smp-bump{animation:smp-bump .38s}
  #smp-hud{position:fixed;top:12px;right:14px;z-index:60;display:flex;gap:6px;align-items:center;font-family:'Archivo',system-ui,sans-serif}
  #smp-hud .p{background:#f3f2f2;border:2px solid #201e1d;border-radius:0;padding:8px 13px;
    font:800 13px 'Archivo',system-ui,sans-serif;letter-spacing:.04em;color:#201e1d;white-space:nowrap}
  #smp-hud .p.time{color:#201e1d}
  #smp-hud .p.time.low{color:#ec3013;animation:smp-bump .6s infinite}
  #smp-hud button{background:#f3f2f2;border:2px solid #201e1d;border-radius:0;width:38px;height:38px;font-size:15px;cursor:pointer}
  #smp-hud button:hover{background:#201e1d;color:#f3f2f2}
  #smp-res{position:fixed;inset:0;z-index:9998;background:rgba(32,30,29,.72);display:flex;align-items:center;justify-content:center;padding:18px}
  #smp-res .box{background:#f3f2f2;border:2px solid #201e1d;border-radius:0;padding:30px 28px;text-align:left;
    max-width:420px;width:100%;font-family:'Archivo',system-ui,sans-serif}
  #smp-res h2{margin:0 0 6px;font-size:30px;font-weight:800;letter-spacing:-.02em;color:#201e1d}
  #smp-res .stars{font-size:36px;letter-spacing:6px;margin:6px 0 4px}
  #smp-res .sc{font:700 15px 'Archivo',system-ui,sans-serif;color:#4a4644;margin-bottom:20px}
  #smp-res button{border:2px solid #201e1d;border-radius:0;padding:13px 20px;
    font:800 12px 'Archivo',system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;margin:0 8px 0 0}
  #smp-res .again{background:#ec3013;border-color:#ec3013;color:#fff}
  #smp-res .again:hover{background:#dd2b0f;border-color:#dd2b0f}
  #smp-res .home{background:none;color:#201e1d}
  #smp-res .home:hover{background:#201e1d;color:#f3f2f2}`;
  (function () { const s = document.createElement("style"); s.textContent = CSS; document.head.appendChild(s); })();

  /* ---------------- анимации ---------------- */
  const COLORS = ["#7c2340", "#e0952a", "#27ae60", "#2980b9", "#8e44ad", "#c0392b", "#ffd27a"];
  SMP.confetti = function (n) {
    n = n || 70;
    for (let i = 0; i < n; i++) {
      const d = document.createElement("div");
      d.className = "smp-cf";
      const sz = 7 + Math.random() * 9;
      d.style.cssText = "left:" + (Math.random() * 100) + "vw;width:" + sz + "px;height:" + (sz * .6) + "px;background:" +
        COLORS[i % COLORS.length] + ";animation-duration:" + (2 + Math.random() * 1.8) + "s;animation-delay:" + (Math.random() * .5) + "s;border-radius:2px";
      document.body.appendChild(d);
      setTimeout(() => d.remove(), 4600);
    }
  };
  SMP.burst = function (x, y, n) {
    n = n || 12;
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + Math.random() * .4, r = 40 + Math.random() * 55;
      const d = document.createElement("div");
      d.className = "smp-sp";
      d.style.cssText = "left:" + x + "px;top:" + y + "px;background:" + COLORS[i % COLORS.length] +
        ";--dx:" + Math.cos(a) * r + "px;--dy:" + Math.sin(a) * r + "px";
      document.body.appendChild(d);
      setTimeout(() => d.remove(), 700);
    }
  };
  SMP.pop = function (el, text, bad) {
    const r = el && el.getBoundingClientRect ? el.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0 };
    const d = document.createElement("div");
    d.className = "smp-pop" + (bad ? " bad" : "");
    d.textContent = text;
    d.style.left = (r.left + r.width / 2 - 18) + "px";
    d.style.top = (r.top - 6) + "px";
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 950);
  };
  SMP.good = function (el, points) {
    SMP.sfx(hud.streak >= 3 ? "streak" : "ok");
    if (el) {
      el.classList.remove("smp-bump"); void el.offsetWidth; el.classList.add("smp-bump");
      const r = el.getBoundingClientRect();
      SMP.burst(r.left + r.width / 2, r.top + r.height / 2, 10);
    }
    if (points) SMP.pop(el, "+" + points);
  };
  SMP.bad = function (el) {
    SMP.sfx("no");
    if (el) { el.classList.remove("smp-shake"); void el.offsetWidth; el.classList.add("smp-shake"); }
  };

  /* ---------------- HUD: счёт, жизни, время ---------------- */
  const hud = { score: 0, lives: 0, max: 0, streak: 0, best: 0, t: null, left: 0, onTime: null, el: null };
  function hudBox() {
    let b = document.getElementById("smp-hud");
    if (!b) { b = document.createElement("div"); b.id = "smp-hud"; document.body.appendChild(b); }
    return b;
  }
  function hudDraw() {
    const b = hudBox(); b.innerHTML = "";
    if (hud.showScore) { const s = document.createElement("div"); s.className = "p"; s.textContent = "⭐ " + hud.score; b.appendChild(s); }
    if (hud.max) { const l = document.createElement("div"); l.className = "p"; l.textContent = "❤️".repeat(Math.max(0, hud.lives)) + "🤍".repeat(Math.max(0, hud.max - hud.lives)); b.appendChild(l); }
    if (hud.t !== null) { const t = document.createElement("div"); t.className = "p time" + (hud.left <= 10 ? " low" : "");
      t.textContent = "⏱ " + Math.floor(hud.left / 60) + ":" + String(hud.left % 60).padStart(2, "0"); b.appendChild(t); }
    const m = document.createElement("button"); m.id = "smp-sound"; m.title = "Звук"; m.textContent = muted ? "🔇" : "🔊";
    m.onclick = () => SMP.mute(); b.appendChild(m);
  }
  SMP.hud = function (opt) {
    opt = opt || {};
    hud.score = 0; hud.streak = 0; hud.best = 0;
    hud.showScore = opt.score !== false;
    hud.max = opt.lives || 0; hud.lives = hud.max;
    hud.onTime = opt.onTime || null;
    if (hud.t) { clearInterval(hud.t); hud.t = null; }
    if (opt.time) {
      hud.left = opt.time;
      hud.t = setInterval(() => {
        hud.left--;
        if (hud.left <= 5 && hud.left > 0) SMP.sfx("tick");
        if (hud.left <= 0) { clearInterval(hud.t); hud.t = null; hud.left = 0; hudDraw(); if (hud.onTime) hud.onTime(); return; }
        hudDraw();
      }, 1000);
    } else hud.left = 0;
    hudDraw();
    return SMP.hud;
  };
  SMP.hud.add = function (n) { hud.score += (n || 0); hud.streak++; if (hud.streak > hud.best) hud.best = hud.streak; hudDraw(); return hud.score; };
  SMP.hud.miss = function () { hud.streak = 0; hudDraw(); };
  SMP.hud.hit = function () { hud.streak = 0; hud.lives = Math.max(0, hud.lives - 1); hudDraw(); return hud.lives; };
  SMP.hud.value = function () { return { score: hud.score, lives: hud.lives, streak: hud.streak, best: hud.best, left: hud.left }; };
  SMP.hud.stop = function () { if (hud.t) { clearInterval(hud.t); hud.t = null; } };
  SMP.hud.hide = function () { SMP.hud.stop(); const b = document.getElementById("smp-hud"); if (b) b.remove(); };

  /* ---------------- финальный экран ---------------- */
  SMP.result = function (o) {
    o = o || {};
    SMP.hud.stop();
    const total = o.total || 0, score = o.score == null ? hud.score : o.score;
    const ratio = total ? score / total : (score > 0 ? 1 : 0);
    const stars = ratio >= .9 ? 3 : ratio >= .6 ? 2 : ratio > 0 ? 1 : 0;
    if (stars >= 2) { SMP.sfx("win"); SMP.confetti(stars === 3 ? 110 : 70); } else SMP.sfx("lose");

    const wrap = document.createElement("div"); wrap.id = "smp-res";
    const words = ["Ещё потренируемся 💪", "Хорошо! 👏", "Отлично! 🎉", "Идеально! 🏆"];
    wrap.innerHTML = '<div class="box"><h2>' + (o.title || words[stars]) + '</h2>' +
      '<div class="stars">' + "⭐".repeat(stars) + "☆".repeat(3 - stars) + '</div>' +
      '<div class="sc">' + (total ? score + " из " + total : "очков: " + score) +
      (hud.best > 2 ? " · серия " + hud.best : "") + '</div>' +
      '<button class="again">Ещё раз</button><button class="home">Выйти</button></div>';
    document.body.appendChild(wrap);
    wrap.querySelector(".again").onclick = () => { wrap.remove(); SMP.sfx("click"); if (o.onAgain) o.onAgain(); };
    wrap.querySelector(".home").onclick = () => { wrap.remove(); SMP.sfx("click"); if (o.onHome) o.onHome(); else history.length > 1 ? history.back() : (location.href = "course.html"); };

    if (o.save && window.SM && SM.isCloud) {
      try { SM.saveAttempt({ course: o.save.course || null, unit_id: o.save.unit || null, ex_type: o.save.type || "game", correct: ratio >= .6 }); } catch (e) {}
    }
    return stars;
  };

  /* ---------------- слова ---------------- */
  SMP.shuffle = function (a) { a = (a || []).slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  SMP.words = function (key) {
    key = key || "";
    if (key.indexOf("|") >= 0) {
      const p = key.split("|");
      const raw = ((window.SPEAKOUT_WORDS || {})[p[0]] || {})[p[1]] || [];
      return raw.map((w, i) => ({ id: p[0] + "-" + p[1] + "-" + i, en: w[0], ru: w[1] || "", emoji: "🗣️" }));
    }
    const u = (window.SM_UNITS || []).find(x => x.id === key);
    if (!u) return [];
    return u.words.map((w, i) => ({ id: u.id + "-" + i, en: w.en, ru: w.ru, emoji: w.emoji, img: w.img || null }));
  };

  /* первое касание разблокирует звук в браузере */
  ["pointerdown", "keydown"].forEach(ev => window.addEventListener(ev, function once() {
    ctx(); window.removeEventListener(ev, once);
  }, { once: true }));

  window.SMP = SMP;
})();
