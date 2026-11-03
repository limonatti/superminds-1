"""Compile interactive tests from the owner's Word originals and answer keys.

The PDFs remain the visible source. No answer is inferred from exercise text.
"""
from pathlib import Path
import collections
import hashlib
import json
import re
import subprocess
import unicodedata
import xml.etree.ElementTree as ET
import zipfile
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent
WORK = ROOT / 'work/material-interactions'
WORK.mkdir(parents=True, exist_ok=True)
NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
W = '{' + NS['w'] + '}'
DATA = json.loads((ROOT / 'assets/materials-data.js').read_text().split('=', 1)[1].strip().removesuffix(';'))
ISSUES = []


def clean(s):
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFKC', s)).strip()


def norm(s):
    return re.sub(r'[^\w]+', '', clean(s).lower())


def docx_rows(path):
    """Retain tabs/bold and avoid duplicated Word drawing fallback text boxes."""
    archive=zipfile.ZipFile(path)
    document = ET.fromstring(archive.read('word/document.xml'))
    style_nodes={s.get(W+'styleId'):s for s in ET.fromstring(archive.read('word/styles.xml')).findall('w:style',NS)}
    def style_bold(name,seen=None):
        seen=set() if seen is None else seen
        if not name or name in seen or name not in style_nodes:return False
        seen.add(name);s=style_nodes[name];b=s.find('w:rPr/w:b',NS)
        if b is not None:return b.get(W+'val','1') not in ('0','false')
        parent=s.find('w:basedOn',NS)
        return style_bold(parent.get(W+'val') if parent is not None else '',seen)
    def flatten(node):
        if node.tag in (W+'del', W+'txbxContent'):
            return ''
        if node.tag == W+'r':
            strike = node.find('w:rPr/w:strike', NS)
            if strike is not None and strike.get(W+'val', '1') not in ('0','false'):
                return ''
        if node.tag == W+'t':
            return node.text or ''
        if node.tag == W+'sym':
            if node.get(W+'font') == 'Wingdings' and node.get(W+'char') == 'F0FC':
                return '✓'
            raise ValueError('Unmapped Word symbol: '+str(node.attrib))
        if node.tag == W+'tab':
            return '\t'
        if node.tag in (W+'br', W+'cr'):
            return '\n'
        return ''.join(flatten(c) for c in node)
    rows = []
    for p in document.findall('.//w:body//w:p', NS):
        text = flatten(p)
        style = p.find('w:pPr/w:pStyle', NS)
        style = style.get(W+'val', '') if style is not None else ''
        bold = []
        for run in p.findall('w:r', NS):
            b = run.find('w:rPr/w:b', NS)
            value = flatten(run)
            rs=run.find('w:rPr/w:rStyle',NS)
            enabled = b.get(W+'val', '1') not in ('0', 'false') if b is not None else style_bold(rs.get(W+'val') if rs is not None else style)
            if enabled and value.strip():
                if bold and bold[-1]['end']:
                    bold[-1]['text'] += value
                else:
                    bold.append({'text': value, 'end': True})
            elif bold and not value.strip() and bold[-1]['end']:
                bold[-1]['text']+=value
            elif bold:
                bold[-1]['end'] = False
        words=[clean(t).strip(' /') for b in bold for t in b['text'].split('/')]
        row = {'text': text, 'style': style, 'bold': [t for t in words if t and not t.isdigit() and not t.endswith(':')]}
        # DrawingML plus VML fallbacks duplicate some banks. Identical repeated
        # paragraphs are harmless; remove consecutive duplicates only.
        if text.strip() and (not rows or row != rows[-1]):
            rows.append(row)
    return rows


def pdf_pages(path):
    cache = WORK / (path.stem + '.pages.json')
    if not cache.exists():
        cache.write_text(json.dumps([p.extract_text() or '' for p in PdfReader(path).pages], ensure_ascii=False))
    return json.loads(cache.read_text())


