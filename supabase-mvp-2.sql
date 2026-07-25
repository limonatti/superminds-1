-- ============================================================
-- English with Asya · платформа MVP · миграция 2
-- Приглашения ученика: одноразовая ссылка + короткая регистрация.
-- Безопасно запускать повторно (idempotent). SQL Editor → Run.
-- Закрывает пункты SPEC 3, 4, 5, 6 и edge-case «неверный/
-- использованный код». Не трогает существующие таблицы.
-- ============================================================

-- ---------- 1. Одноразовые приглашения ----------
create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  code text not null unique,
  note text,                                   -- для кого (необяз.), видит только учитель
  used_by uuid references auth.users(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists invites_teacher on public.invites(teacher_id, created_at desc);

alter table public.invites enable row level security;

-- учитель видит и создаёт только свои приглашения
drop policy if exists inv_teacher_all on public.invites;
create policy inv_teacher_all on public.invites for all
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());
-- читать чужие приглашения нельзя: проверка и активация идут через
-- security definer функции ниже, сама таблица наружу закрыта.

-- ---------- 2. Учитель: создать приглашение ----------
create or replace function public.create_invite(p_note text default null)
returns text
language plpgsql security definer set search_path = public as $$
declare
  v_code text;
  v_role text;
begin
  select role into v_role from public.profiles where user_id = auth.uid();
  if v_role is distinct from 'teacher' then
    raise exception 'Приглашения создаёт только учитель';
  end if;
  for i in 1..6 loop
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    begin
      insert into public.invites(teacher_id, code, note) values (auth.uid(), v_code, p_note);
      return v_code;
    exception when unique_violation then
      -- код совпал, пробуем ещё раз
    end;
  end loop;
  raise exception 'Не удалось создать код приглашения';
end $$;

-- ---------- 3. Проверка кода ДО создания аккаунта ----------
-- Возвращает имя учителя, если код годен. Иначе — понятная ошибка.
-- Годен: неиспользованное приглашение ИЛИ постоянный код класса учителя.
create or replace function public.invite_check(p_code text)
returns text
language plpgsql security definer set search_path = public as $$
declare
  v_code text := upper(trim(coalesce(p_code, '')));
  v_teacher uuid;
  v_used uuid;
begin
  if v_code = '' then raise exception 'Введи код приглашения'; end if;

  select teacher_id, used_by into v_teacher, v_used
    from public.invites where code = v_code;
  if v_teacher is not null then
    if v_used is not null then
      raise exception 'Эта ссылка уже использована. Попроси учителя прислать новую.';
    end if;
    return coalesce((select name from public.profiles where user_id = v_teacher), 'учитель');
  end if;

  select user_id into v_teacher from public.profiles
    where teacher_code = v_code and role = 'teacher' limit 1;
  if v_teacher is not null then
    return coalesce((select name from public.profiles where user_id = v_teacher), 'учитель');
  end if;

  raise exception 'Код не найден. Проверь ссылку или попроси учителя прислать новую.';
end $$;

-- ---------- 4. Активация: привязать ученика к учителю + записать имя ----------
create or replace function public.redeem_invite(p_code text, p_name text)
returns text
language plpgsql security definer set search_path = public as $$
declare
  v_code text := upper(trim(coalesce(p_code, '')));
  v_name text := nullif(trim(coalesce(p_name, '')), '');
  v_teacher uuid;
  v_used uuid;
  v_me uuid := auth.uid();
  v_existing uuid;
begin
  if v_me is null then raise exception 'Сначала войди'; end if;

  -- ученик привязывается к учителю навсегда (SPEC 5, 6)
  select teacher_id into v_existing from public.profiles where user_id = v_me;
  if v_existing is not null then
    update public.profiles set name = coalesce(v_name, name) where user_id = v_me;
    return 'already';
  end if;

  select teacher_id, used_by into v_teacher, v_used from public.invites where code = v_code;
  if v_teacher is not null then
    if v_used is not null then
      raise exception 'Эта ссылка уже использована. Попроси учителя прислать новую.';
    end if;
    update public.invites set used_by = v_me, used_at = now() where code = v_code;
  else
    select user_id into v_teacher from public.profiles
      where teacher_code = v_code and role = 'teacher' limit 1;
    if v_teacher is null then
      raise exception 'Код не найден. Проверь ссылку или попроси учителя прислать новую.';
    end if;
  end if;

  if v_teacher = v_me then raise exception 'Нельзя пригласить самого себя'; end if;

  insert into public.profiles(user_id, name, role, teacher_id)
    values (v_me, coalesce(v_name, 'Ученик'), 'student', v_teacher)
  on conflict (user_id) do update
    set teacher_id = excluded.teacher_id,
        name = coalesce(excluded.name, public.profiles.name),
        role = coalesce(public.profiles.role, 'student');
  return 'ok';
end $$;

-- ---------- 5. Учитель: список своих приглашений ----------
create or replace function public.my_invites()
returns table(id uuid, code text, note text, used boolean, used_at timestamptz, created_at timestamptz)
language sql security invoker stable set search_path = public as $$
  select id, code, note, (used_by is not null) as used, used_at, created_at
  from public.invites
  where teacher_id = auth.uid()
  order by created_at desc
  limit 50;
$$;

-- ---------- 6. Права ----------
grant execute on function public.create_invite(text)          to authenticated;
grant execute on function public.invite_check(text)           to anon, authenticated;
grant execute on function public.redeem_invite(text, text)    to authenticated;
grant execute on function public.my_invites()                 to authenticated;
