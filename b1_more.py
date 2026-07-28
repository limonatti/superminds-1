# -*- coding: utf-8 -*-
"""
Расширение курса Speakout B1 — авторский материал.

Здесь то, чего не хватало учебнику: длинные диалоги вместо восьми реплик,
полноценные тексты вместо ста слов, монологи-подкасты и дополнительная практика.
Подхватывается автоматически: build-book.py добавляет эти развороты к юниту.

Ключ словаря — номер юнита.
"""

# ============================================================
#   ДЛИННЫЕ ДИАЛОГИ  (20–26 реплик, два голоса)
# ============================================================
LONG_DIALOG = {}

LONG_DIALOG[1] = {
    "title": "At Anna's birthday party",
    "names": {"m": "Sam", "f": "Nina"},
    "intro": "Сэм и Нина только что познакомились на дне рождения общей подруги. "
             "Слушай, как они находят общий язык — и следи за present simple и present continuous.",
    "lines": [
        ["m", "Hi! Do you mind if I sit here? Everywhere else is taken."],
        ["f", "Not at all, go ahead. I'm Nina, by the way."],
        ["m", "Sam. Nice to meet you. Are you a friend of Anna's?"],
        ["f", "We were at university together. We've known each other for about ten years now."],
        ["m", "Ten years! That's a long time. I only met her last spring — we work in the same office."],
        ["f", "Oh, so you're the graphic designer she keeps talking about."],
        ["m", "She talks about me? That's worrying."],
        ["f", "Only good things, don't panic. She says you're the quiet one who saves everybody's presentations."],
        ["m", "That sounds about right. I'm not very outgoing at parties, to be honest."],
        ["f", "Neither am I. I usually stand near the food and hope nobody notices me."],
        ["m", "That's exactly what I'm doing right now."],
        ["f", "Then we're doing it together, which is slightly less embarrassing."],
        ["m", "So what do you do, Nina?"],
        ["f", "I'm a nurse. I work nights at St Mary's, three shifts a week."],
        ["m", "Nights? I don't know how you do that. I need eight hours or I'm useless."],
        ["f", "You get used to it. Although right now I'm covering for a colleague, so I'm doing five nights instead of three."],
        ["m", "Five? That sounds exhausting."],
        ["f", "It is. But she's got a small baby, so I don't mind helping."],
        ["m", "That's really generous of you."],
        ["f", "She'd do the same for me. We get on well — she's probably my closest friend at work."],
        ["m", "It's nice when you find someone like that. Most of my colleagues are lovely, but we don't really talk outside the office."],
        ["f", "Because you work from home half the week?"],
        ["m", "Exactly. It's quiet and I like it, but I don't meet many new people."],
        ["f", "Well, you're meeting one now."],
        ["m", "True. This is going much better than I expected."],
        ["f", "Listen, a few of us are getting coffee on Saturday. Do you fancy coming?"],
        ["m", "I'd love to. Give me your number and I'll message you."],
        ["f", "Perfect. And Sam — you're not as shy as Anna says."],
    ],
    "questions": [
        {"q": "How long have Nina and Anna known each other?",
         "o": ["about a year", "about ten years", "since last spring"], "a": 1},
        {"q": "What does Anna say about Sam?",
         "o": ["he is loud at meetings", "he is quiet and saves presentations", "he never comes to parties"], "a": 1},
        {"q": "Why is Nina working five nights this week?",
         "o": ["she needs the money", "she is covering for a colleague", "the hospital is short of nurses"], "a": 1},
        {"q": "Why doesn't Sam meet many new people?",
         "o": ["he works from home half the week", "he doesn't like people", "he lives far from the office"], "a": 0},
        {"q": "How does the conversation end?",
         "o": ["Nina leaves quickly", "they argue about work", "Nina invites Sam for coffee"], "a": 2},
        {"q": "Which sentence describes something happening NOW?",
         "o": ["I work nights at St Mary's.", "Right now I'm covering for a colleague.", "She'd do the same for me."], "a": 1},
    ],
}

# ============================================================
#   ПОДКАСТ — монолог одним голосом
# ============================================================
PODCAST = {}

