#!/usr/bin/env python3
"""Build drag banks and matching endpoints from the supplied page text and keys.
python3 scripts/build-speakout-activities.py /path/to/extracted
"""
import json,re,sys,collections,unicodedata
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];A=ROOT/'speakout-a1-active-teach/assets'
def readjs(name):return json.loads((A/name).read_text().partition('=')[2].strip().removesuffix(';'))
D=readjs('course-web.js');KEYS=readjs('answer-map.js');TEXT=readjs('exercise-text.js');INLINE=readjs('inline-data.js')
WORDS={b:json.loads((Path(sys.argv[1])/f'{b}-words.json').read_text())for b in ('sb','wb')}
FIX=json.loads((ROOT/'scripts/speakout-activity-overrides.json').read_text())
def norm(s):return re.sub(r'[^a-z0-9]+','',unicodedata.normalize('NFKC',s).lower())
def clean(s):
 for x,y in {'co ee':'coffee','pia':'pizza','fi rst':'first','aft ernoon':'afternoon','offi ce':'office','shevveF':'shower'}.items():s=re.sub(r'\b'+re.escape(x)+r'\b',y,s)
 return s.strip(' []|')
def rows(ws):
 out=[]
 for w in sorted(ws,key=lambda w:(w['top'],w['x0'])):
  r=next((r for r in out[-3:]if abs(r[0]['top']-w['top'])<3),None)
  if r is None:out.append([w])
  elif not any(t['text']==w['text']and abs(t['x0']-w['x0'])<1 for t in r):r.append(w)
 return [sorted(r,key=lambda w:w['x0'])for r in out]
def rect(ws,pad=1):
 x=min(w['x0']for w in ws);y=min(w['top']for w in ws);z=max(w['x1']for w in ws);t=max(w['bottom']for w in ws)
 return [round(x-pad,2),round(y-pad,2),round(z-x+pad*2,2),round(t-y+pad*2,2)]
def bounds(e,p):
 x,y,w,h=e['box'];side=e['x']<40;left=max(0,e['x']*5.95-4)
 end=min([q['y']*8.42-2 for q in p['exercises']if q.get('x')is not None and(q['x']<40)==side and q['y']>e['y']+1],default=815)
 if w<90 and not e.get('fullPage'):return [x*5.95,y*8.42,(x+w)*5.95,min(end,(y+h)*8.42+16)]
 return [left,max(0,e['y']*8.42-5),292 if side else 580,end]
def inside(w,r):return r[0]-2<=w['x0']and w['x1']<=r[2]+2 and r[1]<=w['top']<r[3]
def bank(ws,r):
 lines=rows([w for w in ws if inside(w,r)]);which=next((i for i,l in enumerate(lines[:8])if any(re.match(r'^bo[x.]',w['text'],re.I)for w in l)),None)
 if which is None:return []
 start=next((i for i in range(which+1,min(which+5,len(lines)))if lines[i][0]['top']-lines[i-1][0]['top']>=15),None)
 if start is None:return []
 selected=[]
 for i in range(start,min(start+4,len(lines))):
  l=lines[i]
  if i>start and(l[0]['top']-lines[i-1][0]['top']>=18 or re.match(r'^\d+[.]?$',l[0]['text'])):break
  if any('....'in w['text']for w in l):break
  selected.append(l)
 opts=[]
 for line in selected:
  chunks=[]
  for w in line:
   if w['text']in ['[',']','|']or re.fullmatch(r'\(?[x×]\d+\)?',w['text']):continue
   if not chunks or w['x0']-chunks[-1][-1]['x1']>=7:chunks.append([w])
   else:chunks[-1].append(w)
  for chunk in chunks:
   label=clean(' '.join(w['text']for w in chunk))
   if not re.search('[A-Za-z0-9]',label):continue
   opts.append({'value':label,'label':label,'box':rect(chunk)})
 return opts if 2<=len(opts)<=30 else []
