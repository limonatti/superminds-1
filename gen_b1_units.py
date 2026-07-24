# -*- coding: utf-8 -*-
# Генератор уроков Speakout B1 по единому шаблону (как B1+).
# Данные каждого юнита — в DATA; вёрстка/движок — в TEMPLATE. Префикс: speakout-b1-uN.html
import json

RENDER = r'''const wbox=document.getElementById("words");
WORDS.forEach(w=>{const d=document.createElement("div");d.className="word";
  d.innerHTML='<button>🔊</button><div><div class="en">'+w[0]+'</div><div class="tr">'+w[1]+'</div></div>';
  d.querySelector("button").onclick=()=>say(w[0]);wbox.appendChild(d);});
/* Голосовой движок: приоритет живых голосов (Edge natural / Google / premium), выбор пола */
let SM_VOICES=[];
function SM_loadVoices(){try{SM_VOICES=speechSynthesis.getVoices()||[];}catch(e){SM_VOICES=[];}}
SM_loadVoices();try{speechSynthesis.onvoiceschanged=SM_loadVoices;}catch(e){}
const _FEM=["female","zira","jenny","aria","samantha","sonia","libby","hazel","karen","victoria","susan","ava","emma","joanna","salli","serena","kate"];
const _MAL=["male","david","daniel","guy","ryan","george","alex","fred","brian","matthew","oliver","james","arthur","aaron","nathan","tom"];
function enVoice(g){
  const list=SM_VOICES.length?SM_VOICES:(speechSynthesis.getVoices()||[]);
  let best=null,bs=-1;
  list.forEach(v=>{
    const n=(v.name||"").toLowerCase(),lang=(v.lang||"").replace("_","-");
    if(lang.slice(0,2)!=="en")return;
    let s=0;if(lang==="en-GB")s+=20;else if(lang==="en-US")s+=15;
    const fem=_FEM.some(x=>n.indexOf(x)>=0);
    const nm=n.replace(/female/g,"");const mal=_MAL.some(x=>nm.indexOf(x)>=0);
    if(g==="f"&&fem)s+=25;if(g==="m"&&mal)s+=25;
    if(g==="f"&&mal&&!fem)s-=20;if(g==="m"&&fem&&!mal)s-=20;
    if(n.indexOf("natural")>=0||n.indexOf("neural")>=0)s+=30;
    if(n.indexOf("google")>=0)s+=20;
    if(n.indexOf("premium")>=0||n.indexOf("enhanced")>=0)s+=15;
    if(n.indexOf("compact")>=0)s-=15;
    if(s>bs){bs=s;best=v;}
  });
  return best;
}
function say(t,voice,rate){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);const v=voice||enVoice("f");if(v){u.voice=v;u.lang=v.lang;}else u.lang="en-GB";u.rate=rate||0.95;u.pitch=1;speechSynthesis.speak(u);}
document.getElementById("lplay").onclick=()=>{
  speechSynthesis.cancel();
  const mv=enVoice("m"),fv=enVoice("f");
  DIALOG.forEach(([who,line])=>{const u=new SpeechSynthesisUtterance(line);const v=(who==="m")?mv:fv;if(v){u.voice=v;u.lang=v.lang;}else u.lang="en-GB";u.rate=0.95;u.pitch=1;speechSynthesis.speak(u);});
};
document.getElementById("lstop").onclick=()=>speechSynthesis.cancel();
document.getElementById("lscript").onclick=()=>{const s=document.getElementById("script");s.style.display=s.style.display==="block"?"none":"block";};
let sc=0,tot=0;
function bump(){sc++;document.getElementById("sc").textContent=sc;}
function mcCard(t,n){tot++;const d=document.createElement("div");d.className="card";
  d.innerHTML='<div class="q"><span class="n">'+n+'.</span>'+t.q+'</div><div class="opts">'+t.o.map(o=>'<button class="opt">'+o+'</button>').join("")+'</div>';
  let done=false;
  d.querySelectorAll(".opt").forEach((b,i)=>b.onclick=()=>{if(done)return;
    if(i===t.a){b.classList.add("ok");done=true;d.querySelectorAll(".opt").forEach(x=>x.disabled=true);bump();}
    else{b.classList.add("bad");b.disabled=true;}});
  return d;}
function gapCard(t,n){tot++;const d=document.createElement("div");d.className="card";
  d.innerHTML='<div class="q"><span class="n">'+n+'.</span>'+t.q+'</div><div class="gaprow"><input class="gap-in" placeholder="впиши ответ…"><button class="chk">Проверить</button></div><div class="ans"></div>';
  const inp=d.querySelector(".gap-in"),btn=d.querySelector(".chk"),an=d.querySelector(".ans");let done=false;
  function check(){if(done)return;const v=inp.value.trim().toLowerCase().replace(/\s+/g," ");
    if(t.a.some(x=>x.toLowerCase()===v)){inp.classList.remove("bad");inp.classList.add("ok");done=true;inp.disabled=true;btn.disabled=true;bump();}
    else{inp.classList.add("bad");an.style.display="block";an.textContent="Подсказка: "+t.a[0];}}
  btn.onclick=check;inp.addEventListener("keydown",e=>{if(e.key==="Enter")check();});
  return d;}
const lq=document.getElementById("lq");LQ.forEach((t,i)=>lq.appendChild(mcCard(t,i+1)));
const ex=document.getElementById("ex");EX.forEach((t,i)=>ex.appendChild(mcCard(t,i+1)));GAPS.forEach((t,i)=>ex.appendChild(gapCard(t,EX.length+i+1)));
const fx=document.getElementById("fx");FX.forEach((t,i)=>fx.appendChild(mcCard(t,i+1)));
const wb=document.getElementById("wb");WBMC.forEach((t,i)=>wb.appendChild(mcCard(t,i+1)));WBGAPS.forEach((t,i)=>wb.appendChild(gapCard(t,WBMC.length+i+1)));
document.getElementById("tot").textContent=tot;'''

