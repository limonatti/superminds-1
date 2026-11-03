"""Locate the full printed test exercises using their original PDF rubrics."""
from pathlib import Path
import json,re,unicodedata
import pypdfium2 as pdfium
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]/'speakout-b1plus-active-teach'
def read(p):return json.JSONDecoder().raw_decode(p.read_text().split('=',1)[1].lstrip())[0]
def compact(s):return ''.join(c for c in unicodedata.normalize('NFKC',s).lower() if c.isalnum())
items={i['id']:i for i in read(ROOT/'assets/materials-data.js')['items']};data=read(ROOT/'assets/material-interactions.js')['materials'];out={};issues=[]
for id,model in data.items():
 item=items[id];doc=pdfium.PdfDocument(ROOT/item['path']);pages=[]
 for page in doc:
  tp=page.get_textpage();raw=tp.get_text_range();flat='';indices=[]
  for i,c in enumerate(raw):
   c=compact(c);flat+=c;indices.extend([i]*len(c))
  pages.append((page,tp,flat,indices))
 starts={};cursors={}
 for s in model['sections']:
  pi=s['sourcePage']-1;p,tp,flat,indices=pages[pi];needle=compact((s['n']+' ' if s.get('numbered') else '')+s['instruction']);offset=cursors.get(pi,0);pos=-1
  for length in [min(80,len(needle)),min(50,len(needle)),min(32,len(needle))]:
   pos=flat.find(needle[:length],offset)
   if pos>=0:break
  if pos<0:
   issues.append([id,s['id'],'rubric not located']);continue
  cursors[pi]=pos+length
  boxes=[tp.get_charbox(indices[j]) for j in range(pos,min(pos+length,len(indices)))];pw,ph=p.get_size()
  x=min(b[0] for b in boxes)/pw;y=1-max(b[3] for b in boxes)/ph
  starts[s['id']]={'page':pi,'x':max(.02,x-.008),'y':max(.015,y-.008)}
 for si,s in enumerate(model['sections']):
  if s['id'] not in starts:continue
  start=starts[s['id']];pi=start['page'];sources=[]
  # First section of the next page ends this task at that point, not at a
  # fixed thumbnail height. Multi-page quizzes retain every printed question.
  next_start=next((starts[n['id']] for n in model['sections'][si+1:] if n['id'] in starts),None)
  endpage=next_start['page'] if next_start else item['pageCount']-1
  for pn in range(pi,endpage+1):
   anchors=[v for v in starts.values() if v['page']==pn]
   two=any(v['x']>.45 for v in anchors) and any(v['x']<.35 for v in anchors)
   columns=[(.035,.505),(.515,.965)] if two else [(.035,.965)]
   for left,right in columns:
    col=0 if left<.4 else 1;startcol=0 if start['x']<.45 else 1;nextcol=0 if not next_start or next_start['x']<.45 else 1
    if pn==pi and two and col<startcol:continue
    if next_start and pn==endpage and two and col>nextcol:continue
    top=start['y'] if pn==pi and (not two or col==startcol) else .05
    bottom=next_start['y']-.005 if next_start and pn==endpage and (not two or col==nextcol) else .955
    if bottom<=top+.005 or ((pn!=pi or two and col!=startcol) and bottom<.2):continue
    image=item['images'][pn]
    with Image.open(ROOT/image) as im:size=list(im.size)
    sources.append({'image':image,'size':size,'box':[round(left,5),round(top,5),round(right-left,5),round(bottom-top,5)],'page':pn+1})
  if not sources:issues.append([id,s['id'],'empty source'])
  else:out[id+':'+s['id']]={'label':(s['part']+' · ' if s['part'] else '')+s['n'],'sources':sources}
 # Follow-up reading questions retain the preceding passage in the same view.
 first_reading={}
 for section in model['sections']:
  if section['skill']!='Reading':continue
  key=id+':'+section['id']
  if key not in out:continue
  prior=first_reading.get(section['part'])
  if prior:
   for source in out[prior]['sources']:
    if not any(s['image']==source['image'] and s['box']==source['box'] for s in out[key]['sources']):out[key]['sources'].append({**source,'context':True})
  else:first_reading[section['part']]=key
 for page,tp,*_ in pages:tp.close();page.close()
 doc.close()
(ROOT/'assets/material-sources.js').write_text('window.MATERIAL_EXERCISE_SOURCES='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
(ROOT/'audit/material-sources.json').write_text(json.dumps({'exercises':len(out),'issues':issues},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'exercises':len(out),'issues':issues},ensure_ascii=False))
