const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const S=require('../sm-schedule.js');
const lessons=[{id:'mon',weekday:1,at_msk:'10:00',minutes:50},{id:'tue',weekday:2,at_msk:'11:00',minutes:50}];
const move=(id,from,to,time)=>({lesson_id:id,on_date:from,status:'moved',new_date:to,new_at_msk:time});
let changes=[move('mon','2026-11-02','2026-11-08','12:00')];
assert.equal(S.next(lessons,changes,new Date('2026-11-02T06:00:00Z')).dateIso,'2026-11-03');
let week=S.occurrences(lessons,changes,'2026-11-02','2026-11-08');
assert.equal(week.length,2);assert.deepEqual(week.map(x=>x.dateIso),['2026-11-03','2026-11-08']);
changes=[move('mon','2026-10-26','2026-11-04','23:30'),move('mon','2026-11-02','2026-11-16','12:00'),{lesson_id:'tue',on_date:'2026-11-03',status:'cancelled'}];
week=S.occurrences(lessons,changes,'2026-11-02','2026-11-08');assert.equal(week.length,1);assert.equal(week[0].originalDate,'2026-10-26');assert.equal(week[0].when.toISOString(),'2026-11-04T20:30:00.000Z');
assert.equal(S.occurrences(lessons,changes,'2026-11-02','2026-11-08',true).length,2);
assert.equal(S.next(lessons,[move('mon','2026-11-09','2026-11-02','09:00')],new Date('2026-11-02T05:00Z')).when.toISOString(),'2026-11-02T06:00:00.000Z');
assert.equal(S.today(new Date('2026-11-01T22:30Z')),'2026-11-02');assert.equal(S.iso(S.weekDates(new Date('2026-11-01T22:30Z'))[0]),'2026-11-02');
assert.equal(S.when('2026-11-02','00:30').toISOString(),'2026-11-01T21:30:00.000Z');
// The same Moscow calendar must work in all student browser time zones.
const {execFileSync}=require('node:child_process');
for(const tz of ['Pacific/Honolulu','America/New_York','Europe/Berlin','Asia/Tokyo']){
 const out=execFileSync(process.execPath,['-e',`const S=require('./sm-schedule');console.log(S.iso(S.weekDates(new Date('2026-11-01T22:30Z'))[0]),S.when('2026-11-02','00:30').toISOString())`],{env:{...process.env,TZ:tz}}).toString().trim();
 assert.equal(out,'2026-11-02 2026-11-01T21:30:00.000Z',tz);
}
// Inspect the actual API adapter: incoming moves, stable pages, errors surfaced.
const source=fs.readFileSync('sm-auth.js','utf8'),method=source.slice(source.indexOf('async lessonChanges('),source.indexOf('\n\tasync cancelLesson('));
let filter,calls=0,fail=false;const query={select(){return this},order(){return this},range(a,b){calls++;return this},or(f){filter=f;return this},then(resolve){return Promise.resolve(resolve(fail?{error:Error('offline')}:{data:calls===1?Array.from({length:200},(_,i)=>({id:i})):[]}));}};
const ctx={useCloud:true,ensureClient:()=>({from:()=>query})};vm.runInNewContext('api={'+method+'}',ctx);
(async()=>{assert.equal((await ctx.api.lessonChanges('2026-11-02','2026-11-08')).length,200);assert.equal(calls,2);assert.match(filter,/new_date.gte.2026-11-02/);assert.match(filter,/on_date.lte.2026-11-08/);fail=true;await assert.rejects(ctx.api.lessonChanges('2026-11-02','2026-11-08'),/offline/);console.log('PASS chronological nearest lesson, incoming/outgoing cross-week moves, cancellations, Moscow calendar across time zones and paginated API errors.');})().catch(e=>{console.error(e);process.exitCode=1});
