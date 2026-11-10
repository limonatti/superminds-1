"""Compile Focus 1 Second Edition from owner-provided scans and teacher keys.
No document text is executed. Original scans and content are preserved.
"""
from pathlib import Path
import re,json,collections,hashlib
from PIL import Image
from source_parser import map_slots,margin_fields,instruction_from_spans
R=Path(__file__).parent
CHOICES=json.loads((R/'data/choice-marks.json').read_text());TB=json.loads((R/'data/teacher-spans.json').read_text());WK=json.loads((R/'data/workbook-keys.json').read_text())
WB_ANCHORS=json.loads((R/'data/wb-anchors.json').read_text());WB_COLUMNS=json.loads((R/'data/wb-columns.json').read_text())
MARGINS=json.loads((R/'data/sb-margin-keys.json').read_text())
IDENTITIES=json.loads((R/'data/exercise-identities.json').read_text())
NAMES=['Intro Unit','Family and friends','Food','Work','People','Education','Health and sport','Travel','Nature']
def ocr(b,i):return json.loads((R/f'data/ocr/{b}-{i}.jpg.json').read_text())
def clean(t):return ' '.join(t.replace('\u00a0',' ').replace('ﬁ','fi').replace('ﬂ','fl').split())
def spec(fields):
 out=[]
 for n,v in sorted(fields.items(),key=lambda kv:tuple(int(x) if x.isdigit() else x for x in re.split(r'(\d+)',kv[0]))):
  v=clean(v)
  if not v or len(v)>450 or re.search(r'Exercise|Workbook answer|Students.? own|Possible|Example|answers vary',v,re.I):return []
  vals=[v]
  if '/' in v and all(len(x.split())==1 for x in v.split('/')):vals.extend(clean(x) for x in v.split('/'))
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
    combined=CMD.match(t)
    near=' '.join(q['text'] for q in ss if 'Heavy' in q['font'] and x1-1<=q['bbox'][0]<x1+65 and abs(q['bbox'][1]-y0)<3)
    small=8.2<s['size']<8.8 and s['color']==0x231f20 and (combined or CMD.match(t+' '+near))
    if 'Heavy' not in s['font'] or not (re.fullmatch(r'\d{1,2}',t) and 8.8<s['size']<9.6 or small) or y0>height-25:continue
    if combined:t=combined[1]
    x,y=(x0-offset)/width,(y0+2.8)/height
    if not 0<x<.97 or not .025<y<.96:continue
    if any(a['label']==t and abs(a['y']-y)<.007 and abs(a['x']-x)<.05 for a in anchors):continue
    # Align to OCR from the clean scan, never use the teacher image in the player.
    candidates=[w for w in ws if re.match(r'^'+t+r'(?:\s|$)',w['text']) and abs(w['x']-x)<.014 and abs(w['y']-y)<.009]
    if candidates:
     a=min(candidates,key=lambda w:abs(w['y']-y)+abs(w['x']-x));x,y=a['x'],a['y']
    anchors.append({'label':t,'x':x,'y':y,'tb':[x0,y0], 'tbScale':[offset,width,height]})
  elif book=='wb':
   anchors=[dict(a) for a in WB_ANCHORS.get(str(p),[])]
   ws=WB_COLUMNS.get(str(p),ws)
  columns=[]
  for a in sorted(anchors,key=lambda a:a['x']):
   if not columns or a['x']-columns[-1]>.1:columns.append(a['x'])
   a['column']=len(columns)-1
  anchors.sort(key=lambda a:(a['column'],a['y']))
  seen=collections.Counter();exercises=[]
  for a in anchors:
   n=a['label'];seen[n]+=1;exid=f'{book}-{p}-{n}'+(f'-b{seen[n]}' if seen[n]>1 else '')
   if book=='sb':
    published=IDENTITIES.get(f'sb-{p}',[])
    matches=[q for q in published if q['label'].split()[0]==n and abs(q['x']-a['x'])<.03 and abs(q['y']-a['y'])<.02]
    if matches:exid=min(matches,key=lambda q:abs(q['x']-a['x'])+abs(q['y']-a['y']))['id']
    else:
     reserved={q['id'] for q in published}|{q['id'] for q in exercises};suffix=1
     while exid in reserved:
      suffix+=1;exid=f'sb-{p}-{n}-b{suffix}'
   # Printed layouts include 60/40 and 2/3 + 1/3 columns, not only halves.
   same=[q for q in anchors if abs(q['x']-a['x'])<.10]
   nexts=[q['y'] for q in same if q['y']>a['y']+.01]
   bottom=min(nexts,default=1.0)
   following=[q['x'] for q in anchors if q['x']>a['x']+.15]
   right=min(following)-.024 if following else 1.0
   left=max(0,min(q['x'] for q in same)-.03)
   if left<.12:left=0
   top=max(0,a['y']-.008);end=min(1,bottom-.002 if nexts else 1)
   region=[w for w in ws if left-.002<=w['x']<right-.003 and top<=w['y']<end-.002]
   # Include complete OCR lines and descenders, with visible whitespace.
   if region:
    right=min(1,max(right,max(w['x']+w['w']+.008 for w in region)))
    end=min(1,max(end,max(w['y']+w['h']+.006 for w in region)))
   if book=='wb':
    original=ocr(book,i)
    crossing=[w for w in original if left<=w['x']<right and top<=w['y']<end and w['x']+w['w']>right+.05]
    # Only expand for connected text; complete split lines are needed in several full-width tasks.
    if crossing and (int(n)>=4 or p in [21,33,45,57,69,81,93,105]):
     right=min(1,max(right,max(w['x']+w['w']+.012 for w in crossing)))
   box=[left,top,right-left,max(.018,end-top)]
   text='\n'.join(w['text'] for w in sorted(region,key=lambda w:(round(w['y']/.007),w['x'])))
   fields={};slots=[];regionS=[];key='';reason='open';keysource=None;instruction=a.get('instruction',text.split('\n')[0])
   if book=='sb' and 'tb' in a:
    x0,y0=a['tb'];off,scale,hs=a['tbScale'];
    lower=[q['tb'][1] for q in anchors if 'tb' in q and abs(q['x']-a['x'])<.1 and q['tb'][1]>y0+7]
    yend=min(lower,default=hs*.985);xb=off+left*scale;xe=off+right*scale
    regionS=[s for s in ss if xb-5<=s['bbox'][0]<xe+2 and y0-2<=s['bbox'][1]<yend-1]
    fields,slots,unresolved=map_slots(regionS,y0)
    instruction=instruction_from_spans(regionS,y0)
    key='\n'.join(f'{label} {v}' for label,v in fields.items())
    if unresolved:key+=('\n' if key else '')+' · '.join(r['text'] for r in unresolved)
    margin=MARGINS.get(str(p),{}).get(n,'')
    if margin:
     key+=('\n' if key else '')+margin
     mf=margin_fields(margin)
     if mf and not fields:fields=mf
    if unresolved:fields={}
    keysource={'book':'teacher','pdfPage':p+20}
   elif book=='wb':
    section=''
    if p<12:section=f'0.{p-3}'
    elif p<108:
     rel=(p-12)%12;part=1 if rel<2 else rel if rel<4 else 4 if rel<6 else rel-1 if rel<10 else 9
     section=f'{unit}.{part}'
    elif 128<=p<=135:section=f'grammar-{p-127}'
    elif 120<=p<=127:
     topics={120:['people','home'],121:['school','school'],122:['work','family-and-social'],123:['food','shopping-and'],124:['travelling-and','culture'],125:['sport','health'],126:['science-and','the-natural-world'],127:['state-and-society','english-speaking']}
     section='vb-'+topics[p][int(a['x']>.49)]
    r=WK.get(section+'-'+n)
    if r:
     key=r['raw'];keysource={'book':'teacher','pdfPage':r['sourcePdfPage']}
     if not r['ambiguous'] and all(re.fullmatch(r'(?:Conversation \d+ · )?\d+[a-z]?|[a-j]',f) for f in r['fields']):fields=r['fields']
   answerSpec=spec(fields)
   personal=bool(re.search(r'true for you|your own|about yourself|your (?:family|life|partner)|Then (?:answer|write|tell)|Which.*true for you',text,re.I))
   mode='mixed' if answerSpec and personal else 'automatic' if answerSpec else 'open'
   fingerprint=hashlib.sha256(json.dumps(answerSpec,sort_keys=True).encode()).hexdigest()[:12]
   ex={'id':exid,'label':n if seen[n]==1 else n+f' (блок {seen[n]})','x':a['x'],'y':a['y'],'box':box,'text':text,'instructionText':instruction,'sourceSlots':slots,'_spans':regionS,'key':key,'keySource':keysource,'answerSpec':answerSpec,'answerVersion':fingerprint,'marking':{'mode':mode},'answers':[]}
   exercises.append(ex)
  image=f'assets/pages/{book}-{i}.jpg';size=list(Image.open(R/image).size)
  tracks=sorted(set(re.findall(r'(?<!\d)([1-3][.,]\d{2})(?!\d)',' '.join(w['text'] for w in ws)))) if book in ['sb','ws'] else []
  tracks=[t.replace(',','.') for t in tracks if (R/'media'/f'sb-{t.replace(",",".").split(".")[0]}.{int(t.replace(",",".").split(".")[1]):02}.mp3').exists()]
  tracks=list(dict.fromkeys(f'{t.split(".")[0]}.{int(t.split(".")[1]):02}' for t in tracks))
  pg={'id':f'{book}-{p}','book':book,'page':p,'pdfPage':i,'image':image,'unit':unit,'title':title,'bank':bank,'exercises':exercises,'tracks':tracks};pages.append(pg)
  for ex in exercises:
   sources=[{'image':image,'page':p,'size':size,'box':ex['box']}]
   if re.search(r'\b(?:texts?|articles?|blogs?|emails?|dialogues?|photos?|pictures?|questionnaires?|adverts?|notices?|website|table|Exercise\s+\d+)\b',ex['text'],re.I):
    # Include the complete source page as supporting context; the numbered task stays first.
    sources.append({'image':image,'page':p,'size':size,'box':[0,0,1,1],'context':True})
   if book in ['sb','wb'] and 12<=p<108 and (p-12)%12==5:
    prev=next(z for z in pages if z['book']==book and z['page']==p-1)
    sources.append({'image':prev['image'],'page':p-1,'size':list(Image.open(R/prev['image']).size),'box':[0,0,1,1],'context':True})
   if book=='wb' and ex['x']<.49:
    right_anchors=[a for a in anchors if a['x']>.49]
    left_anchors=[a for a in anchors if a['x']<.49]
    if right_anchors and left_anchors and ex['y']==max(a['y'] for a in left_anchors) and min(a['y'] for a in right_anchors)>.16:
     sources.insert(1,{'image':image,'page':p,'size':size,'box':[.49,0,.51,min(a['y'] for a in right_anchors)-.004],'continuation':True})
   source_manifest[ex['id']]={'label':ex['label'],'sources':sources}
 for k in ['pages','exercises','automatic']:
  ps=[p for p in pages if p['book']==book];audit[k][book]=len(ps) if k=='pages' else sum(len(p['exercises']) if k=='exercises' else sum(bool(e['answerSpec']) for e in p['exercises']) for p in ps)
