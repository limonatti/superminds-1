-- Preserve the existing progress / __coursework format read by teacher reports.
-- All writes run with the caller's RLS permissions. No student rows are migrated.
begin;
create or replace function public.merge_coursework_records(p_old jsonb, p_patch jsonb)
returns jsonb language sql immutable set search_path = '' as $$
  select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) from (
    select distinct on (key) key,value from (
      select key,value,0 as priority from jsonb_each(coalesce(p_old,'{}'::jsonb))
      union all
      select key,value,1 as priority from jsonb_each(p_patch)
    ) rows order by key,
      case when jsonb_typeof(value->'updatedAt')='number' then (value->>'updatedAt')::numeric else 0 end desc,
      priority desc
  ) latest;
$$;

create or replace function public.save_course_work(p_user uuid,p_course text,p_answers jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare saved jsonb;
begin
  if auth.uid() is null or auth.uid() <> p_user then raise exception 'Account changed'; end if;
  if p_course is null or p_course !~ '^[a-z0-9][a-z0-9_-]{0,63}$'
    or jsonb_typeof(p_answers) is distinct from 'object'
    or octet_length(p_answers::text)>1048576 then raise exception 'Invalid coursework patch'; end if;
  if exists(select 1 from jsonb_each(p_answers) e where jsonb_typeof(e.value) <> 'object'
    or jsonb_typeof(e.value->'updatedAt') is distinct from 'number') then
    raise exception 'Each answer requires updatedAt';
  end if;
  insert into public.progress as p(user_id,data,updated_at)
  values(p_user,jsonb_build_object('__coursework',jsonb_build_object(p_course,p_answers)),now())
  on conflict(user_id) do update set
    data=jsonb_set(coalesce(p.data,'{}'::jsonb),'{__coursework}',
      coalesce(p.data->'__coursework','{}'::jsonb) || jsonb_build_object(p_course,
        public.merge_coursework_records(p.data->'__coursework'->p_course,p_answers))),
    updated_at=now()
  returning data->'__coursework'->p_course into saved;
  return saved;
end;
$$;

create or replace function public.save_learning_progress(p_user uuid,p_progress jsonb)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is null or auth.uid() <> p_user then raise exception 'Account changed'; end if;
  if jsonb_typeof(p_progress) is distinct from 'object' then raise exception 'Invalid progress'; end if;
  -- Vocabulary resets still work; a stale vocabulary tab cannot erase coursework.
  insert into public.progress as p(user_id,data,updated_at)
  values(p_user,p_progress-'__coursework',now())
  on conflict(user_id) do update set
    data=(excluded.data-'__coursework') || case when p.data ? '__coursework'
      then jsonb_build_object('__coursework',p.data->'__coursework') else '{}'::jsonb end,
    updated_at=now();
end;
$$;
revoke all on function public.merge_coursework_records(jsonb,jsonb) from public,anon;
revoke all on function public.save_course_work(uuid,text,jsonb) from public,anon;
revoke all on function public.save_learning_progress(uuid,jsonb) from public,anon;
grant execute on function public.merge_coursework_records(jsonb,jsonb) to authenticated;
grant execute on function public.save_course_work(uuid,text,jsonb) to authenticated;
grant execute on function public.save_learning_progress(uuid,jsonb) to authenticated;

-- Older cached clients still upsert the whole progress row. Preserve newer
-- coursework even when those clients send a stale copy or omit it entirely.
create or replace function public.preserve_coursework_progress()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare spaces jsonb; c record;
begin
  spaces=coalesce(old.data->'__coursework','{}'::jsonb);
  for c in select key,value from jsonb_each(coalesce(new.data->'__coursework','{}'::jsonb)) loop
    spaces=jsonb_set(spaces,array[c.key],public.merge_coursework_records(spaces->c.key,c.value));
  end loop;
  if spaces <> '{}'::jsonb then new.data=jsonb_set(coalesce(new.data,'{}'::jsonb),'{__coursework}',spaces); end if;
  return new;
end;
$$;
revoke all on function public.preserve_coursework_progress() from public,anon;
create or replace trigger preserve_coursework_progress before update on public.progress
for each row execute function public.preserve_coursework_progress();
commit;
