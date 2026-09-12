/* ===========================================================================
   sm-voice.js — озвучка английского голосом браузера (бесплатно, без ключей).

   Совместимо со старыми страницами:
     SM_speak(text, rate, gender)            — прочитать
     SM_voice(gender, lang)                  — лучший голос

   Новое:
     SM_speak(text, rate, gender, opts)      opts: { lang:"en-GB"|"en-US",
                                               voiceURI, onend(), onstart() }
     SM_voices(lang)      -> [{voiceURI, name, lang, local, score}] лучшие сверху
     SM_voicesReady()     -> Promise, когда браузер отдал список голосов
     SM_stopSpeak()       — остановить чтение

   Приоритет живых голосов: Edge natural/neural, Google, premium/enhanced.
   =========================================================================== */
(function () {
  var V = [];
  var hasTTS = typeof window.speechSynthesis !== "undefined";

  function load() {
    try { V = (hasTTS && speechSynthesis.getVoices()) || []; } catch (e) { V = []; }
    return V;
  }
  load();

  var readyResolve;
  var ready = new Promise(function (res) { readyResolve = res; });
  if (V.length) readyResolve(V);
  if (hasTTS) {
    try {
      speechSynthesis.addEventListener("voiceschanged", function () { load(); readyResolve(V); });
    } catch (e) {
      try { speechSynthesis.onvoiceschanged = function () { load(); readyResolve(V); }; } catch (e2) {}
    }
  }
  setTimeout(function () { load(); readyResolve(V); }, 1500);   // Safari иногда молчит

  var FEM = ["female", "zira", "jenny", "aria", "samantha", "sonia", "libby", "hazel", "karen", "victoria", "susan", "ava", "emma", "joanna", "salli", "serena", "kate", "moira", "tessa", "fiona", "martha", "allison", "michelle", "natasha"];
  var MAL = ["male", "david", "daniel", "guy", "ryan", "george", "alex", "fred", "brian", "matthew", "oliver", "james", "arthur", "aaron", "nathan", "tom", "thomas", "christopher", "eric", "roger", "steffan"];

  function score(v, g, lang) {
    var n = (v.name || "").toLowerCase(), l = (v.lang || "").replace("_", "-");
    if (l.slice(0, 2) !== "en") return -999;
    var s = 0;
    if (lang && l === lang) s += 20; else if (l === "en-GB" || l === "en-US") s += 10;
    var fem = FEM.some(function (x) { return n.indexOf(x) >= 0; });
    var nm = n.replace(/female/g, "");
    var mal = MAL.some(function (x) { return nm.indexOf(x) >= 0; });
    if (g === "f" && fem) s += 25;
    if (g === "m" && mal) s += 25;
    if (g === "f" && mal && !fem) s -= 20;
    if (g === "m" && fem && !mal) s -= 20;
    if (n.indexOf("natural") >= 0 || n.indexOf("neural") >= 0) s += 30;
    if (n.indexOf("google") >= 0) s += 20;
    if (n.indexOf("premium") >= 0 || n.indexOf("enhanced") >= 0) s += 15;
    if (n.indexOf("compact") >= 0 || n.indexOf("eloquence") >= 0) s -= 15;
    /* шуточные голоса macOS — не для урока */
    if (/(bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|albert|junior|ralph|kathy|grandma|grandpa|rocko|shelley|flo|eddy|reed|sandy)/.test(n)) s -= 60;
    return s;
  }

  window.SM_voices = function (lang) {
    var list = V.length ? V : load();
    return list
      .map(function (v) { return { v: v, s: score(v, null, lang) }; })
      .filter(function (x) { return x.s > -999 && (!lang || (x.v.lang || "").replace("_", "-") === lang); })
      .sort(function (a, b) { return b.s - a.s; })
      .map(function (x) {
        return { voiceURI: x.v.voiceURI, name: x.v.name, lang: x.v.lang, local: !!x.v.localService, score: x.s };
      });
  };

  window.SM_voicesReady = function () { return ready; };

  window.SM_voice = function (g, lang, uri) {
    var list = V.length ? V : load();
    if (uri) {
      for (var i = 0; i < list.length; i++) if (list[i].voiceURI === uri) return list[i];
    }
    var best = null, bs = -999;
    list.forEach(function (v) {
      var s = score(v, g, lang);
      if (s > bs) { bs = s; best = v; }
    });
    return best;
  };

  window.SM_stopSpeak = function () { try { speechSynthesis.cancel(); } catch (e) {} };

  window.SM_speak = function (t, rate, g, opts) {
    opts = opts || {};
    if (!hasTTS) { if (opts.onend) opts.onend(); return null; }
    try {
      var u = new SpeechSynthesisUtterance(t);
      var v = window.SM_voice(g || "f", opts.lang, opts.voiceURI);
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = opts.lang || "en-GB";
      u.rate = rate || 0.95; u.pitch = 1;
      if (opts.onend) { u.onend = opts.onend; u.onerror = opts.onend; }
      if (opts.onstart) u.onstart = opts.onstart;
      var busy = speechSynthesis.speaking || speechSynthesis.pending;
      speechSynthesis.cancel();
      /* Chrome теряет фразу, если speak() идёт сразу за cancel() */
      if (busy) setTimeout(function () { speechSynthesis.speak(u); }, 60);
      else speechSynthesis.speak(u);
      return u;
    } catch (e) { if (opts.onend) opts.onend(); return null; }
  };
})();
