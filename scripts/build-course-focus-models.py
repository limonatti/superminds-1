"""Presentation models from printed source spans, never from grading answers.

Only unambiguous numbered rows and explicitly printed word boxes are included.
Teacher-answer colour is excluded from candidate banks and replaced by a blank
in prompts. IDs, grading models and stored learner values are not modified.
"""
from pathlib import Path
import json,re,collections
ROOT=Path(__file__).resolve().parents[1]
REDACT={0xda2128,0xffffff}
RED=0xda2128

def clean(s):
    s=re.sub(r'([ﬁﬂ])\s+',r'\1',str(s)).replace('ﬁ','fi').replace('ﬂ','fl')
    s=re.sub(r'(?i)\bfi (?=[a-z])','fi',s)
    s=re.sub(r'(?i)\b(affi|confi|diffi|offi|suffi) (?=[a-z])',r'\1',s)
    return ' '.join(s.split())

def prompt_text(span):
    if span.get('color') in REDACT:return '_____'
    return re.sub(r'[\x00-\x1f@_]{2,}|[\x01]', '_____',clean(span['text']))
def read_js(path):return json.JSONDecoder().raw_decode(path.read_text().split('=',1)[1].lstrip())[0]
def instruction(e):
    lines=[clean(s) for s in e.get('text','').splitlines() if clean(s)]
    start=next((i for i,s in enumerate(lines) if len(s)>14),None)
    if start is None:return ''
    out=lines[start]
    for s in lines[start+1:start+4]:
        if re.search(r'[.!?]$',out) or re.match(r'^\d+[.)]?\s',s):break
        out+=' '+s
    return out

def source_rows(spans):
    rows=[]
    for s in sorted(spans,key=lambda s:(s['bbox'][1],s['bbox'][0])):
        row=next((r for r in reversed(rows[-3:]) if abs(r[0]-s['bbox'][1])<2.5),None)
        if row:row[1].append(s)
        else:rows.append([s['bbox'][1],[s]])
    return [(y,sorted(row,key=lambda s:s['bbox'][0])) for y,row in rows]

def model_for(e,pg,source):
    if not source or not e.get('box'):return {}
    x,y,w,h=e['box'];sw,sh=source['width'],source['height']
    spans=[s for s in source['spans'] if x-.002<=s['bbox'][0]/sw<x+w and y+.006<s['bbox'][1]/sh<y+h and clean(s['text'])]
    fields=e.get('answerSpec') or e.get('responseFields') or []
    labels=[str(f['label']) for f in fields]
    out={};ins=instruction(e)
    # A single column of distinct printed numbers; don't infer labels from keys.
    numbers=[s for s in spans if s.get('color') not in REDACT and re.fullmatch(r'\d{1,2}',clean(s['text'])) and re.search('Heavy|Bold|Black',s.get('font',''))]
    matching={label:[s for s in numbers if clean(s['text'])==label] for label in labels}
    if 2<=len(labels)<=20 and all(label.isdigit() and len(matching[label])==1 for label in labels):
        markers=[matching[label][0] for label in labels]
        if max(s['bbox'][0] for s in markers)-min(s['bbox'][0] for s in markers)<12 and all(markers[i]['bbox'][1]<markers[i+1]['bbox'][1]-3 for i in range(len(markers)-1)):
            prompts={}
            for i,(label,marker) in enumerate(zip(labels,markers)):
                top=marker['bbox'][1]-2;bottom=min([s['bbox'][1]-2 for s in numbers if s['bbox'][1]>marker['bbox'][1]+3]+[(y+h)*sh])
                text=[]
                for yy,row in source_rows([s for s in spans if top<=s['bbox'][1]<bottom and s is not marker]):
                    bits=[prompt_text(s) for s in row]
                    text.append(' '.join(bits))
                prompt=clean(' '.join(text));prompt=re.sub(r'(?:_____\s*){2,}','_____ ',prompt).strip()
                if not 8<=len(prompt)<=300 or re.search(r'[A-Z]{3,}|^\d+\s+(?:Complete|Read|Listen)|[\x00-\x1f]',prompt):break
                prompts[label]=prompt
            if len(prompts)==len(labels) and all('_____' in text for text in prompts.values()):out['prompts']=prompts
    if re.search(r'(?:in|from) the box',ins,re.I):
        first=min((s['bbox'][1] for s in numbers),default=(y+h)*sh)
        bank=[]
        for yy,row in source_rows([s for s in spans if s.get('color') not in REDACT and s['bbox'][1]<first]):
            raw=''.join(s['text'] for s in row)
            if not re.search(r'\S\s{2,}\S',raw):continue
            if re.search(r'[.!?:;]|\b(?:Complete|Listen|Choose|Exercise|SPEAKING|GRAMMAR|heading|box|words|phrases)\b',raw,re.I):continue
            parts=[clean(v).strip('• ') for v in re.split(r'\s{2,}',raw.strip())]
            if len(parts)>=2 and all(1<=len(v)<=55 and re.search('[A-Za-z]',v) and not re.search(r'[\x00-\x1f]|\d',v) for v in parts):bank.extend(parts)
        bank=list(dict.fromkeys(bank))
        if 2<=len(bank)<=30:out['bank']=bank
    if out:
        note=re.search(r'There (?:is|are) [^.\n]*(?:extra|word)[^.\n]*\.',e.get('text',''),re.I)
        if note:out['note']=clean(note[0])
    if out:out['source']={'book':pg['book'],'page':pg['page'],'pdfPage':pg.get('pdfPage'),'method':'printed-spans','excludedAnswerColours':[hex(v) for v in sorted(REDACT)]}
    return out

def build():
    report={}
    for course,global_name in [('focus-2','FOCUS2'),('focus-3','FOCUS3')]:
        base=ROOT/(course+'-active-teach');data=read_js(base/'assets/course.js');models={};texts={}
        for book in ['sb','ws']:
            file=base/f'data/{book}-text.json'
            if file.exists():texts[book]=json.loads(file.read_text())
        for pg in data['pages']:
            source=texts.get(pg['book'],{}).get(str(pg.get('pdfPage')))
            for e in pg['exercises']:
                m=model_for(e,pg,source)
                if m:
                    # These boxes need manual segmentation; never offer partial/merged banks.
                    rejected={'focus-2':{'sb-7-4','sb-22-9','sb-112-1','sb-122-2'},'focus-3':{'sb-50-9','sb-131-2'}}
                    if e['id'] in rejected[course]:m.pop('bank',None)
                    m['standalone']=bool(m.get('prompts')) and not re.search(r'listen|read.*text|photo|picture|article|dialogue|Exercise \d|blue in the text',instruction(e),re.I)
                    if m.get('prompts') or m.get('bank'):models[e['id']]=m
        # Linked worksheets keep the same source-derived presentation contract.
        for pg in data['pages']:
            for e in pg['exercises']:
                if e.get('wordStore') in models:models[e['id']]=models[e['wordStore']]
        (base/'assets/focus-models.js').write_text('window.COURSE_FOCUS_MODELS='+json.dumps(models,ensure_ascii=False,separators=(',',':'))+';\n')
        report[course]={'sourceModels':len(models),'prompts':sum(len(m.get('prompts',{})) for m in models.values()),'printedBanks':sum(bool(m.get('bank')) for m in models.values()),'exerciseIds':list(models)}
    (ROOT/'audit/course-focus-source-models.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({c:{k:v for k,v in r.items() if k!='exerciseIds'} for c,r in report.items()},indent=2))

if __name__=='__main__':build()
