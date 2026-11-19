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
      "story": "Clara has sent a new message. Listen before opening the transcript, then collect the right equipment.",
      "audio": "voicemail",
      "image": "objects",
      "hint": "Listen for the place, the object to keep, and the power source. Replay as often as you need.",
      "tasks": [
        {
          "type": "choice",
          "prompt": "Where is the bag?",
          "options": [
            "Under the desk",
            "Beside the window",
            "Next to the door"
          ],
          "answer": "Beside the window",
          "why": "Clara says: You will find it beside the window.",
          "id": "m5q1"
        },
        {
          "type": "choice",
          "prompt": "Which item must you keep?",
          "options": [
            "The envelope",
            "The old batteries",
            "The box under the desk"
          ],
          "answer": "The envelope",
          "why": "She asks you not to throw out the envelope inside the bag.",
          "id": "m5q2"
        },
        {
          "type": "choice",
          "prompt": "Why is no socket needed?",
          "options": [
            "The speaker uses solar power.",
            "The speaker runs on batteries.",
            "The speaker does not work."
          ],
          "answer": "The speaker runs on batteries.",
          "why": "A battery-powered gadget does not need a socket while its batteries have power.",
          "id": "m5q3"
        },
        {
          "type": "talk",
          "prompt": "Leave Clara a short reply and describe the gadget you are bringing.",
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
      "story": "The notebook includes Clara’s progress update. Find out what has been changing.",
      "audio": "habit",
      "hint": "Have/has been + -ing: activity over a period. Since + starting point; for + duration. Finished results often use Present Perfect Simple.",
      "tasks": [
        {
          "type": "choice",
          "prompt": "How long has Clara been working on the exhibition?",
          "options": [
            "Since last year",
            "For three days",
            "For three weeks"
          ],
          "answer": "For three weeks",
          "why": "The recording gives the duration: three weeks.",
          "id": "m6q1"
        },
        {
          "type": "choice",
          "prompt": "What has she been doing since Monday?",
          "options": [
            "Leaving her phone in another room",
            "Working without lunch",
            "Finishing a new exhibition every day"
          ],
          "answer": "Leaving her phone in another room",
          "why": "This is the new habit she describes.",
          "id": "m6q2"
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
      "story": "Look at the station scene, then listen to the traveller. Discover what helped her solve the problem.",
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
          "prompt": "What solved the music problem in the recording?",
          "options": [
            "She shouted at the man.",
            "She made a polite request.",
            "She called the police."
          ],
          "answer": "She made a polite request.",
          "why": "She asked if he could turn it down; he apologised and used headphones.",
          "id": "m9q2"
        },
        {
          "type": "choice",
          "prompt": "Did she arrive late?",
          "options": [
            "Yes, an hour late",
            "No, she arrived on time",
            "The recording does not say"
          ],
          "answer": "No, she arrived on time",
          "why": "The final sentence says she arrived on time.",
          "id": "m9q3"
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
      "story": "Watch the illustrated story film. The final scene gives you a question to discuss before restoring the last word.",
      "video": "story",
      "image": "jungle",
      "hint": "Fight: face the threat. Flight: move away. Freeze: stay still. Ask: How do you mean? / Why’s that?",
      "tasks": [
        {
          "type": "choice",
          "prompt": "In the final scene, what does the moving lizard do?",
          "options": [
            "Swims across a river",
            "Glides between trees",
            "Runs through a station"
          ],
          "answer": "Glides between trees",
          "why": "The narration describes a lizard gliding between trees.",
          "id": "m10q1"
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
      "title": "A message from the curator",
      "text": "Hello, it's Clara from the museum. I'm calling about the exhibition. Could you pick up the leather bag from my office? You'll find it beside the window, not under the desk. Please don't throw out the envelope inside it. I'd also like you to bring the wireless speaker. It runs on batteries, so we won't need a socket. I was testing it when the lights went out, but I had already saved all the recordings. Could you call me back when you arrive? Thanks so much."
    },
    "habit": {
      "title": "Small changes",
      "text": "I've been working on this exhibition for three weeks. At first, I kept putting off the difficult jobs. Then I decided to set one small goal each morning. I've been leaving my phone in another room since Monday, and it really helps. I've finished six labels today, but I haven't finished the whole exhibition yet. I'm also trying to give up checking messages during lunch. It isn't easy, but I'm sticking to my plan."
    },
    "station": {
      "title": "The journey to the museum",
      "text": "I had such an annoying journey this morning. While I was waiting to buy a ticket, someone jumped the queue. Then a man on the platform started playing music on his phone without headphones. I can't stand it when people do that. It really gets on my nerves. I wanted to say something, but I didn't want to start an argument. So I asked politely if he could turn it down. He apologised and put on his headphones. In the end, I arrived at the museum on time."
    },
    "film-1": {
      "title": "The Missing Story: the archive",
      "text": "Welcome to the Museum of Everyday Stories. I'm Clara, the curator. Our new exhibition opens soon, but its story cards have gone missing. Three objects are waiting on the table: a leather bag, a ceramic mug, and a wireless speaker. The bag belonged to a traveller. Your job is to put the exhibition back together."
    },
    "film-2": {
      "title": "The Missing Story: the station",
      "text": "The traveller was waiting at a station when she noticed something interesting. Some people were getting upset, but one calm, polite request changed the situation. She began collecting stories about ordinary objects and human behaviour. She wanted to understand why small changes can make a big difference."
    },
    "film-3": {
      "title": "The Missing Story: the jungle",
      "text": "Later, in a jungle, she watched a small lizard glide between trees. Another lizard stayed perfectly still. It made her think about our own reactions. Do we fight, run away, or freeze? Follow the clues, restore the missing words, and discover the message of her exhibition. Take your time. Every clue can be tried again."
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
