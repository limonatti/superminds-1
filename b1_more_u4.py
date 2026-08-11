# -*- coding: utf-8 -*-
"""
Юнит 4 «Winners» — авторское расширение.

Сцена: Мия и Лео после финального матча, в раздевалке и по дороге домой.
Отсюда идут модальные глаголы (правила и советы), артикли и Present Perfect
со превосходной степенью.
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
LONG_DIALOG[4] = {
    "title": "Twenty minutes after the final",
    "names": {"m": "Leo", "f": "Mia"},
    "intro": "Матч закончился двадцать минут назад. Мия и Лео сидят в раздевалке. "
             "Слушай, где они говорят про обязанность, где про совет, а где про запрет — "
             "это три разных модальных глагола, и путать их дорого.",
    "lines": [
        ["f", "I still can't believe it. We actually won."],
        ["m", "Best game I've ever played. Did you see that last goal?"],
        ["f", "Everyone saw it, Leo. It's the only thing anyone's talking about."],
        ["m", "Good. I've waited four years for a goal like that."],
        ["f", "You have to thank the coach, though. Properly, not just a wave."],
        ["m", "I know, I know. She made us train in the rain all November."],
        ["f", "And she was right. We were the fittest team on that pitch tonight."],
        ["m", "Do we have to stay for the whole ceremony? I'm freezing."],
        ["f", "You don't have to stay for all of it, but you should get your medal."],
        ["m", "Fine. But I mustn't forget my bag this time — I lost a whole kit last year."],
        ["f", "That was the most expensive mistake of the season."],
        ["m", "Don't. My mum still mentions it."],
        ["f", "By the way, are we allowed to bring people to the club dinner?"],
        ["m", "One person each, I think. You should ask the coach, she knows the rules."],
        ["f", "I'll ask her when I thank her. Two birds."],
        ["m", "Smart. Hey — who was the referee tonight? He was excellent."],
        ["f", "No idea, but he was much better than the one we had in the semi-final."],
        ["m", "That man needed glasses. Or a different job."],
        ["f", "You mustn't say that in front of the coach, she'll give you a lecture."],
        ["m", "About fair play. I've heard it about forty times."],
        ["f", "Because you keep arguing with referees. You really should stop."],
        ["m", "I don't argue. I ask questions. Loudly."],
        ["f", "Leo. It's the worst habit you've got, and it will cost us a match one day."],
        ["m", "All right, all right. I'll work on it. Are you coming to training on Monday?"],
        ["f", "I have to. I've missed two sessions and the coach counts."],
        ["m", "She counts everything. She's the most organised person I've ever met."],
        ["f", "That's why we won. It wasn't the goal, Leo, it was November."],
        ["m", "You should put that on a poster."],
        ["f", "Come on. You mustn't be late for your own ceremony."],
    ],
    "questions": [
        {"q": "How does Leo describe the game?",
         "o": ["the best he has ever played", "the worst of the season", "an ordinary match"], "a": 0},
        {"q": "What does Mia say Leo has to do?",
         "o": ["thank the coach properly", "score another goal", "talk to the referee"], "a": 0},
        {"q": "Does Leo have to stay for the whole ceremony?",
         "o": ["yes, it's compulsory", "no, but he should collect his medal", "no, he can leave now"], "a": 1},
        {"q": "What did Leo lose last year?",
         "o": ["a medal", "a whole kit", "his phone"], "a": 1},
        {"q": "How many guests can they bring to the club dinner?",
         "o": ["as many as they like", "one each, he thinks", "none"], "a": 1},
        {"q": "What is Leo's worst habit, according to Mia?",
         "o": ["arriving late", "arguing with referees", "forgetting his bag"], "a": 1},
        {"q": "Why does Mia have to go to training on Monday?",
         "o": ["she has missed two sessions and the coach counts", "she wants to score", "the referee asked her"], "a": 0},
        {"q": "What does Mia say really won them the match?",
         "o": ["Leo's goal", "the referee", "training through November"], "a": 2},
    ],
}


# ============================================================
#   ПОДКАСТ
# ============================================================
PODCAST[4] = {
    "title": "Podcast: The medal I keep in a drawer",
    "voice": "f",
    "intro": "Монолог о победе, которая оказалась не той, о которой думали. "
             "Слушай модальные глаголы и превосходную степень.",
    "text": [
        "I have a medal in the kitchen drawer, under the batteries and the old keys. It is not the one people ask about.",
        "The one people ask about is on the wall. Regional champion, under-18. It is the shiniest thing in the flat and it took me four years.",
        "The one in the drawer is from a race I came fifth in, and it is the best thing I have ever won.",
        "Here is why. Six weeks before that race I tore a muscle, and the doctor said I mustn't run for a month.",
        "So for four weeks I swam. I hated every minute of it. You have to be a certain kind of person to enjoy swimming, and I am not that person.",
        "When I came back, my coach said something I still repeat to my own students. She said: you should stop asking whether you can win. You should ask whether you can finish.",
        "I finished fifth. Two people I had always beaten came second and third, and I was not even angry.",
        "I was not angry because for the first time I knew exactly what the result was made of. Every single week of it.",
        "The champion medal on the wall is the most impressive thing I own. The fifth-place medal in the drawer is the most honest.",
        "And if a student ever asks me which one they should want, I always say: the drawer. Always the drawer.",
    ],
    "questions": [
        {"q": "Where does she keep the medal she cares about most?",
         "o": ["on the wall", "in a kitchen drawer", "at her parents' house"], "a": 1},
        {"q": "What is the medal on the wall for?",
         "o": ["a marathon", "regional champion, under-18", "a school competition"], "a": 1},
        {"q": "What happened six weeks before the important race?",
         "o": ["she tore a muscle", "she changed coach", "she moved city"], "a": 0},
        {"q": "What did she do for four weeks?",
         "o": ["nothing", "she swam", "she ran shorter distances"], "a": 1},
        {"q": "What did her coach tell her to ask herself?",
         "o": ["whether she could win", "whether she could finish", "whether she should stop"], "a": 1},
        {"q": "How did she feel about coming fifth?",
         "o": ["furious", "not angry — she knew what the result was made of", "she doesn't say"], "a": 1},
        {"q": "Which medal does she recommend to students?",
         "o": ["the one on the wall", "the one in the drawer", "neither"], "a": 1},
    ],
}


# ============================================================
#   БОЛЬШОЙ ТЕКСТ
# ============================================================
LONG_READING[4] = {
    "title": "What losing teams do on Monday morning",
    "html": """
