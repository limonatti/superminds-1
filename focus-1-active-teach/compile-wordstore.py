from pathlib import Path
import json,re,hashlib
from source_parser import map_slots,word_completions
from PIL import Image
R=Path(__file__).parent;teacher=json.loads((R/'data/wordstore-spans.json').read_text())
def readjs(p):return json.loads(p.read_text().split('=',1)[1].strip().rstrip(';'))
def clean(t):return ' '.join(t.replace('ﬁ','fi').replace('ﬂ','fl').split())
D=readjs(R/'assets/course.js');sources=readjs(R/'assets/exercise-sources.js');D['pages']=[p for p in D['pages'] if p['book']!='ws'];groups={};source_data={}
for p in range(1,18):
 idx=275 if p==17 else 275+p;i=4 if p==17 else p+4;ws=json.loads((R/f'data/ocr/ws-{i}.jpg.json').read_text());unit=p//2 if p%2==0 else (p-1)//2
 ss=teacher[str(p)];source_data[str(p)]=ss
 anchors=[]
 for s in ss:
  t=s['text'].strip();group=re.match(r'WORD STORE (\d(?:[A-F]|\.[26]))',t);num=re.fullmatch(r'\d',t) and abs(s.get('size',0)-10)<.1 and 'Heavy' in s.get('font','')
  if not group and not num:continue
  label=group[1] if group else t;x=s['bbox'][0]/524.409;y=s['bbox'][1]/841.89
  cs=[w for w in ws if (re.search('WORD STORE '+re.escape(label),w['text']) if group else re.match(r'^'+label+r'(?:\s|$)',w['text'])) and abs(w['y']-y)<.04 and abs(w['x']-x)<.09]
  if cs:w=min(cs,key=lambda w:abs(w['y']-y)+abs(w['x']-x));x,y=w['x'],w['y']
  anchors.append({'label':label,'x':x,'y':y,'tb':s['bbox'],'group':bool(group)})
 anchors.sort(key=lambda a:(a['x']>.49,a['y']));exs=[];size=list(Image.open(R/f'assets/pages/ws-{i}.jpg').size)
 for ordinal,a in enumerate(anchors,1):
  side=a['x']>.49;other=[b for b in anchors if (b['x']>.49)==side and b['y']>a['y']+.01];end=min([b['y'] for b in other],default=.97);left=max(0,a['x']-.02);right=1 if side or p==1 else .505;box=[left,max(.0,a['y']-.004),right-left,end-a['y']-.004]
  tbEnd=min([b['tb'][1] for b in other],default=800);tbX=269 if side else 20;tbRight=525 if side or p==1 else 267
  region=[s for s in ss if tbX-3<s['bbox'][0]<tbRight and a['tb'][1]+12<s['bbox'][1]<tbEnd-1]
  region=word_completions(region)
  fields,slots,unresolved=map_slots(region,a['tb'][1])
  key='\n'.join(n+' '+v for n,v in fields.items())+('\n'+' · '.join(r['text'] for r in unresolved) if unresolved else '')
  spec=[] if unresolved else [{'label':n,'accepted':[v]} for n,v in sorted(fields.items(),key=lambda x:tuple(int(z) if z.isdigit() else z for z in re.split(r'(\d+)',x[0])))]
  exid=f'ws-{p}-{ordinal}';label=a['label'];txt='\n'.join(w['text'] for w in ws if left<=w['x']<right and a['y']<=w['y']<end)
  ex={'id':exid,'label':label,'x':a['x'],'y':a['y'],'box':box,'text':txt,'sourceSlots':slots,'_spans':region,'key':key,'keySource':{'book':'teacher','pdfPage':idx+1},'answerSpec':spec,'answerVersion':hashlib.sha256(json.dumps(spec).encode()).hexdigest()[:12],'marking':{'mode':'automatic' if spec else 'open'},'answers':[]}
  exs.append(ex);sources[exid]={'label':label,'sources':[{'image':f'assets/pages/ws-{i}.jpg','size':size,'page':p,'box':box}]}
  if a['group']:groups[label]=ex
 D['pages'].append({'id':f'ws-{p}','book':'ws','page':p,'pdfPage':i,'image':f'assets/pages/ws-{i}.jpg','unit':unit,'title':('Word Practice' if p%2==0 else 'Word Store')+f' {unit}','bank':'Word Store','exercises':exs,'tracks':[]})
# Tasks in the SB which explicitly ask the learner to fill Word Store must show that sheet.
for pg in D['pages']:
 if pg['book']!='sb':continue
 for e in pg['exercises']:
  instruction=clean(e.get('instructionText',''))
  m=re.search(r'WORD STORE (\d(?:[A-F]|\.[26]))',instruction,re.I)
  if not m or m[1] not in groups:continue
  target=groups[m[1]];sources[e['id']]['sources']+=sources[target['id']]['sources'];e['wordStore']=target['id']
  if not re.search(r'\bComplete\b',instruction,re.I):e.pop('wordStore');continue
  if target['answerSpec']:
   for k in ['answerSpec','answerVersion','key','keySource','marking']:e[k]=target[k]
(R/'data/wordstore-spans.json').write_text(json.dumps(source_data,ensure_ascii=False,separators=(',',':')))
(R/'assets/course.js').write_text('window.FOCUS = '+json.dumps(D,ensure_ascii=False,separators=(',',':'))+';\n');(R/'assets/exercise-sources.js').write_text('window.EXERCISE_SOURCES = '+json.dumps(sources,ensure_ascii=False,separators=(',',':'))+';\n')
audit={b:{'pages':sum(p['book']==b for p in D['pages']),'exercises':sum(len(p['exercises']) for p in D['pages'] if p['book']==b),'automatic':sum(bool(e['answerSpec']) for p in D['pages'] if p['book']==b for e in p['exercises'])} for b in ['sb','wb','ws']};(R/'audit/coverage.json').write_text(json.dumps(audit,indent=2));print(audit)
