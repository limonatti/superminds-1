#!/usr/bin/env python3
"""Проверка платформы перед публикацией.

Запуск:  python3 check.py

Ловит ровно то, из-за чего разделы «пропадали»:
  • ошибка в JavaScript на странице — она обрывает отрисовку, и всё,
    что рисуется ниже по коду, просто не появляется;
  • пропавший блок — раздел, который должен быть на странице, исчез
    после правки соседнего;
  • забытый файл — страница ссылается на скрипт, которого нет;
  • сломанная ссылка на другую страницу платформы.

Ничего не публикует и не меняет. Только смотрит.
"""

import re, os, sys, json, subprocess, glob

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)

GREEN, RED, YELLOW, DIM, OFF = "\033[32m", "\033[31m", "\033[33m", "\033[2m", "\033[0m"
ok_n = fail_n = warn_n = 0

def ok(msg):
    global ok_n; ok_n += 1
    print(f"  {GREEN}✓{OFF} {msg}")

def fail(msg):
    global fail_n; fail_n += 1
    print(f"  {RED}✗ {msg}{OFF}")

def warn(msg):
    global warn_n; warn_n += 1
    print(f"  {YELLOW}! {msg}{OFF}")

def head(t):
    print(f"\n{t}")

# --- какие блоки обязаны быть на каждой странице ------------------------
# Если правка в одном разделе снесёт другой — проверка это поймает.
MUST_HAVE = {
    "teacher-class.html": [
        "Учебник ученика", "Выдать домашнее задание", "Новые регистрации",
        "Материалы", "Результаты упражнений", "Сообщения ученику",
        "Заметки по ученику", "Пригласить ученика",
    ],
    "teacher-homework.html": ["Очередь проверки", "Все выданные задания", "Вердикт"],
    "vocabulary.html": ["Все слова курса", "Слова / Words"],
    "homework.html":   ["Материалы от учителя", "Что открыть"],
    "trainer.html":    ["ВЫБЕРИ ЮНИТЫ", "РЕЖИМ"],
    "exercises.html":  ["в домашку", "В домашнюю работу"],
    "shadowing.html":  ["Слушать образец", "Записать себя"],
    "board.html":      ["Ручка", "Стикер", "Таймер"],
    "index.html":      ["Мои курсы"],
    "students.html":   ["Мои ученики", "Новые регистрации", "Учебник", "Домашка"],
}

# страницы, которые обязаны существовать
PAGES = sorted(set(list(MUST_HAVE) + [
    "chat.html", "games.html", "review.html", "builder.html", "students.html",
    "teacher-schedule.html", "schedule.html", "rewards.html",
]))


def scripts_of(html):
    return re.findall(r'<script[^>]*\bsrc="([^"]+)"', html)


def inline_js(html):
    return "\n".join(re.findall(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', html, re.S))


head("Файлы страниц")
missing_pages = [p for p in PAGES if not os.path.exists(p)]
for p in missing_pages:
    fail(f"{p} — файла нет")
if not missing_pages:
    ok(f"все {len(PAGES)} страниц на месте")


head("Синтаксис JavaScript")
for path in sorted(glob.glob("*.js")):
    r = subprocess.run(["node", "--check", path], capture_output=True, text=True)
    if r.returncode:
        fail(f"{path}: {r.stderr.strip().splitlines()[0] if r.stderr else 'ошибка'}")
    else:
        ok(path)

for page in PAGES:
    if not os.path.exists(page):
        continue
    js = inline_js(open(page, encoding="utf-8").read())
    if not js.strip():
        continue
    tmp = "/tmp/_chk.js"
    open(tmp, "w", encoding="utf-8").write(js)
    r = subprocess.run(["node", "--check", tmp], capture_output=True, text=True)
    if r.returncode:
        line = r.stderr.strip().splitlines()
        fail(f"{page}: {line[3] if len(line) > 3 else r.stderr.strip()[:120]}")
    else:
        ok(page)


head("Подключённые файлы существуют")
for page in PAGES:
    if not os.path.exists(page):
        continue
    html = open(page, encoding="utf-8").read()
    for src in scripts_of(html):
        if src.startswith(("http://", "https://", "//")):
            continue
        if not os.path.exists(src.split("?")[0]):
            fail(f"{page} → {src} (файла нет)")
    for css in re.findall(r'<link[^>]*href="([^"]+\.css)"', html):
        if not css.startswith(("http", "//")) and not os.path.exists(css.split("?")[0]):
            fail(f"{page} → {css} (файла нет)")
ok("проверены все script и css")


head("Обязательные блоки на страницах")
for page, blocks in MUST_HAVE.items():
    if not os.path.exists(page):
        continue
    html = open(page, encoding="utf-8").read()
    lost = [b for b in blocks if b not in html]
    if lost:
        fail(f"{page}: пропало — {', '.join(lost)}")
    else:
        ok(f"{page}: все {len(blocks)} блоков")


head("Ссылки между страницами")
bad_links = set()
for page in PAGES:
    if not os.path.exists(page):
        continue
    html = open(page, encoding="utf-8").read()
    for href in re.findall(r'href="([^"#?:]+\.html)', html):
        if not os.path.exists(href):
            bad_links.add(f"{page} → {href}")
if bad_links:
    for b in sorted(bad_links):
        fail(b)
else:
    ok("все внутренние ссылки ведут на существующие страницы")


head("Вызовы SM.* определены в sm-auth.js")
auth = open("sm-auth.js", encoding="utf-8").read()
defined = set(re.findall(r'async\s+(\w+)\s*\(', auth)) | set(re.findall(r'SM\.(\w+)\s*=', auth))
used = set()
for page in PAGES + ["sm-shell.js", "sm-progress.js", "sm-voice-lab.js"]:
    if not os.path.exists(page):
        continue
    src = open(page, encoding="utf-8").read()
    used |= set(re.findall(r'\bSM\.(\w+)\s*\(', src))
unknown = sorted(used - defined - {"isCloud", "getUser"})
if unknown:
    for u in unknown:
        warn(f"SM.{u}() вызывается, но не найден в sm-auth.js")
else:
    ok(f"все {len(used)} вызовов SM.* определены")


print()
if fail_n:
    print(f"{RED}Провалено проверок: {fail_n}{OFF}   пройдено: {ok_n}"
          + (f"   предупреждений: {warn_n}" if warn_n else ""))
    print(f"{DIM}Публиковать не стоит, пока это не исправлено.{OFF}")
    sys.exit(1)

print(f"{GREEN}Всё в порядке{OFF}: пройдено {ok_n} проверок"
      + (f", предупреждений {warn_n}" if warn_n else ""))
sys.exit(0)
