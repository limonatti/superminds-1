from pathlib import Path
import re,json,hashlib,sys,collections
from PIL import Image
import argparse
parser=argparse.ArgumentParser(description='Build Elementary exercise catalog from local OCR and teacher keys.')
parser.add_argument('--work',type=Path,required=True,help='Contains keys/{sb,wb}-columns.txt and ocr-{sb,wb}/*.jpg.json')
WORK=parser.parse_args().work
ROOT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT.parent/'solutions-int-active-teach'))
from marking_parser import numbered
(ROOT/'data').mkdir(exist_ok=True)
names=['Introduction','Family and friends','School days','Style','Food','In the city','Going wild','Digital world','Be active!','Home sweet home!']
starts={'sb':[4,8,18,30,40,52,62,74,84,96],'wb':[4,8,20,30,42,52,64,74,86,96]}
source={};banks={}
header=re.compile(r'(?m)^Exercise\s+(\d+)\b[^\n]*?\bpage\s+(\d+)\s*\n')
stop=re.compile(r'\n\s*(?:Map of resources|Review Unit|Transcript\b|For further\b|Lesson outcome\b|Extra (?:activity|support|challenge)\b|Extension\b|Culture note\b|\d?[A-I] (?:Vocabulary|Grammar|Speaking|Reading|Listening|Writing|Word Skills)\b|\d+[A-I] (?:Vocabulary|Grammar|Speaking|Reading|Listening|Writing|Word Skills)\b|Unit \d|Introduction$|Cumulative Review|Exam Skills Trainer|Vocabulary Builder|Grammar Builder|Writing Bank|Functions Bank|Learning outcomes|LEAD-IN|SHORTCUT|LESSON SUMMARY)',re.M)
def clean(s):
 s=re.sub(r'\n\[SOURCE [^\n]*\]\n','\n',s)
 s=re.sub(r'(?m)^\s*(?:(?:Introduction unit \d+|Unit \d+ \d+|Workbook answer keys and transcripts \d+|Culture Bank \d+)\s*)+$','',s)
 return s.strip()
for book in ['sb','wb']:
 text=(WORK/'keys'/f'{book}-columns.txt').read_text()
 ms=list(header.finditer(text))
 for i,m in enumerate(ms):
  body=clean(text[m.end():ms[i+1].start() if i+1<len(ms) else len(text)])
  if book=='sb':
   before=stop.split(body)[0]
   key=before.split('\nKEY\n',1)[1] if '\nKEY\n' in before else ''
  else:key=stop.split(body)[0]
  key=re.split(r'\n(?:•|\[SOURCE|Workbook answe|er keys and transcripts|Culture Bank)',key)[0].strip()
  # Footers and running section headers are not answers.
  key=re.sub(r'\s+(?:Introduction|Family and friends|School days|Style|Food|In the city|Going wild|Digital world|Be active!|Home sweet home!)\s*\d*\s*$','',key).strip()
  eid=f'{book}-{m[2]}-{m[1]}'
  record={'key':key,'notes':body.split('\nKEY\n')[0] if book=='sb' else '', 'source':f'{book}:page {m[2]}:exercise {m[1]}'}
  if eid not in source or key:source[eid]=record
 if book=='sb':
  bm=list(re.finditer(r'(?m)^(Grammar|Vocabulary) Builder\s+([\w ]+)\s+page (\d+)\s*\n',text))
  for m in bm:
   chunk=text[m.end():]
   chunk=re.split(r'\n(?:Exercise |Lesson outcome|For further|Extra |\[SOURCE|[A-I]?[A-I] (?:Grammar|Vocabulary)|\d[A-I] )',chunk)[0]
   em=list(re.finditer(r'(?m)^(\d{1,2})\s+(?=\d{1,2}\s|[A-H]\s)',chunk))
   for i,e in enumerate(em):
    raw=clean(chunk[e.end():em[i+1].start() if i+1<len(em) else len(chunk)])
    if raw:banks[f'sb-{m[3]}-{e[1]}']={'key':raw,'notes':'','source':m[0].strip()}
