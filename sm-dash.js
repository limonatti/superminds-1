/* sm-dash.js — секция «Активность по упражнениям» в кабинете ученика.
   Дорисовывается после renderDash, читает SM.myAttempts(). Не трогает
   существующий дашборд. */
(function () {
  if (!window.SM || !SM.isCloud) return;

  function dayKey(d) { return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  var WD = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

  async function inject() {
    var panel = document.querySelector("#root .panel");
    if (!panel || panel.querySelector("#smActivity")) return;
    var cta = panel.querySelector(".cta");

    var attempts = [];
    try { attempts = await SM.myAttempts(); } catch (e) { return; }

    // за последние 7 дней
    var now = new Date();
    var days = [];
    for (var i = 6; i >= 0; i--) {
      var d = new Date(now); d.setDate(now.getDate() - i);
      days.push({ key: dayKey(d), wd: WD[d.getDay()], n: 0 });
    }
    var byKey = {}; days.forEach(function (x) { byKey[x.key] = x; });

    var week = 0, weekOk = 0;
    attempts.forEach(function (a) {
      var d = new Date(a.created_at);
      var k = dayKey(d);
      if (byKey[k]) { byKey[k].n++; week++; if (a.correct) weekOk++; }
    });
    var total = attempts.length;
    var totalOk = attempts.filter(function (a) { return a.correct; }).length;
    var pct = total ? Math.round(totalOk / total * 100) : 0;
    var activeDays = days.filter(function (x) { return x.n > 0; }).length;

    var maxN = Math.max(1, Math.max.apply(null, days.map(function (x) { return x.n; })));
    var bars = days.map(function (x) {
      var h = Math.round(x.n / maxN * 60);
      var on = x.n > 0;
      return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">' +
        '<div style="font:800 10px \'Nunito\',sans-serif;color:#8a7a68;min-height:12px">' + (x.n || "") + '</div>' +
        '<div style="width:70%;height:' + (h || 3) + 'px;border-radius:6px 6px 0 0;background:' + (on ? "#7cb342" : "#e9dcc6") + '"></div>' +
        '<div style="font:800 10px \'Nunito\',sans-serif;color:#5a4f47">' + x.wd + '</div></div>';
    }).join("");

    var html =
      '<div id="smActivity">' +
      '<div class="sec-title">🧩 АКТИВНОСТЬ ПО УПРАЖНЕНИЯМ</div>' +
      '<div class="cards2">' +
      '<div class="bigcard" style="background:#e4ebf2"><div class="n" style="color:#2980b9">' + week + '</div><div class="l">заданий за 7 дней</div></div>' +
      '<div class="bigcard" style="background:#f6e2cf"><div class="n" style="color:#b5654a">' + pct + '%</div><div class="l">верных ответов</div></div>' +
      '</div>' +
      '<div style="background:#fdfbf7;border:2px solid #e3d3ba;border-radius:16px;padding:14px 12px 10px;margin-bottom:16px">' +
      '<div style="display:flex;align-items:flex-end;gap:6px;height:84px">' + bars + '</div>' +
      '</div>' +
      (total ?
        '<div style="font:700 12px \'Nunito\',sans-serif;color:#8a7a68;text-align:center;margin:-6px 2px 16px">Всего выполнено заданий: <b>' + total + '</b> · активных дней за неделю: <b>' + activeDays + '</b></div>'
        : '<div style="font:700 12px \'Nunito\',sans-serif;color:#a99a86;text-align:center;margin:-6px 2px 16px">Пока нет решённых упражнений — открой урок и порешай 💪</div>') +
      '</div>';

    var frag = document.createElement("div");
    frag.innerHTML = html;
    var node = frag.firstChild;
    if (cta) panel.insertBefore(node, cta); else panel.appendChild(node);
  }

  // обернём renderDash, чтобы дорисовывать секцию после каждого рендера
  function hook() {
    if (typeof window.renderDash !== "function") return false;
    var orig = window.renderDash;
    window.renderDash = async function (user) {
      var r = await orig.apply(this, arguments);
      try { await inject(); } catch (e) {}
      return r;
    };
    return true;
  }
  var tries = 0;
  var iv = setInterval(function () {
    if (hook() || ++tries > 80) {
      clearInterval(iv);
      // если дашборд уже отрисован к моменту загрузки — дорисуем сразу
      if (document.querySelector("#root .panel")) inject();
    }
  }, 150);
})();