PODCAST[1] = {
    "title": "Podcast: The friend I almost didn't make",
    "voice": "f",
    "intro": "Монолог на две минуты. Слушай целиком, потом ответь на вопросы — "
             "текст можно скрыть кнопкой и слушать как настоящий подкаст.",
    "text": [
        "I want to tell you about my best friend, and about how I almost never met her.",
        "It was my first week at a new job. I'm quite shy with strangers, so I had a simple plan: "
        "arrive early, do my work, go home. No small talk. No coffee breaks.",
        "For four days it worked perfectly. I didn't speak to anyone except my manager.",
        "On the Friday, a woman from the next desk turned round and said, 'You're doing the silent thing, "
        "aren't you? I did that too when I started. It doesn't help.'",
        "I was so embarrassed I wanted to disappear. But she just laughed and asked if I wanted a coffee.",
        "That was Maya. We've been friends for six years now.",
        "The strange thing is, she isn't like me at all. She's loud, she talks to everybody, "
        "she makes friends in supermarket queues. I still find that slightly terrifying.",
        "But she taught me something useful: most people aren't judging you. They're just as nervous as you are, "
        "and they're waiting for somebody else to speak first.",
        "So now, when I start somewhere new, I make myself say one sentence to one person on the first day. "
        "Just one. 'How long have you worked here?' is usually enough.",
        "It still feels uncomfortable. But it's a lot less lonely than the plan I had before.",
    ],
    "questions": [
        {"q": "What was the speaker's plan in her first week?",
         "o": ["make friends quickly", "arrive early, work, go home", "ask her manager for help"], "a": 1},
        {"q": "Who spoke to her first?",
         "o": ["her manager", "a woman from the next desk", "someone in a supermarket"], "a": 1},
        {"q": "How is Maya different from the speaker?",
         "o": ["she is much quieter", "she is loud and talks to everybody", "she works in another office"], "a": 1},
        {"q": "What did Maya teach her?",
         "o": ["most people are not judging you", "you should never be shy", "work comes before friends"], "a": 0},
        {"q": "What does the speaker do now on her first day somewhere new?",
         "o": ["nothing, she still avoids people", "she says one sentence to one person", "she invites everybody for coffee"], "a": 1},
    ],
}

# ============================================================
#   ДЛИННЫЕ ТЕКСТЫ ДЛЯ ЧТЕНИЯ  (350–420 слов)
# ============================================================
LONG_READING = {}

LONG_READING[1] = {
    "title": "Why small talk feels so hard",
    "html": r'''
<p>Ask people what they hate most about parties, work events or the first day of a course, and
many of them will give you the same answer: <b>small talk</b>. Not the event itself, not the
people — just those first few minutes of light, polite conversation about the weather, the
journey or the food.</p>

<p>This is strange, because small talk is not difficult in the way that, say, mathematics is
difficult. Nobody needs a special vocabulary to say 'Terrible weather, isn't it?' And yet a lot
of intelligent, confident adults will happily give a presentation to forty people but panic at
the thought of standing next to a stranger holding a cup of coffee.</p>

<p>Researchers who study conversation think the problem is not the words but the <b>fear of being
judged</b>. When we make small talk we are not really exchanging information — we are showing that
we are friendly, safe and easy to be around. That feels like a test. And because it feels like a
test, we watch ourselves while we speak, which is exactly the thing that makes us sound awkward.</p>

<p>There is also a second problem, and it is a very English one. In British culture, small talk is
expected to be <i>light</i>. You may talk about the rain for four minutes. You may not ask a
stranger how much they earn or whether they are happy in their marriage. People who arrive from
cultures where conversation goes deep quickly often find this rule confusing, and people who grew
up with it often cannot explain why it exists.</p>

<p>So what actually helps? Three things, according to people who do it well.</p>

<p>First, <b>ask, don't perform</b>. The most popular person in the room is usually not the funniest
one — it is the one who asks a question and then really listens to the answer. 'Have you been
here before?' costs nothing and gives the other person something to hold on to.</p>

<p>Second, <b>look for something in common</b>. A hobby, a place, a shared complaint about the trains.
The moment two people find one thing they both know about, the conversation stops being small talk
and starts being a conversation.</p>

<p>Third, and this is the one most people forget: <b>it is fine to be bad at it</b>. Almost everybody
in the room is a little nervous. The stranger you are talking to is probably relieved that somebody
spoke first — and they will not remember your exact words tomorrow. They will only remember that
you were friendly.</p>
''',
    "questions": [
        {"q": "According to the text, what do many people dislike most about social events?",
         "o": ["the food", "the first few minutes of light conversation", "giving presentations"], "a": 1},
        {"q": "Why is it strange that small talk feels hard?",
         "o": ["it needs no special vocabulary", "it takes a long time to learn", "it is only used at work"], "a": 0},
        {"q": "What do researchers think the real problem is?",
         "o": ["a small vocabulary", "the fear of being judged", "speaking too quickly"], "a": 1},
        {"q": "What is the 'very English' rule mentioned in the text?",
         "o": ["small talk should stay light", "you must talk about football", "you should never start a conversation"], "a": 0},
        {"q": "Who is usually the most popular person in the room?",
         "o": ["the funniest one", "the one who asks and listens", "the one who talks the longest"], "a": 1},
        {"q": "What is the third piece of advice?",
         "o": ["practise every day", "avoid strangers", "it's fine to be bad at it"], "a": 2},
    ],
}

