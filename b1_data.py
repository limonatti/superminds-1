# -*- coding: utf-8 -*-
# Контент юнитов Speakout B1 (авторский, по программе A–D). Вёрстка — в gen_b1_units.py
DATA = []

# ===================== UNIT 1 · People =====================
DATA.append({
 "n":1, "title":"People", "emoji":"🧑‍🤝‍🧑", "grad":("#7c2340","#e0952a"),
 "desc":"Present Simple / Continuous · state verbs · verb patterns · характер и знакомства",
 "grammar":[
  {"t":"1. Present Simple vs Continuous + state verbs","h":r'''    <table>
      <tr><th>Форма</th><th>Когда</th><th>Пример</th></tr>
      <tr><td><b>Present Simple</b></td><td>привычки, факты</td><td>She <b>works</b> in a hospital.</td></tr>
      <tr><td><b>Present Continuous</b></td><td>сейчас / временно</td><td>She<b>'s working</b> from home this week.</td></tr>
    </table>
    <div class="g-ex"><b>State verbs</b> (know, like, want, believe) — только Simple: I <b>know</b> him well. <span class="ru">(не «am knowing»)</span></div>
    <div class="g-ex">Наречия частоты перед глаголом: I <b>usually</b> get up at seven; she is <b>always</b> late. <span class="ru">— usually/often/never</span></div>'''},
  {"t":"2. Verb patterns — -ing или to?","h":r'''    <div class="g-ex"><b>+ -ing:</b> enjoy, don't mind, finish, keep → I <b>enjoy meeting</b> new people.</div>
    <div class="g-ex"><b>+ to inf:</b> want, decide, hope, plan, would like → I <b>want to make</b> new friends.</div>
    <div class="g-ex">like можно с обоими: I like <b>cooking</b> = I like <b>to cook</b>.</div>'''},
  {"t":"3. Урок D — модификаторы (насколько?)","h":r'''    <div class="g-ex"><b>a bit</b> shy · <b>quite</b> friendly · <b>really / very</b> kind <span class="ru">— степень</span></div>
    <div class="g-ex"><b>not very</b> talkative <span class="ru">— мягкое «не очень»</span></div>
    <div class="g-ex">С сильными прилагательными — <b>absolutely</b>: absolutely right / exhausted <span class="ru">(не «very right»)</span></div>'''},
 ],
 "listen_title":"Meeting at a party",
 "names":{"m":"Sam","f":"Nina"},
 "dialog":[
  ["m","Hi! Do you mind if I sit here?"],
  ["f","Not at all. I'm Nina. Are you a friend of Anna's?"],
  ["m","Yeah, we work together. I'm Sam. How do you know her?"],
  ["f","We were at university together. She's so outgoing — she knows everyone!"],
  ["m","True. I'm a bit shy at parties, actually."],
  ["f","Me too, but you seem really friendly. What do you do, Sam?"],
  ["m","I'm a graphic designer. I usually work from home, so I don't chat much."],
  ["f","Well, it's really nice talking to you. Let's get a coffee sometime."],
 ],
 "lq":[
  {"q":"How do Sam and Anna know each other?","o":["they were at school","they work together","they are neighbours"],"a":1},
  {"q":"Where did Nina meet Anna?","o":["at university","at work","at a party"],"a":0},
  {"q":"How does Sam feel at parties?","o":["confident","a bit shy","bored"],"a":1},
  {"q":"What is Sam's job?","o":["teacher","graphic designer","journalist"],"a":1},
  {"q":"Where does Sam usually work?","o":["in an office","from home","abroad"],"a":1},
 ],
 "ex":[
  {"q":"Look! The children ___ in the garden.","o":["play","are playing","plays"],"a":1},
  {"q":"I ___ coffee every single morning.","o":["am drinking","drink","drinks"],"a":1},
  {"q":"She ___ three languages.","o":["is knowing","knows","know"],"a":1},
  {"q":"Choose the correct order:","o":["We watch usually TV","We usually watch TV","Usually watch we TV"],"a":1},
  {"q":"He enjoys ___ new people.","o":["to meet","meeting","meet"],"a":1},
  {"q":"I've decided ___ a photography course.","o":["taking","to take","take"],"a":1},
  {"q":"This puzzle is ___ easy — I finished in a minute!","o":["really","much","more"],"a":0},
  {"q":"You're ___ right, one hundred percent!","o":["very","absolutely","quite"],"a":1},
 ],
 "gaps":[
  {"q":"Right now I ___ (write) a message to Anna.","a":["am writing","'m writing"]},
  {"q":"They ___ (not/like) crowded places.","a":["don't like","do not like"]},
  {"q":"I can't stand ___ (wait) in long queues.","a":["waiting"]},
  {"q":"She's ___ bit quiet today. (модификатор)","a":["a"]},
 ],
 "howto_title":"💬 How to… начать и закончить разговор",
 "howto":r'''    <div class="g-ex"><b>Do you mind if I join you?</b> <span class="ru">— можно к вам?</span></div>
    <div class="g-ex"><b>So, what do you do?</b> / <b>How do you know Anna?</b> <span class="ru">— поддержать</span></div>
    <div class="g-ex"><b>Anyway, I'd better go.</b> <span class="ru">— мне пора</span></div>
    <div class="g-ex"><b>It was really nice talking to you!</b> <span class="ru">— тепло попрощаться</span></div>''',
 "fx":[
  {"q":"Начни разговор с незнакомцем:","o":["Do you mind if I join you?","Move, please.","Why are you here?"],"a":0},
  {"q":"Поддержи беседу:","o":["Stop talking.","So, what do you do?","I don't care."],"a":1},
  {"q":"Вежливо закончи разговор:","o":["It was really nice talking to you!","Bye forever.","Finally it's over."],"a":0},
 ],
 "wbmc":[
  {"q":"Человек, с которым ты работаешь = a ___ .","o":["colleague","customer","stranger"],"a":0},
  {"q":"Завести друзей = to ___ friends.","o":["make","do","get"],"a":0},
  {"q":"У неё отличное чувство юмора = a great sense of ___ .","o":["humour","mood","feeling"],"a":0},
 ],
 "wbgaps":[
  {"q":"We ___ (get) on really well — present simple.","a":["get"]},
  {"q":"I'd like ___ (know) you better.","a":["to know"]},
  {"q":"He is ___ friendly — усилитель «очень».","a":["really","very"]},
 ],
 "hw":r'''<b>Опиши человека!</b> Напиши 5–6 предложений о друге или коллеге: чем занимается (Present Simple), что делает сейчас/в этот период (Present Continuous) и какой у него характер (2–3 модификатора: a bit, really, quite). Пример: <i>«My friend Kate works in a café. This month she's learning Spanish. She's really outgoing and quite funny.»</i><br><br>
   Плюс пройди <a href="speakout-b1.html" style="color:#b06e12;font-weight:900;text-decoration:underline">тренажёр Unit 1</a> и пришли Асе скрин со счётом 🙂''',
})

