# -*- coding: utf-8 -*-
# Контент курса Focus 1 (2nd ed.) — АВТОРСКИЙ, по программе Word Store + грамматике Pearson.
# Тексты, задания и переводы — оригинальные (не копия книги). Вёрстка — в gen_units.py.
DATA = []

# ===================== UNIT 0 · Intro Unit =====================
DATA.append({
 "n":0, "title":"Intro Unit", "emoji":"🚀", "grad":("#c0392b","#e0642a"),
 "desc":"to be · have got · this/that · страны и национальности · комнаты и мебель",
 "grammar":[
  {"t":"1. to be + личные местоимения","h":r'''    <table>
      <tr><th>+</th><th>–</th><th>?</th></tr>
      <tr><td>I <b>am</b>, you/we/they <b>are</b>, he/she/it <b>is</b></td><td>I'm not, isn't, aren't</td><td>Are you…? Is she…?</td></tr>
    </table>
    <div class="g-ex">Притяжательные: <b>my, your, his, her, its, our, their</b> — <i>This is <b>my</b> room.</i></div>'''},
  {"t":"2. have got · this / that / these / those","h":r'''    <div class="g-ex"><b>have got</b> — иметь: I <b>have got</b> a sister. She <b>has got</b> a dog. Отриц.: haven't/hasn't got.</div>
    <div class="g-ex"><b>this</b> (это, рядом) · <b>that</b> (то, далеко) · <b>these</b> (эти) · <b>those</b> (те).</div>'''},
  {"t":"3. there is / there are + предлоги места","h":r'''    <div class="g-ex"><b>There is</b> a sofa. <b>There are</b> two chairs. <span class="ru">— наличие</span></div>
    <div class="g-ex"><b>in · on · under · next to · behind</b> — There's a lamp <b>on</b> the desk.</div>
    <div class="g-ex">Мн. число: chair → chair<b>s</b>, box → box<b>es</b>, country → countr<b>ies</b>.</div>'''},
 ],
 "words":[
  ["Russian","русский"],["German","немецкий"],["Italian","итальянский"],["Spanish","испанский"],
  ["French","французский"],["Chinese","китайский"],["Japanese","японский"],["Polish","польский"],
  ["Turkish","турецкий"],["Irish","ирландский"],["bedroom","спальня"],["bathroom","ванная"],
  ["kitchen","кухня"],["living room","гостиная"],["armchair","кресло"],["fridge","холодильник"],
  ["wardrobe","шкаф для одежды"],["cooker","плита"],["sink","раковина"],["desk","письменный стол"],
 ],
 "pron_words":["Russian","Australian","Japanese","Portuguese","bathroom","wardrobe","furniture"],
 "pron_focus":"Ударение в национальностях",
 "pron_note":"AusTRAlian · JapaNESE · PORtuguese — выдели ударный слог",
 "chunks":[
  ["Where are you from?","откуда ты?"],["I'm from Russia","я из России"],["this is my room","это моя комната"],
  ["there is / there are","есть (наличие)"],["have you got…?","у тебя есть…?"],["in the living room","в гостиной"],
  ["on the wall","на стене"],["next to the bed","рядом с кроватью"],
 ],
 "listen_title":"Nice to meet you",
 "names":{"m":"Alex","f":"Marta"},
 "dialog":[
  ["f","Hi! I'm Marta. What's your name?"],
  ["m","I'm Alex. Nice to meet you. Where are you from, Marta?"],
  ["f","I'm from Poland, but now I live here. Are you Italian?"],
  ["m","No, I'm not. I'm Spanish. Have you got a big family?"],
  ["f","Yes, I have. I've got two brothers and a sister."],
  ["m","Cool! Is this your new flat?"],
  ["f","Yes. There are three rooms. This is the living room."],
  ["m","It's nice! There's a big sofa and a lovely armchair."],
 ],
 "lq":[
  {"q":"What's the girl's name?","o":["Marta","Alex","Anna"],"a":0},
  {"q":"Where is Marta from?","o":["Italy","Poland","Spain"],"a":1},
  {"q":"What nationality is Alex?","o":["Italian","Polish","Spanish"],"a":2},
  {"q":"How many brothers has Marta got?","o":["one","two","three"],"a":1},
  {"q":"What is in the living room?","o":["a sofa and an armchair","a bed","a cooker"],"a":0},
 ],
 "reading_title":"My home",
 "reading":r'''<p>Hi! I'm Nadia and I'm Russian. I live in a small flat with my family. We haven't got a garden, but the flat is nice and warm.</p>
   <p>There are four rooms: a kitchen, a bathroom, a living room and one bedroom. In my favourite room, the living room, there is a big sofa, two armchairs and a lamp next to the window. This is my home and I love it!</p>''',
 "rq":[
  {"q":"What nationality is Nadia?","o":["Russian","Polish","Turkish"],"a":0},
  {"q":"Has the family got a garden?","o":["yes","no","only a small one"],"a":1},
  {"q":"How many rooms are there?","o":["three","four","five"],"a":1},
  {"q":"What is next to the window?","o":["a sofa","a lamp","a fridge"],"a":1},
 ],
 "ex":[
  {"q":"I ___ from Spain.","o":["am","is","are"],"a":0},
  {"q":"She ___ my sister.","o":["am","is","are"],"a":1},
  {"q":"___ you from Italy?","o":["Am","Is","Are"],"a":2},
  {"q":"This is ___ bedroom. (моя)","o":["my","me","I"],"a":0},
  {"q":"I ___ got two brothers.","o":["have","has","am"],"a":0},
  {"q":"He ___ got a dog.","o":["have","has","is"],"a":1},
  {"q":"___ is my room, here.","o":["This","That","Those"],"a":0},
  {"q":"Look at ___ house over there!","o":["this","that","these"],"a":1},
  {"q":"There ___ a sofa in the room.","o":["is","are","am"],"a":0},
  {"q":"There ___ two chairs.","o":["is","are","be"],"a":1},
  {"q":"The lamp is ___ the desk.","o":["on","in","at"],"a":0},
  {"q":"one box → two ___","o":["boxs","boxes","boxies"],"a":1},
 ],
 "gaps":[
  {"q":"They ___ (be) from Poland. (are)","a":["are"]},
  {"q":"She ___ (have got) a big family. (has got)","a":["has got","'s got"]},
  {"q":"___ (this/these) are my books. (мн.ч.)","a":["these"]},
  {"q":"There ___ (be) three rooms. (are)","a":["are"]},
  {"q":"The cat is ___ the bed. (под)","a":["under"]},
  {"q":"one country → two ___ (мн.ч.)","a":["countries"]},
 ],
 "howto_title":"💬 How to… познакомиться",
 "howto":r'''    <div class="g-ex"><b>Hi, I'm…</b> / <b>What's your name?</b> <span class="ru">— знакомство</span></div>
    <div class="g-ex"><b>Where are you from?</b> — <b>I'm from…</b></div>
    <div class="g-ex"><b>Nice to meet you!</b></div>''',
 "fx":[
  {"q":"Представься:","o":["Hi, I'm Anna.","You Anna.","Me name Anna do."],"a":0},
  {"q":"Спроси, откуда человек:","o":["Where are you from?","From where you?","You from where do?"],"a":0},
  {"q":"Ответь на знакомство:","o":["Nice to meet you!","Meet nice you.","You nice meet."],"a":0},
 ],
 "speaking":[
  "Представься: имя, откуда ты, национальность (3–4 предложения).",
  "Опиши свою комнату: что в ней есть (there is / there are + мебель).",
  "Расскажи о семье: сколько братьев/сестёр (have got).",
  "Назови 5 стран и национальности к ним (I'm from… / …ish, …ese, …an).",
 ],
 "wbmc":[
  {"q":"Человек из Японии = ___ .","o":["Japanese","Japanish","Japanan"],"a":0},
  {"q":"Где спят = the ___ .","o":["bedroom","kitchen","bathroom"],"a":0},
  {"q":"У тебя есть…? = ___ you got…?","o":["Have","Has","Are"],"a":0},
 ],
 "wbgaps":[
  {"q":"I ___ (be) from Italy. (am/is/are)","a":["am","'m"]},
  {"q":"She ___ (have got) a sister. (has got)","a":["has got","'s got"]},
  {"q":"There ___ (be) two beds. (are)","a":["are"]},
 ],
 "hw":r'''<b>Обо мне и моём доме.</b> Напиши 6–7 предложений: как тебя зовут, откуда ты и какая у тебя национальность, кто есть в семье (have got), и опиши одну комнату (there is / there are + мебель).<br><br>
   Затем открой <a href="focus-1-u0-workbook.html" style="color:#a5301f;font-weight:900;text-decoration:underline">Workbook Intro</a> 🚀''',
})

