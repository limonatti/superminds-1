-- ============================================================
-- English with Asya · чат учитель ↔ ученик · миграция Supabase
-- Безопасно запускать повторно (idempotent). SQL Editor → Run.
-- Добавляет таблицу messages с изоляцией по паре (учитель, ученик).
-- Не трогает существующие таблицы.
-- ============================================================

-- ---------- Таблица сообщений ----------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,  -- учитель пары
  student_id uuid not null references auth.users(id) on delete cascade,  -- ученик пары
  sender_id  uuid not null references auth.users(id) on delete cascade,  -- кто написал (= teacher_id или student_id)
  body text not null,
  read_at timestamptz,                                    -- когда получатель прочитал
  created_at timestamptz not null default now()
);
create index if not exists messages_pair on public.messages(teacher_id, student_id, created_at);

-- ---------- RLS ----------
alter table public.messages enable row level security;

-- читать переписку могут обе стороны пары
drop policy if exists msg_read on public.messages;
create policy msg_read on public.messages for select
  using (auth.uid() = teacher_id or auth.uid() = student_id);

-- учитель пишет своему ученику
drop policy if exists msg_teacher_ins on public.messages;
create policy msg_teacher_ins on public.messages for insert
  with check (sender_id = auth.uid() and teacher_id = auth.uid()
    and exists (select 1 from public.profiles p
                where p.user_id = student_id and p.teacher_id = auth.uid()));

-- ученик пишет своему учителю
drop policy if exists msg_student_ins on public.messages;
create policy msg_student_ins on public.messages for insert
  with check (sender_id = auth.uid() and student_id = auth.uid()
    and exists (select 1 from public.profiles p
                where p.user_id = auth.uid() and p.teacher_id = messages.teacher_id));

-- отметить «прочитано» может только получатель (тот, кто НЕ отправитель)
drop policy if exists msg_mark_read on public.messages;
create policy msg_mark_read on public.messages for update
  using ((auth.uid() = teacher_id or auth.uid() = student_id) and sender_id <> auth.uid())
  with check ((auth.uid() = teacher_id or auth.uid() = student_id) and sender_id <> auth.uid());

-- ---------- RPC: ученик → его учитель (id + имя) ----------
create or replace function public.my_teacher()
returns table(teacher_id uuid, name text)
language sql security definer stable as $$
  select pt.user_id, coalesce(pt.name, 'Учитель')
  from public.profiles ps
  join public.profiles pt on pt.user_id = ps.teacher_id
  where ps.user_id = auth.uid();
$$;

-- ---------- RPC: учитель → непрочитанные сообщения по ученикам ----------
create or replace function public.teacher_unread()
returns table(student_id uuid, unread int)
language sql security definer stable as $$
  select student_id, count(*)::int
  from public.messages
  where teacher_id = auth.uid() and sender_id = student_id and read_at is null
  group by student_id;
$$;

grant execute on function public.my_teacher()   to authenticated;
grant execute on function public.teacher_unread() to authenticated;
