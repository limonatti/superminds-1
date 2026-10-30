#!/usr/bin/env python3
"""Build the audited Outcomes exercise bank. Source edits belong in reviewed-tasks.json."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'scripts/outcomes-audit/reviewed-tasks.json'
bank=json.loads(SOURCE.read_text());ids=set();report={'version':1,'source':'Supplied Student’s Book, Workbook and matching Teacher’s Book','pages':{},'totals':{}}
for page,exercises in bank.items():
 for exercise in exercises:
  assert exercise['id'] not in ids,exercise['id'];ids.add(exercise['id'])
  check=exercise['check'];check.pop('revision',None)
  assert check['mode'] in ('items','model','self'),exercise['id']
  if check['mode']=='items':
   assert check['items'],exercise['id']
   labels=[]
   for field in check['items']:
    labels.append(str(field['label']))
    assert field.get('self') or field.get('key'),(exercise['id'],field)
    assert not field.get('self') or field.get('soft'),(exercise['id'],field)
   assert len(labels)==len(set(labels)),exercise['id']
   exercise['count']=len(check['items'])
  check['revision']=hashlib.sha256(json.dumps(check,sort_keys=True,ensure_ascii=False).encode()).hexdigest()[:12]
  category='grammar' if exercise.get('grammar') else exercise['book']
  totals=report['totals'].setdefault(category,{'exercises':0,'automatic':0,'mixed':0,'selfCheck':0,'scoredAnswers':0})
  totals['exercises']+=1
  fields=check.get('items',[])
  category='mixed' if any(f.get('soft') for f in fields) else 'automatic' if fields else 'selfCheck'
  totals[category]+=1;totals['scoredAnswers']+=sum(not f.get('soft') for f in fields)
 report['pages'][page]=len(exercises)
(ROOT/'outcomes-beginner-active-teach/assets/exercises.js').write_text('window.OUTCOMES_EXERCISES='+json.dumps(bank,ensure_ascii=False,separators=(',',':'))+';\n')
(ROOT/'scripts/outcomes-audit/coverage.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report['totals'],ensure_ascii=False))
