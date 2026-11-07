/* Verified teaching corrections: source SB pp.17–26 / key PDF pp.6–9; WB pp.10–15 / key PDF pp.81–83.
 * This file is the canonical manual review layer, applied after generated data.
 * It changes task definitions only; stored student answers are never rewritten here. */

(function(root){
'use strict';
const fixes={
  "sb:21:5A": {
    "text": "5A Complete the sentences with my, your, his, her, its, our or their.",
    "inline": {
      "box": [
        45.0,
        405.0,
        237.0,
        178.0
      ],
      "fields": [
        {
          "n": "2",
          "box": [
            80.0,
            458.5,
            29.0,
            13.5
          ],
          "kind": "dots",
          "id": "2.1"
        },
        {
          "n": "2",
          "box": [
            189.0,
            458.5,
            29.0,
            13.5
          ],
          "kind": "dots",
          "id": "2.2"
        },
        {
          "n": "3",
          "box": [
            80.0,
            484.5,
            29.0,
            13.5
          ],
          "kind": "dots",
          "id": "3"
        },
        {
          "n": "4",
          "box": [
            126.0,
            510.5,
            28.5,
            13.5
          ],
          "kind": "dots",
          "id": "4"
        },
        {
          "n": "5",
          "box": [
            124.5,
            536.0,
            28.5,
            13.5
          ],
          "kind": "dots",
          "id": "5"
        },
        {
          "n": "6",
          "box": [
            77.5,
            562.0,
            29.0,
            13.5
          ],
          "kind": "dots",
          "id": "6"
        }
      ],
      "rank": false,
      "given": [
        "1"
      ],
      "vowels": false,
      "letters": false
    },
    "instruction": "Заполни шесть пропусков притяжательными словами my, your, his, her, its, our или their. Our в первом предложении — готовый образец."
  },
  "sb:21:5B": {
    "text": "5B Complete the table. Use the sentences in Ex 5A to help you.",
    "responseMode": "panel",
    "instruction": "Заполни шесть пустых клеток таблицы. В одних строках нужно личное местоимение, в других — притяжательное. Пара we — our уже дана.",
    "key": {
      "raw": "1 my\n2 it\n3 you\n4 his\n5 she\n6 they",
      "items": [
        {
          "n": "1",
          "answer": "my",
          "kind": "text"
        },
        {
          "n": "2",
          "answer": "it",
          "kind": "text"
        },
        {
          "n": "3",
          "answer": "you",
          "kind": "text"
        },
        {
          "n": "4",
          "answer": "his",
          "kind": "text"
        },
        {
          "n": "5",
          "answer": "she",
          "kind": "text"
        },
        {
          "n": "6",
          "answer": "they",
          "kind": "text"
        }
      ],
      "pdf": "web/194.pdf",
      "pdfPage": 7
    },
    "responseSpec": {
      "mode": "auto",
      "items": [
        {
          "n": "1",
          "answer": "my",
          "kind": "text",
          "prompt": "I → possessive adjective"
        },
        {
          "n": "2",
          "answer": "it",
          "kind": "text",
          "prompt": "subject pronoun → its"
        },
        {
          "n": "3",
          "answer": "you",
          "kind": "text",
          "prompt": "subject pronoun → your"
        },
        {
          "n": "4",
          "answer": "his",
          "kind": "text",
          "prompt": "he → possessive adjective"
        },
        {
          "n": "5",
          "answer": "she",
          "kind": "text",
          "prompt": "subject pronoun → her"
        },
        {
          "n": "6",
          "answer": "they",
          "kind": "text",
          "prompt": "subject pronoun → their"
        }
      ]
    },
    "inline": null,
    "choice": null,
    "activity": null
  },
  "sb:21:5C": {
    "text": "5C Learn and practise. Go to page 97, Grammar Bank.",
    "responseMode": "manual",
    "instruction": "Открой указанную в задании страницу через список «Страница» и выполни упражнения там. Здесь ответ вводить не нужно."
  },
  "sb:21:6A": {
    "text": "6A Work in pairs and answer the question. How many words do you know for people? woman, friend ...",
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "sb:21:6B": {
    "text": "6B Learn and practise. Go to page 127, Vocabulary Bank: people.",
    "responseMode": "manual",
    "instruction": "Открой указанную в задании страницу через список «Страница» и выполни упражнения там. Здесь ответ вводить не нужно."
  },
  "sb:21:7A": {
    "text": "7A Work in pairs. Student A: Write questions with How old, Where and What to find the missing information (1–7) in the text. Student B: Go to page 148.",
    "responseMode": "manual",
    "instruction": "Открой указанную в задании страницу через список «Страница» и выполни упражнения там. Здесь ответ вводить не нужно."
  },
  "sb:21:7B": {
    "text": "7B Ask the questions to complete the text in Ex 7A. Then answer Student B's questions.",
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "sb:21:8A": {
    "text": "8A Write the names of friends or people in your family.",
    "responseMode": "manual",
    "instruction": "Выполни задание по оригиналу. Запиши ответ или заметки в поле ниже; проверь их вместе с преподавателем."
  },
  "sb:21:8B": {
    "text": "8B Work in pairs. Tell your partner about the people. Ask questions.",
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "sb:21:9A": {
    "text": "9A Work in pairs. Look at the photo. Where do you think the people are from?",
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "sb:21:9B": {
    "text": "9B Read the beginning of the description and check your ideas.",
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "sb:21:9C": {
    "text": "9C Write descriptions of your photos. Go to page 88, Writing Bank.",
    "responseMode": "manual",
    "instruction": "Открой указанную в задании страницу через список «Страница» и выполни упражнения там. Здесь ответ вводить не нужно."
  },
  "sb:23:3A": {
    "text": "3A Stress in phrases. Match the phrases (1–4) with the stress patterns (a–d). 1 It’s a beautiful day. 2 No problem. 3 How’s your new car? 4 Me too.",
    "responseMode": "panel",
    "instruction": "Соотнеси фразы 2–4 со схемами ударения a–d на странице. Фраза 1 уже соединена с d. Затем послушай запись в 3B.",
    "key": {
      "raw": "2 a 3 b 4 c",
      "items": [
        {
          "n": "2",
          "answer": "a"
        },
        {
          "n": "3",
          "answer": "b"
        },
        {
          "n": "4",
          "answer": "c"
        }
      ],
      "pdf": "web/194.pdf",
      "pdfPage": 8
    },
    "responseSpec": {
      "mode": "auto",
      "items": [
        {
          "n": "2",
          "answer": "a",
          "kind": "choice",
          "prompt": "No problem.",
          "options": [
            {
              "value": "a",
              "label": "a"
            },
            {
              "value": "b",
              "label": "b"
            },
            {
              "value": "c",
              "label": "c"
            },
            {
              "value": "d",
              "label": "d"
            }
          ]
        },
        {
          "n": "3",
          "answer": "b",
          "kind": "choice",
          "prompt": "How’s your new car?",
          "options": [
            {
              "value": "a",
              "label": "a"
            },
            {
              "value": "b",
              "label": "b"
            },
            {
              "value": "c",
              "label": "c"
            },
            {
              "value": "d",
              "label": "d"
            }
          ]
        },
        {
          "n": "4",
          "answer": "c",
          "kind": "choice",
          "prompt": "Me too.",
          "options": [
            {
              "value": "a",
              "label": "a"
            },
            {
              "value": "b",
              "label": "b"
            },
            {
              "value": "c",
              "label": "c"
            },
            {
              "value": "d",
              "label": "d"
            }
          ]
        }
      ]
    },
    "inline": null,
    "choice": null,
    "activity": null
  },
  "sb:23:3B": {
    "text": "3B 2.08 Listen and check.",
    "responseMode": "manual",
    "responseSpec": {
      "mode": "review",
      "items": []
    },
    "instruction": "Послушай запись и сверь ответы в упражнении 3A. Повторно вводить ответы здесь не нужно.",
    "mediaPaths": [
      "web/073.mp3"
    ]
  },
  "sb:23:3C": {
    "text": "3C Read the Future Skills box and answer the question. What are the stress patterns for these phrases? Thanks for the coffee. How are the children?",
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "sb:23:3D": {
    "text": "3D Learn and practise. Go to page 98, Grammar Bank.",
    "responseMode": "manual",
    "instruction": "Открой указанную в задании страницу через список «Страница» и выполни упражнения там. Здесь ответ вводить не нужно."
  },
  "wb:13:5B": {
    "text": "5B Complete the sentences with my, your, his, her, its, our or their.",
    "inline": {
      "box": [
        43,
        54,
        262,
        183
      ],
      "fields": [
        {
          "n": "1",
          "id": "1",
          "box": [
            152,
            83.5,
            46,
            13.5
          ],
          "kind": "dots"
        },
        {
          "n": "2",
          "id": "2",
          "box": [
            192,
            97,
            46,
            13.5
          ],
          "kind": "dots"
        },
        {
          "n": "3",
          "id": "3",
          "box": [
            229,
            117,
            46,
            13.5
          ],
          "kind": "dots"
        },
        {
          "n": "4",
          "id": "4",
          "box": [
            211,
            141,
            46,
            13.5
          ],
          "kind": "dots"
        },
        {
          "n": "5",
          "id": "5",
          "box": [
            192,
            165,
            46,
            13.5
          ],
          "kind": "dots"
        },
        {
          "n": "6",
          "id": "6",
          "box": [
            193,
            189,
            46,
            13.5
          ],
          "kind": "dots"
        },
        {
          "n": "7",
          "id": "7",
          "box": [
            177,
            213,
            46,
            13.5
          ],
          "kind": "dots"
        }
      ]
    },
    "instruction": "Заполни семь пропусков: my, your, his, her, its, our или their.",
    "sources": {
      "label": "5B",
      "sources": [
        {
          "image": "assets/wb-13.webp",
          "size": [
            1190,
            1684
          ],
          "page": 13,
          "box": [
            0.0808,
            0.0623,
            0.43114,
            0.214
          ]
        }
      ]
    }
  },
  "wb:13:5C": {
    "text": "5C Choose the correct alternative.",
    "responseSpec": {
      "mode": "auto",
      "items": [
        {
          "n": "1",
          "answer": "My",
          "kind": "choice",
          "options": [
            {
              "value": "My",
              "label": "My"
            },
            {
              "value": "I",
              "label": "I"
            }
          ]
        },
        {
          "n": "2",
          "answer": "He’s",
          "kind": "choice",
          "options": [
            {
              "value": "He’s",
              "label": "He’s"
            },
            {
              "value": "His",
              "label": "His"
            }
          ]
        },
        {
          "n": "3",
          "answer": "His",
          "kind": "choice",
          "options": [
            {
              "value": "He’s",
              "label": "He’s"
            },
            {
              "value": "His",
              "label": "His"
            }
          ]
        },
        {
          "n": "4",
          "answer": "Our",
          "kind": "choice",
          "options": [
            {
              "value": "Your",
              "label": "Your"
            },
            {
              "value": "Our",
              "label": "Our"
            }
          ]
        },
        {
          "n": "5",
          "answer": "they’re",
          "kind": "choice",
          "options": [
            {
              "value": "their",
              "label": "their"
            },
            {
              "value": "they’re",
              "label": "they’re"
            }
          ]
        },
        {
          "n": "6",
          "answer": "Our",
          "kind": "choice",
          "options": [
            {
              "value": "Her",
              "label": "Her"
            },
            {
              "value": "Our",
              "label": "Our"
            }
          ]
        },
        {
          "n": "7",
          "answer": "Her",
          "kind": "choice",
          "options": [
            {
              "value": "She",
              "label": "She"
            },
            {
              "value": "Her",
              "label": "Her"
            }
          ]
        },
        {
          "n": "8",
          "answer": "Its",
          "kind": "choice",
          "options": [
            {
              "value": "Its",
              "label": "Its"
            },
            {
              "value": "It’s",
              "label": "It’s"
            }
          ]
        }
      ]
    },
    "responseMode": "panel",
    "inline": null,
    "choice": null,
    "activity": null,
    "instruction": "Прочитай текст About me и выбери один вариант в каждой из восьми пар.",
    "sources": {
      "label": "5C",
      "sources": [
        {
          "image": "assets/wb-13.webp",
          "size": [
            1190,
            1684
          ],
          "page": 13,
          "box": [
            0.075,
            0.28,
            0.416,
            0.267
          ]
        }
      ]
    }
  },
  "sb:17:1": {
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "sb:17:2": {
    "responseMode": "manual",
    "instruction": "Посмотри оригинальное видео. Сколько говорящих сейчас находятся в Италии? Запиши свой ответ ниже.",
    "mediaPaths": [
      "web/200.mp4"
    ]
  },
  "sb:18:1B": {
    "responseMode": "manual",
    "instruction": "Послушай оригинальную запись и выполни устную часть задания. Если нужно, оставь заметку; письменный ответ здесь необязателен."
  },
  "sb:18:1D": {
    "responseMode": "manual",
    "instruction": "Послушай оригинальную запись и выполни устную часть задания. Если нужно, оставь заметку; письменный ответ здесь необязателен."
  },
  "sb:18:2A": {
    "responseMode": "manual",
    "instruction": "Выполни задание по оригиналу. Запиши ответ или заметки в поле ниже; проверь их вместе с преподавателем."
  },
  "sb:18:2B": {
    "responseMode": "manual",
    "instruction": "Послушай оригинальную запись и выполни устную часть задания. Если нужно, оставь заметку; письменный ответ здесь необязателен."
  },
  "sb:18:2C": {
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "sb:18:3B": {
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "sb:18:3C": {
    "responseMode": "manual",
    "instruction": "Открой указанную в задании страницу через список «Страница» и выполни упражнения там. Здесь ответ вводить не нужно."
  },
  "sb:18:4A": {
    "responseMode": "manual",
    "instruction": "Выполни задание по оригиналу. Запиши ответ или заметки в поле ниже; проверь их вместе с преподавателем."
  },
  "sb:18:4B": {
    "responseMode": "manual",
    "instruction": "Выполни задание по оригиналу. Запиши ответ или заметки в поле ниже; проверь их вместе с преподавателем."
  },
  "sb:19:5A": {
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем.",
    "sources": {
      "label": "5A",
      "sources": [
        {
          "image": "assets/sb-19.webp",
          "size": [
            1190,
            1684
          ],
          "box": [
            0.07007,
            0.57275,
            0.44614,
            0.37922
          ],
          "page": 19
        },
        {
          "image": "assets/sb-19.webp",
          "size": [
            1190,
            1684
          ],
          "page": 19,
          "box": [
            0,
            0.04,
            1,
            0.49
          ],
          "context": true
        }
      ]
    }
  },
  "sb:19:5E": {
    "responseMode": "manual",
    "instruction": "Открой указанную в задании страницу через список «Страница» и выполни упражнения там. Здесь ответ вводить не нужно."
  },
  "sb:19:6B": {
    "responseMode": "manual",
    "instruction": "Открой указанную в задании страницу через список «Страница» и выполни упражнения там. Здесь ответ вводить не нужно."
  },
  "sb:19:7": {
    "responseMode": "manual",
    "instruction": "Открой указанную в задании страницу через список «Страница» и выполни упражнения там. Здесь ответ вводить не нужно."
  },
  "sb:20:2A": {
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "sb:20:2B": {
    "responseMode": "manual",
    "instruction": "Послушай оригинальную запись и выполни устную часть задания. Если нужно, оставь заметку; письменный ответ здесь необязателен."
  },
  "sb:20:3": {
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "sb:20:4C": {
    "responseMode": "panel",
    "instruction": "Послушай запись 2.05. Заполни только пустые клетки: возраст — цифрами, страну и занятие — по-английски. Поля подписаны: имя человека и нужная клетка.",
    "key": {
      "raw": "1 8\n2 Italy\n3 45\n4 21\n5 the UK / UK\n6 18\n7 a student at university / student at university\n8 Colombia\n9 a doctor / doctor",
      "items": [
        {
          "n": "1",
          "answer": "8",
          "kind": "text"
        },
        {
          "n": "2",
          "answer": "Italy",
          "kind": "text"
        },
        {
          "n": "3",
          "answer": "45",
          "kind": "text"
        },
        {
          "n": "4",
          "answer": "21",
          "kind": "text"
        },
        {
          "n": "5",
          "answer": "the UK / UK",
          "kind": "text"
        },
        {
          "n": "6",
          "answer": "18",
          "kind": "text"
        },
        {
          "n": "7",
          "answer": "a student at university / student at university",
          "kind": "text"
        },
        {
          "n": "8",
          "answer": "Colombia",
          "kind": "text"
        },
        {
          "n": "9",
          "answer": "a doctor / doctor",
          "kind": "text"
        }
      ],
      "pdf": "web/194.pdf",
      "pdfPage": 7
    },
    "responseSpec": {
      "mode": "auto",
      "items": [
        {
          "n": "1",
          "answer": "8",
          "kind": "text",
          "prompt": "Mia — age"
        },
        {
          "n": "2",
          "answer": "Italy",
          "kind": "text",
          "prompt": "Mia — country now"
        },
        {
          "n": "3",
          "answer": "45",
          "kind": "text",
          "prompt": "Jessica — age"
        },
        {
          "n": "4",
          "answer": "21",
          "kind": "text",
          "prompt": "Justin — age"
        },
        {
          "n": "5",
          "answer": "the UK / UK",
          "kind": "text",
          "prompt": "Justin — country now"
        },
        {
          "n": "6",
          "answer": "18",
          "kind": "text",
          "prompt": "Emma — age"
        },
        {
          "n": "7",
          "answer": "a student at university / student at university",
          "kind": "text",
          "prompt": "Emma — job or studies"
        },
        {
          "n": "8",
          "answer": "Colombia",
          "kind": "text",
          "prompt": "David — country now"
        },
        {
          "n": "9",
          "answer": "a doctor / doctor",
          "kind": "text",
          "prompt": "David — job or studies"
        }
      ]
    },
    "inline": null,
    "choice": null,
    "activity": null,
    "mediaPaths": [
      "web/070.mp3"
    ]
  },
  "sb:20:4D": {
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем.",
    "sources": {
      "label": "4D",
      "sources": [
        {
          "image": "assets/sb-20.webp",
          "size": [
            1190,
            1684
          ],
          "page": 20,
          "box": [
            0.043,
            0.55,
            0.91,
            0.4
          ]
        },
        {
          "image": "assets/sb-20.webp",
          "size": [
            1190,
            1684
          ],
          "page": 20,
          "box": [
            0,
            0,
            1,
            0.5
          ],
          "context": true
        },
        {
          "image": "assets/sb-21.webp",
          "size": [
            1190,
            1684
          ],
          "page": 21,
          "box": [
            0.05,
            0.015,
            0.4,
            0.39
          ],
          "context": true
        }
      ]
    }
  },
  "sb:22:1B": {
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "sb:23:4A": {
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "sb:23:4B": {
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "sb:23:4C": {
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "sb:23:5A": {
    "responseMode": "manual",
    "instruction": "Выполни задание по оригиналу. Запиши ответ или заметки в поле ниже; проверь их вместе с преподавателем."
  },
  "sb:23:5B": {
    "responseMode": "manual",
    "instruction": "Выполни задание по оригиналу. Запиши ответ или заметки в поле ниже; проверь их вместе с преподавателем."
  },
  "sb:23:6": {
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "sb:24:2A": {
    "responseMode": "manual",
    "instruction": "Открой указанную в задании страницу через список «Страница» и выполни упражнения там. Здесь ответ вводить не нужно."
  },
  "sb:24:2B": {
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем.",
    "mediaPaths": [
      "web/199.mp4"
    ]
  },
  "sb:25:3B": {
    "responseMode": "manual",
    "instruction": "Открой указанную в задании страницу через список «Страница» и выполни упражнения там. Здесь ответ вводить не нужно."
  },
  "sb:25:4A": {
    "responseMode": "manual",
    "instruction": "Выполни задание по оригиналу. Запиши ответ или заметки в поле ниже; проверь их вместе с преподавателем."
  },
  "sb:25:4B": {
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "sb:25:4D": {
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "sb:25:5": {
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "sb:25:6B": {
    "responseMode": "manual",
    "instruction": "Выполни задание по оригиналу. Запиши ответ или заметки в поле ниже; проверь их вместе с преподавателем."
  },
  "sb:26:2C": {
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "sb:26:3B": {
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "sb:26:3C": {
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "sb:26:4B": {
    "responseMode": "manual",
    "instruction": "Выполни задание по оригиналу. Запиши ответ или заметки в поле ниже; проверь их вместе с преподавателем."
  },
  "sb:26:4C": {
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "sb:26:5A": {
    "responseMode": "manual",
    "instruction": "Выполни задание по оригиналу. Запиши ответ или заметки в поле ниже; проверь их вместе с преподавателем."
  },
  "sb:26:5B": {
    "responseMode": "manual",
    "instruction": "Открой указанную в задании страницу через список «Страница» и выполни упражнения там. Здесь ответ вводить не нужно."
  },
  "wb:10:2": {
    "responseMode": "panel",
    "instruction": "Послушай запись 2.02. Для каждого слова выбери a (первый слог под ударением) или b (второй слог).",
    "responseSpec": {
      "mode": "auto",
      "items": [
        {
          "n": "1",
          "answer": "b",
          "kind": "choice",
          "prompt": "1. thirteen",
          "options": [
            {
              "value": "a",
              "label": "a · ударение на первом слоге"
            },
            {
              "value": "b",
              "label": "b · ударение на втором слоге"
            }
          ]
        },
        {
          "n": "2",
          "answer": "a",
          "kind": "choice",
          "prompt": "2. eighty",
          "options": [
            {
              "value": "a",
              "label": "a · ударение на первом слоге"
            },
            {
              "value": "b",
              "label": "b · ударение на втором слоге"
            }
          ]
        },
        {
          "n": "3",
          "answer": "a",
          "kind": "choice",
          "prompt": "3. twenty",
          "options": [
            {
              "value": "a",
              "label": "a · ударение на первом слоге"
            },
            {
              "value": "b",
              "label": "b · ударение на втором слоге"
            }
          ]
        },
        {
          "n": "4",
          "answer": "b",
          "kind": "choice",
          "prompt": "4. sixteen",
          "options": [
            {
              "value": "a",
              "label": "a · ударение на первом слоге"
            },
            {
              "value": "b",
              "label": "b · ударение на втором слоге"
            }
          ]
        },
        {
          "n": "5",
          "answer": "a",
          "kind": "choice",
          "prompt": "5. sixty",
          "options": [
            {
              "value": "a",
              "label": "a · ударение на первом слоге"
            },
            {
              "value": "b",
              "label": "b · ударение на втором слоге"
            }
          ]
        },
        {
          "n": "6",
          "answer": "b",
          "kind": "choice",
          "prompt": "6. eighteen",
          "options": [
            {
              "value": "a",
              "label": "a · ударение на первом слоге"
            },
            {
              "value": "b",
              "label": "b · ударение на втором слоге"
            }
          ]
        },
        {
          "n": "7",
          "answer": "b",
          "kind": "choice",
          "prompt": "7. fifteen",
          "options": [
            {
              "value": "a",
              "label": "a · ударение на первом слоге"
            },
            {
              "value": "b",
              "label": "b · ударение на втором слоге"
            }
          ]
        },
        {
          "n": "8",
          "answer": "a",
          "kind": "choice",
          "prompt": "8. forty",
          "options": [
            {
              "value": "a",
              "label": "a · ударение на первом слоге"
            },
            {
              "value": "b",
              "label": "b · ударение на втором слоге"
            }
          ]
        }
      ]
    },
    "inline": null,
    "choice": null,
    "activity": null,
    "mediaPaths": [
      "web/226.mp3"
    ]
  },
  "wb:10:4C": {
    "responseMode": "manual",
    "instruction": "Послушай оригинальную запись и выполни устную часть задания. Если нужно, оставь заметку; письменный ответ здесь необязателен."
  },
  "wb:12:2B": {
    "responseMode": "manual",
    "instruction": "Послушай оригинальную запись и выполни устную часть задания. Если нужно, оставь заметку; письменный ответ здесь необязателен."
  },
  "wb:12:3A": {
    "responseMode": "panel",
    "instruction": "Исправь подчёркнутое слово. В каждое поле напиши только правильное слово, а не всё предложение.",
    "responseSpec": {
      "mode": "auto",
      "items": [
        {
          "n": "1",
          "answer": "men",
          "kind": "text",
          "prompt": "mens →"
        },
        {
          "n": "2",
          "answer": "girls",
          "kind": "text",
          "prompt": "girl →"
        },
        {
          "n": "3",
          "answer": "people",
          "kind": "text",
          "prompt": "persons →"
        },
        {
          "n": "4",
          "answer": "baby",
          "kind": "text",
          "prompt": "babies →"
        },
        {
          "n": "5",
          "answer": "woman’s",
          "kind": "text",
          "prompt": "women’s →"
        }
      ]
    },
    "inline": null,
    "choice": null,
    "activity": null
  },
  "wb:12:4A": {
    "responseMode": "manual",
    "instruction": "Выполни задание по оригиналу. Запиши ответ или заметки в поле ниже; проверь их вместе с преподавателем."
  },
  "wb:12:4B": {
    "responseMode": "manual",
    "instruction": "Послушай оригинальную запись и выполни устную часть задания. Если нужно, оставь заметку; письменный ответ здесь необязателен."
  },
  "wb:13:6A": {
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "wb:13:7A": {
    "responseMode": "manual",
    "instruction": "Выполни задание по оригиналу. Запиши ответ или заметки в поле ниже; проверь их вместе с преподавателем."
  },
  "wb:13:7C": {
    "responseMode": "manual",
    "instruction": "Выполни задание по оригиналу. Запиши ответ или заметки в поле ниже; проверь их вместе с преподавателем."
  },
  "wb:13:7D": {
    "responseMode": "manual",
    "instruction": "Выполни задание по оригиналу. Запиши ответ или заметки в поле ниже; проверь их вместе с преподавателем."
  },
  "wb:14:2A": {
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "wb:14:3B": {
    "responseMode": "manual",
    "instruction": "Послушай оригинальную запись и выполни устную часть задания. Если нужно, оставь заметку; письменный ответ здесь необязателен."
  },
  "wb:14:4B": {
    "responseMode": "manual",
    "instruction": "Послушай оригинальную запись и выполни устную часть задания. Если нужно, оставь заметку; письменный ответ здесь необязателен."
  },
  "wb:14:4C": {
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "wb:14:4D": {
    "responseMode": "manual",
    "instruction": "Выполни задание устно по оригиналу. В поле ниже можно оставить заметки для обсуждения с преподавателем."
  },
  "sb:20:4B": {
    "responseMode": "manual",
    "responseSpec": {
      "mode": "review",
      "items": []
    },
    "instruction": "Послушай запись и сверь ответы в упражнении 4A. Повторно вводить ответы здесь не нужно.",
    "mediaPaths": [
      "web/070.mp3"
    ],
    "sources": {
      "label": "4B",
      "sources": [
        {
          "image": "assets/sb-20.webp",
          "size": [
            1190,
            1684
          ],
          "page": 20,
          "box": [
            0.043,
            0.55,
            0.91,
            0.4
          ]
        },
        {
          "image": "assets/sb-20.webp",
          "size": [
            1190,
            1684
          ],
          "page": 20,
          "box": [
            0,
            0,
            1,
            0.5
          ],
          "context": true
        },
        {
          "image": "assets/sb-21.webp",
          "size": [
            1190,
            1684
          ],
          "page": 21,
          "box": [
            0.05,
            0.015,
            0.4,
            0.39
          ],
          "context": true
        }
      ]
    }
  },
  "sb:22:2D": {
    "responseMode": "manual",
    "responseSpec": {
      "mode": "review",
      "items": []
    },
    "instruction": "Послушай запись и сверь ответы в упражнении 2C. Повторно вводить ответы здесь не нужно.",
    "mediaPaths": [
      "web/072.mp3"
    ],
    "text": "2D 2.07 Listen and check."
  },
  "sb:26:6B": {
    "responseMode": "manual",
    "responseSpec": {
      "mode": "review",
      "items": []
    },
    "instruction": "Послушай запись и сверь ответы в упражнении 6A. Повторно вводить ответы здесь не нужно.",
    "mediaPaths": [
      "web/078.mp3"
    ]
  },
  "sb:18:3A": {
    "instruction": "Напиши числа 49, 73 и 56 английскими словами. Пункт 1 — готовый образец.",
    "responseMode": "panel"
  },
  "sb:26:2A": {
    "instruction": "Реши примеры и напиши результаты английскими словами. Первый пример уже выполнен."
  },
  "sb:26:2B": {
    "instruction": "Добавь в каждый вопрос своё число, записанное цифрами. Затем задайте друг другу вопросы в 2C. Единственного правильного набора чисел нет.",
    "inline": {
      "box": [
        30.86,
        427.79,
        260.67,
        79.32
      ],
      "fields": [
        {
          "n": "1",
          "box": [
            128.0,
            443.5,
            28.5,
            13.5
          ],
          "kind": "dots",
          "id": "1"
        },
        {
          "n": "2",
          "box": [
            128.0,
            458.0,
            28.5,
            13.5
          ],
          "kind": "dots",
          "id": "2"
        },
        {
          "n": "3",
          "box": [
            128.0,
            472.0,
            28.5,
            13.5
          ],
          "kind": "dots",
          "id": "3"
        },
        {
          "n": "4",
          "box": [
            128.0,
            486.5,
            28.5,
            13.5
          ],
          "kind": "dots",
          "id": "4"
        }
      ],
      "rank": false,
      "given": [],
      "vowels": false,
      "letters": false
    }
  },
  "wb:10:1A": {
    "instruction": "Расположи числа по возрастанию: впиши рядом со словами номера мест от 2 до 9. Eleven уже имеет номер 1."
  },
  "wb:10:1B": {
    "instruction": "Впиши цифрами число, которое обозначает каждое слово. Используй числа из рамки."
  },
  "wb:10:1C": {
    "inline": {
      "box": [
        34.67,
        326.16,
        259.4,
        105.28
      ],
      "fields": [
        {
          "n": "1",
          "box": [
            66.5,
            340.5,
            90.0,
            13.5
          ],
          "kind": "dots",
          "id": "1"
        },
        {
          "n": "2",
          "box": [
            66.5,
            354.0,
            90.0,
            13.5
          ],
          "kind": "dots",
          "id": "2"
        },
        {
          "n": "3",
          "box": [
            66.5,
            367.0,
            90.0,
            13.5
          ],
          "kind": "dots",
          "id": "3"
        },
        {
          "n": "4",
          "box": [
            66.5,
            380.5,
            90.0,
            13.5
          ],
          "kind": "dots",
          "id": "4"
        },
        {
          "n": "5",
          "box": [
            66.5,
            394.0,
            90.0,
            13.5
          ],
          "kind": "dots",
          "id": "5"
        },
        {
          "n": "6",
          "box": [
            192.0,
            340.5,
            90.0,
            13.5
          ],
          "kind": "dots",
          "id": "6"
        },
        {
          "n": "7",
          "box": [
            192.0,
            354.0,
            90.0,
            13.5
          ],
          "kind": "dots",
          "id": "7"
        },
        {
          "n": "8",
          "box": [
            192.0,
            367.0,
            90.0,
            13.5
          ],
          "kind": "dots",
          "id": "8"
        },
        {
          "n": "9",
          "box": [
            192.0,
            380.5,
            90.0,
            13.5
          ],
          "kind": "dots",
          "id": "9"
        },
        {
          "n": "10",
          "box": [
            192.0,
            394.0,
            90.0,
            13.5
          ],
          "kind": "dots",
          "id": "10"
        }
      ],
      "rank": false,
      "given": [],
      "vowels": false,
      "letters": false
    },
    "instruction": "Послушай запись 2.01 и запиши десять чисел цифрами.",
    "mediaPaths": [
      "web/225.mp3"
    ]
  },
  "sb:19:6A": {
    "inline": {
      "box": [
        312.5,
        505.96,
        254.5,
        132.26
      ],
      "fields": [
        {
          "n": "1",
          "box": [
            361.5,
            563.0,
            29.0,
            13.5
          ],
          "kind": "dots",
          "id": "1"
        },
        {
          "n": "2",
          "box": [
            397.0,
            577.5,
            29.0,
            13.5
          ],
          "kind": "dots",
          "id": "2.1"
        },
        {
          "n": "2",
          "box": [
            437.0,
            589.0,
            29.0,
            13.5
          ],
          "kind": "dots",
          "id": "2.2"
        },
        {
          "n": "3",
          "box": [
            399.5,
            603.0,
            29.0,
            13.5
          ],
          "kind": "dots",
          "id": "3"
        },
        {
          "n": "4",
          "box": [
            377.5,
            617.5,
            28.5,
            13.5
          ],
          "kind": "dots",
          "id": "4"
        }
      ],
      "rank": false,
      "given": [],
      "vowels": false,
      "letters": false,
      "literal": true
    },
    "instruction": "Заполни пропуски словами из рамки. Are и ’re — разные варианты; ’re нужно использовать дважды.",
    "sources": {
      "label": "6A",
      "sources": [
        {
          "image": "assets/sb-19.webp",
          "size": [
            1190,
            1684
          ],
          "box": [
            0.52521,
            0.6009,
            0.42773,
            0.15708
          ],
          "page": 19
        },
        {
          "image": "assets/sb-19.webp",
          "size": [
            1190,
            1684
          ],
          "page": 19,
          "box": [
            0,
            0.04,
            1,
            0.49
          ],
          "context": true
        }
      ]
    }
  },
  "sb:26:1": {
    "inline": {
      "box": [
        31.7,
        73.46,
        259.83,
        253.27
      ],
      "fields": [
        {
          "n": "1",
          "box": [
            69.5,
            144.5,
            29.0,
            13.5
          ],
          "kind": "dots",
          "sequence": true,
          "id": "1"
        },
        {
          "n": "2",
          "box": [
            104.5,
            158.5,
            28.5,
            13.5
          ],
          "kind": "dots",
          "sequence": true,
          "id": "2"
        },
        {
          "n": "3",
          "box": [
            69.5,
            173.0,
            29.0,
            13.5
          ],
          "kind": "dots",
          "sequence": true,
          "id": "3"
        },
        {
          "n": "4",
          "box": [
            120.0,
            173.0,
            29.0,
            13.5
          ],
          "kind": "dots",
          "sequence": true,
          "id": "4"
        },
        {
          "n": "5",
          "box": [
            69.5,
            187.5,
            29.0,
            13.5
          ],
          "kind": "dots",
          "sequence": true,
          "id": "5"
        },
        {
          "n": "6",
          "box": [
            177.5,
            187.5,
            29.0,
            13.5
          ],
          "kind": "dots",
          "sequence": true,
          "id": "6"
        },
        {
          "n": "7",
          "box": [
            70.0,
            202.0,
            28.5,
            13.5
          ],
          "kind": "dots",
          "sequence": true,
          "id": "7"
        },
        {
          "n": "8",
          "box": [
            101.5,
            216.0,
            29.0,
            13.5
          ],
          "kind": "dots",
          "sequence": true,
          "id": "8"
        },
        {
          "n": "9",
          "box": [
            70.0,
            230.5,
            28.5,
            13.5
          ],
          "kind": "dots",
          "sequence": true,
          "id": "9"
        },
        {
          "n": "10",
          "box": [
            98.0,
            245.0,
            27.5,
            13.5
          ],
          "kind": "dots",
          "sequence": true,
          "id": "10"
        },
        {
          "n": "11",
          "box": [
            72.5,
            259.0,
            29.0,
            13.5
          ],
          "kind": "dots",
          "sequence": true,
          "id": "11"
        },
        {
          "n": "12",
          "box": [
            112.0,
            273.5,
            28.5,
            13.5
          ],
          "kind": "dots",
          "sequence": true,
          "id": "12"
        }
      ],
      "rank": false,
      "given": [],
      "vowels": false,
      "letters": false,
      "literal": true
    },
    "instruction": "Заполни диалог словами из рамки. Are и aren’t используются по два раза; ’re — один раз. В начале вопроса нужна полная форма are."
  },
  "sb:22:2C": {
    "key": {
      "raw": "2 please\n3 with\n4 's\n5 are\n6 at\n7 Thanks\n8 No\n9 day\n10 happy\n11 you\n12 See\n13 new\n14 friendly",
      "items": [
        {
          "n": "2",
          "answer": "please"
        },
        {
          "n": "3",
          "answer": "with"
        },
        {
          "n": "4",
          "answer": "'s"
        },
        {
          "n": "5",
          "answer": "are"
        },
        {
          "n": "6",
          "answer": "at"
        },
        {
          "n": "7",
          "answer": "Thanks"
        },
        {
          "n": "8",
          "answer": "No"
        },
        {
          "n": "9",
          "answer": "day"
        },
        {
          "n": "10",
          "answer": "happy"
        },
        {
          "n": "11",
          "answer": "you"
        },
        {
          "n": "12",
          "answer": "See"
        },
        {
          "n": "13",
          "answer": "new"
        },
        {
          "n": "14",
          "answer": "friendly"
        }
      ],
      "pdf": "web/194.pdf",
      "pdfPage": 8
    },
    "instruction": "Заполни пропуски в диалогах. Впиши по одному слову или сокращённой форме; затем проверь по записи 2.07.",
    "mediaPaths": [
      "web/072.mp3"
    ]
  },
  "sb:26:3A": {
    "inline": {
      "box": [
        30.86,
        538.8,
        260.67,
        121.64
      ],
      "fields": [
        {
          "n": "1",
          "box": [
            69.5,
            556.5,
            5.0,
            13.5
          ],
          "kind": "shortline",
          "id": "1"
        },
        {
          "n": "2",
          "box": [
            69.5,
            571.0,
            5.0,
            13.5
          ],
          "kind": "shortline",
          "id": "2"
        },
        {
          "n": "3",
          "box": [
            69.5,
            585.5,
            5.0,
            13.5
          ],
          "kind": "shortline",
          "id": "3"
        },
        {
          "n": "4",
          "id": "4",
          "box": [
            69.5,
            600,
            10.5,
            13.5
          ],
          "kind": "dots"
        },
        {
          "n": "5",
          "box": [
            69.5,
            614.0,
            10.5,
            13.5
          ],
          "kind": "shortline",
          "id": "5"
        },
        {
          "n": "6",
          "box": [
            69.5,
            628.0,
            16.0,
            13.5
          ],
          "kind": "line",
          "id": "6.1"
        },
        {
          "n": "6",
          "box": [
            89.0,
            628.0,
            5.5,
            13.5
          ],
          "kind": "shortline",
          "id": "6.2"
        },
        {
          "n": "6",
          "box": [
            97.0,
            628.0,
            5.5,
            13.5
          ],
          "kind": "shortline",
          "id": "6.3"
        },
        {
          "n": "7",
          "box": [
            66.5,
            642.5,
            5.5,
            13.5
          ],
          "kind": "shortline",
          "id": "7.1"
        },
        {
          "n": "7",
          "id": "7.2",
          "box": [
            76,
            642.5,
            10.5,
            13.5
          ],
          "kind": "dots"
        },
        {
          "n": "7",
          "box": [
            89.5,
            642.5,
            5.5,
            13.5
          ],
          "kind": "shortline",
          "id": "7.3"
        },
        {
          "n": "7",
          "box": [
            98.5,
            642.5,
            5.0,
            13.5
          ],
          "kind": "shortline",
          "id": "7.4"
        },
        {
          "n": "8",
          "box": [
            162.0,
            556.5,
            10.5,
            13.5
          ],
          "kind": "shortline",
          "id": "8"
        },
        {
          "n": "9",
          "box": [
            159.5,
            571.0,
            5.0,
            13.5
          ],
          "kind": "shortline",
          "id": "9.1"
        },
        {
          "n": "9",
          "box": [
            168.0,
            571.0,
            5.0,
            13.5
          ],
          "kind": "shortline",
          "id": "9.2"
        },
        {
          "n": "10",
          "box": [
            161.5,
            585.5,
            4.5,
            13.5
          ],
          "kind": "shortline",
          "id": "10"
        },
        {
          "n": "11",
          "box": [
            168.5,
            600.0,
            5.0,
            13.5
          ],
          "kind": "shortline",
          "id": "11"
        },
        {
          "n": "12",
          "box": [
            160.5,
            614.0,
            5.0,
            13.5
          ],
          "kind": "shortline",
          "id": "12"
        },
        {
          "n": "13",
          "box": [
            155.5,
            628.0,
            5.0,
            13.5
          ],
          "kind": "shortline",
          "id": "13"
        },
        {
          "n": "14",
          "box": [
            164.5,
            642.5,
            12.0,
            13.5
          ],
          "kind": "shortline",
          "id": "14"
        }
      ],
      "rank": false,
      "given": [],
      "vowels": true,
      "letters": true
    },
    "instruction": "Впиши только пропущенные гласные a, e, i, o, u. Если в одном месте пропущены несколько гласных, напиши их вместе; всё слово вводить не нужно."
  },
  "wb:10:3A": {
    "instruction": "Впиши только пропущенные гласные a, e, i, o, u. Если в одном месте пропущены несколько гласных, напиши их вместе; всё слово вводить не нужно."
  },
  "wb:12:1": {
    "inline": {
      "box": [
        34.67,
        332.19,
        259.4,
        130.96
      ],
      "fields": [
        {
          "n": "1",
          "box": [
            96.0,
            362.0,
            45.0,
            13.5
          ],
          "kind": "dots",
          "id": "1"
        },
        {
          "n": "2",
          "box": [
            158.5,
            362.0,
            44.0,
            13.5
          ],
          "kind": "dots",
          "id": "2"
        },
        {
          "n": "3",
          "box": [
            85.0,
            378.0,
            47.0,
            13.5
          ],
          "kind": "dots",
          "id": "3"
        },
        {
          "n": "4",
          "box": [
            144.5,
            378.0,
            44.0,
            13.5
          ],
          "kind": "dots",
          "id": "4"
        },
        {
          "n": "5",
          "box": [
            131.0,
            394.5,
            44.0,
            13.5
          ],
          "kind": "dots",
          "id": "5"
        },
        {
          "n": "6",
          "box": [
            91.0,
            410.5,
            42.0,
            13.5
          ],
          "kind": "dots",
          "id": "6"
        },
        {
          "n": "7",
          "box": [
            148.5,
            410.5,
            43.5,
            13.5
          ],
          "kind": "dots",
          "id": "7"
        },
        {
          "n": "8",
          "box": [
            89.0,
            427.0,
            42.0,
            13.5
          ],
          "kind": "dots",
          "id": "8"
        },
        {
          "n": "9",
          "box": [
            145.5,
            427.0,
            45.0,
            13.5
          ],
          "kind": "dots",
          "id": "9"
        },
        {
          "n": "10",
          "box": [
            132.5,
            443.0,
            45.0,
            13.5
          ],
          "kind": "dots",
          "id": "10"
        }
      ],
      "rank": false,
      "given": [],
      "vowels": false,
      "letters": false,
      "templates": {
        "1": "m{}",
        "2": "w{}",
        "3": "f{}",
        "4": "h{}",
        "5": "p{}",
        "6": "s{}",
        "7": "b{}",
        "8": "s{}",
        "9": "d{}",
        "10": "c{}"
      }
    },
    "instruction": "Дополни слова о семье. Первая буква уже напечатана: впиши только остальные буквы. Например, для слова с началом m вводится часть после m.",
    "sources": {
      "label": "1",
      "sources": [
        {
          "image": "assets/wb-12.webp",
          "size": [
            1190,
            1684
          ],
          "page": 12,
          "box": [
            0.058,
            0.39,
            0.437,
            0.16
          ]
        },
        {
          "image": "assets/wb-12.webp",
          "size": [
            1190,
            1684
          ],
          "page": 12,
          "box": [
            0.06,
            0.155,
            0.42,
            0.23
          ],
          "context": true
        }
      ]
    }
  },
  "wb:15:2C": {
    "key": {
      "raw": "1 f\n2 e\n3 d\n4 c\n5 b\n6 a",
      "items": [
        {
          "n": "1",
          "answer": "f"
        },
        {
          "n": "2",
          "answer": "e"
        },
        {
          "n": "3",
          "answer": "d"
        },
        {
          "n": "4",
          "answer": "c"
        },
        {
          "n": "5",
          "answer": "b"
        },
        {
          "n": "6",
          "answer": "a"
        }
      ],
      "pdf": "web/298.pdf",
      "pdfPage": 83
    },
    "activity": {
      "type": "match",
      "left": [
        {
          "id": "1",
          "label": "1",
          "box": [
            331.28,
            718.1,
            8.67,
            12.4
          ]
        },
        {
          "id": "2",
          "label": "2",
          "box": [
            330.87,
            731.23,
            8.67,
            12.4
          ]
        },
        {
          "id": "3",
          "label": "3",
          "box": [
            330.87,
            744.79,
            8.67,
            12.4
          ]
        },
        {
          "id": "4",
          "label": "4",
          "box": [
            330.45,
            757.92,
            8.67,
            12.4
          ]
        },
        {
          "id": "5",
          "label": "5",
          "box": [
            330.87,
            771.47,
            8.67,
            12.4
          ]
        },
        {
          "id": "6",
          "label": "6",
          "box": [
            330.45,
            784.44,
            8.78,
            12.6
          ]
        }
      ],
      "right": [
        {
          "id": "a",
          "label": "a",
          "box": [
            506.63,
            717.64,
            9.0,
            13.0
          ]
        },
        {
          "id": "b",
          "label": "b",
          "box": [
            507.06,
            730.46,
            9.74,
            13.4
          ]
        },
        {
          "id": "c",
          "label": "c",
          "box": [
            506.63,
            744.71,
            8.73,
            12.5
          ]
        },
        {
          "id": "d",
          "label": "d",
          "box": [
            506.63,
            757.92,
            9.13,
            12.4
          ]
        },
        {
          "id": "e",
          "label": "e",
          "box": [
            506.63,
            771.47,
            8.67,
            12.4
          ]
        },
        {
          "id": "f",
          "label": "f",
          "box": [
            506.63,
            783.57,
            7.33,
            14.0
          ]
        }
      ],
      "items": [
        {
          "n": "1",
          "answer": "f"
        },
        {
          "n": "2",
          "answer": "e"
        },
        {
          "n": "3",
          "answer": "d"
        },
        {
          "n": "4",
          "answer": "c"
        },
        {
          "n": "5",
          "answer": "b"
        },
        {
          "n": "6",
          "answer": "a"
        }
      ],
      "box": [
        309.96,
        689.84,
        257.04,
        121.16
      ],
      "keyItems": [
        {
          "n": "1",
          "answer": "f"
        },
        {
          "n": "2",
          "answer": "e"
        },
        {
          "n": "3",
          "answer": "d"
        },
        {
          "n": "4",
          "answer": "c"
        },
        {
          "n": "5",
          "answer": "b"
        },
        {
          "n": "6",
          "answer": "a"
        }
      ]
    },
    "instruction": "Соедини шесть начал предложений (1–6) с окончаниями (a–f)."
  },
  "sb:20:2C": {
    "key": {
      "raw": "1 one",
      "items": [
        {
          "n": "1",
          "answer": "one",
          "kind": "text"
        }
      ],
      "pdf": "web/194.pdf",
      "pdfPage": 6
    },
    "responseSpec": {
      "mode": "auto",
      "items": [
        {
          "n": "1",
          "answer": "one",
          "kind": "text"
        }
      ]
    }
  },
  "wb:12:2A": {
    "key": {
      "raw": "1 parents\n2 mother\n3 father\n4 sister\n5 husband\n6 children",
      "items": [
        {
          "n": "1",
          "answer": "parents",
          "kind": "text"
        },
        {
          "n": "2",
          "answer": "mother",
          "kind": "text"
        },
        {
          "n": "3",
          "answer": "father",
          "kind": "text"
        },
        {
          "n": "4",
          "answer": "sister",
          "kind": "text"
        },
        {
          "n": "5",
          "answer": "husband",
          "kind": "text"
        },
        {
          "n": "6",
          "answer": "children",
          "kind": "text"
        }
      ],
      "pdf": "web/298.pdf",
      "pdfPage": 82
    }
  },
  "sb:25:6A": {
    "key": {
      "pdf": "web/194.pdf",
      "pdfPage": 9,
      "source": "SB p.25 message from Sonia",
      "items": [
        {
          "n": "1",
          "answer": "her friend",
          "kind": "text"
        },
        {
          "n": "2",
          "answer": "Argentinian",
          "kind": "text"
        },
        {
          "n": "3",
          "answer": "Martina",
          "kind": "text"
        }
      ],
      "raw": "1 her friend\n2 Argentinian\n3 Martina"
    }
  },
  "wb:11:5B": {
    "key": {
      "raw": "1 A",
      "items": [
        {
          "n": "1",
          "answer": "A",
          "kind": "text"
        }
      ],
      "pdf": "web/298.pdf",
      "pdfPage": 82
    },
    "responseSpec": {
      "mode": "auto",
      "items": [
        {
          "n": "1",
          "answer": "A",
          "kind": "choice",
          "prompt": "Which picture shows the Secret Garden?",
          "options": [
            {
              "value": "A",
              "label": "A"
            },
            {
              "value": "B",
              "label": "B"
            },
            {
              "value": "C",
              "label": "C"
            }
          ]
        }
      ]
    },
    "responseMode": "panel",
    "inline": null,
    "choice": null,
    "activity": null,
    "instruction": "Прочитай описание и выбери фотографию A, B или C. Вписывать текст поверх картинки не нужно."
  },
  "sb:20:1": {
    "activity": {
      "type": "match",
      "box": [
        29,
        482,
        260,
        115
      ],
      "frames": [
        {
          "page": 20,
          "image": "assets/sb-20.webp",
          "box": [
            0,
            0,
            595,
            421
          ]
        },
        {
          "page": 21,
          "image": "assets/sb-21.webp",
          "box": [
            29.75,
            12.63,
            238,
            328.38
          ]
        }
      ],
      "left": [
        {
          "id": "1",
          "label": "1. brother and sister"
        },
        {
          "id": "2",
          "label": "2. husband and wife"
        },
        {
          "id": "3",
          "label": "3. parents and children"
        },
        {
          "id": "4",
          "label": "4. father and daughter"
        },
        {
          "id": "5",
          "label": "5. mother and son"
        }
      ],
      "right": [
        {
          "id": "A",
          "label": "A"
        },
        {
          "id": "B",
          "label": "B"
        },
        {
          "id": "C",
          "label": "C"
        },
        {
          "id": "D",
          "label": "D"
        }
      ],
      "items": [
        {
          "n": "1",
          "answer": "B, D",
          "kind": "text"
        },
        {
          "n": "2",
          "answer": "C, D",
          "kind": "text"
        },
        {
          "n": "3",
          "answer": "D",
          "kind": "text"
        },
        {
          "n": "4",
          "answer": "A, D",
          "kind": "text"
        },
        {
          "n": "5",
          "answer": "D",
          "kind": "text"
        }
      ],
      "keyItems": [
        {
          "n": "1",
          "answer": "B, D",
          "kind": "text"
        },
        {
          "n": "2",
          "answer": "C, D",
          "kind": "text"
        },
        {
          "n": "3",
          "answer": "D",
          "kind": "text"
        },
        {
          "n": "4",
          "answer": "A, D",
          "kind": "text"
        },
        {
          "n": "5",
          "answer": "D",
          "kind": "text"
        }
      ]
    },
    "instruction": "Соедини каждое родство с подходящими фотографиями A–D. Для одного пункта могут подходить две фотографии. Фото D находится на следующей странице и показано ниже.",
    "sources": {
      "label": "1",
      "sources": [
        {
          "image": "assets/sb-20.webp",
          "size": [
            1190,
            1684
          ],
          "page": 20,
          "box": [
            0.043,
            0.55,
            0.91,
            0.4
          ]
        },
        {
          "image": "assets/sb-20.webp",
          "size": [
            1190,
            1684
          ],
          "page": 20,
          "box": [
            0,
            0,
            1,
            0.5
          ],
          "context": true
        },
        {
          "image": "assets/sb-21.webp",
          "size": [
            1190,
            1684
          ],
          "page": 21,
          "box": [
            0.05,
            0.015,
            0.4,
            0.39
          ],
          "context": true
        }
      ]
    }
  },
  "sb:20:4A": {
    "sources": {
      "label": "4A",
      "sources": [
        {
          "image": "assets/sb-20.webp",
          "size": [
            1190,
            1684
          ],
          "page": 20,
          "box": [
            0.043,
            0.55,
            0.91,
            0.4
          ]
        },
        {
          "image": "assets/sb-20.webp",
          "size": [
            1190,
            1684
          ],
          "page": 20,
          "box": [
            0,
            0,
            1,
            0.5
          ],
          "context": true
        },
        {
          "image": "assets/sb-21.webp",
          "size": [
            1190,
            1684
          ],
          "page": 21,
          "box": [
            0.05,
            0.015,
            0.4,
            0.39
          ],
          "context": true
        }
      ]
    }
  },
  "sb:22:2A": {
    "activity": {
      "type": "match",
      "left": [
        {
          "id": "1",
          "label": "1",
          "box": null
        },
        {
          "id": "2",
          "label": "2",
          "box": null
        },
        {
          "id": "3",
          "label": "3",
          "box": null
        }
      ],
      "right": [
        {
          "id": "A",
          "label": "A",
          "box": null
        },
        {
          "id": "B",
          "label": "B",
          "box": null
        },
        {
          "id": "C",
          "label": "C",
          "box": null
        }
      ],
      "items": [
        {
          "n": "1",
          "answer": "B"
        },
        {
          "n": "2",
          "answer": "A"
        },
        {
          "n": "3",
          "answer": "C"
        }
      ],
      "box": [
        245,
        397,
        322,
        34
      ],
      "frames": [
        {
          "page": 22,
          "image": "assets/sb-22.webp",
          "box": [
            0,
            0,
            595,
            328
          ]
        },
        {
          "page": 23,
          "image": "assets/sb-23.webp",
          "box": [
            0,
            0,
            292,
            455
          ]
        }
      ]
    },
    "instruction": "Послушай запись 2.06 и соедини разговоры 1–3 с фотографиями A–C. Все три фотографии показаны ниже.",
    "sources": {
      "label": "2A",
      "sources": [
        {
          "image": "assets/sb-22.webp",
          "size": [
            1190,
            1684
          ],
          "page": 22,
          "box": [
            0.41,
            0.47,
            0.54,
            0.12
          ]
        },
        {
          "image": "assets/sb-22.webp",
          "size": [
            1190,
            1684
          ],
          "page": 22,
          "box": [
            0,
            0,
            1,
            0.39
          ],
          "context": true
        },
        {
          "image": "assets/sb-23.webp",
          "size": [
            1190,
            1684
          ],
          "page": 23,
          "box": [
            0,
            0,
            0.49,
            0.54
          ],
          "context": true
        }
      ]
    }
  },
  "sb:22:2B": {
    "activity": {
      "type": "match",
      "left": [
        {
          "id": "car",
          "label": "car",
          "box": null
        },
        {
          "id": "children",
          "label": "children",
          "box": null
        },
        {
          "id": "teacher",
          "label": "teacher",
          "box": null
        }
      ],
      "right": [
        {
          "id": "1",
          "label": "1",
          "box": null
        },
        {
          "id": "2",
          "label": "2",
          "box": null
        },
        {
          "id": "3",
          "label": "3",
          "box": null
        }
      ],
      "items": [
        {
          "n": "car",
          "answer": "2"
        },
        {
          "n": "children",
          "answer": "1"
        },
        {
          "n": "teacher",
          "answer": "3"
        }
      ],
      "keyItems": [
        {
          "n": "car",
          "answer": "2"
        },
        {
          "n": "children",
          "answer": "1"
        },
        {
          "n": "teacher",
          "answer": "3"
        }
      ],
      "box": [
        245.16,
        434.72,
        321.84,
        63.68
      ]
    },
    "instruction": "Послушай запись 2.06 ещё раз. Соедини car, children и teacher с номерами разговоров. Work — 1 уже дано как образец.",
    "sources": {
      "label": "2B",
      "sources": [
        {
          "image": "assets/sb-22.webp",
          "size": [
            1190,
            1684
          ],
          "page": 22,
          "box": [
            0.41,
            0.47,
            0.54,
            0.12
          ]
        },
        {
          "image": "assets/sb-22.webp",
          "size": [
            1190,
            1684
          ],
          "page": 22,
          "box": [
            0,
            0,
            1,
            0.39
          ],
          "context": true
        },
        {
          "image": "assets/sb-23.webp",
          "size": [
            1190,
            1684
          ],
          "page": 23,
          "box": [
            0,
            0,
            0.49,
            0.54
          ],
          "context": true
        }
      ]
    }
  },
  "wb:10:4D": {
    "responseSpec": {
      "mode": "auto",
      "items": [
        {
          "n": "1A",
          "answer": "Where are you and Zeynep from?",
          "kind": "text",
          "prompt": "Реплика A"
        },
        {
          "n": "1B",
          "answer": "We are from Turkey.",
          "kind": "text",
          "prompt": "Реплика B"
        },
        {
          "n": "2A",
          "answer": "Are Jane and Andy doctors?",
          "kind": "text",
          "prompt": "Реплика A"
        },
        {
          "n": "2B",
          "answer": "No, they’re not.",
          "kind": "text",
          "prompt": "Реплика B"
        },
        {
          "n": "3A",
          "answer": "Are the bikes new?",
          "kind": "text",
          "prompt": "Реплика A"
        },
        {
          "n": "3B",
          "answer": "No, they’re old.",
          "kind": "text",
          "prompt": "Реплика B"
        },
        {
          "n": "4A",
          "answer": "Are John and Simon cold?",
          "kind": "text",
          "prompt": "Реплика A"
        },
        {
          "n": "4B",
          "answer": "Yes, they are.",
          "kind": "text",
          "prompt": "Реплика B"
        },
        {
          "n": "5A",
          "answer": "Who are they?",
          "kind": "text",
          "prompt": "Реплика A"
        },
        {
          "n": "5B",
          "answer": "They’re my friends.",
          "kind": "text",
          "prompt": "Реплика B"
        },
        {
          "n": "6A",
          "answer": "Are your parents Australian?",
          "kind": "text",
          "prompt": "Реплика A"
        },
        {
          "n": "6B",
          "answer": "Yes, they are.",
          "kind": "text",
          "prompt": "Реплика B"
        }
      ]
    },
    "responseMode": "panel",
    "inline": null,
    "choice": null,
    "activity": null,
    "instruction": "Собери каждую реплику из слов в оригинале. Запиши реплики A и B в отдельные поля; сами буквы A и B переписывать не нужно."
  },
  "sb:26:4A": {
    "key": {
      "raw": "2 Andy / Bella / Andy or Bella / Bella or Andy\n3 Bella\n4 Chris / Di / Chris or Di / Di or Chris",
      "items": [
        {
          "n": "2",
          "answer": "Andy / Bella / Andy or Bella / Bella or Andy",
          "kind": "text"
        },
        {
          "n": "3",
          "answer": "Bella",
          "kind": "text"
        },
        {
          "n": "4",
          "answer": "Chris / Di / Chris or Di / Di or Chris",
          "kind": "text"
        }
      ],
      "pdf": "web/194.pdf",
      "pdfPage": 9
    },
    "responseMode": "panel",
    "instruction": "Посмотри на семейное дерево. Напиши имя человека, который может сказать каждую фразу. Для пунктов 2 и 4 подходят два человека: можно указать одного или обоих через or."
  },
  "sb:24:2C": {
    "mediaPaths": [
      "web/199.mp4"
    ]
  },
  "sb:24:2D": {
    "mediaPaths": [
      "web/199.mp4"
    ]
  },
  "sb:19:5B": {
    "sources": {
      "label": "5B",
      "sources": [
        {
          "image": "assets/sb-19.webp",
          "size": [
            1190,
            1684
          ],
          "box": [
            0.07007,
            0.57275,
            0.44614,
            0.37922
          ],
          "page": 19
        },
        {
          "image": "assets/sb-19.webp",
          "size": [
            1190,
            1684
          ],
          "page": 19,
          "box": [
            0,
            0.04,
            1,
            0.49
          ],
          "context": true
        }
      ]
    }
  },
  "sb:19:5C": {
    "sources": {
      "label": "5C",
      "sources": [
        {
          "image": "assets/sb-19.webp",
          "size": [
            1190,
            1684
          ],
          "box": [
            0.07015,
            0.64264,
            0.44329,
            0.14658
          ],
          "page": 19
        },
        {
          "image": "assets/sb-19.webp",
          "size": [
            1190,
            1684
          ],
          "page": 19,
          "box": [
            0,
            0.04,
            1,
            0.49
          ],
          "context": true
        }
      ]
    }
  },
  "sb:19:5D": {
    "sources": {
      "label": "5D",
      "sources": [
        {
          "image": "assets/sb-19.webp",
          "size": [
            1190,
            1684
          ],
          "box": [
            0.07607,
            0.788,
            0.43738,
            0.12589
          ],
          "page": 19
        },
        {
          "image": "assets/sb-19.webp",
          "size": [
            1190,
            1684
          ],
          "page": 19,
          "box": [
            0,
            0.04,
            1,
            0.49
          ],
          "context": true
        }
      ]
    }
  },
  "sb:24:1A": {
    "sources": {
      "label": "1A",
      "sources": [
        {
          "image": "assets/sb-24.webp",
          "size": [
            1190,
            1684
          ],
          "page": 24,
          "box": [
            0.045,
            0.42,
            0.36,
            0.1
          ]
        },
        {
          "image": "assets/sb-24.webp",
          "size": [
            1190,
            1684
          ],
          "page": 24,
          "box": [
            0.34,
            0.34,
            0.59,
            0.22
          ],
          "context": true
        }
      ]
    }
  },
  "sb:25:3A": {
    "sources": {
      "label": "3A",
      "sources": [
        {
          "image": "assets/sb-25.webp",
          "size": [
            1190,
            1684
          ],
          "page": 25,
          "box": [
            0.075,
            0.33,
            0.55,
            0.15
          ]
        },
        {
          "image": "assets/sb-24.webp",
          "size": [
            1190,
            1684
          ],
          "page": 24,
          "box": [
            0.43,
            0.8,
            0.51,
            0.15
          ],
          "context": true
        }
      ]
    }
  },
  "wb:11:5C": {
    "sources": {
      "label": "5C",
      "sources": [
        {
          "image": "assets/wb-11.webp",
          "size": [
            1190,
            1684
          ],
          "page": 11,
          "box": [
            0.52,
            0.68,
            0.43,
            0.27
          ]
        },
        {
          "image": "assets/wb-11.webp",
          "size": [
            1190,
            1684
          ],
          "page": 11,
          "box": [
            0.075,
            0.19,
            0.415,
            0.71
          ],
          "context": true
        }
      ]
    }
  },
  "wb:11:5D": {
    "sources": {
      "label": "5D",
      "sources": [
        {
          "image": "assets/wb-11.webp",
          "size": [
            1190,
            1684
          ],
          "page": 11,
          "box": [
            0.52,
            0.68,
            0.43,
            0.27
          ]
        },
        {
          "image": "assets/wb-11.webp",
          "size": [
            1190,
            1684
          ],
          "page": 11,
          "box": [
            0.075,
            0.19,
            0.415,
            0.71
          ],
          "context": true
        }
      ]
    }
  }
};
function apply(course){
 for(const [id,patch] of Object.entries(fixes)){
  const [book,page,label]=id.split(':');const e=course.books[book]?.pages.find(p=>p.page===Number(page))?.exercises.find(e=>e.label===label);if(!e)continue;
  for(const prop of ['text','instruction','responseMode','responseSpec','mediaPaths'])if(Object.hasOwn(patch,prop))e[prop]=patch[prop];
  for(const [prop,name]of [['key','SPEAKOUT_ANSWER_MAP'],['inline','SPEAKOUT_INLINE_DATA'],['choice','SPEAKOUT_CHOICE_DATA'],['activity','SPEAKOUT_ACTIVITY_DATA'],['sources','EXERCISE_SOURCES']])if(Object.hasOwn(patch,prop)){if(patch[prop]===null)delete root[name][id];else root[name][id]=patch[prop];}
 }
}
root.SpeakoutTaskCorrections={apply,fixes};
})(window);
