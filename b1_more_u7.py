# -*- coding: utf-8 -*-
"""
Юнит 7 «Travel» — авторское расширение.

Сцена: Роза и Джек собирают чемодан за день до вылета в Португалию.
Отсюда идут первый и второй conditionals, quantifiers и возвратные местоимения.
"""

LONG_DIALOG = {}
PODCAST = {}
LONG_READING = {}
EXTRA_MC = {}
EXTRA_GAP = {}
DISCOVERY = {}
GRAM_PRACTICE = {}
HOMEWORK = {}


# ============================================================
#   ДЛИННЫЙ ДИАЛОГ
# ============================================================
LONG_DIALOG[7] = {
    "title": "The night before the flight",
    "names": {"m": "Jack", "f": "Rosa"},
    "intro": "Вечер накануне вылета. Роза складывает вещи, Джек даёт советы, "
             "которых у него не просили. Слушай условные предложения — их здесь много, "
             "и они разные.",
    "lines": [
        ["f", "If I take this jacket, I won't have room for the boots."],
        ["m", "Then don't take the boots. It's Portugal in June."],
        ["f", "It rains in Portugal in June."],
        ["m", "A little. Not enough for boots."],
        ["f", "If it rains and I've got no boots, I'll be furious with you."],
        ["m", "That's fair. Have you checked in yet?"],
        ["f", "Not yet. I'll do it myself in the morning."],
        ["m", "Do it tonight. If you check in now, you'll get a better seat."],
        ["f", "There aren't many seats left anyway. It's a full flight."],
        ["m", "All the more reason. How much luggage are you taking?"],
        ["f", "One backpack. I've decided to travel light for once."],
        ["m", "You said that last year and you took three bags."],
        ["f", "Last year was different. There was a wedding."],
        ["m", "If I were you, I'd leave the guidebook. Everything's on your phone."],
        ["f", "And if my phone dies? Then what?"],
        ["m", "Fair point. Take a few pages, not the whole book."],
        ["f", "I can't tear up a book, Jack. I'm not a monster."],
        ["m", "Have you got much cash? The currency's euros, remember."],
        ["f", "A little. I'll get some more at the airport if I have time."],
        ["m", "Don't. The airport rate is terrible. If I had time tomorrow, I'd go to the bank for you."],
        ["f", "You haven't got time. You're working."],
        ["m", "I know, that's why I said if. Right — passport?"],
        ["f", "In the front pocket. I checked it three times myself."],
        ["m", "Boarding pass?"],
        ["f", "On the phone. Which will die, apparently, and then I'll get lost and starve."],
        ["m", "You won't get lost. If you get lost, ask somebody. That's how everyone finds anything."],
        ["f", "I hate asking. I'd rather work it out myself."],
        ["m", "If everyone thought like that, nobody would ever find the old town."],
        ["f", "The old town's worth seeing, they say."],
        ["m", "It is. And if you go early, there aren't many tourists yet."],
        ["f", "Right. Bag's done. Have I forgotten anything?"],
        ["m", "Only one thing. Enjoy yourself. You always forget that one."],
    ],
    "questions": [
        {"q": "Why doesn't Rosa want to leave the boots?",
         "o": ["they're new", "she thinks it rains in Portugal in June", "they're heavy"], "a": 1},
        {"q": "Why does Jack tell her to check in tonight?",
         "o": ["she'll get a better seat", "the flight leaves earlier", "it's cheaper"], "a": 0},
        {"q": "How much luggage is Rosa taking?",
         "o": ["three bags", "one backpack", "a suitcase and a bag"], "a": 1},
        {"q": "What does Jack advise about the guidebook?",
         "o": ["take the whole book", "leave it — everything's on the phone", "buy a new one"], "a": 1},
        {"q": "Why shouldn't she change money at the airport?",
         "o": ["it's closed", "the rate is terrible", "they don't take euros"], "a": 1},
        {"q": "Where is her passport?",
         "o": ["in the front pocket", "on her phone", "still at the bank"], "a": 0},
        {"q": "What does Jack say to do if she gets lost?",
         "o": ["call him", "ask somebody", "go back to the hotel"], "a": 1},
        {"q": "What is the one thing Rosa always forgets?",
         "o": ["her passport", "to enjoy herself", "sunscreen"], "a": 1},
    ],
}


