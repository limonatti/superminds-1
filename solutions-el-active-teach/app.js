
/* pdf-страница = книжная страница + 1 */
const BOOKS={
 sb:{dir:"pages/sb/",units:[
  {t:"📖 Обложка · Contents",p:[1,4]},
  {t:"I · Introduction",p:[5,8],u:0},
  {t:"1 · Family and friends",p:[9,18],u:1},
  {t:"2 · School days",p:[19,28],u:2},
  {t:"Exam Skills Trainer 1",p:[29,30]},
  {t:"3 · Style",p:[31,40],u:3},
  {t:"4 · Food",p:[41,50],u:4},
  {t:"Exam Skills Trainer 2",p:[51,52]},
  {t:"5 · In the city",p:[53,62],u:5},
  {t:"6 · Going wild",p:[63,72],u:6},
  {t:"Exam Skills Trainer 3",p:[73,74]},
  {t:"7 · Digital world",p:[75,84],u:7},
  {t:"8 · Be active!",p:[85,94],u:8},
  {t:"Exam Skills Trainer 4",p:[95,96]},
  {t:"9 · Home sweet home!",p:[97,106],u:9},
  {t:"Exam Skills Trainer 5",p:[107,108]},
  {t:"Culture Bank",p:[109,117]},
  {t:"Vocabulary Builder",p:[118,122]},
  {t:"Grammar Builder & Reference",p:[123,142]},
  {t:"Extra Speaking Tasks",p:[143,143]},
  {t:"Irregular verbs",p:[144,144]},
  {t:"DVD Worksheets",p:[145,164]}]},
 wb:{dir:"pages/wb/",units:[
  {t:"📖 Обложка",p:[1,4]},
  {t:"I · Introduction",p:[5,8],u:0},
  {t:"1 · Family and friends",p:[9,18],u:1},
  {t:"2 · School days",p:[19,28],u:2},
  {t:"Exam Skills Trainer 1",p:[29,30]},
  {t:"3 · Style",p:[31,40],u:3},
  {t:"4 · Food",p:[41,50],u:4},
  {t:"Exam Skills Trainer 2",p:[51,52]},
  {t:"5 · In the city",p:[53,62],u:5},
  {t:"6 · Going wild",p:[63,72],u:6},
  {t:"Exam Skills Trainer 3",p:[73,74]},
  {t:"7 · Digital world",p:[75,84],u:7},
  {t:"8 · Be active!",p:[85,94],u:8},
  {t:"Exam Skills Trainer 4",p:[95,96]},
  {t:"9 · Home sweet home!",p:[97,106],u:9},
  {t:"Exam Skills Trainer 5",p:[107,108]},
  {t:"Cumulative Review",p:[109,118]},
  {t:"Writing Bank",p:[119,120]},
  {t:"Functions Bank",p:[121,122]},
  {t:"Wordlist",p:[123,128]},
  {t:"Irregular verbs",p:[129,129]}]}
};
const DATA=window.SOL||{sb:[],wb:[],video:[]};
const params=new URLSearchParams(location.search);
let book=params.get('book')==='wb'?'wb':'sb',ui=1,page=5;
const $=id=>document.getElementById(id);
const unitsEl=$("units"),img=$("pgimg"),info=$("pginfo"),thumbs=$("thumbs");
const enc=u=>u.split("/").map(encodeURIComponent).join("/");
const bookPage=()=>page-1;

document.querySelectorAll(".bkbtn").forEach(b=>b.onclick=()=>{
  const unit=BOOKS[book].units[ui].u;
  book=b.dataset.b;
  ui=Math.max(0,BOOKS[book].units.findIndex(u=>u.u===(unit??0)));
  renderUnits();openUnit(ui);
});
function selectPage(nextBook,printedPage){
  if(!BOOKS[nextBook]||!Number.isInteger(printedPage))return false;
  const pdf=printedPage+1,idx=BOOKS[nextBook].units.findIndex(u=>pdf>=u.p[0]&&pdf<=u.p[1]);
  if(idx<0)return false;
  book=nextBook;ui=idx;page=pdf;renderUnits();renderThumbs();show();return true;
}
function syncLocation(){
  const u=BOOKS[book].units[ui],url=new URL(location.href);
  url.searchParams.set('book',book);url.searchParams.set('page',bookPage());
  if(Number.isInteger(u.u))url.searchParams.set('unit',u.u);else url.searchParams.delete('unit');
  history.replaceState(null,'',url);
  document.querySelectorAll('.bkbtn').forEach(b=>{b.classList.toggle('on',b.dataset.b===book);b.setAttribute('aria-pressed',String(b.dataset.b===book));});
  $('jump').value=bookPage();$('jump').max=BOOKS[book].units.at(-1).p[1]-1;
  $('practice').href='../solutions-el-u'+(u.u??0)+'.html';
  $('lessonLink').href='../room.html?course=solutions-el&unit='+(u.u??0);
  img.alt=(book==='sb'?"Student’s Book":"Workbook")+' · '+u.t+' · страница '+bookPage();
  $('prev').disabled=ui===0&&page===u.p[0];
  $('next').disabled=ui===BOOKS[book].units.length-1&&page===u.p[1];
}

