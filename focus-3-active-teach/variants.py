"""Expand compact teacher-key alternatives without accepting incomplete fragments."""
import re,json,hashlib

EXACT={
 'isn’t exactly generous/kind':['isn’t exactly generous','isn’t exactly kind'],
 'the first/last phase':['the first phase','the last phase'],
 'the first/last step':['the first step','the last step'],
 'comes/is coming':['comes','is coming'],
 'was/were going to':['was going to','were going to'],
 'behaving/having behaved badly':['behaving badly','having behaved badly'],
 'doing/to do the same thing over':['doing the same thing over','to do the same thing over'],
 'nor/neither did my parents':['nor did my parents','neither did my parents'],
 'neither/nor will I':['neither will I','nor will I'],
 'wanted to try out badminton/badminton out':['wanted to try out badminton','wanted to try badminton out'],
 'They eat frozen food from home/their mums and live off food from cans.':['They eat frozen food from home and live off food from cans.','They eat frozen food from their mums and live off food from cans.'],
 'can/could, about':['can, about','could, about'],
 'can/could, whether':['can, whether','could, whether'],
 'Can/could, tell, what, is':['Can, tell, what, is','could, tell, what, is'],
 'can/could, have':['can, have','could, have'],
 'sounds good/great':['sounds good','sounds great'],
 'a tree with a trunk/which has a trunk':['a tree with a trunk','a tree which has a trunk'],
 'the trail (that/which) we followed':['the trail that we followed','the trail which we followed','the trail we followed'],
 'wishes she wasn’t/weren’t allergic':['wishes she wasn’t allergic','wishes she weren’t allergic'],
 'if/whether she had':['if she had','whether she had'],
 'if/whether he was':['if he was','whether he was'],
 'is having/is going to have her back massaged':['is having her back massaged','is going to have her back massaged'],
 'love each other / one another':['love each other','love one another'],
 'difficult/hard to express herself':['difficult to express herself','hard to express herself'],
 'worked/been working with each other':['worked with each other','been working with each other'],
 'may have got/travelled':['may have got','may have travelled'],
 'Neither/Nor have':['Neither have','Nor have'],
 'Neither/Nor should':['Neither should','Nor should'],
 'whose story/stories we have just listened to':['whose story we have just listened to','whose stories we have just listened to'],
}

def apply_variants(pages):
 for pg in pages:
  for e in pg['exercises']:
   for f in e['answerSpec']:
    if e.get('reviewed'):continue
    if f.get('kind')=='set':continue
    raw=f['accepted'][0]
    if raw in EXACT:f['accepted']=EXACT[raw]
    elif 'if/whether' in raw:
     f['accepted']=[raw.replace('if/whether',v)for v in ['if','whether']]
    elif re.fullmatch(r'\w+\s*/\s*\w+',raw):f['accepted']=[s.strip()for s in raw.split('/')]
    expanded=[]
    for v in f['accepted']:
     if '(' in v and ')' in v:
      # Optional words are independent, e.g. asked (me) ... (yet).
      variants=[v]
      while any('(' in s for s in variants):
       variants=[q for s in variants for q in ([s] if '('not in s else [re.sub(r'\(([^()]*)\)',r'\1',s,count=1),re.sub(r'\([^()]*\)','',s,count=1)])]
      expanded.extend(' '.join(s.split())for s in variants)
     else:expanded.append(v)
    f['accepted']=list(dict.fromkeys(expanded))
   e['answerVersion']=hashlib.sha256(json.dumps({'fields':e['answerSpec'],'mode':e.get('responseMode')},sort_keys=True).encode()).hexdigest()[:12]
