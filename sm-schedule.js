/* Calendar dates are Moscow dates; instants always have an explicit UTC offset. */
(function(root){
'use strict';
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const parse=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d,12);};
function today(now=new Date()){
 const p=Object.fromEntries(new Intl.DateTimeFormat('en',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).map(p=>[p.type,p.value]));
 return p.year+'-'+p.month+'-'+p.day;
}
function weekDates(now=new Date(),offset=0){
 const monday=parse(today(now));monday.setDate(monday.getDate()-(monday.getDay()+6)%7+offset*7);
 return Array.from({length:7},(_,i)=>{const d=new Date(monday);d.setDate(d.getDate()+i);return d;});
}
const when=(date,time)=>new Date((typeof date==='string'?date:iso(date))+'T'+String(time||'00:00').slice(0,5)+':00+03:00');
function occurrences(lessons,changes,from,to,includeCancelled=false){
 const result=[],byId=new Map(lessons.map(l=>[l.id,l])),overrides=new Map(changes.map(c=>[c.lesson_id+':'+c.on_date,c]));
 function add(lesson,day,at,originalDate,change){
  const instant=when(day,at);if(!Number.isFinite(+instant))return;
  result.push({lesson,date:parse(day),dateIso:day,at,when:instant,originalDate,change});
 }
 for(let date=parse(from);iso(date)<=to;date.setDate(date.getDate()+1)){
  const day=iso(date),weekday=(date.getDay()+6)%7+1;
  for(const lesson of lessons){
   if(lesson.active===false||lesson.weekday!==weekday)continue;
   const change=overrides.get(lesson.id+':'+day);
   if(change?.status==='moved')continue;
   if(change?.status==='cancelled'&&!includeCancelled)continue;
   add(lesson,day,lesson.at_msk,day,change||null);
  }
 }
 // Include incoming moves even when their original dates lie outside this window.
 for(const change of changes){
  const lesson=byId.get(change.lesson_id),day=change.new_date||change.on_date;
  if(change.status!=='moved'||!lesson||lesson.active===false||day<from||day>to)continue;
  add(lesson,day,change.new_at_msk||lesson.at_msk,change.on_date,change);
 }
 return result.sort((a,b)=>a.when-b.when||a.lesson.id.localeCompare(b.lesson.id)||a.originalDate.localeCompare(b.originalDate));
}
function next(lessons,changes,now=new Date()){
 const from=today(now),end=parse(from);end.setDate(end.getDate()+14);
 return occurrences(lessons,changes,from,iso(end)).find(x=>x.when>now)||null;
}
root.SMSchedule={iso,parse,today,weekDates,when,occurrences,next};
if(typeof module!=='undefined')module.exports=root.SMSchedule;
})(typeof window==='undefined'?globalThis:window);
