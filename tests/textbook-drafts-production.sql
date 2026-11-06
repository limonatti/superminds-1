-- All synthetic data is rolled back; no student answer is retained or changed.
BEGIN;
DO $$BEGIN PERFORM set_config('request.jwt.claim.sub',(SELECT id::text FROM auth.users ORDER BY created_at LIMIT 1),true);END $$;
SET LOCAL ROLE authenticated;
DO $$
DECLARE u uuid=auth.uid(); course_key text; saved jsonb; old_progress jsonb; old_book jsonb; old_page jsonb;
BEGIN
 SELECT data INTO old_progress FROM public.progress WHERE user_id=u;
 FOREACH course_key IN ARRAY ARRAY['focus-1','outcomes-beginner','solutions-el','solutions-int','speakout-a1','speakout-b1','speakout-b1plus','solutions-pi','gateway-a1p'] LOOP
  old_book=coalesce(old_progress->'__coursework'->course_key,'{}'::jsonb);
  saved=public.save_course_work(u,course_key,'{"__phase4_rollback__":{"values":["unfinished",""],"done":false,"updatedAt":2}}'::jsonb);
  ASSERT saved->'__phase4_rollback__'->'values'->>0='unfinished','draft missing';
  saved=public.save_course_work(u,course_key,'{"__phase4_rollback__":{"values":["stale"],"updatedAt":1},"__phase4_second__":{"values":["another exercise"],"updatedAt":2}}'::jsonb);
  ASSERT saved->'__phase4_rollback__'->'values'->>0='unfinished','stale draft replaced newer answer';
  ASSERT saved-'__phase4_rollback__'-'__phase4_second__'=old_book,'existing answers changed';
 END LOOP;
 ASSERT (SELECT data-'__coursework' FROM public.progress WHERE user_id=u)=coalesce(old_progress-'__coursework','{}'::jsonb),'vocabulary progress changed';
 SELECT data INTO old_page FROM public.presentation_pages WHERE user_id=u AND course='speakout-b2plus' AND page='sb:7';
 saved=public.save_presentation_page(u,'speakout-b2plus','sb:7','{"answer:__phase4_first__":"partial"}'::jsonb);
 saved=public.save_presentation_page(u,'speakout-b2plus','sb:7','{"answer:__phase4_second__":"another field"}'::jsonb);
 ASSERT saved->>'answer:__phase4_first__'='partial','B2 partial answer missing';
 ASSERT saved-'answer:__phase4_first__'-'answer:__phase4_second__'=coalesce(old_page,'{}'::jsonb),'B2 existing answers changed';
 BEGIN
  PERFORM public.save_course_work(gen_random_uuid(),'focus-1','{}'::jsonb);
  RAISE EXCEPTION 'cross-account write allowed';
 EXCEPTION WHEN OTHERS THEN IF SQLERRM<>'Account changed' THEN RAISE;END IF;END;
 BEGIN
  PERFORM public.save_presentation_page(gen_random_uuid(),'speakout-b2plus','sb:7','{}'::jsonb);
  RAISE EXCEPTION 'cross-account B2 write allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL;END;
 ASSERT NOT has_function_privilege('anon','public.save_course_work(uuid,text,jsonb)','execute'),'anonymous draft write allowed';
END $$;
ROLLBACK;
