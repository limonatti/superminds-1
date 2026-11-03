#!/usr/bin/env python3
"""Apply independently solved WB answers and reviewed regions, retaining SB data.

Usage: python3 scripts/build-speakout-b2plus-workbook.py /path/to/ocr
The mismatched answer appendix is never read. Editorial data and stable IDs live
in scripts/data/b2plus-workbook; the OCR only supplies non-authoritative hints.
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'speakout-b2plus-active-teach'
EDITORIAL = ROOT / 'scripts/data/b2plus-workbook'

def read_js(path):
    return json.JSONDecoder().raw_decode(path.read_text().split('=', 1)[1].lstrip())[0]

def encode(data):
    return json.dumps(data, ensure_ascii=False, separators=(',', ':'))

specs = {}
for file in sorted(EDITORIAL.glob('*.json')):
    if file.name != 'layout.json':
        for page, exercises in json.loads(file.read_text()).items():
            assert page not in specs, page
            specs[page] = exercises
assert set(specs) == {str(p) for p in range(4, 68)}
layout = json.loads((EDITORIAL / 'layout.json').read_text())
legacy = json.loads((BASE / 'audit/workbook-legacy-regions.json').read_text())
data_path = BASE / 'data/exercises.js'
original = data_path.read_text()
bank = read_js(data_path)
metadata = read_js(BASE / 'data/index.js')
sources = read_js(BASE / 'assets/exercise-sources.js')
sources = {k: v for k, v in sources.items() if not k.startswith('wb-')}
ocr = Path(sys.argv[1]) / 'wb'
audit = {'provenance': 'Independently solved from the supplied workbook pages and audioscripts; not a Pearson answer key.',
         'pages': [], 'audio_review': [], 'retired_regions': []}
old_ids = {e['id'] for key, es in bank.items() if key.startswith('wb:') for e in es}
new_ids = set()
for page in range(4, 68):
    sheet = page - 2
    rows = json.loads((ocr / f'{sheet:03}.jpg.json').read_text())
    assert set(layout[str(page)]) == set(specs[str(page)])
    exercises = []
    for label, spec in specs[str(page)].items():
        region = layout[str(page)][label]
        x, y, w, h = region['box']
        assert 0 <= x < x + w <= 1 and 0 <= y < y + h <= 1
        text = '\n'.join(r['text'] for r in sorted(rows, key=lambda r: (round(r['y'] / .006), r['x']))
                         if x-.003 <= r['x'] < x+w and y-.003 <= r['y'] < y+h)
        fields = []
        if 'answers' in spec:
            answers = spec['answers'].split('|')
            numbers = spec.get('numbers', [str(i+1) for i in range(len(answers))])
            assert len(numbers) == len(answers), (page, label)
            for i, (number, answer) in enumerate(zip(numbers, answers)):
                f = {'n': str(number), 'answer': answer, 'grading': 'workbook'}
                for key in ('choices', 'mode'):
                    if key in spec:
                        f[key] = list(spec[key]) if key == 'choices' else spec[key]
                for key, singular in [('prompts', 'prompt'), ('prefixes', 'prefix'), ('suffixes', 'suffix')]:
                    if key in spec:
                        assert len(spec[key]) == len(answers), (page, label, key)
                        f[singular] = spec[key][i]
                if f.get('prefix') and not f.get('prompt'):
                    f['prompt'] = str(number) + '. ' + f['prefix'] + ' … ' + f.get('suffix', '')
                fields.append(f)
            key = '\n'.join(f"{f['n']}. {f.get('prefix', '')} {f['answer']} {f.get('suffix', '')}".strip() for f in fields)
            if spec.get('explanation'):
                key += '\n\n' + spec['explanation']
        else:
            assert spec.get('open'), (page, label)
            fields = [{'n': 'notes', 'answer': ''}]
            key = spec['open']
        entry = {'id': region['id'], 'label': label, 'x': x, 'y': y, 'w': w, 'h': h,
                 'text': text, 'key': key, 'fields': fields, 'type': 'book',
                 'spoken': 'answers' not in spec, 'reviewedWorkbook': True}
        if entry['id'] in legacy:
            entry['legacyIds'] = legacy[entry['id']]
        if spec.get('hint'):
            entry['hint'] = spec['hint']
        if spec.get('audio'):
            unit, track = spec['audio'].split('.')
            entry['audio'] = next(a['path'] for a in metadata['media']['wbAudio'] if a['track'] == track and a['code'].startswith(unit))
        if spec.get('review'):
            entry['hint'] = 'Сохраните ответ и сравните звучание с записью. Это задание проверяется вместе с преподавателем.'
            audit['audio_review'].append({'page': page, 'exercise': label, 'track': spec.get('audio'), 'reason': spec['review']})
        exercises.append(entry)
        assert entry['id'] not in new_ids
        new_ids.add(entry['id'])
    bank[f'wb:{sheet}'] = exercises
    # Present the complete numbered task, including its subparts in both columns.
    for e in exercises:
        group = re.match(r'\d+', e['label'])[0]
        siblings = [s for s in exercises if re.match(r'\d+', s['label'])[0] == group]
        images = []
        for col in (False, True):
            own = [s for s in siblings if (s['x'] > .35) == col]
            if own:
                left = min(s['x'] for s in own)
                top = min(s['y'] for s in own)
                right = max(s['x']+s['w'] for s in own)
                bottom = max(s['y']+s['h'] for s in own)
                images.append({'image': f'pages/wb/{sheet:03}.jpg', 'size': [1406, 1988],
                               'box': [round(v, 5) for v in (left, top, right-left, bottom-top)], 'page': page})
        spec = specs[str(page)][e['label']]
        context_pages = set(spec.get('sourcePages', []))
        if re.search(r'\bread\b|\bwriting\b', e['text'].split('\n')[0], re.I):
            context_pages.add(page)
        for context_page in sorted(context_pages):
            images.append({'image': f'pages/wb/{context_page-2:03}.jpg', 'size': [1406, 1988],
                           'box': [0, 0, 1, 1], 'page': context_page, 'context': True})
        sources[e['id']] = {'label': e['label'], 'sources': images}
    audit['pages'].append({'page': page, 'exercises': len(exercises),
                           'checked_fields': sum(bool(f['answer']) for e in exercises for f in e['fields']),
                           'open_exercises': sum(not any(f['answer'] for f in e['fields']) for e in exercises)})
previous_audit = BASE / 'audit/workbook-answers.json'
retired = set(json.loads(previous_audit.read_text()).get('retired_regions', [])) if previous_audit.exists() else set()
audit['retired_regions'] = sorted(retired | (old_ids - new_ids))
audit['preserved_ids'] = sum(not ident.endswith('-reviewed') for ident in new_ids)
audit['exercises'] = sum(p['exercises'] for p in audit['pages'])
audit['checked_fields'] = sum(p['checked_fields'] for p in audit['pages'])
audit['open_exercises'] = sum(p['open_exercises'] for p in audit['pages'])
# Retired OCR fragments are removed only from the presentation index. No stored
# account data is deleted; it remains in account backups. Real task IDs persist.
data_path.write_text('window.SPEAKOUT_EXERCISES=' + encode(bank) + ';\n' + original.split(';\n', 1)[1])
(BASE / 'assets/exercise-sources.js').write_text('window.EXERCISE_SOURCES=' + encode(sources) + ';\n')
(BASE / 'audit/workbook-answers.json').write_text(json.dumps(audit, ensure_ascii=False, indent=2) + '\n')
coverage_path = BASE / 'audit/exercises.json'
coverage = json.loads(coverage_path.read_text())
for row in coverage:
    if row['book'] == 'wb':
        p = next((p for p in audit['pages'] if p['page'] == row['printed']), None)
        if p:
            row.update(exercises=p['exercises'], checked_fields=p['checked_fields'])
coverage_path.write_text(json.dumps(coverage, indent=2) + '\n')
print(json.dumps({k:v for k,v in audit.items() if not isinstance(v,list)}, ensure_ascii=False))
