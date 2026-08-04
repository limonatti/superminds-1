/* English with Asya — большой маскот-учитель на главной сцене.
   Заполняет #mascotStage настоящим 3D-персонажем (img/teacher-mascot.jpg):
   портрет плавно поворачивается и наклоняется В СТОРОНУ курсора мыши по всей
   странице (эффект «учитель следит за тобой»), мягко парит.
   Список курсов и меню НЕ трогает. Уважает prefers-reduced-motion. */
(function () {
"use strict";
if (window.__smMascot) return;
window.__smMascot = true;

var REDUCED = window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- стили ---------- */
var CSS = "" +
".teacher-stage{position:relative;overflow:hidden;display:flex;flex-direction:column;" +
"align-items:center;justify-content:center;gap:4px;padding:44px 34px;text-align:center;" +
"background:" +
"radial-gradient(120% 110% at 50% 6%, #fff6f0 0%, transparent 55%)," +
"radial-gradient(90% 90% at 84% 96%, var(--color-accent-100,#ffe7df) 0%, transparent 52%)," +
"linear-gradient(180deg,#fbf7f3 0%,var(--color-surface,#eae9e9) 100%)}" +
/* декоративные тонкие кольца */
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
/* сцена с перспективой для 3D-наклона */
".ts-scene{position:relative;margin-top:22px;perspective:1100px;" +
"width:clamp(240px,31vw,380px);height:clamp(240px,31vw,380px)}" +
".ts-float{width:100%;height:100%;animation:tsFloat 6s ease-in-out infinite;will-change:transform}" +
".ts-portrait{position:relative;width:100%;height:100%;border-radius:26px;overflow:hidden;" +
"background:#e9e2da;transform-style:preserve-3d;" +
"box-shadow:0 26px 60px -22px rgba(60,30,15,.55),0 4px 14px rgba(60,30,15,.18);" +
"outline:6px solid #fff;outline-offset:-6px;" +
"transition:transform .18s cubic-bezier(.22,1,.36,1);opacity:0;transform:translateY(26px) scale(.94)}" +
".teacher-stage.in .ts-portrait{opacity:1;transform:none}" +
".ts-portrait img{position:absolute;inset:-6%;width:112%;height:112%;object-fit:cover;display:block;" +
"transition:transform .18s cubic-bezier(.22,1,.36,1)}" +
/* мягкий блик поверх портрета для «дорогого» вида */
".ts-portrait::after{content:'';position:absolute;inset:0;border-radius:26px;pointer-events:none;" +
"background:radial-gradient(70% 55% at 30% 20%, rgba(255,255,255,.28), transparent 60%);mix-blend-mode:screen}" +
/* подставка-тень */
".ts-shadow{position:absolute;left:50%;bottom:-14px;width:62%;height:22px;transform:translateX(-50%);" +
"background:radial-gradient(50% 50% at 50% 50%, rgba(50,26,12,.30), transparent 72%);filter:blur(2px)}" +
"@keyframes tsFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}" +
"@media(prefers-reduced-motion:reduce){.ts-float{animation:none}" +
".ts-k,.ts-h,.ts-sub,.ts-portrait{opacity:1;transform:none;transition:none}" +
".ts-portrait img{transition:none}}";

/* ---------- слежение за курсором (3D-наклон к мыши) ---------- */
var scene, portrait, img;
var tx = 0, ty = 0, cx = 0, cy = 0;   // цель / текущее, доля -1..1
var raf = 0;

function grab(stage) {
  scene = stage.querySelector(".ts-scene");
  portrait = stage.querySelector(".ts-portrait");
  img = stage.querySelector(".ts-portrait img");
}

function onMove(e) {
  if (!scene) return;
  var r = scene.getBoundingClientRect();
  var ex = r.left + r.width * 0.5;
  var ey = r.top + r.height * 0.42;
  var dx = e.clientX - ex, dy = e.clientY - ey;
  var d = Math.hypot(dx, dy) || 1;
  var reach = Math.max(340, window.innerWidth * 0.55);
  var f = Math.min(1, d / reach);
  tx = (dx / d) * f;
  ty = (dy / d) * f;
  if (!raf) raf = requestAnimationFrame(tick);
}

function tick() {
  cx += (tx - cx) * 0.14;
  cy += (ty - cy) * 0.14;
  // портрет ПОВОРАЧИВАЕТСЯ к курсору
  var ry = (cx * 15).toFixed(2);       // вокруг вертикали
  var rx = (-cy * 11).toFixed(2);      // вокруг горизонтали
  if (portrait) portrait.style.transform =
    "rotateY(" + ry + "deg) rotateX(" + rx + "deg)";
  // лёгкий внутренний параллакс изображения — усиливает глубину и «взгляд»
  if (img) img.style.transform =
    "translate(" + (cx * 3.4).toFixed(2) + "%," + (cy * 3.4).toFixed(2) + "%) scale(1.06)";
  if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) {
    raf = requestAnimationFrame(tick);
  } else { raf = 0; }
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
    '<p class="ts-sub">Веди мышкой по экрану — учитель поворачивается к тебе. ' +
    'Меню слева, твои курсы — справа.</p>' +
    '<div class="ts-scene"><div class="ts-float">' +
      '<div class="ts-portrait">' +
        '<img src="img/teacher-mascot.jpg" alt="Учитель английского" draggable="false">' +
      '</div>' +
      '<div class="ts-shadow"></div>' +
    '</div></div>';
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
