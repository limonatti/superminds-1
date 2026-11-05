-- Roll back all synthetic writes; never emit a chat message or notification.
BEGIN;
DO $$BEGIN PERFORM set_config('request.jwt.claim.sub',(SELECT id::text FROM auth.users ORDER BY created_at LIMIT 1),true);END $$;
SET LOCAL ROLE authenticated;
DO $$
DECLARE u uuid=auth.uid(); event_id uuid=gen_random_uuid(); payload jsonb; before_data jsonb; n bigint;
BEGIN
 SELECT data INTO before_data FROM public.progress WHERE user_id=u;
 payload=jsonb_build_array(jsonb_build_object('id',event_id,'at',extract(epoch from now())*1000,'actions',jsonb_build_array(jsonb_build_object('type','attempt','attempt',jsonb_build_object('course','__rollback_assessment_check__','unit_id','test','correct',false,'details',jsonb_build_object('answered',3,'correct',2))))));
 PERFORM public.apply_learning_events(u,payload);
 PERFORM public.apply_learning_events(u,payload);
 SELECT count(*) INTO n FROM public.attempts WHERE student_id=u AND course='__rollback_assessment_check__';
 ASSERT n=1,'duplicate delivery inserted more than one attempt';
 ASSERT (SELECT details->>'correct' FROM public.attempts WHERE student_id=u AND course='__rollback_assessment_check__')='2','details not preserved';
 ASSERT (SELECT data FROM public.progress WHERE user_id=u) IS NOT DISTINCT FROM coalesce(before_data,'{}'::jsonb),'existing progress changed';
 BEGIN
  PERFORM public.apply_learning_events(gen_random_uuid(),payload);
  RAISE EXCEPTION 'cross-account call was allowed';
 EXCEPTION WHEN OTHERS THEN
  IF SQLERRM<>'Not authorized' THEN RAISE; END IF;
 END;
 ASSERT NOT has_function_privilege('anon','public.apply_learning_events(uuid,jsonb)','execute'),'anonymous execute allowed';
END $$;
ROLLBACK;
