#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Рендер подуроков курса из JSON с авторским содержанием.

  lessons/<course>-u<N>.json  →  <course>-u<N><a..h>.html

Содержание уроков лежит в JSON — тексты, задания, правила. Здесь только
разметка и подключение общего движка со страницы юнита (озвучка, карточки,
подсчёт очков, запись в hw_attempts).

Схема блока:
  words      items [[en, ru], ...]            note
  pron       items [слово, ...]               note
  chunks     items [[en, ru], ...]
  chunkdrill (тренажёр по chunks текущего урока)
  rules      cards [{h, rows[], table[[..]]}]
  mc         items [{q, o[], a}]
  gap        items [{q, a[]}]
  tf         items [{q, a: true|false}]
  match      pairs [[left, right], ...]
  listen     h3, intro, script [[кто, реплика]], q [{q,o,a}]
  read       h3, html, q [{q,o,a}]
  speak      items [строка, ...]
  note       html          (просто карточка с текстом)
  writing    html          (задание в рамке)
  wb         mc[], gap[], tf[]   (рабочая тетрадь урока)

Запуск: python3 build-lessons.py solutions-el 1
        python3 build-lessons.py solutions-el all
"""
import json, os, re, sys, glob

ROLE_EMO = {"Vocabulary": "🔤", "Grammar": "📖", "Listening": "🎧",
            "Word Skills": "🔠", "Reading": "📕", "Speaking": "💬",
            "Writing": "✍️", "Exam": "🎯"}

EXTRA_CSS = (
    ".subnav{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 18px}"
    ".subchip{border:2px solid #e3d3ba;background:#fff;color:#7c2340;"
    "font:800 13px 'Nunito',sans-serif;padding:7px 13px;border-radius:999px}"
    ".subchip.on{background:#7c2340;border-color:#7c2340;color:#fff}"
    ".cando{background:#2e6f4e;color:#fff;border-radius:16px;padding:12px 18px;"
    "font:800 14.5px 'Nunito',sans-serif;margin-bottom:18px}"
    ".subgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:8px}"
    "@media(max-width:620px){.subgrid{grid-template-columns:repeat(2,1fr)}}"
    ".subcard{display:flex;flex-direction:column;gap:2px;background:#fff;border-radius:14px;"
    "padding:11px 13px;box-shadow:0 3px 0 #e3d3ba;color:#7c2340}"
    ".subcard b{font:900 16px 'Fredoka',sans-serif}"
    ".subcard span{font:800 11.5px 'Nunito',sans-serif;color:#8a7a68}"
    ".matchwrap{display:grid;grid-template-columns:1fr 1fr;gap:8px}"
    ".mitem{display:block;width:100%;border:2px solid #e3d3ba;background:#fdfaf0;cursor:pointer;"
    "font:800 14px 'Nunito',sans-serif;padding:9px 12px;border-radius:12px;margin-bottom:6px;text-align:left}"
    ".mitem.sel{border-color:#7c2340;background:#fff}"
    ".mitem.ok{background:#c8efc0;border-color:#27ae60}"
    ".mitem.bad{background:#ffc9c0;border-color:#c0392b}"
    ".wbhead{font:900 15px 'Fredoka',sans-serif;color:#7c2340;margin:22px 4px 8px}"
)


def esc(t):
    return (t or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def html_blocks(blocks):
    """HTML-часть: заголовки и контейнеры. Данные уходят в JS."""
    out, n = [], 0
    for b in blocks:
        n += 1
        bid = "b%d" % n
        b["_id"] = bid
        t = b["type"]
        title = b.get("title", "")
        note = b.get("note", "")
        sec = ('<h2>%s%s</h2>\n' % (title, "")) if title else ""
        if t == "words":
            out.append(sec + (('  <div class="wbband">%s</div>\n' % note) if note else "")
                       + '  <div class="words" id="%s"></div>\n' % bid)
        elif t == "pron":
            out.append(sec + '  <div class="card">'
                       + (('<div style="font-size:14px;margin-bottom:8px">%s</div>' % note) if note else "")
                       + '<div class="pronbox" id="%s"></div></div>\n' % bid)
        elif t == "chunks":
            out.append(sec + '  <div class="words" id="%s"></div>\n' % bid)
        elif t in ("chunkdrill", "mc", "gap", "tf", "match", "wb"):
            out.append(sec + (('  <div class="wbband">%s</div>\n' % note) if note else "")
                       + '  <div id="%s"></div>\n' % bid)
        elif t == "rules":
            html = sec
            for c in b.get("cards", []):
                html += '  <div class="card"><span class="gt">%s</span>\n' % c.get("h", "")
                for r in c.get("rows", []):
                    html += '    <div class="g-ex">%s</div>\n' % r
                if c.get("table"):
                    html += "    <table>\n"
                    for i, row in enumerate(c["table"]):
                        tag = "th" if i == 0 else "td"
                        html += "      <tr>" + "".join("<%s>%s</%s>" % (tag, x, tag) for x in row) + "</tr>\n"
                    html += "    </table>\n"
                html += "  </div>\n"
            out.append(html)
        elif t == "listen":
            out.append(sec + '  <div class="lc"><h3>%s</h3><p>%s</p>'
                       '<button class="lbtn" id="%s_play">▶ Слушать</button>'
                       '<button class="lbtn sec" id="%s_stop">⏹ Стоп</button>'
                       '<button class="lbtn sec" id="%s_txt">📜 Показать текст</button>'
                       '<div id="%s_sc" style="display:none;background:rgba(255,255,255,.1);'
                       'border-radius:12px;padding:12px 16px;margin-top:12px;font-size:14px;'
                       'line-height:1.65">%s</div></div>\n'
                       '  <div id="%s" style="margin-top:14px"></div>\n'
                       % (b.get("h3", ""), b.get("intro", "Послушай и ответь на вопросы."),
                          bid, bid, bid, bid, b.get("script_html", ""), bid))
        elif t == "read":
            out.append(sec + '  <div class="read"><h3>%s</h3>%s</div>\n'
                       '  <div id="%s" style="margin-top:14px"></div>\n'
                       % (b.get("h3", ""), b.get("html", ""), bid))
        elif t == "speak":
            out.append(sec + '  <div id="%s"></div>\n' % bid)
        elif t == "note":
            out.append(sec + '  <div class="card">%s</div>\n' % b.get("html", ""))
        elif t == "writing":
            out.append(sec + '  <div class="hw">%s</div>\n' % b.get("html", ""))
    return "".join(out)


def js_blocks(blocks):
    """JS-часть: данные и отрисовка через функции движка."""
    js = ["\n/* ── содержимое урока ── */"]
    for b in blocks:
        bid, t = b["_id"], b["type"]
        J = lambda x: json.dumps(x, ensure_ascii=False)
        if t == "words" or t == "chunks":
            js.append('SMrenderWords(%s,%s);' % (J(bid), J(b["items"])))
        elif t == "pron":
            js.append('SMrenderPron(%s,%s);' % (J(bid), J(b["items"])))
        elif t == "chunkdrill":
            js.append('SMrenderDrill(%s,%s,%s);' % (J(bid), J(b["items"]), J(b.get("sec", "chunk"))))
        elif t == "mc":
            js.append('SMrenderMC(%s,%s,%s);' % (J(bid), J(b["items"]), J(b.get("sec", "grammar"))))
        elif t == "gap":
            js.append('SMrenderGap(%s,%s,%s);' % (J(bid), J(b["items"]), J(b.get("sec", "gap"))))
        elif t == "tf":
            js.append('SMrenderTF(%s,%s,%s);' % (J(bid), J(b["items"]), J(b.get("sec", "truefalse"))))
        elif t == "match":
            js.append('SMrenderMatch(%s,%s,%s);' % (J(bid), J(b["pairs"]), J(b.get("sec", "match"))))
        elif t == "listen":
            js.append('SMrenderListen(%s,%s,%s,%s);'
                      % (J(bid), J(b["script"]), J(b.get("q", [])), J(b.get("sec", "listening"))))
        elif t == "read":
            js.append('SMrenderMC(%s,%s,%s);' % (J(bid), J(b.get("q", [])), J(b.get("sec", "reading"))))
        elif t == "speak":
            js.append('SMrenderSpeak(%s,%s);' % (J(bid), J(b["items"])))
        elif t == "wb":
            js.append('SMrenderWB(%s,%s,%s,%s);'
                      % (J(bid), J(b.get("mc", [])), J(b.get("gap", [])), J(b.get("tf", []))))
    js.append('var _totF=document.getElementById("tot");if(_totF)_totF.textContent=tot;')
    return "\n".join(js)


HELPERS = r"""
/* ── помощники рендера подуроков ── */
function SMel(id){return document.getElementById(id);}
function SMrenderWords(id,items){var box=SMel(id);if(!box)return;
  items.forEach(function(w){var d=document.createElement("div");d.className="word";
    d.innerHTML='<button>🔊</button><div><div class="en">'+w[0]+'</div><div class="tr">'+w[1]+'</div></div>';
    d.querySelector("button").onclick=function(){say(w[0]);};box.appendChild(d);});}
