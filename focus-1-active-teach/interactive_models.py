"""Low-typing adaptations of reviewed textbook tasks.
The shared bank deliberately contains the required inflected forms. Long answers
are assembled from shuffled words; personal answers remain ungraded oral cards.
"""
import hashlib,random,re

def unique(xs):
 out=[];seen=set()
 for v in xs:
  if not isinstance(v,str):continue
  v=v.strip()
  if v and v.casefold() not in seen:out.append(v);seen.add(v.casefold())
 return out

def shuffled(xs,seed):
 xs=list(xs);random.Random(int(hashlib.sha256(seed.encode()).hexdigest()[:12],16)).shuffle(xs)
 return xs

def supports(q):
 if re.match(r'Do you prefer',q,re.I):return ['I prefer … to …','I like both because …']
 if re.match(r'Do you',q,re.I):return ['Yes, I do.','No, I don’t.','Sometimes.']
 if re.match(r'Can you',q,re.I):return ['Yes, I can.','No, I can’t.','I can …, but I can’t …']
 if re.match(r'Have you got',q,re.I):return ['Yes, I have. I’ve got …','No, I haven’t.']
 if re.match(r'Have you',q,re.I):return ['Yes, I have.','No, I haven’t.']
 if re.match(r'Did you',q,re.I):return ['Yes, I did.','No, I didn’t.']
 if re.match(r'Would you',q,re.I):return ['Yes, I’d like to …','No, I wouldn’t.','I’d prefer …']
 if re.search(r'good and bad|advantages',q,re.I):return ['One good thing is …','One problem is …']
 if re.search(r'photo|picture|wearing|look like',q,re.I):return ['In the photo, I can see …','On the left/right, …','I think … because …']
 if re.search(r'what.*think|opinion|agree',q,re.I):return ['I think … because …','I agree because …','I disagree because …']
 if re.search(r'favourite',q,re.I):return ['My favourite … is …','I like … because …']
 if re.search(r'free time|weekend|usually|every day',q,re.I):return ['I usually …','I sometimes …','I never …']
 if re.search(r'last |yesterday|did you|have you ever',q,re.I):return ['I went to …','I was …','I had …']
 if re.search(r'name|age|yourself',q,re.I):return ['My name is …','I’m … years old.','I’m from …']
 if re.search(r'invit',q,re.I):return ['Would you like to …?','I’d like to invite you to …']
 if re.search(r'thank',q,re.I):return ['Thank you for …','Thanks for your help.']
 if re.search(r'why you are writing|reason for writing',q,re.I):return ['I am writing to ask about …','I’m writing to tell you about …']
 if re.search(r'ask|details|information',q,re.I):return ['Could you tell me …?','I’d like to know …']
 return ['I think …','For example, …','Because …']

def question_cards(e,E):
 ins=e['instructionText'];text=e.get('_cardText',e['text']);ref=re.search(r'(?:questions|sentences|statements|prompts).*?Exercise (\d+)',ins,re.I)
 if ref:
  target=E.get('-'.join(e['id'].split('-')[:2])+'-'+ref[1])
  if target:text=target.get('_cardText',target['text'])
 text=re.split(r'SHOW THAT YOU|SHOW WHAT YOU|ROLE-PLAY',text)[0]
 questions=[]
 for m in re.finditer(r'(?:^|\n)(?:\d{1,2}\s*)?((?:What|Which|Who|Where|When|Why|How|Do|Does|Did|Have|Has|Can|Could|Are|Is|Was|Were|Would|Will)\b[^?]*\?)',text,re.I):
  q=' '.join(m[1].split())
  if len(q)<260 and len(q)>8:questions.append(q)
 if not questions:
  bullets=re.findall(r'(?:^|\n)\s*[•●]\s*(.*?)(?=\n[•●]|$)',text,re.S)
  questions=[' '.join(b.split()) for b in bullets if 8<len(b)<260]
 if questions:return [{'prompt':q,'options':supports(q)} for q in unique(questions)[:20]]
 if re.search(r'listen.*repeat|listen.*practise',ins,re.I):
  return [{'prompt':ins,'hint':'Включи оригинальную запись выше. Повтори слова или фразы вслух, затем отметь выполнение.','options':[]}, {'prompt':'Повтори ещё раз самостоятельно. Какой звук или какая фраза требуют практики?','options':[],'hint':'Можно вернуться к записи и повторить нужный фрагмент.'}]
 if re.search(r'GRAMMAR FOCUS|REMEMBER THIS|LANGUAGE FOCUS',ins,re.I):
  return [{'prompt':ins,'hint':'Найди правило и примеры на оригинальной странице.','options':[]}, {'prompt':'Приведи свой пример по правилу и объясни, какую форму ты выбрал(а).','options':[],'hint':'Скажи пример вслух. Если нужна помощь, отметь это для преподавателя.'}]
 return [{'prompt':ins,'options':[],'hint':'Выполни задание устно по оригиналу. Отметь результат или вопрос для преподавателя.'}]

