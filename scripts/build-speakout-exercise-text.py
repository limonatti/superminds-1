#!/usr/bin/env python3
"""Restore missing exercise text from the existing extracted word coordinates.
Usage: python3 scripts/build-speakout-exercise-text.py /path/to/extracted
Keeps original page images and crop geometry unchanged.
"""
import json,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
source=Path(sys.argv[1]);course=json.loads((root/'speakout-a1-active-teach/assets/course-web.js').read_text()[14:-1]);out={}
for book,data in course['books'].items():
 words=json.loads((source/(book+'-words.json')).read_text())
 for page in data['pages']:
  for ex in page['exercises']:
   if ex.get('text') or ex.get('x') is None:continue
   col=0 if ex['x']<40 else 1
   following=[e['y'] for e in page['exercises'] if e.get('x') is not None and (0 if e['x']<40 else 1)==col and e['y']>ex['y']+1]
   bottom=min(following,default=95)*842/100-3
   selected=[w for w in words.get(str(page['page']),[]) if ex['y']*842/100-6<=w['top']<bottom and (20 if col==0 else 290)<=w['x0']<(290 if col==0 else 580)]
   lines=[]
   for w in sorted(selected,key=lambda w:(w['top'],w['x0'])):
    if not lines or abs(w['top']-lines[-1][0]['top'])>4:lines.append([])
    lines[-1].append(w)
   text='\n'.join(' '.join(w['text'] for w in sorted(line,key=lambda w:w['x0'])) for line in lines).strip()
   if len(text)>12:out[f"{book}:{page['page']}:{ex['label']}"]=text
(root/'speakout-a1-active-teach/assets/exercise-text.js').write_text('window.SPEAKOUT_EXERCISE_TEXT='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
print('Restored descriptions:',len(out))