# ============================================================
#   ПОДКАСТ
# ============================================================
PODCAST[7] = {
    "title": "Podcast: The trip I took by myself and nearly cancelled",
    "voice": "f",
    "intro": "Монолог про первую поездку в одиночку. Слушай условные предложения "
             "и возвратные местоимения.",
    "text": [
        "The first time I travelled abroad by myself I was twenty-six, which is late, and I nearly cancelled it four times.",
        "Everyone I knew had done this at nineteen with a backpack and very little money. I had a job and no excuse.",
        "If I am honest, what frightened me was not the country. It was eating dinner alone in a restaurant where nobody knew me.",
        "I booked ten days in a small town on the coast, and for the first two of them I behaved like a coward.",
        "I bought food in shops and ate it in the room. I told myself I was saving money, which was not true, because I had already paid for the accommodation.",
        "On the third evening I made myself walk into a restaurant and sit down. It took about eleven minutes to stop feeling ridiculous.",
        "By the fifth day I had a table I liked and the waiter had stopped bringing me the English menu, which felt like a medal.",
        "If I had gone with a friend, none of that would have happened. I would have had a lovely week and learnt nothing.",
        "I am not saying everyone should travel alone. If you hate it, you hate it, and there is no prize for suffering.",
        "But if you have been telling yourself for years that you would go somewhere by yourself one day, book something small. Ten days. One town. That is all it takes.",
    ],
    "questions": [
        {"q": "How old was she on her first solo trip?",
         "o": ["nineteen", "twenty-six", "thirty"], "a": 1},
        {"q": "What frightened her most?",
         "o": ["the language", "eating dinner alone in a restaurant", "flying"], "a": 1},
        {"q": "What did she do for the first two days?",
         "o": ["bought food and ate in her room", "went sightseeing", "stayed at the airport"], "a": 0},
        {"q": "Why does she say 'saving money' wasn't true?",
         "o": ["food was expensive", "she had already paid for the accommodation", "she had lost her card"], "a": 1},
        {"q": "What happened by the fifth day?",
         "o": ["she went home", "the waiter stopped bringing the English menu", "she made ten friends"], "a": 1},
        {"q": "What does she say about going with a friend?",
         "o": ["she would have had a lovely week and learnt nothing",
               "it would have been better", "she will never do it"], "a": 0},
        {"q": "What is her advice?",
         "o": ["everyone must travel alone", "book something small — ten days, one town",
               "wait until you're older"], "a": 1},
    ],
}


