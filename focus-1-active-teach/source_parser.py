"""Geometry-based interpretation of the supplied teacher annotations."""
import re,collections
RED=0xda2128
def clean(t):return ' '.join(t.replace('ﬁ','fi').replace('ﬂ','fl').split())
def map_slots(spans,top):
 reds=[s for s in spans if s['color']==RED and s['text'].strip()]
 nums=[]
 for s in spans:
  m=re.match(r'^(\d{1,2}[a-z]?)(?:\s|$)',s['text'].strip())
  if m and s['color']!=RED and s['bbox'][1]>top+8 and int(re.match(r'\d+',m[1])[0])<=30:nums.append(dict(s,text=m[1]))
 stems=collections.Counter(round(n['bbox'][0]/10)*10 for n in nums)
 groups={};unresolved=[]
 for r in sorted(reds,key=lambda s:(round(s['bbox'][1]/4),s['bbox'][0])):
  x,y=r['bbox'][:2];cs=[n for n in nums if n['bbox'][0]<x+3 and -9<y-n['bbox'][1]<130]
  row=[n for n in cs if abs(y-n['bbox'][1])<9]
  if row:q=min(row,key=lambda n:abs(y-n['bbox'][1])*5+(x-n['bbox'][0])*.12)
  elif cs:
   cols=[x0 for x0,count in stems.items() if count>=2 and x0<=x+3]
   near=[n for n in cs if not cols or n['bbox'][0]>=max(cols)-6]
   q=min(near or cs,key=lambda n:abs(y-n['bbox'][1])*30+x-n['bbox'][0])
  else:q=None
  if q:
   group=groups.setdefault(q['text'],[])
   # One typed answer can be split into consecutive PDF text runs.
   if group and not r.get('marker') and not group[-1].get('marker') and abs(r['bbox'][1]-group[-1]['bbox'][1])<3 and -1<r['bbox'][0]-group[-1]['bbox'][2]<3:
    group[-1]['text']+=' '+clean(r['text']);group[-1]['bbox'][2]=r['bbox'][2]
   else:group.append(dict(r,text=clean(r['text']),bbox=list(r['bbox']),numberBox=q['bbox']))
  else:unresolved.append(dict(r,text=clean(r['text'])))
 fields={};slots=[]
 for n,rs in groups.items():
  for i,r in enumerate(rs):
   label=n+(chr(97+i) if len(rs)>1 else '');fields[label]=r['text'];slots.append(dict(r,label=label,item=n,part=i+1,parts=len(rs)))
 return fields,slots,unresolved

def margin_fields(raw):
 if re.search(r'possible|suggested|own answers|answers vary|sample|for example',raw,re.I):return {}
 out={};current=None
 for line in raw.splitlines():
  line=line.strip();m=re.fullmatch(r'(\d{1,2}[a-z]?)(?:[. )]+(.*))?',line)
  if m:current=m[1];out[current]=m[2] or ''
  elif current:out[current]+=' '+line
 return {n:clean(t) for n,t in out.items() if t.strip()}

def instruction_from_spans(spans,top):
 rows={}
 for s in spans:
  if 'Heavy' not in s.get('font','') or not 8<s.get('size',0)<10 or s['bbox'][1]<top-2 or s['bbox'][1]>top+90 or re.fullmatch(r'[\s\d.]+',s['text']):continue
  rows.setdefault(round(s['bbox'][1]/3)*3,[]).append(s)
 chosen=[];last=None
 for y,ss in sorted(rows.items()):
  if last is None and y-top>6:break
  if last is not None and y-last>15:break
  chosen+=sorted(ss,key=lambda s:s['bbox'][0]);last=y
 return clean(' '.join(s['text'] for s in chosen))


def word_completions(spans):
 """Reassemble letter grids using only adjacent printed and teacher letters."""
 reds=[s for s in spans if s['color']==RED and not s.get('marker') and len(s['text'].strip())==1 and s['text'].strip().isalpha()]
 if len(reds)<3:return spans
 rows={}
 for r in reds:rows.setdefault(round(r['bbox'][1]/4)*4,[]).append(r)
 used=set();new=[]
 for row in rows.values():
  clusters=[]
  for r in sorted(row,key=lambda r:r['bbox'][0]):
   if not clusters or r['bbox'][0]-clusters[-1][-1]['bbox'][2]>28:clusters.append([])
   clusters[-1].append(r)
  for rs in clusters:
   if len(rs)<2:continue
   x0,y0=rs[0]['bbox'][:2];x1=rs[-1]['bbox'][2]
   blacks=[s for s in spans if s['color']!=RED and abs(s['bbox'][1]-y0)<3 and re.fullmatch(r'[A-Za-z-]{1,3}',s['text'].strip()) and x0-18<s['bbox'][0]<x1]
   bits=sorted(rs+blacks,key=lambda s:s['bbox'][0]);text='';last=None
   for s in bits:
    if last and s['bbox'][0]-last['bbox'][2]>13:text+=' '
    text+=s['text'].strip();last=s
   new.append(dict(rs[0],text=text,bbox=[bits[0]['bbox'][0],y0,x1,max(s['bbox'][3] for s in bits)],wholeWord=True))
   used.update(id(r) for r in rs)
 return [s for s in spans if id(s) not in used]+new
