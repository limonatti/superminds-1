# -*- coding: utf-8 -*-
"""
Юнит 5 «News» — авторское расширение.

Сцена: Лена приносит Максу слух про закрытие старого кинотеатра, и они полдня
пытаются понять, правда это или нет. Отсюда идут relative clauses, reported speech
и прогнозы will / might / going to.
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
LONG_DIALOG[5] = {
    "title": "The story that wasn't true",
    "names": {"m": "Max", "f": "Lena"},
    "intro": "Лена прибегает с новостью, Макс не спешит верить. Слушай, как они "
             "пересказывают чужие слова и как описывают людей и места придаточными.",
    "lines": [
        ["f", "Max! Guess what. The old cinema is closing."],
        ["m", "The one on Green Street? Who told you that?"],
        ["f", "It's everywhere. A journalist who works for the local paper posted it this morning."],
        ["m", "Posted it where, though? On the paper's site or on his own page?"],
        ["f", "His own page, I think. Does that matter?"],
        ["m", "It matters a lot. A post that nobody has checked isn't news, it's a rumour."],
        ["f", "He said the owners had already signed the papers."],
        ["m", "And did he say where he got that from?"],
        ["f", "No. He said he couldn't name his source."],
        ["m", "Which is exactly what people say when they haven't got one."],
        ["f", "You're such a cynic. It's got four thousand shares."],
        ["m", "Lena, that's the point. A story which goes viral in three hours has usually skipped every check."],
        ["f", "All right, fine. How would you check it?"],
        ["m", "I'd ring the cinema. The woman whose name is on the door has run it for twenty years."],
        ["f", "You want me to just phone her?"],
        ["m", "It's the fastest way. Everyone else is reading a post about a post about a post."],
        ["f", "Okay, hold on… It's ringing. Hello? Yes, hi — I'm calling about the news online."],
        ["m", "Put her on speaker."],
        ["f", "She says nobody has signed anything. She says they're negotiating a new lease."],
        ["m", "So it might close eventually, but it isn't closing next month."],
        ["f", "She also told me she'd already asked him to take the post down."],
        ["m", "And he hasn't. Of course he hasn't. It's the best week his page has ever had."],
        ["f", "I feel a bit stupid now. I shared it to about eighty people."],
        ["m", "Don't. Everyone does it. The trick is what you do in the next ten minutes."],
        ["f", "Post a correction, you mean?"],
        ["m", "Post a correction. It won't spread nearly as fast, but the people who trust you will see it."],
        ["f", "Do you think anyone will read it?"],
        ["m", "Some will. And next time they'll wait a day before sharing, which is the whole point."],
        ["f", "Right. I'm writing it now. 'The cinema which everyone said was closing…'"],
        ["m", "'…is not closing.' Short is better. Long corrections look like excuses."],
    ],
    "questions": [
        {"q": "What news does Lena bring?",
         "o": ["the cinema is closing", "the cinema is being rebuilt", "a journalist has been fired"], "a": 0},
        {"q": "Where did the journalist post the story?",
         "o": ["on the paper's website", "on his own page", "in the printed paper"], "a": 1},
        {"q": "Why does Max say that matters?",
         "o": ["a post nobody has checked is a rumour, not news",
               "the paper's site is slower", "he doesn't like the journalist"], "a": 0},
        {"q": "How does Max suggest checking the story?",
         "o": ["read the comments", "ring the woman who runs the cinema", "wait a week"], "a": 1},
        {"q": "What does the owner say?",
         "o": ["nobody has signed anything; they're negotiating a lease",
               "the cinema closes next month", "she has already sold it"], "a": 0},
        {"q": "What had the owner asked the journalist to do?",
         "o": ["write a longer article", "take the post down", "interview her"], "a": 1},
        {"q": "What does Max advise Lena to do?",
         "o": ["delete her account", "post a short correction", "nothing at all"], "a": 1},
        {"q": "Why does Max say short corrections are better?",
         "o": ["they spread faster", "long ones look like excuses", "nobody reads long posts"], "a": 1},
    ],
}


# ============================================================
#   ПОДКАСТ
# ============================================================
PODCAST[5] = {
    "title": "Podcast: The day I got it wrong on the front page",
    "voice": "f",
    "intro": "Журналистка рассказывает про свою худшую ошибку. Следи за пересказом "
             "чужих слов — она всё время передаёт, кто что сказал.",
    "text": [
        "I have been a journalist for nineteen years, and I have made exactly one mistake that I still think about every week.",
        "It was a small story. A local company which had been given public money was closing its factory, and two hundred people were losing their jobs.",
        "A man who worked there rang me and said the managers had known for months. He said they had told nobody.",
        "It was a good story and it was true, except for one word. He said months. The documents, which I read three days later, said weeks.",
        "I printed months. And the difference between months and weeks was the difference between a scandal and a sad, ordinary closure.",
        "The company complained. My editor asked me where I had got the number, and I told her a source had said it on the phone.",
        "She asked me whether I had checked it against anything written. I had not.",
        "We printed a correction. It was four lines on page eleven, and the original had been on page one, and everybody knows what that means.",
        "What I learned was not don't trust people. Most people who ring journalists are telling the truth as they remember it.",
        "What I learned is that memory is a source like any other, and a source which nobody double-checks will eventually put you on page eleven.",
    ],
    "questions": [
        {"q": "How long has she been a journalist?",
         "o": ["nine years", "nineteen years", "ninety years"], "a": 1},
        {"q": "What was the story about?",
         "o": ["a factory closing", "a school closing", "a new company opening"], "a": 0},
        {"q": "What did the man who rang her say?",
         "o": ["the managers had known for months", "the factory would stay open", "he had lost his job"], "a": 0},
        {"q": "What did the documents say?",
         "o": ["months", "weeks", "years"], "a": 1},
        {"q": "What did her editor ask her?",
         "o": ["whether she had checked it against anything written", "who her source was", "why she was late"], "a": 0},
        {"q": "Where was the correction printed?",
         "o": ["on the front page", "four lines on page eleven", "it wasn't printed"], "a": 1},
        {"q": "What did she learn?",
         "o": ["never trust anyone", "memory is a source, and unchecked sources cost you", "never use the phone"], "a": 1},
    ],
}


# ============================================================
#   БОЛЬШОЙ ТЕКСТ
# ============================================================
LONG_READING[5] = {
    "title": "Why the false version always arrives first",
    "html": """
