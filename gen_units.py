# -*- coding: utf-8 -*-
# Единый генератор уроков Speakout (B1 и B1+) по ОДНОМУ шаблону.
# Запуск: python3 gen_units.py b1_data   /   python3 gen_units.py b1plus_data
# Данные юнита — в модуле DATA + META (prefix, level, hub, trainer, cover_base).
import json, sys, importlib

# --- Авторские дополнительные задания Workbook (сверх wbmc/wbgaps из данных юнита) ---
# Ключи: prefix -> номер юнита -> {"mc":[...], "gaps":[...]}
WB_EXTRA = {
  "speakout-b1": {
    1: {"mc":[
        {"q":"Выбери предложение со state verb:","o":["I am knowing him","I know him well","I am know him"],"a":1},
        {"q":"Порядок слов с наречием частоты:","o":["She usually gets up early","She gets usually up early","Usually she get up early"],"a":0},
        {"q":"I don't mind ___ up early.","o":["to wake","waking","wake"],"a":1},
        {"q":"He's ___ outgoing — everyone loves him. (усилитель)","o":["really","much","many"],"a":0}],
      "gaps":[
        {"q":"Listen! The baby ___ (cry).","a":["is crying"]},
        {"q":"I ___ (not/understand) this rule. (present simple)","a":["don't understand","do not understand"]},
        {"q":"They want ___ (meet) you.","a":["to meet"]}]},
    2: {"mc":[
        {"q":"While I ___ , the phone rang.","o":["was cooking","cooked","have cooked"],"a":0},
        {"q":"I ___ this film three times so far.","o":["saw","have seen","was seeing"],"a":1},
        {"q":"We first met ___ 2019.","o":["in","on","at"],"a":0},
        {"q":"неожиданная концовка = a surprise ___ .","o":["ending","end","final"],"a":0}],
      "gaps":[
        {"q":"The film had already ___ (start) when we arrived. (past perfect)","a":["started"]},
        {"q":"I haven't seen her ___ Monday. (с — какого момента)","a":["since"]},
        {"q":"He ___ (live) here since 2010. (present perfect)","a":["has lived","'s lived"]}]},
    3: {"mc":[
        {"q":"___ do you usually get to work?","o":["How","What","Who"],"a":0},
        {"q":"Look at the clouds! It ___ rain.","o":["is going to","will","goes to"],"a":0},
        {"q":"I ___ John tonight — we arranged it.","o":["'m seeing","see","will see"],"a":0},
        {"q":"выключи свет = turn ___ the light.","o":["off","in","up"],"a":0}],
      "gaps":[
        {"q":"___ you like some tea? (вежливое предложение)","a":["would"]},
        {"q":"The train ___ (leave) at six tomorrow. (расписание)","a":["leaves"]},
        {"q":"Look ___ this word in a dictionary. (phrasal — найди)","a":["up"]}]},
    4: {"mc":[
        {"q":"You ___ train hard to win.","o":["have to","haven't to","must to"],"a":0},
        {"q":"It's ___ best match of the season.","o":["the","a","—"],"a":0},
        {"q":"проиграть матч = to ___ a match.","o":["lose","loose","miss"],"a":0},
        {"q":"This is the fastest time she ___ ever run.","o":["has","have","is"],"a":0}],
      "gaps":[
        {"q":"You ___ (not/have to) come if you're tired. (нет необходимости)","a":["don't have to","do not have to"]},
        {"q":"I saw ___ amazing goal yesterday. (артикль)","a":["an"]},
        {"q":"She has broken the world ___ . (рекорд)","a":["record"]}]},
    5: {"mc":[
        {"q":"The journalist ___ wrote it is famous.","o":["who","which","where"],"a":0},
        {"q":"He said he ___ tired. (reported)","o":["was","is","will be"],"a":0},
        {"q":"It ___ rain tomorrow, maybe. (прогноз-возможность)","o":["might","must","should"],"a":0},
        {"q":"проверить факты = to ___ the facts.","o":["check","control","prove"],"a":0}],
      "gaps":[
        {"q":"That's the town ___ I was born. (место)","a":["where"]},
        {"q":"She told me she ___ (finish) the report. (reported: past perfect)","a":["had finished"]},
        {"q":"The story went ___ overnight. (вирусным)","a":["viral"]}]},
    6: {"mc":[
        {"q":"I ___ play the piano, but I stopped.","o":["used to","use to","am used to"],"a":0},
        {"q":"This painting is ___ than that one.","o":["more beautiful","beautifuller","most beautiful"],"a":0},
        {"q":"I've ___ finished it. (только что)","o":["just","yet","since"],"a":0},
        {"q":"художник = an ___ .","o":["artist","artistic","art"],"a":0}],
      "gaps":[
        {"q":"He didn't ___ (use to) like jazz. (отриц. — инфинитив)","a":["use to"]},
        {"q":"She's the ___ (talented) person I know. (превосх.)","a":["most talented"]},
        {"q":"I've known him ___ 2015. (с)","a":["since"]}]},
    7: {"mc":[
        {"q":"If it rains, we ___ at home. (1st)","o":["will stay","would stay","stayed"],"a":0},
        {"q":"If I ___ rich, I'd travel the world. (2nd)","o":["were","am","will be"],"a":0},
        {"q":"There isn't ___ time left.","o":["much","many","a few"],"a":0},
        {"q":"отменить рейс = to ___ a flight.","o":["cancel","delay","miss"],"a":0}],
      "gaps":[
        {"q":"If I ___ (have) more money, I'd buy a ticket. (2nd)","a":["had"]},
        {"q":"How ___ suitcases have you got? (сколько — исчисл.)","a":["many"]},
        {"q":"Help ___ to some food! (себе, ед.ч.)","a":["yourself"]}]},
    8: {"mc":[
        {"q":"I ___ swim when I was five.","o":["could","can","am able"],"a":0},
        {"q":"This app ___ by millions of people. (passive)","o":["is used","uses","used"],"a":0},
        {"q":"___ a language takes time.","o":["Learning","Learn","To learning"],"a":0},
        {"q":"скачать приложение = to ___ an app.","o":["download","upload","reload"],"a":0}],
      "gaps":[
        {"q":"I wasn't ___ (be able to) open the file. (прош., отриц.)","a":["able to"]},
        {"q":"The bridge ___ (build) in 1990. (passive past)","a":["was built"]},
        {"q":"I'm good ___ fixing computers. (предлог)","a":["at"]}]},
  },
  "speakout-b1plus": {
    1: {"mc":[
        {"q":"By the time I woke up, everyone ___ .","o":["had left","left","has left"],"a":0},
        {"q":"He avoided ___ to me.","o":["talking","to talk","talk"],"a":0},
        {"q":"give ___ = отдать безвозмездно","o":["away","up","in"],"a":0},
        {"q":"She promised ___ me later.","o":["to call","calling","call"],"a":0}],
      "gaps":[
        {"q":"The train had already ___ (leave) when we got there. (past perfect)","a":["left"]},
        {"q":"I can't stand ___ (wait) in queues.","a":["waiting"]},
        {"q":"Apart ___ the noise, the flat is perfect.","a":["from"]}]},
    2: {"mc":[
        {"q":"I've ___ this book twice. (результат)","o":["read","been reading","reading"],"a":0},
        {"q":"She's been ___ all morning; she's tired. (процесс)","o":["running","run","ran"],"a":0},
        {"q":"The man ___ car was stolen called the police.","o":["whose","who","which"],"a":0},
        {"q":"выйти из себя = to lose your ___ .","o":["temper","mind","head"],"a":0}],
      "gaps":[
        {"q":"I've been ___ (learn) English for years. (perfect continuous)","a":["learning"]},
        {"q":"She's the friend ___ always helps me. (кто)","a":["who","that"]},
        {"q":"They ___ (paint) the house all week. (perfect continuous)","a":["have been painting","'ve been painting"]}]},
    3: {"mc":[
        {"q":"You ___ wear a helmet — it's the rule.","o":["have to","have","need"],"a":0},
        {"q":"You ___ come tomorrow — it's optional.","o":["don't have to","mustn't","have to"],"a":0},
        {"q":"If I ___ the job, I'll celebrate.","o":["get","got","will get"],"a":0},
        {"q":"собеседование = a job ___ .","o":["interview","interval","review"],"a":0}],
      "gaps":[
        {"q":"We ___ (not/need to) book — there's space. (нет необходимости)","a":["don't need to","do not need to"]},
        {"q":"If she ___ (study) harder, she would pass. (2nd)","a":["studied"]},
        {"q":"He got a ___ and now earns more. (повышение)","a":["promotion","raise"]}]},
    4: {"mc":[
        {"q":"I ___ call you, but I forgot. (собирался)","o":["was going to","am going to","will"],"a":0},
        {"q":"Do you know where ___ ? (косвенный вопрос)","o":["she lives","does she live","she does live"],"a":0},
        {"q":"выдумать историю = to ___ up a story.","o":["make","do","take"],"a":0},
        {"q":"Could you tell me what time ___ ?","o":["it is","is it","it does"],"a":0}],
      "gaps":[
        {"q":"We ___ (go) to travel, but we changed our minds. (were going to)","a":["were going to"]},
        {"q":"I wonder ___ this news is true. (ли)","a":["if","whether"]},
        {"q":"Can you tell me where the station ___ ? (быть, наст.)","a":["is"]}]},
    5: {"mc":[
        {"q":"I went early ___ get a good seat. (цель)","o":["to","for","so"],"a":0},
        {"q":"I saved money ___ that I could buy it.","o":["so","in order","for"],"a":0},
        {"q":"This phone isn't ___ expensive as that one. (такой же)","o":["as","so","more"],"a":0},
        {"q":"нет в наличии = out of ___ .","o":["stock","order","store"],"a":0}],
      "gaps":[
        {"q":"I whispered ___ that nobody could hear. (чтобы)","a":["so"]},
        {"q":"Online shops are ___ (cheap) than malls, as a rule.","a":["cheaper"]},
        {"q":"Can I ___ these jeans on? (примерить)","a":["try"]}]},
    6: {"mc":[
        {"q":"It was ___ a beautiful city!","o":["such","so","very"],"a":0},
        {"q":"The music was ___ loud that we left.","o":["so","such","too much"],"a":0},
        {"q":"I'm not used to ___ on the left.","o":["driving","drive","drove"],"a":0},
        {"q":"пробка = a traffic ___ .","o":["jam","block","stop"],"a":0}],
      "gaps":[
        {"q":"There were ___ many people that we couldn't move.","a":["so"]},
        {"q":"He's getting used to ___ (work) nights.","a":["working"]},
        {"q":"It was such ___ long trip! (артикль)","a":["a"]}]},
    7: {"mc":[
        {"q":"«I'm busy» → He said he ___ busy.","o":["was","is","has been"],"a":0},
        {"q":"She ___ me to wait. (попросила)","o":["asked","said","told to"],"a":0},
        {"q":"The email ___ yesterday. (passive past)","o":["was sent","sent","is sent"],"a":0},
        {"q":"ответить на сообщение = to ___ to a message.","o":["reply","answer to","respond at"],"a":0}],
      "gaps":[
        {"q":"«I'll help» → She promised ___ (help). (reporting verb + to)","a":["to help"]},
        {"q":"Millions of messages ___ (send) every day. (passive present)","a":["are sent"]},
        {"q":"He said he ___ (call) me the next day. (reported: would)","a":["would call"]}]},
    8: {"mc":[
        {"q":"If I'd known, I ___ come. (бы пришёл)","o":["would have","would","will have"],"a":0},
        {"q":"You ___ told me earlier! (упрёк)","o":["should have","should","must have"],"a":0},
        {"q":"When I was a kid, we ___ spend summers at the lake. (прошлая привычка)","o":["would","used","use to"],"a":0},
        {"q":"учиться на ошибках = learn from your ___ .","o":["mistakes","faults","misses"],"a":0}],
      "gaps":[
        {"q":"If she had studied, she ___ (pass). (3rd — would have passed)","a":["would have passed"]},
        {"q":"You should have ___ (listen) to her advice. (упрёк)","a":["listened"]},
        {"q":"We ___ (spend → used to) hours playing outside as kids.","a":["used to spend"]}]},
  },
}

