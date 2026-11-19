"""Interactive presentation from student pages; never generate options from keys.

The marking contract/version is deliberately unchanged by presentation updates.
Uncertain text segmentation retains the original task image and editable fields.
"""
from pathlib import Path
from collections import Counter
import json
import re

R = Path(__file__).resolve().parent
HIDDEN = {0xffffff, 0xda2128}


def clean(text):
    text = re.sub(r'([ﬁﬂ])\s*', lambda m: {'ﬁ': 'fi', 'ﬂ': 'fl'}[m[1]], str(text))
    text = re.sub(r'\b(fi|confi|diffi|affi|offi|suffi) (?=[a-z])', r'\1', text)
    return ' '.join(text.split())


def printed(span):
    text = span['text']
    if span.get('color') in HIDDEN:
        return ' _____ '
    text = re.sub(r'\x01{2,}|_{2,}', ' _____ ', text)
    return clean(re.sub(r'[\x00-\x1f]', ' ', text))


def lines(spans):
    rows = []
    for s in sorted(spans, key=lambda s: (s['bbox'][1], s['bbox'][0])):
        row = next((r for r in reversed(rows[-3:]) if abs(r[0]-s['bbox'][1]) < 2.5), None)
        if row:
            row[1].append(s)
        else:
            rows.append([s['bbox'][1], [s]])
    return [sorted(row, key=lambda s: s['bbox'][0]) for _, row in rows]


def join(spans):
    text = clean(' '.join(' '.join(printed(s) for s in row) for row in lines(spans)))
    text = re.sub(r'(?:_____\s*)+', '_____ ', text).strip()
    return re.sub(r'\s+([.,?!;:])', r'\1', text)


def region(pg, e, texts):
    source = texts[pg['book']][str(pg['pdfPage'])]
    w, h = source['width'], source['height']
    x, y, bw, bh = e['box']
    return [s for s in source['spans'] if x-.003 <= s['bbox'][0]/w < x+bw and
            y+.012 < s['bbox'][1]/h < y+bh], source


def numbered_spans(spans, source, e):
    """Independent vertical lists, including side-by-side matching columns."""
    markers = [s for s in spans if s.get('color') not in HIDDEN and
               re.search('Heavy|Bold|Black', s['font']) and
               re.fullmatch(r'\d{1,2}|[a-jA-J]', clean(s['text']))]
    # Inline gap numbers belong to a continuous text, not independent rows.
    markers = [s for s in markers if not s['text'].strip().isdigit() or not any(
        abs(a['bbox'][1]-s['bbox'][1]) < 2.5 and a['bbox'][0] < s['bbox'][0]-12 and
        re.search('[A-Za-z]', printed(a)) and
        # The right matching column is intentionally separate from the left.
        (s['bbox'][0]-a['bbox'][2] < 45 or s['text'].strip().isdigit())
        for a in spans)]
    groups = []
    for s in sorted(markers, key=lambda s: s['bbox'][0]):
        group = next((g for g in groups if abs(g[0]['bbox'][0]-s['bbox'][0]) < 12), None)
        if group is None:
            groups.append([s])
        else:
            group.append(s)
    valid = []
    for group in groups:
        group.sort(key=lambda s: s['bbox'][1])
        labels = [clean(s['text']) for s in group]
        if len(labels) < 2 or len(labels) != len(set(labels)):
            continue
        if not (all(l.isdigit() for l in labels) or all(l.isalpha() for l in labels)):
            continue
        if any(b['bbox'][1]-a['bbox'][1] < 4 for a, b in zip(group, group[1:])):
            continue
        valid.append(group)
    result = {}
    right_edge = (e['box'][0]+e['box'][2])*source['width']
    bottom_edge = (e['box'][1]+e['box'][3])*source['height']
    for group in valid:
        left = min(s['bbox'][0] for s in group)
        right = min([min(s['bbox'][0] for s in g)-3 for g in valid
                     if min(s['bbox'][0] for s in g) > left+24]+[right_edge])
        for i, marker in enumerate(group):
            bottom = group[i+1]['bbox'][1]-2 if i+1 < len(group) else bottom_edge
            # Examples / other blocks can use a different font but still delimit an item.
            bottom = min([s['bbox'][1]-2 for s in spans if s['bbox'][1] > marker['bbox'][1]+4 and
                          left-3 <= s['bbox'][0] < left+15 and
                          re.match(r'^\d{1,2}(?:\s|$)', clean(s['text']))]+[bottom])
            bottom = min([s['bbox'][1]-2 for s in spans if s['bbox'][1] > marker['bbox'][1]+4 and
                          left-25 <= s['bbox'][0] < right and
                          re.search(r'WORD STORE|GRAMMAR FOCUS|SHOW WHAT|REMEMBER THIS', s['text'])]+[bottom])
            content = [s for s in spans if s is not marker and
                       left-1 <= s['bbox'][0] < right and marker['bbox'][1]-2 <= s['bbox'][1] < bottom]
            # A following section heading is context, not part of the last item.
            stop = min([s['bbox'][1] for s in content if
                        re.search(r'WORD STORE|GRAMMAR FOCUS|SHOW WHAT|REMEMBER THIS', s['text']) or
                        s['size'] > marker['size']+1.2 and re.search('Heavy|Bold|Black', s['font'])]+[bottom])
            text = join([s for s in content if s['bbox'][1] < stop])
            if 3 <= len(text) <= 650 and not re.search(r'\b(?:WORD STORE|SHOW WHAT|REMEMBER THIS|GRAMMAR FOCUS)\b', text):
                result[clean(marker['text'])] = text
    return result


