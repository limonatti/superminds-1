from pathlib import Path
import json,re
root=Path(__file__).resolve().parent
src=(root/'build.py').read_text();exec(src[:src.index('# Preserve the printed')])
base=json.loads((root/'backups/course-units-1-3.js').read_text()[14:-1])
verbs=r'(?:Work|Complete|Read|Write|Listen|Learn|Look|Match|Choose|Find|Put|Underline|Watch|Say|Tell|Ask|Talk|Think|Check|Practise|Practice|Cover|Make|Correct|Use|Answer|Draw|Go|Change|Take|Number|Circle|Tick|Do|Are|Is|How|What|Which|Have|Can|Does|Label|Add|Select|Read|Discuss|Repeat|Prepare|Choose|Swap|Write|Close|Plan|Roleplay|Imagine|Look|Before|Get|In|You|Your|Look|Recall|Look)\b'
# Instruction rows, not answer-item rows, determine exercise navigation.
def following(ws,w):
 return sorted([v for v in ws if v['x0']>=w['x1']-1 and abs(v['top']-w['top'])<6],key=lambda v:v['x0'])
def instruction(ws,w):
 vs=following(ws,w);t=' '.join(v['text'] for v in vs)
 return bool(re.search(verbs,t[:130]))
def extract(ws,previous=None):
 majors=[]
 for w in ws:
  t=w['text']; t='5A' if t=='SA' else t
  if not re.fullmatch(r'\d{1,2}[A-H]?',t) or not 38<w['top']<805 or w['size']>16:continue
  if (w['size']>=11 or (len(t)>1 and t[-1].isalpha())) and instruction(ws,w):
   ww=dict(w);ww['label']=t;majors.append(ww)
 # Main headings mis-OCR'd with an ordinary text font remain at the instruction margin.
 for w in ws:
  if not re.fullmatch(r'\d{1,2}[A-H]?',w['text']) or not 38<w['top']<805 or w['size']>16 or w in majors:continue
  if any(abs(w['x0']-m['x0'])<2 for m in majors) and instruction(ws,w) and w['size']>=8:
   if not any(abs(w['x0']-m['x0'])<1 and abs(w['top']-m['top'])<1 for m in majors):majors.append(dict(w,label=w['text']))
 # Use actual column margins, including the narrow third-column layouts.
 margins=[]
 for m in sorted(majors,key=lambda w:w['x0']):
  if not any(abs(m['x0']-x)<7 for x in margins):margins.append(m['x0'])
 events=[]
 for m in majors:events.append(dict(m,kind='main',margin=min(margins,key=lambda x:abs(x-m['x0']))))
 for w in ws:
  if not re.fullmatch('[A-H]',w['text']) or not 38<w['top']<805 or not 7<=w['size']<=11 or not instruction(ws,w):continue
  ms=[x for x in margins if abs(w['x0']-x-9.4)<4]
  if ms:events.append(dict(w,kind='sub',margin=ms[0]))
 out=[];carry=previous
 for margin in sorted(margins):
  current=carry
  for w in sorted([w for w in events if w['margin']==margin],key=lambda w:(w['top'],w['x0'])):
   if w['kind']=='main':
    current=re.match(r'\d+',w['label'])[0]; label=w['label']
    # A separate A on the same line belongs to this number.
    if label.isdigit() and any(v['kind']=='sub' and v['text']=='A' and v['margin']==margin and abs(v['top']-w['top'])<7 for v in events):continue
   else:
    if current is None:continue
    label=current+w['text']
   if any(e['label']==label for e in out):continue
   out.append({'label':label,'px':margin,'py':w['top'],'text':''})
  carry=current
 out.sort(key=lambda e:(int(re.match(r'\d+',e['label'])[0]),e['label']))
 return out,carry
inventory={};wordcache={}
for book in ['sb','wb']:
 wordcache[book]=json.loads((root/'extracted'/f'{book}-words.json').read_text());inventory[book]={};last=None;lastlesson=None
 for pn in range(37 if book=='sb' else 24,87 if book=='sb' else 68):
  lesson=lesson_for(book,pn)
  if lesson!=lastlesson:last=None
  ws=wordcache[book][str(pn)];es,last=extract(ws,last)
  if lesson.endswith('Intro'):es=[{'label':'1','px':None,'py':None,'text':''},{'label':'2','px':None,'py':None,'text':''}]
  inventory[book][pn]=es;lastlesson=lesson