# ============================================================
#   ДОПОЛНИТЕЛЬНАЯ ПРАКТИКА
# ============================================================
EXTRA_MC = {}
EXTRA_GAP = {}

EXTRA_MC[1] = [
    {"q": "Sorry, I can't come now — I ___ dinner for my parents.",
     "o": ["cook", "am cooking", "cooks"], "a": 1},
    {"q": "My brother ___ three languages, but he never uses them.",
     "o": ["is speaking", "speak", "speaks"], "a": 2},
    {"q": "Which verb is NOT normally used in the continuous?",
     "o": ["work", "believe", "cook"], "a": 1},
    {"q": "She ___ to move to Berlin next year.",
     "o": ["is wanting", "wants", "want"], "a": 1},
    {"q": "We really enjoy ___ time with our neighbours.",
     "o": ["to spend", "spending", "spend"], "a": 1},
    {"q": "He promised ___ me after work.",
     "o": ["calling", "to call", "call"], "a": 1},
    {"q": "Choose the polite way to join a group of strangers.",
     "o": ["Move up, I'm sitting here.", "Do you mind if I join you?", "Why are you all standing here?"], "a": 1},
    {"q": "She's ___ bit stubborn, but she's a good friend.",
     "o": ["a", "the", "very"], "a": 0},
    {"q": "They ___ each other since primary school.",
     "o": ["know", "are knowing", "have known"], "a": 2},
    {"q": "'What do you do?' is a question about your ___ .",
     "o": ["job", "plans for tonight", "hobbies"], "a": 0},
]

EXTRA_GAP[1] = [
    {"q": "I ___ (not / believe) that story.", "a": ["don't believe", "do not believe"]},
    {"q": "Look — the neighbours ___ (move) their piano again!", "a": ["are moving"]},
    {"q": "We have a lot ___ common: same music, same films.", "a": ["in"]},
    {"q": "She avoids ___ (talk) about her family.", "a": ["talking"]},
    {"q": "He's quite easy-___ , nothing upsets him.", "a": ["going"]},
    {"q": "Do you mind ___ I open the window?", "a": ["if"]},
    {"q": "I'd like ___ (get) to know you better.", "a": ["to get"]},
    {"q": "They ___ (get) on really well with their colleagues.", "a": ["get"]},
]


# ============================================================
#   ВЫВЕДИ ПРАВИЛО САМ  (guided discovery)
#   Идёт ПОСЛЕ аудио и текстов, ПЕРЕД объяснением грамматики.
#   Примеры берутся дословно из диалога и подкаста этого же юнита —
#   ученица сначала замечает язык в контексте, потом формулирует правило.
#   "for" — номер грамматической темы юнита (с нуля).
# ============================================================
DISCOVERY = {}