RENDER = r'''
const wbox=document.getElementById("words");
if(wbox)WORDS.forEach(w=>{const d=document.createElement("div");d.className="word";
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
var _lp=document.getElementById("lplay");if(_lp)_lp.onclick=()=>{
  speechSynthesis.cancel();
  const mv=enVoice("m"),fv=enVoice("f");
  DIALOG.forEach(([who,line])=>{const u=new SpeechSynthesisUtterance(line);const v=(who==="m")?mv:fv;if(v){u.voice=v;u.lang=v.lang;}else u.lang="en-GB";u.rate=0.95;u.pitch=1;speechSynthesis.speak(u);});
};
var _ls=document.getElementById("lstop");if(_ls)_ls.onclick=()=>speechSynthesis.cancel();
var _lsc=document.getElementById("lscript");if(_lsc)_lsc.onclick=()=>{const s=document.getElementById("script");s.style.display=s.style.display==="block"?"none":"block";};
/* Второе аудирование (если есть DIALOG2) */
var _lp2=document.getElementById("lplay2");if(_lp2)_lp2.onclick=()=>{
  speechSynthesis.cancel();const mv=enVoice("m"),fv=enVoice("f");
  DIALOG2.forEach(([who,line])=>{const u=new SpeechSynthesisUtterance(line);const v=(who==="m")?mv:fv;if(v){u.voice=v;u.lang=v.lang;}else u.lang="en-GB";u.rate=0.95;u.pitch=1;speechSynthesis.speak(u);});
};
var _ls2=document.getElementById("lstop2");if(_ls2)_ls2.onclick=()=>speechSynthesis.cancel();
var _lsc2=document.getElementById("lscript2");if(_lsc2)_lsc2.onclick=()=>{const s=document.getElementById("script2");s.style.display=s.style.display==="block"?"none":"block";};
/* ---- Логирование прогресса в Supabase (если ученик вошёл) ---- */
const HW={course:"@@HWCOURSE@@",unit:@@NUM@@};
const _T0=Date.now();let _GI=0;const _ATT=[];let _LOGGED=false,_flushT=null;
function _log(sec,idx,question,answer,correct){if(!_LOGGED)return;_ATT.push({course:HW.course,unit:HW.unit,ex_index:idx,section:sec,question:question,answer:answer,correct:correct,duration_ms:Date.now()-_T0});clearTimeout(_flushT);_flushT=setTimeout(_flush,1200);}
async function _flush(){if(!_ATT.length)return;const rows=_ATT.splice(0,_ATT.length);try{const r=await SM.saveHwAttempts(rows);if(!r||!r.ok){_ATT.unshift.apply(_ATT,rows);}}catch(e){_ATT.unshift.apply(_ATT,rows);}}
window.addEventListener("pagehide",_flush);document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")_flush();});
(async function(){try{if(window.SM&&SM.isCloud){const u=await SM.getUser();_LOGGED=!!u;if(!u){const b=document.createElement("div");b.style.cssText="position:fixed;left:0;right:0;bottom:0;background:#7c2340;color:#fff;font:800 12.5px 'Nunito',sans-serif;padding:9px 12px;text-align:center;z-index:99";b.innerHTML='Войди в <a href="cabinet.html" style="color:#ffd27a;text-decoration:underline">кабинет ученика</a>, чтобы результат увидел учитель';document.body.appendChild(b);}}}catch(e){}})();
let sc=0,tot=0;
function bump(){sc++;document.getElementById("sc").textContent=sc;}
function mcCard(t,n,sec){tot++;const gi=++_GI;const d=document.createElement("div");d.className="card";
  d.innerHTML='<div class="q"><span class="n">'+n+'.</span>'+t.q+'</div><div class="opts">'+t.o.map(o=>'<button class="opt">'+o+'</button>').join("")+'</div>';
  let done=false,logged=false;
  d.querySelectorAll(".opt").forEach((b,i)=>b.onclick=()=>{if(done)return;
    if(!logged){logged=true;_log(sec||"grammar",gi,t.q,b.textContent,i===t.a);}
    if(i===t.a){b.classList.add("ok");done=true;d.querySelectorAll(".opt").forEach(x=>x.disabled=true);bump();}
    else{b.classList.add("bad");b.disabled=true;}});
  return d;}
function gapCard(t,n,sec){tot++;const gi=++_GI;const d=document.createElement("div");d.className="card";
  d.innerHTML='<div class="q"><span class="n">'+n+'.</span>'+t.q+'</div><div class="gaprow"><input class="gap-in" placeholder="впиши ответ…"><button class="chk">Проверить</button></div><div class="ans"></div>';
  const inp=d.querySelector(".gap-in"),btn=d.querySelector(".chk"),an=d.querySelector(".ans");let done=false,logged=false;
  function check(){if(done)return;const raw=inp.value.trim();const v=raw.toLowerCase().replace(/\s+/g," ");const ok=t.a.some(x=>x.toLowerCase()===v);
    if(!logged){logged=true;_log(sec||"gap",gi,t.q,raw,ok);}
    if(ok){inp.classList.remove("bad");inp.classList.add("ok");done=true;inp.disabled=true;btn.disabled=true;bump();}
    else{inp.classList.add("bad");an.style.display="block";an.textContent="Подсказка: "+t.a[0];}}
  btn.onclick=check;inp.addEventListener("keydown",e=>{if(e.key==="Enter")check();});
  return d;}
/* Произношение */
const pbox=document.getElementById("pron");
if(pbox)PRONWORDS.forEach(w=>{const b=document.createElement("button");b.className="chip";b.textContent="🔊 "+w;b.onclick=()=>say(w);pbox.appendChild(b);});
/* Чанки — учим (с озвучкой) */
const cbox=document.getElementById("chunks");
if(cbox)CHUNKS.forEach(c=>{const d=document.createElement("div");d.className="word";
  d.innerHTML='<button>🔊</button><div><div class="en">'+c[0]+'</div><div class="tr">'+c[1]+'</div></div>';
  d.querySelector("button").onclick=()=>say(c[0]);cbox.appendChild(d);});
/* Чанки — тренажёр: выбери перевод */
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const chpr=document.getElementById("chpr");
if(chpr)shuffle(CHUNKS).forEach((c,i)=>{
  const others=shuffle(CHUNKS.filter(x=>x[1]!==c[1])).slice(0,2).map(x=>x[1]);
  const opts=shuffle([c[1],...others]);
  const t={q:'Что значит <b>'+c[0]+'</b>?',o:opts,a:opts.indexOf(c[1])};
  chpr.appendChild(mcCard(t,i+1,"chunk"));
});
/* Аудирование → вопросы */
const lq=document.getElementById("lq");if(lq)LQ.forEach((t,i)=>lq.appendChild(mcCard(t,i+1,"listening")));
const lq2=document.getElementById("lq2");if(lq2&&typeof LQ2!=="undefined")LQ2.forEach((t,i)=>lq2.appendChild(mcCard(t,i+1,"listening2")));
/* Чтение → вопросы */
const rq=document.getElementById("rq");if(rq)RQ.forEach((t,i)=>rq.appendChild(mcCard(t,i+1,"reading")));
const rq2=document.getElementById("rq2");if(rq2&&typeof RQ2!=="undefined")RQ2.forEach((t,i)=>rq2.appendChild(mcCard(t,i+1,"reading2")));
/* Упражнения */
const ex=document.getElementById("ex");if(ex){EX.forEach((t,i)=>ex.appendChild(mcCard(t,i+1,"grammar")));GAPS.forEach((t,i)=>ex.appendChild(gapCard(t,EX.length+i+1,"gap")));}
/* How to */
const fx=document.getElementById("fx");if(fx)FX.forEach((t,i)=>fx.appendChild(mcCard(t,i+1,"howto")));
/* Word Skills (Solutions) — mc или gap по полю type */
const wsb=document.getElementById("ws");
if(wsb&&typeof WORDSKILLS!=="undefined")WORDSKILLS.forEach((t,i)=>{
  if(t.a!==undefined&&Array.isArray(t.o)) wsb.appendChild(mcCard(t,i+1,"wordskills"));
  else wsb.appendChild(gapCard(t,i+1,"wordskills"));
});
/* Speaking — карточки-подсказки (без проверки) */
const spk=document.getElementById("spk");
if(spk)SPEAK.forEach((p,i)=>{const d=document.createElement("div");d.className="spkcard";
  d.innerHTML='<span class="spn">'+(i+1)+'</span> '+p;spk.appendChild(d);});
/* Workbook */
const wb=document.getElementById("wb");
if(wb){
  let _wn=0;
  function _wbHead(txt){const h=document.createElement("div");h.className="wbhead";h.textContent=txt;wb.appendChild(h);}
  if(window.__WB_FULL&&typeof WORDS!=="undefined"&&WORDS.length){
    /* авто: слова RU→EN */
    _wbHead("🔤 Слова юнита — выбери перевод");
    shuffle(WORDS).slice(0,10).forEach(w=>{
      const others=shuffle(WORDS.filter(x=>x[0]!==w[0])).slice(0,2).map(x=>x[0]);
      const opts=shuffle([w[0]].concat(others));
      wb.appendChild(mcCard({q:'«'+w[1]+'» — это…',o:opts,a:opts.indexOf(w[0])},++_wn,"wb-voc"));
    });
    /* авто: впиши слово */
    _wbHead("✍️ Впиши слово по-английски");
    shuffle(WORDS).slice(0,6).forEach(w=>{
      const en=w[0],alt=en.replace(/^to\s+/,"");const ans=(alt!==en)?[en,alt]:[en];
      wb.appendChild(gapCard({q:'«'+w[1]+'» — впиши по-английски:',a:ans},++_wn,"wb-spell"));
    });
    /* авто: полезные фразы */
    if(typeof CHUNKS!=="undefined"&&CHUNKS.length){
      _wbHead("🧩 Полезные фразы — выбери значение");
      shuffle(CHUNKS).forEach(c=>{
        const others=shuffle(CHUNKS.filter(x=>x[1]!==c[1])).slice(0,2).map(x=>x[1]);
        const opts=shuffle([c[1]].concat(others));
        wb.appendChild(mcCard({q:'Что значит <b>'+c[0]+'</b>?',o:opts,a:opts.indexOf(c[1])},++_wn,"wb-chunk"));
      });
    }
    _wbHead("📝 Грамматика и лексика — закрепление");
  }
  WBMC.forEach(t=>wb.appendChild(mcCard(t,++_wn,"wb")));
  WBGAPS.forEach(t=>wb.appendChild(gapCard(t,++_wn,"wb")));
}
var _tot=document.getElementById("tot");if(_tot)_tot.textContent=tot;
'''