def numbered_text(pg, e):
    """OCR fallback: only complete, unique printed numbered item lists."""
    out = {}; label = None; duplicate = set()
    x, y, w, h = e['box']
    raw = json.loads((R/f'data/ocr/wb-{pg["pdfPage"]}.jpg.json').read_text())
    # OCR page-wide rows may interleave two columns in e.text. Keep the task column.
    right = min(x+w, .525 if e['x'] < .5 else 1)
    raw = sorted([r for r in raw if x-.012 <= r['x'] < right and y+.012 < r['y'] < y+h], key=lambda r: r['y'])
    for row in raw:
        line = clean(row['text'])
        if re.match(r'^(?:SHOW WHAT|REMEMBER|WORD STORE|GRAMMAR FOCUS|[A-Z ]{15,}$)', line):
            break
        m = re.match(r'^(\d{1,2})\s+(.+)', line)
        if m:
            label = m[1]
            if label in out:
                duplicate.add(label)
            out[label] = m[2]
        elif label:
            out[label] += ' '+line
    return {k: re.sub(r'_{2,}', '_____', v) for k, v in out.items()
            if k not in duplicate and 5 <= len(v) <= 650}


def bank_from_spans(spans, intro):
    if not re.search(r'\b(?:in|from) the box\b', intro, re.I):
        return []
    # Printed word boxes use a distinct colour and bold type. Stop at item 1.
    first = min((s['bbox'][1] for s in spans if clean(s['text']) in ['0', '1'] and
                 re.search('Heavy|Bold|Black', s['font'])), default=float('inf'))
    candidates = [s for s in spans if s['bbox'][1] < first and
                  s.get('color') not in HIDDEN | {0, 0x231f20, 0x58595b} and
                  re.search('Heavy|Bold', s['font']) and re.search('[A-Za-z]', s['text'])]
    if not candidates:
        return []
    # A lower heading (e.g. "Comparing and contrasting options") is not a card.
    top = min(s['bbox'][1] for s in candidates)
    colour = min(candidates, key=lambda s: s['bbox'][1])['color']
    candidates = [s for s in candidates if s['color'] == colour and s['bbox'][1] < top+30]
    bank = []
    for row in lines(candidates):
        raw = ' '.join(re.sub(r'([ﬁﬂ])\s*', lambda m: {'ﬁ': 'fi', 'ﬂ': 'fl'}[m[1]], s['text']) for s in row).strip()
        if re.search(r'[.!?:;\d]|\b(?:words|phrases|box|Choose|Complete|SHOW|FOCUS|Formal|Syndrome|stays)\b', raw):
            return []
        if not re.search(r'\S\s{2,}\S', raw):
            return []
        parts = re.split(r'\s{2,}', raw) if re.search(r'\S\s{2,}\S', raw) else raw.split()
        bank.extend(clean(v) for v in parts if clean(v))
    return list(dict.fromkeys(bank)) if 2 <= len(bank) <= 25 else []