<p>Every sport has a story about a team that lost badly and came back stronger. The story is
almost always told the same way: someone gave a speech, everybody trained harder, and a year
later they won. It makes a good film. It is also, according to the coaches who actually do
this work, almost entirely wrong.</p>

<p>What separates teams that recover from teams that do not has very little to do with effort
in the week after a defeat. Nearly everybody trains harder that week. The difference shows up
about six weeks later, and it comes down to something much less dramatic: <b>what the team
decided the loss was about</b>.</p>

<p>Coaches call this the Monday conversation. If the conclusion is <i>we weren't good enough</i>,
almost nothing changes, because that sentence gives you nothing to do on Tuesday. If the
conclusion is <i>we lost every second ball in the last twenty minutes</i>, the team now has a
problem it can train. The first is a feeling. The second is a task.</p>

<p>The best coaches are famously boring about this. They do not talk about desire or heart.
They watch the recording, they find three specific things, and they say: these three, nothing
else, for the next month. Players often find it disappointing. They came in expecting a speech
and they got a list.</p>

<p>There is a second habit that matters just as much, and it is harder. Good teams are equally
specific after a <b>win</b>. Winning hides problems: a team can play badly for seventy minutes,
score once, and go home delighted. The teams that stay at the top are the ones who watch the
recording on Monday even when they won — and who are honest about the seventy minutes.</p>