# ============================================================
#   БОЛЬШОЙ ТЕКСТ
# ============================================================
LONG_READING[7] = {
    "title": "Why we always pack too much",
    "html": """
<p>Ask any group of travellers what they would change about their last trip and one answer
comes back more often than all the others put together: <i>I took too much</i>. It happens to
people who have travelled for thirty years. It happens to people who packed carefully the night
before with a list. Something about a suitcase makes sensible adults behave strangely.</p>

<p>The explanation is not laziness. It is that packing is a form of <b>guessing about a person
who does not exist yet</b> — the version of you who will be standing in another country in nine
days' time. You do not know what that person will want, so you protect her from every possible
weather, every possible dinner, every possible invitation. Six shirts for a four-day trip is
not stupidity. It is anxiety, folded neatly.</p>

<p>Experienced travellers have a rule that sounds harsh and works. If you would not use it
twice, it stays at home. Not <i>might</i> use — <b>would</b> use, twice. The rule kills the
"just in case" objects, and "just in case" is where the weight lives: the second pair of shoes,
the heavy guidebook, the jumper for a cold evening that never comes.</p>

<p>The second rule is about geography rather than luggage. Almost everything you are frightened
of forgetting can be bought where you are going. Toothpaste exists in Portugal. Socks exist in
Portugal. The only items that genuinely cannot be replaced are documents, medication and the
charger for something unusual — and that list is short enough to check in ten seconds at the
door.</p>

<p>What actually changes people's packing, though, is neither rule. It is a single bad trip
where they carried a heavy bag up a hill in the sun, and made a promise to themselves at the
top. Nobody travels light because they read an article. They travel light because they
remember the hill.</p>
""",
    "questions": [
        {"q": "What do most travellers say they'd change?",
         "o": ["they took too much", "they didn't stay long enough", "they spent too much money"], "a": 0},
        {"q": "How does the text explain over-packing?",
         "o": ["laziness", "guessing about a version of you that doesn't exist yet", "bad suitcases"], "a": 1},
        {"q": "What is 'six shirts for a four-day trip' described as?",
         "o": ["stupidity", "anxiety, folded neatly", "good planning"], "a": 1},
        {"q": "What is the experienced travellers' rule?",
         "o": ["if you wouldn't use it twice, leave it", "take one bag only", "never take shoes"], "a": 0},
        {"q": "Where does the weight live, according to the text?",
         "o": ["in clothes", "in 'just in case' objects", "in the suitcase itself"], "a": 1},
        {"q": "Which items genuinely can't be replaced?",
         "o": ["documents, medication and unusual chargers", "shoes and jumpers", "toothpaste and socks"], "a": 0},
        {"q": "What actually changes how people pack?",
         "o": ["reading an article", "remembering carrying a heavy bag up a hill", "buying a lighter bag"], "a": 1},
    ],
}


# ============================================================
#   ДОПОЛНИТЕЛЬНАЯ ПРАКТИКА
# ============================================================
EXTRA_MC[7] = [
    {"q": "If it ___ tomorrow, we'll stay in.", "o": ["rains", "will rain", "rained"], "a": 0},
    {"q": "If I ___ you, I'd book today.", "o": ["am", "were", "will be"], "a": 1},
    {"q": "If we save enough, we ___ to Portugal.", "o": ["go", "'ll go", "went"], "a": 1},
    {"q": "If I had more money, I ___ travel more.", "o": ["will", "would", "won't"], "a": 1},
    {"q": "There aren't ___ cheap flights left.", "o": ["much", "many", "a little"], "a": 1},
    {"q": "How ___ luggage are you taking?", "o": ["much", "many", "few"], "a": 0},
    {"q": "Trains have ___ space for big suitcases.", "o": ["little", "few", "many"], "a": 0},
    {"q": "I've got ___ euros, but not many.", "o": ["a few", "few", "much"], "a": 0},
    {"q": "I can do it ___ , thanks.", "o": ["myself", "me", "mine"], "a": 0},
    {"q": "Enjoy ___ on holiday!", "o": ["you", "yourself", "yours"], "a": 1},
]

EXTRA_GAP[7] = [
    {"q": "I need to book a ___ to Lisbon.", "a": ["flight"]},
    {"q": "We have to check ___ two hours before.", "a": ["in"]},
    {"q": "Don't worry if you get ___ — just ask someone.", "a": ["lost"]},
    {"q": "The old town is worth ___ .", "a": ["seeing"]},
    {"q": "I'd ___ the little café by the river.", "a": ["recommend"]},
    {"q": "One backpack only — I'm travelling ___ .", "a": ["light"]},
    {"q": "That village is really off the beaten ___ .", "a": ["track"]},
    {"q": "I went there by ___ , with no one else.", "a": ["myself"]},
]


