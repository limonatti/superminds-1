"""Compile explicit activity models; never guess or hide fields in the browser.
Options and banks use the printed exercise and reviewed answer forms.
Reviewed exceptions live in data/activity-overrides.json.
"""
from pathlib import Path
import json,re,hashlib,collections,copy
from PIL import Image
from source_parser import clean
from interactive_models import adapt
R=Path(__file__).parent
read=lambda f:json.loads((R/f).read_text().split('=',1)[1].strip().rstrip(';'))
D=read('assets/course.js');D['transcripts']=json.loads((R/'data/transcripts.json').read_text());D['videoTranscripts']=json.loads((R/'data/video-transcripts.json').read_text());S=read('assets/exercise-sources.js');O=json.loads((R/'data/activity-overrides.json').read_text())
E={e['id']:e for p in D['pages'] for e in p['exercises']};P={e['id']:p for p in D['pages'] for e in p['exercises']}
RED=0xda2128

def options(vals):return [{'value':v,'label':{'T':'True','F':'False','NG':'Not given','Ø':'Ø · без артикля'}.get(v,v)} for v in vals]
def apply(e,o):
 for k,v in o.items():
  if k in ['acceptedVariants','contextPages']:continue
  if k=='activity':e[k]={**e.get(k,{}),**copy.deepcopy(v)}
  else:e[k]=copy.deepcopy(v)

def printed_choices(e):
 ins=e.get('instructionText','') or e['text'][:200];t=ins.replace('–','-').replace('−','-')
 if re.search(r'true.*false|true.*\(T\).*\(F\)',t,re.I):return options(['T','F']+(['NG'] if re.search('not given',t,re.I) else []))
 if re.search(r'\bA\s*,?\s*B\s*,?\s*(?:or\s*)?C\b',t,re.I):return options(list('ABCD' if re.search(r'\bC\s*(?:or|,)\s*D\b',t,re.I) else 'ABC'))
 m=re.search(r'\b([A-Ja-j])\s*[-–]\s*([A-Ja-j])\b',t)
 if m and m[1].lower()=='a' and m[2].lower()>'a':return options([chr(n) for n in range(ord(m[1]),ord(m[2])+1)])
 m=re.search(r'\b([A-J])\s+or\s+([A-J])\b',t)
 if m:return options([m[1],m[2]])
 return []

def source_bank(e):
 ins=e.get('instructionText','') or e['text'][:180]
 if not re.search(r'(?:in|from) the box',ins,re.I):return []
 # Printed banks in the teacher PDF preserve double-space delimiters.
 spans=e.get('_spans',[]);rows=[]
 for s in spans:
  if s['color']!=RED and ('Medium' in s.get('font','') or 'Heavy' in s.get('font','')) and re.search(r'\S\s{2,}\S',s['text']) and not re.match(r'^\s*\d',s['text']) and not re.search(r'[.!?:;]|\b(?:Complete|Listen|Exercise|SPEAKING|GRAMMAR)\b',s['text']):
   rows.append(s)
 if not rows:return []
 rows.sort(key=lambda s:(round(s['bbox'][1]/4),s['bbox'][0]));out=[]
 for s in rows:
  for v in re.split(r'\s{2,}',s['text'].strip()):
   if v.strip() and len(v)<65:out.append(clean(v))
 return list(dict.fromkeys(out)) if 2<=len(out)<=35 else []

def tracks(e):
 vals=[]
 for s in e.get('_spans',[]):
  # Only the original grey track badge, not a chapter or exercise reference.
  if s['color']==0xffffff and re.fullmatch(r'[1-3][.,]\d{1,2}',s['text'].strip()):
   a,b=s['text'].replace(',','.').split('.');v=f'{a}.{int(b):02}'
   if (R/f'media/sb-{v}.mp3').exists():vals.append(v)
 return list(dict.fromkeys(vals))