# ===================== UNIT 1 · Family and friends =====================
DATA.append({
 "n":1, "title":"Family and friends", "emoji":"👨‍👩‍👧‍👦", "grad":("#e0642a","#f0a03a"),
 "desc":"Present Simple · have/go/play · daily routine · семья, друзья и распорядок дня",
 "grammar":[
  {"t":"1. Present Simple — факты и привычки","h":r'''    <table>
      <tr><th>Форма</th><th>Пример</th><th>Заметка</th></tr>
      <tr><td><b>+</b></td><td>I <b>live</b> here. She <b>lives</b> here.</td><td>he/she/it → <b>-s</b></td></tr>
      <tr><td><b>–</b></td><td>I <b>don't</b> like it. He <b>doesn't</b> like it.</td><td>don't / doesn't + инфинитив</td></tr>
    </table>
    <div class="g-ex">go/do → <b>goes / does</b>; study → <b>studies</b>; watch → <b>watches</b> <span class="ru">— правила -s</span></div>'''},
  {"t":"2. Вопросы: yes/no и wh-","h":r'''    <div class="g-ex"><b>Do</b> you like pizza? — Yes, I <b>do</b>. / No, I <b>don't</b>.</div>
    <div class="g-ex"><b>Does</b> she work here? — Yes, she <b>does</b>. / No, she <b>doesn't</b>.</div>
    <div class="g-ex"><b>Where do</b> you live? <b>What time does</b> he get up? <span class="ru">— wh- + do/does + подлежащее + глагол</span></div>'''},
  {"t":"3. Наречия частоты + have/go/play","h":r'''    <div class="g-ex"><b>always</b> · <b>usually</b> · <b>often</b> · <b>sometimes</b> · <b>never</b> — перед глаголом: I <b>usually</b> get up at seven.</div>
    <div class="g-ex"><b>have</b> breakfast/a shower · <b>go</b> to school/shopping · <b>play</b> football/the guitar</div>'''},
 ],
 "words":[
  ["have fun","веселиться"],["have a good time","хорошо проводить время"],["have a party","устроить вечеринку"],
  ["go out with friends","гулять с друзьями"],["go to the cinema","ходить в кино"],["go to a party","ходить на вечеринку"],
  ["go to a shopping centre","ходить в торговый центр"],["play video games","играть в видеоигры"],["play chess","играть в шахматы"],
  ["play the guitar","играть на гитаре"],["play the piano","играть на пианино"],["play the drums","играть на барабанах"],
  ["get out of bed","вставать с кровати"],["stay at home","оставаться дома"],["lie on the sofa","лежать на диване"],
  ["go for a run","ходить на пробежку"],["go to the gym","ходить в спортзал"],["go to bed","ложиться спать"],
  ["in the morning","утром"],["at the weekend","на выходных"],
 ],
 "pron_words":["family","brother","mother","usually","breakfast","homework","friend"],
 "pron_focus":"Окончание -s в Present Simple",
 "pron_note":"works /s/ · goes /z/ · watches /ɪz/ — послушай и повтори",
 "chunks":[
  ["get on well with","хорошо ладить с"],["have breakfast","завтракать"],["go shopping","ходить за покупками"],
  ["play the guitar","играть на гитаре"],["do the homework","делать домашнее задание"],
  ["at the weekend","на выходных"],["free time","свободное время"],["twice a week","два раза в неделю"],
 ],
 "listen_title":"A normal weekday",
 "names":{"m":"Max","f":"Lena"},
 "dialog":[
  ["f","Hi Max! What time do you usually get up on school days?"],
  ["m","At half past six. I have breakfast and then I go to school by bus."],
  ["f","Do you have breakfast with your family?"],
  ["m","Yes, with my mum and my little sister. My dad starts work early."],
  ["f","What do you do after school?"],
  ["m","I do my homework, and twice a week I play football with my friends."],
  ["f","Nice! Do you watch TV in the evening?"],
  ["m","Sometimes, but I usually go to bed at ten. I need my sleep!"],
 ],
 "lq":[
  {"q":"What time does Max get up?","o":["at 6:30","at 7:00","at 8:00"],"a":0},
  {"q":"How does he go to school?","o":["by car","by bus","on foot"],"a":1},
  {"q":"Who has breakfast with Max?","o":["his dad","his mum and sister","his friends"],"a":1},
  {"q":"How often does he play football?","o":["every day","twice a week","never"],"a":1},
  {"q":"When does Max usually go to bed?","o":["at nine","at ten","at eleven"],"a":1},
 ],
 "reading_title":"Two families, two homes",
 "reading":r'''<p>Nadia lives in a small flat with her mum, her dad and her baby brother. Every morning her mum makes breakfast and they eat together before school. At the weekend the family often goes to the park.</p>
   <p>Ben lives in a house with his grandparents. His parents work in another city, so he only sees them once a month. Ben gets on really well with his grandad — they play chess every evening.</p>''',
 "rq":[
  {"q":"Who does Nadia live with?","o":["her grandparents","her mum, dad and brother","her friends"],"a":1},
  {"q":"When does Nadia's family go to the park?","o":["every morning","at the weekend","never"],"a":1},
  {"q":"How often does Ben see his parents?","o":["every day","once a month","once a year"],"a":1},
  {"q":"What do Ben and his grandad do together?","o":["play chess","watch TV","go shopping"],"a":0},
 ],
 "ex":[
  {"q":"She ___ in a small town.","o":["live","lives","living"],"a":1},
  {"q":"I ___ like fish.","o":["doesn't","am not","don't"],"a":2},
  {"q":"___ your brother play football?","o":["Do","Does","Is"],"a":1},
  {"q":"He ___ his homework every evening.","o":["do","does","doing"],"a":1},
  {"q":"My mum ___ TV in the morning.","o":["don't watch","doesn't watch","not watch"],"a":1},
  {"q":"Where ___ you live?","o":["do","does","are"],"a":0},
  {"q":"We ___ to school by bus.","o":["goes","go","going"],"a":1},
  {"q":"Choose the correct order:","o":["I get up usually early","I usually get up early","Usually I get up early wrong"],"a":1},
  {"q":"She ___ get up late at the weekend.","o":["usually","is usually","usual"],"a":0},
  {"q":"They ___ the guitar very well.","o":["play","plays","playing"],"a":0},
  {"q":"___ she have breakfast at home?","o":["Do","Does","Has"],"a":1},
  {"q":"My dad ___ early — he's a baker.","o":["start","starts","starting"],"a":1},
 ],
 "gaps":[
  {"q":"He ___ (not/like) coffee. (present simple)","a":["doesn't like","does not like"]},
  {"q":"What time ___ (you/get up)? (вопрос)","a":["do you get up"]},
  {"q":"She ___ (study) English at school.","a":["studies"]},
  {"q":"We ___ (go) shopping on Saturdays.","a":["go"]},
  {"q":"I ___ (usually) walk to school. (наречие — место в предложении: I ___ walk)","a":["usually"]},
  {"q":"___ (he/play) tennis? — Yes, he does.","a":["does he play"]},
 ],
 "howto_title":"💬 How to… рассказать о себе",
 "howto":r'''    <div class="g-ex"><b>I live in… with my…</b> <span class="ru">— где и с кем живёшь</span></div>
    <div class="g-ex"><b>I usually get up at…</b> / <b>I go to school by…</b> <span class="ru">— распорядок</span></div>
    <div class="g-ex"><b>In my free time I…</b> <span class="ru">— хобби</span></div>
    <div class="g-ex"><b>I get on well with…</b> <span class="ru">— с кем ладишь</span></div>''',
 "fx":[
  {"q":"Спроси о распорядке:","o":["What time do you get up?","Give me time.","You are late."],"a":0},
  {"q":"Расскажи о хобби:","o":["In my free time I play the guitar.","I hate you.","Stop it."],"a":0},
  {"q":"Скажи, с кем живёшь:","o":["I live with my parents.","I am a house.","Go home."],"a":0},
 ],
 "speaking":[
  "Расскажи о своей семье: кто есть, чем занимаются (5–6 предложений, Present Simple).",
  "Опиши свой обычный будний день по времени: get up → breakfast → school → free time → bed.",
  "Задай другу 4 вопроса о его распорядке (Do/Does…, What time…?).",
  "С кем ты хорошо ладишь и почему? 3–4 предложения.",
 ],
 "wbmc":[
  {"q":"Мамина сестра = your ___ .","o":["aunt","uncle","cousin"],"a":0},
  {"q":"Завтракать = to ___ breakfast.","o":["have","do","make"],"a":0},
  {"q":"Играть на гитаре = to ___ the guitar.","o":["play","do","go"],"a":0},
 ],
 "wbgaps":[
  {"q":"She ___ (get) up at seven. (present simple, he/she)","a":["gets"]},
  {"q":"They ___ (not/watch) TV in the morning.","a":["don't watch","do not watch"]},
  {"q":"I ___ football twice a week. (глагол-компаньон)","a":["play"]},
 ],
 "hw":r'''<b>Мой день!</b> Напиши 6–7 предложений о своём обычном дне в Present Simple: во сколько встаёшь, что делаешь утром, днём и вечером, чем занимаешься в свободное время. Используй 3 наречия частоты (usually, often, sometimes). Пример: <i>«I usually get up at 7. I have breakfast with my family and go to school by bus…»</i><br><br>
   Потом открой <a href="focus-1-u1-workbook.html" style="color:#c85a1a;font-weight:900;text-decoration:underline">Workbook Unit 1</a> и реши задания — ответы придут учителю 🙂''',
})

