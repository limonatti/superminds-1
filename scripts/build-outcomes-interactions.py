#!/usr/bin/env python3
"""Build source crops and conservative interaction hints from supplied page OCR.
Usage: python3 scripts/build-outcomes-interactions.py /path/to/outcomes-ocr.json /path/to/outcomes-wb-ocr.json
Keys are never used to invent distractors. Uncertain OCR stays a text response.
"""
import json,re,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1];bank=json.loads((root/'scripts/outcomes-audit/reviewed-tasks.json').read_text());ocr={b:json.loads(Path(p).read_text()) for b,p in zip(['sb','wb'],sys.argv[1:])};out={}
for page,es in bank.items():
 book,pid=page.split(':');rows=ocr[book].get(f'{book}-{pid}.webp',[])
 for e in es:
  right=min([t['x']-.025 for t in es if t['x']>e['x']+.17]+[.96]);left=max(.015,e['x']-.022)
  bottom=min([t['y']-.005 for t in es if abs(t['x']-e['x'])<.15 and t['y']>e['y']+.014]+[.94]);top=max(0,e['y']-.008)
  chosen=[r for r in rows if left-.01<=r['x']<right-.008 and top<=r['y']<bottom]
  lines=[]
  for r in sorted(chosen,key=lambda r:(r['y'],r['x'])):
   if not lines or abs(r['y']-lines[-1][0]['y'])>.006:lines.append([])
   lines[-1].append(r)
  text='\n'.join(' '.join(r['text'] for r in sorted(line,key=lambda r:r['x'])) for line in lines)
  if book=='wb' and e['page']==4 and e['n']==5:text=text.replace('B: 1/ He','B: I / He')
  out[e['id']]={'box':[round(left,4),round(top,4),round(right-left,4),round(max(.035,bottom-top),4)],'text':text}
  if book=='wb' and e['page']==4 and e['n']==6:out[e['id']]['wordBank']=['are they','I','know','’s he','’s she','Who']
(root/'outcomes-beginner-active-teach/assets/interactions-data.js').write_text('window.OUTCOMES_INTERACTIONS='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
print('Source regions:',len(out))
