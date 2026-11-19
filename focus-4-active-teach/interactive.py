"""Source-based controls and complete finite keys for Focus 4.

Choices and banks come from the student pages. Answers come from the supplied
Teacher's Book. Ambiguous keys and personal responses remain teacher-reviewed.
"""
from pathlib import Path
import collections
import hashlib
import json
import re
from grading import key_spec as complete_key_spec, workbook_record, workbook_specs, key_order
from student_keys import recover

R = Path(__file__).resolve().parent
RED = 0xda2128


def clean(s):
    return ' '.join(str(s).replace('ﬁ', 'fi').replace('ﬂ', 'fl').replace('\x01', ' ').split())


def norm(s):
    return clean(s).lower().replace('’', "'").replace('–', '-').strip(' .,:;')


def instruction(e):
    if e.get('instruction'):
        return e['instruction']
    lines = [s.strip() for s in e['text'].splitlines() if s.strip()]
    start = next((i for i, s in enumerate(lines) if len(s) > 14), None)
    if start is None:
        return ''
    out = lines[start]
    for s in lines[start+1:start+5]:
        if re.search(r'[.!?]$', out) or re.match(r'^\d+\s', s):
            break
        out += ' '+s
    return re.sub(r'^\d+\s+', '', out)


def numbered_key(lines):
    fields = {}
    label = None
    for line in lines:
        line = clean(line)
        # Compact letter keys can be printed in two columns on the same line.
        if re.fullmatch(r'(?:\d{1,2}\s+[A-Ha-h]\s+)+\d{1,2}\s+[A-Ha-h]', line):
            for k, value in re.findall(r'(\d{1,2})\s+([A-Ha-h])', line):
                if k in fields:
                    return {}
                fields[k] = value
            label = None
            continue
        m = re.match(r'^(\d{1,2}[a-z]?)\s+(.+)', line)
        if m:
            label = m[1]
            if label in fields:
                return {}
            fields[label] = m[2]
        elif label:
            fields[label] += ' '+line
        elif line:
            return {}
    return dict(sorted(fields.items(), key=lambda p: (int(re.match(r'\d+', p[0])[0]), p[0])))


def spans(texts, book, pdf):
    p = texts[book][str(pdf)]
    result=[dict(s, x=s['bbox'][0]/p['width'], y=s['bbox'][1]/p['height'],
                 w=(s['bbox'][2]-s['bbox'][0])/p['width'], h=(s['bbox'][3]-s['bbox'][1])/p['height']) for s in p['spans']]
    # A printed initial belongs to the completed word, although only its
    # remaining letters are red in the Teacher's Book.
    if book=='tb':
        for s in result:
            if s['color']!=RED or not re.match(r'^[a-z]',s['text']):continue
            prefix=next((a for a in result if a['color']!=RED and re.fullmatch('[a-z]',a['text']) and -.0015<=s['x']-(a['x']+a['w'])<.003 and abs(s['y']-a['y'])<.0025),None)
            if prefix:s['text']=prefix['text']+s['text']
    return result


def region_rows(pg, e, texts):
    x, y, w, h = e['box']
    return [s for s in spans(texts, pg['book'], pg['pdfPage'])
            if x-.003 <= s['x'] < x+w and y+.012 < s['y'] < y+h and s['color'] != 0xffffff]


def italic_options(rows, labels):
    numbers = [s for s in rows if 'Heavy' in s['font'] and clean(s['text']) in labels]
    result = []
    for label in labels:
        starts = [s for s in numbers if clean(s['text']) == label]
        if len(starts) != 1:
            return []
        top = starts[0]['y']
        bottom = min((s['y'] for s in numbers if s['y'] > top+.004), default=1)
        parts = sorted([s for s in rows if top-.003 <= s['y'] < bottom-.003 and ('Oblique' in s['font'] or clean(s['text']) == '/')], key=lambda s: (round(s['y']/.003), s['x']))
        options = [clean(v) for v in ' '.join(s['text'] for s in parts).split('/')]
        if not 2 <= len(options) <= 4 or any(not v or len(v) > 100 for v in options):
            return []
        result.append({'prompt': 'Пункт '+label, 'options': [{'label': v, 'value': v} for v in options]})
    return result


def numbered_source(text, labels):
    values = {}
    label = None
    # The first line is the exercise instruction, not a numbered answer item.
    for line in text.splitlines()[1:]:
        m = re.match(r'^\s*(\d{1,2}[a-z]?)\s+(.+)', line)
        if m and m[1] in labels:
            label = m[1]
            if label in values:
                return {}
            values[label] = m[2]
        elif label:
            values[label] += ' '+line
    return values


