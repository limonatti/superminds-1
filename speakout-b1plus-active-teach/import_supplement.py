"""Import the owner's 37-page Student's Book supplement (printed 139–175)."""
from pathlib import Path
import hashlib,json,shutil,sys
from pypdf import PdfReader
import pypdfium2 as pdfium

ROOT=Path(__file__).resolve().parent
source=Path(sys.argv[1]);reader=PdfReader(source)
if len(reader.pages)!=37:raise ValueError('Expected the verified 139–175 supplement (37 PDF pages).')
relative='resources/sb-supplement.pdf'
shutil.copyfile(source,ROOT/relative)
renderer=pdfium.PdfDocument(source)
manifest=json.loads((ROOT/'work/manifest.json').read_text())
pages=[]
for ix,page in enumerate(reader.pages):
    number=139+ix;dest=f'assets/sb-{number}.jpg';images=list(page.images)
    if len(images)==1 and images[0].data.startswith(b'\xff\xd8') and not page.rotation:
        (ROOT/dest).write_bytes(images[0].data)
    else:
        p=renderer[ix];p.render(scale=2200/p.get_height()).to_pil().convert('RGB').save(ROOT/dest,quality=94,optimize=True)
    pages.append({'page':number,'pdf':relative,'pdfPage':ix+1,'image':dest})
manifest['books']['sb']['pages']=[p for p in manifest['books']['sb']['pages'] if p['page']<139]+pages
manifest['resources']=[r for r in manifest['resources'] if r['path']!=relative]+[{'path':relative,'name':'Student’s Book · pages 139–175 · Communication, Mediation, scripts, irregular verbs'}]
manifest['inputs']=[p for p in manifest['inputs'] if p.get('role')!='sb-supplement']+[{'name':source.name,'role':'sb-supplement','sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'bytes':source.stat().st_size,'printedPages':[139,175]}]
manifest['missingSourcePages']['sb']=sorted(set(range(6,176))-{p['page'] for p in manifest['books']['sb']['pages']})
(ROOT/'work/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
(ROOT/'audit/sources.json').write_text(json.dumps({k:manifest[k] for k in ('inputs','missingSourcePages')},ensure_ascii=False,indent=2))
print('Imported 37 original pages; SB missing pages:',manifest['missingSourcePages']['sb'])
