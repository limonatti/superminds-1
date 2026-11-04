"""Find empty printed rules, only accepting complete, unambiguous answer sets.
Original scans and keys are never changed. Requires Pillow, numpy, pypdfium2.
Usage: python scripts/build-exercise-gaps.py models.json --source-workspace PATH
"""
from pathlib import Path
import argparse,json,re,collections,hashlib,concurrent.futures
import numpy as np
from PIL import Image,ImageFilter
import pypdfium2 as pdfium
P=argparse.ArgumentParser();P.add_argument('models',type=Path);P.add_argument('--source-workspace',type=Path,required=True);args=P.parse_args()
ROOT=Path(__file__).resolve().parents[1];CACHE=Path('/private/tmp/exercise-gap-cache-v2');CACHE.mkdir(exist_ok=True)
assert args.source_workspace.is_dir(), 'Source workspace must exist'
MODELS=json.loads(args.models.read_text());OCR=args.source_workspace/'tmp';pdfs={};pdfrows={};outcomes={}
def jsonread(p):return json.loads(p.read_text())if p.exists()else None
def clean_rules(values):
 result=[]
 for box in sorted(values,key=lambda b:(b[1],b[0])):
  if box[2]<.0245:continue
  near=next((r for r in reversed(result[-45:])if abs(r[1]-box[1])<.004 and min(r[0]+r[2],box[0]+box[2])-max(r[0],box[0])>.45*min(r[2],box[2])),None)
  if near:
   right=max(near[0]+near[2],box[0]+box[2]);near[0]=min(near[0],box[0]);near[2]=right-near[0];near[1]=max(near[1],box[1])
  else:result.append(box[:])
 return result
def raster(path):
 stamp=hashlib.sha256((str(path)+str(path.stat().st_mtime_ns)).encode()).hexdigest();cache=CACHE/(stamp+'.json')
 if cache.exists():return clean_rules(json.loads(cache.read_text()))
 im=Image.open(path).convert('L');im.thumbnail((1100,1700));a=np.array(im);H,W=a.shape;bg=np.array(im.filter(ImageFilter.MaxFilter(11)));mask=a<np.minimum(200,bg.astype(float)-25)
 # Horizontal closing joins dots, but not the vertical strokes of letters.
 pad=np.pad(mask,((0,0),(3,3)));d=np.logical_or.reduce([pad[:,i:i+W]for i in range(7)])
 pad=np.pad(d,((0,0),(3,3)),constant_values=True);closed=np.logical_and.reduce([pad[:,i:i+W]for i in range(7)])
 integral=np.pad(mask.astype(np.int32).cumsum(0).cumsum(1),((1,0),(1,0)))
 def density(y0,y1,x0,x1):
  y0=max(0,y0);y1=min(H,y1);x0=max(0,x0);x1=min(W,x1)
  return (integral[y1,x1]-integral[y0,x1]-integral[y1,x0]+integral[y0,x0])/max(1,(y1-y0)*(x1-x0))
 found=[]
 for y in range(30,H-25):
  edges=np.flatnonzero(np.diff(np.r_[False,closed[y],False]));
  for l,r in zip(edges[::2],edges[1::2]):
   if not 19<=r-l<=W*.38:continue
   if density(y-13,y-3,l+2,r-2)>.028 or density(y+3,y+8,l+2,r-2)>.045:continue
   if mask[y,l:r].mean()<.23:continue
   old=next((v for v in reversed(found[-40:])if y-v[2]<5 and abs(l-v[0])<6 and abs(r-v[1])<6),None)
   if old:old[0]=min(old[0],int(l));old[1]=max(old[1],int(r));old[2]=y
   else:found.append([int(l),int(r),y])
 result=[[round(l/W,6),round(max(0,y/H-.013),6),round((r-l)/W,6),.016]for l,r,y in found]
 cache.write_text(json.dumps(result));return clean_rules(result)

