"""Extract the selectable-text Student's Book key, retaining source references.
Only short, uniquely numbered answer groups qualify for automatic marking.
"""
from pathlib import Path
import re,json,unicodedata
import pdfplumber
ROOT=Path(__file__).resolve().parent
def clean(t):
    t=unicodedata.normalize('NFKC',t)
    t=re.sub(r"\s*([’'])\s*(?=(?:t|s|m|re|ve|ll|d)\b)",r'\1',t)
    return re.sub(r'\s+',' ',t).strip()
def rows(ws):
    result=[]
    for w in sorted(ws,key=lambda w:(w['top'],w['x0'])):
        if not result or abs(result[-1][0]['top']-w['top'])>2.5:result.append([])
        result[-1].append(w)
    return [sorted(row,key=lambda w:w['x0']) for row in result]
def extract():
    groups=[];active=None;lesson='Lead-in';scope='main'
    with pdfplumber.open(ROOT/'resources/keys.pdf') as pdf:
        for ix,page in enumerate(pdf.pages):
            ws=page.extract_words(extra_attrs=['fontname','size'],x_tolerance=1.7)
            for side in [0,1]:
                for row in rows([w for w in ws if (w['x0']>=297)==bool(side) and 90<w['top']<780]):
                    t=clean(' '.join(w['text'] for w in row));h=row[0]
                    if h['size']>=10:
                        m=re.match(r'^([1-8][A-D])(?=\s|[A-Z]|$)',t)
                        review=re.match(r'^Unit ([1-8]) Review',t,re.I)
                        if m:lesson=m[1]
                        elif review:lesson=review[1]+'R'
                        elif t=='Lead-in':lesson='Lead-in'
                        scope='main';active=None;continue
                    if re.search(r'^(Grammar|Vocabulary|Mediation) bank',t,re.I):
                        scope=t.split()[0].lower();active=None;continue
                    if len(row)==1 and 'Bold' in h['fontname'] and re.fullmatch(r'\d{1,2}[A-H]?',t):
                        if scope=='grammar' and int(re.match(r'\d+',t)[0])>=4:scope='main'
                        active={'lesson':lesson,'scope':scope,'label':t,'pdfPage':ix+1,'words':[]};groups.append(active);continue
                    if active:active['words'].extend(row)
    result={}
    for g in groups:
        ws=g.pop('words');raw=clean(' '.join(w['text'] for w in ws));g['raw']=raw
        items=[];current=None;prefix=[]
        for w in ws:
            if 'Bold' in w['fontname'] and re.fullmatch(r'\d{1,2}|[A-La-l]',w['text']):
                current={'n':w['text'],'answer':''};items.append(current)
            elif current:current['answer']+=' '+w['text']
            else:prefix.append(w['text'])
        for item in items:item['answer']=clean(item['answer'])
        nums=[q['n'] for q in items]
        valid=bool(items and not prefix and len(nums)==len(set(nums)))
        if re.search(r'possible|sample|suggested|students.? own|answers vary|underlin|stress|intonation|syllable',raw,re.I):valid=False
        for q in items:
            a=q['answer']
            if not a or len(a)>80 or '(' in a or '…' in a or ';' in a or re.search(r'\b(?:e\.g|answer|because|example)\b',a,re.I):valid=False
        if all(n.isdigit() for n in nums) and nums:
            ordered=sorted(map(int,nums))
            if ordered!=list(range(ordered[0],ordered[-1]+1)):valid=False
        g['items']=sorted(items,key=lambda q:int(q['n']) if q['n'].isdigit() else ord(q['n'][0])) if valid else []
        keylesson=lesson=g['lesson']+({'grammar':' Grammar','vocabulary':' Vocabulary','mediation':' Mediation'}.get(g['scope'],''))
        key=f"sb|{keylesson}|{g['label']}"
        if key in result:
            # Ambiguous duplicates remain linked to source but are never auto-graded.
            result[key]['items']=[];result[key]['raw']+='\n'+raw
        else:result[key]={'raw':raw,'items':g['items'],'pdf':'resources/keys.pdf','pdfPage':g['pdfPage']}
    (ROOT/'audit/source-keys.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
    return result
if __name__=='__main__':
    d=extract();print(len(d),'keys;',sum(bool(v['items']) for v in d.values()),'structured keys')
