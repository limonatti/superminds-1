#!/usr/bin/env python3
"""Apply reviewed Unit 1A corrections without requiring the original OCR workdir.
Source banks live in unit1a-reviewed.js, never inferred from grading keys.
The full builder consumes the same overrides and source-context file.
"""
import collections,hashlib,json,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]; BASE=ROOT/'solutions-el-active-teach'
def read(name,prefix):return json.loads((BASE/name).read_text().removeprefix(prefix).rstrip(';\n'))
def write(name,prefix,value):(BASE/name).write_text(prefix+json.dumps(value,ensure_ascii=False,separators=(',',':'))+';\n')
d=read('assets/course.js','window.SOLUTIONS_EL=');overrides=json.loads((BASE/'data/overrides.json').read_text());contexts=json.loads((BASE/'data/source-context-overrides.json').read_text())
for page in d['pages']:
 for e in page['exercises']:
  if e['id'] not in contexts:continue
  e.update(overrides[e['id']]);e['answerVersion']=hashlib.sha256(json.dumps(e['answerSpec'],sort_keys=True).encode()).hexdigest()[:12]
  e['answers']=[f.get('accepted',[', '.join(a[0] for a in f.get('members',[]))])[0] for f in e['answerSpec']]
write('assets/course.js','window.SOLUTIONS_EL=',d)
s=read('assets/exercise-sources.js','window.EXERCISE_SOURCES=');s.update(contexts);write('assets/exercise-sources.js','window.EXERCISE_SOURCES=',s)
audit=json.loads((BASE/'data/audit.json').read_text());audit['modes']=dict(collections.Counter(e['marking']['mode'] for p in d['pages'] for e in p['exercises']));audit['reviewedUnit1A']=list(contexts);audit['keyedManual']=[e for e in audit['keyedManual'] if e['id']!='sb-9-8'];(BASE/'data/audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
print('Applied 10 source-reviewed Unit 1A tasks and context; existing answer versions retained where schemas are unchanged.')
