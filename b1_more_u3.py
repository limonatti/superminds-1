# -*- coding: utf-8 -*-
"""
Юнит 3 «Questions» — авторское расширение.

Сцена: Зоуи и Бен планируют выходные в городе, и по дороге их останавливает
девушка с опросником. Отсюда берутся и вопросы (прямые и вежливые),
и планы (going to / Present Continuous / will), и фразовые глаголы.
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
LONG_DIALOG[3] = {
    "title": "The girl with the questionnaire",
    "names": {"m": "Ben", "f": "Zoe"},
    "intro": "Зоуи и Бен договариваются про субботу — и по дороге попадают на уличный опрос. "
             "Слушай две вещи сразу: как они спрашивают (прямо и вежливо) "
             "и как они говорят о планах.",
    "lines": [
        ["f", "Ben! Hi. How's it going? What are you up to on Saturday?"],
        ["m", "Nothing fixed yet. Why, what are you planning?"],
        ["f", "We're going downtown to see the new museum. Do you want to come?"],
        ["m", "Maybe. Do you know if it's expensive?"],
        ["f", "I don't know, actually. I'll find out tonight and text you."],
        ["m", "Could you tell me what time it opens? I'm working until eleven."],
        ["f", "Ten, I think. But don't quote me on that."],
        ["m", "Then I'll come straight from work. I'm not going to book anything until you check."],
        ["f", "Sensible. Oh — hold on. That girl is looking for someone."],
        ["m", "She's got a clipboard. She's definitely going to ask us something."],
        ["f", "Too late, she's coming over. Be polite."],
        ["m", "Excuse me — are you doing a survey?"],
        ["f", "She wants us to fill in a questionnaire. Five minutes, apparently."],
        ["m", "Fine. What does she want to find out?"],
        ["f", "How often people visit museums downtown. Honest answer: almost never."],
        ["m", "Don't say that, she'll be upset."],
        ["f", "She won't be upset, it's not her museum. Right, question one."],
        ["m", "Can I ask you something first? Why are you being so nice about this?"],
        ["f", "Because I did the same job for a summer and nobody ever stopped."],
        ["m", "Really? You never told me that."],
        ["f", "You never asked. That's how it works with questions, Ben."],
        ["m", "Fair. Okay — what does question three say?"],
        ["f", "'Would you recommend the museum to a friend?' We haven't been yet."],
        ["m", "Then we tick 'don't know' and turn up on Saturday to find out."],
        ["f", "Look at you, being curious."],
        ["m", "I'm always curious. I'm just quiet about it."],
        ["f", "Right, last one. She wants to know how we heard about the entrance being free."],
        ["m", "It's free? Zoe. You didn't say it was free."],
        ["f", "I didn't know! I wonder if that's only on the first Saturday."],
        ["m", "Well, now I'm definitely coming. What time are we meeting?"],
        ["f", "Half ten, by the entrance. Don't be late on purpose."],
        ["m", "I've never been late on purpose in my life."],
    ],
    "questions": [
        {"q": "What are Zoe and her friends doing on Saturday?",
         "o": ["going to a concert", "going downtown to a museum", "filling in questionnaires"], "a": 1},
        {"q": "Why can't Ben come early?",
         "o": ["he's working until eleven", "he doesn't want to", "the museum opens late"], "a": 0},
        {"q": "What does the girl with the clipboard want?",
         "o": ["directions", "them to fill in a questionnaire", "money for the museum"], "a": 1},
        {"q": "Why is Zoe polite to her?",
         "o": ["she knows her", "she did the same job one summer", "she wants a free ticket"], "a": 1},
        {"q": "Why do they tick 'don't know' on question three?",
         "o": ["they haven't been to the museum yet", "they didn't like it", "the question is unclear"], "a": 0},
        {"q": "What surprises Ben at the end?",
         "o": ["the museum is closed", "the entrance is free", "Zoe isn't coming"], "a": 1},
        {"q": "Where are they meeting?",
         "o": ["at the station", "by the entrance", "at Zoe's flat"], "a": 1},
        {"q": "What does Zoe say about questions?",
         "o": ["people ask too many", "you never asked — that's how it works", "she hates them"], "a": 1},
    ],
}


# ============================================================
#   ПОДКАСТ
# ============================================================
PODCAST[3] = {
    "title": "Podcast: The year I asked one stupid question a day",
    "voice": "f",
    "intro": "Монолог. Слушай, где рассказчица задаёт вопросы вслух — прямые и непрямые. "
             "Потом попробуй пересказать своими словами.",
    "text": [
        "Three years ago I made myself a rule: one stupid question a day, out loud, in front of other people.",
        "I did not invent this because I am brave. I invented it because I had spent about fifteen years pretending to understand things.",
        "It started at work. Someone said a word in a meeting — I still remember it — and I nodded, and then I went home and looked it up.",
        "And I thought: I am going to do this for the rest of my life, aren't I? Nodding, and then looking things up alone at night.",
        "So the next morning I asked. I said: sorry, could you tell me what that means? I am not sure I have understood.",
        "Two things happened. First, nobody laughed. Second, three other people said they had not understood either.",
        "That is the part nobody warns you about. When you ask, you are almost never asking only for yourself.",
        "The hardest questions were not the technical ones. They were the small ones. Do you know if this is what you wanted? Are you happy with this? Have I done something wrong?",
        "I am not going to tell you it changed my life, because that is what people always say and it is usually not true.",
        "But I will tell you this: I find out things much faster now, and I spend far fewer evenings looking up words alone.",
    ],
    "questions": [
        {"q": "What rule did she make for herself?",
         "o": ["one stupid question a day", "never to ask questions", "one new word a day"], "a": 0},
        {"q": "Why did she start?",
         "o": ["her boss told her to", "she had spent years pretending to understand", "she was studying"], "a": 1},
        {"q": "What happened the first time she asked?",
         "o": ["people laughed", "nobody laughed and three others hadn't understood either", "she was asked to leave"], "a": 1},
        {"q": "Which questions were hardest for her?",
         "o": ["the technical ones", "the small personal ones", "questions about money"], "a": 1},
        {"q": "Does she say it changed her life?",
         "o": ["yes, completely", "no — she says that's what people always say", "she doesn't mention it"], "a": 1},
        {"q": "What is the practical result?",
         "o": ["she finds things out much faster", "she got a new job", "she stopped going to meetings"], "a": 0},
    ],
}


# ============================================================
#   БОЛЬШОЙ ТЕКСТ
# ============================================================
LONG_READING[3] = {
    "title": "Why a good question is harder than a good answer",
    "html": """
