#!/usr/bin/env python3
"""Собирает слова курсов в один файл course-words.js для словаря и тренажёра.

Источники разные, поэтому и способы разные:
  focus-1, solutions-pi  — данные лежат в генераторах *_data.py
  solutions-el, gateway  — слова зашиты в готовые страницы (WORDS=[[...]])
Speakout сюда не входит: у него уже есть speakout-words.js.
"""
import re, glob, json, importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))

def load_py(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

def from_generator(py, name):
    """DATA — список юнитов со словами."""
    mod = load_py(os.path.join(HERE, py), name)
    out = []
    for u in mod.DATA:
        pairs = [[str(a), str(b)] for a, b, *_ in (w for w in (u.get("words") or []) if len(w) >= 2)]
        # Словосочетания юнита идут следом за словами и помечаются "c",
        # чтобы тренажёр показывал их с другой иконкой.
        pairs += [[str(a), str(b), "c"] for a, b, *_ in (c for c in (u.get("chunks") or []) if len(c) >= 2)]
        if not pairs:
            continue
        out.append({
            "n": u.get("n"),
            "title": u.get("title") or ("Unit " + str(u.get("n"))),
            "emoji": u.get("emoji") or "📘",
            "words": pairs,
        })
    return out

def from_pages(pattern):
    """WORDS=[["en","ru"],...] внутри страницы юнита."""
    out = []
    for f in sorted(glob.glob(os.path.join(HERE, pattern))):
        base = os.path.basename(f)
        if "-grammar" in base or "-workbook" in base or "-course" in base:
            continue
        src = open(f, encoding="utf-8").read()
        m = re.search(r'WORDS\s*=\s*(\[\[.*?\]\])\s*[;,\n]', src, re.S)
        if not m:
            continue
        try:
            arr = json.loads(m.group(1))
        except Exception:
            continue
        pairs = [[str(p[0]), str(p[1])] for p in arr if isinstance(p, list) and len(p) >= 2]
        # Словосочетания юнита: тот же формат, помечаем "c".
        mc = re.search(r'const CHUNKS\s*=\s*(\[.*?\]);\s*\n', src, re.S)
        if mc:
            try:
                for p in json.loads(mc.group(1)):
                    if isinstance(p, list) and len(p) >= 2:
                        pairs.append([str(p[0]), str(p[1]), "c"])
            except Exception:
                pass
        if not pairs:
            continue
        num = re.search(r'-u(\d+)', base)
        # Заголовок страницы: "Unit 5 · In the city · Solutions Elementary · ...".
        # Нужна тема юнита (второй кусок), иначе в тренажёре все юниты
        # называются одинаково — «Unit 1», «Unit 2» — и курс не узнать.
        tm = re.search(r'<title>([^<]*)</title>', src)
        title = base
        if tm:
            parts = [p.strip() for p in tm.group(1).split("·") if p.strip()]
            # У части страниц первый кусок — сама тема («Introduction»),
            # у части — номер юнита, и тема идёт следом («Unit 5 · In the city»).
            if parts:
                title = parts[0]
                if len(parts) > 1 and re.fullmatch(r'(?i)unit\s*\d+', parts[0]):
                    title = parts[1]
        out.append({
            "n": int(num.group(1)) if num else len(out),
            "title": title,
            "emoji": "📘",
            "words": pairs,
        })
    out.sort(key=lambda u: u["n"])
    return out

COURSES = {
    "focus-1":      {"title": "Focus 1",              "subtitle": "A1–A2 · 9 юнитов",  "emoji": "📙", "color": "#f2e6df", "units": from_generator("focus1_data.py", "f1data")},
    "solutions-pi": {"title": "Solutions Pre-Int",    "subtitle": "Pre-Intermediate",  "emoji": "📕", "color": "#f2dfe4", "units": from_generator("solutions_pi_data.py", "spidata")},
    "solutions-el": {"title": "Solutions Elementary", "subtitle": "Elementary",        "emoji": "📗", "color": "#dff2e4", "units": from_pages("solutions-el-u*.html")},
    "gateway-a1p":  {"title": "Gateway A1+",          "subtitle": "A1+ · 2nd edition", "emoji": "📒", "color": "#f2efdf", "units": from_pages("gateway-a1p-u*.html")},
}

lines = ["/* Слова курсов для словаря и тренажёра.",
         "   Файл собирается скриптом gen_course_words.py — правь источники, не этот файл. */",
         "window.COURSE_WORDS = {"]
total = 0
for slug, c in COURSES.items():
    if not c["units"]:
        print(f"  внимание: {slug} без слов, пропущен", file=sys.stderr)
        continue
    n = sum(len(u["words"]) for u in c["units"])
    total += n
    print(f"  {slug}: юнитов {len(c['units'])}, слов {n}")
    lines.append(f'  {json.dumps(slug, ensure_ascii=False)}: {json.dumps({k: c[k] for k in ("title","subtitle","emoji","color","units")}, ensure_ascii=False)},')
lines.append("};")
open(os.path.join(HERE, "course-words.js"), "w", encoding="utf-8").write("\n".join(lines) + "\n")
print(f"  итого слов: {total}  →  course-words.js")