function SMrenderPron(id,items){var box=SMel(id);if(!box)return;
  items.forEach(function(w){var b=document.createElement("button");b.className="chip";
    b.textContent="🔊 "+w;b.onclick=function(){say(w);};box.appendChild(b);});}
function SMrenderMC(id,items,sec){var box=SMel(id);if(!box||!items)return;
  items.forEach(function(t,i){box.appendChild(mcCard(t,i+1,sec));});}
function SMrenderGap(id,items,sec){var box=SMel(id);if(!box||!items)return;
  items.forEach(function(t,i){box.appendChild(gapCard(t,i+1,sec));});}
function SMrenderTF(id,items,sec){var box=SMel(id);if(!box||!items)return;
  items.forEach(function(t,i){box.appendChild(tfCard(t,i+1,sec));});}
function SMrenderMatch(id,pairs,sec){var box=SMel(id);if(!box||!pairs)return;
  box.appendChild(matchCard(pairs,1,sec));}
function SMrenderSpeak(id,items){var box=SMel(id);if(!box)return;
  items.forEach(function(p,i){var d=document.createElement("div");d.className="spkcard";
    d.innerHTML='<span class="spn">'+(i+1)+'</span> '+p;box.appendChild(d);});}
function SMrenderDrill(id,items,sec){var box=SMel(id);if(!box||!items)return;
  shuffle(items).forEach(function(c,i){
    var others=shuffle(items.filter(function(x){return x[1]!==c[1];})).slice(0,2).map(function(x){return x[1];});
    var opts=shuffle([c[1]].concat(others));
    box.appendChild(mcCard({q:'Что значит <b>'+c[0]+'</b>?',o:opts,a:opts.indexOf(c[1])},i+1,sec));});}