<p>Ask anyone what makes a person clever and most will describe someone with answers.
The person who knows the capital of every country, who can explain how an engine works,
who never has to say <i>I don't know</i>. But talk to people who interview, teach or
investigate for a living, and you get a different picture. Their skill is not answering.
It is asking.</p>

<p>A good question does three things at once. It shows what you already understand,
it points at exactly the gap you want filled, and it makes the other person want to
answer. Miss any one of those and the question fails. <b>Where is the museum?</b> is a
question. <b>Do you know if the museum is open on Sundays?</b> is a better one, because
it tells the listener what you actually need.</p>

<p>Journalists have a rule about this. Never ask a question that can be answered with
<i>yes</i> or <i>no</i> unless the yes or no is the whole story. If you want to find out
what happened, do not ask <i>Were you angry?</i> Ask <i>What went through your head?</i>
The first question offers a box to tick. The second one asks for a story, and stories
contain the details that you did not know enough to ask about.</p>

<p>There is a cost, of course, and it is the reason most of us stay quiet. Asking makes
your ignorance visible. In a meeting, in a classroom, in a shop where everyone else seems
to know what they are doing, the safest thing is to nod. Researchers who study classrooms
have found that the students who ask the fewest questions are very often not the weakest —
they are the ones most worried about looking weak.</p>

<p>The trick that seems to work is lowering the price. Instead of <i>I don't understand</i>,
people say <i>Can I check I've got this right?</i> Instead of <i>What does that mean?</i>,
they say <i>Sorry, could you tell me what you mean by that?</i> Nothing about the ignorance
has changed. What has changed is that the question now sounds like care rather than failure —
and that is enough for most people to finally ask it.</p>

