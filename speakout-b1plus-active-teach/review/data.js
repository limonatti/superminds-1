window.QUEST = {
  "title": "The Missing Story",
  "subtitle": "Speakout B1+ · Third Edition · Units 1–2",
  "missions": [
    {
      "id": "objects",
      "title": "The evidence table",
      "unit": "1A · Objects & materials",
      "story": "Clara has found three objects. Match each one to its description to restore the first label.",
      "image": "objects",
      "hint": "Made of describes material. Belong to tells us who owns something. Worth describes value.",
      "tasks": [
        {
          "type": "match",
          "prompt": "Look at the picture. Reconnect the three labels.",
          "pairs": [
            [
              "The bag",
              "made of leather"
            ],
            [
              "The mug",
              "made of ceramic"
            ],
            [
              "The speaker",
              "a wireless gadget"
            ]
          ],
          "why": "The material describes what something is made of; wireless describes how a device connects.",
          "id": "m1q1"
        },
        {
          "type": "choice",
          "prompt": "The bag ___ to the traveller, but she donated it to the museum.",
          "options": [
            "belonged",
            "worth",
            "inherited"
          ],
          "answer": "belonged",
          "why": "Belong to + person tells us about ownership.",
          "id": "m1q2"
        },
        {
          "type": "choice",
          "prompt": "It is not worth much money, but it is ___ to her.",
          "options": [
            "damaged",
            "special",
            "wireless"
          ],
          "answer": "special",
          "why": "Something can be personally special without being expensive.",
          "id": "m1q3"
        }
      ],
      "clue": "SMALL"
    },
    {
      "id": "past",
      "title": "Rebuild the timeline",
      "unit": "1A · Narrative tenses",
      "story": "A damaged notebook tells the story of the bag. Restore the timeline.",
      "image": "objects",
      "hint": "Past Continuous: background. Past Simple: main event. Past Perfect: something earlier.",
      "tasks": [
        {
          "type": "choice",
          "prompt": "Clara ___ through the archive when she found the notebook.",
          "options": [
            "looked",
            "was looking",
            "has looked"
          ],
          "answer": "was looking",
          "why": "Was looking was in progress when she found it.",
          "id": "m2q1"
        },
        {
          "type": "choice",
          "prompt": "The traveller ___ the bag ten years earlier, before she began her journey.",
          "options": [
            "had inherited",
            "has inherited",
            "was inheriting"
          ],
          "answer": "had inherited",
          "why": "Had inherited makes the earlier event clear.",
          "id": "m2q2"
        },
        {
          "type": "choice",
          "prompt": "Clara opened the notebook and ___ the first page.",
          "options": [
            "was reading",
            "had read",
            "read"
          ],
          "answer": "read",
          "why": "Opened and read are completed events in sequence.",
          "id": "m2q3"
        },
        {
          "type": "order",
          "prompt": "Build the sentence that explains why the bag mattered.",
          "parts": [
            "She",
            "had inherited",
            "the bag",
            "before",
            "she left home."
          ],
          "why": "Past Perfect puts inheriting before leaving home.",
          "id": "m2q4"
        }
      ],
      "clue": "OBJECTS"
    },
    {
      "id": "choices",
      "title": "Pack only what matters",
      "unit": "1B · Preferences & verb patterns",
      "story": "There is room for only a few things in the exhibition. Help Clara decide what to keep.",
      "hint": "Enjoy / avoid + -ing. Decide / hope + to + verb. After a preposition, use -ing.",
      "tasks": [
        {
          "type": "match",
          "prompt": "Reconnect each verb pattern.",
          "pairs": [
            [
              "Her hobby is collecting. She enjoys",
              "collecting old objects."
            ],
            [
              "She made a decision. She decided",
              "to keep the bag."
            ],
            [
              "She finally located the owner. She succeeded in",
              "finding its owner."
            ],
            [
              "The opening is tomorrow and she is excited. She looks forward to",
              "opening the exhibition."
            ]
          ],
          "why": "Learn the complete chunks: enjoy doing, decide to do, succeed in doing, look forward to doing.",
          "id": "m3q1"
        },
        {
          "type": "choice",
          "prompt": "I can ___ extra furniture, but I want to keep this mug.",
          "options": [
            "do without",
            "belong to",
            "be worth"
          ],
          "answer": "do without",
          "why": "Do without means manage without something.",
          "id": "m3q2"
        },
        {
          "type": "choice",
          "prompt": "The speaker turned out ___ useful.",
          "options": [
            "being",
            "to be",
            "be"
          ],
          "answer": "to be",
          "why": "Turn out to be means prove to be.",
          "id": "m3q3"
        },
        {
          "type": "talk",
          "prompt": "Choose one object in the first picture to keep. Tell Clara why.",
          "checks": [
            "I chose an object and explained why.",
            "I used enjoy + -ing or decide + to."
          ],
          "model": "I'd keep the mug because I enjoy drinking tea while I work. I've decided to do without extra furniture.",
          "id": "m3q4"
        }
      ],
      "clue": "TELL"
    },
    {
      "id": "requests",
      "title": "Prepare the gallery",
      "unit": "1C · Housework & polite requests",
      "story": "Visitors are arriving soon. Reconnect the tasks and leave a polite request for a colleague.",
      "hint": "Use the whole phrasal verb. With mind, use -ing: Would you mind helping?",
      "tasks": [
        {
          "type": "match",
          "prompt": "Match the task to the correct action.",
          "pairs": [
            [
              "The bin is full.",
              "Take out the rubbish."
            ],
            [
              "Coats are on the floor.",
              "Hang them up."
            ],
            [
              "The room is messy.",
              "Tidy it up."
            ],
            [
              "The milk has gone bad.",
              "Throw it out."
            ],
            [
              "The room is too cold.",
              "Turn up the heating."
            ]
          ],
          "why": "The particle changes the meaning: take out, hang up, tidy up, throw out, turn up.",
          "id": "m4q1"
        },
        {
          "type": "order",
          "prompt": "Build a polite request.",
          "parts": [
            "I wonder",
            "if you could",
            "pick up",
            "the keys",
            "for me."
          ],
          "why": "I wonder if you could + verb makes a polite request.",
          "id": "m4q2"
        },
        {
          "type": "order",
          "prompt": "Build another polite request.",
          "parts": [
            "Would you mind",
            "watering",
            "the plants",
            "while",
            "I am away?"
          ],
          "why": "Would you mind is followed by -ing.",
          "id": "m4q3"
        }
      ],
      "clue": "STORIES"
    },
    {
      "id": "voicemail",
      "title": "Decode the voicemail",
      "unit": "1C–1D · Messages & gadgets",
      "story": "Before leaving a message for Clara, practise with seven original phone messages from Lesson 1C. For questions 1–3, focus on messages 1, 2 and 4. Then return to the museum story and record your own practice with the checklist.",
      "audio": "voicemail",
      "image": "objects",
      "hint": "Listen for the place, the object to keep, and the power source. Replay as often as you need.",
      "tasks": [
        {
          "type": "choice",
          "prompt": "In message 1, what did Marcelo leave at the restaurant?",
          "options": [
            "His folder",
            "His leather jacket",
            "Some pizzas"
          ],
          "answer": "His leather jacket",
          "why": "Marcelo says he left his leather jacket on the hook by the stairs.",
          "id": "m5q1-original",
          "listen": true
        },
        {
          "type": "choice",
          "prompt": "In message 2, where is the garage key?",
          "options": [
            "On the kitchen table next to the window",
            "On a hook by the stairs",
            "On a desk in the office"
          ],
          "answer": "On the kitchen table next to the window",
          "why": "Sam’s mum says the key is in the kitchen, on the table next to the window.",
          "id": "m5q2-original",
          "listen": true
        },
        {
          "type": "choice",
          "prompt": "In message 4, what does Patricia ask Jacob to bring?",
          "options": [
            "Some plants",
            "A leather jacket",
            "Her folder"
          ],
          "answer": "Her folder",
          "why": "Patricia asks Jacob to bring her folder to the meeting.",
          "id": "m5q3-original",
          "listen": true
        },
        {
          "type": "talk",
          "prompt": "Back in the museum story: leave Clara a short message to say you have found the bag. Describe a gadget you are bringing and ask her to call back.",
          "checks": [
            "I said who I am and why I am calling.",
            "I described the gadget and asked for a call back."
          ],
          "model": "Hi Clara, it's Alex. I've found the bag. I'm bringing the wireless speaker, which runs on batteries. Could you call me back when you arrive?",
          "id": "m5q4"
        }
      ],
      "clue": "ABOUT"
    },
    {
      "id": "habits",
      "title": "Find a better routine",
      "unit": "2A · Habits & present perfect continuous",
      "story": "Listen to four original practice sentences from Lesson 2A. Choose the time details, then replay and repeat the sentences, paying attention to the weak form of been. Questions 3–5 return to Clara’s fictional exhibition plans.",
      "audio": "habit",
      "hint": "Have/has been + -ing: activity over a period. Since + starting point; for + duration. Finished results often use Present Perfect Simple.",
      "tasks": [
        {
          "type": "choice",
          "prompt": "In sentence 2, when did the speaker start studying English?",
          "options": [
            "Five years ago",
            "Last week",
            "At the age of ten"
          ],
          "answer": "At the age of ten",
          "why": "The speaker says “since I was ten”.",
          "id": "m6q1-original",
          "listen": true
        },
        {
          "type": "choice",
          "prompt": "In sentence 4, how long has the speaker been living there?",
          "options": [
            "For three weeks",
            "For five years",
            "Since Monday"
          ],
          "answer": "For five years",
          "why": "The speaker says “for five years”.",
          "id": "m6q2-original",
          "listen": true
        },
        {
          "type": "match",
          "prompt": "Repair the habit phrases.",
          "pairs": [
            [
              "put off",
              "a difficult job"
            ],
            [
              "give up",
              "a bad habit"
            ],
            [
              "set",
              "a realistic goal"
            ],
            [
              "stick to",
              "a plan"
            ]
          ],
          "why": "Put off = delay; give up = stop; set a goal = decide what to achieve; stick to = continue following.",
          "id": "m6q3"
        },
        {
          "type": "choice",
          "prompt": "She ___ on the exhibition for three weeks, and she is still working on it.",
          "options": [
            "has been working",
            "worked",
            "is work"
          ],
          "answer": "has been working",
          "why": "The activity started in the past and continues now.",
          "id": "m6q4"
        },
        {
          "type": "choice",
          "prompt": "She ___ six labels today. They are ready to print.",
          "options": [
            "has been finishing",
            "has finished",
            "finishes"
          ],
          "answer": "has finished",
          "why": "Six completed labels is a result, so use Present Perfect Simple.",
          "id": "m6q5"
        }
      ],
      "clue": "PEOPLE"
    },
    {
      "id": "people",
      "title": "Find the right teammate",
      "unit": "2B · Feelings & relative clauses",
      "story": "Clara needs someone helpful who can also say no. Read the team notes and repair the descriptions.",
      "hint": "Who/that: people. Which/that: things. An object relative pronoun can be omitted. People waiting = people who are waiting.",
      "tasks": [
        {
          "type": "match",
          "prompt": "Match the behaviour to the phrase.",
          "pairs": [
            [
              "Agrees just to avoid an argument",
              "goes with the crowd"
            ],
            [
              "Feels relaxed with the team",
              "feels comfortable"
            ],
            [
              "Is unhappy after a negative comment",
              "gets upset"
            ],
            [
              "Is irritable today",
              "is in a bad mood"
            ]
          ],
          "why": "These phrases describe a response in a situation, not a permanent label for a person.",
          "id": "m7q1"
        },
        {
          "type": "choice",
          "prompt": "The colleague ___ helped me is very reliable.",
          "options": [
            "who",
            "which",
            "where"
          ],
          "answer": "who",
          "why": "Who is the subject of helped and refers to a person.",
          "id": "m7q2"
        },
        {
          "type": "choice",
          "prompt": "Which sentence can omit the relative pronoun?",
          "options": [
            "The woman who called is here.",
            "The bag that I found is old.",
            "The mug that fell broke."
          ],
          "answer": "The bag that I found is old.",
          "why": "I is the subject of found; that is its object, so it can be omitted.",
          "id": "m7q3"
        },
        {
          "type": "choice",
          "prompt": "People waiting outside need an update. This means…",
          "options": [
            "People who waited yesterday",
            "People who are waiting outside",
            "People who will never wait"
          ],
          "answer": "People who are waiting outside",
          "why": "Waiting is a reduced active relative clause.",
          "id": "m7q4"
        },
        {
          "type": "choice",
          "prompt": "She was the first person ___ help.",
          "options": [
            "offering",
            "to offer",
            "offer"
          ],
          "answer": "to offer",
          "why": "After the first person, to + infinitive is natural.",
          "id": "m7q5"
        }
      ],
      "clue": "AND"
    },
    {
      "id": "email",
      "title": "Protect your plans",
      "unit": "2B · Declining invitations",
      "story": "An invitation arrives, but you have promised to finish the exhibition. Decline warmly and suggest another time.",
      "hint": "Thank them, say you cannot come, briefly explain, suggest another time, and close warmly. A model is available.",
      "tasks": [
        {
          "type": "order",
          "prompt": "Put a friendly email in order.",
          "parts": [
            "Hi Maya,",
            "Thanks for inviting me to dinner.",
            "I’m afraid I can’t make it on Friday.",
            "I’ve already promised to help at the museum.",
            "Could we meet on Sunday instead?",
            "Hope you have a lovely evening!"
          ],
          "why": "A polite refusal can be clear and friendly at the same time.",
          "id": "m8q1"
        },
        {
          "type": "choice",
          "prompt": "Which phrase fits a more formal email to an organiser?",
          "options": [
            "Cheers, mate!",
            "I regret that I will be unable to attend.",
            "Nope, not coming."
          ],
          "answer": "I regret that I will be unable to attend.",
          "why": "This is a formal way to decline an invitation.",
          "id": "m8q2"
        },
        {
          "type": "writing",
          "prompt": "Write your own 40–60-word reply to Maya, or dictate it to your teacher. Her invitation: “Would you like to have dinner with us on Friday?”",
          "checks": [
            "I thanked Maya and clearly declined.",
            "I gave a brief reason.",
            "I suggested another time and used a friendly ending."
          ],
          "model": "Hi Maya, thanks so much for inviting me to dinner on Friday. I'm afraid I can't make it because I've promised to help finish an exhibition at the museum. Could we meet on Sunday afternoon instead? I hope you all have a lovely evening!",
          "why": "This is an open writing task. Use the checklist with your teacher; it is not automatically graded.",
          "id": "m8q3"
        }
      ],
      "clue": "HOW"
    },
    {
      "id": "annoying",
      "title": "A delay at the station",
      "unit": "2C · Annoying behaviour",
      "story": "Look at the station illustration for question 1. Then listen to the original Lesson 2C conversation for questions 2–3: a traveller explains a difficult journey. Questions 4–5 practise ways of describing annoyance.",
      "image": "station",
      "audio": "station",
      "hint": "I can’t stand it when… / It gets on my nerves. Present Continuous + always can express annoyance.",
      "tasks": [
        {
          "type": "choice",
          "prompt": "Which annoying behaviour can you see in the picture?",
          "options": [
            "Someone jumping the queue",
            "Someone watering plants",
            "Someone packing a suitcase"
          ],
          "answer": "Someone jumping the queue",
          "why": "Jump the queue means go ahead of people who were already waiting.",
          "id": "m9q1"
        },
        {
          "type": "choice",
          "prompt": "Why did the traveller have to queue for a ticket?",
          "options": [
            "The ticket machines were broken.",
            "The train had no empty seats.",
            "A window was open."
          ],
          "answer": "The ticket machines were broken.",
          "why": "The traveller had to queue because the ticket machines were broken.",
          "id": "m9q2-original",
          "listen": true
        },
        {
          "type": "choice",
          "prompt": "Did the traveller arrive late?",
          "options": [
            "The recording does not say.",
            "Yes — the traveller missed a stop.",
            "No — the traveller arrived on time."
          ],
          "answer": "Yes — the traveller missed a stop.",
          "why": "The conversation starts with “Sorry I’m late” and ends with the explanation that the traveller missed a stop.",
          "id": "m9q3-original",
          "listen": true
        },
        {
          "type": "order",
          "prompt": "Build a sentence about irritation.",
          "parts": [
            "It really",
            "gets on",
            "my nerves",
            "when people",
            "jump the queue."
          ],
          "why": "Get on my nerves means annoy me.",
          "id": "m9q4"
        },
        {
          "type": "choice",
          "prompt": "Choose the sentence that expresses annoyance about repeated behaviour.",
          "options": [
            "People always polite.",
            "People are always playing loud music here!",
            "People have music yesterday."
          ],
          "answer": "People are always playing loud music here!",
          "why": "Present Continuous with always can show the speaker is annoyed.",
          "id": "m9q5"
        }
      ],
      "clue": "THEY"
    },
    {
      "id": "jungle",
      "title": "Fight, flight or freeze?",
      "unit": "2D · Reactions & clarification",
      "story": "Watch the original BBC clip Planet Earth II: Jungles from Lesson 2D. Find out how a Draco lizard escapes, then discuss possible reactions to difficult situations before collecting your last clue.",
      "video": "jungle",
      "image": "jungle",
      "hint": "Fight: face the threat. Flight: move away. Freeze: stay still. Ask: How do you mean? / Why’s that?",
      "tasks": [
        {
          "type": "choice",
          "prompt": "In the BBC clip, how does the Draco lizard escape?",
          "options": [
            "It swims across a river.",
            "It glides between trees.",
            "It wins a fight with the larger lizard."
          ],
          "answer": "It glides between trees.",
          "why": "The documentary shows the lizard gliding to another tree; the narrator describes lizards that can soar like dragons.",
          "id": "m10q1-original",
          "listen": true
        },
        {
          "type": "match",
          "prompt": "Match each response to its name.",
          "pairs": [
            [
              "Face a threat directly",
              "fight"
            ],
            [
              "Move away from a threat",
              "flight"
            ],
            [
              "Stay completely still",
              "freeze"
            ]
          ],
          "why": "These are three possible responses. Real situations can be more complicated.",
          "id": "m10q2"
        },
        {
          "type": "choice",
          "prompt": "Your partner says, “I would react differently.” Ask for clarification.",
          "options": [
            "How do you mean?",
            "You’re welcome.",
            "Never mind the weather."
          ],
          "answer": "How do you mean?",
          "why": "How do you mean? invites your partner to explain.",
          "id": "m10q3"
        },
        {
          "type": "talk",
          "prompt": "Imagine you saw a snake in your room, or someone dropped litter on a train. What would you do? Ask your partner a follow-up question.",
          "checks": [
            "I described an imagined reaction using would.",
            "I asked a clarification question."
          ],
          "model": "If I saw a snake, I'd freeze for a moment and then move away slowly. How about you? Why's that?",
          "id": "m10q4"
        }
      ],
      "clue": "CHANGE"
    }
  ],
  "media": {
    "voicemail": {
      "title": "Phone messages · 1.04",
      "src": "../media/so3-b1-sb-1c-audio-1-04.mp3",
      "source": "Speakout B1+ Third Edition · SB p.15 ex.3B; audioscript p.157",
      "text": "1 A: You’ve reached Café Roma. I’m afraid we’re busy at the moment. Please leave a message and we’ll get back to you. B: Hello. This is Marcelo Fagundes. I’m calling about my jacket. I was having dinner in your restaurant an hour ago and I left my jacket. Do you think you could have a look for it for me? It’s the leather jacket hanging on the hook by the stairs. Can you call me back? You can reach me on this number – 0779542867.\n\n2 A: You’ve reached Sam’s mobile. Please leave a message. B: Hi Sam. It’s Mum. Could you check that the garage door is locked? I think I might have left it open. The key’s in the kitchen. You’ll find it on the table next to the window. Also, before you leave, will you take out the rubbish please, and make sure you turn the heating off? Thanks. See you later.\n\n3 A: I’m sorry I can’t take your call at the moment. Please leave a message B: Hi Riccardo. It’s Gemma. I’ve got a guest coming to stay in the apartment later. Would you explain the alarm system to her? You’ll need to unlock the box and show her how it works. That would be really helpful. Thanks.\n\n4 A: Hi, you’re through to Jacob. I can’t take your call right now, but if you leave a message with your name and number, I’ll get back to you as soon as I can. B: Hi Jacob, it’s Patricia here. I wonder if you could bring my folder to the meeting? You’ll find it on my desk in the office. The meeting starts at 4 p.m., so we’ll need to be there at least fifteen minutes earlier. Could you please let me know that you’ve got this message? Thanks.\n\n5 A: Noelie, it’s Pete. Listen, I was going to cook, but there’s no food in the house. Do you think you’ll be able to pick up some pizzas on the way home? There’s a great place just on the corner by the station. You choose the toppings. That would be great. Bye.\n\n6 A: Thank you for calling Smiths and Co. Our office hours are 8 a.m. to 6 p.m. If it’s urgent, please leave a message with your name and number and we’ll contact you as soon as possible. B: Hello. This is Natalie Ivanov. I’m calling because we have a broken pipe in our house and the water is going everywhere! I need someone to come and fix it, please. Will you please call me back as soon as possible? It’s urgent. You can reach me on this number.\n\n7 A: Hi, you’re through to Teresa. Please leave me a message and I’ll call you right back. B: Hi Teresa, it’s Yumi. I’m calling to ask a favour. I’m going away in a couple of weeks. I wonder if you’d mind watering the plants for me, like you did last time. I can leave the key with my neighbour. That would be so kind. Let me know. Bye."
    },
    "habit": {
      "title": "Present perfect continuous · 2.01",
      "src": "../media/so3-b1-sb-2a-audio-2-01.mp3",
      "source": "Speakout B1+ Third Edition · SB p.22 ex.7A; audioscript p.158",
      "text": "1 How long have you been studying English?\n2 I’ve been studying since I was ten.\n3 Have you been living in the same place for a long time?\n4 I’ve been living there for five years."
    },
    "station": {
      "title": "An annoying journey · 2.07",
      "src": "../media/so3-b1-sb-2c-audio-2-07.mp3",
      "source": "Speakout B1+ Third Edition · SB p.27 ex.2B; audioscript p.159",
      "text": "A: Sorry I’m late. I had a really bad journey.\nB: Why? Were there a lot of people on the train?\nA: No, not many, but it’s just the way some people behave. I can’t stand it.\nB: Why, what happened?\nA: Everything. First I had to queue to buy a ticket because the ticket machines were broken.\nB: I hate it when that happens.\nA: And of course people were jumping the queue, saying they were in a hurry and could they please go in front of me.\nB: Maybe they were in a hurry.\nA: Right. Like I wasn’t?\nB: All right.\nA: Then I got on the train, sat down – there were lots of empty seats – and this guy sat down next to me, took out a burger and started to eat it.\nB: Yuk! People are always doing that on trains! I expect it smelled bad.\nA: Yeah, the smell was terrible! It really got on my nerves. I kept looking at him, you know like this, but he didn’t react. So annoying.\nB: Sometimes it’s better if you don’t react.\nA: You mean do nothing? Maybe. Anyway, after two stops he got off … but then three teenagers got on and they were watching a football match. Really loud.\nB: You really did have a bad time.\nA: And then one of them opened some windows and it was like a tornado. It blew my hair all over the place.\nB: I know what you mean, without asking anyone?\nA: Yeah, it really annoys me when they do that.\nB: You’re always getting so upset about things. And you’re here now.\nA: But that sort of behaviour really bugs me. And I’m not finished.\nB: There’s more?\nA: I was so annoyed that I didn’t pay attention to where we were, and I missed my stop.\nB: It really doesn’t matter. Look, let’s get something to eat.\nA: OK, sorry …"
    },
    "jungle": {
      "title": "Planet Earth II: Jungles · BBC documentary",
      "src": "../media/so3-b1-u2-bbc-programmes.mp4",
      "source": "Speakout B1+ Third Edition · SB p.28 ex.2A–B; videoscript p.170",
      "text": "If you are small, finding the right tree can mean a home for life. He’s a Draco lizard. He’s only the size of a pencil and he eats ants. This one tree could provide him with all he will ever need, a conveyor belt of food. It’s a perfect place to settle down. Well, it would be, but there’s already someone here. This larger male is the tree’s owner and Dracos don’t share. The owner’s flag is a warning – trespassers won’t be tolerated. The owner’s not only intimidating, he’s prepared to battle. A dead end. Safety is a long way away. Now he must choose – fight or flee. Only in the jungle do you find lizards that can soar like dragons. He can travel over 30 metres in a single leap. It’s a very fast and efficient way to move through the jungle. Maybe this new tree will have food and no resident owner."
    }
  },
  "solution": [
    "SMALL",
    "OBJECTS",
    "TELL",
    "STORIES",
    "ABOUT",
    "PEOPLE",
    "AND",
    "HOW",
    "THEY",
    "CHANGE"
  ]
};
