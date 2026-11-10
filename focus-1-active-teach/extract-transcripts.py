"""Extract supplied, human-recording transcripts from the Teacher Book."""
from pathlib import Path
import fitz,re,json
R=Path(__file__).parent;D=fitz.open(R/'resources/teacher.pdf');out={};current=None
for i in range(179,188):
 rows=[]
 for b in D[i].get_text('dict')['blocks']:
  for l in b.get('lines',[]):
   if not 65<l['bbox'][1]<800:continue
   rows.append((l['bbox'][0]>295,l['bbox'][1],l['bbox'][0],''.join(s['text'] for s in l['spans']),max(s['size'] for s in l['spans'])))
 for side,y,x,t,size in sorted(rows,key=lambda r:(r[0],round(r[1]/3),r[2])):
  t=' '.join(t.replace('ﬁ','fi').replace('ﬂ','fl').split())
  m=re.match(r'([1-3])\.(\d{1,2})\s+Exercise',t)
  if m:current=f'{m[1]}.{int(m[2]):02}';out[current]={'source':'Teacher’s Book · p. '+str(i+1),'lines':[]};continue
  if size>11:current=None;continue
  if current and t:out[current]['lines'].append(t)
for v in out.values():v['text']=re.sub(r'\n(?![A-Z][A-Za-z =]{0,18}:)', ' ', '\n'.join(v.pop('lines')))
(R/'data/transcripts.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(len(out),'original audio transcripts')