# Reading spreads and continued numbered tasks must carry their original context.
for pg in pages:
 if pg['book'] not in ['sb','wb']:continue
 ps=pg['page'];adj=[]
 if 12<=ps<108 and (ps-12)%12 in [0,1,4,5]:adj.append(ps+1 if (ps-12)%12 in [0,4] else ps-1)
 if pg['exercises'] and min(int(e['label'].split()[0]) for e in pg['exercises'])>1:adj.append(ps-1)
 for n in set(adj):
  other=next((x for x in pages if x['book']==pg['book'] and x['page']==n and x['unit']==pg['unit']),None)
  if not other:continue
  for ex in pg['exercises']:
   sources=source_manifest[ex['id']]['sources']
   if not any(z['image']==other['image'] for z in sources):sources.append({'image':other['image'],'page':n,'size':list(Image.open(R/other['image']).size),'box':[0,0,1,1],'context':True})
D={'units':NAMES,'pages':pages,'tracks':{'sb':[p.stem[3:] for p in sorted((R/'media').glob('sb-*.mp3'))],'wb':[],'ws':[]},'resources':json.loads((R/'data/resources.json').read_text()) if (R/'data/resources.json').exists() else []}
(R/'assets/course.js').write_text('window.FOCUS = '+json.dumps(D,ensure_ascii=False,separators=(',',':'))+';\n')
(R/'assets/exercise-sources.js').write_text('window.EXERCISE_SOURCES = '+json.dumps(source_manifest,ensure_ascii=False,separators=(',',':'))+';\n')
(R/'audit/build.json').write_text(json.dumps(audit,indent=2));print(json.dumps(audit,indent=2))

# Word Store is printed as an out-of-order booklet in the supplied PDF.
import runpy
runpy.run_path(str(R/"compile-wordstore.py"))

runpy.run_path(str(R/"compile-activities.py"))

runpy.run_path(str(R/"audit-sources.py"))
