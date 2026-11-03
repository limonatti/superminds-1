"""Build complete exercise views from existing source scans, without altering originals.
Substeps share the complete numbered task. References to other numbered tasks
include those originals as context. Coordinate-only changes never change answers.
"""
from pathlib import Path
from PIL import Image
import json,re,statistics,collections
ROOT=Path(__file__).resolve().parents[1]
def read(path):return json.JSONDecoder().raw_decode(path.read_text().split('=',1)[1].lstrip())[0]
def write(path,data):path.write_text('window.EXERCISE_SOURCES='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
def number(e):
 label=str(e['label']);m=re.fullmatch(r'(\d+)[A-Ha-h]',label)
 return m[1] if m else '@'+e['id']
def bounds(box):
 x,y,w,h=box;x=max(0,x);y=max(0,y)
 return [round(x,5),round(y,5),round(min(1-x,w),5),round(min(1-y,h),5)]
def gutter(path,top):
 # A full-height white gutter separates a task column from unnumbered
 # text/photos. Require substantial content on both sides, not a word space.
 with Image.open(path) as im:
  im=im.convert('RGB');im.thumbnail((400,600));w,h=im.size;pix=im.load();lo=int(max(.12,top)*h);hi=int(.94*h)
  values=[sum(min(pix[x,y])>239 for y in range(lo,hi))/max(1,hi-lo) for x in range(w)]
  runs=[];start=None
  for x in range(int(w*.30),int(w*.74)):
   if values[x]>.984:
    if start is None:start=x
   elif start is not None:
    if x-start>=w*.012:runs.append((start,x))
    start=None
  valid=[r for r in runs if statistics.mean(values[max(0,r[0]-int(w*.12)):r[0]])<.94 and statistics.mean(values[r[1]:min(w,r[1]+int(w*.12))])<.94]
  if valid:
   a,b=max(valid,key=lambda r:r[1]-r[0]);return (a+b)/2/w
 return None

def build(course,pages):
 out={};report=[];base=ROOT/(course+'-active-teach')
 for p in pages:
  entries=p['exercises'];path=base/p['image'].split('?')[0]
  if not entries or not path.exists():continue
  with Image.open(path) as im:size=list(im.size)
  groups=collections.defaultdict(list)
  for e in entries:groups[number(e)].append(e)
  # The left edge, rather than a fragment's width, determines its column.
  clusters=[]
  for e in sorted(entries,key=lambda e:e['box'][0]):
   x=e['box'][0]
   if not clusters or x-clusters[-1][0]>.17:clusters.append([x,[]])
   clusters[-1][1].append(e)
  split=None
  if len(clusters)==1 and clusters[0][0]<.3 and statistics.median(e['box'][2] for e in entries)>.68:
   split=gutter(path,min(e['box'][1] for e in entries))
  # Verified opener: the article and object photographs form a separate
  # right-hand source panel; the former full-width strips cut both in half.
  if course=='speakout-b1plus' and p['key']=='sb:8':split=.43
  group_sources={}
  for group,members in groups.items():
   regions=[]
   for ci,(cx,ces) in enumerate(clusters):
    own=[e for e in members if e in ces]
    if not own:continue
    x=max(0,min(e['box'][0] for e in own)-.006);y=max(.012,min(e['box'][1] for e in own)-.005)
    right=min(.985,max(e['box'][0]+e['box'][2] for e in own)+.008)
    if ci+1<len(clusters):right=min(right,clusters[ci+1][0]-.009)
    if split:right=split-.006
    if course=='speakout-b1plus' and p['key']=='sb:8':right=.398
    end=max(e['box'][1]+e['box'][3] for e in own)
    following=[e['box'][1] for e in ces if e not in members and e['box'][1]>max(q['box'][1] for q in own)+.005]
    if following:end=min(following)-.012
    end=min(.97,end+.006)
    # Photos and printed models above the first task are part of its source.
    intro=' '.join(e.get('text','').split('\n')[0] for e in own)
    first=not any(e['box'][1]<y-.01 for e in ces if e not in members)
    before_context=first and y>.24 and re.search(r'photo|picture|text|article|conversation|match|read',intro,re.I)
    regions.append({'image':p['image'],'size':size,'box':bounds([x,y,max(.05,right-x),end-y]),'page':p['page']})
    if before_context:
     regions.append({'image':p['image'],'size':size,'box':bounds([x,.055,max(.05,right-x),y-.055]),'page':p['page'],'context':True})
   if split and any(re.search(r'photo|picture|read|text|article|Ex\s*2',e.get('text','').split('\n')[0],re.I) for e in members):
    context_y=.282 if course=='speakout-b1plus' and p['key']=='sb:8' else .055
    context_x=.39 if course=='speakout-b1plus' and p['key']=='sb:8' else split
    regions.append({'image':p['image'],'size':size,'box':bounds([context_x,context_y,.99-context_x,.975-context_y]),'page':p['page'],'context':True})
   if course=='speakout-a1' and p['key']=='sb:8' and group=='1':
    regions=[r for r in regions if not r.get('context')]+[{'image':p['image'],'size':size,'box':box,'page':p['page'],'context':True} for box in [[0,0,1,.433],[.505,.284,.495,.309]]]
   group_sources[group]=regions
  for e in entries:
   regions=[dict(r) for r in group_sources[number(e)]]
   if e.get('curatedBox'):
    regions=[{'image':p['image'],'size':size,'box':bounds(e['curatedBox']),'page':p['page']}]+[r for r in regions if r.get('context')]
   refs=set(re.findall(r'\bEx(?:ercise)?\.?\s*(\d+)[A-Ha-h]?',e.get('text',''),re.I))
   for ref in refs:
    related=next((g for g,ms in groups.items() if g!=number(e) and any(re.match('^'+re.escape(ref)+r'(?:[A-Ha-h]|$)',q['label']) for q in ms)),None)
    if related:
     for r in group_sources[related]:
      if not any(s['image']==r['image'] and s['box']==r['box'] for s in regions):regions.append({**r,'context':True})
   out[e['id']]={'label':e['label'],'sources':regions}
  report.append({'page':p['key'],'exercises':len(entries),'sourceGroups':len(groups),'gutter':split})
 write(base/'assets/exercise-sources.js',out)
 return {'course':course,'exercises':len(out),'pages':report}

reports=[]
for course in ['speakout-a1','speakout-b1','speakout-b1plus']:
 base=ROOT/(course+'-active-teach');data=read(base/'assets'/('course-web.js' if course=='speakout-a1' else 'course.js'));pages=[]
 curated={}
 if course=='speakout-a1':
  for name in ['inline-data.js','choices-data.js']:
   for id,m in read(base/'assets'/name).items():
    box=[m['box'][0]/595,m['box'][1]/842,m['box'][2]/595,m['box'][3]/842]
    if id in curated:
     a=curated[id];x=min(a[0],box[0]);y=min(a[1],box[1]);box=[x,y,max(a[0]+a[2],box[0]+box[2])-x,max(a[1]+a[3],box[1]+box[3])-y]
    curated[id]=box
 for book,d in data['books'].items():
  for p in d['pages']:
   es=[{**e,'id':f"{book}:{p['page']}:{e['label']}",'box':[v/100 for v in e['box']]} for e in p['exercises']]
   for e in es:
    if e['id'] in curated:e['curatedBox']=curated[e['id']]
   pages.append({'key':f"{book}:{p['page']}",'page':p['page'],'image':p['image'],'exercises':es})
 reports.append(build(course,pages))
course='solutions-int';data=read(ROOT/(course+'-active-teach/assets/course.js'))
reports.append(build(course,[{**p,'key':p['id']} for p in data['pages']]))
course='outcomes-beginner';base=ROOT/(course+'-active-teach');data=read(base/'assets/course.js');tasks=read(base/'assets/exercises.js');contexts=read(base/'assets/interactions-data.js');pages=[]
for book,d in data['books'].items():
 for p in d['pages']:
  es=[{**e,'label':str(e['n']),'text':e['instruction'],'box':contexts.get(e['id'],{}).get('box',[max(0,e['x']-.02),max(0,e['y']-.008),min(.5,1-e['x']),e.get('height',.2)])} for e in tasks.get(f"{book}:{p['id']}",[])]
  if es:pages.append({'key':f"{book}:{p['id']}",'page':p['page'],'image':p['image'],'exercises':es})
reports.append(build(course,pages))
course='speakout-b2plus';base=ROOT/(course+'-active-teach');data=read(base/'data/exercises.js');pages=[]
for key,es in data.items():
 book,p=key.split(':');p=int(p)
 pages.append({'key':key,'page':p+(1 if book=='sb' else 2),'image':f'pages/{book}/{p:03}.jpg','exercises':[{**e,'box':[e['x'],e['y'],e['w'],e['h']]} for e in es]})
reports.append(build(course,pages))
(ROOT/'tests/fixtures/exercise-sources-audit.json').parent.mkdir(exist_ok=True)
(ROOT/'tests/fixtures/exercise-sources-audit.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2)+'\n')
print(json.dumps([{k:v for k,v in r.items() if k!='pages'} for r in reports]))