function SMrenderListen(id,script,qs,sec){
  var p=SMel(id+"_play"),s=SMel(id+"_stop"),t=SMel(id+"_txt"),sc=SMel(id+"_sc");
  if(p)p.onclick=function(){playDialog(script);};
  if(s)s.onclick=function(){speechSynthesis.cancel();};
  if(t&&sc)t.onclick=function(){sc.style.display=sc.style.display==="block"?"none":"block";};
  SMrenderMC(id,qs,sec);}
function SMrenderWB(id,mc,gap,tf){var box=SMel(id);if(!box)return;var n=0;
  function head(x){var h=document.createElement("div");h.className="wbhead";h.textContent=x;box.appendChild(h);}
  if(mc&&mc.length){head("✅ Выбери правильный вариант");mc.forEach(function(t){box.appendChild(mcCard(t,++n,"wb"));});}
  if(gap&&gap.length){head("✍️ Впиши ответ");gap.forEach(function(t){box.appendChild(gapCard(t,++n,"wb"));});}
  if(tf&&tf.length){head("🔍 True or False");tf.forEach(function(t){box.appendChild(tfCard(t,++n,"wb-tf"));});}}
"""


def build_unit(course, unit, data, letters_all):
    src = open("%s-u%d.html" % (course, unit), encoding="utf-8").read()
    head = src[:src.find("<body>")]
    engine = src[src.find('<script src="https://cdn'):]
    if EXTRA_CSS not in head:
        head = head.replace("</style>", EXTRA_CSS + "\n</style>")

    made = []
    for letter in letters_all:
        L = data["lessons"].get(letter)
        if not L:
            continue
        role = L.get("role", "")
        emo = ROLE_EMO.get(role, "📘")
        nav = ['<div class="subnav">']
        for x in letters_all:
            if x not in data["lessons"]:
                continue
            cls = "subchip on" if x == letter else "subchip"
            nav.append('<a class="%s" href="%s-u%d%s.html">%d%s</a>'
                       % (cls, course, unit, x.lower(), unit, x))
        nav.append("</div>")

        body_html = html_blocks(L["blocks"])
        title = "%d%s · %s · %s · English with Asya" % (unit, letter, L.get("topic", role), data["title"])
        h = re.sub(r"<title>.*?</title>", "<title>%s</title>" % title, head, count=1, flags=re.S)

        page = (h + '<body><div class="wrap">\n'
                '  <div class="scorebar">⭐ Счёт: <span id="sc">0</span> / <span id="tot">0</span></div>\n'
                '  <div class="top">'
                '<a class="home" href="%s-u%d.html">← Юнит</a>' % (course, unit)
                + '<a class="home alt" href="trainer.html?unit=sel-u%d">🎯 Тренажёр</a>' % unit
                + '<a class="home" href="%s-course.html">Все юниты</a></div>\n' % course
                + "  <h1>%d%s %s %s</h1>\n" % (unit, letter, emo, L.get("topic", role))
                + '  <div class="d">%s · %s</div>\n' % (data["title"], role)
                + "  " + "".join(nav) + "\n"
                + '  <div class="cando">✅ <b>Can-do:</b> %s</div>\n' % L.get("cando", "")
                + body_html
                + '  <div class="foot">Made for @english.with_asya · авторские материалы '
                  'по программе %s · %d%s</div>\n' % (data["title"], unit, letter)
                + "</div>\n")

        eng = engine
        eng = eng.replace('const HW={course:"%s",unit:%d}' % (course, unit),
                          'const HW={course:"%s",unit:%d,sub:"%d%s"}' % (course, unit, unit, letter))
        eng = eng.replace("section:sec,", 'section:(HW.sub?HW.sub+"-"+sec:sec),')
        # вставлять только в ПОСЛЕДНИЙ </script> — первые закрывают внешние
        # <script src=...>, и всё, что попадёт внутрь них, браузер игнорирует
        cut = eng.rfind("</script>")
        if cut < 0:
            raise SystemExit("не найден закрывающий </script> в движке")
        eng = eng[:cut] + HELPERS + js_blocks(L["blocks"]) + "\n</script>" + eng[cut + len("</script>"):]

        out = "%s-u%d%s.html" % (course, unit, letter.lower())
        open(out, "w", encoding="utf-8").write(page + eng)
        made.append(out)
    return made


def add_hub(course, unit, data):
    p = "%s-u%d.html" % (course, unit)
    s = open(p, encoding="utf-8").read()
    links = "".join(
        '<a class="subcard" href="%s-u%d%s.html"><b>%d%s</b><span>%s %s</span></a>'
        % (course, unit, k.lower(), unit, k,
           ROLE_EMO.get(v.get("role", ""), "📘"), v.get("topic", ""))
        for k, v in sorted(data["lessons"].items()))
    block = ('\n  <h2 id="subunits">🧭 Уроки юнита</h2>\n'
             '  <div class="subgrid">%s</div>\n' % links)
    if 'id="subunits"' in s:
        # обновляем только содержимое сетки, ничего вокруг не трогаем
        s = re.sub(r'(<div class="subgrid">)(?:(?!</div>).)*?(</div>)',
                   lambda m: m.group(1) + links + m.group(2), s, count=1, flags=re.S)
    else:
        s = re.sub(r'(<h2[^>]*>[^<]*Грамматика юнита</h2>)',
                   lambda m: block + m.group(1), s, count=1)
    if ".subgrid{" not in s:
        s = s.replace("</style>", EXTRA_CSS + "\n</style>")
    open(p, "w", encoding="utf-8").write(s)


if __name__ == "__main__":
    course = sys.argv[1] if len(sys.argv) > 1 else "solutions-el"
    which = sys.argv[2] if len(sys.argv) > 2 else "1"
    files = (sorted(glob.glob("lessons/%s-u*.json" % course)) if which == "all"
             else ["lessons/%s-u%s.json" % (course, which)])
    letters = ["A", "B", "C", "D", "E", "F", "G", "H"]
    total = 0
    for fp in files:
        if not os.path.exists(fp):
            print("  нет файла", fp); continue
        data = json.load(open(fp, encoding="utf-8"))
        u = data["unit"]
        made = build_unit(course, u, data, letters)
        add_hub(course, u, data)
        print("  u%d %s: %d подстраниц" % (u, data["title"], len(made)))
        total += len(made)
    print("Итого:", total)
