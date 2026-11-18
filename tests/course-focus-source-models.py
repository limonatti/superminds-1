"""Presentation may consume printed source, never hidden teacher answers or keys."""
from pathlib import Path
import importlib.util,json,copy
root=Path(__file__).resolve().parents[1]
s=importlib.util.spec_from_file_location('focus_models',root/'scripts/build-course-focus-models.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
for course,id in [('focus-3','sb-16-1'),('focus-3','sb-22-5'),('focus-2','sb-30-1')]:
 base=root/(course+'-active-teach');d=m.read_js(base/'assets/course.js');pg,e=next((p,e) for p in d['pages'] for e in p['exercises'] if e['id']==id)
 source=json.loads((base/'data/sb-text.json').read_text())[str(pg['pdfPage'])];before=m.model_for(e,pg,source);changed=copy.deepcopy(e)
 for field in changed.get('answerSpec',[]):
  field['accepted']=['SECRET_POISON'];field['members']=[['SECRET_POISON']]
 assert m.model_for(changed,pg,source)==before,'candidate bank depends on grading keys'
 changedSource=copy.deepcopy(source)
 for span in changedSource['spans']:
  if span.get('color') in m.REDACT:span['text']='TEACHER_SECRET'
 after=m.model_for(e,pg,changedSource);assert 'TEACHER_SECRET' not in json.dumps(after)
 assert after.get('bank')==before.get('bank')
 assert all('_____' in p for p in after.get('prompts',{}).values())
for c in ['focus-2','focus-3']:
 models=m.read_js(root/(c+'-active-teach/assets/focus-models.js'))
 for id,v in models.items():
  assert v.get('prompts') or v.get('bank')
  assert all(not any(ord(ch)<32 for ch in text) for text in list(v.get('prompts',{}).values())+v.get('bank',[]))
  assert v['source']['method']=='printed-spans'
print('PASS source models: hidden white/red answers excluded; poisoned grading keys cannot affect prompts/cards; source provenance retained.')
