"""Build usable controls from printed labels and alternatives, independently of keys.
Unverified/open answers remain teacher-reviewed; never fabricate distractors from keys.
"""
import hashlib, json, re
from pathlib import Path
R=Path(__file__).resolve().parent

def clean(s):return ' '.join(str(s).replace('ﬁ','fi').replace('ﬂ','fl').split())
def norm(s):return clean(s).lower().replace('’',"'")
def spans_for(pg,e,texts):
    page=texts[pg['book']][str(pg['pdfPage'])];w,h=page['width'],page['height'];x,y,bw,bh=e['box']
    spans=[s for s in page['spans'] if x-.003<=s['bbox'][0]/w<x+bw and y+.012<s['bbox'][1]/h<y+bh]
    lines=[]
    for s in sorted(spans,key=lambda s:(s['bbox'][1],s['bbox'][0])):
        if lines and abs(lines[-1][0]-s['bbox'][1])<2.5:lines[-1][1].append(s)
        else:lines.append([s['bbox'][1],[s]])
    return [s for _,line in lines for s in sorted(line,key=lambda s:s['bbox'][0])]

def numbered_key(e):
    fields={};current=None
    for line in e.get('key','').splitlines():
        if not line.strip():continue
        m=re.match(r'^(\d{1,2}[a-z]?)\s+(.+)',line)
        if m:
            if m[1] in fields:return {}
            current=m[1];fields[current]=m[2]
        elif current:fields[current]+=' '+line
        else:return {}
    if any('·' in v for v in fields.values()):return {}
    return fields

def labels_for(pg,e,spans):
    key=numbered_key(e)
    if key:return list(key)
    intro=clean(e['text'][:180])
    m=re.search(r'(?:gaps?|sentences?|questions?|speakers?|statements?|texts?|blogs?)\s+(\d+)\s*[–-]\s*(\d+)',intro,re.I)
    if m and 0<int(m[1])<int(m[2])<=25:return [str(n)for n in range(int(m[1]),int(m[2])+1)]
    if spans:
        numbers=[clean(s['text']) for s in spans if re.search('Heavy|Bold|Black',s['font']) and re.fullmatch(r'\d{1,2}',clean(s['text']))]
    else:
        numbers=re.findall(r'(?:^|\n)\s*(\d{1,2})(?:\s|$)',e['text'])
        if numbers and numbers[0]==e['label']:numbers=numbers[1:]
    numbers=[s for s in numbers if s!='0']
    # Reject duplicated labels / page numbers and incomplete OCR sequences.
    unique=list(dict.fromkeys(numbers))
    if 2<=len(unique)<=25 and len(unique)==len(numbers) and sorted(map(int,unique))==list(range(1,max(map(int,unique))+1)):
        return sorted(unique,key=int)
    return []

def italic_choices(spans):
    rows=[];label=None;tokens=[];groups=[]
    def group():
        raw=clean(' '.join(tokens));options=[clean(s) for s in raw.split('/')]
        if 2<=len(options)<=4 and len(set(options))==len(options) and all(s and len(s)<130 for s in options):groups.append(options)
        tokens.clear()
    def finish():
        group()
        if label:
            for i,options in enumerate(groups):
                name=label if len(groups)==1 else label+'.'+str(i+1)
                rows.append({'label':name,'prompt':'Пункт '+name,'options':[{'label':v,'value':v}for v in options]})
        groups.clear()
    for s in spans:
        value=clean(s['text'])
        if re.fullmatch(r'\d{1,2}',value) and re.search('Heavy|Bold|Black',s['font']):
            finish();label=value
        elif 'Obli' in s['font'] or value=='/':tokens.append(value)
        elif value:group()
    finish()
    labels=[r['label']for r in rows]
    if len(rows)<2 or len(labels)!=len(set(labels)):return []
    return rows