def rows(course,model,source):
 name=Path(source['image']).name;stem=Path(name).stem
 for base in [ROOT,args.source_workspace]:
  path=base/(course+'-active-teach')/'work/ocr'/(name+'.json')
  if path.exists():return jsonread(path)
 if course=='solutions-int':return jsonread(OCR/'solutions-int/ocr'/f'{stem}.webp.json')or[]
 if course=='speakout-b2plus':
  book='wb'if model['id'].startswith('wb-')else'sb'
  return jsonread(OCR/'speakout-b2plus/ocr'/book/f'{stem}.jpg.json')or[]
 if course=='outcomes-beginner':
  book='wb'if model['id'].startswith('wb-')else'sb'
  if book not in outcomes:outcomes[book]=jsonread(OCR/('outcomes-wb-ocr.json'if book=='wb'else'outcomes-ocr.json'))or{}
  return outcomes[book].get(stem+'.webp',[])
 if model.get('pdf') and model.get('pdfPage'):
  path=ROOT/(course.replace('-tests','')+'-active-teach')/model['pdf'];number=source['page']if model.get('material')else model['pdfPage'];key=(str(path),number)
  if key in pdfrows:return pdfrows[key]
  if not path.exists():return []
  if str(path)not in pdfs:pdfs[str(path)]=pdfium.PdfDocument(path)
  page=pdfs[str(path)][number-1];w,h=page.get_size();text=page.get_textpage();value=text.get_text_range();result=[]
  for match in re.finditer(r'(?<!\w)\d{1,2}(?!\w)',value):
   try:
    x0,y0,x1,y1=text.get_charbox(match.start());result.append({'text':match[0],'x':x0/w,'y':1-y1/h,'w':(x1-x0)/w,'h':(y1-y0)/h})
   except (ValueError,IndexError):pass
  pdfrows[key]=result;return result
 return []

report={};total=0
for course,models in MODELS.items():
 base=ROOT/(course.replace('-tests','')+'-active-teach');paths={str(base/s['image'])for m in models for s in m['sources']if not s.get('context')};print(course,'scanning',len(paths),'pages',flush=True)
 with concurrent.futures.ThreadPoolExecutor(max_workers=4)as pool:pagegaps=dict(pool.map(lambda p:(p,raster(Path(p))),paths))
 result={};rejected=collections.Counter()
 for model in models:
  fields=[]
  for field in model['fields']:
   parts=re.split(r'\s*[,;]\s*',(field['answers']or[''])[0])
   if 1<len(parts)<=4 and all(p and len(p)<=52 for p in parts):fields.extend(dict(field,id=field['id']+'.'+str(i+1),number=field['id'],answers=[p])for i,p in enumerate(parts))
   else:fields.append(dict(field,number=field['id']))
  if not fields or len(fields)<2 or not re.search(r'complet|fill|gap|write|sentence|question|conversation|word|verb|preposition|article|listen',model['text']or'',re.I):continue
  if any(len((f['answers']or[''])[0])>70 for f in fields):continue
  candidates=[]
  for source in model['sources']:
   if source.get('context'):continue
   x,y,w,h=source['box'];words=rows(course,model,source)
   for box in pagegaps[str(base/source['image'])]:
    a,b,c,d=box
    if not (x<=a and a+c<=x+w+.003 and y+.012<=b and b+d<=y+h+.004):continue
    nearby=[]
    for r in words:
     match=re.match(r'^\s*(\d{1,2})[.)]?\s',r['text']+' ')
     if match and x-.005<=r['x']<a+.005 and abs(r['y']-b)<.014:nearby.append((a-r['x']+abs(r['y']-b)*10,match[1]))
    n=min(nearby)[1]if nearby else None
    candidates.append({'box':box,'image':source['image'],'page':source['page'],'n':n})
  # The page crop may include context. A complete, uniquely numbered subset is
  # preferred; otherwise only an exact set in printed reading order is accepted.
  groups={n:sorted([g for g in candidates if g['n']==n],key=lambda g:(g['page'],round(g['box'][1]/.007),g['box'][0]))for n in {f['number']for f in fields}}
  expected=collections.Counter(f['number']for f in fields)
  if all(len(groups[n])==count for n,count in expected.items()):
   used=collections.Counter();chosen=[]
   for f in fields:chosen.append(groups[f['number']][used[f['number']]]);used[f['number']]+=1
  elif len(candidates)==len(fields):
   chosen=sorted(candidates,key=lambda g:(g['page'],round(g['box'][1]/.007),g['box'][0]))
   if any(g['n']and g['n']!=f['number']for g,f in zip(chosen,fields)):rejected['ambiguous_numbers']+=1;continue
  else:rejected['no_complete_set']+=1;continue
  mapping={f['id']:{k:v for k,v in g.items()if k!='n'}for f,g in zip(fields,chosen)}
  if len(mapping)!=len(fields):continue
  result[model['id']]=mapping;total+=len(mapping)
 (base/('assets/material-gaps.js'if course.endswith('-tests')else'assets/exercise-gaps.js')).write_text(('window.MATERIAL_EXERCISE_GAPS='if course.endswith('-tests')else'window.EXERCISE_GAPS=')+json.dumps(result,ensure_ascii=False,separators=(',',':'))+';\n')
 report[course]={'exercises':len(result),'gaps':sum(map(len,result.values())),'unmapped':dict(rejected)};print(report[course],flush=True)
(ROOT/'tests/fixtures/exercise-gaps-audit.json').write_text(json.dumps(report,indent=2)+'\n');print('Mapped',total,'printed gaps')
