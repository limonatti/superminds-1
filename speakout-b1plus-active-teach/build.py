"""Build the B1+ course from the supplied scans, OCR coordinates and original keys."""
from pathlib import Path
import json,re,collections
from read_keys import extract
from workbook_keys import extract_workbook_keys
from banks import MEDIATION,communication_exercises,related_pages
ROOT=Path(__file__).resolve().parent
D=json.loads((ROOT/'work/manifest.json').read_text())
D['units']=['Me & mine','Behaviour','Working life','Fact or fiction?','Consumer','Places','Connect','Wisdom']
D['titles']=[['The story of me','Less is more?','Don’t forget to …','Your gadgets'],['Change of habit','People pleaser','That’s annoying!','Planet Earth II: Jungles'],['Working from home','Gig work','Good question','This or that?'],['Hoax!','Documentary','News','Fake friends'],['The customer is always right?','Too good to be true','Which should I buy?','I do it myself'],['In the city','Great journeys','City transport','A city of tomorrow'],['Mix-up','Oversharing','Conversation savers','A good communicator'],['Wise words','Life lessons','One thing I know …','Dragons’ Den']]
D['keys']=extract()
grammar=[f'{u}{s} Grammar' for u in range(1,9) for s in ('ABCD' if u%2 else 'ABC')]
wbstarts=[4,10,18,24,32,38,46,52]
def lesson_for(book,n):
    if book=='sb':
        if n==6:return 'Lead-in'
        if n==103:return '8R'
        if n<104:
            u=(n-7)//12+1;o=(n-7)%12
            return f'{u}'+('Intro' if o==0 else 'A' if o<=3 else 'B' if o<=6 else 'C' if o<=8 else 'D' if o<=10 else 'R')
        if n<132:return grammar[n-104]
        if n<139:return 'Vocabulary Bank'
        if n<145:return 'Communication Bank'
        if n<157:return MEDIATION[n]+' Mediation'
        if n<170:return 'Audioscripts'
        if n<175:return 'Videoscripts'
        return 'Irregular verbs'
    if n==3:return 'Contents'
    for u,start in enumerate(wbstarts,1):
        if start<=n<start+6:return str(u)+('A' if n-start<2 else 'B' if n-start<4 else 'C' if n-start==4 else 'D')
    if n in [16,17,30,31,44,45,58,59]:return 'Review '+{16:'1–2',17:'1–2',30:'3–4',31:'3–4',44:'5–6',45:'5–6',58:'7–8',59:'7–8'}[n]
    if n<62:return 'Review 1–4'
    if n<64:return 'Review 5–8'
    if n<68:return 'Review 1–8 '+('Grammar' if n<66 else 'Vocabulary')
    if n<78:return 'Audioscripts'
    return 'Answer key'
