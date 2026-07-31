# -*- coding: utf-8 -*-
# Контент курса Solutions Pre-Intermediate (3rd ed.) — АВТОРСКИЙ, по программе (секции A–H).
# Тексты, задания и переводы — оригинальные (не копия книги). Вёрстка — gen_units.py.
DATA = []

# ===================== INTRODUCTION =====================
DATA.append({
 "n":0, "title":"Introduction", "emoji":"🧭", "grad":("#1f6f9c","#39b0c9"),
 "desc":"be · have got · Present Simple · личная информация и внешность",
 "grammar":[
  {"t":"IB · to be, have got, possessive 's","h":r'''    <div class="g-ex"><b>to be</b>: I'm, you/we/they're, he/she/it's. Отриц.: isn't/aren't.</div>
    <div class="g-ex"><b>have got</b>: I've got, she's got; отриц. haven't/hasn't got.</div>
    <div class="g-ex">Притяжательный <b>'s</b>: Tom<b>'s</b> phone, my parents<b>'</b> car.</div>'''},
  {"t":"ID · Present Simple","h":r'''    <div class="g-ex">he/she/it → <b>-s</b>: works, goes, studies, watches.</div>
    <div class="g-ex">Отриц./вопрос: don't / doesn't; Do/Does…?</div>
    <div class="g-ex">Наречия частоты: always, usually, often, sometimes, never — перед глаголом.</div>'''},
 ],
 "words":[
  ["short hair","короткие волосы"],["long hair","длинные волосы"],["wavy hair","волнистые волосы"],
  ["straight hair","прямые волосы"],["curly hair","кудрявые волосы"],["dark hair","тёмные волосы"],
  ["fair hair","светлые волосы"],["tall","высокий"],["good-looking","привлекательный"],["middle-aged","средних лет"],
  ["surname","фамилия"],["first name","имя"],["age","возраст"],["nationality","национальность"],
  ["address","адрес"],["date of birth","дата рождения"],["twin","близнец"],["only child","единственный ребёнок"],
  ["married","женат/замужем"],["single","холост/не замужем"],
 ],
 "pron_words":["surname","nationality","married","wavy","straight","address","birthday"],
 "pron_focus":"Ударение и немые буквы",
 "pron_note":"naTIOnality · married /ˈmærid/ · straight (gh немые)",
 "chunks":[
  ["What's your name?","как тебя зовут?"],["How old are you?","сколько тебе лет?"],["Where are you from?","откуда ты?"],
  ["What do you look like?","как ты выглядишь?"],["I've got…","у меня есть…"],["This is my…","это мой/моя…"],
  ["Nice to meet you","приятно познакомиться"],["How do you spell it?","как это пишется?"],
 ],
 "listen_title":"Filling in a form",
 "names":{"m":"Ben","f":"Olga"},
 "dialog":[
  ["m","Hi, I'm Ben. I need to fill in this form. What's your surname?"],
  ["f","It's Petrova. P-E-T-R-O-V-A."],
  ["f","And my first name is Olga."],
  ["m","Thanks. How old are you, Olga?"],
  ["f","I'm fifteen. My date of birth is the third of May."],
  ["m","Where are you from?"],
  ["f","I'm from Russia, but I live here now. Here's my address."],
  ["m","Great, that's everything. Nice to meet you!"],
 ],
 "lq":[
  {"q":"What is Olga's surname?","o":["Petrova","Popova","Pavlova"],"a":0},
  {"q":"How old is Olga?","o":["thirteen","fifteen","sixteen"],"a":1},
  {"q":"When is her date of birth?","o":["3rd May","5th March","13th May"],"a":0},
  {"q":"Where is Olga from?","o":["Russia","Poland","Ukraine"],"a":0},
  {"q":"What does Ben do at the end?","o":["asks for money","says nice to meet you","leaves"],"a":1},
 ],
 "reading_title":"My best friend",
 "reading":r'''<p>This is my best friend, Marek. He's sixteen and he's from Poland. Marek is tall and good-looking, with short, dark, wavy hair.</p>
   <p>He's got one brother and a twin sister. Every day he goes to school by bike and after school he usually plays basketball. He's really friendly and I'm lucky to have him as a friend.</p>''',
 "rq":[
  {"q":"How old is Marek?","o":["fifteen","sixteen","seventeen"],"a":1},
  {"q":"What does Marek look like?","o":["short with fair hair","tall with dark wavy hair","old with a beard"],"a":1},
  {"q":"Has Marek got a twin?","o":["yes, a sister","no","a twin brother"],"a":0},
  {"q":"How does he get to school?","o":["by bus","by bike","on foot"],"a":1},
 ],
 "ex":[
  {"q":"I ___ from Poland.","o":["am","is","are"],"a":0},
  {"q":"She ___ got two brothers.","o":["have","has","is"],"a":1},
  {"q":"This is ___ father's car. (Tom)","o":["Toms","Tom's","Toms'"],"a":1},
  {"q":"He ___ to school by bus.","o":["go","goes","going"],"a":1},
  {"q":"___ you like music?","o":["Do","Does","Are"],"a":0},
  {"q":"She ___ like coffee.","o":["don't","doesn't","isn't"],"a":1},
  {"q":"They ___ got a big house.","o":["has","have","is"],"a":1},
  {"q":"My sister ___ English every day.","o":["study","studies","studys"],"a":1},
  {"q":"___ is your date of birth?","o":["When","Where","Who"],"a":0},
  {"q":"He's ___ boy with dark hair.","o":["a","an","the"],"a":0},
  {"q":"We ___ usually late.","o":["are","is","am"],"a":0},
  {"q":"___ she got a car? — No, she hasn't.","o":["Have","Has","Is"],"a":1},
 ],
 "gaps":[
  {"q":"He ___ (not/like) tea. (present simple)","a":["doesn't like","does not like"]},
  {"q":"They ___ (have got) a dog. (has/have got)","a":["have got","'ve got"]},
  {"q":"This is ___ (Anna) bag. (притяжательный 's)","a":["Anna's"]},
  {"q":"___ (you/be) from Spain? (вопрос)","a":["are you"]},
  {"q":"She ___ (study) at a big school.","a":["studies"]},
  {"q":"How old ___ (he/be)? (вопрос)","a":["is he"]},
 ],
 "word_skills":[
  {"q":"Форма he/she от «go»:","o":["gos","goes","goies"],"a":1},
  {"q":"Форма he/she от «study»:","o":["studys","studies","studyes"],"a":1},
  {"q":"Форма he/she от «watch»:","o":["watchs","watches","watch"],"a":1},
  {"q":"«fifteen» — это…","o":["15","50","5"],"a":0},
  {"q":"«thirtieth» — это порядковое…","o":["13","30","3"],"a":1},
  {"q":"Впиши краткую форму: she is → ___","a":["she's"]},
  {"q":"Впиши краткую форму: they have got → they ___ got","a":["'ve","have"]},
  {"q":"Впиши: I am not → I ___ (краткая форма)","a":["'m not"]},
 ],
 "word_skills_note":"Формы Present Simple (he/she -s), числа и краткие формы be / have got.",
 "howto_title":"💬 How to… представиться",
 "howto":r'''    <div class="g-ex"><b>Hi, I'm…</b> / <b>My name's…</b></div>
    <div class="g-ex"><b>I'm … years old.</b> / <b>I'm from…</b></div>
    <div class="g-ex"><b>How do you spell that?</b> — <b>It's spelt…</b></div>''',
 "fx":[
  {"q":"Спроси возраст:","o":["How old are you?","How many years you?","What age do you?"],"a":0},
  {"q":"Спроси, как пишется:","o":["How do you spell it?","How write you?","Spell what you?"],"a":0},
  {"q":"Опиши внешность:","o":["I've got short dark hair.","I have short hair dark.","Me hair short dark."],"a":0},
  {"q":"Скажи, откуда ты:","o":["I'm from Russia.","I from Russia am.","Me Russia from."],"a":0},
 ],
 "speaking":[
  "Представься: имя, возраст, откуда ты, национальность (4–5 предложений).",
  "Опиши свою внешность и внешность друга (has got…, is…).",
  "Задай собеседнику 5 вопросов о личной информации.",
  "Расскажи о своей семье: кто есть, чем занимаются (Present Simple).",
 ],
 "writing":r'''<b>Personal profile.</b> Напиши короткий профиль о себе (5–6 предложений): имя, возраст, откуда ты, внешность (I've got…), семья и что ты обычно делаешь после школы (Present Simple). <br><br>Проверь себя: есть ли <i>-s</i> у he/she, правильные краткие формы (I'm, she's got), и заглавные буквы у имён и национальностей.''',
 "wbmc":[
  {"q":"Единственный ребёнок = an ___ child.","o":["only","one","single"],"a":0},
  {"q":"Фамилия = ___ .","o":["surname","first name","nickname"],"a":0},
  {"q":"Волнистые волосы = ___ hair.","o":["wavy","curly","straight"],"a":0},
  {"q":"У неё есть = She ___ got.","o":["has","have","is"],"a":0},
  {"q":"Он из Италии = He's ___ Italy.","o":["from","of","in"],"a":0},
 ],
 "wbgaps":[
  {"q":"I ___ (be) fifteen. (am/is/are)","a":["am","'m"]},
  {"q":"She ___ (have got) long hair. (has got)","a":["has got","'s got"]},
  {"q":"He ___ (go) to school by bus. (present simple)","a":["goes"]},
  {"q":"This is ___ (my brother) room. (притяжательный)","a":["my brother's"]},
  {"q":"___ (they/be) from Poland? (вопрос)","a":["are they"]},
 ],
 "hw":r'''<b>О себе.</b> Заполни анкету о себе (имя, фамилия, возраст, дата рождения, национальность, внешность) и напиши 5 предложений о своём обычном дне.<br><br>Затем открой <a href="solutions-pi-u0-workbook.html" style="color:#1f6a86;font-weight:900;text-decoration:underline">Workbook Introduction</a> 🧭''',
})

