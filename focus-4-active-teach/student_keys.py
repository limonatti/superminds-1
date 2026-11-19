"""Recover keys in the Teacher's Book's own layout (which differs from SB)."""
import collections
import re

RED=0xda2128
def clean(s): return ' '.join(s.replace('ﬁ','fi').replace('ﬂ','fl').split())

def recover(ts, label, source_x, source_y, circles=None):
    headings=[]
    for s in ts:
        if 'Heavy' in s['font'] and 13<s['size']<14.3 and re.fullmatch(r'\d{1,2}',clean(s['text'])):
            headings.append(dict(s,label=clean(s['text'])))
    target=min((s for s in headings if s['label']==label),key=lambda s:abs(s['x']-source_x*.9)+abs(s['y']-source_y*.9),default=None)
    if not target:return {},[]
    column=[s for s in headings if abs(s['x']-target['x'])<.04]
    bottom=min((s['y'] for s in column if s['y']>target['y']+.004),default=.88)
    right=min((s['x']-.008 for s in headings if s['x']>target['x']+.1),default=.95)
    inside=lambda s: target['x']-.007<=s['x']<right and target['y']+.008<s['y']<bottom-.002
    body=[s for s in ts if inside(s)]
    nums=[]
    for s in body:
        text=clean(s['text'])
        m=re.match(r'^\(?(\d{1,2}[a-z]?|[a-hA-H])(?:\)|\s|$)',text)
        speaker=re.fullmatch(r'Speaker (\d+):',text)
        if s['color']!=RED and ((m and (re.search(r'heavy|bold|(?:^|-)Hv$',s['font'],re.I) or re.fullmatch(r'\d{1,2}',text))) or speaker):
            nums.append(dict(s,label=(speaker or m)[1]))
    reds=[s for s in body if s['color']==RED and clean(s['text'])]
    if circles:
        reds=[dict(x=c['box'][0],y=c['box'][1],text=c['text']) for c in circles if inside(dict(x=c['box'][0],y=c['box'][1]))]
    fields=collections.defaultdict(list);unmapped=[]
    for s in sorted(reds,key=lambda s:(round(s['y']/.002),s['x'])):
        candidates=[n for n in nums if (n['x']<s['x']+.005 or s['y']-n['y']>.006) and -.004<s['y']-n['y']<.18]
        if circles and any(n['label'].isdigit() for n in candidates):
            candidates=[n for n in candidates if n['label'].isdigit()]
        # Inline superscripts win over the previous numbered row.
        same=[n for n in candidates if abs(s['y']-n['y'])<.005]
        n=min(same or candidates,key=lambda n:abs(s['y']-n['y'])*50+s['x']-n['x'],default=None)
        if n:fields[n['label']].append(clean(s['text']))
        else:unmapped.append(clean(s['text']))
    if not fields and unmapped:
        fields['Ответ']=unmapped;unmapped=[]
    return {k:' '.join(v) for k,v in fields.items() if k!='0'},unmapped
