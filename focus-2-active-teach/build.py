"""Build Focus 2 from original page images, PDF text geometry and teacher answer keys.
Ambiguous keys remain teacher-reviewed; original conditions are always available.
"""
from pathlib import Path
import json, re, hashlib, collections, statistics
from PIL import Image

R = Path(__file__).resolve().parent
TEXT = {b: json.loads((R/f'data/{b}-text.json').read_text()) for b in ['sb','wb','ws','tb']}
NAMES = ['', 'Lives people live', 'Science and technology', 'The arts', 'Home sweet home', 'Time to learn', 'Just the job', 'Consumer society', 'Well-being']
def clean(t):
    return ' '.join(t.replace('ﬁ','fi').replace('ﬂ','fl').replace('\x01',' ').split())
def write(path, data):
    (R/path).write_text(json.dumps(data, ensure_ascii=False, separators=(',',':')))
def key_spec(fields):
    result = []
    for label, value in fields.items():
        value = clean(value)
        if not value or len(value)>300 or re.search(r'own answers|possible|e\.g\.|any order|Exercise|accept|example|answers vary',value,re.I): return []
        variants = [value]
        if '/' in value:
            parts = [p.strip() for p in value.split('/')]
            if len(parts)==2 and all(parts):
                left,right = parts
                if len(left.split())<len(right.split()) and len(left.split())<=2:
                    prefix = right.split()[0]
                    if prefix in ['is','are','am','has','have','had','will','would','do','does','did','can','cannot']:
                        tail = right.split()[1:]
                        if left.endswith(('n’t', "n't")) and tail and tail[0]=='not':tail=tail[1:]
                        left += ' ' + ' '.join(tail)
                variants += [left,right]
            else: return []
        if '(' in value:
            variants.append(clean(re.sub(r'\([^)]*\)','',value)))
            variants.append(value.replace('(','').replace(')',''))
        result.append({'label':label,'accepted':list(dict.fromkeys(v for v in variants if v))})
    return result

# Teacher WB keys have FIVE columns, whose PDF stream order is not reading order.
WK = {}; section = ''; current = None
for pdf in range(180,191):
    spans = TEXT['tb'][str(pdf)]['spans']
    columns = sorted(set(round(s['bbox'][0],0) for s in spans if re.match(r'^Exercise\s',s['text'])))
    columns = [x for i,x in enumerate(columns) if i==0 or x-columns[i-1]>10]
    for ci,left in enumerate(columns):
        right = columns[ci+1]-2 if ci+1<len(columns) else 860
        ss = [s for s in spans if left-3<=s['bbox'][0]<right and 80<s['bbox'][1]<1198]
        lines=[]
        for s in sorted(ss,key=lambda s:(round(s['bbox'][1]/2),s['bbox'][0])):
            if lines and abs(lines[-1][0]-s['bbox'][1])<3:lines[-1][1].append(s)
            else:lines.append([s['bbox'][1],[s]])
        for _,row in lines:
            text=clean(' '.join(s['text'] for s in sorted(row,key=lambda s:s['bbox'][0])))
            heading=re.match(r'^([1-8]\.\d{1,2})\s',text)
            if heading:section=heading[1];current=None;continue
            ex=re.fullmatch(r'Exercise\s+(\d+|[AB])',text)
            if ex and section:
                key=section+'-'+ex[1]
                current=WK.setdefault(key,{'lines':[],'sourcePdfPage':pdf,'duplicate':False})
                if current['lines']:current['duplicate']=True
                continue
            if re.search(r'REMEMBER|Students.? own|VOCABULARY BANK|GRAMMAR REVIEW|Train and Try|ANSWER KEY',text,re.I):current=None;continue
            if current is not None:current['lines'].append(text)
for key,record in WK.items():
    fields={};label=None;ambiguous=record['duplicate']
    for line in record['lines']:
        m=re.match(r'^(\d{1,2}[a-z]?|[a-j])\s+(.+)',line)
        if m and not (m[1].isalpha() and any(k[0].isdigit() for k in fields)):
            label=m[1]
            if label in fields:ambiguous=True
            fields[label]=m[2]
        elif label:fields[label]+=' '+line
        elif line:ambiguous=True
    record.update(raw='\n'.join(record['lines']),fields=fields,ambiguous=ambiguous)