# ===================== UNIT 2 · Food =====================
DATA.append({
 "n":2, "title":"Food", "emoji":"🍎", "grad":("#5a8f2a","#9ac93a"),
 "desc":"Countable/uncountable · a/an/some/any · much/many · еда, продукты и готовка",
 "grammar":[
  {"t":"1. Countable vs uncountable","h":r'''    <table>
      <tr><th>Countable (можно считать)</th><th>Uncountable (нельзя)</th></tr>
      <tr><td>an apple, two eggs, three bananas</td><td>rice, water, milk, bread, cheese</td></tr>
    </table>
    <div class="g-ex">Countable: <b>a/an</b> + ед., мн. число с -s. Uncountable: без a/an, всегда ед. число: <b>some rice</b>.</div>'''},
  {"t":"2. a / an / some / any","h":r'''    <div class="g-ex"><b>a/an</b> — один считаемый: <b>an</b> egg, <b>a</b> tomato.</div>
    <div class="g-ex"><b>some</b> — в утверждениях: I've got <b>some</b> bread.</div>
    <div class="g-ex"><b>any</b> — в вопросах и отрицаниях: Is there <b>any</b> milk? — No, there isn't <b>any</b>.</div>'''},
  {"t":"3. how much / how many","h":r'''    <div class="g-ex"><b>How many</b> eggs? <span class="ru">— считаемые (мн.ч.)</span></div>
    <div class="g-ex"><b>How much</b> sugar / water? <span class="ru">— несчитаемые</span></div>
    <div class="g-ex"><b>a lot of</b> — с обоими; <b>much</b> — чаще в вопросах/отрицаниях.</div>'''},
 ],
 "words":[
  ["a bag of","пакет"],["a bar of chocolate","плитка шоколада"],["a bottle of","бутылка"],
  ["a can of","банка (жестяная)"],["a carton of","картонная упаковка"],["a jar of","банка (стеклянная)"],
  ["a packet of","пачка"],["a tin of","консервная банка"],["a tub of","ведёрко/контейнер"],
  ["mayonnaise","майонез"],["onions","лук"],["peas","горох"],["sugar","сахар"],["flour","мука"],
  ["boil","варить"],["chop","рубить/крошить"],["fry","жарить"],["mix","смешивать"],["slice","нарезать ломтиками"],
  ["vegetarian","вегетарианский"],
 ],
 "pron_words":["cheese","potato","tomato","vegetable","chocolate","breakfast","delicious"],
 "pron_focus":"Долгий и краткий гласный",
 "pron_note":"cheese /iː/ · chip /ɪ/ — тяни долгий звук в cheese",
 "chunks":[
  ["a bottle of water","бутылка воды"],["a packet of crisps","пачка чипсов"],["a piece of cake","кусок торта"],
  ["fast food","фастфуд"],["a healthy diet","здоровое питание"],["do the shopping","делать покупки"],
  ["I'm hungry","я голоден"],["I'd like…","я бы хотел…"],
 ],
 "listen_title":"At the market",
 "names":{"m":"Sam","f":"Mia"},
 "dialog":[
  ["f","Right, we need food for dinner. How many tomatoes have we got?"],
  ["m","Only two. And there isn't any cheese."],
  ["f","OK. Let's buy some tomatoes, a packet of pasta and some cheese."],
  ["m","Do we need any bread?"],
  ["f","Yes, a loaf. And how much milk have we got at home?"],
  ["m","Not much. Let's get a bottle."],
  ["f","Perfect. I'd like some apples too — they're really fresh here."],
  ["m","Good idea. I'm hungry already!"],
 ],
 "lq":[
  {"q":"How many tomatoes have they got?","o":["two","five","none"],"a":0},
  {"q":"What isn't there at home?","o":["bread","cheese","pasta"],"a":1},
  {"q":"How much milk have they got?","o":["a lot","not much","none"],"a":1},
  {"q":"What does Mia want to buy as well?","o":["apples","chocolate","meat"],"a":0},
  {"q":"How does Sam feel?","o":["tired","hungry","bored"],"a":1},
 ],
 "reading_title":"Breakfast around the world",
 "reading":r'''<p>People eat very different things for breakfast. In many countries people have bread with cheese or eggs, and a cup of tea or coffee. In some places a typical breakfast is rice and fish.</p>
   <p>Doctors say breakfast is important. A good breakfast gives you energy for the morning. It doesn't need a lot of sugar — some fruit, bread and milk are enough.</p>''',
 "rq":[
  {"q":"What do many people have for breakfast?","o":["bread with cheese or eggs","only sweets","nothing"],"a":0},
  {"q":"What is a typical breakfast in some places?","o":["pizza","rice and fish","cake"],"a":1},
  {"q":"Why is breakfast important?","o":["it gives you energy","it is expensive","it is sweet"],"a":0},
  {"q":"What does a good breakfast NOT need?","o":["fruit","a lot of sugar","bread"],"a":1},
 ],
 "ex":[
  {"q":"I'd like ___ apple, please.","o":["a","an","some"],"a":1},
  {"q":"There isn't ___ milk in the fridge.","o":["some","any","a"],"a":1},
  {"q":"We need ___ rice for dinner.","o":["a","some","many"],"a":1},
  {"q":"How ___ eggs do we need?","o":["much","many","any"],"a":1},
  {"q":"How ___ sugar do you want?","o":["many","much","some"],"a":1},
  {"q":"Rice ___ uncountable.","o":["are","is","have"],"a":1},
  {"q":"Have we got ___ bread?","o":["some","any","a"],"a":1},
  {"q":"There are ___ tomatoes on the table.","o":["a","some","much"],"a":1},
  {"q":"a ___ of water","o":["packet","bottle","piece"],"a":1},
  {"q":"a ___ of cake","o":["piece","bottle","can"],"a":0},
  {"q":"She wants ___ orange juice.","o":["an","some","a"],"a":1},
  {"q":"Choose uncountable:","o":["apple","egg","cheese"],"a":2},
 ],
 "gaps":[
  {"q":"Is there ___ cheese? (вопрос — some/any)","a":["any"]},
  {"q":"I've got ___ apples in my bag. (утверждение)","a":["some"]},
  {"q":"How ___ water do you drink a day? (much/many)","a":["much"]},
  {"q":"How ___ bananas are there? (much/many)","a":["many"]},
  {"q":"I'd like ___ egg for breakfast. (a/an)","a":["an"]},
  {"q":"There isn't ___ sugar left. (some/any)","a":["any"]},
 ],
 "howto_title":"💬 How to… заказать еду",
 "howto":r'''    <div class="g-ex"><b>I'd like…, please.</b> <span class="ru">— я бы хотел…</span></div>
    <div class="g-ex"><b>Can I have a…?</b> / <b>How much is it?</b> <span class="ru">— можно…? / сколько стоит?</span></div>
    <div class="g-ex"><b>Anything else?</b> — <b>No, thanks. That's all.</b></div>''',
 "fx":[
  {"q":"Закажи еду вежливо:","o":["I'd like a sandwich, please.","Give food now.","I want, quick."],"a":0},
  {"q":"Спроси цену:","o":["How much is it?","How many money?","What price you?"],"a":0},
  {"q":"Заверши заказ:","o":["That's all, thanks.","Never.","Go away."],"a":0},
 ],
 "speaking":[
  "Что ты обычно ешь на завтрак, обед и ужин? 5–6 предложений.",
  "Ролевая игра в кафе: закажи еду и напитки, спроси цену, поблагодари.",
  "Здоровая и вредная еда: назови 3 полезных и 3 вредных продукта и объясни.",
  "Что у тебя есть в холодильнике? Используй some/any, a lot of.",
 ],
 "wbmc":[
  {"q":"Бутылка воды = a ___ of water.","o":["bottle","piece","packet"],"a":0},
  {"q":"Жарить = to ___ .","o":["fry","bake","boil"],"a":0},
  {"q":"Несчитаемое существительное:","o":["egg","rice","apple"],"a":1},
 ],
 "wbgaps":[
  {"q":"There isn't ___ milk. (some/any)","a":["any"]},
  {"q":"How ___ eggs do we need? (much/many)","a":["many"]},
  {"q":"I'd like ___ apple. (a/an)","a":["an"]},
 ],
 "hw":r'''<b>Мой рецепт / My meal.</b> Напиши, что ты готовишь на любимый ужин: продукты (with some/any, a lot of) и 3–4 шага с глаголами готовки (fry, boil, bake, cut). Пример: <i>«For pasta I need some pasta, two tomatoes and some cheese. First, boil the pasta…»</i><br><br>
   Затем реши <a href="focus-1-u2-workbook.html" style="color:#4a7d1f;font-weight:900;text-decoration:underline">Workbook Unit 2</a> 🍽️''',
})

