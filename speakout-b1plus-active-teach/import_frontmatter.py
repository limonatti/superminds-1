"""Import the owner's verified samples: SB printed page 6 and WB page 3 (iii)."""
from pathlib import Path
import hashlib
import json
import shutil
import sys

import pypdfium2 as pdfium
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent


def main(sb_source, wb_source):
    manifest = json.loads((ROOT / 'work/manifest.json').read_text())
    entries = [
        ('sb', 6, 7, Path(sb_source), 'sb-lead-in-sample', 'LEAD-IN',
         'Student’s Book · Lead-in · page 6 · source sample'),
        ('wb', 3, 3, Path(wb_source), 'wb-contents-sample', 'CONTENTS',
         'Workbook · Contents · page 3 (iii) · source sample'),
    ]
    # Validate both inputs before changing the existing course.
    for book, number, pdf_page, source, role, heading, title in entries:
        reader = PdfReader(source)
        if len(reader.pages) < pdf_page or heading not in reader.pages[pdf_page - 1].extract_text():
            raise ValueError(f'{source.name}: expected {heading} on PDF page {pdf_page}')
    for book, number, pdf_page, source, role, heading, title in entries:
        relative = f'resources/{role}.pdf'
        shutil.copyfile(source, ROOT / relative)
        image = f'assets/{book}-{number}.jpg'
        with pdfium.PdfDocument(source) as document:
            page = document[pdf_page - 1]
            page.render(scale=2200 / page.get_height()).to_pil().convert('RGB').save(
                ROOT / image, quality=94, optimize=True)
        pages = manifest['books'][book]['pages']
        manifest['books'][book]['pages'] = sorted(
            [p for p in pages if p['page'] != number] + [
                {'page': number, 'pdf': relative, 'pdfPage': pdf_page, 'image': image}
            ], key=lambda p: p['page'])
        manifest['resources'] = [r for r in manifest['resources'] if r['path'] != relative] + [
            {'path': relative, 'name': title}]
        manifest['inputs'] = [p for p in manifest['inputs'] if p.get('role') != role] + [
            {'name': source.name, 'role': role, 'sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
             'bytes': source.stat().st_size, 'printedPages': [number], 'pdfPages': [pdf_page]}]
    manifest['missingSourcePages'] = {
        book: sorted(set(range(start, end + 1)) - {p['page'] for p in manifest['books'][book]['pages']})
        for book, start, end in [('sb', 6, 175), ('wb', 3, 96)]
    }
    (ROOT / 'work/manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
    (ROOT / 'audit/sources.json').write_text(json.dumps(
        {k: manifest[k] for k in ('inputs', 'missingSourcePages')}, ensure_ascii=False, indent=2))
    print('Imported SB 6 and WB 3. Missing source pages:', manifest['missingSourcePages'])


if __name__ == '__main__':
    main(*sys.argv[1:])
