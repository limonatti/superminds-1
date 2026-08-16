/* English with Asya — сцена на главной.
   Вырезанный портрет Аси со стикерной обводкой стоит на мягкой панели,
   вокруг парят пилюли с названиями курсов. При движении мыши слои
   расходятся по глубине (параллакс). Двигаются только transform и opacity.
   Уважает prefers-reduced-motion, замирает на скрытой вкладке и вне экрана.
   Заполняет элемент .teacher-stage. Список курсов и меню не трогает. */
(function () {
"use strict";
if (window.__smHero) return;
window.__smHero = true;

var REDUCED = window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Пилюли — реальные разделы платформы. Позиция в процентах от сцены,
   d — глубина для параллакса (больше = двигается сильнее). */
var PILLS = [
  { t: "Разговорная практика", x:  -6, y: 12, d: 0.030, tone: "accent" },
  { t: "Focus 1 · A1–A2",      x:  70, y:  4, d: 0.022, tone: "plain"  },
  { t: "Speakout B1+",         x:  76, y: 33, d: 0.034, tone: "plain"  },
  { t: "Домашка с проверкой",  x: -12, y: 46, d: 0.026, tone: "plain"  },
  { t: "Чтение · Phonics",     x:  72, y: 66, d: 0.019, tone: "plain"  },
  { t: "Для детей 6–8",        x:  -2, y: 76, d: 0.032, tone: "plain"  }
];

/* Бордовый — цвет сцены. Менять здесь, в одном месте. */
var CSS = "" +
".teacher-stage{--hero-top:#7c2340;--hero-bg:#5d1930;--hero-deep:#3d0f1f;--hero-gold:#ffd27a;" +
"position:relative;overflow:hidden;display:flex;flex-direction:column;" +
"align-items:center;justify-content:center;gap:2px;padding:40px 30px 0;text-align:center;" +
"background:radial-gradient(115% 85% at 50% 4%,var(--hero-top) 0%,var(--hero-bg) 50%,var(--hero-deep) 100%)}" +

/* ---- текст ---- */
".hs-k{font-size:12px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;" +
"color:var(--hero-gold);display:inline-flex;align-items:center;gap:9px;" +
"opacity:0;transform:translateY(12px)}" +
".hs-k::before{content:'';width:8px;height:8px;background:var(--hero-gold);border-radius:50%}" +
".hs-h{margin:10px 0 0;font-family:'Archivo',system-ui,sans-serif;font-weight:800;" +
"font-size:clamp(24px,3vw,40px);line-height:1.04;letter-spacing:-.02em;color:#fff;" +
"opacity:0;transform:translateY(14px)}" +
".hs-h em{font-style:normal;color:var(--hero-gold)}" +
".hs-sub{margin:10px 0 0;font-size:clamp(13px,1.2vw,15px);font-weight:600;max-width:38ch;" +
"color:rgba(255,255,255,.84);opacity:0;transform:translateY(14px)}" +

/* ---- сцена ----
   Растягивается на всю оставшуюся высоту, фигура упирается в нижний край.
   Кадр обрезан по пояс, но срез совпадает с краем экрана и не читается. */
".hs{position:relative;margin-top:18px;flex:1 1 auto;min-height:clamp(240px,34vh,430px);" +
"width:min(100%,620px);display:flex;align-items:flex-end;justify-content:center}" +
/* Плашка светлее фона: на тёмно-бордовом тёмно-синий пиджак сам по себе
   не читается (контраст 1.1:1), фигуру держат обводка и эта подложка. */
".hs-panel{position:absolute;left:50%;bottom:0;width:min(76%,340px);height:86%;" +
"margin-left:calc(min(76%,340px) / -2);border-radius:999px 999px 0 0;" +
"background:rgba(255,255,255,.15);opacity:0;transform:scale(.94)}" +
".hs-figwrap{position:relative;display:inline-block;height:100%}" +
".hs-fig{position:relative;height:100%;width:auto;max-width:none;display:block;" +
"filter:drop-shadow(0 8px 44px rgba(20,4,10,.55));opacity:0;transform:translateY(26px)}" +
".hs-pill{position:absolute;display:inline-flex;align-items:center;white-space:nowrap;" +
"font-size:clamp(10px,1vw,12.5px);font-weight:800;letter-spacing:.01em;padding:8px 14px;" +
"border-radius:999px;background:#fff;color:#3a1120;" +
"box-shadow:0 8px 22px rgba(40,8,20,.28);opacity:0;transform:translateY(10px)}" +
".hs-pill.accent{background:var(--hero-gold);color:#4d1527}" +

/* ---- появление ---- */
".teacher-stage.in .hs-k,.teacher-stage.in .hs-h,.teacher-stage.in .hs-sub," +
".teacher-stage.in .hs-panel,.teacher-stage.in .hs-fig,.teacher-stage.in .hs-pill{" +
"opacity:1;transform:none;transition:opacity .5s cubic-bezier(.16,1,.3,1),transform .5s cubic-bezier(.16,1,.3,1)}" +
".teacher-stage.in .hs-h{transition-delay:.05s}" +
".teacher-stage.in .hs-sub{transition-delay:.1s}" +
".teacher-stage.in .hs-panel{transition-delay:.12s}" +
".teacher-stage.in .hs-fig{transition-delay:.2s}" +
".teacher-stage.in .hs-pill{transition-delay:calc(.34s + var(--i) * .07s)}" +

/* слои двигает только rAF, поэтому свой transform держим на вложенном узле */
".hs-par{will-change:transform}" +

"@media(max-width:960px){.hs{min-height:clamp(220px,32vh,340px)}" +
".hs-pill{font-size:10px;padding:6px 11px}}" +
"@media(prefers-reduced-motion:reduce){" +
".hs-k,.hs-h,.hs-sub,.hs-panel,.hs-fig,.hs-pill{opacity:1;transform:none;transition:none}" +
".hs-par{will-change:auto;transform:none!important}}";

function css(){
  var s = document.createElement("style");
  s.setAttribute("data-sm-hero","");
  s.textContent = CSS;
  document.head.appendChild(s);
}

function esc(v){
  return String(v == null ? "" : v).replace(/[&<>"']/g, function(c){
    return { "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c];
  });
}

function build(stage){
  var name = (stage.getAttribute("data-name") || "").trim();
  var hi = name ? esc(name.split(" ")[0]) + ", г" : "Г";

  var pills = PILLS.map(function(p, i){
    return '<span class="hs-par" style="position:absolute;left:' + p.x + '%;top:' + p.y + '%" data-d="' + p.d + '">' +
             '<span class="hs-pill' + (p.tone === "accent" ? " accent" : "") +
             '" style="--i:' + i + ';position:static">' + esc(p.t) + '</span>' +
           '</span>';
  }).join("");

  stage.innerHTML =
    '<span class="hs-k">English with Asya</span>' +
    '<h2 class="hs-h">' + hi + 'отова учить<br><em>английский</em>?</h2>' +
    '<p class="hs-sub">Твои курсы — в колонке справа. Продолжай с того места, где остановилась.</p>' +
    '<div class="hs">' +
      '<span class="hs-par" data-d="0.008" style="position:absolute;inset:0">' +
        '<span class="hs-panel"></span></span>' +
      '<span class="hs-par hs-figwrap" data-d="0.016">' +
        '<img class="hs-fig" src="img/asya-statue.webp" alt="Ася в образе античной статуи с ноутбуком" ' +
        'draggable="false" width="816" height="1280" fetchpriority="high">' +
      '</span>' +
      pills +
    '</div>';
}

function parallax(stage){
  if (REDUCED) return;
  var layers = [].slice.call(stage.querySelectorAll(".hs-par")).map(function(el){
    return { el: el, d: parseFloat(el.getAttribute("data-d")) || 0, x: 0, y: 0 };
  });
  var tx = 0, ty = 0, raf = 0, visible = true;

  function frame(){
    raf = 0;
    var moving = false;
    for (var i = 0; i < layers.length; i++){
      var L = layers[i];
      L.x += (tx * L.d * 100 - L.x) * 0.09;
      L.y += (ty * L.d * 100 - L.y) * 0.09;
      if (Math.abs(tx * L.d * 100 - L.x) > 0.05 || Math.abs(ty * L.d * 100 - L.y) > 0.05) moving = true;
      L.el.style.transform = "translate3d(" + L.x.toFixed(2) + "px," + L.y.toFixed(2) + "px,0)";
    }
    if (moving && visible) raf = requestAnimationFrame(frame);
  }
  function kick(){ if (!raf && visible) raf = requestAnimationFrame(frame); }

  window.addEventListener("mousemove", function(e){
    var r = stage.getBoundingClientRect();
    if (!r.width || !r.height) return;
    tx = (e.clientX - (r.left + r.width / 2)) / r.width;
    ty = (e.clientY - (r.top + r.height / 2)) / r.height;
    kick();
  }, { passive: true });

  window.addEventListener("blur", function(){ tx = ty = 0; kick(); });
  document.addEventListener("visibilitychange", function(){
    visible = !document.hidden;
    if (visible) kick(); else if (raf) { cancelAnimationFrame(raf); raf = 0; }
  });

  if (window.IntersectionObserver){
    new IntersectionObserver(function(es){
      visible = es[0].isIntersecting && !document.hidden;
      if (visible) kick(); else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { threshold: 0 }).observe(stage);
  }
}

function init(){
  var stage = document.getElementById("mascotStage") ||
              document.querySelector(".teacher-stage");
  if (!stage || stage.getAttribute("data-hero") === "1") return;
  stage.setAttribute("data-hero","1");
  build(stage);
  parallax(stage);
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){ stage.classList.add("in"); });
  });
}

css();
/* сцену рисует load() из index.html, поэтому ждём её появления */
if (document.querySelector(".teacher-stage")) init();
else {
  var mo = new MutationObserver(function(){
    if (document.querySelector(".teacher-stage")) { mo.disconnect(); init(); }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(function(){ mo.disconnect(); init(); }, 6000);
}
})();
