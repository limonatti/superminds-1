"""Read answer annotations from the supplied Teacher's Book; never invent options."""
from pathlib import Path
import json,re,fitz
R=Path(__file__).parent;doc=fitz.open(R/'resources/teacher.pdf');out={};margins={}
for p in range(4,137):
 pg=doc[p+19];chars=[]
 for b in pg.get_text('rawdict')['blocks']:
  for line in b.get('lines',[]):
   linechars=[dict(c,color=s['color'],size=s['size']) for s in line['spans'] for c in s['chars']];lineText=''.join(c['c'] for c in linechars)
   for idx,c in enumerate(linechars):c.update(lineText=lineText,charIndex=idx);chars.append(c)
 marks=[]
 for drawing in pg.get_drawings():
  col=drawing['fill'];r=drawing['rect'];off=59.528 if p%2==0 and p<124 else 0 if p<124 else 30 if p%2==0 else 0;limit=757.7 if p<124 else 785
  if not col or not(col[0]>.8 and col[1]<.2 and col[2]<.25) or len(drawing['items'])<12 or not(3<r.width<240 and 5<r.height<36 and off<r.x0<off+525 and 15<r.y0<limit):continue
  cs=[c for c in chars if c['color']!=0xda2128 and r.x0+.4<(c['bbox'][0]+c['bbox'][2])/2<r.x1-.4 and r.y0+.8<(c['bbox'][1]+c['bbox'][3])/2<r.y1-.8]
  value=''.join(c['c'] for c in cs).strip()
  if not value or any(a['text']==value and abs(a['bbox'][0]-r.x0)<1 and abs(a['bbox'][1]-r.y0)<1 for a in marks):continue
  line=cs[0]['lineText'];start=min(c['charIndex'] for c in cs);end=max(c['charIndex'] for c in cs)+1;options=[]
  for match in re.finditer(r"([\w’'−-]+)\s*/\s*([\w’'−-]+)(?:\s*/\s*([\w’'−-]+))?",line):
   if match.start()<=start and match.end()>=end-1 and value.lower() in [x.lower() for x in match.groups() if x]:options=[x for x in match.groups() if x];break
  marks.append({'text':value,'bbox':list(r),'color':0xda2128,'font':'','size':0,'marker':True,'lineText':line,'options':options})
 out[str(p)]=marks
 spans=[s for b in pg.get_text('dict')['blocks'] for line in b.get('lines',[]) for s in line['spans']]
 sidebar=[s for s in spans if s['bbox'][1]<limit and 6.9<s['size']<10 and (s['bbox'][0]<55 if p%2==0 else s['bbox'][0]>515)]
 sections={};current=None
 for s in sorted(sidebar,key=lambda s:(round(s['bbox'][1]/4),s['bbox'][0])):
  t=s['text'].strip();m=re.fullmatch(r'Exercise (\d+)',t)
  if m:current=m[1];sections[current]=[]
  elif current:sections[current].append(t)
 if sections:margins[str(p)]={n:'\n'.join(ss) for n,ss in sections.items()}
(R/'data/choice-marks.json').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':')))
(R/'data/sb-margin-keys.json').write_text(json.dumps(margins,ensure_ascii=False,indent=2))
print('Selected answer annotations:',sum(map(len,out.values())),'Pages with margin keys:',len(margins))