<p>There is a rule in newsrooms that nobody likes repeating out loud: the wrong version of a
story is nearly always faster than the right one. It is not a comment about dishonest people.
It is arithmetic. A story that has been checked has to wait for someone to answer the phone.
A story that has not been checked only has to wait for someone to press <i>share</i>.</p>

<p>Researchers who studied millions of posts found something that surprised even them. False
stories did not spread faster because of automated accounts. They spread faster because
<b>ordinary people shared them more willingly</b>. And the reason was not stupidity. It was
novelty. A false story is free to be more surprising than the truth, because nothing is holding
it to the ground.</p>

<p>This creates a horrible shape. The false version arrives on Monday, feels new, and travels.
The correction arrives on Wednesday, feels boring, and does not. By Friday a great many people
have heard the story once and the correction never. They are not careless — they simply were
not in the room the second time.</p>

<p>So what actually helps? Not, it turns out, lecturing people about sources. The habit that
makes the most difference is embarrassingly small: <b>wait</b>. Almost every false story that
has ever caused real damage would have been caught by one person who waited a day before
sharing it. A day is enough time for the phone to be answered.</p>

<p>The second habit is even smaller. When you find out you have shared something wrong, say so
in public, quickly, and briefly. Your correction will not travel as far as your mistake — nobody's
does. But the people who saw the first post are exactly the people who follow you, and they are
the ones who will read it.</p>

