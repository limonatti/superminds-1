/* Автономный качественный движок озвучки (без зависимостей).
   Ставит window.SM_speak(text, rate, gender) и window.SM_voice(gender, lang).
   Приоритет живых голосов: Edge natural/neural, Google, premium/enhanced. */
(function () {
  var V = [];
  function load() { try { V = speechSynthesis.getVoices() || []; } catch (e) { V = []; } }
  load();
  try { speechSynthesis.onvoiceschanged = load; } catch (e) {}
  var FEM = ["female", "zira", "jenny", "aria", "samantha", "sonia", "libby", "hazel", "karen", "victoria", "susan", "ava", "emma", "joanna", "salli", "serena", "kate"];
  var MAL = ["male", "david", "daniel", "guy", "ryan", "george", "alex", "fred", "brian", "matthew", "oliver", "james", "arthur", "aaron", "nathan", "tom"];
  window.SM_voice = function (g, lang) {
    var list = V.length ? V : (speechSynthesis.getVoices() || []);
    var best = null, bs = -1;
    list.forEach(function (v) {
      var n = (v.name || "").toLowerCase(), l = (v.lang || "").replace("_", "-");
      if (l.slice(0, 2) !== "en") return;
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
      if (n.indexOf("compact") >= 0) s -= 15;
      if (s > bs) { bs = s; best = v; }
    });
    return best;
  };
  window.SM_speak = function (t, rate, g) {
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(t);
      var v = window.SM_voice(g || "f");
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = "en-GB";
      u.rate = rate || 0.95; u.pitch = 1;
      speechSynthesis.speak(u);
    } catch (e) {}
  };
})();