TEMPLATE = r'''<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Unit @@NUM@@ · @@TITLE@@ · Speakout @@LEVEL@@ · English with Asya</title>
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
  .hero img{width:100%;display:block;aspect-ratio:3/2;object-fit:cover}
  .hcover{width:100%;aspect-ratio:3/2;display:flex;align-items:center;justify-content:center;position:relative}
  .hcover span{font-size:clamp(70px,18vw,130px);filter:drop-shadow(0 6px 10px rgba(0,0,0,.28))}
  .hero .hb{padding:18px 22px}
  .hero h1{margin:0;font-family:'Fredoka',sans-serif;font-size:clamp(26px,5vw,38px);color:#7c2340}
  .hero .d{font-weight:800;font-size:14px;color:#5a4f47;margin-top:6px}
  h2{font-family:'Fredoka',sans-serif;font-size:24px;color:#7c2340;margin:30px 4px 12px}
  .sec-i{font-size:13px;color:#8a7a68;font-weight:700}
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
  .pronbox{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}
  .chip{border:2px solid #e3d3ba;background:#fff;cursor:pointer;font:800 14px 'Nunito',sans-serif;padding:8px 14px;border-radius:999px;color:#7c2340}
  .chip:hover{background:#fdfaf0}
  .lc{background:#7c2340;border-radius:22px;padding:20px 22px;color:#fff;box-shadow:0 6px 0 #4d1527}
  .lc h3{margin:0 0 6px;font-family:'Fredoka',sans-serif;font-size:20px}
  .lc p{margin:4px 0 12px;font-weight:700;font-size:13.5px;opacity:.9}
  .lbtn{border:none;cursor:pointer;background:#e0952a;color:#fff;font:800 14px 'Nunito',sans-serif;padding:11px 20px;border-radius:999px;margin-right:8px}
  .lbtn.sec{background:rgba(255,255,255,.18)}
  #script{display:none;background:rgba(255,255,255,.1);border-radius:12px;padding:12px 16px;margin-top:12px;font-size:14px;line-height:1.65}
  #script b{color:#ffd27a}
  .read{background:#fff;border-radius:18px;padding:16px 20px;box-shadow:0 4px 0 #e3d3ba;font-size:15px;line-height:1.7}
  .read h3{margin:0 0 8px;font-family:'Fredoka',sans-serif;color:#7c2340;font-size:19px}
  .vidwrap{position:relative;width:100%;aspect-ratio:16/9;border-radius:18px;overflow:hidden;box-shadow:0 6px 0 #e3d3ba;background:#000}
  .vidwrap iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
  .vidcard{background:#fff;border-radius:18px;padding:18px 20px;box-shadow:0 4px 0 #e3d3ba;font:800 14.5px 'Nunito',sans-serif;color:#5a4f47;line-height:1.6}
  .vidbtn{display:inline-block;margin-top:10px;background:#c0392b;color:#fff;font:800 14px 'Nunito',sans-serif;padding:11px 20px;border-radius:999px;text-decoration:none}
  .read b{color:#7c2340}
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
  .spkcard{background:#eef6ff00;background:#fbf4ff;border:2px solid #b98cc9;border-radius:16px;padding:12px 16px;margin-bottom:10px;font-size:14.5px;font-weight:700;color:#5a3a66}
  .spkcard .spn{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;background:#8e5aa3;color:#fff;border-radius:50%;font-size:13px;margin-right:8px}
  .wbband{background:#fff;border:2px solid #7c2340;border-radius:18px;padding:12px 18px;font-weight:800;font-size:13.5px;color:#5a4f47;margin-bottom:12px}
  .foot{text-align:center;font-weight:700;font-size:13px;color:#8a7a68;margin-top:44px}
</style>
</head>
<body>
<div class="wrap">
  <div class="scorebar">⭐ Счёт: <span id="sc">0</span> / <span id="tot">0</span></div>
  <div class="top">
    <a class="home" href="@@HUB@@">← Все юниты</a>
    <a class="home alt" href="@@TRAINER@@">🎯 Тренажёр</a>
    <a class="home" href="index.html">🏠 Домой</a>
  </div>

  <div class="hero">
    @@COVER@@
    <div class="hb">
      <h1>Unit @@NUM@@ · @@TITLE@@</h1>
      <div class="d">📚 @@DESC@@</div>
    </div>
  </div>

  <h2>📖 Грамматика юнита</h2>
  <div class="card" style="text-align:center">
    <div style="font-size:14.5px;margin-bottom:10px;color:#5a4f47;font-weight:800">Грамматика и рабочая тетрадь этого юнита — отдельными заданиями (ДЗ).</div>
    <a href="@@HWCOURSE@@-u@@NUM@@-grammar.html" style="display:inline-block;background:#7c2340;color:#fff;font:800 14px 'Nunito',sans-serif;padding:11px 20px;border-radius:999px;text-decoration:none;margin:3px">✏️ Грамматика юнита →</a>
    <a href="@@HWCOURSE@@-u@@NUM@@-workbook.html" style="display:inline-block;background:#2e6f4e;color:#fff;font:800 14px 'Nunito',sans-serif;padding:11px 20px;border-radius:999px;text-decoration:none;margin:3px">📒 Workbook →</a>
  </div>

  <h2>🔤 Слова юнита <span class="sec-i">(нажми 🔊 и повтори)</span></h2>
  <div class="words" id="words"></div>

  <h2>🗣️ Произношение <span class="sec-i">@@PRONFOCUS@@</span></h2>
  <div class="card"><div style="font-size:14px;margin-bottom:8px">@@PRONNOTE@@</div><div class="pronbox" id="pron"></div></div>

  <h2>🧩 Chunks — выражения целиком <span class="sec-i">(учи фразой, не по словам)</span></h2>
  <div class="words" id="chunks"></div>
  <h2>🎯 Тренажёр чанков <span class="sec-i">(выбери перевод)</span></h2>
  <div id="chpr"></div>

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
@@LISTEN2@@
@@VIDEO@@
@@WORDSKILLS@@
  <h2>📕 Чтение</h2>
  <div class="read"><h3>@@READ_TITLE@@</h3>@@READ@@</div>
  <div id="rq" style="margin-top:14px"></div>
@@READ2@@

  <h2>@@HOWTO_TITLE@@</h2>
  <div class="card">
@@HOWTO@@
  </div>
  <div id="fx"></div>

  <h2>💬 Говорим <span class="sec-i">(скажи вслух — по-английски)</span></h2>
  <div id="spk"></div>
@@WRITING@@
  <h2>🏠 Домашнее задание</h2>
  <div class="hw">@@HW@@</div>

  <div class="foot">Made for @english.with_asya · авторские материалы по программе Speakout 3rd ed. @@LEVEL@@ · Unit @@NUM@@</div>
</div>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="sm-auth.js"></script>
<script>
@@DATA@@
@@RENDER@@
</script>
</body>
</html>
'''