# Correct the OCR inventory against the supplied printed pages.
overrides={
'sb':{39:'4AB 5AB 6ABC 7 8AB',43:'3ABC 4AB 5AB 6ABC',45:'3AB 4ABC 5 6ABCD',49:'3ABCD 4ABCD 5ABCD 6AB 7ABC',56:'1ABC 2ABC 3ABC 4AB 5AB 6AB',69:'2ABCD 3ABC 4ABC 5ABC 6AB',79:'2ABCD 3AB 4ABCD 5ABCD'},
'wb':{24:'1ABCD 2AB 3AB 4ABC',30:'1 2 3 4 5 6 7',33:'4ABC 5AB 6',37:'1ABC 2ABCD',39:'3AB 4ABCDE',40:'1AB 2ABCD 3AB',43:'1ABC 2AB',45:'8AB 9 10 11AB',46:'1ABC 2ABCD 3',54:'1ABC 2 3ABC',57:'1ABC 2ABCD',60:'1 2 3 4 5 6',62:'1 2 3 4 5 6',63:'7 8 9 10 11 12 13AB 14',66:'1 2 3 4 5 6 7 8 9',67:'10 11 12 13 14AB 15'}}
def expand(s):
 out=[]
 for token in s.split():
  n,letters=re.fullmatch(r'(\d+)([A-H]*)',token).groups()
  out.extend([n+c for c in letters] if letters else [n])
 return out
for book,ps in overrides.items():
 for pn,spec in ps.items():
  old={e['label']:e for e in inventory[book][pn]}
  inventory[book][pn]=[old.get(label,{'label':label,'px':None,'py':None,'text':''}) for label in expand(spec)]
# Full-page context keeps tables, photos and cross-column instructions intact.
# The exercise navigation is independent of the visual crop.
for book,ps in inventory.items():
 pages={p['page']:p for p in base['books'][book]['pages']}
 for pn,es in ps.items():
  ws=wordcache[book][str(pn)]
  for e in es:
   x,y=e.pop('px'),e.pop('py')
   e.update(x=round(x/595*100,2) if x is not None else None,y=round(y/842*100,2) if y is not None else None,box=[0,0,100,100],fullPage=True)
  pages[pn]={'page':pn,'pdfPage':pn+2,'image':f'assets/{book}-{pn}.webp','lesson':lesson_for(book,pn),'exercises':es,'text':' '.join(w['text'] for w in ws)}
 # Restore all reference pages without guessing exercise numbers in banks.
 for pn in range(6 if book=='sb' else 3,176 if book=='sb' else 94):
  if pn not in pages:
   pages[pn]={'page':pn,'pdfPage':pn+2,'image':f'assets/{book}-{pn}.webp','lesson':lesson_for(book,pn),'exercises':[],'text':''}
 base['books'][book]['pages']=sorted(pages.values(),key=lambda p:p['page'])
base['units'][3]='Every day'
base['titles'][3]=['Time for lunch!','A day in the life','Can I have … ?','Earth From Space']
for k,v in list(base['keys'].items()):
 if k.startswith('wb|REVIEW '):base['keys'][k.replace('|REVIEW ','|Review ')]=v
# Reference sections use page-level annotation, not unreliable OCR exercise IDs.
for book in ['sb','wb']:
 for page in base['books'][book]['pages']:
  if page['page'] >= (88 if book=='sb' else 68):page['exercises']=[]
base['scope']='Units 1–8'
if __name__=='__main__':
 (root/'assets/course.js').write_text('window.COURSE='+json.dumps(base,ensure_ascii=False,separators=(',',':'))+';')
 print({b:len(v['pages']) for b,v in base['books'].items()})
 print('Exercise steps:',sum(len(p['exercises']) for b in base['books'].values() for p in b['pages']))