TEMPLATE = r'''<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Unit @@NUM@@ · @@TITLE@@ · Speakout B1 · English with Asya</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@600;700;800;900&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box}
  body{margin:0;background:#f4e9d8;font-family:'Nunito',sans-serif;color:#1c1310;min-height:100vh}
  a{color:inherit;text-decoration:none}
  .wrap{max-width:860px;margin:0 auto;padding:24px 18px 70px}
  .top{display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap}
  .home{background:#7c2340;color:#fff;font:800 13px 'Nunito',sans-serif;padding:9px 16px;border-radius:999px}
  .home.alt{background:#e0952a}
  .hero{background:#fff;border-radius:26px;overflow:hidden;box-shadow:0 8px 0 #e3d3ba;margin-bottom:22px}
  .hcover{width:100%;aspect-ratio:3/2;display:flex;align-items:center;justify-content:center;position:relative}
  .hcover span{font-size:clamp(70px,18vw,130px);filter:drop-shadow(0 6px 10px rgba(0,0,0,.28))}
  .hero .hb{padding:18px 22px}
  .hero h1{margin:0;font-family:'Fredoka',sans-serif;font-size:clamp(26px,5vw,38px);color:#7c2340}
  .hero .d{font-weight:800;font-size:14px;color:#5a4f47;margin-top:6px}
  h2{font-family:'Fredoka',sans-serif;font-size:24px;color:#7c2340;margin:30px 4px 12px}
  .card{background:#fff;border-radius:18px;padding:16px 20px;box-shadow:0 4px 0 #e3d3ba;margin-bottom:12px}
  .g-ex{background:#fdfaf0;border-left:4px solid #7c2340;border-radius:10px;padding:10px 14px;margin:8px 0;font-size:14.5px}
  .g-ex b{color:#7c2340}
  .ru{color:#8a7a68;font-size:13px}
  .gt{color:#7c2340;font-size:16px;font-weight:900}
  table{border-collapse:collapse;width:100%;font-size:14px;margin-top:10px}
  td,th{border:2px solid #eee3d2;padding:8px 10px;text-align:left}
  th{background:#f6ede0;color:#7c2340}
  .words{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  @media(max-width:620px){.words{grid-template-columns:1fr}}
  .word{display:flex;align-items:center;gap:10px;background:#fff;border-radius:14px;padding:10px 14px;box-shadow:0 3px 0 #e3d3ba}
  .word button{border:none;cursor:pointer;background:#f6ede0;border-radius:50%;width:36px;height:36px;font-size:16px;flex:none}
  .word .en{font-weight:900;font-size:15px}
  .word .tr{font-size:12.5px;color:#8a7a68;font-weight:700}
  .lc{background:#7c2340;border-radius:22px;padding:20px 22px;color:#fff;box-shadow:0 6px 0 #4d1527}
  .lc h3{margin:0 0 6px;font-family:'Fredoka',sans-serif;font-size:20px}
  .lc p{margin:4px 0 12px;font-weight:700;font-size:13.5px;opacity:.9}
  .lbtn{border:none;cursor:pointer;background:#e0952a;color:#fff;font:800 14px 'Nunito',sans-serif;padding:11px 20px;border-radius:999px;margin-right:8px}
  .lbtn.sec{background:rgba(255,255,255,.18)}
  #script{display:none;background:rgba(255,255,255,.1);border-radius:12px;padding:12px 16px;margin-top:12px;font-size:14px;line-height:1.65}
  #script b{color:#ffd27a}
  .q{font-weight:800;font-size:15.5px;margin-bottom:10px}
  .q .n{color:#b5654a;margin-right:6px}
  .opts{display:flex;flex-wrap:wrap;gap:8px}
  .opt{border:2px solid #e3d3ba;background:#fdfaf0;cursor:pointer;font:800 14px 'Nunito',sans-serif;padding:9px 16px;border-radius:12px}
  .opt.ok{background:#c8efc0;border-color:#27ae60;color:#1b5e20}
  .opt.bad{background:#ffc9c0;border-color:#c0392b;color:#7b190d}
  .opt:disabled{cursor:default;opacity:.85}
  .gaprow{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  .gap-in{border:2px solid #e3d3ba;border-radius:12px;padding:9px 12px;font:800 14px 'Nunito',sans-serif;min-width:170px;background:#fdfaf0;outline:none}
  .gap-in.ok{background:#c8efc0;border-color:#27ae60}
  .gap-in.bad{background:#ffc9c0;border-color:#c0392b}
  .chk{border:none;cursor:pointer;background:#e0952a;color:#fff;font:800 13px 'Nunito',sans-serif;padding:10px 16px;border-radius:12px}
  .ans{font-weight:800;font-size:13px;color:#27632a;margin-top:8px;display:none}
  .scorebar{position:sticky;top:0;z-index:10;background:#7c2340;color:#fff;border-radius:0 0 16px 16px;padding:10px 18px;font-weight:900;font-size:14px;margin:-24px -18px 18px;box-shadow:0 4px 10px rgba(0,0,0,.15)}
  .hw{background:#fff7ea;border:2px dashed #e0952a;border-radius:18px;padding:16px 20px;font-size:14.5px}
  .wbband{background:#fff;border:2px solid #7c2340;border-radius:18px;padding:12px 18px;font-weight:800;font-size:13.5px;color:#5a4f47;margin-bottom:12px}
  .foot{text-align:center;font-weight:700;font-size:13px;color:#8a7a68;margin-top:44px}
</style>
</head>
<body>
<div class="wrap">
  <div class="scorebar">⭐ Счёт: <span id="sc">0</span> / <span id="tot">0</span></div>
  <div class="top">
    <a class="home" href="speakout-b1-course.html">← Все юниты</a>
    <a class="home alt" href="speakout-b1.html">🎯 Тренажёр</a>
    <a class="home" href="index.html">🏠 Домой</a>
  </div>

  <div class="hero">
    <div class="hcover" style="background:linear-gradient(135deg,@@GRADA@@,@@GRADB@@)"><span>@@EMOJI@@</span></div>
    <div class="hb">
      <h1>Unit @@NUM@@ · @@TITLE@@</h1>
      <div class="d">📚 @@DESC@@</div>
    </div>
  </div>

  <h2>📖 Грамматика юнита</h2>
@@GRAMMAR@@

  <h2>🔤 Слова юнита <span style="font-size:13px;color:#8a7a68">(нажми 🔊 и повтори)</span></h2>
  <div class="words" id="words"></div>

  <h2>🎧 Аудирование</h2>
  <div class="lc">
    <h3>@@LISTEN_TITLE@@</h3>
    <p>Послушай диалог (озвучивается прямо в браузере), потом ответь на вопросы. Слушай сколько угодно раз.</p>
    <button class="lbtn" id="lplay">▶ Слушать</button>
    <button class="lbtn sec" id="lstop">⏹ Стоп</button>
    <button class="lbtn sec" id="lscript">📜 Показать текст</button>
    <div id="script">@@SCRIPT@@</div>
  </div>
  <div id="lq" style="margin-top:14px"></div>

  <h2>✏️ Упражнения</h2>
  <div id="ex"></div>

  <h2>@@HOWTO_TITLE@@</h2>
  <div class="card">
@@HOWTO@@
  </div>
  <div id="fx"></div>

  <h2>📝 Workbook · закрепление</h2>
  <div class="wbband">Дополнительная практика по темам рабочей тетради этого юнита. Сначала реши здесь — потом сверься с бумажной Workbook.</div>
  <div id="wb"></div>

  <h2>🏠 Домашнее задание</h2>
  <div class="hw">@@HW@@</div>

  <div class="foot">Made for @english.with_asya · авторские материалы по программе Speakout 3rd ed. B1 · Unit @@NUM@@</div>
</div>
<script>
@@DATA@@
@@RENDER@@
</script>
</body>
</html>
'''

