from pathlib import Path
import json
R=Path(__file__).resolve().parent
p=R/'assets/course.js'
d=json.loads(p.read_text().split('=',1)[1].strip().rstrip(';'))
overrides=json.loads((R/'data/reviewed-tasks.json').read_text())
for page in d['pages']:
 if page['id']=='sb-11':page['tracks']=['1.09','1.10','1.11']
 for e in page['exercises']:
  if e['id'] in overrides:
   patch=dict(overrides[e['id']]);instruction=patch.pop('markingInstruction');e.update(patch);e['marking']['instruction']=instruction;e['marking']['responseMode']='panel'
p.write_text('window.SOLUTIONS = '+json.dumps(d,ensure_ascii=False,separators=(',',':'))+';\n')
