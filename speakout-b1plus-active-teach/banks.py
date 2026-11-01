"""Verified page boundaries and activity cards from the supplied supplement."""
import re

MEDIATION={145:'1C',146:'2C',147:'2C',148:'3C',149:'3C',150:'4C',151:'4C',152:'5C',153:'6C',154:'7C',155:'7C',156:'8C'}
# lesson, exercise(s), role, left, top, right, bottom; original printed headers.
COMMUNICATION={
139:[('1B','1C','A',.078,.062,.51,.68),('1B','1C','B',.53,.060,.98,.68),('3D','6','B',.08,.694,.51,.945),('6A','5C','A',.53,.693,.98,.945)],
140:[('3C','9','B',.048,.061,.48,.69),('5D','7A','',.50,.060,.97,.95),('2D','4/6A','',.048,.709,.48,.95)],
141:[('5A','4C','',.076,.061,.42,.33),('1C','6B','B',.076,.343,.42,.59),('6A','5C','B',.076,.606,.42,.94),('5A','7C','A',.435,.060,.97,.94)],
142:[('5C','8B','',.043,.067,.97,.955)],
143:[('5A','7C','B',.078,.060,.60,.95),('6C','7','B',.62,.059,.97,.95)],
144:[('6C','7','A',.062,.058,.425,.69),('3D','6','A',.062,.707,.425,.94),('4C','6A','B',.44,.058,.97,.50),('8D','4B','',.44,.518,.97,.94)]}

def communication_exercises(number,words):
    result=[]
    for lesson,exercise,role,x,y,right,bottom in COMMUNICATION[number]:
        label='_'.join(filter(None,[lesson,exercise.replace('/','_'),role]))
        title=lesson+' · '+exercise+(' · Student '+role if role else '')
        text='\n'.join(w['text'] for w in sorted(words,key=lambda w:(round(w['y']/.007),w['x'])) if x-.005<=w['x']<right and y<=w['y']<bottom)
        result.append({'label':label,'displayLabel':title,'shortLabel':lesson,'sourceLesson':lesson,'sourceExercises':exercise.split('/'),'x':x*100,'y':y*100,'box':[x*100,y*100,(right-x)*100,(bottom-y)*100],'text':text})
    return result

def related_pages(data):
    pages=data['books']['sb']['pages']
    for p in pages:
        if p['group']=='communication':
            for card in p['exercises']:
                origins=[]
                for main in pages:
                    if main['lesson']!=card['sourceLesson']:continue
                    for exercise in main['exercises']:
                        if any(exercise['label']==n or (n.isdigit() and re.fullmatch(n+'[A-H]?',exercise['label'])) for n in card['sourceExercises']):
                            exercise.setdefault('relatedPages',[]).append(p['page']);origins.append(main['page'])
                card['relatedPages']=sorted(set(origins))
        if p['group']=='mediation':
            for exercise in p['exercises']:
                exercise['relatedPages']=[q['page'] for q in pages if q['lesson']==p['lesson'] and q['page']!=p['page']]
    for p in pages:
        for exercise in p['exercises']:
            exercise['relatedPages']=sorted(set(exercise.get('relatedPages',[])))
