/* Проверка комнаты урока без живого Jitsi: страница поднимается в настоящем
   DOM, а видеосервис и Supabase подменены заглушками. Проверяем обе роли —
   учителя и ученика.  Запуск:  node test-room.js   (из папки проекта)     */
const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("/tmp/node_modules/jsdom");

const html = fs.readFileSync(path.join(__dirname, "room.html"), "utf8");
let fails = 0, checks = 0;
function ok(name, cond, extra) {
  checks++;
  if (cond) console.log("  ✓ " + name);
  else { fails++; console.log("  ✗ " + name + (extra ? "  → " + extra : "")); }
}

function boot(role) {
  const url = "https://english-with-asya.com/room.html?room=TEST1" + (role === "s" ? "&s=1" : "");
  const vc = new VirtualConsole();          /* молчим про внешние скрипты */
  const dom = new JSDOM(html, {
    url, runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) {
      const listeners = {};
      /* заглушка видеосервиса: помним слушателей, чтобы дёргать события */
      w.JitsiMeetExternalAPI = function () {
        this.addListener = (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); };
        this.executeCommand = () => {};
        this.dispose = () => {};
        w.__fire = (ev, data) => (listeners[ev] || []).forEach(fn => fn(data));
      };
      /* заглушка Supabase: канал, который никуда не ходит */
      w.supabase = { createClient: () => ({
        channel: () => ({ on(){return this;}, subscribe(){return this;}, send(){} })
      })};
      w.alert = () => {}; w.open = () => {};
    }
  });
  return dom;
}

function run(role, title) {
  console.log("\n" + title);
  const dom = boot(role);
  const w = dom.window, d = w.document;
  const $ = id => d.getElementById(id);

  ok("страница собралась, шапка на месте", !!$("top"));
  ok("нижняя панель есть в разметке", !!$("zbar"));
  ok("панель скрыта, пока звонок не включён", !$("zbar").classList.contains("on"));
  ok("кнопки шапки без дублей: нет «Управление ПК»", !$("crdBtn"));
  ok("нет кнопки «Во вкладку»", !$("vTab"));
  if (role === "s") ok("у ученика нет кнопки «Позвать ученика»", $("invite").style.display === "none");
  else ok("у учителя кнопка «Позвать ученика» видна", $("invite").style.display !== "none");

  /* включаем звонок */
  $("vidBtn").click();
  ok("окно звонка открылось", $("videoWrap").classList.contains("on"));
  ok("нижняя панель показалась", $("zbar").classList.contains("on"));

  /* участники */
  w.__fire("videoConferenceJoined", {});
  ok("пока один — «ждём»", /ждём/.test($("zWho").textContent), $("zWho").textContent);
  w.__fire("participantJoined", { id: "x" });
  ok("второй вошёл — «на связи»", /на связи/.test($("zWho").textContent), $("zWho").textContent);
  ok("в шапке окна тоже видно второго", /в комнате/.test(d.querySelector("#vidHead .ttl").textContent));

  /* свой показ экрана */
  w.__fire("screenSharingStatusChanged", { on: true });
  ok("свой показ: окошки ушли в угол (pip)", $("videoWrap").classList.contains("pip"));
  ok("свой показ: не разворачиваем на весь экран", !$("videoWrap").classList.contains("stage"));
  ok("кнопка демонстрации подсветилась", $("zShare").classList.contains("act"));
  w.__fire("screenSharingStatusChanged", { on: false });
  ok("показ выключен — угол отпустило", !$("videoWrap").classList.contains("pip"));

  /* показ собеседника */
  w.__fire("contentSharingParticipantsChanged", { data: ["x"] });
  ok("чужой показ: экран во весь экран (stage)", $("videoWrap").classList.contains("stage"));
  w.__fire("contentSharingParticipantsChanged", { data: [] });
  ok("чужой показ кончился — вернулись", !$("videoWrap").classList.contains("stage"));

  /* кнопка «развернуть» */
  $("zBig").click();
  ok("кнопка ⛶ разворачивает", $("videoWrap").classList.contains("stage"));
  $("zBig").click();
  ok("повторное нажатие возвращает", !$("videoWrap").classList.contains("stage"));

  /* завершение звонка */
  $("zHang").click();
  ok("звонок завершён, панель убралась", !$("zbar").classList.contains("on") && !$("videoWrap").classList.contains("on"));

  dom.window.close();
}

run("t", "СТОРОНА УЧИТЕЛЯ");
run("s", "СТОРОНА УЧЕНИКА");

console.log("\n" + (fails ? "ПРОВАЛЕНО " + fails + " из " + checks : "Всё в порядке: " + checks + " проверок"));
process.exit(fails ? 1 : 0);
