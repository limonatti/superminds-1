const fs=require('node:fs'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const P=require('../course-practice.js'),A=require('../course-authored.js'),G=require('../sm-progress.js');
const {PGlite}=require('@electric-sql/pglite');
(async()=>{
 const e={id:randomUUID(),type:'reading'},items=[{text:'Story',qs:[0,1,2].map(i=>({q:'Question '+i,opts:['yes','no'],correct:0}))}];
 const key=`authored:${e.id}:0`,records={[key]:{values:['0','',''],results:['correct','blank','blank']}};
 assert(G.collect(e,items,records).incomplete,'one of three is not complete, regardless of any pause');
 records[key]={values:['0','1','0'],results:['correct','incorrect','correct']};
 let result=G.collect(e,items,records);assert.equal(result.correct,false);assert.equal(result.details.answered,3);assert.equal(result.details.correct,2);
 records[key]={values:['0','0','0'],results:['correct','correct','correct']};assert(G.collect(e,items,records).correct);
 assert(G.collect(e,[...items,...items],records).incomplete,'all authored blocks must be checked');
 assert(G.collect({id:'open',type:'open'},[{q:'Opinion'}],{}).review,'manual writing is never automatically graded');
 // Retry unchanged checks only after an actual rejection; edits count as a new attempt.
 let calls=0,fail=true;const store={user:{id:'a'},records};global.CoursePractice.storeFor=()=>({store});
 global.SM={saveAttempt:async()=>{calls++;return fail?{ok:false,error:'offline'}:{ok:true,pending:true}}};
 assert.equal((await G.report({course:'c',unit:'u'},e,items)).ok,false);
 fail=false;await G.report({course:'c',unit:'u'},e,items);await G.report({course:'c',unit:'u'},e,items);assert.equal(calls,2);
 records[key].values[1]='1';await G.report({course:'c',unit:'u'},e,items);assert.equal(calls,3);
 records[key].values[1]='';await G.report({course:'c',unit:'u'},e,items);assert.equal(calls,3);
 // Real PostgreSQL: the attempt and receipt must commit or roll back together.
 const db=new PGlite(),uid='00000000-0000-0000-0000-000000000001';
 await db.exec(`create role anon;create role authenticated;create schema auth;grant usage on schema auth to authenticated;
 create table auth.users(id uuid primary key);insert into auth.users values('${uid}');
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create table progress(user_id uuid primary key,data jsonb not null default '{}',updated_at timestamptz not null default now());
 alter table progress enable row level security;create policy own on progress to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);grant select,insert,update on progress to authenticated;
 create table attempts(id bigint generated always as identity primary key,student_id uuid not null references auth.users,course text,unit_id text,exercise_id uuid,ex_type text,correct boolean,created_at timestamptz not null default now());
 alter table attempts enable row level security;create policy own_read on attempts for select to authenticated using(student_id=auth.uid());create policy own_insert on attempts for insert to authenticated with check(student_id=auth.uid());grant select,insert on attempts to authenticated;`);
 for(const suffix of ['_durable_learning_progress.sql','_exercise_attempt_events.sql']){const file=fs.readdirSync('supabase/migrations').find(x=>x.endsWith(suffix));await db.exec(fs.readFileSync('supabase/migrations/'+file,'utf8'));}
 await db.exec(`set role authenticated;select set_config('request.jwt.claim.sub','${uid}',false);`);
 const event={id:randomUUID(),at:Date.now(),actions:[{type:'attempt',attempt:{course:'c',unit_id:'u',exercise_id:e.id,ex_type:'reading',correct:false,details:result.details}}]};
 const apply=events=>db.query('select apply_learning_events($1,$2)',[uid,JSON.stringify(events)]);
 await apply([event]);await apply([event]);let rows=(await db.query('select * from attempts')).rows;assert.equal(rows.length,1);assert.equal(rows[0].correct,false);assert.equal(rows[0].details.correct,2);
 const next={...event,id:randomUUID(),actions:[{type:'attempt',attempt:{...event.actions[0].attempt,correct:true}}]};await apply([next]);assert.equal((await db.query('select * from attempts')).rows.length,2);
 const bad={...event,id:randomUUID(),actions:[...event.actions,{type:'invalid'}]};await assert.rejects(apply([bad]),/Unknown action/);assert.equal((await db.query('select * from attempts')).rows.length,2);
 assert.equal((await db.query('select * from learning_event_receipts where event_id=$1',[bad.id])).rows.length,0);
 await assert.rejects(db.query('select apply_learning_events($1,$2)',[randomUUID(),JSON.stringify([event])]),/Not authorized/);
 await db.exec('reset role;set role anon');await assert.rejects(apply([event]),/permission denied/);
 await db.close();console.log('PASS complete multi-question/multi-block assessment, blank/manual exclusion, changed retries, rejected-save retry, atomic persistence, deduplication and RLS.');
})().catch(e=>{console.error(e);process.exitCode=1});
