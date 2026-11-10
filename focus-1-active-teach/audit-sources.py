"""Expand source viewports to whole OCR lines. A border must never cut text.
All source rectangles are audited, including linked Word Store exercises.
The complete scanned page remains available separately in the player.
"""
from pathlib import Path
import json
R=Path(__file__).parent
read=lambda name:json.loads((R/name).read_text().split('=',1)[1].strip().rstrip(';'))
D=read('assets/course.js');S=read('assets/exercise-sources.js');cache={};changes=[];TEXT=json.loads((R/'data/source-text-bounds.json').read_text())
for id,model in S.items():
 for src in model['sources']:
  if src['box']==[0,0,1,1]:continue
  image=Path(src['image']).name
  if image not in cache:cache[image]=[dict(zip(['x','y','w','h'],q)) for q in TEXT[image]] if image in TEXT else json.loads((R/'data/ocr'/f'{image}.json').read_text())
  lines=cache[image];x,y,w,h=src['box'];bounds=[x,y,x+w,y+h];original=bounds[:]
  for _ in range(30):
   before=bounds[:]
   for q in lines:
    x0,y0,x1,y1=q['x'],q['y'],q['x']+q['w'],q['y']+q['h']
    if min(bounds[2],x1)-max(bounds[0],x0)<.001 or min(bounds[3],y1)-max(bounds[1],y0)<.001:continue
    if x0<bounds[0]:bounds[0]=max(0,x0-.004)
    if y0<bounds[1]:bounds[1]=max(0,y0-.004)
    if x1>bounds[2]:bounds[2]=min(1,x1+.004)
    if y1>bounds[3]:bounds[3]=min(1,y1+.004)
   if bounds==before:break
  if bounds!=original:changes.append({'exercise':id,'image':image,'before':src['box'],'after':[bounds[0],bounds[1],bounds[2]-bounds[0],bounds[3]-bounds[1]]})
  src['box']=[bounds[0],bounds[1],bounds[2]-bounds[0],bounds[3]-bounds[1]]
for p in D['pages']:
 for e in p['exercises']:e['box']=S[e['id']]['sources'][0]['box']
# Old homework links remain resolvable; new assignments list only actual printed exercises.
E={e['id']:(p,e) for p in D['pages'] for e in p['exercises']};aliases=json.loads((R/'data/legacy-aliases.json').read_text());D['legacyExercises']=[]
for old,target in aliases.items():
 p,e=E[target];D['legacyExercises'].append({**e,'id':old,'canonicalId':target,'book':p['book'],'page':p['page'],'unit':p['unit']});S[old]=S[target]
(R/'assets/course.js').write_text('window.FOCUS = '+json.dumps(D,ensure_ascii=False,separators=(',',':'))+';\n')
(R/'assets/exercise-sources.js').write_text('window.EXERCISE_SOURCES = '+json.dumps(S,ensure_ascii=False,separators=(',',':'))+';\n')
(R/'audit/source-boundaries.json').write_text(json.dumps({'exercises':len(E),'sources':sum(len(m['sources']) for k,m in S.items() if k in E),'expanded':changes,'legacyLinks':aliases},ensure_ascii=False,indent=2)+'\n')
print('Source boundary audit:',len(E),'exercises;',len(changes),'rectangles expanded;',len(aliases),'legacy links preserved')