def controls(e, pg, texts):
    intro = instruction(e)
    spec = e['answerSpec']
    fields = spec or e.get('responseFields', [])
    if not fields or e.get('responseMode') == 'oral':
        return
    labels = [f['label'] for f in fields]
    rows = region_rows(pg, e, texts)
    options = None
    ranges = re.search(r'\b([A-Ja-j])\s*[-–—]\s*([A-Ja-j])\b', intro)
    if ranges and ord(ranges[1].upper()) < ord(ranges[2].upper()):
        options = [chr(n) for n in range(ord(ranges[1].upper()), ord(ranges[2].upper())+1)]
    explicit = re.search(r'\bA\s*,\s*B(?:\s*,?\s*(?:or\s*)?C)?(?:\s*,?\s*(?:or\s*)?D)?\b', intro)
    if explicit:
        options = re.findall(r'\b[A-D]\b', explicit[0])
    if not options and re.search(r'\bmatch\b', intro, re.I):
        printed = list(dict.fromkeys(re.findall(r'(?:^|\n)\s*([A-Ja-j])\s+\S', e['text'])))
        if len(printed) < 2:
            printed = sorted(set(clean(s['text']) for s in rows if re.fullmatch(r'[a-j]', clean(s['text']))))
        if len(printed) >= 2:
            options = printed
    if spec and options and all(all(norm(v) in [norm(x) for x in options] for v in f['accepted']) for f in spec):
        e['interaction'] = {'type': 'choices', 'rows': [{'prompt': 'Пункт '+f['label'], 'options': [{'label': v, 'value': v} for v in options]} for f in spec]}
    elif spec and re.search(r'true.*false|\(T\).*\(F\)', intro, re.I) and all(all(v.upper() in ['T', 'F', 'TRUE', 'FALSE', 'NG'] for v in f['accepted']) for f in spec):
        options = ['T', 'F'] + (['NG'] if re.search(r'not given|not stated|doesn.t say', intro, re.I) else [])
        e['interaction'] = {'type': 'choices', 'rows': [{'prompt': 'Пункт '+f['label'], 'options': [{'label': v, 'value': v} for v in options]} for f in spec]}
    elif re.search(r'choose.*(?:option|form|word|verb)|correct option|circle', intro, re.I):
        choices = italic_options(rows, labels) if pg['book'] != 'wb' else []
        if not choices and spec and all(all(re.fullmatch(r"[A-Za-z’'-]+", v) for v in f['accepted']) for f in spec):
            printed = numbered_source(e['text'], labels)
            for f in spec:
                text = printed.get(f['label'], '')
                matches = list(re.finditer(r"\b([A-Za-z’'-]+)\s*/\s*([A-Za-z’'-]+)(?:\s*/\s*([A-Za-z’'-]+))?", text))
                if len(matches) != 1:
                    choices = []
                    break
                match = matches[0]
                values = [v for v in match.groups() if v]
                if 'to' in values or not any(norm(v) in [norm(a) for a in f['accepted']] for v in values):
                    choices = []
                    break
                choices.append({'prompt': text, 'options': [{'label': v, 'value': v} for v in values]})
        if choices and len(choices) == len(fields) and (not spec or all(any(norm(o['value']) in [norm(a) for a in f['accepted']] for o in row['options']) for f, row in zip(spec, choices))):
            e['interaction'] = {'type': 'choices', 'rows': choices}
    # Single-word banks only: preserve printed distractors; never assemble a
    # bank from the answer key or transform the printed words into answers.
    if not e.get('interaction') or e['interaction']['type'] == 'fields':
        if spec and re.search(r'\bin the box\b', intro, re.I) and all(all(re.fullmatch(r"[A-Za-z’'-]+", v) for v in f['accepted']) for f in spec):
            textlines = [s.strip() for s in e['text'].splitlines() if s.strip()]
            banklines = []
            started = False
            for line in textlines:
                if not started:
                    if re.search(r'[.!?]$', line):
                        started = True
                    continue
                if re.match(r'^\d+\s', line) or re.search(r'[.!?_:]', line):
                    break
                if re.fullmatch(r"[A-Za-z’'()\d ×x-]+", line) and len(line.split()) >= 3:
                    banklines.append(line)
                elif banklines:
                    break
            tokens = list(dict.fromkeys(re.findall(r"[A-Za-z’'-]+", ' '.join(banklines))))
            tokens = [v for v in tokens if v not in ['x', 'c', 'r', 'J']]
            if 3 <= len(tokens) <= 20 and all(any(norm(v) in [norm(a) for a in f['accepted']] for v in tokens) for f in spec):
                e['interaction'] = {'type': 'bank', 'items': tokens}
    if e.get('interaction'):
        e['nativeInteraction'] = True


