const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const {PGlite}=require(process.env.PGLITE_MODULE||'@electric-sql/pglite');const db=new PGlite();
 await db.exec(`create schema auth;create role anon;create role authenticated;create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('app.student_id',true),'')::uuid $$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;create table public.progress(user_id uuid primary key,data jsonb,updated_at timestamptz);alter table public.progress enable row level security;create policy owner on public.progress to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());grant select,insert,update on public.progress to authenticated;`);
 await db.exec(fs.readFileSync(require('node:path').join(__dirname,'../sql/coursework-atomic.sql'),'utf8'));
 const alice='00000000-0000-0000-0000-000000000001',bob='00000000-0000-0000-0000-000000000002';
 await db.exec(`set role authenticated;set app.student_id='${alice}';`);
 const save=(course,answers,id=alice)=>db.query('select public.save_course_work($1,$2,$3)',[id,course,JSON.stringify(answers)]);
 await save('a',{x:{values:['new'],updatedAt:2}});await save('b',{y:{values:['draft'],updatedAt:1}});await save('a',{x:{values:['old'],updatedAt:1},z:{values:['open'],updatedAt:3}});
 await db.query('select public.save_learning_progress($1,$2)',[alice,JSON.stringify({word:{seen:5},__coursework:{a:{}}})]);
 await db.query('update progress set data=$1',[JSON.stringify({word:{seen:5}})]);
 let data=(await db.query('select data from progress')).rows[0].data;assert.equal(data.__coursework.a.x.values[0],'new');assert(data.__coursework.a.z&&data.__coursework.b.y);assert.equal(data.word.seen,5);
 await assert.rejects(save('a',{x:{updatedAt:5}},bob),/Account changed/);
 await db.exec(`set app.student_id='${bob}';`);assert.equal((await db.query('select * from progress')).rows.length,0);await save('b',{own:{updatedAt:1}},bob);
 await db.exec(`set app.student_id='${alice}';`);data=(await db.query('select data from progress')).rows[0].data;assert(!data.__coursework.b.own);
 await assert.rejects(save('a',{bad:{values:[]}}),/updatedAt/);await db.exec('reset role;set role anon;');await assert.rejects(save('a',{}),/permission denied/);
 await db.close();console.log('PASS atomic course merge, stale record, vocabulary preservation, RLS identity/isolation and anonymous denial');
})().catch(e=>{console.error(e);process.exitCode=1});
