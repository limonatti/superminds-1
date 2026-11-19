"""Turn printed, attributed answer keys into explicit grading specifications."""
from pathlib import Path
import json
import re

ROOT=Path(__file__).resolve().parent
REVIEWED_VARIANTS=json.loads((ROOT/'data/answer-variants.json').read_text())


def clean(s):
    return ' '.join(str(s).replace('ﬁ','fi').replace('ﬂ','fl').replace('‘', '’').split())


def slug(s):
    return re.sub(r'[^a-z0-9]','',s.lower())


def key_order(label):
    m=re.match(r'(\d+)(.*)',str(label))
    return (0,int(m[1]),m[2]) if m else (1,0,str(label))


GROUPS=[set(s.lower().split()) for s in [
    'am is are', 'was were', 'has have had', 'can could may might must',
    'will would ’ll ’d', 'would ’d', 'have ’ve', 'has ’s', 'had ’d',
    'shall should', 'need have', 'not never', 'who whom which that', 'if whether',
    'I we you he she they', 'me us him her them you', 'my our his her their your', 'a an the – Ø',
    'here there', 'following next',
    'in on at to for from about through out over with by', 'some any',
    'wasn’t weren’t', 'isn’t aren’t', 'can’t couldn’t', 'didn’t never',
]]


def share_word(a,b):
    a,b=a.lower(),b.lower()
    return any(a in group and b in group for group in GROUPS) or (a.rstrip('ted')==b.rstrip('ted') and len(a)>3 and len(b)>3)


def slash_variants(value):
    if '/' not in value:
        return [value]
    if value.startswith('I wish/If only '):
        return [prefix+v for prefix in ['I wish ','If only '] for v in slash_variants(value[len('I wish/If only '):])]
    # Expand local alternatives independently; a key can contain several
    # pairs ("if/whether I/we ... here/there"). Phrase alternatives stay whole.
    for m in re.finditer(r"([^\s/]+)/\s*([^\s/]+)",value):
        if share_word(m[1],m[2]):
            return list(dict.fromkeys(v for word in [m[1],m[2]] for v in slash_variants(value[:m.start()]+word+value[m.end():])))
    parts=[clean(p) for p in value.split('/')]
    if any(not p for p in parts):
        return []
    if len(parts)==2:
        a,b=parts;aa,bb=a.split(),b.split()
        if share_word(aa[-1],bb[0]):
            return [' '.join(aa+bb[1:]),' '.join(aa[:-1]+bb)]
        if len(aa)==2 and aa[-1] in ['never','not'] and bb[0].replace('n’t','')==aa[0]:
            return [' '.join(aa+bb[1:]),b]
        # Distinct phrases are complete alternatives, e.g. blurred/out of focus.
        return parts
    if all(len(p.split())==1 for p in parts[1:-1]) and all(share_word(parts[0].split()[-1],p.split()[0]) for p in parts[1:]):
        prefix=parts[0].split()[:-1];suffix=parts[-1].split()[1:]
        return [' '.join(prefix+[p.split()[-1] if i==0 else p.split()[0]]+suffix) for i,p in enumerate(parts)]
    return parts


def variants(raw):
    value=clean(raw)
    if value in REVIEWED_VARIANTS:
        return REVIEWED_VARIANTS[value]
    value=re.sub(r'(?<=-)\s+(?=[a-z])','',value)
    if re.fullmatch(r'[–—-]\s*\((?:which/that|that/which)\)',value):
        return ['∅','which','that']
    if not value or re.search(r'Students.? own|suggested (?:answer|possible)|possible answers|answers vary|see (?:the )?(?:Grammar|Exercise|page|p\.)',value,re.I):
        return []
    # Expand optional printed phrases before slash variants. Parentheses are
    # preserved as optional words, not mistaken for part of an answer.
    values=[value]
    for _ in range(5):
        expanded=[];found=False
        for v in values:
            m=re.search(r'\(([^()]*)\)',v)
            if not m:
                expanded.append(v);continue
            found=True
            for middle in ['',m[1]]:
                expanded.append(clean(v[:m.start()]+middle+v[m.end():]))
        values=expanded
        if not found:break
    out=[]
    for v in values:
        out.extend(slash_variants(v))
    return list(dict.fromkeys(clean(v) for v in out if clean(v)))


def field(label,raw,**kwargs):
    accepted=variants(raw)
    return {'label':str(label),'accepted':accepted,**kwargs} if accepted else None


def set_field(label,members):
    members=[variants(m) for m in members]
    if not members or any(not m for m in members):return None
    return {'label':str(label),'kind':'set','members':members,'accepted':['; '.join(m[0] for m in members)]}


def key_spec(fields):
    result=[]
    for label,raw in sorted(fields.items(),key=lambda kv:key_order(kv[0])):
        if label=='0':continue
        f=field(label,raw)
        if not f:return []
        result.append(f)
    return result