<p>Which is why, if you ever want to know how a team will do next season, do not watch them
celebrate. Nobody has ever learned anything from a celebration. Watch what they do on the
Monday afterwards.</p>
""",
    "questions": [
        {"q": "What does the text say about the usual comeback story?",
         "o": ["it is accurate", "it makes a good film but is mostly wrong", "it only happens in football"], "a": 1},
        {"q": "When does the real difference between teams appear?",
         "o": ["the week after the loss", "about six weeks later", "the next day"], "a": 1},
        {"q": "What is the problem with 'we weren't good enough'?",
         "o": ["it is rude", "it gives you nothing to do on Tuesday", "it is not true"], "a": 1},
        {"q": "What do the best coaches do instead of giving a speech?",
         "o": ["they find three specific things to work on", "they change the team", "they cancel training"], "a": 0},
        {"q": "Why is winning dangerous, according to the text?",
         "o": ["players get tired", "winning hides problems", "the coach relaxes"], "a": 1},
        {"q": "What should you watch to predict a team's next season?",
         "o": ["the celebration", "the Monday afterwards", "the final match"], "a": 1},
        {"q": "How do players often react to the coach's list?",
         "o": ["they find it disappointing", "they are delighted", "they ignore it completely"], "a": 0},
    ],
}


# ============================================================
#   ДОПОЛНИТЕЛЬНАЯ ПРАКТИКА
# ============================================================
EXTRA_MC[4] = [
    {"q": "You ___ wear boots on this pitch — it's a rule.", "o": ["have to", "don't have to", "shouldn't"], "a": 0},
    {"q": "You ___ come if you're tired. It's optional.", "o": ["mustn't", "don't have to", "have to"], "a": 1},
    {"q": "You ___ argue with the referee. It's forbidden.", "o": ["don't have to", "mustn't", "should"], "a": 1},
    {"q": "I think you ___ apologise to the coach.", "o": ["should", "must not", "don't have to"], "a": 0},
    {"q": "She's ___ best player in the team.", "o": ["a", "the", "—"], "a": 1},
    {"q": "He scored ___ amazing goal in the last minute.", "o": ["a", "an", "the"], "a": 1},
    {"q": "I love ___ football, but I hate watching it on TV.", "o": ["a", "the", "—"], "a": 2},
    {"q": "It's the hardest match I've ___ played.", "o": ["never", "ever", "yet"], "a": 1},
    {"q": "This is the ___ team we've faced this year.", "o": ["good", "better", "best"], "a": 2},
    {"q": "We're ___ to bring one guest each.", "o": ["allowed", "allow", "allowing"], "a": 0},
]

EXTRA_GAP[4] = [
    {"q": "Do your ___ — that's all anyone can ask.", "a": ["best"]},
    {"q": "Don't give ___ , you're nearly there.", "a": ["up"]},
    {"q": "She beat the ___ by two seconds.", "a": ["record"]},
    {"q": "Well ___ ! That was a brilliant match.", "a": ["done"]},
    {"q": "Good ___ tomorrow — I'll be watching.", "a": ["luck"]},
    {"q": "It's the best game I've ___ seen.", "a": ["ever"]},
    {"q": "You're not ___ to touch the ball with your hands.", "a": ["allowed"]},
    {"q": "Fair ___ — they were simply better than us.", "a": ["play"]},
]


# ============================================================
#   ВЫВЕДИ ПРАВИЛО САМА
# ============================================================
DISCOVERY[4] = [
    {
        "for": 0,
        "title": "Заметь: обязан, не обязан и нельзя",
        "source": "Диалог «Twenty minutes after the final»",
        "lead": "В диалоге три очень похожие фразы, и все три значат разное. "
                "Русское «не должен» тут ловушка: перепутаешь — скажешь противоположное.",
        "examples": [
            {"t": "You **have to** thank the coach, though. Properly, not just a wave.", "who": "Mia"},
            {"t": "Do we **have to** stay for the whole ceremony?", "who": "Leo"},
            {"t": "You **don't have to** stay for all of it, but you **should** get your medal.", "who": "Mia"},
            {"t": "I **mustn't** forget my bag this time.", "who": "Leo"},
            {"t": "You **mustn't** say that in front of the coach.", "who": "Mia"},
            {"t": "Are we **allowed to** bring people to the club dinner?", "who": "Mia"},
        ],
        "steps": [
            {"q": "«You don't have to stay» — Лео обязан остаться?",
             "o": ["да, обязан", "нет, но может, если хочет", "нет, и ему запрещено"],
             "a": 1,
             "why": "don't have to = нет необходимости. Хочешь — оставайся, никто не заставляет."},
            {"q": "«You mustn't say that» — а тут?",
             "o": ["не обязательно говорить", "нельзя, запрещено", "лучше сказать"],
             "a": 1,
             "why": "mustn't = запрет. Это НЕ то же самое, что don't have to."},
            {"q": "Мия говорит «you should get your medal». Это правило или совет?",
             "o": ["правило", "совет", "запрет"],
             "a": 1,
             "why": "should — совет, личное мнение. Никто не накажет, если не пойдёшь."},
            {"q": "«We have to train on Monday» — откуда идёт обязанность?",
             "o": ["изнутри, я сам так решил", "снаружи: правило, тренер, расписание", "это просьба"],
             "a": 1,
             "why": "have to — обязанность из внешних обстоятельств. must чаще про внутреннее решение."},
            {"q": "Где ошибка: «You don't have to argue with the referee, it's forbidden»?",
             "o": ["нужно mustn't argue", "нужно should argue", "ошибки нет"],
             "a": 0,
             "why": "Запрет = mustn't. don't have to сказало бы «можешь спорить, но не обязан»."},
        ],
        "rule": "<b>have to</b> — обязан, правило снаружи: <i>I have to train on Monday.</i> "
                "<b>don't have to</b> — <u>не обязан</u>, но можно: <i>You don't have to stay.</i> "
                "<b>mustn't</b> — <u>нельзя</u>, запрет: <i>You mustn't argue with the referee.</i> "
                "<b>should</b> — совет: <i>You should apologise.</i> "
                "<b>be allowed to</b> — разрешено: <i>Are we allowed to bring a guest?</i> "
                "Главная ловушка: don't have to ≠ mustn't. Одно — свобода, другое — запрет.",
    },
    {
        "for": 1,
        "title": "Заметь: a, an, the или вообще ничего",
        "source": "Диалог и подкаст",
        "lead": "Артикли не выучиваются списком. Посмотри, когда герои говорят «a», когда «the», "
                "а когда не говорят ничего.",
        "examples": [
            {"t": "I've waited four years for **a goal** like that.", "who": "Leo"},
            {"t": "We were **the fittest team** on that pitch tonight.", "who": "Mia"},
            {"t": "Who was **the referee** tonight?", "who": "Leo"},
            {"t": "He was much better than **the one** we had in the semi-final.", "who": "Mia"},
            {"t": "I love — **football**, but I hate watching it on TV.", "who": "Практика"},
            {"t": "It is **the shiniest thing** in the flat.", "who": "Подкаст"},
        ],
        "steps": [
            {"q": "«a goal like that» — Лео говорит про конкретный гол?",
             "o": ["да, про тот самый", "нет, про любой такой гол", "про все голы сразу"],
             "a": 1,
             "why": "a / an — один из многих, слушатель не знает, о каком именно."},
            {"q": "«the referee tonight» — почему the?",
             "o": ["потому что оба знают, о каком судье речь — он был один",
                   "потому что судья важный",
                   "потому что слово начинается на r"],
             "a": 0,
             "why": "the — когда собеседник понимает, о каком именно предмете речь."},
            {"q": "Почему «the fittest team», а не «a fittest team»?",
             "o": ["со превосходной степенью всегда the", "можно и так и так", "потому что команда одна"],
             "a": 0,
             "why": "the best, the fittest, the most organised — превосходная степень всегда с the."},
            {"q": "«I love football» — почему нет артикля?",
             "o": ["забыли", "спорт и абстрактные понятия в общем смысле идут без артикля", "football — имя собственное"],
             "a": 1,
             "why": "I love music / football / coffee — вообще, в целом. Без артикля."},
            {"q": "«He scored ___ amazing goal». Что вставить?",
             "o": ["a", "an", "the"],
             "a": 1,
             "why": "an перед звуком гласной: an amazing goal, an hour. Смотри на звук, а не на букву."},
        ],
        "rule": "<b>a / an</b> — один из многих, впервые: <i>a goal, an amazing match.</i> "
                "an ставим перед звуком гласной. "
                "<b>the</b> — оба понимают, о чём речь; единственный в своём роде; "
                "со превосходной степенью: <i>the referee, the best player.</i> "
                "<b>ничего</b> — множественное число или неисчисляемое в общем смысле: "
                "<i>I love football. Players train hard.</i>",
    },
    {
        "for": 2,
        "title": "Заметь: «лучшее, что я когда-либо…»",
        "source": "Диалог и подкаст",
        "lead": "Одна конструкция, которая звучит по-английски и сразу поднимает уровень речи. "
                "Найди её в примерах — она встречается пять раз.",
        "examples": [
            {"t": "Best game I**'ve ever played**!", "who": "Leo"},
            {"t": "That was **the most expensive mistake** of the season.", "who": "Mia"},
            {"t": "It's **the worst habit** you**'ve got**.", "who": "Mia"},
            {"t": "She's **the most organised person** I**'ve ever met**.", "who": "Leo"},
            {"t": "It is **the best thing** I **have ever won**.", "who": "Подкаст"},
            {"t": "The champion medal on the wall is **the most impressive thing** I **own**.", "who": "Подкаст"},
        ],
        "steps": [
            {"q": "Какая схема повторяется во всех примерах?",
             "o": ["the + превосходная степень + I've ever + 3-я форма",
                   "the + сравнительная степень + will",
                   "a + прилагательное + Past Simple"],
             "a": 0,
             "why": "the best game I've ever played, the worst film I've ever seen — универсальный шаблон."},
            {"q": "Почему тут Present Perfect, а не Past Simple?",
             "o": ["потому что речь про весь опыт до сегодняшнего дня",
                   "потому что это вежливее",
                   "потому что игра была вчера"],
             "a": 0,
             "why": "«за всю жизнь до сих пор» — это всегда Present Perfect."},
            {"q": "Как сказать «худший фильм, который я видела»?",
             "o": ["the worst film I ever saw", "the worst film I've ever seen", "worst film I have ever see"],
             "a": 1,
             "why": "the + worst + I've ever + seen."},
            {"q": "«most» ставим ко всем прилагательным?",
             "o": ["да, всегда", "нет: к коротким добавляем -est (fittest, best), к длинным ставим most", "нет, most не используется"],
             "a": 1,
             "why": "fit → the fittest, good → the best, organised → the most organised."},
            {"q": "Где ошибка: «It's the most best day of my life»?",
             "o": ["most лишнее — best уже превосходная степень", "нужно the most good", "ошибки нет"],
             "a": 0,
             "why": "best — уже превосходная степень. Дважды её не делают."},
        ],
        "rule": "Шаблон: <b>the + превосходная степень + (that) I've ever + 3-я форма</b>. "
                "<i>The best game I've ever played. The worst film I've ever seen.</i> "
                "Короткие прилагательные: -est (the fittest, the fastest). "
                "Длинные: the most (the most organised, the most impressive). "
                "Исключения: good → the best, bad → the worst, far → the furthest.",
    },
]


# ============================================================
#   ОТРАБОТКА
# ============================================================
GRAM_PRACTICE[4] = [
    {
        "for": 0,
        "title": "Отработка · обязан, не обязан, нельзя",
        "lead": "Каждый раз спрашивай себя: это правило, свобода или запрет?",
        "mc": [
            {"q": "You ___ wear a helmet — it's the law.", "o": ["have to", "don't have to", "shouldn't"], "a": 0},
            {"q": "It's Sunday, so I ___ get up early.", "o": ["mustn't", "don't have to", "have to"], "a": 1},
            {"q": "You ___ touch that — it's dangerous.", "o": ["don't have to", "mustn't", "should"], "a": 1},
            {"q": "You look exhausted. You ___ take a break.", "o": ["should", "mustn't", "don't have to"], "a": 0},
            {"q": "___ we bring our own boots?", "o": ["Do have to", "Do we have to", "Have we to"], "a": 1},
            {"q": "Players ___ argue with the referee.", "o": ["don't have to", "mustn't", "aren't have to"], "a": 1},
            {"q": "The entrance is free, so you ___ pay.", "o": ["mustn't", "don't have to", "shouldn't"], "a": 1},
            {"q": "We're not ___ to use phones during training.", "o": ["allow", "allowed", "allowing"], "a": 1},
            {"q": "I think she ___ speak to the coach about it.", "o": ["should", "must not", "doesn't have to"], "a": 0},
            {"q": "You ___ be late for the ceremony — it starts on time.", "o": ["don't have to", "mustn't", "aren't"], "a": 1},
            {"q": "He ___ train yesterday because he was ill.", "o": ["mustn't", "didn't have to", "shouldn't"], "a": 1},
            {"q": "Everyone ___ sign the form before the match.", "o": ["has to", "have to", "must to"], "a": 0},
        ],
        "gaps": [
            {"q": "You ___ (не обязан) come if you're busy.", "a": ["don't have to"]},
            {"q": "You ___ (нельзя) smoke in the stadium.", "a": ["mustn't", "must not"]},
            {"q": "I ___ (обязан) be there at eight.", "a": ["have to"]},
            {"q": "You ___ (совет) apologise to her.", "a": ["should"]},
            {"q": "Are we ___ to bring a guest?", "a": ["allowed"]},
            {"q": "She ___ (обязана) train twice a day.", "a": ["has to"]},
        ],
    },
    {
        "for": 1,
        "title": "Отработка · артикли",
        "lead": "Три варианта: a / an, the или ничего. Ставь прочерк, если артикль не нужен.",
        "mc": [
            {"q": "She's ___ fastest runner in the club.", "o": ["a", "the", "—"], "a": 1},
            {"q": "He scored ___ incredible goal.", "o": ["a", "an", "the"], "a": 1},
            {"q": "I don't like ___ tennis.", "o": ["a", "the", "—"], "a": 2},
            {"q": "Have you seen ___ coach? I need to talk to her.", "o": ["a", "the", "—"], "a": 1},
            {"q": "We stayed in ___ hotel near the stadium.", "o": ["a", "the", "—"], "a": 0},
            {"q": "___ hotel was terrible, by the way.", "o": ["A", "The", "—"], "a": 1},
            {"q": "He waited ___ hour for the bus.", "o": ["a", "an", "the"], "a": 1},
            {"q": "___ players train every morning.", "o": ["A", "The", "—"], "a": 2},
            {"q": "It was ___ best decision of my life.", "o": ["a", "an", "the"], "a": 2},
            {"q": "She wants to be ___ doctor.", "o": ["a", "the", "—"], "a": 0},
        ],
        "gaps": [
            {"q": "It was ___ amazing match. (артикль)", "a": ["an"]},
            {"q": "She's ___ best player we've got.", "a": ["the"]},
            {"q": "I love ___ music. (если артикль не нужен, напиши -)", "a": ["-", "—"]},
            {"q": "He's ___ teacher at our school.", "a": ["a"]},
            {"q": "Where's ___ referee?", "a": ["the"]},
        ],
    },
    {
        "for": 2,
        "title": "Отработка · the best I've ever…",
        "lead": "Один шаблон, десять предложений. Собери его правильно.",
        "mc": [
            {"q": "It's the best film I ___ .", "o": ["ever saw", "have ever seen", "was ever seeing"], "a": 1},
            {"q": "That's the ___ mistake I've ever made.", "o": ["worse", "worst", "baddest"], "a": 1},
            {"q": "She's the ___ person I've ever worked with.", "o": ["most organised", "more organised", "organisedest"], "a": 0},
            {"q": "It's the ___ book I've ever read.", "o": ["most good", "best", "goodest"], "a": 1},
            {"q": "This is the ___ I've ever been.", "o": ["happier", "happiest", "most happy"], "a": 1},
            {"q": "He's the ___ player on the team.", "o": ["fittest", "most fit", "fitter"], "a": 0},
            {"q": "It was the most exciting match I've ___ watched.", "o": ["never", "ever", "yet"], "a": 1},
            {"q": "That's the ___ thing anyone has ever said to me.", "o": ["kindest", "most kind", "kinder"], "a": 0},
            {"q": "It's the ___ expensive ticket I've ever bought.", "o": ["more", "most", "much"], "a": 1},
            {"q": "This is the ___ I've ever run.", "o": ["furthest", "further", "most far"], "a": 0},
        ],
        "gaps": [
            {"q": "It's the best game I've ___ played.", "a": ["ever"]},
            {"q": "She's the ___ (organised) person I know.", "a": ["most organised"]},
            {"q": "That was the ___ (bad) decision of my life.", "a": ["worst"]},
            {"q": "This is the ___ (good) coffee I've ever had.", "a": ["best"]},
            {"q": "He's the ___ (fast) runner in the club.", "a": ["fastest"]},
        ],
    },
]


# ============================================================
#   ДОМАШНЕЕ ЗАДАНИЕ
# ============================================================
HOMEWORK[4] = {
    "intro": "Домашка на материале юнита: слова про спорт и победы, три правила, "
             "которые ты вывела сама.",
    "parts": [
        {
            "title": "Домашка 1 · Слова и выражения юнита",
            "lead": "Двадцать слов из урока в новых предложениях.",
            "mc": [
                {"q": "The person who trains the team is the ___ .", "o": ["referee", "coach", "fan"], "a": 1},
                {"q": "The person who controls the match is the ___ .", "o": ["referee", "coach", "opponent"], "a": 0},
                {"q": "The team you play against is your ___ .", "o": ["teammate", "opponent", "champion"], "a": 1},
                {"q": "She won gold — she's the ___ .", "o": ["fan", "champion", "referee"], "a": 1},
                {"q": "He ran faster than anyone before and broke the ___ .", "o": ["record", "medal", "effort"], "a": 0},
                {"q": "It took a lot of ___ , but we did it.", "o": ["effort", "victory", "fan"], "a": 0},
                {"q": "Finishing that race was her greatest ___ .", "o": ["achievement", "opponent", "stadium"], "a": 0},
                {"q": "We ___ them 3–0 in the final.", "o": ["beat", "lost", "trained"], "a": 0},
                {"q": "He ___ two goals in ten minutes.", "o": ["scored", "beat", "trained"], "a": 0},
                {"q": "Forty thousand people filled the ___ .", "o": ["stadium", "entrance", "record"], "a": 0},
                {"q": "After the win, we went out to ___ .", "o": ["celebrate", "train", "lose"], "a": 0},
                {"q": "That referee was completely ___ — no favourites.", "o": ["fair", "boring", "scary"], "a": 0},
            ],
            "gaps": [
                {"q": "Just do your ___ — nobody expects more.", "a": ["best"]},
                {"q": "Well ___ ! You were brilliant out there.", "a": ["done"]},
                {"q": "Good ___ tomorrow!", "a": ["luck"]},
                {"q": "Don't give ___ now.", "a": ["up"]},
                {"q": "Fair ___ — they deserved to win.", "a": ["play"]},
                {"q": "It's the best I've ___ felt after a match.", "a": ["ever"]},
            ],
        },
        {
            "title": "Домашка 2 · Модальные глаголы",
            "lead": "Первое правило: обязан, не обязан, нельзя, стоит.",
            "mc": [
                {"q": "You ___ show your ticket at the entrance — it's a rule.", "o": ["have to", "don't have to", "shouldn't"], "a": 0},
                {"q": "The bus is free, so you ___ buy a ticket.", "o": ["mustn't", "don't have to", "shouldn't"], "a": 1},
                {"q": "You ___ take photos in this museum. It's forbidden.", "o": ["don't have to", "mustn't", "needn't"], "a": 1},
                {"q": "You're tired. You ___ go to bed.", "o": ["should", "mustn't", "don't have to"], "a": 0},
                {"q": "___ I have to fill in this form?", "o": ["Do", "Am", "Have"], "a": 0},
                {"q": "Children ___ play near the road.", "o": ["don't have to", "mustn't", "aren't have to"], "a": 1},
                {"q": "We ___ leave early yesterday — the meeting was cancelled.", "o": ["didn't have to", "mustn't", "hadn't to"], "a": 0},
                {"q": "Everyone ___ wear the team shirt.", "o": ["has to", "have to", "must to"], "a": 0},
                {"q": "Are we ___ to bring food?", "o": ["allow", "allowed", "allowing"], "a": 1},
                {"q": "You ___ tell her — it's a surprise.", "o": ["mustn't", "don't have to", "needn't"], "a": 0},
            ],
            "gaps": [
                {"q": "You ___ (нельзя) park here.", "a": ["mustn't", "must not"]},
                {"q": "You ___ (не обязан) wait for me.", "a": ["don't have to"]},
                {"q": "I ___ (обязан) work on Saturday.", "a": ["have to"]},
                {"q": "She ___ (обязана) leave at six.", "a": ["has to"]},
                {"q": "You ___ (совет) see a doctor.", "a": ["should"]},
                {"q": "We aren't ___ to use phones here.", "a": ["allowed"]},
            ],
        },
        {
            "title": "Домашка 3 · Артикли и превосходная степень",
            "lead": "Второе и третье правила вместе.",
            "mc": [
                {"q": "It was ___ best day of my life.", "o": ["a", "the", "—"], "a": 1},
                {"q": "He bought ___ new pair of boots.", "o": ["a", "an", "the"], "a": 0},
                {"q": "I don't really like ___ sport.", "o": ["a", "the", "—"], "a": 2},
                {"q": "___ coach wants to see you.", "o": ["A", "The", "—"], "a": 1},
                {"q": "It took ___ hour to get there.", "o": ["a", "an", "the"], "a": 1},
                {"q": "She's the ___ person I've ever met.", "o": ["most kind", "kindest", "kinder"], "a": 1},
                {"q": "That's the ___ film I've ever seen.", "o": ["worse", "worst", "baddest"], "a": 1},
                {"q": "This is the ___ I've ever been.", "o": ["most fit", "fittest", "fitter"], "a": 1},
                {"q": "He's ___ engineer.", "o": ["a", "an", "the"], "a": 1},
                {"q": "It's the ___ interesting book on the shelf.", "o": ["more", "most", "much"], "a": 1},
                {"q": "___ people were shouting from the stands.", "o": ["A", "The", "—"], "a": 2},
                {"q": "She's the ___ organised person in the office.", "o": ["more", "most", "much"], "a": 1},
            ],
            "gaps": [
                {"q": "It was ___ (артикль) amazing evening.", "a": ["an"]},
                {"q": "She's ___ best in the class.", "a": ["the"]},
                {"q": "It's the ___ (good) thing I've ever done.", "a": ["best"]},
                {"q": "That was the ___ (bad) match of the season.", "a": ["worst"]},
                {"q": "He's the ___ (fast) player we have.", "a": ["fastest"]},
                {"q": "I've never seen ___ (артикль) better goal.", "a": ["a"]},
            ],
        },
    ],
    "write": {
        "title": "Домашка 4 · Напиши сама",
        "lead": "Три письменных задания.",
        "tasks": [
            "Напиши правила для своей воображаемой команды — 6 пунктов. "
            "Два с have to, два с mustn't, два с don't have to. "
            "Проверь себя: mustn't и don't have to должны значить разное.",
            "Опиши свою самую большую победу — 8–10 предложений. "
            "Используй хотя бы три раза шаблон «the best / worst / hardest … I've ever …».",
            "Прочитай ещё раз текст про понедельник после проигрыша и напиши "
            "5 предложений: что ты сама делаешь после неудачи. Начни с «I usually…» "
            "и добавь один совет с should.",
        ],
    },
}
