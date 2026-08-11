# -*- coding: utf-8 -*-
"""
Юнит 8 «Know-how» — авторское расширение.

Сцена: у Ким умер ноутбук за день до сдачи работы, Райан чинит.
Отсюда идут can / could / be able to, активный и пассивный залог
и герундий (-ing form).
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
LONG_DIALOG[8] = {
    "title": "The laptop that died on Thursday",
    "names": {"m": "Ryan", "f": "Kim"},
    "intro": "У Ким сдача работы завтра, а ноутбук не включается. "
             "Слушай, как они говорят про умения и как описывают, что было сделано "
             "с устройством — без упоминания, кто это сделал.",
    "lines": [
        ["f", "Ryan. It won't turn on. Nothing. Black screen."],
        ["m", "Breathe. When was it last charged?"],
        ["f", "Last night. It was plugged in all night."],
        ["m", "Was it plugged into the wall, or into the extension by the desk?"],
        ["f", "The extension. Why?"],
        ["m", "Because that extension was broken about a month ago and nobody replaced it."],
        ["f", "Nobody told me that."],
        ["m", "Nobody tells anybody anything in this flat. Plug it into the wall."],
        ["f", "Okay… still nothing. I can't even get a light on the charger."],
        ["m", "Give it two minutes. A completely flat battery can't be woken up instantly."],
        ["f", "I have to send this file by nine tomorrow. I've never been able to fix these things myself."],
        ["m", "Fixing laptops isn't a talent, Kim. It's a list. You just go down the list."],
        ["f", "Fine. What's on the list?"],
        ["m", "Power, screen, software, in that order. We're still on power."],
        ["f", "Oh — there's a light. A small orange one."],
        ["m", "Good. That means the battery was completely dead, not the laptop."],
        ["f", "So I could have fixed it myself by changing the socket."],
        ["m", "You could have, yes. But you couldn't have known about the extension."],
        ["f", "Right, it's starting. It says updates are being installed. Forty minutes."],
        ["m", "Of course they are. Updates are always installed at the worst possible moment."],
        ["f", "Forty minutes I don't have."],
        ["m", "You do, actually. Is the file backed up anywhere?"],
        ["f", "It's in the cloud, I think. It was saved automatically."],
        ["m", "Then open it on your phone and keep working. Waiting for a laptop is optional."],
        ["f", "I hate writing on a phone."],
        ["m", "Everyone hates writing on a phone. It's still faster than not writing at all."],
        ["f", "You're annoyingly practical."],
        ["m", "I've been fixing other people's devices since I was twelve. It's not wisdom, it's repetition."],
        ["f", "Can you teach me the list? Properly, I mean. So I can do it next time."],
        ["m", "Power, screen, software. That's it. That's the whole list."],
        ["f", "That can't be all of it."],
        ["m", "It's ninety per cent of it. The other ten per cent is being willing to restart things."],
    ],
    "questions": [
        {"q": "What was the laptop plugged into?",
         "o": ["the wall", "an extension by the desk", "nothing"], "a": 1},
        {"q": "What was wrong with the extension?",
         "o": ["it was broken a month ago and nobody replaced it", "it was too old", "it was unplugged"], "a": 0},
        {"q": "What is Ryan's list?",
         "o": ["power, screen, software", "battery, screen, keyboard", "restart, restart, restart"], "a": 0},
        {"q": "What does the orange light mean?",
         "o": ["the laptop is broken", "the battery was dead, not the laptop", "the charger is wrong"], "a": 1},
        {"q": "Why couldn't Kim have fixed it herself?",
         "o": ["she isn't clever enough", "she couldn't have known about the extension", "she had no charger"], "a": 1},
        {"q": "What is happening when the laptop starts?",
         "o": ["updates are being installed", "the files are being deleted", "nothing"], "a": 0},
        {"q": "Where is her file?",
         "o": ["only on the laptop", "in the cloud — it was saved automatically", "on a memory stick"], "a": 1},
        {"q": "What does Ryan say his skill is?",
         "o": ["natural talent", "repetition since he was twelve", "a course he took"], "a": 1},
    ],
}


# ============================================================
#   ПОДКАСТ
# ============================================================
PODCAST[8] = {
    "title": "Podcast: Nobody is born knowing where the settings are",
    "voice": "f",
    "intro": "Монолог о том, почему одни люди «умеют с техникой», а другие нет. "
             "Слушай can / could / be able to и пассив.",
    "text": [
        "For about fifteen years I believed there were two kinds of people: people who could fix things and people who couldn't.",
        "I was in the second group, and I was very comfortable there, because it meant nothing was my fault.",
        "Then I watched my brother fix a printer, and I realised something that slightly ruined the story I had been telling myself.",
        "He did not know what was wrong. He had never seen that printer before. He was not able to fix it any more than I was.",
        "What he did was press things. He pressed things, and read what appeared, and pressed more things, for eleven minutes.",
        "I had been sitting there believing that competent people simply know, and that if you do not know, you should stop and ask someone who does.",
        "But the printer was not fixed by knowledge. It was fixed by somebody who was willing to look stupid for eleven minutes.",
        "Since then I have been able to solve almost everything that has gone wrong in my house, and I still do not understand any of it.",
        "The settings are always hidden somewhere annoying. The instructions were written by somebody who has never used the machine.",
        "But nothing bad happens when you press the wrong thing. That is the entire secret, and it took me fifteen years to be told it.",
    ],
    "questions": [
        {"q": "What did she believe for fifteen years?",
         "o": ["that there are two kinds of people", "that technology is dangerous", "that she was clever"], "a": 0},
        {"q": "Why was she comfortable in the second group?",
         "o": ["it was easier", "it meant nothing was her fault", "her brother helped her"], "a": 1},
        {"q": "Did her brother know what was wrong with the printer?",
         "o": ["yes, immediately", "no — he had never seen it before", "he read the manual first"], "a": 1},
        {"q": "What did he actually do?",
         "o": ["called support", "pressed things and read what appeared", "replaced a part"], "a": 1},
        {"q": "How was the printer fixed, according to her?",
         "o": ["by knowledge", "by somebody willing to look stupid for eleven minutes", "by luck"], "a": 1},
        {"q": "What does she say about understanding?",
         "o": ["she understands everything now", "she can solve things and still doesn't understand them",
               "she gave up"], "a": 1},
        {"q": "What is 'the entire secret'?",
         "o": ["nothing bad happens when you press the wrong thing", "always read the manual",
               "buy better machines"], "a": 0},
    ],
}


# ============================================================
#   БОЛЬШОЙ ТЕКСТ
# ============================================================
LONG_READING[8] = {
    "title": "Why 'have you tried turning it off and on again?' actually works",
    "html": """
