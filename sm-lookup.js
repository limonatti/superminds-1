/* sm-lookup.js — поиск слова или словосочетания для личного словаря.

   Три источника, по порядку:
   1. Слова курсов самой платформы (~1665 пар) — мгновенно, с картинкой, перевод выверен.
   2. dictionaryapi.dev — транскрипция, произношение носителя, значение по-английски.
      Работает только по одиночным словам.
   3. MyMemory — автоперевод; берёт и фразы, и чанки.

   Ключи не нужны ни одному. Если интернет-источники не ответили, всё равно
   возвращаем то, что нашли — учитель или ученик впишет перевод руками. */
(function () {
  var TTL = 12 * 60 * 60 * 1000;          /* найденное держим полсуток */
  var CKEY = "sm-lookup-cache";
  var mem = {};

  try { mem = JSON.parse(localStorage.getItem(CKEY) || "{}"); } catch (e) { mem = {}; }
  function cacheGet(k) {
    var v = mem[k];
    if (v && Date.now() - v.t < TTL) return v.d;
    return null;
  }
  function cacheSet(k, d) {
    mem[k] = { t: Date.now(), d: d };
    try {
      var keys = Object.keys(mem);
      if (keys.length > 300) keys.slice(0, keys.length - 300).forEach(function (x) { delete mem[x]; });
      localStorage.setItem(CKEY, JSON.stringify(mem));
    } catch (e) {}
  }

  function norm(s) { return (s || "").trim().toLowerCase().replace(/\s+/g, " "); }
  function isPhrase(s) { return norm(s).indexOf(" ") >= 0; }

  /* ---------- 1. Свои слова ---------- */
  function localHits(q) {
    var n = norm(q), out = [], seen = {};
    if (!n) return out;
    var data = window.SM_COURSE_DATA || {};
    Object.keys(data).forEach(function (cid) {
      (data[cid] || []).forEach(function (u) {
        (u.words || []).forEach(function (w) {
          if (!w || !w.en) return;
          var en = norm(w.en);
          var hit = en === n ? 3 : en.indexOf(n) === 0 ? 2 : en.indexOf(n) >= 0 ? 1 : 0;
          if (!hit) return;
          var key = en + "|" + norm(w.ru);
          if (seen[key]) return;
          seen[key] = 1;
          out.push({ en: w.en, ru: w.ru, img: w.img || null, rank: hit,
                     from: (u.title || "курс"), source: "course" });
        });
      });
    });
    out.sort(function (a, b) { return b.rank - a.rank || a.en.length - b.en.length; });
    return out.slice(0, 8);
  }

  /* ---------- 2. Толковый словарь ---------- */
  async function dictInfo(word) {
    if (isPhrase(word)) return {};                 /* фразы этот словарь не знает */
    try {
      var r = await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(norm(word)));
      if (!r.ok) return {};
      var j = await r.json();
      var e = j && j[0]; if (!e) return {};
      var ipa = e.phonetic || (e.phonetics || []).map(function (p) { return p.text; }).filter(Boolean)[0] || null;
      var au = (e.phonetics || []).filter(function (p) { return p.audio; })[0];
      var m = (e.meanings || [])[0], d = m && (m.definitions || [])[0];
      return {
        ipa: ipa,
        audio: au ? au.audio : null,
        meaning: d ? d.definition : null,
        example: d && d.example ? d.example : null,
        pos: m ? m.partOfSpeech : null
      };
    } catch (e) { return {}; }
  }

  /* ---------- 3. Автоперевод ---------- */
  async function autoTranslate(text) {
    var n = norm(text);
    if (!n) return null;
    try {
      var r = await fetch("https://api.mymemory.translated.net/get?q=" +
                          encodeURIComponent(n) + "&langpair=en|ru");
      if (!r.ok) return null;
      var j = await r.json();
      var t = j && j.responseData && j.responseData.translatedText;
      if (!t) return null;
      /* сервис иногда возвращает служебные сообщения капсом вместо перевода */
      if (/^[A-Z ,'"-]+$/.test(t) || /MYMEMORY WARNING|INVALID/i.test(t)) return null;
      return t.charAt(0).toLowerCase() + t.slice(1);
    } catch (e) { return null; }
  }

  /* ---------- Публичная функция ----------
     Возвращает {en, ru, ipa, audio, meaning, example, img, variants, source} */
  window.SM_lookup = async function (query) {
    var q = (query || "").trim();
    if (!q) return null;
    var key = norm(q);
    var hit = cacheGet(key);
    if (hit) return hit;

    var local = localHits(q);
    var exact = local.filter(function (x) { return norm(x.en) === key; })[0];

    var pair = await Promise.all([dictInfo(q), exact ? null : autoTranslate(q)]);
    var info = pair[0] || {}, auto = pair[1];

    var res = {
      en: exact ? exact.en : q,
      ru: exact ? exact.ru : (auto || ""),
      ipa: info.ipa || null,
      audio: info.audio || null,
      meaning: info.meaning || null,
      example: info.example || null,
      pos: info.pos || null,
      img: exact ? exact.img : null,
      variants: local,
      source: exact ? "course" : (auto ? "auto" : "none"),
      phrase: isPhrase(q)
    };
    cacheSet(key, res);
    return res;
  };

  /* Подсказки по мере набора — только из своих слов, без сети */
  window.SM_lookupSuggest = function (q) { return localHits(q); };
})();