source.update(banks)
(ROOT/'data/source-keys.json').write_text(json.dumps(source,ensure_ascii=False,indent=2)+'\n')
manifest=json.loads((ROOT/'manifest.js').read_text().removeprefix('window.SOL=').rstrip(';'))
media={b:{r['t']:r['f'] for r in manifest[b]} for b in ['sb','wb']}
command=re.compile(r'\b(?:SPEAKING|VOCABULARY|Read|Complete|Write|Circle|Match|Rewrite|Look|Work|Now|USE|KEY|Choose|Make|Study|Underline|Find|Answer|Compare|Put|Which|Replace|Use|Label|Tick|Describe|Add|What|Order|How|Think|Join|Correct|Combine|Cover|Talk|Imagine|Brainstorm|Where|Try|Explain|Listen|Check|Do|Say|Ask|Find|Discuss|Are|Is|Can|Fill|Draw|Watch)\b')
pages=[];missing=[]
for book,total in [('sb',164),('wb',129)]:
 for pdf in range(1,total+1):
  p=pdf-1;pid=f'{book}-{p}';path=WORK/f'ocr-{book}'/f'{pdf:03}.jpg.json'
  if not path.exists():continue
  ws=[w for w in json.loads(path.read_text()) if w['h']<.045 and .10<w['y']<.965]
  unit=max([i for i,n in enumerate(starts[book]) if p>=n]or[0]);bank=None
  if p<4:unit='extra';bank='Обложка и содержание'
  if book=='sb' and p>=108:unit='extra';bank='Culture Bank' if p<117 else 'Vocabulary Builder' if p<122 else 'Grammar Builder & Reference' if p<142 else 'Extra Speaking Tasks' if p==142 else 'Irregular verbs' if p==143 else 'DVD Worksheets'
  if book=='wb' and p>=108:unit='extra';bank='Cumulative Review' if p<118 else 'Writing Bank' if p<120 else 'Functions Bank' if p<122 else 'Wordlist' if p<128 else 'Irregular verbs'
  expected={eid.rsplit('-',1)[1]:record for eid,record in source.items() if eid.rsplit('-',1)[0]==pid}
  candidates=[]
  for w in ws:
   t=w['text'].strip();t=re.sub(r'^([Il])(?=\s+(?:SPEAKING|VOCABULARY|Read|Listen|Complete|Write|Look))','1',t);m=re.match(r'^(\d{1,2})(?:\s|$)',t)
   if not m:
    fused=re.match(r'^(\d{1,2})(?=[•*@]|[1-4]\.\d{2})',t)
    if fused:m=fused
   if not m or not 1<=int(m[1])<=20:continue
   x=w['x'];margin=(.045<x<.071 or .490<x<.518 or .315<x<.342 or .556<x<.585)
   if not margin and m[1] in expected and m[1]=="1" and (.074<=x<.095 or .522<=x<.55 or .346<=x<.365):margin=bool(command.match(t[m.end():].strip()))
   if not margin:continue
   nearby=' '.join(v['text'] for v in ws if abs(v['y']-w['y'])<.009 and x<=v['x']<min(.96,x+.11))
   prompt=re.sub(r'^\d{1,2}\s*(?:[•*@O]*(?:[1-4]\.\d{2})\s*)?', '', nearby).strip()
   imperative=re.match(r'(?:SPEAKING|VOCABULARY|Read|Complete|Write|Circle|Match|Rewrite|Look|Work|Now|USE|KEY|Choose|Make|Study|Underline|Find|Answer|Compare|Put|Replace|Use|Label|Tick|Describe|Add|Order|Think|Join|Correct|Combine|Cover|Talk|Imagine|Brainstorm|Try|Explain|Listen|Check|Say|Ask|Discuss|Fill|Draw|Watch)\b',prompt)
   if m[1] in expected or imperative:candidates.append({**w,'label':m[1],'line':nearby})
  # A main exercise label shares the outer margin; inner numbered answers are indented.
  anchors=[]
  for a in sorted(candidates,key=lambda v:(v['x']>.48,v['y'])):
   if any(v['label']==a['label'] for v in anchors) and not bank:continue
   if any(v['label']==a['label'] and abs(v['y']-a['y'])<.014 for v in anchors):continue
   anchors.append(a)
  if bank in ['Обложка и содержание','Wordlist','Irregular verbs']:anchors=[];expected={}
  exercises=[];occ=collections.Counter()
  for a in anchors:
   n=a['label'];occ[n]+=1;eid=f'{pid}-{n}'+(f'-b{occ[n]}' if occ[n]>1 else '')
   side=a['x']>.48
   x0=max(.02,a['x']-.008);right=.965 if side or .30<a['x']<.48 else .49
   nexts=[v['y'] for v in anchors if (v['x']>.48)==side and v['y']>a['y']+.014]
   bottom=min(nexts,default=.958)-.008
   region=sorted([w for w in ws if x0<=w['x']<right and a['y']-.005<=w['y']<bottom],key=lambda w:(round(w['y']/.007),w['x']))
   text='\n'.join(w['text'] for w in region)
   exercises.append({'id':eid,'label':n+(f' (блок {occ[n]})' if occ[n]>1 else ''),'x':a['x'],'y':a['y'],'box':[x0,max(0,a['y']-.009),right-x0,max(.025,bottom-a['y']+.012)],'text':text,'anchorAvailable':True})
  for n,record in expected.items():
   if n not in occ:
    eid=f'{pid}-{n}';missing.append(eid)
    exercises.append({'id':eid,'label':n,'x':0,'y':0,'box':[0,0,1,1],'text':record['notes'].split('\nKEY')[0],'anchorAvailable':False})
  # Use only the audio number printed inside the task/page; source manifest is a fallback.
  tracks=list(dict.fromkeys(t for w in ws for t in re.findall(r'(?<!\d)([1-4][.]\d{2})(?!\d)',w['text']) if t in media[book]))
  tracks=list(dict.fromkeys(tracks+[r['t'] for r in manifest[book] if r['p']==p]))
  titles=[w['text'] for w in json.loads(path.read_text()) if .03<w['y']<.13 and w['x']>.1 and w['h']>.016]
  title=' · '.join(titles)[:100] or bank or names[int(unit)]
  pages.append({'id':pid,'book':book,'page':p,'image':f'pages/{book}/{pdf:03}.jpg','unit':unit,'title':title,'bank':bank,'tracks':tracks,'exercises':sorted(exercises,key=lambda e:(int(re.match(r'\d+',e['label'])[0]),e['id']))})

