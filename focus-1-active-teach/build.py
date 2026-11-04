"""Compile Focus 1 Second Edition from owner-provided scans and teacher keys.
No document text is executed. Original scans and content are preserved.
"""
from pathlib import Path
import re,json,collections,hashlib
from PIL import Image
R=Path(__file__).parent
CHOICES=json.loads((R/'data/choice-marks.json').read_text());TB=json.loads((R/'data/teacher-spans.json').read_text());WK=json.loads((R/'data/workbook-keys.json').read_text())
NAMES=['Intro Unit','Family and friends','Food','Work','People','Education','Health and sport','Travel','Nature']
def ocr(b,i):return json.loads((R/f'data/ocr/{b}-{i}.jpg.json').read_text())
def clean(t):return ' '.join(t.replace('\u00a0',' ').replace('ﬁ','fi').replace('ﬂ','fl').split())
def spec(fields):
 out=[]
 for n,v in sorted(fields.items(),key=lambda kv:tuple(int(x) if x.isdigit() else x for x in re.split(r'(\d+)',kv[0]))):
  v=clean(v)
  if not v or len(v)>450 or re.search(r'Exercise|Workbook answer|Students.? own|Possible|Example|answers vary',v,re.I):return []
  vals=[v]
  if '/' in v and all(len(x.split())<7 for x in v.split('/')):vals.extend(clean(x) for x in v.split('/'))
  # Parenthesized short auxiliaries are alternative forms in the supplied key.
  vals.append(re.sub(r'\s*\([^()]*\)','',v).strip())
  out.append({'label':n,'accepted':list(dict.fromkeys(x for x in vals if x))})
 return out
