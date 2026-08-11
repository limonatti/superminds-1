/* English with Asya — оболочка: тёмное меню, роль, карточка пользователя, вход.
   Подключается после sm-auth.js. Ничего не рисует, пока не вызовешь SMUI.mount(). */
(function () {
"use strict";

var I = {
  book:  '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  file:  '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 15l2 2 4-4"/>',
  cal:   '<rect x="3" y="4" width="18" height="18"/><path d="M8 2v4"/><path d="M16 2v4"/><path d="M3 10h18"/>',
  star:  '<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/>',
  voc:   '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  card:  '<rect x="2" y="5" width="20" height="14"/><path d="M2 10h20"/>',
  board: '<path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="M7 21l5-5 5 5"/>',
  out:   '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
  play:  '<path d="M5 3l14 9-14 9z"/>',
  lock:  '<rect x="3" y="11" width="18" height="11"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  chev:  '<path d="M9 18l6-6-6-6"/>',
  sound: '<path d="M11 5L6 9H2v6h4l5 4z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  chat:  '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
build: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'
};

function svg(name, size) {
  return '<svg width="' + (size || 17) + '" height="' + (size || 17) + '" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (I[name] || "") + '</svg>';
}

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}

var STUDENT = [
  { id: "courses",  t: "Мои курсы",  i: "book",  href: "index.html" },
  { id: "homework", t: "Домашка",    i: "file",  href: "homework.html" },
  { id: "chat",     t: "Сообщения",  i: "chat",  href: "chat.html" },
  { id: "schedule", t: "Расписание", i: "cal",   href: "schedule.html" },
  { id: "rewards",  t: "Награды",    i: "star",  href: "rewards.html" },
  { id: "vocab",    t: "Словарь",    i: "voc",   href: "vocabulary.html" },
  /* Комната урока — доска + видеозвонок + передача управления. Голая доска отдельным пунктом. */
  { id: "room",     t: "Урок",       i: "play",  href: "room.html" },
  { id: "board",    t: "Доска",      i: "board", href: "board.html" }
];
var TEACHER = [
  { id: "class",    t: "Мой класс",        i: "users", href: "teacher-class.html" },
{ id: "builder",  t: "Конструктор",      i: "build", href: "builder.html" },
  { id: "review",   t: "Проверка домашки", i: "file",  href: "teacher-homework.html" },
  { id: "chat",     t: "Сообщения",        i: "chat",  href: "chat.html" },
  { id: "tsched",   t: "Расписание",       i: "cal",   href: "teacher-schedule.html" },
  { id: "payments", t: "Оплаты",           i: "card",  href: "teacher-payments.html" },
  { id: "room",     t: "Комната урока",    i: "play",  href: "room.html" },
  { id: "board",    t: "Доска",            i: "board", href: "board.html" }
];

/* 1 юнит · 2 юнита · 5 юнитов */
function plural(n, forms) {
  n = Math.abs(Math.round(n));
  var t = n % 100, o = n % 10;
  if (t > 10 && t < 20) return forms[2];
  if (o === 1) return forms[0];
  if (o >= 2 && o <= 4) return forms[1];
  return forms[2];
}

var SMUI = {
  icon: svg,
  esc: esc,
  plural: plural,
  n: function (num, forms) { return num + " " + plural(num, forms); },
  UNITS: ["юнит", "юнита", "юнитов"],
  WORDS: ["слово", "слова", "слов"],
  DAYS:  ["день", "дня", "дней"],
  STARS: ["звезда", "звезды", "звёзд"],
  TASKS: ["задание", "задания", "заданий"],
  _user: undefined,

  /* Пользователь с кэшем — чтобы каждый экран не дёргал сеть по три раза */
  async user(force) {
    if (this._user !== undefined && !force) return this._user;
    try { this._user = (window.SM && (await SM.getUser())) || null; }
    catch (e) { this._user = null; }
    return this._user;
  },

  /* Рисует тёмное меню в элементе с id="side" */
  async mount(opts) {
    opts = opts || {};
    var role = opts.role === "teacher" ? "teacher" : "student";
    var items = role === "teacher" ? TEACHER : STUDENT;
    var box = document.getElementById("side");
    if (!box) return;

    var nav = items.map(function (it) {
      var on = it.id === opts.active ? " on" : "";
      var badge = (opts.counts && opts.counts[it.id])
        ? '<span class="badge">' + esc(opts.counts[it.id]) + "</span>" : "";
      return '<a class="navItem' + on + '" href="' + it.href + '">' +
        svg(it.i) + '<span class="t">' + it.t + "</span>" + badge + "</a>";
    }).join("");

    box.innerHTML =
      '<div class="side-top">' +
        '<span class="flag"><i></i><b></b><s></s></span>' +
        '<span class="side-name"><span>With Asya</span><span>British English</span></span>' +
      "</div>" +
      '<div class="roles">' +
        '<button type="button" class="' + (role === "student" ? "on" : "") + '" onclick="location.href=\'index.html\'">Ученик</button>' +
        '<button type="button" class="' + (role === "teacher" ? "on" : "") + '" onclick="location.href=\'teacher-class.html\'">Учитель</button>' +
      "</div>" +
      '<nav class="navlist">' + nav + "</nav>" +
      '<div class="side-user" id="sideUser"></div>';

    this.paintUser(role);
    this.refreshUnread(role);
  },

  /* Живой бейдж непрочитанных сообщений на пункте «Сообщения» (на любой странице) */
  async refreshUnread(role) {
    var self = this;
    window.SM_shellRefreshUnread = function () { self.refreshUnread(role); };
    if (!window.SM) return;
    var n = 0;
    try {
      if (role === "teacher") {
        var map = await SM.teacherUnread();
        Object.keys(map || {}).forEach(function (k) { n += (+map[k] || 0); });
      } else {
        n = (await SM.myUnread()) || 0;
      }
    } catch (e) { n = 0; }
    var link = document.querySelector('.navlist a[href="chat.html"]');
    if (!link) return;
    var old = link.querySelector(".badge");
    if (old) old.parentNode.removeChild(old);
    if (n > 0) {
      var b = document.createElement("span");
      b.className = "badge";
      b.textContent = n > 99 ? "99+" : n;
      link.appendChild(b);
    }
  },

  async paintUser(role) {
    var el = document.getElementById("sideUser");
    if (!el) return;
    var u = await this.user();
    if (!u) {
      el.innerHTML = '<span class="av">?</span><div class="who"><b>Не вошёл</b><span>прогресс не сохранится</span></div>';
      return;
    }
    var sub = role === "teacher" ? "учитель" : "ученик";
    try {
      var p = (window.SM && await SM.loadProgress()) || {};
      var m = p.__meta || {};
      if (role !== "teacher" && (m.dayStreak || m.totalPoints))
        sub = "стрик " + (m.dayStreak || 0) + " · звёзд " + (m.totalPoints || 0);
    } catch (e) {}
    el.innerHTML =
      '<span class="av">' + esc((u.name || "?").charAt(0).toUpperCase()) + "</span>" +
      '<div class="who"><b>' + esc(u.name) + "</b><span>" + esc(sub) + "</span></div>" +
      '<button class="out" id="smOut" title="Выйти">' + svg("out", 15) + "</button>";
    var b = document.getElementById("smOut");
    if (b) b.onclick = async function () { await SM.signOut(); location.reload(); };
  },

  /* Форма входа прямо в содержимом. Возвращает пользователя или null. */
  async requireAuth(pane, role) {
    var u = await this.user();
    if (u) return u;
    var tab = "in";
    var self = this;
    function draw() {
      pane.innerHTML =
        '<div class="pane-hd"><span>Шаг 1 · Вход / Sign in</span></div>' +
        '<div class="auth">' +
          "<h2>" + (role === "teacher" ? "Кабинет учителя" : "Твой кабинет") + "</h2>" +
          '<div class="p">Войди, чтобы прогресс сохранялся на всех устройствах.</div>' +
          '<div class="tabs">' +
            '<button type="button" class="' + (tab === "in" ? "on" : "") + '" data-t="in">Вход</button>' +
            '<button type="button" class="' + (tab === "up" ? "on" : "") + '" data-t="up">Регистрация</button>' +
          "</div>" +
          (tab === "up" ? "<label>Имя</label><input id=\"aName\" placeholder=\"Например, Ася\">" : "") +
          "<label>Email</label><input id=\"aMail\" type=\"email\" placeholder=\"mail@example.com\">" +
          "<label>Пароль</label><input id=\"aPass\" type=\"password\" placeholder=\"минимум 6 символов\">" +
          '<button class="go" id="aGo">' + (tab === "in" ? "Войти" : "Создать аккаунт") + "</button>" +
          '<div class="msg" id="aMsg"></div>' +
        "</div>";
      pane.querySelectorAll(".tabs button").forEach(function (b) {
        b.onclick = function () { tab = b.dataset.t; draw(); };
      });
      document.getElementById("aGo").onclick = async function () {
        var msg = document.getElementById("aMsg");
        msg.className = "msg"; msg.textContent = "…";
        var nm = (document.getElementById("aName") || {}).value || "";
        var em = (document.getElementById("aMail") || {}).value || "";
        var pw = (document.getElementById("aPass") || {}).value || "";
        var r = tab === "up" ? await SM.signUp(nm, em, pw) : await SM.signIn(em, pw);
        if (!r.ok) { msg.className = "msg err"; msg.textContent = r.error || "Ошибка"; return; }
        if (r.needConfirm) { msg.textContent = "Аккаунт создан. Подтверди почту и войди."; return; }
        self._user = undefined;
        location.reload();
      };
    }
    draw();
    return null;
  },

  /* Пустое состояние: честно говорим, что раздела ещё нет */
  empty(title, text, extra) {
    return '<div class="empty"><div class="h">' + esc(title) + "</div>" +
      '<div class="p">' + text + "</div>" + (extra || "") + "</div>";
  }
};

window.SMUI = SMUI;
})();