def script_html(dialog, names):
    parts=[]
    for who,line in dialog:
        parts.append('<b>%s:</b> %s' % (names[who], line))
    return '<br>\n      '.join(parts)

def grammar_html(cards):
    out=[]
    for c in cards:
        out.append('  <div class="card">\n    <span class="gt">%s</span>\n%s\n  </div>' % (c['t'], c['h']))
    return '\n'.join(out)

def data_js(u):
    def j(x): return json.dumps(x, ensure_ascii=False)
    lines=[]
    lines.append('const WORDS=%s;' % j(u['words']))
    lines.append('const DIALOG=%s;' % j(u['dialog']))
    lines.append('const LQ=%s;' % j(u['lq']))
    lines.append('const EX=%s;' % j(u['ex']))
    lines.append('const GAPS=%s;' % j(u['gaps']))
    lines.append('const FX=%s;' % j(u['fx']))
    lines.append('const WBMC=%s;' % j(u['wbmc']))
    lines.append('const WBGAPS=%s;' % j(u['wbgaps']))
    return '\n'.join(lines)

from b1_data import DATA  # noqa

for u in DATA:
    html=TEMPLATE
    html=html.replace('@@NUM@@', str(u['n']))
    html=html.replace('@@TITLE@@', u['title'])
    html=html.replace('@@EMOJI@@', u['emoji'])
    html=html.replace('@@DESC@@', u['desc'])
    html=html.replace('@@GRADA@@', u['grad'][0])
    html=html.replace('@@GRADB@@', u['grad'][1])
    html=html.replace('@@GRAMMAR@@', grammar_html(u['grammar']))
    html=html.replace('@@LISTEN_TITLE@@', u['listen_title'])
    html=html.replace('@@SCRIPT@@', script_html(u['dialog'], u['names']))
    html=html.replace('@@HOWTO_TITLE@@', u['howto_title'])
    html=html.replace('@@HOWTO@@', u['howto'])
    html=html.replace('@@HW@@', u['hw'])
    html=html.replace('@@DATA@@', data_js(u))
    html=html.replace('@@RENDER@@', RENDER)
    fn='speakout-b1-u%d.html' % u['n']
    open(fn,'w',encoding='utf-8').write(html)
    print('wrote', fn)
