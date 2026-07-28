-- Закрытый учебник: содержимое живёт в базе, а не в публичной папке сайта.
-- Читать может только вошедший ученик, записанный на этот курс, и учитель.
-- Без входа запрос возвращает пусто — скачивать с сайта нечего.

create table if not exists public.book_content (
  course      text primary key,
  title       text,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

alter table public.book_content enable row level security;

-- Чистим старые политики, чтобы скрипт можно было прогнать повторно
drop policy if exists book_read_enrolled on public.book_content;
drop policy if exists book_write_teacher on public.book_content;

-- ЧТЕНИЕ: ученик, записанный на курс, либо любой учитель
create policy book_read_enrolled on public.book_content
for select to authenticated
using (
  exists (
    select 1 from public.enrolments e
    where e.student_id = auth.uid()
      and e.course = book_content.course
  )
  or exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'teacher'
  )
);

-- ЗАПИСЬ: только учитель (заливка книги, ссылки на видео)
create policy book_write_teacher on public.book_content
for all to authenticated
using (
  exists (select 1 from public.profiles p
          where p.user_id = auth.uid() and p.role = 'teacher')
)
with check (
  exists (select 1 from public.profiles p
          where p.user_id = auth.uid() and p.role = 'teacher')
);

-- Обновлять отметку времени при изменении
create or replace function public.book_touch() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists book_content_touch on public.book_content;
create trigger book_content_touch before update on public.book_content
for each row execute function public.book_touch();
