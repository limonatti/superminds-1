from pathlib import Path
import json,re,unicodedata,collections
import pdfplumber,pypdfium2 as pdfium
ROOT=Path(__file__).resolve().parent
SRC=ROOT/'source'
OUT=ROOT/'assets'; OUT.mkdir(exist_ok=True)

def find(s):return next(p for p in SRC.rglob('*.pdf') if s in p.name)
def fix(s):
 def cid(m):
  n=int(m[1]); return chr(n-123) if 188<=n<=213 else chr(n+16) if 32<=n<=41 else {159:'-',160:'–',303:'fi',307:'ft',302:'ff',304:'fl',217:'d',218:'e',219:'f',220:'g',221:'h'}.get(n,'')
 s=re.sub(r'\(cid:(\d+)\)',cid,s)
 return unicodedata.normalize('NFKC',s).replace('\\u2002',' ').replace('\\u2003',' ')
def words(p):
 ws=p.extract_words(extra_attrs=['fontname','size'],x_tolerance=1.5)
 for w in ws:w['text']=fix(w['text'])
 return [w for w in ws if w['text']]
def lines(ws):
 rows=[]
 for w in sorted(ws,key=lambda w:(round(w['top']/3)*3,w['x0'])):
  row=next((r for r in rows[-4:] if abs(r[0]['top']-w['top'])<3),None)
  if row is None:rows.append([w])
  else:row.append(w)
 return [sorted(r,key=lambda w:w['x0']) for r in rows]
def line_text(row):return ' '.join(w['text'] for w in row)

