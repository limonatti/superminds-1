-- Private boards and lesson channels. Existing board content is retained.
-- Legacy boards have no owner; only the platform owner may reclaim them.
alter table public.boards add column if not exists owner_id uuid references auth.users(id);
alter table public.boards add column if not exists invite_token uuid not null default gen_random_uuid();
create table if not exists public.board_members (
  room text not null references public.boards(room) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room, user_id)
);
alter table public.board_members enable row level security;
revoke all on public.board_members from public, anon, authenticated;

create or replace function public.can_access_board(p_room text, p_owner_only boolean default false)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.boards b where b.room=p_room and (
      b.owner_id=auth.uid() or (not p_owner_only and exists (
        select 1 from public.board_members m where m.room=b.room and m.user_id=auth.uid()
      ))
    )
  );
$$;
revoke all on function public.can_access_board(text,boolean) from public, anon;
grant execute on function public.can_access_board(text,boolean) to authenticated;

create or replace function public.open_lesson_room(p_room text default null, p_invite text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare u uuid := auth.uid(); b public.boards%rowtype;
begin
  if u is null then raise exception 'ROOM_LOGIN_REQUIRED' using errcode='42501'; end if;
  if p_room is null or p_room='' then
    if not exists(select 1 from public.profiles where user_id=u and (role in ('teacher','admin') or is_owner)) then
      raise exception 'ROOM_TEACHER_REQUIRED' using errcode='42501';
    end if;
    insert into public.boards(room,data,owner_id) values(replace(gen_random_uuid()::text,'-',''),'{}',u) returning * into b;
  else
    select * into b from public.boards where room=p_room for update;
    if not found then raise exception 'ROOM_ACCESS_DENIED' using errcode='42501'; end if;
    if b.owner_id is null and public.is_platform_owner() then
      update public.boards set owner_id=u where room=b.room returning * into b;
    end if;
    if b.owner_id is distinct from u and not exists(select 1 from public.board_members where room=b.room and user_id=u) then
      if b.owner_id is null or p_invite is distinct from b.invite_token::text then
        raise exception 'ROOM_ACCESS_DENIED' using errcode='42501';
      end if;
      insert into public.board_members(room,user_id) values(b.room,u) on conflict do nothing;
    end if;
  end if;
  return jsonb_build_object('room',b.room,'role',case when b.owner_id=u then 'teacher' else 'student' end,
    'invite',case when b.owner_id=u then b.invite_token::text else null end);
end;
$$;
revoke all on function public.open_lesson_room(text,text) from public, anon;
grant execute on function public.open_lesson_room(text,text) to authenticated;

-- Direct clients can only read/save content in rooms they belong to.
-- Ownership, invitations and membership can only be changed through the RPC.
revoke all on public.boards from public, anon, authenticated;
revoke all (room,data,updated_at,owner_id,invite_token) on public.boards from public, anon, authenticated;
grant select(room,data,updated_at,owner_id), update(data,updated_at) on public.boards to authenticated;
revoke all on public.board_members from public, anon, authenticated;
alter policy boards_read on public.boards to authenticated using (public.can_access_board(room));
alter policy boards_upd on public.boards to authenticated using (public.can_access_board(room)) with check (public.can_access_board(room));
alter policy boards_ins on public.boards to authenticated with check (false);

update storage.buckets set public=false where id='board-images';
alter policy board_img_read on storage.objects to authenticated using (
  bucket_id='board-images' and public.can_access_board((storage.foldername(name))[1])
);
alter policy board_img_write on storage.objects to authenticated with check (
  bucket_id='board-images' and public.can_access_board((storage.foldername(name))[1])
);

-- A separate teacher channel prevents pupils from impersonating the host.
create policy lesson_private_read on realtime.messages for select to authenticated using (
  extension='broadcast' and split_part(realtime.topic(),':',1) in ('board','lesson','lesson-student')
  and public.can_access_board(split_part(realtime.topic(),':',2))
);
create policy lesson_private_write on realtime.messages for insert to authenticated with check (
  extension='broadcast' and (
    (split_part(realtime.topic(),':',1) in ('board','lesson-student') and public.can_access_board(split_part(realtime.topic(),':',2)))
    or (split_part(realtime.topic(),':',1)='lesson' and public.can_access_board(split_part(realtime.topic(),':',2),true))
  )
);