# ============================================================
#   ВЫВЕДИ ПРАВИЛО САМА
# ============================================================
DISCOVERY[7] = [
    {
        "for": 0,
        "title": "Заметь: два разных «если»",
        "source": "Диалог «The night before the flight»",
        "lead": "В диалоге условных предложений много, но они делятся на два типа. "
                "Сравни, как меняется глагол во второй половине.",
        "examples": [
            {"t": "If I **take** this jacket, I **won't have** room for the boots.", "who": "Rosa"},
            {"t": "If you **check in** now, you**'ll get** a better seat.", "who": "Jack"},
            {"t": "If it **rains** and I've got no boots, I**'ll be** furious with you.", "who": "Rosa"},
            {"t": "If I **were** you, I**'d leave** the guidebook.", "who": "Jack"},
            {"t": "If I **had** time tomorrow, I**'d go** to the bank for you.", "who": "Jack"},
            {"t": "If everyone **thought** like that, nobody **would** ever **find** the old town.", "who": "Jack"},
        ],
        "steps": [
            {"q": "«If you check in now, you'll get a better seat». Это реально?",
             "o": ["да, вполне может случиться", "нет, это фантазия", "это уже случилось"],
             "a": 0,
             "why": "Первый тип: реальное условие в будущем. If + Present Simple, вторая часть — will."},
            {"q": "«If I were you, I'd leave the guidebook». Джек может стать Розой?",
             "o": ["да", "нет, это воображаемая ситуация", "иногда"],
             "a": 1,
             "why": "Второй тип: нереальное или маловероятное. If + Past Simple, вторая часть — would."},
            {"q": "Почему «If I were you», а не «If I was you»?",
             "o": ["в этой конструкции традиционно were для всех лиц",
                   "это ошибка",
                   "потому что you во множественном числе"],
             "a": 0,
             "why": "If I were you — устойчивая форма совета. В разговоре встречается и was, но were считается правильнее."},
            {"q": "Почему Джек говорит «If I had time tomorrow», хотя времени у него нет?",
             "o": ["именно поэтому — он подчёркивает, что это невозможно",
                   "он ошибся",
                   "у него есть время"],
             "a": 0,
             "why": "Он сам объясняет: «that's why I said if». Второй тип показывает, что условие не выполняется."},
            {"q": "Какое предложение правильное?",
             "o": ["If it will rain, we'll stay in.",
                   "If it rains, we'll stay in.",
                   "If it rains, we stay in tomorrow."],
             "a": 1,
             "why": "После if в первом типе — Present Simple, will не ставим."},
        ],
        "rule": "<b>Первый тип (реально):</b> If + Present Simple, … will / won't. "
                "<i>If you check in now, you'll get a better seat.</i> "
                "<b>Второй тип (воображаемо):</b> If + Past Simple, … would / wouldn't. "
                "<i>If I had time, I'd go to the bank. If I were you, I'd book today.</i> "
                "После <b>if</b> никогда не ставим will. "
                "Части можно менять местами — тогда запятая не нужна: "
                "<i>I'll be furious if it rains.</i>",
    },
    {
        "for": 1,
        "title": "Заметь: сколько именно",
        "source": "Диалог",
        "lead": "Слов «много» и «мало» в английском по два, и выбор зависит от того, "
                "можно ли предмет посчитать.",
        "examples": [
            {"t": "There aren't **many** cheap ones left.", "who": "Rosa"},
            {"t": "How **much** luggage are you taking?", "who": "Jack"},
            {"t": "Trains have **little** space.", "who": "Jack"},
            {"t": "Have you got **much** cash?", "who": "Jack"},
            {"t": "**A little**. I'll get some more at the airport.", "who": "Rosa"},
            {"t": "Take **a few** pages, not the whole book.", "who": "Jack"},
        ],
        "steps": [
            {"q": "«many cheap ones» и «much luggage». Отчего зависит выбор?",
             "o": ["many — с тем, что считается, much — с тем, что не считается",
                   "many — в вопросах, much — в утверждениях",
                   "разницы нет"],
             "a": 0,
             "why": "many flights, many seats (штуки). much luggage, much money, much time (не штуки)."},
            {"q": "«a little» и «little». В чём разница?",
             "o": ["a little — немного, но есть. little — почти нет, и это плохо",
                   "они одинаковы",
                   "a little — больше, чем little в два раза"],
             "a": 0,
             "why": "I've got a little money = немного есть, нормально. I've got little money = почти ничего, проблема."},
            {"q": "Роза говорит «A little» про наличные. Это хорошо или плохо?",
             "o": ["хорошо — какие-то деньги есть", "плохо — денег нет", "непонятно"],
             "a": 0,
             "why": "a little — положительный оттенок. Поэтому дальше она спокойно говорит «I'll get some more»."},
            {"q": "Как сказать «немного страниц»?",
             "o": ["a little pages", "a few pages", "much pages"],
             "a": 1,
             "why": "Страницы считаются → a few. a little — только с неисчисляемым."},
            {"q": "Что подходит и к считаемому, и к несчитаемому?",
             "o": ["much", "many", "a lot of / some"],
             "a": 2,
             "why": "a lot of money, a lot of flights. some money, some flights. Универсальные."},
        ],
        "rule": "<b>Считается</b> (flights, seats, pages): many, a few, few, a lot of. "
                "<b>Не считается</b> (luggage, money, time, space): much, a little, little, a lot of. "
                "<b>a few / a little</b> — немного, и это нормально. "
                "<b>few / little</b> — почти нет, и это проблема. "
                "much и many чаще в вопросах и отрицаниях; в утверждении обычно a lot of.",
    },
    {
        "for": 2,
        "title": "Заметь: сам, сама, себя",
        "source": "Диалог и подкаст",
        "lead": "Возвратные местоимения делают две разные работы. Найди обе в примерах.",
        "examples": [
            {"t": "I'll do it **myself** in the morning.", "who": "Rosa"},
            {"t": "I checked it three times **myself**.", "who": "Rosa"},
            {"t": "I'd rather work it out **myself**.", "who": "Rosa"},
            {"t": "Enjoy **yourself**. You always forget that one.", "who": "Jack"},
            {"t": "I made **myself** walk into a restaurant.", "who": "Подкаст"},
            {"t": "The first time I travelled abroad **by myself**…", "who": "Подкаст"},
        ],
        "steps": [
            {"q": "«I'll do it myself» — зачем здесь myself?",
             "o": ["чтобы подчеркнуть: сама, без чужой помощи",
                   "потому что так вежливее",
                   "это обязательная часть глагола do"],
             "a": 0,
             "why": "Усиление: сама, лично. Можно убрать — смысл останется, но пропадёт нажим."},
            {"q": "«I made myself walk into a restaurant» — а тут?",
             "o": ["усиление", "действие направлено на себя: заставила саму себя", "ошибка"],
             "a": 1,
             "why": "Вторая работа: подлежащее и дополнение — один человек. I hurt myself. She taught herself."},
            {"q": "«by myself» значит…",
             "o": ["рядом со мной", "одна, без компании", "своими руками"],
             "a": 1,
             "why": "by myself = alone. I went by myself = поехала одна."},
            {"q": "Как сказать «они помогли друг другу»?",
             "o": ["They helped themselves.", "They helped each other.", "They helped theirselves."],
             "a": 1,
             "why": "themselves = каждый сам себе. each other = друг другу. Разные вещи."},
            {"q": "Какая форма правильная для «мы»?",
             "o": ["ourself", "ourselves", "usselves"],
             "a": 1,
             "why": "myself, yourself, himself, herself, itself, ourselves, yourselves, themselves."},
        ],
        "rule": "Формы: <i>myself, yourself, himself, herself, itself, ourselves, yourselves, themselves.</i> "
                "<b>Работа первая — усиление:</b> <i>I'll do it myself</i> (сама, без помощи). "
                "<b>Работа вторая — действие на себя:</b> <i>I made myself go. She hurt herself.</i> "
                "<b>by myself</b> = одна, без компании. "
                "Не путать с <b>each other</b> — друг друга: <i>They helped each other.</i>",
    },
]