def parse_keys():
    result = {}
    for item in DATA['items']:
        if item['category'] != 'tests' or not item['teacher'] or not ('answer-key' in item['id'] or item['id'].endswith('-ak')):
            continue
        rows = docx_rows(ROOT / item['editable'])
        test = None
        part = ''
        exercise = None
        for row in rows:
            text = clean(row['text'])
            m = re.match(r'^(.*?)\s*[•·]\s*Version\s+([ABC]+)$', text)
            if m:
                test = (m[1].strip(), 'C' if item['id'].endswith('-c-ak') else m[2])
                part, exercise = '', None
                continue
            m = re.fullmatch(r'Part\s+([ABC])', text, re.I)
            if m:
                part = m[1].upper()
                exercise = '1' if test and test[0] == 'Diagnostic Test' else None
                continue
            m = re.fullmatch(r'Ex\s*(\d+)', text)
            if m:
                exercise = m[1]
                continue
            if not test or not exercise or text in ('GRAMMAR', 'VOCABULARY', 'HOW TO …', 'HOW TO ...', 'LISTENING', 'READING', 'WRITING', 'SPEAKING'):
                continue
            key = (*test, part, exercise)
            result.setdefault(key, {'lines': [], 'path': item['path']})['lines'].append(row['text'])
    for key, record in result.items():
        text = '\n'.join(record.pop('lines'))
        record['raw'] = text.strip()
        record['manual'] = key[2] == 'C' or bool(re.search(r'Example answers?|Suggested answers?|Students.? own|Accept any|Possible answers?', text, re.I))
        answers = []
        if not record['manual']:
            # Numbered entries begin a paragraph or follow the key's explicit
            # column spacing. A number within an answer is not a new entry.
            markers = list(re.finditer(r'(?:^|\n|\t+| {2,})[ \t]*(\d{1,3})(?=[ \t]|$)', text))
            for i, marker in enumerate(markers):
                value = clean(text[marker.end():markers[i+1].start() if i+1<len(markers) else len(text)])
                if value or '✓' in text:
                    answers.append({'n': marker[1], 'answer': value or '–'})
            if len({a['n'] for a in answers}) != len(answers):
                ISSUES.append({'kind': 'duplicate-key-number', 'key': key, 'answers': answers})
        record['answers'] = answers
    return result


def identity(item):
    name = item['name']
    if 'Diagnostic' in name:
        return ('Diagnostic Test', item['variant'])
    m = re.search(r'unit-test-u(\d)([abc])$', item['id'])
    if m:
        return ('Unit '+m[1]+' Test', m[2].upper())
    m = re.search(r'quick-quiz-u(\d)([abc])$', item['id'])
    if m:
        return ('Unit '+m[1]+' Quick Quiz', m[2].upper())
    m = re.search(r'progress-test-(\d)([abc])$', item['id'])
    if m:
        return ('Progress Test '+m[1], m[2].upper())
    for prefix in ['Quick End of Course Test', 'End of Course Test', 'Mid-course Test']:
        if name.startswith(prefix):
            return (prefix, item['variant'])
    raise ValueError(item)


def student_sections(item):
    if item['editable'].endswith('.docx'):
        rows = docx_rows(ROOT / item['editable'])
    else:
        # The supplied Quick End of Course C is legacy Word. textutil reads the
        # local file without executing document content or macros.
        text = subprocess.check_output(['/usr/bin/textutil', '-convert', 'txt', '-stdout', str(ROOT/item['editable'])], text=True)
        rows = [{'text': l, 'style': '', 'bold': []} for l in text.splitlines() if l.strip()]
    (WORK/(item['id']+'.rows.json')).write_text(json.dumps(rows, ensure_ascii=False, indent=2))
    sections = []
    part, skill = '', ''
    diagnostic = 'diagnostic' in item['id']
    quick = 'quiz' in item['id'] or 'quick-end' in item['id']
    current = None
    counter = 0
    for row in rows:
        text = clean(row['text'])
        m = re.match(r'^Part\s+([ABC])\b', text, re.I)
        if m:
            part = m[1].upper()
            current = None
            continue
        if text.upper() in ('GRAMMAR','VOCABULARY','HOW TO …','HOW TO ...','LISTENING','READING','WRITING','SPEAKING'):
            skill = text
            continue
        rubric = row['style'] == 'Rubric'
        m = re.match(r'^(\d{1,2})\s+\S', text) if rubric else re.match(r'^(\d{1,2})\s*(?:\[Audio [^]]+\]\s*)?(?:Choose|Circle|Complete|Match|Read|Listen|Write|Put|Correct|Make|Underline|Look|Ask|Work|Use|Find|Answer|Tick|Cross|Number|Discuss|Describe)\b', text)
        if m and (rubric or not item['editable'].endswith('.docx')):
            number = m[1]
        elif (diagnostic and not sections and re.match(r'^(Circle|Choose) the correct', text)) or (quick and rubric and re.match(r'^(Circle|Choose) the correct', text)):
            counter += 1
            number = str(counter)
        else:
            if current:
                current['rows'].append(row)
            continue
        instruction = re.sub(r'^\d{1,2}\s*', '', text)
        current = {'id': (part.lower() or 'q')+'-'+number, 'n': number, 'part': part,
                   'skill': skill.title(), 'instruction': instruction, 'numbered':bool(m), 'rows': []}
        sections.append(current)
    return sections