def enrich_interactivity(pages,sources,gaps,texts,key_spec):
    report={'recoveredKeys':[],'structuredResponses':[],'sourceChoices':[],'oralWithWrittenPart':[],'sourceCorrections':[],'coverage':{}}
    # Ranges verified against the actual printed option lists, including OCR omissions.
    choice_ranges={'sb-87-10':'ABCDEF','wb-12-1':'abcdefg','wb-67-4':'ABCD'}
    for pg in pages:
        for e in pg['exercises']:
            before=e['answerVersion'];intro=clean(re.split(r'\n\d+\s*\n',e['text'].lstrip(),maxsplit=1)[0])[:350];spans=spans_for(pg,e,texts) if pg['book']!='wb' else []
            labels=labels_for(pg,e,spans)
            # This is a personal sentence-writing task, not a test of the teacher's grammar notes.
            if e['id']=='sb-24-6':
                e['answerSpec']=[];e['marking']={'mode':'open'};gaps.pop(e['id'],None);report['sourceCorrections'].append(e['id'])
            closed=bool(re.search(r'\bcomplete\b|\bmatch\b|\bchoose\b|\bput\b.+\border\b',intro,re.I))
            personal=bool(re.search(r'true for (?:you|your)|your own ideas|about yourself',intro,re.I))
            keys=numbered_key(e)
            # Recover only complete explicitly numbered finite keys. Leave compact/ambiguous alternatives alone.
            if not e['answerSpec'] and closed and not personal and keys:
                spec=key_spec(keys)
                if spec and not any(re.search(r'\b(?:both answers|suggested|own|e\.g\.)\b',str(f),re.I)for f in spec):
                    e['answerSpec']=spec;e['marking']={'mode':'automatic'};report['recoveredKeys'].append(e['id'])
            # A SPEAKING heading can include a written gap/matching task first.
            if e.get('responseMode')=='oral' and re.search(r'\bcomplete\b|\bmatch\b|\bput\b.+\border\b',intro,re.I) and (e['answerSpec'] or labels):
                e.pop('responseMode');e['marking']['instruction']='Сначала заполни ответы по условию, затем обсуди задание с преподавателем или партнёром.';report['oralWithWrittenPart'].append(e['id'])
            if e.get('responseMode')=='oral':continue
            if e['id']=='sb-26-1':
                names=['bungee jumping','mountain biking','rafting','rock climbing','snowboarding','water skiing']
                e['answerSpec']=[{'label':name,'accepted':[answer]}for name,answer in zip(names,'EBCADF')];e['marking']={'mode':'automatic','instruction':'Сопоставь виды спорта с фотографиями A–F, затем обсуди вопросы.'};report['recoveredKeys'].append(e['id'])
            if not e['answerSpec'] and not e.get('interaction'):
                e['responseFields']=[{'label':v}for v in labels] or [{'label':'Мой ответ','long':True}]
                if labels:report['structuredResponses'].append(e['id'])
            if e['id'] in choice_ranges:
                values=choice_ranges[e['id']];e['interaction']={'type':'choices','rows':[{'prompt':'Пункт '+f['label'],'options':[{'label':v,'value':v}for v in values]}for f in e['answerSpec']]};e['nativeInteraction']=True;report['sourceCorrections'].append(e['id'])
            if not e.get('interaction') and re.search(r'choose.*(?:option|form)|correct option',intro,re.I):
                rows=italic_choices(spans)
                if rows:
                    if e['answerSpec']:
                        by_label={r['label']:r for r in rows}
                        if all(f['label'] in by_label and any(norm(o['value']) in [norm(a)for a in f['accepted']]for o in by_label[f['label']]['options'])for f in e['answerSpec']):
                            rows=[by_label[f['label']]for f in e['answerSpec']]
                        else:rows=[]
                    else:e['responseFields']=[{'label':r['label']}for r in rows]
                    if rows:e['interaction']={'type':'choices','rows':rows};e['nativeInteraction']=True;report['sourceChoices'].append(e['id'])
            if not e.get('interaction'):
                fields=e['answerSpec'] or e.get('responseFields',[])
                match=re.search(r'(?:sentences|options|answers|photos|pictures|texts|statements|headings|responses)\s*\(?([A-Ha-h])\s*[–-]\s*([B-Jb-j])',intro,re.I)
                if match and fields and match[1].lower()<match[2].lower():
                    values=[chr(i)for i in range(ord(match[1]),ord(match[2])+1)]
                    if not e['answerSpec'] or all(any(norm(a)==norm(v)for v in values for a in f['accepted'])for f in fields):
                        e['interaction']={'type':'choices','rows':[{'prompt':'Пункт '+f['label'],'options':[{'label':v,'value':v}for v in values]}for f in fields]};e['nativeInteraction']=True;report['sourceChoices'].append(e['id'])
            if not e.get('interaction'):
                e['interaction']={'type':'fields'}
                # Retain accurately positioned blanks; all other inputs stay visibly beside the source.
                e['nativeInteraction']=e['id'] not in gaps
            if e.get('responseFields') or e['id'] in report['recoveredKeys']+report['oralWithWrittenPart']+['sb-24-6']:
                signature={'fields':e['answerSpec'],'responseFields':e.get('responseFields'),'mode':e.get('responseMode')}
                e['answerVersion']=before if e.get('responseFields')==[{'label':'Мой ответ','long':True}] else hashlib.sha256(json.dumps(signature,sort_keys=True).encode()).hexdigest()[:12]
    # The SB shortcut and actual Word Store worksheet have identical response contracts.
    catalog={e['id']:e for pg in pages for e in pg['exercises']}
    for e in catalog.values():
        if e.get('wordStore') and not e.get('reviewed'):
            target=catalog[e['wordStore']]
            for name in ['answerSpec','answerVersion','responseFields','interaction','nativeInteraction','marking']:
                if name in target:e[name]=target[name]
                else:e.pop(name,None)
            if target['id'] in gaps:gaps[e['id']]=gaps[target['id']]
    for pg in pages:
        for e in pg['exercises']:
            if not e.get('responseMode')=='oral' and not e['marking'].get('instruction'):
                if e.get('interaction',{}).get('type')=='choices':e['marking']['instruction']='Выбери вариант для каждого пункта.'+(' Затем нажми «Проверить».' if e['answerSpec'] else ' Сохрани ответы для проверки преподавателем.')
                elif e.get('responseFields'):e['marking']['instruction']='Заполни ответы по условию и сохрани их. Ответы проверит преподаватель.'
            mode='oral' if e.get('responseMode')=='oral' else 'inline' if e['id'] in gaps and not e.get('nativeInteraction') else e['interaction']['type']
            key=pg['book']+'-'+str(pg['unit']);counts=report['coverage'].setdefault(key,{});counts[mode]=counts.get(mode,0)+1
    (R/'audit/interactivity.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