DISCOVERY[1] = [
    {
        "for": 0,
        "title": "Заметь: прямо сейчас или вообще?",
        "source": "Диалог «At Anna's birthday party» и подкаст",
        "lead": "Ты только что слушала диалог. Вот шесть фраз оттуда. "
                "Не спеши читать правило — сначала посмотри на них сама.",
        "examples": [
            {"t": "I **usually stand** near the food and hope nobody notices me.", "who": "Nina"},
            {"t": "That's exactly what I**'m doing** right now.", "who": "Sam"},
            {"t": "I **work** nights at St Mary's, three shifts a week.", "who": "Nina"},
            {"t": "Right now I**'m covering** for a colleague, so I**'m doing** five nights.", "who": "Nina"},
            {"t": "I **don't know** how you do that.", "who": "Sam"},
            {"t": "I **need** eight hours or I'm useless.", "who": "Sam"},
        ],
        "steps": [
            {"q": "Нина говорит «I work nights» и «right now I'm covering». В чём разница?",
             "o": ["первое — её обычный график, второе — временно, на этой неделе",
                   "первое в прошлом, второе в настоящем",
                   "разницы нет, можно сказать и так и так"],
             "a": 0,
             "why": "Present Simple — то, что происходит регулярно. Present Continuous — то, что идёт сейчас или временно."},
            {"q": "Почему Сэм говорит «I'm doing», а не «I do», когда описывает себя у стола с едой?",
             "o": ["потому что это его привычка",
                   "потому что это происходит в момент разговора",
                   "потому что это вежливее"],
             "a": 1,
             "why": "«Right now», «at the moment», «today» — сигналы для Continuous."},
            {"q": "Посмотри на «I don't know» и «I need». Почему не «I'm not knowing» и «I'm needing»?",
             "o": ["так короче",
                   "это глаголы состояния — они почти не бывают в Continuous",
                   "это ошибка, так говорить нельзя"],
             "a": 1,
             "why": "know, need, believe, like, want, mean, understand — состояния, а не действия."},
            {"q": "Какое предложение НЕ будет ошибкой?",
             "o": ["I am wanting a coffee.", "She is having a small baby.", "I'm having a great time."],
             "a": 2,
             "why": "«have» в значении «испытывать, проводить» — действие, поэтому Continuous возможен. "
                    "А «have» в значении «иметь» — состояние."},
        ],
        "rule": "Present Simple — регулярно и всегда. Present Continuous — сейчас и временно. "
                "Глаголы состояния (know, need, like, believe, want) в Continuous обычно не ставим — "
                "но у некоторых есть второе, «деятельное» значение, и тогда можно.",
    },
    {
        "for": 1,
        "title": "Заметь: после какого глагола что?",
        "source": "Диалог «At Anna's birthday party»",
        "lead": "Ещё четыре фразы из того же разговора. Посмотри, что стоит после выделенного глагола.",
        "examples": [
            {"t": "She's got a small baby, so I **don't mind helping**.", "who": "Nina"},
            {"t": "Do you **fancy coming**?", "who": "Nina"},
            {"t": "I'd **love to** come.", "who": "Sam"},
            {"t": "She **avoids talking** about her family.", "who": "из практики"},
        ],
        "steps": [
            {"q": "После mind, fancy и avoid идёт…",
             "o": ["глагол с -ing", "to + глагол", "и так, и так одинаково"],
             "a": 0,
             "why": "mind, fancy, avoid, enjoy, finish, suggest — всегда с -ing."},
            {"q": "А после would love, want, decide, promise?",
             "o": ["глагол с -ing", "to + глагол", "голая форма без to"],
             "a": 1,
             "why": "want, decide, promise, hope, would love — с to."},
            {"q": "Выбери верное: «He promised ___ me after work.»",
             "o": ["calling", "to call", "call"],
             "a": 1,
             "why": "promise → to call."},
            {"q": "Выбери верное: «We really enjoy ___ time with our neighbours.»",
             "o": ["to spend", "spending", "spend"],
             "a": 1,
             "why": "enjoy → spending."},
        ],
        "rule": "Список приходится запоминать, но есть подсказка: если глагол про желание и план "
                "(want, hope, decide, promise, would love) — обычно to. Если про отношение к самому "
                "процессу (enjoy, mind, avoid, fancy, finish) — обычно -ing.",
    },
    {
        "for": 2,
        "title": "Заметь: насколько сильно?",
        "source": "Диалог «At Anna's birthday party»",
        "lead": "Сэм и Нина почти не говорят «very». Посмотри, чем они пользуются вместо него.",
        "examples": [
            {"t": "I'm **not very** outgoing at parties, to be honest.", "who": "Sam"},
            {"t": "Then we're doing it together, which is **slightly less** embarrassing.", "who": "Nina"},
            {"t": "But you seem **really** friendly.", "who": "Nina"},
            {"t": "That's **really** generous of you.", "who": "Sam"},
            {"t": "This is going **much better** than I expected.", "who": "Sam"},
            {"t": "She's **quite** stubborn, but she's a good friend.", "who": "из практики"},
        ],
        "steps": [
            {"q": "Расставь по силе от слабого к сильному: really / slightly / quite",
             "o": ["slightly → quite → really", "really → quite → slightly", "quite → really → slightly"],
             "a": 0,
             "why": "slightly — чуть-чуть, quite — довольно, really — очень."},
            {"q": "«a bit» в английском обычно звучит…",
             "o": ["как похвала", "как смягчение чего-то неприятного", "как преувеличение"],
             "a": 1,
             "why": "«He's a bit stubborn» мягче, чем «He's stubborn». Британцы так смягчают критику."},
            {"q": "Что усиливает сравнительную степень: «This is ___ better than I expected»?",
             "o": ["very", "much", "really"],
             "a": 1,
             "why": "Перед better/worse/bigger ставим much, far, a lot — но не very."},
        ],
        "rule": "Сила по возрастанию: slightly → a bit → quite → really → absolutely. "
                "Перед сравнительной степенью — much / far / a lot, а не very. "
                "«a bit» чаще всего смягчает что-то отрицательное.",
    },
]


