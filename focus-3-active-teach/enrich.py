"""Source-evidence enrichment for Focus 3. Never generate choices from answer keys."""
import re,json,hashlib
from pathlib import Path
from PIL import Image
R=Path(__file__).resolve().parent

def clean(s):return ' '.join(str(s).replace('ﬁ','fi').replace('ﬂ','fl').split())
def version(e):e['answerVersion']=hashlib.sha256(json.dumps({'fields':e['answerSpec'],'mode':e.get('responseMode')},sort_keys=True).encode()).hexdigest()[:12]
def enrich(pages,sources,gaps,texts,key_spec):
 evidence=json.loads((R/'data/teacher-evidence.json').read_text())
 audit={'circleKeys':[],'marginKeys':[],'reviewNeeded':[]}
 for pg in pages:
  for e in pg['exercises']:
   reg=e.get('teacherRegion');instruction=clean(e['text'][:380]);label=e['label'];new=None
   if reg:
    number=reg['pdfPage'];page=texts['tb'][str(number)];w,h=page['width'],page['height'];x,y,rw,rh=reg['box'];right=x+rw;bottom=y+rh
    spans=[dict(s,x=s['bbox'][0]/w,y=s['bbox'][1]/h,w=(s['bbox'][2]-s['bbox'][0])/w,h=(s['bbox'][3]-s['bbox'][1])/h)for s in page['spans']]
    inside=lambda q:x-.006<=q['x']<right+.004 and y+.005<q['y']<bottom-.004
    nums=[]
    for s in spans:
     m=re.match(r'^(\d{1,2}[a-z]?)(?:\s|$)',clean(s['text']))
     if m and inside(s) and 'Heavy'in s['font'] and s['color']!=0xda2128:nums.append(dict(s,label=m[1]))
    if not e['answerSpec'] and re.search(r'complete|correct form|match|true.*false',instruction,re.I) and not re.search(r'own|yourself|SPEAKING',instruction):
     reds=[s for s in spans if inside(s) and s['color']==0xda2128 and clean(s['text'])]
     fields={};unresolved=False
     for red in sorted(reds,key=lambda s:(round(s['y']/.003),s['x'])):
      candidates=[n for n in nums if n['x']<red['x']+.004 and -.006<red['y']-n['y']<.065]
      if not candidates:unresolved=True;break
      n=min(candidates,key=lambda n:abs(red['y']-n['y'])*45+red['x']-n['x'])
      if n['label']=='0':continue
      fields.setdefault(n['label'],[]).append(clean(red['text']))
     if fields and not unresolved:
      joined={k:' '.join(v)for k,v in fields.items()};new=key_spec(joined)
      if new:e['key']='\n'.join(k+' '+v for k,v in joined.items());audit.setdefault('wrappedKeys',[]).append(e['id'])
    circ=[c for c in evidence.get(str(number),{}).get('circles',[])if inside({'x':c['box'][0],'y':c['box'][1]})]
    if circ and re.search(r'choose|correct option|correct form|circle',instruction,re.I):
     fields={};ambiguous=False
     for c in sorted(circ,key=lambda c:(round(c['box'][1]/.004),c['box'][0])):
      cx,cy,cw,ch=c['box'];matches=[n for n in nums if n['x']<cx+cw/2 and -.008<cy-n['y']<.13]
      if not matches:ambiguous=True;continue
      n=min(matches,key=lambda n:abs(cy-n['y'])*50+cx-n['x'])
      if n['label']=='0':continue
      if n['label'] in fields:ambiguous=True
      fields[n['label']]=clean(c['text'])
     if fields and not ambiguous and all(len(v)<160 for v in fields.values()):
      new=key_spec(fields);audit['circleKeys'].append(e['id']);e['key']='\n'.join(k+' '+v for k,v in fields.items());e['keySource']={'book':'teacher','pdfPage':number,'evidence':'red circles'}
    margin=evidence.get(str(number),{}).get('margins',{}).get(label) if pg['book']=='sb' else None
    if margin and not e['key']:
     e['key']=margin;e['keySource']={'book':'teacher','pdfPage':number,'evidence':'margin panel'}
     fields={};current=None;ambiguous=False
     for line in margin.splitlines():
      m=re.match(r'^(\d{1,2}[a-z]?)\s+(.+)',line)
      if m:
       current=m[1]
       if current in fields:ambiguous=True
       fields[current]=m[2]
      elif current:fields[current]+=' '+line
      elif line:ambiguous=True
     # Closed gaps and transformations have finite keys; open comprehension remains teacher-reviewed.
     if fields and not ambiguous and re.search(r'complete|correct form|put.*order|match',instruction,re.I):new=key_spec(fields);audit['marginKeys'].append(e['id'])
   if new:e['answerSpec']=new;e['marking']['mode']='automatic';gaps.pop(e['id'],None)
   # Fix exercise types whose raw key includes explanations or multiple acceptable categories.
   if re.search(r'find and correct|correct the mistakes',instruction,re.I) and any(len(f['accepted'][0].split())>8 for f in e['answerSpec']):
    e['answerSpec']=[];e['marking']['mode']='open';audit['reviewNeeded'].append(e['id'])
   if any(re.search(r'Extra word:|Emma:|Meg:|Ryan:',f['accepted'][0])for f in e['answerSpec']):
    e['answerSpec']=[];e['marking']['mode']='open';audit['reviewNeeded'].append(e['id'])
   # First letters are printed in the book; accept both the complete word and the missing suffix.
   if reg and re.search(r'first letter',instruction,re.I):
    for f in e['answerSpec']:
     boxes=gaps.get(e['id'],{}).get(f['label'],{}).get('box')
     if not boxes:continue
     sx,sy=reg['scale'];ox,oy=reg['offset'];fx=boxes[0]*sx+ox;fy=boxes[1]*sy+oy
     prefixes=[s for s in spans if s['color']!=0xda2128 and re.fullmatch(r'[A-Za-z]',s['text'].strip()) and -.003<fx-(s['x']+s['w'])<.012 and abs(fy-s['y'])<.007]
     if len(prefixes)==1:
      prefix=prefixes[0]['text'].strip();f['accepted']=list(dict.fromkeys([prefix+v for v in f['accepted']]+f['accepted']))
   # Finite answer fields get explicit choices only from the printed task.
   spec=e['answerSpec'];letters=re.search(r'(?:answers?|options?|headings?|sentences?|descriptions?|texts?|endings?|words?|pictures?|beginnings?)\s*[,:(]?\s*([A-Ja-j])\s*[-–—]\s*([A-Ja-j])',instruction,re.I)
   explicit=re.search(r'\bA\s*,\s*B(?:\s*,?\s*(?:or\s*)?C)?(?:\s*,?\s*(?:or\s*)?D)?\b',instruction)
   options=None
   if letters:
    a=letters[1].upper();z=letters[2].upper()
    if a<z:options=[chr(c)for c in range(ord(a),ord(z)+1)]
   if explicit:options=re.findall(r'\b[A-D]\b',explicit[0])
   if spec and options and all(all(v.upper() in options for v in f['accepted'])for f in spec):
    e['interaction']={'type':'choices','rows':[{'prompt':'Пункт '+f['label'],'options':[{'label':v,'value':v}for v in options]}for f in spec]};e['nativeInteraction']=True
   elif spec and re.search(r'true.*false|\(T\).*\(F\)',instruction,re.I) and all(all(v.upper()in ['T','F','TRUE','FALSE']for v in f['accepted'])for f in spec):
    e['interaction']={'type':'choices','rows':[{'prompt':'Пункт '+f['label'],'options':[{'label':'True','value':'T'},{'label':'False','value':'F'}]}for f in spec]};e['nativeInteraction']=True
   # Italic alternatives are taken from the student's PDF, in their printed order.
   if pg['book']=='sb' and spec and e.get('keySource',{}).get('evidence')=='red circles':
    source=texts['sb'][str(pg['pdfPage'])];sw,sh=source['width'],source['height'];bx,by,bw,bh=e['box']
    ss=[s for s in source['spans'] if bx-.003<=s['bbox'][0]/sw<bx+bw and by<=s['bbox'][1]/sh<by+bh]
    numbered=[s for s in ss if 'Heavy'in s['font'] and re.fullmatch(r'\d{1,2}',clean(s['text'])) and s['bbox'][1]/sh>by+.012]
    rows=[]
    for f in spec:
     starts=[s for s in numbered if clean(s['text'])==f['label']]
     if len(starts)!=1:break
     start=starts[0];top=start['bbox'][1];end=min([s['bbox'][1] for s in numbered if s['bbox'][1]>top+3],default=(by+bh)*sh)
     tokens=sorted([s for s in ss if top-2<=s['bbox'][1]<end-2 and ('Oblique'in s['font'] or clean(s['text'])=='/')],key=lambda s:(round(s['bbox'][1]/3),s['bbox'][0]))
     values=[clean(v)for v in ' '.join(s['text']for s in tokens).split('/')]
     if not 2<=len(values)<=4 or any(not v or len(v)>100 for v in values):break
     norm=lambda s:clean(s).lower().replace('’',"'")
     matched=[v for v in values if any(norm(v)==norm(a) for a in f['accepted'])]
     # Some circles exclude a printed subject; require a unique suffix match.
     if not matched:matched=[v for v in values if any(norm(v).endswith(norm(a)) for a in f['accepted'])]
     if len(matched)!=1:break
     f['accepted']=list(dict.fromkeys(f['accepted']+matched))
     rows.append({'prompt':'Пункт '+f['label'],'options':[{'label':v,'value':v}for v in values]})
    if len(rows)==len(spec):e['interaction']={'type':'choices','rows':rows};e['nativeInteraction']=True
   if not spec and (re.search(r'^\d+\s+SPEAKING\b|^\d+\s+(?:In pairs|Discuss|Talk about)',instruction,re.I) or pg['book']=='wb' and pg['unit']!='extra' and (pg['page']-4)%14==11):
    e['responseMode']='oral';e['marking']['instruction']='Обсуди задание с преподавателем или партнёром. После выполнения поставь отметку.'
   version(e)
 # Every reading/writing task has its adjacent printed page available for full context.
 lookup={(p['book'],p['page']):p for p in pages}
 for pg in pages:
  for e in pg['exercises']:
   if pg['book']=='wb' and 4<=pg['page']<116 and (pg['page']-4)%14 in [4,5,8,9]:
    other=pg['page']+1 if (pg['page']-4)%14%2==0 else pg['page']-1;peer=lookup.get(('wb',other))
    if peer and not any(s['image']==peer['image']for s in sources[e['id']]['sources']):sources[e['id']]['sources'].append({'image':peer['image'],'page':other,'size':list(Image.open(R/peer['image']).size),'box':[.01,.01,.98,.97],'context':True})
 (R/'audit/answer-evidence.json').write_text(json.dumps(audit,indent=2))
