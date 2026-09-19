-- Удаление аккаунта учеником — требование App Store (5.1.1(v)) и Google Play.
-- Применено в базе 19.09.2026. Файл лежит здесь как канонический текст функции.
--
-- Что удаляется:
--   • явно — уроки и их переносы, результаты произношения, файлы в хранилище
--     (чат, доски, картинки к словам), отметка об использованном приглашении;
--   • каскадом по внешним ключам на auth.users — профиль, прогресс, домашка
--     и её результаты, свои слова, переписка, реакции, привязка к учителю.
-- Учителю функция откажет: его аккаунт удаляется вручную, иначе с ним уйдут
-- курсы и учебники всего класса.

create or replace function public.delete_my_account()
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'auth', 'storage'
as $function$
declare
  uid uuid := auth.uid();
  r text;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_signed_in');
  end if;
  select role into r from public.profiles where user_id = uid;
  if coalesce(r, 'student') <> 'student' then
    return jsonb_build_object('ok', false, 'error', 'teacher_account');
  end if;
  delete from public.lesson_changes where lesson_id in (select id from public.lessons where student_id = uid);
  delete from public.lessons where student_id = uid;
  delete from public.sh_takes where student_id = uid;
  update public.invites set used_by = null where used_by = uid;
  delete from storage.objects where owner = uid;
  delete from auth.users where id = uid;
  return jsonb_build_object('ok', true);
end;
$function$;

grant execute on function public.delete_my_account() to authenticated;
