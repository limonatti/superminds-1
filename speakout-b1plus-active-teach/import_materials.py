"""Import the owner's supplemental ZIPs; retain original files and render local pages."""
from pathlib import Path
from io import BytesIO
import collections
import hashlib
import json
import re
import sys
import zipfile

from pypdf import PdfReader
import pypdfium2 as pdfium

ROOT = Path(__file__).resolve().parent
LITERATURE = {7: ('Leonardo da Vinci', 'B1–B2'), 8: ('The Time Machine', 'B1–B2'),
              9: ('Dr Jekyll & Mr Hyde', 'B1+–B2+'), 10: ('Middlemarch', 'B1+–B2+')}


def slug(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower().replace('+', 'p')).strip('-')


def describe(category, name):
    stem = Path(name).stem.removesuffix('.pdf')
    record = {'id': category + '-' + slug(stem), 'category': category,
              'units': [], 'teacher': False, 'name': stem}
    if category == 'photocopiables':
        m = re.search(r'PC_(\d[A-C])_(.*)', stem)
        if m:
            lesson, kind = m.groups()
            kind = {'Grammar': 'Грамматика', 'Vocab': 'Лексика'}.get(kind, 'Разговорная практика')
            record.update(name=f'{lesson} · {kind}', lesson=lesson, units=[int(lesson[0])])
        else:
            record.update(name='Photocopiables · рекомендации и ключи', teacher=True)
    elif category == 'literature':
        m = re.search(r'Lesson_(\d+)', stem)
        if m:
            number = int(m[1])
            if number not in LITERATURE:
                return None
            title, level = LITERATURE[number]
            record.update(name=title, level=level, literatureLesson=number, teacher=stem.endswith('_TN'))
            if record['teacher']:
                record['name'] += ' · рекомендации и ключи'
        else:
            record.update(name='Literature Lessons · рекомендации преподавателю', teacher=True)
    else:
        title = stem.removeprefix('SO3_B1+_')
        record['name'] = title.replace('_', ' ')
        record['teacher'] = bool(re.search(r'Answer Key|_AK$|Mark scheme|Guidance', title))
        m = re.search(r'_U([1-8])(?:-([1-8]))?([ABC])$', title)
        if m:
            start, end, variant = m.groups()
            record.update(units=list(range(int(start), int(end or start) + 1)), variant=variant)
            record['name'] = title[:m.start()] + f' · Unit {start}' + (f'–{end}' if end else '') + f' · {variant}'
        m = re.match(r'Progress Test_(\d)([ABC])$', title)
        if m:
            number, variant = m.groups()
            number = int(number)
            record.update(name=f'Progress Test {number} · Units {2*number-1}–{2*number} · {variant}',
                          units=[2*number-1, 2*number], variant=variant)
        m = re.search(r'Version[ _]([ABC])$', title)
        if m:
            record['variant'] = m[1]
    return record