WORKBOOK_TEMPLATE = r'''<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Unit @@NUM@@ · Workbook · Speakout @@LEVEL@@ · English with Asya</title>
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
  h1{font-family:'Fredoka',sans-serif;font-size:clamp(24px,5vw,34px);color:#7c2340;margin:6px 4px 2px}
  .d{font-weight:800;font-size:14px;color:#5a4f47;margin:0 4px 8px}
  h2{font-family:'Fredoka',sans-serif;font-size:24px;color:#7c2340;margin:28px 4px 12px}
  .card{background:#fff;border-radius:18px;padding:16px 20px;box-shadow:0 4px 0 #e3d3ba;margin-bottom:12px}
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
  .scorebar{position:sticky;top:0;z-index:10;background:#2e6f4e;color:#fff;border-radius:0 0 16px 16px;padding:10px 18px;font-weight:900;font-size:14px;margin:-24px -18px 18px;box-shadow:0 4px 10px rgba(0,0,0,.15)}
  .wbband{background:#fff;border:2px solid #2e6f4e;border-radius:18px;padding:12px 18px;font-weight:800;font-size:13.5px;color:#5a4f47;margin-bottom:12px}
  .wbhead{font-family:'Fredoka',sans-serif;font-size:19px;color:#2e6f4e;margin:24px 4px 10px;font-weight:700}
  .foot{text-align:center;font-weight:700;font-size:13px;color:#8a7a68;margin-top:44px}
</style>
</head>
<body>
<div class="wrap">
  <div class="scorebar">📒 Workbook · Счёт: <span id="sc">0</span> / <span id="tot">0</span></div>
  <div class="top">
    <a class="home" href="@@HWCOURSE@@-u@@NUM@@.html">← Урок</a>
    <a class="home" href="@@HWCOURSE@@-u@@NUM@@-grammar.html">✏️ Грамматика</a>
    <a class="home" href="@@HUB@@">Все юниты</a>
  </div>
  <h1>Unit @@NUM@@ · Workbook</h1>
  <div class="d">📚 @@DESC@@</div>

  <h2>📒 Рабочая тетрадь · закрепление</h2>
  <div class="wbband">Расширенная практика юнита: слова, полезные фразы, грамматика и лексика. Реши здесь — ответы сохранятся учителю.</div>
  <div id="wb"></div>

  <div class="foot">Made for @english.with_asya · авторские материалы по программе Speakout 3rd ed. @@LEVEL@@ · Unit @@NUM@@ · workbook</div>
</div>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="sm-auth.js"></script>
<script>
window.__WB_FULL=true;
@@DATA@@
@@RENDER@@
</script>
</body>
</html>
'''

