#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Превью курса одной страницей: все уроки, обе вкладки, картинки внутрь файла.

Собирает готовые страницы уроков в один самодостаточный HTML для показа
до публикации. Логирование в Supabase отключается, картинки встраиваются
как data URI, id уникализируются по уроку.

Запуск: python3 make-preview.py solutions-el 0 1 > /dev/null
        (результат — preview-<course>.html в корне)
"""
import re, sys, glob, os, base64

CONT = '/* ── содержимое урока ── */'


def inline_script(s):
    return re.findall(r'<script>(.*?)</script>', s, re.S)[-1]


def datauri(path):
    ext = os.path.splitext(path)[1].lstrip('.').replace('jpg', 'jpeg')
    with open(path, 'rb') as f:
        return "data:image/%s;base64,%s" % (ext, base64.b64encode(f.read()).decode())


def build(course, units):
    files = []
    for u in units:
        files += sorted(glob.glob('%s-u%s[a-h].html' % (course, u)))
    if not files:
        sys.exit("нет собранных уроков — сначала build-lessons.py")

    first = open(files[0], encoding='utf-8').read()
    css = re.search(r'<style>(.*?)</style>', first, re.S).group(1)
    sc = inline_script(first)
    engine = sc[:sc.find(CONT)]
    engine = re.sub(r'\(async function\(\)\{try\{if\(window\.SM.*?\}\)\(\);', '', engine, flags=re.S)
    engine = engine.replace(
        'function _log(sec,idx,question,answer,correct){if(!_LOGGED)return;',
        'function _log(sec,idx,question,answer,correct){if(true)return;')

    lessons = []
    for f in files:
        m = re.match(re.escape(course) + r'-u(\d)([a-h])\.html', f)
        unit, let = m.group(1), m.group(2).upper()
        key = "U%s%s" % (unit, let)
        s = open(f, encoding='utf-8').read()
        b, e = s.find('<body>'), s.find('<script src="https://cdn')
        body = s[b:e]
        body = re.sub(r'^<body><div class="wrap">', '', body).strip()
        body = re.sub(r'</div>\s*$', '', body)
        body = re.sub(r'<div class="scorebar">.*?</div>', '', body, flags=re.S)
        body = re.sub(r'<div class="top">.*?</div>\s*(?=<h1)', '', body, flags=re.S)
        body = re.sub(r'<div class="subnav">.*?</div>', '', body, flags=re.S)
        for src in set(re.findall(r'src="(img/[^"]+)"', body)):
            if os.path.exists(src):
                body = body.replace('src="%s"' % src, 'src="%s"' % datauri(src))
        tail = inline_script(s)
        tail = tail[tail.find(CONT):]
        # вырезаем внутренний обработчик вкладок — в превью он свой, со scope
        tail = re.sub(r"\ndocument\.querySelectorAll\('\.tab'\)\.forEach.*", '', tail, flags=re.S)
        body = re.sub(r'id="(b\d+)([_a-z]*)"',
                      lambda x: 'id="%s_%s%s"' % (key, x.group(1), x.group(2)), body)
        tail = re.sub(r'"(b\d+)"', lambda x: '"%s_%s"' % (key, x.group(1)), tail)
        tail = tail.replace('var _totF=document.getElementById("tot");if(_totF)_totF.textContent=tot;', '')
        for a, bb in (('id="pane-lesson"', 'id="pane-%s-lesson"' % key),
                      ('id="pane-wb"', 'id="pane-%s-wb"' % key),
                      ('data-p="lesson"', 'data-p="%s-lesson"' % key),
                      ('data-p="wb"', 'data-p="%s-wb"' % key)):
            body = body.replace(a, bb)
        lessons.append(dict(key=key, unit=unit, let=let, body=body, tail=tail))

    unit_names = {"0": "Introduction", "1": "Unit 1 · Family and friends",
                  "2": "Unit 2 · School days", "3": "Unit 3 · Style", "4": "Unit 4 · Food",
                  "5": "Unit 5 · In the city", "6": "Unit 6 · Going wild",
                  "7": "Unit 7 · Digital world", "8": "Unit 8 · Be active!",
                  "9": "Unit 9 · Home sweet home!"}

    out = ['<title>Solutions Elementary · превью курса</title>',
           '<link rel="preconnect" href="https://fonts.googleapis.com">',
           '<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700'
           '&family=Nunito:wght@600;700;800;900&display=swap" rel="stylesheet">',
           '<style>' + css + """
