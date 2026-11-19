"""Build Focus 4 from the supplied books, preserving printed tasks and numbering.

Finite keys are aligned with the supplied Teacher's Book. Other responses are
saved for teacher review; no keys are inferred.
"""
from pathlib import Path
from collections import Counter
import hashlib
import json
import re
import math

R = Path(__file__).resolve().parent
TEXT = {b: json.loads((R / f'data/{b}-text.json').read_text()) for b in ['sb', 'wb', 'ws', 'tb']}
MEDIA = set(json.loads((R / 'data/media.json').read_text()))
WB_REPAIRS = json.loads((R/'data/workbook-heading-repairs.json').read_text())
NAMES = ['', 'Live and learn', 'Human nature', 'Living spaces', 'Shopping around',
         'Off to work', 'A matter of fact', 'It’s not rocket science!', 'Costing the earth']
# Printed "Extract from Student's Book recording" references, including OCR-spaced 3.17.
WB_AUDIO = {7: '1.08', 23: '1.24', 39: '2.05', 55: '2.20', 71: '2.37', 87: '3.05', 103: '3.17', 119: '3.36'}
COMMAND = re.compile(r'^(\d{1,2})\s*(?:[★*•]+\s*)?(?:SPEAKING|SHOW|Read|Complete|Write|Circle|Match|Rewrite|Look|Work|Now|USE|Choose|Make|Study|Underline|Find|Answer|Put|Use|Label|Tick|Describe|Add|What|Order|How|Think|Join|Correct|Combine|Listen|Watch|Ask|Check|Compare|In pairs|Imagine|Translate|Change|Decide|Which|Cross|Are|Do|Replace|Turn|Give|Follow|Have|Prepare|Discuss|Report|Rearrange|You|Talk|Mark|Explain|Reorder|Would|Select|Practise|Practice|Identify)\b', re.I)


def clean(s):
    return ' '.join(s.replace('ﬁ', 'fi').replace('ﬂ', 'fl').replace('\x01', ' ').split())


def write(path, value):
    (R / path).write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':')))


def rows(book, pdf):
    pg = TEXT[book][str(pdf)]
    return [dict(s, x=s['bbox'][0]/pg['width'], y=s['bbox'][1]/pg['height']) for s in pg['spans']]


def image_size(book, pdf):
    pg = TEXT[book][str(pdf)]
    return [1600, math.ceil(1600*pg['height']/pg['width'])]


def lines(spans):
    grouped = []
    for s in sorted(spans, key=lambda s: (round(s['bbox'][1]/2), s['bbox'][0])):
        if grouped and abs(grouped[-1][0]-s['bbox'][1]) < 3:
            grouped[-1][1].append(s)
        else:
            grouped.append([s['bbox'][1], [s]])
    return [clean(' '.join(s['text'] for s in sorted(line, key=lambda s: s['bbox'][0]))) for _, line in grouped]


# Read the Teacher's Book in column order, retaining provenance for every key.
keys = {}
section = ''
current = None
for pdf in range(197, 209):
    spans = TEXT['tb'][str(pdf)]['spans']
    columns = []
    for x in sorted(set(round(s['bbox'][0]) for s in spans if re.match(r'^Exercise\s', s['text']))):
        if not columns or x-columns[-1] > 10:
            columns.append(x)
    for i, left in enumerate(columns):
        right = columns[i+1]-2 if i+1 < len(columns) else 860
        for text in lines([s for s in spans if left-3 <= s['bbox'][0] < right and 80 < s['bbox'][1] < 1198]):
            heading = re.match(r'^([1-8]\.\d{1,2})\s', text)
            if heading:
                section, current = heading[1], None
                continue
            ex = re.fullmatch(r'Exercise\s+(\d+|[AB])', text)
            if ex and section:
                identifier = section+'-'+ex[1]
                if identifier in keys:
                    keys[identifier]['ambiguous'] = True
                current = keys.setdefault(identifier, {'lines': [], 'pdfPage': pdf, 'ambiguous': False})
                continue
            if re.search(r'^(VOCABULARY BANK|GRAMMAR REVIEW|Train and Try|ANSWER KEY|FOCUS 3)', text, re.I):
                section, current = '', None
            if re.search(r'^(REMEMBER BETTER|Students.? own|Possible answers|Suggested answers)', text, re.I):
                current = None
            if current is not None:
                current['lines'].append(text)