# ===================== UNIT 2 · Tale tellers =====================
DATA.append({
 "n":2, "title":"Tale tellers", "emoji":"📖", "grad":("#5e1a30","#b5654a"),
 "desc":"Narrative tenses · Past Simple vs Present Perfect · предлоги времени · истории и фильмы",
 "grammar":[
  {"t":"1. Narrative tenses — рассказываем историю","h":r'''    <table>
      <tr><th>Время</th><th>Зачем</th><th>Пример</th></tr>
      <tr><td><b>Past Simple</b></td><td>события по очереди</td><td>I <b>heard</b> a noise and <b>opened</b> the door.</td></tr>
      <tr><td><b>Past Continuous</b></td><td>фон, процесс</td><td>It <b>was raining</b> when I left.</td></tr>
      <tr><td><b>Past Perfect</b></td><td>ещё раньше</td><td>The film <b>had started</b> when we arrived.</td></tr>
    </table>'''},
  {"t":"2. Past Simple vs Present Perfect","h":r'''    <div class="g-ex"><b>Past Simple</b> — точное прошлое: I <b>saw</b> that film <b>yesterday</b>.</div>
    <div class="g-ex"><b>Present Perfect</b> — опыт / без даты: I<b>'ve seen</b> it three times. <span class="ru">— ever, never, just, already, yet</span></div>
    <div class="g-ex">Have you <b>ever</b> read it? — No, not <b>yet</b>.</div>'''},
  {"t":"3. Урок D — предлоги времени","h":r'''    <div class="g-ex"><b>at</b> 6 o'clock · <b>on</b> Monday · <b>in</b> July / 2020 <span class="ru">— точка / день / период</span></div>
    <div class="g-ex"><b>during</b> the film · <b>for</b> two hours · two years <b>ago</b></div>
    <div class="g-ex"><b>while</b> I was reading, the phone rang. <span class="ru">— while + процесс</span></div>'''},
 ],
 "listen_title":"A strange night",
 "names":{"m":"Tom","f":"Amy"},
 "dialog":[
  ["f","You look tired, Tom. Did you sleep badly?"],
  ["m","Terribly. Something strange happened last night."],
  ["f","Ooh, tell me! What happened?"],
  ["m","Well, I was reading in bed when I heard a noise downstairs."],
  ["f","Scary! Had you locked the door?"],
  ["m","Yes, I had. So I went down very quietly... and it was just the cat!"],
  ["f","Ha! Your cat has done that before, hasn't it?"],
  ["m","Twice this week! I've never been so frightened by a cat in my life."],
 ],
 "lq":[
  {"q":"How did Tom sleep?","o":["very well","terribly","normally"],"a":1},
  {"q":"What was Tom doing when he heard the noise?","o":["sleeping","reading in bed","watching TV"],"a":1},
  {"q":"Had he locked the door?","o":["yes, he had","no, he hadn't","he forgot"],"a":0},
  {"q":"What was making the noise?","o":["a burglar","the cat","the wind"],"a":1},
  {"q":"How often has the cat done this?","o":["never","twice this week","once a year"],"a":1},
 ],
 "ex":[
  {"q":"I ___ TV when the lights went out.","o":["watched","was watching","had watched"],"a":1},
  {"q":"When we arrived, the show ___ already ___ .","o":["has / started","had / started","was / starting"],"a":1},
  {"q":"He ___ a strange noise and stood up.","o":["was hearing","heard","had heard"],"a":1},
  {"q":"I ___ that book last week — it was great.","o":["have read","read","had read"],"a":1},
  {"q":"Have you ___ been to Japan?","o":["ever","yet","ago"],"a":0},
  {"q":"She hasn't finished the novel ___ .","o":["already","yet","just"],"a":1},
  {"q":"We waited ___ two hours at the airport.","o":["during","for","since"],"a":1},
  {"q":"The accident happened ___ Monday morning.","o":["in","at","on"],"a":2},
 ],
 "gaps":[
  {"q":"While I ___ (cook), the smoke alarm went off.","a":["was cooking"]},
  {"q":"By the time she called, I ___ (already/leave).","a":["had already left"]},
  {"q":"I ___ (see) that film three times — I love it! (опыт)","a":["have seen","'ve seen"]},
  {"q":"They moved here two years ___ .","a":["ago"]},
 ],
 "howto_title":"🙏 How to… извиниться",
 "howto":r'''    <div class="g-ex"><b>I'm so sorry.</b> <span class="ru">— мне очень жаль</span></div>
    <div class="g-ex"><b>It was my fault.</b> <span class="ru">— это моя вина</span></div>
    <div class="g-ex"><b>I didn't mean to.</b> <span class="ru">— я не специально</span></div>
    <div class="g-ex"><b>It won't happen again.</b> <span class="ru">— больше не повторится</span></div>''',
 "fx":[
  {"q":"Ты опоздал. Извинись:","o":["I'm so sorry I'm late.","You waited, so what?","It's not my problem."],"a":0},
  {"q":"Признай вину:","o":["It was my fault, I forgot.","The bus is guilty.","Nobody is sorry."],"a":0},
  {"q":"Пообещай, что не повторится:","o":["It won't happen again.","Maybe it will, maybe not.","Deal with it."],"a":0},
 ],
 "wbmc":[
  {"q":"Сюжет фильма = the ___ .","o":["plot","place","price"],"a":0},
  {"q":"Неожиданный поворот = a plot ___ .","o":["twist","turn","trick"],"a":0},
  {"q":"Основан на реальных событиях = ___ on a true story.","o":["based","made","put"],"a":0},
 ],
 "wbgaps":[
  {"q":"Suddenly the door ___ (open) and a man walked in. (по очереди)","a":["opened"]},
  {"q":"I've ___ finished the book — literally a minute ago. (только что)","a":["just"]},
  {"q":"We stayed there ___ a week. (на срок)","a":["for"]},
 ],
 "hw":r'''<b>Расскажи историю!</b> Напиши короткую историю (5–6 предложений) о странном или смешном случае. Используй narrative tenses: Past Simple для событий, Past Continuous для фона (While I was…), Past Perfect для того, что случилось раньше. Начни так: <i>«It was a normal evening. I was …ing when suddenly …»</i><br><br>
   Плюс пройди <a href="speakout-b1.html" style="color:#b06e12;font-weight:900;text-decoration:underline">тренажёр Unit 2</a> и пришли Асе скрин со счётом 🙂''',
})

