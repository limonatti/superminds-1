#!/usr/bin/env python3
"""Map printed answer rules to page-relative editable fields (no source images changed).
Run with the bundled Python (Pillow + NumPy):
  python scripts/build-speakout-inline.py /path/to/extracted [--refresh]
The word coordinates come from the supplied PDFs. Raster rules cover scanned pages.
"""
import json,re,sys,collections
from pathlib import Path
import numpy as np
from PIL import Image,ImageFilter
ROOT=Path(__file__).resolve().parents[1];ASSETS=ROOT/'speakout-a1-active-teach/assets'
def jsdata(path,prefix):return json.loads(path.read_text().removeprefix(prefix).strip().removesuffix(';'))
D=jsdata(ASSETS/'course-web.js','window.COURSE=');TEXT=jsdata(ASSETS/'exercise-text.js','window.SPEAKOUT_EXERCISE_TEXT=')
WORDS={b:json.loads((Path(sys.argv[1])/(b+'-words.json')).read_text())for b in D['books']}
CACHE=Path('/tmp/asya-a1-printed-gaps.json')
def rules(path):
 picture=Image.open(path).convert('L');im=np.array(picture);bg=np.array(picture.filter(ImageFilter.MaxFilter(15)));H,W=im.shape;found=[];mask=im<np.minimum(210,bg.astype(float)-18)
 for y in range(35,H-30):
  dark=mask[y];edges=np.flatnonzero(np.diff(np.r_[False,dark,False]));runs=list(zip(edges[::2],edges[1::2]));small=[(int(a),int(b))for a,b in runs if 1<=b-a<=4 and not mask[y-7:y-2,max(0,a-3):min(W,b+3)].any() and not mask[y+3:y+8,max(0,a-3):min(W,b+3)].any()];groups=[]
  for a,b in small:
   if groups and 1<=a-groups[-1][-1][1]<=6:groups[-1].append((a,b))
   else:groups.append([(a,b)])
  candidates=[]
  for g in groups:
   if len(g)>=2 and g[-1][1]-g[0][0]>=5:
    steps=np.diff([a for a,b in g]);
    if np.std(steps)<=1.4:candidates.append((g[0][0],g[-1][1],'dots' if len(g)>=7 and g[-1][1]-g[0][0]>=20 else 'short'))
  candidates += [(int(a),int(b),'line' if b-a>=28 else 'shortline')for a,b in runs if 5<=b-a<=440 and y>3 and mask[y-3,a:b].mean()<.25 and mask[y+3,a:b].mean()<.25]
  for a,b,kind in candidates:
   interior=im[max(0,y-18):max(0,y-3),a+2:b-2]
   if interior.size and np.mean(abs(interior.astype(float)-np.median(interior))<9)>.96:found.append([a,b,y,kind])
 # Merge the multiple scan rows occupied by a printed dot/line.
 merged=[]
 for a,b,y,kind in found:
  near=next((v for v in reversed(merged[-80:])if y-v[2]<=5 and abs(a-v[0])<7 and abs(b-v[1])<7),None)
  if near:near[0]=min(near[0],a);near[1]=max(near[1],b);near[2]=max(near[2],y)
  else:merged.append([a,b,y,kind])
 return [[round(a*595/W,2),round(b*595/W,2),round(y*842/H,2),kind]for a,b,y,kind in merged]
if CACHE.exists() and '--refresh' not in sys.argv:CAND=json.loads(CACHE.read_text())
else:
 CAND={}
 for b,book in D['books'].items():
  for p in book['pages']:
   if p['exercises']:CAND[f'{b}:{p["page"]}']=rules(ROOT/'speakout-a1-active-teach'/p['image'])
  print('Detected',b,flush=True)
 CACHE.write_text(json.dumps(CAND))
