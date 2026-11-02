"""Import the owner's supplied B1 sources; retain provenance and printed pages."""
from pathlib import Path
import json, re, shutil, zipfile, hashlib
import pypdfium2 as pdfium
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1] / 'speakout-b1-active-teach'
SOURCE = Path('/Users/mak/Downloads')
for folder in ['assets', 'media', 'resources', 'audit', 'work/rendered', 'work/ocr']:
    (ROOT / folder).mkdir(parents=True, exist_ok=True)
manifest = {'inputs': [], 'books': {}, 'media': [], 'resources': []}
def record(p):
    manifest['inputs'].append({'name': p.name, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size})
for kind, prefix, title in [('sb','687_1-', 'Student’s Book'), ('wb','687_5-', 'Workbook'), ('keys','687_2-', 'Student’s Book · Answer key'), ('wb-keys','687_6-', 'Workbook · Answer key'), ('teacher','687_8-', 'Teacher’s Book')]:
    src = next(p for p in SOURCE.glob(prefix+'*.pdf') if not re.search(r'\(\d+\)\.pdf$',p.name))
    record(src); dst = ROOT/'resources'/f'{kind}.pdf'; shutil.copyfile(src,dst)
    manifest['resources'].append({'path': str(dst.relative_to(ROOT)), 'name': title, 'category': 'books'})
    if kind not in ['sb','wb','wb-keys']: continue
    doc = pdfium.PdfDocument(src); reader = PdfReader(src); pages=[]
    for i, page in enumerate(doc):
        dest = ROOT/'work/rendered'/f'{kind}-{i+1:03}.jpg'
        if not dest.exists():
            imgs=list(reader.pages[i].images)
            if kind=='sb' and len(imgs)==1 and imgs[0].data.startswith(b'\xff\xd8'):
                dest.write_bytes(imgs[0].data)
            else:
                page.render(scale=2.5).to_pil().convert('RGB').save(dest,quality=92,optimize=True)
        pages.append({'pdfPage':i+1, 'sourceImage':str(dest.relative_to(ROOT)), 'width':page.get_width(),'height':page.get_height()})
    manifest['books'][kind]={'path':str(dst.relative_to(ROOT)), 'pages':pages}
    print(kind,len(pages),'pages imported',flush=True)
for archive in sorted(SOURCE.glob('687*.zip')):
    record(archive)
    category = 'tests' if 'Tests' in archive.name else 'photocopiables' if 'Photocopiables' in archive.name else 'teacher' if 'Teacher Resources' in archive.name else 'course'
    with zipfile.ZipFile(archive) as z:
        for info in z.infolist():
            p=Path(info.filename); ext=p.suffix.lower()
            if ext not in ['.mp3','.mp4','.pdf','.docx','.doc'] or '__MACOSX' in info.filename: continue
            slug=re.sub('[^a-zA-Z0-9.-]+','-',p.stem).strip('-').lower()
            folder=('resources/'+category) if category!='course' or ext=='.pdf' else 'media'
            dest=ROOT/folder/(slug+ext);dest.parent.mkdir(parents=True,exist_ok=True)
            if not dest.exists():dest.write_bytes(z.read(info))
            rel=str(dest.relative_to(ROOT));name=p.stem
            if category!='course' or ext not in ['.mp3','.mp4']:
                manifest['resources'].append({'path':rel,'name':name.replace('_',' '),'category':category,'sourceMember':info.filename});continue
            book='wb' if 'Workbook' in archive.name else 'sb'
            track=re.search(r'Audio_([\w_]+)',name,re.I)
            track=track[1].replace('_','.') if track else ''
            lesson=re.search(r'_([1-8][ABCDR])_',name)
            video=re.search(r'[ _]U([1-8])[ _]',name)
            unit=int(video[1]) if video else int(track[0]) if track[:1].isdigit() else 0
            if track.startswith(('MB','VB')):unit=int(re.search('[1-8]',track)[0]) if re.search('[1-8]',track) else 0
            manifest['media'].append({'path':rel,'name':name,'book':book,'type':'video' if video else 'audio','track':track,'unit':unit,'lesson':lesson[1] if lesson else (str(unit)+('Intro' if 'Vlogs' in name else 'D')) if video else '', 'sourceArchive':archive.name,'sourceMember':info.filename})
    print(archive.name,'imported',flush=True)
(ROOT/'work/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
(ROOT/'audit/sources.json').write_text(json.dumps(manifest['inputs'],ensure_ascii=False,indent=2))