GRAMMAR_TEMPLATE = r'''<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Unit @@NUM@@ · Грамматика · Speakout @@LEVEL@@ · English with Asya</title>
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
  h1{font-family:'Fredoka',sans-serif;font-size:clamp(24px,5vw,34px);color:#7c2340;margin:6px 4px 2px}
  .d{font-weight:800;font-size:14px;color:#5a4f47;margin:0 4px 8px}
  h2{font-family:'Fredoka',sans-serif;font-size:24px;color:#7c2340;margin:28px 4px 12px}
  .card{background:#fff;border-radius:18px;padding:16px 20px;box-shadow:0 4px 0 #e3d3ba;margin-bottom:12px}
  .g-ex{background:#fdfaf0;border-left:4px solid #7c2340;border-radius:10px;padding:10px 14px;margin:8px 0;font-size:14.5px}
  .g-ex b{color:#7c2340}
  .ru{color:#8a7a68;font-size:13px}
  .gt{color:#7c2340;font-size:16px;font-weight:900}
  table{border-collapse:collapse;width:100%;font-size:14px;margin-top:10px}
  td,th{border:2px solid #eee3d2;padding:8px 10px;text-align:left}
  th{background:#f6ede0;color:#7c2340}
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
  .wbband{background:#fff;border:2px solid #7c2340;border-radius:18px;padding:12px 18px;font-weight:800;font-size:13.5px;color:#5a4f47;margin-bottom:12px}
  .foot{text-align:center;font-weight:700;font-size:13px;color:#8a7a68;margin-top:44px}
</style>
</head>
<body>
<div class="wrap">
  <div class="scorebar">⭐ Счёт: <span id="sc">0</span> / <span id="tot">0</span></div>
  <div class="top">
    <a class="home" href="@@HWCOURSE@@-u@@NUM@@.html">← Урок (лексика)</a>
    <a class="home alt" href="@@TRAINER@@">🎯 Тренажёр</a>
    <a class="home" href="@@HUB@@">Все юниты</a>
  </div>
  <h1>Unit @@NUM@@ · Грамматика</h1>
  <div class="d">📚 @@DESC@@</div>

  <h2>📖 Разбор грамматики</h2>
@@GRAMMAR@@

  <h2>✏️ Упражнения</h2>
  <div id="ex"></div>

  <div class="foot">Made for @english.with_asya · авторские материалы по программе Speakout 3rd ed. @@LEVEL@@ · Unit @@NUM@@ · грамматика</div>
</div>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="sm-auth.js"></script>
<script>
@@DATA@@
@@RENDER@@
</script>
</body>
</html>
'''