# ===================== UNIT 3 · Questions =====================
DATA.append({
 "n":3, "title":"Questions", "emoji":"❓", "grad":("#7c2340","#a8632c"),
 "desc":"Question forms · планы: going to / Present Continuous / will · вежливые вопросы · phrasal verbs",
 "grammar":[
  {"t":"1. Question forms — порядок слов","h":r'''    <table>
      <tr><th>Тип</th><th>Схема</th><th>Пример</th></tr>
      <tr><td>Yes/No</td><td>aux + подл. + глагол</td><td><b>Do</b> you like jazz? <b>Are</b> you ready?</td></tr>
      <tr><td>Wh-</td><td>Wh + aux + подл.</td><td><b>Where do</b> you live?</td></tr>
      <tr><td>Subject</td><td>без aux</td><td><b>Who called</b> you? <b>What happened</b>?</td></tr>
    </table>
    <div class="g-ex">Сравни: <b>Who did you call?</b> (кого?) vs <b>Who called you?</b> (кто?) <span class="ru">— во втором нет do</span></div>'''},
  {"t":"2. Планы: going to / Present Continuous / will","h":r'''    <div class="g-ex"><b>going to</b> — намерение/план: I<b>'m going to</b> look for a new job.</div>
    <div class="g-ex"><b>Present Continuous</b> — договорённость на время: I<b>'m meeting</b> Sam at six.</div>
    <div class="g-ex"><b>will</b> — решение сейчас / прогноз: OK, I<b>'ll</b> help you.</div>'''},
  {"t":"3. Урок D — phrasal verbs","h":r'''    <div class="g-ex"><b>find out</b> (узнать) · <b>look for</b> (искать) · <b>give up</b> (сдаться)</div>
    <div class="g-ex"><b>fill in</b> a form (заполнить) · <b>turn up</b> (появиться) · <b>figure out</b> (сообразить)</div>
    <div class="g-ex">I need to <b>find out</b> the time. Don't <b>give up</b>!</div>'''},
 ],
 "listen_title":"Weekend plans",
 "names":{"m":"Ben","f":"Zoe"},
 "dialog":[
  ["f","What are you doing this weekend, Ben?"],
  ["m","I'm meeting some friends on Saturday. We're going to explore the old town."],
  ["f","Sounds fun! Do you know where the new museum is?"],
  ["m","I'm not sure. Could you tell me if it's near the station?"],
  ["f","I'll look it up. Actually, why don't you come with us?"],
  ["m","I'd love to! What time are you meeting?"],
  ["f","Around eleven. I think it'll be busy, so let's turn up early."],
  ["m","Great. I'll find out the ticket price and text you."],
 ],
 "lq":[
  {"q":"What is Ben doing on Saturday?","o":["working","meeting friends","staying home"],"a":1},
  {"q":"What are they going to do?","o":["explore the old town","go shopping","watch a match"],"a":0},
  {"q":"What does Ben want to know?","o":["the price","where the museum is","who is coming"],"a":1},
  {"q":"What time are they meeting?","o":["around nine","around eleven","around one"],"a":1},
  {"q":"What will Ben find out?","o":["the ticket price","the weather","the address"],"a":0},
 ],
 "ex":[
  {"q":"___ you like spicy food?","o":["Do","Are","Does"],"a":0},
  {"q":"Choose the correct subject question:","o":["Who did you called?","Who called you?","Who you called?"],"a":1},
  {"q":"Look at those clouds! It ___ rain.","o":["will rain","is going to rain","rains"],"a":1},
  {"q":"I ___ Sam at seven — it's all arranged.","o":["meet","'m meeting","will meet"],"a":1},
  {"q":"The phone's ringing. — OK, I ___ get it.","o":["'m going to","'ll","get"],"a":1},
  {"q":"I must ___ what time the shop opens.","o":["find out","look","give up"],"a":0},
  {"q":"Don't ___ up — keep trying!","o":["give","fill","turn"],"a":0},
  {"q":"She's looking ___ her keys.","o":["at","for","after"],"a":1},
 ],
 "gaps":[
  {"q":"___ you know the answer? (вспом. глагол в начале вопроса)","a":["do"]},
  {"q":"I'm going ___ look for a new phone tomorrow.","a":["to"]},
  {"q":"Could you ___ me where the bank is? (вежливо)","a":["tell"]},
  {"q":"We need to fill ___ this form. (phrasal)","a":["in"]},
 ],
 "howto_title":"🙋 How to… задать вежливый вопрос",
 "howto":r'''    <div class="g-ex"><b>Could you tell me where…?</b> <span class="ru">— не прямой вопрос</span></div>
    <div class="g-ex"><b>Do you know if…?</b> <span class="ru">— осторожно уточнить</span></div>
    <div class="g-ex"><b>Would you mind …ing?</b> <span class="ru">— вежливая просьба</span></div>
    <div class="g-ex"><b>Can I ask you something?</b></div>''',
 "fx":[
  {"q":"Вежливо спроси дорогу:","o":["Could you tell me where the station is?","Where station?","Station now!"],"a":0},
  {"q":"Осторожно уточни:","o":["Do you know if the shop is open?","Shop open or not?","Tell me fast."],"a":0},
  {"q":"Вежливо попроси:","o":["Would you mind closing the window?","Close it.","Window! Now!"],"a":0},
 ],
 "wbmc":[
  {"q":"узнать = to ___ out.","o":["find","look","give"],"a":0},
  {"q":"заполнить анкету = to fill ___ a form.","o":["in","on","up"],"a":0},
  {"q":"любопытный = ___ .","o":["curious","serious","furious"],"a":0},
 ],
 "wbgaps":[
  {"q":"Who ___ (make) this cake? It's delicious! (subject question, past)","a":["made"]},
  {"q":"I ___ (meet) my dentist at nine tomorrow — it's arranged.","a":["'m meeting","am meeting"]},
  {"q":"Please fill ___ your name at the top. (phrasal)","a":["in"]},
 ],
 "hw":r'''<b>Интервью!</b> Придумай 6 вопросов новому другу (Yes/No, Wh-, один subject question — «Who…?»). Потом напиши 3 своих плана на выходные: один с <i>going to</i>, один с Present Continuous (договорённость), один с <i>will</i> (спонтанное решение).<br><br>
   Плюс пройди <a href="speakout-b1.html" style="color:#b06e12;font-weight:900;text-decoration:underline">тренажёр Unit 3</a> и пришли Асе скрин со счётом 🙂''',
})

