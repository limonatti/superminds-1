#!/usr/bin/env python3
"""Locate the printed answer choices using the supplied PDF word coordinates.
Usage: python3 scripts/build-speakout-choices.py /path/to/extracted
No correct answer is used as a distractor or added to the printed alternatives.
"""
import json,re,sys,collections,unicodedata
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];A=ROOT/'speakout-a1-active-teach/assets';WORDS={b:json.loads((Path(sys.argv[1])/f'{b}-words.json').read_text())for b in ['sb','wb']}
def data(name):return json.loads((A/name).read_text().partition('=')[2].strip().removesuffix(';'))
D=data('course-web.js');TEXT=data('exercise-text.js');OVERRIDES=json.loads((ROOT/'scripts/speakout-choice-overrides.json').read_text())
def norm(s):return re.sub(r'[^a-z0-9]+','',unicodedata.normalize('NFKC',str(s)).lower().replace('’',"'"))
def weight(s):return sum(.3 if c in "ilI'.,:;/!"else .9 if c in 'mwMW'else .6 for c in s)
def tokens(words):
 result=[];seen=collections.defaultdict(list)
 for w in words:
  if any(abs(x-w['x0'])<1.5 and abs(y-w['top'])<1.5 for x,y in seen[w['text']]):continue
  seen[w['text']].append((w['x0'],w['top']))
  parts=[w['text']]if re.fullmatch(r'/(?:[szdt]|[^/]*[0-9əɪʊʌɑɒɔɛæɜθðŋʃʒɡː:;{}][^/]*)/',w['text'])or '24/7'in w['text']else re.findall(r'[^/]+|/',w['text']);
  if re.match(r'^(?:1[0-2]|[1-9])[A-Za-z’]',parts[0]):
   m=re.match(r'^(1[0-2]|[1-9])(.*)',parts[0]);parts=[m[1],m[2]]+parts[1:]
  total=weight(w['text']);x=w['x0']
  for text in parts:
   width=(w['x1']-w['x0'])*weight(text)/max(total,.1);result.append(dict(w,text=text,x0=x,x1=x+width,prefixNumber=bool(re.match(r'^\d+[A-Za-z’]',w['text']))and text.isdigit()));x+=width
 rows=[]
 for w in sorted(result,key=lambda w:(w['top'],w['x0'])):
  row=next((r for r in reversed(rows[-3:])if abs(r[0]['top']-w['top'])<4),None)
  if row is None:rows.append([w])
  else:row.append(w)
 return [w for row in rows for w in sorted(row,key=lambda w:w['x0'])]
def boxes(ws):
 rows=[]
 for w in ws:
  if not w['text'].strip():continue
  row=next((r for r in rows if abs(r[1]-w['top'])<4),None)
  if row:row[0]=min(row[0],w['x0']);row[2]=max(row[2],w['x1']);row[3]=max(row[3],w['bottom'])
  else:rows.append([w['x0'],w['top'],w['x1'],w['bottom']])
 return [[round(x-.7,2),round(y-1,2),round(z-x+1.4,2),round(t-y+2,2)]for x,y,z,t in rows]
def label(ws):
 text=' '.join(w['text']for w in ws).strip(' .,;:')
 text=re.sub(r"\s+([’'])\s*",r'\1',text)
 for bad,good in {'aft ernoon':'afternoon','1 love music':'I love music','swimming poo l':'swimming pool','fi rst':'first','o cer':'officer','post o ce':'post office','offi ce':'office','plaer':'player','sas':'says'}.items():text=re.sub(r'\b'+re.escape(bad)+r'\b',good,text)
 return text
def styled(w):return bool(re.search('Medium|Bold|Semibold',w['fontname']))
def region(e,p):
 x,y,w,h=e['box'];left=e['x']*5.95-3;side=e['x']<40
 nexts=[q['y']*8.42-2 for q in p['exercises']if q.get('x')is not None and (q['x']<40)==side and q['y']>e['y']+1]
 end=min(nexts,default=815)
 if w<90 and not e.get('fullPage'):return [x*5.95,y*8.42,(x+w)*5.95,min(end,(y+h)*8.42+18)]
 rights=[q['x']*5.95-8 for q in p['exercises']if q.get('x')is not None and q['x']>=40]
 return [max(0,left),max(0,e['y']*8.42-5),min(rights,default=292)if side else 578,end]
