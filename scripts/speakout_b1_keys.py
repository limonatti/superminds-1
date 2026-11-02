"""Read B1 source keys in column order, preserving ambiguous answers for review."""
import re, unicodedata
import pdfplumber

def clean(t):
    t=re.sub(r"\s*([’'])\s*(?=(?:t|s|m|re|ve|ll|d)\b)",r'\1',unicodedata.normalize('NFKC',t))
    return re.sub(r'\s+',' ',t).strip()
def rows(words):
    result=[]
    for w in sorted(words,key=lambda w:(round(w['top']/2)*2,w['x0'])):
        row=next((r for r in result[-3:] if abs(r[0]['top']-w['top'])<2),None)
        if row is None:result.append([w])
        else:row.append(w)
    return [sorted(r,key=lambda w:w['x0']) for r in result]

def extract(root,book):
    path='resources/'+('keys' if book=='sb' else 'wb-keys')+'.pdf'
    groups=[];active=None;lesson='Lead-in';scope='';unit=0
    with pdfplumber.open(root/path) as pdf:
        for ix,page in enumerate(pdf.pages):
            words=page.extract_words(extra_attrs=['fontname','size'],x_tolerance=1.7)
            bases=[49.7,302.8] if book=='sb' else ([60.4,236.2,412.0] if ix%2==0 else [68.9,244.7,420.5])
            for side,base in enumerate(bases):
                right=(297 if side==0 else 560) if book=='sb' else base+170
                left=(0 if side==0 else 297) if book=='sb' else base-3
                for row in rows([w for w in words if left<=w['x0']<right and (90 if book=='sb' else 60)<w['top']<(780 if book=='sb' else 850)]):
                    text=clean(' '.join(w['text'] for w in row));h=row[0];bold='Bold' in h['fontname']
                    m=re.match(r'^(?:Lesson\s+)?([1-8][A-D])(?:\s|$)',text,re.I)
                    rev=re.match(r'^(?:Unit\s+([1-8])\s+Review|(?:CUMULATIVE\s+)?REVIEW\s+([1-8])\s*[–-]\s*([1-8]))',text,re.I)
                    if m and h['size']>=10:lesson=m[1];scope='';active=None;continue
                    if rev:
                        lesson=rev[1]+'R' if rev[1] else 'Review '+rev[2]+'–'+rev[3];scope='';active=None;continue
                    if re.match(r'^Unit\s+[1-8]',text,re.I) and h['size']>=10:
                        unit=int(re.search('[1-8]',text)[0]);lesson=str(unit)+'Intro';scope='';active=None;continue
                    if text=='Lead-in':lesson='Lead-in';scope='';active=None;continue
                    bank=re.match(r'^(Grammar|Vocabulary|Mediation) bank',text,re.I)
                    if bank:scope=' '+bank[1].title();active=None;continue
                    if book=='wb' and text in ['GRAMMAR','VOCABULARY'] and lesson=='Review 1–8':
                        scope=' '+text.title();active=None;continue
                    if bold and h['size']>=10 and not re.fullmatch(r'\d+[A-H]?',text):
                        # Main skill headings end a bank block; they are not answer text.
                        scope='';active=None;continue
                    if book=='wb' and bold and re.fullmatch(r'[A-Z /–-]{4,}',text) and not re.match('POSSIBLE|SAMPLE',text):active=None;continue
                    label=re.fullmatch(r'\d{1,2}[A-H]?',h['text'])
                    # Workbook substeps continue with a bare bold B/C/D at the same margin.
                    if book=='wb' and bold and re.fullmatch('[B-H]',h['text']) and abs(h['x0']-base-5)<3 and active:
                        label=re.match(r'\d+',active['label'])[0]+h['text']
                        active={'lesson':lesson+scope,'label':label,'pdfPage':ix+1,'words':row[1:]};groups.append(active);continue
                    isstart=bool(label and bold and ((book=='sb' and len(row)==1) or (book=='wb' and abs(h['x0']-base)<3)))
                    if isstart:
                        active={'lesson':lesson+scope,'label':h['text'],'pdfPage':ix+1,'words':[]};groups.append(active)
                        active['words'].extend(row[1:]);continue
                    if active:active['words'].extend(row)
    result={}
    for g in groups:
        raw=clean(' '.join(w['text'] for w in g['words']));items=[];current=None;prefix=[];depth=0
        for w in g['words']:
            t=w['text']
            if depth==0 and 'Bold' in w['fontname'] and re.fullmatch(r'\d{1,2}|[a-lA-L]',t):
                current={'n':t,'answer':''};items.append(current)
            elif current:current['answer']+=' '+t
            else:prefix.append(t)
            depth=max(0,depth+t.count('(')-t.count(')'))
        valid=bool(items and not prefix and len({i['n'] for i in items})==len(items))
        for q in items:
            answer=clean(q['answer'])
            if book=='wb':answer=re.sub(r'\s*\([^()]*\)','',answer).strip()
            q['answer']=answer
            if not answer or len(answer)>100 or any(c in answer for c in ['(',')','…',';']):valid=False
        if re.search(r'possible|sample|suggested|students.? own|answers vary|underlin|stress|intonation|syllable',raw,re.I):valid=False
        nums=[int(q['n']) for q in items if q['n'].isdigit()]
        if nums and (len(nums)!=len(items) or sorted(nums)!=list(range(min(nums),max(nums)+1))):valid=False
        key=book+'|'+g['lesson']+'|'+g['label']
        if key in result:
            result[key]['items']=[];result[key]['raw']+='\n'+raw
        else:result[key]={'raw':raw,'items':items if valid else [],'pdf':path,'pdfPage':g['pdfPage']}
    return result
