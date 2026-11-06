-- Synthetic stroke records only; the transaction is always rolled back.
BEGIN;
DO $$BEGIN PERFORM set_config('request.jwt.claim.sub',(SELECT id::text FROM auth.users ORDER BY created_at LIMIT 1),true);END $$;
SET LOCAL ROLE authenticated;
DO $$
DECLARE u uuid=auth.uid(); c text; saved jsonb; old_progress jsonb; old_book jsonb;
BEGIN
 SELECT data INTO old_progress FROM public.progress WHERE user_id=u;
 FOREACH c IN ARRAY ARRAY['speakout-a1','speakout-b1','speakout-b1plus'] LOOP
  old_book=coalesce(old_progress->'__coursework'->c,'{}'::jsonb);
  saved=public.save_course_work(u,c,'{"__ink:sb:999:phase5_first":{"kind":"ink","book":"sb","page":999,"stroke":{"id":"phase5_first","type":"pen","points":[[0.1,0.2],[0.3,0.4]]},"updatedAt":1}}');
  saved=public.save_course_work(u,c,'{"__ink:sb:999:phase5_second":{"kind":"ink","book":"sb","page":999,"stroke":{"id":"phase5_second","type":"marker","points":[[0.2,0.3],[0.4,0.5]]},"updatedAt":2}}');
  ASSERT saved->'__ink:sb:999:phase5_first'->'stroke'->>'type'='pen','independent stroke overwritten';
  saved=public.save_course_work(u,c,'{"__ink:sb:999:phase5_first":{"kind":"ink","book":"sb","page":999,"stroke":null,"updatedAt":3}}');
  saved=public.save_course_work(u,c,'{"__ink:sb:999:phase5_first":{"kind":"ink","book":"sb","page":999,"stroke":{"id":"phase5_first","type":"pen","points":[[0.1,0.2]]},"updatedAt":1}}');
  ASSERT saved->'__ink:sb:999:phase5_first'->'stroke'='null'::jsonb,'stale device restored erased mark';
  ASSERT saved->'__ink:sb:999:phase5_second'->'stroke'->>'type'='marker','erasure removed another stroke';
  ASSERT saved-'__ink:sb:999:phase5_first'-'__ink:sb:999:phase5_second'=old_book,'existing answers changed';
 END LOOP;
 ASSERT (SELECT data-'__coursework' FROM public.progress WHERE user_id=u)=coalesce(old_progress-'__coursework','{}'::jsonb),'vocabulary changed';
 BEGIN
  PERFORM public.save_course_work(gen_random_uuid(),'speakout-a1','{}');RAISE EXCEPTION 'cross-account write allowed';
 EXCEPTION WHEN OTHERS THEN IF SQLERRM<>'Account changed' THEN RAISE;END IF;END;
 PERFORM set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 ASSERT NOT EXISTS(SELECT FROM public.progress WHERE user_id=u),'cross-account read allowed';
 PERFORM set_config('request.jwt.claim.sub',u::text,true);
 ASSERT NOT has_function_privilege('anon','public.save_course_work(uuid,text,jsonb)','execute'),'anonymous write allowed';
END $$;
ROLLBACK;