def variants(v):
 v=re.sub(r'(?<=\w)-\s*\n(?=\w)', '-', v).strip().rstrip('.').strip()
 if not v:return []
 if '/' in v and '(' in v:return []
 if '/' in v:
  vals=re.split(r'\s*/\s*',v)
  # Short alternatives with a shared ending (has / hasn't got).
  if len(vals)==2 and len(vals[0].split())==1 and 1<len(vals[1].split())<=3 and vals[0].split()[-1]!=vals[1].split()[-1] and re.match(r"(?:have|has|can|is|are|was|were|[\w]+[’']s)$",vals[0]):vals[0]+=' '+' '.join(vals[1].split()[1:])
 else:vals=[v]
 out=[]
 for s in vals:
  if '(' in s:
   if re.search(r'\((?:or|e\.g\.|for example|possible)',s,re.I):return []
   out.extend([re.sub(r'\(([^()]*)\)',r'\1',s),re.sub(r'\([^()]*\)','',s)])
  else:out.append(s)
 return list(dict.fromkeys(' '.join(s.split()) for s in out if s.strip()))
counts=collections.Counter();review=[]
for pg in pages:
 for ex in pg['exercises']:
  rec=source.get(ex['id'],{});raw=rec.get('key','');text=ex['text'];sourceid=ex['id']
  if pg.get('bank') in ['Grammar Builder & Reference','Vocabulary Builder'] and any(e['id'].startswith(ex['id']+'-b') for e in pg['exercises']):raw='' 
  # A following listen-and-check task supplies the key for the preceding written task.
  if not raw and not rec.get('key'):
   nxt=source.get(pg['id']+'-'+str(int(re.match(r'\d+',ex['label'])[0])+1),{})
   if nxt.get('key') and re.search(r'check (?:their|the|your) answers',nxt.get('notes',''),re.I):raw=nxt['key'];sourceid=pg['id']+'-'+str(int(re.match(r'\d+',ex['label'])[0])+1)
  fields=[];mode='open';reason='Свободный ответ или проверка преподавателем по условию.'
  own=bool(re.search(r'(?i)(?:students.? own answers|answers (?:will )?vary|possible answers|suggested answers)',raw))
  personal=bool(re.search(r'(?i)(?:true (?:sentences |answers )?(?:for |about )?you|your own|about yourself)',text[:180]))
  rawforfields=re.sub(r'\(?Students[’\']? own answers\)?','',raw,flags=re.I).strip()
  ns=numbered(rawforfields)
  if ns and not (own and re.match(r'^\(?Possible|^Students',raw,re.I)) and not personal:
   for label,v in ns:
    if len(v)>80 or re.search(r'\b(?:Transcript|KEY|Students|page \d|Exercise|because|Workbook|For further|LESSON|Map of resources|Grammar|Vocabulary|Reading|Listening|Speaking|correct answer|Other restaurants|pronounced)\b|\[SOURCE|•',v):fields=[];break
    vals=variants(v)
    if not vals:fields=[];break
    field={'label':str(label),'accepted':vals}
    if ',' in v and re.search(r'categor|group|Which are|letters.*sound|list of',text[:300],re.I):
     parts=[q.strip() for q in v.split(',') if q.strip()]
     if len(parts)>1:field={'label':str(label),'kind':'set','members':[variants(q) for q in parts]}
    fields.append(field)
  elif raw and not own and not personal and len(raw)<45 and '\n' not in raw and not re.search(r'\b(?:because|They share|e.g.|Students)\b',raw) and not re.match(r'\d+\s',raw):
   vals=variants(raw)
   if vals:fields=[{'label':'Ответ','accepted':vals}]
  if fields:mode='mixed' if own or (re.search(r'(?i)then (?:ask|tell|discuss|answer)|SPEAKING',text[:220]) and re.search(r'(?i)complete|write the|put the|match',text[:220])) else 'automatic';reason='Проверка по ключу Teacher’s Guide / Workbook.'
  ex.update(key=raw,answerSpec=fields,answers=[f.get('accepted',[', '.join(a[0] for a in f.get('members',[]))])[0] for f in fields],answerVersion=hashlib.sha256(json.dumps(fields,sort_keys=True).encode()).hexdigest()[:12],legacyCompatible=False,marking={'mode':mode,'source':sourceid,'reason':reason})
  # Keep ambiguous multi-part keys and pronunciation/model answers for teacher review.
  if fields and (re.search(r'underline.*(?:content words|stress)|pronunciation|intonation',text[:250],re.I) or any('(' in v or ')' in v or re.search(r'\b[a-h] [a-z]{3,}\b',v) and re.search(r'\b[a-h] [a-z]{3,}\b',v[v.find(' ')+1:]) for f in fields for v in f.get('accepted',[]))):
   ex.update(answerSpec=[],answers=[],marking={'mode':'open','source':sourceid,'reason':'Развёрнутый ответ или неоднозначный формат ключа — проверяет преподаватель.'})
  # Short and full forms are equivalent in a gap; infer ’s from the grammar of this task.
  for f in ex['answerSpec']:
   expanded=[]
   for v in f.get('accepted',[]):
    if re.match(r'^[’\']s(?: |$)',v):
     form='has' if re.search(r'present perfect|have got',text[:250],re.I) or re.match(r'^[’\']s got',v) else 'is'
     expanded.append(re.sub(r'^[’\']s',form,v))
   if 'accepted' in f:f['accepted']=list(dict.fromkeys(f['accepted']+expanded))
  ex['answerVersion']=hashlib.sha256(json.dumps(ex['answerSpec'],sort_keys=True).encode()).hexdigest()[:12]
  counts[ex['marking']['mode']]+=1
  if raw and not fields:review.append({'id':ex['id'],'text':text[:300],'key':raw})