def anchor(ws,label,r,kind):
 candidates=[w for w in ws if w['text'].rstrip('.')==label and 5<w['size']<25]
 if kind=='right'and label.isdigit():candidates=[w for w in candidates if inside(w,r)and w['top']>r[1]+12]
 if kind=='left':candidates=[w for w in candidates if inside(w,r)and w['top']>r[1]+12]
 if not candidates and ' 'in label:
  phrases=[]
  for row in rows(ws):
   for i in range(len(row)):
    for j in range(i+1,min(i+len(label.split())+3,len(row))+1):
     chunk=row[i:j]
     if norm(' '.join(w['text']for w in chunk))==norm(label):
      q=dict(chunk[0]);q.update(x1=chunk[-1]['x1'],bottom=max(w['bottom']for w in chunk));phrases.append(q)
  candidates=[w for w in phrases if kind!='left'or inside(w,r)]
 if not candidates:return None
 def rank(w):
  bold=bool(re.search('Bold|Medium',w['fontname']))
  in_area=inside(w,r)
  if kind=='left':return (not bold,abs(w['x0']-r[0]),w['top'])
  # Lower-case pair labels are in the task. Upper-case picture labels often precede it.
  if label.islower():return(not in_area,not bold,abs(w['top']-(r[1]+r[3])/2))
  return(not bold,-min(w['size'],14),abs(w['top']-r[1]))
 w=min(candidates,key=rank);return rect([w],2)