write('data/workbook-keys.json',WK)

def normalized(book, pdf):
    page=TEXT[book][str(pdf)];w,h=page['width'],page['height']
    return [dict(s,x=s['bbox'][0]/w,y=s['bbox'][1]/h,w=(s['bbox'][2]-s['bbox'][0])/w,h=(s['bbox'][3]-s['bbox'][1])/h) for s in page['spans']]
# These headings use body-size bold text; checked against the printed tasks.
EXTRA_SB={17:{8},26:{1},27:{9},33:{8,9},38:{4},40:{1,2,3,4,5},41:{11},89:{6},106:{5},121:{1},125:{4},129:{1,4},131:{1,4,5}}
def sb_anchors(pdf,teacher=False):
    b='tb' if teacher else 'sb';p=pdf+20 if teacher else pdf
    spans=normalized(b,p)
    size=13.5 if teacher and pdf<132 else 13.95 if teacher else 14.95 if pdf<132 else 14.75
    out=[]
    for s in spans:
        text=clean(s['text'])
        numeric=re.fullmatch(r'\d{1,2}',text)
        command=CMD.match(text) if s['size']>(12.1 if teacher else 13.5) else None
        if numeric and not command and abs(s['size']-(size-1))<.22:
            following=' '.join(q['text'] for q in spans if 'Heavy' in q['font'] and abs(q['y']-s['y'])<.006 and .005<q['x']-s['x']<.09)
            command=CMD.match(text+' '+following)
        if pdf==40 and text.startswith('2 In the'):command=re.match(r'(2)',text)
        if command and int(command[1]) not in EXTRA_SB.get(pdf,set()):command=None
        if 'Heavy' in s['font'] and (numeric and abs(s['size']-size)<.22 or command) and s['y']<(.90 if teacher else .95):
            label=command[1] if command else text
            if not any(a['label']==label and abs(a['x']-s['x'])<.02 and abs(a['y']-s['y'])<.01 for a in out):out.append(dict(label=label,x=s['x'],y=s['y']))
    return out

CMD=re.compile(r'^(\d{1,2})\s*(?:[★*•]+\s*)?(?:SPEAKING|SHOW|Read|Complete|Write|Circle|Match|Rewrite|Look|Work|Now|USE|Choose|Make|Study|Underline|Find|Answer|Put|Use|Label|Tick|Describe|Add|What|Order|How|Think|Join|Correct|Combine|Listen|Watch|Ask|Check|Compare|In pairs|Imagine|Translate|Change|Decide|Which|Cross|Are|Do|Replace|Turn|Give|Follow|Have|Prepare)\b',re.I)
def wb_anchors(rows,p):
    if p<4 or p>=152 or 116<=p<=122:return []
    out=[]
    for row in rows:
        text=clean(re.sub(r'[★*•]', '', row['text']));m=CMD.match(text)
        if not m and re.fullmatch(r'\d{1,2}',text):
            neighbours=[q for q in rows if abs(q['y']-row['y'])<.01 and .005<q['x']-row['x']<.10]
            if any(CMD.match(text+' '+clean(re.sub(r'[★*•]', '', q['text']))) for q in neighbours):m=re.match(r'(\d+)',text)
        if m and (.045<row['x']<.145 or .49<row['x']<.59) and .025<row['y']<.92 and int(m[1])<=16:
            if not any(a['label']==m[1] and abs(a['y']-row['y'])<.012 and abs(a['x']-row['x'])<.03 for a in out):out.append(dict(label=m[1],x=row['x'],y=row['y']))
    # Exercise numbers sit at the column margin; numbered subitems are indented.
    filtered=[]
    for side in [False,True]:
        group=[a for a in out if (a['x']>.45)==side]
        if not group:continue
        margin=min(a['x'] for a in group)
        group=[a for a in group if a['x']<margin+.013]
        for row in rows:
            m=re.match(r'^(\d{1,2})(?:\s|$)',row['text'])
            if m and abs(row['x']-margin)<.009 and .025<row['y']<.92 and int(m[1])<=16:
                if not any(abs(a['y']-row['y'])<.012 for a in group):group.append(dict(label=m[1],x=row['x'],y=row['y']))
        filtered.extend(group)
    filtered.sort(key=lambda a:(a['x']>.45,a['y']))
    if p<116:
        ordered=[];last=0
        for a in filtered:
            if int(a['label'])>last:ordered.append(a);last=int(a['label'])
        return ordered
    return filtered