titles=[['Hello','Two jobs','Checking in','What’s your name?'],['Where are they?','Family and friends','Small talk','Best Home Cook'],['Favourites','What’s on your desk?','How much is it?','Shopping'],['Eat and drink','A day in the life','At a café','Family cooking'],['Good colleagues','Yes, I can!','Can you help me?','Birthday!'],['Lost','A great place to live','Where are you?','The Travel Show'],['The little things','Heroes','What’s wrong?','Focus on fitness'],['Weekend break','Going out, staying in','A ticket to … ?','Kodo drummers']]
unitnames=['Welcome!','People','Things','Everyday life','Action','Where?','Healthy lives','Time out']
wbstarts=[4,10,18,24,32,38,46,52]
def lesson_for(book,p):
 if book=='sb':
  if p<7:return 'Lead-in'
  if p<=86:
   u=min(8,(p-7)//10+1); offset=(p-7)%10
   return f'{u}'+('Intro' if offset==0 else 'ABCD'[(offset-1)//2] if offset<9 else 'R')
  if p<92:return 'Writing Bank'
  if p<124:return f'{(p-92)//4+1}'+'ABCD'[(p-92)%4]+' Grammar'
  if p<140:return 'Vocabulary Bank'
  if p<151:return 'Communication Bank'
  if p<160:return 'Sounds & spelling'
  if p<162:return 'Revision game'
  if p<172:return 'Audioscripts'
  if p<175:return 'Videoscripts'
  return 'Verb table'
 if p==3:return 'Lead-in'
 for u,s in enumerate(wbstarts,1):
  if s<=p<s+6:return f'{u}'+('A' if p-s<2 else 'B' if p-s<4 else 'C' if p-s==4 else 'D')
 if p in [16,17,30,31,44,45,58,59]:return f'Review { {16:"1–2",17:"1–2",30:"3–4",31:"3–4",44:"5–6",45:"5–6",58:"7–8",59:"7–8"}[p]}'
 if p<68:return 'Cumulative review'
 if p<78:return 'Audioscripts'
 return 'Answer key'

# Preserve the printed page as the authoritative visual, with interactive exercise anchors.
data={'books':{},'keys':{},'media':[],'resources':[],'units':unitnames,'titles':titles}
for book,needle,start,end in [('sb','Students_Book_www',6,175),('wb','Workbook_with_Keys_www',3,93)]:
 path=find(needle); doc=pdfium.PdfDocument(str(path)); entries=[]
 with pdfplumber.open(path) as pdf:
  for pnum in range(start,end+1):
   idx=pnum+1; page=pdf.pages[idx]; ws=words(page)
   dest=OUT/f'{book}-{pnum}.webp'
   if not dest.exists():
    bitmap=doc[idx].render(scale=2); im=bitmap.to_pil(); im.save(dest,'WEBP',quality=86); bitmap.close()
   majors=[]
   for side in [0,1]:
    candidates=[w for w in ws if (w['x0']>=295)==bool(side) and 38<w['top']<801 and w['size']<=16 and re.fullmatch(r'\d{1,2}[A-H]?',w['text']) and ((25<w['x0']<61) if not side else (295<w['x0']<331))]
    strong=[w for w in candidates if re.search('[A-H]',w['text']) or w['size']>=10.5]
    anchors=[w['x0'] for w in strong]
    majors.extend(w for w in candidates if w in strong or any(abs(w['x0']-x)<1.7 for x in anchors))
   ex=[]; carry=None
   for side in [0,1]:
    ms=sorted([w for w in majors if (w['x0']>=295)==bool(side)],key=lambda w:w['top'])
    if not ms:continue
    for j,m in enumerate(ms):
     n=re.match(r'\d+',m['text'])[0]; suffix=m['text'][len(n):]
     nexttop=ms[j+1]['top'] if j+1<len(ms) else 803
     letters=sorted([w for w in ws if re.fullmatch('[A-H]',w['text']) and 7<=w['size']<=11 and abs(w['x0']-m['x0']-9.4)<4 and m['top']-1<=w['top']<nexttop],key=lambda w:w['top'])
     starts=letters if not suffix and letters and letters[0]['top']-m['top']<8 else [m]+letters
     for k,a in enumerate(starts):
      label=n+(a['text'] if a is not m else suffix)
      top=m['top'] if k==0 else a['top']
      endtop=starts[k+1]['top']-3 if k+1<len(starts) else nexttop-3
      bound=page.width-28 if side else 291
      region=[w for w in ws if m['x0']-1<=w['x0']<bound and top-1<=w['top']<endtop]
      text='\n'.join(line_text(r) for r in lines(region))
      ex.append({'label':label,'x':round(m['x0']/page.width*100,2),'y':round(top/page.height*100,2),'box':[round(max(0,m['x0']-4)/page.width*100,3),round(max(0,top-4)/page.height*100,3),round((bound-m['x0']+4)/page.width*100,3),round((endtop-top+8)/page.height*100,3)],'text':text})
    # A task can continue at the top of the next column.
    if side==0 and ex:
     carry=ex[-1]['label']; firstRight=min([w['top'] for w in majors if w['x0']>=295],default=803)
     topLetters=sorted([w for w in ws if re.fullmatch('[B-H]',w['text']) and 7<=w['size']<=11 and 304<w['x0']<329 and 45<w['top']<firstRight-3],key=lambda w:w['top'])
     for z,w in enumerate(topLetters):
      n=re.match(r'\d+',carry)[0]; endtop=topLetters[z+1]['top']-3 if z+1<len(topLetters) else firstRight-3
      text='\n'.join(line_text(r) for r in lines([v for v in ws if v['x0']>=w['x0'] and w['top']-1<=v['top']<endtop]))
      ex.append({'label':n+w['text'],'x':round((w['x0']-9)/page.width*100,2),'y':round(w['top']/page.height*100,2),'box':[round((w['x0']-13)/page.width*100,3),round((w['top']-4)/page.height*100,3),round((page.width-28-w['x0']+13)/page.width*100,3),round((endtop-w['top']+8)/page.height*100,3)],'text':text})
   ex.sort(key=lambda e:(int(re.match(r'\d+',e['label'])[0]),e['label']))
   entries.append({'page':pnum,'pdfPage':idx+1,'image':str(dest.relative_to(ROOT)),'lesson':lesson_for(book,pnum),'exercises':ex,'text':' '.join(w['text'] for w in ws if w['top']<805)})
   if pnum%20==0:print(book,pnum,'rendered',flush=True)
 data['books'][book]={'path':str(path.relative_to(ROOT)),'pages':entries}

# Extract keys in column reading order; leave complex/non-unique answers for teacher comparison.
for book,path,first,last in [('sb',find('Students_Book_Keys_www'),0,36),('wb',find('Workbook_with_Keys_www'),79,95)]:
 groups=[]; active=None; lesson='Lead-in'; scope='main'
 with pdfplumber.open(path) as pdf:
  for ix in range(first,min(last,len(pdf.pages))):
   ws=words(pdf.pages[ix])
   for side in [0,1]:
    col=[w for w in ws if (w['x0']>=297)==bool(side) and 40<w['top']<807]
    for row in lines(col):
     t=line_text(row).strip(); head=row[0]; x=head['x0']; bold='Bold' in head['fontname']
     match=re.match(r'(?:Lesson )?([1-8][A-D])\s*(.*)',t)
     if match and ((book=='wb' and t.startswith('Lesson')) or (book=='sb' and head['size']>=10)):
      lesson=match[1];scope='main';active=None;continue
     if 'Lead-in' in t or t=='LEAD-IN':lesson='Lead-in';scope='main';active=None;continue
     if re.match(r'(UNIT \d+ REVIEW|Unit \d+ review|REVIEW [1-8])',t,re.I):
      lesson=re.sub(r'^UNIT\s+(\d+)\s+REVIEW.*',r'\1R',t,flags=re.I);scope='main';active=None;continue
     if re.search(r'(Grammar bank|Vocabulary bank|Writing bank|Sounds and spelling)',t,re.I):scope=t;active=None;continue
     if book=='sb' and bold and head['size']>=10 and not re.fullmatch(r'\d+[A-Z]?',t):scope='main';active=None;continue
     if t in ['ANSWER KEY','A1','Answer key'] or 'frenglish' in t or 'Pearson' in t:continue
     if book=='wb':
      basex=35.4 if not side else 303 # real offset is determined by exercise rows below
      isstart=bool(re.fullmatch(r'\d{1,2}[A-H]?',head['text']) and bold and ((not side and x<48) or (side and 297<x<318)))
     else:isstart=bool(len(row)==1 and bold and re.fullmatch(r'\d{1,2}[A-H]?',t))
     if isstart:
      active={'lesson':lesson,'scope':scope,'label':head['text'],'words':[],'pdfPage':ix+1};groups.append(active)
      active['words'].extend(row[1:]);continue
     if active:
      if book=='wb' and bold and (head['text'].isupper() and len(head['text'])>2):active=None
      else:active['words'].extend(row)
 for g in groups:
  raw=' '.join(w['text'] for w in g['words']);g['raw']=raw
  items=[];current=None;prefix=[]
  for w in g['words']:
   if 'Bold' in w['fontname'] and re.fullmatch(r'\d{1,2}|[A-Ja-j]',w['text']):
    current={'n':w['text'],'answer':''};items.append(current)
   elif current:current['answer']+=(' ' if current['answer'] else '')+w['text']
   else:prefix.append(w['text'])
  valid=bool(items and len({q['n'] for q in items})==len(items) and not prefix)
  for q in items:
   a=q['answer'].strip()
   if not a or len(a)>200 or re.search(r'(Sample answer|Possible answer|answers vary|Vocabulary|Grammar|Pronunciation|www\.)',a,re.I):valid=False
   q['answer']=a
  key=f"{book}|{g['lesson']}|{g['label']}"
  if (g['scope']=='main' or (g['scope'].lower().startswith('grammar bank') and re.fullmatch(r'[3-9][A-H]',g['label']))) and key not in data['keys']:
   data['keys'][key]={'raw':raw,'items':items if valid else [],'pdf':str(path.relative_to(ROOT)),'pdfPage':g['pdfPage']}
 # save full extraction for audit
 (ROOT/'extracted'/f'{book}-parsed-keys.json').write_text(json.dumps([{k:v for k,v in g.items() if k!='words'} for g in groups],ensure_ascii=False,indent=2))

# Known editorial aliases: the published key lists listening-check step instead of the written step.
for lesson,source,target in [('1A','3B','3A')]:
 k=f'sb|{lesson}|{source}'
 if k in data['keys']:data['keys'][f'sb|{lesson}|{target}']=data['keys'][k]
for path in sorted(SRC.rglob('*')):
 if path.suffix.lower() in ['.mp3','.mp4','.m4v','.wav']:
  name=path.stem; book='wb' if '_WB_' in name or 'Workbook' in str(path) else 'sb'
  lesson=re.search(r'_(\d[ABCDR])_',name)
  videoUnit=re.search(r' U([1-8]) ',name)
  videoLesson=videoUnit[1]+('Intro' if 'Vlogs' in name else 'D') if videoUnit else ''
  track=re.search(r'Audio_([\w_]+)',name)
  data['media'].append({'path':str(path.relative_to(ROOT)),'name':name,'book':book,'lesson':lesson[1] if lesson else videoLesson, 'track':track[1].replace('_','.') if track else '', 'type':'video' if path.suffix.lower() in ['.mp4','.m4v'] else 'audio'})
 elif path.suffix.lower()=='.pdf':
  data['resources'].append({'path':str(path.relative_to(ROOT)),'name':path.stem.replace('_www.frenglish.ru','').replace('_',' ')})
(OUT/'course.js').write_text('window.COURSE='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';')
print('DONE', {b:sum(len(p['exercises']) for p in d['pages']) for b,d in data['books'].items()},'keys',len(data['keys']),'auto',sum(bool(k['items']) for k in data['keys'].values()),'media',len(data['media']),flush=True)