.pv{max-width:920px;margin:0 auto;padding:18px 16px 60px}
.pvhead{background:#7c2340;color:#fff;border-radius:20px;padding:18px 22px;margin-bottom:14px}
.pvhead h1{margin:0;font-family:'Fredoka',sans-serif;font-size:25px}
.pvhead p{margin:6px 0 0;font-weight:700;font-size:13.5px;opacity:.9}
.pvunit{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}
.pvu{flex:1;min-width:150px;border:2px solid #e3d3ba;background:#fff;color:#7c2340;cursor:pointer;
 font:900 14px 'Nunito',sans-serif;padding:11px;border-radius:14px;box-shadow:0 3px 0 #e3d3ba}
.pvu.on{background:#e0952a;border-color:#e0952a;color:#fff;box-shadow:0 3px 0 #b5751f}
.pvtabs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;position:sticky;top:0;z-index:30;
 background:#f4e9d8;padding:9px 0}
.pvtab{border:2px solid #e3d3ba;background:#fff;color:#7c2340;font:800 13px 'Nunito',sans-serif;
 padding:8px 13px;border-radius:999px;cursor:pointer}
.pvtab.on{background:#7c2340;border-color:#7c2340;color:#fff}
.pvtab.hide{display:none}
.pvpane{display:none}.pvpane.on{display:block}
.pvbar{background:#fff;border:2px solid #e3d3ba;border-radius:14px;padding:10px 16px;
 font:800 13.5px 'Nunito',sans-serif;color:#7c2340;margin-bottom:14px}
</style>"""]
    out.append('<div class="wrap pv">')
    out.append('<div class="pvhead"><h1>Solutions Elementary</h1><p>%s — превью перед публикацией</p></div>'
               % " &nbsp;|&nbsp; ".join(unit_names.get(u, "Unit " + u) for u in units))
    out.append('<div class="pvunit">' + ''.join(
        '<button class="pvu%s" data-u="%s">%s</button>' % (' on' if i == 0 else '', u, unit_names.get(u, u))
        for i, u in enumerate(units)) + '</div>')
    out.append('<div class="pvtabs">' + ''.join(
        '<button class="pvtab%s%s" data-t="%s" data-u="%s">%s%s</button>'
        % (' on' if i == 0 else '', ' hide' if L['unit'] != units[0] else '',
           L['key'], L['unit'], L['unit'], L['let'])
        for i, L in enumerate(lessons)) + '</div>')
    out.append('<div class="pvbar">⭐ Набрано: <span id="sc">0</span> / <span id="tot">0</span>'
               ' — задания рабочие: решай, слушай, нажимай 🔊</div>')
    for i, L in enumerate(lessons):
        out.append('<div class="pvpane%s" id="pane%s">\n%s\n</div>'
                   % (' on' if i == 0 else '', L['key'], L['body']))
    out.append('</div>\n<script>\n' + engine)
    for L in lessons:
        out.append(L['tail'])
    out.append("""
var _t=document.getElementById("tot"); if(_t)_t.textContent=tot;
function showLesson(k){
  document.querySelectorAll('.pvtab').forEach(function(x){x.classList.toggle('on',x.dataset.t===k);});
  document.querySelectorAll('.pvpane').forEach(function(x){x.classList.toggle('on',x.id==='pane'+k);});
  window.scrollTo({top:0,behavior:'smooth'});}
document.querySelectorAll('.pvtab').forEach(function(b){
  b.onclick=function(){speechSynthesis.cancel();showLesson(b.dataset.t);};});
document.querySelectorAll('.pvu').forEach(function(b){b.onclick=function(){
  speechSynthesis.cancel();
  document.querySelectorAll('.pvu').forEach(function(x){x.classList.remove('on');});
  b.classList.add('on');
  var first=null;
  document.querySelectorAll('.pvtab').forEach(function(t){
    var vis=t.dataset.u===b.dataset.u; t.classList.toggle('hide',!vis);
    if(vis&&!first)first=t.dataset.t;});
  if(first)showLesson(first);};});
document.querySelectorAll('.tab').forEach(function(b){b.onclick=function(){
  speechSynthesis.cancel();
  var scope=b.closest('.pvpane');
  scope.querySelectorAll('.tab').forEach(function(x){x.classList.remove('on');});
  scope.querySelectorAll('.pane').forEach(function(x){x.classList.remove('on');});
  b.classList.add('on');
  document.getElementById('pane-'+b.dataset.p).classList.add('on');
  window.scrollTo({top:0,behavior:'smooth'});};});
</script>""")
    html = "\n".join(out)
    p = "preview-%s.html" % course
    open(p, "w", encoding="utf-8").write(html)
    print("уроков: %d | картинок: %d | размер: %.2f МБ | %s"
          % (len(lessons), html.count('data:image/'), len(html.encode()) / 1048576, p))
    return p


if __name__ == "__main__":
    course = sys.argv[1] if len(sys.argv) > 1 else "solutions-el"
    units = sys.argv[2:] or ["0", "1"]
    build(course, units)