for record in keys.values():
    fields = {}
    label = None
    for line in record['lines']:
        m = re.match(r'^(\d{1,2}[a-z]?)\s+(.+)', line)
        if m:
            label = m[1]
            if label in fields:
                record['ambiguous'] = True
            fields[label] = m[2]
        elif label:
            fields[label] += ' '+line
        elif line:
            record['ambiguous'] = True
    record['fields'] = fields
write('data/workbook-keys.json', keys)


def anchors_for(book, printed, spans):
    result = []
    if book == 'wb' and not (4 <= printed < 132 or 148 <= printed < 179):
        return result
    if book == 'sb' and not 4 <= printed < 172:
        return result
    if book == 'ws' and not 2 <= printed < 18:
        return result
    for s in spans:
        text = clean(re.sub(r'[★*•]', '', s['text'])) if book == 'wb' else clean(s['text'])
        if book == 'wb' and ((printed in [34, 66, 98, 130] and re.match(r'^\d+\s+(?:What|Do|Would|Is|Are)\b', text)) or (printed == 95 and re.match(r'^1\s+have\b', text))):
            continue  # Questions inside a speaking card, or OCR "I" as "1".
        label = None
        if book in ['sb', 'ws']:
            if 'Heavy' in s['font'] and 9.65 <= s['size'] <= 10.18:
                command = COMMAND.match(text)
                if re.fullmatch(r'\d{1,2}', text):
                    label = text
                elif command:
                    label = command[1]
            if book == 'ws':
                match = re.match(r'^WORD STORE (\d[A-F])', text)
                if match:
                    label = match[1]
        elif book == 'wb':
            match = COMMAND.match(text)
            if not match and re.fullmatch(r'\d{1,2}', text):
                neighbours = [q for q in spans if abs(q['y']-s['y']) < .008 and .003 < q['x']-s['x'] < .09]
                if any(COMMAND.match(text+' '+clean(re.sub(r'[★*•]', '', q['text']))) for q in neighbours):
                    match = re.match(r'(\d+)', text)
            if match and (.001 < s['x'] < .15 or .45 < s['x'] < .62):
                label = match[1]
        if label and .01 < s['y'] < .95 and not any(a['label'] == label and abs(a['x']-s['x']) < .02 and abs(a['y']-s['y']) < .01 for a in result):
            result.append({'label': label, 'x': s['x'], 'y': s['y']})
    if book == 'wb':
        filtered = []
        for side in [False, True]:
            group = [a for a in result if (a['x'] > .45) == side]
            if group:
                margin = min(a['x'] for a in group)
                filtered.extend(a for a in group if a['x'] < margin+.014)
        result = filtered
        # These printed headings have missing/damaged numerals in the PDF's
        # embedded OCR. Recover only reviewed headings from the page-image OCR.
        recovered = {31: ['2', '3'], 46: ['1', '2'], 62: ['2', '3'], 68: ['2'],
                     78: ['3', '4'], 80: ['4', '5', '6'], 108: ['2'], 112: ['4', '5']}
        if printed in recovered:
            for s in json.loads((R/f'data/ocr/wb-{printed+2}.jpg.json').read_text()):
                match = COMMAND.match(clean(re.sub(r'[★*•☆]', '', s['text'])))
                if match and match[1] in recovered[printed] and (.015 < s['x'] < .055 or .51 < s['x'] < .54):
                    if not any(abs(a['x']-s['x']) < .04 and abs(a['y']-s['y']) < .017 for a in result):
                        result.append({'label': match[1], 'x': s['x'], 'y': s['y']})
        for repair in WB_REPAIRS:
            if repair['page'] != printed:
                continue
            near=next((a for a in result if abs(a['x']-repair['x'])<.035 and abs(a['y']-repair['y'])<.018),None)
            if near:
                near['label']=repair['label']
            else:
                result.append({k:repair[k] for k in ['label','x','y']})
        # Numbered planning steps and examples inside tasks are not new tasks.
        result=[a for a in result if not (
            (printed==31 and a['label'] in ['2','3']) or
            (printed==56 and a['label']=='3' and a['x']>.45) or
            (printed==167 and a['label']=='3' and a['x']<.45) or
            (printed==172 and a['label']=='7'))]
    return result


