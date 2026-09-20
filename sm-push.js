/* sm-push.js — push-уведомления в приложении (App Store / Google Play).
 *
 * Шлём три вещи: новое сообщение от преподавателя, новую домашку и её
 * проверку, новый урок в расписании. Решает об этом база (триггеры
 * push_on_message / push_on_hw / push_on_lesson), здесь только приём.
 *
 * В браузере файл не делает ничего: Web Push на сайте не подключён,
 * модуль загружается из sm-pwa.js только внутри сборки Capacitor.
 *
 * Что нужно со стороны магазинов:
 *   Android — google-services.json из Firebase в app/android/app/
 *   iOS     — ключ APNs, загруженный в тот же проект Firebase,
 *             и GoogleService-Info.plist в app/ios/App/App/
 * Без них плагина в сборке нет и этот код просто молчит.
 */
(function () {
  "use strict";

  var C = window.Capacitor;
  var native = !!(C && C.isNativePlatform && C.isNativePlatform());
  if (!native) return;

  var P = C.Plugins || {};
  var PN = P.PushNotifications;
  if (!PN) return;

  var platform = (C.getPlatform && C.getPlatform()) || "web";
  var ASKED = "sm-push-asked";

  function asked() {
    try { return localStorage.getItem(ASKED) === "1"; } catch (e) { return false; }
  }
  function markAsked() {
    try { localStorage.setItem(ASKED, "1"); } catch (e) {}
  }

  /* Токен устройства живёт в device_tokens и меняется сам по себе —
     сохраняем при каждом запуске, а не один раз при установке. */
  PN.addListener("registration", function (t) {
    if (!t || !t.value || !window.SM || !SM.savePushToken) return;
    SM.savePushToken(t.value, platform);
  });

  PN.addListener("registrationError", function (e) {
    console.warn("push: регистрация не удалась", e && e.error);
  });

  /* Тап по уведомлению открывает нужный раздел: чат, домашку, расписание. */
  PN.addListener("pushNotificationActionPerformed", function (a) {
    var data = (a && a.notification && a.notification.data) || {};
    var url = data.url;
    if (!url || !/^[a-z0-9-]+\.html$/i.test(url)) return;
    location.href = "/" + url;
  });

  /* Счётчик непрочитанных в меню обновляем сразу, если приложение открыто. */
  PN.addListener("pushNotificationReceived", function () {
    if (typeof window.SM_shellRefreshUnread === "function") window.SM_shellRefreshUnread();
  });

  async function start() {
    if (!window.SM || !SM.getUser) return;
    var user = null;
    try { user = await SM.getUser(); } catch (e) {}
    if (!user) return;                       // разрешение спрашиваем только у вошедших

    var perm = { receive: "prompt" };
    try { perm = await PN.checkPermissions(); } catch (e) {}

    if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") {
      if (asked()) return;                   // отказались один раз — больше не пристаём
      markAsked();
      try { perm = await PN.requestPermissions(); } catch (e) { return; }
    }
    if (perm.receive !== "granted") return;

    try { await PN.register(); } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(start, 1200); });
  } else {
    setTimeout(start, 1200);
  }
})();
