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