# ===================== UNIT 3 · Work =====================
DATA.append({
 "n":3, "title":"Work", "emoji":"💼", "grad":("#2a6f8f","#3aa0c9"),
 "desc":"Present Continuous · Simple vs Continuous · работа, профессии и обязанности",
 "grammar":[
  {"t":"1. Present Continuous — сейчас","h":r'''    <table>
      <tr><th>Форма</th><th>Пример</th></tr>
      <tr><td><b>am/is/are + -ing</b></td><td>I <b>am working</b>. She <b>is talking</b>. They <b>are helping</b>.</td></tr>
    </table>
    <div class="g-ex">Для действий сейчас или в этот период: I<b>'m working</b> from home this week.</div>
    <div class="g-ex">write → writ<b>ing</b>, sit → sit<b>ting</b>, have → hav<b>ing</b> <span class="ru">— правила -ing</span></div>'''},
  {"t":"2. Present Simple vs Continuous","h":r'''    <div class="g-ex"><b>Simple</b> — привычки/факты: She <b>works</b> in a bank <b>every day</b>.</div>
    <div class="g-ex"><b>Continuous</b> — сейчас/временно: She <b>is working</b> late <b>today</b>.</div>
    <div class="g-ex">Слова-подсказки: Simple — usually, every day; Continuous — now, at the moment, today.</div>'''},
 ],
 "words":[
  ["work hard","усердно работать"],["work long hours","работать помногу часов"],["full-time","полный день"],
  ["part-time","неполный день"],["a well-paid job","хорошо оплачиваемая работа"],["a badly-paid job","низкооплачиваемая работа"],
  ["work from home","работать из дома"],["work for a company","работать в компании"],["work in a team","работать в команде"],
  ["work with your hands","работать руками"],["work on a project","работать над проектом"],["earn your living","зарабатывать на жизнь"],
  ["earn a salary","получать зарплату"],["earn money","зарабатывать деньги"],["waiter","официант"],
  ["waitress","официантка"],["actor","актёр"],["actress","актриса"],["builder","строитель"],
  ["work eight hours a day","работать восемь часов в день"],
 ],
 "pron_words":["doctor","engineer","colleague","uniform","salary","office","business"],
 "pron_focus":"Ударение в словах-профессиях",
 "pron_note":"ENgineer · COLleague · BUSiness — выдели ударный слог",
 "chunks":[
  ["work hard","усердно работать"],["earn money","зарабатывать деньги"],["work from home","работать из дома"],
  ["a full-time job","работа на полный день"],["a part-time job","подработка"],["work in a team","работать в команде"],
  ["What do you do?","кем работаешь?"],["I work as a…","я работаю…"],
 ],
 "listen_title":"A new job",
 "names":{"m":"Leo","f":"Zoe"},
 "dialog":[
  ["f","Hi Leo! You look busy. What are you doing?"],
  ["m","I'm writing emails to new clients. I've got a new job!"],
  ["f","Congratulations! What do you do now?"],
  ["m","I work as a designer for a small company. I usually work from home."],
  ["f","Nice. Do you like your boss?"],
  ["m","Yes, she's great. Right now she's helping me with a difficult project."],
  ["f","Is it a full-time job?"],
  ["m","Part-time, actually — three days a week. It's perfect for me."],
 ],
 "lq":[
  {"q":"What is Leo doing now?","o":["writing emails","sleeping","cooking"],"a":0},
  {"q":"What does Leo do?","o":["teacher","designer","driver"],"a":1},
  {"q":"Where does he usually work?","o":["in an office","from home","in a factory"],"a":1},
  {"q":"What is his boss doing right now?","o":["helping Leo","having lunch","travelling"],"a":0},
  {"q":"Is it full-time or part-time?","o":["full-time","part-time","no job"],"a":1},
 ],
 "reading_title":"Unusual jobs",
 "reading":r'''<p>Most people work in offices, shops or schools, but some jobs are very unusual. A professional sleeper tests beds in hotels. A food taster tries new products and says if they are good.</p>
   <p>These workers usually don't wear a uniform and often work part-time. They say the best thing about their job is that every day is different.</p>''',
 "rq":[
  {"q":"Where do most people work?","o":["at home only","in offices, shops or schools","on farms"],"a":1},
  {"q":"What does a professional sleeper do?","o":["tests beds","makes beds","sells beds"],"a":0},
  {"q":"What does a food taster do?","o":["cooks food","tries new products","grows food"],"a":1},
  {"q":"What is the best thing about these jobs?","o":["a lot of money","every day is different","short hours"],"a":1},
 ],
 "ex":[
  {"q":"Listen! The boss ___ to us.","o":["talks","is talking","talk"],"a":1},
  {"q":"She ___ in a hospital every day.","o":["is working","works","working"],"a":1},
  {"q":"I ___ an email right now.","o":["write","am writing","writes"],"a":1},
  {"q":"They ___ hard this week.","o":["work","are working","works"],"a":1},
  {"q":"He usually ___ by car.","o":["is coming","comes","coming"],"a":1},
  {"q":"What ___ you doing?","o":["do","are","is"],"a":1},
  {"q":"We ___ a new project at the moment.","o":["start","are starting","starts"],"a":1},
  {"q":"She ___ as a nurse.","o":["work","works","working"],"a":1},
  {"q":"sit → ___","o":["siting","sitting","siteing"],"a":1},
  {"q":"I ___ coffee every morning. (привычка)","o":["am drinking","drink","drinks"],"a":1},
  {"q":"Right now they ___ lunch.","o":["have","are having","has"],"a":1},
  {"q":"He ___ from home today.","o":["works","is working","work"],"a":1},
 ],
 "gaps":[
  {"q":"Look! She ___ (talk) on the phone.","a":["is talking","'s talking"]},
  {"q":"I ___ (work) in an office every day. (привычка)","a":["work"]},
  {"q":"They ___ (not/work) today — it's a holiday. (present continuous)","a":["aren't working","are not working"]},
  {"q":"What ___ (you/do) now?","a":["are you doing"]},
  {"q":"He ___ (earn) a good salary. (present simple)","a":["earns"]},
  {"q":"write → ___ (форма -ing)","a":["writing"]},
 ],
 "howto_title":"💬 How to… говорить о работе",
 "howto":r'''    <div class="g-ex"><b>What do you do?</b> — <b>I work as a…</b> <span class="ru">— кем работаешь</span></div>
    <div class="g-ex"><b>I work for…</b> / <b>I work in…</b> <span class="ru">— компания / сфера</span></div>
    <div class="g-ex"><b>It's a full-time / part-time job.</b></div>''',
 "fx":[
  {"q":"Спроси о профессии:","o":["What do you do?","What you are?","How work you?"],"a":0},
  {"q":"Скажи, кем работаешь:","o":["I work as a teacher.","I am work teacher.","Me teacher job."],"a":0},
  {"q":"Уточни занятость:","o":["Is it full-time?","How many job?","Work you much?"],"a":0},
 ],
 "speaking":[
  "Кем работают члены твоей семьи? Опиши 3 профессии (Present Simple).",
  "Работа мечты: кем бы ты хотел стать и почему? 4–5 предложений.",
  "Что ты делаешь прямо сейчас и что делают люди вокруг? (Present Continuous).",
  "Ролевая игра: собеседование — задай и ответь на 4 вопроса о работе.",
 ],
 "wbmc":[
  {"q":"Место, где лечат людей = a ___ .","o":["hospital","factory","office"],"a":0},
  {"q":"Зарабатывать деньги = to ___ money.","o":["earn","win","do"],"a":0},
  {"q":"Работать из дома = to work ___ home.","o":["from","in","at the"],"a":0},
 ],
 "wbgaps":[
  {"q":"She ___ (work) in a bank. (present simple)","a":["works"]},
  {"q":"Look! They ___ (build) a new house. (continuous)","a":["are building","'re building"]},
  {"q":"He works ___ a designer. (предлог)","a":["as"]},
 ],
 "hw":r'''<b>Профессия / My dream job.</b> Опиши профессию (свою будущую или родителя): где человек работает, что делает каждый день (Present Simple) и что делает прямо сейчас (Present Continuous — придумай момент). 6–7 предложений.<br><br>
   Затем открой <a href="focus-1-u3-workbook.html" style="color:#1f6a86;font-weight:900;text-decoration:underline">Workbook Unit 3</a> 💼''',
})