def script_html(dialog, names):
    return '<br>\n      '.join('<b>%s:</b> %s' % (names[w], line) for w,line in dialog)

def grammar_html(cards):
    return '\n'.join('  <div class="card">\n    <span class="gt">%s</span>\n%s\n  </div>' % (c['t'], c['h']) for c in cards)

def data_js(u, meta=None):
    j=lambda x: json.dumps(x, ensure_ascii=False)
    prefix=(meta or {}).get("prefix","")
    extra=WB_EXTRA.get(prefix,{}).get(u["n"],{})
    wbmc=list(u["wbmc"])+list(extra.get("mc",[]))
    wbgaps=list(u["wbgaps"])+list(extra.get("gaps",[]))
    keys=[("WORDS","words"),("PRONWORDS","pron_words"),("CHUNKS","chunks"),
          ("DIALOG","dialog"),("LQ","lq"),("RQ","rq"),("EX","ex"),("GAPS","gaps"),
          ("FX","fx"),("SPEAK","speaking")]
    lines=['const %s=%s;'%(k,j(u[f])) for k,f in keys]
    if u.get("word_skills"):
        lines.append('const WORDSKILLS=%s;'%j(u["word_skills"]))
    if u.get("dialog2"):
        lines.append('const DIALOG2=%s;'%j(u["dialog2"]))
        lines.append('const LQ2=%s;'%j(u.get("lq2",[])))
    if u.get("reading2"):
        lines.append('const RQ2=%s;'%j(u.get("rq2",[])))
    lines.append('const WBMC=%s;'%j(wbmc))
    lines.append('const WBGAPS=%s;'%j(wbgaps))
    return '\n'.join(lines)

