// PostgreSQL integration test. The fixture mirrors the inspected live schema;
// it contains synthetic accounts only and never connects to production.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {PGlite}=require('@electric-sql/pglite');
(async()=>{
 const db=new PGlite();
 await db.exec(`
 create role anon;create role authenticated;
 create schema auth;create schema realtime;create schema storage;
 grant usage on schema auth,realtime,storage to anon,authenticated;
 create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create table public.profiles(user_id uuid primary key,role text,is_owner boolean default false);
 create function public.is_platform_owner() returns boolean language sql stable security definer as $$select coalesce((select is_owner from public.profiles where user_id=auth.uid()),false)$$;
 insert into auth.users values('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002');
 insert into public.profiles values('00000000-0000-0000-0000-000000000001','teacher',true),('00000000-0000-0000-0000-000000000002','student',false);
 create table public.boards(room text primary key,data jsonb not null default '{}',updated_at timestamptz not null default now());
 alter table public.boards enable row level security;
 create policy boards_read on public.boards for select using(true);
 create policy boards_ins on public.boards for insert with check(true);
 create policy boards_upd on public.boards for update using(true) with check(true);
 grant all on public.boards to anon,authenticated;
 insert into public.boards(room,data) values('OLD01','{"pages":[[{"text":"preserve legacy work"}]]}');
 create table storage.buckets(id text primary key,public boolean);
 insert into storage.buckets values('board-images',true);
 create table storage.objects(bucket_id text,name text);
 alter table storage.objects enable row level security;
 grant select,insert on storage.objects to anon,authenticated;
 create function storage.foldername(name text) returns text[] language sql as $$select string_to_array(name,'/')$$;
 create policy board_img_read on storage.objects for select using(bucket_id='board-images');
 create policy board_img_write on storage.objects for insert with check(bucket_id='board-images');
 create table realtime.messages(extension text,topic text);
 alter table realtime.messages enable row level security;
 grant select,insert on realtime.messages to anon,authenticated;
 create function realtime.topic() returns text language sql stable as $$select current_setting('realtime.topic',true)$$;
 `);
 await db.exec(fs.readFileSync('sql/secure-lesson-rooms.sql','utf8'));
 await db.exec('begin;'+fs.readFileSync('tests/secure-rooms.sql','utf8')+'rollback;');
 const legacy=await db.query("select data,owner_id from public.boards where room='OLD01'");
 assert.equal(legacy.rows[0].data.pages[0][0].text,'preserve legacy work');assert.equal(legacy.rows[0].owner_id,null);
 const bucket=await db.query("select public from storage.buckets where id='board-images'");assert.equal(bucket.rows[0].public,false);
 // Real RLS evaluation for all three private channel types and storage paths.
 await db.exec(`begin;
 select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
 set local role authenticated;
 select public.open_lesson_room('OLD01');
 reset role;
 insert into public.board_members values('OLD01','00000000-0000-0000-0000-000000000002',now());
 insert into realtime.messages values('broadcast','fixture');
 select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
 set local role authenticated;
 select set_config('realtime.topic','lesson:OLD01',true);
 do $$begin
   if not exists(select 1 from realtime.messages) then raise exception 'pupil cannot receive teacher channel'; end if;
   begin
     insert into realtime.messages values('broadcast','fixture');
     raise exception 'pupil can publish teacher controls';
   exception when insufficient_privilege then null;end;
 end$$;
 select set_config('realtime.topic','lesson-student:OLD01',true);
 insert into realtime.messages values('broadcast','fixture');
 select set_config('realtime.topic','board:OLD01',true);
 insert into realtime.messages values('broadcast','fixture');
 insert into storage.objects values('board-images','OLD01/test.jpg');
 do $$begin
   begin
     insert into storage.objects values('board-images','FOREIGN/test.jpg');
     raise exception 'pupil wrote to foreign storage';
   exception when insufficient_privilege then null;end;
 end$$;
 reset role;set local role anon;
 do $$begin if exists(select 1 from storage.objects where bucket_id='board-images') then raise exception 'anonymous image enumeration';end if;end$$;
 rollback;`);
 await db.close();console.log('PostgreSQL: owner/member/guest RLS, invitation secrecy, teacher-only broadcasts, private image storage and legacy data preservation passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