COMMAND=r'(?:Read|Listen|Watch|Work|Choose|Complete|Match|Write|Look|Think|Check|Find|Make|Underline|Put|Learn|Ask|Discuss|Compare|Take|Cover|Practise|Practice|Say|Talk|Use|Go|Correct|Replace|Answer|Give|Tick|Circle|Plan|Prepare|Tell|Rewrite|Record|Repeat|Number|Order|Label|Decide|Add|Notice|Try|Now|Then|Mark|Cross|Study|Turn|Imagine|Reduce|Swap|Change)\b'
def command(t):return bool(re.search(COMMAND,t))
def make_exercises(book,p,ws):
    if p['lesson'] in ['Contents','Audioscripts','Videoscripts','Irregular verbs','Answer key']:return []
    if p['lesson']=='Communication Bank':return communication_exercises(p['page'],ws)
    for w in ws:
        w['text']=w['text'].translate(str.maketrans({'З':'3','А':'A','В':'B','С':'C','Е':'E','Н':'H','в':'B'}))
        if re.fullmatch(r'(?:[A-H]|\d{1,2}\s*[A-H])',w['text'].strip()) or (p['lesson'].endswith(' Mediation') and re.fullmatch(r'\d{1,2}',w['text'].strip())):
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
        if book=='wb' and s=='E':s=''
        if p['lesson'].endswith(' Grammar') and s and w['y']<.12:continue
        if s and (re.match(COMMAND,tail) or re.search(r'[1-8][.,]\d{2}',tail) or re.match(r'^(?:[EF•$■ФL+*]|The\b|Are\b|Which\b|What\b|How\b|Do\b|In\b|You\b|Join\b|[DI]{1,3}$)',tail)):
            primary.append(dict(w,label=n+s,number=n));continue
        if not s and (re.match(COMMAND,tail) or re.search(r'[1-8][.,]\d{2}',tail)):
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
        if not m or w['h']>.025 or not .04<w['y']<.955:continue
        before=[a for a in primary if .008<w['x']-a['x']<.026 and a['y']<w['y']-.005]
        if not before:continue
        a=max(before,key=lambda a:a['y'])
        if a['label'][-1:].isalpha():anchors.append(dict(w,label=a['number']+m[1].upper(),number=a['number'],x=a['x']))
    # A substep can continue at the top of a second column or the next page.
    for w in ws:
        m=re.match(r'^([B-Hb-h])\s+(.+)$',w['text'].replace('в ','B ',1).replace('С ','C ',1))
        if not m or not command(m[2]) or w['h']>.025 or not .04<w['y']<.955:continue
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
        if not m or not .06<w['y']<.955 or w['h']>.025:continue
        if any(abs(a['y']-w['y'])<.008 and abs(a['x']-w['x'])<.04 for a in anchors):continue
        before=[a for a in anchors if .008<w['x']-a['x']<.026 and a['y']<w['y']-.008]
        if before:
            a=max(before,key=lambda a:a['y'])
            if a['label'][-1:].isalpha():anchors.append(dict(w,label=a['number']+m[1],number=a['number'],x=a['x']))
    # Visually verified labels that Vision omitted next to video/practice icons.
    corrections={('sb',6):[('5',.5051,.3400)],('sb',16):[('2B',.415,.387),('2C',.415,.477)],('sb',64):[('2B',.415,.281),('3C',.415,.461)],('sb',114):[('1',.458,.147)],('sb',129):[('2',.425,.471)],('sb',153):[('1',.075,.205)],('sb',154):[('2',.057,.509)],('sb',156):[('2',.058,.476)]}
    for label,x,y in corrections.get((book,p['page']),[]):
        if not any(a['label']==label for a in anchors):anchors.append({'label':label,'number':re.match(r'\d+',label)[0],'x':x,'y':y})
    # The numbered tips in Text B are reading content, not activities.
    if book=='sb' and p['page']==147:anchors=[a for a in anchors if a['x']>.5]
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
    if book=='sb' and p['page']==6:
        # Verified against the newly supplied page: keep every instruction whole,
        # include the reading passage in 1B and the matching words in 4B.
        boxes={'1A':[4.8,9.6,43.2,27.2],'1B':[4.8,9.6,43.2,34.4],
               '2':[4.8,49.8,43.2,12.3],'3A':[4.8,67.6,43.2,23.8],
               '3B':[4.8,92.0,43.2,3.6],'4A':[49.7,9.6,45.3,12.4],
               '4B':[49.7,9.6,45.3,14.5],'4C':[49.7,24.2,45.3,4.3],
               '5':[49.7,33.4,45.3,16.2],'6A':[49.7,54.9,45.3,32.2],
               '6B':[49.7,87.4,45.3,7.5]}
        for ex in result:
            ex['box']=boxes[ex['label']]
            if ex['label']=='3B':
                ex['text']='\n'.join(w['text'] for w in sorted(ws,key=lambda w:w['y']) if w['x']<.48 and .92<w['y']<.956)
    return sorted(result,key=lambda e:(int(re.match(r'\d+',e['label'])[0]),e['label']))