def main():
    if len(sys.argv) != 4:
        raise SystemExit('Usage: import_materials.py tests.zip photocopiables.zip literature.zip')
    items, audio, audit = [], [], {'inputs': [], 'files': [], 'excluded': []}
    for category, source in zip(['tests', 'photocopiables', 'literature'], sys.argv[1:]):
        source = Path(source)
        audit['inputs'].append({'name': source.name, 'sha256': hashlib.sha256(source.read_bytes()).hexdigest()})
        with zipfile.ZipFile(source) as archive:
            bad = archive.testzip()
            if bad:
                raise ValueError(f'Corrupt archive entry: {bad}')
            members = [n for n in archive.namelist() if not n.endswith('/') and '__MACOSX/' not in n]
            for member in members:
                name = Path(member).name
                suffix = Path(name).suffix.lower()
                if suffix not in ('.pdf', '.mp3'):
                    continue
                data = archive.read(member)
                if suffix == '.mp3':
                    track = re.search(r'Audio_([A-Z]+\d*)_(\d+)', name)
                    track = f'{track[1]}.{track[2]}' if track else 'Titles'
                    rel = f'resources/additional/tests/audio/{slug(Path(name).stem)}.mp3'
                    (ROOT / rel).parent.mkdir(parents=True, exist_ok=True)
                    (ROOT / rel).write_bytes(data)
                    audio.append({'track': track, 'path': rel})
                    audit['files'].append({'source': member, 'path': rel, 'sha256': hashlib.sha256(data).hexdigest()})
                    continue
                item = describe(category, name)
                if item is None:
                    audit['excluded'].append({'source': member, 'reason': 'Literature level below B1+'})
                    continue
                rel = f'resources/additional/{category}/{item["id"]}.pdf'
                (ROOT / rel).parent.mkdir(parents=True, exist_ok=True)
                changed = not (ROOT / rel).exists() or (ROOT / rel).read_bytes() != data
                (ROOT / rel).write_bytes(data)
                item['path'] = rel
                reader = PdfReader(BytesIO(data))
                text = '\n'.join(p.extract_text() or '' for p in reader.pages)
                item['pageCount'] = len(reader.pages)
                item['tracks'] = sorted(set(re.findall(r'\b(?:UT\d|PT\d|ET|LL\d+)\.\d{2}\b', text)))
                item['images'] = []
                doc = pdfium.PdfDocument(data)
                for index in range(len(doc)):
                    image = f'assets/additional/{item["id"]}/{index + 1}.webp'
                    target = ROOT / image
                    if changed or not target.exists():
                        target.parent.mkdir(parents=True, exist_ok=True)
                        page = doc[index]
                        bitmap = page.render(scale=2000 / page.get_height())
                        bitmap.to_pil().convert('RGB').save(target, quality=88, method=4)
                        bitmap.close()
                        page.close()
                    # Remove only this importer's superseded preview, never originals.
                    target.with_suffix('.jpg').unlink(missing_ok=True)
                    item['images'].append(image)
                doc.close()
                if category == 'tests':
                    word = next((n for n in members if Path(n).stem == Path(name).stem and Path(n).suffix in ('.doc', '.docx')), None)
                    if word:
                        word_data = archive.read(word)
                        word_rel = rel.removesuffix('.pdf') + Path(word).suffix
                        (ROOT / word_rel).write_bytes(word_data)
                        item['editable'] = word_rel
                        audit['files'].append({'source': word, 'path': word_rel, 'sha256': hashlib.sha256(word_data).hexdigest()})
                audit['files'].append({'source': member, 'path': rel, 'sha256': hashlib.sha256(data).hexdigest()})
                items.append(item)
    track_paths = {m['track']: m['path'] for m in audio}
    for item in items:
        tracks = item.pop('tracks')
        item['audio'] = [{'track': t, 'path': track_paths[t]} for t in tracks if t in track_paths]
        if not item['teacher']:
            item['missingAudio'] = [t for t in tracks if t not in track_paths]
        if item['teacher']:
            continue
        candidates = [r for r in items if r['teacher'] and r['category'] == item['category']]
        if item['category'] == 'photocopiables':
            item['keyId'] = candidates[0]['id']
        elif item['category'] == 'literature':
            item['keyId'] = next(r['id'] for r in candidates if r.get('literatureLesson') == item['literatureLesson'])
        else:
            prefix = 'SO3_B1+_Diagnostic Test' if 'Diagnostic' in item['name'] else 'SO3_B1+_Tests'
            key_name = prefix + ('_Version_C_AK' if item.get('variant') == 'C' else '_AK') if 'Diagnostic' in item['name'] else prefix + ('_Answer Key C' if item.get('variant') == 'C' else '_Answer Key')
            key_id = 'tests-' + slug(key_name)
            if any(r['id'] == key_id for r in candidates):
                item['keyId'] = key_id
            else:
                raise ValueError(f'Missing answer key: {item["name"]}')
    assert len({r['id'] for r in items}) == len(items)
    output = {'items': items, 'audio': audio}
    (ROOT / 'assets/materials-data.js').write_text('window.SPEAKOUT_MATERIALS=' + json.dumps(output, ensure_ascii=False, separators=(',', ':')) + ';\n')
    audit['counts'] = dict(collections.Counter(r['category'] for r in items))
    audit['counts'].update(audio=len(audio), renderedPages=sum(r['pageCount'] for r in items))
    (ROOT / 'audit/materials.json').write_text(json.dumps(audit, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(audit['counts'], ensure_ascii=False))


if __name__ == '__main__':
    main()
