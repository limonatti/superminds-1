const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const data={window:{}};vm.runInNewContext(fs.readFileSync('course-words.js','utf8'),data);
const c=data.window.COURSE_WORDS['outcomes-beginner'];assert.equal(c.units.length,12);assert.equal(c.units.reduce((n,u)=>n+u.words.length,0),848);c.units.forEach((u,i)=>{assert.equal(u.n,i+1);assert(u.words.every(p=>p[0]&&p[1]));assert.equal(new Set(u.words.map(p=>p[0].toLowerCase())).size,u.words.length)});
const manifest={window:{}};vm.runInNewContext(fs.readFileSync('outcomes-beginner-active-teach/assets/exercises.js','utf8'),manifest);const bank=manifest.window.OUTCOMES_EXERCISES;
const ids=new Set();for(const tasks of Object.values(bank))for(const t of tasks){assert(!ids.has(t.id));ids.add(t.id);assert(t.x>=0&&t.x<1&&t.y>0&&t.y<1);assert(t.count>=1&&t.count<=20)}
const src=fs.readFileSync('sm-auth.js','utf8');const methods=src.slice(src.indexOf('async loadCourseWork('),src.indexOf('/* ---------- Умное повторение'));
let stored={word42:{status:'learned'},__coursework:{other:{x:{values:['keep']}}}}, failRead=false,writes=0;
const client={from(name){
 assert.equal(name,'progress');
 return {
  select(){return {eq(){return {maybeSingle:async()=>failRead?{error:{message:'offline'}}:{data:{data:structuredClone(stored)}}};}};},
  async upsert(row){writes++;stored=row.data;return {error:null};}
 };
}};

const context={ensureClient:()=>client,api:null};vm.runInNewContext('api={'+methods+'}',context);context.api.getUser=async()=>({id:'student-a'});
(async()=>{let result=await context.api.saveCourseWork('outcomes-beginner',{'wb-5-test':{values:['answer'],updatedAt:5}},'student-a');assert(result.ok);assert.equal(stored.word42.status,'learned');assert.equal(stored.__coursework.other.x.values[0],'keep');assert.equal(stored.__coursework['outcomes-beginner']['wb-5-test'].values[0],'answer');
await context.api.saveCourseWork('outcomes-beginner',{'wb-5-test':{values:['older'],updatedAt:1}},'student-a');assert.equal(stored.__coursework['outcomes-beginner']['wb-5-test'].values[0],'answer');
const before=writes;failRead=true;result=await context.api.saveCourseWork('outcomes-beginner',{},'student-a');assert.equal(result.ok,false);assert.equal(writes,before);failRead=false;
result=await context.api.saveCourseWork('outcomes-beginner',{},'student-b');assert.equal(result.ok,false);assert.equal(writes,before);
console.log('Outcomes: 848 cards, 12 units, unique hotspots; save isolation, merge and failure checks passed.');})().catch(e=>{console.error(e);process.exitCode=1});
const hw=fs.readFileSync('homework.html','utf8');const route={};vm.runInNewContext(hw.slice(hw.indexOf('function partHref('),hw.indexOf('function parseNote(')),route);
for(let u=1;u<=12;u++){assert.equal(route.partHref('outcomes-beginner',u,'workbook'),`outcomes-beginner-active-teach/index.html?book=wb&unit=${u}`);assert(route.partHref('outcomes-beginner',u,'grammar').endsWith(`&page=${117+2*(u-1)}`));}assert.equal(route.partHref('focus-1',3,'workbook'),'focus-1-u3-workbook.html');
