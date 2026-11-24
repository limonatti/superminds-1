// Run with @electric-sql/pglite in NODE_PATH. Uses an in-memory PostgreSQL only.
const fs=require('node:fs'),{PGlite}=require('@electric-sql/pglite');
(async()=>{const db=new PGlite();await db.exec(`
create role authenticated;create role anon;
create schema auth;create schema storage;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name,'/'))[1:array_length(string_to_array(name,'/'),1)-1] $$;
create table profiles(user_id uuid primary key references auth.users,name text,role text);
create table enrolments(id uuid default gen_random_uuid(),teacher_id uuid,student_id uuid,course text);
create table hw(id uuid primary key default gen_random_uuid(),teacher_id uuid references auth.users,student_id uuid references auth.users,course text,unit int,note text,done boolean default false,status text default 'new',feedback text,submitted_at timestamptz,reviewed_at timestamptz,created_at timestamptz default now());
create table messages(id uuid primary key default gen_random_uuid(),teacher_id uuid references auth.users,student_id uuid references auth.users,sender_id uuid references auth.users,body text,read_at timestamptz,created_at timestamptz default now(),att_url text,att_kind text,att_name text,att_size bigint,deleted_at timestamptz);
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets,name text,owner uuid);
alter table profiles enable row level security;alter table enrolments enable row level security;
create policy own_profile on profiles for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy enr_student_read on enrolments for select using(student_id=auth.uid());
create policy enr_teacher_all on enrolments for all using(teacher_id=auth.uid()) with check(teacher_id=auth.uid());
alter table hw enable row level security;alter table messages enable row level security;alter table storage.objects enable row level security;
create policy hw_student_rw on hw for select using(student_id=auth.uid());
create policy hw_teacher_all on hw for all using(teacher_id=auth.uid()) with check(teacher_id=auth.uid());
create policy hw_student_done on hw for update using(student_id=auth.uid()) with check(student_id=auth.uid());
create policy msg_read on messages for select using(auth.uid() in (teacher_id,student_id));
create policy msg_teacher_ins on messages for insert with check(sender_id=auth.uid() and teacher_id=auth.uid() and exists(select 1 from enrolments e where e.student_id=messages.student_id and e.teacher_id=auth.uid()));
create policy msg_student_ins on messages for insert with check(sender_id=auth.uid() and student_id=auth.uid() and exists(select 1 from enrolments e where e.teacher_id=messages.teacher_id and e.student_id=auth.uid()));
create policy msg_mark_read on messages for update using(auth.uid() in (teacher_id,student_id) and sender_id<>auth.uid()) with check(auth.uid() in (teacher_id,student_id) and sender_id<>auth.uid());
grant usage on schema public,auth,storage to authenticated,anon;grant all on all tables in schema public,storage to authenticated;
`);await db.exec(fs.readFileSync('supabase-chat-learning.sql','utf8'));const r=await db.exec(fs.readFileSync('tests/chat-learning-rls.sql','utf8'));console.log(r.at(-1).rows[0].result);await db.close();})().catch(e=>{console.error(e.message);process.exit(1)});
