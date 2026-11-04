-- Run after the room migration, inside a transaction that is always rolled back.
create temporary table room_test as select
  (select user_id from public.profiles where is_owner limit 1) as owner_id,
  (select user_id from public.profiles where role='student' order by user_id limit 1) as student_id,
  null::jsonb as room;
grant select,update on room_test to authenticated;
select set_config('request.jwt.claim.sub',(select owner_id::text from room_test),true);
set local role authenticated;
update room_test set room=public.open_lesson_room();
do $$begin
  if not exists(select 1 from public.boards where room=(select room->>'room' from room_test)) then raise exception 'owner cannot read'; end if;
end$$;

-- An unrelated signed-in account cannot read or join by a room ID alone.
select set_config('request.jwt.claim.sub',(select student_id::text from room_test),true);
do $$begin
  if exists(select 1 from public.boards where room=(select room->>'room' from room_test)) then raise exception 'room leaked'; end if;
  begin
    perform public.open_lesson_room((select room->>'room' from room_test));
    raise exception 'join without invitation accepted';
  exception when insufficient_privilege then null; end;
end$$;

select public.open_lesson_room((select room->>'room' from room_test),(select room->>'invite' from room_test))->>'role' as invited_role;
do $$declare r text:=(select room->>'room' from room_test); begin
  if not public.can_access_board(r) then raise exception 'member cannot read'; end if;
  if public.can_access_board(r,true) then raise exception 'member became owner'; end if;
  if public.open_lesson_room(r)->>'invite' is not null then raise exception 'member got invitation secret'; end if;
  update public.boards set data='{"test":true}' where room=r;
  if not found then raise exception 'member cannot save'; end if;
  begin
    update public.boards set owner_id=auth.uid() where room=r;
    raise exception 'member changed owner';
  exception when insufficient_privilege then null; end;
  begin
    perform invite_token from public.boards where room=r;
    raise exception 'invitation column leaked';
  exception when insufficient_privilege then null; end;
end$$;

reset role;
select set_config('request.jwt.claim.sub','',true);
set local role anon;
do $$begin
  begin
    perform room from public.boards limit 1;
    raise exception 'anonymous board enumeration accepted';
  exception when insufficient_privilege then null; end;
  begin
    perform public.open_lesson_room();
    raise exception 'anonymous room creation accepted';
  exception when insufficient_privilege then null; end;
end$$;
reset role;