def enhance(pages, texts, workbook_keys):
    evidence = json.loads((R/'data/teacher-evidence.json').read_text())
    overrides=json.loads((R/'data/key-overrides.json').read_text())
    report = {'automatic': [], 'review': [], 'controls': {}, 'units': {}, 'decisions': []}
    for pg in pages:
        for e in pg['exercises']:
            intro = instruction(e)
            personal = bool(re.search(r'^SPEAKING\b|true (?:sentences|for you)|your own|about yourself|then ask and answer|discuss.*partner', intro, re.I))
            closed = bool(re.search(r'\b(?:complete|choose|match|fill|underline|circle)\b|\bput\b.*\border\b|\bwrite\b.*\bform\b|\bcorrect (?:the mistakes|the errors|form)\b', intro, re.I))
            fields = {}
            provenance = None
            record = None
            if pg['book'] == 'wb':
                record = workbook_record(pg,e)
                if record:
                    fields = record['fields']
                    provenance = {'book':'teacher','pdfPage':record['pdfPages'][0], 'pdfPages':record['pdfPages'],
                                  'evidence':'Workbook answer key','record':record['id']}
            elif pg['book'] in ['sb', 'ws']:
                pdf = pg['pdfPage'] + (22 if pg['book'] == 'sb' else 338)
                ts = spans(texts, 'tb', pdf)
                x, y, w, h = e['box']
                if pg['book'] == 'sb':
                    targets = [s for s in ts if 'Heavy' in s['font'] and 13.0 < s['size'] < 14.3 and (clean(s['text']) == e['label'] or re.match(r'^'+re.escape(e['label'])+r'\s+[A-Z]', clean(s['text'])))]
                    target = min(targets, key=lambda s: abs(s['y']-e['y']*.9)+abs(s['x']-e['x']*.9), default=None)
                    if target is None:
                        ts = []
                    else:
                        source = texts['sb'][str(pg['pdfPage'])]
                        source_numbers = [s for s in source['spans'] if 'Heavy' in s['font'] and 9.65 <= s['size'] <= 10.18 and clean(s['text']).split(' ')[0] == e['label']]
                        fontsize = source_numbers[0]['size'] if source_numbers else 9.96
                        teacher = texts['tb'][str(pdf)]
                        sx = target['size']/fontsize * source['width']/teacher['width']
                        sy = target['size']/fontsize * source['height']/teacher['height']
                        ox, oy = target['x']-e['x']*sx, target['y']-e['y']*sy
                        x, y, w, h = x*sx+ox, y*sy+oy, w*sx, h*sy
                inside = lambda s: x-.004 <= s['x'] < x+w+.002 and y+.006 < s['y'] < y+h-.004
                nums = []
                for s in ts:
                    m = re.match(r'^(\d{1,2}[a-z]?)(?:\s|$)', clean(s['text']))
                    if m and inside(s) and 'Heavy' in s['font'] and s['color'] != RED:
                        nums.append(dict(s, label=m[1]))
                reds = [s for s in ts if inside(s) and s['color'] == RED and clean(s['text'])]
                collected = collections.defaultdict(list)
                unresolved = False
                for s in sorted(reds, key=lambda s: (round(s['y']/.003), s['x'])):
                    candidates = [n for n in nums if n['x'] < s['x']+.005 and -.006 < s['y']-n['y'] < .055]
                    if not candidates:
                        unresolved = True
                        break
                    n = min(candidates, key=lambda n: abs(s['y']-n['y'])*45+s['x']-n['x'])
                    if n['label'] != '0':
                        collected[n['label']].append(clean(s['text']))
                if collected and not unresolved:
                    fields = {k: ' '.join(v) for k, v in collected.items()}
                    provenance = {'book': 'teacher', 'pdfPage': pdf, 'evidence': 'numbered red answers'}
                circ = [c for c in evidence.get(str(pdf), {}).get('circles', []) if inside({'x': c['box'][0], 'y': c['box'][1]})]
                if circ and re.search(r'choose|correct option|circle', intro, re.I):
                    cfields = {}
                    for c in circ:
                        cx, cy, cw, ch = c['box']
                        candidates = [n for n in nums if n['x'] < cx+cw/2 and -.008 < cy-n['y'] < .065]
                        n = min(candidates, key=lambda n: abs(cy-n['y'])*50+cx-n['x'], default=None)
                        if not n or n['label'] in cfields:
                            cfields = {}
                            break
                        if n['label'] != '0':
                            cfields[n['label']] = clean(c['text'])
                    if cfields:
                        fields = cfields
                        provenance = {'book': 'teacher', 'pdfPage': pdf, 'evidence': 'red circles'}
                margin = evidence.get(str(pdf), {}).get('margins', {}).get(e['label']) if pg['book'] == 'sb' else None
                if not fields and margin:
                    fields = numbered_key(margin.splitlines())
                    provenance = {'book': 'teacher', 'pdfPage': pdf, 'evidence': 'margin panel'}
                if pg['book'] == 'ws' and re.fullmatch(r'\d[A-F]', e['label']):
                    closed = True
                if pg['book']=='sb':
                    recovered,unmapped=recover(spans(texts,'tb',pdf),e['label'],e['x'],e['y'])
                    if recovered and not unmapped and (not fields or len(recovered)>len(fields)):
                        fields=recovered
                        provenance={'book':'teacher','pdfPage':pdf,'evidence':'Teacher layout red answers'}
                    if re.search(r'choose|correct option|circle',intro,re.I):
                        recovered,unmapped=recover(spans(texts,'tb',pdf),e['label'],e['x'],e['y'],evidence.get(str(pdf),{}).get('circles'))
                        if recovered and not unmapped and (not fields or len(recovered)>len(fields)):
                            fields=recovered
                            provenance={'book':'teacher','pdfPage':pdf,'evidence':'Teacher layout circles'}
            spec = workbook_specs(record,e) if pg['book']=='wb' else complete_key_spec(fields)
            override=overrides.get(e['id'])
            if override:
                spec=override['answerSpec']
                provenance=override['source']
                personal=override.get('mixed',personal)
            report['decisions'].append({'id':e['id'], 'instruction':intro, 'fields':fields, 'source':provenance,
                                        'closed':closed, 'personal':personal, 'accepted':bool(spec)})
            if spec:
                # Keep source item order even when teacher PDF columns differ.
                spec.sort(key=lambda f: key_order(f['label']))
                e['answerSpec'] = spec
                e['key'] = '\n'.join(f['label']+' '+ ' / '.join(f['accepted']) for f in spec)
                e['keySource'] = provenance
                e['marking'] = {'mode': 'mixed' if personal else 'automatic', 'instruction': 'Заполни пункты по условию. Пиши полные слова, включая напечатанные буквы. Несколько ответов одного пункта разделяй запятой.'}
                if any(f.get('kind')=='set' for f in spec):
                    e['marking']['instruction'] += ' Списки ответов разделяй точкой с запятой; их порядок не важен.'
                if override and override.get('instruction'):
                    e['marking']['instruction']=override['instruction']
                e.pop('responseMode', None)
                e.pop('responseFields', None)
                e.pop('interaction', None)
                if any(f.get('long') for f in spec):
                    e['interaction']={'type':'fields'}
                    e['nativeInteraction']=True
                report['automatic'].append(e['id'])
            elif fields and not e.get('responseMode') and set(fields) != {'0'}:
                e['responseFields'] = [{'label': k} for k in fields if k != '0']
                e['interaction'] = {'type': 'fields'}
                report['review'].append(e['id'])
            controls(e, pg, texts)
            e['answerVersion'] = hashlib.sha256(json.dumps({'fields': e['answerSpec'] or e.get('responseFields'), 'mode': e.get('responseMode'), 'interaction': e.get('interaction')}, sort_keys=True).encode()).hexdigest()[:12]
            kind = e.get('interaction', {}).get('type', 'oral' if e.get('responseMode') == 'oral' else 'input')
            report['controls'][kind] = report['controls'].get(kind, 0)+1
            group = f'{pg["book"]}-{pg["unit"]}'
            count = report['units'].setdefault(group, {'total': 0, 'automatic': 0, 'click': 0})
            count['total'] += 1
            count['automatic'] += bool(e['answerSpec'])
            count['click'] += kind in ['choices', 'bank']
    (R/'audit/interactivity.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print('Interactive controls:', report['controls'], 'automatic:', len(report['automatic']))