pages=[];sources={};gaps={};audit={'missingSourcePages':{'wb':[119,129]},'ungraded':[]}
for book in ['sb','wb','ws']:
    indices=range(2,160) if book=='sb' else range(3,161) if book=='wb' else range(3,21)
    for pdf in indices:
        p=pdf if book=='sb' else pdf-2 if book=='wb' and pdf<=120 else pdf-1 if book=='wb' and pdf<=129 else pdf if book=='wb' else pdf-3
        unit=min(8,max(1,(p-4)//14+1)) if book!='ws' else max(1,p//2)
        bank=None
        if book=='sb' and (p<4 or p>=116):
            unit='extra';bank='Contents' if p<4 else 'Video worksheets' if p<132 else 'Grammar & Use of English' if p<156 else 'Reference'
        if book=='wb' and (p<4 or p>=116):
            unit='extra';bank='Workbook guide' if p<4 else 'Vocabulary Bank' if p<133 else 'Focus 1 Grammar Review' if p<144 else 'Grammar: Train and Try Again' if p<152 else 'Writing Bank' if p<154 else 'Answer keys'
        if book=='ws' and p<2:unit='extra';bank='Word building & contents'
        rows=json.loads((R/f'data/ocr/wb-{pdf}.jpg.json').read_text()) if book=='wb' else normalized(book,pdf)
        anchors=sb_anchors(pdf) if book=='sb' and 4<=p<156 else wb_anchors(rows,p) if book=='wb' else []
        if book=='ws' and p>=2:
            for s in rows:
                m=re.match(r'^WORD STORE (\d[A-F])',s['text']);n=re.fullmatch(r'\d',clean(s['text'])) and 'Heavy' in s['font'] and abs(s['size']-10)<.2
                if m or n:anchors.append(dict(label=m[1] if m else clean(s['text']),x=s['x'],y=s['y']))
        if book=='ws' and p in [4,8,12,16]:
            anchors=[dict(label='1',x=.055,y=.044)] # One page-wide 30-question Word Practice activity.
        # Columns follow the printed exercise margins, including narrow reading columns.
        cols=[]
        for x in sorted(a['x'] for a in anchors):
            if not cols or x-cols[-1]>.12:cols.append(x)
        for a in anchors:a['col']=min(range(len(cols)),key=lambda i:abs(cols[i]-a['x']))
        anchors.sort(key=lambda a:(a['col'],a['y']))
        teachers=sb_anchors(pdf,True) if book=='sb' else []
        image=f'assets/pages/{book}-{pdf}.jpg';size=list(Image.open(R/image).size)
        exercises=[];seen=collections.Counter()
        for ordinal,a in enumerate(anchors,1):
            label=a['label'];seen[label]+=1
            exid=f'{book}-{p}-{ordinal if book=="ws" else label}'+(f'-b{seen[label]}' if book!='ws' and seen[label]>1 else '')
            other=[q for q in anchors if q['col']==a['col'] and q['y']>a['y']+.01]
            bottom=min([q['y'] for q in other],default=.935 if book=='wb' else .95)
            left=max(.01,a['x']-.012);right=cols[a['col']+1]-.016 if a['col']+1<len(cols) else .978
            box=[left,max(0,a['y']-.004),right-left,max(.02,bottom-a['y']-.005)]
            region=[s for s in rows if left-.003<=s['x']<right and a['y']-.006<=s['y']<bottom-.004]
            text='\n'.join(clean(s['text']) for s in sorted(region,key=lambda s:(round(s['y']/.006),s['x'])))
            fields={};key='';keysource=None;field_boxes={}
            if book=='wb' and 4<=p<116:
                rel=(p-4)%14;part=[1,1,2,3,4,4,5,6,7,7,8,9,10,10][rel]
                record=WK.get(f'{unit}.{part}-{label}')
                if record:
                    key=record['raw'];keysource={'book':'teacher','pdfPage':record['sourcePdfPage']}
                    if not record['ambiguous']:fields=record['fields']
            elif book in ['sb','ws']:
                tp=pdf+20 if book=='sb' else pdf+305
                if tp>324:tp=308
                ts=normalized('tb',tp)
                if book=='sb':
                    candidates=[q for q in teachers if q['label']==label]
                    target=min(candidates,key=lambda q:abs(q['y']-a['y']*.9)+abs(q['x']-(a['x']*.9+(.1 if p%2==0 else 0)))) if candidates else None
                    if target:
                        sx=.903 if p<132 else .93;sy=sx
                        ox=target['x']-a['x']*sx;oy=target['y']-a['y']*sy
                        rx=left*sx+ox;rr=right*sx+ox;top=a['y']*sy+oy;end=bottom*sy+oy
                    else:rx=rr=top=end=0
                else:rx=left;rr=right;top=a['y'];end=bottom;sx=sy=1;ox=oy=0
                regionT=[s for s in ts if rx-.006<=s['x']<rr+.003 and top+.006<s['y']<end-.005]
                reds=[s for s in regionT if s['color']==0xda2128 and clean(s['text'])]
                numbers=[]
                for s in regionT:
                    match=re.match(r'^(\d{1,2}[a-z]?)(?:\s|$)',clean(s['text']))
                    if match and s['color']!=0xda2128:numbers.append(dict(s,label=match[1]))
                unresolved=[]
                for s in sorted(reds,key=lambda s:(round(s['y']/.003),s['x'])):
                    candidates=[n for n in numbers if n['x']<s['x']+.004 and -.006<s['y']-n['y']<.014]
                    if candidates:
                        n=min(candidates,key=lambda n:abs(s['y']-n['y'])*35+s['x']-n['x'])
                        fields.setdefault(n['label'],[]).append(clean(s['text']))
                        field_boxes.setdefault(n['label'],[]).append([(s['x']-ox)/sx,(s['y']-oy)/sy,s['w']/sx,s['h']/sy])
                    else:unresolved.append(clean(s['text']))
                fields={k:' '.join(v) for k,v in fields.items()}
                key='\n'.join(k+' '+v for k,v in fields.items())+('\n'+' · '.join(unresolved) if unresolved else '')
                if unresolved:fields={}
                if key:keysource={'book':'teacher','pdfPage':tp}
            spec=key_spec(fields)
            # Do not turn speaking/personal/writing prompts into one-answer tests.
            personal=bool(re.search(r'\bSPEAKING\b|true for you|your own|about yourself|your partner|Then.*(?:discuss|your)',text[:350],re.I))
            if personal:spec=[]
            mode='automatic' if spec else 'open'
            ex={'id':exid,'label':label,'x':a['x'],'y':a['y'],'box':box,'text':text,'key':key,'keySource':keysource,'answerSpec':spec,'answerVersion':hashlib.sha256(json.dumps(spec,sort_keys=True).encode()).hexdigest()[:12],'marking':{'mode':mode},'answers':[]}
            if not spec:audit['ungraded'].append(exid)
            exercises.append(ex)
            if spec and re.search(r'complete|fill|write|missing|WORD STORE',text[:300],re.I):
                geometry={}
                for f in spec:
                    boxes=field_boxes.get(f['label'],[])
                    if len(boxes)!=1:continue
                    x,y,w,h=boxes[0];w=max(.035,w);h=max(.015,h)
                    if x>=0 and y>=0 and x+w<1 and y+h<1:geometry[f['label']]={'image':image,'page':p,'box':[x,y,w,h]}
                if len(geometry)==len(spec):gaps[exid]=geometry
            sources[exid]={'label':label,'sources':[{'image':image,'page':p,'size':size,'box':box},{'image':image,'page':p,'size':size,'box':[.01,.01,.98,.97],'context':True}]}
        tracks=[]
        if book!='wb':
            audio_text=' '.join(s['text'] for s in TEXT[book][str(pdf)]['spans'] if 'Black' in s['font'] and s['color']==0xffffff)
            for match in re.finditer(r'(?<!\d)([1-3])[.,](\d{1,2})(?!\d)',audio_text):
                track=f'{match[1]}.{int(match[2]):02}'
                if (R/f'media/sb-{track}.mp3').exists():tracks.append(track)
        pages.append({'id':f'{book}-{p}','book':book,'page':p,'pdfPage':pdf,'image':image,'unit':unit,'title':bank or NAMES[unit],'bank':bank,'exercises':exercises,'tracks':list(dict.fromkeys(tracks))})

# Word Store references use the actual worksheet and its answers, not an empty SB prompt.
groups={e['label']:(pg,e) for pg in pages if pg['book']=='ws' for e in pg['exercises'] if re.fullmatch(r'\d[A-F]',e['label'])}
for pg in pages:
    for ex in pg['exercises']:
        match=re.search(r'Complete WORD STORE (\d[A-F])',ex['text'],re.I)
        if pg['book']=='sb' and match and match[1] in groups:
            ws,target=groups[match[1]];sources[ex['id']]['sources']=sources[target['id']]['sources']+sources[ex['id']]['sources']
            ex['wordStore']=target['id']
            if target['id'] in gaps:gaps[ex['id']]=gaps[target['id']]
            for k in ['answerSpec','answerVersion','key','keySource','marking']:ex[k]=target[k]
        if pg['book']=='sb' and 4<=pg['page']<116 and (pg['page']-4)%14 in [0,1,4,5,8,9]:
            rel=(pg['page']-4)%14;other=pg['page']+1 if rel%2==0 else pg['page']-1
            peer=next(p for p in pages if p['book']=='sb' and p['page']==other)
            sources[ex['id']]['sources'].append({'image':peer['image'],'page':other,'size':list(Image.open(R/peer['image']).size),'box':[.01,.01,.98,.97],'context':True})

overrides=json.loads((R/'data/reviewed-answers.json').read_text()) if (R/'data/reviewed-answers.json').exists() else {}
for pg in pages:
    for e in pg['exercises']:
        if e['id'] in overrides:
            e.update(overrides[e['id']])
            signature=e['answerSpec'] if e.get('responseMode')!='oral' else {'fields':[],'responseMode':'oral'}
            e['answerVersion']=hashlib.sha256(json.dumps(signature,sort_keys=True).encode()).hexdigest()[:12]
            if e.get('reviewedUnit11'):gaps.pop(e['id'],None)
sources.update(json.loads((R/'data/source-context-overrides.json').read_text()) if (R/'data/source-context-overrides.json').exists() else {})
videos=json.loads((R/'data/videos.json').read_text()) if (R/'data/videos.json').exists() else []
D={'id':'focus-2','units':NAMES,'pages':pages,'tracks':{'sb':[p.stem[3:] for p in sorted((R/'media').glob('sb-*.mp3'))],'wb':[],'ws':[]},'resources':json.loads((R/'data/resources.json').read_text()),'videos':videos}
(R/'assets/course.js').write_text('window.FOCUS2 = '+json.dumps(D,ensure_ascii=False,separators=(',',':'))+';\n')
(R/'assets/exercise-sources.js').write_text('window.EXERCISE_SOURCES = '+json.dumps(sources,ensure_ascii=False,separators=(',',':'))+';\n')
(R/'assets/exercise-gaps.js').write_text('window.EXERCISE_GAPS = '+json.dumps(gaps,ensure_ascii=False,separators=(',',':'))+';\n')
audit['ungraded']=[e['id'] for p in pages for e in p['exercises'] if not e['answerSpec']]
audit['coverage']={b:{'pages':sum(p['book']==b for p in pages),'exercises':sum(len(p['exercises']) for p in pages if p['book']==b),'automatic':sum(bool(e['answerSpec']) for p in pages if p['book']==b for e in p['exercises'])} for b in ['sb','wb','ws']}
write('audit/coverage.json',audit)
print(json.dumps(audit['coverage'],indent=2))