def join_rules(path,candidates):
 picture=Image.open(path).convert('L');im=np.array(picture);bg=np.array(picture.filter(ImageFilter.MaxFilter(15)));H,W=im.shape;mask=im<np.minimum(215,bg.astype(float)-18);result=[]
 for a,b,y,kind in candidates:
  row=round(y*H/842);left=round(a*W/595);right=round(b*W/595)
  if kind in ('line','shortline') and (mask[max(0,row-3),left:right].mean()>.25 or mask[min(H-1,row+3),left:right].mean()>.25):continue
  if kind in ('dots','short'):
   row=round(y*H/842); band=mask[max(0,row-1):min(H,row+2)].any(axis=0);edges=np.flatnonzero(np.diff(np.r_[False,band,False]));parts=[]
   for x,z in zip(edges[::2],edges[1::2]):
    if 1<=z-x<=4 and not mask[max(0,row-13):max(0,row-3),max(0,x-1):min(W,z+1)].any():
     if parts and 1<=x-parts[-1][-1][1]<=6:parts[-1].append((x,z))
     else:parts.append([(x,z)])
   for g in parts:
    x,z=g[0][0]*595/W,g[-1][1]*595/W
    if len(g)>=4 and min(z,b)-max(x,a)>.6*min(b-a,z-x):
     a=min(a,x);b=max(b,z)
     if len(g)>=7 and b-a>=10:kind='dots'
  result.append([a,b,y,kind])
 merged=[];nearby=[]
 for a,b,y,kind in sorted(result,key=lambda r:(r[2],r[0])):
  nearby=[v for v in nearby if y-v[2]<2]
  same=next((v for v in reversed(nearby)if abs(y-v[2])<2 and min(b,v[1])-max(a,v[0])>0),None)
  if same:
   same[0]=min(same[0],a);same[1]=max(same[1],b);same[2]=max(same[2],y)
   if kind=='dots':same[3]='dots'
  else:
   entry=[a,b,y,kind];merged.append(entry);nearby.append(entry)
 # Coalesce transitively: a wider run can join two earlier fragments.
 changed=True
 while changed:
  changed=False;merged.sort(key=lambda r:(r[2],r[0]))
  for i,a in enumerate(merged):
   for j in range(i+1,len(merged)):
    b=merged[j]
    if b[2]-a[2]>=2:break
    if abs(a[2]-b[2])<2 and min(a[1],b[1])>max(a[0],b[0]):
     a[0]=min(a[0],b[0]);a[1]=max(a[1],b[1]);a[2]=max(a[2],b[2]);a[3]='dots'if 'dots'in (a[3],b[3])else a[3];merged.pop(j);changed=True;break
   if changed:break
 return merged
import hashlib,inspect
JOINCACHE=Path('/tmp/asya-a1-joined-gaps.json')
signature=hashlib.sha256(CACHE.read_bytes()+inspect.getsource(join_rules).encode()).hexdigest()
saved=json.loads(JOINCACHE.read_text())if JOINCACHE.exists()else {}
if saved.get('signature')==signature:CAND=saved['data']
else:
 for b,book in D['books'].items():
  for p in book['pages']:
   cid=f'{b}:{p["page"]}'
   if cid in CAND:CAND[cid]=join_rules(ROOT/'speakout-a1-active-teach'/p['image'],CAND[cid])
 JOINCACHE.write_text(json.dumps({'signature':signature,'data':CAND}))
def region(e,p,book):
 if book=='sb' and p['page']==48 and e['label']=='2A':return [30,253,592,539]
 if e.get('x') is None:return None
 if e['box'][2]<90 and not e.get('fullPage'):return [e['box'][0]*5.95,e['box'][1]*8.42,(e['box'][0]+e['box'][2])*5.95,(e['box'][1]+e['box'][3])*8.42]
 side=e['x']<40;following=[q['y'] for q in p['exercises'] if q.get('x')is not None and (q['x']<40)==side and q['y']>e['y']+1]
 return [24 if side else 293,max(0,e['y']*8.42-5),292 if side else 575,min(following,default=95)*8.42-2]
def word_number(w):
 t=w['text'];m=re.fullmatch(r'(\d{1,2})[.)]?',t)or re.match(r'^(\d{1,2})[._]{2,}',t)
 return m[1]if m else None