# ===================== UNIT 4 · People =====================
DATA.append({
 "n":4, "title":"People", "emoji":"🧑", "grad":("#7c3aa0","#b06ed0"),
 "desc":"Comparatives & superlatives · have to / don't have to · внешность, характер, одежда",
 "grammar":[
  {"t":"1. Сравнительная и превосходная степень","h":r'''    <table>
      <tr><th>Прилагательное</th><th>Сравн.</th><th>Превосх.</th></tr>
      <tr><td>tall (короткие)</td><td>tall<b>er than</b></td><td>the tall<b>est</b></td></tr>
      <tr><td>happy (на -y)</td><td>happ<b>ier than</b></td><td>the happ<b>iest</b></td></tr>
      <tr><td>beautiful (длинные)</td><td><b>more</b> beautiful than</td><td>the <b>most</b> beautiful</td></tr>
    </table>
    <div class="g-ex">Особые: good → <b>better / the best</b>; bad → <b>worse / the worst</b>.</div>'''},
  {"t":"2. have to / don't have to","h":r'''    <div class="g-ex"><b>have to</b> — надо, обязанность: I <b>have to</b> wear a uniform.</div>
    <div class="g-ex"><b>don't have to</b> — не обязательно: You <b>don't have to</b> come early.</div>
    <div class="g-ex">he/she → <b>has to</b> / <b>doesn't have to</b>.</div>'''},
 ],
 "words":[
  ["boots","ботинки"],["coat","пальто"],["dress","платье"],["hat","шляпа/шапка"],["jacket","куртка/пиджак"],
  ["jeans","джинсы"],["trousers","брюки"],["scarf","шарф"],["shirt","рубашка"],["T-shirt","футболка"],
  ["shoes","туфли/обувь"],["skirt","юбка"],["trainers","кроссовки"],["socks","носки"],["suit","костюм"],
  ["jumper","свитер"],["tie","галстук"],["top","топ/кофта"],["tracksuit","спортивный костюм"],
  ["middle-aged","средних лет"],
 ],
 "pron_words":["beautiful","friendly","clever","younger","tallest","glasses","jacket"],
 "pron_focus":"Окончание -er / -est",
 "pron_note":"taller /ə/ · tallest /ɪst/ — безударное окончание, не тяни",
 "chunks":[
  ["have got fair hair","иметь светлые волосы"],["look like","быть похожим на"],["the same age","одного возраста"],
  ["taller than me","выше меня"],["the best friend","лучший друг"],["put on clothes","надевать одежду"],
  ["What does she look like?","как она выглядит?"],["a nice person","приятный человек"],
 ],
 "listen_title":"Which one is your sister?",
 "names":{"m":"Dan","f":"Kate"},
 "dialog":[
  ["m","Kate, is your sister here? What does she look like?"],
  ["f","Yes, she's over there. She's taller than me and she's got long dark hair."],
  ["m","Is she the girl with glasses?"],
  ["f","No, that's her friend. My sister is wearing a red dress."],
  ["m","Oh, I see her! She looks really friendly."],
  ["f","She is. She's the kindest person I know — and much funnier than me!"],
  ["m","Are you the same age?"],
  ["f","No, she's older. She's nineteen and I'm sixteen."],
 ],
 "lq":[
  {"q":"What does Kate's sister look like?","o":["short with fair hair","taller with dark hair","old with glasses"],"a":1},
  {"q":"Who is wearing glasses?","o":["Kate's sister","her friend","Dan"],"a":1},
  {"q":"What is the sister wearing?","o":["a red dress","jeans","a jacket"],"a":0},
  {"q":"How is the sister, in Kate's words?","o":["the laziest","the kindest","the shyest"],"a":1},
  {"q":"How old is Kate?","o":["16","19","21"],"a":0},
 ],
 "reading_title":"Twins but different",
 "reading":r'''<p>Anna and Ela are twins, but they are very different. Anna is taller and has short fair hair. She is quiet and shy, and she loves reading.</p>
   <p>Ela has long dark hair. She is louder and much more sporty than her sister. People say Ela is the funniest girl in their class. The girls look different, but they are best friends.</p>''',
 "rq":[
  {"q":"How are Anna and Ela related?","o":["cousins","twins","neighbours"],"a":1},
  {"q":"What is Anna like?","o":["loud and sporty","quiet and shy","lazy"],"a":1},
  {"q":"Who has long dark hair?","o":["Anna","Ela","both"],"a":1},
  {"q":"What do people say about Ela?","o":["the funniest in the class","the tallest","the oldest"],"a":0},
 ],
 "ex":[
  {"q":"My brother is ___ than me.","o":["tall","taller","tallest"],"a":1},
  {"q":"She is the ___ girl in the class.","o":["tall","taller","tallest"],"a":2},
  {"q":"This book is ___ interesting than that one.","o":["more","most","much"],"a":0},
  {"q":"He is the ___ student in school.","o":["cleverer","most clever","cleverest"],"a":2},
  {"q":"Maths is ___ than art. (bad)","o":["badder","worse","the worst"],"a":1},
  {"q":"It's the ___ film I know. (good)","o":["better","best","goodest"],"a":1},
  {"q":"I ___ wear a uniform at school.","o":["have to","has to","am to"],"a":0},
  {"q":"You ___ come — it's optional.","o":["have to","don't have to","has to"],"a":1},
  {"q":"She ___ get up early on Sundays.","o":["doesn't have to","don't have to","hasn't to"],"a":0},
  {"q":"happy → ___ (сравн.)","o":["happier","happyer","more happy"],"a":0},
  {"q":"What ___ she look like?","o":["does","is","has"],"a":0},
  {"q":"He's got ___ hair.","o":["a fair","fair","the fair"],"a":1},
 ],
 "gaps":[
  {"q":"My sister is ___ (tall) than me. (сравнит.)","a":["taller"]},
  {"q":"It's the ___ (good) day of my life. (превосх.)","a":["best"]},
  {"q":"This exercise is ___ (difficult) than the last one. (длинное прил.)","a":["more difficult"]},
  {"q":"You ___ (not/have to) pay — it's free. (нет обязанности)","a":["don't have to","do not have to"]},
  {"q":"She ___ (have to) wear glasses. (he/she форма)","a":["has to"]},
  {"q":"happy → the ___ (превосх.)","a":["happiest"]},
 ],
 "howto_title":"💬 How to… описать человека",
 "howto":r'''    <div class="g-ex"><b>What does he/she look like?</b> <span class="ru">— как выглядит</span></div>
    <div class="g-ex"><b>He's tall and has got dark hair.</b> <span class="ru">— внешность</span></div>
    <div class="g-ex"><b>She's really friendly / a bit shy.</b> <span class="ru">— характер</span></div>''',
 "fx":[
  {"q":"Спроси про внешность:","o":["What does she look like?","How is she look?","What she like do?"],"a":0},
  {"q":"Опиши характер:","o":["He's kind and funny.","He is a kind funny do.","Kind he funny."],"a":0},
  {"q":"Сравни двух людей:","o":["She is taller than her brother.","She tall more brother.","She is more tall brother."],"a":0},
 ],
 "speaking":[
  "Опиши лучшего друга: внешность и характер (5–6 предложений).",
  "Сравни себя с братом/сестрой/другом (taller, funnier, more…).",
  "Что тебе надо и не надо делать в школе? (have to / don't have to) — 4 предложения.",
  "Кто самый добрый/смешной/умный человек, которого ты знаешь? Почему?",
 ],
 "wbmc":[
  {"q":"Застенчивый = ___ .","o":["shy","kind","tall"],"a":0},
  {"q":"Быть похожим на = to ___ like.","o":["look","see","watch"],"a":0},
  {"q":"the ___ (good, превосх.)","o":["best","goodest","better"],"a":0},
 ],
 "wbgaps":[
  {"q":"He is ___ (old) than me. (сравнит.)","a":["older"]},
  {"q":"It's the ___ (bad) film ever. (превосх.)","a":["worst"]},
  {"q":"I ___ (have to) study tonight. (обязанность, I-форма)","a":["have to"]},
 ],
 "hw":r'''<b>Описание человека.</b> Напиши 6–7 предложений о знаменитости или друге: внешность (has got…, is wearing…), характер (2–3 прилагательных) и одно сравнение (taller/funnier/more… than). <br><br>
   Затем реши <a href="focus-1-u4-workbook.html" style="color:#6a2f8c;font-weight:900;text-decoration:underline">Workbook Unit 4</a> 🧑''',
})

# ===================== UNIT 5 · Education =====================
DATA.append({
 "n":5, "title":"Education", "emoji":"🎓", "grad":("#b5651a","#e0a03a"),
 "desc":"must/mustn't · should/shouldn't · Past Simple (was/were, could) · школа и экзамены",
 "grammar":[
  {"t":"1. must / mustn't · should / shouldn't","h":r'''    <div class="g-ex"><b>must</b> — надо (правило): You <b>must</b> be quiet in the library.</div>
    <div class="g-ex"><b>mustn't</b> — нельзя (запрет): You <b>mustn't</b> use phones in the exam.</div>
    <div class="g-ex"><b>should / shouldn't</b> — совет: You <b>should</b> revise. You <b>shouldn't</b> worry.</div>'''},
  {"t":"2. Past Simple: was / were","h":r'''    <table>
      <tr><th>+</th><th>–</th><th>?</th></tr>
      <tr><td>I <b>was</b>, they <b>were</b></td><td>wasn't / weren't</td><td>Was he…? Were you…?</td></tr>
    </table>
    <div class="g-ex"><b>could / couldn't</b> — мог / не мог: I <b>could</b> read at five.</div>'''},
 ],
 "words":[
  ["nursery school","детский сад (ясли)"],["kindergarten","детский сад"],["primary school","начальная школа"],
  ["secondary school","средняя школа"],["college","колледж"],["university","университет"],
  ["state school","государственная школа"],["private school","частная школа"],["single-sex school","раздельная школа"],
  ["mixed school","смешанная школа"],["revise for an exam","готовиться к экзамену"],["sit an exam","сдавать экзамен"],
  ["retake an exam","пересдавать экзамен"],["pass an exam","сдать экзамен"],["fail an exam","провалить экзамен"],
  ["entrance exam","вступительный экзамен"],["do experiments","делать опыты"],["have a meeting","проводить собрание"],
  ["borrow a book","брать книгу (в библиотеке)"],["give a speech","произносить речь"],
 ],
 "pron_words":["university","subject","exam","timetable","science","uniform","student"],
 "pron_focus":"Звук /ʌ/ и немые буквы",
 "pron_note":"subject /ˈsʌb/ · science /ˈsaɪ/ — c не читается как /k/",
 "chunks":[
  ["do an exam","сдавать экзамен"],["pass an exam","сдать экзамен"],["get a good mark","получить хорошую оценку"],
  ["do homework","делать домашку"],["a favourite subject","любимый предмет"],["at school","в школе"],
  ["revise for a test","готовиться к тесту"],["be good at","хорошо разбираться в"],
 ],
 "listen_title":"Before the exam",
 "names":{"m":"Tom","f":"Ivy"},
 "dialog":[
  ["m","Ivy, I'm so nervous. We've got the maths exam tomorrow."],
  ["f","Don't worry. You should revise tonight and then get some sleep."],
  ["m","I know. But last year I failed the test."],
  ["f","That was different — you weren't well. This year you're ready."],
  ["m","Thanks. What must we bring to the exam?"],
  ["f","A pen and a ruler. And we mustn't use our phones."],
  ["f","Were you good at maths at primary school?"],
  ["m","Actually yes — I could count to a hundred at five!"],
 ],
 "lq":[
  {"q":"What exam have they got tomorrow?","o":["English","maths","science"],"a":1},
  {"q":"What should Tom do tonight?","o":["revise and sleep","play games","go out"],"a":0},
  {"q":"What happened last year?","o":["Tom passed","Tom failed the test","Tom was ill and away"],"a":1},
  {"q":"What mustn't they use in the exam?","o":["a pen","a ruler","their phones"],"a":2},
  {"q":"What could Tom do at five?","o":["read books","count to a hundred","speak French"],"a":1},
 ],
 "reading_title":"School in the past",
 "reading":r'''<p>A hundred years ago, school was very different. Children wrote with chalk on small boards. There weren't any computers, and classes were often very big.</p>
   <p>Students had to be very quiet, and teachers were very strict. Many children couldn't stay at school for long because they had to work. Today school is easier and more fun.</p>''',
 "rq":[
  {"q":"What did children write with?","o":["pens","chalk on boards","computers"],"a":1},
  {"q":"Were there computers?","o":["yes","no","only one"],"a":1},
  {"q":"What were the teachers like?","o":["very strict","very funny","lazy"],"a":0},
  {"q":"Why did many children leave school early?","o":["they were bored","they had to work","it was far"],"a":1},
 ],
 "ex":[
  {"q":"You ___ be quiet in the exam.","o":["must","should to","are must"],"a":0},
  {"q":"You ___ use your phone in class!","o":["mustn't","shouldn't to","don't must"],"a":0},
  {"q":"You ___ revise before the test. (совет)","o":["should","must not","have"],"a":0},
  {"q":"I ___ at home yesterday.","o":["were","was","am"],"a":1},
  {"q":"They ___ at school last week.","o":["was","were","are"],"a":1},
  {"q":"___ you good at science?","o":["Was","Were","Did"],"a":1},
  {"q":"She ___ swim when she was four.","o":["can","could","couldn't"],"a":1},
  {"q":"We ___ there — the door was locked. (не смогли)","o":["could","couldn't","can"],"a":1},
  {"q":"He ___ ill, so he stayed home.","o":["was","were","did"],"a":0},
  {"q":"You ___ worry so much. (совет — не стоит)","o":["should","shouldn't","mustn't"],"a":1},
  {"q":"Students ___ do their homework. (обязанность)","o":["must","mustn't","should not"],"a":0},
  {"q":"___ they at the party? — No, they weren't.","o":["Was","Were","Did"],"a":1},
 ],
 "gaps":[
  {"q":"You ___ (not/use) your phone in the exam. (запрет — mustn't)","a":["mustn't use","must not use"]},
  {"q":"You ___ (should) drink more water. (совет)","a":["should"]},
  {"q":"I ___ (be) tired yesterday. (was/were)","a":["was"]},
  {"q":"They ___ (be) at school last Monday.","a":["were"]},
  {"q":"She ___ (can) read at four. (past — могла)","a":["could"]},
  {"q":"You ___ (should/not) worry. (не стоит)","a":["shouldn't worry","should not worry"]},
 ],
 "howto_title":"💬 How to… дать совет",
 "howto":r'''    <div class="g-ex"><b>You should…</b> / <b>You shouldn't…</b> <span class="ru">— тебе стоит / не стоит</span></div>
    <div class="g-ex"><b>Why don't you…?</b> <span class="ru">— почему бы тебе не…</span></div>
    <div class="g-ex"><b>Don't worry!</b> / <b>Good luck!</b></div>''',
 "fx":[
  {"q":"Дай совет перед экзаменом:","o":["You should revise tonight.","You must fail.","You worry more."],"a":0},
  {"q":"Успокой друга:","o":["Don't worry, you're ready!","You are bad.","Give up now."],"a":0},
  {"q":"Пожелай удачи:","o":["Good luck!","Bad luck!","Go away!"],"a":0},
 ],
 "speaking":[
  "Расскажи о своей школе: предметы, расписание, любимый предмет (5–6 предложений).",
  "Правила твоей школы: что must, mustn't, don't have to (4 предложения).",
  "Каким ты был в 5 лет? Что ты мог и не мог делать (could/couldn't)?",
  "Дай другу 3 совета, как хорошо сдать экзамен (You should…).",
 ],
 "wbmc":[
  {"q":"Сдать экзамен = to ___ an exam.","o":["pass","fail","do"],"a":0},
  {"q":"Готовиться к тесту = to ___ for a test.","o":["revise","learn","teach"],"a":0},
  {"q":"Запрет (нельзя) = you ___ .","o":["mustn't","don't have to","should"],"a":0},
 ],
 "wbgaps":[
  {"q":"You ___ (should) sleep before the exam. (совет)","a":["should"]},
  {"q":"I ___ (be) at home yesterday. (was/were)","a":["was"]},
  {"q":"She ___ (can) swim at five. (past — могла)","a":["could"]},
 ],
 "hw":r'''<b>Моя школа / советы.</b> Часть 1: опиши свою школу (предметы, форма, правила — must/mustn't). Часть 2: дай 3 совета новому ученику (You should…). 6–7 предложений всего.<br><br>
   Затем открой <a href="focus-1-u5-workbook.html" style="color:#9a5615;font-weight:900;text-decoration:underline">Workbook Unit 5</a> 🎓''',
})

