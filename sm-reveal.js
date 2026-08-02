/* ===========================================================================
   sm-reveal.js — плавное появление блоков при прокрутке + ленивая подгрузка.
   Дополняет общий движок SMP (sm-play.js), не дублирует его.
   Использует нативный IntersectionObserver (в проекте раньше не применялся).

   Подключение:
     <script src="sm-reveal.js"></script>

   Как пользоваться:
     1) Пометь блоки классом sm-reveal — они мягко проявятся при прокрутке:
          <div class="sm-reveal">…</div>
        Модуль сам добавит нужный CSS и включит наблюдение.
     2) Ленивые картинки: вместо src используй data-src
          <img data-src="img/covers/solutions-el-u3.jpg" class="sm-lazy" alt="…">
     3) Программно: SM_reveal.observe(el) / SM_reveal.scan(root)

   Уважает prefers-reduced-motion: при включённой экономии движения блоки
   просто показываются без анимации.
   =========================================================================== */
(function () {
  if (window.SM_reveal) return;

  var reduce = false;
  try { reduce = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

  // один раз добавляем стили
  function injectCSS() {
    if (document.getElementById("sm-reveal-css")) return;
    var s = document.createElement("style");
    s.id = "sm-reveal-css";
    s.textContent =
      ".sm-reveal{opacity:0;transform:translateY(16px);" +
      "transition:opacity .5s ease,transform .5s ease;will-change:opacity,transform}" +
      ".sm-reveal.sm-in{opacity:1;transform:none}" +
      "@media (prefers-reduced-motion: reduce){.sm-reveal{opacity:1;transform:none;transition:none}}";
    (document.head || document.documentElement).appendChild(s);
  }

  var io = null;
  if ("IntersectionObserver" in window && !reduce) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        if (el.classList.contains("sm-reveal")) el.classList.add("sm-in");
        if (el.dataset && el.dataset.src) {         // ленивая картинка
          el.src = el.dataset.src; el.removeAttribute("data-src");
        }
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
  }

  function observe(el) {
    if (!el) return;
    if (io) { io.observe(el); }
    else {                                           // фолбэк: показать сразу
      el.classList && el.classList.add("sm-in");
      if (el.dataset && el.dataset.src) { el.src = el.dataset.src; el.removeAttribute("data-src"); }
    }
  }

  function scan(root) {
    root = root || document;
    var nodes = root.querySelectorAll(".sm-reveal, img[data-src], .sm-lazy[data-src]");
    [].forEach.call(nodes, observe);
    return nodes.length;
  }

  function init() { injectCSS(); scan(document); }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();

  window.SM_reveal = { observe: observe, scan: scan };
})();
