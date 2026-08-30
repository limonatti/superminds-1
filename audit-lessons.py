#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Аудит собранных уроков: структура, данные, ссылки, вес.

Проверяет то, что глазами не видно, но ломает урок ученику:
контейнеры без данных, дубли id, битые пути к картинкам, кривые
индексы ответов, пустые варианты, вес страницы.

Запуск: python3 audit-lessons.py solutions-el
"""
import json, re, sys, glob, os
from collections import Counter

RED, GRN, YEL, DIM, OFF = "\033[31m", "\033[32m", "\033[33m", "\033[2m", "\033[0m"
problems, warnings, checks = [], [], 0


def fail(where, msg):
    problems.append("%s: %s" % (where, msg))


def warn(where, msg):
    warnings.append("%s: %s" % (where, msg))


def audit_json(path):
    """Проверка содержания до сборки."""
    global checks
    d = json.load(open(path, encoding="utf-8"))
    unit = d["unit"]
    for L, les in sorted(d["lessons"].items()):
        where = "u%s%s" % (unit, L)
        blocks = les.get("blocks", []) + les.get("workbook", [])
        if not les.get("workbook"):
            warn(where, "нет рабочей тетради")
        titles = [b.get("title", "") for b in blocks if b.get("title")]
        for t, n in Counter(titles).items():
            if n > 1:
                warn(where, "повторяется заголовок «%s» (%d раза)" % (t, n))
        for b in blocks:
            t = b.get("type")
            checks += 1
            if t == "mc":
                for i, it in enumerate(b.get("items", []), 1):
                    o, a = it.get("o", []), it.get("a")
                    if not isinstance(a, int) or not (0 <= a < len(o)):
                        fail(where, "%s п.%d — индекс ответа вне вариантов" % (b.get("title", t), i))
                    if len(o) != len(set(o)):
                        fail(where, "%s п.%d — повторяющиеся варианты" % (b.get("title", t), i))
                    if len(o) < 2:
                        fail(where, "%s п.%d — меньше двух вариантов" % (b.get("title", t), i))
                    if not it.get("q", "").strip():
                        fail(where, "%s п.%d — пустой вопрос" % (b.get("title", t), i))
            elif t in ("gap",):
                for i, it in enumerate(b.get("items", []), 1):
                    a = it.get("a", [])
                    if not a or not all(isinstance(x, str) and x.strip() for x in a):
                        fail(where, "%s п.%d — нет правильного ответа" % (b.get("title", t), i))
                    if "__" not in it.get("q", "") and "→" not in it.get("q", "") \
                       and "?" not in it.get("q", "") and "/" not in it.get("q", ""):
                        warn(where, "%s п.%d — в задании нет пропуска" % (b.get("title", t), i))
            elif t == "tf":
                for i, it in enumerate(b.get("items", []), 1):
                    if not isinstance(it.get("a"), bool):
                        fail(where, "%s п.%d — ответ не true/false" % (b.get("title", t), i))
            elif t == "cloze":
                gaps = [p for p in b.get("parts", []) if isinstance(p, dict)]
                if not gaps:
                    fail(where, "%s — текст без пропусков" % b.get("title", t))
                for i, g in enumerate(gaps, 1):
                    if not g.get("a"):
                        fail(where, "%s пропуск %d — нет ответа" % (b.get("title", t), i))
            elif t == "sort":
                pool = b.get("words", [])
                grouped = [w for g in b.get("groups", []) for w in g.get("words", [])]
                miss = set(pool) - set(grouped)
                extra = set(grouped) - set(pool)
                if miss:
                    fail(where, "%s — слова без группы: %s" % (b.get("title", t), ", ".join(sorted(miss))))
                if extra:
                    fail(where, "%s — в группах есть слова не из набора: %s"
                         % (b.get("title", t), ", ".join(sorted(extra))))
                dup = [w for w, n in Counter(grouped).items() if n > 1]
                if dup:
                    fail(where, "%s — слово в двух группах: %s" % (b.get("title", t), ", ".join(dup)))
            elif t == "listen":
                if not b.get("script"):
                    fail(where, "аудирование без реплик")
                for j, line in enumerate(b.get("script", []), 1):
                    if len(line) < 2 or not line[1].strip():
                        fail(where, "аудирование, реплика %d — пустая" % j)
                    if len(line) < 3:
                        warn(where, "аудирование, реплика %d — нет имени говорящего" % j)
                if not b.get("q"):
                    warn(where, "аудирование без вопросов")
            elif t in ("image",):
                src = b.get("src", "")
                if not os.path.exists(src):
                    fail(where, "картинка не найдена: %s" % src)
            elif t == "match":
                if len(b.get("pairs", [])) < 3:
                    warn(where, "мало пар для сопоставления")

        # тетрадь должна закреплять, а не переспрашивать то же самое
        def questions(bs):
            out = {}
            for bb in bs:
                tt = bb.get("type")
                src = bb.get("items", []) if tt in ("mc", "gap", "tf") else \
                    (bb.get("q", []) if tt in ("read", "listen") else [])
                for it in src:
                    q = re.sub(r"<[^>]+>", "", str(it.get("q", ""))).strip().lower().rstrip(".").strip()
                    if len(q) > 12:
                        out[q] = bb.get("title", tt)
            return out
        ql, qw = questions(les.get("blocks", [])), questions(les.get("workbook", []))
        for q in set(ql) & set(qw):
            fail(where, "задание повторяется в уроке и тетради: «%s» (%s / %s)"
                 % (q[:52], ql[q][:24], qw[q][:24]))


def audit_html(course):
    """Проверка собранной страницы."""
    global checks
    for f in sorted(glob.glob("%s-u[0-9][a-h].html" % course)):
        where = f.replace(course + "-", "").replace(".html", "")
        s = open(f, encoding="utf-8").read()
        b, e = s.find("<body>"), s.find('<script src="https://cdn')
        body = s[b:e]
        checks += 1

        ids = re.findall(r'id="(b\d+)"', body)
        dup = [i for i, n in Counter(ids).items() if n > 1]
        if dup:
            fail(where, "повторяющиеся id контейнеров: %s" % ", ".join(sorted(dup)))

        scripts = re.findall(r"<script>(.*?)</script>", s, re.S)
        sc = scripts[-1] if scripts else ""
        called = set(re.findall(r'SMrender\w+\("(b\d+)"', sc))
        called |= set(re.findall(r'SMrenderListen\("(b\d+)"', sc))
        empty = [i for i in ids if i not in called]
        if empty:
            fail(where, "контейнеры без данных: %s" % ", ".join(sorted(empty)))

        if "id=\"pane-wb\"" in body:
            les, wb = body.split('id="pane-wb"')
            il = set(re.findall(r'id="(b\d+)"', les))
            iw = set(re.findall(r'id="(b\d+)"', wb))
            if il & iw:
                fail(where, "id урока и тетради пересекаются: %s" % ", ".join(sorted(il & iw)))
            if not iw:
                fail(where, "вкладка тетради пустая")

        for src in set(re.findall(r'src="(img/[^"]+)"', body)):
            if not os.path.exists(src):
                fail(where, "битая ссылка на картинку: %s" % src)

        # вес страницы вместе с картинками
        weight = os.path.getsize(f)
        for src in set(re.findall(r'src="(img/[^"]+)"', body)):
            if os.path.exists(src):
                weight += os.path.getsize(src)
        if weight > 900_000:
            warn(where, "тяжёлая страница: %d КБ" % (weight // 1024))

        if "speechSynthesis" not in sc and "class=\"pl\"" in body:
            fail(where, "есть плеер, но нет озвучки")


if __name__ == "__main__":
    course = sys.argv[1] if len(sys.argv) > 1 else "solutions-el"
    for p in sorted(glob.glob("lessons/%s-u*.json" % course)):
        audit_json(p)
    audit_html(course)

    print("\nАудит: проверок %d" % checks)
    if warnings:
        print("\n%sЗамечания (%d):%s" % (YEL, len(warnings), OFF))
        for w in warnings:
            print("  ! %s" % w)
    if problems:
        print("\n%sОшибки (%d):%s" % (RED, len(problems), OFF))
        for p in problems:
            print("  ✗ %s" % p)
        sys.exit(1)
    print("\n%sОшибок нет%s" % (GRN, OFF))