# Heading positions in the printed Workbook; a section may begin halfway down
# a page. This avoids mixing repeated exercise numbers in adjacent banks.
HEADINGS=[
    (148,0,0,'vocabulary','people'),(149,1,.071,'vocabulary','home'),
    (150,1,.501,'vocabulary','school'),(151,1,.070,'vocabulary','work'),
    (152,0,.582,'vocabulary','familyandsociallife'),(153,0,.076,'vocabulary','food'),
    (153,0,.297,'vocabulary','shoppingandservices'),(154,0,.069,'vocabulary','travellingandtourism'),
    (154,1,.668,'vocabulary','culture'),(155,1,.387,'vocabulary','sport'),
    (155,1,.551,'vocabulary','health'),(156,0,.551,'vocabulary','scienceandtechnology'),
    (157,0,.072,'vocabulary','thenaturalworld'),(157,1,.286,'vocabulary','stateandsociety'),
    (158,0,.658,'vocabulary','cultureofenglishspeakingcountries'),
    (159,0,0,'review','presenttensesreview'),(160,0,.331,'review','pasttensesreview'),
    (161,1,.075,'review','futuretensesreview'),(163,1,.076,'review','firstsecondandthirdconditionalswishandifonly'),
    (164,1,.401,'review','modalverbsforspeculation'),(166,0,0,'review','reportedspeech'),
    (168,0,0,'review','passiveformshavesomethingdone'),(169,1,.077,'review','articles'),
]
RECORDS=json.loads((ROOT/'data/workbook-key-catalog.json').read_text())
CATALOG={r['id']:r for r in RECORDS}
assert len(CATALOG)==len(RECORDS)


def workbook_record(page,e):
    p=page['page']
    if 4<=p<132:
        unit=(p-4)//16+1
        part=[1,1,2,3,4,4,5,6,7,7,8,8,9,9,10,10][(p-4)%16]
        key=f'main/{unit}{part}/{e["label"]}'
    elif 171<=p<=178:
        key=f'train/unit{p-170}/{e["label"]}'
    elif 148<=p<171:
        at=(p,int(e['x']>.48),e['y'])
        h=max((h for h in HEADINGS if h[:3]<=at),key=lambda h:h[:3])
        key=f'{h[3]}/{h[4]}/{e["label"]}'
    else:
        return None
    return CATALOG.get(key)


def workbook_specs(record,e):
    if not record or record.get('open') or record.get('duplicates'):
        return []
    fields=dict(record['fields'])
    if not fields:
        text=clean(' '.join(record['unlabelled']))
        if not text or 'own answers' in text:return []
        tick=re.fullmatch(r'Tick (?:box|topics) ([\d, and]+)',text)
        if tick:
            labels=re.findall(r'\d+',tick[1])
            return [set_field('Номера',labels)] if len(labels)>1 else [field('Номер',labels[0])]
        values=record['unlabelled']
        labels=sorted(set(re.findall(r'(?:^|\n)\s*(\d+)\s+',e['text'].split('\n',1)[-1])),key=int)
        if len(values)>1 and labels==list(map(str,range(1,len(values)+1))):
            fields=dict(zip(labels,values))
        elif len(values)>1 and len(text)>500:
            return [field('Текст',text,kind='punctuation',long=True)]
        elif len(values)>1 and all(len(v)<65 for v in values) and not re.search(r'[.!?]',text):
            return [set_field('Все ответы',values)]
        else:
            return [field('Ответ',text)] if len(text)<500 else []
    result=[]
    instruction=e.get('instruction') or e['text'].split('\n')[0]
    for label,value in sorted(fields.items(),key=lambda kv:key_order(kv[0])):
        if label=='0':continue
        # A false statement plus its correction are two distinct required parts.
        tf=re.match(r'^([TF])\s*[–—-]\s*(?:No,?\s*)?(.*)',value)
        if tf:
            result.append(field(label,tf[1]))
            if tf[2]:result.append(field(label+' · исправление',tf[2]))
            continue
        # An answer table can have a/b subparts inside one printed row.
        parts=re.match(r'^a\s+(.+?)\s+b\s+(.+)$',value)
        if parts:
            result.extend([field(label+'a',parts[1]),field(label+'b',parts[2])]);continue
        if '➜' in value or '→' in value:
            value=re.split('[➜→]',value)[-1].strip()
        elif re.search(r'correct.*mistake|mistake.*correct',instruction,re.I) and '–' in value:
            corrections=re.split(r',\s*(?=[^,]+–)',value)
            if len(corrections)>1:
                result.extend(field(label+chr(97+i),v.split('–',1)[1].strip()) for i,v in enumerate(corrections))
                continue
            value=value.split('–',1)[1].strip()
        if value=='3' and re.search(r'correct.*mistake|mistake.*correct|cross out',instruction,re.I):
            value='✓'
        if re.fullmatch(r'[A-Za-z](?:\s*(?:&|and)\s*[A-Za-z])+',value):
            result.append(set_field(label,re.split(r'\s*(?:&|and)\s*',value)))
        else:
            result.append(field(label,value))
    return result if all(result) else []