def adapt(e,E):
 a=e['activity'];spec=e['answerSpec']
 if a.get('grid'):
  a['kind']='wordsearch';return
 original_instruction=a.get('instruction') if e.get('_reviewedInstruction') else None
 if not spec:
  a['cards']=a.get('cards') or question_cards(e,E)
  a['kind']='writing-plan' if re.search(r'\b(?:write|prepare).*\b(?:email|blog|postcard|paragraph|text|description|profile|essay|letter|vlog|list|poster|quiz|presentation)',e['instructionText'],re.I) else 'guided-cards'
  a['instruction']='Проходи карточки по порядку. Выбирай опорные фразы и отвечай устно; заметки необязательны.' if a['kind']=='guided-cards' else 'Сначала пройди карточки плана и выбери опоры. Затем напиши свой текст; он сохранится для проверки с преподавателем.'
  if original_instruction:a['instruction']=original_instruction+' '+a['instruction']
  return
 pool=unique(a.get('bank',[])+[v for f in spec for v in ([f['accepted'][0]] if f.get('accepted') else [m[0] for m in f.get('members',[])])])
 pool=sorted(pool,key=str.casefold)
 # A printed prefix must not be added twice to the complete adapted forms.
 a.pop('bankPrefix',None)
 a.pop('bank',None)
 usebank=len(spec)>4 and 5<=len(pool)<=35 and max(map(len,pool))<=55 and not any(f.get('kind')=='set' for f in spec) and not any(m.get('options') or m.get('multiOptions') or m.get('tokens') for m in a['fields'])
 if usebank:a['bank']=pool
 for i,(f,m) in enumerate(zip(spec,a['fields'])):
  if m.get('options') and not all(any(v.casefold()==o['value'].casefold() for o in m['options']) for v in f.get('accepted',[])[:1]):m.pop('options',None)
  if m.get('options') or m.get('multiOptions') or m.get('tokens'):continue
  if usebank:continue
  if f.get('kind')=='set':
   m['multiOptions']=[{'value':v,'label':v} for v in pool];continue
  correct=f['accepted'][0]
  if len(pool)>1 and max(map(len,pool))<=50 and len(pool)<=18:
   m['options']=[{'value':v,'label':v} for v in pool]
  elif len(correct.split())>=3:
   m['tokens']=shuffled(correct.split(),e['id']+':'+f['label'])
  else:
   # A spelling puzzle supplies all letters (including duplicates), never a sole correct choice.
   m['tokens']=shuffled(list(correct),e['id']+':'+f['label']);m['tokenJoin']=''
  m['adapted']=True
 if usebank:a['kind']='bank'
 elif any(m.get('tokens') for m in a['fields']):a['kind']='build'
 elif any(m.get('multiOptions') for m in a['fields']):a['kind']='multi-choice'
 else:a['kind']='choice'
 a['instruction']=(original_instruction+' ' if original_instruction else '')+'Выбирай варианты или собирай ответы из элементов. Номера соответствуют оригиналу; слова с пропущенными буквами собирай целиком.'
