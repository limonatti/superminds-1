"""Build the course only from audited supplied pages and keys."""
from pathlib import Path
import json,re,collections,shutil
from speakout_b1_keys import extract
from speakout_b1_exercises import make_exercises
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]/'speakout-b1-active-teach'
D=json.loads((ROOT/'work/manifest.json').read_text())
D['units']=['People','Tale tellers','Questions','Winners','News','Creators','Travel','Know-how']
D['titles']=[['Who are you?','Good people','Let’s talk!','Lifestyle'],['What happened?','Storytelling','A likely story','The story of a place'],['Facts and figures','Decisions','Can I ask you … ?','What matters most?'],['Success','First!','Taking part','Top Gear: Nepal'],['Fake news','Newsmakers','Good news','The future of news'],['The two Pablos','Be creative','Why do you think that?','An artist at work'],['Good tourists','Globetrotters','You must see … !','Go solo?'],['Doers and dreamers','Video everywhere','Help!','A gifted learner']]
wbstarts=[4,10,18,24,32,38,46,52]
def lesson_for(book,n):
    if book=='sb':
        if n<7:return 'Lead-in'
        if n==103:return '8R'
        if n<104:
            u=(n-7)//12+1;o=(n-7)%12
            return str(u)+('Intro' if o==0 else 'A' if o<=3 else 'B' if o<=6 else 'C' if o<=8 else 'D' if o<=10 else 'R')
        if n<136:return str((n-104)//4+1)+'ABCD'[(n-104)%4]+' Grammar'
        if n<146:return 'Vocabulary Bank'
        if n<150:return 'Communication Bank'
        if n<158:return str(n-149)+'C Mediation'
        if n<170:return 'Audioscripts'
        if n<174:return 'Videoscripts'
        return 'Irregular verbs'
    if n==3:return 'Contents'
    for u,start in enumerate(wbstarts,1):
        if start<=n<start+6:return str(u)+('A' if n-start<2 else 'B' if n-start<4 else 'C' if n-start==4 else 'D')
    if n in [16,17,30,31,44,45,58,59]:return 'Review '+{16:'1–2',17:'1–2',30:'3–4',31:'3–4',44:'5–6',45:'5–6',58:'7–8',59:'7–8'}[n]
    if n<62:return 'Review 1–4'
    if n<64:return 'Review 5–8'
    if n<68:return 'Review 1–8 '+('Grammar' if n<66 else 'Vocabulary')
    if n<76:return 'Audioscripts'
    return 'Answer key'

report={'duplicates':[],'unmapped':[],'missingSourcePages':{},'pageMap':{}}
allwords={};books={}
for book in ['sb','wb']:
    entries={}
    source=D['books'][book]
    sourcepages=source['pages']+(D['books']['wb-keys']['pages'] if book=='wb' else [])
    for sourcepage in sourcepages:
        p=dict(sourcepage);image=Path(p['sourceImage']);n=p['pdfPage']
        words=json.loads((ROOT/'work/ocr'/(image.name+'.json')).read_text())
        foot=[int(w['text']) for w in words if w['y']>.93 and re.fullmatch(r'\d{1,3}',w['text'])]
        if book=='sb':
            if p.get('printedPage'):
                printed=p.pop('printedPage')
                assert printed in foot,(image,printed,foot)
            else:
                if n<8 or n==170:continue
                if n==49 and foot==[3,4]:foot=[34] # Printed footer visually verified.
                if len(foot)!=1:report['unmapped'].append([book,n,foot]);continue
                printed=foot[0]
        elif image.name.startswith('wb-keys'):
            printed=n+75;p['pdf']='resources/wb-keys.pdf'
        else:
            if n<5:continue
            printed=n-2
        if printed in entries:
            report['duplicates'].append({'book':book,'page':printed,'pdfPage':n,'source':str(image)})
            # Dedicated WB keys provide searchable, clean source pages.
            if not image.name.startswith('wb-keys'):continue
        dest=ROOT/'assets'/f'{book}-{printed}.jpg';shutil.copyfile(ROOT/image,dest)
        p.update(page=printed,image=str(dest.relative_to(ROOT)),lesson=lesson_for(book,printed))
        p.pop('sourceImage',None)
        p['text']='\n'.join(w['text'] for w in words)
        p['group']='lead-in' if p['lesson'] in ['Lead-in','Contents'] else 'mediation' if p['lesson'].endswith(' Mediation') else 'grammar' if book=='sb' and p['lesson'].endswith(' Grammar') else 'vocabulary' if p['lesson']=='Vocabulary Bank' else 'reference' if p['lesson']=='Irregular verbs' else 'scripts' if p['lesson'] in ['Audioscripts','Videoscripts','Answer key'] else p['lesson'][0] if re.match('[1-8]',p['lesson']) else 'banks'
        if book=='sb' and 136<=printed<146:
            for w in words:
                if w['y']<.13 and re.fullmatch('[A-D]',w['text']):w['text']={136:'1A',137:'2A',138:'3A',139:'3C',140:'4B',141:'5B',142:'6B',143:'7A',144:'8A',145:'8C'}.get(printed,w['text'])+' Vocabulary'
        p['exercises']=[] if p['lesson']=='Contents' else make_exercises(book,p,words)
        if p['group']=='vocabulary':
            p['exercises']=[e for e in p['exercises'] if int(re.match(r'\d+',e['label'])[0])<=2]
            for e in p['exercises']:
                # Verified printed bank headings; OCR sometimes mistakes these for task labels.
                unitlesson={136:('1A' if e['y']<52 else '1B'),137:('2A' if e['x']<50 else '2B'),138:('3A' if e['y']<56 else '3C'),139:'4B',140:'4C',141:('5B' if e['x']<65 else '6A'),142:'7A',143:'7B',144:('8A' if e['x']<50 else '8B'),145:'8C'}[printed]
                e['keyLesson']=unitlesson+' Vocabulary';e['keyLabel']=e['label'].split('_')[0]
                e['displayLabel']=unitlesson+' · '+e['keyLabel'];e['shortLabel']=e['keyLabel']
        allwords[f'{book}:{printed}']=words;entries[printed]=p
    books[book]={'path':source['path'],'pages':sorted(entries.values(),key=lambda p:p['page'])}
    report['pageMap'][book]=[{k:p[k] for k in ['page','pdfPage','image','pdf','sourceFile','sourcePdfPage'] if k in p} for p in books[book]['pages']]
    report['missingSourcePages'][book]=[n for n in range(6 if book=='sb' else 3,175 if book=='sb' else 97) if n not in entries]
D['books']=books;D['missingSourcePages']=report['missingSourcePages']
# Track headings are searchable in the supplied PDF. Include visually verified
# continuations so a transcript split between pages remains complete.
script_pdf=ROOT/'resources/sb-scripts.pdf'
if script_pdf.exists():
    scripts=PdfReader(script_pdf)
    carry={159:'1.07',162:'3.08',163:'4.01',165:'5.07',167:'7.03',168:'R7.01',169:'8.06'}
    video_lessons={170:['1Intro','1D','2Intro','2D','3Intro'],171:['3Intro','3D','4Intro','4D'],172:['5Intro','5D','6Intro','6D'],173:['7Intro','7D','8Intro','8D']}
    for p in books['sb']['pages']:
        if p.get('pdf')!='resources/sb-scripts.pdf':continue
        if p['lesson']=='Audioscripts':
            headings=re.findall(r'^Audio\s+((?:VB|R)?[1-8]\.\d{2}|L\.\d{2})\b',scripts.pages[p['pdfPage']-1].extract_text(),re.M)
            p['scriptTracks']=([carry[p['page']]] if p['page'] in carry else [])+headings
            assert headings,p['page']
        else:p['scriptLessons']=video_lessons[p['page']]
D['keys']={**extract(ROOT,'sb'),**extract(ROOT,'wb')}
for book,data in books.items():
    for p in data['pages']:
        for e in p['exercises']:
            if p['group']=='mediation':
                e['relatedPages']=[q['page'] for q in books['sb']['pages'] if q['lesson']==p['lesson'] and q['page']!=p['page']]
                D['keys'][f"sb|{p['lesson']}|{e['label']}"]={'items':[],'raw':'Ответы, рекомендации и примеры выполнения — в Teacher’s Book.','pdf':'resources/teacher.pdf','pdfPage':201+2*(int(p['lesson'][0])-1),'sourceScope':'lesson'}
            keyid=f"{book}|{e.get('keyLesson',p['lesson'])}|{e.get('keyLabel',e['label'])}"
            e['keyId']=keyid
            key=D['keys'].get(keyid)
            if key and key['items'] and re.search(r'Work in|Discuss|your own|Compare|pronunciation|stress|intonation',e['text'].split('\n')[0],re.I):
                e['reviewOnly']=True
            refs=sorted(set(int(m[1]) for m in re.finditer(r'\bpages?\s+(\d{1,3})\b',e['text'],re.I)))
            same=[q['page'] for q in books['sb']['pages'] if q['lesson']==p['lesson'] and q['page']!=p['page']] if book=='sb' and p['group'] not in ['vocabulary','scripts','reference'] else []
            e['relatedPages']=sorted(set(e.get('relatedPages',[])+refs+same))
# Printed listening/check steps often provide the key for the previous written step.
for p in books['sb']['pages']:
    for e in p['exercises']:
        if e['keyId'] in D['keys'] or not e['label'][-1:].isalpha():continue
        nxt=e['label'][:-1]+chr(ord(e['label'][-1])+1)
        other=next((q for q in p['exercises'] if q['label']==nxt),None)
        if other and other['keyId'] in D['keys'] and re.search(r'(listen|watch).*check',other['text'].split('\n')[0],re.I):
            D['keys'][e['keyId']]=dict(D['keys'][other['keyId']],aliasOf=other['keyId'])
for m in D['media']:
    if m['type']=='video':continue
    if m['track'].startswith('R'):
        m['unit']=int(m['track'][1]);m['lesson']=str(m['unit'])+'R'
    if m['track'].startswith('L'):m['lesson']='Lead-in'
    variants=[m['track']]
    if '.0X' in m['track']:
        variants.append(m['track'].replace('.0X','.X'))
    m['references']=variants
    pattern=r'(?<![\w.])(?:'+'|'.join(re.escape(x) for x in variants)+r')(?!\w)'
    hits=[p for p in books[m['book']]['pages'] if p['group']!='scripts' and re.search(pattern,p['text'],re.I)]
    if not m['lesson'] and hits:m['lesson']=hits[0]['lesson']
    m['pages']=[p['page'] for p in hits]
for m in D['media']:
    m['scriptPages']=[p['page'] for p in books['sb']['pages'] if m['book']=='sb' and
                      (m['type']=='audio' and m['track'] in p.get('scriptTracks',[]) or
                       m['type']=='video' and m['lesson'] in p.get('scriptLessons',[]))]
report['scriptMedia']=dict(collections.Counter(m['type'] for m in D['media'] if m['scriptPages']))
report.update(pages={b:len(v['pages']) for b,v in books.items()},exercises={b:sum(len(p['exercises']) for p in v['pages']) for b,v in books.items()},media=dict(collections.Counter(m['type'] for m in D['media'])),resources=len(D['resources']),keys=len(D['keys']),structuredKeys=sum(bool(k['items']) for k in D['keys'].values()),unassignedAudio=[m['track'] for m in D['media'] if m['type']=='audio' and not m['lesson']],emptyTaskPages=[f"{b}:{p['page']}" for b,v in books.items() for p in v['pages'] if p['group'] not in ['scripts','reference','lead-in'] and not p['exercises']])
assert not report['unmapped'],report['unmapped']
D.pop('inputs');D['scope']='Units 1–8'
(ROOT/'assets/course.js').write_text('window.COURSE='+json.dumps(D,ensure_ascii=False,separators=(',',':'))+';\n')
(ROOT/'audit/coverage.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps({k:v for k,v in report.items() if k not in ['pageMap','duplicates']},ensure_ascii=False,indent=2))