# ===================== UNIT 1 · Feelings =====================
DATA.append({
 "n":1, "title":"Feelings", "emoji":"😀", "grad":("#c0392b","#e0642a"),
 "desc":"Present Simple/Continuous · Past Simple · -ed/-ing adjectives · чувства и эмоции",
 "grammar":[
  {"t":"1B · Present Simple vs Present Continuous","h":r'''    <table>
      <tr><th>Форма</th><th>Когда</th><th>Пример</th></tr>
      <tr><td><b>Present Simple</b></td><td>привычки, факты</td><td>I <b>feel</b> happy on Fridays.</td></tr>
      <tr><td><b>Present Continuous</b></td><td>сейчас/временно</td><td>She <b>is feeling</b> nervous today.</td></tr>
    </table>
    <div class="g-ex">State verbs (like, know, want, feel*) обычно в Simple.</div>'''},
  {"t":"1D · Past Simple","h":r'''    <table>
      <tr><th>+</th><th>–</th><th>?</th></tr>
      <tr><td>played, felt, went, <b>-ed</b></td><td><b>didn't</b> feel</td><td><b>Did</b> you feel…?</td></tr>
    </table>
    <div class="g-ex">Неправильные: feel→<b>felt</b>, go→<b>went</b>, give→<b>gave</b>, be→<b>was/were</b>.</div>'''},
 ],
 "words":[
  ["annoyed","раздражённый"],["bored","скучающий"],["confused","растерянный"],["delighted","в восторге"],
  ["disappointed","разочарованный"],["embarrassed","смущённый"],["excited","взволнованный (радостно)"],["frightened","испуганный"],
  ["jealous","ревнующий/завистливый"],["nervous","нервничающий"],["proud","гордый"],["relaxed","расслабленный"],
  ["scared","напуганный"],["stressed","в стрессе"],["surprised","удивлённый"],["upset","расстроенный"],
  ["worried","обеспокоенный"],["amazed","поражённый"],["ashamed","пристыжённый"],["confident","уверенный"],
 ],
 "pron_words":["annoyed","embarrassed","jealous","nervous","delighted","surprised","frightened"],
 "pron_focus":"Окончание -ed в прилагательных",
 "pron_note":"bored /d/ · excited /ɪd/ · surprised /d/ — слушай окончание",
 "chunks":[
  ["feel nervous","нервничать"],["be worried about","переживать из-за"],["get excited","радоваться/волноваться"],
  ["cheer up","приободриться"],["calm down","успокоиться"],["be proud of","гордиться"],
  ["What's the matter?","что случилось?"],["Don't worry","не переживай"],
 ],
 "listen_title":"Before the concert",
 "names":{"m":"Leo","f":"Mia"},
 "dialog":[
  ["f","Hi Leo! You look really worried. What's the matter?"],
  ["m","Hi Mia. I'm so nervous. We're playing a concert tonight and I feel scared."],
  ["f","Scared? But you love being on stage!"],
  ["m","I know, but this time it's different. There are three hundred tickets and they're all sold."],
  ["f","Wow, three hundred people! That's amazing, not scary."],
  ["m","For you, maybe. Last time I was so embarrassed — I forgot the words in the first song!"],
  ["f","Ha! I remember. But honestly, everyone was still delighted. They were dancing and singing."],
  ["m","Really? I felt terrible. I was sure they were disappointed."],
  ["f","Not at all. My little brother said it was the best concert of his life."],
  ["m","That's surprising. I didn't know that."],
  ["f","See? You worry too much. Just breathe, relax and enjoy it."],
  ["m","You're right. When I start playing, I usually forget I'm nervous."],
  ["f","Exactly. And I'll be there in the front row, cheering for you."],
  ["m","Thanks, Mia. I'm feeling a bit calmer now. Let's do this!"],
 ],
 "lq":[
  {"q":"How does Leo feel now?","o":["bored","nervous and scared","angry"],"a":1},
  {"q":"What is happening tonight?","o":["a concert","an exam","a party"],"a":0},
  {"q":"What happened last time?","o":["he was late","he forgot the words","he was ill"],"a":1},
  {"q":"How did the audience feel last time?","o":["disappointed","delighted","bored"],"a":1},
  {"q":"How does Leo feel at the end?","o":["worse","a bit calmer","angry"],"a":1},
 ],
 "reading_title":"A festival to remember",
 "reading":r'''<p>Last summer I went to a music festival with my friends. Before the first concert I was really nervous, but I was also very excited. The weather was perfect and thousands of people were singing together.</p>
   <p>Suddenly it started to rain, but nobody was upset. We were dancing in the rain and laughing. It was the best weekend of my life, and I felt so happy and relaxed. I'll never forget it!</p>''',
 "rq":[
  {"q":"When did the writer go to the festival?","o":["last summer","last winter","last week"],"a":0},
  {"q":"How did the writer feel before the concert?","o":["bored","nervous but excited","angry"],"a":1},
  {"q":"What happened suddenly?","o":["it started to rain","the power went off","a fight started"],"a":0},
  {"q":"How did people react to the rain?","o":["they were upset","they danced and laughed","they left"],"a":1},
  {"q":"How did the writer feel at the end?","o":["happy and relaxed","disappointed","scared"],"a":0},
 ],
 "listen2_title":"Radio phone-in: How do you deal with stress?",
 "names2":{"m":"Presenter","f":"Dr Hill","f2":"Nina (caller)","m2":"Sam (caller)"},
 "dialog2":[
  ["m","Welcome back to the show. Today we're talking about stress with psychologist Dr Hill. Hello!"],
  ["f","Hello, thanks for having me."],
  ["m","So, why do teenagers feel so stressed these days?"],
  ["f","There are many reasons — exams, friends, social media. Feeling nervous sometimes is completely normal."],
  ["m","We have a caller. Nina, you're on the air!"],
  ["f2","Hi! I get really nervous before exams and I can't sleep. What can I do?"],
  ["f","Good question, Nina. Talk to someone, breathe slowly, and go to bed early. A tired brain feels everything more strongly."],
  ["m","Thanks, Nina. And we have Sam on line two."],
  ["m2","Hi. When I feel stressed, I just play video games all night. Is that bad?"],
  ["f","A little rest is fine, Sam, but too much screen time makes it worse. Try a short walk instead."],
  ["m","Great advice. Any last tip, Dr Hill?"],
  ["f","Yes — be kind to yourself. Nobody feels confident all the time, and that's OK."],
 ],
 "lq2":[
  {"q":"Who is Dr Hill?","o":["a teacher","a psychologist","a doctor of medicine"],"a":1},
  {"q":"What is Nina's problem?","o":["she can't sleep before exams","she has no friends","she is bored"],"a":0},
  {"q":"What does Dr Hill tell Nina to do?","o":["talk, breathe, sleep early","study all night","stop eating"],"a":0},
  {"q":"What does Sam do when stressed?","o":["plays video games all night","goes running","reads"],"a":0},
  {"q":"What does Dr Hill suggest for Sam?","o":["more games","a short walk","more coffee"],"a":1},
  {"q":"What is her last tip?","o":["work harder","be kind to yourself","never rest"],"a":1},
 ],
 "reading2_title":"The science of a smile",
 "reading2":r'''<p>Did you know that your face can change your mood? Scientists have found that when you smile — even a fake smile — your brain gets a small signal that says "I'm happy". After a few minutes, you often really do feel better.</p>
   <p>It works the other way too. When we feel proud or excited, we stand taller and smile more. So feelings and the body are closely connected, like a two-way street.</p>
   <p>Next time you feel a bit down, try this simple experiment: smile for thirty seconds. It won't solve big problems, but many people say it makes a stressful moment a little easier.</p>''',
 "rq2":[
  {"q":"What can change your mood, according to the text?","o":["your face","the weather","your phone"],"a":0},
  {"q":"What signal does the brain get when you smile?","o":["\"I'm tired\"","\"I'm happy\"","\"I'm hungry\""],"a":1},
  {"q":"How are feelings and the body connected?","o":["not at all","like a two-way street","only in children"],"a":1},
  {"q":"What experiment does the text suggest?","o":["run fast","smile for thirty seconds","shout loudly"],"a":1},
  {"q":"Will smiling solve big problems?","o":["yes, always","no, but it can help a stressful moment","it makes things worse"],"a":1},
 ],
 "tf":[
  {"q":"Leo feels calm before the concert.","a":False},
  {"q":"Mia's brother enjoyed the last concert.","a":True},
  {"q":"Dr Hill says feeling nervous is completely normal.","a":True},
  {"q":"Nina sleeps very well before exams.","a":False},
  {"q":"A fake smile can send a 'happy' signal to the brain.","a":True},
  {"q":"Smiling solves all big problems.","a":False},
 ],
 "ex":[
  {"q":"Look! She ___ because of the exam. (сейчас)","o":["worries","is worrying","worry"],"a":1},
  {"q":"I usually ___ nervous before tests.","o":["feel","am feeling","feels"],"a":0},
  {"q":"He ___ really proud yesterday.","o":["feels","felt","is feeling"],"a":1},
  {"q":"They ___ to the festival last year.","o":["go","went","were going"],"a":1},
  {"q":"We ___ excited right now!","o":["are","were","is"],"a":0},
  {"q":"She ___ the words last time. (forget)","o":["forgot","forget","forgets"],"a":0},
  {"q":"___ you feel scared yesterday?","o":["Did","Do","Was"],"a":0},
  {"q":"I ___ happy every Friday.","o":["am feeling","feel","feels"],"a":1},
  {"q":"The film was so ___ — I nearly slept! (-ing/-ed)","o":["boring","bored","bore"],"a":0},
  {"q":"I was ___ by the news. (-ing/-ed)","o":["surprising","surprised","surprise"],"a":1},
  {"q":"He ___ his keys this morning. (find, past)","o":["found","finded","find"],"a":0},
  {"q":"Right now they ___ in the rain.","o":["dance","are dancing","danced"],"a":1},
  {"q":"She didn't ___ well yesterday.","o":["felt","feel","feels"],"a":1},
  {"q":"We ___ delighted with the result. (was/were)","o":["was","were","are being"],"a":1},
  {"q":"Choose the correct order:","o":["I always am nervous","I am always nervous","Always I am nervous"],"a":1},
  {"q":"He ___ a present to me. (give, past)","o":["gived","gave","give"],"a":1},
 ],
 "gaps":[
  {"q":"Right now I ___ (feel) nervous. (present continuous)","a":["am feeling","'m feeling"]},
  {"q":"She usually ___ (get) excited before a trip. (present simple)","a":["gets"]},
  {"q":"We ___ (go) to a concert last night. (past)","a":["went"]},
  {"q":"He ___ (not/feel) well yesterday. (past neg)","a":["didn't feel","did not feel"]},
  {"q":"___ (you/be) worried yesterday? (was/were вопрос)","a":["were you"]},
  {"q":"They ___ (dance) when it started to rain. (past continuous)","a":["were dancing"]},
  {"q":"I ___ (feel) proud when I passed. (past)","a":["felt"]},
  {"q":"The lesson was ___ (bore). (-ing/-ed прилагательное)","a":["boring"]},
 ],
 "word_skills":[
  {"q":"«скучный» (о вещи) = ___ (-ing/-ed)","o":["boring","bored","bore"],"a":0},
  {"q":"«мне скучно» = I'm ___ .","o":["boring","bored","bore"],"a":1},
  {"q":"«волнующий» (о событии) = ___","o":["excited","exciting","excite"],"a":1},
  {"q":"«я взволнован» = I'm ___ .","o":["exciting","excited","excite"],"a":1},
  {"q":"«пугающий» (о фильме) = ___","o":["frightened","frightening","fright"],"a":1},
  {"q":"Приставка «не-»: happy → ___ happy","a":["un"]},
  {"q":"Прилагательное от «annoy»: I'm ___ .","a":["annoyed"]},
  {"q":"Прилагательное от «interest» (о человеке): I'm ___ .","a":["interested"]},
 ],
 "word_skills_note":"Прилагательные на -ed (о человеке) и -ing (о вещи/событии), приставка un-.",
 "howto_title":"💬 How to… говорить о чувствах",
 "howto":r'''    <div class="g-ex"><b>What's the matter?</b> — <b>I feel…</b> / <b>I'm a bit…</b></div>
    <div class="g-ex"><b>Don't worry!</b> / <b>Cheer up!</b> / <b>Calm down.</b></div>
    <div class="g-ex"><b>I'm really proud of you.</b></div>''',
 "fx":[
  {"q":"Спроси, что случилось:","o":["What's the matter?","What matter you?","Why you do?"],"a":0},
  {"q":"Поддержи друга:","o":["Don't worry, it'll be fine!","You bad now.","Stop feeling."],"a":0},
  {"q":"Скажи о своём чувстве:","o":["I feel a bit nervous.","I nervous feel bit.","Me nervous do."],"a":0},
  {"q":"Похвали:","o":["I'm really proud of you!","You proud me.","Proud I you of."],"a":0},
 ],
 "speaking":[
  "Расскажи о ситуации, когда ты нервничал(а), и как справился(лась). 5–6 предложений (Past Simple).",
  "Как ты себя чувствуешь в разных ситуациях: перед экзаменом, на вечеринке, в дождь? (I feel…).",
  "Ролевая игра: друг расстроен — спроси What's the matter? и поддержи.",
  "Опиши -ed/-ing: назови 3 boring и 3 exciting вещи из своей жизни.",
 ],
 "writing":r'''<b>A message about your feelings.</b> Напиши другу сообщение (5–7 предложений) о событии на прошлой неделе: что случилось (Past Simple), как ты себя чувствовал(а) (I felt…, I was…) и почему. Используй минимум 4 прилагательных чувств и 2 неправильных глагола.<br><br>Проверь: правильные формы Past Simple, -ed/-ing прилагательные, связки (because, so, but).''',
 "wbmc":[
  {"q":"Очень рад = ___ .","o":["delighted","annoyed","bored"],"a":0},
  {"q":"Гордиться кем-то = be ___ of somebody.","o":["proud","jealous","scared"],"a":0},
  {"q":"Успокойся = ___ down.","o":["calm","cheer","get"],"a":0},
  {"q":"Фильм скучный = a ___ film. (-ing/-ed)","o":["boring","bored","bore"],"a":0},
  {"q":"Past Simple от feel = ___ .","o":["felt","feeled","fell"],"a":0},
 ],
 "wbgaps":[
  {"q":"I ___ (feel) scared last night. (past)","a":["felt"]},
  {"q":"She ___ (not/go) to the party. (past neg)","a":["didn't go","did not go"]},
  {"q":"We ___ (watch) a film when he called. (past continuous)","a":["were watching"]},
  {"q":"I'm ___ (interest) in music. (-ed прилагательное)","a":["interested"]},
  {"q":"The news was ___ (surprise). (-ing прилагательное)","a":["surprising"]},
 ],
 "hw":r'''<b>Feelings diary.</b> Опиши свой вчерашний день: 3 момента и что ты чувствовал(а) в каждом (Past Simple + прилагательные чувств). Пример: <i>«In the morning I felt tired… After the test I was relaxed and proud.»</i><br><br>Затем реши <a href="solutions-pi-u1-workbook.html" style="color:#a5301f;font-weight:900;text-decoration:underline">Workbook Unit 1</a> 😀''',
})

