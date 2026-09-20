/* sm-pwa.js — сайт как приложение.
 *  1) регистрирует service worker (sw.js);
 *  2) показывает ненавязчивую кнопку «Установить приложение»:
 *     Android / Chrome / Edge — системное окно установки,
 *     iPhone / iPad (Safari) — подсказка «Поделиться → На экран „Домой“».
 *  Кнопки нет, если сайт уже открыт как приложение или внутри сборки из магазина.
 *  Крестик прячет кнопку на 30 дней.
 */
(function () {
  "use strict";
  var KEY = "sm-pwa-hide-until";
  var isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  var standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  if (standalone || isNative) document.documentElement.classList.add("sm-app");

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").catch(function () {});
    });
  }
  /* В приложении чужие ссылки (YouTube, Instagram) открываем системным
     браузером. Внутри окна приложения они выглядят как «мы всё ещё на сайте»
     и вернуться оттуда нечем — за это Apple и снимает с проверки. */
  /* Push-уведомления живут отдельным файлом и нужны только в сборке. */
  if (isNative) {
    var self = document.currentScript && document.currentScript.src || "";
    var v = (self.match(/[?&]v=([A-Za-z0-9]+)/) || [])[1];
    var ps = document.createElement("script");
    ps.src = "/sm-push.js" + (v ? "?v=" + v : "");
    ps.defer = true;
    document.head.appendChild(ps);
  }

  if (isNative) {
    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!a) return;
      var href = a.getAttribute("href") || "";
      if (!/^https?:/i.test(href)) return;
      var host;
      try { host = new URL(href, location.href).hostname; } catch (err) { return; }
      if (!host || host === location.hostname) return;
      e.preventDefault();
      var P = window.Capacitor && window.Capacitor.Plugins;
      if (P && P.Browser && P.Browser.open) P.Browser.open({ url: href });
      else window.open(href, "_system");
    }, true);
  }

  if (standalone || isNative) return;

  function hidden() {
    try { return Number(localStorage.getItem(KEY) || 0) > Date.now(); } catch (e) { return false; }
  }
  function hideFor(days) {
    try { localStorage.setItem(KEY, String(Date.now() + days * 864e5)); } catch (e) {}
  }

  var ua = navigator.userAgent;
  var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|YaBrowser/.test(ua);
  var deferred = null;

  function css() {
    if (document.getElementById("sm-pwa-css")) return;
    var s = document.createElement("style");
    s.id = "sm-pwa-css";
    s.textContent =
      ".sm-pwa{position:fixed;left:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:9999;" +
      "display:flex;align-items:center;gap:10px;max-width:calc(100vw - 32px);box-sizing:border-box;" +
      "background:#5d1930;color:#fdf7f5;border-radius:16px;padding:10px 10px 10px 12px;" +
      "box-shadow:0 8px 28px rgba(0,0,0,.25);font:600 14px/1.35 Archivo,system-ui,sans-serif}" +
      ".sm-pwa img{width:36px;height:36px;border-radius:9px;flex:none}" +
      ".sm-pwa .t{flex:1;min-width:0}.sm-pwa small{display:block;font-weight:400;opacity:.8;font-size:12px}" +
      ".sm-pwa button{font:inherit;border:0;cursor:pointer;border-radius:999px}" +
      ".sm-pwa .go{background:#ec3013;color:#fdf7f5;padding:8px 14px;white-space:nowrap}" +
      ".sm-pwa .x{background:transparent;color:#fdf7f5;opacity:.7;width:32px;height:32px;font-size:18px;line-height:1}" +
      "@media print{.sm-pwa{display:none}}";
    document.head.appendChild(s);
  }

  function show(text, sub, onGo) {
    if (hidden() || document.querySelector(".sm-pwa")) return;
    css();
    var el = document.createElement("div");
    el.className = "sm-pwa";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Установить приложение");
    el.innerHTML = '<img src="/img/app/icon-192.png" alt=""><div class="t">' + text +
      (sub ? "<small>" + sub + "</small>" : "") + "</div>" +
      (onGo ? '<button class="go" type="button">Установить</button>' : "") +
      '<button class="x" type="button" aria-label="Скрыть">×</button>';
    el.querySelector(".x").onclick = function () { hideFor(30); el.remove(); };
    if (onGo) el.querySelector(".go").onclick = function () { onGo(el); };
    document.body.appendChild(el);
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferred = e;
    show("Приложение English with Asya", "Уроки и домашка — с экрана телефона", function (el) {
      el.remove();
      deferred.prompt();
      deferred.userChoice.then(function (r) { if (r.outcome !== "accepted") hideFor(7); deferred = null; });
    });
  });
  window.addEventListener("appinstalled", function () {
    hideFor(3650);
    var el = document.querySelector(".sm-pwa"); if (el) el.remove();
  });

  if (isIOS && isSafari) {
    window.addEventListener("load", function () {
      setTimeout(function () {
        show("Установить как приложение", "Нажми «Поделиться» ⬆︎, затем «На экран „Домой“»", null);
      }, 2500);
    });
  }

  // для кнопки на странице: <button onclick="SM_installApp()">
  window.SM_installApp = function () {
    if (deferred) { deferred.prompt(); return true; }
    return false;
  };
})();
