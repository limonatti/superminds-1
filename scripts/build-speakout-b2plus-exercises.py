#!/usr/bin/env python3
"""Build exercise regions from local Apple Vision OCR of the supplied page scans.
Usage: python3 scripts/build-speakout-b2plus-exercises.py /path/to/ocr
OCR is the JSON output of speakout-b1plus-active-teach/ocr.swift.
Original images are never modified. Only unambiguous supplied SB keys are graded.
"""
import json,re,sys,collections
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];DEST=ROOT/'speakout-b2plus-active-teach/data'
def js(name,var):
 text=(DEST/name).read_text();return json.JSONDecoder().raw_decode(text.split('window.'+var+' = ',1)[1].lstrip())[0]
D=js('index.js','SPEAKOUT');KEYS=js('notes.js','SPEAKOUT_ITEMS')
OCR=Path(sys.argv[1]);OUT={};audit=[]
verbs=r'(?:Work|Look|Read|Listen|Watch|Complete|Choose|Match|Put|Write|Underline|Correct|Circle|Find|Discuss|Answer|Rewrite|Check|Make|Take|Which|How|What|Why|Are|Do|Think|Say|Cover|Change|Replace|Use|Add|You|In|Student|Ask|Compare|Practise|Practice|Turn|Go|Try|Tick|Cross|Repeat|Order|Number|Speak|Study|Decide|Plan|Prepare|Talk|Exchange|Notice|Focus|Refer|Now|Then|Before|After)\b'
number=re.compile(r'^(\d{1,2})\s*([A-F])?\s*[-–•]?\s*(?:[F★*]\s+)?('+verbs+r'.*)',re.I)
letter=re.compile(r'^([A-F])\s*[-–•]?\s*(?:[F★*]\s+)?('+verbs+r'.*)')
def clean(t):return re.sub(r'\s+',' ',t.replace('www.frenglish.ru','')).strip()
def context(book,n):
 printed=n-1+D['pages'][book+'Offset']
 if book=='sb':
  for unit,r in D['reviews'].items():
   if r['sb']<=printed<=r['sb']+1:return 'U'+str(unit)
 candidates=[l for l in D['lessons']if l[book+'Idx']+1<=n]
 return candidates[-1]['code']if candidates else ''
def fields(text,key):
 # A model response / explanation is shown separately, never graded as exact.
 parts=list(re.finditer(r'(?<!\S)([1-9]|1[0-9])\s+(?=\S)',key)) if key else []
 answers={}
 if parts and parts[0].start()==0:
  for i,m in enumerate(parts):
   value=clean(key[m.end():parts[i+1].start()if i+1<len(parts)else len(key)])
   if m[1]in answers:answers={};break
   answers[m[1]]=value
 nums=[int(m[1])for m in re.finditer(r'(?:^|\n)\s*([1-9]|1[0-9])\s+',text)]
 if re.search(r'complete.*text',text,re.I):nums += [int(m[1])for m in re.finditer(r'(?<!\d)([1-9]|1[0-6])(?=\s*(?:\.{2,}|\n|$))',text)]
 count=max([*map(int,answers),*nums],default=1)
 if count>16:count=1
 result=[]
 for n in range(1,count+1):
  a=answers.get(str(n),'');simple=bool(a and len(a)<95 and len(a.split())<13 and not re.search(r'\(|:|\b(?:possible|answers|example|sentence|accept|any|students|because|both)\b',a,re.I))
  choices=[]
  if a and re.fullmatch('[a-hA-H]',a) and re.search('choose|match',text,re.I):
   found=re.findall(r'(?:^|\s)([a-h])\s+[A-Za-z]',text)
   choices=sorted(set(found+[a.lower()]))
   if len(choices)<2:choices=[]
  result.append({'n':str(n),'answer':a if simple else '',**({'choices':choices}if choices else {})})
 return result
