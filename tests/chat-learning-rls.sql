-- Everything is rolled back, including synthetic accounts and queued push jobs.
-- No real pupils or teachers are used.
begin;
select set_config('test.teacher',gen_random_uuid()::text,true),set_config('test.student',gen_random_uuid()::text,true),set_config('test.outsider',gen_random_uuid()::text,true),set_config('test.homework',gen_random_uuid()::text,true);
insert into auth.users(id) values(current_setting('test.teacher')::uuid),(current_setting('test.student')::uuid),(current_setting('test.outsider')::uuid);
insert into public.profiles(user_id,name,role) values(current_setting('test.teacher')::uuid,'QA rollback teacher','teacher'),(current_setting('test.student')::uuid,'QA rollback student','student'),(current_setting('test.outsider')::uuid,'QA rollback outsider','student');
insert into public.enrolments(teacher_id,student_id,course) values(current_setting('test.teacher')::uuid,current_setting('test.student')::uuid,'speakout-b1');
select set_config('request.jwt.claim.sub',current_setting('test.teacher'),true);
set local role authenticated;
select public.assign_homework(current_setting('test.homework')::uuid,current_setting('test.student')::uuid,'speakout-b1',1,'{"textbookExercises":["sb:8:1A"]}',true);
select public.assign_homework(current_setting('test.homework')::uuid,current_setting('test.student')::uuid,'speakout-b1',1,'{"textbookExercises":["sb:8:1A"]}',true);
insert into storage.objects(bucket_id,name,owner) values('chat-recordings',current_setting('test.teacher')||'/'||current_setting('test.student')||'/'||current_setting('test.teacher')||'/test.webm',current_setting('test.teacher')::uuid);
do $$ begin
 if (select count(*) from public.hw where id=current_setting('test.homework')::uuid)<>1 then raise exception 'Duplicate assignment'; end if;
 if (select count(*) from public.messages where homework_id=current_setting('test.homework')::uuid)<>1 then raise exception 'Duplicate card'; end if;
 if has_function_privilege('anon','public.assign_homework(uuid,uuid,text,integer,text,boolean)','EXECUTE') then raise exception 'Anonymous assignment access'; end if;
end $$;
select set_config('request.jwt.claim.sub',current_setting('test.student'),true);
update public.messages set body='rewritten',media_meta='{"recording":"circle"}' where id=current_setting('test.homework')::uuid;
do $$ begin
 if not exists(select 1 from public.messages where id=current_setting('test.homework')::uuid and body='Домашнее задание' and read_at is not null and media_meta='{}') then raise exception 'Recipient overwrote message'; end if;
 if (select count(*) from storage.objects where bucket_id='chat-recordings' and name like current_setting('test.teacher')||'/%')<>1 then raise exception 'Recipient cannot read recording'; end if;
 begin
  perform public.share_homework(current_setting('test.homework')::uuid);
  raise exception 'Student shared teacher assignment';
 exception when raise_exception then if sqlerrm='Student shared teacher assignment' then raise; end if; end;
end $$;
select set_config('request.jwt.claim.sub',current_setting('test.outsider'),true);
do $$ begin
 if exists(select 1 from public.messages where id=current_setting('test.homework')::uuid) then raise exception 'Outsider sees card'; end if;
 if exists(select 1 from storage.objects where bucket_id='chat-recordings' and name like current_setting('test.teacher')||'/%') then raise exception 'Outsider sees recording'; end if;
 begin
  insert into storage.objects(bucket_id,name,owner) values('chat-recordings',current_setting('test.teacher')||'/'||current_setting('test.student')||'/'||current_setting('test.outsider')||'/forged.webm',current_setting('test.outsider')::uuid);
  raise exception 'Outsider uploaded to conversation';
 exception when insufficient_privilege then null; end;
end $$;
rollback;
select 'PASS: atomic idempotent homework/card, private recording access, recipient acknowledgement, anonymous/outsider denial. Synthetic data rolled back.' as result;
