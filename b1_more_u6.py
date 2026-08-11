# -*- coding: utf-8 -*-
"""
Юнит 6 «Creators» — авторское расширение.

Сцена: Элла привела Ника на выставку, куда он идти не хотел.
Отсюда идут used to, сравнительная и превосходная степень
и Present Perfect с for / since / yet / already / just.
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
LONG_DIALOG[6] = {
    "title": "The exhibition Nick didn't want to see",
    "names": {"m": "Nick", "f": "Ella"},
    "intro": "Ник пришёл на выставку под давлением и провёл там два часа. "
             "Слушай, как он говорит о том, каким был раньше, и как сравнивает работы.",
    "lines": [
        ["f", "Right. Two hours. You promised."],
        ["m", "I promised one hour. You've already added a second one and we haven't started."],
        ["f", "Have you been to this gallery before?"],
        ["m", "Never. I used to walk past it twice a week and I never went in."],
        ["f", "Why not?"],
        ["m", "Because I used to think galleries were for people who knew things. I didn't know things."],
        ["f", "Nobody knows things. That's the whole point of looking."],
        ["m", "You've been saying that for years and I've never believed you."],
        ["f", "Start here. This one's the oldest piece in the exhibition."],
        ["m", "It's smaller than I expected. I thought portraits were huge."],
        ["f", "Some are. This one is more interesting than the huge ones, though."],
        ["m", "Why? Honestly — I want the actual reason, not the polite one."],
        ["f", "Because she isn't looking at us. Every other portrait in this room is."],
        ["m", "Oh. That's… actually true. She's looking past the painter."],
        ["f", "And that's harder to paint than a straight face. Much harder."],
        ["m", "How long have you been into this stuff?"],
        ["f", "Since I was about fourteen. My aunt used to take me on Sundays."],
        ["m", "I used to hate Sundays. We didn't do anything on Sundays."],
        ["f", "Come upstairs. The sculpture is the best thing here, in my opinion."],
        ["m", "Hold on. I haven't finished with this one yet."],
        ["f", "Sorry — did you just ask me for more time in a gallery?"],
        ["m", "Don't. Don't do that."],
        ["f", "I'm doing it. This is the happiest I've been all month."],
        ["m", "It's growing on me, that's all. It's not my cup of tea, but it's growing on me."],
        ["f", "That's how it always starts. What do you think of the colours?"],
        ["m", "Darker than I expected. Everything I've ever seen online looked brighter."],
        ["f", "Screens lie. That's the most important thing I've ever learnt about art."],
        ["m", "So all those years I thought I didn't like paintings…"],
        ["f", "You'd only seen photographs of paintings. It's not the same thing at all."],
        ["m", "Fine. Show me the sculpture. But we're not staying three hours."],
        ["f", "We've already been here ninety minutes, Nick."],
        ["m", "Have we? That's the worst news I've had all day."],
    ],
    "questions": [
        {"q": "Had Nick been to the gallery before?",
         "o": ["yes, many times", "never — he used to walk past it", "once, as a child"], "a": 1},
        {"q": "Why didn't he go in?",
         "o": ["it was expensive", "he thought galleries were for people who knew things", "it was always closed"], "a": 1},
        {"q": "What is special about the oldest portrait?",
         "o": ["it is the biggest", "she isn't looking at us", "it has no colour"], "a": 1},
        {"q": "How long has Ella been interested in art?",
         "o": ["for two years", "since she was about fourteen", "since last month"], "a": 1},
        {"q": "Who used to take Ella to galleries?",
         "o": ["her aunt", "her mother", "a teacher"], "a": 0},
        {"q": "What does Nick say about the colours?",
         "o": ["brighter than online", "darker than he expected", "exactly as he expected"], "a": 1},
        {"q": "What does Ella say about screens?",
         "o": ["they are useful", "they lie", "they are getting better"], "a": 1},
        {"q": "How long have they been in the gallery?",
         "o": ["one hour", "ninety minutes", "three hours"], "a": 1},
    ],
}


# ============================================================
#   ПОДКАСТ
# ============================================================
PODCAST[6] = {
    "title": "Podcast: I used to draw every day and then I stopped",
    "voice": "f",
    "intro": "Монолог про то, как бросают творчество и как к нему возвращаются. "
             "Слушай used to и Present Perfect.",
    "text": [
        "I used to draw every single day between the ages of six and fifteen, and then I stopped for eleven years.",
        "Nothing dramatic happened. Nobody told me I was bad. That is the part people always expect and it is not true.",
        "What happened is that I got better at noticing the difference between what I wanted and what was on the paper.",
        "When you are six, the gap does not exist, because you have not learnt to see it yet. When you are fifteen, the gap is all you can see.",
        "So I stopped, and I told everyone I had grown out of it, which sounded much better than the truth.",
        "I have been drawing again for about three years now. I started because of a very boring reason: a broken wrist and six weeks with nothing to do.",
        "The strange thing is that I am no better than I was at fifteen. I have not improved at all. I have checked.",
        "What has changed is that the gap does not frighten me any more. It is just information. It tells me what to work on next.",
        "I have already filled four sketchbooks since I started, and not one drawing in them is good.",
        "But I have not stopped, and at fifteen that was the only thing I could not do.",
    ],
    "questions": [
        {"q": "How long did she draw as a child?",
         "o": ["from six to fifteen", "from ten to twenty", "only one summer"], "a": 0},
        {"q": "Why did she stop?",
         "o": ["someone told her she was bad", "she began to see the gap between what she wanted and what she drew",
               "she had no time"], "a": 1},
        {"q": "What did she tell everyone?",
         "o": ["that she had grown out of it", "that she had no money for materials", "the truth"], "a": 0},
        {"q": "Why did she start again?",
         "o": ["a broken wrist and six weeks with nothing to do", "a class at university", "a friend asked her to"], "a": 0},
        {"q": "Is she better than she was at fifteen?",
         "o": ["much better", "no — she says she hasn't improved at all", "she doesn't know"], "a": 1},
        {"q": "What has changed?",
         "o": ["the gap doesn't frighten her any more", "she draws faster", "she uses better paper"], "a": 0},
        {"q": "How many sketchbooks has she filled?",
         "o": ["one", "four", "eleven"], "a": 1},
    ],
}


# ============================================================
#   БОЛЬШОЙ ТЕКСТ
# ============================================================
LONG_READING[6] = {
    "title": "The gap that stops people making things",
    "html": """
