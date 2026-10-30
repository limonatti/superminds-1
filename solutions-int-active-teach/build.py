"""Build data from locally extracted OCR and answer keys. Run from repository root.
Scanned originals are kept in Downloads; intermediates live in tmp/solutions-int.
Review OCR anchors and key mappings before enabling automatic marking.
"""
from pathlib import Path
import re,json,collections
ROOT=Path(__file__).resolve().parent
TMP=ROOT.parent/'tmp/solutions-int'
names=['Introduction','Generations','Leisure time','The human body','Home','Technology','High flyers','Artists','Messages','Journeys']
starts={'sb':[4,8,20,30,42,52,64,74,86,96],'wb':[4,8,18,30,40,52,62,74,84,96]}

def read_keys(book):
 text=(TMP/f'{book}-columns.txt').read_text()
 matches=list(re.finditer(r'Exercise\s+(\d+)\s+([^\n]*?)page\s+(\d+)\s*\n',text))
 out={}
 for i,m in enumerate(matches):
  raw=text[m.end():matches[i+1].start() if i+1<len(matches) else len(text)]
  raw=re.split(r'\n(?:Transcript|For further|\d?[A-I] |\d[A-I] |I[A-D] |\d+[A-Z]? (?:Grammar|Vocabulary|Listening|Reading|Speaking|Writing)|Grammar Builder|Vocabulary Builder|©|Solns |\d+ (?:Introduction|Unit)|B2 Exam|Culture Bank|Lesson outcome)',raw)[0].strip()
  # Keep only the initial answer block, never teaching notes or the next heading.
  raw=re.split(r'\n(?:[A-Z][a-z]+(?: [a-z]+){0,4})\n',raw)[0].strip()
  if len(raw)>1800: raw=''
  if raw: out[f'{book}-{m[3]}-{m[1]}']={'text':raw,'items':[]}
 return out
keys={**read_keys('sb'),**read_keys('wb')}

def items(raw):
 if not re.match(r'^1\s',raw) or re.search(r'possible|students|answers vary|suggested',raw,re.I):return []
 ms=list(re.finditer(r'(?<!\w)(\d{1,2})\s+',raw))
 if [int(m[1]) for m in ms]!=list(range(1,len(ms)+1)) or len(ms)<2:return []
 vals=[' '.join(raw[m.end():ms[i+1].start() if i+1<len(ms) else len(raw)].split()).strip() for i,m in enumerate(ms)]
 if any('(' in v or ')' in v or v.count('/')>1 or not v or len(v)>65 or re.search(r'Exercise|page |Transcript|Grammar|Vocabulary|©|\n',v) for v in vals):return []
 return vals
for v in keys.values():v['items']=items(v['text'])