# Explicit corrections and reviewed mixed/free response specifications.
overrides_path=ROOT/'data/overrides.json'
overrides=json.loads(overrides_path.read_text()) if overrides_path.exists() else {}
for pg in pages:
 for ex in pg['exercises']:
  if ex['id'] in overrides:
   ex.update(overrides[ex['id']]);ex['answerVersion']=hashlib.sha256(json.dumps(ex['answerSpec'],sort_keys=True).encode()).hexdigest()[:12]
   ex['answers']=[f.get('accepted',[', '.join(a[0] for a in f.get('members',[]))])[0] for f in ex['answerSpec']]
# An exercise offers its own audio; a listen-and-check task may supply the preceding gap task.
for pg in pages:
 for ex in pg['exercises']:
  own=list(dict.fromkeys(t for t in re.findall(r'[1-4]\.\d{2}',ex['text'][:180]) if t in media[pg['book']]))
  if not own and ex['answerSpec']:
   n=int(re.match(r'\d+',ex['label'])[0]);following=next((e for e in pg['exercises'] if e['label']==str(n+1)),None)
   if following and re.search(r'listen.*check',following['text'][:100],re.I):own=[t for t in re.findall(r'[1-4]\.\d{2}',following['text'][:100]) if t in media[pg['book']]]
  ex['tracks']=own