# ===================== UNIT 4 · Winners =====================
DATA.append({
 "n":4, "title":"Winners", "emoji":"🏆", "grad":("#6a2038","#d98b2b"),
 "desc":"Modals: must / have to / should · артикли a/an/the · правила can/can't · спорт и достижения",
 "grammar":[
  {"t":"1. Modals — правила и советы","h":r'''    <table>
      <tr><th>Модальный</th><th>Смысл</th><th>Пример</th></tr>
      <tr><td><b>have to / must</b></td><td>обязательно</td><td>You <b>have to</b> wear trainers.</td></tr>
      <tr><td><b>mustn't</b></td><td>нельзя</td><td>You <b>mustn't</b> touch the net.</td></tr>
      <tr><td><b>should / shouldn't</b></td><td>совет</td><td>You <b>should</b> warm up first.</td></tr>
      <tr><td><b>don't have to</b></td><td>можно не</td><td>You <b>don't have to</b> be a member.</td></tr>
    </table>'''},
  {"t":"2. Articles — a / an / the / —","h":r'''    <div class="g-ex"><b>a / an</b> — впервые, один из многих: I saw <b>a</b> dog.</div>
    <div class="g-ex"><b>the</b> — конкретное / единственное: <b>The</b> dog was huge. <b>The</b> sun is bright.</div>
    <div class="g-ex"><b>— (нет артикля)</b> — в общем смысле: I love <b>—</b> sport. <b>—</b> Dogs are friendly.</div>'''},
  {"t":"3. Урок D — Present Perfect + superlative","h":r'''    <div class="g-ex">It's <b>the best game I've ever played</b>.</div>
    <div class="g-ex">She's <b>the fastest runner I've ever seen</b>.</div>
    <div class="g-ex">This is <b>the most exciting match we've had</b> this year.</div>'''},
 ],
 "listen_title":"After the match",
 "names":{"m":"Leo","f":"Mia"},
 "dialog":[
  ["f","We won! I can't believe it, Leo!"],
  ["m","Best game I've ever played! Did you see my last goal?"],
  ["f","Amazing. But remember, we have to thank the coach."],
  ["m","True. She made us train so hard this month."],
  ["f","You don't have to be the strongest — you have to want it most."],
  ["m","Exactly. So, can we celebrate now?"],
  ["f","Of course! But you mustn't forget practice on Monday."],
  ["m","Ha, never. This is the happiest I've ever been after a match."],
 ],
 "lq":[
  {"q":"How does the team feel?","o":["disappointed","happy — they won","tired and sad"],"a":1},
  {"q":"What does Leo say about the game?","o":["it was boring","the best he's ever played","too long"],"a":1},
  {"q":"Who do they have to thank?","o":["the referee","the coach","the fans"],"a":1},
  {"q":"What must Leo not forget?","o":["practice on Monday","his boots","the party"],"a":0},
  {"q":"What matters most, according to Mia?","o":["being the strongest","wanting it most","being the tallest"],"a":1},
 ],
 "ex":[
  {"q":"You ___ wear a helmet — it's the rule.","o":["don't have to","have to","shouldn't"],"a":1},
  {"q":"You ___ touch that — it's dangerous.","o":["mustn't","don't have to","should"],"a":0},
  {"q":"You ___ warm up before running. (совет)","o":["should","must","mustn't"],"a":0},
  {"q":"I watched ___ interesting match yesterday.","o":["a","an","the"],"a":1},
  {"q":"___ sun was very bright during the game.","o":["A","An","The"],"a":2},
  {"q":"I really love ___ sport in general.","o":["a","the","—"],"a":2},
  {"q":"It's the best film I ___ seen.","o":["have","had","has"],"a":0},
  {"q":"She's the ___ player on the team.","o":["most strong","strongest","stronger"],"a":1},
 ],
 "gaps":[
  {"q":"You ___ (not/have to) pay — it's free. (можно не)","a":["don't have to","do not have to"]},
  {"q":"Athletes ___ (have to) train every day. (обязаны)","a":["have to"]},
  {"q":"It's ___ most exciting game of the year. (артикль)","a":["the"]},
  {"q":"This is the best pizza I've ___ eaten.","a":["ever"]},
 ],
 "howto_title":"🚦 How to… сказать про правила (can / can't)",
 "howto":r'''    <div class="g-ex"><b>You can bring water in.</b> <span class="ru">— можно</span></div>
    <div class="g-ex"><b>You can't use your phone here.</b> <span class="ru">— нельзя</span></div>
    <div class="g-ex"><b>Are we allowed to…?</b> <span class="ru">— разрешено ли?</span></div>
    <div class="g-ex"><b>Is it OK if I…?</b> <span class="ru">— вежливо спросить разрешения</span></div>''',
 "fx":[
  {"q":"Спроси разрешения:","o":["Can I bring my bag in here?","Bag in. Now.","I do what I want."],"a":0},
  {"q":"Сообщи о запрете:","o":["Sorry, you can't park here.","Park wherever.","No rules exist."],"a":0},
  {"q":"Вежливо попроси место:","o":["Is it OK if I sit here?","This is mine now.","Move it."],"a":0},
 ],
 "wbmc":[
  {"q":"обыграть соперника = to ___ your opponent.","o":["beat","win","lose"],"a":0},
  {"q":"достижение = an ___ .","o":["achievement","agreement","argument"],"a":0},
  {"q":"усилие = ___ .","o":["effort","afford","offer"],"a":0},
 ],
 "wbgaps":[
  {"q":"You ___ (must not) be late for the final. (запрет, коротко)","a":["mustn't"]},
  {"q":"I've never seen ___ better goal in my life. (артикль)","a":["a"]},
  {"q":"She has broken the world ___ . (рекорд)","a":["record"]},
 ],
 "hw":r'''<b>Правила игры!</b> Напиши 5 правил своего любимого спорта или игры: два с <i>have to / must</i>, одно с <i>mustn't</i>, одно с <i>can</i>, одно с <i>don't have to</i>. Добавь предложение: <i>«It's the best/most … I've ever …»</i>.<br><br>
   Плюс пройди <a href="speakout-b1.html" style="color:#b06e12;font-weight:900;text-decoration:underline">тренажёр Unit 4</a> и пришли Асе скрин со счётом 🙂''',
})

