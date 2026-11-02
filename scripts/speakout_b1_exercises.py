import re,collections
COMMAND=r'(?:Read|Listen|Watch|Work|Choose|Complete|Match|Write|Look|Think|Check|Find|Make|Underline|Put|Learn|Ask|Discuss|Compare|Take|Cover|Practise|Practice|Say|Talk|Use|Go|Correct|Replace|Answer|Give|Tick|Circle|Plan|Prepare|Tell|Rewrite|Record|Repeat|Number|Order|Label|Decide|Add|Notice|Try|Now|Then|Mark|Cross|Study|Turn|Imagine|Reduce|Swap|Change|Post)\b'
def command(t):return bool(re.search(COMMAND,t))
def make_exercises(book,p,ws):
    if p['lesson'] in ['Audioscripts','Videoscripts','Irregular verbs','Answer key']:return []
    if p['lesson']=='Communication Bank':return communication_exercises(p['page'],ws)
    for w in ws:
        w['text']=w['text'].translate(str.maketrans({'З':'3','А':'A','В':'B','С':'C','Е':'E','Н':'H','в':'B'}))
        if re.fullmatch(r'(?:[A-H]|\d{1,2}\s*[A-H])',w['text'].strip()) or re.fullmatch(r'\d{1,2}',w['text'].strip()):
            neighbors=sorted([q for q in ws if .005<q['x']-w['x']<.14 and abs(q['y']-w['y'])<.008],key=lambda q:q['x'])
            if neighbors:w['text']+=' '+' '.join(q['text'] for q in neighbors)
    anchors=[]
    if p['lesson'].endswith('Intro'):
        for w in ws:
            m=re.match(r'^([12])\s',w['text'])
            if m and w['x']<.30 and w['y']>.5:anchors.append(dict(w,label=m[1],number=m[1]))
        if not any(a['label']=='1' for a in anchors):
            candidates=[w for w in ws if w['x']<.30 and w['y']>.5 and 'Watch' in w['text'] and w['h']<.025]
            if candidates:anchors.append(dict(candidates[0],label='1',number='1'))
    primary=[];numeric=[]
    for w in ws:
        if p['lesson'].endswith('Intro'):break
        t=w['text'].strip();m=re.match(r'^(\d{1,2})(?:\s*([A-H])(?=\s|F\s|DI|[•■$]|$))?\s*(.*)$',t)
        if not m or not .06<w['y']<.955 or w['h']>.024 or int(m[1])>15:continue
        n,s,tail=m[1],m[2] or '',m[3]
        if p['lesson'].endswith(' Mediation') and n+s==p['lesson'][:2] and w['y']<.18:continue
        if book=='wb' and s in ('E','F'):s=''
        if book=='wb':tail=re.sub(r'^[EF]\s+(?=[A-Z])','',tail)
        if p['lesson'].endswith(' Grammar') and s and w['y']<.12:continue
        if s and (re.match(COMMAND,tail) or re.search(r'[1-8][.,]\d{2}',tail) or re.match(r'^(?:[EF•$■ФL+*]|The\b|Are\b|Which\b|What\b|How\b|Do\b|In\b|You\b|Join\b|[DI]{1,3}$)',tail)):
            primary.append(dict(w,label=n+s,number=n));continue
        if not s and (re.match(COMMAND,tail) or re.search(r'[1-8][.,]\d{2}',tail) or re.match(r'Can you\b',tail) or ('|' in tail and command(tail))):
            numeric.append(dict(w,label=n,number=n));continue
        if not tail and not s:
            near=[q for q in ws if 0<q['x']-w['x']<.08 and abs(q['y']-w['y'])<.008 and re.match(COMMAND,q['text'])]
            if near:numeric.append(dict(w,label=n,number=n))
    anchors.extend(primary)
    for a in numeric:
        near=[b for b in primary if abs(b['x']-a['x'])<.12]
        if near and abs(a['x']-min(b['x'] for b in near))>(.025 if p['lesson'].endswith(' Grammar') or p['lesson'].endswith(' Mediation') else .009):continue
        if not near and any(b['x']<a['x']-.015 and abs(b['x']-a['x'])<.12 for b in numeric):continue
        anchors.append(a)
    # Lettered substeps are identified by their instruction and their indentation.
    for w in ws:
        m=re.match(r'^([A-Ha-h])\s+(.+)$',w['text'].replace('в ','B ',1).replace('С ','C ',1))
        if not m or w['h']>.025 or not .04<w['y']<.955 or (book=='wb' and m[1].upper()>'D'):continue
        before=[a for a in primary if .008<w['x']-a['x']<(.038 if len(a['number'])==2 else .026) and a['y']<w['y']-.005]
        if not before:continue
        a=max(before,key=lambda a:a['y'])
        if a['label'][-1:].isalpha():anchors.append(dict(w,label=a['number']+m[1].upper(),number=a['number'],x=a['x']))
    # A substep can continue at the top of a second column or the next page.
    for w in ws:
        m=re.match(r'^([B-Hb-h])\s+(.+)$',w['text'].replace('в ','B ',1).replace('С ','C ',1))
        if not m or not command(m[2]) or w['h']>.025 or not .04<w['y']<.955 or (book=='wb' and m[1].upper()>'D'):continue
        if any(abs(a['y']-w['y'])<.008 and abs(a['x']-w['x'])<.04 for a in anchors):continue
        left=[a for a in primary if a['x']<w['x']-.15]
        right=[a for a in anchors if abs(a['x']-(w['x']-.016))<.025]
        if left and (not right or w['y']<min(a['y'] for a in right)):
            a=max(left,key=lambda a:a['y'])
            anchors.append(dict(w,label=a['number']+m[1].upper(),number=a['number'],x=w['x']-.016))
    # Continue B/C/D down a carried column as well as down a numbered column.
    for w in sorted(ws,key=lambda w:w['y']):
        t=w['text'].replace('в ','B ',1).replace('С ','C ',1)
        m=re.match(r'^([B-H])(?:\s+|(?=[•$Ф]))(.+)$',t)
        if not m or not .06<w['y']<.955 or w['h']>.025 or (book=='wb' and m[1]>'D'):continue
        if any(abs(a['y']-w['y'])<.008 and abs(a['x']-w['x'])<.04 for a in anchors):continue
        before=[a for a in anchors if .008<w['x']-a['x']<.026 and a['y']<w['y']-.008]
        if before:
            a=max(before,key=lambda a:a['y'])
            if a['label'][-1:].isalpha():anchors.append(dict(w,label=a['number']+m[1],number=a['number'],x=a['x']))
    anchors.sort(key=lambda a:(a['x'],a['y']))
    unique=[]
    for a in anchors:
        if p['lesson']!='Vocabulary Bank' and any(a['label']==b['label'] for b in unique):continue
        if not any(a['label']==b['label'] and abs(a['y']-b['y'])<.012 and abs(a['x']-b['x'])<.04 for b in unique):unique.append(a)
    anchors=unique;result=[];seen=collections.Counter()
    for a in anchors:
        label=a['label'];seen[label]+=1
        if seen[label]>1:label+='_'+str(seen[label])
        nexty=min([b['y'] for b in anchors if abs(b['x']-a['x'])<.10 and b['y']>a['y']+.012],default=.945)
        right=min([b['x']-.014 for b in anchors if b['x']>a['x']+.18],default=.95)
        x=max(.01,a['x']-.008);y=max(.01,a['y']-.006)
        text='\n'.join(w['text'] for w in sorted(ws,key=lambda w:(round(w['y']/.007),w['x'])) if x<=w['x']<right and y<=w['y']<nexty-.005)
        ex={'label':label,'x':round(a['x']*100,3),'y':round(a['y']*100,3),'box':[round(x*100,3),round(y*100,3),round((right-x)*100,3),round((nexty-y)*100,3)],'text':text}
        if p['lesson']=='Vocabulary Bank':
            heads=[w for w in ws if re.match(r'^[1-8][A-D]\s',w['text']) and w['y']<a['y'] and abs(w['x']-a['x'])<.06]
            if heads:
                h=max(heads,key=lambda w:w['y']);ex['keyLesson']=h['text'][:2]+' Vocabulary';ex['keyLabel']=a['label']
        result.append(ex)
    return sorted(result,key=lambda e:(int(re.match(r'\d+',e['label'])[0]),e['label']))
