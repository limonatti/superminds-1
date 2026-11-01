"""Keep OCR workbook keys auditable; ambiguous/model answers stay for review."""
import re,json
from pathlib import Path
ROOT=Path(__file__).resolve().parent
trans=str.maketrans({'З':'3','А':'A','В':'B','С':'C','с':'c','а':'a','Т':'T','Н':'H','І':'I','О':'O'})
def extract_workbook_keys():
    groups=[];active=None;lesson=None
    for n in range(78,97):
        ws=json.loads((ROOT/f'work/ocr/wb-{n}.jpg.json').read_text())
        for side,base in enumerate([.060,.355,.650] if n%2==0 else [.074,.369,.664]):
            col=sorted([w for w in ws if base-.012<=w['x']<base+.282 and .05<w['y']<.955],key=lambda w:(round(w['y']/.006),w['x']))
            for w in col:
                t=w['text'].translate(trans)
                m=re.match(r'Lesson\s*([1-8][A-D])',t,re.I);rev=re.match(r'Review\s*([1-8])\s*[-–]\s*([1-8])',t,re.I)
                if m:lesson=m[1].upper();active=None;continue
                if rev:lesson='Review '+rev[1]+'–'+rev[2];active=None;continue
                if 'CUMULATIVE REVIEW' in t:lesson='Cumulative review';active=None;continue
                if lesson and lesson.startswith('Review 1–8') and t in ['GRAMMAR','VOCABULARY']:lesson='Review 1–8 '+t.title();active=None;continue
                if re.fullmatch(r'[A-Z /–-]{4,}',t) and not re.match('POSSIBLE|SAMPLE',t):active=None;continue
                main=re.match(r'^(\d{1,2}[A-H]?)\s+(.+)',t)
                if lesson and abs(w['x']-base)<.010 and main:
                    active={'lesson':lesson,'label':main[1],'pdfPage':n-2,'page':n,'rows':[]};groups.append(active)
                    active['rows'].append(dict(w,text=main[2],first=True,base=base));continue
                if active:active['rows'].append(dict(w,text=t,base=base))
    result={}
    for g in groups:
        raw='\n'.join(w['text'] for w in g['rows']);items=[];current=None;depth=0;prefix=[]
        for row in g['rows']:
            t=row['text']
            if depth==0 and re.fullmatch(r'(?:\d{1,2}\s*[a-zA-Z]\s*){2,}',t):
                for n,a in re.findall(r'(\d{1,2})\s*([a-zA-Z])',t):items.append({'n':n,'answer':a})
                current=items[-1];continue
            m=re.match(r'^(\d{1,2})\s+(.+)',t)
            if m and (depth==0 or row.get('first') or row['x']-row['base']<.041):
                current={'n':m[1],'answer':m[2]};items.append(current)
                depth=0
            elif current:current['answer']+=' '+t
            else:prefix.append(t)
            depth=max(0,depth+t.count('(')-t.count(')'))
        valid=bool(items and not prefix and not re.search(r'possible|sample|students.? own|answers vary|stress|intonation|syllable',raw,re.I))
        for q in items:
            q['answer']=q['answer'].split('(',1)[0].strip()
            if not q['answer'] or len(q['answer'])>85 or any(c in q['answer'] for c in ['…','[',']',';']):valid=False
        nums=[q['n'] for q in items]
        if len(nums)!=len(set(nums)):valid=False
        if nums:
            ns=sorted(map(int,nums))
            if ns!=list(range(ns[0],ns[-1]+1)):valid=False
        key=f"wb|{g['lesson']}|{g['label']}"
        if key in result:result[key]['items']=[];continue
        result[key]={'raw':raw,'items':items if valid else [],'pdf':'resources/wb.pdf','pdfPage':g['pdfPage'],'ocr':True}
    (ROOT/'audit/workbook-source-keys.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
    return result