# ===================== UNIT 5 · News =====================
DATA.append({
 "n":5, "title":"News", "emoji":"📰", "grad":("#7c2340","#c47a1e"),
 "desc":"Relative clauses · reported speech · рассказать новость · прогнозы will / might / going to",
 "grammar":[
  {"t":"1. Relative clauses — who / which / that / where / whose","h":r'''    <div class="g-ex">The journalist <b>who</b> wrote it is famous. <span class="ru">— о людях</span></div>
    <div class="g-ex">The story <b>which / that</b> went viral was fake. <span class="ru">— о вещах</span></div>
    <div class="g-ex">That's the town <b>where</b> it happened. · a blogger <b>whose</b> posts I follow.</div>'''},
  {"t":"2. Reported speech — пересказ","h":r'''    <table>
      <tr><th>Сказали</th><th>Пересказ</th></tr>
      <tr><td>"I <b>am</b> tired."</td><td>She said she <b>was</b> tired.</td></tr>
      <tr><td>"I <b>will</b> call."</td><td>He said he <b>would</b> call.</td></tr>
      <tr><td>"I <b>saw</b> it."</td><td>She said she <b>had seen</b> it.</td></tr>
    </table>
    <div class="g-ex"><b>tell</b> + кому: He <b>told me</b>… · <b>say</b> без адресата: He <b>said</b>…</div>'''},
  {"t":"3. Урок D — прогнозы: will / might / going to","h":r'''    <div class="g-ex"><b>will</b> — уверенный прогноз: Robots <b>will</b> read the news.</div>
    <div class="g-ex"><b>might</b> — возможно: It <b>might</b> rain tomorrow.</div>
    <div class="g-ex"><b>going to</b> — по признакам/плану: Prices <b>are going to</b> rise.</div>'''},
 ],
 "listen_title":"Have you heard?",
 "names":{"m":"Max","f":"Lena"},
 "dialog":[
  ["f","Have you heard the news? It's all over the internet!"],
  ["m","No, what happened?"],
  ["f","They said the old cinema is going to close next month."],
  ["m","Really? Who told you that?"],
  ["f","A journalist posted it. But honestly, it might just be a rumour."],
  ["m","Yeah, you can't trust everything that goes viral."],
  ["f","True. She said she would check the source and update the post."],
  ["m","Good. If it's reliable, it'll be very sad news for the town."],
 ],
 "lq":[
  {"q":"Where did Lena see the news?","o":["on TV","all over the internet","in a paper"],"a":1},
  {"q":"What is going to close?","o":["the old cinema","the school","the station"],"a":0},
  {"q":"Who posted the story?","o":["a teacher","a journalist","the mayor"],"a":1},
  {"q":"What might the news be?","o":["a joke","just a rumour","official"],"a":1},
  {"q":"What will the journalist do?","o":["delete it","check the source","ignore it"],"a":1},
 ],
 "ex":[
  {"q":"The man ___ lives next door is a reporter.","o":["who","which","where"],"a":0},
  {"q":"That's the café ___ we first met.","o":["who","which","where"],"a":2},
  {"q":"The article ___ went viral was fake.","o":["who","which","where"],"a":1},
  {"q":"She said she ___ tired. (reported)","o":["is","was","will be"],"a":1},
  {"q":"He said he ___ call me later.","o":["will","would","did"],"a":1},
  {"q":"Look at the sky — it ___ rain. (по признакам)","o":["will","is going to","might not"],"a":1},
  {"q":"Maybe I'm free — I ___ come to the party.","o":["will","might","am going to"],"a":1},
  {"q":"He ___ me that the shop was closed.","o":["said","told","says"],"a":1},
 ],
 "gaps":[
  {"q":"The blogger ___ posts I follow is very funny. (чей)","a":["whose"]},
  {"q":"She said she ___ (be) busy that day.","a":["was"]},
  {"q":"It ___ (may) snow tonight — прогноз с сомнением.","a":["might"]},
  {"q":"He told ___ that he was late. (кому)","a":["me"]},
 ],
 "howto_title":"📣 How to… рассказать и отреагировать на новость",
 "howto":r'''    <div class="g-ex"><b>Guess what!</b> / <b>You'll never believe this.</b> <span class="ru">— начать новость</span></div>
    <div class="g-ex"><b>Really? That's amazing!</b> <span class="ru">— радостная реакция</span></div>
    <div class="g-ex"><b>No way!</b> <span class="ru">— удивление</span></div>
    <div class="g-ex"><b>Oh no, that's terrible.</b> <span class="ru">— плохая новость</span></div>''',
 "fx":[
  {"q":"Сообщи хорошую новость:","o":["Guess what! I got the job!","News. Bye.","Nothing happened."],"a":0},
  {"q":"Отреагируй радостно:","o":["Really? That's amazing!","So what.","Boring."],"a":0},
  {"q":"Отреагируй на плохую новость:","o":["Oh no, that's terrible.","Great for me.","Who cares."],"a":0},
 ],
 "wbmc":[
  {"q":"заголовок = ___ .","o":["headline","headphone","heading"],"a":0},
  {"q":"стать вирусным = to go ___ .","o":["viral","wild","far"],"a":0},
  {"q":"надёжный источник = a ___ source.","o":["reliable","readable","likeable"],"a":0},
 ],
 "wbgaps":[
  {"q":"The house ___ burned down was empty. (для вещей)","a":["that","which"]},
  {"q":"They said they ___ (will) help us. (reported)","a":["would"]},
  {"q":"It's ___ news — everyone's talking about it! (срочные)","a":["breaking"]},
 ],
 "hw":r'''<b>Ты — репортёр!</b> Перескажи 3 новости, которые ты слышал(а) (<i>She said… / They told me…</i>). Потом напиши 3 прогноза на следующий год: один с <i>will</i>, один с <i>might</i>, один с <i>going to</i>.<br><br>
   Плюс пройди <a href="speakout-b1.html" style="color:#b06e12;font-weight:900;text-decoration:underline">тренажёр Unit 5</a> и пришли Асе скрин со счётом 🙂''',
})

