"""Prepare owner-supplied Focus 2 Second Edition PDFs/audio; never execute their contents.
Usage: python prepare.py /path/to/extracted/archives
Requires PyMuPDF and Pillow. OCR the Workbook with ocr.swift after preparation.
"""
from pathlib import Path
import sys, json, re, shutil, hashlib
import pymupdf as fitz
from PIL import Image

ROOT = Path(__file__).resolve().parent
source = Path(sys.argv[1])
for folder in ['assets/pages', 'data', 'data/ocr', 'media', 'resources', 'audit']:
    (ROOT / folder).mkdir(parents=True, exist_ok=True)
manifest = {}
for book, name in [('sb', 'students_book'), ('wb', 'workbook'), ('ws', 'word_store'), ('tb', 'teachers_book')]:
    path = next(source.rglob('focus_second_edition_2_' + name + '.pdf'))
    doc = fitz.open(path)
    manifest[book] = {'name': path.name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'pdfPages': len(doc)}
    text = {}
    for index, page in enumerate(doc, 1):
        spans = [s for b in page.get_text('dict')['blocks'] if 'lines' in b for line in b['lines'] for s in line['spans']]
        text[str(index)] = {'width': page.rect.width, 'height': page.rect.height, 'spans': [{k: s[k] for k in ['text', 'bbox', 'font', 'size', 'color']} for s in spans], 'text': page.get_text()}
        if book != 'tb':
            out = ROOT / f'assets/pages/{book}-{index}.jpg'
            if not out.exists():
                pix = page.get_pixmap(matrix=fitz.Matrix(1600/page.rect.width, 1600/page.rect.width), alpha=False)
                pix.save(out, jpg_quality=86)
    (ROOT / f'data/{book}-text.json').write_text(json.dumps(text, ensure_ascii=False, separators=(',', ':')))
    print(book, len(doc), flush=True)
resources = []
for path in sorted(source.rglob('*')):
    if path.suffix.lower() not in ['.pdf', '.mp3']: continue
    if path.suffix == '.mp3' and 'students_book_audio' in str(path):
        match = re.search(r'CLCD (\d)_(\d+)\.mp3$', path.name)
        if not match: raise ValueError(path)
        shutil.copyfile(path, ROOT / f'media/sb-{match[1]}.{int(match[2]):02}.mp3')
        continue
    category = 'tests' if 'test_package' in str(path) else 'video-plans' if re.search(r'BBC|Vlog', path.name, re.I) else 'lesson-plans' if 'lesson_plans' in str(path) else 'books'
    slug = re.sub(r'[^a-z0-9]+', '-', path.stem.lower()).strip('-') + path.suffix.lower()
    rel = Path('resources') / category / slug
    (ROOT / rel).parent.mkdir(exist_ok=True)
    if (ROOT / rel).exists() and (ROOT / rel).read_bytes() != path.read_bytes():
        raise ValueError('Resource filename collision: ' + str(path))
    shutil.copyfile(path, ROOT / rel)
    title = re.sub(r'Focus2_2E_|focus_second_edition_2_', '', path.stem).replace('_', ' ')
    resources.append({'category': category, 'title': title, 'path': str(rel)})
(ROOT / 'data/resources.json').write_text(json.dumps(resources, ensure_ascii=False, indent=2))
(ROOT / 'audit/sources.json').write_text(json.dumps(manifest, indent=2))
print('resources', len(resources), 'audio', len(list((ROOT / 'media').glob('*.mp3'))), flush=True)
