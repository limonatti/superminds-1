"""Build page hotspots from local OCR; source images remain the exercise text."""
import json,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
d=json.loads((root/'outcomes-beginner-active-teach/assets/course.js').read_text()[16:-1])
verb=re.compile(r'\b(Listen|Look|Work|Read|Write|Complete|Match|Choose|Circle|Tick|Put|Find|Answer|Ask|Practise|Practice|Say|Check|Discuss|Underline|Correct|Number|Make|Tell|Change|Repeat|Use|Take|Add|Cross|Think|Order|Draw|Cover|Compare|Talk|Watch|Decide|Replace|Prepare|Do)\b')
result={}
for book,file in [('sb','outcomes-ocr.json'),('wb','outcomes-wb-ocr.json')]:
 ocr=json.loads((root/'tmp'/file).read_text())
 for p in d['books'][book]['pages']:
  if not ((p['unit']) and p.get('page')):continue
  rows=ocr.get(Path(p['image']).name,[]);anchors=[]
  for r in rows:
   text=r['text'];m=verb.search(text)
   if not m or r['y']>.94:continue
   before=text[:m.start()];number=re.match(r'^[•©®°%C\s]*(\d{1,2})(?![.\d])\b',before)
   x=r['x'];n=int(number[1]) if number else None
   # Exercise numbers can be a separate OCR box, before a track number.
   left=[a for a in rows if 0 < x-a['x'] < .095 and abs(a['y']-r['y'])<.009 and re.fullmatch(r'\d{1,2}[ C©®]*',a['text'])]
   if left:
    a=min(left,key=lambda a:a['x']);n=int(re.match(r'\d+',a['text'])[0]);x=a['x']
   if not n:
    # Some printed numerals are missing in OCR. Keep the task clickable
    # without inventing its printed number.
    start=text[:m.start()].strip()
    if re.fullmatch(r'[•©®°%C\s]*(?:\d+(?:\.\d+)?\s*)?',start) and ((.08<x<.11) or (.535<x<.56)):
     n='+';x-=.025
    else:continue
   if isinstance(n,int) and n>25:continue
   # Inner numbered answers are indented beyond the task margins.
   if not (x<.085 or .445<x<.54):continue
   if any(abs(a['y']-r['y'])<.012 and abs(a['x']-x)<.12 for a in anchors):continue
   anchors.append({'n':n,'x':round(x,4),'y':round(r['y'],4),'instruction':text[m.start():]})
  anchors=[a for a in anchors if a['n']!='+' or (len(a['instruction'].split())>=4 and not any(b is not a and abs(b['x']-a['x'])<.12 and 0<a['y']-b['y']<.036 for b in anchors))]
  anchors.sort(key=lambda a:(a['x']>.4,a['y']))
  for i,a in enumerate(anchors):
   if a['n']=='+':
    prev=anchors[i-1]['n'] if i else 0
    nxt=anchors[i+1]['n'] if i+1<len(anchors) else None
    if isinstance(prev,int) and nxt==prev+2:a['n']=prev+1
   
   nexts=[b['y'] for b in anchors if abs(b['x']-a['x'])<.14 and b['y']>a['y']+.01]
   end=min(nexts) if nexts else .94
   children=[r for r in rows if a['y']+.008<r['y']<end-.008 and a['x']<r['x']<min(1,a['x']+.43)]
   nums=[]
   for r in children:
    m=re.match(r'^(\d{1,2})\s+',r['text'])
    if m and int(m[1])<=30:nums.append(int(m[1]))
   a['count']=min(20,max(nums)) if len(set(nums))>=2 and 1 in nums else 1
   a['id']=f'{book}-{p["id"]}-{round(a["x"]*1000)}-{round(a["y"]*1000)}'
   a['height']=round(max(.04,end-a['y']),4)
   letters=sorted(set(m[1].lower() for r in children if (m:=re.match(r'^([a-pA-P])(?:[.)]|\s)\s*\w',r['text']))))
   if re.search(r'\bMatch\b',a['instruction']) and len(letters)>=2:a['options']=letters
   elif re.search(r'number .*order|correct order',a['instruction'],re.I):a['options']=[str(k) for k in range(1,max(a['count'],len([r for r in children if len(r['text'])>8]))+1)]
   a['kind']='writing' if re.search(r'Write.*(paragraph|email|message|sentences|text|story)',a['instruction'],re.I) else 'answers'
  if anchors:result[f'{book}:{p["id"]}']=anchors
(root/'outcomes-beginner-active-teach/assets/exercises.js').write_text('window.OUTCOMES_EXERCISES='+json.dumps(result,ensure_ascii=False,separators=(',',':'))+';')
print('Pages',len(result),'tasks',sum(map(len,result.values())))
for book in ['sb','wb']:
 print(book,[(n,sum(len(result.get(f'{book}:{p["id"]}',[])) for p in d['books'][book]['pages'] if p['unit']==n)) for n in range(1,13)])