allwords={}
for book,data in D['books'].items():
    for p in data['pages']:
        path=ROOT/'work/ocr'/(Path(p['image']).name+'.json')
        if not path.exists():raise RuntimeError('OCR missing: '+path.name)
        ws=json.loads(path.read_text());allwords[f"{book}:{p['page']}"]=ws
        p['lesson']=lesson_for(book,p['page'])
        # Source headings override the fallback boundary for workbook back matter.
        if book=='wb' and p['page']>=60:
            heading=' '.join(w['text'] for w in ws if w['y']<.08)
            if 'ANSWER KEY' in heading:p['lesson']='Answer key'
            elif 'AUDIOSCRIPTS' in heading:p['lesson']='Audioscripts'
        p['text']='\n'.join(w['text'] for w in ws)
        if book=='sb' and p['page']==6:
            p['missingAudio']=[] if any(m['book']=='sb' and m['track']=='L.01' for m in D['media']) else ['L.01']
        p['exercises']=make_exercises(book,p,ws)
        p['group']='leadin' if p['lesson']=='Lead-in' else 'contents' if p['lesson']=='Contents' else 'mediation' if p['lesson'].endswith(' Mediation') else 'communication' if p['lesson']=='Communication Bank' else 'reference' if p['lesson']=='Irregular verbs' else 'grammar' if p['lesson'].endswith(' Grammar') else 'vocabulary' if p['lesson']=='Vocabulary Bank' else 'scripts' if p['lesson'] in ['Audioscripts','Videoscripts','Answer key'] else p['lesson'][0] if re.match(r'^[1-8]',p['lesson']) else 'banks'
        p['width']=595;p['height']=842
# Use source track references to assign workbook audio; unidentified tracks remain
# available under the correct unit instead of being guessed into a lesson.
for m in D['media']:
    if m['type']=='audio':
        pattern=r'(?<![\d.])'+re.escape(m['track'])+r'(?!\d)'
        matches=[p for p in D['books'][m['book']]['pages'] if re.search(pattern,p['text'])]
        if not m['lesson'] and matches:m['lesson']=matches[0]['lesson']
        m['pages']=[p['page'] for p in matches]
related_pages(D)
# Mediation answers and guidance are provided in the owner's Teacher's Book.
# Retain manual review rather than manufacture closed answers from open tasks.
for p in D['books']['sb']['pages']:
    if p['group']=='mediation':
        for e in p['exercises']:
            D['keys'][f"sb|{p['lesson']}|{e['label']}"]={'raw':'Ответы и рекомендации к этому разделу находятся в Teacher’s Book по ссылке ниже.','items':[],'pdf':'resources/teacher.pdf','pdfPage':186+2*(int(p['lesson'][0])-1),'sourceScope':'lesson'}
# Workbook keys are scans. Keep exact lesson-level source pages for comparison.
wbkeypages=collections.defaultdict(list);active=None
for p in D['books']['wb']['pages']:
    if p['lesson']!='Answer key':continue
    ws=allwords[f"wb:{p['page']}"]
    for base in ([.060,.355,.650] if p['page']%2==0 else [.074,.369,.664]):
        col=sorted([w for w in ws if base-.012<=w['x']<base+.282 and .05<w['y']<.955],key=lambda w:w['y'])
        if active and p['page'] not in wbkeypages[active]:wbkeypages[active].append(p['page'])
        for w in col:
            m=re.search(r'Lesson\s*([1-8][A-D])',w['text'].replace('З','3').replace('А','A').replace('С','C'),re.I)
            rev=re.search(r'Review\s*([1-8])[-– ]+([1-8])',w['text'],re.I)
            if m:active=m[1].upper()
            elif rev:active='Review '+rev[1]+'–'+rev[2]
            elif 'CUMULATIVE REVIEW' in w['text']:active='Cumulative review'
            elif active and active.startswith('Review 1–8') and w['text'] in ['GRAMMAR','VOCABULARY']:active='Review 1–8 '+w['text'].title()
            if active and p['page'] not in wbkeypages[active]:wbkeypages[active].append(p['page'])
