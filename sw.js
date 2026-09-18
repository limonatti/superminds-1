/* sw.js — service worker приложения English with Asya.
 *
 * Правила простые, чтобы ученик никогда не видел вчерашнюю версию:
 *  • страницы (.html) — всегда сначала из сети; из кэша только без интернета;
 *  • свои js/css с меткой ?v=хэш — из кэша (хэш меняется вместе с файлом);
 *  • картинки и шрифты сайта — из кэша, с тихим обновлением в фоне;
 *  • Supabase, видео, аудио, чужие домены — не трогаем вообще.
 * Чтобы сбросить кэш у всех — поменять VERSION.
 */
const VERSION = "asya-v1";
const CORE = ["/", "/offline.html", "/manifest.webmanifest",
  "/img/app/icon-192.png", "/img/app/icon-512.png", "/favicon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const SKIP_EXT = /\.(mp4|webm|mov|mp3|m4a|wav|ogg|json)$/i;

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;       // Supabase, CDN, шрифты Google
  if (req.headers.has("range") || SKIP_EXT.test(url.pathname)) return;

  // Страницы: сеть → кэш → офлайн-заглушка
  if (req.mode === "navigate" || req.destination === "document") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
          return res;
        })
        .catch(() => caches.match(req, { ignoreSearch: true })
          .then((hit) => hit || caches.match("/offline.html")))
    );
    return;
  }

  // Свои js/css с меткой версии: кэш → сеть
  if (/\.(js|css)$/i.test(url.pathname) && url.searchParams.has("v")) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
        return res;
      }))
    );
    return;
  }

  // Картинки и прочая статика: из кэша сразу, обновление в фоне
  if (/\.(png|jpe?g|webp|gif|svg|ico|woff2?)$/i.test(url.pathname)) {
    e.respondWith(
      caches.open(VERSION).then((c) => c.match(req).then((hit) => {
        const net = fetch(req).then((res) => { if (res.ok) c.put(req, res.clone()); return res; })
          .catch(() => hit);
        return hit || net;
      }))
    );
  }
  // остальное — обычным путём, без вмешательства
});

self.addEventListener("message", (e) => {
  if (e.data === "skipWaiting") self.skipWaiting();
});