# ============================================================
#   ОТРАБОТКА
# ============================================================
GRAM_PRACTICE[7] = [
    {
        "for": 0,
        "title": "Отработка · первый и второй conditional",
        "lead": "Реально — Present + will. Воображаемо — Past + would. После if — никогда will.",
        "mc": [
            {"q": "If it ___ , we'll stay at home.", "o": ["rains", "will rain", "rained"], "a": 0},
            {"q": "If I ___ rich, I'd buy a house by the sea.", "o": ["am", "were", "will be"], "a": 1},
            {"q": "If you hurry, you ___ catch the train.", "o": ["catch", "'ll", "caught"], "a": 1},
            {"q": "If I had a car, I ___ drive you.", "o": ["will", "would", "won't"], "a": 1},
            {"q": "If I ___ you, I'd apologise.", "o": ["was being", "were", "am"], "a": 1},
            {"q": "She'll be angry if you ___ late.", "o": ["are", "will be", "were"], "a": 0},
            {"q": "If we ___ enough money, we'd travel more.", "o": ["have", "had", "will have"], "a": 1},
            {"q": "What ___ you do if you lost your passport?", "o": ["will", "would", "did"], "a": 1},
            {"q": "If the flight ___ delayed, we'll miss the connection.", "o": ["is", "will be", "were"], "a": 0},
            {"q": "If everyone thought like that, nobody ___ ever try.", "o": ["will", "would", "won't"], "a": 1},
            {"q": "I'd go with you if I ___ time.", "o": ["have", "had", "will have"], "a": 1},
            {"q": "If you ___ lost, ask somebody.", "o": ["get", "will get", "got"], "a": 0},
        ],
        "gaps": [
            {"q": "If it ___ (rain), we'll take a taxi.", "a": ["rains"]},
            {"q": "If I ___ (be) you, I'd book now.", "a": ["were", "was"]},
            {"q": "If we save enough, we ___ (go) to Portugal.", "a": ["'ll go", "will go"]},
            {"q": "If she had more time, she ___ (travel) more.", "a": ["would travel", "'d travel"]},
            {"q": "You'll miss the flight if you ___ (not hurry).", "a": ["don't hurry"]},
            {"q": "What would you do if you ___ (lose) your bag?", "a": ["lost"]},
        ],
    },
    {
        "for": 1,
        "title": "Отработка · сколько",
        "lead": "Сначала реши: это можно посчитать или нет?",
        "mc": [
            {"q": "How ___ money have you got?", "o": ["much", "many", "few"], "a": 0},
            {"q": "There aren't ___ people here today.", "o": ["much", "many", "little"], "a": 1},
            {"q": "I've got ___ time — about ten minutes.", "o": ["a few", "a little", "many"], "a": 1},
            {"q": "She has ___ friends in the city — only two.", "o": ["a few", "much", "little"], "a": 0},
            {"q": "There's ___ space in this bag.", "o": ["few", "little", "many"], "a": 1},
            {"q": "How ___ bags are you taking?", "o": ["much", "many", "little"], "a": 1},
            {"q": "We had ___ of fun.", "o": ["a lot", "many", "much"], "a": 0},
            {"q": "I don't have ___ luggage.", "o": ["many", "much", "few"], "a": 1},
            {"q": "Take ___ pages, not the whole book.", "o": ["a little", "a few", "much"], "a": 1},
            {"q": "He speaks ___ English — almost none.", "o": ["a little", "little", "few"], "a": 1},
        ],
        "gaps": [
            {"q": "How ___ does it cost?", "a": ["much"]},
            {"q": "There aren't ___ seats left.", "a": ["many"]},
            {"q": "I've got ___ (немного, и это нормально) cash.", "a": ["a little"]},
            {"q": "She has ___ (немного, и это нормально) friends here.", "a": ["a few"]},
            {"q": "There's very ___ space in the car.", "a": ["little"]},
        ],
    },
    {
        "for": 2,
        "title": "Отработка · сам, себя, друг друга",
        "lead": "Проверь: усиление, действие на себя или взаимность?",
        "mc": [
            {"q": "I can carry it ___ , thanks.", "o": ["myself", "me", "mine"], "a": 0},
            {"q": "Enjoy ___ at the party!", "o": ["you", "yourself", "yours"], "a": 1},
            {"q": "She taught ___ to play the guitar.", "o": ["her", "herself", "hers"], "a": 1},
            {"q": "They looked at ___ in the mirror.", "o": ["themselves", "theirselves", "them"], "a": 0},
            {"q": "We built the shed ___ .", "o": ["ourself", "ourselves", "us"], "a": 1},
            {"q": "He hurt ___ playing football.", "o": ["him", "himself", "his"], "a": 1},
            {"q": "The children helped ___ — one held the ladder, one climbed.", "o": ["themselves", "each other", "theirselves"], "a": 1},
            {"q": "I went to Rome by ___ .", "o": ["me", "myself", "mine"], "a": 1},
            {"q": "Did you make this cake ___ ?", "o": ["yourself", "you", "yours"], "a": 0},
            {"q": "The door opened ___ .", "o": ["it", "itself", "its"], "a": 1},
        ],
        "gaps": [
            {"q": "I'll do it ___ (сама).", "a": ["myself"]},
            {"q": "Enjoy ___ ! (тебе)", "a": ["yourself"]},
            {"q": "She cut ___ with a knife.", "a": ["herself"]},
            {"q": "We painted the room ___ .", "a": ["ourselves"]},
            {"q": "They write to ___ every week. (друг другу)", "a": ["each other"]},
        ],
    },
]


