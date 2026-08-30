#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Генератор подстраниц юнита по сетке Solutions 3rd edition: A–H.

  A Vocabulary · B Grammar · C Listening · D Grammar
  E Word Skills · F Reading · G Speaking · H Writing

Берёт готовый материал из существующих страниц юнита
(<course>-uN.html и <course>-uN-grammar.html) и раскладывает его
по восьми подстраницам <course>-uN{a..h}.html.

Ничего не выдумывает: только перегруппировка того, что уже есть.
Секции, которых в юните нет, на подстранице честно помечаются.

Запуск:  python3 build-subunits.py solutions-el 1
         python3 build-subunits.py solutions-el all
"""
import re, sys, os

LESSONS = [
    ("a", "Vocabulary",  "🔤", "Слова и фразы юнита"),
    ("b", "Grammar",     "📖", "Первая грамматическая тема"),
    ("c", "Listening",   "🎧", "Аудирование и вопросы"),
    ("d", "Grammar",     "📖", "Вторая грамматическая тема"),
    ("e", "Word Skills", "🔠", "Работа со словом"),
    ("f", "Reading",     "📕", "Тексты и понимание"),
    ("g", "Speaking",    "💬", "Говорение и полезные фразы"),
    ("h", "Writing",     "✍️", "Письменная работа"),
]


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def grab(pattern, s, flags=re.S, group=1, default=""):
    m = re.search(pattern, s, flags)
    return m.group(group) if m else default


def section(s, title_re):
    """Вырезает <h2>…</h2> и всё до следующего <h2> или конца .wrap."""
    m = re.search(r'(<h2[^>]*>' + title_re + r'.*?)(?=<h2|<div class="foot")', s, re.S)
    return m.group(1).strip() if m else ""


def all_sections(s, title_re):
    return [m.group(1).strip() for m in
            re.finditer(r'(<h2[^>]*>' + title_re + r'.*?)(?=<h2|<div class="foot")', s, re.S)]


def split_consts(js, names):
    """Возвращает dict name -> 'const NAME=…;' для перечисленных имён."""
    out = {}
    for n in names:
        m = re.search(r'^(const %s=.*?;)\s*$' % n, js, re.M)
        if m:
            out[n] = m.group(1)
    return out


def half(js_const, first):
    """Делит массив-констант пополам: first=True — первая половина."""
    m = re.match(r'^const (\w+)=(\[.*\]);$', js_const, re.S)
    if not m:
        return js_const
    name, body = m.group(1), m.group(2)
    # делим по верхнеуровневым запятым
    depth, parts, cur = 0, [], ""
    for ch in body[1:-1]:
        if ch in "[{":
            depth += 1
        elif ch in "]}":
            depth -= 1
        if ch == "," and depth == 0:
            parts.append(cur); cur = ""
        else:
            cur += ch
    if cur.strip():
        parts.append(cur)
    k = (len(parts) + 1) // 2
    keep = parts[:k] if first else parts[k:]
    return "const %s=[%s];" % (name, ",".join(keep))


def build(course, unit):
    main_p = "%s-u%d.html" % (course, unit)
    gram_p = "%s-u%d-grammar.html" % (course, unit)
    if not os.path.exists(main_p):
        print("  нет файла", main_p); return 0
    main = read(main_p)
    gram = read(gram_p) if os.path.exists(gram_p) else ""

    head = main[:main.find("<body>")]
    engine = main[main.find('<script src="https://cdn'):]

    title = grab(r"<h1>(.*?)</h1>", main) or "Unit %d" % unit
    subtitle = grab(r'<div class="d">(.*?)</div>', main)
    cover = grab(r"background-image:url\('([^']+)'\)", main)

    # ---- куски материала ----
    body = main[main.find("<body>"):]
    sec_words = section(body, r"[^<]*Слова юнита")
    sec_pron = section(body, r"[^<]*Произношение")
    sec_chunks = section(body, r"[^<]*(Фразы|Chunks)")
    sec_chpr = section(body, r"[^<]*Тренажёр")
    listens = all_sections(body, r"[^<]*Аудирование")
    sec_ws = section(body, r"[^<]*Word Skills")
    reads = all_sections(body, r"[^<]*Чтение")
    sec_tf = section(body, r"[^<]*True or False")
    sec_howto = section(body, r"[^<]*How to")
    sec_speak = section(body, r"[^<]*Говорим")
    sec_write = section(body, r"[^<]*Writing")
    sec_exam = section(body, r"[^<]*(Exam|IELTS)")

    # грамматика: карточки разбора со страницы -grammar
    gcards = ""
    if gram:
        gb = gram[gram.find("<body>"):]
        m = re.search(r'<h2[^>]*>[^<]*Разбор грамматики</h2>(.*?)(?=<h2)', gb, re.S)
        gcards = m.group(1).strip() if m else ""
    cards = re.findall(r'(<div class="card">.*?</div>\s*(?=<div class="card"|$))', gcards, re.S)
    if not cards:
        cards = re.findall(r'(<div class="card">.*?)(?=<div class="card"|\Z)', gcards, re.S)
    mid = (len(cards) + 1) // 2
    cards_b = "".join(cards[:mid]) if cards else ""
    cards_d = "".join(cards[mid:]) if len(cards) > 1 else ""

    js = engine
    consts = split_consts(js, ["EX", "GAPS", "WORDSKILLS", "SPEAK", "FX",
                               "TF", "EXAM_MC", "WBMC", "WBGAPS"])

    # ---- содержимое каждой подстраницы ----
    def nav(cur):
        out = ['<div class="subnav">']
        for L, name, emo, _ in LESSONS:
            cls = "subchip on" if L == cur else "subchip"
            out.append('<a class="%s" href="%s-u%d%s.html">%d%s</a>'
                       % (cls, course, unit, L, unit, L.upper()))
        out.append("</div>")
        return "".join(out)

    plan = {}
    plan["a"] = sec_words + sec_pron + sec_chunks + sec_chpr
    plan["b"] = ('<h2>📖 Разбор грамматики</h2>' + cards_b +
                 '<h2>✏️ Упражнения</h2><div id="ex"></div>') if cards_b else ""
    plan["c"] = "".join(listens)
    plan["d"] = ('<h2>📖 Разбор грамматики</h2>' + cards_d +
                 '<h2>✏️ Упражнения</h2><div id="ex"></div>') if cards_d else ""
    plan["e"] = sec_ws
    plan["f"] = "".join(reads) + sec_tf
    plan["g"] = sec_howto + sec_speak
    plan["h"] = sec_write + sec_exam

    made = 0
    for L, name, emo, hint in LESSONS:
        content = plan.get(L, "").strip()
        if not content:
            content = ('<div class="card" style="text-align:center;color:#8a7a68;'
                       'font-weight:800;font-size:14px">Этот урок пока пустой — '
                       'материал появится позже.</div>')
        # какие консты нужны этой странице
        need = []
        if L == "b" and "EX" in consts:
            need = [half(consts["EX"], True), half(consts.get("GAPS", "const GAPS=[];"), True)]
        elif L == "d" and "EX" in consts:
            need = [half(consts["EX"], False), half(consts.get("GAPS", "const GAPS=[];"), False)]
        else:
            keep = {"a": [], "c": [], "e": ["WORDSKILLS"], "f": ["TF"],
                    "g": ["FX", "SPEAK"], "h": ["EXAM_MC"]}.get(L, [])
            need = [consts[k] for k in keep if k in consts]

        page = (head
                + "<body><div class=\"wrap\">\n"
                + '  <div class="scorebar">⭐ Счёт: <span id="sc">0</span> / <span id="tot">0</span></div>\n'
                + '  <div class="top">'
                + '<a class="home" href="%s-u%d.html">← Юнит</a>' % (course, unit)
                + '<a class="home alt" href="trainer.html?unit=sel-u%d">🎯 Тренажёр</a>' % unit
                + '<a class="home" href="%s-course.html">Все юниты</a></div>\n' % course
                + "  <h1>%s%s · %s %s</h1>\n" % (unit, L.upper(), emo, name)
                + '  <div class="d">%s</div>\n' % (title)
                + "  " + nav(L) + "\n"
                + "  " + content + "\n"
                + '  <div class="foot">Made for @english.with_asya · %s · Unit %d%s</div>\n'
                % (course, unit, L.upper())
                + "</div>\n")

        eng = engine
        # своя метка подурока в hw_attempts (схема БД не меняется)
        eng = eng.replace('const HW={course:"%s",unit:%d}' % (course, unit),
                          'const HW={course:"%s",unit:%d,sub:"%d%s"}' % (course, unit, unit, L.upper()))
        eng = eng.replace("section:sec,", "section:(HW.sub?HW.sub+\"-\"+sec:sec),")
        # заменяем данные на нужные этой странице
        for nm in ["EX", "GAPS"]:
            if any(x.startswith("const %s=" % nm) for x in need):
                new = [x for x in need if x.startswith("const %s=" % nm)][0]
                eng = re.sub(r'^const %s=.*?;\s*$' % nm, new, eng, count=1, flags=re.M)

        out_p = "%s-u%d%s.html" % (course, unit, L)
        title_tag = "%d%s · %s · %s · English with Asya" % (unit, L.upper(), name, "Solutions Elementary")
        page = re.sub(r"<title>.*?</title>", "<title>%s</title>" % title_tag, page, count=1, flags=re.S)
        # стили для навигации по подурокам
        if ".subnav{" not in page:
            page = page.replace("</style>",
                ".subnav{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 20px}"
                ".subchip{border:2px solid #e3d3ba;background:#fff;color:#7c2340;"
                "font:800 13px 'Nunito',sans-serif;padding:7px 13px;border-radius:999px}"
                ".subchip.on{background:#7c2340;border-color:#7c2340;color:#fff}\n</style>")
        with open(out_p, "w", encoding="utf-8") as f:
            f.write(page + eng)
        made += 1
    return made


def add_hub(course, unit):
    """Вставляет на страницу юнита список подуроков A–H."""
    p = "%s-u%d.html" % (course, unit)
    s = read(p)
    if 'id="subunits"' in s:
        return False
    links = "".join(
        '<a class="subcard" href="%s-u%d%s.html"><b>%d%s</b><span>%s %s</span></a>'
        % (course, unit, L, unit, L.upper(), emo, name)
        for L, name, emo, _ in LESSONS)
    block = ('\n  <h2 id="subunits">🧭 Уроки юнита</h2>\n'
             '  <div class="subgrid">%s</div>\n' % links)
    s = re.sub(r'(<h2[^>]*>[^<]*Грамматика юнита</h2>)', block + r"\1", s, count=1)
    if ".subgrid{" not in s:
        s = s.replace("</style>",
            ".subgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:8px}"
            "@media(max-width:620px){.subgrid{grid-template-columns:repeat(2,1fr)}}"
            ".subcard{display:flex;flex-direction:column;gap:2px;background:#fff;border-radius:14px;"
            "padding:11px 13px;box-shadow:0 3px 0 #e3d3ba;color:#7c2340}"
            ".subcard b{font:900 16px 'Fredoka',sans-serif}"
            ".subcard span{font:800 11.5px 'Nunito',sans-serif;color:#8a7a68}\n</style>")
    with open(p, "w", encoding="utf-8") as f:
        f.write(s)
    return True


if __name__ == "__main__":
    course = sys.argv[1] if len(sys.argv) > 1 else "solutions-el"
    which = sys.argv[2] if len(sys.argv) > 2 else "1"
    units = (range(0, 10) if which == "all" else [int(which)])
    total = 0
    for u in units:
        n = build(course, u)
        if n:
            add_hub(course, u)
            print("  u%d: собрано подстраниц %d" % (u, n))
            total += n
    print("Итого подстраниц:", total)
