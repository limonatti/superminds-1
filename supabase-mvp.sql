-- ============================================================
-- English with Asya · платформа MVP · миграция Supabase
-- Безопасно запускать повторно (idempotent). SQL Editor → Run.
-- Добавляет: запись ДЗ по курсам Speakout, детальный прогресс
-- по каждому упражнению, материалы учителя. Изоляция через RLS.
-- Не трогает существующие таблицы (profiles, attempts, courses…).
-- ============================================================

-- ---------- 1. Запись курса ученику (один курс, по которому работают) ----------
create table if not exists public.enrolments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  course text not null,                       -- 'speakout-b1' | 'speakout-b1plus'
  created_at timestamptz not null default now(),
  unique (student_id)                          -- один активный курс на ученика
);

-- ---------- 2. Домашки по юнитам Speakout ----------
create table if not exists public.hw (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  course text not null,                        -- 'speakout-b1' | 'speakout-b1plus'
  unit int not null,                           -- номер юнита 1..8
  note text,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- 3. Материалы учителя (доп. ссылки сверх курса) ----------
create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  url text not null,
  note text,
  created_at timestamptz not null default now()
);

-- ---------- 4. Детальный прогресс: каждый ответ ученика ----------
create table if not exists public.hw_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  course text not null,                        -- 'speakout-b1' | 'speakout-b1plus'
  unit int not null,                           -- номер юнита
  ex_index int not null,                       -- порядковый номер задания в юните
  section text,                                -- 'grammar' | 'gap' | 'chunk' | 'reading' | 'howto' | 'wb'
  question text,                               -- текст задания
  answer text,                                 -- что выбрал/ввёл ученик
  correct boolean not null,
  duration_ms int,                             -- время с начала юнита до этого ответа
  created_at timestamptz not null default now()
);
create index if not exists hw_attempts_student_unit on public.hw_attempts(student_id, course, unit, created_at);

-- ---------- 5. RLS (изоляция сред) ----------
alter table public.enrolments  enable row level security;
alter table public.hw          enable row level security;
alter table public.materials   enable row level security;
alter table public.hw_attempts enable row level security;

-- helper: принадлежит ли ученик текущему учителю
-- (используем прямой подзапрос к profiles: profiles.user_id = student, profiles.teacher_id = я)

-- enrolments: учитель управляет своими; ученик читает своё
drop policy if exists enr_teacher_all on public.enrolments;
create policy enr_teacher_all on public.enrolments for all
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid()
    and exists (select 1 from public.profiles p where p.user_id = student_id and p.teacher_id = auth.uid()));
drop policy if exists enr_student_read on public.enrolments;
create policy enr_student_read on public.enrolments for select
  using (student_id = auth.uid());

-- hw: то же
drop policy if exists hw_teacher_all on public.hw;
create policy hw_teacher_all on public.hw for all
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid()
    and exists (select 1 from public.profiles p where p.user_id = student_id and p.teacher_id = auth.uid()));
drop policy if exists hw_student_rw on public.hw;
create policy hw_student_rw on public.hw for select
  using (student_id = auth.uid());
drop policy if exists hw_student_done on public.hw;
create policy hw_student_done on public.hw for update
  using (student_id = auth.uid()) with check (student_id = auth.uid());

-- materials
drop policy if exists mat_teacher_all on public.materials;
create policy mat_teacher_all on public.materials for all
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid()
    and exists (select 1 from public.profiles p where p.user_id = student_id and p.teacher_id = auth.uid()));
drop policy if exists mat_student_read on public.materials;
create policy mat_student_read on public.materials for select
  using (student_id = auth.uid());

-- hw_attempts: ученик пишет/читает своё; учитель читает своих учеников
drop policy if exists ha_student_ins on public.hw_attempts;
create policy ha_student_ins on public.hw_attempts for insert
  with check (student_id = auth.uid());
drop policy if exists ha_student_read on public.hw_attempts;
create policy ha_student_read on public.hw_attempts for select
  using (student_id = auth.uid());
drop policy if exists ha_teacher_read on public.hw_attempts;
create policy ha_teacher_read on public.hw_attempts for select
  using (exists (select 1 from public.profiles p
                 where p.user_id = hw_attempts.student_id and p.teacher_id = auth.uid()));

-- ---------- 6. RPC для учителя: результаты ученика по юниту ----------
create or replace function public.student_hw_results(p_student uuid, p_course text, p_unit int)
returns setof public.hw_attempts
language sql security invoker stable as $$
  select * from public.hw_attempts
  where student_id = p_student and course = p_course and unit = p_unit
  order by created_at asc;
$$;

-- ---------- 7. RPC: сводка ДЗ ученика для учителя (юнит, попыток, верно, время) ----------
create or replace function public.student_hw_summary(p_student uuid)
returns table(course text, unit int, attempts int, correct int, total_ms int, last_at timestamptz)
language sql security invoker stable as $$
  select course, unit,
         count(*)::int as attempts,
         count(*) filter (where correct)::int as correct,
         coalesce(max(duration_ms),0)::int as total_ms,
         max(created_at) as last_at
  from public.hw_attempts
  where student_id = p_student
  group by course, unit
  order by max(created_at) desc;
$$;