def wordskills_html(u):
    if not u.get("word_skills"): return ""
    note=u.get("word_skills_note","Работа со словом: приставки, суффиксы, словообразование.")
    return ('\n  <h2>🔤 Word Skills <span class="sec-i">(работа со словом)</span></h2>\n'
            '  <div class="wbband" style="border-color:#2e6f4e">%s</div>\n  <div id="ws"></div>\n' % note)

def writing_html(u):
    w=u.get("writing")
    if not w: return ""
    return '\n  <h2>✍️ Writing</h2>\n  <div class="hw">%s</div>\n' % w

def listen2_html(u):
    if not u.get("dialog2"): return ""
    names=u.get("names2") or u.get("names")
    title=u.get("listen2_title") or "Второй диалог"
    return ('\n  <h2>🎧 Аудирование 2 <span class="sec-i">(ещё один диалог)</span></h2>\n'
            '  <div class="lc">\n    <h3>%s</h3>\n'
            '    <p>Послушай второй диалог и ответь на вопросы. Слушай сколько нужно.</p>\n'
            '    <button class="lbtn" id="lplay2">▶ Слушать</button>\n'
            '    <button class="lbtn sec" id="lstop2">⏹ Стоп</button>\n'
            '    <button class="lbtn sec" id="lscript2">📜 Показать текст</button>\n'
            '    <div id="script2">%s</div>\n  </div>\n'
            '  <div id="lq2" style="margin-top:14px"></div>\n'
            % (title, script_html(u["dialog2"], names)))

