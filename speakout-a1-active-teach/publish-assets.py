from pathlib import Path
import json,shutil,subprocess,concurrent.futures
from pypdf import PdfWriter,PdfReader
r=Path(__file__).resolve().parent
d=json.loads((r/'assets/course.js').read_text()[14:-1]);out=r/'web';out.mkdir(exist_ok=True)
paths=sorted(set([m['path'] for m in d['media']]+[v['path'] for v in d['resources']]+[b['path'] for b in d['books'].values()]+[k['pdf'] for k in d['keys'].values()]))
mapping={p:f'web/{i:03d}{Path(p).suffix.lower()}' for i,p in enumerate(paths)}
def build(p):
 src=r/p;dst=r/mapping[p]
 if dst.exists():return
 if src.suffix.lower()=='.mp4':
  subprocess.run(['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-i',str(src),'-vf','scale=trunc(min(1280\\,iw)/2)*2:-2','-c:v','libx264','-preset','veryfast','-crf','28','-threads','2','-c:a','aac','-b:a','96k','-movflags','+faststart',str(dst)],check=True)
 elif src.stat().st_size>100_000_000 and src.suffix.lower()=='.pdf':
  w=PdfWriter(clone_from=src)
  for page in w.pages:
   for img in page.images:
    im=img.image.copy();im.thumbnail((1600,2200));img.replace(im,quality=65)
  w.write(dst)
  assert len(PdfReader(dst).pages)==len(PdfReader(src).pages)
 else:shutil.copyfile(src,dst)
 print(dst.name,round(dst.stat().st_size/1e6,1),'MB',flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:list(pool.map(build,paths))
for b in d['books'].values():b['path']=mapping[b['path']]
for m in d['media']:m['path']=mapping[m['path']]
for v in d['resources']:v['path']=mapping[v['path']]
for k in d['keys'].values():k['pdf']=mapping[k['pdf']]
(r/'assets/course-web.js').write_text('window.COURSE='+json.dumps(d,ensure_ascii=False,separators=(',',':'))+';')
assert all((r/p).stat().st_size<104_857_600 for p in mapping.values())
print('TOTAL WEB MB',sum((r/p).stat().st_size for p in mapping.values())/1e6,flush=True)
