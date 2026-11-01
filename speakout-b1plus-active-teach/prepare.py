"""Prepare only the owner's supplied B1+ files. No remote content is used.
Usage: python prepare.py '/path/to/Speakout B1+'
"""
from pathlib import Path
import sys,json,zipfile,hashlib,shutil,re
import pypdfium2 as pdfium

ROOT=Path(__file__).resolve().parent
SOURCE=Path(sys.argv[1])
for d in ['assets','media','resources','audit','work/ocr']:
    (ROOT/d).mkdir(parents=True,exist_ok=True)
manifest={'inputs':[],'media':[],'resources':[],'books':{}}
def record(path):
    manifest['inputs'].append({'name':path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size})
pdfs=[('sb',"Student's Book_2022",'Student’s Book'),('wb','Workbook_2022','Workbook with answer key'),('keys','Keys.pdf','Student’s Book answer key'),('teacher',"Teacher's Book_2022",'Teacher’s Book')]
for kind,needle,title in pdfs:
    src=next(p for p in SOURCE.glob('*.pdf') if needle in p.name)
    record(src);dst=ROOT/'resources'/f'{kind}.pdf';shutil.copyfile(src,dst)
    manifest['resources'].append({'path':str(dst.relative_to(ROOT)),'name':title})
    if kind not in ('sb','wb'):continue
    doc=pdfium.PdfDocument(str(src));pages=[]
    # Verified against the printed numbers. Missing pages are never invented.
    for ix in range(5 if kind=='sb' else 1,len(doc)):
        printed=ix+2 if kind=='sb' else ix+3
        dest=ROOT/'assets'/f'{kind}-{printed}.jpg'
        if not dest.exists():
            bitmap=doc[ix].render(scale=2.3);im=bitmap.to_pil().convert('RGB');im.save(dest,'JPEG',quality=92,optimize=True);bitmap.close()
        pages.append({'page':printed,'pdfPage':ix+1,'image':str(dest.relative_to(ROOT))})
    manifest['books'][kind]={'path':str(dst.relative_to(ROOT)),'pages':pages}
    print(kind,len(pages),'pages ready',flush=True)
for archive in sorted(SOURCE.glob('*.zip')):
    record(archive)
    with zipfile.ZipFile(archive) as z:
        for info in sorted(z.infolist(),key=lambda q:q.filename):
            p=Path(info.filename);ext=p.suffix.lower()
            if ext not in ('.mp3','.mp4','.pdf') or '__MACOSX' in info.filename:continue
            name=p.stem;book='wb' if 'Workbook' in archive.name else 'sb'
            slug=re.sub(r'[^a-zA-Z0-9.-]+','-',name).strip('-').lower()
            dest=ROOT/('resources' if ext=='.pdf' else 'media')/(slug+ext)
            if not dest.exists():dest.write_bytes(z.read(info))
            rel=str(dest.relative_to(ROOT))
            if ext=='.pdf':
                manifest['resources'].append({'path':rel,'name':('Workbook ' if book=='wb' else 'Student’s Book ')+('videoscripts' if 'Video' in archive.name else 'audioscripts')});continue
            lesson=re.search(r'_([1-8][ABCDR])_',name)
            video=re.search(r'[ _]U([1-8])[ _]',name)
            track=re.search(r'Audio_([\w_]+)',name) if book=='sb' else re.search(r'_WB_([\d_]+)',name)
            track=track[1].replace('_','.') if track else ''
            unit=int(video[1] if video else re.search(r'[1-8]',track)[0])
            manifest['media'].append({'path':rel,'name':name,'book':book,'lesson':lesson[1] if lesson else (str(unit)+('Intro' if 'Vlogs' in name else 'D')) if video else '', 'unit':unit,'track':track,'type':'video' if ext=='.mp4' else 'audio','sourceArchive':archive.name,'sourceMember':info.filename})
    print(archive.name,'ready',flush=True)
manifest['missingSourcePages']={'sb':[6,*range(138,176)],'wb':[3]}
(ROOT/'work/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
(ROOT/'audit/sources.json').write_text(json.dumps({k:v for k,v in manifest.items() if k in ('inputs','missingSourcePages')},ensure_ascii=False,indent=2))