<p>Almost everyone who has ever tried to make something — a drawing, a song, a piece of
writing — knows the feeling, even if they have never had a name for it. You can tell that
the thing you have made is not as good as the thing you imagined. And the more you care,
the more clearly you can see it.</p>

<p>The radio producer Ira Glass gave this feeling a name that has since travelled everywhere:
<b>the gap</b>. His argument was simple. People start making things because they have good
taste. That taste is what makes the work possible — and it is also what makes the first few
years unbearable, because your taste is far ahead of your ability and you can see every
centimetre of the distance.</p>

<p>What is interesting is what this predicts. It predicts that the people most likely to quit
are not the ones with the least talent. They are the ones with the sharpest eye. Teachers of
music and art say the same thing again and again: the student who stops is very often the one
who noticed the most.</p>

<p>The recommended cure is unglamorous. Not confidence, not inspiration — <b>volume</b>. Make a
large number of things quickly, on the assumption that most of them will be bad, because the
gap closes through repetition and it closes through almost nothing else. A photographer who
has taken ten thousand photographs has a different relationship with a bad photograph than
someone who has taken fifty.</p>

<p>There is a second, quieter idea underneath this, and it may be the more useful one. The gap
never actually disappears. Experienced artists describe exactly the same feeling — the work is
not what they imagined — and they describe it at sixty as clearly as they did at twenty. What
changes is not the gap. What changes is that it stops being evidence against you and starts
being a description of the next problem.</p>

