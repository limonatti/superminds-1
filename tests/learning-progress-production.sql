-- Run as one transaction. Diagnostic answers and receipts are always rolled back.
begin;
do $$begin perform set_config('request.jwt.claim.sub',(select user_id::text from public.progress order by user_id limit 1),true);end$$;
set local role authenticated;
do $$
declare
  uid uuid=auth.uid();original jsonb;updated jsonb;batch jsonb;ids uuid[];
  word text='codex-progress-check-'||gen_random_uuid()::text;
  eid uuid=gen_random_uuid();
begin
  if uid is null then raise exception 'No existing account for transactional verification';end if;
  select data into original from public.progress where user_id=uid for update;
  batch=jsonb_build_array(jsonb_build_object('id',eid,'at',extract(epoch from now())*1000,
    'actions',jsonb_build_array(jsonb_build_object('type','answer','word',word,'correct',true,'trainer',true))));
  ids=public.apply_learning_events(uid,batch);
  if ids<>array[eid] then raise exception 'Missing acknowledgement';end if;
  perform public.apply_learning_events(uid,batch);
  select data into updated from public.progress where user_id=uid;
  if updated->word->>'seen'<>'1' or updated->word->>'correct'<>'1' or updated->word->>'level'<>'1' then raise exception 'Retry duplicated answer';end if;
  if updated-word is distinct from original then raise exception 'Unrelated progress changed';end if;
  begin
    perform public.apply_learning_events(gen_random_uuid(),'[]');
    raise exception 'Foreign account accepted';
  exception when insufficient_privilege then null;end;
end$$;
reset role;
set local role anon;
do $$begin
  begin
    perform public.apply_learning_events(null,'[]');
    raise exception 'Anonymous execution allowed';
  exception when insufficient_privilege then null;end;
end$$;
reset role;
rollback;
