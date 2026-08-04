/* English with Asya — анимированный маскот-учитель на главной.
   Самодостаточный модуль: сам вставляет стили и hero-блок в #pane,
   НЕ трогает список курсов, кнопки и логику страницы.
   Персонаж следит глазами и головой за курсором мыши.
   Уважает prefers-reduced-motion. */
(function () {
  "use strict";
  if (window.__smMascot) return;
  window.__smMascot = true;

  var REDUCED = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- стили ---------- */
  var CSS = "" +
  ".mascot-hero{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;" +
    "gap:24px;align-items:center;padding:26px 28px;overflow:hidden;" +
    "background:" +
      "radial-gradient(120% 140% at 88% 18%, var(--color-accent-200,#ffe0d9) 0%, transparent 46%)," +
      "linear-gradient(180deg, var(--color-accent-100,#fff2ef) 0%, var(--color-surface,#eae9e9) 100%);" +
    "border-bottom:2px solid var(--color-divider,#20201e66)}" +
  ".mascot-hero .mh-copy{min-width:0;opacity:0;transform:translateY(16px);" +
    "transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1)}" +
  ".mascot-hero.in .mh-copy{opacity:1;transform:none}" +
  ".mascot-hero .mh-k{font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;" +
    "color:var(--color-accent,#ec3013);display:inline-flex;align-items:center;gap:9px}" +
  ".mascot-hero .mh-k::before{content:'';width:9px;height:9px;background:var(--color-accent,#ec3013);" +
    "border-radius:50%;box-shadow:0 0 0 4px var(--color-accent-200,#ffe0d9)}" +
  ".mascot-hero h2{margin:12px 0 0;font-family:'Archivo',system-ui,sans-serif;font-weight:800;" +
    "font-size:34px;line-height:1.02;letter-spacing:-.02em;color:var(--color-text,#201e1d)}" +
  ".mascot-hero h2 em{font-style:normal;color:var(--color-accent,#ec3013)}" +
  ".mascot-hero .mh-sub{margin:12px 0 0;font-size:15px;font-weight:600;max-width:44ch;" +
    "color:var(--color-neutral-700,#605d5d)}" +
  ".mascot-stage{position:relative;width:210px;height:210px;flex:none;" +
    "opacity:0;transform:translateY(20px) scale(.96);" +
    "transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}" +
  ".mascot-hero.in .mascot-stage{opacity:1;transform:none}" +
  ".mascot-float{width:100%;height:100%;animation:mascotFloat 5.6s ease-in-out infinite}" +
  ".mascot-stage svg{width:100%;height:100%;overflow:visible;display:block}" +
  "#m-eyeL,#m-eyeR{transform-box:fill-box;transform-origin:center;" +
    "transition:transform .12s ease-out}" +
  ".m-blink #m-eyeL,.m-blink #m-eyeR{transform:scaleY(.08)}" +
  "#m-pupils,#m-head,#m-brows{transition:transform .14s ease-out}" +
  "#m-arm{transform-box:fill-box;transform-origin:64px 150px}" +
  ".mascot-wave #m-arm{animation:mascotWave 1.1s ease-in-out 1}" +
  "@keyframes mascotFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}" +
  "@keyframes mascotWave{0%,100%{transform:rotate(0)}25%{transform:rotate(16deg)}" +
    "60%{transform:rotate(-8deg)}80%{transform:rotate(10deg)}}" +
  "@media(max-width:820px){.mascot-hero{grid-template-columns:minmax(0,1fr);gap:16px;padding:22px 18px}" +
    ".mascot-hero h2{font-size:26px}.mascot-stage{width:150px;height:150px}" +
    ".mascot-hero .mh-sub{display:none}}" +
  "@media(prefers-reduced-motion:reduce){.mascot-float{animation:none}" +
    ".mascot-hero .mh-copy,.mascot-stage{opacity:1;transform:none;transition:none}" +
    "#m-pupils,#m-head,#m-brows,#m-eyeL,#m-eyeR{transition:none}}";

  /* ---------- SVG персонажа ---------- */
  var SVG = '' +
  '<svg viewBox="0 0 200 210" role="img" aria-label="Учитель английского — маскот">' +
    '<defs>' +
      '<radialGradient id="mg-skin" cx="42%" cy="34%" r="72%">' +
        '<stop offset="0%" stop-color="#ffe4d0"/><stop offset="62%" stop-color="#ffcaa6"/>' +
        '<stop offset="100%" stop-color="#f0a874"/></radialGradient>' +
      '<radialGradient id="mg-hair" cx="40%" cy="26%" r="80%">' +
        '<stop offset="0%" stop-color="#5a3324"/><stop offset="100%" stop-color="#331b12"/></radialGradient>' +
      '<linearGradient id="mg-body" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#ff5a3c"/><stop offset="100%" stop-color="#d0250c"/></linearGradient>' +
      '<radialGradient id="mg-cheek" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="#ff9d7e"/><stop offset="100%" stop-color="#ff9d7e" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="mg-book" cx="50%" cy="30%" r="80%">' +
        '<stop offset="0%" stop-color="#ffd34d"/><stop offset="100%" stop-color="#f0a800"/></radialGradient>' +
      '<filter id="mg-soft" x="-30%" y="-30%" width="160%" height="160%">' +
        '<feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#201e1d" flood-opacity="0.18"/></filter>' +
    '</defs>' +

    '<ellipse cx="100" cy="196" rx="60" ry="11" fill="#201e1d" opacity="0.13"/>' +

    '<g id="m-head" filter="url(#mg-soft)">' +
      /* --- корпус / свитер --- */
      '<path d="M44 210 Q46 150 100 150 Q154 150 156 210 Z" fill="url(#mg-body)"/>' +
      '<path d="M84 152 Q100 168 116 152 L112 150 Q100 160 88 150 Z" fill="#a81a00" opacity="0.55"/>' +
      /* --- рука с указкой (машет) --- */
      '<g id="m-arm">' +
        '<rect x="150" y="150" width="42" height="15" rx="7.5" transform="rotate(-32 150 150)" fill="#e94a2c"/>' +
        '<circle cx="182" cy="128" r="11" fill="url(#mg-skin)"/>' +
        '<rect x="176" y="96" width="6" height="34" rx="3" transform="rotate(18 179 113)" fill="#f0a800"/>' +
        '<circle cx="188" cy="97" r="6" fill="#ffd34d"/>' +
      '</g>' +
      /* --- шея --- */
      '<rect x="90" y="130" width="20" height="24" rx="9" fill="url(#mg-skin)"/>' +
      /* --- длинные волосы за головой, спадают на плечи --- */
      '<path d="M40 96 Q30 40 100 34 Q170 40 160 96 Q171 140 151 180 '+
        'Q143 150 141 118 Q143 76 100 72 Q57 76 59 118 Q57 150 49 180 '+
        'Q29 140 40 96 Z" fill="url(#mg-hair)"/>' +
      /* --- голова --- */
      '<circle cx="100" cy="90" r="50" fill="url(#mg-skin)"/>' +
      /* --- уши с серёжками --- */
      '<circle cx="52" cy="96" r="8" fill="url(#mg-skin)"/>' +
      '<circle cx="148" cy="96" r="8" fill="url(#mg-skin)"/>' +
      '<circle cx="52" cy="106" r="3.2" fill="#f0a800"/>' +
      '<circle cx="148" cy="106" r="3.2" fill="#f0a800"/>' +
      /* --- чёлка на бок + пряди, обрамляющие лицо --- */
      '<path d="M50 96 Q42 46 100 40 Q158 46 150 96 Q150 66 118 58 '+
        'Q126 70 112 74 Q88 62 70 70 Q56 66 52 84 Q50 72 50 96 Z" fill="url(#mg-hair)"/>' +
      '<path d="M50 96 Q47 126 59 150 Q55 116 65 98 Z" fill="url(#mg-hair)"/>' +
      '<path d="M150 96 Q153 126 141 150 Q145 116 135 98 Z" fill="url(#mg-hair)"/>' +
      /* --- щёки --- */
      '<ellipse cx="70" cy="108" rx="12" ry="8" fill="url(#mg-cheek)"/>' +
      '<ellipse cx="130" cy="108" rx="12" ry="8" fill="url(#mg-cheek)"/>' +
      /* --- брови (мягкие дуги) --- */
      '<g id="m-brows">' +
        '<path d="M61 80 Q74 74 87 80" stroke="#4a2a1c" stroke-width="4" fill="none" stroke-linecap="round"/>' +
        '<path d="M113 80 Q126 74 139 80" stroke="#4a2a1c" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '</g>' +
      /* --- глаза (белки следят/моргают) с ресничками --- */
      '<g id="m-eyeL"><ellipse cx="74" cy="93" rx="14" ry="15.5" fill="#fff"/>' +
        '<path d="M60 87 Q74 79 88 87" stroke="#2f1c14" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
        '<path d="M60 87 l-5 -2 M63 84 l-4 -3" stroke="#2f1c14" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>' +
      '<g id="m-eyeR"><ellipse cx="126" cy="93" rx="14" ry="15.5" fill="#fff"/>' +
        '<path d="M112 87 Q126 79 140 87" stroke="#2f1c14" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
        '<path d="M140 87 l5 -2 M137 84 l4 -3" stroke="#2f1c14" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>' +
      /* --- зрачки (двигаются) --- */
      '<g id="m-pupils">' +
        '<circle cx="74" cy="94" r="7" fill="#241a15"/>' +
        '<circle cx="76.5" cy="91" r="2.4" fill="#fff"/>' +
        '<circle cx="126" cy="94" r="7" fill="#241a15"/>' +
        '<circle cx="128.5" cy="91" r="2.4" fill="#fff"/>' +
      '</g>' +
      /* --- нос --- */
      '<path d="M97 102 Q100 109 103 102" fill="none" stroke="#e0a07a" stroke-width="2.6" stroke-linecap="round"/>' +
      /* --- губы (улыбка) --- */
      '<path d="M86 116 Q100 122 114 116 Q108 128 100 128 Q92 128 86 116 Z" fill="#e0607a"/>' +
      '<path d="M86 116 Q100 120 114 116" stroke="#b83f57" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
    '</g>' +

    /* --- книжка с буквой A (учебник) --- */
    '<g id="m-book" filter="url(#mg-soft)">' +
      '<rect x="70" y="168" width="60" height="40" rx="4" fill="url(#mg-book)"/>' +
      '<rect x="70" y="168" width="60" height="40" rx="4" fill="none" stroke="#b57f00" stroke-width="2"/>' +
      '<path d="M100 170 V206" stroke="#b57f00" stroke-width="2"/>' +
      '<text x="84" y="194" font-family="Archivo,system-ui,sans-serif" font-size="20" font-weight="800" '+
        'fill="#7c4a00" text-anchor="middle">A</text>' +
      '<text x="116" y="194" font-family="Archivo,system-ui,sans-serif" font-size="20" font-weight="800" '+
        'fill="#7c4a00" text-anchor="middle">B</text>' +
    '</g>' +
  '</svg>';

  /* ---------- hero-блок ---------- */
  function buildHero() {
    var hero = document.createElement("div");
    hero.className = "mascot-hero";
    hero.innerHTML =
      '<div class="mh-copy">' +
        '<span class="mh-k">Твой кабинет · English with Asya</span>' +
        '<h2>Привет! Готов<span id="mh-a">а</span> учить <em>английский</em>?</h2>' +
        '<p class="mh-sub">Веди мышкой по экрану — учитель следит за тобой. ' +
        'Ниже твои курсы, всё как раньше.</p>' +
      '</div>' +
      '<div class="mascot-stage"><div class="mascot-float">' + SVG + '</div></div>';
    return hero;
  }

  /* ---------- слежение за курсором ---------- */
  var pupils, head, brows, stage, eyeL, eyeR, root;
  var tx = 0, ty = 0, cx = 0, cy = 0;      // цель / текущее (доля -1..1)
  var raf = 0;

  function grab(hero) {
    stage = hero.querySelector(".mascot-stage");
    root  = hero.querySelector("svg");
    pupils = hero.querySelector("#m-pupils");
    head  = hero.querySelector("#m-head");
    brows = hero.querySelector("#m-brows");
    eyeL  = hero.querySelector("#m-eyeL");
    eyeR  = hero.querySelector("#m-eyeR");
  }

  function onMove(e) {
    if (!stage) return;
    var r = stage.getBoundingClientRect();
    var ex = r.left + r.width * 0.5;
    var ey = r.top + r.height * 0.42;      // центр головы
    var dx = e.clientX - ex, dy = e.clientY - ey;
    var d = Math.hypot(dx, dy) || 1;
    var reach = Math.max(260, window.innerWidth * 0.5);
    var f = Math.min(1, d / reach);
    tx = (dx / d) * f;
    ty = (dy / d) * f;
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function tick() {
    cx += (tx - cx) * 0.18;
    cy += (ty - cy) * 0.18;
    if (pupils) pupils.setAttribute("transform",
      "translate(" + (cx * 6).toFixed(2) + "," + (cy * 5).toFixed(2) + ")");
    if (head) head.setAttribute("transform",
      "translate(" + (cx * 5).toFixed(2) + "," + (cy * 3).toFixed(2) +
      ") rotate(" + (cx * 4).toFixed(2) + " 100 90)");
    if (brows) brows.setAttribute("transform",
      "translate(0," + (Math.min(0, cy) * 3).toFixed(2) + ")");
    if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) {
      raf = requestAnimationFrame(tick);
    } else { raf = 0; }
  }

  function startBlink(hero) {
    function blink() {
      hero.classList.add("m-blink");
      setTimeout(function () { hero.classList.remove("m-blink"); }, 140);
      setTimeout(blink, 2600 + Math.random() * 3200);
    }
    setTimeout(blink, 2200);
  }

  /* ---------- монтаж ---------- */
  function mount() {
    var pane = document.getElementById("pane");
    if (!pane) return false;
    if (pane.querySelector(".mascot-hero")) return true;
    if (!pane.querySelector(".pane-hd")) return false;  // ждём отрисовку кабинета
    var hero = buildHero();
    var hd = pane.querySelector(".pane-hd");
    pane.insertBefore(hero, hd);
    grab(hero);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { hero.classList.add("in"); });
    });

    if (!REDUCED) {
      setTimeout(function () {
        hero.classList.add("mascot-wave");
        setTimeout(function () { hero.classList.remove("mascot-wave"); }, 1300);
      }, 700);
      window.addEventListener("mousemove", onMove, { passive: true });
      startBlink(hero);
    }
    return true;
  }

  function init() {
    var style = document.createElement("style");
    style.setAttribute("data-sm-mascot", "");
    style.textContent = CSS;
    document.head.appendChild(style);

    if (mount()) return;
    var pane = document.getElementById("pane");
    var obs = new MutationObserver(function () { if (mount()) obs.disconnect(); });
    if (pane) obs.observe(pane, { childList: true, subtree: true });
    setTimeout(function () { if (mount()) obs.disconnect(); }, 4000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
