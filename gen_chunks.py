# -*- coding: utf-8 -*-
# Тренажёр слов и выражений (чанков) для уровня. Запуск: python3 gen_chunks.py b1_data
import json, sys, importlib

PAGE = r'''<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Тренажёр чанков · Speakout @@LEVEL@@ · English with Asya</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@600;700;800;900&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box}
  body{margin:0;background:#f4e9d8;font-family:'Nunito',sans-serif;color:#1c1310;min-height:100vh}
  a{color:inherit;text-decoration:none}
  .wrap{max-width:720px;margin:0 auto;padding:24px 18px 70px}
  .top{display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap}
  .home{background:#7c2340;color:#fff;font:800 13px 'Nunito',sans-serif;padding:9px 16px;border-radius:999px}
  .home.alt{background:#e0952a}
  h1{font-family:'Fredoka',sans-serif;color:#7c2340;font-size:clamp(24px,5vw,34px);margin:6px 4px 4px}
  .sub{font-weight:800;font-size:14px;color:#5a4f47;margin:0 4px 16px}
  .bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:14px}
  .seg{display:inline-flex;background:#fff;border-radius:999px;box-shadow:0 3px 0 #e3d3ba;overflow:hidden}
  .seg button{border:none;background:none;cursor:pointer;font:800 13px 'Nunito',sans-serif;padding:9px 16px;color:#7c2340}
  .seg button.on{background:#7c2340;color:#fff}
  select{border:2px solid #e3d3ba;border-radius:999px;padding:8px 14px;font:800 13px 'Nunito',sans-serif;background:#fff;color:#7c2340;outline:none}
  .count{font-weight:800;font-size:13px;color:#8a7a68;margin-left:auto}
  /* карточка */
  .flash{background:#fff;border-radius:22px;box-shadow:0 8px 0 #e3d3ba;padding:36px 24px;text-align:center;min-height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;user-select:none}
  .flash .en{font-family:'Fredoka',sans-serif;font-size:clamp(24px,6vw,34px);color:#7c2340}
  .flash .ru{font-size:20px;color:#1c1310;font-weight:800}
  .flash .hint{font-size:12px;color:#b0a290;font-weight:700;margin-top:14px}
  .flash .u{position:relative;top:-10px;font-size:11px;color:#b5654a;font-weight:900;letter-spacing:1px}
  .row{display:flex;gap:10px;justify-content:center;margin-top:14px;flex-wrap:wrap}
  .btn{border:none;cursor:pointer;border-radius:999px;font:800 14px 'Nunito',sans-serif;padding:11px 18px}
  .btn.p{background:#7c2340;color:#fff}
  .btn.a{background:#e0952a;color:#fff}
  .btn.s{background:#fff;color:#7c2340;box-shadow:0 3px 0 #e3d3ba}
  /* квиз */
  .q{font-family:'Fredoka',sans-serif;font-size:24px;color:#7c2340;text-align:center;margin:8px 0 16px}
  .opts{display:grid;gap:10px}
  .opt{border:2px solid #e3d3ba;background:#fff;cursor:pointer;font:800 15px 'Nunito',sans-serif;padding:14px 16px;border-radius:14px;text-align:left}
  .opt.ok{background:#c8efc0;border-color:#27ae60;color:#1b5e20}
  .opt.bad{background:#ffc9c0;border-color:#c0392b;color:#7b190d}
  .score{background:#7c2340;color:#fff;border-radius:14px;padding:10px 16px;font-weight:900;text-align:center;margin-bottom:12px}
  .foot{text-align:center;font-weight:700;font-size:13px;color:#8a7a68;margin-top:40px}
</style>
</head>
<body>
<div class="wrap">
  <div class="top">
    <a class="home" href="@@HUB@@">← Все юниты</a>
    <a class="home alt" href="@@TRAINER@@">🎯 Тренажёр</a>
    <a class="home" href="index.html">🏠 Домой</a>
  </div>
  <h1>🧩 Тренажёр чанков · @@LEVEL@@</h1>
  <div class="sub">Слова и выражения целиком — учи фразой, а не по словам</div>
  <div class="bar">
    <div class="seg" id="mode">
      <button data-m="learn" class="on">📚 Учить</button>
      <button data-m="quiz">🎯 Квиз</button>
    </div>
    <select id="unit"></select>
    <span class="count" id="count"></span>
  </div>
  <div id="view"></div>
  <div class="foot">Made for @english.with_asya · авторские материалы по программе Speakout 3rd ed. @@LEVEL@@</div>
</div>
<script src="sm-voice.js"></script>
<script>
const DECK=@@DECK@@;
let mode="learn", unit="all", pool=[], idx=0, flipped=false;
const $=s=>document.querySelector(s);
function speak(t){ if(window.SM_speak) SM_speak(t,0.95); }
function units(){const s=new Set(DECK.map(d=>d.u));return [...s].sort((a,b)=>a-b);}
function build(){
  const sel=$("#unit");
  sel.innerHTML='<option value="all">Все юниты</option>'+units().map(u=>'<option value="'+u+'">Unit '+u+'</option>').join("");
  sel.onchange=()=>{unit=sel.value;refresh();};
  document.querySelectorAll("#mode button").forEach(b=>b.onclick=()=>{
    document.querySelectorAll("#mode button").forEach(x=>x.classList.remove("on"));
    b.classList.add("on");mode=b.dataset.m;refresh();});
  refresh();
}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function refresh(){
  pool=DECK.filter(d=>unit==="all"||d.u==+unit);
  pool=shuffle(pool);idx=0;flipped=false;
  $("#count").textContent=pool.length+" карточек";
  if(mode==="learn")renderLearn();else renderQuiz();
}
function renderLearn(){
  const d=pool[idx];
  $("#view").innerHTML=
   '<div class="flash" id="fl"><div class="u">UNIT '+d.u+'</div>'+
   '<div class="en">'+d.en+'</div>'+
   '<div class="ru" style="display:none">'+d.ru+'</div>'+
   '<div class="hint">нажми, чтобы перевернуть</div></div>'+
   '<div class="row">'+
   '<button class="btn s" id="prev">← Назад</button>'+
   '<button class="btn a" id="say">🔊 Слушать</button>'+
   '<button class="btn p" id="next">Дальше →</button>'+
   '</div>';
  const fl=$("#fl"),en=fl.querySelector(".en"),ru=fl.querySelector(".ru"),hint=fl.querySelector(".hint");
  fl.onclick=()=>{flipped=!flipped;ru.style.display=flipped?"block":"none";en.style.display=flipped?"none":"block";hint.textContent=flipped?d.en:"нажми, чтобы перевернуть";};
  $("#say").onclick=e=>{e.stopPropagation();speak(d.en);};
  $("#prev").onclick=()=>{idx=(idx-1+pool.length)%pool.length;flipped=false;renderLearn();};
  $("#next").onclick=()=>{idx=(idx+1)%pool.length;flipped=false;renderLearn();};
  speak(d.en);
}
let sc=0,seen=0;
function renderQuiz(){sc=0;seen=0;nextQ();}
function nextQ(){
  if(idx>=pool.length){$("#view").innerHTML='<div class="score">Готово! Счёт: '+sc+' / '+pool.length+'</div><div class="row"><button class="btn p" id="again">Ещё раз</button></div>';$("#again").onclick=refresh;return;}
  const d=pool[idx];
  const others=shuffle(DECK.filter(x=>x.ru!==d.ru)).slice(0,3).map(x=>x.ru);
  const opts=shuffle([d.ru,...others]);
  $("#view").innerHTML='<div class="score">Счёт: '+sc+' / '+pool.length+'</div>'+
   '<div class="q">'+d.en+' <button class="btn a" id="say" style="padding:6px 12px;font-size:13px">🔊</button></div>'+
   '<div class="opts">'+opts.map(o=>'<button class="opt">'+o+'</button>').join("")+'</div>';
  $("#say").onclick=()=>speak(d.en);
  let done=false;
  document.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{if(done)return;done=true;
    if(b.textContent===d.ru){b.classList.add("ok");sc++;}
    else{b.classList.add("bad");document.querySelectorAll(".opt").forEach(x=>{if(x.textContent===d.ru)x.classList.add("ok");});}
    document.querySelectorAll(".opt").forEach(x=>x.disabled=true);
    setTimeout(()=>{idx++;nextQ();},900);});
}
build();
</script>
</body>
</html>'''

def build(mod_name):
    mod=importlib.import_module(mod_name)
    DATA=mod.DATA; META=mod.META
    deck=[]
    for u in DATA:
        for en,ru in u["chunks"]:
            deck.append({"en":en,"ru":ru,"u":u["n"]})
        for en,ru in u["words"]:
            deck.append({"en":en,"ru":ru,"u":u["n"]})
    html=PAGE
    for k,v in {"@@LEVEL@@":META["level"],"@@HUB@@":META["hub"],"@@TRAINER@@":META["trainer"],
                "@@DECK@@":json.dumps(deck,ensure_ascii=False)}.items():
        html=html.replace(k,v)
    fn="%s-chunks.html"%META["prefix"]
    open(fn,"w",encoding="utf-8").write(html)
    print("wrote",fn,"| карточек:",len(deck))

if __name__=="__main__":
    build(sys.argv[1])
