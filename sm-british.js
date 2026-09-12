/* ===========================================================================
   sm-british.js — движок раздела «Британский акцент».

   Разбирает размеченную фразу монолога:
     t   — текст со стрелками ядерного тона (↘ ↗ ↘↗ ↗↘) и границами групп | ||
     ipa — транскрипция по словам: пробел или ‿ между словами,
           ʔ (t) ʳ ʲ ʷ … — отклонения акцента
   и выдаёт слова с метками звуков, типами сцеплений и интонационными группами.

   BR.parse(seg)          -> {words:[...], units:[...], ok, problem}
   BR.FEAT                -> справочник меток (название, объяснение, копировать ли)
   BR.LINK                -> справочник сцеплений
   BR.syllable(word, at)  -> [начало, конец] ударного слога ядра в слове
   =========================================================================== */
(function () {
  "use strict";

  var FEAT = {
    glottal:      { n: "Гортанная смычка", s: "ʔ", g: "cons", c: "#7c2340",
      d: "Вместо t — короткое смыкание связок, как пауза в «не-а». Самая частая черта живой британской речи.",
      copy: "Перед согласным и на паузе — можно и нужно (not now, that's). Между гласными (water) — только узнавать." },
    elide:        { n: "Выпадение звука", s: "(t)", g: "cons", c: "#8a7f76",
      d: "t или d между согласными не произносится: just returned → [dʒʌs rɪˈtɜːnd].",
      copy: "Копировать: так говорят все, без этого речь звучит как по слогам." },
    hdrop:        { n: "Выпадение h", s: "∅h", g: "cons", c: "#6a5f58",
      d: "В безударных he, him, his, her, have h пропадает и слово прилипает к предыдущему. У лондонских говорящих h может выпадать и в ударных словах.",
      copy: "В безударных служебных словах — копировать. В ударных (home → 'ome) — только узнавать." },
    "th-front":   { n: "f / v вместо th", s: "θ→f", g: "cons", c: "#b5654a",
      d: "think → [fɪŋk], with → [wɪv]. Черта лондонской и молодёжной речи.",
      copy: "Только узнавать. В учебной речи держи [θ] [ð]." },
    "th-stop":    { n: "t / d вместо th", s: "ð→d", g: "cons", c: "#b5654a",
      d: "the → [də], that → [dat]. Встречается в Multicultural London English.",
      copy: "Только узнавать." },
    lvoc:         { n: "l звучит как у", s: "l→ʊ", g: "cons", c: "#2f6f73",
      d: "Тёмный l в конце слога превращается в гласный: people → [ˈpiːpʊ], child → [tʃaɪʊd]. Лондон и юго-восток.",
      copy: "Только узнавать. Сама произноси тёмный [ɫ]." },
    "dark-l":     { n: "Тёмный l", s: "ɫ", g: "cons", c: "#2f6f73",
      d: "l в конце слова глубокий, язык оттянут назад: feel, world.",
      copy: "Копировать: русское мягкое «ль» здесь звучит сильным акцентом." },
    nor:          { n: "r не звучит", s: "∅r", g: "cons", c: "#a3968a",
      d: "Буква r после гласной в британском стандарте не читается: car [kɑː], first [fɜːst].",
      copy: "Копировать — это основа британского произношения." },
    rhotic:       { n: "r звучит", s: "ɹ", g: "cons", c: "#5b2d86",
      d: "Шотландская и часть северной речи: r после гласной произносится (world [wʌɹld]), часто одним ударом [ɾ].",
      copy: "Только узнавать, если твоя цель — южный британский." },
    "r-tap":      { n: "Одноударный r", s: "ɾ", g: "cons", c: "#5b2d86",
      d: "r одним касанием языка, почти как русское «р». Шотландия.",
      copy: "Только узнавать." },
    "t-tap":      { n: "t как быстрый d", s: "ɾ", g: "cons", c: "#1f7a3d",
      d: "t между гласными одним касанием языка. У британцев встречается в быстрой речи, в американском — норма.",
      copy: "Для британского — не копировать." },
    yod:          { n: "Слияние с j", s: "tj→tʃ", g: "cons", c: "#5b2d86",
      d: "t или d + [j] сливаются: Tuesday [ˈtʃuːzdeɪ], during [ˈdʒʊərɪŋ].",
      copy: "Можно копировать — современный южный стандарт." },
    "ng-g":       { n: "ng с [ɡ]", s: "ŋɡ", g: "cons", c: "#2f6f73",
      d: "После ng слышно отдельное [ɡ]: singing → [ˈsɪŋɡɪŋ]. Северо-запад Англии.",
      copy: "Только узнавать." },
    velar:        { n: "Звук [x]", s: "x", g: "cons", c: "#5b2d86",
      d: "Как русское «х» в loch. Шотландия.", copy: "Узнавать." },
    wh:           { n: "Глухой [ʍ] в wh", s: "ʍ", g: "cons", c: "#5b2d86",
      d: "which, when с придыханием — [ʍɪtʃ]. Шотландия.", copy: "Узнавать." },
    syll:         { n: "Слоговой n / l", s: "n̩", g: "cons", c: "#8a6d00",
      d: "Гласной нет, согласный сам образует слог: nation [ˈneɪʃn̩], people [ˈpiːpl̩].",
      copy: "Копировать: «нейшен» с гласной звучит по-русски." },

    "bath-long":  { n: "Долгий [ɑː] в bath", s: "ɑː", g: "vow", c: "#7c2340",
      d: "В словах last, after, can't — глубокое долгое [ɑː]. Главный маркер южнобританского.",
      copy: "Копировать для южного британского." },
    "bath-short": { n: "Короткий [a] в bath", s: "a", g: "vow", c: "#b5654a",
      d: "Север Англии и Шотландия: last, after, class с коротким [a].",
      copy: "Узнавать. Если учишь южный стандарт — [ɑː]." },
    "strut-north":{ n: "[ʊ] вместо [ʌ]", s: "ʌ→ʊ", g: "vow", c: "#b5654a",
      d: "На севере Англии love, bus, much, country звучат с [ʊ], как put.",
      copy: "Только узнавать." },
    "goat-london":{ n: "Лондонский GOAT", s: "ʌʊ", g: "vow", c: "#2f6f73",
      d: "go, know с открытым началом [ʌʊ] — почти «ау».", copy: "Узнавать." },
    "goat-mono":  { n: "Ровный [o] в go", s: "oː", g: "vow", c: "#5b2d86",
      d: "Север и Шотландия: go, know без скольжения — [ɡoː].", copy: "Узнавать. Юг: [əʊ]." },
    "face-london":{ n: "Лондонский FACE", s: "æɪ", g: "vow", c: "#2f6f73",
      d: "day, eight с широким началом [æɪ] — почти «ай».", copy: "Узнавать." },
    "face-mono":  { n: "Ровный [e] в day", s: "eː", g: "vow", c: "#5b2d86",
      d: "Север и Шотландия: day, make без скольжения — [deː], [mek].", copy: "Узнавать. Юг: [eɪ]." },
    "price-london":{n: "Лондонский PRICE", s: "ɑɪ", g: "vow", c: "#2f6f73",
      d: "life, right с глубоким началом [ɑɪ] — почти «ой».", copy: "Узнавать." },
    "mouth-london":{n: "Лондонский MOUTH", s: "æʊ", g: "vow", c: "#2f6f73",
      d: "now, about с широким [æʊ] или даже [æː].", copy: "Узнавать." },
    "happy-tense":{ n: "Долгое [i] на конце", s: "-i", g: "vow", c: "#8a6d00",
      d: "happy, country, really: конечный гласный напряжённый [i].", copy: "Копировать — современный стандарт." },
    "happy-lax":  { n: "Краткое [ɪ] на конце", s: "-ɪ", g: "vow", c: "#8a6d00",
      d: "Старое RP: happy [ˈhæpɪ]. Так говорят король и старшее поколение.", copy: "Узнавать." },
    "happy-north":{ n: "[e] на конце", s: "-e", g: "vow", c: "#b5654a",
      d: "Север и Шотландия: happy [ˈhape], city [ˈsɪte].", copy: "Узнавать." },
    "goose-front":{ n: "Передний [ʉ]", s: "ʉ", g: "vow", c: "#5b2d86",
      d: "too, food, good — гласный ближе к «ю» без j. Шотландия (и молодой юг).", copy: "Узнавать." },
    smooth:       { n: "Сжатый дифтонг", s: "aʊə→ɑː", g: "vow", c: "#8a6d00",
      d: "our, power, fire сжимаются в один долгий гласный: our → [ɑː].", copy: "Можно копировать в быстрой речи." },
    "cure-force": { n: "sure как [ʃɔː]", s: "ʊə→ɔː", g: "vow", c: "#8a6d00",
      d: "sure, poor с [ɔː] вместо [ʊə]. Современный стандарт.", copy: "Копировать." },

    weak:         { n: "Слабая форма", s: "ə", g: "flow", c: "#b5654a",
      d: "Служебные слова без ударения сжимаются до [ə]: to [tə], of [əv], and [ən].",
      copy: "Копировать обязательно — это ритм английской речи." }
  };

  var LINK = {
    link:      { n: "Сцепление", c: "#7c2340", d: "Согласный на конце перетекает в гласную следующего слова." },
    linkr:     { n: "Связующий r", c: "#b5654a", d: "r на конце слова звучит только перед гласной." },
    intrusive: { n: "Интрузивный r", c: "#b5654a", d: "Буквы r нет, но между гласными появляется [r]: idea‿r‿of." },
    glide:     { n: "Вставной звук", c: "#8a6d00", d: "Между гласными появляется лёгкий [j] или [w]." },
    join:      { n: "Слитно", c: "#2f6f73", d: "Согласные на стыке сливаются без паузы." },
    hjoin:     { n: "Без h", c: "#6a5f58", d: "h выпал — слово прилипло к предыдущему." }
  };

  var FUNC = /^(a|an|the|and|or|but|as|at|for|from|of|to|than|some|them|her|him|his|you|your|are|was|were|can|could|would|should|must|have|has|had|do|does|am|be|been|that|there|us|we|he|she|they|me|my|by|into|onto|will|shall|just|is|it|its|our|their|in|on|with)$/;
  var BATH = /^(last|lasts|lasted|lasting|past|fast|faster|vast|after|afterwards|can't|cannot|class|classes|glass|grass|pass|passed|passing|path|paths|bath|baths|ask|asked|asking|task|tasks|mask|dance|dancing|chance|chances|France|advance|advanced|plant|plants|grant|answer|answers|example|examples|demand|demands|command|branch|half|calf|laugh|laughed|rather|castle|master|nasty|disaster|aunt|craft|draft|staff|after|afternoon|photograph|graph|telegraph|contrast|broadcast|forecast|overcast|sample|chancellor|advantage|disadvantage)$/i;
  var FOOT = /^(put|puts|push|pull|full|fully|bull|bush|sugar|butcher|cushion|could|couldn't|would|should|good|look|book|took|foot|woman|wolf|stood|wood|cook|hook|shook|understood|football|pudding|put)$/i;
  var STRUT_O = /^(love|loved|lovely|come|comes|coming|some|someone|something|somebody|one|once|done|son|money|mother|other|another|others|nothing|month|months|monthly|country|countries|brother|cover|wonder|wonderful|among|front|government|governments|none|dozen|oven|honey|tongue|young|touch|enough|double|trouble|country's|blood|flood|does|doesn't|income|become|becomes|onion|London|Monday|colour|southern|worry|worried|everyone|anyone|no-one|hundred|hundreds|recovery|discover|done|won|ton|tough|rough|cousin|flood|lovely|couple|country)$/i;

  var VOW = /[aeiouæɑɒɔəɜɪʊʌɛɐɘʉɵ]/;
  function plainIpa(p) { return p.replace(/[ˈˌ]/g, ""); }

  function tokensOf(t) {
    var re = /(\|\||\|)|([A-Za-z0-9£%'’↘↗][A-Za-z0-9£%'’↘↗.-]*[A-Za-z0-9%'’↘↗]|[A-Za-z0-9£%↘↗]+)|(\S)/g;
    var out = [], m;
    while ((m = re.exec(t))) {
      if (m[1]) out.push({ bar: m[1] });
      else if (m[2] && /[A-Za-z0-9]/.test(m[2])) out.push({ word: m[2] });
      else out.push({ punct: m[0] });
    }
    return out;
  }

  function nucleusOf(raw) {
    var clean = "", nuc = null, i = 0;
    while (i < raw.length) {
      var ch = raw.charAt(i);
      if (ch === "↘" || ch === "↗") {
        var nx = raw.charAt(i + 1), tone;
        if (ch === "↘" && nx === "↗") { tone = "fallrise"; i++; }
        else if (ch === "↗" && nx === "↘") { tone = "risefall"; i++; }
        else tone = ch === "↘" ? "fall" : "rise";
        nuc = { tone: tone, at: clean.length };
      } else clean += ch;
      i++;
    }
    return { clean: clean.replace(/’/g, "'"), nuc: nuc };
  }

  /* ударный слог ядра: от метки до начала следующего слога */
  function syllable(word, at) {
    var V = /[aeiouy]/i, L = /[a-z]/i, i = at, n = word.length;
    while (i < n && L.test(word.charAt(i)) && !V.test(word.charAt(i))) i++;
    while (i < n && V.test(word.charAt(i))) i++;
    var c = 0;
    while (i + c < n && L.test(word.charAt(i + c)) && !V.test(word.charAt(i + c))) c++;
    if (i + c >= n || !L.test(word.charAt(i + c)) || /^e[sd]?$/i.test(word.slice(i + c).replace(/[^a-z]+$/i, ""))) return [at, i + c >= n ? n : (/^e[sd]?$/i.test(word.slice(i + c).replace(/[^a-z]+$/i, "")) ? i + c + word.slice(i + c).replace(/[^a-z]+$/i, "").length : i + c)];
    if (c <= 1) return [at, i];
    return [at, i + c - 1];
  }

  function tagWord(w, p) {
    var tags = [], lw = w.toLowerCase().replace(/[^a-z']/g, ""), q = plainIpa(p);
    if (!q) return tags;
    if (q.indexOf("ʔ") >= 0) tags.push("glottal");
    if (/\((t|d|k|p|ə|h|v|n)\)/.test(q)) tags.push("elide");
    if (/^h/.test(lw) && !/^(hour|honest|honou?r|heir)/.test(lw) && !/^h/.test(q.replace(/^\(h\)/, "")) && !/^\(h\)/.test(q)) tags.push("hdrop");
    if (/th/.test(lw) && !/[θð]/.test(q)) {
      if (/[fv]/.test(q)) tags.push("th-front"); else if (/[td]/.test(q)) tags.push("th-stop");
    }
    if ((/l(?![aeiouy])/.test(lw) || /[^aeiou]les?$/.test(lw)) && !/[lɫ]/.test(q) && lw !== "could" && lw !== "would" && lw !== "should" && !/(alk|olk|alm|alf|ould)/.test(lw)) tags.push("lvoc");
    if (q.indexOf("ɫ") >= 0) tags.push("dark-l");
    var hasPostR = /r(?![aeiouy])|r$|re$|rs$|rd$|rt$|rn$|rm$|rk$|rl$/.test(lw);
    if (hasPostR) {
      if (/[ɹɾ]/.test(q)) tags.push("rhotic");
      else if (!/[rʳ]/.test(q.replace(/^r/, ""))) tags.push("nor");
    }
    if (/ɾ/.test(q) && /t/.test(lw) && !/r/.test(lw)) tags.push("t-tap");
    if (/(tʃ|dʒ)(uː|ʊə|ʉ)/.test(q) && /(tu|du|tue|dew|dur)/.test(lw)) tags.push("yod");
    if (/ŋɡ/.test(q) && /ng$|ngs$|nging$/.test(lw)) tags.push("ng-g");
    if (/x/.test(q)) tags.push("velar");
    if (/ʍ/.test(q)) tags.push("wh");
    if (/n̩|l̩|m̩/.test(q)) tags.push("syll");

    if (BATH.test(lw)) {
      if (/ɑː/.test(q)) tags.push("bath-long");
      else if (/a|æ/.test(q)) tags.push("bath-short");
    }
    var noDiph = q.replace(/əʊ|aʊ|ʊə|ʌʊ|ɔʊ|oʊ|ɘʊ|æʊ|ɐʊ/g, "");
    if (/ʊ/.test(noDiph) && !FOOT.test(lw) && (STRUT_O.test(lw) || (/u(?![er])/.test(lw) && !/(oo|ou|ull|ush|uth|ure)/.test(lw)))) tags.push("strut-north");
    if (/ʌʊ|ɐʊ/.test(q)) tags.push("goat-london");
    if (/oː|o(?![ʊɪː])/.test(q.replace(/ɒ|ɔ/g, "")) && /o/.test(lw)) tags.push("goat-mono");
    if (/æɪ|ʌɪ/.test(q)) tags.push("face-london");
    var qf = /[^aeiouy]y$/.test(lw) ? q.replace(/e$/, "") : q;
    if (!/eɪ/.test(q) && /eː|e(?![ɪəː])/.test(qf) && !/(ative|atives|erature|eratures|ature\b.*|iate)$/.test(lw.replace(/^(nature|natures|feature|features|creature|creatures)$/, "keep")) && !/^(again|against|said|says|agenda|any|anyone|anything|anybody|anywhere|many|every|everyone|everything|everybody|everywhere|whatever|however|separate|chocolate|private|climate|senate|palace|necklace|surface)$/.test(lw) &&
        /(a[bcdfgklmnpstvz]e|a[bcdfgklmnpstvz]i[a-z]|a[bcdfgklmnpstvz]or|ai|ay|ey|eigh|ation|ange|eat$|eak$|ature|atient|ajor)/.test(lw)) tags.push("face-mono");
    if (/ɑɪ/.test(q)) tags.push("price-london");
    if (/æʊ|æː/.test(q) && /(ou|ow)/.test(lw)) tags.push("mouth-london");
    if (/(y|ie|ey)$/.test(lw) && !/(ay|oy|uy)$/.test(lw) && (q.match(/[aeiouæɑɒɔəɜɪʊʌɛʉ]+/g) || []).length >= 2) {
      var end = q.replace(/[_(). ]+$/, "");
      if (/[aɔeʌɑ][ɪi]$/.test(end)) {}
      else if (/iː?$/.test(end)) tags.push("happy-tense");
      else if (/ɪ$/.test(end)) tags.push("happy-lax");
      else if (/e$/.test(end)) tags.push("happy-north");
    }
    if (/ʉ/.test(q)) tags.push("goose-front");
    if (/^(our|ours|hour|hours|power|powers|fire|tired|flower|tower|shower)$/.test(lw) && /ɑː|aː/.test(q) && !/aʊə|aɪə/.test(q)) tags.push("smooth");
    if (/^(sure|poor|tour|cure|pure|ensure|surely)$/.test(lw) && /ɔː/.test(q)) tags.push("cure-force");
    if (FUNC.test(lw) && /ə/.test(q) && !/ˈ/.test(p)) tags.push("weak");
    return tags;
  }

  function parse(seg) {
    var toks = tokensOf(seg.t || ""), words = [], units = [], cur = [];
    toks.forEach(function (tk) {
      if (tk.word) {
        var nu = nucleusOf(tk.word);
        var w = { raw: tk.word, text: nu.clean, nuc: nu.nuc, punct: "", tags: [], ipa: "", linkNext: null, unit: units.length };
        words.push(w); cur.push(w);
      } else if (tk.punct) {
        if (words.length) words[words.length - 1].punct += tk.punct;
        else if (/[A-Za-z]/.test(tk.punct)) {}
      } else if (tk.bar) {
        if (cur.length) { units.push({ words: cur, end: tk.bar }); cur = []; }
        words.forEach(function (x) { if (x.unit === units.length - 1) {} });
      }
    });
    if (cur.length) units.push({ words: cur, end: "||" });
    units.forEach(function (u, k) { u.words.forEach(function (w) { w.unit = k; }); u.nuc = u.words.filter(function (w) { return w.nuc; })[0] || null; });

    /* IPA */
    var pieces = [], joins = [];
    (seg.ipa || "").split(/\s+/).filter(function (x) { return x && x !== "|" && x !== "||"; }).forEach(function (chunk) {
      chunk.split("‿").forEach(function (p, i, arr) {
        pieces.push(p);
        joins.push(i < arr.length - 1);
      });
    });
    var ok = pieces.length === words.length;
    var problem = ok ? null : ("слов в тексте " + words.length + ", в транскрипции " + pieces.length);

    if (ok) {
      words.forEach(function (w, i) {
        w.ipa = pieces[i].replace(/_/g, " ");
        w.tags = tagWord(w.text, pieces[i]);
      });
      words.forEach(function (w, i) {
        if (!joins[i] || i === words.length - 1) return;
        var a = plainIpa(pieces[i]), b = plainIpa(pieces[i + 1]), nx = words[i + 1], type;
        if (/ʳ$/.test(a)) type = /r$|re$|rs$/i.test(w.text) ? "linkr" : "intrusive";
        else if (/[ʲʷ]$/.test(a)) type = "glide";
        else if (nx.tags.indexOf("hdrop") >= 0) type = "hjoin";
        else if (VOW.test(b.charAt(0))) type = "link";
        else type = "join";
        w.linkNext = type;
      });
    }
    return { words: words, units: units, ok: ok, problem: problem };
  }

  /* сводка по монологу: сколько раз встречается каждая метка и сцепление */
  function summary(mono) {
    var f = {}, l = {}, bad = [];
    (mono.segs || []).forEach(function (s, si) {
      var P = parse(s);
      if (!P.ok) bad.push({ seg: si, problem: P.problem });
      P.words.forEach(function (w) {
        w.tags.forEach(function (t) { (f[t] = f[t] || []).push({ seg: si, word: w.text, ipa: w.ipa }); });
        if (w.linkNext) (l[w.linkNext] = l[w.linkNext] || []).push({ seg: si, word: w.text });
      });
    });
    return { feats: f, links: l, bad: bad };
  }

  var root = typeof window !== "undefined" ? window : globalThis;
  root.BR = { FEAT: FEAT, LINK: LINK, parse: parse, summary: summary, syllable: syllable, tagWord: tagWord };
})();
