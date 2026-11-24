-- Voice/video drafts stay private; homework cards reference one canonical hw row.
alter table public.messages add column if not exists media_meta jsonb not null default '{}'::jsonb;
alter table public.messages add column if not exists homework_id uuid;
create index if not exists messages_homework_idx on public.messages(homework_id) where homework_id is not null;

create or replace function public.guard_learning_message() returns trigger
language plpgsql set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    -- A recipient may only acknowledge receipt, never rewrite message content.
    if auth.uid() is not null and auth.uid() <> old.sender_id then
      new := old; new.read_at := coalesce(old.read_at, now());
    end if;
    if new.deleted_at is not null then new.media_meta := '{}'; new.homework_id := null; end if;
    return new;
  end if;
  if jsonb_typeof(new.media_meta) <> 'object' or octet_length(new.media_meta::text)>1024 then
    raise exception 'Invalid media metadata';
  end if;
  if new.att_url like 'chat-recordings:%' and new.att_url not like
      'chat-recordings:'||new.teacher_id||'/'||new.student_id||'/'||new.sender_id||'/%' then
    raise exception 'Recording belongs to another conversation';
  end if;
  if new.homework_id is not null and not exists (
    select 1 from public.hw h where h.id=new.homework_id and h.teacher_id=new.teacher_id
      and h.student_id=new.student_id and new.sender_id=h.teacher_id
  ) then raise exception 'Homework belongs to another conversation'; end if;
  return new;
end $$;
revoke all on function public.guard_learning_message() from public;
create trigger guard_learning_message before insert or update on public.messages
for each row execute function public.guard_learning_message();

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('chat-recordings','chat-recordings',false,26214400,
array['audio/webm','audio/ogg','audio/mp4','audio/mpeg','video/webm','video/mp4'])
on conflict(id) do nothing;
create policy recording_read on storage.objects for select to authenticated using (
  bucket_id='chat-recordings' and
  ((storage.foldername(name))[1]=auth.uid()::text or (storage.foldername(name))[2]=auth.uid()::text)
);
create policy recording_insert on storage.objects for insert to authenticated with check (
  bucket_id='chat-recordings' and (storage.foldername(name))[3]=auth.uid()::text and
  exists(select 1 from public.enrolments e where e.teacher_id::text=(storage.foldername(name))[1]
    and e.student_id::text=(storage.foldername(name))[2] and auth.uid() in (e.teacher_id,e.student_id))
);
create policy recording_delete on storage.objects for delete to authenticated using (
  bucket_id='chat-recordings' and (storage.foldername(name))[3]=auth.uid()::text
);

create or replace function public.share_homework(p_id uuid) returns uuid
language plpgsql security invoker set search_path=public as $$
declare h public.hw;
begin
  select * into h from public.hw where id=p_id and teacher_id=auth.uid();
  if h.id is null then raise exception 'Homework not found'; end if;
  insert into public.messages(id,teacher_id,student_id,sender_id,body,homework_id)
  values(h.id,h.teacher_id,h.student_id,h.teacher_id,'Домашнее задание',h.id)
  on conflict(id) do nothing;
  if not exists(select 1 from public.messages where id=h.id and homework_id=h.id) then raise exception 'Card request conflicts with another message'; end if;
  return h.id;
end $$;
revoke all on function public.share_homework(uuid) from public, anon;
grant execute on function public.share_homework(uuid) to authenticated;

create or replace function public.assign_homework(p_id uuid,p_student uuid,p_course text,p_unit integer,p_note text,p_share boolean default false)
returns uuid language plpgsql security invoker set search_path=public as $$
declare h public.hw;
begin
  if not exists(select 1 from public.enrolments where teacher_id=auth.uid() and student_id=p_student)
    or not exists(select 1 from public.profiles where user_id=auth.uid() and role in ('teacher','admin')) then
    raise exception 'Student is not in your class';
  end if;
  insert into public.hw(id,teacher_id,student_id,course,unit,note)
  values(p_id,auth.uid(),p_student,p_course,p_unit,p_note) on conflict(id) do nothing;
  select * into h from public.hw where id=p_id;
  if h.id is null or h.teacher_id<>auth.uid() or h.student_id<>p_student or h.course<>p_course
    or h.unit<>p_unit or h.note is distinct from p_note then raise exception 'Assignment changed; retry with a new request'; end if;
  if p_share then perform public.share_homework(h.id); end if;
  return h.id;
end $$;
revoke all on function public.assign_homework(uuid,uuid,text,integer,text,boolean) from public, anon;
grant execute on function public.assign_homework(uuid,uuid,text,integer,text,boolean) to authenticated;
