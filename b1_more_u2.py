# -*- coding: utf-8 -*-
"""
Юнит 2 «Tale tellers» — авторское расширение той же глубины, что и первый юнит.

Всё держится на одной сцене: Том рассказывает Эми историю про ночь без света.
Из этого диалога потом берутся примеры для выведения правил, отработки и домашки —
ученица работает с одним и тем же материалом, а не с разрозненными предложениями.

Подхватывается автоматически: b1_more.py подмешивает эти словари к своим.
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
LONG_DIALOG[2] = {
    "title": "The night the lights went out",
    "names": {"m": "Tom", "f": "Amy"},
    "intro": "Том рассказывает Эми историю из своего прошлого. Слушай, как он двигает "
             "рассказ: что-то шло фоном, что-то случилось вдруг, а что-то произошло ещё раньше. "
             "Эти три слоя времени и есть narrative tenses.",
    "lines": [
        ["f", "You've gone very quiet, Tom. What are you thinking about?"],
        ["m", "Sorry. I was remembering something that happened to me about ten years ago."],
        ["f", "Oh, a story! Go on, I love a good story."],
        ["m", "You'll laugh. It sounds like a fairy tale, but every word of it is true."],
        ["f", "Even better. Once upon a time…"],
        ["m", "Once upon a time I was house-sitting for my aunt. Big old place, middle of nowhere."],
        ["f", "Already scary. Go on."],
        ["m", "It was raining hard that night and I was watching a film in the living room."],
        ["f", "What film?"],
        ["m", "Something boring based on a novel I'd never read. I don't even remember the plot."],
        ["f", "Meanwhile, outside…"],
        ["m", "Meanwhile, outside, the wind was getting worse. And then all of a sudden the lights went out."],
        ["f", "The whole house?"],
        ["m", "The whole street, it turned out. But I didn't know that yet."],
        ["f", "So what did you do?"],
        ["m", "I sat there for a minute. Then I realised I had left my phone upstairs."],
        ["f", "Of course you had."],
        ["m", "So I went up in the dark. And halfway up the stairs I heard someone breathing."],
        ["f", "No. Tom, no. I haven't heard a proper ghost story since school."],
        ["m", "I froze. I hadn't locked the front door — I'd forgotten completely."],
        ["f", "This is the worst thing I've ever heard."],
        ["m", "I stood there for about thirty seconds. Longest thirty seconds of my life."],
        ["f", "And? Who was it? Don't describe it, just tell me!"],
        ["m", "It was my aunt. She had come back two days early and hadn't wanted to wake me."],
        ["f", "That's the twist? Your aunt?"],
        ["m", "That's the twist. No villain, no hero. Just a very confused woman with a torch."],
        ["f", "I've watched horror films with better endings than that."],
        ["m", "You asked for a story. Nobody promised you an exciting one."],
        ["f", "In the end it's still a good story. I've been telling worse ones for years."],
        ["m", "Have you ever had anything like that happen to you?"],
        ["f", "Once. But mine has a proper ending, and it takes two hours to tell."],
    ],
    "questions": [
        {"q": "Where was Tom that night?",
         "o": ["at his own flat", "house-sitting for his aunt", "at a friend's party"], "a": 1},
        {"q": "What was he doing when the lights went out?",
         "o": ["watching a film", "reading a novel", "sleeping"], "a": 0},
        {"q": "Why did he have to go upstairs?",
         "o": ["he heard his aunt", "he had left his phone there", "he wanted to lock the door"], "a": 1},
        {"q": "Why hadn't he locked the front door?",
         "o": ["his aunt had asked him not to", "he had simply forgotten", "the lock was broken"], "a": 1},
        {"q": "Who was breathing on the stairs?",
         "o": ["the cat", "a burglar", "his aunt"], "a": 2},
        {"q": "Why had his aunt come back?",
         "o": ["she came back two days early", "she had forgotten her keys", "the story doesn't say"], "a": 0},
        {"q": "What does Amy think of the ending?",
         "o": ["she loved it", "she thinks horror films end better", "she was too scared to answer"], "a": 1},
        {"q": "How long was Tom standing frozen on the stairs?",
         "o": ["about thirty seconds", "about ten minutes", "two days"], "a": 0},
    ],
}


# ============================================================
#   ПОДКАСТ
# ============================================================
PODCAST[2] = {
    "title": "Podcast: The story my grandmother never finished",
    "voice": "f",
    "intro": "Монолог одним голосом. Слушай целиком, а потом ещё раз — по предложению. "
             "Обрати внимание, где рассказчица уходит на шаг назад в прошлое.",
    "text": [
        "My grandmother was the best storyteller I have ever met, and she never wrote a single word down.",
        "Every Sunday she made tea, sat in the same chair by the window and started a story. Sometimes it was a fairy tale. Sometimes it was something that had really happened to her before the war.",
        "There was one story she told more often than the others. It took place in a small village where she had grown up, and it began the same way every time: a girl was walking home in the dark and she saw a light in a house where nobody lived.",
        "While the girl was walking towards the light, the door opened. And that is exactly where my grandmother always stopped.",
        "She stopped because my mother called us for dinner, or because the phone rang, or because she suddenly remembered that the cat had not been fed. I am almost certain she stopped on purpose.",
        "For about six years I asked her how it ended. She smiled and said the same thing: next Sunday, my love.",
        "Then one winter she got ill, and by the spring she had died, and the story died with her. I have never found out what was inside that house.",
        "For a long time I was angry about it. A story without an ending felt like a broken promise.",
        "But I have changed my mind since then. I think she knew something that I did not know at nine years old: that the part you invent yourself is the part you remember.",
        "So now, when I tell that story to my own daughter, I stop in exactly the same place. And she is furious. And that is how I know it is working.",
    ],
    "questions": [
        {"q": "How often did the grandmother tell stories?",
         "o": ["every evening", "every Sunday", "only on holidays"], "a": 1},
        {"q": "Where did the favourite story take place?",
         "o": ["in the village where she had grown up", "in the city", "in a forest abroad"], "a": 0},
        {"q": "What did the girl in the story see?",
         "o": ["a light in an empty house", "a stranger on the road", "her own house on fire"], "a": 0},
        {"q": "Why did the grandmother always stop at the same point?",
         "o": ["she forgot the ending", "the narrator thinks she stopped on purpose", "the story really had no ending"], "a": 1},
        {"q": "Did the narrator ever learn the ending?",
         "o": ["yes, her mother told her", "no, she has never found out", "yes, she read it in a book"], "a": 1},
        {"q": "How does the narrator feel about it now?",
         "o": ["still angry", "she has changed her mind", "she has forgotten the story"], "a": 1},
        {"q": "What does she do with her own daughter?",
         "o": ["she tells the full ending", "she stops in the same place", "she refuses to tell the story"], "a": 1},
    ],
}


# ============================================================
#   БОЛЬШОЙ ТЕКСТ
# ============================================================
LONG_READING[2] = {
    "title": "Why a good twist changes everything",
    "html": """
