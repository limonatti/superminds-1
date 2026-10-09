from pathlib import Path
import json,re,sys
# Load extraction helpers without running the build.
root=Path(__file__).resolve().parent
exec((root/'build.py').read_text().split('titles=')[0])
d=json.loads((root/'assets/course.js').read_text()[14:-1])
expected={
'sb':{6:'1ABCD 2ABCD 3ABC 4ABC',7:'1 2',8:'1ABC 2AB 3ABCD',9:'4 5ABC 6 7AB 8AB',10:'1AB 2AB 3',11:'4AB 5ABC 6AB 7 8',12:'1AB 2AB 3AB',13:'4ABC 5ABC 6 7ABCD',14:'1AB 2AB 3ABC 4AB',15:'5AB 6ABC 7ABCD',16:'1ABC 2AB 3AB 4AB 5AB 6AB 7AB',17:'1 2',18:'1ABCD 2ABC 3ABC 4AB',19:'5ABCDE 6AB 7',20:'1 2ABC 3 4ABCD',21:'5ABC 6AB 7AB 8AB 9ABC',22:'1AB 2ABCD',23:'3ABCD 4ABC 5AB 6',24:'1AB 2ABCD',25:'3AB 4ABCD 5 6AB',26:'1 2ABC 3ABC 4ABC 5AB 6AB',27:'1 2',28:'1ABC 2 3AB',29:'4ABC 5ABCD 6 7AB 8AB 9',30:'1ABCD 2AB',31:'3ABC 4ABC 5AB 6AB 7',32:'1ABC',33:'2ABC 3ABC 4AB 5ABCD 6',34:'1ABC 2ABC 3AB 4ABC',35:'5ABCD 6ABC',36:'1AB 2AB 3ABC 4ABC 5AB 6AB'},
'wb':{3:'1AB 2AB 3AB 4ABC',4:'1 2 3 4 5AB 6',5:'7ABCD 8AB 9',6:'1 2 3 4 5 6',7:'7AB 8ABC',8:'1ABC 2 3ABC 4ABC',9:'1AB 2 3 4ABC',10:'1ABC 2 3ABC 4ABCD',11:'5ABCD',12:'1 2AB 3AB 4AB 5A',13:'5BC 6ABC 7ABCD',14:'1AB 2ABC 3AB 4ABCD',15:'1ABCD 2ABC',16:'1 2 3 4 5 6 7AB',17:'8AB 9 10 11 12AB 13',18:'1ABC 2 3ABC',19:'4AB 5AB 6ABCD',20:'1ABCD 2AB',21:'2C 3AB 4ABCD',22:'1ABC 2ABC 3 4ABCD',23:'1ABCD 2ABC'}}
# Page 21 is image-only in the supplied Student's Book PDF: anchors transcribed from the original image.
manual21={'5A':(48,408),'5B':(48,588),'5C':(48,776),'6A':(292,85),'6B':(292,140),'7A':(292,180),'7B':(292,343),'8A':(292,377),'8B':(292,400),'9A':(292,494),'9B':(292,528),'9C':(292,592)}
def expand(s):
 out=[]
 for v in s.split():
  m=re.fullmatch(r'(\d+)([A-H]*)',v);out.extend([m[1]+c for c in m[2]] if m[2] else [m[1]])
 return out
for book in expected:
 path=find('Students_Book_www' if book=='sb' else 'Workbook_with_Keys_www')
 with pdfplumber.open(path) as pdf:
  for p in d['books'][book]['pages']:
   if p['page'] not in expected[book]:continue
   ws=words(pdf.pages[p['page']+1]);labels=expand(expected[book][p['page']]);anchors={}
   def score(w):return (('Bold' in w['fontname'])*10+min(w['size'],16),-w['x0'])
   # Major labels may be joined by the PDF OCR, e.g. 5A -> SA.
   majors={}
   for num in sorted(set(re.match(r'\d+',l)[0] for l in labels),key=int):
    forms=[num,num+'A',('S' if num=='5' else num)+'A']
    cs=[w for w in ws if w['text'] in forms and 38<w['top']<805 and w['size']<17 and (w['size']>10.5 or re.search('[A-H]',w['text'])) and w['x0']<565]
    if cs:
     cs.sort(key=score,reverse=True);m=cs[0];majors[num]=m
     if m['text'].endswith('A'):anchors[num+'A']=(m['x0'],m['top'])
     else:
      a=[w for w in ws if w['text']=='A' and abs(w['top']-m['top'])<7 and 4<w['x0']-m['x0']<20]
      anchors[num+'A' if num+'A' in labels else num]=(m['x0'],m['top'])
   for label in labels:
    if label in anchors:continue
    n=re.match(r'\d+',label)[0];suffix=label[len(n):]
    m=majors.get(n)
    if m and suffix:
     nx=min([v['top'] for k,v in majors.items() if k!=n and abs(v['x0']-m['x0'])<6 and v['top']>m['top']],default=804)
     cs=[w for w in ws if w['text']==suffix and 7<w['size']<12 and abs(w['x0']-m['x0']-9.4)<5 and m['top']-1<=w['top']<nx]
     if cs:anchors[label]=(m['x0'],min(cs,key=lambda w:w['top'])['top'])
    if label not in anchors:
     old=[e for e in p['exercises'] if e['label']==label]
     if len(old)==1 and old[0]['x'] is not None:anchors[label]=(old[0]['x']*5.95,old[0]['y']*8.42)
   if book=='sb' and p['page']==21:anchors=manual21
   new=[]
   for label in labels:
    if label in anchors:
     x,y=anchors[label];nexty=min([yy for l,(xx,yy) in anchors.items() if l!=label and abs(xx-x)<8 and yy>y+6],default=800)
     right=min([xx-12 for l,(xx,yy) in anchors.items() if xx>x+65],default=565)
     # Avoid narrow crops when an exercise continues below a section heading or graphic.
     right=291 if right==565 and x<150 else right
     w=max(120,right-x+5);h=max(25,nexty-y-2)
     box=[round((x-3)/595*100,3),round((y-3)/842*100,3),round(w/595*100,3),round(h/842*100,3)]
     region=[v for v in ws if x-2<=v['x0']<right and y-2<=v['top']<nexty-2]
     txt='\n'.join(line_text(row) for row in lines(region))
     new.append({'label':label,'x':round(x/595*100,2),'y':round(y/842*100,2),'box':box,'text':txt})
    else:
     # All tasks remain available even if the source PDF has no usable text layer.
     new.append({'label':label,'x':None,'y':None,'box':[0,0,100,100],'text':'Use the original page. Exercise '+label,'fullPage':True})
   p['exercises']=new
