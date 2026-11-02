"""Restore SB 158–173 from the additional PDF supplied by the owner."""
from pathlib import Path
import hashlib
import json

import pypdfium2 as pdfium
from pypdf import PdfReader, PdfWriter

ROOT = Path(__file__).resolve().parents[1] / 'speakout-b1-active-teach'
DOWNLOADS = Path('/Users/mak/Downloads')
SOURCE = DOWNLOADS / '697264663-SpeakOut-B1-3rd-Stud-Book.pdf'
PRINTED = list(range(158, 174))
PDF_PATH = 'resources/sb-scripts.pdf'
reader = PdfReader(SOURCE)
assert len(reader.pages) == 178
assert 'B1+' not in reader.pages[2].extract_text()
assert 'B1' in reader.pages[2].extract_text()

manifest_path = ROOT / 'work/manifest.json'
manifest = json.loads(manifest_path.read_text())
writer = PdfWriter()
doc = pdfium.PdfDocument(SOURCE)
pages = []
for number, printed in enumerate(PRINTED, 1):
    source_index = printed + 1  # The PDF has two cover pages before printed p. 1.
    page = reader.pages[source_index]
    assert ('AUDIOSCRIPTS' if printed < 170 else str(printed)) in page.extract_text()
    writer.add_page(page)
    dest = ROOT / 'work/rendered' / f'sb-scripts-{printed}.jpg'
    doc[source_index].render(scale=2.5).to_pil().convert('RGB').save(dest, quality=93, optimize=True)
    pages.append({'printedPage': printed, 'pdfPage': number, 'pdf': PDF_PATH,
                  'sourcePdfPage': source_index + 1, 'sourceFile': SOURCE.name,
                  'sourceImage': str(dest.relative_to(ROOT)),
                  'width': doc[source_index].get_width(), 'height': doc[source_index].get_height()})
writer.add_metadata({'/Title': 'Speakout Third Edition B1 - Audio and video scripts, pages 158-173',
                     '/Subject': 'Unmodified pages extracted from the PDF supplied by the owner.'})
with (ROOT / PDF_PATH).open('wb') as output:
    writer.write(output)

manifest['books']['sb']['pages'] = [p for p in manifest['books']['sb']['pages']
                                   if p.get('pdf') != PDF_PATH] + pages
manifest['resources'] = [r for r in manifest['resources'] if r['path'] != PDF_PATH]
manifest['resources'].append({'path': PDF_PATH, 'category': 'books',
                             'name': 'Student’s Book · Audio / video scripts · стр. 158–173'})
checks = []
for name, result in [
    ("687_1- Speakout 3rd B1 Student's Book_2022 (2).pdf", 'Byte-identical to the original supplied incomplete SB.'),
    (SOURCE.name, 'Restores printed pages 158–173. Printed pages 146–149 are blank.'),
    ('794283116-Speakout-3rd-B1-Student-s-Book-2022.pdf', 'All 170 page content streams and image hashes match the original incomplete SB.'),
]:
    src = DOWNLOADS / name
    entry = {'name': name, 'bytes': src.stat().st_size,
             'sha256': hashlib.sha256(src.read_bytes()).hexdigest()}
    manifest['inputs'] = [r for r in manifest['inputs'] if r['name'] != name] + [entry]
    checks.append({**entry, 'pdfPages': len(PdfReader(src).pages), 'result': result})
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
(ROOT / 'audit/sources.json').write_text(json.dumps(manifest['inputs'], ensure_ascii=False, indent=2))
(ROOT / 'audit/supplement-check.json').write_text(json.dumps({
    'checkedOn': '2026-11-02', 'files': checks, 'restoredPages': PRINTED,
    'stillMissingPages': [146, 147, 148, 149],
    'blankSourcePdfPages': [148, 149, 150, 151],
    'extractedPdf': PDF_PATH,
    'extractedPdfSha256': hashlib.sha256((ROOT / PDF_PATH).read_bytes()).hexdigest(),
}, ensure_ascii=False, indent=2))
print(f'Restored {len(pages)} script pages; Communication Bank 146–149 is still missing.')