function renderUnits(){unitsEl.innerHTML="";BOOKS[book].units.forEach((u,i)=>{
  const c=document.createElement("button");c.className="uchip"+(i===ui?" on":"");c.textContent=u.t;
  c.onclick=()=>{ui=i;renderUnits();openUnit(i);};unitsEl.appendChild(c);});}
function pad(n){return String(n).padStart(3,"0");}
function src(n){return BOOKS[book].dir+pad(n)+".jpg";}
function openUnit(i){page=BOOKS[book].units[i].p[0];renderThumbs();show();}
function renderThumbs(){const u=BOOKS[book].units[ui];thumbs.innerHTML="";
  for(let n=u.p[0];n<=u.p[1];n++){const t=document.createElement("img");t.loading="lazy";t.src=src(n);t.dataset.n=n;
    t.title="стр. "+(n-1);t.onclick=()=>{page=n;show();};thumbs.appendChild(t);}}
function show(){resetZoom();img.src=src(page);const u=BOOKS[book].units[ui];
  info.textContent=u.t+" · стр. "+bookPage();
  [...thumbs.children].forEach(t=>t.classList.toggle("on",+t.dataset.n===page));
  const cur=[...thumbs.children].find(t=>+t.dataset.n===page);
  if(cur&&cur.scrollIntoView)try{cur.scrollIntoView({inline:"center",block:"nearest",behavior:"smooth"});}catch(e){}
  renderTracks();renderVids();syncLocation();}
$("prev").onclick=()=>{const u=BOOKS[book].units[ui];if(page>u.p[0]){page--;show();}
  else if(ui>0){ui--;renderUnits();renderThumbs();page=BOOKS[book].units[ui].p[1];show();}};
$("next").onclick=()=>{const u=BOOKS[book].units[ui];if(page<u.p[1]){page++;show();}
  else if(ui<BOOKS[book].units.length-1){ui++;renderUnits();openUnit(ui);}};
document.addEventListener("keydown",e=>{if(e.target.closest('input,select,textarea,button,a,audio,video,[contenteditable]'))return;
  if(e.key==='Escape'){closeVideo();resetZoom();return;}
  if(['ArrowLeft','ArrowRight'].includes(e.key))e.preventDefault();
  if(e.key==="ArrowLeft")$("prev").click();if(e.key==="ArrowRight")$("next").click();});
$("jump").onchange=e=>{
  if(!selectPage(book,Number(e.target.value))){$('mediaStatus').textContent='Нет такой страницы';e.target.value=bookPage();}
};
img.addEventListener('load',()=>{$('mediaStatus').textContent='';});
img.addEventListener('error',()=>{$('mediaStatus').textContent='Страница не загрузилась. Проверьте соединение и откройте её ещё раз.';});
/* зум */
let z=1,tx=50,ty=50,drag=null,skipClick=false;
function resetZoom(){z=1;img.classList.remove("zoomed");img.style.transform="";}
img.addEventListener("click",e=>{if(skipClick){skipClick=false;return;}
  const r=img.getBoundingClientRect();
  if(z===1){tx=(e.clientX-r.left)/r.width*100;ty=(e.clientY-r.top)/r.height*100;z=2.4;
    img.style.transformOrigin=tx+"% "+ty+"%";img.style.transform="scale("+z+")";img.classList.add("zoomed");}
  else resetZoom();});
img.addEventListener("wheel",e=>{if(z===1)return;e.preventDefault();
  z=Math.min(5,Math.max(1.2,z+(e.deltaY<0?0.3:-0.3)));img.style.transform="scale("+z+")";},{passive:false});