# ===================== UNIT 6 · Creators =====================
DATA.append({
 "n":6, "title":"Creators", "emoji":"🎨", "grad":("#5e1a30","#e0952a"),
 "desc":"used to · сравнительная и превосходная степень · спросить/дать мнение · Present Perfect for/since",
 "grammar":[
  {"t":"1. used to — привычки в прошлом","h":r'''    <div class="g-ex">I <b>used to</b> draw every day. <span class="ru">— раньше, сейчас нет</span></div>
    <div class="g-ex">Вопрос/отрицание — <b>use to</b>: <b>Did</b> you <b>use to</b> paint? · I <b>didn't use to</b> like it.</div>'''},
  {"t":"2. Comparatives & superlatives","h":r'''    <table>
      <tr><th>Тип</th><th>Сравн.</th><th>Превосх.</th></tr>
      <tr><td>короткие (big)</td><td>bigger</td><td>the biggest</td></tr>
      <tr><td>длинные (famous)</td><td>more famous</td><td>the most famous</td></tr>
      <tr><td>исключения</td><td>better / worse</td><td>the best / the worst</td></tr>
    </table>
    <div class="g-ex"><b>Extreme adjectives:</b> not just big → <b>huge</b>; not just good → <b>amazing</b>.</div>'''},
  {"t":"3. Урок D — Present Perfect: for / since / yet / already / just","h":r'''    <div class="g-ex">I've lived here <b>for</b> five years / <b>since</b> 2019.</div>
    <div class="g-ex">Have you finished <b>yet</b>? — I've <b>just</b> finished. / I've <b>already</b> seen it.</div>'''},
 ],
 "listen_title":"At the gallery",
 "names":{"m":"Nick","f":"Ella"},
 "dialog":[
  ["f","What do you think of this painting, Nick?"],
  ["m","Honestly? I think it's the strangest thing I've ever seen."],
  ["f","Really? I love it. It's more creative than the others."],
  ["m","Hmm. I used to hate modern art, but this one is growing on me."],
  ["f","Have you seen the sculpture upstairs yet?"],
  ["m","Not yet. Is it good?"],
  ["f","It's amazing — the best piece in the whole exhibition, in my opinion."],
  ["m","OK, I've just decided: let's go and see it now."],
 ],
 "lq":[
  {"q":"What does Nick think of the painting?","o":["the strangest thing he's seen","boring","beautiful"],"a":0},
  {"q":"What does Ella think of it?","o":["she hates it","she loves it","she's not sure"],"a":1},
  {"q":"What did Nick use to feel about modern art?","o":["he used to love it","he used to hate it","he never cared"],"a":1},
  {"q":"Has Nick seen the sculpture?","o":["yes, already","not yet","he made it"],"a":1},
  {"q":"What does Ella say about the sculpture?","o":["it's the worst","the best in the exhibition","too small"],"a":1},
 ],
 "ex":[
  {"q":"I ___ play the piano when I was young.","o":["used to","use to","am used to"],"a":0},
  {"q":"___ you use to live here?","o":["Did","Do","Were"],"a":0},
  {"q":"This gallery is ___ than the other one. (big)","o":["biggest","bigger","more big"],"a":1},
  {"q":"She's the ___ artist in the city. (talented)","o":["more talented","most talented","talentedest"],"a":1},
  {"q":"It's not just good — it's ___ !","o":["big","amazing","nice"],"a":1},
  {"q":"I've lived here ___ 2018.","o":["for","since","ago"],"a":1},
  {"q":"Have you finished ___ ?","o":["already","yet","just"],"a":1},
  {"q":"I've ___ seen this film — twice!","o":["already","yet","since"],"a":0},
 ],
 "gaps":[
  {"q":"I ___ (use to) have long hair. (утвердит. форма)","a":["used to"]},
  {"q":"Everest is the ___ mountain in the world. (high)","a":["highest"]},
  {"q":"We've been friends ___ ten years.","a":["for"]},
  {"q":"I've ___ arrived — literally a minute ago.","a":["just"]},
 ],
 "howto_title":"💭 How to… спросить и высказать мнение",
 "howto":r'''    <div class="g-ex"><b>What do you think of…?</b> <span class="ru">— как тебе…?</span></div>
    <div class="g-ex"><b>In my opinion… / I reckon…</b> <span class="ru">— по-моему</span></div>
    <div class="g-ex"><b>I'm not sure about that.</b> <span class="ru">— мягкое несогласие</span></div>
    <div class="g-ex"><b>You've got a point.</b> <span class="ru">— тут ты прав(а)</span></div>''',
 "fx":[
  {"q":"Спроси мнение:","o":["What do you think of this design?","Design. Yes or no.","Say something."],"a":0},
  {"q":"Вырази мнение:","o":["In my opinion, it's brilliant.","It is what it is.","No comment forever."],"a":0},
  {"q":"Мягко не согласись:","o":["I'm not sure about that.","You're totally wrong.","Nonsense!"],"a":0},
 ],
 "wbmc":[
  {"q":"шедевр = a ___ .","o":["masterpiece","masterclass","mastermind"],"a":0},
  {"q":"талантливый = ___ .","o":["talented","talkative","tasty"],"a":0},
  {"q":"выставка = an ___ .","o":["exhibition","expedition","expression"],"a":0},
 ],
 "wbgaps":[
  {"q":"She ___ (use to) paint when she was a child. (утвердит.)","a":["used to"]},
  {"q":"This is the ___ (interesting) museum I've visited.","a":["most interesting"]},
  {"q":"Have you eaten ___ ? — No, not yet.","a":["yet"]},
 ],
 "hw":r'''<b>Тогда и сейчас.</b> Опиши, каким было место (или ты) раньше и сейчас: 3 предложения с <i>used to</i> и 2 сравнения (comparative/superlative). Добавь 3 фразы в Present Perfect с <i>for / since / just</i>.<br><br>
   Плюс пройди <a href="speakout-b1.html" style="color:#b06e12;font-weight:900;text-decoration:underline">тренажёр Unit 6</a> и пришли Асе скрин со счётом 🙂''',
})