# ===================== UNIT 2 · Adventure =====================
DATA.append({
 "n":2, "title":"Adventure", "emoji":"🧗", "grad":("#2a6f8f","#3aa0c9"),
 "desc":"Past Continuous · Past Simple vs Continuous · приключения и природа",
 "grammar":[
  {"t":"2B · Past Continuous","h":r'''    <table>
      <tr><th>Форма</th><th>Пример</th></tr>
      <tr><td><b>was/were + -ing</b></td><td>I <b>was climbing</b>. They <b>were hiking</b>.</td></tr>
    </table>
    <div class="g-ex">Действие в процессе в прошлом: At 6 p.m. we <b>were walking</b> in the forest.</div>'''},
  {"t":"2D · Past Simple vs Past Continuous","h":r'''    <div class="g-ex"><b>while</b> + Past Continuous — фон: <b>While</b> we <b>were sailing</b>, …</div>
    <div class="g-ex"><b>when</b> + Past Simple — короткое событие: … a storm <b>started</b>.</div>
    <div class="g-ex">I <b>was cooking</b> when the phone <b>rang</b>.</div>'''},
 ],
 "words":[
  ["go camping","ходить с палаткой"],["rock climbing","скалолазание"],["rafting","рафтинг"],
  ["scuba diving","дайвинг"],["hiking","поход/треккинг"],["sailing","парусный спорт"],["cave","пещера"],
  ["cliff","утёс"],["waterfall","водопад"],["valley","долина"],["path","тропа"],["rope","верёвка"],
  ["tent","палатка"],["torch","фонарик"],["compass","компас"],["backpack","рюкзак"],
  ["explore","исследовать"],["survive","выживать"],["escape","спастись/сбежать"],["get lost","заблудиться"],
 ],
 "pron_words":["adventure","climbing","waterfall","survive","dangerous","equipment","mountain"],
 "pron_focus":"Ударение в длинных словах",
 "pron_note":"adVENture · EQuipment · DANgerous — ударный слог",
 "chunks":[
  ["go on an adventure","отправиться в приключение"],["set off early","выйти рано"],["run out of water","остаться без воды"],
  ["put up a tent","поставить палатку"],["be in danger","быть в опасности"],["take a risk","рисковать"],
  ["make it to the top","добраться до вершины"],["get lost","заблудиться"],
 ],
 "listen_title":"A day in the mountains",
 "names":{"m":"Jack","f":"Sara"},
 "dialog":[
  ["f","Jack, what were you doing at six o'clock yesterday? I called you."],
  ["m","Sorry, I was hiking in the mountains. There was no signal."],
  ["f","Cool! Was it a hard walk?"],
  ["m","Yes! While we were climbing, it suddenly started to rain."],
  ["f","Oh no. What did you do?"],
  ["m","We put up our tent quickly and waited. We nearly ran out of water!"],
  ["f","Scary. Did you make it to the top?"],
  ["m","We did, in the end. The view was amazing — it was a real adventure."],
 ],
 "lq":[
  {"q":"What was Jack doing at six o'clock?","o":["sleeping","hiking in the mountains","swimming"],"a":1},
  {"q":"Why didn't he answer the phone?","o":["it was broken","there was no signal","he was busy"],"a":1},
  {"q":"What happened while they were climbing?","o":["it started to rain","they got lost","they fell"],"a":0},
  {"q":"What did they nearly run out of?","o":["food","water","rope"],"a":1},
  {"q":"Did they reach the top?","o":["yes","no","they gave up"],"a":0},
 ],
 "reading_title":"Lost in the cave",
 "reading":r'''<p>Last year, two friends went exploring in a large cave. They were walking deep inside when their torch suddenly stopped working. It was completely dark and they couldn't find the path.</p>
   <p>They didn't panic. While one friend was looking for the exit, the other was calling for help. After three hours, a rescue team found them. It was frightening, but they survived — and they will never go into a cave without two torches again!</p>''',
 "rq":[
  {"q":"Where were the friends exploring?","o":["a forest","a large cave","a mountain"],"a":1},
  {"q":"What stopped working?","o":["their phone","their torch","their car"],"a":1},
  {"q":"What was one friend doing while the other looked for the exit?","o":["sleeping","calling for help","eating"],"a":1},
  {"q":"Who found them?","o":["a rescue team","the police","nobody"],"a":0},
  {"q":"What will they always take now?","o":["two torches","a dog","a map"],"a":0},
 ],
 "ex":[
  {"q":"At 8 p.m. we ___ dinner.","o":["were having","had","have"],"a":0},
  {"q":"While I ___ , it started to rain.","o":["walked","was walking","walk"],"a":1},
  {"q":"They ___ when the storm began.","o":["were sailing","sailed","sail"],"a":0},
  {"q":"I ___ TV when you called.","o":["watched","was watching","watch"],"a":1},
  {"q":"What ___ you doing at noon?","o":["was","were","did"],"a":1},
  {"q":"The sun ___ while we were hiking.","o":["shone","was shining","shines"],"a":1},
  {"q":"She ___ her leg while she was climbing.","o":["hurt","was hurting","hurts"],"a":0},
  {"q":"We ___ the tent when it got dark.","o":["were putting up","put up","put"],"a":1},
  {"q":"They weren't ___ attention.","o":["pay","paying","paid"],"a":1},
  {"q":"I ___ lost while I was exploring.","o":["got","was getting","get"],"a":0},
  {"q":"He fell ___ he was running.","o":["while","during","when"],"a":0},
  {"q":"___ they camping last weekend?","o":["Was","Were","Did"],"a":1},
  {"q":"We ___ a noise and stopped.","o":["were hearing","heard","hear"],"a":1},
  {"q":"While she ___ , he cooked.","o":["rested","was resting","rests"],"a":1},
  {"q":"It ___ heavily all night.","o":["was raining","rained","rains"],"a":0},
  {"q":"When the guide arrived, we ___ for two hours.","o":["waited","had waited","were waiting"],"a":2},
 ],
 "gaps":[
  {"q":"At 7 a.m. we ___ (hike). (past continuous)","a":["were hiking"]},
  {"q":"While I ___ (climb), I saw an eagle. (past continuous)","a":["was climbing"]},
  {"q":"The torch ___ (stop) working suddenly. (past simple)","a":["stopped"]},
  {"q":"They ___ (not/panic) in the cave. (past neg)","a":["didn't panic","did not panic"]},
  {"q":"What ___ (you/do) at midnight? (past continuous)","a":["were you doing"]},
  {"q":"We ___ (put up) the tent when it started to rain.","a":["were putting up","put up"]},
  {"q":"She ___ (fall) while she was running. (past simple)","a":["fell"]},
  {"q":"___ (they/sail) when the storm began? (past continuous)","a":["were they sailing"]},
 ],
 "word_skills":[
  {"q":"quick → наречие","o":["quick","quickly","quackly"],"a":1},
  {"q":"careful → наречие","o":["carefuly","carefully","careful"],"a":1},
  {"q":"good → наречие","o":["goodly","well","gooder"],"a":1},
  {"q":"explore → человек (сущ.)","o":["explorer","exploration","exploring"],"a":0},
  {"q":"«climb up» — движение…","o":["вверх","вниз","вокруг"],"a":0},
  {"q":"Наречие от «easy»:","a":["easily"]},
  {"q":"Существительное от «adventure» (человек): an ___","a":["adventurer"]},
  {"q":"«run away» = ___ (по-русски одним словом)","a":["убежать"]},
 ],
 "word_skills_note":"Наречия образа действия (-ly), существительные-деятели (-er), фразовые глаголы движения.",
 "howto_title":"💬 How to… рассказать историю",
 "howto":r'''    <div class="g-ex"><b>It all started when…</b> / <b>Suddenly…</b></div>
    <div class="g-ex"><b>While we were…, …</b> <span class="ru">— фон + событие</span></div>
    <div class="g-ex"><b>In the end…</b> / <b>Luckily…</b></div>''',
 "fx":[
  {"q":"Начни историю:","o":["It all started when we set off.","Story I tell now.","Begin adventure do."],"a":0},
  {"q":"Добавь неожиданность:","o":["Suddenly, it started to rain.","Rain suddenly do.","It rain when suddenly."],"a":0},
  {"q":"Заверши историю:","o":["In the end, we made it home.","End we home.","Home end in we made."],"a":0},
  {"q":"Скажи «к счастью»:","o":["Luckily, nobody was hurt.","Lucky nobody hurt.","Hurt nobody lucky."],"a":0},
 ],
 "speaking":[
  "Расскажи о приключении или походе (Past Simple + Past Continuous, 6–7 предложений).",
  "Что ты делал(а) вчера в 6 вечера, в 8 вечера, в 10 вечера? (Past Continuous).",
  "Ролевая игра: опиши опасную ситуацию и как ты спасся(лась).",
  "Опасные виды спорта: назови 3 и скажи, хотел бы ты попробовать и почему.",
 ],
 "writing":r'''<b>An adventure story.</b> Напиши историю (7–8 предложений) о приключении: где ты был(а), что делал(а) (Past Continuous как фон), что вдруг случилось (Past Simple), и чем всё закончилось. Используй <i>while, when, suddenly, in the end, luckily</i>.<br><br>Проверь: was/were + -ing, правильные Past Simple, связки времени.''',
 "wbmc":[
  {"q":"Заблудиться = to get ___ .","o":["lost","away","off"],"a":0},
  {"q":"Поставить палатку = to put ___ a tent.","o":["up","on","in"],"a":0},
  {"q":"Выживать = to ___ .","o":["survive","explore","escape"],"a":0},
  {"q":"Past Continuous от «go»: were ___ ","o":["going","went","goes"],"a":0},
  {"q":"Утёс = a ___ .","o":["cliff","cave","valley"],"a":0},
 ],
 "wbgaps":[
  {"q":"We ___ (sail) at noon. (past continuous)","a":["were sailing"]},
  {"q":"While he ___ (climb), he slipped. (past continuous)","a":["was climbing"]},
  {"q":"The rain ___ (start) suddenly. (past simple)","a":["started"]},
  {"q":"quick → ___ (наречие)","a":["quickly"]},
  {"q":"They ___ (not/give up). (past neg)","a":["didn't give up","did not give up"]},
 ],
 "hw":r'''<b>My adventure.</b> Опиши реальное или выдуманное приключение в Past Simple/Continuous (6–7 предложений). Мин. 3 слова из юнита (cave, tent, explore…) и связки while/when/suddenly.<br><br>Затем реши <a href="solutions-pi-u2-workbook.html" style="color:#1f6a86;font-weight:900;text-decoration:underline">Workbook Unit 2</a> 🧗''',
})

