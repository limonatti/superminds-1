"""Read every explicit Workbook key in the supplied Teacher's Book.

Keep the printed section/number, sub-item labels, answer variants and provenance.
The typography separates item numbers from numbers inside answers. Visible
strike-through ink is excluded where present; correction keys with flattened
formatting are resolved by the reviewed grading overrides.
"""
from pathlib import Path
import json
import re
import pymupdf as fitz

ROOT = Path(__file__).resolve().parent


def clean(text):
    return ' '.join(text.replace('ﬁ', 'fi').replace('ﬂ', 'fl').replace('\u00ad', '').split())


def slug(text):
    return re.sub(r'[^a-z0-9]', '', text.lower())


def corrected_spans(page):
    strikes = []
    for d in page.get_drawings():
        for item in d['items']:
            if item[0] == 'l':
                a, b = item[1:]
                if abs(a.y-b.y) < .4 and 2 < abs(a.x-b.x) < 200:
                    strikes.append((min(a.x,b.x), max(a.x,b.x), a.y))
    spans = []
    for block in page.get_text('rawdict')['blocks']:
        for line in block.get('lines', []):
            for s in line['spans']:
                kept, removed = [], []
                for c in s['chars']:
                    x0,y0,x1,y1 = c['bbox']
                    crossed = any(left < (x0+x1)/2 < right and y0+(y1-y0)*.25 < y < y0+(y1-y0)*.72 for left,right,y in strikes)
                    (removed if crossed else kept).append(c['c'])
                spans.append({k:s[k] for k in ['font','size','bbox','color']} | {'text':''.join(kept),'removed':''.join(removed),'original':''.join(c['c'] for c in s['chars'])})
    return spans


def grouped_rows(spans):
    rows = []
    for s in sorted(spans, key=lambda s:(s['bbox'][1],s['bbox'][0])):
        if rows and abs(rows[-1][0]-s['bbox'][1]) < 2:
            rows[-1][1].append(s)
        else:
            rows.append([s['bbox'][1],[s]])
    return [(y, sorted(ss,key=lambda s:s['bbox'][0])) for y,ss in rows]


def build():
    doc = fitz.open(ROOT/'resources/books/focus-second-edition-4-teachers-book.pdf')
    records = []
    mode, section, current = 'main', '', None
    active = {}
    def start_record(label, pdf, x, y):
        nonlocal current, active
        current = {'section':section,'mode':mode,'exercise':label,'fields':{},'unlabelled':[],
                   'pdfPages':[pdf],'start':[x,y], 'notes':[], 'struck':[]}
        records.append(current)
        active = {}
    for pdf in range(197,212):
        page = doc[pdf-1]
        spans = corrected_spans(page)
        starts = sorted(set(round(s['bbox'][0],1) for s in spans if re.match(r'^(?:Exercise|Task)\s+\d',clean(s['text']))))
        columns = []
        for x in starts:
            if not columns or x-columns[-1]>80:
                columns.append(x)
        assert len(columns)==4,(pdf,columns)
        for col,x in enumerate(columns):
            end = columns[col+1]-2 if col<3 else page.rect.width-50
            body = [s for s in spans if x-2<=s['bbox'][0]<end and 90<s['bbox'][1]<1198]
            heading = []
            for y,row in grouped_rows(body):
                text = clean(''.join(s['text'] for s in row))
                if not text:
                    continue
                is_section = any('Heavy' in s['font'] and 13<s['size']<14 for s in row)
                if is_section:
                    if not heading:
                        current, active = None, {}
                    heading.append(text)
                    continue
                if heading:
                    label = clean(' '.join(heading)); heading=[]
                    if re.match(r'^\d\.\d+', label):
                        mode,section='main',re.match(r'^\d\.\d+',label)[0]
                    elif 'VOCABULARY BANK' in label:
                        mode='vocabulary'; section=label.split('EXERCISES')[-1].strip()
                    elif 'FOCUS 3' in label:
                        mode='review';section=label.split('REVIEW')[-1].strip()
                    elif 'Train and Try' in label:
                        mode='train';section=re.search(r'Unit\s+\d',label)[0] if re.search(r'Unit\s+\d',label) else ''
                    else:
                        section=label
                ex = re.fullmatch(r'(?:Exercise|Task)\s+(\d+|[AB])',text)
                if ex:
                    start_record(ex[1],pdf,x,y)
                    continue
                # Teacher notes, sample writing and memory boxes are not keys to
                # the preceding numbered exercise.
                if any('Heavy' in s['font'] and 11.5<s['size']<12.5 for s in row):
                    current,active=None,{}
                    continue
                if current is None:
                    continue
                if pdf not in current['pdfPages']:
                    current['pdfPages'].append(pdf)
                if re.search(r'Students.? own|Possible answers|Suggested answers|Extra (?:words|sentences)|(?:in )?any order',text,re.I):
                    current['notes'].append(text)
                    if re.search(r'Students.? own|Possible answers|Suggested answers',text,re.I):
                        current['open']=True
                    if re.match(r'Extra (?:words|sentences)',text,re.I):
                        continue
                # Item markers are printed in Medium; a body word "1" is not a marker.
                markers = [s for s in row if 'Medium' in s['font'] and re.fullmatch(r'(?:\d{1,2}[a-zA-Z]?|[a-zA-Z])',clean(s['text']))]
                for s in markers:
                    label=clean(s['text']); mx=round(s['bbox'][0],1)
                    if label in current['fields']:
                        # Mark duplicate parts for explicit review, never overwrite.
                        current.setdefault('duplicates',[]).append(label)
                    current['fields'].setdefault(label,'')
                    active[mx]=label
                for s in row:
                    if s in markers:
                        continue
                    candidates=[mx for mx in active if mx < s['bbox'][0]+2]
                    label=active[max(candidates)] if candidates else None
                    if label:
                        current['fields'][label]=clean(current['fields'][label]+' '+s['text'])
                    else:
                        current['unlabelled'].append(clean(s['text']))
                    if s['removed'].strip():
                        current['struck'].append({'label':label,'removed':s['removed'],'original':s['original'],'corrected':s['text']})
    # Tidy explicit headings split over a page/column boundary.
    for r in records:
        r['id']=r['mode']+'/'+slug(r['section'])+'/'+r['exercise']
    # The printed key labels conversations 2 and 3 in 7.6 Exercise 4 as
    # "Exercise 2/3". They continue the same task on Workbook p.107.
    base=next(r for r in records if r['id']=='main/76/4')
    parts=[base]+[r for r in records if r['id'] in ['main/76/2','main/76/3'] and r['start'][1]>400]
    merged={}
    for number,part in enumerate(parts,1):
        for k,v in part['fields'].items():
            merged[str(number)+k if k.isalpha() else k]=v
    base['fields']=merged
    base.pop('duplicates',None)
    base['unlabelled']=[]
    base['notes'].append('Three conversation keys, including printed headings Exercise 2 and Exercise 3.')
    records=[r for r in records if r is base or r not in parts]
    out=ROOT/'data/workbook-key-catalog.json'
    out.write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
    print('Workbook key records:',len(records),'fields:',sum(len(r['fields']) for r in records))
    return records


if __name__=='__main__':
    build()
