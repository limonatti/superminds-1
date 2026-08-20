#!/usr/bin/env python3
"""
stamp.py — метки версий у своих js и css, чтобы браузер не показывал старое.

Зачем. GitHub Pages отдаёт файлы с кэшированием. После публикации браузер
ученика ещё какое-то время держит вчерашний sm-auth.js и words.js — сайт
выглядит обновлённым, а работает по-старому. Ловили это много раз: правка
уезжает на сервер, а на экране ничего не меняется до Cmd+Shift+R.

Как чинит. К каждой ссылке на свой файл дописывается ?v=<хэш содержимого>:

    <script src="sm-auth.js?v=3f9a1c22">

Хэш меняется только когда меняется сам файл — значит браузер перекачивает
ровно то, что поправили, а остальное берёт из кэша, как и должно.
Внешние ссылки (cdn, fonts) не трогаем.

Запуск: python3 stamp.py       — проставить метки
        python3 stamp.py --check — только сказать, что устарело (для check.py)
"""
import hashlib
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
# что штампуем: свои скрипты и стили
PATTERN = re.compile(r'''(?P<attr>\b(?:src|href)\s*=\s*)(?P<q>["']?)(?P<file>[A-Za-z0-9._/-]+\.(?:js|css))(?:\?v=[0-9a-f]{8})?(?P=q)''')


def digest(path):
    h = hashlib.md5()
    with open(path, "rb") as f:
        h.update(f.read())
    return h.hexdigest()[:8]


def stamp_file(page, cache, dry):
    src = open(page, encoding="utf-8").read()
    changed = []

    def repl(m):
        rel = m.group("file")
        if rel.startswith(("http", "//")):
            return m.group(0)
        target = os.path.join(HERE, rel)
        if not os.path.exists(target):
            return m.group(0)
        if rel not in cache:
            cache[rel] = digest(target)
        new = f'{m.group("attr")}{m.group("q")}{rel}?v={cache[rel]}{m.group("q")}'
        if new != m.group(0):
            changed.append(rel)
        return new

    out = PATTERN.sub(repl, src)
    if out != src and not dry:
        open(page, "w", encoding="utf-8").write(out)
    return changed


def main():
    dry = "--check" in sys.argv
    pages = sorted(f for f in os.listdir(HERE) if f.endswith(".html"))
    cache, stale, touched = {}, set(), 0
    for p in pages:
        ch = stamp_file(os.path.join(HERE, p), cache, dry)
        if ch:
            touched += 1
            stale |= set(ch)

    if dry:
        if stale:
            print(f"устарели метки версий у {len(stale)} файлов "
                  f"на {touched} страницах: {', '.join(sorted(stale)[:6])}"
                  + (" …" if len(stale) > 6 else ""))
            print("исправить: python3 stamp.py")
            return 1
        print("метки версий на месте")
        return 0

    if stale:
        print(f"обновил метки версий: {len(stale)} файлов на {touched} страницах")
        for f in sorted(stale):
            print(f"  {f} → ?v={cache[f]}")
    else:
        print("менять нечего, метки уже свежие")
    return 0


if __name__ == "__main__":
    sys.exit(main())