img.addEventListener("pointerdown",e=>{if(z===1)return;drag={x:e.clientX,y:e.clientY,tx,ty,moved:false};img.setPointerCapture(e.pointerId);});
img.addEventListener("pointermove",e=>{if(!drag)return;const r=img.getBoundingClientRect();
  const dx=(e.clientX-drag.x),dy=(e.clientY-drag.y);
  if(Math.abs(dx)+Math.abs(dy)>4)drag.moved=true;
  tx=Math.min(100,Math.max(0,drag.tx-dx/(r.width/z)*100));ty=Math.min(100,Math.max(0,drag.ty-dy/(r.height/z)*100));
  img.style.transformOrigin=tx+"% "+ty+"%";});
function endDrag(){skipClick=Boolean(drag&&drag.moved);drag=null;}
img.addEventListener('pointerup',endDrag);img.addEventListener('pointercancel',endDrag);
/* аудио */
function playTrack(t,btn){document.querySelectorAll(".trk").forEach(x=>x.classList.remove("on"));
  if(btn)btn.classList.add("on");
  const a=$("aud");closeVideo();a.src=enc(t.f);a.playbackRate=+$("spd").value;playMedia(a);
  $("ptitle").textContent="Аудио "+t.t+" · "+(book==="wb"?"≈ ":"")+"стр. "+(t.p||"—");}
function trackBtn(t){const b=document.createElement("button");b.className="trk";
  const approx=(book==="wb")?"≈ ":"";
  b.innerHTML='<span class="num">'+t.t+'</span>Аудио '+t.t+'<span class="pg">'+approx+'стр. '+(t.p||"?")+'</span>';
  b.onclick=()=>playTrack(t,b);return b;}
function renderTracks(){
  const all=DATA[book]||[],u=BOOKS[book].units[ui],bp=bookPage();
  const pgBox=$("pgtracks"),unBox=$("tracks");
  const win=(book==="wb")?2:0;
  $("pgh").textContent=(book==="wb")?"🎧 Аудио рядом с этой страницей (≈)":"🎧 Аудио этой страницы";
  const onPage=all.filter(t=>Math.abs(t.p-bp)<=win);
  pgBox.innerHTML="";
  if(onPage.length)onPage.forEach(t=>pgBox.appendChild(trackBtn(t)));
  else pgBox.innerHTML='<div class="hint">На этой странице аудио нет</div>';
  const lo=u.p[0]-1,hi=u.p[1]-1;
  const inUnit=all.filter(t=>t.p>=lo&&t.p<=hi);
  unBox.innerHTML="";
  if(inUnit.length)inUnit.forEach(t=>unBox.appendChild(trackBtn(t)));
  else unBox.innerHTML='<div class="hint">В этом разделе аудио нет</div>';}
function renderVids(){const u=BOOKS[book].units[ui],box=$("vids");box.innerHTML="";
  const list=(DATA.video||[]).filter(v=>u.u&&v.u===u.u);
  if(!list.length){box.innerHTML='<div class="hint">Видео к этому разделу нет</div>';return;}
  list.forEach(v=>{const b=document.createElement("button");b.className="trk";
    b.innerHTML='<span class="num">🎬</span>'+v.n;
    b.onclick=()=>{$("aud").pause();$("vid").src=enc(v.f);$("voverlay").style.display="flex";$("vclose").focus();playMedia($("vid"));};
    box.appendChild(b);});}
$("spd").onchange=()=>{$("aud").playbackRate=+$("spd").value;};
function closeVideo(){$("vid").pause();$("voverlay").style.display="none";}
function playMedia(media){$('mediaStatus').textContent='';media.play().catch(e=>{if(e.name!=='AbortError')$('mediaStatus').textContent='Нажмите ▶ в плеере, чтобы включить запись.';});}
for(const media of [$('aud'),$('vid')])media.addEventListener('error',()=>{$('mediaStatus').textContent='Запись не загрузилась. Проверьте соединение и выберите её ещё раз.';});
$("vclose").onclick=closeVideo;
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeVideo();});
$("sideToggle").onclick=()=>{$("sideToggle").setAttribute("aria-expanded",String($("side").classList.toggle("open")));};
const requestedUnit=params.has('unit')?Number(params.get('unit')):0;
ui=Math.max(0,BOOKS[book].units.findIndex(u=>u.u===requestedUnit));
if(!(params.has('page')&&selectPage(book,Number(params.get('page'))))){renderUnits();openUnit(ui);}
if(params.get('embedded')==='1'&&parent!==window&&['t','s'].includes(params.get('lessonRole'))){
  $('lessonLink').hidden=true;
  window.LiveCourse.connect({course:'solutions-el',view:()=>({book,page:bookPage(),exercise:null}),answer:()=>null,host:()=>null,apply:view=>selectPage(view.book,view.page)});
}