# ============================================================
#   ОТРАБОТКА ГРАММАТИКИ — сразу после объяснения,
#   на тех же героях и той же ситуации, что в диалоге.
# ============================================================
GRAM_PRACTICE = {}

GRAM_PRACTICE[1] = [
    {
        "for": 0,
        "title": "Отработка: Present Simple или Continuous?",
        "lead": "Всё про Сэма и Нину. Выбери форму.",
        "mc": [
            {"q": "Nina ___ at St Mary's — that's her permanent job.", "o": ["is working", "works", "work"], "a": 1},
            {"q": "This week she ___ five nights because a colleague is on leave.", "o": ["works", "is working", "work"], "a": 1},
            {"q": "Sam ___ from home about half the week.", "o": ["is working", "works", "work"], "a": 1},
            {"q": "'Where's Sam?' — 'He ___ to Nina near the food.'", "o": ["talks", "is talking", "talk"], "a": 1},
            {"q": "Sam ___ eight hours of sleep, otherwise he's useless.", "o": ["is needing", "needs", "need"], "a": 1},
            {"q": "Nina ___ her colleague very much.", "o": ["is liking", "likes", "like"], "a": 1},
            {"q": "'This party ___ much better than I expected,' says Sam.", "o": ["goes", "is going", "go"], "a": 1},
            {"q": "Anna ___ everyone at the party — she always does.", "o": ["is knowing", "knows", "know"], "a": 1},
        ],
        "gaps": [
            {"q": "Right now Sam ___ (stand) next to the food.", "a": ["is standing", "'s standing"]},
            {"q": "Nina usually ___ (work) three shifts a week.", "a": ["works"]},
            {"q": "Sam ___ (not / know) how she manages night shifts.", "a": ["doesn't know", "does not know"]},
            {"q": "At the moment they ___ (talk) about their jobs.", "a": ["are talking", "'re talking"]},
        ],
    },
    {
        "for": 1,
        "title": "Отработка: -ing или to?",
        "lead": "Те же герои, тот же вечер.",
        "mc": [
            {"q": "Nina doesn't mind ___ her colleague.", "o": ["to help", "helping", "help"], "a": 1},
            {"q": "Sam would love ___ for coffee on Saturday.", "o": ["going", "to go", "go"], "a": 1},
            {"q": "Sam avoids ___ to strangers at parties.", "o": ["to talk", "talking", "talk"], "a": 1},
            {"q": "Nina suggested ___ coffee at the weekend.", "o": ["to get", "getting", "get"], "a": 1},
            {"q": "Sam promised ___ her the next day.", "o": ["messaging", "to message", "message"], "a": 1},
            {"q": "Do you fancy ___ us on Saturday?", "o": ["to join", "joining", "join"], "a": 1},
        ],
        "gaps": [
            {"q": "I don't mind ___ (wait) — take your time.", "a": ["waiting"]},
            {"q": "She decided ___ (stay) at the party a bit longer.", "a": ["to stay"]},
            {"q": "He finished ___ (talk) and went to get a drink.", "a": ["talking"]},
            {"q": "They hope ___ (see) each other again soon.", "a": ["to see"]},
        ],
    },
    {
        "for": 2,
        "title": "Отработка: насколько сильно?",
        "lead": "Смягчай и усиливай так, как это делают Сэм и Нина.",
        "mc": [
            {"q": "Which is the softest way to criticise a friend?",
             "o": ["He's stubborn.", "He's a bit stubborn.", "He's really stubborn."], "a": 1},
            {"q": "This job is ___ harder than my last one.",
             "o": ["very", "much", "really"], "a": 1},
            {"q": "She's ___ generous — she covers other people's shifts.",
             "o": ["slightly", "really", "a bit"], "a": 1},
            {"q": "Which modifier means 'just a little'?",
             "o": ["absolutely", "slightly", "really"], "a": 1},
            {"q": "'The party was ___ good.' Choose the strongest.",
             "o": ["quite", "a bit", "absolutely"], "a": 2},
        ],
        "gaps": [
            {"q": "He's ___ bit shy at parties, but he's lovely.", "a": ["a"]},
            {"q": "Night shifts are ___ harder than day shifts. (усиление)", "a": ["much", "far", "a lot"]},
            {"q": "She seems ___ friendly. (сильно, но не absolutely)", "a": ["really", "very"]},
        ],
    },
]