<p>Think of the last film that really surprised you. Not the one with the biggest explosions —
the one where, about twenty minutes before the end, something small was said and suddenly the
whole story looked different. That moment has a name: <b>a plot twist</b>. And a good one does
something strange to your memory.</p>

<p>Researchers who study reading have noticed the same thing again and again. When a twist works,
people do not just feel surprised. They immediately go backwards. They start rebuilding every
earlier scene with the new information, and they enjoy that rebuilding almost more than the twist
itself. In other words, the pleasure is not in being tricked. It is in <b>discovering that the
answer had been in front of you the whole time</b>.</p>

<p>That is why a fair twist and a cheap twist feel so different. A fair twist has been prepared.
The writer has left small, quiet clues — a character who never eats, a photograph nobody
mentions, a door that had already been locked. When you go back, the clues are all there.
A cheap twist simply arrives. Nothing prepared it, so there is nothing to rebuild, and the story
feels like a trick rather than a story.</p>

<p>Storytellers have known this for a very long time. Fairy tales are full of promises that are
kept much later: the youngest brother who was laughed at in the first line turns out to be the
hero in the last one. Nobody in the village believed him — and the listener remembers that,
because it was said early and casually.</p>

<p>There is a practical side to all of this if you are learning a language. Stories with a twist
are unusually good material, because a twist forces you to re-read. You have already met the
vocabulary once, so the second reading is faster and easier, and you are re-reading for a reason
that actually interests you — not because a teacher told you to. Since I started choosing short
stories with strong endings instead of graded texts about the weather, my students have finished
far more of them.</p>