out={};audit=[]
for b,book in D['books'].items():
 for p in book['pages']:
  ws=WORDS[b].get(str(p['page']),[])
  pixels=np.array(Image.open(ROOT/'speakout-a1-active-teach'/p['image']).convert('L'))
  def empty_join(left,right):
   a=round((left['box'][0]+left['box'][2])*2);z=round(right['box'][0]*2);y=round(right['box'][1]*2)
   strip=pixels[y:y+19,a:z]
   return not strip.size or np.mean(strip>float(strip.max())-25)>.94
  for e in p['exercises']:
   rid=f'{b}:{p["page"]}:{e["label"]}';r=region(e,p,b)
   if not r:continue
   text=e.get('text')or TEXT.get(rid,'');key=D['keys'].get(f'{b}|{p["lesson"]}|{e["label"]}',{});items=key.get('items',[]);nums={q['n']for q in items};gaps=[];given=set();rank=bool(re.search(r'put.*words.*(?:correct )?order',text,re.I))and bool(items)and all(len(q['answer'].split())==1 for q in items);vowels=bool(re.search(r'vowels',text,re.I));letters=vowels or bool(re.search(r'same letters|prepositions|correct letters',text,re.I))
   for a,z,y,kind in CAND.get(f'{b}:{p["page"]}',[]):
    if kind in ('short','shortline') and not letters:continue
    if kind=='shortline' and (z-a<4.4 or not any('_'in w['text'] and w['x0']-2<=a and z<=w['x1']+3 and abs(y-w['bottom'])<3.5 for w in ws)):continue
    if not (r[0]-2<=a<z<=r[2]+3 and r[1]+10<y<r[3]+1):continue
    # A supplied example already printed above a rule is not an empty answer.
    leftword=min((w for w in ws if 0<=a-w['x1']<10 and y-16<w['top']<y-3),key=lambda w:a-w['x1'],default=None)
    rankitem=next((q for q in items if leftword and q['answer'].lower()==leftword['text'].lower()),None)if rank else None
    ink=[w for w in ws if re.search('[a-zA-Z0-9]',w['text'])and '.'not in w['text']and y-15<w['top']<y-2 and w['bottom']<y+4 and min(w['x1'],z)-max(w['x0'],a)>.65*(w['x1']-w['x0'])]
    if ink:
     if rankitem and any(w['text']==rankitem['n']for w in ink):given.add(rankitem['n'])
     continue
    ns=[w for w in ws if word_number(w)and a-18<w['x0']<a+4 and y-19<w['top']<y-2 and w['size']<=11]
    near=min(ns,key=lambda w:abs(w['x1']-a)+abs(w['bottom']-y),default=None)
    if not near:
     ns=[w for w in ws if word_number(w)and r[0]-2<=w['x0']<a and y-16<w['top']<y-4 and w['size']<=11 and not(abs(w['x0']-e['x']*5.95)<10 and abs(w['top']-e['y']*8.42)<12)]
     near=min(ns,key=lambda w:abs(w['bottom']-y)*6+(a-w['x0'])/10,default=None)
    n=rankitem['n']if rankitem else word_number(near)if near else None
    if kind=='line' and n is None:continue
    gaps.append({'n':n,'box':[round(a,2),round(y-11.5,2),round(z-a,2),13.5],'kind':kind})
   if any(g['kind']in ('dots','short')for g in gaps):gaps=[g for g in gaps if g['kind']!='line']
   gaps.sort(key=lambda g:(round(g['box'][1]/6),g['box'][0]))
   if letters:
    merged=[]
    for g in gaps:
     prev=merged[-1]if merged else None
     if prev and g['kind']==prev['kind']=='shortline' and g['n']==prev['n'] and abs(g['box'][1]-prev['box'][1])<1.5 and 0<=g['box'][0]-prev['box'][0]-prev['box'][2]<=2.5 and empty_join(prev,g):prev['box'][2]=g['box'][0]+g['box'][2]-prev['box'][0]
     else:merged.append(g)
    gaps=merged
   # Omit empty rules from unrelated figures/paragraph dividers.
   if not gaps or (not re.search(r'complet|fill|write|correct|sentence|question|conversation|table|listen|word|read|match',text,re.I)and not nums):continue
   # Position-only numbering is used only when the full printed set is unambiguous.
   if not rank and items and len(gaps)==len(items)and len({g['n']for g in gaps if g['n']in nums})<len(items):
    ordered=sorted(items,key=lambda q:int(q['n'])if q['n'].isdigit()else 999)
    present=[(i,g['n'])for i,g in enumerate(gaps)if g['n']in nums]
    if all(ordered[i]['n']==n for i,n in present):
     for g,q in zip(gaps,ordered):g['n']=q['n'];g['sequence']=True
   if items and not rank:
    expanded=[q['n']for q in sorted(items,key=lambda q:int(q['n'])if q['n'].isdigit()else 999)for _ in re.split(r'[,;]',q['answer'])]
    if len(expanded)==len(gaps)and all(g['n']is None or g['n']==n for g,n in zip(gaps,expanded)):
     for g,n in zip(gaps,expanded):g['n']=n
   # Printed example numbers absent from the key must not become extra graded answers.
   if items:gaps=[g for g in gaps if g['n']is None or g['n']in nums]
   if not gaps:continue
   count=collections.Counter(g['n']for g in gaps if g['n']);seen=collections.Counter()
   for i,g in enumerate(gaps):
    n=g['n'];seen[n]+=1;g['id']=n if n and count[n]==1 else f'{n}.{seen[n]}'if n else f'_gap{i+1}'
   out[rid]={'box':[round(r[0],2),round(r[1],2),round(r[2]-r[0],2),round(r[3]-r[1],2)],'fields':gaps,'rank':rank,'given':sorted(given),'vowels':vowels,'letters':letters}
   audit.append({'id':rid,'gaps':len(gaps),'keys':len(items),'mapped':len({g['n']for g in gaps if g['n']in nums}),'unit':p['lesson']})
