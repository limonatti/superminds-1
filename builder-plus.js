/* builder-plus.js — приём «эстафеты» из конструктора учебников.
   Если из юнита нажали «🧩 Добавить упражнения», нужный юнит выбирается сам. */
(function () {
  var KEY = "sm-builder-unit", slug = null;
  try { slug = localStorage.getItem(KEY); } catch (e) {}
  if (!slug) return;
  try { localStorage.removeItem(KEY); } catch (e) {}

  var tries = 0;
  var timer = setInterval(function () {
    var sel = document.getElementById("unit");
    var ok = sel && Array.prototype.some.call(sel.options, function (o) { return o.value === slug; });
    if (ok) {
      clearInterval(timer);
      sel.value = slug;
      sel.dispatchEvent(new Event("change", { bubbles: true }));
      var name = sel.options[sel.selectedIndex].text;

      var b = document.createElement("div");
      b.style.cssText = "background:#fff;border:3px solid #2980b9;border-radius:18px;padding:13px 16px;margin:0 0 14px;font:800 14px 'Nunito',sans-serif;color:#1c1310;line-height:1.6";
      b.innerHTML = "Юнит <b>" + name.replace(/[<>]/g, "") + "</b> выбран автоматически. " +
        "Выбери тип упражнения ниже, заполни и нажми «Сохранить» — задание встанет в этот урок. " +
        "Так можно добавить сколько угодно упражнений подряд." +
        '<div style="margin-top:9px"><a href="admin.html" style="color:#7c2340;font-weight:900">← вернуться к юнитам</a></div>';

      var host = sel.closest(".panel") || sel.parentNode;
      host.parentNode.insertBefore(b, host);
      sel.style.outline = "3px solid #2980b9";
      setTimeout(function () { sel.style.outline = ""; }, 2500);
      try { b.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
    }
    if (++tries > 60) clearInterval(timer);
  }, 200);
})();