# ===================== UNIT 3 · On screen =====================
DATA.append({
 "n":3, "title":"On screen", "emoji":"🎬", "grad":("#7c3aa0","#b06ed0"),
 "desc":"Comparatives & superlatives · (not) as…as · too/enough · ТВ, кино и медиа",
 "grammar":[
  {"t":"3B · Comparative & superlative","h":r'''    <table>
      <tr><th></th><th>Сравн.</th><th>Превосх.</th></tr>
      <tr><td>funny</td><td>funn<b>ier than</b></td><td>the funn<b>iest</b></td></tr>
      <tr><td>exciting</td><td><b>more</b> exciting than</td><td>the <b>most</b> exciting</td></tr>
    </table>
    <div class="g-ex">good → better/best; bad → worse/worst.</div>'''},
  {"t":"3D · (not) as…as · too · enough","h":r'''    <div class="g-ex"><b>as … as</b>: This film is <b>as good as</b> the book.</div>
    <div class="g-ex"><b>not as … as</b>: TV isn't <b>as exciting as</b> cinema.</div>
    <div class="g-ex"><b>too</b> + прил.: too long. <b>enough</b>: not funny <b>enough</b>; not <b>enough</b> time.</div>'''},
 ],
 "words":[
  ["reality show","реалити-шоу"],["chat show","ток-шоу"],["game show","телеигра"],["the news","новости"],
  ["documentary","документальный фильм"],["sitcom","ситком"],["soap opera","мыльная опера"],["cartoon","мультфильм"],
  ["action film","боевик"],["comedy","комедия"],["horror film","фильм ужасов"],["period drama","историческая драма"],
  ["science fiction","научная фантастика"],["thriller","триллер"],["the audience","зрители/аудитория"],["episode","серия/эпизод"],
  ["character","персонаж"],["plot","сюжет"],["scene","сцена"],["screen","экран"],
 ],
 "pron_words":["documentary","comedy","audience","science","character","episode","genre"],
 "pron_focus":"Немые и «трудные» буквы",
 "pron_note":"character /ˈkær/ (ch=/k/) · audience /ˈɔː/ · genre /ˈʒɒnrə/",
 "chunks":[
  ["watch a series","смотреть сериал"],["download a film","скачать фильм"],["based on a true story","основан на реальных событиях"],
  ["a happy ending","счастливый конец"],["change the channel","переключить канал"],["turn up the volume","прибавить громкость"],
  ["What's on TV?","что по телевизору?"],["I can't stand…","терпеть не могу…"],
 ],
 "listen_title":"What shall we watch?",
 "names":{"m":"Tom","f":"Ella"},
 "dialog":[
  ["f","What's on TV tonight, Tom?"],
  ["m","There's a new action film and a documentary about space."],
  ["f","Hmm. I think documentaries are more interesting than action films."],
  ["m","Really? I can't stand documentaries — they're too slow for me."],
  ["f","The action film isn't as clever as a good documentary, though."],
  ["m","Maybe, but it's the most exciting thing on tonight!"],
  ["f","OK, let's watch the film. But the comedy after it is funnier."],
  ["m","Deal. Comedy is the best way to end the evening."],
 ],
 "lq":[
  {"q":"What two things are on TV?","o":["a film and a documentary","two films","the news"],"a":0},
  {"q":"What does Ella think about documentaries?","o":["too slow","more interesting","boring"],"a":1},
  {"q":"What does Tom think of documentaries?","o":["he loves them","he can't stand them","they're clever"],"a":1},
  {"q":"What do they decide to watch first?","o":["the documentary","the action film","the comedy"],"a":1},
  {"q":"How will they end the evening?","o":["with the news","with a comedy","with a horror film"],"a":1},
 ],
 "reading_title":"Too much screen time?",
 "reading":r'''<p>These days, many teenagers spend more time on screens than ever before. They watch series, download films and play games for hours. Some people say this is bad, but it isn't as simple as that.</p>
   <p>Good films and documentaries can teach us a lot, and they're often more exciting than a textbook. The problem is balance: if you spend too much time watching and not enough time sleeping or exercising, it isn't healthy. The best idea is to enjoy screens, but not too much.</p>''',
 "rq":[
  {"q":"What do many teenagers do more than before?","o":["read books","spend time on screens","play outside"],"a":1},
  {"q":"What can good films and documentaries do?","o":["teach us a lot","waste our time","make us tired"],"a":0},
  {"q":"What is the real problem, according to the text?","o":["balance","money","the internet"],"a":0},
  {"q":"What is not healthy?","o":["watching a little","too much watching, not enough sleep","reading"],"a":1},
  {"q":"What is the best idea?","o":["never watch screens","enjoy screens but not too much","watch all day"],"a":1},
 ],
 "ex":[
  {"q":"This film is ___ than that one.","o":["funny","funnier","funniest"],"a":1},
  {"q":"It's the ___ film of the year.","o":["exciting","more exciting","most exciting"],"a":2},
  {"q":"A documentary is ___ interesting than a soap.","o":["more","most","much"],"a":0},
  {"q":"He's the ___ actor in the show. (good)","o":["better","best","goodest"],"a":1},
  {"q":"This series is ___ as the book.","o":["as good","gooder","best"],"a":0},
  {"q":"TV isn't ___ exciting as cinema.","o":["as","so much","more"],"a":0},
  {"q":"The film was ___ long — I fell asleep.","o":["too","enough","as"],"a":0},
  {"q":"It wasn't funny ___ .","o":["too","enough","as"],"a":1},
  {"q":"There isn't ___ time to watch it all.","o":["too","enough","as"],"a":1},
  {"q":"horror is ___ than comedy for me. (bad)","o":["worse","worst","badder"],"a":0},
  {"q":"the ___ episode ever! (bad)","o":["worse","worst","baddest"],"a":1},
  {"q":"This chat show is ___ boring than the news.","o":["more","most","as"],"a":0},
  {"q":"She's ___ talented actress in Britain.","o":["the most","most","more"],"a":0},
  {"q":"A cartoon is ___ scary as a horror film. (не такой)","o":["not as","not too","no more"],"a":0},
  {"q":"This phone is ___ expensive than that one.","o":["less","least","little"],"a":0},
  {"q":"The plot was ___ complicated for kids.","o":["too","enough","as"],"a":0},
 ],
 "gaps":[
  {"q":"This film is ___ (exciting) than the book. (сравн.)","a":["more exciting"]},
  {"q":"It's the ___ (funny) show on TV. (превосх.)","a":["funniest"]},
  {"q":"Comedy is ___ (good) than horror for me. (сравн.)","a":["better"]},
  {"q":"TV isn't as ___ (interesting) as cinema. (as…as)","a":["interesting"]},
  {"q":"The film was ___ (too/enough) long — three hours!","a":["too"]},
  {"q":"It wasn't scary ___ (too/enough). (после прилагательного)","a":["enough"]},
  {"q":"There isn't ___ (too/enough) time to watch it.","a":["enough"]},
  {"q":"This is the ___ (bad) episode ever. (превосх.)","a":["worst"]},
 ],
 "word_skills":[
  {"q":"«скучный» о фильме = ___ (-ing/-ed)","o":["boring","bored","bore"],"a":0},
  {"q":"actor → жен. род","o":["actress","actered","actering"],"a":0},
  {"q":"«entertain» → прилагательное","o":["entertaining","entertained","entertainment"],"a":0},
  {"q":"«science» → прилагательное","o":["scientist","scientific","sciency"],"a":1},
  {"q":"Существительное от «direct» (человек, кино): a ___","a":["director"]},
  {"q":"Существительное от «act» (человек): an ___","a":["actor"]},
  {"q":"«comedy» → человек, который смешит: a ___","a":["comedian"]},
  {"q":"Прилагательное «funny» → превосходная: the ___","a":["funniest"]},
 ],
 "word_skills_note":"Жанры и люди в кино (actor/actress, director), прилагательные -ing/-ed, словообразование.",
 "howto_title":"💬 How to… обсудить фильм/шоу",
 "howto":r'''    <div class="g-ex"><b>What's it about?</b> — <b>It's about…</b></div>
    <div class="g-ex"><b>I really recommend it.</b> / <b>I can't stand it.</b></div>
    <div class="g-ex"><b>It's better/worse than…</b> / <b>not as good as…</b></div>''',
 "fx":[
  {"q":"Спроси о сюжете:","o":["What's it about?","About what it?","It about what do?"],"a":0},
  {"q":"Порекомендуй:","o":["I really recommend it!","Recommend I it much.","It recommend do."],"a":0},
  {"q":"Сравни два фильма:","o":["This one is better than that.","This better that more.","Better this that is more."],"a":0},
  {"q":"Скажи, что не любишь жанр:","o":["I can't stand horror films.","I horror no stand.","Stand I can't horror do."],"a":0},
 ],
 "speaking":[
  "Твой любимый фильм/сериал: жанр, сюжет, почему нравится (5–6 предложений).",
  "Сравни ТВ и кино, книги и фильмы (comparatives, as…as).",
  "Ролевая игра: выбери с другом, что посмотреть вечером (recommend, better than).",
  "Слишком много экранного времени — за и против (too/enough).",
 ],
 "writing":r'''<b>A film review.</b> Напиши отзыв о фильме или сериале (7–8 предложений): название и жанр, о чём он (It's about…), что тебе понравилось/нет, сравнение с другим (better/worse/not as good as) и рекомендация. Используй превосходную степень хотя бы раз.<br><br>Проверь: -er/more, the …-est/the most, too/enough, as…as.''',
 "wbmc":[
  {"q":"Документальный фильм = a ___ .","o":["documentary","cartoon","sitcom"],"a":0},
  {"q":"Сюжет = the ___ .","o":["plot","screen","scene"],"a":0},
  {"q":"the ___ film ever (good, превосх.)","o":["best","goodest","better"],"a":0},
  {"q":"«слишком длинный» = ___ long.","o":["too","enough","as"],"a":0},
  {"q":"Терпеть не могу = I can't ___ it.","o":["stand","hold","keep"],"a":0},
 ],
 "wbgaps":[
  {"q":"This film is ___ (funny) than that one. (сравн.)","a":["funnier"]},
  {"q":"It's the ___ (exciting) show ever. (превосх.)","a":["most exciting"]},
  {"q":"It wasn't good ___ . (too/enough)","a":["enough"]},
  {"q":"Horror is ___ (bad) than comedy for me. (сравн.)","a":["worse"]},
  {"q":"TV isn't as ___ (interesting) as cinema.","a":["interesting"]},
 ],
 "hw":r'''<b>My favourite show.</b> Напиши 6–7 предложений о любимом фильме/сериале: жанр, сюжет, сравнение с другим (better/more exciting than) и рекомендация.<br><br>Затем открой <a href="solutions-pi-u3-workbook.html" style="color:#6a2f8c;font-weight:900;text-decoration:underline">Workbook Unit 3</a> 🎬''',
})

META = {
 "prefix": "solutions-pi",
 "level": "Pre-Int",
 "hub": "solutions-pi-course.html",
 "trainer": "solutions-pi-course.html",
 "cover_base": "",
}
