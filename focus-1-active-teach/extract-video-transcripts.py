"""Read the supplied Teacher's Book scripts; this does not create audio/video."""
from pathlib import Path
import fitz,re,json
R=Path(__file__).parent;doc=fitz.open(R/'resources/teacher.pdf');out={};current=None
for i in range(188,194):
 rows=[]
 for b in doc[i].get_text('dict')['blocks']:
  for l in b.get('lines',[]):
   if not 65<l['bbox'][1]<800:continue
   rows.append((l['bbox'][0]>295,l['bbox'][1],l['bbox'][0],''.join(s['text'] for s in l['spans'])))
 for side,y,x,t in sorted(rows,key=lambda r:(r[0],round(r[1]/3),r[2])):
  t=' '.join(t.replace('ﬁ','fi').replace('ﬂ','fl').split())
  if re.match(r'Unit \d',t):current=None;continue
  m=re.match(r'(\d+)\s+(BBC:.*|Focus Vlog), page (1\d\d)',t)
  if m:current=m[3];out[current]={'video':int(m[1]),'title':m[2],'source':f'Teacher’s Book · PDF p. {i+1}','lines':[]};continue
  if current and t:out[current]['lines'].append(t)
for v in out.values():v['text']=re.sub(r'\n(?![A-Z][A-Za-z =]{0,22}:)', ' ', '\n'.join(v.pop('lines')))
assert len(out)==16
(R/'data/video-transcripts.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(len(out),'original video scripts')