# ===================== UNIT 7 · Travel =====================
DATA.append({
 "n":7, "title":"Travel", "emoji":"✈️", "grad":("#6a2038","#b5654a"),
 "desc":"1st & 2nd conditionals · quantifiers · рекомендации · reflexive pronouns",
 "grammar":[
  {"t":"1. Conditionals — 1st & 2nd","h":r'''    <div class="g-ex"><b>1st</b> (реально): If it <b>rains</b>, we<b>'ll stay</b> in. <span class="ru">— if + Present, will</span></div>
    <div class="g-ex"><b>2nd</b> (фантазия): If I <b>had</b> more money, I<b>'d travel</b> the world. <span class="ru">— if + Past, would</span></div>
    <div class="g-ex"><b>unless</b> = if not: We'll be late <b>unless</b> we hurry.</div>'''},
  {"t":"2. Quantifiers — сколько?","h":r'''    <table>
      <tr><th></th><th>Исчисляемые</th><th>Неисчисляемые</th></tr>
      <tr><td>много</td><td>many / How many?</td><td>much / How much?</td></tr>
      <tr><td>немного</td><td>a few</td><td>a little</td></tr>
    </table>
    <div class="g-ex"><b>some</b> (утв.) / <b>any</b> (вопр., отриц.) · <b>too much</b> luggage · <b>not enough</b> time</div>'''},
  {"t":"3. Урок D — reflexive pronouns","h":r'''    <div class="g-ex">myself, yourself, himself, herself, ourselves, themselves</div>
    <div class="g-ex">I did it <b>myself</b>. · <b>Enjoy yourself!</b> · <b>by myself</b> = один/одна</div>'''},
 ],
 "listen_title":"Planning a trip",
 "names":{"m":"Jack","f":"Rosa"},
 "dialog":[
  ["f","I'm so excited! If we save enough, we'll go to Portugal in June."],
  ["m","Nice! Have you booked the flights yet?"],
  ["f","Not yet. There aren't many cheap ones left, so we should hurry."],
  ["m","If I were you, I'd book today. Do you need any help packing?"],
  ["f","Thanks, but I can do it myself. I've made a list."],
  ["m","Good idea. Don't take too much luggage — trains have little space."],
  ["f","True. I'd recommend travelling light. It's worth seeing the old town too."],
  ["m","Definitely. Enjoy yourself — and send me a postcard!"],
 ],
 "lq":[
  {"q":"Where do they want to go?","o":["Portugal","Poland","Peru"],"a":0},
  {"q":"Has Rosa booked the flights?","o":["yes","not yet","she cancelled"],"a":1},
  {"q":"What does Jack advise?","o":["wait a month","book today","fly business"],"a":1},
  {"q":"Does Rosa need help packing?","o":["yes, a lot","no, she can do it herself","she won't pack"],"a":1},
  {"q":"What does Rosa recommend seeing?","o":["the beach","the old town","the airport"],"a":1},
 ],
 "ex":[
  {"q":"If it ___ tomorrow, we'll cancel the trip.","o":["rain","rains","will rain"],"a":1},
  {"q":"If I ___ rich, I'd travel forever. (2nd)","o":["am","were","will be"],"a":1},
  {"q":"We'll miss the train ___ we hurry.","o":["if","unless","when"],"a":1},
  {"q":"How ___ luggage do you have? (неисчисл.)","o":["many","much","few"],"a":1},
  {"q":"I have ___ euros left — just a few.","o":["a little","a few","much"],"a":1},
  {"q":"There isn't ___ water in the bottle.","o":["some","any","many"],"a":1},
  {"q":"You've got too ___ bags!","o":["much","many","enough"],"a":1},
  {"q":"We organised the whole trip ___ .","o":["myself","ourselves","yourself"],"a":1},
 ],
 "gaps":[
  {"q":"If I ___ (have) more time, I would learn Spanish. (2nd)","a":["had"]},
  {"q":"We won't get lost ___ we follow the map. (if not)","a":["unless"]},
  {"q":"I don't have ___ cash on me. (отриц.)","a":["any"]},
  {"q":"She travelled around Asia by ___ . (одна)","a":["herself"]},
 ],
 "howto_title":"🧭 How to… порекомендовать место",
 "howto":r'''    <div class="g-ex"><b>You should definitely visit…</b> <span class="ru">— обязательно сходи</span></div>
    <div class="g-ex"><b>It's (well) worth seeing…</b> <span class="ru">— стоит увидеть</span></div>
    <div class="g-ex"><b>I'd recommend…</b> <span class="ru">— я бы посоветовал(а)</span></div>
    <div class="g-ex"><b>Don't miss…</b> <span class="ru">— не пропусти</span></div>''',
 "fx":[
  {"q":"Порекомендуй место:","o":["You should definitely visit the old town.","Go nowhere.","Stay in the hotel."],"a":0},
  {"q":"Скажи, что стоит увидеть:","o":["It's worth seeing the castle at sunset.","The castle is a castle.","Skip everything."],"a":0},
  {"q":"Предупреди не пропустить:","o":["Don't miss the view from the hill.","Miss it, who cares.","Nothing to see."],"a":0},
 ],
 "wbmc":[
  {"q":"багаж = ___ .","o":["luggage","message","village"],"a":0},
  {"q":"забронировать = to ___ .","o":["book","pack","check"],"a":0},
  {"q":"за границу = ___ .","o":["abroad","aboard","around"],"a":0},
 ],
 "wbgaps":[
  {"q":"If we ___ (miss) the bus, we'll take a taxi. (1st)","a":["miss"]},
  {"q":"There are ___ few seats left — hurry! (немного)","a":["a"]},
  {"q":"Help ___ to some food! (себе, ед.ч.)","a":["yourself"]},
 ],
 "hw":r'''<b>Поездка мечты.</b> Спланируй путешествие: 2 предложения в 1st conditional (реальный план), 1 во 2nd conditional (мечта: «If I had…, I would…»), и 3 рекомендации (should / it's worth / I'd recommend).<br><br>
   Плюс пройди <a href="speakout-b1.html" style="color:#b06e12;font-weight:900;text-decoration:underline">тренажёр Unit 7</a> и пришли Асе скрин со счётом 🙂''',
})

