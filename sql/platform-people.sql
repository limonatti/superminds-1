-- platform-people.sql
-- Раздел «Учителя платформы» для владельца: увидеть всех, кто зарегистрирован,
-- и выдать или снять роль учителя.
--
-- Куда вставлять: Supabase Dashboard → SQL Editor → New query → Run.
-- Безопасно: только читает и добавляет функцию, данные не меняет.

create or replace function public.platform_people()
returns table (
  user_id uuid, email text, name text, role text, is_owner boolean,
  registered date, last_seen date,
  students int, courses int, exercises int
)
language sql security definer set search_path to 'public' as $$
  select u.id,
         u.email::text,
         coalesce(p.name, u.raw_user_meta_data->>'name'),
         coalesce(p.role, 'guest'),
         coalesce(p.is_owner, false),
         u.created_at::date,
         u.last_sign_in_at::date,
         (select count(*)::int from public.enrolments e where e.teacher_id = u.id),
         (select count(*)::int from public.courses c where c.owner_id = u.id and c.kind = 'custom'),
         (select count(*)::int from public.exercises x where x.author_id = u.id)
  from auth.users u
  left join public.profiles p on p.user_id = u.id
  where public.is_platform_owner()          -- чужим не отдаём вообще ничего
    and coalesce(p.hidden, false) = false
  order by (coalesce(p.role,'guest') = 'teacher') desc, u.created_at desc;
$$;

revoke execute on function public.platform_people() from public, anon;
grant execute on function public.platform_people() to authenticated;

-- Проверка: у владельца вернёт список, у остальных — пусто.
select count(*) as людей_видно from public.platform_people();
