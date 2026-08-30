/*
 * Прогон уроков как ученик, без браузера.
 *
 * Загружает готовую страницу в jsdom, исполняет её скрипты и проверяет,
 * что каждое упражнение действительно отрисовалось и реагирует на ответы:
 * правильный вариант засчитывается, неправильный — нет.
 *
 * Запуск: node walkthrough.js solutions-el
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('/tmp/node_modules/jsdom');

const course = process.argv[2] || 'solutions-el';
const files = fs.readdirSync('.')
  .filter(f => new RegExp('^' + course + '-u\\d[a-h]\\.html$').test(f))
  .sort();

let bad = 0, total = 0;

function stubSpeech(win) {
  const u = function (t) { this.text = t; };
  win.SpeechSynthesisUtterance = u;
  win.speechSynthesis = {
    speak() {}, cancel() {}, getVoices() { return []; }, onvoiceschanged: null,
  };
}

for (const f of files) {
  let html = fs.readFileSync(f, 'utf8');
  // внешние скрипты не грузим — их нет в офлайне
  html = html.replace(/<script src="https:\/\/cdn[^>]*><\/script>/g, '')
             .replace(/<script src="sm-auth[^>]*><\/script>/g, '');

  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true,
                                beforeParse: stubSpeech });
  const doc = dom.window.document;
  const errs = [];

  const panes = { урок: doc.querySelector('#pane-lesson'), тетрадь: doc.querySelector('#pane-wb') };
  const stats = {};

  for (const [name, pane] of Object.entries(panes)) {
    if (!pane) continue;
    const boxes = [...pane.querySelectorAll('[id^="b"]')]
      .filter(el => /^b\d+$/.test(el.id));
    let filled = 0, emptyIds = [];
    for (const el of boxes) {
      // контейнер считается наполненным, если внутри появились карточки,
      // слова, чипсы произношения, токены сортировки или строки диалога
      const n = el.querySelectorAll('.card,.word,.chip,.ptoken,.plline,.spkcard,.mitem').length;
      if (n > 0) filled++; else emptyIds.push(el.id);
    }
    stats[name] = boxes.length + '/' + filled;
    if (emptyIds.length) errs.push(name + ' — пустые контейнеры: ' + emptyIds.join(', '));
  }

  // счётчик заданий
  const tot = doc.getElementById('tot');
  const totalTasks = tot ? parseInt(tot.textContent || '0', 10) : 0;
  if (!totalTasks) errs.push('счётчик заданий равен нулю');

  // проходим как ученик: жмём правильный вариант в первых пяти вопросах
  const opts = [...doc.querySelectorAll('.opts')].slice(0, 5);
  let scored = 0;
  for (const box of opts) {
    const btns = [...box.querySelectorAll('.opt')];
    // правильный тот, после нажатия которого появляется класс ok
    for (const b of btns) {
      b.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      if (b.classList.contains('ok')) { scored++; break; }
    }
  }
  const sc = doc.getElementById('sc');
  const shown = sc ? parseInt(sc.textContent || '0', 10) : 0;
  if (opts.length && shown !== scored) {
    errs.push('счёт не сходится: засчитано ' + scored + ', на табло ' + shown);
  }

  // поля ввода: проверяем, что верный ответ принимается
  const gaps = [...doc.querySelectorAll('.gap-in')].slice(0, 3);
  let gapOk = 0;
  for (const inp of gaps) {
    const card = inp.closest('.card');
    const btn = card && card.querySelector('.chk');
    const hintEl = card && card.querySelector('.ans');
    if (!btn) continue;
    // подсказка выдаётся со второй неудачной попытки
    btn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    btn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    const raw = hintEl ? hintEl.textContent.trim() : '';
    const hint = raw.startsWith('Подсказка:') ? raw.replace('Подсказка:', '').trim() : '';
    if (hint) {
      inp.value = hint;
      btn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      if (inp.classList.contains('ok')) gapOk++;
      else errs.push('поле ввода не принимает собственную подсказку «' + hint + '»');
    }
  }

  // ошибки консоли
  const consoleErrs = [];
  dom.window.addEventListener('error', e => consoleErrs.push(e.message));

  total++;
  if (errs.length) {
    bad++;
    console.log('✗ ' + f);
    console.log('   ' + JSON.stringify(stats) + '  заданий: ' + totalTasks);
    errs.forEach(e => console.log('   → ' + e));
  } else {
    console.log('✓ ' + f + '  урок ' + (stats['урок'] || '—') +
                ', тетрадь ' + (stats['тетрадь'] || '—') +
                ', заданий ' + totalTasks +
                ', проверено ответов ' + scored + ', полей ' + gapOk);
  }
  dom.window.close();
}

console.log('\nСтраниц: ' + total + ', с проблемами: ' + bad);
process.exit(bad ? 1 : 0);
