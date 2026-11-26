/* Inventory actual catalogue/source units. Unresolved boundaries are explicit;
 * a source page is never silently counted as a completed subsection quest. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');process.chdir(root);
const read=p=>fs.readFileSync(p,'utf8'),literal=(s,name)=>vm.runInNewContext('('+s.match(new RegExp('(?:const|let|var) '+name+'\\s*=\\s*(\\[[\\s\\S]*?\\n\\]);'))[1]+')');
const source=p=>{const c={window:{}};vm.runInNewContext(read(p),c);return Object.values(c.window)[0]};
const catalogue=literal(read('index.html'),'COURSES');
const releases=require('../quests/catalog.js');
const verified=new Set(releases.filter(q=>{const p='docs/quest-releases/'+q.id+'.json';return fs.existsSync(p)&&JSON.parse(read(p)).stage==='published-and-live-verified';}).map(q=>q.id));
const entries=[],units=[];
function add(c,id,title,book,pages,meta={}){entries.push({course:c,id,title,book,pages,status:'needs-authoring',web:null,pdf:null,...meta})}
function unit(c,n,title,ref){units.push({course:c,unit:String(n),title,source:ref,status:'needs-authoring',web:null,pdf:null})}
const info=[];
for(const c of catalogue){
 const id=c.id,start=entries.length,us=units.length;let sourcePath,mode='named-source-sections',gaps=[];
 if(['focus-1','focus-2','focus-3','focus-4','solutions-el','solutions-int'].includes(id)){
  sourcePath=id+'-active-teach/assets/course.js';const d=source(sourcePath);
  d.units.forEach((title,n)=>{if(title)unit(id,n,title,sourcePath)});
  mode='source-pages-with-boundary-review';
  for(const p of d.pages){
   if(p.unit==='extra'&&!p.exercises?.length)continue;
   add(id,p.id,p.title,p.book,[p.page],{unit:String(p.unit),source:sourcePath,sourceImage:p.image,sourceExerciseIds:(p.exercises||[]).map(e=>e.id),sourceExerciseCount:p.exercises?.length||0,boundaryStatus:'needs-subsection-mapping',sourceAvailable:true});
  }
  gaps.push('The page inventory is complete. Exact subsection boundaries still need source verification; page counts below are not subsection counts.');
  if(id==='focus-4'){
   const mapped=JSON.parse(read('docs/focus4-quest-section-map.json')).sections;
   const unitOne={'1.1':'Vocabulary · Live and learn','1.2':'Present and past habits','1.3':'Listening and memory','1.4':'Reading: the brain and skills','1.5':'Verb patterns','1.6':'Speaking: describing and speculating about photographs','1.7':'Use of English: formal and informal register','1.8':'Writing: a CV and covering email'};
   for(const section of mapped){const {code,pages}=section,title=unitOne[code]||section.title;for(const e of entries.filter(e=>e.course===id&&e.book==='sb'&&pages.includes(e.pages[0]))){e.subsection=code;e.boundaryStatus=section.boundaryStatus;}add(id,'sb-section-'+code,code+' '+title,'sb',pages,{unit:String(section.unit),source:sourcePath,boundaryStatus:section.boundaryStatus,kind:'subsection',sourceAvailable:true,teacherPdfPages:section.teacherPdfPages,sourceVerification:section.verification});}
   gaps[gaps.length-1]='All 64 Student’s Book lesson subsections are mapped to their source pages. Workbook, Word Store, reviews and reference boundaries still require separate mapping; unfilled lesson quests still require authoring.';

  }
 }else if(['speakout-a1','speakout-b1','speakout-b1plus'].includes(id)){
  sourcePath=id+'-active-teach/assets/'+(id==='speakout-a1'?'course-web.js':'course.js');const d=source(sourcePath);d.units.forEach((t,i)=>unit(id,i+1,t,sourcePath));
  for(const [book,b]of Object.entries(d.books))for(const lesson of new Set(b.pages.map(p=>p.lesson))){const ps=b.pages.filter(p=>p.lesson===lesson),m=String(lesson).match(/^(\d+)([ABCD])/),title=m?(d.titles?.[+m[1]-1]?.[m[2].charCodeAt(0)-65]||lesson):lesson;add(id,book+':'+lesson,lesson+' · '+title,book,ps.map(p=>p.page),{unit:m?.[1]||String(lesson).match(/^\d+/)?.[0]||'reference',source:sourcePath,kind:'subsection',boundaryStatus:'source-defined',sourceExerciseCount:ps.reduce((n,p)=>n+(p.exercises?.length||0),0),sourceAvailable:ps.every(p=>p.text||p.exercises?.length||p.image)});}
  if(Object.values(d.missingSourcePages||{}).some(a=>a?.length))gaps.push('Source importer reports missing pages: '+JSON.stringify(d.missingSourcePages));
 }else if(id==='speakout-b2plus'){
  sourcePath=id+'-active-teach/data/index.js';const d=source(sourcePath);Object.entries(d.unitNames).forEach(([n,t])=>unit(id,n,t,sourcePath));
  for(const l of d.lessons)for(const book of ['sb','wb'])add(id,book+':'+l.code,l.code+' · '+l.title,book,[l[book]],{unit:String(l.unit),source:sourcePath,kind:'subsection',boundaryStatus:'source-defined-start',sourceAvailable:true});
  for(const [n,r]of Object.entries(d.reviews))add(id,'sb:review-'+n,'Review '+n,'sb',[r.sb],{unit:n,source:sourcePath,kind:'subsection',boundaryStatus:'source-defined-start',sourceAvailable:true});
  for(const [key,value]of Object.entries(d.extras||{}))add(id,'reference:'+key,key,'reference',[],{source:sourcePath,sourceReference:value,boundaryStatus:'reference-needs-mapping'});
 }else if(id==='outcomes-beginner'){
  sourcePath=id+'-active-teach/assets/course.js';const d=source(sourcePath);d.units.forEach((t,i)=>unit(id,i+1,t,sourcePath));mode='source-pages-with-boundary-review';
  for(const [book,b]of Object.entries(d.books))for(const p of b.pages)add(id,book+':'+(p.page??'source-'+p.id),(p.text||'').split('\n').find(s=>s.trim())||book+' p.'+p.page,book,[p.page],{unit:String(p.unit),source:sourcePath,sourceImage:p.image,sourceAvailable:!!p.text,sourceExerciseCount:p.exercises?.length||0,boundaryStatus:'needs-subsection-mapping'});
  gaps.push('Subsection names and spreads need mapping from the source; all imported SB/WB pages are retained.');
 }else if(['solutions-pi','gateway-a1p'].includes(id)){
  sourcePath=id+'-course.html';const data=literal(read(sourcePath),'UNITS');
  for(const u of data){unit(id,u.n,u.t,sourcePath);for(const suffix of ['','-grammar','-workbook']){const file=id+'-u'+u.n+suffix+'.html';if(!fs.existsSync(file)){gaps.push('Missing platform source: '+file);continue;}const text=read(file);let n=0;for(const m of text.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)){const title=m[1].replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').trim();if(!title||title.includes('${'))continue;add(id,file+':h2-'+(++n),title,suffix||'lesson',[],{unit:String(u.n),source:file,kind:'platform-section',boundaryStatus:'platform-heading',sourceAvailable:true});}}}
  gaps.push('These are the current platform sections, not a claim that every original textbook subsection has been imported. Verify the edition and original subsection pages before authoring.');
 }else if(id==='superminds-1'){
  sourcePath='words.js';const chunk=read(sourcePath).match(/window\.SM_COURSE_DATA\["sm1"\]\s*=\s*(\[[\s\S]*?\n\]);/)[1],data=vm.runInNewContext('('+chunk+')');const groups=new Set();for(const u of data){if(!groups.has(u.unit)){groups.add(u.unit);unit(id,u.unit,u.title,sourcePath);}add(id,u.id,u.unit+' · '+u.title,'vocabulary',[],{unit:u.unit,source:sourcePath,kind:'platform-section',boundaryStatus:'source-defined',sourceAvailable:true,wordCount:u.words.length});}
  for(const file of ['unit2.html','unit3.html','studentbook.html','workbook.html'])if(fs.existsSync(file))add(id,'resource:'+file,file,'reference',[],{source:file,boundaryStatus:'needs-subsection-mapping'});
  gaps.push('The catalogue is vocabulary-led. Map the full original Student’s Book/Workbook sections and exact edition before claiming textbook-wide coverage.');
 }else if(id==='phonics'){
  sourcePath='phonics.html';const gs=literal(read(sourcePath),'GROUPS');for(const [i,g]of gs.entries()){unit(id,i+1,g.en,sourcePath);for(const s of g.sounds)add(id,s.id,s.disp+' '+s.ipa,'sound',[],{unit:String(i+1),source:sourcePath,kind:'subsection',boundaryStatus:'source-defined',sourceAvailable:true,wordCount:s.words.length});}
  const v=literal(read(sourcePath),'VOWELS');unit(id,'vowels','Long and short vowels',sourcePath);for(const vowel of v)add(id,'vowel:'+vowel.id,'Vowel '+vowel.id,'vowel',[],{unit:'vowels',source:sourcePath,kind:'subsection',boundaryStatus:'source-defined',sourceAvailable:true});
  gaps.push('Human-voice lesson audio must be supplied or located for each sound. Existing synthesis paths do not count as approved teaching audio.');
 }
 info.push({course:id,title:c.t,description:c.d,hub:c.hub,source:sourcePath,inventoryMode:mode,unitCount:units.length-us,sourceEntryCount:entries.length-start,gaps});
}
for(const q of releases){const target=q.scope==='unit'?units.find(u=>u.course===q.course&&u.unit===String(q.unit)):entries.find(e=>e.course===q.course&&e.id==='sb-section-'+(q.section.match(/^\d+\.\d+/)?.[0]||'unmapped'));if(!target)throw Error('No mapped course section for quest '+q.id);Object.assign(target,{status:verified.has(q.id)?'published':'ready-for-publication',quest:q.id,web:q.web,pdf:q.pdf});}
if(new Set(entries.map(e=>e.course+'|'+e.id)).size!==entries.length)throw Error('Duplicate inventory section IDs');
if(new Set(units.map(e=>e.course+'|'+e.unit)).size!==units.length)throw Error('Duplicate unit IDs');
const data={date:'2026-11-26',catalogueSource:'index.html COURSES',courseCount:info.length,unitFinalCount:units.length,sourceEntryCount:entries.length,readyPairs:releases.length,verifiedPublishedPairs:verified.size,limitations:'Source entries include page-level and reference rows. Their total must not be reported as an exact textbook-subsection denominator. Only explicitly verified/source-defined boundaries are named subsections.',courses:info,unitFinals:units,sourceEntries:entries,existingQuestsNeedingNewStandardReview:[{course:'focus-3',path:'focus-3-active-teach/lesson-kit/',status:'existing-web; separate printable PDF not verified'},{course:'speakout-b1plus',path:'speakout-b1plus-active-teach/review/',status:'existing two-unit review; separate printable PDF not verified'},{course:'speakout-a1',path:'speakout-a1-unit1-quest/',status:'existing-web; human-voice provenance and separate PDF need verification'},{course:'superminds-1',path:'quest.html',status:'existing generic quest; not counted as authored subsection coverage'}]};
fs.writeFileSync('docs/quest-coverage.json',JSON.stringify(data,null,2)+'\n');
const md=['# Реестр покрытия квестами','',`Дата: ${data.date}. Фактический каталог: **${info.length} курсов**. Реестр содержит **${units.length} юнитов/учебных групп** для итоговых квестов и **${entries.length} исходных записей** (именованные разделы, страницы, справочные блоки).`,`Готовых проверенных пар веб + PDF в новом каталоге: **${releases.length}**. Из них публикация и работа на живом сайте подтверждены для **${verified.size}**.`,'','Количество исходных записей **не равно** количеству подразделов учебника. Там, где данные платформы описывают только страницы, точные границы подразделов отмечены как требующие сверки. Все такие страницы перечислены в JSON, а не скрыты из охвата.','','| Курс | Юнитов / групп | Исходных записей | Новых готовых пар |','|---|---:|---:|---:|',...info.map(c=>`| ${c.title} | ${c.unitCount} | ${c.sourceEntryCount} | ${releases.filter(q=>q.course===c.course).length} |`),'','## Готовые материалы','',...releases.map(q=>`- ${q.courseTitle}, ${q.section}: [${q.title}](https://english-with-asya.com${q.web}) · [PDF](https://english-with-asya.com${q.pdf}) — ${verified.has(q.id)?'публикация проверена':'готово, проверка публикации ещё не подтверждена'}.`),'','## Точные пробелы и оставшаяся работа','',...info.flatMap(c=>c.gaps.length?[`**${c.title}**`,...c.gaps.map(g=>'- '+g),'']:[]),'Все непомеченные как опубликованные строки требуют авторских заданий, учебных иллюстраций, отдельного PDF и проверки. Наличие источника или общего плеера не считается готовым квестом.','', 'Существующие старые квесты учитываются отдельно до проверки их PDF, полного английского интерфейса, человеческих голосов и точного охвата. Расписание ежедневного аудита не изменялось.'];
fs.writeFileSync('docs/quest-coverage.md',md.join('\n')+'\n');console.log(JSON.stringify({courses:info.length,units:units.length,sourceEntries:entries.length,ready:releases.length,published:verified.size,byCourse:info.map(c=>({id:c.course,units:c.unitCount,entries:c.sourceEntryCount}))}));
