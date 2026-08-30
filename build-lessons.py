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
    # построчный плеер
    ".lcimg{width:100%;display:block;border-radius:18px;box-shadow:0 6px 0 #e3d3ba;margin-bottom:12px;aspect-ratio:3/2;object-fit:cover}"
    ".pl{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:12px 0 4px}"
    ".plbtn{border:none;cursor:pointer;background:rgba(255,255,255,.18);color:#fff;"
    "font:800 15px 'Nunito',sans-serif;min-width:40px;height:40px;border-radius:12px}"
    ".plbtn:hover{background:rgba(255,255,255,.3)}"
    ".plbtn.main{background:#e0952a;min-width:52px;font-size:17px}"
    ".plbtn.wide{padding:0 14px;font-size:13px}"
    ".plpos{font:800 13px 'Nunito',sans-serif;color:#ffd27a;margin-left:4px;font-variant-numeric:tabular-nums}"
    ".plsp{display:inline-flex;align-items:center;gap:4px;font:800 12px 'Nunito',sans-serif;"
    "color:rgba(255,255,255,.75);margin-left:auto}"
    ".plrate{border:none;cursor:pointer;background:rgba(255,255,255,.18);color:#fff;"
    "font:800 12px 'Nunito',sans-serif;padding:6px 9px;border-radius:9px}"
    ".plrate.on{background:#e0952a}"
    ".pllines{display:flex;flex-direction:column;gap:4px;margin-top:10px}"
    ".pllines.hid{display:none}"
    ".plline{display:flex;gap:9px;align-items:baseline;text-align:left;cursor:pointer;border:none;"
    "background:rgba(255,255,255,.07);border-left:3px solid transparent;border-radius:10px;"
    "padding:9px 12px;color:#fff;font:700 14px 'Nunito',sans-serif;line-height:1.5}"
    ".plline:hover{background:rgba(255,255,255,.15)}"
    ".plline.on{background:rgba(255,255,255,.22);border-left-color:#ffd27a}"
    ".plwho{flex:none;font-weight:900;color:#ffd27a;font-size:12.5px;min-width:62px}"
    "@media(max-width:520px){.plline{flex-direction:column;gap:2px}.plwho{min-width:0}"
    ".plsp{margin-left:0;width:100%}}"
    # вкладки «Урок» / «Рабочая тетрадь»
    ".tabs{display:flex;gap:8px;margin:0 0 18px}"
    ".tab{flex:1;border:2px solid #e3d3ba;background:#fff;color:#7c2340;cursor:pointer;"
    "font:900 14.5px 'Nunito',sans-serif;padding:12px 16px;border-radius:14px;box-shadow:0 3px 0 #e3d3ba}"
    ".tab.on{background:#7c2340;border-color:#7c2340;color:#fff;box-shadow:0 3px 0 #4d1527}"
    ".pane{display:none}.pane.on{display:block}"
    ".wbintro{background:#fff7ea;border:2px dashed #e0952a;border-radius:14px;padding:11px 16px;"
    "font:800 13.5px 'Nunito',sans-serif;color:#5a4f47;margin-bottom:16px}"
    # связный текст с пропусками
    ".cloze .bank{background:#f6ede0;border-radius:10px;padding:9px 13px;margin-bottom:12px;"
    "font-size:13.5px;font-weight:700;color:#5a4f47}"
    ".clozetext{font-size:15.5px;line-height:2.5}"
    ".cin{min-width:0;width:auto;padding:5px 9px;font-size:14px;margin:0 2px}"
    # сортировка по группам
    ".pool{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}"
    ".ptoken{border:2px solid #e3d3ba;background:#fdfaf0;cursor:pointer;"
    "font:800 13.5px 'Nunito',sans-serif;padding:7px 12px;border-radius:10px}"
    ".ptoken.sel{border-color:#7c2340;background:#fff;box-shadow:0 0 0 3px rgba(124,35,64,.15)}"
    ".ptoken.ok{background:#c8efc0;border-color:#27ae60;cursor:default}"
    ".ptoken.bad{background:#ffc9c0;border-color:#c0392b}"
    ".sortcols{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}"
    ".sortcol{background:#fdfaf0;border:2px solid #eee3d2;border-radius:12px;padding:9px}"
    ".sorth{font:900 13px 'Nunito',sans-serif;color:#7c2340;margin-bottom:7px;text-align:center}"
    ".sortdrop{min-height:64px;display:flex;flex-wrap:wrap;gap:5px;align-content:flex-start;cursor:pointer}"
    # картинка урока
    ".lessonpic{margin:0 0 14px;background:#fff;border-radius:18px;padding:10px;box-shadow:0 4px 0 #e3d3ba}"
    ".lessonpic img{width:100%;display:block;border-radius:12px}"
    ".lessonpic figcaption{font:800 12.5px 'Nunito',sans-serif;color:#8a7a68;padding:9px 6px 3px;text-align:center}"
)