def printed_labels(region):
    values = []
    for s in region:
        text = clean(s['text'])
        m = re.match(r'^(\d{1,2})\s*(?:$|\s[A-Za-z])', text)
        if m and re.search(r'Heavy|Bold', s['font']) and s['color'] != 0xffffff:
            values.append(m[1])
    unique = sorted(set(v for v in values if 0 < int(v) < 25), key=int)
    return unique if len(unique) >= 2 and list(map(int, unique)) == list(range(1, int(unique[-1])+1)) else []


pages, sources = [], {}
for book in ['sb', 'wb', 'ws']:
    # Student book numbering equals PDF numbering; WB has two front pages, WS one.
    offset = {'sb': 0, 'wb': 2, 'ws': 1}[book]
    for pdf in range(2 if book != 'wb' else 3, len(TEXT[book])+1):
        printed = pdf-offset
        unit = max(1, min(8, (printed-4)//16+1)) if book != 'ws' else max(1, printed//2)
        bank = None
        if book == 'sb' and not 4 <= printed < 132:
            unit = 'extra'
            bank = 'Contents' if printed < 4 else 'Video worksheets' if printed < 148 else 'Grammar & Use of English' if printed < 172 else 'Reference'
        if book == 'wb' and not 4 <= printed < 132:
            unit = 'extra'
            bank = 'Workbook guide' if printed < 4 else 'Vocabulary Bank' if printed < 159 else 'Focus 3 Grammar Review' if printed < 171 else 'Grammar: Train and Try Again' if printed < 179 else 'Writing Bank' if printed < 185 else 'Answer keys'
        if book == 'ws' and not 2 <= printed < 18:
            unit, bank = 'extra', 'Contents & reference'
        spans = rows(book, pdf)
        anchors = anchors_for(book, printed, spans)
        columns = []
        for x in sorted(a['x'] for a in anchors):
            if not columns or x-columns[-1] > .12:
                columns.append(x)
        for a in anchors:
            a['col'] = min(range(len(columns)), key=lambda i: abs(columns[i]-a['x']))
        anchors.sort(key=lambda a: (a['col'], a['y']))
        image = f'assets/pages/{book}-{pdf}.jpg'
        size = image_size(book, pdf)
        exercises, seen = [], Counter()
        for ordinal, a in enumerate(anchors, 1):
            seen[a['label']] += 1
            label = a['label']
            ident = f'{book}-{printed}-{ordinal if book == "ws" else label}'
            if book != 'ws' and seen[label] > 1:
                ident += f'-b{seen[label]}'
            # Preserve progress IDs for real tasks whose printed numbers were
            # previously misread or shadowed by a numbered example.
            if book=='wb' and printed==159 and label=='3':ident='wb-159-2-b2'
            if book=='wb' and printed==167 and label=='3':ident='wb-167-3-b2'
            bottom = min((b['y'] for b in anchors if b['col'] == a['col'] and b['y'] > a['y']+.01), default=.955)
            left = max(.001, a['x']-.01)
            right = columns[a['col']+1]-.014 if a['col']+1 < len(columns) else .985
            box = [left, a['y']-.003, right-left, max(.015, bottom-a['y']-.004)]
            region = [s for s in spans if left-.002 <= s['x'] < right and a['y']-.005 <= s['y'] < bottom-.004 and s['color'] != 0xffffff]
            text = '\n'.join(lines(region))
            instruction = clean(text)[:350]
            if book in ['sb', 'ws']:
                heading_spans = [s for s in region if 'AvenirLTPro-Heavy' in s['font'] and 8.8 <= s['size'] <= 10.18 and s['color'] not in [0x58595b, 0xffffff] and s['y'] < a['y']+.14]
                if heading_spans:
                    ordered = sorted(heading_spans, key=lambda s: s['y'])
                    contiguous = [ordered[0]]
                    for s in ordered[1:]:
                        if s['y']-contiguous[-1]['y'] > .025:
                            break
                        contiguous.append(s)
                    heading = clean(' '.join(lines(contiguous)))
                    if len(heading) > 15:
                        instruction = heading
            # The full task and adjoining page remain available alongside cropped questions.
            src = [{'image': image, 'page': printed, 'size': size, 'box': box},
                   {'image': image, 'page': printed, 'size': size, 'box': [0, 0, 1, 1], 'context': True}]
            sources[ident] = {'label': label, 'sources': src}
            labels = printed_labels([s for s in region if s['y'] > a['y']+.012])
            ex = dict(id=ident, label=label, x=a['x'], y=a['y'], box=box, text=text, key='', keySource=None,
                      answerSpec=[], marking={'mode': 'open'}, answers=[])
            if book != 'wb':
                ex['instruction'] = 'WORD STORE '+label if book == 'ws' and re.fullmatch(r'\d[A-F]', label) else re.sub(r'^\d+\s+', '', instruction)
            personal = bool(re.search(r'\bSPEAKING\b|true (?:sentences|for you)|your own|about yourself|\bdiscuss\b', instruction, re.I))
            if book == 'wb' and isinstance(unit, int):
                part = [1, 1, 2, 3, 4, 4, 5, 6, 7, 7, 8, 8, 9, 9, 10, 10][(printed-4) % 16]
                record = keys.get(f'{unit}.{part}-{label}')
                if record and not record['ambiguous']:
                    fields = record['fields']
                    # Reject commentary, multi-part alternatives and incomplete source alignment.
                    finite = all(re.fullmatch(r'[A-Za-z’\' -]{1,65}', value) and len(value.split()) <= 7 and not re.search(r'own|possible|accept|example|incorrect|correct|suggested', value, re.I) for value in fields.values())
                    closed = bool(re.search(r'complete|match|choose|fill|put|circle|underline', instruction, re.I))
                    if fields and list(fields) == labels and finite and closed and not personal:
                        ex['answerSpec'] = [{'label': k, 'accepted': [v]} for k, v in fields.items()]
                        ex['key'] = '\n'.join(k+' '+v for k, v in fields.items())
                        ex['keySource'] = {'book': 'teacher', 'pdfPage': record['pdfPage']}
                        ex['marking'] = {'mode': 'automatic', 'instruction': 'Впиши полный ответ для каждого пункта, включая уже напечатанные буквы.'}
            oral = re.search(r'^\d+\s+(?:SPEAKING|In pairs|Discuss|Talk about)', instruction, re.I) and not re.search(r'complete|match|write|put', instruction, re.I)
            if oral:
                ex['responseMode'] = 'oral'
                ex['marking']['instruction'] = 'Обсуди задание с преподавателем или партнёром и отметь выполнение.'
            elif not ex['answerSpec']:
                ex['responseFields'] = [{'label': v} for v in labels] or [{'label': 'Мой ответ', 'long': True}]
                ex['interaction'] = {'type': 'fields'}
                ex['nativeInteraction'] = True
            ex['answerVersion'] = hashlib.sha256(json.dumps([ex['answerSpec'], ex.get('responseFields'), ex.get('responseMode')], sort_keys=True).encode()).hexdigest()[:12]
            exercises.append(ex)
        tracks = []
        audio_text = ' '.join(s['text'] for s in spans if book == 'wb' or ('Black' in s['font'] and s['color'] == 0xffffff))
        for match in re.finditer(r'(?<!\d)([1-3])[.,](\d{1,2})(?!\d)', audio_text):
            track = f'{match[1]}.{int(match[2]):02}'
            if f'media/sb-{track}.mp3' in MEDIA:
                tracks.append(track)
        if book == 'wb':
            tracks = [WB_AUDIO[printed]] if printed in WB_AUDIO else []
        pages.append(dict(id=f'{book}-{printed}', book=book, page=printed, pdfPage=pdf, image=image,
                          unit=unit, title=bank or NAMES[unit], bank=bank, exercises=exercises, tracks=list(dict.fromkeys(tracks))))

from interactive import enhance
enhance(pages, TEXT, keys)

# Preserve complete two-page readings and the actual Word Store tasks linked from SB.
lookup = {(p['book'], p['page']): p for p in pages}
groups = {e['label']: e for p in pages if p['book'] == 'ws' for e in p['exercises'] if re.fullmatch(r'\d[A-F]', e['label'])}
for pg in pages:
    for e in pg['exercises']:
        if pg['book'] in ['sb', 'wb']:
            peer = lookup.get((pg['book'], pg['page']+1 if pg['page'] % 2 == 0 else pg['page']-1))
            if peer and peer['unit'] == pg['unit']:
                sources[e['id']]['sources'].append({'image': peer['image'], 'page': peer['page'], 'size': image_size(peer['book'], peer['pdfPage']), 'box': [0, 0, 1, 1], 'context': True})
        m = re.search(r'(?:Complete|Label the pictures in)\s+WORD STORE\s+(\d[A-F])', clean(e['text']), re.I)
        if pg['book'] == 'sb' and m and m[1] in groups:
            target = groups[m[1]]
            e['wordStore'] = target['id']
            sources[e['id']]['sources'] = sources[target['id']]['sources']+sources[e['id']]['sources']
            for key in ['responseFields', 'responseMode', 'interaction', 'nativeInteraction']:
                e.pop(key, None)
            for key in ['answerSpec', 'answerVersion', 'key', 'keySource', 'marking', 'responseFields', 'interaction', 'nativeInteraction']:
                if key in target:
                    e[key] = target[key]

from presentation import enrich
enrich(pages, TEXT)

# Check the complete printed Workbook catalogue, not just the imported subset.
from grading import RECORDS, workbook_record
mapped = {}
for pg in pages:
    if pg['book'] != 'wb':
        continue
    for e in pg['exercises']:
        record = workbook_record(pg, e)
        if record:
            assert record['id'] not in mapped, ('Repeated key', record['id'])
            mapped[record['id']] = e
assert set(mapped) == {r['id'] for r in RECORDS}, 'Workbook key missing its exercise'
assert all(mapped[r['id']]['answerSpec'] for r in RECORDS if not r.get('open')), 'Unmarked finite Workbook key'
assert all(e['answerSpec'] for pg in pages if pg['book']=='ws' for e in pg['exercises']), 'Unmarked Word Store key'
decisions = {d['id']: d for d in json.loads((R/'audit/interactivity.json').read_text())['decisions']}
unresolved = [e['id'] for pg in pages for e in pg['exercises']
              if decisions[e['id']]['fields'] and not e['answerSpec'] and e['id'] != 'sb-78-2']
assert not unresolved, ('Extracted keys still ungraded', unresolved)
write('audit/key-coverage.json', {
    'workbook': [{'record':r['id'], 'exercise':mapped[r['id']]['id'], 'automatic':bool(mapped[r['id']]['answerSpec']),
                  'reason':'Students’ own answers' if r.get('open') else 'Explicit printed key', 'pdfPages':r['pdfPages']} for r in RECORDS],
    'exercises': [{'id':e['id'],'automatic':bool(e['answerSpec']), 'fields':len(e['answerSpec']),
                   'source':e.get('keySource'), 'wordStore':e.get('wordStore'),
                   'reason': 'Fixed key' if e['answerSpec'] else 'Personal, creative, practice or discussion task without a fixed answer key'}
                  for pg in pages for e in pg['exercises']],
    'unresolvedExtractedKeys': unresolved,
    'reviewedExclusion': {'sb-78-2':'Personal opinion; red numbers inside its essay belong to Exercise 3, whose six answers are graded separately.'}
})

data = {'id': 'focus-4', 'units': NAMES, 'pages': pages,
        'tracks': {'sb': [Path(p).stem[3:] for p in sorted(MEDIA) if p.startswith('media/sb-')],
                   'wb': list(dict.fromkeys(t for p in pages if p['book'] == 'wb' for t in p['tracks'])), 'ws': []},
        'resources': json.loads((R/'data/resources.json').read_text()), 'videos': []}
for path, name, value in [('assets/course.js', 'FOCUS4', data), ('assets/exercise-sources.js', 'EXERCISE_SOURCES', sources), ('assets/exercise-gaps.js', 'EXERCISE_GAPS', {})]:
    (R/path).write_text('window.'+name+' = '+json.dumps(value, ensure_ascii=False, separators=(',', ':'))+';\n')
coverage = {book: {'pages': sum(p['book'] == book for p in pages),
                  'exercises': sum(len(p['exercises']) for p in pages if p['book'] == book),
                  'automatic': sum(bool(e['answerSpec']) for p in pages if p['book'] == book for e in p['exercises'])} for book in ['sb', 'wb', 'ws']}
write('audit/coverage.json', coverage)
print(json.dumps(coverage, indent=2))