<p>None of this needs a new law or a new app. It needs a day, and the ability to say
<i>I got that wrong</i> without dying of embarrassment. Both are free, and both are rarer than
they should be.</p>
""",
    "questions": [
        {"q": "Why is the wrong version usually faster?",
         "o": ["checked stories have to wait for someone to answer the phone",
               "journalists are lazy", "the internet is too slow"], "a": 0},
        {"q": "What did researchers find about false stories?",
         "o": ["only bots spread them", "ordinary people shared them more willingly",
               "they spread more slowly"], "a": 1},
        {"q": "Why do false stories feel more interesting?",
         "o": ["they are longer", "they are free to be more surprising than the truth",
               "they have better pictures"], "a": 1},
        {"q": "What is the 'horrible shape' described?",
         "o": ["the false version travels and the correction doesn't",
               "corrections come first", "nobody reads news at all"], "a": 0},
        {"q": "What single habit helps most?",
         "o": ["reading more news", "waiting a day before sharing", "blocking accounts"], "a": 1},
        {"q": "What should you do after sharing something false?",
         "o": ["delete everything quietly", "say so in public, quickly and briefly",
               "explain at length why it wasn't your fault"], "a": 1},
        {"q": "Who is most likely to read your correction?",
         "o": ["strangers", "the people who follow you and saw the first post", "journalists"], "a": 1},
    ],
}


# ============================================================
#   ДОПОЛНИТЕЛЬНАЯ ПРАКТИКА
# ============================================================
EXTRA_MC[5] = [
    {"q": "The journalist ___ wrote the story works for a local paper.", "o": ["who", "which", "whose"], "a": 0},
    {"q": "A story ___ goes viral in three hours has usually skipped every check.", "o": ["who", "which", "whose"], "a": 1},
    {"q": "The woman ___ name is on the door has run it for twenty years.", "o": ["who", "which", "whose"], "a": 2},
    {"q": "That's the café ___ we first met.", "o": ["which", "where", "whose"], "a": 1},
    {"q": "She said she ___ check the source.", "o": ["will", "would", "won't"], "a": 1},
    {"q": "He told me he ___ seen the post already.", "o": ["has", "had", "have"], "a": 1},
    {"q": "'I'm busy,' she said. → She said she ___ busy.", "o": ["is", "was", "were"], "a": 1},
    {"q": "It's cloudy — I think it ___ rain later.", "o": ["might", "must", "should"], "a": 0},
    {"q": "Look at those clouds. It ___ rain.", "o": ["will", "'s going to", "might not"], "a": 1},
    {"q": "I'm sure she ___ love the news.", "o": ["'ll", "'s going", "might"], "a": 0},
]

EXTRA_GAP[5] = [
    {"q": "Did you hear? The story went ___ overnight.", "a": ["viral"]},
    {"q": "That's not a reliable ___ — check it somewhere else.", "a": ["source"]},
    {"q": "Guess ___ ! They're reopening the theatre.", "a": ["what"]},
    {"q": "You'll never ___ what happened this morning.", "a": ["believe"]},
    {"q": "As ___ as I know, nothing has been signed.", "a": ["far"]},
    {"q": "She was the first to break the ___ .", "a": ["news"]},
    {"q": "It was on the front ___ of every paper.", "a": ["page"]},
    {"q": "Always double-___ before you share.", "a": ["check"]},
]


# ============================================================
#   ВЫВЕДИ ПРАВИЛО САМА
# ============================================================
DISCOVERY[5] = [
    {
        "for": 0,
        "title": "Заметь: как приклеить описание к существительному",
        "source": "Диалог «The story that wasn't true»",
        "lead": "Макс и Лена всё время уточняют, о ком и о чём речь. "
                "Посмотри на маленькое слово после существительного — оно каждый раз разное.",
        "examples": [
            {"t": "A journalist **who** works for the local paper posted it.", "who": "Lena"},
            {"t": "A post **that** nobody has checked isn't news, it's a rumour.", "who": "Max"},
            {"t": "A story **which** goes viral in three hours has usually skipped every check.", "who": "Max"},
            {"t": "The woman **whose** name is on the door has run it for twenty years.", "who": "Max"},
            {"t": "The cinema **which** everyone said was closing is not closing.", "who": "Lena"},
            {"t": "That's the café **where** we first met.", "who": "Практика"},
        ],
        "steps": [
            {"q": "«A journalist who works…» и «A story which goes viral…». Отчего зависит выбор?",
             "o": ["who — про людей, which — про вещи",
                   "who — в начале, which — в конце",
                   "разницы нет"],
             "a": 0,
             "why": "who — люди, which — предметы и явления. that подходит и туда, и туда."},
            {"q": "«The woman whose name is on the door». Что значит whose?",
             "o": ["который находится", "чей, чья — принадлежность", "где"],
             "a": 1,
             "why": "whose = чей. The man whose car was stolen. Работает и с людьми, и с вещами."},
            {"q": "«That's the café where we first met». Почему where, а не which?",
             "o": ["потому что café — место", "потому что café — французское слово", "это ошибка"],
             "a": 0,
             "why": "where — для мест. the town where I grew up, the room where it happened."},
            {"q": "Где можно выбросить who/which/that: «The post that nobody has checked» или «The journalist who wrote it»?",
             "o": ["в первом", "во втором", "нигде нельзя"],
             "a": 0,
             "why": "Если после who/which/that идёт новое подлежащее (nobody), слово можно убрать: "
                    "The post nobody has checked. Если сразу глагол — убирать нельзя."},
            {"q": "Какое предложение правильное?",
             "o": ["The man which called me was a journalist.",
                   "The man who called me was a journalist.",
                   "The man whose called me was a journalist."],
             "a": 1,
             "why": "Человек → who."},
        ],
        "rule": "<b>who</b> — про людей. <b>which</b> — про предметы и явления. "
                "<b>that</b> — и про то, и про другое (в разговоре чаще всего). "
                "<b>whose</b> — чей: <i>the woman whose name is on the door.</i> "
                "<b>where</b> — про места: <i>the café where we met.</i> "
                "Если после связки сразу идёт другое подлежащее, связку можно опустить: "
                "<i>the post (that) nobody checked</i>.",
    },
    {
        "for": 1,
        "title": "Заметь: как пересказать чужие слова",
        "source": "Диалог и подкаст",
        "lead": "В диалоге постоянно передают чужую речь. Сравни, что человек сказал "
                "на самом деле и как это пересказали — что-то съехало на шаг назад.",
        "examples": [
            {"t": "'I'll check the source.' → She **said** she **would** check the source.", "who": "Lena"},
            {"t": "'The owners have signed.' → He **said** the owners **had** already **signed** the papers.", "who": "Lena"},
            {"t": "'I can't name my source.' → He **said** he **couldn't** name his source.", "who": "Lena"},
            {"t": "'Nobody has signed anything.' → She **says** nobody **has signed** anything.", "who": "Lena"},
            {"t": "She also **told me** she**'d already asked** him to take the post down.", "who": "Lena"},
            {"t": "My editor **asked me where I had got** the number.", "who": "Подкаст"},
        ],
        "steps": [
            {"q": "«I'll check» превратилось в «she would check». Что произошло с временем?",
             "o": ["сдвинулось на шаг назад: will → would",
                   "ничего не изменилось",
                   "стало будущим в будущем"],
             "a": 0,
             "why": "При пересказе после said время обычно уходит на шаг назад: "
                    "am → was, do → did, will → would, can → could, have done → had done."},
            {"q": "«She says nobody has signed anything» — а тут почему has, а не had?",
             "o": ["потому что says в настоящем — сдвигать не нужно",
                   "это ошибка",
                   "потому что новость свежая"],
             "a": 0,
             "why": "Если вводящий глагол в настоящем (says, tells me), сдвига нет."},
            {"q": "В чём разница между said и told?",
             "o": ["told требует адресата: told me, told her. said — без адресата",
                   "они полностью взаимозаменяемы",
                   "told используется только в вопросах"],
             "a": 0,
             "why": "He said (that) he was tired. He told me (that) he was tired. "
                    "«He said me» — ошибка."},
            {"q": "«Where did you get it?» → как пересказать?",
             "o": ["She asked where did I get it.",
                   "She asked where I had got it.",
                   "She asked where got I it."],
             "a": 1,
             "why": "В пересказанном вопросе порядок слов обычный и вспомогательный did исчезает."},
            {"q": "«Are you coming?» → как пересказать?",
             "o": ["He asked if I was coming.", "He asked was I coming.", "He asked that I was coming."],
             "a": 0,
             "why": "Вопрос без вопросительного слова пересказывается через if / whether."},
        ],
        "rule": "После <b>said / told</b> в прошедшем времена сдвигаются на шаг назад: "
                "<i>am → was, do → did, did → had done, will → would, can → could, must → had to</i>. "
                "Меняются и местоимения с обстоятельствами: <i>I → he, today → that day, tomorrow → the next day</i>. "
                "<b>told</b> требует адресата (told me), <b>said</b> — нет. "
                "Пересказанный вопрос: обычный порядок слов, без do/does/did; "
                "если ответ да/нет — через <b>if</b> или <b>whether</b>.",
    },
    {
        "for": 2,
        "title": "Заметь: насколько ты уверена в будущем",
        "source": "Диалог и практика",
        "lead": "Три способа сказать о будущем — но здесь они различаются не планом, "
                "а степенью уверенности.",
        "examples": [
            {"t": "It **might** just **be** a rumour.", "who": "Lena"},
            {"t": "If it's reliable, it**'ll be** very sad news for the town.", "who": "Max"},
            {"t": "So it **might close** eventually, but it **isn't closing** next month.", "who": "Max"},
            {"t": "It **won't spread** nearly as fast.", "who": "Max"},
            {"t": "Look at those clouds. It**'s going to rain**.", "who": "Практика"},
            {"t": "Next time they**'ll wait** a day before sharing.", "who": "Max"},
        ],
        "steps": [
            {"q": "«It might just be a rumour» — насколько Лена уверена?",
             "o": ["уверена полностью", "не уверена, это возможность", "уверена, что нет"],
             "a": 1,
             "why": "might / may = возможно, процентов пятьдесят. Уверенности нет."},
            {"q": "«It's going to rain» после «look at those clouds» — на чём основан прогноз?",
             "o": ["на личном мнении", "на том, что видно прямо сейчас", "на прогнозе погоды"],
             "a": 1,
             "why": "going to — есть признаки в настоящем, которые указывают на будущее."},
            {"q": "«I think it'll be sad news» — это факт или мнение?",
             "o": ["факт", "мнение или предсказание говорящего", "обещание"],
             "a": 1,
             "why": "will — мнение о будущем. Часто идёт с I think, I'm sure, probably."},
            {"q": "Как сказать «может быть, я приду, а может, нет»?",
             "o": ["I'll come.", "I might come.", "I'm going to come."],
             "a": 1,
             "why": "might — именно неуверенность."},
            {"q": "Что сильнее: «It might close» или «It's going to close»?",
             "o": ["might сильнее", "going to сильнее", "одинаково"],
             "a": 1,
             "why": "going to — есть основания думать, что это случится. might — просто возможность."},
        ],
        "rule": "<b>might / may</b> — возможно, но не факт: <i>It might just be a rumour.</i> "
                "<b>will</b> — мнение, предсказание, уверенность: <i>I think it'll be sad news.</i> "
                "<b>going to</b> — есть видимые основания прямо сейчас: <i>Look at those clouds — it's going to rain.</i> "
                "Отрицание might: <i>might not</i> (не сокращается до mightn't в современной речи). "
                "Отрицание will: <i>won't</i>.",
    },
]


# ============================================================
#   ОТРАБОТКА
# ============================================================
GRAM_PRACTICE[5] = [
    {
        "for": 0,
        "title": "Отработка · who, which, that, whose, where",
        "lead": "Спроси себя: это человек, вещь, принадлежность или место?",
        "mc": [
            {"q": "The woman ___ called you is a journalist.", "o": ["who", "which", "whose"], "a": 0},
            {"q": "The article ___ you sent me was excellent.", "o": ["who", "which", "whose"], "a": 1},
            {"q": "That's the man ___ car was stolen.", "o": ["who", "which", "whose"], "a": 2},
            {"q": "This is the town ___ I grew up.", "o": ["which", "where", "whose"], "a": 1},
            {"q": "A rumour is a story ___ nobody has checked.", "o": ["who", "that", "whose"], "a": 1},
            {"q": "The editor ___ I spoke to was very helpful.", "o": ["who", "which", "where"], "a": 0},
            {"q": "It's the only paper ___ still checks its sources.", "o": ["who", "that", "whose"], "a": 1},
            {"q": "The company ___ factory closed employed 200 people.", "o": ["who", "which", "whose"], "a": 2},
            {"q": "That's the office ___ she works.", "o": ["which", "where", "that"], "a": 1},
            {"q": "The people ___ shared it didn't read it.", "o": ["who", "which", "whose"], "a": 0},
        ],
        "gaps": [
            {"q": "The journalist ___ wrote it has apologised.", "a": ["who", "that"]},
            {"q": "A post ___ goes viral isn't always true.", "a": ["which", "that"]},
            {"q": "The woman ___ name is on the door runs the cinema.", "a": ["whose"]},
            {"q": "That's the café ___ we first met.", "a": ["where"]},
            {"q": "The story ___ everyone shared was false.", "a": ["that", "which"]},
        ],
    },
    {
        "for": 1,
        "title": "Отработка · пересказ чужих слов",
        "lead": "Сдвигай время на шаг назад, если вводящий глагол в прошедшем.",
        "mc": [
            {"q": "'I'm tired.' → He said he ___ tired.", "o": ["is", "was", "were"], "a": 1},
            {"q": "'I'll call you.' → She said she ___ call me.", "o": ["will", "would", "won't"], "a": 1},
            {"q": "'I've seen it.' → He said he ___ seen it.", "o": ["has", "had", "have"], "a": 1},
            {"q": "'I can't come.' → She said she ___ come.", "o": ["can't", "couldn't", "wouldn't"], "a": 1},
            {"q": "'Where do you live?' → He asked where I ___ .", "o": ["do live", "lived", "did live"], "a": 1},
            {"q": "'Are you coming?' → She asked ___ I was coming.", "o": ["that", "if", "did"], "a": 1},
            {"q": "He ___ me he was busy.", "o": ["said", "told", "asked"], "a": 1},
            {"q": "She ___ that she had already left.", "o": ["said", "told", "told to"], "a": 0},
            {"q": "'I saw her yesterday.' → He said he ___ her the day before.", "o": ["saw", "had seen", "has seen"], "a": 1},
            {"q": "'We must hurry.' → They said they ___ hurry.", "o": ["must", "had to", "have to"], "a": 1},
        ],
        "gaps": [
            {"q": "'I'm busy.' → She said she ___ busy.", "a": ["was"]},
            {"q": "'I'll check.' → He said he ___ check.", "a": ["would"]},
            {"q": "'I have finished.' → She said she ___ finished.", "a": ["had"]},
            {"q": "'Do you know him?' → He asked ___ I knew him.", "a": ["if", "whether"]},
            {"q": "She ___ me she was leaving. (said или told)", "a": ["told"]},
        ],
    },
    {
        "for": 2,
        "title": "Отработка · will, might, going to",
        "lead": "Уверена — will. Возможно — might. Видишь признаки — going to.",
        "mc": [
            {"q": "I'm not sure. I ___ come, I ___ not.", "o": ["will / will", "might / might", "am going to / am not"], "a": 1},
            {"q": "Look at the sky. It ___ snow.", "o": ["will", "'s going to", "might not"], "a": 1},
            {"q": "I think she ___ like it.", "o": ["'ll", "'s going", "might to"], "a": 0},
            {"q": "Take an umbrella — it ___ rain later.", "o": ["might", "must", "should"], "a": 0},
            {"q": "I promise I ___ tell anyone.", "o": ["won't", "might not", "'m not going"], "a": 0},
            {"q": "He's been studying all year. He ___ pass.", "o": ["might not", "'s going to", "won't"], "a": 1},
            {"q": "A: The phone's ringing. B: I ___ answer it.", "o": ["'ll", "might", "'m going to"], "a": 0},
            {"q": "The story ___ be true, but I doubt it.", "o": ["will", "might", "'s going to"], "a": 1},
            {"q": "Careful! You ___ drop it.", "o": ["will", "'re going to", "might not"], "a": 1},
            {"q": "I'm sure everything ___ be fine.", "o": ["will", "might", "'s going"], "a": 0},
        ],
        "gaps": [
            {"q": "It's cloudy — it ___ (возможно) rain.", "a": ["might rain", "may rain"]},
            {"q": "Look out! You ___ (видно) fall!", "a": ["'re going to fall", "are going to fall"]},
            {"q": "I think they ___ (мнение) win.", "a": ["'ll win", "will win"]},
            {"q": "I promise I ___ (не буду) be late.", "a": ["won't", "will not"]},
            {"q": "She ___ (возможно не) come tonight.", "a": ["might not come", "may not come"]},
        ],
    },
]


# ============================================================
#   ДОМАШНЕЕ ЗАДАНИЕ
# ============================================================
HOMEWORK[5] = {
    "intro": "Домашка на материале юнита: слова про новости и медиа, три правила, "
             "которые ты вывела сама.",
    "parts": [
        {
            "title": "Домашка 1 · Слова и выражения юнита",
            "lead": "Двадцать слов из урока в новых предложениях.",
            "mc": [
                {"q": "The big words at the top of an article are the ___ .", "o": ["headline", "source", "editor"], "a": 0},
                {"q": "A person who writes for a newspaper is a ___ .", "o": ["editor", "journalist", "source"], "a": 1},
                {"q": "The person who decides what gets printed is the ___ .", "o": ["editor", "journalist", "reader"], "a": 0},
                {"q": "Nobody knows if it's true — it's just a ___ .", "o": ["rumour", "headline", "update"], "a": 0},
                {"q": "The video got two million views in a day — it went ___ .", "o": ["viral", "fake", "reliable"], "a": 0},
                {"q": "Where did you get that information? What's your ___ ?", "o": ["source", "update", "comment"], "a": 0},
                {"q": "You can believe her — she's a ___ source.", "o": ["fake", "reliable", "viral"], "a": 1},
                {"q": "The story was completely made up. It was ___ news.", "o": ["breaking", "fake", "front"], "a": 1},
                {"q": "They're going to ___ the results tomorrow.", "o": ["announce", "spread", "double-check"], "a": 0},
                {"q": "The photo was on the ___ page of every paper.", "o": ["front", "back", "comment"], "a": 0},
                {"q": "She's going to ___ the prime minister on Friday.", "o": ["interview", "report", "post"], "a": 0},
                {"q": "Always ___ before you share something.", "o": ["double-check", "spread", "post"], "a": 0},
            ],
            "gaps": [
                {"q": "Guess ___ ! They're reopening the cinema.", "a": ["what"]},
                {"q": "You'll never ___ what I just read.", "a": ["believe"]},
                {"q": "As ___ as I know, it hasn't been confirmed.", "a": ["far"]},
                {"q": "She was the one to break the ___ .", "a": ["news"]},
                {"q": "That's not true — it's fake ___ .", "a": ["news"]},
                {"q": "The clip went ___ within an hour.", "a": ["viral"]},
            ],
        },
        {
            "title": "Домашка 2 · Придаточные и пересказ",
            "lead": "Первое и второе правила вместе.",
            "mc": [
                {"q": "The man ___ wrote the article has apologised.", "o": ["who", "which", "whose"], "a": 0},
                {"q": "The paper ___ printed it is very small.", "o": ["who", "which", "whose"], "a": 1},
                {"q": "That's the journalist ___ story was false.", "o": ["who", "which", "whose"], "a": 2},
                {"q": "This is the building ___ it happened.", "o": ["which", "where", "that"], "a": 1},
                {"q": "'I'm leaving.' → He said he ___ leaving.", "o": ["is", "was", "were"], "a": 1},
                {"q": "'I'll check it.' → She said she ___ check it.", "o": ["will", "would", "checked"], "a": 1},
                {"q": "'Have you read it?' → He asked ___ I had read it.", "o": ["that", "if", "did"], "a": 1},
                {"q": "'Where is she?' → They asked where she ___ .", "o": ["is", "was", "were"], "a": 1},
                {"q": "He ___ me the news was fake.", "o": ["said", "told", "asked to"], "a": 1},
                {"q": "She ___ that she had already posted a correction.", "o": ["said", "told", "told to"], "a": 0},
            ],
            "gaps": [
                {"q": "The woman ___ runs the cinema answered the phone.", "a": ["who", "that"]},
                {"q": "A story ___ nobody checks is a rumour.", "a": ["that", "which"]},
                {"q": "That's the town ___ she was born.", "a": ["where"]},
                {"q": "'I can't come.' → He said he ___ come.", "a": ["couldn't", "could not"]},
                {"q": "'I've seen it.' → She said she ___ seen it.", "a": ["had"]},
                {"q": "He ___ me he was busy. (said или told)", "a": ["told"]},
            ],
        },
        {
            "title": "Домашка 3 · Прогнозы и уверенность",
            "lead": "Третье правило: will, might, going to.",
            "mc": [
                {"q": "I'm sure she ___ love it.", "o": ["'ll", "might", "'s going"], "a": 0},
                {"q": "Those clouds are black. It ___ rain.", "o": ["will", "'s going to", "might not"], "a": 1},
                {"q": "I ___ come tonight — I haven't decided.", "o": ["will", "might", "'m going to"], "a": 1},
                {"q": "Careful! You ___ break it.", "o": ["will", "'re going to", "might not"], "a": 1},
                {"q": "I promise I ___ be late.", "o": ["won't", "might not", "'m not going"], "a": 0},
                {"q": "He's studied all year — he ___ pass easily.", "o": ["might", "'s going to", "won't"], "a": 1},
                {"q": "It ___ be true, but I really doubt it.", "o": ["will", "might", "'s going to"], "a": 1},
                {"q": "A: I'm cold. B: I ___ close the window.", "o": ["'ll", "might", "'m going to"], "a": 0},
                {"q": "I think the story ___ spread quickly.", "o": ["will", "might to", "going to"], "a": 0},
                {"q": "She ___ come — she said she was busy.", "o": ["might not", "won't be", "isn't going"], "a": 0},
            ],
            "gaps": [
                {"q": "I'm sure it ___ (будет) fine.", "a": ["will be", "'ll be"]},
                {"q": "Take a coat — it ___ (возможно) get cold.", "a": ["might get", "may get"]},
                {"q": "Look at that queue — we ___ (видно) wait ages.", "a": ["'re going to wait", "are going to wait"]},
                {"q": "I ___ (не буду) share it until I've checked.", "a": ["won't", "will not"]},
                {"q": "She ___ (возможно не) answer the phone.", "a": ["might not answer", "may not answer"]},
            ],
        },
    ],
    "write": {
        "title": "Домашка 4 · Напиши сама",
        "lead": "Три письменных задания.",
        "tasks": [
            "Напиши короткую новость о своём городе — 6–8 предложений. "
            "Используй минимум три придаточных с who / which / whose / where "
            "и подчеркни их.",
            "Перескажи разговор, который у тебя был на этой неделе — 6 предложений. "
            "Каждое начни с «She said…», «He told me…» или «I asked…». "
            "Проверь, сдвинулись ли времена на шаг назад.",
            "Напиши пять прогнозов на следующий год: два с will (уверена), "
            "два с might (возможно) и один с going to (есть признаки). "
            "Рядом в скобках объясни по-русски, почему выбрала именно эту форму.",
        ],
    },
}