out={};audit=[]
for b,B in D['books'].items():
 for p in B['pages']:
  ws=WORDS[b].get(str(p['page']),[])
  for e in p['exercises']:
   rid=f'{b}:{p["page"]}:{e["label"]}';f=FIX.get(rid,{})
   if e.get('x')is None or f.get('skip'):continue
   text=e.get('text')or TEXT.get(rid,'');key=KEYS.get(rid)or D['keys'].get(f'{b}|{p["lesson"]}|{e["label"]}',{});items=key.get('items',[])
   if f.get('key'):items=[{'n':str(n),'answer':v}for n,v in f['key'].items()]
   elif f.get('keyFrom'):items=D['keys'][f['keyFrom']].get('items',[])
   items=[dict(q,answer=re.sub(r'\s+\d{1,2}$','',q['answer'])if b=='sb'and q['answer'].endswith(' '+str(key.get('pdfPage')))else q['answer'])for q in items]
   r=f.get('region')or bounds(e,p);opts=[];entry={};related=None
   isbank=bool(re.search(r'\bbo[x.]?\b',text[:220],re.I))and not re.search(r'Future Skills|Grammar Bank',text[:160],re.I)and not f.get('match')
   if isbank:
    opts=bank(ws,r)
    if 'bank'in f:
     old=opts;opts=[]
     for word in f['bank']:
      found=next((o for o in old if norm(o['label'])==norm(word)),None)
      opts.append(dict(found or {},value=word,label=word))
    if opts:entry={'type':'bank','bank':opts,'form':bool(re.search(r'correct form|past simple|negative.*form|imperative form',text[:210],re.I))}
   ismatch=bool(re.search(r'\bMatch\b',text[:210],re.I))or f.get('match')
   if ismatch and not opts and items:
    # Read the official pair labels, not words guessed from an answer list.
    answers={q['n']:re.sub(r'\s*\([^)]*\)','',q['answer']).strip()for q in items}
    if f.get('match')or all(re.fullmatch(r'[A-Za-z0-9–—-](?:\s*[,;]\s*[A-Za-z0-9])*',v)for v in answers.values()):
     targets=[]
     for value in answers.values():
      for label in re.split(r'\s*[,;]\s*',value):
       if label not in targets:targets.append(label)
     # Retain printed distractors from a stated range.
     for lo,hi in re.findall(r'\b([a-zA-Z])\s*[-–—]\s*([a-zA-Z])\b',text[:230]):
      if lo.islower()==targets[0].islower()and ord(lo)<=ord(hi)and ord(hi)-ord(lo)<16:targets+=list(map(chr,range(ord(lo),ord(hi)+1)))
     targets=sorted(set(targets+f.get('targets',[])),key=lambda v:(v.lower(),v))
     ref=re.search(r'\bEx(?:ercise)?\s*(\d+[A-D]?)',text[:230],re.I);related=next((v for v in p['exercises']if ref and v['label']==ref[1]),None);leftRegion=f.get('leftRegion')or(bounds(related,p)if related and all(q['n'].isdigit()for q in items)else r);rightRegion=f.get('rightRegion')or(bounds(related,p)if related and all(v.isdigit()for v in targets)else r)
     left=[{'id':q['n'],'label':q['n'],'box':anchor(ws,q['n'],leftRegion,'left')}for q in items]
     right=[{'id':v,'label':v if v not in '–—-'else'Нет пары','box':anchor(ws,v,rightRegion,'right')if v not in '–—-'else None}for v in targets]
     entry={'type':'match','left':left,'right':right,'items':[{'n':n,'answer':v}for n,v in answers.items()]}
   if not entry:continue
   if items and(f.get('key')or f.get('keyFrom')):entry['keyItems']=items
   if f.get('bank')or entry['type']=='bank':entry['items']=items
   if entry['type']=='bank':entry['targets']=[{'id':q['n'],'label':q['n'],'box':anchor(ws,q['n'],r,'right'if q['n'].isalpha()else'left')}for q in items]
   if 'fields'in f:entry['fields']=f['fields']
   if f.get('given'):entry['given']=f['given']
   if f.get('distinct'):entry['distinct']=f['distinct']
   if f.get('optional'):entry['optional']=f['optional']
   if f.get('gaps'):entry['gaps']=f['gaps']
   if f.get('select'):entry['select']=f['select'];entry['keyItems']=[{'n':'selected','answer':', '.join(f['select'])}]
   if f.get('contextRegion'):r=f['contextRegion']
   if f.get('nodes'):
    for side in ['left','right']:
     for n in entry.get(side,entry.get('targets',[])if side=='left'else[]):
      if side+':'+n['id']in f['nodes']:n['box']=f['nodes'][side+':'+n['id']]
   if f.get('rightPage'):
    pn=f['rightPage']
    for n in entry.get('right',[]):
     n['page']=f.get('rightPages',{}).get(n['id'],pn);other=WORDS[b][str(n['page'])];n['box']=f.get('contextNodes',{}).get(n['id'])or anchor(other,n['id'],[0,0,595,842],'right')
    entry['frames']=[{'page':pn,'image':f'assets/{b}-{pn}.webp','box':f.get('contextBox',[0,0,595,842])}]
   allboxes=[o['box']for o in entry.get('bank',[])+entry.get('left',[])+entry.get('right',[])+entry.get('targets',[])if o.get('box')and o.get('page',p['page'])==p['page']]+[v['box']for v in f.get('fields',INLINE.get(rid,{}).get('fields',[]))]
   if related:
    ref= bounds(related,p);allboxes.append([ref[0],ref[1],ref[2]-ref[0],ref[3]-ref[1]])
   x=min([r[0]]+[b[0]-3 for b in allboxes]);y=min([r[1]]+[b[1]-3 for b in allboxes]);z=max([r[2]]+[b[0]+b[2]+3 for b in allboxes]);t=max([r[3]]+[b[1]+b[3]+3 for b in allboxes]);entry['box']=[round(x,2),round(y,2),round(z-x,2),round(t-y,2)]
   out[rid]=entry;audit.append({'id':rid,**entry})
(A/'activities-data.js').write_text('window.SPEAKOUT_ACTIVITY_DATA='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
Path('/tmp/asya-activity-data-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2))
print(dict(collections.Counter(e['type']for e in out.values())))
for rid,e in out.items():
 if e['type']=='bank':print(rid,'BANK:',[o['label']for o in e['bank']])
 else:print(rid,'MATCH:',sum(not n['box']for n in e['left']+e['right']),'unplaced')
