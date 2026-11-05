-- Exercise attempts use the existing durable queue and transactional receipts.
alter table public.attempts add column if not exists details jsonb not null default '{}'::jsonb;

create or replace function public.apply_learning_events(p_user uuid,p_events jsonb) returns uuid[]
language plpgsql security invoker set search_path='' as $$
declare
  result jsonb; event jsonb; action jsonb; item jsonb; value jsonb; part text;
  event_id uuid; inserted uuid; acknowledgements uuid[]='{}'; path text[];
  kind text; word text; day text; previous_day text; week text;
  correct boolean; bucket integer; level integer; streak integer; idx integer;
  event_time numeric; amount numeric;
begin
  if auth.uid() is null or auth.uid()<>p_user then raise exception 'Not authorized' using errcode='42501'; end if;
  if jsonb_typeof(p_events) is distinct from 'array' or jsonb_array_length(p_events)>100 or octet_length(p_events::text)>1048576 then
    raise exception 'Invalid event batch';
  end if;
  -- One row lock serializes competing tabs/devices and saves of coursework.
  insert into public.progress(user_id,data,updated_at) values(p_user,'{}',now()) on conflict(user_id) do nothing;
  select data into result from public.progress where user_id=p_user for update;
  if result is null then raise exception 'Progress unavailable'; end if;
  for event in select * from jsonb_array_elements(p_events) loop
    event_id=(event->>'id')::uuid;
    if event_id is null or jsonb_typeof(event->'actions') is distinct from 'array' or jsonb_array_length(event->'actions')>200 then
      raise exception 'Invalid event';
    end if;
    inserted=null;
    insert into public.learning_event_receipts(user_id,event_id) values(p_user,event_id)
      on conflict do nothing returning learning_event_receipts.event_id into inserted;
    acknowledgements=array_append(acknowledgements,event_id);
    if inserted is null then continue; end if;
    event_time=greatest(0,least(public.learning_number(event->'at'),extract(epoch from now())*1000+86400000));
    for action in select * from jsonb_array_elements(event->'actions') loop
      kind=action->>'type';
      if kind='attempt' then
        item=action->'attempt';
        if jsonb_typeof(item) is distinct from 'object'
          or jsonb_typeof(item->'correct') is distinct from 'boolean'
          or jsonb_typeof(coalesce(item->'details','{}'::jsonb)) is distinct from 'object'
          or octet_length(coalesce(item->'details','{}'::jsonb)::text)>65536 then
          raise exception 'Invalid exercise attempt';
        end if;
        insert into public.attempts(student_id,course,unit_id,exercise_id,ex_type,correct,details,created_at)
        values(p_user,left(item->>'course',200),left(item->>'unit_id',200),nullif(item->>'exercise_id','')::uuid,
          left(item->>'ex_type',100),(item->>'correct')::boolean,coalesce(item->'details','{}'::jsonb),to_timestamp(event_time/1000));
      elsif kind='answer' then
        word=action->>'word';
        if word is null or length(word) not between 1 and 200 or left(word,2)='__' or word in ('constructor','prototype') then raise exception 'Invalid word'; end if;
        if jsonb_typeof(action->'correct') is distinct from 'boolean' then raise exception 'Invalid answer'; end if;
        correct=(action->>'correct')::boolean;
        item=case when jsonb_typeof(result->word)='object' then result->word else '{}' end;
        if not(item?'level') then item=item||'{"level":0}'::jsonb; end if;
        bucket=case when correct then least(5,greatest(0,public.learning_number(item->'b'))+1) else 0 end;
        item=item||jsonb_build_object('seen',public.learning_number(item->'seen')+1,
          'correct',public.learning_number(item->'correct')+case when correct then 1 else 0 end,
          'b',bucket,'due',event_time+(array[0,1,2,4,7,15])[bucket+1]*86400000::numeric);
        if coalesce((action->>'trainer')::boolean,false) then
          level=greatest(0,least(4,public.learning_number(item->'level')+case when correct then 1 else -1 end));
          item=item||jsonb_build_object('level',level,'status',case when level>=4 then 'learned' else 'learning' end);
        elsif not correct or not(item?'status') then item=item||'{"status":"learning"}'::jsonb;
        end if;
        result=jsonb_set(result,array[word],item,true);
      elsif kind in ('activity','feed') then
        day=action->>'date';
        if day is null or day!~'^\d{4}-\d{2}-\d{2}$' then raise exception 'Invalid date'; end if;
        perform day::date;
        part=case when kind='activity' then '__meta' else '__pet' end;
        item=case when jsonb_typeof(result->part)='object' then result->part else '{}' end;
        previous_day=item->>case when kind='activity' then 'lastActive' else 'fed' end;
        if previous_day is null or day>previous_day then
          streak=case when previous_day~'^\d{4}-\d{2}-\d{2}$' and day::date-previous_day::date=1
            then public.learning_number(item->case when kind='activity' then 'dayStreak' else 'streak' end)+1 else 1 end;
          if kind='activity' then
            item=item||jsonb_build_object('lastActive',day,'dayStreak',streak,'bestStreak',greatest(streak,public.learning_number(item->'bestStreak')));
          else
            item=item||jsonb_build_object('fed',day,'streak',streak,'fedCount',public.learning_number(item->'fedCount')+1);
          end if;
          result=jsonb_set(result,array[part],item,true);
        end if;
      elsif kind='weekly' then
        week=action->>'week';
        if week is null or week!~'^\d{4}-\d{2}$' or jsonb_typeof(action->'value') is distinct from 'number' then raise exception 'Invalid week'; end if;
        item=case when jsonb_typeof(result->'__meta')='object' then result->'__meta' else '{}' end;
        if coalesce(item->>'weekKey','')<=week then
          amount=case when item->>'weekKey'=week then public.learning_number(item->'weekPoints') else 0 end;
          item=item||jsonb_build_object('weekKey',week,'weekPoints',greatest(0,amount+(action->>'value')::numeric));
          result=jsonb_set(result,array['__meta'],item,true);
        end if;
      elsif kind in ('set','add','max','union','remove') then
        if jsonb_typeof(action->'path') is distinct from 'array' then raise exception 'Invalid path'; end if;
        select array_agg(element order by ordinal) into path from jsonb_array_elements_text(action->'path') with ordinality t(element,ordinal);
        if coalesce(array_length(path,1),0) not between 1 and 6 or path[1]='__coursework' then raise exception 'Invalid path'; end if;
        foreach part in array path loop
          if length(part) not between 1 and 200 or part in ('__proto__','constructor','prototype') then raise exception 'Invalid path component'; end if;
        end loop;
        if kind='remove' then result=result#-path;continue;end if;
        value=action->'value';
        if value is null then raise exception 'Missing value'; end if;
        if kind in ('add','max') then
          if jsonb_typeof(value) is distinct from 'number' then raise exception 'Invalid number'; end if;
          amount=public.learning_number(result#>path);
          value=to_jsonb(case when kind='add' then amount+value::numeric else greatest(amount,value::numeric) end);
        elsif kind='union' then
          if jsonb_typeof(value) is distinct from 'array' then raise exception 'Invalid list'; end if;
          select coalesce(jsonb_agg(distinct element),'[]'::jsonb) into value from jsonb_array_elements(
            case when jsonb_typeof(result#>path)='array' then result#>path else '[]'::jsonb end || value) t(element);
        end if;
        for idx in 1..array_length(path,1)-1 loop
          if jsonb_typeof(result#>path[1:idx]) is distinct from 'object' then result=jsonb_set(result,path[1:idx],'{}',true); end if;
        end loop;
        result=jsonb_set(result,path,value,true);
      else raise exception 'Unknown action';
      end if;
    end loop;
  end loop;
  update public.progress set data=result,updated_at=now() where user_id=p_user;
  return acknowledgements;
end
$$;
revoke all on function public.apply_learning_events(uuid,jsonb) from public,anon;
grant execute on function public.apply_learning_events(uuid,jsonb) to authenticated;