def esc(t):
    return (t or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def html_blocks(blocks, start=0):
    """HTML-часть: заголовки и контейнеры. Данные уходят в JS.

    `start` — с какого номера продолжать нумерацию контейнеров. Урок и
    рабочая тетрадь живут на одной странице, поэтому нумерация должна быть
    сквозной: иначе id совпадут и getElementById вернёт чужой контейнер.
    """
    out, n = [], start
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
            img = ('  <img class="lcimg" src="%s" alt="%s" loading="lazy">\n'
                   % (b["image"], b.get("image_alt", "")) if b.get("image") else "")
            out.append(sec + img + '  <div class="lc"><h3>%s</h3><p>%s</p>\n'
                       '    <div class="pl">\n'
                       '      <button class="plbtn main" id="%s_play">▶</button>\n'
                       '      <button class="plbtn" id="%s_prev" title="Предыдущая реплика">⏮</button>\n'
                       '      <button class="plbtn" id="%s_rep" title="Повторить эту реплику">↻</button>\n'
                       '      <button class="plbtn" id="%s_next" title="Следующая реплика">⏭</button>\n'
                       '      <span class="plpos" id="%s_pos">— / —</span>\n'
                       '      <span class="plsp">скорость'
                       '<button class="plrate" data-r="0.7">0.7×</button>'
                       '<button class="plrate on" data-r="0.85">0.85×</button>'
                       '<button class="plrate" data-r="1">1×</button></span>\n'
                       '      <button class="plbtn wide" id="%s_txt">📜 Текст</button>\n'
                       '    </div>\n'
                       '    <div class="pllines" id="%s_lines"></div>\n'
                       '  </div>\n'
                       '  <div id="%s" style="margin-top:14px"></div>\n'
                       % (b.get("h3", ""), b.get("intro", "Нажми ▶ или кликни на любую реплику, чтобы слушать с неё."),
                          bid, bid, bid, bid, bid, bid, bid, bid))
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
        elif t == "cloze":
            out.append(sec + (('  <div class="wbband">%s</div>\n' % note) if note else "")
                       + '  <div class="clozebox" id="%s"></div>\n' % bid)
        elif t == "sort":
            out.append(sec + (('  <div class="wbband">%s</div>\n' % note) if note else "")
                       + '  <div id="%s"></div>\n' % bid)
        elif t == "free":
            out.append(sec + '  <div class="hw">%s</div>\n' % b.get("html", ""))
        elif t == "image":
            out.append(sec + '  <figure class="lessonpic">\n'
                       '    <img src="%s" alt="%s" loading="lazy">\n'
                       % (b["src"], b.get("alt", ""))
                       + (('    <figcaption>%s</figcaption>\n' % b["caption"])
                          if b.get("caption") else "")
                       + '  </figure>\n')
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
        elif t == "cloze":
            js.append('SMrenderCloze(%s,%s,%s,%s);'
                      % (J(bid), J(b["parts"]), J(b.get("bank", [])), J(b.get("sec", "cloze"))))
        elif t == "sort":
            js.append('SMrenderSort(%s,%s,%s,%s);'
                      % (J(bid), J(b["groups"]), J(b["words"]), J(b.get("sec", "sort"))))
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
/* Варианты перемешиваются при каждой загрузке: иначе правильный ответ
   всегда стоит первым и задание проверяет память о порядке, а не язык. */
function SMshuffleOpts(t){
  if(!t||!Array.isArray(t.o)||typeof t.a!=="number")return t;
  var right=t.o[t.a], opts=shuffle(t.o);
  return {q:t.q,o:opts,a:opts.indexOf(right)};}
function SMrenderMC(id,items,sec){var box=SMel(id);if(!box||!items)return;
  items.forEach(function(t,i){box.appendChild(mcCard(SMshuffleOpts(t),i+1,sec));});}
/* Своя проверка вписанного ответа. Базовая сравнивает строки буквально,
   поэтому точка в конце, кривой апостроф или двойной пробел засчитываются
   как ошибка — ученик получает «неверно» за верный ответ. */
var SM_CONTR=[[/\bdon't\b/g,"do not"],[/\bdoesn't\b/g,"does not"],
  [/\bdidn't\b/g,"did not"],[/\bisn't\b/g,"is not"],[/\baren't\b/g,"are not"],
  [/\bwasn't\b/g,"was not"],[/\bweren't\b/g,"were not"],[/\bhaven't\b/g,"have not"],
  [/\bhasn't\b/g,"has not"],[/\bcan't\b/g,"cannot"],
  [/\bwon't\b/g,"will not"],[/\bshouldn't\b/g,"should not"],
  [/\bi'm\b/g,"i am"],[/\byou're\b/g,"you are"],[/\bwe're\b/g,"we are"],
  [/\bthey're\b/g,"they are"],[/\bhe's\b/g,"he is"],[/\bshe's\b/g,"she is"],
  [/\bit's\b/g,"it is"],[/\bi've\b/g,"i have"],[/\byou've\b/g,"you have"],
  [/\bwe've\b/g,"we have"],[/\bthey've\b/g,"they have"]];
function SMnorm(s){
  var v=(s||"").toLowerCase()
    .replace(/[‘’ʼ`]/g,"'")
    .replace(/[–—]/g,"-")
    .replace(/ /g," ")
    .replace(/[.!?;,]+$/,"")
    .replace(/\s+/g," ").trim();
  SM_CONTR.forEach(function(p){v=v.replace(p[0],p[1]);});
  return v.replace(/\s+/g," ").trim();}
function SMgapCard(t,n,sec){
  tot++;var gi=++_GI;var d=document.createElement("div");d.className="card";
  d.innerHTML='<div class="q"><span class="n">'+n+'.</span>'+t.q+'</div>'+
    '<div class="gaprow"><input class="gap-in" placeholder="впиши ответ…">'+
    '<button class="chk">Проверить</button></div><div class="ans"></div>';
  var inp=d.querySelector(".gap-in"),btn=d.querySelector(".chk"),an=d.querySelector(".ans");
  var done=false,logged=false,tries=0;
  function check(){if(done)return;
    var raw=inp.value.trim(), v=SMnorm(raw);
    var ok=t.a.some(function(x){return SMnorm(x)===v;});
    if(!logged){logged=true;_log(sec||"gap",gi,t.q,raw,ok);}
    if(ok){inp.classList.remove("bad");inp.classList.add("ok");done=true;
      inp.disabled=true;btn.disabled=true;an.style.display="none";bump();}
    else{tries++;inp.classList.add("bad");an.style.display="block";
      an.textContent=tries<2?"Не совсем. Попробуй ещё раз."
                            :"Подсказка: "+t.a[0];}}
  btn.onclick=check;
  inp.addEventListener("keydown",function(e){if(e.key==="Enter")check();});
  inp.addEventListener("input",function(){inp.classList.remove("bad");});
  return d;}
function SMrenderGap(id,items,sec){var box=SMel(id);if(!box||!items)return;
  items.forEach(function(t,i){box.appendChild(SMgapCard(t,i+1,sec));});}
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
/* Построчный плеер: клик по реплике — слушать с неё, шаг назад/вперёд,
   повтор строки, скорость. Перемотки по секундам нет: речь синтезируется
   браузером на лету, таймлайна у неё не существует. */
function SMrenderListen(id,script,qs,sec){
  var box=SMel(id+"_lines"),pos=SMel(id+"_pos");
  if(!box)return SMrenderMC(id,qs,sec);
  var idx=-1,playing=false,rate=0.85,names={};
  var order=[];script.forEach(function(l){if(order.indexOf(l[0])<0)order.push(l[0]);});
  script.forEach(function(l,i){
    var d=document.createElement("button");d.className="plline";d.dataset.i=i;
    var who=l[2]||("Speaker "+(order.indexOf(l[0])+1));
    d.innerHTML='<span class="plwho">'+who+'</span><span class="pltxt">'+l[1]+'</span>';
    d.onclick=function(){play(i);};box.appendChild(d);});
  var lines=box.querySelectorAll(".plline");
  function mark(i){lines.forEach(function(x,k){x.classList.toggle("on",k===i);});
    if(pos)pos.textContent=(i<0?"—":(i+1))+" / "+script.length;
    if(i>=0&&lines[i])lines[i].scrollIntoView({block:"nearest"});}
  function speak(i,then){
    var l=script[i],u=new SpeechSynthesisUtterance(l[1]),st=speakerStyle(l[0]);
    if(st.voice){u.voice=st.voice;u.lang=st.voice.lang;}else u.lang="en-GB";
    u.rate=rate*(st.rate||1);u.pitch=st.pitch||1;
    u.onend=function(){if(then)then();};
    speechSynthesis.speak(u);}
  function play(i){speechSynthesis.cancel();idx=i;playing=true;setBtn();mark(idx);
    (function step(){
      if(!playing||idx>=script.length){playing=false;setBtn();mark(-1);return;}
      var cur=idx;mark(cur);
      speak(cur,function(){if(!playing||idx!==cur)return;idx=cur+1;
        setTimeout(step,320);});})();}
  function setBtn(){var p=SMel(id+"_play");if(p)p.textContent=playing?"⏸":"▶";}
  var pb=SMel(id+"_play");
  if(pb)pb.onclick=function(){
    if(playing){playing=false;speechSynthesis.cancel();setBtn();}
    else play(idx<0||idx>=script.length?0:idx);};
  var pv=SMel(id+"_prev");if(pv)pv.onclick=function(){play(Math.max(0,(idx<0?0:idx)-1));};
  var nx=SMel(id+"_next");if(nx)nx.onclick=function(){play(Math.min(script.length-1,(idx<0?-1:idx)+1));};
  var rp=SMel(id+"_rep");if(rp)rp.onclick=function(){play(idx<0?0:idx);};
  var tx=SMel(id+"_txt");if(tx)tx.onclick=function(){box.classList.toggle("hid");};
  var wrap=box.parentNode;
  wrap.querySelectorAll(".plrate").forEach(function(b){b.onclick=function(){
    wrap.querySelectorAll(".plrate").forEach(function(x){x.classList.remove("on");});
    b.classList.add("on");rate=parseFloat(b.dataset.r);
    if(playing)play(idx<0?0:idx);};});
  mark(-1);
  SMrenderMC(id,qs,sec);}
/* Связный текст с пропусками: parts — куски текста, между ними поля.
   Каждый пропуск: {a:["варианты"], hint:"подсказка в скобках"} */
function SMrenderCloze(id,parts,bank,sec){var box=SMel(id);if(!box)return;
  var gi=++_GI, wrap=document.createElement("div");wrap.className="card cloze";
  if(bank&&bank.length){var bb=document.createElement("div");bb.className="bank";
    bb.innerHTML='<b>Слова:</b> '+bank.join(" · ");wrap.appendChild(bb);}
  var p=document.createElement("div");p.className="clozetext";
  parts.forEach(function(seg,i){
    if(typeof seg==="string"){p.appendChild(document.createTextNode(seg));return;}
    tot++;
    var inp=document.createElement("input");inp.className="gap-in cin";
    inp.placeholder=seg.hint||"…";inp.size=Math.max(6,(seg.a[0]||"").length+2);
    var done=false,logged=false;
    function chk(){if(done)return;var raw=inp.value.trim();var v=SMnorm(raw);
      var ok=seg.a.some(function(x){return SMnorm(x)===v;});
      if(!logged){logged=true;_log(sec,gi,seg.hint||("gap"+i),raw,ok);}
      if(ok){inp.classList.remove("bad");inp.classList.add("ok");inp.disabled=true;done=true;bump();}
      else{inp.classList.add("bad");inp.title="Подсказка: "+seg.a[0];}}
    inp.addEventListener("blur",chk);
    inp.addEventListener("keydown",function(e){if(e.key==="Enter")chk();});
    p.appendChild(inp);});
  wrap.appendChild(p);
  var b=document.createElement("button");b.className="chk";b.textContent="Проверить всё";
  b.onclick=function(){wrap.querySelectorAll(".cin").forEach(function(x){
    if(!x.disabled){x.blur();var ev=new Event("blur");x.dispatchEvent(ev);}});};
  wrap.appendChild(b);box.appendChild(wrap);}
/* Сортировка слов по группам (например, по звуку) */
function SMrenderSort(id,groups,words,sec){var box=SMel(id);if(!box)return;
  var gi=++_GI, card=document.createElement("div");card.className="card";
  var pool=document.createElement("div");pool.className="pool";
  var cols=document.createElement("div");cols.className="sortcols";
  var sel=null;
  groups.forEach(function(g,gi2){
    var c=document.createElement("div");c.className="sortcol";
    c.innerHTML='<div class="sorth">'+g.label+'</div>';
    var drop=document.createElement("div");drop.className="sortdrop";drop.dataset.g=gi2;
    drop.onclick=function(){if(!sel)return;
      var w=sel.textContent, ok=(g.words.indexOf(w)>=0);
      _log(sec,gi,"sort:"+w,g.label,ok);
      if(ok){sel.classList.add("ok");sel.disabled=true;drop.appendChild(sel);sel=null;bump();}
      else{sel.classList.add("bad");var s2=sel;setTimeout(function(){s2.classList.remove("bad");},450);}};
    c.appendChild(drop);cols.appendChild(c);});
  shuffle(words).forEach(function(w){tot++;
    var b=document.createElement("button");b.className="ptoken";b.textContent=w;
    b.onclick=function(){if(b.disabled)return;
      pool.querySelectorAll(".ptoken").forEach(function(x){x.classList.remove("sel");});
      b.classList.add("sel");sel=b;};pool.appendChild(b);});
  card.appendChild(pool);card.appendChild(cols);box.appendChild(card);}
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

        lesson_blocks = L["blocks"]
        wb_blocks = L.get("workbook", [])
        if wb_blocks:
            body_html = (
                '  <div class="tabs">'
                '<button class="tab on" data-p="lesson">📘 Урок</button>'
                '<button class="tab" data-p="wb">📒 Рабочая тетрадь</button></div>\n'
                '  <div class="pane on" id="pane-lesson">\n' + html_blocks(lesson_blocks) +
                '  </div>\n  <div class="pane" id="pane-wb">\n'
                '  <div class="wbintro">Задания к уроку %d%s. Реши здесь — результат увидит учитель.</div>\n'
                % (unit, letter)
                + html_blocks(wb_blocks, start=len(lesson_blocks)) + '  </div>\n')
        else:
            body_html = html_blocks(lesson_blocks)
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
        tabs_js = ("""
document.querySelectorAll('.tab').forEach(function(b){b.onclick=function(){
  speechSynthesis.cancel();
  document.querySelectorAll('.tab').forEach(function(x){x.classList.remove('on');});
  document.querySelectorAll('.pane').forEach(function(x){x.classList.remove('on');});
  b.classList.add('on');document.getElementById('pane-'+b.dataset.p).classList.add('on');
  window.scrollTo({top:0,behavior:'smooth'});};});""" if wb_blocks else "")
        eng = (eng[:cut] + HELPERS + js_blocks(lesson_blocks + wb_blocks) + tabs_js
               + "\n</script>" + eng[cut + len("</script>"):])

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