def answer_variants(raw):
    """Only expand alternatives explicitly present in the publisher key."""
    reviewed = {
        'full-time/full time':['full-time','full time'],
        'long-term/long term':['long-term','long term'],
        'I’ve been working/I’ve worked as a waiter for three years.':['I’ve been working as a waiter for three years.','I’ve worked as a waiter for three years.'],
        'I’ve been living/I’ve lived in the country for two years.':['I’ve been living in the country for two years.','I’ve lived in the country for two years.'],
        'they had / they’d played':['they had played','they’d played'],
        'he would / he’d bring':['he would bring','he’d bring'],
        'would / ’d bring':['would bring','’d bring'],
        'would / ’d never yell':['would never yell','’d never yell'],
        '30%/percent / thirty%/percent':['30%','30 percent','thirty%','thirty percent'],
    }
    if raw in reviewed:
        return reviewed[raw]
    if not raw:
        return []
    if re.search(r'\b(?:e\.g\.|etc\.|acceptable|also accept)\b', raw, re.I):
        return [raw]
    variants = [raw]
    # Optional words in parentheses, not phonetic symbols or examiner notes.
    if '(' in raw and ')' in raw and len(raw) < 180:
        variants = [raw]
        for _ in range(5):
            expanded = []
            changed = False
            for value in variants:
                m = re.search(r'\(([^()]+)\)', value)
                if m:
                    changed = True
                    expanded += [value[:m.start()] + x + value[m.end():] for x in ('', m[1])]
                else:
                    expanded.append(value)
            variants = expanded
            if not changed:
                break
    output = []
    for value in variants:
        # Shared-prefix/suffix slash alternatives require a reviewed override;
        # a complete "answer / other answer" remains explicit and safe.
        for phrase in re.split(r'\s+/\s+|\s+OR\s+', value):
            parts=[phrase]
            while any('/' in p for p in parts):
                new=[]
                for p in parts:
                    m=re.search(r'([^\s/]+)/([^\s/]+)',p)
                    if m:new.extend(p[:m.start()]+a+p[m.end():] for a in [m[1],m[2]])
                    else:new.append(p)
                if new==parts:break
                parts=new
            output.extend(parts)
    return list(dict.fromkeys(clean(x) for x in output if clean(x)))


def question_rows(rows):
    questions = {}
    current = None
    for row in rows:
        text = row['text'].strip()
        m = re.match(r'^(\d{1,3})\s*(?=[A-Za-z‘’"_])(.+)', text, re.S)
        if m and not re.match(r'^\d+\s*/\s*\d+$', text):
            current = m[1]
            questions.setdefault(current, {'text': clean(m[2]), 'rows': [], 'bold': row['bold']})
        elif current:
            questions[current]['rows'].append(row)
            if re.match(r'^[A-Z]:',text):
                questions[current]['text']+=' '+clean(text)
                questions[current]['bold'].extend(row['bold'])
    return questions


def letter_options(rows, allowed='ABCDEFGHIJabcdefghij'):
    options = []
    for row in rows:
        text = re.sub(r'(?m)^\s*_+\s*', '', row['text'].strip())
        if not text or re.match(r'^\d', text):
            continue
        # Tabs preserve multiple printed choices on a single Word paragraph.
        hits = list(re.finditer(r'(?:^|\n|\t+| {2,})(['+allowed+r'])[\t ]+', text))
        for i, m in enumerate(hits):
            label = clean(text[m.end():hits[i+1].start() if i+1<len(hits) else len(text)])
            if label and (m[1], label) not in [(o['value'],o['label']) for o in options]:
                options.append({'value': m[1], 'label': label})
    return options


