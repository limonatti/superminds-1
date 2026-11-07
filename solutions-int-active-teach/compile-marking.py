"""Compile reviewed answer specifications; preserve page coordinates and exercise IDs."""
from pathlib import Path
import json,re,hashlib,itertools
from marking_parser import numbered
ROOT=Path(__file__).resolve().parent
legacy=json.loads((ROOT/'data/legacy-marking.json').read_text())
sources=json.loads((ROOT/'data/source-keys.json').read_text())
overrides=json.loads((ROOT/'data/marking-overrides.json').read_text())
D=json.loads((ROOT/'assets/course.js').read_text().removeprefix('window.SOLUTIONS = ').strip().removesuffix(';'))

geometry=json.loads((ROOT/'data/geometry-overrides.json').read_text())
for page in D['pages']:
 page['exercises']=[e for e in page['exercises'] if e['id'] not in geometry['remove']]
 for eid,record in geometry['upsert'].items():
  if eid.rsplit('-',1)[0]==page['id'] or eid.startswith(page['id']+'-'):
   existing=next((e for e in page['exercises'] if e['id']==eid),None)
   if existing:existing.update(record)
   else:page['exercises'].append(dict(record))
 page['exercises'].sort(key=lambda e:(int(re.match(r'\d+',e['label'])[0]),e['id']))

def clean(s):
 s=re.sub(r'(?m)^(?:Reading|Listening|Speaking|Writing|Grammar and vocabulary|Cumulative Review[^\n]*|\(Units[^\n]*\))\s*$', '',s)
 s=re.sub(r'\s+(?:Generations|Leisure time|The human body|Home|Technology|High flyers|Artists|Messages|Journeys)\s+[1-9]\s*$','',s)
 return s.strip()

def variants(s):
 # Explicit overrides handle in-sentence alternatives; never guess shared prefixes.
 if '/' in s and not re.search(r'\d/\d',s):
  pieces=re.split(r'\s*/\s*',s)
  if any(len(x.split())>5 for x in pieces):return None
  return pieces
 vals=[s]
 while any(re.search(r'\([^()]+\)',v) for v in vals):
  nexts=[]
  for v in vals:
   m=re.search(r'\(([^()]+)\)',v)
   if not m:nexts.append(v);continue
   if len(m[1])>40:return None
   nexts.extend([v[:m.start()]+m[1]+v[m.end():],v[:m.start()]+v[m.end():]])
  vals=nexts
 return list(dict.fromkeys(' '.join(v.split()) for v in vals if v.strip()))

def field(label,s):
 vals=variants(s)
 return {'label':str(label),'accepted':vals} if vals else None

review=[];counts={'automatic':0,'mixed':0,'open':0,'pending':0};allids=set()
for page in D['pages']:
 for ex in page['exercises']:
  eid=ex['id'];allids.add(eid);ov=overrides.get(eid,{})
  source=ov.get('source',eid)
  raw=clean(ov.get('key',sources.get(source,'')))
  ex['key']=raw;ex.pop('answerSpec',None)
  spec=ov.get('fields')
  reason=ov.get('reason','')
  mode=ov.get('mode')
  if mode=='open':spec=[]
  elif spec is None:
   if re.search(r'^(?:\(Possible answers?\)|Students[’\']? own answers?|Answers (?:will )?vary)',raw,re.I):mode='open';reason='Свободный ответ: в ключах приведён пример.';spec=[]
   elif raw:
    ns=numbered(raw)
    if ns and all(len(v)<170 and not re.search(r'…|\b(?:because|suggests|implies|incorrect because|correct because|Type \d|There are|means that)\b',v) for _,v in ns):
     spec=[field(n,v) for n,v in ns]
     if None in spec:spec=None
    elif re.fullmatch(r'[a-hA-H]|\d{1,2}|Yes|No|yes|no',raw):spec=[field('Ответ',raw)]
  if spec:
   # Parentheses in printed keys denote optional words, including manually reviewed keys.
   for f in spec:
    for name in ('accepted',):
     if name in f:
      f[name]=list(dict.fromkeys(x for v in f[name] for x in (variants(v) if '(' in v and '/' not in v else [v])))
   assert len({f['label'] for f in spec})==len(spec), eid
   ex['answerSpec']=spec
   ex['answers']=[f.get('accepted',['; '.join(x[0] for x in f.get('members',[]))])[0] for f in spec]
   mode=mode or 'automatic';counts[mode]+=1
  else:
   ex['answers']=[]
   mode=mode or ('open' if not raw and re.search(r'SPEAKING|INTERNET RESEARCH|your (?:own|ideas|opinion|answers)|Work in pairs|work in pairs|Write (?:a|an|your|about|true|six true|five sentences)|Now do|Now try|Make notes|Read aloud|Try reading aloud|Listen.*check your',ex['text'][:260]) else 'pending')
   counts[mode]+=1
  ex['answerVersion']=hashlib.sha256(json.dumps(spec or [],sort_keys=True,ensure_ascii=False).encode()).hexdigest()[:12]
  ex['legacyCompatible']=bool(spec) and ex['answers']==legacy.get(eid) and [f['label'] for f in spec]==[str(i+1) for i in range(len(spec))]
  ex['marking']={'mode':mode,'source':source,'reason':reason}
  if ov.get('instruction'):ex['marking']['instruction']=ov['instruction']
  if ov.get('responseMode'):ex['marking']['responseMode']=ov['responseMode']
  if mode in ('pending','open'):review.append({'id':eid,'mode':mode,'text':ex['text'],'key':raw,'reason':reason})
unknown=set(overrides)-allids
assert not unknown, sorted(unknown)
D['markingVersion']=2
(ROOT/'assets/course.js').write_text('window.SOLUTIONS = '+json.dumps(D,ensure_ascii=False,separators=(',',':'))+';\n')
(ROOT/'data/marking-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
(ROOT/'data/marking-audit.json').write_text(json.dumps(counts,indent=2)+'\n')
print(counts)
audit_path=ROOT/'audit.json'
audit=json.loads(audit_path.read_text()) if audit_path.exists() else {}
audit.update(pages=len(D['pages']),exercises=len(allids),automatic=counts['automatic']+counts['mixed'],mixed=counts['mixed'],open=counts['open'],pending=counts['pending'],withKeys=sum(bool(e['key']) for p in D['pages'] for e in p['exercises']))
audit_path.write_text(json.dumps(audit,indent=2)+'\n')
