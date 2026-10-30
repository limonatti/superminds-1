"""Extract original full-page JPEG scans without resizing or recompression.
Usage: python extract-pages.py --source-dir /path/to/original/pdfs
Requires pypdf, pdfplumber and Pillow. Exercise coordinates stay normalized.
"""
from pathlib import Path
import argparse, hashlib, io, json
from collections import Counter
from PIL import Image
from pypdf import PdfReader
import pdfplumber

parser = argparse.ArgumentParser()
parser.add_argument('--source-dir', type=Path, required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parent
report = {}
for book in ('sb', 'wb'):
    source = args.source_dir / f'Solutions_3rd_Int_{book.upper()}.pdf'
    reader = PdfReader(source)
    dimensions = Counter()
    total = 0
    with pdfplumber.open(source) as layout:
        for number, page in enumerate(reader.pages, 1):
            objects = page['/Resources']['/XObject'].get_object()
            images = [o.get_object() for o in objects.values() if o.get_object().get('/Subtype') == '/Image']
            assert len(images) == 1, (book, number, 'Expected one full-page scan')
            box = layout.pages[number-1]
            assert len(box.images) == 1
            image_box = box.images[0]
            assert all(abs(a-b) < .1 for a,b in zip((image_box['x0'], image_box['top'], image_box['width'], image_box['height']), (0,0,box.width,box.height))), (book, number, 'Not a full-page image')
            image = images[0]
            assert image['/Filter'] == '/DCTDecode', (book, number, 'Expected original JPEG')
            data = image.get_data()
            with Image.open(io.BytesIO(data)) as decoded:
                assert decoded.format == 'JPEG'
                dimensions[str(decoded.size)] += 1
                decoded.verify()
            target = root/'assets'/f'{book}-{number}.jpg'
            target.write_bytes(data)
            assert target.read_bytes() == data
            total += len(data)
    report[book] = {'pages':len(reader.pages), 'dimensions':dict(dimensions), 'bytes':total, 'sourceSHA256':hashlib.sha256(source.read_bytes()).hexdigest(), 'encoding':'Original JPEG streams; no resizing or recompression'}
(root/'data/page-quality.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps(report, indent=2))