<p>None of this is complicated. It is just uncomfortable, which is a completely different
problem, and a much more common one.</p>
""",
    "questions": [
        {"q": "What does the text say clever people are usually imagined as?",
         "o": ["people with answers", "people with questions", "people who are quiet"], "a": 0},
        {"q": "According to the text, what does a good question do?",
         "o": ["shows what you know, points at the gap, and invites an answer",
               "hides what you don't know", "makes the other person uncomfortable"], "a": 0},
        {"q": "What is the journalists' rule?",
         "o": ["always ask short questions",
               "avoid yes/no questions unless the yes or no is the whole story",
               "never ask about feelings"], "a": 1},
        {"q": "Why is 'What went through your head?' better than 'Were you angry?'",
         "o": ["it is shorter", "it asks for a story instead of a box to tick", "it is more polite"], "a": 1},
        {"q": "What did researchers find about students who ask fewest questions?",
         "o": ["they are the weakest", "they are often the ones most afraid of looking weak",
               "they already know everything"], "a": 1},
        {"q": "What is the 'trick' the text describes?",
         "o": ["asking louder", "rephrasing so the question sounds like care, not failure",
               "asking in writing"], "a": 1},
        {"q": "How does the writer end?",
         "o": ["it is complicated", "it is not complicated, just uncomfortable",
               "it is impossible for most people"], "a": 1},
    ],
}


# ============================================================
#   ДОПОЛНИТЕЛЬНАЯ ПРАКТИКА
# ============================================================
EXTRA_MC[3] = [
    {"q": "Could you tell me ___ ?", "o": ["where is the museum", "where the museum is", "where does the museum"], "a": 1},
    {"q": "___ you know if the entrance is free?", "o": ["Do", "Are", "Does"], "a": 0},
    {"q": "What time ___ the museum open?", "o": ["do", "does", "is"], "a": 1},
    {"q": "I ___ my friends at eleven — it's all arranged.", "o": ["will meet", "'m meeting", "meet"], "a": 1},
    {"q": "Look at that queue. We ___ wait for ages.", "o": ["are going to", "meet", "would"], "a": 0},
    {"q": "Don't worry, I ___ find out for you.", "o": ["'m finding", "'ll", "find"], "a": 1},
    {"q": "She's trying to ___ how the machine works.", "o": ["figure out", "fill in", "turn up"], "a": 0},
    {"q": "Please ___ this form before you leave.", "o": ["fill in", "give up", "look for"], "a": 0},
    {"q": "He didn't ___ until half past twelve.", "o": ["turn up", "find out", "look for"], "a": 0},
    {"q": "I've been ___ my keys all morning.", "o": ["looking for", "finding out", "turning up"], "a": 0},
]

EXTRA_GAP[3] = [
    {"q": "Could you tell me ___ the station is?", "a": ["where"]},
    {"q": "Do you know ___ the shop is open today?", "a": ["if", "whether"]},
    {"q": "What are you ___ to this weekend?", "a": ["up"]},
    {"q": "How's it ___ ?", "a": ["going"]},
    {"q": "I want to find ___ how much it costs.", "a": ["out"]},
    {"q": "She had to fill ___ a long questionnaire.", "a": ["in"]},
    {"q": "Nobody turned ___ to the meeting.", "a": ["up"]},
    {"q": "He broke it on ___ , not by accident.", "a": ["purpose"]},
]


# ============================================================
#   ВЫВЕДИ ПРАВИЛО САМА
# ============================================================
DISCOVERY[3] = [
    {
        "for": 0,
        "title": "Заметь: почему в вежливом вопросе другой порядок слов",
        "source": "Диалог «The girl with the questionnaire»",
        "lead": "В диалоге есть и прямые вопросы, и вежливые. Посмотри на порядок слов "
                "после «Could you tell me…» и «Do you know if…» — он не такой, как ты ждёшь.",
        "examples": [
            {"t": "**What are** you up to on Saturday?", "who": "Zoe"},
            {"t": "Could you tell me **what time it opens**?", "who": "Ben"},
            {"t": "**Do** you **know if it's** expensive?", "who": "Ben"},
            {"t": "**What does** she want to find out?", "who": "Ben"},
            {"t": "She wants to know **how we heard** about the entrance being free.", "who": "Zoe"},
            {"t": "I wonder **if that's** only on the first Saturday.", "who": "Zoe"},
        ],
        "steps": [
            {"q": "«What time does it open?» и «Could you tell me what time it opens?» Что изменилось?",
             "o": ["во втором нет does, и глагол вернулся к обычному порядку",
                   "во втором добавилось does",
                   "ничего не изменилось"],
             "a": 0,
             "why": "В непрямом вопросе вспомогательный do/does/did исчезает, а подлежащее снова идёт перед глаголом."},
            {"q": "Почему «Do you know if it's expensive?», а не «if is it expensive»?",
             "o": ["потому что после if идёт обычный порядок: подлежащее, потом глагол",
                   "потому что так короче",
                   "это ошибка в диалоге"],
             "a": 0,
             "why": "После if / whether вопросительный порядок не нужен: if it is, if she can, if they came."},
            {"q": "Как задать вежливо: «Where is the entrance?»",
             "o": ["Could you tell me where is the entrance?",
                   "Could you tell me where the entrance is?",
                   "Could you tell me where does the entrance?"],
             "a": 1,
             "why": "Where the entrance is — подлежащее раньше глагола."},
            {"q": "Когда в вопросе НЕ нужен do/does?",
             "o": ["когда вопрос про подлежащее: Who came? What happened?",
                   "никогда не нужен",
                   "только в вежливых вопросах"],
             "a": 0,
             "why": "Who came? / What happened? — спрашиваем про того, кто действует, вспомогательный не нужен."},
            {"q": "Какой вопрос правильный?",
             "o": ["Do you know where does she live?",
                   "Do you know where she lives?",
                   "Do you know where lives she?"],
             "a": 1,
             "why": "Непрямой вопрос → обычный порядок слов."},
        ],
        "rule": "<b>Прямой вопрос:</b> вспомогательный впереди — <i>What time does it open?</i> "
                "<b>Непрямой (вежливый):</b> после «Could you tell me…», «Do you know…», «I wonder…» "
                "вспомогательный исчезает и порядок становится обычным — <i>what time it opens</i>. "
                "Если ответ да/нет, вместо вопросительного слова ставим <b>if</b> или <b>whether</b>: "
                "<i>Do you know if it's free?</i> "
                "Вопрос к подлежащему делается без do: <i>Who came? What happened?</i>",
    },
    {
        "for": 1,
        "title": "Заметь: три способа сказать о будущем",
        "source": "Диалог «The girl with the questionnaire»",
        "lead": "В диалоге о будущем говорят три раза по-разному. Это не синонимы — "
                "разница в том, насколько всё уже решено.",
        "examples": [
            {"t": "We**'re going** downtown to see the new museum.", "who": "Zoe"},
            {"t": "I**'ll find out** tonight and text you.", "who": "Zoe"},
            {"t": "She**'s definitely going to ask** us something.", "who": "Ben"},
            {"t": "I**'m not going to book** anything until you check.", "who": "Ben"},
            {"t": "She **won't be** upset, it's not her museum.", "who": "Zoe"},
            {"t": "What time **are** we **meeting**?", "who": "Ben"},
        ],
        "steps": [
            {"q": "«We're going downtown» — когда это решили?",
             "o": ["прямо сейчас, в момент разговора", "заранее, всё уже договорено", "ещё не решили"],
             "a": 1,
             "why": "Present Continuous о будущем = договорённость, которая уже есть: время, место, люди."},
            {"q": "«I'll find out tonight» — Зоуи решила это заранее или прямо сейчас?",
             "o": ["заранее", "прямо сейчас, в ответ на вопрос Бена", "она вообще не решила"],
             "a": 1,
             "why": "will — решение, принятое в момент речи. Часто это обещание или предложение помощи."},
            {"q": "«She's going to ask us something» — на чём основан прогноз Бена?",
             "o": ["на том, что он видит: у неё планшет и она идёт к ним",
                   "на его настроении", "он просто вежлив"],
             "a": 0,
             "why": "going to = есть видимые признаки прямо сейчас. Look at those clouds — it's going to rain."},
            {"q": "Какое предложение звучит естественнее?",
             "o": ["I'm meeting Zoe at half ten. (договорились вчера)",
                   "I'll meet Zoe at half ten. (договорились вчера)",
                   "оба одинаково"],
             "a": 0,
             "why": "Уже договорились → Present Continuous."},
            {"q": "Официант спрашивает, что вы будете. Вы решаете прямо сейчас. Как сказать?",
             "o": ["I'm having the soup.", "I'll have the soup.", "I'm going to have the soup."],
             "a": 1,
             "why": "Решение в момент речи → will."},
        ],
        "rule": "<b>Present Continuous</b> — уже договорено, есть время и место: <i>I'm meeting Zoe at ten.</i> "
                "<b>going to</b> — намерение, которое было до разговора, или прогноз по видимым признакам: "
                "<i>I'm going to book tickets. / It's going to rain.</i> "
                "<b>will</b> — решение прямо сейчас, обещание, предложение помощи, а также мнение о будущем: "
                "<i>I'll find out. / I think it'll be busy.</i>",
    },
    {
        "for": 2,
        "title": "Заметь: фразовые глаголы из диалога",
        "source": "Диалог и подкаст",
        "lead": "Фразовый глагол — это глагол плюс маленькое слово, которое меняет смысл целиком. "
                "Все эти встретились нам в юните.",
        "examples": [
            {"t": "I'll **find out** tonight and text you.", "who": "Zoe"},
            {"t": "She wants us to **fill in** a questionnaire.", "who": "Zoe"},
            {"t": "We tick 'don't know' and **turn up** on Saturday.", "who": "Ben"},
            {"t": "That girl is **looking for** someone.", "who": "Zoe"},
            {"t": "She's trying to **figure out** how it works.", "who": "Практика"},
            {"t": "I **looked** it **up** when I got home.", "who": "Практика"},
        ],
        "steps": [
            {"q": "«find out» — это то же самое, что «find»?",
             "o": ["да, просто длиннее", "нет: find — найти предмет, find out — узнать информацию", "нет, find out значит потерять"],
             "a": 1,
             "why": "I found my keys. / I found out the price. Разные вещи."},
            {"q": "«I looked it up» — почему it стоит в середине?",
             "o": ["потому что так красивее",
                   "потому что местоимение всегда встаёт между глаголом и частицей",
                   "это ошибка"],
             "a": 1,
             "why": "look it up — правильно. look up it — нельзя. С существительным можно и так и так: look up the word / look the word up."},
            {"q": "«look for» и «look up» — в чём разница?",
             "o": ["look for — искать, look up — посмотреть в словаре или интернете",
                   "они синонимы", "look for — смотреть вверх"],
             "a": 0,
             "why": "I'm looking for my keys. / I looked up the word."},
            {"q": "«turn up» в диалоге значит…",
             "o": ["сделать громче", "прийти, появиться", "повернуть"],
             "a": 1,
             "why": "Nobody turned up = никто не пришёл. У turn up есть и значение «сделать громче» — смотри по контексту."},
            {"q": "Какое предложение правильное?",
             "o": ["Please fill in it.", "Please fill it in.", "Please fill in."],
             "a": 1,
             "why": "Местоимение всегда в середине: fill it in."},
        ],
        "rule": "<b>find out</b> — узнать информацию. <b>look for</b> — искать. <b>look up</b> — посмотреть в словаре. "
                "<b>fill in</b> — заполнить (форму). <b>turn up</b> — прийти, появиться. "
                "<b>give up</b> — бросить, сдаться. <b>figure out</b> — разобраться, понять. "
                "Главное правило: местоимение (it, them, him) всегда встаёт <b>между</b> глаголом и частицей — "
                "<i>fill it in</i>, <i>look it up</i>. С существительным можно и так, и так.",
    },
]


# ============================================================
#   ОТРАБОТКА
# ============================================================
GRAM_PRACTICE[3] = [
    {
        "for": 0,
        "title": "Отработка · прямые и вежливые вопросы",
        "lead": "Смотри на начало предложения. Если это «Could you tell me…» или «Do you know…» — "
                "порядок слов обычный.",
        "mc": [
            {"q": "Could you tell me ___ ?", "o": ["where is the entrance", "where the entrance is", "where does the entrance"], "a": 1},
            {"q": "Do you know ___ the museum opens on Sundays?", "o": ["if", "that", "what"], "a": 0},
            {"q": "___ time does the film start?", "o": ["What", "Which is", "How"], "a": 0},
            {"q": "I wonder ___ she's coming.", "o": ["that", "if", "does"], "a": 1},
            {"q": "Do you know ___ ?", "o": ["how much does it cost", "how much it costs", "how much costs it"], "a": 1},
            {"q": "___ happened at the entrance?", "o": ["What did", "What", "What does"], "a": 1},
            {"q": "Could you tell me ___ to the station?", "o": ["how do I get", "how I get", "how getting"], "a": 1},
            {"q": "___ told you about the survey?", "o": ["Who", "Who did", "Whom did"], "a": 0},
            {"q": "She asked me ___ I had filled in the form.", "o": ["that", "if", "did"], "a": 1},
            {"q": "Do you know ___ the tickets are?", "o": ["how much", "how many", "how long"], "a": 0},
        ],
        "gaps": [
            {"q": "Could you tell me where the museum ___ (be)?", "a": ["is"]},
            {"q": "Do you know ___ the entrance is free?", "a": ["if", "whether"]},
            {"q": "What time ___ the shop close?", "a": ["does"]},
            {"q": "I wonder ___ she'll turn up.", "a": ["if", "whether"]},
            {"q": "Who ___ (write) this questionnaire?", "a": ["wrote"]},
            {"q": "Do you know how much it ___ (cost)?", "a": ["costs"]},
        ],
    },
    {
        "for": 1,
        "title": "Отработка · как сказать о будущем",
        "lead": "Задай себе один вопрос: это уже договорено, это намерение или это решение прямо сейчас?",
        "mc": [
            {"q": "I ___ Zoe at half ten — we arranged it yesterday.", "o": ["'ll meet", "'m meeting", "meet"], "a": 1},
            {"q": "Look at that queue — we ___ wait for an hour.", "o": ["'re going to", "meet", "'ll be meeting"], "a": 0},
            {"q": "Don't worry, I ___ help you with the form.", "o": ["'m helping", "'ll", "help"], "a": 1},
            {"q": "She ___ book the tickets tonight — she decided last week.", "o": ["'ll", "'s going to", "books"], "a": 1},
            {"q": "What ___ you ___ this weekend? (уже есть планы)", "o": ["will / do", "are / doing", "do / do"], "a": 1},
            {"q": "I think it ___ be busy on Saturday.", "o": ["'s going", "'ll", "is"], "a": 1},
            {"q": "A: The phone's ringing. B: I ___ get it.", "o": ["'m getting", "'ll", "'m going to"], "a": 1},
            {"q": "We ___ to Rome in July. The flights are booked.", "o": ["'ll fly", "'re flying", "fly"], "a": 1},
            {"q": "Those clouds are black. It ___ rain.", "o": ["will", "'s going to", "'s raining"], "a": 1},
            {"q": "I promise I ___ be late.", "o": ["'m not", "won't", "'m not going"], "a": 1},
        ],
        "gaps": [
            {"q": "I ___ (meet) Ben at eleven — it's arranged.", "a": ["'m meeting", "am meeting"]},
            {"q": "Look out! You ___ (drop) it!", "a": ["'re going to drop", "are going to drop"]},
            {"q": "Don't worry, I ___ (find) out for you.", "a": ["'ll find", "will find"]},
            {"q": "They ___ (get) married in June. The date is fixed.", "a": ["'re getting", "are getting"]},
            {"q": "I think she ___ (like) the museum.", "a": ["'ll like", "will like"]},
        ],
    },
    {
        "for": 2,
        "title": "Отработка · фразовые глаголы",
        "lead": "Помни про местоимение в середине: fill it in, look it up.",
        "mc": [
            {"q": "I need to ___ what time it opens.", "o": ["find out", "look for", "give up"], "a": 0},
            {"q": "She's been ___ her phone all morning.", "o": ["looking for", "finding out", "turning up"], "a": 0},
            {"q": "Please ___ this form and give it back to me.", "o": ["fill in", "turn up", "figure out"], "a": 0},
            {"q": "Nobody ___ to the meeting.", "o": ["turned up", "found out", "filled in"], "a": 0},
            {"q": "Don't ___ — you're nearly there.", "o": ["give up", "look up", "turn up"], "a": 0},
            {"q": "I couldn't ___ how the ticket machine worked.", "o": ["fill in", "figure out", "turn up"], "a": 1},
            {"q": "I didn't know the word, so I ___ .", "o": ["looked it up", "looked up it", "look up it"], "a": 0},
            {"q": "Here's the form. Please ___ .", "o": ["fill in it", "fill it in", "fill in"], "a": 1},
            {"q": "He broke the window on ___ .", "o": ["purpose", "accident", "reason"], "a": 0},
            {"q": "Can you ___ the address for me?", "o": ["look up", "look for up", "up look"], "a": 0},
        ],
        "gaps": [
            {"q": "I'll find ___ and let you know.", "a": ["out"]},
            {"q": "She filled ___ the questionnaire in five minutes.", "a": ["in"]},
            {"q": "Nobody turned ___ .", "a": ["up"]},
            {"q": "Don't give ___ so easily.", "a": ["up"]},
            {"q": "I'm looking ___ my glasses.", "a": ["for"]},
            {"q": "I didn't know it, so I looked it ___ .", "a": ["up"]},
        ],
    },
]


# ============================================================
#   ДОМАШНЕЕ ЗАДАНИЕ
# ============================================================
HOMEWORK[3] = {
    "intro": "Домашка на материале этого юнита: слова и фразовые глаголы из диалога, "
             "вопросы и планы. Предложения новые.",
    "parts": [
        {
            "title": "Домашка 1 · Слова и фразовые глаголы",
            "lead": "Двадцать слов юнита плюс выражения из диалога.",
            "mc": [
                {"q": "I want to ___ how much the tickets cost.", "o": ["find out", "look for", "fill in"], "a": 0},
                {"q": "A set of questions on paper is a ___ .", "o": ["reply", "questionnaire", "direction"], "a": 1},
                {"q": "They stopped people in the street to do a ___ .", "o": ["survey", "ticket", "museum"], "a": 0},
                {"q": "She never answered — I'm still waiting for a ___ .", "o": ["reply", "survey", "direction"], "a": 0},
                {"q": "He's very ___ — he asks about everything.", "o": ["curious", "nearby", "fair"], "a": 0},
                {"q": "I ___ if she's coming or not.", "o": ["wonder", "recommend", "book"], "a": 0},
                {"q": "The café is ___ — two minutes on foot.", "o": ["downtown", "nearby", "on purpose"], "a": 1},
                {"q": "We'll meet by the main ___ of the museum.", "o": ["entrance", "direction", "ticket"], "a": 0},
                {"q": "Can you ___ a good restaurant here?", "o": ["recommend", "wonder", "reply"], "a": 0},
                {"q": "I need to ___ a table for Saturday.", "o": ["book", "fill", "turn"], "a": 0},
                {"q": "He didn't do it by accident — he did it ___ .", "o": ["nearby", "on purpose", "downtown"], "a": 1},
                {"q": "I couldn't ___ how to open the door.", "o": ["figure out", "give up", "turn up"], "a": 0},
            ],
            "gaps": [
                {"q": "What are you ___ to at the weekend?", "a": ["up"]},
                {"q": "How's it ___ ?", "a": ["going"]},
                {"q": "Could you ___ me where the station is?", "a": ["tell"]},
                {"q": "Do you know ___ the museum is open today?", "a": ["if", "whether"]},
                {"q": "Please fill ___ this form.", "a": ["in"]},
                {"q": "Nobody turned ___ at the meeting.", "a": ["up"]},
            ],
        },
        {
            "title": "Домашка 2 · Вопросы прямые и вежливые",
            "lead": "Первое правило, которое ты вывела сама.",
            "mc": [
                {"q": "Could you tell me ___ ?", "o": ["what time is it", "what time it is", "what time does it"], "a": 1},
                {"q": "Do you know ___ she works?", "o": ["where", "where does", "that where"], "a": 0},
                {"q": "___ does this word mean?", "o": ["What", "Which", "How"], "a": 0},
                {"q": "I'd like to know ___ the tickets are still available.", "o": ["if", "that", "do"], "a": 0},
                {"q": "___ gave you my number?", "o": ["Who", "Who did", "Whom"], "a": 0},
                {"q": "Do you know how far ___ ?", "o": ["is it", "it is", "does it"], "a": 1},
                {"q": "She asked me ___ I lived.", "o": ["where", "where did", "that where"], "a": 0},
                {"q": "Could you tell me why ___ ?", "o": ["is she late", "she is late", "does she late"], "a": 1},
                {"q": "___ happened to your phone?", "o": ["What", "What did", "What does"], "a": 0},
                {"q": "I wonder ___ he'll remember.", "o": ["that", "if", "does"], "a": 1},
            ],
            "gaps": [
                {"q": "Could you tell me where the toilets ___ (be)?", "a": ["are"]},
                {"q": "Do you know ___ the shop closes at six?", "a": ["if", "whether"]},
                {"q": "What time ___ the train leave?", "a": ["does"]},
                {"q": "Who ___ (make) this cake?", "a": ["made"]},
                {"q": "I'd like to know how much it ___ (cost).", "a": ["costs"]},
                {"q": "She asked me ___ I had seen the film.", "a": ["if", "whether"]},
            ],
        },
        {
            "title": "Домашка 3 · Планы и будущее",
            "lead": "Второе правило: договорено, намерение или решение прямо сейчас.",
            "mc": [
                {"q": "I ___ the dentist at four. It's booked.", "o": ["'ll see", "'m seeing", "see"], "a": 1},
                {"q": "That bag looks heavy. I ___ carry it for you.", "o": ["'m carrying", "'ll", "'m going to"], "a": 1},
                {"q": "We ___ move house next year — we've decided.", "o": ["'ll", "'re going to", "move"], "a": 1},
                {"q": "Careful — you ___ spill it!", "o": ["will", "'re going to", "spill"], "a": 1},
                {"q": "I think she ___ pass the exam.", "o": ["'ll", "'s going", "is"], "a": 0},
                {"q": "What ___ you ___ tonight? (планы уже есть)", "o": ["will / do", "are / doing", "do / do"], "a": 1},
                {"q": "A: I'm cold. B: I ___ close the window.", "o": ["'m closing", "'ll", "close"], "a": 1},
                {"q": "They ___ to Spain on Friday. Tickets are booked.", "o": ["'ll fly", "'re flying", "fly"], "a": 1},
                {"q": "I promise I ___ tell anyone.", "o": ["don't", "won't", "'m not"], "a": 1},
                {"q": "She ___ study medicine — that's been her plan for years.", "o": ["'ll", "'s going to", "studies"], "a": 1},
            ],
            "gaps": [
                {"q": "I ___ (see) the doctor at three. It's arranged.", "a": ["'m seeing", "am seeing"]},
                {"q": "Look at the sky — it ___ (rain).", "a": ["'s going to rain", "is going to rain"]},
                {"q": "Don't worry, I ___ (help) you.", "a": ["'ll help", "will help"]},
                {"q": "We ___ (buy) a car next month — we've saved up.", "a": ["'re going to buy", "are going to buy"]},
                {"q": "I think they ___ (be) late.", "a": ["'ll be", "will be"]},
                {"q": "What ___ you ___ (do) on Saturday? (планы есть)", "a": ["are doing"]},
            ],
        },
    ],
    "write": {
        "title": "Домашка 4 · Напиши сама",
        "lead": "Три письменных задания. Пиши коротко и понятно.",
        "tasks": [
            "Составь опросник из шести вопросов для гостя города: три прямых "
            "(What time…? / How much…?) и три вежливых (Could you tell me… / Do you know if…). "
            "Подчеркни, где порядок слов поменялся.",
            "Напиши сообщение подруге про планы на выходные — 6–8 предложений. "
            "Используй хотя бы один Present Continuous (уже договорились), "
            "один going to (намерение) и один will (решишь по ходу).",
            "Напиши пять предложений о себе с фразовыми глаголами: find out, look for, "
            "give up, fill in, turn up. В двух из них поставь местоимение в середину.",
        ],
    },
}