# ===================== UNIT 6 · Health and sport =====================
DATA.append({
 "n":6, "title":"Health and sport", "emoji":"⚽", "grad":("#1f7a4d","#3ab06e"),
 "desc":"Past Simple (regular & irregular) · go/do/play · спорт, здоровье и активности",
 "grammar":[
  {"t":"1. Past Simple — правильные глаголы","h":r'''    <table>
      <tr><th>+</th><th>–</th><th>?</th></tr>
      <tr><td>played, watched, <b>-ed</b></td><td><b>didn't</b> play</td><td><b>Did</b> you play?</td></tr>
    </table>
    <div class="g-ex">stop → stop<b>ped</b>, study → stud<b>ied</b>, like → lik<b>ed</b> <span class="ru">— правила -ed</span></div>'''},
  {"t":"2. Неправильные глаголы","h":r'''    <div class="g-ex"><b>go → went</b>, <b>do → did</b>, <b>have → had</b>, <b>run → ran</b>, <b>win → won</b>, <b>swim → swam</b>.</div>
    <div class="g-ex">В отрицании и вопросе — снова инфинитив: I <b>didn't go</b>. <b>Did</b> you <b>go</b>?</div>'''},
  {"t":"3. go / do / play со спортом","h":r'''    <div class="g-ex"><b>play</b> + игры с мячом: play football, tennis, basketball.</div>
    <div class="g-ex"><b>go</b> + -ing: go swimming, go running, go skiing.</div>
    <div class="g-ex"><b>do</b> + остальное: do judo, do yoga, do exercise.</div>'''},
 ],
 "words":[
  ["badminton","бадминтон"],["basketball","баскетбол"],["football","футбол"],["hockey","хоккей"],
  ["volleyball","волейбол"],["tennis","теннис"],["table tennis","настольный теннис"],["cycling","велоспорт"],
  ["ice skating","катание на коньках"],["running","бег"],["kayaking","гребля на байдарке"],["sailing","парусный спорт"],
  ["swimming","плавание"],["skiing","лыжи"],["karate","карате"],["kung fu","кунг-фу"],
  ["yoga","йога"],["footballer","футболист"],["keep fit","держать форму"],["join a gym","записаться в спортзал"],
 ],
 "pron_words":["healthy","exercise","cycling","tennis","gym","swimming","tired"],
 "pron_focus":"Звук /θ/ и мягкое g",
 "pron_note":"healthy /θ/ (язык между зубов) · gym /dʒ/ — как в jam",
 "chunks":[
  ["go swimming","ходить плавать"],["play football","играть в футбол"],["do exercise","делать зарядку"],
  ["win a match","выиграть матч"],["keep fit","держать форму"],["a healthy diet","здоровое питание"],
  ["be good at sport","быть спортивным"],["join a team","вступить в команду"],
 ],
 "listen_title":"The weekend match",
 "names":{"m":"Ben","f":"Mia"},
 "dialog":[
  ["f","Ben, did you play football at the weekend?"],
  ["m","Yes, we had a big match on Saturday."],
  ["f","Did you win?"],
  ["m","We did! I scored two goals. It was amazing."],
  ["f","Well done! Did you go running on Sunday too?"],
  ["m","No, I didn't. I was too tired, so I stayed home and rested."],
  ["f","Good idea. What about you — do you do any sport?"],
  ["m","She goes swimming twice a week and does yoga on Fridays."],
 ],
 "lq":[
  {"q":"When did Ben have a match?","o":["on Sunday","on Saturday","on Friday"],"a":1},
  {"q":"Did his team win?","o":["yes","no","it was a draw"],"a":0},
  {"q":"How many goals did Ben score?","o":["one","two","three"],"a":1},
  {"q":"Why didn't he go running on Sunday?","o":["it rained","he was too tired","he was ill"],"a":1},
  {"q":"How often does Mia go swimming?","o":["every day","twice a week","never"],"a":1},
 ],
 "reading_title":"A healthy champion",
 "reading":r'''<p>Nora is sixteen and she is a swimming champion. Last year she won three medals. She trains every morning before school and does exercise in the gym twice a week.</p>
   <p>Nora eats a healthy diet and goes to bed early. "I didn't win because I'm lucky," she says. "I won because I trained hard every day."</p>''',
 "rq":[
  {"q":"What sport does Nora do?","o":["running","swimming","tennis"],"a":1},
  {"q":"How many medals did she win last year?","o":["one","two","three"],"a":2},
  {"q":"When does she train?","o":["every morning","only Sundays","never"],"a":0},
  {"q":"Why did she win, in her words?","o":["she was lucky","she trained hard","she was tall"],"a":1},
 ],
 "ex":[
  {"q":"I ___ football yesterday.","o":["play","played","did play"],"a":1},
  {"q":"She ___ to the gym last night.","o":["goed","went","goes"],"a":1},
  {"q":"We ___ the match. (win, past)","o":["win","won","winned"],"a":1},
  {"q":"He ___ swimming on Sunday.","o":["didn't went","didn't go","don't go"],"a":1},
  {"q":"___ you play tennis yesterday?","o":["Did","Do","Was"],"a":0},
  {"q":"They ___ yoga last week.","o":["did","done","do"],"a":0},
  {"q":"I ___ running because I was ill.","o":["didn't go","not went","don't went"],"a":0},
  {"q":"We ___ football. (play + мяч)","o":["do","go","play"],"a":2},
  {"q":"She ___ swimming. (go + -ing)","o":["plays","goes","does"],"a":1},
  {"q":"stop → ___ (past)","o":["stoped","stopped","stopt"],"a":1},
  {"q":"study → ___ (past)","o":["studyed","studied","studed"],"a":1},
  {"q":"Did he ___ the race? — Yes, he did.","o":["win","won","wins"],"a":0},
 ],
 "gaps":[
  {"q":"We ___ (play) tennis yesterday. (past)","a":["played"]},
  {"q":"She ___ (go) to the gym last night. (irregular)","a":["went"]},
  {"q":"They ___ (not/win) the match. (past neg)","a":["didn't win","did not win"]},
  {"q":"___ (you/do) any sport last weekend?","a":["did you do"]},
  {"q":"I ___ (do) yoga on Friday. (go/do/play — yoga)","a":["did"]},
  {"q":"He ___ (go) swimming twice a week. (present — go/do/play)","a":["goes"]},
 ],
 "howto_title":"💬 How to… говорить о спорте",
 "howto":r'''    <div class="g-ex"><b>Do you do any sport?</b> — <b>Yes, I play/go/do…</b></div>
    <div class="g-ex"><b>I'm good at…</b> / <b>I'm not very good at…</b></div>
    <div class="g-ex"><b>Did you win?</b> — <b>Yes, we won! / No, we lost.</b></div>''',
 "fx":[
  {"q":"Спроси о спорте:","o":["Do you do any sport?","You sport do?","How you play sport?"],"a":0},
  {"q":"Скажи, чем занимаешься:","o":["I go swimming twice a week.","I swimming go two.","Swim I week."],"a":0},
  {"q":"Спроси про результат матча:","o":["Did you win?","You win did?","Win you?"],"a":0},
 ],
 "speaking":[
  "Каким спортом ты занимаешься? Используй go/do/play (4–5 предложений).",
  "Расскажи о прошлых выходных: что ты делал (Past Simple, 5 глаголов).",
  "Здоровый образ жизни: 4 совета (eat…, do…, go to bed…).",
  "Ролевая игра: интервью со спортсменом — 4 вопроса в Past Simple.",
 ],
 "wbmc":[
  {"q":"Играть в баскетбол = to ___ basketball.","o":["play","go","do"],"a":0},
  {"q":"Ходить плавать = to ___ swimming.","o":["go","play","do"],"a":0},
  {"q":"win → ___ (past)","o":["won","winned","wan"],"a":0},
 ],
 "wbgaps":[
  {"q":"I ___ (watch) the match yesterday. (past reg)","a":["watched"]},
  {"q":"She ___ (go) to the gym last night. (irregular)","a":["went"]},
  {"q":"Did they ___ (play) football? (форма после did)","a":["play"]},
 ],
 "hw":r'''<b>Мои выходные / My sporty weekend.</b> Напиши 6–7 предложений в Past Simple: каким спортом ты занимался, куда ходил, выиграл/проиграл, как себя чувствовал. Используй минимум 3 неправильных глагола (went, did, had, won).<br><br>
   Затем реши <a href="focus-1-u6-workbook.html" style="color:#166a41;font-weight:900;text-decoration:underline">Workbook Unit 6</a> ⚽''',
})