out={};audit=[]
for book,B in D['books'].items():
 for p in B['pages']:
  ws=WORDS[book].get(str(p['page']),[])
  for e in p['exercises']:
   rid=f'{book}:{p["page"]}:{e["label"]}';text=e.get('text')or TEXT.get(rid,'');key=D['keys'].get(f'{book}|{p["lesson"]}|{e["label"]}',{});items=key.get('items',[])
   tf=bool(items)and all(q['answer'].upper()in ['T','F','TRUE','FALSE']for q in items)
   if not re.search(r'choose.*(?:correct|alternative|words|phrases|best)|circle|true.*false',text,re.I|re.S)and not tf:continue
   if e.get('x')is None or OVERRIDES.get(rid,{}).get('_skip'):continue
   r=region(e,p);ocr=OVERRIDES.get(rid,{}).get('_ocr',{});ts=tokens([dict(w,text=ocr.get(w['text'],w['text'])) for w in ws if r[0]-1<=w['x0']and w['x1']<=r[2]+2 and r[1]<=w['top']<r[3]])
   ts=[t for t in ts if t['size']<=12]
   if OVERRIDES.get(rid,{}).get('_lanes'):ts=[t for lane in OVERRIDES[rid]['_lanes']for t in tokens([w for w in ts if lane[0]<=w['x0']<lane[1]])]
   keys={str(q['n']):q['answer']for q in items};anchors={}
   for i,t in enumerate(ts):
    line_start=not any(abs(q['top']-t['top'])<3 and q['x0']<t['x0'] for q in ts)
    if re.fullmatch(r'\d{1,2}',t['text'])and t['size']<11 and t['top']>r[1]+10 and (not keys or t['text']in keys or t['text']=='1')and(t.get('prefixNumber')or t['size']<8 or line_start):
     if not OVERRIDES.get(rid,{}).get('_superscripts')or t['size']<7:anchors[i]=t['text']
   if OVERRIDES.get(rid,{}).get('_first') and '1'not in anchors.values():anchors[-1]='1'
   anchors=dict(sorted(anchors.items()))
   groups=[];notes=[]
   if tf:
    for n,answer in keys.items():
     i=next((i for i,v in anchors.items()if v==n),None)
     if i is None:continue
     w=ts[i];groups.append({'n':n,'options':[{'value':v,'label':'True'if v=='T'else'False','text':v,'boxes':[[round(w['x0']-25+j*12,2),round(w['top']-1,2),10.5,12]]}for j,v in enumerate(['T','F'])]})
   else:
    # Lettered alternatives, using the printed bold a/b/c markers.
    for i,n in anchors.items():
     if keys and n not in keys:continue
     end=next((j for j in anchors if j>i),len(ts));section=ts[i+1:end]
     pictures=[j for j,w in enumerate(section)if re.fullmatch('[A-D]',w['text'])and 'Bold'in w['fontname']]
     if len(pictures)>=2 and [section[j]['text']for j in pictures]==list('ABCD'[:len(pictures)]):
      height=min(43,(ts[end]['top']-section[pictures[0]]['top']-3)if end<len(ts)else 40)
      if height>15:
       groups.append({'n':n,'options':[{'value':section[j]['text'],'label':section[j]['text'],'boxes':[[round(section[j]['x0']-1,2),round(section[j]['top']-1,2),60,round(height,2)]]}for j in pictures]});continue
     marks=[j for j,w in enumerate(section)if re.fullmatch('[a-dA-D]',w['text'])and(styled(w)or OVERRIDES.get(rid,{}).get('_loose_letters'))]
     start=next((k for k,j in enumerate(marks)if section[j]['text'].lower()=='a'and k+1<len(marks)and section[marks[k+1]]['text'].lower()=='b'),None)
     if start is None:continue
     marks=marks[start:];chosen=[]
     for k,j in enumerate(marks):
      if section[j]['text'].lower()!=chr(97+k):break
      stop=marks[k+1]if k+1<len(marks)else len(section);part=section[j+1:stop]
      if not part:break
      chosen.append({'value':section[j]['text'].lower(),'label':label(part),'boxes':boxes(section[j:stop])})
     if len(chosen)>=2:groups.append({'n':n,'options':chosen})
    if not groups:
     # Choices separated by a slash. Native PDFs preserve the medium weight;
     # OCR-only pages use source-text overrides for phrases when necessary.
     clusters=[]
     for i,t in enumerate(ts):
      if t['text']!='/':continue
      before=[j for j in anchors if j<i];start=max(before,default=-1);n=anchors.get(start,'1');end=next((j for j in anchors if j>i),len(ts))
      if keys and n not in keys:continue
      if start<0 and re.search(r'\b\d+\s',text)and items:continue
      left=ts[start+1:i];right=ts[i+1:end]
      if not left or not right or left[-1]['text']=='/'or right[0]['text']=='/':continue
      pair=[];source='font'
      for side,seq in [('left',left),('right',right)]:
       ordered=list(reversed(seq))if side=='left'else seq;take=[]
       for w in ordered:
        if w['text']=='/'or w['text'].endswith(':')or not(styled(w)or w['text']in ["'",'’']):break
        take.append(w)
        if side=='right'and re.search(r'[.!?]$',w['text']):break
       if not take:
        source='review';take=[ordered[0]]
        answer=keys.get(n,'');variants=re.split(r'\s*/\s*',answer.split(':',1)[-1])
        for size in range(1,min(6,len(ordered))+1):
         chunk=list(reversed(ordered[:size]))if side=='left'else ordered[:size]
         if any(norm(label(chunk))==norm(v)for v in variants):take=ordered[:size];break
       if side=='left':take.reverse()
       pair.append(take)
      override=OVERRIDES.get(rid,{}).get(n)
      if override:
       resolved=[]
       for wanted in override:
        found=[]
        for j in range(start+1,end):
         for length in range(1,9):
          candidate=ts[j:j+length]
          if not candidate or any(w['text']=='/'for w in candidate):break
          if norm(label(candidate))==norm(wanted):found=candidate;break
         if found:break
        if not found:raise ValueError(f'Cannot locate {rid} {n}: {wanted}; section='+str([(t['text'],round(t['top'],1))for t in ts[start+1:end]]))
        resolved.append(found)
       pair=resolved;source='override'
      fresh=[{'value':label(part),'label':label(part),'boxes':boxes(part)}for part in pair]
      cluster=next((g for g in clusters if g['n']==n and any(o['boxes']==p['boxes']for o in g['options']for p in fresh)),None)
      if cluster is None:cluster={'n':n,'options':[]};clusters.append(cluster)
      options=cluster['options']
      for part in pair:
       option={'value':label(part),'label':label(part),'boxes':boxes(part)}
       if option['label'] and not any(o['boxes']==option['boxes']for o in options):options.append(option)
      notes.append((n,source))
     groups=[g for g in clusters if len(g['options'])>=2]
   if not groups:continue
   # Keep every printed distractor, and expose uncertainty to the audit.
   groups.sort(key=lambda g:(g['options'][0]['boxes'][0][1],g['options'][0]['boxes'][0][0]))
   renumber=OVERRIDES.get(rid,{}).get('_renumber')
   if renumber:
    assert len(renumber)==len(groups),(rid,len(groups))
    for g,n in zip(groups,renumber):g['n']=str(n)
   counts=collections.Counter(g['n']for g in groups);seen=collections.Counter()
   for g in groups:
    n=g['n'];seen[n]+=1;g['id']=n if counts[n]==1 else f'{n}.{seen[n]}';g['part']=seen[n]-1
   allboxes=[b for g in groups for o in g['options']for b in o['boxes']];x=min([r[0]]+[b[0]-1 for b in allboxes]);y=min([r[1]]+[b[1]-1 for b in allboxes]);z=max([r[2]]+[b[0]+b[2]+1 for b in allboxes]);t=max([r[3]]+[b[1]+b[3]+1 for b in allboxes])
   out[rid]={'box':[round(x,2),round(y,2),round(z-x,2),round(t-y,2)],'groups':groups}
   audit.append({'id':rid,'keyed':len(keys),'groups':[(g['n'],[o['label']for o in g['options']],keys.get(g['n']))for g in groups],'inferred':[n for n,s in notes if s=='review']})
(A/'choices-data.js').write_text('window.SPEAKOUT_CHOICE_DATA='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
Path('/tmp/asya-a1-choice-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2))
print('Exercises:',len(out),'questions:',sum(len(x['groups'])for x in out.values()))
for a in audit:
 if a['inferred']:print(a['id'],a['groups'])
