-- Push-уведомления: токены устройств, отправка и три повода послать.
-- Применено в базе 19.09.2026. Здесь канонический текст — чтобы было видно,
-- что именно стоит в боевой базе, и можно было повторить на новой.
--
-- Схема работы:
--   приложение → save_push_token()        — устройство сообщает свой токен FCM
--   триггер    → push_notify()            — кому и что отправить
--   push_notify → Edge Function «push»    — она и стучится в Firebase
--
-- Пока в Vault нет push_endpoint и push_hook_secret, push_notify молча
-- ничего не делает: платформа работает как раньше, уведомлений просто нет.

create extension if not exists pg_net with schema extensions;

-- ── токены устройств ────────────────────────────────────────────────────────
create table if not exists public.device_tokens (
  token       text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  platform    text not null check (platform in ('ios','android','web')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists device_tokens_user_idx on public.device_tokens(user_id);

alter table public.device_tokens enable row level security;

drop policy if exists dt_own_select on public.device_tokens;
create policy dt_own_select on public.device_tokens
  for select to authenticated using (user_id = auth.uid());

drop policy if exists dt_own_insert on public.device_tokens;
create policy dt_own_insert on public.device_tokens
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists dt_own_update on public.device_tokens;
create policy dt_own_update on public.device_tokens
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists dt_own_delete on public.device_tokens;
create policy dt_own_delete on public.device_tokens
  for delete to authenticated using (user_id = auth.uid());

create or replace function public.save_push_token(p_token text, p_platform text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_signed_in');
  end if;
  if p_token is null or length(p_token) < 10 then
    return jsonb_build_object('ok', false, 'error', 'bad_token');
  end if;
  insert into public.device_tokens (token, user_id, platform)
  values (p_token, uid, coalesce(nullif(p_platform, ''), 'web'))
  on conflict (token) do update
    set user_id = excluded.user_id,
        platform = excluded.platform,
        updated_at = now();
  return jsonb_build_object('ok', true);
end;
$function$;

grant execute on function public.save_push_token(text, text) to authenticated;

-- ── отправка ────────────────────────────────────────────────────────────────
create or replace function public.push_notify(p_user uuid, p_title text, p_body text, p_url text)
returns void
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $function$
declare
  v_url text;
  v_secret text;
begin
  if p_user is null then return; end if;
  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'push_endpoint' limit 1;
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'push_hook_secret' limit 1;
  if v_url is null or v_secret is null then return; end if;
  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-push-secret', v_secret),
    body := jsonb_build_object('user_id', p_user, 'title', p_title, 'body', p_body, 'url', p_url)
  );
exception when others then
  return;
end;
$function$;

revoke all on function public.push_notify(uuid, text, text, text) from public, anon, authenticated;

-- ── поводы послать ──────────────────────────────────────────────────────────
-- Каждый триггер глушит свою ошибку: уведомление не должно помешать
-- сохранить сообщение, домашку или урок.

create or replace function public.push_on_message()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  recipient uuid;
  sender_name text;
begin
  recipient := case when new.sender_id = new.teacher_id then new.student_id else new.teacher_id end;
  if recipient is null or recipient = new.sender_id then return new; end if;
  select name into sender_name from public.profiles where user_id = new.sender_id;
  perform public.push_notify(
    recipient,
    coalesce(nullif(sender_name, ''), 'Новое сообщение'),
    left(coalesce(new.body, ''), 120),
    'chat.html'
  );
  return new;
exception when others then
  return new;
end;
$function$;

drop trigger if exists push_message on public.messages;
create trigger push_message after insert on public.messages
  for each row execute function public.push_on_message();

create or replace function public.push_on_hw()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  t text;
  b text;
begin
  if tg_op = 'INSERT' then
    t := 'Новая домашка';
    b := coalesce(nullif(new.note, ''), 'Открой кабинет — задание ждёт');
  elsif new.status is distinct from old.status and new.status = 'rework' then
    t := 'Домашку вернули на доработку';
    b := coalesce(nullif(new.feedback, ''), 'Посмотри замечания преподавателя');
  elsif new.status is distinct from old.status and new.status = 'done' then
    t := 'Домашка принята';
    b := coalesce(nullif(new.feedback, ''), 'Отличная работа!');
  else
    return new;
  end if;
  perform public.push_notify(new.student_id, t, b, 'homework.html');
  return new;
exception when others then
  return new;
end;
$function$;

drop trigger if exists push_hw on public.hw;
create trigger push_hw after insert or update of status on public.hw
  for each row execute function public.push_on_hw();

create or replace function public.push_on_lesson()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  perform public.push_notify(
    new.student_id,
    'Урок в расписании',
    'Преподаватель поставил новый урок — загляни в расписание',
    'schedule.html'
  );
  return new;
exception when others then
  return new;
end;
$function$;

drop trigger if exists push_lesson on public.lessons;
create trigger push_lesson after insert on public.lessons
  for each row execute function public.push_on_lesson();