def compile_fields(section, key):
    rows = section['rows']
    questions = question_rows(rows)
    # Superscript gap numbers inside adverts and conversations belong to the
    # following blank/choice, rather than to a separately numbered paragraph.
    for row in rows:
        gaps=list(re.finditer(r'(?<!\d)(\d{1,2})\s*(?=_{2,}|[A-Za-z‘’])',row['text']))
        for index,gap in enumerate(gaps):
            n=gap[1]
            if n not in questions:
                bold=[re.sub(r'^\d+', '', s) for s in row['bold']]
                options=bold[index*2:index*2+2] if len(bold)==len(gaps)*2 else []
                questions[n]={'text':clean(row['text']), 'rows':[], 'bold':options}
    common = letter_options(rows)
    instruction = section['instruction']
    speakers=[{'value':m[2],'label':m[1]} for m in re.finditer(r'\b([A-Z][A-Za-z’\x27-]*)\s+\(([A-Z])\)',instruction)]
    fields = []
    bank = []
    if 'box' in instruction.lower():
        before = []
        for row in rows:
            if re.match(r'^\s*\d+\s', row['text']):
                break
            before.extend(clean(x) for x in re.split(r'\t+| {2,}', row['text']) if clean(x))
        bank = list(dict.fromkeys(before))
        if len(bank)<2 or not all(any(norm(a['answer'])==norm(b) for b in bank) for a in key['answers']):
            bank = []
    for answer in key['answers']:
        number, raw = answer['n'], answer['answer']
        annotated_letter=re.fullmatch(r'([A-Z])\s*[–-]\s*(.+)',raw)
        source_answer=raw
        if annotated_letter:raw=annotated_letter[1]
        q = questions.get(number, {})
        field = {'n': number, 'prompt': q.get('text',''), 'type':'text', 'answers':answer_variants(raw), 'sourceAnswer':source_answer}
        opts = letter_options(q.get('rows',[]), 'ABCDabcd')
        if len(speakers)>=2 and raw in [o['value'] for o in speakers]:
            field.update(type='choice', options=speakers)
        elif len(common)>=2 and len({o['value'] for o in common})==len(common) and raw in [o['value'] for o in common] and re.search(r'Match|words and phrases|phrases \(', instruction, re.I):
            field.update(type='match', options=common)
        elif len(opts)>=2 and len({o['value'] for o in opts})==len(opts) and raw in [o['value'] for o in opts]:
            field.update(type='choice', options=opts)
        elif re.search(r'True|False', instruction, re.I) and raw in ['T','F','NG']:
            opts=[{'value':'T','label':'True'},{'value':'F','label':'False'}]
            if 'NG' in raw or re.search(r'Not Given|Not stated',instruction,re.I):
                opts.append({'value':'NG','label':'Not given'})
            field.update(type='choice',options=opts)
        elif re.search(r'Facts?|Opinions?', instruction, re.I) and raw in ['F','O']:
            field.update(type='choice',options=[{'value':'F','label':'Fact'},{'value':'O','label':'Opinion'}])
        elif re.search(r'Tick',instruction,re.I) and raw in ['✓','–','-']:
            field.update(type='choice',options=[{'value':'✓','label':'Упомянуто ✓'},{'value':'–','label':'Не упомянуто —'}])
        elif len(common)>=2 and len({o['value'] for o in common})==len(common) and raw in [o['value'] for o in common]:
            field.update(type='match',options=common)
        elif '/' in q.get('text','') and re.search(r'Choose|Circle', instruction, re.I):
            words=[re.sub(r'^(?:'+re.escape(number)+r'\s*(?=[A-Za-z‘’])|[A-Z]:\s*)+','',s.strip(' /')) for s in q.get('bold',[]) if s.strip(' /')]
            if len(words)>=2 and any(norm(raw)==norm(o) for o in words):
                field.update(type='choice',options=[{'value':o,'label':o} for o in words])
        elif bank:
            field.update(type='bank',options=[{'value':o,'label':o} for o in bank])
        if field['type']=='text' and re.fullmatch('[A-Ja-j]',raw):
            # If the document has a duplicated letter label but the correct
            # label is unique, retain every printed option with a unique ID.
            if len(opts)>=2 and sum(o['value']==raw for o in opts)==1:
                field.update(type='choice',options=[{**o,'value':o['value'] if sum(x['value']==o['value'] for x in opts)==1 else o['value']+'-'+str(i)} for i,o in enumerate(opts)])
            else:
                letter_range=re.search(r'([A-Ja-j])\s*[–-]\s*([A-Ja-j])',instruction)
                letters=[]
                if letter_range:letters=[chr(n) for n in range(ord(letter_range[1]),ord(letter_range[2])+1)]
                else:
                    enumerated=re.search(r'\b([A-Ja-j]),\s*([A-Ja-j])(?:,\s*([A-Ja-j]))?\s*(?:or|или)\s*([A-Ja-j])\b',instruction)
                    if enumerated:letters=[a for a in enumerated.groups() if a]
                if raw in letters:
                    field.update(type='match' if re.search(r'Match|order',instruction,re.I) else 'choice',options=[{'value':l,'label':l} for l in letters])
        if re.search(r'correct order|words in.*order',instruction,re.I) and q.get('text','').count('/')>=2:
            field.update(type='order',tokens=[t.strip() for t in q['text'].split('/') if t.strip()])
        fields.append(field)
    return fields