corrections=json.loads((ROOT/'data/anchor-corrections.json').read_text())
pages=[]
for book,end in [('sb',165),('wb',137)]:
 for idx in range(5,end+1):
  p=idx-1; file=f'{book}-{idx}.webp'; path=TMP/'ocr'/f'{file}.json'
  if not path.exists():continue
  ws=json.loads(path.read_text()); ws=[w for w in ws if w['h']<.07]
  unit=max(i for i,start in enumerate(starts[book]) if p>=start)
  bank=None
  if book=='sb' and p>=106:bank='Дополнительно'
  if book=='wb' and p>=108:bank='Дополнительно'
  if book=='wb' and p>=128:bank='Wordlist' if p<136 else 'Irregular verbs'
  if book=='sb' and 121<=p<=125:bank='Vocabulary Builder'
  if book=='sb' and 126<=p<=143:bank='Grammar Builder'
  title=' '.join(w['text'] for w in ws if .025<w['y']<.08 and .12<w['x']<.5)
  if not title or len(title)>100:title=bank or names[unit]
  anchors=[]
  commands=r'(?:SPEAKING|VOCABULARY|Read|Complete|Write|Circle|Match|Rewrite|Look|Work|Now|USE|KEY|Choose|Make|Study|Underline|INTERNET|Find|Answer|Compare|Put|DICTIONARY|Which|Replace|Use|Label|Tick|Describe|Add|What|Order|How|Think|Join|Correct|Combine|Quickly|Cover|Talk|Imagine|Brainstorm|Report|Where|Using|Divide|Try|Identify|Explain|Test|Express|Listen)'
  command=re.compile(r'^(\d{1,2})\s*(?:[\[(@•<LQ]*[1-4][.,]\d{2}[\])]?\s*)?'+commands+r'\b')
  for w in ws:
   x,y,t=w['x'],w['y'],re.sub(r'^[*•●]+\s*','',w['text'])
   if not .10<y<.95:continue
   m=command.match(t)
   if m and 1<=int(m[1])<=18 and (.045<x<.069 or .49<x<.520 or .32<x<.339 or .56<x<.59 or .61<x<.63 or re.match(r'^[*•●:]',w['text'])):
    anchors.append(dict(w,label=m[1]))
   # Vision occasionally joins aligned headings from two columns into one line.
   if w['w']>.55:
    second=re.search(r'\s(\d{1,2})\s+'+commands+r'\b',t[3:])
    if second:
     anchors.append(dict(w,x=.506,w=.45,label=second[1],text=t[3+second.start():].strip()))
  # Main-label margins distinguish exercise numbers from indented question numbers.
  for w in ws:
   if not (.048<w['x']<.067 or .503<w['x']<.520) or not .10<w['y']<.95:continue
   m=re.match(r'^(\d{1,2})(?:\s|(?=[1-4][.,]\d{2})|(?=[~]))',w['text'])
   if not m and re.fullmatch(r'[1-9]|1[0-8]',w['text']):m=re.match(r'^(\d+)',w['text'])
   if not m:continue
   tail=w['text'][len(m[1]):].strip()
   if 1<=int(m[1])<=18 and ((not tail and f'{book}-{p}-{m[1]}' in keys) or re.match(r'[A-Z0-9~\[(@•<]',tail)):
    if not any(a['label']==m[1] and abs(a['y']-w['y'])<.01 for a in anchors):anchors.append(dict(w,label=m[1]))
  # Isolated exercise labels: accept only a neighbouring instruction on the same line.
  for w in ws:
   if re.fullmatch(r'[1-9]|1[0-8]',w['text']) and .10<w['y']<.95 and (.045<w['x']<.069 or .49<w['x']<.520 or .32<w['x']<.339):
    neighbours=[q for q in ws if abs(q['y']-w['y'])<.008 and 0<q['x']-w['x']<.05 and re.match(commands+r'\b',q['text'])]
    if neighbours and not any(abs(a['y']-w['y'])<.008 and abs(a['x']-w['x'])<.1 for a in anchors):anchors.append(dict(w,label=w['text']))
  # Recover labels merged with an audio icon/track number, using verified key labels.
  for w in ws:
   if not .10<w['y']<.95:continue
   if not (.045<w['x']<.071 or .49<w['x']<.521 or .32<w['x']<.339 or .56<w['x']<.59):continue
   for n in range(1,19):
    if f'{book}-{p}-{n}' not in keys:continue
    tail=re.sub(r'^[*•●]+\s*','',w['text'])
    if re.match(r'^'+str(n)+r'(?:[~@•(M]|[1-4]\d{2}|\s+[^a-zA-Z]*[0-4][.,]\d{2})',tail):
     if not any(a['label']==str(n) for a in anchors):anchors.append(dict(w,label=str(n)))
  for n,(x,y) in corrections.get(f'{book}-{p}',{}).items():
   anchors=[a for a in anchors if a['label']!=n]
   anchors.append({'label':n,'x':x,'y':y,'w':.4,'h':.015,'text':''})
  anchors=sorted(anchors,key=lambda w:(w['x']>.49,w['y']))
  seen={}; exercises=[]
  for a in anchors:
   label=a['label']
   if label in seen and not bank:continue
   seen[label]=seen.get(label,0)+1
   occurrence=seen[label]
   side=a['x']>.49
   nexts=[b['y'] for b in anchors if (b['x']>.49)==side and b['y']>a['y']+.01]
   bottom=min(nexts,default=.95)
   x0=.50 if side else .045; x1=.96 if side else .49
   if .25<a['x']<.49 or a['x']>.55: x0=a['x']-.01; x1=.96
   elif a['w']>.55 and not any((b['x']>.49) and abs(b['y']-a['y'])<.01 for b in anchors): x1=.96
   region=[w for w in ws if x0<=w['x']<x1 and a['y']-.003<=w['y']<bottom-.003]
   text='\n'.join(w['text'] for w in sorted(region,key=lambda w:(round(w['y']/.006),w['x'])))
   key=keys.get(f'{book}-{p}-{label}',{}) if occurrence==1 else {}
   suffix='' if occurrence==1 else f'-b{occurrence}'
   display=label if occurrence==1 else f'{label} (блок {occurrence})'
   ex={'id':f'{book}-{p}-{label}{suffix}','label':display,'x':a['x'],'y':a['y'],'box':[x0,max(.0,a['y']-.008),x1-x0,bottom-a['y']+.004],'text':text,'key':key.get('text',''),'answers':key.get('items',[])}
   exercises.append(ex)
  # Reference pages remain browsable, without invented exercise numbers.
  if bank in ['Wordlist','Irregular verbs'] or (book=='sb' and p>=163):exercises=[]
  tracks=sorted(set(re.findall(r'(?<!\d)([1-4]\.\d{2})(?!\d)',' '.join(w['text'] for w in ws))))
  tracks=[t for t in tracks if (ROOT/'media'/f'{book}-{t}.mp3').exists()]
  pages.append({'id':f'{book}-{p}','book':book,'page':p,'image':f'assets/{file}','unit':unit if not bank else 'extra','title':title,'bank':bank,'exercises':sorted(exercises,key=lambda e:int(re.match(r'\d+',e['label'])[0])),'tracks':tracks})
