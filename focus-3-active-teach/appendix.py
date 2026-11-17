import json,re
from pathlib import Path
R=Path(__file__).resolve().parent
T=json.loads((R/'data/tb-text.json').read_text())
def clean(s):return ' '.join(s.replace('ﬁ','fi').replace('ﬂ','fl').split())
records=[];active=False;heading='';pending=False;current=None
for pdf in range(188,192):
 ss=T[str(pdf)]['spans'];cols=sorted(set(round(s['bbox'][0],0) for s in ss if s['text'].startswith('Exercise ')));cols=[x for i,x in enumerate(cols)if not i or x-cols[i-1]>10]
 for i,left in enumerate(cols):
  right=cols[i+1]-2 if i+1<len(cols)else 860
  rows=[]
  for s in sorted([s for s in ss if left-3<=s['bbox'][0]<right and 80<s['bbox'][1]<1198],key=lambda s:(round(s['bbox'][1]/2),s['bbox'][0])):
   if rows and abs(rows[-1][0]-s['bbox'][1])<3:rows[-1][1].append(s)
   else:rows.append([s['bbox'][1],[s]])
  for _,row in rows:
   text=clean(' '.join(s['text'] for s in sorted(row,key=lambda s:s['bbox'][0])))
   if text=='PEOPLE':active=True
   if not active:continue
   if any('Heavy' in s['font'] and abs(s['size']-12)<.1 for s in row):
    heading=(heading+' '+text)if pending else text;pending=True;current=None;continue
   if any('Heavy' in s['font'] and s['size']>12.5 for s in row):current=None;pending=False;continue
   m=re.fullmatch(r'Exercise (\d+)',text)
   if m:
    pending=False;current={'topic':heading,'number':m[1],'sourcePdfPage':pdf,'lines':[]};records.append(current);continue
   if current is not None:current['lines'].append(text)
for r in records:
 fields={};label=None;amb=[]
 for line in r['lines']:
  m=re.match(r'^(\d{1,2})\s+(.+)',line)
  if m:label=m[1];fields[label]=m[2]
  elif label:fields[label]+=' '+line
  elif line:amb.append(line)
 fields={k:re.sub(r'(\w)-\s+(\w)',r'\1-\2',v) for k,v in fields.items()}
 r.update(fields=fields,ambiguous=amb)
(R/'data/appendix-keys.json').write_text(json.dumps(records,ensure_ascii=False,indent=2))

# Explicit mappings checked against printed headings and exercise numbers.
VOCAB = {
 'PEOPLE': ['127-1','127-2'], 'HOME':['127-1-b2'],
 'SCHOOL':['128-1','128-2'], 'WORK':['128-1-b2','128-2-b2'],
 'FAMILY AND SOCIAL LIFE':['129-1','129-2'], 'FOOD':['129-1-b2','129-2-b2'],
 'SHOPPING AND SERVICES':['129-1-b3'],
 'TRAVELLING AND TOURISM':['130-1','130-2'], 'CULTURE':['130-1-b2','130-2-b2'],
 'SPORT':['130-1-b3','131-2'], 'HEALTH':['131-1','131-2-b2'],
 'SCIENCE AND TECHNOLOGY':['131-1-b2','132-2'],
 'THE NATURAL WORLD':['132-1','132-2-b2'], 'STATE AND SOCIETY':['132-1-b2','133-2','133-3'],
 'CULTURE OF ENGLISH- SPEAKING COUNTRIES':['133-1','133-2-b2']
}
REVIEW = {
 'Present tenses – review':['143-1','143-2','143-3','143-4'],
 'Quantifiers':['144-1','144-2','144-3','145-4','145-5','145-6'],
 'Present Perfect and Past Simple':['146-1','146-2','146-3','146-4','146-5'],
 'Comparative and superlative adjectives • too and enough':['147-1','147-2','147-3','148-4','148-5'],
 'Future forms':['148-1','148-2','149-3','149-4','149-5','149-6','149-7','149-8'],
 'First and Second Conditionals':['150-1','150-2','150-3','150-4','151-5','151-6'],
 'Modal verbs for obligation and permission':['151-1','152-2','152-3','152-4','152-5','152-6'],
 'Defining relative clauses':['153-1','153-2','153-3','153-4','153-5']
}

def variants(value):
    value = value.replace('–', '∅') if value.strip('–, ') == '' else value
    if '/' not in value:
        return [value]
    # Expand separately chosen verb groups without dropping neighbouring blanks.
    if ',' in value and all(len(part.split()) <= 8 for part in value.split(',')):
        groups = [variants(part.strip()) for part in value.split(',')]
        if all(groups):
            import itertools
            return [', '.join(parts) for parts in itertools.product(*groups)]
        return None
    pattern = r"(?:who|which|that|where|x)(?:/(?:who|which|that|where|x))+|if/whether"
    hits = list(re.finditer(pattern, value))
    if hits and sum(m[0].count('/') for m in hits) == value.count('/'):
        output = [value]
        for match in hits:
            output = [s.replace(match[0], word, 1) for s in output for word in match[0].split('/')]
        return output
    if value == 'was/were able to heal':
        return ['was able to heal', 'were able to heal']
    if value == 'Has/Have your family ever moved':
        return ['Has your family ever moved', 'Have your family ever moved']
    parts = [p.strip() for p in value.split('/')]
    if all(parts) and all(len(p.split()) <= 6 for p in parts):
        return parts
    # Long, partly shared sentence alternatives need an editorial review.
    return None

def enrich_appendix(pages, gaps):
    import hashlib
    exercises = {e['id']:e for p in pages for e in p['exercises']}
    done = []
    for record in records:
        topic, number = record['topic'], int(record['number'])
        mapping = VOCAB.get(topic) or REVIEW.get(topic)
        if mapping:
            id = 'wb-' + mapping[number-1]
        elif re.fullmatch('Unit [1-8]', topic):
            id = f"wb-{153+int(topic[-1])}-{number}"
        else:
            raise ValueError('Unmapped appendix topic: ' + topic)
        assert id in exercises, id
        ex = exercises[id]
        ex['key'] = '\n'.join(k+' '+v for k,v in record['fields'].items())
        ex['keySource'] = {'book':'teacher','pdfPage':record['sourcePdfPage'],'section':topic}
        if record['ambiguous'] or id in ['wb-155-4','wb-158-3','wb-161-4']:
            continue
        fields = []
        for label, value in record['fields'].items():
            accepted = variants(value)
            if not accepted:
                break
            if id == 'wb-158-1':
                fields.extend({'label':label+chr(97+i),'accepted':[part.strip().replace('–','∅')]} for i,part in enumerate(value.split(',')))
            else:
                fields.append({'label':label,'accepted':accepted})
        else:
            ex['answerSpec'] = fields
            mixed = id in ['wb-151-5','wb-153-5']
            ex['marking'] = {'mode':'mixed' if mixed else 'automatic'}
            ex['answerVersion'] = hashlib.sha256(json.dumps(fields,sort_keys=True).encode()).hexdigest()[:12]
            gaps.pop(id,None)
            done.append(id)
    (R/'audit/appendix.json').write_text(json.dumps({'mapped':len(records),'automatic':done},ensure_ascii=False,indent=2))