# ===================== UNIT 8 · Know-how =====================
DATA.append({
 "n":8, "title":"Know-how", "emoji":"🛠️", "grad":("#7c2340","#8a4a1e"),
 "desc":"can / could / be able to · active & passive · описать проблему · -ing form",
 "grammar":[
  {"t":"1. Ability — can / could / be able to","h":r'''    <div class="g-ex"><b>Настоящее:</b> I <b>can</b> fix it. / I<b>'m able to</b> fix it.</div>
    <div class="g-ex"><b>Прошлое:</b> I <b>could</b> swim at five. / I <b>wasn't able to</b> open it.</div>
    <div class="g-ex"><b>Будущее/perfect:</b> I<b>'ll be able to</b> help. / I've never <b>been able to</b> draw.</div>'''},
  {"t":"2. Active & Passive","h":r'''    <table>
      <tr><th>Active</th><th>Passive</th></tr>
      <tr><td>They repair phones here.</td><td>Phones <b>are repaired</b> here.</td></tr>
      <tr><td>They fixed the bug.</td><td>The bug <b>was fixed</b>.</td></tr>
    </table>
    <div class="g-ex">Формула: <b>be + V3</b>. Кто делает — через <b>by</b>: It was made <b>by robots</b>.</div>'''},
  {"t":"3. Урок D — -ing form","h":r'''    <div class="g-ex"><b>Как подлежащее:</b> <b>Learning</b> to code is fun.</div>
    <div class="g-ex"><b>После предлогов:</b> good <b>at fixing</b> things · interested <b>in coding</b>.</div>
    <div class="g-ex"><b>После глаголов:</b> I enjoy <b>building</b> apps.</div>'''},
 ],
 "listen_title":"My laptop won't work",
 "names":{"m":"Ryan","f":"Kim"},
 "dialog":[
  ["f","Ryan, can you help me? My laptop isn't working."],
  ["m","Let me see. What's wrong with it?"],
  ["f","The screen is frozen and it won't switch on properly."],
  ["m","Have you tried charging it? The battery might be dead."],
  ["f","I plugged it in, but nothing happened."],
  ["m","Hmm. When was it last updated?"],
  ["f","I'm not sure. I've never been able to fix these things myself."],
  ["m","No worries. Fixing laptops is easy once you know how. Let's restart it."],
 ],
 "lq":[
  {"q":"What is Kim's problem?","o":["her phone is lost","her laptop isn't working","her wifi is slow"],"a":1},
  {"q":"What does Ryan tell her to check?","o":["the charging / battery","the mouse","the printer"],"a":0},
  {"q":"What happened when she plugged it in?","o":["it worked","nothing happened","it beeped"],"a":1},
  {"q":"Can Kim fix these things herself?","o":["yes, easily","no, she's never been able to","she never tries"],"a":1},
  {"q":"What does Ryan say about fixing laptops?","o":["it's impossible","it's easy once you know how","it's expensive"],"a":1},
 ],
 "ex":[
  {"q":"I ___ swim when I was four. (past ability)","o":["can","could","am able"],"a":1},
  {"q":"Sorry, I won't ___ to come tomorrow.","o":["can","be able","could"],"a":1},
  {"q":"This phone ___ in China. (passive)","o":["makes","is made","made"],"a":1},
  {"q":"The email ___ yesterday. (passive past)","o":["sent","was sent","is sent"],"a":1},
  {"q":"___ new languages is fun. (-ing подлежащее)","o":["Learn","Learning","To learning"],"a":1},
  {"q":"She's good ___ fixing computers.","o":["at","in","of"],"a":0},
  {"q":"I'm interested ___ coding.","o":["at","in","on"],"a":1},
  {"q":"The bridge ___ by engineers in 1990.","o":["built","was built","is built"],"a":1},
 ],
 "gaps":[
  {"q":"I've never been ___ to draw well. (ability)","a":["able"]},
  {"q":"Coffee ___ (grow) in Brazil. (passive present)","a":["is grown"]},
  {"q":"___ (repair) old radios is his hobby. (-ing подлежащее)","a":["repairing"]},
  {"q":"He's very good at ___ (solve) problems.","a":["solving"]},
 ],
 "howto_title":"🔧 How to… описать проблему",
 "howto":r'''    <div class="g-ex"><b>It's not working.</b> <span class="ru">— не работает</span></div>
    <div class="g-ex"><b>There's something wrong with…</b> <span class="ru">— что-то не так с…</span></div>
    <div class="g-ex"><b>It keeps crashing.</b> <span class="ru">— постоянно виснет</span></div>
    <div class="g-ex"><b>It won't turn on.</b> <span class="ru">— не включается</span></div>''',
 "fx":[
  {"q":"Опиши поломку:","o":["There's something wrong with my phone.","My phone is a phone.","Phones exist."],"a":0},
  {"q":"Скажи, что не включается:","o":["It won't turn on.","It turns on never maybe.","On off on off."],"a":0},
  {"q":"Пожалуйся, что виснет:","o":["It keeps crashing.","It crashes into walls.","Crash party!"],"a":0},
 ],
 "wbmc":[
  {"q":"зарядить = to ___ .","o":["charge","change","charity"],"a":0},
  {"q":"обновить = to ___ .","o":["update","upset","undo"],"a":0},
  {"q":"беспроводной = ___ .","o":["wireless","careless","useless"],"a":0},
 ],
 "wbgaps":[
  {"q":"I ___ (be able to) speak French now. (present, утв., кратко 'm)","a":["'m able to","am able to"]},
  {"q":"These cars ___ (make) in Germany. (passive present)","a":["are made"]},
  {"q":"I'm interested ___ learning to code. (предлог)","a":["in"]},
 ],
 "hw":r'''<b>Твой гаджет.</b> Опиши устройство, которым пользуешься: что оно умеет (can / be able to), как его делают или используют (passive: «It is made / used…»), и закончи предложением с -ing («Using it is…»).<br><br>
   Плюс пройди <a href="speakout-b1.html" style="color:#b06e12;font-weight:900;text-decoration:underline">тренажёр Unit 8</a> и пришли Асе скрин со счётом 🙂''',
})

# ===================== Слова юнитов (14 на юнит, лексика A–D) =====================
WORDS_BY_UNIT = {
 1:[["outgoing","общительный"],["shy","застенчивый"],["reliable","надёжный"],["generous","щедрый"],["stubborn","упрямый"],["to get on with","ладить с"],["colleague","коллега"],["acquaintance","знакомый"],["to introduce","представить, познакомить"],["polite","вежливый"],["sociable","компанейский"],["sense of humour","чувство юмора"],["to make friends","заводить друзей"],["talkative","разговорчивый"]],
 2:[["plot","сюжет"],["character","персонаж"],["ending","концовка"],["to happen","происходить"],["suddenly","вдруг"],["to realise","осознать"],["novel","роман"],["to describe","описывать"],["event","событие"],["meanwhile","тем временем"],["scary","страшный"],["review","рецензия, отзыв"],["based on","основан на"],["twist","поворот сюжета"]],
 3:[["to find out","узнать"],["to look for","искать"],["to give up","сдаться"],["to fill in","заполнить"],["to turn up","появиться"],["curious","любопытный"],["to wonder","интересоваться, гадать"],["survey","опрос"],["questionnaire","анкета"],["reply","ответ"],["downtown","центр города"],["direction","направление"],["on purpose","нарочно"],["to figure out","сообразить"]],
 4:[["to win","побеждать"],["to lose","проигрывать"],["champion","чемпион"],["medal","медаль"],["to train","тренироваться"],["competition","соревнование"],["to beat","обыграть"],["record","рекорд"],["effort","усилие"],["achievement","достижение"],["coach","тренер"],["victory","победа"],["teammate","товарищ по команде"],["to score","забить, набрать очки"]],
 5:[["headline","заголовок"],["journalist","журналист"],["to report","сообщать"],["breaking news","срочные новости"],["rumour","слух"],["to post","опубликовать"],["to share","делиться"],["viral","вирусный"],["reliable","надёжный"],["fake","фальшивый"],["to announce","объявлять"],["to spread","распространяться"],["update","обновление"],["source","источник"]],
 6:[["painting","картина"],["artist","художник"],["gallery","галерея"],["sculpture","скульптура"],["talented","талантливый"],["creative","творческий"],["masterpiece","шедевр"],["exhibition","выставка"],["to draw","рисовать"],["style","стиль"],["colourful","красочный"],["to design","создавать, проектировать"],["inspiration","вдохновение"],["to admire","восхищаться"]],
 7:[["journey","поездка, путь"],["flight","рейс, полёт"],["luggage","багаж"],["to book","бронировать"],["destination","пункт назначения"],["sightseeing","осмотр достопримечательностей"],["abroad","за границей"],["souvenir","сувенир"],["delay","задержка"],["to pack","паковать"],["currency","валюта"],["guidebook","путеводитель"],["backpack","рюкзак"],["to check in","зарегистрироваться"]],
 8:[["device","устройство"],["screen","экран"],["to charge","заряжать"],["to download","скачивать"],["to update","обновлять"],["gadget","гаджет"],["to plug in","подключить в розетку"],["battery","батарея"],["wireless","беспроводной"],["to fix","чинить"],["instructions","инструкция"],["button","кнопка"],["to switch on","включать"],["useful","полезный"]],
}
for _u in DATA:
    _u["words"] = WORDS_BY_UNIT[_u["n"]]