<p>It is the oldest joke in technical support, and it survives for an uncomfortable reason:
it fixes an enormous number of problems. Surveys of support teams have suggested that a
restart resolves somewhere between a third and a half of everything reported. The joke is
funny because the advice sounds lazy. It is not lazy. It is the single most efficient thing
a person can do.</p>

<p>The explanation is less mysterious than people expect. A running program builds up
<b>state</b> — a long list of things it currently believes about the world. Which files are
open. What the network was doing four minutes ago. Which button was pressed twice. Most
faults are not broken parts; they are a program holding one belief that stopped being true.
Restarting throws away every belief at once, and the program is forced to go and look again.</p>

<p>This is also why the advice feels insulting to the person receiving it. They wanted the
cause identified. Restarting does not identify anything — it just removes the problem along
with a thousand innocent things. But finding the exact wrong belief can take hours, and the
restart takes forty seconds, and the maths is not close.</p>

<p>Support engineers do have a second question, and it is the more useful one:
<b>what changed?</b> Almost nothing breaks on its own. Something was updated, something was
unplugged, something was moved, something ran out of space. If a device worked on Tuesday and
failed on Thursday, the answer is nearly always in what happened on Wednesday.</p>

<p>Put together, those two habits — restart it, then ask what changed — will solve most of
what an ordinary person meets in an ordinary year. Neither requires understanding how anything
works, which is fortunate, because almost nobody does. Being able to fix things and
understanding them turn out to be much less related than we were led to believe.</p>
""",
    "questions": [
        {"q": "How many problems does a restart reportedly fix?",
         "o": ["almost none", "between a third and a half", "all of them"], "a": 1},
        {"q": "What is 'state'?",
         "o": ["a broken part", "the list of things a program currently believes about the world",
               "the country you're in"], "a": 1},
        {"q": "What does restarting do?",
         "o": ["repairs the hardware", "throws away every belief so the program looks again",
               "deletes your files"], "a": 1},
        {"q": "Why does the advice feel insulting?",
         "o": ["it identifies nothing — it just removes the problem", "it takes too long",
               "it never works"], "a": 0},
        {"q": "What is the second, more useful question?",
         "o": ["who used it last?", "what changed?", "how old is it?"], "a": 1},
        {"q": "If a device worked Tuesday and failed Thursday, where is the answer?",
         "o": ["in what happened on Wednesday", "in the manual", "in the battery"], "a": 0},
        {"q": "What does the text conclude about fixing and understanding?",
         "o": ["they are the same thing", "they are much less related than we were told",
               "you must understand before you fix"], "a": 1},
    ],
}


# ============================================================
#   ДОПОЛНИТЕЛЬНАЯ ПРАКТИКА
# ============================================================
EXTRA_MC[8] = [
    {"q": "I ___ swim when I was five.", "o": ["can", "could", "am able to"], "a": 1},
    {"q": "She's never ___ to fix it herself.", "o": ["can", "could", "been able"], "a": 2},
    {"q": "___ you help me with this?", "o": ["Can", "Could to", "Are able"], "a": 0},
    {"q": "The updates ___ installed right now.", "o": ["are being", "are", "have been"], "a": 0},
    {"q": "The file ___ automatically last night.", "o": ["saved", "was saved", "is saving"], "a": 1},
    {"q": "The extension ___ a month ago.", "o": ["broke", "was broken", "is broken"], "a": 1},
    {"q": "___ laptops isn't a talent.", "o": ["Fix", "Fixing", "To fixing"], "a": 1},
    {"q": "I hate ___ on a phone.", "o": ["write", "writing", "to writing"], "a": 1},
    {"q": "He's good at ___ problems.", "o": ["solve", "solving", "to solve"], "a": 1},
    {"q": "___ for a laptop is optional.", "o": ["Wait", "Waiting", "To waiting"], "a": 1},
]

EXTRA_GAP[8] = [
    {"q": "Have you tried ___ it in?", "a": ["plugging"]},
    {"q": "My phone has run out ___ battery.", "a": ["of"]},
    {"q": "There's something wrong ___ the screen.", "a": ["with"]},
    {"q": "It ___ turn on at all.", "a": ["won't"]},
    {"q": "I couldn't figure ___ how it works.", "a": ["out"]},
    {"q": "This app is very user-___ .", "a": ["friendly"]},
    {"q": "Remember to back ___ your files.", "a": ["up"]},
    {"q": "It keeps ___ every ten minutes.", "a": ["crashing"]},
]


# ============================================================
#   ВЫВЕДИ ПРАВИЛО САМА
# ============================================================
DISCOVERY[8] = [
    {
        "for": 0,
        "title": "Заметь: умею, умела, смогла",
        "source": "Диалог «The laptop that died on Thursday»",
        "lead": "can, could и be able to переводятся почти одинаково, но работают по-разному. "
                "Найди разницу в примерах.",
        "examples": [
            {"t": "I **can't** even get a light on the charger.", "who": "Kim"},
            {"t": "I've never **been able to** fix these things myself.", "who": "Kim"},
            {"t": "A completely flat battery **can't be woken** up instantly.", "who": "Ryan"},
            {"t": "So I **could have fixed** it myself by changing the socket.", "who": "Kim"},
            {"t": "You **couldn't have known** about the extension.", "who": "Ryan"},
            {"t": "Since then I **have been able to** solve almost everything.", "who": "Подкаст"},
        ],
        "steps": [
            {"q": "Почему Ким говорит «I've never been able to», а не «I've never could»?",
             "o": ["у can нет формы для Present Perfect — вместо неё be able to",
                   "это ошибка",
                   "так вежливее"],
             "a": 0,
             "why": "can существует только в двух формах: can и could. Во всех остальных временах — be able to."},
            {"q": "«I could swim when I was five» — это про один раз или про умение вообще?",
             "o": ["про умение вообще", "про один конкретный случай", "про будущее"],
             "a": 0,
             "why": "could — умение в прошлом в целом. Для одного успешного случая: was able to / managed to."},
            {"q": "Как сказать «я смогла открыть дверь» (один раз, с трудом)?",
             "o": ["I could open the door.", "I was able to open the door.", "I can opened the door."],
             "a": 1,
             "why": "Один конкретный успех → was able to или managed to. could здесь звучит неверно."},
            {"q": "«You couldn't have known» — про что это?",
             "o": ["про будущее", "про прошлое: у тебя не было возможности узнать", "про запрет"],
             "a": 1,
             "why": "could have + 3-я форма — про упущенную или невозможную возможность в прошлом."},
            {"q": "Как сказать «я смогу прийти завтра»?",
             "o": ["I will can come.", "I'll be able to come.", "I could come tomorrow."],
             "a": 1,
             "why": "После will нельзя ставить can. Только will be able to."},
        ],
        "rule": "<b>can</b> — умею сейчас. <b>could</b> — умела в прошлом вообще, и вежливая просьба. "
                "<b>be able to</b> — для всех остальных времён, где can не работает: "
                "<i>I'll be able to, I've been able to, I want to be able to.</i> "
                "Один конкретный успех в прошлом: <b>was able to</b> или <b>managed to</b>, не could. "
                "<b>could have + 3-я форма</b> — могла бы, но не сделала: <i>I could have fixed it myself.</i>",
    },
    {
        "for": 1,
        "title": "Заметь: когда неважно, кто это сделал",
        "source": "Диалог и текст",
        "lead": "Райан несколько раз описывает, что произошло с вещью, не называя виновника. "
                "Посмотри на форму глагола.",
        "examples": [
            {"t": "Was it **plugged** into the wall?", "who": "Ryan"},
            {"t": "That extension **was broken** about a month ago.", "who": "Ryan"},
            {"t": "Updates **are being installed**. Forty minutes.", "who": "Kim"},
            {"t": "It **was saved** automatically.", "who": "Kim"},
            {"t": "The printer **was** not **fixed** by knowledge.", "who": "Подкаст"},
            {"t": "The instructions **were written** by somebody who has never used the machine.", "who": "Подкаст"},
        ],
        "steps": [
            {"q": "«That extension was broken» — кто его сломал?",
             "o": ["Райан", "неизвестно, и это неважно", "Ким"],
             "a": 1,
             "why": "Пассив как раз для случаев, когда деятель неизвестен, неважен или очевиден."},
            {"q": "Из чего состоит пассив?",
             "o": ["be + 3-я форма глагола", "have + 3-я форма", "be + -ing"],
             "a": 0,
             "why": "is broken, was saved, will be sent, has been fixed — везде be в нужном времени + причастие."},
            {"q": "«Updates are being installed» — какое это время?",
             "o": ["Present Simple пассив", "Present Continuous пассив", "Present Perfect пассив"],
             "a": 1,
             "why": "are being installed — прямо сейчас, в процессе. Сравни: are installed (вообще, обычно)."},
            {"q": "Как ввести деятеля, если он всё-таки важен?",
             "o": ["через with", "через by", "через from"],
             "a": 1,
             "why": "The instructions were written by somebody… by + кто сделал."},
            {"q": "Переведи в пассив: «Someone stole my laptop».",
             "o": ["My laptop was stolen.", "My laptop stole.", "My laptop has stole."],
             "a": 0,
             "why": "Дополнение становится подлежащим, глагол — was + stolen."},
        ],
        "rule": "<b>Пассив = be (в нужном времени) + 3-я форма глагола.</b> "
                "<i>is fixed, was saved, is being installed, has been updated, will be sent.</i> "
                "Используем, когда деятель неизвестен, неважен или очевиден. "
                "Если деятель всё же нужен — через <b>by</b>: <i>written by a beginner.</i> "
                "Особенно часто в инструкциях, новостях и описании техники.",
    },
    {
        "for": 2,
        "title": "Заметь: глагол в роли существительного",
        "source": "Диалог и подкаст",
        "lead": "Иногда глагол сам становится подлежащим или идёт после предлога. "
                "Посмотри, какая у него форма.",
        "examples": [
            {"t": "**Fixing** laptops isn't a talent. It's a list.", "who": "Ryan"},
            {"t": "**Waiting** for a laptop is optional.", "who": "Ryan"},
            {"t": "I hate **writing** on a phone.", "who": "Kim"},
            {"t": "Everyone hates **writing** on a phone.", "who": "Ryan"},
            {"t": "Have you tried **charging** it?", "who": "Ryan"},
            {"t": "The other ten per cent is **being willing** to restart things.", "who": "Ryan"},
        ],
        "steps": [
            {"q": "«Fixing laptops isn't a talent». Какую роль играет fixing?",
             "o": ["сказуемое", "подлежащее — «починка ноутбуков»", "дополнение"],
             "a": 1,
             "why": "-ing форма может быть подлежащим: Swimming is good for you. Reading takes time."},
            {"q": "Что идёт после предлогов (at, of, about, without)?",
             "o": ["начальная форма глагола", "-ing форма", "to + глагол"],
             "a": 1,
             "why": "good at solving, tired of waiting, without asking. После предлога — всегда -ing."},
            {"q": "«I hate writing» и «I want to write». Почему по-разному?",
             "o": ["hate любит -ing, want любит to — это надо запомнить по глаголам",
                   "разницы нет",
                   "hate всегда с to"],
             "a": 0,
             "why": "enjoy, avoid, finish, keep, mind, suggest → -ing. want, decide, hope, promise, agree → to."},
            {"q": "«Have you tried charging it?» и «I tried to charge it». Есть разница?",
             "o": ["нет", "да: tried + -ing — попробовала способ; tried + to — приложила усилие", "это ошибка"],
             "a": 1,
             "why": "У try, remember, stop и forget смысл меняется от формы. "
                    "I stopped smoking (бросила) ≠ I stopped to smoke (остановилась, чтобы покурить)."},
            {"q": "Какое предложение правильное?",
             "o": ["I'm good at fix computers.",
                   "I'm good at fixing computers.",
                   "I'm good at to fix computers."],
             "a": 1,
             "why": "После предлога at — только -ing."},
        ],
        "rule": "<b>-ing форма</b> работает как существительное. "
                "Может быть подлежащим: <i>Fixing laptops is easy.</i> "
                "Всегда идёт после предлогов: <i>good at solving, tired of waiting, without asking.</i> "
                "После глаголов enjoy, avoid, finish, keep, mind, suggest, hate, like → <b>-ing</b>. "
                "После want, decide, hope, promise, agree, need → <b>to + глагол</b>. "
                "У try, stop, remember, forget форма меняет смысл — проверяй по контексту.",
    },
]


# ============================================================
#   ОТРАБОТКА
# ============================================================
GRAM_PRACTICE[8] = [
    {
        "for": 0,
        "title": "Отработка · can, could, be able to",
        "lead": "Помни: can бывает только в двух формах. Всё остальное — be able to.",
        "mc": [
            {"q": "I ___ read when I was four.", "o": ["can", "could", "am able"], "a": 1},
            {"q": "She's never ___ to drive.", "o": ["can", "could", "been able"], "a": 2},
            {"q": "___ you pass me the charger?", "o": ["Can", "Could to", "Are able"], "a": 0},
            {"q": "I'll ___ help you tomorrow.", "o": ["can", "be able to", "could"], "a": 1},
            {"q": "The door was stuck, but I ___ open it in the end.", "o": ["could", "was able to", "can"], "a": 1},
            {"q": "He ___ have fixed it himself, but he didn't try.", "o": ["can", "could", "was able"], "a": 1},
            {"q": "I want to ___ speak Portuguese one day.", "o": ["can", "could", "be able to"], "a": 2},
            {"q": "She ___ swim at all when she was small.", "o": ["can't", "couldn't", "isn't able"], "a": 1},
            {"q": "We haven't ___ to reach him all morning.", "o": ["could", "can", "been able"], "a": 2},
            {"q": "You ___ have told me the extension was broken.", "o": ["can", "could", "were able"], "a": 1},
        ],
        "gaps": [
            {"q": "I ___ (умела) play the piano as a child.", "a": ["could"]},
            {"q": "She's never ___ (been able) to fix it herself.", "a": ["been able"]},
            {"q": "I'll ___ (смогу) come tomorrow.", "a": ["be able to"]},
            {"q": "It was hard, but he ___ (сумел) finish it.", "a": ["was able to", "managed to"]},
            {"q": "You ___ (могла бы) have asked me.", "a": ["could"]},
        ],
    },
    {
        "for": 1,
        "title": "Отработка · пассивный залог",
        "lead": "be в нужном времени + третья форма глагола.",
        "mc": [
            {"q": "My laptop ___ last week.", "o": ["stole", "was stolen", "is stealing"], "a": 1},
            {"q": "The updates ___ right now.", "o": ["are installing", "are being installed", "install"], "a": 1},
            {"q": "This app ___ by a small team.", "o": ["made", "was made", "is making"], "a": 1},
            {"q": "The files ___ automatically every night.", "o": ["back up", "are backed up", "backing up"], "a": 1},
            {"q": "The report ___ tomorrow morning.", "o": ["will send", "will be sent", "is sending"], "a": 1},
            {"q": "The screen ___ already ___ .", "o": ["has / replaced", "has / been replaced", "is / replacing"], "a": 1},
            {"q": "The instructions ___ by someone who never used it.", "o": ["wrote", "were written", "are writing"], "a": 1},
            {"q": "English ___ all over the world.", "o": ["speaks", "is spoken", "is speaking"], "a": 1},
            {"q": "The problem ___ by a simple restart.", "o": ["solved", "was solved", "is solving"], "a": 1},
            {"q": "My phone ___ at the moment.", "o": ["is charging", "is being charged", "both are possible"], "a": 2},
        ],
        "gaps": [
            {"q": "The file ___ (save) automatically last night.", "a": ["was saved"]},
            {"q": "Updates ___ (install) right now.", "a": ["are being installed"]},
            {"q": "This software ___ (use) by millions of people.", "a": ["is used"]},
            {"q": "The laptop ___ (repair) yesterday.", "a": ["was repaired"]},
            {"q": "The email ___ (send) tomorrow.", "a": ["will be sent"]},
        ],
    },
    {
        "for": 2,
        "title": "Отработка · -ing форма",
        "lead": "После предлога — всегда -ing. После некоторых глаголов — тоже.",
        "mc": [
            {"q": "___ laptops is easier than it looks.", "o": ["Fix", "Fixing", "To fixing"], "a": 1},
            {"q": "I'm good at ___ problems.", "o": ["solve", "solving", "to solve"], "a": 1},
            {"q": "She's tired of ___ for the update.", "o": ["wait", "waiting", "to wait"], "a": 1},
            {"q": "He left without ___ goodbye.", "o": ["say", "saying", "to say"], "a": 1},
            {"q": "I've decided ___ a new one.", "o": ["buying", "to buy", "buy"], "a": 1},
            {"q": "Do you mind ___ the window?", "o": ["close", "closing", "to close"], "a": 1},
            {"q": "I keep ___ the same mistake.", "o": ["make", "making", "to make"], "a": 1},
            {"q": "She promised ___ me back.", "o": ["calling", "to call", "call"], "a": 1},
            {"q": "Have you tried ___ it off and on again?", "o": ["turn", "turning", "to turning"], "a": 1},
            {"q": "I enjoy ___ new things.", "o": ["learn", "learning", "to learn"], "a": 1},
            {"q": "We need ___ the software.", "o": ["updating", "to update", "update"], "a": 1},
            {"q": "He suggested ___ the laptop.", "o": ["restart", "restarting", "to restart"], "a": 1},
        ],
        "gaps": [
            {"q": "___ (fix) things is a skill you learn.", "a": ["Fixing", "fixing"]},
            {"q": "I'm not very good at ___ (use) this app.", "a": ["using"]},
            {"q": "She's thinking about ___ (buy) a new phone.", "a": ["buying"]},
            {"q": "I've decided ___ (wait) until tomorrow.", "a": ["to wait"]},
            {"q": "Do you mind ___ (help) me?", "a": ["helping"]},
            {"q": "He kept ___ (press) the same button.", "a": ["pressing"]},
        ],
    },
]


# ============================================================
#   ДОМАШНЕЕ ЗАДАНИЕ
# ============================================================
HOMEWORK[8] = {
    "intro": "Домашка на материале юнита: слова про технику, три правила, "
             "которые ты вывела сама. Последний юнит курса — не спеши.",
    "parts": [
        {
            "title": "Домашка 1 · Слова и выражения юнита",
            "lead": "Двадцать слов из урока в новых предложениях.",
            "mc": [
                {"q": "A phone, a laptop or a tablet is a ___ .", "o": ["device", "button", "screen"], "a": 0},
                {"q": "The part you look at is the ___ .", "o": ["screen", "button", "battery"], "a": 0},
                {"q": "It's dead — I need to ___ it.", "o": ["charge", "download", "update"], "a": 0},
                {"q": "You need to ___ the app before you can use it.", "o": ["download", "restart", "plug"], "a": 0},
                {"q": "There's a new version — you should ___ .", "o": ["update", "charge", "solve"], "a": 0},
                {"q": "___ it in and see if the light comes on.", "o": ["Plug", "Charge", "Switch"], "a": 0},
                {"q": "The ___ only lasts three hours now.", "o": ["battery", "screen", "button"], "a": 0},
                {"q": "No cables — it's completely ___ .", "o": ["wireless", "broken", "handy"], "a": 0},
                {"q": "Can you ___ it? It's not working.", "o": ["fix", "charge", "download"], "a": 0},
                {"q": "Read the ___ before you start.", "o": ["instructions", "buttons", "gadgets"], "a": 0},
                {"q": "If it freezes, just ___ it.", "o": ["restart", "download", "plug"], "a": 0},
                {"q": "This app is really ___ when you're travelling.", "o": ["handy", "broken", "wireless"], "a": 0},
            ],
            "gaps": [
                {"q": "Have you tried ___ it in?", "a": ["plugging"]},
                {"q": "My phone has run out ___ battery.", "a": ["of"]},
                {"q": "There's something wrong ___ the screen.", "a": ["with"]},
                {"q": "It ___ turn on at all.", "a": ["won't"]},
                {"q": "Remember to back ___ your files.", "a": ["up"]},
                {"q": "It keeps ___ every ten minutes.", "a": ["crashing"]},
            ],
        },
        {
            "title": "Домашка 2 · Умения и пассив",
            "lead": "Первое и второе правила вместе.",
            "mc": [
                {"q": "I ___ ride a bike when I was six.", "o": ["can", "could", "am able"], "a": 1},
                {"q": "She's never ___ to fix a computer.", "o": ["can", "could", "been able"], "a": 2},
                {"q": "I'll ___ answer tomorrow.", "o": ["can", "be able to", "could"], "a": 1},
                {"q": "It was difficult, but we ___ finish on time.", "o": ["could", "were able to", "can"], "a": 1},
                {"q": "You ___ have called me — I was free.", "o": ["can", "could", "were able"], "a": 1},
                {"q": "The window ___ last night.", "o": ["broke", "was broken", "is breaking"], "a": 1},
                {"q": "The files ___ every evening.", "o": ["back up", "are backed up", "backing up"], "a": 1},
                {"q": "Updates ___ at the moment.", "o": ["install", "are being installed", "installed"], "a": 1},
                {"q": "The message ___ tomorrow.", "o": ["will send", "will be sent", "sends"], "a": 1},
                {"q": "This app ___ by a student.", "o": ["made", "was made", "is making"], "a": 1},
            ],
            "gaps": [
                {"q": "I ___ (умела) swim at five.", "a": ["could"]},
                {"q": "He hasn't ___ (been able) to reach her.", "a": ["been able"]},
                {"q": "The laptop ___ (repair) yesterday.", "a": ["was repaired"]},
                {"q": "The report ___ (write) by my colleague.", "a": ["was written"]},
                {"q": "I'll ___ (смогу) help you at six.", "a": ["be able to"]},
                {"q": "The updates ___ (install) right now.", "a": ["are being installed"]},
            ],
        },
        {
            "title": "Домашка 3 · -ing форма",
            "lead": "Третье правило. После предлога — всегда -ing.",
            "mc": [
                {"q": "___ new languages takes time.", "o": ["Learn", "Learning", "To learning"], "a": 1},
                {"q": "I'm interested in ___ how it works.", "o": ["know", "knowing", "to know"], "a": 1},
                {"q": "She's tired of ___ the same thing.", "o": ["hear", "hearing", "to hear"], "a": 1},
                {"q": "He went out without ___ anything.", "o": ["say", "saying", "to say"], "a": 1},
                {"q": "I've decided ___ a course.", "o": ["taking", "to take", "take"], "a": 1},
                {"q": "Would you mind ___ that again?", "o": ["explain", "explaining", "to explain"], "a": 1},
                {"q": "He keeps ___ the wrong button.", "o": ["press", "pressing", "to press"], "a": 1},
                {"q": "They promised ___ it by Friday.", "o": ["finishing", "to finish", "finish"], "a": 1},
                {"q": "Have you tried ___ it?", "o": ["restart", "restarting", "to restarting"], "a": 1},
                {"q": "I enjoy ___ things myself.", "o": ["fix", "fixing", "to fix"], "a": 1},
                {"q": "We need ___ the software today.", "o": ["updating", "to update", "update"], "a": 1},
                {"q": "She suggested ___ the manual.", "o": ["read", "reading", "to read"], "a": 1},
            ],
            "gaps": [
                {"q": "___ (read) instructions is boring but useful.", "a": ["Reading", "reading"]},
                {"q": "I'm good at ___ (find) settings.", "a": ["finding"]},
                {"q": "She's thinking about ___ (change) her phone.", "a": ["changing"]},
                {"q": "I've decided ___ (wait) a week.", "a": ["to wait"]},
                {"q": "Do you mind ___ (hold) this?", "a": ["holding"]},
                {"q": "He kept ___ (try) until it worked.", "a": ["trying"]},
            ],
        },
    ],
    "write": {
        "title": "Домашка 4 · Напиши сама",
        "lead": "Три письменных задания. Последние в курсе.",
        "tasks": [
            "Опиши техническую проблему, которая была у тебя в этом году, и как ты её решила — "
            "8–10 предложений. Используй минимум три раза can / could / be able to "
            "и хотя бы одно could have + 3-я форма.",
            "Напиши короткую инструкцию к любому прибору у тебя дома — 6 пунктов, "
            "минимум четыре в пассиве (The button is pressed… / The battery must be charged…). "
            "Подчеркни be и третью форму.",
            "Напиши 6 предложений о себе с -ing формой: два где -ing это подлежащее "
            "(Reading helps me…), два после предлога (I'm good at…), "
            "два после глаголов enjoy / hate / keep / mind.",
        ],
    },
}