<p>Which means the question is not <i>how do I stop feeling this?</i> The question is
<i>how many things can I make while I feel it?</i></p>
""",
    "questions": [
        {"q": "What is 'the gap'?",
         "o": ["the distance between what you imagined and what you made",
               "the time between projects", "the space in a gallery"], "a": 0},
        {"q": "According to the text, why does the gap exist?",
         "o": ["because people have no talent", "because taste runs ahead of ability",
               "because materials are expensive"], "a": 1},
        {"q": "Who is most likely to quit?",
         "o": ["the least talented", "the ones with the sharpest eye", "the youngest"], "a": 1},
        {"q": "What is the recommended cure?",
         "o": ["confidence", "inspiration", "volume — making a lot of things quickly"], "a": 2},
        {"q": "What happens to the gap with experience?",
         "o": ["it disappears completely", "it never disappears but stops feeling like evidence against you",
               "it gets bigger every year"], "a": 1},
        {"q": "How does a photographer with ten thousand photos differ?",
         "o": ["they have a different relationship with a bad photograph",
               "they never take bad photographs", "they work faster"], "a": 0},
        {"q": "What question does the writer say we should ask?",
         "o": ["how do I stop feeling this?", "how many things can I make while I feel it?",
               "who is better than me?"], "a": 1},
    ],
}


# ============================================================
#   ДОПОЛНИТЕЛЬНАЯ ПРАКТИКА
# ============================================================
EXTRA_MC[6] = [
    {"q": "I ___ hate modern art, but now I like it.", "o": ["used to", "use to", "am used to"], "a": 0},
    {"q": "___ you use to draw as a child?", "o": ["Did", "Do", "Were"], "a": 0},
    {"q": "She didn't ___ go to galleries.", "o": ["used to", "use to", "using to"], "a": 1},
    {"q": "This painting is ___ than the other one.", "o": ["more small", "smaller", "smallest"], "a": 1},
    {"q": "It's the ___ piece in the exhibition.", "o": ["more interesting", "most interesting", "interestingest"], "a": 1},
    {"q": "Her work is ___ creative than his.", "o": ["more", "most", "much"], "a": 0},
    {"q": "I've been into art ___ I was fourteen.", "o": ["for", "since", "ago"], "a": 1},
    {"q": "We've been here ___ ninety minutes.", "o": ["for", "since", "from"], "a": 0},
    {"q": "I haven't seen the sculpture ___ .", "o": ["already", "yet", "just"], "a": 1},
    {"q": "I've ___ decided — let's go and see it.", "o": ["yet", "just", "since"], "a": 1},
]

EXTRA_GAP[6] = [
    {"q": "What do you ___ of this painting?", "a": ["think"]},
    {"q": "In my ___ , it's the best piece here.", "a": ["opinion"]},
    {"q": "I couldn't ___ more — you're absolutely right.", "a": ["agree"]},
    {"q": "That building is a real work of ___ .", "a": ["art"]},
    {"q": "She's really ___ photography these days.", "a": ["into"]},
    {"q": "Opera isn't my cup of ___ , sorry.", "a": ["tea"]},
    {"q": "I haven't seen him for ___ .", "a": ["ages"]},
    {"q": "I didn't like it at first, but it's ___ on me.", "a": ["growing"]},
]


# ============================================================
#   ВЫВЕДИ ПРАВИЛО САМА
# ============================================================
DISCOVERY[6] = [
    {
        "for": 0,
        "title": "Заметь: каким ты была раньше",
        "source": "Диалог «The exhibition Nick didn't want to see»",
        "lead": "Ник несколько раз говорит о том, что было привычным раньше и больше не так. "
                "Посмотри на форму — она одна и та же.",
        "examples": [
            {"t": "I **used to walk** past it twice a week and I never went in.", "who": "Nick"},
            {"t": "I **used to think** galleries were for people who knew things.", "who": "Nick"},
            {"t": "My aunt **used to take** me on Sundays.", "who": "Ella"},
            {"t": "I **used to hate** Sundays. We **didn't do** anything on Sundays.", "who": "Nick"},
            {"t": "I **used to draw** every single day, and then I stopped.", "who": "Подкаст"},
            {"t": "She **didn't use to** go to galleries.", "who": "Практика"},
        ],
        "steps": [
            {"q": "«I used to walk past it» — он ходит там сейчас?",
             "o": ["да, до сих пор", "нет, это было раньше и закончилось", "иногда"],
             "a": 1,
             "why": "used to = раньше было привычным, а теперь нет. Всегда подразумевается «а сейчас иначе»."},
            {"q": "Почему в отрицании «didn't use to», а не «didn't used to»?",
             "o": ["потому что did уже показывает прошедшее время",
                   "это ошибка, надо used",
                   "разницы нет"],
             "a": 0,
             "why": "did уже несёт прошедшее, поэтому глагол возвращается в начальную форму: didn't use to, did you use to."},
            {"q": "«I used to have a bike» и «I had a bike for two years». В чём разница?",
             "o": ["used to — про привычное состояние в прошлом без указания срока, had — конкретный факт",
                   "разницы нет",
                   "used to нельзя с have"],
             "a": 0,
             "why": "Если назван срок или количество раз, used to не используем: «I went there three times», а не «used to go three times»."},
            {"q": "Можно ли сказать «I use to go there» про настоящее?",
             "o": ["да, это привычка сейчас", "нет, такой формы нет — для настоящего просто Present Simple", "да, но редко"],
             "a": 1,
             "why": "used to бывает только в прошедшем. Про настоящее: I usually go there."},
            {"q": "Какое предложение правильное?",
             "o": ["Did you used to play the piano?",
                   "Did you use to play the piano?",
                   "Do you used to play the piano?"],
             "a": 1,
             "why": "После did — use, без -d."},
        ],
        "rule": "<b>used to + глагол</b> — раньше было привычным, а сейчас нет: "
                "<i>I used to walk past it. She used to take me on Sundays.</i> "
                "Вопрос и отрицание через did: <i>Did you use to…? / I didn't use to…</i> — без -d. "
                "Не путать с <b>be used to + -ing</b> (привыкла к чему-то): <i>I'm used to getting up early.</i> "
                "Если назван конкретный срок или количество раз, used to не подходит.",
    },
    {
        "for": 1,
        "title": "Заметь: сравниваем и выбираем лучшее",
        "source": "Диалог",
        "lead": "Элла и Ник всё время сравнивают картины. Посмотри, когда добавляется -er, "
                "а когда впереди встаёт more.",
        "examples": [
            {"t": "It's **smaller than** I expected.", "who": "Nick"},
            {"t": "This one is **more interesting than** the huge ones.", "who": "Ella"},
            {"t": "That's **harder to paint than** a straight face. **Much harder**.", "who": "Ella"},
            {"t": "This one's **the oldest** piece in the exhibition.", "who": "Ella"},
            {"t": "The sculpture is **the best** thing here.", "who": "Ella"},
            {"t": "**Darker than** I expected.", "who": "Nick"},
        ],
        "steps": [
            {"q": "«smaller» и «more interesting». Почему по-разному?",
             "o": ["короткие прилагательные берут -er, длинные — more",
                   "это зависит от настроения",
                   "small — исключение"],
             "a": 0,
             "why": "Один слог или два с окончанием -y → -er (smaller, happier). Три слога и больше → more."},
            {"q": "Что стоит после сравнения?",
             "o": ["then", "than", "that"],
             "a": 1,
             "why": "than — чем. then — тогда. Их часто путают, но это разные слова."},
            {"q": "«Much harder» — что делает much?",
             "o": ["усиливает: намного труднее",
                   "смягчает: чуть труднее",
                   "ничего не значит"],
             "a": 0,
             "why": "much / far / a lot усиливают сравнение. a bit / slightly — смягчают."},
            {"q": "Почему «the oldest» и «the best» с артиклем the?",
             "o": ["превосходная степень всегда с the", "потому что предметы старые", "можно и без него"],
             "a": 0,
             "why": "the oldest, the best, the most interesting — всегда с the."},
            {"q": "Как сравнить good?",
             "o": ["gooder / the goodest", "better / the best", "more good / the most good"],
             "a": 1,
             "why": "good → better → the best. bad → worse → the worst. far → further → the furthest."},
        ],
        "rule": "<b>Короткие</b> (1 слог, или 2 на -y): + -er / the + -est — "
                "<i>small → smaller → the smallest, happy → happier → the happiest.</i> "
                "<b>Длинные</b>: more / the most — <i>interesting → more interesting → the most interesting.</i> "
                "После сравнения — <b>than</b>. "
                "Усилители: <i>much / far / a lot</i> harder. Смягчители: <i>a bit / slightly</i> harder. "
                "Исключения: good → better → the best; bad → worse → the worst; far → further → the furthest.",
    },
    {
        "for": 2,
        "title": "Заметь: for, since, yet, already, just",
        "source": "Диалог и подкаст",
        "lead": "Пять маленьких слов, которые почти всегда идут с Present Perfect. "
                "У каждого своя работа.",
        "examples": [
            {"t": "You**'ve been saying** that **for years**.", "who": "Nick"},
            {"t": "**Since** I was about fourteen. (в ответ на «How long **have** you **been** into this stuff?»)", "who": "Ella"},
            {"t": "I **haven't finished** with this one **yet**.", "who": "Nick"},
            {"t": "You**'ve already added** a second one and we haven't started.", "who": "Nick"},
            {"t": "I**'ve just decided** — let's go and see it.", "who": "Практика"},
            {"t": "We**'ve already been** here ninety minutes.", "who": "Ella"},
        ],
        "steps": [
            {"q": "«for years» и «since I was fourteen». В чём разница?",
             "o": ["for — сколько длится, since — с какого момента",
                   "for — с какого момента, since — сколько длится",
                   "они одинаковы"],
             "a": 0,
             "why": "for two hours, for years (отрезок). since Monday, since 2019, since I was fourteen (точка старта)."},
            {"q": "Где обычно стоит «yet»?",
             "o": ["в начале предложения",
                   "в конце, и только в отрицании и вопросе",
                   "перед глаголом"],
             "a": 1,
             "why": "I haven't finished yet. Have you finished yet? В утверждении yet не используется."},
            {"q": "Где стоит «already»?",
             "o": ["в конце", "между have и глаголом", "в начале"],
             "a": 1,
             "why": "You've already added. She has already left. И означает «раньше, чем ожидали»."},
            {"q": "«I've just decided» — когда это произошло?",
             "o": ["давно", "только что, секунду назад", "завтра"],
             "a": 1,
             "why": "just = только что. Тоже встаёт между have и глаголом."},
            {"q": "Какое предложение правильное?",
             "o": ["I've finished yet.", "I haven't finished yet.", "I yet haven't finished."],
             "a": 1,
             "why": "yet — только в отрицаниях и вопросах, и в конце."},
        ],
        "rule": "<b>for</b> + отрезок: for two hours, for years. "
                "<b>since</b> + точка старта: since Monday, since I was fourteen. "
                "<b>yet</b> — в конце, только в отрицании и вопросе: <i>I haven't finished yet.</i> "
                "<b>already</b> — между have и глаголом, «раньше, чем ждали»: <i>She's already left.</i> "
                "<b>just</b> — между have и глаголом, «только что»: <i>I've just decided.</i>",
    },
]


# ============================================================
#   ОТРАБОТКА
# ============================================================
GRAM_PRACTICE[6] = [
    {
        "for": 0,
        "title": "Отработка · used to",
        "lead": "Помни: после did возвращается use, без -d.",
        "mc": [
            {"q": "I ___ live in Moscow, but now I live here.", "o": ["used to", "use to", "am used to"], "a": 0},
            {"q": "___ you use to play an instrument?", "o": ["Did", "Do", "Were"], "a": 0},
            {"q": "She didn't ___ like coffee.", "o": ["used to", "use to", "using to"], "a": 1},
            {"q": "He ___ smoke, but he gave up last year.", "o": ["used to", "is used to", "uses to"], "a": 0},
            {"q": "We ___ go to the seaside every summer.", "o": ["used to", "use to", "are used to"], "a": 0},
            {"q": "Did they ___ live here?", "o": ["used to", "use to", "using to"], "a": 1},
            {"q": "I'm ___ getting up at six now — it's normal for me.", "o": ["used to", "use to", "used to it"], "a": 0},
            {"q": "There ___ be a cinema on this street.", "o": ["used to", "use to", "is used to"], "a": 0},
            {"q": "I ___ three times last year. (не used to!)", "o": ["used to go", "went", "use to go"], "a": 1},
            {"q": "My aunt ___ take me to galleries on Sundays.", "o": ["used to", "use to", "is used to"], "a": 0},
        ],
        "gaps": [
            {"q": "I ___ (раньше) hate vegetables.", "a": ["used to"]},
            {"q": "She didn't ___ (форма после didn't) go out much.", "a": ["use to"]},
            {"q": "___ you use to have long hair?", "a": ["Did", "did"]},
            {"q": "There ___ be a shop here.", "a": ["used to"]},
            {"q": "We ___ (раньше) live by the sea.", "a": ["used to"]},
        ],
    },
    {
        "for": 1,
        "title": "Отработка · сравнение",
        "lead": "Короткое — -er. Длинное — more. Превосходная — всегда с the.",
        "mc": [
            {"q": "This painting is ___ than that one.", "o": ["more big", "bigger", "biggest"], "a": 1},
            {"q": "It's the ___ gallery in the city.", "o": ["more famous", "most famous", "famousest"], "a": 1},
            {"q": "Her work is ___ creative than his.", "o": ["more", "most", "much"], "a": 0},
            {"q": "This is ___ than I expected.", "o": ["easyer", "easier", "more easy"], "a": 1},
            {"q": "That was the ___ film I've ever seen.", "o": ["worse", "worst", "baddest"], "a": 1},
            {"q": "It's ___ harder than it looks.", "o": ["much", "very", "so"], "a": 0},
            {"q": "She's ___ at drawing than me.", "o": ["gooder", "better", "more good"], "a": 1},
            {"q": "This one is a ___ more interesting.", "o": ["bit", "much", "very"], "a": 0},
            {"q": "Rome is ___ than I imagined.", "o": ["beautifuller", "more beautiful", "most beautiful"], "a": 1},
            {"q": "He lives ___ from the centre than I do.", "o": ["farer", "further", "more far"], "a": 1},
        ],
        "gaps": [
            {"q": "This room is ___ (small) than the other one.", "a": ["smaller"]},
            {"q": "It's the ___ (interesting) piece here.", "a": ["most interesting"]},
            {"q": "She's ___ (good) than me at this.", "a": ["better"]},
            {"q": "That was the ___ (bad) day of my life.", "a": ["worst"]},
            {"q": "It's much ___ (hard) than it looks.", "a": ["harder"]},
        ],
    },
    {
        "for": 2,
        "title": "Отработка · for, since, yet, already, just",
        "lead": "Каждое слово стоит на своём месте — следи за порядком.",
        "mc": [
            {"q": "I've lived here ___ 2019.", "o": ["for", "since", "ago"], "a": 1},
            {"q": "We've been waiting ___ two hours.", "o": ["for", "since", "from"], "a": 0},
            {"q": "Have you finished ___ ?", "o": ["already", "yet", "just"], "a": 1},
            {"q": "She's ___ left — you've missed her by a minute.", "o": ["yet", "just", "since"], "a": 1},
            {"q": "I've ___ seen that film twice.", "o": ["yet", "already", "since"], "a": 1},
            {"q": "He hasn't called ___ .", "o": ["already", "just", "yet"], "a": 2},
            {"q": "They've known each other ___ school.", "o": ["for", "since", "from"], "a": 1},
            {"q": "I've been into art ___ ages.", "o": ["for", "since", "yet"], "a": 0},
            {"q": "Where's the correct place? 'She has ___ arrived.'", "o": ["yet", "just", "since"], "a": 1},
            {"q": "I haven't seen the sculpture ___ .", "o": ["already", "yet", "just"], "a": 1},
        ],
        "gaps": [
            {"q": "I've known her ___ ten years.", "a": ["for"]},
            {"q": "We've been here ___ nine o'clock.", "a": ["since"]},
            {"q": "Have you eaten ___ ?", "a": ["yet"]},
            {"q": "She's ___ finished — look, the page is done.", "a": ["already", "just"]},
            {"q": "He hasn't replied ___ .", "a": ["yet"]},
        ],
    },
]


# ============================================================
#   ДОМАШНЕЕ ЗАДАНИЕ
# ============================================================
HOMEWORK[6] = {
    "intro": "Домашка на материале юнита: слова про искусство и творчество, "
             "три правила, которые ты вывела сама.",
    "parts": [
        {
            "title": "Домашка 1 · Слова и выражения юнита",
            "lead": "Двадцать слов из урока в новых предложениях.",
            "mc": [
                {"q": "A picture made with paint is a ___ .", "o": ["painting", "sculpture", "photograph"], "a": 0},
                {"q": "A figure made of stone or metal is a ___ .", "o": ["painting", "sculpture", "portrait"], "a": 1},
                {"q": "A picture of a person's face is a ___ .", "o": ["portrait", "canvas", "brush"], "a": 0},
                {"q": "A place where art is shown is a ___ .", "o": ["gallery", "studio", "canvas"], "a": 0},
                {"q": "The greatest work of an artist is a ___ .", "o": ["masterpiece", "brush", "style"], "a": 0},
                {"q": "You paint on a ___ .", "o": ["canvas", "brush", "gallery"], "a": 0},
                {"q": "You paint with a ___ .", "o": ["canvas", "brush", "style"], "a": 1},
                {"q": "She's very ___ — she has new ideas every day.", "o": ["creative", "original", "colourful"], "a": 0},
                {"q": "Nobody has ever done this before — it's completely ___ .", "o": ["original", "talented", "creative"], "a": 0},
                {"q": "The exhibition ___ me to start painting again.", "o": ["inspired", "admired", "designed"], "a": 0},
                {"q": "I really ___ her work — it's beautiful.", "o": ["admire", "imagine", "design"], "a": 0},
                {"q": "He ___ the poster for the show.", "o": ["designed", "admired", "imagined"], "a": 0},
            ],
            "gaps": [
                {"q": "What do you ___ of this one?", "a": ["think"]},
                {"q": "In my ___ , it's the best piece here.", "a": ["opinion"]},
                {"q": "I couldn't ___ more.", "a": ["agree"]},
                {"q": "That bridge is a real work of ___ .", "a": ["art"]},
                {"q": "Jazz isn't my cup of ___ .", "a": ["tea"]},
                {"q": "I haven't been there for ___ .", "a": ["ages"]},
            ],
        },
        {
            "title": "Домашка 2 · used to и сравнение",
            "lead": "Первое и второе правила вместе.",
            "mc": [
                {"q": "I ___ play the guitar every day.", "o": ["used to", "use to", "am used to"], "a": 0},
                {"q": "___ you use to live abroad?", "o": ["Did", "Do", "Were"], "a": 0},
                {"q": "She didn't ___ enjoy museums.", "o": ["used to", "use to", "using to"], "a": 1},
                {"q": "There ___ be a bakery on the corner.", "o": ["used to", "use to", "is used to"], "a": 0},
                {"q": "This one is ___ than the other.", "o": ["more nice", "nicer", "nicest"], "a": 1},
                {"q": "It's the ___ exhibition of the year.", "o": ["more popular", "most popular", "popularest"], "a": 1},
                {"q": "Her style is ___ original than his.", "o": ["more", "most", "much"], "a": 0},
                {"q": "That's the ___ thing I've ever seen.", "o": ["stranger", "strangest", "most strange"], "a": 1},
                {"q": "It's ___ easier than I thought.", "o": ["much", "very", "so"], "a": 0},
                {"q": "He's ___ at drawing than at painting.", "o": ["gooder", "better", "more good"], "a": 1},
            ],
            "gaps": [
                {"q": "I ___ (раньше) hate galleries.", "a": ["used to"]},
                {"q": "Did she ___ live here?", "a": ["use to"]},
                {"q": "This is ___ (big) than I expected.", "a": ["bigger"]},
                {"q": "It's the ___ (good) thing here.", "a": ["best"]},
                {"q": "That was the ___ (bad) idea of the day.", "a": ["worst"]},
                {"q": "It's much ___ (interesting) than the first one.", "a": ["more interesting"]},
            ],
        },
        {
            "title": "Домашка 3 · Present Perfect с маркерами",
            "lead": "Третье правило: for, since, yet, already, just.",
            "mc": [
                {"q": "I've worked here ___ five years.", "o": ["for", "since", "ago"], "a": 0},
                {"q": "She's been ill ___ Monday.", "o": ["for", "since", "from"], "a": 1},
                {"q": "Have they arrived ___ ?", "o": ["already", "yet", "just"], "a": 1},
                {"q": "I've ___ finished — look.", "o": ["yet", "just", "since"], "a": 1},
                {"q": "We've ___ seen this film.", "o": ["yet", "already", "since"], "a": 1},
                {"q": "He hasn't written back ___ .", "o": ["already", "just", "yet"], "a": 2},
                {"q": "They've been friends ___ childhood.", "o": ["for", "since", "from"], "a": 1},
                {"q": "I haven't been to a gallery ___ ages.", "o": ["for", "since", "yet"], "a": 0},
                {"q": "She has ___ left the building.", "o": ["yet", "just", "since"], "a": 1},
                {"q": "___ you finished your coffee yet?", "o": ["Have", "Did", "Do"], "a": 0},
                {"q": "I ___ that book last summer.", "o": ["have read", "read", "have been reading"], "a": 1},
                {"q": "We ___ here since ten this morning.", "o": ["are", "have been", "were"], "a": 1},
            ],
            "gaps": [
                {"q": "I've known him ___ 2015.", "a": ["since"]},
                {"q": "She's been here ___ three hours.", "a": ["for"]},
                {"q": "Have you seen it ___ ?", "a": ["yet"]},
                {"q": "He's ___ arrived — he's in the hall.", "a": ["just"]},
                {"q": "They've ___ eaten, thanks.", "a": ["already"]},
                {"q": "I haven't decided ___ .", "a": ["yet"]},
            ],
        },
    ],
    "write": {
        "title": "Домашка 4 · Напиши сама",
        "lead": "Три письменных задания.",
        "tasks": [
            "Напиши 8 предложений о том, какой ты была в двенадцать лет. "
            "Минимум пять с used to, из них одно отрицательное и одно вопросительное "
            "(задай вопрос самой себе). Проверь: после did — use, без -d.",
            "Сравни два места, где ты бывала — 6–8 предложений. "
            "Используй три сравнения (-er / more) и одну превосходную степень с the. "
            "Добавь хотя бы один усилитель: much, far или a lot.",
            "Напиши 6 предложений о своих занятиях сейчас, используя "
            "for, since, yet, already и just — каждое хотя бы по разу. "
            "Проверь, где стоит yet, а где already.",
        ],
    },
}