by_id={p['id']:p for p in pages}
for key,value in keys.items():
 b,p,n=key.split('-');current=by_id.get(f'{b}-{p}');previous=by_id.get(f'{b}-{int(p)-1}')
 if current and not current['exercises'] and previous:
  ex=next((e for e in previous['exercises'] if e['label']==n and not e['key']),None)
  if ex:ex['key']=value['text'];ex['answers']=value['items']
# Cumulative review task starts on the facing page.
if 'sb-14' in by_id:
 ex=next((e for e in by_id['sb-14']['exercises'] if e['label']=='2'),None)
 if ex and 'sb-15-2' in keys: ex.update(key=keys['sb-15-2']['text'],answers=keys['sb-15-2']['items'])
if 'wb-118' in by_id:
 ex=next((e for e in by_id['wb-118']['exercises'] if e['label']=='4'),None)
 if ex and 'wb-119-4' in keys: ex.update(key=keys['wb-119-4']['text'],answers=keys['wb-119-4']['items'])
# Never automatically mark a task when OCR suggests more items than the extracted key.
# It remains interactive with a written answer and the source key for self-check.
for pg in pages:
 for ex in pg['exercises']:
  if not ex['answers']:continue
  ns=[int(m[1]) for m in re.finditer(r'(?m)^([1-9]|1[0-9]|20)(?:\s|$)',ex['text'].split('\n',1)[-1])]
  if ns and max(ns)>len(ex['answers']):ex['answers']=[]
data={'units':names,'pages':pages,'tracks':{b:[p.stem[len(b)+1:] for p in sorted((ROOT/'media').glob(f'{b}-*.mp3'))] for b in ['sb','wb']}}
(ROOT/'assets/course.js').write_text('window.SOLUTIONS = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
report={'pages':len(pages),'exercises':sum(len(p['exercises']) for p in pages),'automatic':sum(bool(e['answers']) for p in pages for e in p['exercises']),'withKeys':sum(bool(e['key']) for p in pages for e in p['exercises']),'missingOCR':302-len(list((TMP/'ocr').glob('*.json')))}
(ROOT/'audit.json').write_text(json.dumps(report,indent=2));print(report)