# ============================================================
#   ДОМАШНЕЕ ЗАДАНИЕ
# ============================================================
HOMEWORK[7] = {
    "intro": "Домашка на материале юнита: слова про поездки, три правила, "
             "которые ты вывела сама.",
    "parts": [
        {
            "title": "Домашка 1 · Слова и выражения юнита",
            "lead": "Двадцать слов из урока в новых предложениях.",
            "mc": [
                {"q": "The bags you take with you are your ___ .", "o": ["luggage", "currency", "journey"], "a": 0},
                {"q": "The place you're travelling to is your ___ .", "o": ["destination", "delay", "journey"], "a": 0},
                {"q": "The plane is two hours late — there's a ___ .", "o": ["delay", "flight", "journey"], "a": 0},
                {"q": "You show this at passport control: your ___ .", "o": ["passport", "guidebook", "souvenir"], "a": 0},
                {"q": "You need this to get on the plane: a ___ .", "o": ["boarding pass", "souvenir", "backpack"], "a": 0},
                {"q": "The money used in a country is its ___ .", "o": ["currency", "ticket", "luggage"], "a": 0},
                {"q": "A small gift you bring home is a ___ .", "o": ["souvenir", "guidebook", "backpack"], "a": 0},
                {"q": "Walking around and seeing famous places is ___ .", "o": ["sightseeing", "packing", "sunbathing"], "a": 0},
                {"q": "A hotel or flat where you stay is your ___ .", "o": ["accommodation", "destination", "journey"], "a": 0},
                {"q": "She's travelling ___ for the first time.", "o": ["abroad", "nearby", "downtown"], "a": 0},
                {"q": "Don't forget to ___ your bag tonight.", "o": ["pack", "book", "check"], "a": 0},
                {"q": "I need a ___ ticket, not a one-way.", "o": ["return", "boarding", "single"], "a": 0},
            ],
            "gaps": [
                {"q": "I need to book a ___ to Lisbon.", "a": ["flight"]},
                {"q": "We check ___ two hours before departure.", "a": ["in"]},
                {"q": "If you get ___ , just ask someone.", "a": ["lost"]},
                {"q": "The castle is worth ___ .", "a": ["seeing"]},
                {"q": "I'd ___ the small café by the river.", "a": ["recommend"]},
                {"q": "One bag only — I'm travelling ___ .", "a": ["light"]},
            ],
        },
        {
            "title": "Домашка 2 · Условные предложения",
            "lead": "Первое правило. Помни: после if — никогда will.",
            "mc": [
                {"q": "If you ___ early, there won't be many tourists.", "o": ["go", "will go", "went"], "a": 0},
                {"q": "If I ___ you, I'd take the earlier flight.", "o": ["am", "were", "will be"], "a": 1},
                {"q": "We'll miss the train if we ___ now.", "o": ["don't leave", "won't leave", "didn't leave"], "a": 0},
                {"q": "If she had more holiday, she ___ stay a month.", "o": ["will", "would", "won't"], "a": 1},
                {"q": "What ___ you do if the flight was cancelled?", "o": ["will", "would", "did"], "a": 1},
                {"q": "If it ___ , the beach will be empty.", "o": ["rains", "will rain", "rained"], "a": 0},
                {"q": "If I ___ a million, I'd travel for a year.", "o": ["have", "had", "will have"], "a": 1},
                {"q": "He'll be annoyed if you ___ him.", "o": ["don't tell", "won't tell", "didn't tell"], "a": 0},
                {"q": "If everyone drove less, the air ___ be cleaner.", "o": ["will", "would", "won't"], "a": 1},
                {"q": "If you ___ your passport, tell the police.", "o": ["lose", "will lose", "lost"], "a": 0},
            ],
            "gaps": [
                {"q": "If it ___ (be) sunny, we'll walk.", "a": ["is"]},
                {"q": "If I ___ (be) you, I'd stay another day.", "a": ["were", "was"]},
                {"q": "She ___ (come) if you ask her.", "a": ["'ll come", "will come"]},
                {"q": "If we had a car, we ___ (drive) to the coast.", "a": ["would drive", "'d drive"]},
                {"q": "You'll get lost if you ___ (not take) a map.", "a": ["don't take"]},
                {"q": "What would you do if you ___ (miss) the flight?", "a": ["missed"]},
            ],
        },
        {
            "title": "Домашка 3 · Сколько и возвратные местоимения",
            "lead": "Второе и третье правила вместе.",
            "mc": [
                {"q": "How ___ time have we got?", "o": ["much", "many", "few"], "a": 0},
                {"q": "There weren't ___ tourists in the old town.", "o": ["much", "many", "little"], "a": 1},
                {"q": "I've got ___ euros left — about twenty.", "o": ["a little", "a few", "much"], "a": 1},
                {"q": "There's very ___ room in this suitcase.", "o": ["few", "little", "many"], "a": 1},
                {"q": "We had ___ of rain that week.", "o": ["a lot", "many", "much"], "a": 0},
                {"q": "I don't have ___ luggage — just a backpack.", "o": ["many", "much", "few"], "a": 1},
                {"q": "I booked the whole trip ___ .", "o": ["myself", "me", "mine"], "a": 0},
                {"q": "Enjoy ___ in Portugal!", "o": ["you", "yourself", "yours"], "a": 1},
                {"q": "She travelled by ___ for the first time.", "o": ["her", "herself", "hers"], "a": 1},
                {"q": "They sent postcards to ___ every summer.", "o": ["themselves", "each other", "theirselves"], "a": 1},
                {"q": "We cooked dinner ___ .", "o": ["ourself", "ourselves", "us"], "a": 1},
                {"q": "He taught ___ Portuguese in six months.", "o": ["him", "himself", "his"], "a": 1},
            ],
            "gaps": [
                {"q": "How ___ does the ticket cost?", "a": ["much"]},
                {"q": "There aren't ___ flights on Sunday.", "a": ["many"]},
                {"q": "I've got ___ (немного) cash on me.", "a": ["a little"]},
                {"q": "She has ___ (немного) friends there.", "a": ["a few"]},
                {"q": "I'll carry it ___ (сама).", "a": ["myself"]},
                {"q": "They help ___ (друг другу) a lot.", "a": ["each other"]},
            ],
        },
    ],
    "write": {
        "title": "Домашка 4 · Напиши сама",
        "lead": "Три письменных задания.",
        "tasks": [
            "Напиши шесть советов человеку, который впервые едет в твой родной город. "
            "Три с первым conditional (If you go early, you'll…) и три со вторым "
            "(If I were you, I'd…). Проверь, что после if нигде нет will.",
            "Опиши свою последнюю поездку — 8–10 предложений. "
            "Используй минимум четыре слова про количество: much, many, a few, a little, little. "
            "Подчеркни их и рядом напиши, считается предмет или нет.",
            "Напиши 5 предложений с возвратными местоимениями о себе: "
            "два на усиление (I did it myself), два на действие на себя (I taught myself…) "
            "и одно с by myself.",
        ],
    },
}