pages=[];source_manifest={};audit={'pages':{},'exercises':{},'automatic':{},'unmatchedKeys':[],'sourceWarnings':['Workbook PDF includes repeated pages 1, 4 and 5; navigation uses printed page numbers.']}
CMD=re.compile(r'^(?:[•★*]+\s*)?(\d{1,2})\s*(?:[★*•]+\s*)?(?:SPEAKING|SHOW|Read|Complete|Write|Circle|Match|Rewrite|Look|Work|Now|USE|Choose|Make|Study|Underline|Find|Answer|Put|Use|Label|Tick|Describe|Add|What|Order|How|Think|Join|Correct|Combine|Listen|Watch|Ask|Check|Compare|In pairs|Imagine|Translate|Change|Decide|Which|Cross|Look)\b')
for book,indices in [('sb',[(i,i) for i in range(1,143)]),('wb',[(0,1),(1,2),(2,21),(3,22),(4,23),(5,24)]+[(i+1,i) for i in range(5,19)]+[(i-5,i) for i in range(25,149)]),('ws',[(i-1,i) for i in range(1,21)])]:
 for p,i in indices:
  ws=ocr(book,i);unit=max(0,min(8,(p-12)//12+1));bank=None
  if book=='sb' and p>=108:unit='extra';bank='Video worksheets' if p<124 else 'Grammar Focus' if p<136 else 'Word list & reference'
  if book=='wb' and p>=108:unit='extra';bank='Vocabulary Bank' if p<128 else 'Grammar · Train and Try Again' if p<136 else 'Writing Bank' if p<140 else 'Answer keys'
  if book=='ws':unit=max(0,min(8,(p-2)//2));bank='Word Store'
  title=bank or (NAMES[unit] if isinstance(unit,int) else 'Reference')
  anchors=[];ss=[]
  if book=='sb' and str(p) in TB:
   ss=TB[str(p)]+CHOICES.get(str(p),[]); offset=59.528 if p%2==0 and p<124 else 0 if p<124 else 30 if p%2==0 else 0
   width=535.75 if p<124 else 555.25;height=757.7 if p<124 else 785
   for s in ss:
    t=s['text'].strip();x0,y0,x1,y1=s['bbox']
    if not re.fullmatch(r'\d{1,2}',t) or 'Heavy' not in s['font'] or not 8.8<s['size']<9.6 or y0>height-25:continue
    x,y=(x0-offset)/width,(y0+2.8)/height
    if not 0<x<.97 or not .025<y<.96:continue
    if any(a['label']==t and abs(a['y']-y)<.007 for a in anchors):continue
    # Align to OCR from the clean scan, never use the teacher image in the player.
    candidates=[w for w in ws if re.match(r'^'+t+r'(?:\s|$)',w['text']) and abs(w['x']-x)<.035 and abs(w['y']-y)<.035]
    if candidates:
     a=min(candidates,key=lambda w:abs(w['y']-y)+abs(w['x']-x));x,y=a['x'],a['y']
    anchors.append({'label':t,'x':x,'y':y,'tb':[x0,y0], 'tbScale':[offset,width,height]})
  elif book=='wb' and (4<=p<108 or 120<=p<136):
   # Exercise labels occupy the outer margin; question numbers are indented.
   for w in ws:
    t=w['text'];m=CMD.match(t); x,y=w['x'],w['y']
    near=(.035<x<.14 or .495<x<.60)
    if not m and re.fullmatch(r'[1-9]|1[0-6]',t) and near:
     neighbours=[q for q in ws if -.004<q['y']-y<.012 and .005<q['x']-x<.09 and re.match(r'(?:[★*]+\s*)?(?:Complete|Read|Write|Choose|Match|Put|Look|Use|Listen|In pairs|Label|Correct|Rewrite|Which|Answer)',q['text'])]
     if neighbours:m=re.match(r'(\d+)',t)
    if m and near and .025<y<.93 and 1<=int(m[1])<=16:
     if not any(a['label']==m[1] and abs(a['y']-y)<.012 for a in anchors):anchors.append({'label':m[1],'x':x,'y':y})
  if book=='wb' and anchors:
   filtered=[]
   for side in [False,True]:
    group=[a for a in anchors if (a['x']>.49)==side]
    if not group:continue
    margin=min(a['x'] for a in group)
    filtered.extend(a for a in group if a['x']<margin+.022)
   anchors=filtered
  anchors.sort(key=lambda a:(a['x']>.49,a['y']))
  if book=='wb' and p<108:
   ordered=[];last=0
   for a in anchors:
    if int(a['label'])>last:ordered.append(a);last=int(a['label'])
   anchors=ordered
  seen=collections.Counter();exercises=[]
  for a in anchors:
   n=a['label'];seen[n]+=1;exid=f'{book}-{p}-{n}'+(f'-b{seen[n]}' if seen[n]>1 else '')
   side=a['x']>.49
   nexts=[q['y'] for q in anchors if (q['x']>.49)==side and q['y']>a['y']+.01]
   bottom=min(nexts,default=.978)
   left=max(.025,a['x']-.012);right=.975 if side else .495
   if .25<a['x']<.49:right=.975
   box=[left,max(0,a['y']-.005),right-left,max(.018,bottom-a['y']-.004)]
   region=[w for w in ws if left-.005<=w['x']<right and a['y']-.006<=w['y']<bottom-.005]
   text='\n'.join(w['text'] for w in sorted(region,key=lambda w:(round(w['y']/.007),w['x'])))
   fields={};key='';reason='open';keysource=None
   if book=='sb' and 'tb' in a:
    x0,y0=a['tb'];off,scale,hs=a['tbScale'];
    lower=[q['tb'][1] for q in anchors if 'tb' in q and (q['x']>.49)==side and q['tb'][1]>y0+7]
    yend=min(lower,default=hs*.96);xb=off+left*scale;xe=off+right*scale
    regionS=[s for s in ss if xb-5<=s['bbox'][0]<xe+2 and y0-2<=s['bbox'][1]<yend-1]
    reds=[s for s in regionS if s['color']==0xda2128 and s['text'].strip()]
    numeric=[dict(s,text=re.match(r'^(\d{1,2}[a-z]?)(?:\s|$)',s['text'].strip())[1]) for s in regionS if re.match(r'^(\d{1,2}[a-z]?)(?:\s|$)',s['text'].strip()) and s['color']!=0xda2128 and (s['bbox'][1]>y0+8)]
    unresolved=[]
    for r in sorted(reds,key=lambda s:(round(s['bbox'][1]/4),s['bbox'][0])):
     rx,ry,rx1,ry1=r['bbox'];t=clean(r['text']);
     candidates=[q for q in numeric if q['bbox'][0]<rx+1 and -5<ry-q['bbox'][1]<(22 if r.get('marker') else 5)]
     q=min(candidates,key=lambda q:abs(ry-q['bbox'][1])*35+(rx-q['bbox'][0])) if candidates else None
     if q:
      label=q['text'].strip();fields.setdefault(label,[]).append(t)
     else:unresolved.append(t)
    fields={label:' '.join(values) for label,values in fields.items()}
    key='\n'.join(f'{label} {v}' for label,v in fields.items())
    if unresolved:key+=('\n' if key else '')+' · '.join(unresolved)
    if unresolved:fields={} # Never grade an incomplete extraction.
    keysource={'book':'teacher','pdfPage':p+20}
   elif book=='wb':
    section=''
    if p<12:section=f'0.{p-3}'
    elif p<108:
     rel=(p-12)%12;part=1 if rel<2 else rel if rel<4 else 4 if rel<6 else rel-1 if rel<10 else 9
     section=f'{unit}.{part}'
    elif 128<=p<=135:section=f'grammar-{p-127}'
    r=WK.get(section+'-'+n)
    if r:
     key=r['raw'];keysource={'book':'teacher','pdfPage':r['sourcePdfPage']}
     if not r['ambiguous'] and all(re.fullmatch(r'(?:Conversation \d+ · )?\d+|[a-j]',f) for f in r['fields']):fields=r['fields']
   answerSpec=spec(fields)
   personal=bool(re.search(r'true for you|your own|about yourself|your (?:family|life|partner)|Then (?:answer|write|tell)|Which.*true for you',text,re.I))
   mode='mixed' if answerSpec and personal else 'automatic' if answerSpec else 'open'
   fingerprint=hashlib.sha256(json.dumps(answerSpec,sort_keys=True).encode()).hexdigest()[:12]
   ex={'id':exid,'label':n if seen[n]==1 else n+f' (блок {seen[n]})','x':a['x'],'y':a['y'],'box':box,'text':text,'key':key,'keySource':keysource,'answerSpec':answerSpec,'answerVersion':fingerprint,'marking':{'mode':mode},'answers':[]}
   exercises.append(ex)
  image=f'assets/pages/{book}-{i}.jpg';size=list(Image.open(R/image).size)
  tracks=sorted(set(re.findall(r'(?<!\d)([1-3][.,]\d{2})(?!\d)',' '.join(w['text'] for w in ws)))) if book in ['sb','ws'] else []
  tracks=[t.replace(',','.') for t in tracks if (R/'media'/f'sb-{t.replace(",",".").split(".")[0]}.{int(t.replace(",",".").split(".")[1]):02}.mp3').exists()]
  tracks=list(dict.fromkeys(f'{t.split(".")[0]}.{int(t.split(".")[1]):02}' for t in tracks))
  pg={'id':f'{book}-{p}','book':book,'page':p,'pdfPage':i,'image':image,'unit':unit,'title':title,'bank':bank,'exercises':exercises,'tracks':tracks};pages.append(pg)
  for ex in exercises:
   sources=[{'image':image,'page':p,'size':size,'box':ex['box']}]
   if re.search(r'\b(?:text|article|blog|email|dialogue|photo|picture|questionnaire|advert|notice)\b',ex['text'],re.I):
    # Include the complete source page as supporting context; the numbered task stays first.
    sources.append({'image':image,'page':p,'size':size,'box':[.025,.02,.95,.94],'context':True})
   if book in ['sb','wb'] and 12<=p<108 and (p-12)%12==5:
    prev=next(z for z in pages if z['book']==book and z['page']==p-1)
    sources.append({'image':prev['image'],'page':p-1,'size':list(Image.open(R/prev['image']).size),'box':[.025,.02,.95,.94],'context':True})
   source_manifest[ex['id']]={'label':ex['label'],'sources':sources}
 for k in ['pages','exercises','automatic']:
  ps=[p for p in pages if p['book']==book];audit[k][book]=len(ps) if k=='pages' else sum(len(p['exercises']) if k=='exercises' else sum(bool(e['answerSpec']) for e in p['exercises']) for p in ps)
D={'units':NAMES,'pages':pages,'tracks':{'sb':[p.stem[3:] for p in sorted((R/'media').glob('sb-*.mp3'))],'wb':[],'ws':[]},'resources':json.loads((R/'data/resources.json').read_text()) if (R/'data/resources.json').exists() else []}
(R/'assets/course.js').write_text('window.FOCUS = '+json.dumps(D,ensure_ascii=False,separators=(',',':'))+';\n')
(R/'assets/exercise-sources.js').write_text('window.EXERCISE_SOURCES = '+json.dumps(source_manifest,ensure_ascii=False,separators=(',',':'))+';\n')
(R/'audit/build.json').write_text(json.dumps(audit,indent=2));print(json.dumps(audit,indent=2))

# Word Store is printed as an out-of-order booklet in the supplied PDF.
import runpy
runpy.run_path(str(R/"compile-wordstore.py"))