def enrich(pages, texts):
    from interactive import instruction
    overrides = json.loads((R/'data/presentation-overrides.json').read_text())
    models = {}; report = {'controls': {}, 'sourceModels': 0, 'prompts': 0, 'printedBanks': 0, 'tasks': []}
    for pg in pages:
        for e in pg['exercises']:
            # No field or key changes: old answers/checks stay valid.
            fields = e['answerSpec'] or e.get('responseFields', [])
            e.setdefault('interaction', {'type': 'oral' if e.get('responseMode') == 'oral' else 'fields'})
            e['nativeInteraction'] = True
            spans, source = region(pg, e, texts)
            items = numbered_text(pg, e) if pg['book'] == 'wb' else numbered_spans(spans, source, e)
            intro = instruction(e)
            prompts = {f['label']: items[f['label']] for f in fields if f['label'] in items}
            # A partial numbered list may have swallowed a missing item. Keep the scan.
            if len(prompts) != len(fields):
                prompts = {}
            if re.search(r'\b(?:Complete|Fill)\b', intro, re.I) and not all('_____' in t for t in prompts.values()):
                prompts = {}
            bank = bank_from_spans(spans, intro) if pg['book'] != 'wb' else []
            model = {'source': {'book': pg['book'], 'page': pg['page'], 'pdfPage': pg['pdfPage'],
                                'method': 'student-ocr' if pg['book'] == 'wb' else 'printed-spans'},
                     'standalone': False}
            if prompts:
                model['prompts'] = prompts
            if bank:
                model['bank'] = bank
            interaction = e['interaction']
            if interaction['type'] == 'fields' and e['answerSpec']:
                # Keep the player's former letter-select affordance, using the
                # complete printed option list (including unused distractors).
                values = sorted(set(re.findall(r'(?:^|\n)\s*([A-Ha-h])(?:[.)]?\s)', e['text'])))
                members = [a for f in fields for group in (f.get('members') or [f['accepted']]) for a in group]
                if len(values) >= 2 and all(re.fullmatch('[A-Ha-h]', a) and
                                            a.casefold() in [v.casefold() for v in values] for a in members):
                    interaction = {'type': 'multi' if any(f.get('kind') == 'set' for f in fields) else 'choices',
                                   'rows': [{'prompt': 'Пункт '+f['label'],
                                             'options': [{'label': v, 'value': v} for v in values]} for f in fields]}
                    e['interaction'] = interaction
            if interaction['type'] in ['choices', 'multi']:
                for f, row in zip(fields, interaction['rows']):
                    if f['label'] in prompts:
                        row['prompt'] = f['label']+'. '+prompts[f['label']]
                    for option in row['options']:
                        value = option['value']
                        values = [o['value'] for o in row['options']]
                        if re.fullmatch('[a-jA-J]', value) and all(v in items for v in values):
                            option['label'] = value+'. '+items[value]
            if interaction['type'] == 'bank' and bank:
                # Preserve the existing value vocabulary; remove accidental heading words.
                if all(any(v.casefold() == a.casefold() for v in bank for a in f['accepted']) for f in fields):
                    interaction['items'] = bank
            if e['id'] in overrides:
                override = overrides[e['id']]
                if 'interaction' in override:
                    e['interaction'] = override['interaction']
                model.update(override.get('model', {}))
                model['source']['reviewed'] = True
            if model.get('prompts') or model.get('bank'):
                models[e['id']] = model
    # Linked Word Stores share their original source and interaction.
    catalog = {e['id']: e for p in pages for e in p['exercises']}
    for e in catalog.values():
        if e.get('wordStore'):
            e['interaction'] = catalog[e['wordStore']]['interaction']
            if e['wordStore'] in models:
                models[e['id']] = models[e['wordStore']]
    for pg in pages:
        for e in pg['exercises']:
            model = models.get(e['id'], {})
            report['tasks'].append({'id': e['id'], 'book': pg['book'], 'unit': pg['unit'],
                                    'type': e['interaction']['type'], 'prompts': len(model.get('prompts', {})),
                                    'originalAvailable': True, 'automatic': bool(e['answerSpec'])})
    report['controls'] = dict(Counter(t['type'] for t in report['tasks']))
    report['sourceModels'] = len(models)
    report['prompts'] = sum(len(m.get('prompts', {})) for m in models.values())
    report['printedBanks'] = sum(bool(m.get('bank')) for m in models.values())
    (R/'assets/focus-models.js').write_text('window.COURSE_FOCUS_MODELS='+json.dumps(models, ensure_ascii=False, separators=(',', ':'))+';\n')
    (R/'audit/presentation.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
    print('Presentation:', {k: v for k, v in report.items() if k != 'tasks'})