# ===================== UNIT 7 · Travel =====================
DATA.append({
 "n":7, "title":"Travel", "emoji":"✈️", "grad":("#1f6f9c","#39b0c9"),
 "desc":"Present Perfect (ever/never) · be going to · путешествия, транспорт и отдых",
 "grammar":[
  {"t":"1. Present Perfect — опыт (ever/never)","h":r'''    <div class="g-ex"><b>have/has + 3-я форма</b>: I <b>have been</b> to Spain. She <b>has seen</b> the sea.</div>
    <div class="g-ex"><b>ever</b> в вопросе: <b>Have</b> you <b>ever</b> flown? <b>never</b> — «никогда»: I've <b>never</b> been abroad.</div>
    <div class="g-ex">go → gone/been, see → seen, eat → eaten, fly → flown.</div>'''},
  {"t":"2. be going to — планы","h":r'''    <div class="g-ex"><b>am/is/are going to + инфинитив</b>: We <b>are going to</b> visit Rome.</div>
    <div class="g-ex">Для планов и намерений: I<b>'m going to</b> book a hotel tonight.</div>
    <div class="g-ex">Вопрос: <b>Are</b> you <b>going to</b> travel by train?</div>'''},
 ],
 "words":[
  ["an adventure holiday","приключенческий отдых"],["a beach holiday","пляжный отдых"],["travel by boat","плыть на лодке"],
  ["travel by ferry","плыть на пароме"],["go by train","ехать на поезде"],["book a ticket","бронировать билет"],
  ["make a reservation","делать бронь"],["a hotel","отель"],["a bed and breakfast","мини-гостиница (B&B)"],
  ["a guesthouse","гостевой дом"],["a youth hostel","молодёжный хостел"],["a campsite","кемпинг"],
  ["luggage","багаж"],["a flight","рейс"],["a boarding pass","посадочный талон"],["a platform","платформа"],
  ["a passenger","пассажир"],["a monument","памятник"],["a tourist","турист"],["an excursion","экскурсия"],
 ],
 "pron_words":["holiday","airport","passport","journey","tourist","luggage","abroad"],
 "pron_focus":"Безударный звук /ə/",
 "pron_note":"airport /ə/ · journey /ˈdʒɜː/ — вторая часть слова слабая",
 "chunks":[
  ["go on holiday","поехать в отпуск"],["book a ticket","забронировать билет"],["pack a suitcase","собрать чемодан"],
  ["by plane","на самолёте"],["go abroad","поехать за границу"],["have you ever…?","ты когда-нибудь…?"],
  ["stay in a hotel","остановиться в отеле"],["catch a train","успеть на поезд"],
 ],
 "listen_title":"Planning a trip",
 "names":{"m":"Jack","f":"Ella"},
 "dialog":[
  ["f","Jack, have you ever been to Italy?"],
  ["m","No, I've never been there. But I'm going to visit Rome this summer!"],
  ["f","Lucky you! How are you going to travel?"],
  ["m","By plane. I'm going to book the tickets tonight."],
  ["f","Have you booked a hotel yet?"],
  ["m","Yes, a small one near the centre. I've already packed my guidebook!"],
  ["f","Have you ever tried real Italian pizza?"],
  ["m","Never, but I'm definitely going to eat a lot of it!"],
 ],
 "lq":[
  {"q":"Has Jack been to Italy before?","o":["yes, once","no, never","many times"],"a":1},
  {"q":"Where is he going to visit?","o":["Rome","Paris","London"],"a":0},
  {"q":"How is he going to travel?","o":["by train","by plane","by ferry"],"a":1},
  {"q":"Has he booked a hotel?","o":["yes","no","not yet"],"a":0},
  {"q":"Has Jack tried Italian pizza?","o":["yes, often","never","once"],"a":1},
 ],
 "reading_title":"A different holiday",
 "reading":r'''<p>Most tourists go to hotels near the beach, but some people like different holidays. Every summer, Marta and her family go camping in the mountains. They have never stayed in a hotel on holiday.</p>
   <p>This year they are going to try something new: a long train journey across the country. "We're going to visit six cities," says Marta. "I've never been so excited!"</p>''',
 "rq":[
  {"q":"Where do most tourists go?","o":["to the mountains","to hotels near the beach","abroad"],"a":1},
  {"q":"What does Marta's family do every summer?","o":["go camping","stay in hotels","fly abroad"],"a":0},
  {"q":"Have they ever stayed in a hotel on holiday?","o":["yes","never","once"],"a":1},
  {"q":"What are they going to do this year?","o":["a long train journey","stay home","go to the beach"],"a":0},
 ],
 "ex":[
  {"q":"I ___ never been to Paris.","o":["have","has","am"],"a":0},
  {"q":"She ___ seen the sea.","o":["have","has","is"],"a":1},
  {"q":"Have you ___ flown in a plane?","o":["never","ever","yet"],"a":1},
  {"q":"We ___ going to visit Rome.","o":["is","are","have"],"a":1},
  {"q":"He ___ going to book a hotel.","o":["is","are","have"],"a":0},
  {"q":"I've ___ been abroad. (никогда)","o":["ever","never","yet"],"a":1},
  {"q":"go → I have ___ to Spain.","o":["went","been","go"],"a":1},
  {"q":"They ___ to travel by train. (план)","o":["are going","going","go"],"a":0},
  {"q":"Have you booked the tickets ___?","o":["yet","ever","never"],"a":0},
  {"q":"see → I have ___ that film.","o":["saw","seen","see"],"a":1},
  {"q":"___ you going to pack tonight?","o":["Are","Have","Do"],"a":0},
  {"q":"catch a ___","o":["train","holiday","luggage"],"a":0},
 ],
 "gaps":[
  {"q":"I ___ (never/be) to Japan. (present perfect)","a":["have never been","'ve never been"]},
  {"q":"___ (you/ever/fly) in a plane? (вопрос)","a":["have you ever flown"]},
  {"q":"We ___ (going to) visit Rome. (план)","a":["are going to"]},
  {"q":"She ___ (going to) book a hotel. (he/she форма)","a":["is going to"]},
  {"q":"He has ___ (see) the sea. (3-я форма)","a":["seen"]},
  {"q":"Have you packed ___ ? — Not yet.","a":["yet"]},
 ],
 "howto_title":"💬 How to… в путешествии",
 "howto":r'''    <div class="g-ex"><b>Have you ever been to…?</b> <span class="ru">— бывал ли ты…</span></div>
    <div class="g-ex"><b>I'd like a ticket to…, please.</b> <span class="ru">— билет до…</span></div>
    <div class="g-ex"><b>What time does the train leave/arrive?</b></div>''',
 "fx":[
  {"q":"Спроси про опыт:","o":["Have you ever been to London?","You go London?","Ever you London?"],"a":0},
  {"q":"Купи билет:","o":["A ticket to Rome, please.","Give ticket Rome.","I ticket want Rome."],"a":0},
  {"q":"Спроси расписание:","o":["What time does the train leave?","Train leave when time?","How train go?"],"a":0},
 ],
 "speaking":[
  "Куда ты ездил? Опыт путешествий (Present Perfect: I've been to…, I've never…).",
  "Планы на лето: куда и как поедешь, что будешь делать (be going to, 5 предложений).",
  "Ролевая игра на вокзале: купи билет, спроси время и платформу.",
  "Идеальный отпуск: где, с кем, чем занимаешься? 4–5 предложений.",
 ],
 "wbmc":[
  {"q":"Забронировать билет = to ___ a ticket.","o":["book","pack","catch"],"a":0},
  {"q":"За границей = ___ .","o":["abroad","aboard","around"],"a":0},
  {"q":"see → have ___ (3-я форма)","o":["seen","saw","see"],"a":0},
 ],
 "wbgaps":[
  {"q":"I ___ (never/be) abroad. (present perfect)","a":["have never been","'ve never been"]},
  {"q":"We ___ (going to) travel by train. (план)","a":["are going to"]},
  {"q":"Have you ___ flown? (ever/never — в вопросе)","a":["ever"]},
 ],
 "hw":r'''<b>Мои путешествия и планы.</b> Часть 1: 3 предложения об опыте (I've been to…, I've never…). Часть 2: 3 предложения о планах на каникулы (be going to). Всего 6 предложений.<br><br>
   Затем открой <a href="focus-1-u7-workbook.html" style="color:#166a86;font-weight:900;text-decoration:underline">Workbook Unit 7</a> ✈️''',
})