# ============================================================
#   ДОМАШНЕЕ ЗАДАНИЕ — отдельный раздел в конце юнита.
#   Не пересказ, а вторая попытка на том же материале:
#   те же слова, те же правила, но новые предложения.
# ============================================================
HOMEWORK = {}

HOMEWORK[1] = {
    "intro": "Домашка собрана из того же материала, что мы разобрали на уроке: "
             "слова из диалога, грамматика из разворотов «Заметь». "
             "Предложения новые — проверяем, осталось ли в голове.",
    "parts": [
        {
            "title": "Домашка 1 · Слова юнита",
            "lead": "Двадцать слов из урока в новых предложениях.",
            "mc": [
                {"q": "Someone you work with is a ___ .", "o": ["colleague", "neighbour", "classmate"], "a": 0},
                {"q": "Someone who lives next door is a ___ .", "o": ["colleague", "neighbour", "acquaintance"], "a": 1},
                {"q": "He never changes his mind. He's very ___ .", "o": ["generous", "stubborn", "polite"], "a": 1},
                {"q": "She gives money to charity every month — she's really ___ .", "o": ["shy", "generous", "talkative"], "a": 1},
                {"q": "You can always count on him. He's ___ .", "o": ["reliable", "stubborn", "shy"], "a": 0},
                {"q": "She talks to everyone at parties. She's very ___ .", "o": ["shy", "outgoing", "reliable"], "a": 1},
                {"q": "We met once at a conference — he's just an ___ , not a friend.", "o": ["colleague", "acquaintance", "classmate"], "a": 1},
                {"q": "Nothing upsets him. He's very easy-___ .", "o": ["going", "doing", "making"], "a": 0},
                {"q": "'Nice to meet you' — you say this when you ___ .", "o": ["meet someone new", "say goodbye", "apologise"], "a": 0},
                {"q": "After she moved abroad, we managed to ___ in touch.", "o": ["keep", "hold", "take"], "a": 0},
            ],
            "gaps": [
                {"q": "They have a lot ___ common — same music, same films.", "a": ["in"]},
                {"q": "He has a great ___ of humour, everyone laughs with him.", "a": ["sense"]},
                {"q": "I want to get to ___ my new colleagues better.", "a": ["know"]},
                {"q": "She's not shy at all — she makes ___ everywhere she goes.", "a": ["friends"]},
                {"q": "Do you ___ if I sit here? (вежливая просьба)", "a": ["mind"]},
            ],
        },
        {
            "title": "Домашка 2 · Present Simple или Continuous",
            "lead": "Первое правило, которое ты вывела сама. Новые предложения.",
            "mc": [
                {"q": "My sister ___ in a hospital — she's been there for years.", "o": ["is working", "works", "work"], "a": 1},
                {"q": "Be quiet, please — the baby ___ .", "o": ["sleeps", "is sleeping", "sleep"], "a": 1},
                {"q": "I ___ what you mean.", "o": ["am not understanding", "don't understand", "not understand"], "a": 1},
                {"q": "We usually ___ dinner at seven.", "o": ["are having", "have", "has"], "a": 1},
                {"q": "Look! It ___ again.", "o": ["rains", "is raining", "rain"], "a": 1},
                {"q": "She ___ this song — it's her favourite.", "o": ["is loving", "loves", "love"], "a": 1},
                {"q": "This month I ___ in a different office while ours is being repaired.", "o": ["work", "am working", "works"], "a": 1},
                {"q": "He ___ three languages but rarely uses them.", "o": ["is speaking", "speaks", "speak"], "a": 1},
            ],
            "gaps": [
                {"q": "At the moment they ___ (look) for a new flat.", "a": ["are looking", "'re looking"]},
                {"q": "She ___ (not / like) crowded places.", "a": ["doesn't like", "does not like"]},
                {"q": "We ___ (have) a great time at the moment!", "a": ["are having", "'re having"]},
                {"q": "My brother ___ (believe) everything he reads online.", "a": ["believes"]},
            ],
        },
        {
            "title": "Домашка 3 · -ing или to, и насколько сильно",
            "lead": "Второе и третье правила вместе.",
            "mc": [
                {"q": "I can't stand ___ in long queues.", "o": ["to wait", "waiting", "wait"], "a": 1},
                {"q": "She decided ___ the job.", "o": ["taking", "to take", "take"], "a": 1},
                {"q": "Would you fancy ___ to the cinema tonight?", "o": ["to go", "going", "go"], "a": 1},
                {"q": "They hope ___ back next summer.", "o": ["coming", "to come", "come"], "a": 1},
                {"q": "This flat is ___ bigger than the old one.", "o": ["very", "much", "really"], "a": 1},
                {"q": "He's ___ bit late, but he's coming.", "o": ["a", "the", "very"], "a": 0},
                {"q": "The food was ___ delicious — I'd go back tomorrow.", "o": ["slightly", "absolutely", "quite"], "a": 1},
                {"q": "I'm ___ tired today, nothing serious.", "o": ["absolutely", "slightly", "much"], "a": 1},
            ],
            "gaps": [
                {"q": "I don't mind ___ (get) up early.", "a": ["getting"]},
                {"q": "She promised ___ (call) me back.", "a": ["to call"]},
                {"q": "This exercise is ___ easier than the last one. (усиление)", "a": ["much", "far", "a lot"]},
                {"q": "He's ___ bit shy, but very kind.", "a": ["a"]},
            ],
        },
    ],
    "write": {
        "title": "Домашка 4 · Напиши сама",
        "lead": "Финальное задание. Пиши прямо здесь — я увижу твой текст в кабинете.",
        "tasks": [
            "Опиши человека, с которым тебе легко общаться: какой он, чем занимается, "
            "как вы познакомились. 6–8 предложений. Используй минимум три слова из юнита "
            "и хотя бы один модификатор (a bit, quite, really).",
            "Напиши, что ты обычно делаешь на вечеринках и что делаешь прямо сейчас, "
            "пока пишешь это задание. 3–4 предложения, Present Simple и Present Continuous рядом.",
            "Закончи три предложения о себе: I don't mind… / I'd love… / I avoid…",
        ],
    },
}