for book in ('sb','wb'):
 lastnum='1';lastctx=''
 for f in sorted((OCR/book).glob('*.jpg.json')):
  n=int(f.name[:3]);printed=n-1+D['pages'][book+'Offset']
  if (book=='wb'and not 2<=n<=65)or(book=='sb'and printed<6):continue
  rows=json.loads(f.read_text());ctx=context(book,n);bank=book=='sb'and printed>=104
  # Vision sometimes separates the bold exercise number from its instruction.
  for r in rows:
   if re.fullmatch(r'\d{1,2}\s*[A-F]?|[A-F]',clean(r['text'])):
    nextline=next((q for q in rows if q is not r and abs(q['y']-r['y'])<.006 and 0<q['x']-(r['x']+r['w'])<.045),None)
    if nextline:r['text']+=' '+nextline['text']
  if ctx!=lastctx:lastnum='1';lastctx=ctx
  candidates=[]
  for r in sorted(rows,key=lambda r:(r['x']>=.48,r['y'],r['x'])):
   t=clean(r['text'])
   # Audio icons/track numbers and pronunciation headings precede instructions.
   if re.match(r'^\d{1,2}\s*[A-F]?\b|^[A-F]\b',t):
    start=re.match(r'^(\d{1,2}\s*[A-F]?|[A-F])\b',t)
    rest=t[start.end():];command=re.search(verbs,rest)
    if command and command.start()<65:t=start[0]+' '+rest[command.start():]
   if not .035<r['y']<.945 or r['h']>.03 or not(r['x']<.105 or .48<r['x']<.615):continue
   m=number.match(t);l=letter.match(t)
   if m: label=m[1]+(m[2]or'').upper();instruction=m[3]
   elif l:label=lastnum+l[1];instruction=l[2]
   else:continue
   if r.get('confidence',1)<.6:continue
   col=int(r['x']>=.48)
   # Numeric subquestions are indented. Main numbers sit near the margin.
   if m and not m[2] and ((col==0 and r['x']>.082)or(col==1 and r['x']>.537)):continue
   if m:lastnum=m[1]
   if any(e['label']==label and abs(e['y']-r['y'])<.02 for e in candidates):continue
   candidates.append({'label':label,'x':r['x'],'y':r['y'],'h':r['h'],'col':col,'instruction':instruction})
  exercises=[]
  for i,e in enumerate(candidates):
   bottom=min([q['y']-.008 for q in candidates if q['col']==e['col']and q['y']>e['y']+.012],default=.955)
   x=max(.025,e['x']-.012);right=.495 if e['col']==0 else .965
   # Keep the exact scan in the exercise window; OCR text is only a field hint.
   selected=[r for r in rows if e['y']-.004<=r['y']<bottom and x-.005<=r['x']<right-.005]
   text='\n'.join(clean(r['text'])for r in sorted(selected,key=lambda r:(round(r['y']/0.007),r['x'])))
   ectx=ctx;section=None
   if bank:
    headers=[]
    for row in rows:
     m=re.match(r'^([1-8][A-D])\s+(.+)',clean(row['text']))
     if m and row['y']<.2 and not re.match(verbs,m[2]):headers.append((int(row['x']>=.48),m[1]))
    aligned=[h for h in headers if h[0]==e['col']]
    if len(aligned)==1:ectx=aligned[0][1]
    elif len(headers)==1:ectx=headers[0][1]
    else:ectx=''
    section='Grammar bank'if printed<134 else 'Vocabulary bank'
   pool=[k for k in KEYS.get(ectx,[])if k['label']==e['label']and ((section and k.get('section','').startswith(section))or(not bank and not re.search('bank',k.get('section',''),re.I)))]if book=='sb'else []
   key=pool[0]['text']if len(pool)==1 else ''
   fs=fields(text,key);spoken=bool(re.match(r'(Work in|Discuss|Talk|Ask|Compare|Think about|Plan|Prepare)',e['instruction'],re.I))
   closed=bool(re.search(r'complete|choose|match|correct|rewrite|replace|order|number|true.*false|underline|circle|tick|gaps|words|phrases|form',e['instruction'],re.I))
   if not closed or re.search('possible answers|sample answer',key,re.I):
    for q in fs:q['answer']=''
   if spoken and not key:fs=[{'n':'notes','answer':''}]
   media={};track=re.search(r'\b(\d{1,2}\.\d{2})\b',text)
   if track and re.search('listen|pronunciation',e['instruction'],re.I):
    audio=next((a for a in D['media']['classAudio'if book=='sb'else'wbAudio']if a['track']==track[1]),None)
    if audio:media['audio']=audio['path']
   lesson=next((l for l in D['lessons']if l['code']==ctx),None)
   if re.search('watch',e['instruction'],re.I)and lesson and lesson['video']:media['video']=lesson['video'][0]['path']
   exercises.append({'id':f'{book}-{n}-{e["label"]}-{i}','label':e['label'],'x':round(x,5),'y':round(e['y']-.005,5),'w':round(right-x,5),'h':round(bottom-e['y']+.005,5),'text':text,'key':key,'fields':fs,'lesson':ctx,'type':'book','spoken':spoken,**media})
  if exercises:OUT[f'{book}:{n}']=exercises
  audit.append({'book':book,'sheet':n,'printed':printed,'exercises':len(exercises),'checked_fields':sum(bool(q['answer'])for e in exercises for q in e['fields'])})
restored=json.loads((ROOT/'speakout-b2plus-active-teach/audit/page-restoration.json').read_text())
from b2plus_studentbook_review import apply_review
apply_review(OUT)
for row in audit:
 if row["book"]=="sb":row["checked_fields"]=sum(bool(f["answer"])for e in OUT.get("sb:"+str(row["sheet"]),[])for f in e["fields"])
versions={'sb:'+str(r['pdf_page']):r['sha256'][:10]for r in restored['pages']}
(DEST/'exercises.js').write_text('window.SPEAKOUT_EXERCISES='+json.dumps(OUT,ensure_ascii=False,separators=(',',':'))+';\nwindow.SPEAKOUT_PAGE_VERSIONS='+json.dumps(versions,separators=(',',':'))+';\n')
(ROOT/'speakout-b2plus-active-teach/audit/exercises.json').write_text(json.dumps(audit,indent=2))
print('Pages',len(OUT),'exercises',sum(map(len,OUT.values())),'checkable fields',sum(r['checked_fields']for r in audit))
