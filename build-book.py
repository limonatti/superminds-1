# -*- coding: utf-8 -*-
"""
Сборка учебника-читалки из авторского контента.

Берёт b1_data.py (или b1plus_data.py) и раскладывает каждый юнит на «развороты» —
как страницы бумажного учебника. Результат — JSON, который заливается в Supabase
и отдаётся только вошедшему ученику курса.

Запуск:  python3 build-book.py speakout-b1
"""
import importlib.util, json, sys, os

COURSES = {
    "speakout-b1":     {"file": "b1_data.py",     "title": "Speakout B1",  "level": "B1"},
    "speakout-b1plus": {"file": "b1plus_data.py", "title": "Speakout B1+", "level": "B1+"},
}

# Видео к юнитам — открытые ролики BBC Learning English под грамматику юнита.
# Встраиваются плеером, файлы не копируются. Пересборка книги их не теряет.
VIDEOS = {
    "speakout-b1": {
        1: "https://www.youtube.com/watch?v=xFsYrTIndhI",  # Present Simple / Continuous
        2: "https://www.youtube.com/watch?v=3mi5OI23A6w",  # narrative tenses
        3: "https://www.youtube.com/watch?v=j9b1CNN_rFU",  # asking questions
        4: "https://www.youtube.com/watch?v=HUXXgVElADg",  # have to / must
        5: "https://www.youtube.com/watch?v=ohhyIC-AZFY",  # relative clauses с which
        6: "https://www.youtube.com/watch?v=3dA7P5arkyc",  # used to
        7: "https://www.youtube.com/watch?v=3OuqzHxlrHc",  # second conditional
        8: "https://www.youtube.com/watch?v=38QqDrckyxM",  # active & passive
    },
}


# ---------- Бесплатные иллюстрации ----------
# Pollinations отдаёт картинку прямо по ссылке, без ключа и без лимитов.
# Ссылка детерминированная: один и тот же промпт и seed = одна и та же картинка.
import urllib.parse, hashlib

ART_STYLE = ("flat vector editorial illustration, clean shapes, warm muted palette, "
             "soft cream background, no text, no letters, no words, no watermark")
WORD_STYLE = ("simple flat vector icon illustration, single clear object, centered, "
              "plain light background, bold shapes, no text, no letters, no watermark")

def _art(prompt, w=1024, h=576, style=ART_STYLE):
    seed = int(hashlib.md5(prompt.encode("utf-8")).hexdigest()[:6], 16)
    q = urllib.parse.quote(prompt + ", " + style, safe="")
    return ("https://image.pollinations.ai/prompt/" + q +
            "?width=%d&height=%d&nologo=true&seed=%d&model=flux" % (w, h, seed))

def word_art(en):
    return _art(en, 384, 384, WORD_STYLE)


def load(path):
    spec = importlib.util.spec_from_file_location("src", path)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def spreads_for_unit(u, extras, words_by_unit):
    """Разложить юнит на развороты. Каждый разворот = одна страница читалки."""
    n = u.get("n")
    ex = dict(extras.get(n, {}))
    sp = []

    def add(kind, title, **kw):
        page = {"kind": kind, "title": title}
        page.update(kw)
        sp.append(page)

    # 1. Обложка юнита
    add("cover", u.get("title", ""),
        emoji=u.get("emoji", ""),
        desc=u.get("desc", ""),
        art=_art("English lesson unit about " + u.get("title", "") + ": " + u.get("desc", "")[:90]),
        goals=[g.get("t", "") for g in u.get("grammar", [])])

    # 2. Слова юнита
    words = u.get("words") or words_by_unit.get(n) or []
    more = ex.get("words") or []
    if words:
        add("words", "Слова юнита / Vocabulary",
            items=[{"en": w[0], "ru": w[1], "img": word_art(w[0])} for w in words if len(w) >= 2],
            extra=[{"en": w[0], "ru": w[1], "img": word_art(w[0])} for w in more if len(w) >= 2])

    # 3. Грамматика — по развороту на тему
    for g in u.get("grammar", []):
        add("grammar", g.get("t", "Грамматика"), html=g.get("h", ""))

    # 4. Аудирование: диалог двумя голосами + вопросы
    if u.get("dialog"):
        names = u.get("names") or {}
        add("listening", u.get("listen_title") or "Аудирование / Listening",
            art=_art("scene: " + (u.get("listen_title") or "two people talking")),
            speakers={"m": names.get("m", "Man"), "f": names.get("f", "Woman")},
            lines=[{"who": d[0], "text": d[1]} for d in u["dialog"] if len(d) >= 2],
            questions=u.get("lq") or [])

    # 5. Чтение
    if ex.get("reading"):
        add("reading", ex.get("reading_title") or "Чтение / Reading",
            art=_art("magazine illustration: " + (ex.get("reading_title") or "article")),
            html=ex.get("reading", ""), questions=ex.get("rq") or [])

    # 6. Произношение
    if ex.get("pron_words"):
        add("pron", "Произношение / Pronunciation",
            focus=ex.get("pron_focus", ""), note=ex.get("pron_note", ""),
            items=ex.get("pron_words") or [])

    # 7. Чанки
    if ex.get("chunks"):
        add("chunks", "Выражения целиком / Chunks",
            items=[{"en": c[0], "ru": c[1]} for c in ex["chunks"] if len(c) >= 2])

    # 8. Упражнения (выбор варианта)
    allmc = list(u.get("ex") or [])
    if allmc:
        half = (len(allmc) + 1) // 2
        add("mc", "Упражнения · часть 1", items=allmc[:half])
        if allmc[half:]:
            add("mc", "Упражнения · часть 2", items=allmc[half:])

    # 9. Пропуски (вписать)
    if u.get("gaps"):
        add("gap", "Впиши пропуски / Gap fill", items=u["gaps"])

    # 10. Функциональный язык
    if u.get("howto"):
        add("howto", u.get("howto_title") or "How to…",
            html=u.get("howto", ""), questions=u.get("fx") or [])

    # 11. Рабочая тетрадь
    wb = list(u.get("wbmc") or [])
    wbg = list(u.get("wbgaps") or [])
    if wb or wbg:
        add("workbook", "Рабочая тетрадь / Workbook", mc=wb, gaps=wbg)

    # 12. Говорение
    if ex.get("speaking"):
        add("speaking", "Говорим / Speaking", items=ex["speaking"])

    # 13. Домашка
    if u.get("hw"):
        add("hw", "Домашнее задание / Homework", html=u["hw"])

    return sp


def build(course):
    meta = COURSES[course]
    m = load(meta["file"])
    extras = getattr(m, "EXTRAS", {})
    wbu = getattr(m, "WORDS_BY_UNIT", {})

    units = []
    for u in m.DATA:
        n = u.get("n")
        sp = spreads_for_unit(u, extras, wbu)
        units.append({
            "n": n,
            "title": u.get("title", ""),
            "emoji": u.get("emoji", ""),
            "desc": u.get("desc", ""),
            "video": VIDEOS.get(course, {}).get(n, ""),
            "spreads": sp,
        })

    book = {
        "course": course,
        "title": meta["title"],
        "level": meta["level"],
        "units": units,
    }
    out = course + "-book.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(book, f, ensure_ascii=False, separators=(",", ":"))
    total = sum(len(u["spreads"]) for u in units)
    print("%s: %d юнитов, %d разворотов, %d КБ -> %s"
          % (meta["title"], len(units), total, os.path.getsize(out) // 1024, out))
    return book


if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else "speakout-b1"
    build(which)
