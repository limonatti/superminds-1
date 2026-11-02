-- Private, per-account presentation marks and exercise answers.
-- Additive migration; no existing progress or course tables are changed.
begin;
create table if not exists public.presentation_pages (
  user_id uuid not null references auth.users(id) on delete cascade,
  course text not null check (course = 'speakout-b2plus'),
  page text not null check (page ~ '^(sb|wb):[1-9][0-9]{0,2}$'),
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
  updated_at timestamptz not null default now(),
  primary key (user_id, course, page)
);
alter table public.presentation_pages enable row level security;
revoke all on public.presentation_pages from anon;
grant select, insert, update on public.presentation_pages to authenticated;
do $$ begin
if not exists(select 1 from pg_policies where schemaname='public' and tablename='presentation_pages' and policyname='presentation_read_own') then
create policy presentation_read_own on public.presentation_pages for select to authenticated
  using ((select auth.uid()) = user_id);
end if;
if not exists(select 1 from pg_policies where schemaname='public' and tablename='presentation_pages' and policyname='presentation_insert_own') then
create policy presentation_insert_own on public.presentation_pages for insert to authenticated
  with check ((select auth.uid()) = user_id);
end if;
if not exists(select 1 from pg_policies where schemaname='public' and tablename='presentation_pages' and policyname='presentation_update_own') then
create policy presentation_update_own on public.presentation_pages for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
end if;
end $$;

-- Merge only changed objects/fields. JSON null is a deletion tombstone, so
-- stale devices cannot restore a removed stroke by uploading their snapshot.
create or replace function public.save_presentation_page(
  p_user uuid, p_course text, p_page text, p_changes jsonb
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare result jsonb;
begin
  if auth.uid() is null or auth.uid() <> p_user then
    raise exception 'Account changed' using errcode = '42501';
  end if;
  if jsonb_typeof(p_changes) <> 'object' or octet_length(p_changes::text) > 1048576 then
    raise exception 'Invalid or oversized presentation patch';
  end if;
  insert into public.presentation_pages(user_id, course, page, data)
    values (p_user, p_course, p_page, p_changes)
  on conflict (user_id, course, page) do update
    set data = public.presentation_pages.data || excluded.data, updated_at = clock_timestamp()
  returning data into result;
  return result;
end;
$$;
revoke all on function public.save_presentation_page(uuid,text,text,jsonb) from public, anon;
grant execute on function public.save_presentation_page(uuid,text,text,jsonb) to authenticated;
commit;