<p>One warning, though. A twist is not the same as an ending. Plenty of films have a brilliant
twist and then simply stop, and you leave the cinema feeling slightly cheated. The twist changes
what you understand. The ending decides what it meant. A story really needs both — and the second
one is much harder to write.</p>
""",
    "questions": [
        {"q": "According to the text, what do people do when a twist works?",
         "o": ["they immediately rebuild the earlier scenes in their heads",
               "they stop paying attention",
               "they forget the beginning of the story"], "a": 0},
        {"q": "Where does the pleasure of a good twist come from?",
         "o": ["from being tricked", "from realising the answer had been there all along",
               "from the special effects"], "a": 1},
        {"q": "What makes a twist 'fair'?",
         "o": ["it happens at the very end", "the writer has left clues earlier",
               "it is easy to guess"], "a": 1},
        {"q": "Why does the text mention fairy tales?",
         "o": ["because they are for children",
               "because they prepare their endings early, in a quiet way",
               "because they never have twists"], "a": 1},
        {"q": "Why are stories with twists good for language learners?",
         "o": ["they use simpler words", "they are shorter",
               "the twist gives you a real reason to re-read"], "a": 2},
        {"q": "What is the warning at the end?",
         "o": ["a twist is not the same as an ending",
               "twists are always cheap",
               "you should never re-read a story"], "a": 0},
        {"q": "How does the writer describe a cheap twist?",
         "o": ["it simply arrives, with nothing preparing it",
               "it is too complicated",
               "it comes too early"], "a": 0},
    ],
}


# ============================================================
#   ДОПОЛНИТЕЛЬНАЯ ПРАКТИКА
# ============================================================
EXTRA_MC[2] = [
    {"q": "The story ___ in a small village in 1920.", "o": ["took place", "took part", "took away"], "a": 0},
    {"q": "I was reading in bed when suddenly I ___ a noise.", "o": ["was hearing", "heard", "had heard"], "a": 1},
    {"q": "The film is ___ a true story.", "o": ["based on", "based of", "based in"], "a": 0},
    {"q": "By the time we arrived, the film ___ .", "o": ["started", "had started", "was starting"], "a": 1},
    {"q": "She's the ___ of the film — she saves everyone at the end.", "o": ["villain", "hero", "character"], "a": 1},
    {"q": "Nothing happens for two hours. It's incredibly ___ .", "o": ["exciting", "scary", "boring"], "a": 2},
    {"q": "I ___ that book three times.", "o": ["have read", "read yesterday", "was reading"], "a": 0},
    {"q": "While I ___ dinner, the phone rang.", "o": ["cooked", "was cooking", "had cooked"], "a": 1},
    {"q": "The ___ at the end changes everything you thought you knew.", "o": ["review", "twist", "event"], "a": 1},
    {"q": "I've lived here ___ 2019.", "o": ["for", "since", "ago"], "a": 1},
]

EXTRA_GAP[2] = [
    {"q": "Once upon a ___ , there was a girl who was afraid of nothing.", "a": ["time"]},
    {"q": "All of a ___ , the lights went out.", "a": ["sudden"]},
    {"q": "It turned ___ that the door had been open all night.", "a": ["out"]},
    {"q": "___ the end, everything was fine.", "a": ["In", "in"]},
    {"q": "I fell ___ before the film finished.", "a": ["asleep"]},
    {"q": "We haven't seen each other ___ March.", "a": ["since"]},
    {"q": "They lived in Rome ___ six years.", "a": ["for"]},
    {"q": "I met her about three years ___ .", "a": ["ago"]},
]


# ============================================================
#   ВЫВЕДИ ПРАВИЛО САМА
# ============================================================
DISCOVERY[2] = [
    {
        "for": 0,
        "title": "Заметь: три слоя одной истории",
        "source": "Диалог «The night the lights went out»",
        "lead": "Том рассказал историю. Вот его фразы оттуда — ничего не выдумано, всё из диалога. "
                "Посмотри на выделенные глаголы и попробуй понять, зачем ему три разные формы.",
        "examples": [
            {"t": "It **was raining** hard that night and I **was watching** a film in the living room.", "who": "Tom"},
            {"t": "And then all of a sudden the lights **went out**.", "who": "Tom"},
            {"t": "I **sat** there for a minute. Then I **realised** I **had left** my phone upstairs.", "who": "Tom"},
            {"t": "I **froze**. I **hadn't locked** the front door — I**'d forgotten** completely.", "who": "Tom"},
            {"t": "She **had come back** two days early and **hadn't wanted** to wake me.", "who": "Tom"},
            {"t": "**Meanwhile**, outside, the wind **was getting** worse.", "who": "Tom"},
        ],
        "steps": [
            {"q": "«It was raining» и «the lights went out». Какое из этих действий длилось фоном, а какое случилось в один момент?",
             "o": ["was raining — фон, went out — момент",
                   "was raining — момент, went out — фон",
                   "оба длились одинаково"],
             "a": 0,
             "why": "Past Continuous рисует фон, обстановку. Past Simple — то, что произошло и закончилось."},
            {"q": "Том говорит «I realised I had left my phone upstairs». Что случилось раньше — realised или had left?",
             "o": ["realised", "had left", "одновременно"],
             "a": 1,
             "why": "Past Perfect (had + 3-я форма) — шаг назад: действие произошло ДО другого действия в прошлом."},
            {"q": "Почему «I hadn't locked the front door», а не «I didn't lock»?",
             "o": ["потому что это отрицание",
                   "потому что он объясняет, что было ещё до момента на лестнице",
                   "потому что так вежливее"],
             "a": 1,
             "why": "Он стоит на лестнице (прошлое) и объясняет причину, которая появилась ещё раньше. Это Past Perfect."},
            {"q": "Какой сигнал в диалоге подсказывает, что действия идут параллельно?",
             "o": ["suddenly", "meanwhile", "then"],
             "a": 1,
             "why": "meanwhile / while / as — параллельные действия, обычно с Past Continuous. "
                    "suddenly и then — наоборот, толкают историю вперёд, с Past Simple."},
            {"q": "Собери порядок событий: (1) он забыл запереть дверь, (2) он услышал дыхание. Как сказать по-английски?",
             "o": ["He heard breathing. He forgot to lock the door.",
                   "He had heard breathing when he forgot to lock the door.",
                   "He heard breathing. He hadn't locked the door."],
             "a": 2,
             "why": "Более раннее событие уходит в Past Perfect, более позднее остаётся в Past Simple."},
        ],
        "rule": "Три слоя рассказа: <b>Past Continuous</b> — фон, что уже шло («It was raining»). "
                "<b>Past Simple</b> — что случилось и двинуло историю («the lights went out»). "
                "<b>Past Perfect</b> — шаг назад, что произошло ещё раньше («I had left my phone»). "
                "Сигналы: while / as / meanwhile → Continuous; then / suddenly / all of a sudden → Simple; "
                "by the time / before / already → Perfect.",
    },
    {
        "for": 1,
        "title": "Заметь: закончилось совсем или тянется до сих пор?",
        "source": "Диалог «The night the lights went out» и подкаст",
        "lead": "В том же диалоге есть вторая пара форм. Одна привязана к моменту в прошлом, "
                "другая — к сейчас. Найди разницу сама.",
        "examples": [
            {"t": "I **was remembering** something that **happened** to me about ten years ago.", "who": "Tom"},
            {"t": "This **is** the worst thing I**'ve ever heard**.", "who": "Amy"},
            {"t": "I **haven't heard** a proper ghost story **since** school.", "who": "Amy"},
            {"t": "I**'ve watched** horror films with better endings than that.", "who": "Amy"},
            {"t": "**Have** you **ever had** anything like that happen to you?", "who": "Tom"},
            {"t": "I **have never found out** what was inside that house.", "who": "Подкаст"},
        ],
        "steps": [
            {"q": "«It happened about ten years ago» — почему не «It has happened»?",
             "o": ["потому что есть точное время в прошлом: ten years ago",
                   "потому что это плохая новость",
                   "потому что рассказывает мужчина"],
             "a": 0,
             "why": "Как только назван конкретный момент в прошлом (yesterday, in 2019, ten years ago) — только Past Simple."},
            {"q": "«I've watched horror films with better endings» — когда именно она их смотрела?",
             "o": ["вчера", "неважно, время не названо — важен опыт", "прямо сейчас"],
             "a": 1,
             "why": "Present Perfect про опыт: важно, что это было в жизни, а не когда."},
            {"q": "Почему «I haven't heard a ghost story since school», а не «I didn't hear»?",
             "o": ["потому что период тянется до сегодняшнего дня",
                   "потому что школа — это давно",
                   "потому что это отрицание"],
             "a": 0,
             "why": "since school = от школы и по сей день. Период не закрыт → Present Perfect."},
            {"q": "Какое предложение правильное?",
             "o": ["Have you seen the film yesterday?",
                   "Did you see the film yesterday?",
                   "Have you saw the film yesterday?"],
             "a": 1,
             "why": "yesterday закрывает период → Past Simple."},
            {"q": "«ever», «never», «just», «already», «yet» — к какому времени они тянут?",
             "o": ["к Past Simple", "к Present Perfect", "к обоим одинаково"],
             "a": 1,
             "why": "Это классические маркеры Present Perfect."},
        ],
        "rule": "<b>Past Simple</b> — когда есть точка в прошлом: yesterday, last night, in 2019, ten years ago. "
                "<b>Present Perfect</b> — когда важен результат или опыт, а время не названо, "
                "или период ещё не закончился: ever, never, just, already, yet, so far, since, for. "
                "Проверка: если можешь спросить «когда?» и в предложении есть ответ — это Past Simple.",
    },
    {
        "for": 2,
        "title": "Заметь: for, since, ago и остальные",
        "source": "Диалог и подкаст",
        "lead": "Предлоги времени легче не заучивать, а увидеть в живой речи. "
                "Вот все, что встретились нам в этом юните.",
        "examples": [
            {"t": "I sat there **for** a minute.", "who": "Tom"},
            {"t": "I stood there **for about thirty seconds**.", "who": "Tom"},
            {"t": "I haven't heard a proper ghost story **since** school.", "who": "Amy"},
            {"t": "Something that happened to me about ten years **ago**.", "who": "Tom"},
            {"t": "I've been telling worse ones **for years**.", "who": "Amy"},
            {"t": "**By** the spring she **had died**.", "who": "Подкаст"},
            {"t": "**While** the girl was walking towards the light, the door opened.", "who": "Подкаст"},
            {"t": "**During** the war she lived in the village.", "who": "Подкаст (пересказ)"},
        ],
        "steps": [
            {"q": "«for a minute» и «since school». Что означает каждое?",
             "o": ["for — сколько длилось, since — с какого момента",
                   "for — с какого момента, since — сколько длилось",
                   "они означают одно и то же"],
             "a": 0,
             "why": "for + отрезок (for two hours, for years). since + точка старта (since 2019, since school)."},
            {"q": "«ten years ago» — где в предложении стоит ago?",
             "o": ["перед отрезком времени", "после отрезка времени", "в начале предложения"],
             "a": 1,
             "why": "ago всегда после: two days ago, a long time ago. И работает только с Past Simple."},
            {"q": "Чем «while» отличается от «during»?",
             "o": ["while + предложение с глаголом, during + существительное",
                   "during + глагол, while + существительное",
                   "разницы нет"],
             "a": 0,
             "why": "while I was reading, но during the film. После during — только существительное."},
            {"q": "«By the spring she had died». Что значит by?",
             "o": ["в течение весны", "не позже весны, к этому моменту", "после весны"],
             "a": 1,
             "why": "by = к этому моменту, не позже. Часто идёт с Past Perfect: by then, by the time, by 2020."},
            {"q": "Где ошибка: «I've lived here for 2019»?",
             "o": ["нужно since 2019", "нужно ago 2019", "ошибки нет"],
             "a": 0,
             "why": "2019 — это точка, а не отрезок. Значит since."},
        ],
        "rule": "<b>for</b> + сколько длилось: for two hours, for years. "
                "<b>since</b> + с какого момента: since Monday, since 2019, since school. "
                "<b>ago</b> после отрезка и только с Past Simple: three days ago. "
                "<b>during</b> + существительное: during the film. <b>while</b> + предложение: while I was reading. "
                "<b>by</b> = к этому моменту: by Friday, by the time we arrived. "
                "<b>until</b> = вплоть до: I waited until six.",
    },
]


# ============================================================
#   ОТРАБОТКА ПОСЛЕ ПРАВИЛА
# ============================================================
GRAM_PRACTICE[2] = [
    {
        "for": 0,
        "title": "Отработка · три слоя рассказа",
        "lead": "Те же герои, новые ситуации. Сначала спроси себя: это фон, это событие или это шаг назад?",
        "mc": [
            {"q": "Tom ___ a film when the lights went out.", "o": ["watched", "was watching", "had watched"], "a": 1},
            {"q": "When he got to the stairs, he ___ that he had left his phone upstairs.", "o": ["realised", "was realising", "had realised"], "a": 0},
            {"q": "He couldn't call anyone because he ___ his phone upstairs.", "o": ["left", "was leaving", "had left"], "a": 2},
            {"q": "While the wind ___ worse, Tom sat in the dark.", "o": ["got", "was getting", "had got"], "a": 1},
            {"q": "By the time Amy arrived, Tom ___ the whole story twice.", "o": ["told", "was telling", "had told"], "a": 2},
            {"q": "Suddenly someone ___ the door.", "o": ["was opening", "opened", "had opened"], "a": 1},
            {"q": "His aunt ___ back two days early, so nobody was expecting her.", "o": ["came", "was coming", "had come"], "a": 2},
            {"q": "Amy ___ tea while Tom was describing the stairs.", "o": ["made", "was making", "had made"], "a": 1},
            {"q": "The film ___ before he could find the remote.", "o": ["finished", "was finishing", "had finished"], "a": 2},
            {"q": "It ___ hard all evening, so the road was flooded.", "o": ["rained", "had been raining", "was rain"], "a": 1},
            {"q": "As soon as he heard the noise, he ___ .", "o": ["froze", "was freezing", "had frozen"], "a": 0},
            {"q": "Meanwhile, his aunt ___ for her keys in the hall.", "o": ["looked", "was looking", "had looked"], "a": 1},
        ],
        "gaps": [
            {"q": "While I ___ (read), the phone rang.", "a": ["was reading"]},
            {"q": "When we arrived, the film ___ already ___ (start).", "a": ["had started"]},
            {"q": "It ___ (rain) when I left the house.", "a": ["was raining"]},
            {"q": "She ___ (not lock) the door, so anyone could come in.", "a": ["hadn't locked", "had not locked"]},
            {"q": "Suddenly the lights ___ (go) out.", "a": ["went"]},
            {"q": "By the time he found his phone, the battery ___ (die).", "a": ["had died"]},
            {"q": "Tom ___ (sit) on the stairs for thirty seconds before he moved.", "a": ["sat"]},
        ],
    },
    {
        "for": 1,
        "title": "Отработка · Past Simple или Present Perfect",
        "lead": "Ищи глазами маркер времени. Если есть точка в прошлом — Past Simple. Если период открыт — Present Perfect.",
        "mc": [
            {"q": "I ___ that film last night.", "o": ["saw", "have seen", "had seen"], "a": 0},
            {"q": "___ you ever ___ a ghost story like that?", "o": ["Did / hear", "Have / heard", "Were / hearing"], "a": 1},
            {"q": "She ___ three novels this year.", "o": ["wrote", "has written", "was writing"], "a": 1},
            {"q": "We ___ to the cinema in March.", "o": ["went", "have gone", "have been going"], "a": 0},
            {"q": "I ___ that book yet.", "o": ["didn't finish", "haven't finished", "hadn't finished"], "a": 1},
            {"q": "Tom ___ his aunt two days ago.", "o": ["called", "has called", "was calling"], "a": 0},
            {"q": "They ___ in this village since 2018.", "o": ["lived", "have lived", "were living"], "a": 1},
            {"q": "___ the film start on time?", "o": ["Did", "Has", "Have"], "a": 0},
            {"q": "It's the best story I ___ .", "o": ["ever heard", "have ever heard", "was ever hearing"], "a": 1},
            {"q": "I ___ just ___ the ending and I'm furious.", "o": ["did / read", "have / read", "was / reading"], "a": 1},
            {"q": "When ___ you ___ the novel?", "o": ["have / read", "did / read", "did / have read"], "a": 1},
            {"q": "She ___ that story since she was nine.", "o": ["told", "has been telling", "was telling"], "a": 1},
        ],
        "gaps": [
            {"q": "I ___ (not see) her since March.", "a": ["haven't seen", "have not seen"]},
            {"q": "We ___ (watch) that film last weekend.", "a": ["watched"]},
            {"q": "___ you ever ___ (be) to Rome?", "a": ["Have been", "have been"]},
            {"q": "He ___ (live) here for ten years and he's still here.", "a": ["has lived", "has been living"]},
            {"q": "They ___ (finish) the book yesterday.", "a": ["finished"]},
            {"q": "I ___ (already / read) it, thanks.", "a": ["have already read", "'ve already read"]},
        ],
    },
    {
        "for": 2,
        "title": "Отработка · предлоги времени",
        "lead": "Короткие предложения, одно слово решает всё.",
        "mc": [
            {"q": "I've known him ___ 2015.", "o": ["for", "since", "ago"], "a": 1},
            {"q": "We waited ___ two hours.", "o": ["for", "since", "during"], "a": 0},
            {"q": "She left about ten minutes ___ .", "o": ["since", "ago", "before"], "a": 1},
            {"q": "Nobody spoke ___ the film.", "o": ["while", "during", "since"], "a": 1},
            {"q": "___ I was cooking, the phone rang.", "o": ["During", "While", "For"], "a": 1},
            {"q": "___ the time we arrived, everyone had left.", "o": ["By", "Until", "Since"], "a": 0},
            {"q": "I'll wait ___ six o'clock, then I'm going.", "o": ["by", "until", "for"], "a": 1},
            {"q": "The story takes place ___ the winter of 1920.", "o": ["in", "on", "at"], "a": 0},
            {"q": "We're meeting ___ Friday evening.", "o": ["in", "on", "at"], "a": 1},
            {"q": "The film starts ___ eight.", "o": ["in", "on", "at"], "a": 2},
        ],
        "gaps": [
            {"q": "I haven't read a novel ___ last summer.", "a": ["since"]},
            {"q": "She talked ___ twenty minutes without stopping.", "a": ["for"]},
            {"q": "___ the war, my grandmother lived in a village.", "a": ["During", "during"]},
            {"q": "He fell asleep ___ he was watching the film.", "a": ["while"]},
            {"q": "Finish it ___ Friday, please — not later.", "a": ["by"]},
            {"q": "We moved here three years ___ .", "a": ["ago"]},
        ],
    },
]


# ============================================================
#   ДОМАШНЕЕ ЗАДАНИЕ
# ============================================================
HOMEWORK[2] = {
    "intro": "Домашка на том же материале: слова из истории Тома, три правила, "
             "которые ты вывела сама. Предложения новые — проверяем, что осталось.",
    "parts": [
        {
            "title": "Домашка 1 · Слова и выражения юнита",
            "lead": "Двадцать слов из урока плюс выражения целиком.",
            "mc": [
                {"q": "The ___ of a story is what happens in it.", "o": ["plot", "review", "character"], "a": 0},
                {"q": "A person in a book or film is a ___ .", "o": ["hero", "character", "event"], "a": 1},
                {"q": "The bad person in the story is the ___ .", "o": ["villain", "hero", "novel"], "a": 0},
                {"q": "A long book that tells a story is a ___ .", "o": ["review", "novel", "plot"], "a": 1},
                {"q": "I read a ___ of the film before I watched it.", "o": ["review", "twist", "ending"], "a": 0},
                {"q": "Nothing happened for two hours — it was so ___ .", "o": ["exciting", "scary", "boring"], "a": 2},
                {"q": "That film gave me nightmares. It was really ___ .", "o": ["boring", "scary", "based on"], "a": 1},
                {"q": "The story ___ in Paris in 1890.", "o": ["takes place", "takes part", "takes off"], "a": 0},
                {"q": "Halfway through, I ___ that I had read it before.", "o": ["described", "realised", "happened"], "a": 1},
                {"q": "The film is ___ a true story.", "o": ["based on", "based in", "based of"], "a": 0},
                {"q": "Can you ___ the man you saw?", "o": ["happen", "describe", "realise"], "a": 1},
                {"q": "Everything was quiet, and then ___ the door opened.", "o": ["meanwhile", "suddenly", "in the end"], "a": 1},
            ],
            "gaps": [
                {"q": "Once upon a ___ there was a girl who was afraid of nothing.", "a": ["time"]},
                {"q": "All of a ___ the room went dark.", "a": ["sudden"]},
                {"q": "It turned ___ that nobody had locked the door.", "a": ["out"]},
                {"q": "The film has a happy ___ , don't worry.", "a": ["ending"]},
                {"q": "I fell ___ before the twist.", "a": ["asleep"]},
                {"q": "It's a proper plot ___ — nobody sees it coming.", "a": ["twist"]},
            ],
        },
        {
            "title": "Домашка 2 · Рассказываем историю",
            "lead": "Первое правило, которое ты вывела сама: фон, событие, шаг назад.",
            "mc": [
                {"q": "I ___ home when I saw the light in the window.", "o": ["walked", "was walking", "had walked"], "a": 1},
                {"q": "She ___ the door because she had forgotten her keys.", "o": ["couldn't open", "wasn't opening", "hadn't opened"], "a": 0},
                {"q": "By the time the film started, we ___ all the popcorn.", "o": ["ate", "were eating", "had eaten"], "a": 2},
                {"q": "The sun ___ when we finally left the house.", "o": ["shone", "was shining", "had shone"], "a": 1},
                {"q": "He looked terrible. He ___ all night.", "o": ["didn't sleep", "hadn't slept", "wasn't sleeping"], "a": 1},
                {"q": "Then, all of a sudden, the phone ___ .", "o": ["was ringing", "rang", "had rung"], "a": 1},
                {"q": "Meanwhile, outside, it ___ heavily.", "o": ["snowed", "was snowing", "had snowed"], "a": 1},
                {"q": "We arrived at eight, but they ___ already ___ .", "o": ["did / leave", "had / left", "were / leaving"], "a": 1},
                {"q": "While I ___ the review, she watched the film.", "o": ["read", "was reading", "had read"], "a": 1},
                {"q": "As soon as she saw him, she ___ who he was.", "o": ["realised", "was realising", "had realised"], "a": 0},
            ],
            "gaps": [
                {"q": "It ___ (rain) when I got off the bus.", "a": ["was raining"]},
                {"q": "By the time we arrived, the concert ___ (finish).", "a": ["had finished"]},
                {"q": "While she ___ (cook), the cat stole the fish.", "a": ["was cooking"]},
                {"q": "He was hungry because he ___ (not eat) since morning.", "a": ["hadn't eaten", "had not eaten"]},
                {"q": "Suddenly somebody ___ (knock) at the door.", "a": ["knocked"]},
                {"q": "They ___ (already / see) the film, so they stayed at home.", "a": ["had already seen"]},
            ],
        },
        {
            "title": "Домашка 3 · Perfect, Simple и предлоги",
            "lead": "Второе и третье правила вместе. Смотри на маркеры времени.",
            "mc": [
                {"q": "I ___ that novel three times.", "o": ["read yesterday", "have read", "was reading"], "a": 1},
                {"q": "We ___ the film on Saturday.", "o": ["have watched", "watched", "have been watching"], "a": 1},
                {"q": "___ you finished the book ___ ?", "o": ["Did / yet", "Have / yet", "Have / ago"], "a": 1},
                {"q": "She's been writing ___ she was fifteen.", "o": ["for", "since", "during"], "a": 1},
                {"q": "They talked ___ three hours.", "o": ["since", "for", "by"], "a": 1},
                {"q": "The film came out two years ___ .", "o": ["since", "ago", "before"], "a": 1},
                {"q": "Nobody said a word ___ the performance.", "o": ["while", "during", "until"], "a": 1},
                {"q": "___ he was reading, she fell asleep.", "o": ["During", "While", "By"], "a": 1},
                {"q": "Please send it ___ Friday at the latest.", "o": ["until", "by", "since"], "a": 1},
                {"q": "The story takes place ___ the 1920s.", "o": ["in", "on", "at"], "a": 0},
                {"q": "I've never ___ such a strange ending.", "o": ["saw", "seen", "been seeing"], "a": 1},
                {"q": "When ___ she write it?", "o": ["has", "did", "have"], "a": 1},
            ],
            "gaps": [
                {"q": "I ___ (not read) that book yet.", "a": ["haven't read", "have not read"]},
                {"q": "We ___ (go) to the cinema last Friday.", "a": ["went"]},
                {"q": "She's lived here ___ 2020.", "a": ["since"]},
                {"q": "He waited ___ six o'clock and then left.", "a": ["until", "till"]},
                {"q": "___ the time I finished, everyone had gone home.", "a": ["By", "by"]},
                {"q": "I've known Tom ___ years.", "a": ["for"]},
            ],
        },
    ],
    "write": {
        "title": "Домашка 4 · Напиши сама",
        "lead": "Три письменных задания. Пиши от руки или в тетради — я проверю на уроке. "
                "Не пытайся быть литературной, пытайся быть понятной.",
        "tasks": [
            "Расскажи свою историю про странный вечер — 8–10 предложений. "
            "Обязательно используй хотя бы один Past Continuous (фон), три Past Simple (события) "
            "и один Past Perfect (что было ещё раньше). Подчеркни их.",
            "Напиши короткий отзыв на фильм или книгу — 6–8 предложений. "
            "Начни с «I've just watched / read…», расскажи про plot и characters, "
            "скажи, был ли там a twist, и закончи, посоветуешь ли ты его.",
            "Допиши историю бабушки из подкаста: что было за дверью? "
            "5–7 предложений, обязательно с одним «It turned out that…» и одним «In the end…».",
        ],
    },
}