D={'course':'solutions-el','units':names,'pages':pages,'tracks':{b:list(media[b]) for b in media},'media':media,'videos':manifest['video'],'markingVersion':1}
(ROOT/'assets/course.js').write_text('window.SOLUTIONS_EL='+json.dumps(D,ensure_ascii=False,separators=(',',':'))+';\n')
# Complete source for each numbered exercise, with referenced tasks as context.
views={}
for pg in pages:
 with Image.open(ROOT/pg['image']) as im:size=list(im.size)
 for ex in pg['exercises']:
  sources=[{'image':pg['image'],'size':size,'box':ex['box'],'page':pg['page']}]
  refs=set(re.findall(r'\bexercise (\d+)',ex['text'],re.I))
  for ref in refs:
   other=next((e for e in pg['exercises'] if e['label']==ref and e['id']!=ex['id']),None)
   if other:sources.append({'image':pg['image'],'size':size,'box':other['box'],'page':pg['page'],'context':True})
  x,y,w,h=ex['box']
  if ex['anchorAvailable'] and y>.24 and not any(e['x']<=x+.01 and e['y']<y for e in pg['exercises']) and re.search(r'photo|picture|dialogue|text|article|family tree',ex['text'][:200],re.I):sources.append({'image':pg['image'],'size':size,'box':[x,.05,w,y-.05],'page':pg['page'],'context':True})
  if ex['id']=='sb-4-4':sources.append({'image':pg['image'],'size':size,'box':next(e['box'] for e in pg['exercises'] if e['id']=='sb-4-3'),'page':pg['page'],'context':True})
  if ex['id']=='sb-8-2':sources.append({'image':pg['image'],'size':size,'box':[.32,.13,.65,.43],'page':pg['page'],'context':True})
  views[ex['id']]={'label':ex['label'],'sources':sources}
(ROOT/'assets/exercise-sources.js').write_text('window.EXERCISE_SOURCES='+json.dumps(views,ensure_ascii=False,separators=(',',':'))+';\n')
if not (ROOT/'assets/exercise-gaps.js').exists():(ROOT/'assets/exercise-gaps.js').write_text('window.EXERCISE_GAPS={};\n')
audit={'pages':len(pages),'exercises':len(views),'modes':dict(collections.Counter(e['marking']['mode'] for p in pages for e in p['exercises'])),'fallbackFullPage':missing,'keys':len(source),'keyedManual':review}
(ROOT/'data/audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
print({k:v for k,v in audit.items() if k not in ['keyedManual','fallbackFullPage']});print('Full-page fallback',len(missing),missing[:80]);print('Keyed manual',len(review))

models=[{'id':e['id'],'text':e['text'],'sources':views[e['id']]['sources'],'fields':[{'id':f['label'],'answers':f['accepted']} for f in e['answerSpec'] if f.get('accepted')]} for p in pages for e in p['exercises'] if e['answerSpec'] and e['anchorAvailable']]
(WORK/'models.json').write_text(json.dumps({'solutions-el':models},ensure_ascii=False))