for p in D['books']['wb']['pages']:
    targets=wbkeypages.get(p['lesson'],[])
    if targets:
        for e in p['exercises']:
            D['keys'][f"wb|{p['lesson']}|{e['label']}"]={'raw':'','items':[],'pdf':'resources/wb.pdf','pdfPage':targets[0]-2,'images':['assets/wb-'+str(n)+'.jpg' for n in targets],'sourceScope':'lesson'}
for k,v in extract_workbook_keys().items():
    if k in D['keys']:v['images']=D['keys'][k]['images']
    D['keys'][k]=v
# Verified against Workbook pp. 6 and 79: the printed key has “do” while
# the sentence and its own explanation require “doing”. Preserve the erratum.
erratum=D['keys']['wb|1B|2B']
for item in erratum['items']:
    if item['n']=='12':item['answer']='doing'
erratum['correctionNote']='№ 12: doing. В печатном ключе — опечатка «do»; после stop здесь нужна форма -ing.'
erratum['raw']='Уточнение к № 12: doing. В печатном ключе — опечатка «do»; после stop здесь нужна форма -ing.\n\n'+erratum['raw']
(ROOT/'audit/errata.json').write_text(json.dumps([{'key':'wb|1B|2B','item':'12','printed':'do','corrected':'doing','taskPage':6,'keyPage':79}],indent=2))
# Editorial aliases only when the printed task explicitly says to check its
# preceding written step. Both steps retain the exact same original key.
for book,data in D['books'].items():
    if book!='sb':continue
    for p in data['pages']:
        for e in p['exercises']:
            k=f"sb|{p['lesson']}|{e['label']}"
            if k in D['keys'] or not e['label'][-1:].isalpha():continue
            nxt=e['label'][:-1]+chr(ord(e['label'][-1])+1)
            other=next((q for q in p['exercises'] if q['label']==nxt),None)
            nk=f"sb|{p['lesson']}|{nxt}"
            if other and nk in D['keys'] and re.search(r'(listen|watch).*check',other['text'].split('\n')[0],re.I):D['keys'][k]=dict(D['keys'][nk],aliasOf=nk)
for book,data in D['books'].items():
    for p in data['pages']:
        for e in p['exercises']:
            k=f"{book}|{e.get('keyLesson',p['lesson'])}|{e.get('keyLabel',e['label'])}"
            key=D['keys'].get(k)
            if key and key['items']:
                # Open discussion/comparison cannot become a closed quiz because
                # a key from another task happens to share its number.
                instruction=e['text'].split('\n')[0]
                if re.search(r'Work in|Discuss|your own|Compare|pronunciation|stress|intonation',instruction,re.I):key['items']=[]
                ns=[int(n) for n in re.findall(r'(?<![\d.])(\d{1,2})(?![\d.])',e['text'])]
                kn=[int(q['n']) for q in key['items'] if q['n'].isdigit()]
                if kn and ns and max(ns)>max(kn):key['items']=[]
                if k=='wb|1A|1':key['items']=[] # Key abbreviates “worth a lot” to “worth”; use original key review.
            e['keyId']=k
report={'pages':{b:len(v['pages']) for b,v in D['books'].items()},'exercises':{b:sum(len(p['exercises']) for p in v['pages']) for b,v in D['books'].items()},'media':dict(collections.Counter(m['type'] for m in D['media'])),'unassignedWorkbookAudio':[m['track'] for m in D['media'] if m['book']=='wb' and not m['lesson']],'wbKeyPages':dict(wbkeypages),'missingSourcePages':D['missingSourcePages']}
(ROOT/'audit/coverage.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
D.pop('inputs');D['scope']='Units 1–8'
(ROOT/'assets/course.js').write_text('window.COURSE='+json.dumps(D,ensure_ascii=False,separators=(',',':'))+';\n')
print(json.dumps(report,ensure_ascii=False,indent=2))
