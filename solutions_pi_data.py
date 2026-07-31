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
  ["f","Hi Leo! You look worried. What's the matter?"],
  ["m","I'm really nervous. We're playing a concert tonight and I feel scared."],
  ["f","Don't worry! You're a great guitarist. I'm sure it'll be fine."],
  ["m","Thanks. Last time I was so embarrassed — I forgot the words!"],
  ["f","Ha! But everyone was still delighted. They loved it."],
  ["m","Really? That's surprising. I felt terrible."],
  ["f","Honestly, you should be proud. Just relax and enjoy it."],
  ["m","OK, I'm feeling a bit calmer now. Thanks, Mia."],
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

META = {
 "prefix": "solutions-pi",
 "level": "Pre-Int",
 "hub": "solutions-pi-course.html",
 "trainer": "solutions-pi-course.html",
 "cover_base": "",
}