for pg in D['pages']:
 previous=[]
 for e in pg['exercises']:
  ins=e.get('instructionText') or re.sub(r'^\d+\s*','',e['text'].split('\n')[0]);ins=re.sub(r'\s+REMEMBER THIS$','',ins)
  # These stray bold runs are examples, never part of the direction.
  ins=re.sub(r'\bfi\s+(rst|nd|ve|nish|lm|t)\b',r'fi\1',ins)
  e['instructionText']=ins
  e['tracks']=tracks(e)
  if pg['book']=='wb':
   refs=re.findall(r'(?:recording|track)\s+([1-3])\.(\d{1,2})',e['text'],re.I)
   e['tracks']=[f'{a}.{int(b):02}' for a,b in refs if (R/f'media/sb-{a}.{int(b):02}.mp3').exists()]
  if e['tracks']:previous=e['tracks']
  elif re.search('listen (?:again|and check)',ins,re.I):e['tracks']=previous[:]
  spec=e['answerSpec'];a={'kind':'write','instruction':'Выполни задание по оригиналу. Номера полей соответствуют пунктам упражнения.'}
  if re.search('first letters?|complete the (?:words|names)|one letter',ins,re.I):a['instruction']='Введи слова целиком, включая напечатанные буквы. Номера полей соответствуют оригиналу.'
  if not spec:
   if re.search(r'\bSPEAKING\b|\b(?:discuss|in pairs|ask and answer|compare with|your partner)\b',ins,re.I):a['kind']='speaking'
   elif re.search(r'listen.*repeat',ins,re.I):a['kind']='listening'
   elif re.match(r'Read (?:REMEMBER THIS|the GRAMMAR FOCUS)',ins,re.I):a['kind']='reading'
   elif re.search(r'\b(?:write|rewrite|complete|answer|label|match|choose|put|circle)\b',ins,re.I):a['kind']='write'
   else:a['kind']='speaking' if re.search('think|describe|what|which',ins,re.I) else 'reading'
   if a['kind']=='speaking':a['instruction']='Выполни устное задание по оригиналу. Можно сохранить опорные фразы, а затем отметить выполнение.'
   elif a['kind']=='listening':a['instruction']='Прослушай оригинальную запись и выполни задание. Повтори нужный фрагмент, затем отметь выполнение.'
   elif a['kind']=='reading':a['instruction']='Прочитай материал и выполни указания в оригинале. Сохрани заметки или отметь выполнение.'
   else:a['instruction']='Запиши ответ по номерам пунктов. Свободный ответ сохранится для проверки с преподавателем.'
  a['fields']=[{'label':f.get('displayLabel',f['label'])} for f in spec]
  opts=printed_choices(e)
  for i,f in enumerate(spec):
   slot=next((s for s in e.get('sourceSlots',[]) if s['label']==f['label']),None)
   if opts and all(any(v.lower()==o['value'].lower() for o in opts) for v in f.get('accepted',[]) if len(v)==1):
    if f.get('accepted') and all(len(v)==1 or v in ['true','false','not given'] for v in f['accepted']):a['fields'][i]['options']=opts
   if slot and slot.get('options') and len(slot['options'])>=2:
    a['fields'][i]['options']=options(slot['options'])
   if re.match(r'^\d+[a-z]$',f['label']):
    n=f['label'][:-1];parts=[q for q in spec if re.fullmatch(re.escape(n)+r'[a-z]',q['label'])]
    if len(parts)>1:a['fields'][i]['label']=f'{n} · {ord(f["label"][-1])-96}/{len(parts)}'
  bank=source_bank(e)
  if bank:a['bank']=bank
  e['activity']=a
  if e['id'] in O:apply(e,O[e['id']])
  if not e['answerSpec'] and e['activity']['kind']=='write' and re.search(r'^SPEAKING',ins):e['activity']['kind']='speaking'
  if e['id'] in O and 'answerSpec' in O[e['id']] and 'fields' not in O[e['id']].get('activity',{}):e['activity']['fields']=[{'label':f['label']} for f in e['answerSpec']]