def reading2_html(u):
    if not u.get("reading2"): return ""
    title=u.get("reading2_title") or "Второй текст"
    return ('\n  <h2>📕 Чтение 2 <span class="sec-i">(%s)</span></h2>\n'
            '  <div class="read"><h3>%s</h3>%s</div>\n'
            '  <div id="rq2" style="margin-top:14px"></div>\n' % (title, title, u["reading2"]))

def cover_html(u, meta):
    img=u.get("cover_img")
    if img:
        base=meta.get("cover_base","")
        return '<img src="%s%s" alt="Unit %d · %s">' % (base, img, u["n"], u["title"])
    a,b=u["grad"]
    return '<div class="hcover" style="background:linear-gradient(135deg,%s,%s)"><span>%s</span></div>' % (a,b,u["emoji"])

import re as _re, urllib.parse as _up
def video_html(u, meta=None):
    """Секция «Видео юнита». Если задан u['video'] (ссылка YouTube/Vimeo) — встраиваем плеер.
    Иначе, если задан u['video_query'] — кнопка на поиск нужного видео. Если ничего нет — пусто
    (страницы Speakout не меняются, у них поля video нет)."""
    url = (u.get("video") or "").strip()
    title = u.get("video_title") or "Видео учебника к юниту"
    if url:
        src = None
        m = _re.search(r'(?:youtube\.com/(?:watch\?[^#]*v=|embed/|shorts/|live/)|youtu\.be/)([\w-]{6,})', url)
        if m: src = "https://www.youtube-nocookie.com/embed/" + m.group(1)
        else:
            m = _re.search(r'vimeo\.com/(\d+)', url)
            if m: src = "https://player.vimeo.com/video/" + m.group(1)
        if not src: src = url
        return ('\n  <h2>🎬 Видео юнита</h2>\n'
                '  <div class="vidwrap"><iframe src="%s" title="%s" loading="lazy" '
                'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" '
                'allowfullscreen></iframe></div>\n' % (src, title.replace('"','&quot;')))
    q = (u.get("video_query") or "").strip()
    if not q and meta and meta.get("prefix") == "focus-1":
        q = "Focus 1 Second Edition Unit %s %s video" % (u["n"], u["title"])
    if q:
        link = "https://www.youtube.com/results?search_query=" + _up.quote(q)
        return ('\n  <h2>🎬 Видео юнита</h2>\n'
                '  <div class="vidcard">📺 Официальное видео Focus к этому юниту.<br>'
                '<a class="vidbtn" href="%s" target="_blank" rel="noopener">▶ Открыть видео на YouTube</a></div>\n' % link)
    return ""

def build(mod_name):
    mod=importlib.import_module(mod_name)
    DATA=mod.DATA; META=mod.META
    for u in DATA:
        h=TEMPLATE
        rep={
          "@@NUM@@":str(u["n"]), "@@TITLE@@":u["title"], "@@LEVEL@@":META["level"],
          "@@EMOJI@@":u["emoji"], "@@DESC@@":u["desc"], "@@HUB@@":META["hub"], "@@TRAINER@@":META["trainer"],
          "@@COVER@@":cover_html(u,META),
          "@@GRAMMAR@@":u.get("grammar_html") or grammar_html(u["grammar"]),
          "@@PRONFOCUS@@":u["pron_focus"], "@@PRONNOTE@@":u["pron_note"],
          "@@VIDEO@@":video_html(u, META), "@@WORDSKILLS@@":wordskills_html(u), "@@WRITING@@":writing_html(u),
          "@@LISTEN2@@":listen2_html(u), "@@READ2@@":reading2_html(u),
          "@@LISTEN_TITLE@@":u["listen_title"], "@@SCRIPT@@":u.get("script_raw") or script_html(u["dialog"],u["names"]),
          "@@READ_TITLE@@":u["reading_title"], "@@READ@@":u["reading"],
          "@@HOWTO_TITLE@@":u["howto_title"], "@@HOWTO@@":u["howto"],
          "@@HW@@":u["hw"], "@@HWCOURSE@@":META["prefix"], "@@DATA@@":data_js(u, META), "@@RENDER@@":RENDER,
        }
        for k,v in rep.items(): h=h.replace(k,v)
        # финальная зачистка токенов, оказавшихся внутри RENDER
        h=h.replace("@@HWCOURSE@@", META["prefix"]).replace("@@NUM@@", str(u["n"]))
        fn="%s-u%d.html" % (META["prefix"], u["n"])
        open(fn,"w",encoding="utf-8").write(h)
        print("wrote",fn)
        # грамматическая страница (ДЗ)
        g=GRAMMAR_TEMPLATE
        for k,v in rep.items(): g=g.replace(k,v)
        g=g.replace("@@HWCOURSE@@", META["prefix"]).replace("@@NUM@@", str(u["n"]))
        gfn="%s-u%d-grammar.html" % (META["prefix"], u["n"])
        open(gfn,"w",encoding="utf-8").write(g)
        print("wrote",gfn)
        # workbook-страница
        wbp=WORKBOOK_TEMPLATE
        for k,v in rep.items(): wbp=wbp.replace(k,v)
        wbp=wbp.replace("@@HWCOURSE@@", META["prefix"]).replace("@@NUM@@", str(u["n"]))
        wfn="%s-u%d-workbook.html" % (META["prefix"], u["n"])
        open(wfn,"w",encoding="utf-8").write(wbp)
        print("wrote",wfn)

if __name__=="__main__":
    build(sys.argv[1])
