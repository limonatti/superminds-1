/* sm-progress.js — тихая запись результатов упражнений.
   Не трогает 24 функции рендера: слушает появление подсветки ответа
   (.fb.ok/.no, .opt.correct/.wrong, .tf button.correct/.wrong) внутри
   упражнения и по завершении пишет одну попытку в базу.
   Работает только для залогиненного ученика (не учителя). */
(function () {
  if (!window.SM || !SM.isCloud) return;

  var q = new URLSearchParams(location.search);
  var UNIT = q.get("u") || "";
  var reported = {};   // exId -> true (одна запись за загрузку страницы)
  var state = {};      // exId -> {wrong:bool, right:bool, timer}
  var isTeacher = false;

  SM.myProfile().then(function (p) {
    isTeacher = !!(p && p.role === "teacher");
    if (!isTeacher) start();
  }).catch(function () { start(); });

  function start() {
    var root = document.getElementById("root");
    if (!root) return;
    var obs = new MutationObserver(function (muts) {
      muts.forEach(function (mu) {
        var t = mu.target;
        if (!(t instanceof Element)) return;
        var cls = t.className || "";
        var isFbOk = t.classList && t.classList.contains("fb") && t.classList.contains("ok");
        var isFbNo = t.classList && t.classList.contains("fb") && t.classList.contains("no");
        var isRight = (t.classList && t.classList.contains("correct"));
        var isWrong = (t.classList && t.classList.contains("wrong"));
        if (!(isFbOk || isFbNo || isRight || isWrong)) return;
        var wrap = t.closest("[data-exid]");
        if (!wrap) return;
        var exId = wrap.getAttribute("data-exid");
        if (!exId || reported[exId]) return;
        var st = state[exId] || (state[exId] = { wrong: false, right: false, type: wrap.getAttribute("data-extype"), timer: null });
        if (isFbNo || isWrong) st.wrong = true;
        if (isFbOk || isRight) st.right = true;
        // подождём 2с тишины и запишем итог по этому упражнению
        clearTimeout(st.timer);
        st.timer = setTimeout(function () { flush(exId); }, 2000);
      });
    });
    obs.observe(root, { subtree: true, attributes: true, attributeFilter: ["class"] });
  }

  function flush(exId) {
    if (reported[exId]) return;
    var st = state[exId];
    if (!st || (!st.right && !st.wrong)) return;
    reported[exId] = true;
    var correct = st.right && !st.wrong;   // без единой ошибки — зачёт
    try {
      SM.saveAttempt({
        course: (window.SM_COURSE && SM_COURSE.id) || null,
        unit_id: UNIT,
        exercise_id: exId,
        ex_type: st.type || null,
        correct: correct,
      });
    } catch (e) {}
  }
})();