# Apply reviewed alternatives and split genuinely separate printed gaps.
for e in E.values():
 o=O.get(e['id'],{})
 for f in e['answerSpec']:
  if f['label'] in o.get('acceptedVariants',{}):f['accepted']=o['acceptedVariants'][f['label']][:]
 if e['id'] in O.get('_splitComma',[]):
  fields=[];meta=[]
  for i,f in enumerate(e['answerSpec']):
   parts=f.get('accepted',[''])[0].split(', ')
   if len(parts)>1:
    fields.extend({'label':f['label']+chr(97+j),'accepted':[v]} for j,v in enumerate(parts));meta.extend({} for _ in parts)
   else:fields.append(f);meta.append(e['activity']['fields'][i] if i<len(e['activity']['fields']) else {})
  e['answerSpec']=fields;e['activity']['fields']=meta
 if e['id'] in ['wb-29-4','wb-38-2','wb-42-3','wb-61-5','wb-128-3']:
  fields=[];meta=[]
  for i,f in enumerate(e['answerSpec']):
   m=re.fullmatch(r'(.*?)\s*\([^()]+\)\s*(.+)',f.get('accepted',[''])[0])
   if m:
    fields.extend({'label':f['label']+chr(97+j),'accepted':[v.strip()]} for j,v in enumerate(m.groups()));meta.extend({} for _ in range(2))
   else:fields.append(f);meta.append(e['activity']['fields'][i] if i<len(e['activity']['fields']) else {})
  e['answerSpec']=fields;e['activity']['fields']=meta
 # Parentheses in verb prompts mean the printed subject belongs in the full question here.
 if e['id']=='wb-130-1':
  for f in e['answerSpec']:f['accepted']=[re.sub(r'\(([^)]+)\)',r'\1',v) for v in f['accepted'][:1]]
 for f in e['answerSpec']:
  if not f.get('accepted'):continue
  v=f['accepted'][0]
  m=re.match(r'^(am|is|are|have|has)/[‘’\'](m|s|re|ve) (.+)$',v)
  if m:f['accepted']=[m[1]+' '+m[3],'’'+m[2]+' '+m[3]]
  elif re.fullmatch(r'[^/\s]+/[^/\s]+',v):f['accepted']=v.split('/')
 for n in o.get('contextPages',[]):
  pg=next(p for p in D['pages'] if p['book']==P[e['id']]['book'] and p['page']==n)
  from PIL import Image
  S[e['id']]['sources'].append({'image':pg['image'],'page':n,'size':list(Image.open(R/pg['image']).size),'box':[0,0,1,1],'context':True})
# Propagate Word Store model after reviewed corrections; retain SB's exact directions/audio.
for e in E.values():
 if e.get('wordStore'):
  target=E[e['wordStore']]
  for key in ['answerSpec','key','keySource']:e[key]=copy.deepcopy(target[key])
  e['activity']=copy.deepcopy(target['activity'])
  if e['id'] in O:apply(e,O[e['id']])
# Workbook exam-speaking questions are printed in two columns. Keep their reading order.
for pg in D['pages']:
 if pg['book']!='wb' or pg['page'] not in range(21,106,12):continue
 ocr=json.loads((R/f'data/ocr/wb-{pg["pdfPage"]}.jpg.json').read_text())
 for i,e in enumerate(pg['exercises']):
  end=min((n['y'] for n in pg['exercises'] if n['y']>e['y']+.01),default=.97)
  rows=[w for w in ocr if e['y']+.008<w['y']<end-.004]
  rows.sort(key=lambda w:(w['x']>.53,round(w['y']/.004),w['x']))
  e['_cardText']='\n'.join(w['text'] for w in rows)
# Review-specific meaning, no answer-derived distractors.
for id in ['ws-3-1','ws-13-2']:
 E[id]['activity']['bank']=['have','go','play'] if id=='ws-3-1' else ['go','do','play']