# Only well-formed answer rows qualify for automatic checking.
for k,v in d['keys'].items():
 if any(q['answer'] in ['–','-'] or 'is not in the photos' in q['answer'] for q in v['items']):v['items']=[]
 # Remove page footer accidentally appended to the last answer.
 for q in v['items']:q['answer']=re.sub(r'\s+www\.frenglish\.ru.*','',q['answer'])
# Exact, checked source keys for the opening lessons.
def put(book,lesson,label,vals,nums=None):
 key=f'{book}|{lesson}|{label}'; old=d['keys'].get(key,{})
 path=d['books']['wb']['path'] if book=='wb' else str(find('Students_Book_Keys_www').relative_to(root))
 d['keys'][key]={'raw':'','items':[{'n':str(n),'answer':a} for n,a in zip(nums or range(1,len(vals)+1),vals)],'pdf':path,'pdfPage':old.get('pdfPage',2 if book=='sb' else 80)}
put('sb','1A','3A',['I','are','I','Are','am','you','not',"’m"],range(2,10))
put('sb','1A','4',['Hi / Hey','Hi / Hey','Good morning','Good afternoon','Good evening','Bye / Goodbye / See you','Bye / Goodbye / See you','Bye / Goodbye / See you','Good night'],range(2,11))
put('sb','1B','1B',['A','–','D','C','B'])
put('sb','1B','6A',['c','b','a','b','c','a'])
# The key labels the audio-check step; the learner writes in the previous step.
for lesson,src,dst in [('1C','5B','5A'),('1C','7B','7A'),('2B','4B','4A'),('2C','2D','2C'),('3B','3B','3A'),('3C','3B','3A'),('1R','7B','7A'),('2R','6B','6A'),('3R','6B','6A')]:
 if f'sb|{lesson}|{src}' in d['keys']:d['keys'][f'sb|{lesson}|{dst}']=d['keys'][f'sb|{lesson}|{src}']
# Some workbook speaking tasks number only the first step in the answer key.
for lesson in ['1C','2C','3C']:
 k=f'wb|{lesson}|4'
 if k in d['keys']:d['keys'][k+'A']=d['keys'][k]
# Review 1–2 heading is normalized for navigation and key mapping.
for k in list(d['keys']):
 if k.startswith('wb|REVIEW 1'):
  d['keys'][k.replace('REVIEW 1–2','Review 1–2').replace('REVIEW 1–2','Review 1–2')]=d['keys'][k]
# Publish the urgent scope with verified exercise navigation. Full source books remain in Resources.
d['scope']='Units 1–3'
d['books']['sb']['pages']=[p for p in d['books']['sb']['pages'] if p['page']<=36 or 88<=p['page']<=103 or 124<=p['page']<=130 or 140<=p['page']<=153 or p['page']>=162]
d['books']['wb']['pages']=[p for p in d['books']['wb']['pages'] if p['page']<=23 or p['page']>=68]
(root/'assets/course.js').write_text('window.COURSE='+json.dumps(d,ensure_ascii=False,separators=(',',':'))+';')
print('FIRST3', {b:sum(len(p['exercises']) for p in d['books'][b]['pages'] if p['page'] in expected[b]) for b in expected})
for b in expected:
 for p in d['books'][b]['pages']:
  if p['page'] in expected[b]:
   missing=[e['label'] for e in p['exercises'] if e.get('fullPage')]
   if missing:print(b,p['page'],'fullpage fallback',missing)
