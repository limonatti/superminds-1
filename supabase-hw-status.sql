-- ============================================================
-- Домашка: цикл проверки и выдача блоками
-- Применено 11 августа 2026. Здесь для истории и повторного наката.
-- ============================================================
--
-- Что делает:
--   1. Добавляет статусы работы: new → submitted → done | rework → submitted …
--   2. Держит старую колонку done в согласии со status (старый код не ломается)
--   3. Запрещает ученику принимать работу самому себе
--   4. Чинит доступ учителя к результатам упражнений (была проверка по
--      profiles.teacher_id, который у учеников пуст; правда — в enrolments)
--
-- Выдача блоками отдельной схемы НЕ требует: список id упражнений
-- лежит в hw.note (это JSON) в поле ex, номер юнита — в unitId.

-- ---------- 1. Статусы ----------

alter table public.hw
  add column if not exists status       text,
  add column if not exists feedback     text,
  add column if not exists submitted_at timestamptz,
  add column if not exists reviewed_at  timestamptz;

update public.hw set status = case when done then 'done' else 'new' end where status is null;

alter table public.hw alter column status set default 'new';
alter table public.hw alter column status set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'hw_status_chk') then
    alter table public.hw
      add constraint hw_status_chk check (status in ('new','submitted','done','rework'));
  end if;
end $$;

-- ---------- 2. Согласование status и done в обе стороны ----------

create or replace function public.hw_sync_done() returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.status is null then
      new.status := case when new.done then 'done' else 'new' end;
    end if;
    new.done := (new.status = 'done');
    return new;
  end if;

  if new.status is distinct from old.status then
    new.done := (new.status = 'done');
  elsif new.done is distinct from old.done then
    new.status := case when new.done then 'done' else 'new' end;
  end if;

  if new.status = 'submitted' and old.status is distinct from 'submitted' then
    new.submitted_at := now();
  end if;
  if new.status in ('done','rework') and old.status is distinct from new.status then
    new.reviewed_at := now();
  end if;

  return new;
end $$;

drop trigger if exists hw_sync_done_trg on public.hw;
create trigger hw_sync_done_trg
  before insert or update on public.hw
  for each row execute function public.hw_sync_done();

create index if not exists hw_status_idx on public.hw (teacher_id, status);

-- ---------- 3. Ученик вправе только сдать работу ----------
-- Принимает и возвращает только учитель. Состав задания и отзыв
-- ученик изменить не может — поля молча откатываются к прежним.

create or replace function public.hw_guard_student() returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null or auth.uid() <> new.student_id or auth.uid() = new.teacher_id then
    return new;
  end if;

  new.teacher_id   := old.teacher_id;
  new.student_id   := old.student_id;
  new.course       := old.course;
  new.unit         := old.unit;
  new.note         := old.note;
  new.feedback     := old.feedback;
  new.reviewed_at  := old.reviewed_at;
  new.created_at   := old.created_at;

  if new.status is distinct from old.status then
    if not (new.status = 'submitted' and old.status in ('new','rework')) then
      raise exception 'Работу можно только отправить на проверку; принимает её учитель';
    end if;
  end if;

  new.done := (new.status = 'done');
  return new;
end $$;

drop trigger if exists hw_guard_student_trg on public.hw;
create trigger hw_guard_student_trg
  before update on public.hw
  for each row execute function public.hw_guard_student();

-- ---------- 4. Учитель видит результаты своих учеников ----------
-- Тот же подводный камень, что был с чатом: связь живёт в enrolments,
-- а profiles.teacher_id у учеников обычно пуст.

drop policy if exists attempts_select_teacher on public.attempts;

create policy attempts_select_teacher on public.attempts
for select using (
  exists (select 1 from public.enrolments e
          where e.student_id = attempts.student_id and e.teacher_id = auth.uid())
  or
  exists (select 1 from public.profiles p
          where p.user_id = attempts.student_id and p.teacher_id = auth.uid())
);

create index if not exists attempts_student_ex_idx on public.attempts (student_id, exercise_id);

-- ---------- 5. Учебник ученика (добавлено 14 августа) ----------
-- Курс, выбранный самим учеником, — на случай, когда учитель ещё не назначил.
alter table public.profiles add column if not exists course text;

-- «Курс не назначен» — нормальное состояние: ученик привязан к учителю,
-- но учебник ещё не выбран. Раньше колонка этого не допускала.
alter table public.enrolments alter column course drop not null;

-- ---------- 6. Видимость учеников (14 августа) ----------
-- Список класса строится по profiles.teacher_id, а он заполняется только
-- через приглашение или код. Кто регистрировался сам — был не виден никому.
-- unassigned_students() показывает таких учителю, attach_student() добавляет.
-- Полный текст функций — в миграции unassigned_students_for_teacher.
