"""Extract visible answer evidence from the owner-supplied Teacher's Book.
Red circles and bounded marginal answer panels are data, not instructions.
"""
from pathlib import Path
import sys,json,re
import pymupdf as fitz
R=Path(__file__).resolve().parent
doc=fitz.open(next(Path(sys.argv[1]).rglob('focus_second_edition_4_teachers_book.pdf')))
def red(c):return c and .83<c[0]<.87 and .1<c[1]<.15 and .14<c[2]<.18
result={}
for number,page in enumerate(doc,1):
 if not (26<=number<=193 or 341<=number<=356):continue
 w,h=page.rect.width,page.rect.height
 shapes=[d for d in page.get_drawings() if red(d.get('fill')) or red(d.get('color'))]
 chars=[c for b in page.get_text('rawdict')['blocks']if 'lines'in b for l in b['lines']for s in l['spans']for c in s['chars']]
 spans=[s for b in page.get_text('dict')['blocks']if 'lines'in b for l in b['lines']for s in l['spans']]
 circles=[];margins={}
 for d in shapes:
  r=d['rect']
  if r.x0<0 or r.x1>w or r.y0<0 or r.y1>h:continue
  if 7<r.height<28 and 6<r.width<330 and sum(i[0]=='c' for i in d['items'])>=6:
   selected=[c for c in chars if r.x0<(c['bbox'][0]+c['bbox'][2])/2<r.x1 and r.y0<(c['bbox'][1]+c['bbox'][3])/2<r.y1]
   text=''.join(c['c']for c in sorted(selected,key=lambda c:c['bbox'][0])).strip()
   if text:circles.append({'text':text,'box':[r.x0/w,r.y0/h,r.width/w,r.height/h]})
  if 90<r.width<120 and r.height>30 and (r.x0/w<.1 or r.x0/w>.84):
   selected=[s for s in spans if r.contains(fitz.Rect(s['bbox']))]
   rows=[]
   for s in sorted(selected,key=lambda s:(round(s['bbox'][1]/2),s['bbox'][0])):
    if rows and abs(rows[-1][0]-s['bbox'][1])<3:rows[-1][1].append(s)
    else:rows.append([s['bbox'][1],[s]])
   lines=[''.join(s['text']for s in sorted(row,key=lambda s:s['bbox'][0])).strip()for _,row in rows]
   if lines and (m:=re.fullmatch(r'Exercise (\d+)',lines[0])):margins[m[1]]='\n'.join(lines[1:])
 result[str(number)]={'circles':circles,'margins':margins}
(R/'data/teacher-evidence.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':')))
print('Teacher evidence:',sum(len(v['circles'])for v in result.values()),'circles,',sum(len(v['margins'])for v in result.values()),'margin answers')