# These instructions explicitly use the printed blanks in the preceding subtask.
import copy
for target,source,labels,instruction in [
 ('sb:69:5B','sb:69:5A',['1','2','3','4','5','5','6','7','8'],'Complete the questions (1–8) with Who, What, Where, How or Why.'),
 ('sb:66:1C','sb:66:1B',['a','b','c','d','e','e','f','f'],'Complete the answers in Ex 1B with there is / ’s, there are, there isn’t or there aren’t.')]:
 if source in out:
  entry=copy.deepcopy(out[source]);entry['instruction']=instruction;counts=collections.Counter(labels);seen=collections.Counter()
  if len(entry['fields'])==len(labels):
   for f,n in zip(entry['fields'],labels):seen[n]+=1;f['n']=n;f['id']=n if counts[n]==1 else f'{n}.{seen[n]}'
  out[target]=entry;del out[source]
overrides=json.loads((ROOT/'scripts/speakout-inline-overrides.json').read_text())
for rid,patch in overrides.items():
 if rid in out:
  out[rid].update({k:v for k,v in patch.items()if k not in ('note','appendFields')})
  if patch.get('appendFields'):
   fields=out[rid]['fields']+patch['appendFields'];fields.sort(key=lambda f:(round(f['box'][1]/6),f['box'][0]));count=collections.Counter(f['n']for f in fields if f['n']);seen=collections.Counter()
   for i,f in enumerate(fields):
    n=f['n'];seen[n]+=1;f['id']=n if n and count[n]==1 else f'{n}.{seen[n]}'if n else f'_gap{i+1}'
   out[rid]['fields']=fields
for entry in out.values():
 x,y,w,h=entry['box'];fs=entry['fields'];right=max([x+w]+[f['box'][0]+f['box'][2]+1 for f in fs]);bottom=max([y+h]+[f['box'][1]+f['box'][3]+1 for f in fs]);x=min([x]+[f['box'][0]-1 for f in fs]);y=min([y]+[f['box'][1]-1 for f in fs]);entry['box']=[round(x,2),round(y,2),round(right-x,2),round(bottom-y,2)]
(ASSETS/'inline-data.js').write_text('window.SPEAKOUT_INLINE_DATA='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
Path('/tmp/a1-inline-audit.json').write_text(json.dumps(audit,indent=2))
print('Exercises:',len(out),'fields:',sum(len(v['fields'])for v in out.values()),'fully mapped keyed:',sum(bool(a['keys'])and a['mapped']==a['keys']for a in audit))
for rid in ['sb:8:2A','sb:8:3A','sb:8:3C','wb:4:5A','sb:18:2A','wb:10:2']:print(rid,out.get(rid))