for id in ['sb-6-6']:E[id]['activity']['bank']=['this','that','these','those']
for id in ['sb-6-7']:E[id]['activity']['fields']=[{'options':options(['it’s','they’re'])} for _ in E[id]['answerSpec']]
for id in ['sb-8-3','sb-8-4']:E[id]['activity']['fields']=[{'options':options(['can','can’t'])} for _ in E[id]['answerSpec']]
for id in ['sb-9-4','sb-9-5']:E[id]['activity']['fields']=[{'options':options(['there is','there are'])} for _ in E[id]['answerSpec']]
for e in E.values():
 e['_reviewedInstruction']=bool(O.get(e['id'],{}).get('activity',{}).get('instruction'))
 # Letter sets supplied as a source list have no meaningful answer order.
 for f in e['answerSpec']:
  if f.get('accepted') and re.fullmatch(r'[a-jA-J](?:,\s*[a-jA-J])+',f['accepted'][0]):
   f['kind']='set';f['members']=[[s.strip()] for s in f['accepted'][0].split(',')];f.pop('accepted')
 # User-written/suggested answers stay reviewable, not rigidly marked.
 if not e['answerSpec']:e['marking']={'mode':'open'}
 elif e['marking']['mode']=='open':e['marking']={'mode':'automatic'}
 ins=e['instructionText']
 if e['answerSpec'] and re.search('true for you|your own|Then.*ask and answer|SPEAKING.*Complete',ins,re.I):e['marking']['mode']='mixed'
 for f in e['answerSpec']:
  if f.get('accepted'):
   f['accepted']=[clean(v) for v in f['accepted']]
   # Do not accept the key's explanatory brackets as a compulsory answer.
   v=f['accepted'][0]
   if '(' in v:
    f['accepted'].append(clean(re.sub(r'\(([^()]*)\)',r'\1',v)))
   f['accepted']=list(dict.fromkeys(f['accepted']))
 if e['answerSpec']:
  a=e['activity'];a['fields']=(a.get('fields',[])+[{} for _ in e['answerSpec']])[:len(e['answerSpec'])]
  if any(f.get('tokens') for f in a['fields']):a['kind']='build'
  elif any(f.get('multiOptions') for f in a['fields']):a['kind']='multi-choice'
  elif any(f.get('options') for f in a['fields']):a['kind']='matching' if re.search('match',ins,re.I) else 'choice'
  elif any(f.get('kind')=='set' for f in e['answerSpec']):a['kind']='sort'
  elif a.get('bank'):a['kind']='bank'
 adapt(e,E)
 e.pop('_reviewedInstruction',None);e.pop('_cardText',None)
 e['answerVersion']=hashlib.sha256(json.dumps(e['answerSpec'],sort_keys=True).encode()).hexdigest()[:12]
 if e['answerSpec']:
  e['key']='\n'.join(str(f['label'])+' '+(' / '.join(f['accepted']) if f.get('accepted') else '; '.join('/'.join(x) for x in f['members'])) for f in e['answerSpec']) or e['key']
 # Keep a complete source page available even when no keyword requested context.
 src=S[e['id']]['sources'];pg=P[e['id']]
 if not any(s.get('context') and s['image']==pg['image'] for s in src):src.append({'image':pg['image'],'page':pg['page'],'size':src[0]['size'],'box':[0,0,1,1],'context':True})
 e.pop('_spans',None);e.pop('sourceSlots',None)
# Workbook's container practice explicitly references WORD STORE 2A/2B.
ws=P['ws-5-1'];S['wb-24-4']['sources'].append({'image':ws['image'],'page':ws['page'],'size':list(Image.open(R/ws['image']).size),'box':[0,0,1,1],'caption':'WORD STORE 2A–2B'})
# Word Store assignment directions can refer to previous SB spread.
for pg in D['pages']:
 pg['tracks']=list(dict.fromkeys(t for e in pg['exercises'] for t in e['tracks'])) or pg['tracks']
coverage={b:{'pages':sum(p['book']==b for p in D['pages']),'exercises':sum(len(p['exercises']) for p in D['pages'] if p['book']==b),'automatic':sum(bool(e['answerSpec']) for p in D['pages'] if p['book']==b for e in p['exercises'])} for b in ['sb','wb','ws']}
(R/'assets/course.js').write_text('window.FOCUS = '+json.dumps(D,ensure_ascii=False,separators=(',',':'))+';\n')
(R/'assets/exercise-sources.js').write_text('window.EXERCISE_SOURCES = '+json.dumps(S,ensure_ascii=False,separators=(',',':'))+';\n')
(R/'audit/coverage.json').write_text(json.dumps(coverage,indent=2)+'\n')
print(coverage)
print('Activities:',dict(collections.Counter(e['activity']['kind'] for e in E.values())),'word banks',sum(bool(e['activity'].get('bank')) for e in E.values()),'choices',sum(any(f.get('options') for f in e['activity']['fields']) for e in E.values()))

# Keep the verified, human-recorded video catalogue reproducible.
V=json.loads((R/"data/videos.json").read_text())
(R/"assets/videos.js").write_text("window.FOCUS_VIDEOS = "+json.dumps(V,ensure_ascii=False,separators=(",",":"))+";\n")
