/* English with Asya — маскот-учитель на главной сцене.
   Портрет (img/teacher-mascot.jpg) СТОИТ НЕПОДВИЖНО. За курсором мыши следят
   ТОЛЬКО глаза: два зрачка поверх её глаз плавно смотрят в сторону стрелки.
   Список курсов и меню НЕ трогает. Уважает prefers-reduced-motion. */
(function () {
"use strict";
if (window.__smMascot) return;
window.__smMascot = true;

var REDUCED = window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Центры глаз в долях кадра портрета (подобрано под teacher-mascot.jpg).
   x/y — где рисуем зрачок; move — макс. смещение зрачка в долях ширины портрета. */
var EYE_L = { x: 0.360, y: 0.282 };
var EYE_R = { x: 0.535, y: 0.282 };
var EYE_MOVE = 0.015;   // амплитуда «взгляда»
var PUPIL = 0.034;      // диаметр зрачка в долях ширины портрета

/* ---------- стили ---------- */
var CSS = "" +
".teacher-stage{position:relative;overflow:hidden;display:flex;flex-direction:column;" +
"align-items:center;justify-content:center;gap:4px;padding:44px 34px;text-align:center;" +
"background:" +
"radial-gradient(120% 110% at 50% 6%, #fff6f0 0%, transparent 55%)," +
"radial-gradient(90% 90% at 84% 96%, var(--color-accent-100,#ffe7df) 0%, transparent 52%)," +
"linear-gradient(180deg,#fbf7f3 0%,var(--color-surface,#eae9e9) 100%)}" +
".teacher-stage::before,.teacher-stage::after{content:'';position:absolute;border-radius:50%;" +
"border:2px solid #20201e14;pointer-events:none}" +
".teacher-stage::before{width:560px;height:560px;top:-180px;right:-190px}" +
".teacher-stage::after{width:360px;height:360px;bottom:-140px;left:-130px}" +
".ts-k{position:relative;font-size:12px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;" +
"color:var(--color-accent,#ec3013);display:inline-flex;align-items:center;gap:9px;" +
"opacity:0;transform:translateY(14px);transition:opacity .6s cubic-bezier(.16,1,.3,1),transform .6s cubic-bezier(.16,1,.3,1)}" +
".ts-k::before{content:'';width:8px;height:8px;background:var(--color-accent,#ec3013);border-radius:50%;" +
"box-shadow:0 0 0 4px var(--color-accent-200,#ffd9cf)}" +
".ts-h{position:relative;margin:8px 0 0;font-family:'Archivo',system-ui,sans-serif;font-weight:800;" +
"font-size:clamp(24px,3vw,40px);line-height:1.04;letter-spacing:-.02em;color:var(--color-text,#201e1d);" +
"opacity:0;transform:translateY(16px);transition:opacity .6s cubic-bezier(.16,1,.3,1) .05s,transform .6s cubic-bezier(.16,1,.3,1) .05s}" +
".ts-h em{font-style:normal;color:var(--color-accent,#ec3013)}" +
".ts-sub{position:relative;margin:10px 0 0;font-size:clamp(13px,1.2vw,15px);font-weight:600;max-width:40ch;" +
"color:var(--color-neutral-700,#605d5d);opacity:0;transform:translateY(16px);" +
"transition:opacity .6s cubic-bezier(.16,1,.3,1) .1s,transform .6s cubic-bezier(.16,1,.3,1) .1s}" +
".teacher-stage.in .ts-k,.teacher-stage.in .ts-h,.teacher-stage.in .ts-sub{opacity:1;transform:none}" +
/* сцена и НЕПОДВИЖНЫЙ портрет */
".ts-scene{position:relative;margin-top:22px;width:clamp(240px,31vw,380px);height:clamp(240px,31vw,380px)}" +
".ts-portrait{position:relative;width:100%;height:100%;border-radius:26px;overflow:hidden;background:#e9e2da;" +
"box-shadow:0 26px 60px -22px rgba(60,30,15,.55),0 4px 14px rgba(60,30,15,.18);" +
"outline:6px solid #fff;outline-offset:-6px;" +
"opacity:0;transform:translateY(24px) scale(.96);" +
"transition:opacity .8s cubic-bezier(.16,1,.3,1) .1s,transform .8s cubic-bezier(.16,1,.3,1) .1s}" +
".teacher-stage.in .ts-portrait{opacity:1;transform:none}" +
".ts-portrait img{position:absolute;inset:-6%;width:112%;height:112%;object-fit:cover;display:block}" +
".ts-portrait::after{content:'';position:absolute;inset:0;border-radius:26px;pointer-events:none;" +
"background:radial-gradient(70% 55% at 30% 20%, rgba(255,255,255,.22), transparent 60%);mix-blend-mode:screen}" +
/* зрачки-«взгляд» */
".ts-eye{position:absolute;border-radius:50%;pointer-events:none;z-index:3;" +
"background:radial-gradient(circle at 38% 34%, #6a4327 0%, #34200f 52%, #1c0f06 100%);" +
"box-shadow:0 0 2px rgba(20,10,4,.5);transition:transform .12s ease-out;will-change:transform}" +
".ts-eye::after{content:'';position:absolute;top:20%;left:26%;width:30%;height:30%;border-radius:50%;" +
"background:rgba(255,255,255,.9)}" +
".ts-shadow{position:absolute;left:50%;bottom:-14px;width:60%;height:20px;transform:translateX(-50%);" +
"background:radial-gradient(50% 50% at 50% 50%, rgba(50,26,12,.28), transparent 72%);filter:blur(2px)}" +
"@media(prefers-reduced-motion:reduce){.ts-k,.ts-h,.ts-sub,.ts-portrait{opacity:1;transform:none;transition:none}" +
".ts-eye{transition:none}}";

/* ---------- слежение: только глаза ---------- */
var scene, portrait, eyeL, eyeR;
var tx = 0, ty = 0, cx = 0, cy = 0;
var raf = 0;

function grab(stage) {
  scene = stage.querySelector(".ts-scene");
  portrait = stage.querySelector(".ts-portrait");
  eyeL = stage.querySelector(".ts-eye.l");
  eyeR = stage.querySelector(".ts-eye.r");
}

function onMove(e) {
  if (!portrait) return;
  var r = portrait.getBoundingClientRect();
  // ориентируемся от центра между глазами
  var ex = r.left + r.width * ((EYE_L.x + EYE_R.x) / 2);
  var ey = r.top + r.height * ((EYE_L.y + EYE_R.y) / 2);
  var dx = e.clientX - ex, dy = e.clientY - ey;
  var d = Math.hypot(dx, dy) || 1;
  var reach = Math.max(300, window.innerWidth * 0.5);
  var f = Math.min(1, d / reach);
  tx = (dx / d) * f;
  ty = (dy / d) * f;
  if (!raf) raf = requestAnimationFrame(tick);
}

function tick() {
  cx += (tx - cx) * 0.2;
  cy += (ty - cy) * 0.2;
  if (portrait) {
    var w = portrait.getBoundingClientRect().width || 340;
    var mx = (cx * EYE_MOVE * w).toFixed(2);
    var my = (cy * EYE_MOVE * w).toFixed(2);
    var t = "translate(calc(-50% + " + mx + "px), calc(-50% + " + my + "px))";
    if (eyeL) eyeL.style.transform = t;
    if (eyeR) eyeR.style.transform = t;
  }
  if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) {
    raf = requestAnimationFrame(tick);
  } else { raf = 0; }
}

function eyeStyle(eye) {
  return "left:" + (eye.x * 100).toFixed(2) + "%;top:" + (eye.y * 100).toFixed(2) + "%;" +
    "width:" + (PUPIL * 100).toFixed(2) + "%;height:" + (PUPIL * 100).toFixed(2) + "%;" +
    "transform:translate(-50%,-50%)";
}

/* ---------- монтаж ---------- */
function fill(stage) {
  if (stage.dataset.smReady) return true;
  stage.dataset.smReady = "1";
  var name = (stage.getAttribute("data-name") || "").trim();
  var hi = name ? ("Привет, " + name + "!") : "Привет!";
  stage.innerHTML =
    '<span class="ts-k">English with Asya</span>' +
    '<h2 class="ts-h">' + hi + ' Готова учить<br><em>английский</em>?</h2>' +
    '<p class="ts-sub">Веди мышкой по экрану — учитель следит за тобой глазами. ' +
    'Меню слева, твои курсы — справа.</p>' +
    '<div class="ts-scene">' +
      '<div class="ts-portrait">' +
        '<img src="img/teacher-mascot.jpg" alt="Учитель английского" draggable="false">' +
        '<span class="ts-eye l" style="' + eyeStyle(EYE_L) + '"></span>' +
        '<span class="ts-eye r" style="' + eyeStyle(EYE_R) + '"></span>' +
      '</div>' +
      '<div class="ts-shadow"></div>' +
    '</div>';
  grab(stage);

  requestAnimationFrame(function () {
    requestAnimationFrame(function () { stage.classList.add("in"); });
  });

  if (!REDUCED) {
    window.addEventListener("mousemove", onMove, { passive: true });
  }
  return true;
}

function tryMount() {
  var stage = document.getElementById("mascotStage");
  if (stage) return fill(stage);
  return false;
}

function init() {
  var style = document.createElement("style");
  style.setAttribute("data-sm-mascot", "");
  style.textContent = CSS;
  document.head.appendChild(style);

  if (tryMount()) return;
  var pane = document.getElementById("pane") || document.body;
  var obs = new MutationObserver(function () { if (tryMount()) obs.disconnect(); });
  obs.observe(pane, { childList: true, subtree: true });
  setTimeout(function () { if (tryMount()) obs.disconnect(); }, 6000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else { init(); }
})();