# ===================== UNIT 8 · Nature =====================
DATA.append({
 "n":8, "title":"Nature", "emoji":"🌍", "grad":("#2f7a2f","#7cc23a"),
 "desc":"will/won't (прогнозы) · first conditional · природа, животные и погода",
 "grammar":[
  {"t":"1. will / won't — прогнозы и решения","h":r'''    <div class="g-ex"><b>will + инфинитив</b>: It <b>will</b> rain tomorrow. I think robots <b>will</b> help us.</div>
    <div class="g-ex"><b>won't</b> = will not: The weather <b>won't</b> be cold.</div>
    <div class="g-ex">Часто с <b>I think / maybe / probably</b>: Maybe it <b>will</b> snow.</div>'''},
  {"t":"2. First conditional — реальное условие","h":r'''    <div class="g-ex"><b>If + Present Simple, … will…</b>: <b>If</b> it <b>rains</b>, we <b>will stay</b> home.</div>
    <div class="g-ex">Можно наоборот: We <b>will stay</b> home <b>if</b> it <b>rains</b>.</div>
    <div class="g-ex">После <b>if</b> — НЕ будущее: <span class="ru">не «if it will rain»</span></div>'''},
 ],
 "words":[
  ["continent","континент"],["island","остров"],["lake","озеро"],["forest","лес"],["mountain","гора"],
  ["river","река"],["sea","море"],["waterfall","водопад"],["jungle","джунгли"],["elephant","слон"],
  ["lion","лев"],["tiger","тигр"],["bear","медведь"],["shark","акула"],["whale","кит"],
  ["dolphin","дельфин"],["deer","олень"],["windy","ветрено"],["sunny","солнечно"],["foggy","туманно"],
 ],
 "pron_words":["mountain","island","desert","weather","temperature","forest","animal"],
 "pron_focus":"Немые буквы и /ð/",
 "pron_note":"island /ˈaɪlənd/ (s немая) · weather /ð/ — мягкое th",
 "chunks":[
  ["go for a walk","пойти на прогулку"],["in the mountains","в горах"],["by the sea","у моря"],
  ["a wild animal","дикое животное"],["What's the weather like?","какая погода?"],["it's sunny","солнечно"],
  ["protect nature","беречь природу"],["climate change","изменение климата"],
 ],
 "listen_title":"A day trip",
 "names":{"m":"Sam","f":"Nina"},
 "dialog":[
  ["f","Sam, what's the weather like tomorrow? Let's go for a walk."],
  ["m","The app says it will be sunny in the morning."],
  ["f","Great! If it's sunny, we'll go to the lake."],
  ["m","Good idea. But it might be windy in the afternoon."],
  ["f","That's OK. If it gets windy, we'll come home early."],
  ["m","Do you think we'll see any animals?"],
  ["f","Maybe some birds and fish. I hope we won't see any snakes!"],
  ["m","Don't worry. Let's take a map and some water."],
 ],
 "lq":[
  {"q":"What will the weather be like in the morning?","o":["rainy","sunny","snowy"],"a":1},
  {"q":"Where will they go if it's sunny?","o":["to the lake","to the city","to the desert"],"a":0},
  {"q":"What might happen in the afternoon?","o":["it might snow","it might be windy","it might be hot"],"a":1},
  {"q":"What animals might they see?","o":["birds and fish","lions","bears"],"a":0},
  {"q":"What does Nina hope?","o":["they won't see snakes","they will get lost","it will rain"],"a":0},
 ],
 "reading_title":"Our changing planet",
 "reading":r'''<p>Our planet is beautiful, with high mountains, big forests and deep oceans. But nature is in danger. Scientists say that if we don't protect it, many animals will disappear.</p>
   <p>The good news is that everyone can help. If we use less plastic and plant more trees, the world will be a better place. Small actions today will make a big difference tomorrow.</p>''',
 "rq":[
  {"q":"What is happening to nature?","o":["it is safe","it is in danger","it is growing"],"a":1},
  {"q":"What will happen if we don't protect nature?","o":["nothing","many animals will disappear","it will rain"],"a":1},
  {"q":"What can help, according to the text?","o":["using less plastic","driving more","cutting trees"],"a":0},
  {"q":"What will small actions do?","o":["make a big difference","change nothing","cost a lot"],"a":0},
 ],
 "ex":[
  {"q":"It ___ rain tomorrow.","o":["will","is","does"],"a":0},
  {"q":"The weather ___ be cold. (won't)","o":["will not","not will","doesn't"],"a":0},
  {"q":"If it rains, we ___ stay home.","o":["will","are","won't"],"a":0},
  {"q":"If it ___ sunny, we'll go out.","o":["will be","is","be"],"a":1},
  {"q":"I think robots ___ help us.","o":["will","are","do"],"a":0},
  {"q":"We ___ see any animals today. (negative prediction)","o":["won't","don't will","not will"],"a":0},
  {"q":"If you ___ hard, you'll pass.","o":["will study","study","studies"],"a":1},
  {"q":"Maybe it ___ snow tonight.","o":["will","is","does"],"a":0},
  {"q":"a wild ___","o":["animal","weather","field"],"a":0},
  {"q":"What's the weather ___?","o":["like","as","is"],"a":0},
  {"q":"If we plant trees, the air ___ be cleaner.","o":["will","is","does"],"a":0},
  {"q":"It's very ___ today — take an umbrella.","o":["sunny","rainy","dry"],"a":1},
 ],
 "gaps":[
  {"q":"It ___ (will) be sunny tomorrow. (прогноз)","a":["will"]},
  {"q":"The weather ___ (will/not) be cold. (won't)","a":["won't","will not"]},
  {"q":"If it ___ (rain), we'll stay home. (после if — present)","a":["rains"]},
  {"q":"If you study, you ___ (pass) the exam. (will + verb)","a":["will pass","'ll pass"]},
  {"q":"I think we ___ (see) some birds. (prediction)","a":["will see","'ll see"]},
  {"q":"What's the weather ___ ? (устойчивое)","a":["like"]},
 ],
 "howto_title":"💬 How to… о погоде и планах",
 "howto":r'''    <div class="g-ex"><b>What's the weather like?</b> — <b>It's sunny / rainy / windy.</b></div>
    <div class="g-ex"><b>I think it will…</b> / <b>Maybe it will…</b> <span class="ru">— прогноз</span></div>
    <div class="g-ex"><b>If it's nice, we'll…</b> <span class="ru">— план с условием</span></div>''',
 "fx":[
  {"q":"Спроси о погоде:","o":["What's the weather like?","How is weather do?","Weather what like you?"],"a":0},
  {"q":"Дай прогноз:","o":["I think it will rain.","It rain will.","Will rain it think."],"a":0},
  {"q":"Предложи план с условием:","o":["If it's sunny, we'll go out.","Sunny we go if.","We go if will sunny."],"a":0},
 ],
 "speaking":[
  "Какая погода тебе нравится и почему? 3–4 предложения.",
  "Прогноз: какой будет мир через 50 лет? (will/won't, 4 предложения).",
  "Закончи условия: If it's sunny tomorrow, I'll… / If it rains, I'll…",
  "Как беречь природу? Дай 3 совета (If we…, the world will…).",
 ],
 "wbmc":[
  {"q":"Дикое животное = a ___ animal.","o":["wild","weather","windy"],"a":0},
  {"q":"Какая погода? = What's the weather ___ ?","o":["like","as","do"],"a":0},
  {"q":"will not = ___","o":["won't","willn't","don't"],"a":0},
 ],
 "wbgaps":[
  {"q":"It ___ (will) be sunny. (прогноз)","a":["will"]},
  {"q":"If it ___ (rain), we'll stay in. (после if)","a":["rains"]},
  {"q":"I think we ___ (win). (will + verb)","a":["will win","'ll win"]},
 ],
 "hw":r'''<b>Погода и планы / Nature.</b> Часть 1: прогноз погоды на завтра (will/won't, 3 предложения). Часть 2: 3 условных предложения — что ты сделаешь (If it's…, I'll…). Плюс назови 3 способа беречь природу.<br><br>
   Затем реши <a href="focus-1-u8-workbook.html" style="color:#256a25;font-weight:900;text-decoration:underline">Workbook Unit 8</a> 🌍''',
})

META = {
 "prefix": "focus-1",
 "level": "A2",
 "hub": "focus-1-course.html",
 "trainer": "focus-1-course.html",
 "cover_base": "",
}
