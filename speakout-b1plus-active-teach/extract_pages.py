"""Publish the original JPEG scans without resampling or extra compression."""
from pathlib import Path
from pypdf import PdfReader
import pypdfium2 as pdfium
import json
ROOT=Path(__file__).resolve().parent
d=json.loads((ROOT/'work/manifest.json').read_text())
for book,data in d['books'].items():
    pdf=PdfReader(ROOT/data['path'])
    renderer=pdfium.PdfDocument(ROOT/data['path'])
    for p in data['pages']:
        if p.get('pdf') and p['pdf']!=data['path']:continue # Imported supplement keeps its own original images.
        page=pdf.pages[p['pdfPage']-1]
        images=list(page.images)
        # Vector reference pages already have a sharp PDF rendering.
        if len(images)!=1:
            rp=renderer[p['pdfPage']-1]
            rp.render(scale=2000/rp.get_height()).to_pil().convert('RGB').save(ROOT/p['image'],quality=90,optimize=True)
            continue
        im=images[0]
        assert im.data.startswith(b'\xff\xd8'),(book,p['page'],'not JPEG')
        (ROOT/p['image']).write_bytes(im.data)
    print(book,'original scans extracted')
