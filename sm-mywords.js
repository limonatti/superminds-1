/* sm-mywords.js — загрузка личного словаря и его подмешивание в курс.

   Слова ученика становятся юнитом «Мои слова» и дальше живут по общим правилам:
   видны в словаре, тренируются в тренажёре, считаются в прогрессе.
   Подключать после sm-auth.js и words.js. */
(function () {
  if (!window.SM || !window.SM_useCourse) return;

  /* Перечитать словарь из базы и пересобрать текущий курс */
  window.SM_reloadMyWords = async function (studentId) {
    try {
      window.SM_MY_WORDS = (await window.SM.myWords(studentId)) || [];
    } catch (e) {
      window.SM_MY_WORDS = [];
    }
    var cid = (window.SM_COURSE && window.SM_COURSE.id) || null;
    if (cid) window.SM_useCourse(cid);
    try {
      window.dispatchEvent(new CustomEvent("sm-mywords", { detail: { n: window.SM_MY_WORDS.length } }));
    } catch (e) {}
    return window.SM_MY_WORDS;
  };

  /* Добавить слово и сразу подхватить его в интерфейс */
  window.SM_addMyWord = async function (w, studentId) {
    var r = await window.SM.addWord(w, studentId);
    if (r.ok) await window.SM_reloadMyWords(studentId);
    return r;
  };

  window.SM_removeMyWord = async function (id, studentId) {
    var r = await window.SM.removeWord(id);
    if (r.ok) await window.SM_reloadMyWords(studentId);
    return r;
  };

  window.SM_updateMyWord = async function (id, patch, studentId) {
    var r = await window.SM.updateWord(id, patch);
    if (r.ok) await window.SM_reloadMyWords(studentId);
    return r;
  };

  /* Грузим сразу после того, как определился курс */
  window.SM_ready = Promise.resolve(window.SM_ready).then(async function () {
    try {
      var u = await window.SM.getUser();
      if (u) await window.SM_reloadMyWords();
    } catch (e) {}
  });
})();