def source_pages(sections, pages, item):
    compact=[norm(p) for p in pages]
    cursor=0
    lastpage=0
    for section in sections:
        needle=norm((section['n']+' ' if section['numbered'] else '')+section['instruction'])
        found=None
        for length in (70,35):
            prefix=needle[:length]
            for i in range(lastpage,len(compact)):
                pos=compact[i].find(prefix,cursor if i==lastpage else 0)
                if pos>=0:
                    found=(i,pos+len(prefix));break
            if found:break
        if found:
            start,cursor=found
        else:
            start=lastpage
            ISSUES.append({'kind':'source-page-review','material':item['id'],'section':section['id'],'instruction':section['instruction'],'fallback':start+1})
        section['sourcePage']=start+1
        lastpage=start
    for i,section in enumerate(sections):
        end=sections[i+1]['sourcePage'] if i+1<len(sections) else len(pages)
        section['sourcePages']=list(range(section['sourcePage'],end+1))


def main():
    keys = parse_keys()
    compiled = {}
    report = []
    tests=[r for r in DATA['items'] if r['category']=='tests' and not r['teacher']]
    tests.sort(key=lambda r:(max(r['units'] or [0]),r['id']))
    for item in tests:
        sections=student_sections(item)
        if not sections:
            ISSUES.append({'kind':'empty-material','material':item['id']})
        seen={(s['part'],s['n']) for s in sections}
        for k in keys:
            if k[:2]==identity(item) and (k[2],k[3]) not in seen and ('Diagnostic' not in k[0] or '-part-'+k[2].lower()+'-' in item['id']):
                ISSUES.append({'kind':'unmapped-key-section','material':item['id'],'key':k})
        source_pages(sections,pdf_pages(ROOT/item['path']),item)
        last_audio=[]
        for section in sections:
            keyid=(*identity(item),section['part'],section['n'])
            key=keys.get(keyid)
            if key is None:
                ISSUES.append({'kind':'missing-key','material':item['id'],'section':section['id'],'key':keyid})
                key={'raw':'','manual':True,'answers':[],'path':next(r['path'] for r in DATA['items'] if r['id']==item['keyId'])}
            section['key']={'path':key['path'],'raw':key['raw']}
            manual=key['manual'] or section['skill']=='Writing' and re.search(r'\bwrite\b',section['instruction'],re.I) and not re.match(r'Complete|Choose|Circle',section['instruction'])
            section['fields']=compile_fields(section,key) if not manual else []
            section['mode']='auto' if section['fields'] else 'review'
            section['audio']=[m for m in item['audio'] if m['track'] in section['instruction']]
            if section['audio']:last_audio=section['audio']
            elif section['skill']=='Listening':section['audio']=last_audio
            section['text']='\n'.join(r['text'] for r in section.pop('rows'))
        compiled[item['id']]={'sections':sections}
        report.append({'id':item['id'],'units':item['units'],'sections':len(sections),'auto':sum(s['mode']=='auto' for s in sections),'fields':sum(len(s['fields']) for s in sections)})
    payload={'version':1,'materials':compiled}
    (ROOT/'assets/material-interactions.js').write_text('window.SPEAKOUT_MATERIAL_INTERACTIONS='+json.dumps(payload,ensure_ascii=False,separators=(',',':'))+';\n')
    (WORK/'keys.json').write_text(json.dumps({'|'.join(k):v for k,v in keys.items()},ensure_ascii=False,indent=2))
    kinds=collections.Counter(f['type'] for m in compiled.values() for s in m['sections'] for f in s['fields'])
    audit={'materials':report,'issues':ISSUES,'fieldTypes':dict(kinds),'counts':{'materials':len(report),'sections':sum(r['sections'] for r in report),'fields':sum(r['fields'] for r in report),'manualSections':sum(s['mode']=='review' for m in compiled.values() for s in m['sections'])}}
    (ROOT/'audit/material-interactions.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'counts':audit['counts'],'issues':dict(collections.Counter(i['kind'] for i in ISSUES))},ensure_ascii=False))


if __name__=='__main__':
    main()
