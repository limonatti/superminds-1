/* sm-lookup.js — поиск слова или словосочетания для личного словаря.

   Проверенные переводы курсов и устойчивых выражений имеют приоритет.
   Новые слова и фразы переводятся целиком; MyMemory — резервный источник.
   Пустые ответы не кэшируются, запросы ограничены по времени. */
(function () {
  var TTL = 12 * 60 * 60 * 1000;          /* найденное держим полсуток */
  var CKEY = "sm-lookup-cache-v2";
  var mem = {};
  var pending = Object.create(null);

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

  function norm(s) { return (s || "").trim().toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, " "); }
  function cacheKey(s) { return (s || "").trim().replace(/\s+/g, " "); }
  function phraseKey(s) { return norm(s).replace(/[.!?…]+$/g, "").trim(); }

  /* Учебные значения идиом: машинный перевод часто понимает их буквально. */
  var PHRASES = {
    "break the ice": "растопить лёд; разрядить обстановку",
    "a piece of cake": "проще простого",
    "piece of cake": "проще простого",
    "under the weather": "нездоровится; неважно себя чувствовать",
    "feel under the weather": "неважно себя чувствовать",
    "it's raining cats and dogs": "льёт как из ведра",
    "spill the beans": "выдать секрет; проболтаться",
    "hit the sack": "отправиться спать",
    "hit the books": "засесть за учёбу",
    "once in a blue moon": "крайне редко",
    "the ball is in your court": "теперь твоя очередь действовать",
    "cost an arm and a leg": "стоить целое состояние",
    "give someone a hand": "помочь кому-то",
    "give me a hand": "помоги мне",
    "keep an eye on": "присматривать за; следить за",
    "get along with": "ладить с",
    "get on with": "ладить с; продолжать что-либо",
    "look forward to": "с нетерпением ждать",
    "put up with": "мириться с; терпеть",
    "run out of": "исчерпать запас; остаться без",
    "come up with": "придумать; предложить",
    "catch up with": "догнать; наверстать упущенное",
    "get over": "преодолеть; оправиться после",
    "turn down": "отказать; убавить громкость",
    "take off": "снимать (одежду); взлетать",
    "give up": "сдаваться; бросать занятие",
    "make up your mind": "принять решение",
    "make yourself at home": "чувствуй себя как дома",
    "help yourself": "угощайся",
    "never mind": "ничего страшного; не обращай внимания",
    "take your time": "не торопись",
    "fingers crossed": "будем надеяться на удачу",
    "better late than never": "лучше поздно, чем никогда"
  };

  async function fetchJson(url, ms) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, ms || 5000);
    try {
      var r = await fetch(url, { signal: controller.signal });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error("HTTP " + r.status);
      return await r.json();
    } finally { clearTimeout(timer); }
  }

  function validTranslation(text, original) {
    return typeof text === "string" && text.length <= 2000 &&
      /[а-яё]/i.test(text) && norm(text) !== norm(original) &&
      !/MYMEMORY WARNING|QUERY LENGTH|INVALID|QUOTA|TOO MANY REQUESTS|<[^>]+>/i.test(text);
  }
  function isPhrase(s) { return norm(s).indexOf(" ") >= 0; }

  /* ---------- 1. Свои слова ---------- */
  function localHits(q) {
    var n = phraseKey(q), out = [], seen = {};
    if (!n) return out;
    var data = window.SM_COURSE_DATA || {};
    Object.keys(data).forEach(function (cid) {
      (data[cid] || []).forEach(function (u) {
        (u.words || []).forEach(function (w) {
          if (!w || !w.en) return;
          var en = phraseKey(w.en);
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

  /* ---------- 2. Толковый словарь ----------
     Сервис бесплатный и отвечает через раз: из трёх запросов подряд один
     падает с сетевой ошибкой. Поэтому один повтор — и честный признак
     «не ответил», чтобы не запоминать пустышку на полсуток. */
  async function dictOnce(word) {
    var j = await fetchJson("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(word), 2500);
    var e = j && j[0];
    if (!e) return { ok: true, empty: true };
    var ipa = e.phonetic || (e.phonetics || []).map(function (p) { return p.text; }).filter(Boolean)[0] || null;
    var au = (e.phonetics || []).filter(function (p) { return p.audio; })[0];
    var m = (e.meanings || [])[0], d = m && (m.definitions || [])[0];
    return {
      ok: true,
      ipa: ipa,
      audio: au ? au.audio : null,
      meaning: d ? d.definition : null,
      example: d && d.example ? d.example : null,
      pos: m ? m.partOfSpeech : null
    };
  }

  async function dictInfo(word) {
    if (isPhrase(word)) return { ok: true, empty: true };   /* фразы этот словарь не знает */
    var w = norm(word);
    try { return await dictOnce(w); }
    catch (e1) {
      await new Promise(function (r) { setTimeout(r, 600); });
      try { return await dictOnce(w); }
      catch (e2) { return { ok: false }; }                  /* не ответил — не кэшируем */
    }
  }

  /* ---------- 3. Автоперевод ---------- */
  async function autoTranslate(text) {
    // Сохраняем регистр: US, May и имена нельзя превращать в us, may.
    try {
      var j = await fetchJson("https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ru&dt=t&q=" + encodeURIComponent(text));
      var t = Array.isArray(j) && Array.isArray(j[0]) ? j[0].map(function (part) {
        return Array.isArray(part) && typeof part[0] === "string" ? part[0] : "";
      }).join("").trim() : "";
      if (validTranslation(t, text)) return t;
    } catch (e) {}
    try {
      var backup = await fetchJson("https://api.mymemory.translated.net/get?q=" + encodeURIComponent(text) + "&langpair=en|ru");
      if (!backup || Number(backup.responseStatus) !== 200 || backup.quotaFinished) return null;
      var ru = backup.responseData && backup.responseData.translatedText;
      return validTranslation(ru, text) ? ru.trim() : null;
    } catch (e) { return null; }
  }

  /* ---------- Публичная функция ----------
     Возвращает {en, ru, ipa, audio, meaning, example, img, variants, source} */
  async function lookup(query) {
    var q = (query || "").trim();
    if (!q) return null;
    var key = cacheKey(q);
    var hit = cacheGet(key);
    if (hit) return hit;

    var local = localHits(q);
    var exact = local.filter(function (x) { return phraseKey(x.en) === phraseKey(q) && validTranslation(x.ru, q); })[0];
    var curated = Object.prototype.hasOwnProperty.call(PHRASES, phraseKey(q)) ? PHRASES[phraseKey(q)] : null;

    var pair = await Promise.all([dictInfo(q), exact || curated ? null : autoTranslate(q)]);
    var info = pair[0] || {}, auto = pair[1];

    var res = {
      en: exact ? exact.en : q,
      ru: exact ? exact.ru : (curated || auto || ""),
      ipa: info.ipa || null,
      audio: info.audio || null,
      meaning: info.meaning || null,
      example: info.example || null,
      pos: info.pos || null,
      img: exact ? exact.img : null,
      variants: local,
      source: exact ? "course" : (curated ? "dictionary" : (auto ? "auto" : "none")),
      phrase: isPhrase(q),
      dictDown: info.ok === false        /* толковый словарь не ответил */
    };
    /* Запоминаем только полный результат. Если словарь отвалился, следующий
       поиск того же слова попробует снова, а не отдаст пустую карточку из кэша. */
    if (res.ru && !res.dictDown) cacheSet(key, res);
    return res;
  }

  window.SM_lookup = function (query) {
    var key = cacheKey(query);
    if (!pending[key]) pending[key] = lookup(query).finally(function () { delete pending[key]; });
    return pending[key];
  };

  /* Подсказки по мере набора — только из своих слов, без сети */
  window.SM_lookupSuggest = function (q) { return localHits(q); };
})();
