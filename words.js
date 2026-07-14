/* Мультиучебники: данные курсов + выбор текущего курса.
   Каждый юнит: { id, unit, title, emoji, color, words:[{en, ru, emoji}] }
   id слова: unitId + "-" + индекс — используется для прогресса.
   Добавить новый учебник = добавить SM_COURSE_DATA["xxx"]=[...] и запись в SM_COURSES. */
window.SM_COURSE_DATA = window.SM_COURSE_DATA || {};
window.SM_COURSE_DATA["sm1"] = [
  {
    id: "welcome", unit: "Welcome", title: "Friends · цвета", emoji: "👋", color: "#f6e2cf",
    words: [
      { en: "red", ru: "красный", emoji: "🔴" },
      { en: "blue", ru: "синий", emoji: "🔵" },
      { en: "yellow", ru: "жёлтый", emoji: "🟡" },
      { en: "green", ru: "зелёный", emoji: "🟢" },
      { en: "orange", ru: "оранжевый", emoji: "🟠" },
      { en: "purple", ru: "фиолетовый", emoji: "🟣" },
      { en: "pink", ru: "розовый", emoji: "🩷" },
      { en: "brown", ru: "коричневый", emoji: "🟤" },
      { en: "black", ru: "чёрный", emoji: "⚫" },
      { en: "white", ru: "белый", emoji: "⚪" },
      { en: "grey", ru: "серый", emoji: "🩶" }
    ]
  },
  {
    id: "numbers", unit: "Welcome", title: "Numbers 1–10", emoji: "🔢", color: "#e4ebf2",
    words: [
      { en: "one", ru: "один", emoji: "1️⃣" },
      { en: "two", ru: "два", emoji: "2️⃣" },
      { en: "three", ru: "три", emoji: "3️⃣" },
      { en: "four", ru: "четыре", emoji: "4️⃣" },
      { en: "five", ru: "пять", emoji: "5️⃣" },
      { en: "six", ru: "шесть", emoji: "6️⃣" },
      { en: "seven", ru: "семь", emoji: "7️⃣" },
      { en: "eight", ru: "восемь", emoji: "8️⃣" },
      { en: "nine", ru: "девять", emoji: "9️⃣" },
      { en: "ten", ru: "десять", emoji: "🔟" }
    ]
  },
  {
    id: "u1", unit: "Unit 1", title: "At school", emoji: "🏫", color: "#e4ebf2",
    words: [
      { en: "pen", ru: "ручка", emoji: "🖊️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_060447_dd402818-9ccf-4b49-bdc7-cbd963438045.png" },
      { en: "pencil", ru: "карандаш", emoji: "✏️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_060449_144713dd-4453-40f8-8b41-764ad7aee97d.png" },
      { en: "rubber", ru: "ластик", emoji: "🧽", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_060452_a00c96ba-2c54-44ea-9433-77bb43cee445.png" },
      { en: "ruler", ru: "линейка", emoji: "📏", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_060454_42db52f9-cd9f-4183-a484-ed6926020649.png" },
      { en: "book", ru: "книга", emoji: "📖", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_060530_33da6804-3cf7-42a6-a767-34ed1cef39c5.png" },
      { en: "bag", ru: "рюкзак", emoji: "🎒", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_060532_c7c89dc3-1f0c-4654-9bab-9f448b768edd.png" },
      { en: "pencil case", ru: "пенал", emoji: "🖍️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_060535_369c5887-c2f5-4473-90ea-72f38c567c37.png" },
      { en: "desk", ru: "парта", emoji: "🪑", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_060538_966f120f-ada1-4dc2-b098-82665383a842.png" },
      { en: "chair", ru: "стул", emoji: "💺", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_060552_27e81608-380a-4a04-b4c9-14069dca915a.png" },
      { en: "notebook", ru: "тетрадь", emoji: "📓", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_060555_ad92feb8-c638-48ec-8c6e-bb4249cb2bea.png" },
      { en: "teacher", ru: "учитель", emoji: "👩‍🏫", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_060557_2aaed4b0-0b83-4dc6-aa21-89a10b599260.png" },
      { en: "board", ru: "доска", emoji: "📋", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_060600_502a7f21-cce4-4b80-bc5c-ad2f7134f4ce.png" }
    ]
  },
  {
    id: "u2", unit: "Unit 2", title: "Play time!", emoji: "🧸", color: "#f6e2cf",
    words: [
      { en: "ball", ru: "мяч", emoji: "⚽", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123914_5095b465-c597-409a-b9a1-ef7dba94717f.png" },
      { en: "teddy", ru: "мишка", emoji: "🧸", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123917_475f4319-7c3f-46a6-b3b9-8fa38b890051.png" },
      { en: "doll", ru: "кукла", emoji: "🪆", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123921_20b0a5f8-4c63-4505-9230-7cb2cde73b96.png" },
      { en: "train", ru: "поезд", emoji: "🚂", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123924_f0b25246-661e-4147-b90b-d7f8622bc379.png" },
      { en: "car", ru: "машинка", emoji: "🚗", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123929_78f3af4f-2f11-4717-9e64-cd16f83037a0.png" },
      { en: "plane", ru: "самолёт", emoji: "✈️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123932_d3b2a328-5527-41f0-88f4-839308988915.png" },
      { en: "kite", ru: "воздушный змей", emoji: "🪁", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123935_23cc7431-58fb-4ae5-a84d-820513f415a3.png" },
      { en: "bike", ru: "велосипед", emoji: "🚲", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123939_1c918b06-d42c-41ef-8662-e19fb3633213.png" },
      { en: "computer game", ru: "компьютерная игра", emoji: "🎮", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123942_9163b4d7-47f3-47fd-821a-70a1b7040946.png" },
      { en: "monster", ru: "монстрик", emoji: "👾", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123945_4a62bcab-07c2-4cd3-9bc9-2d0a00610926.png" },
      { en: "robot", ru: "робот", emoji: "🤖", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123948_3fc2f0d0-2d4d-4d54-a096-4309c6920102.png" },
      { en: "go-kart", ru: "картинг", emoji: "🏎️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123951_ca987b7a-1c0d-4a8c-868a-5326485eb630.png" }
    ]
  },
  {
    id: "u3", unit: "Unit 3", title: "Pet show", emoji: "🐸", color: "#dfeadd",
    words: [
      { en: "dog", ru: "собака", emoji: "🐶", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260706_115606_c26927ac-f3ef-4bbe-a91a-2cde0d6f1700.png" },
      { en: "cat", ru: "кошка", emoji: "🐱", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260706_055756_3053d807-f4b9-45d3-9bad-e1a654355513.png" },
      { en: "bird", ru: "птица", emoji: "🐦", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260706_060403_0120dd3b-3fc7-4b7b-9c3d-c097b117d25e.png" },
      { en: "fish", ru: "рыбка", emoji: "🐟", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260706_060401_57070287-b8b1-4221-a16d-cd684fa48acf.png" },
      { en: "mouse", ru: "мышь", emoji: "🐭", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123900_4bb0c5a5-e84f-4f89-a1ba-6cca8fc551f4.png" },
      { en: "horse", ru: "лошадь", emoji: "🐴", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123903_87861ac5-09ae-4ec0-8606-08d24769c4ea.png" },
      { en: "frog", ru: "лягушка", emoji: "🐸", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260706_060358_348bd60d-29b7-488a-9e4a-9660e858cd64.png" },
      { en: "rabbit", ru: "кролик", emoji: "🐰", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260706_060412_98956f20-08c2-4f45-bbf0-39ac0867ec45.png" },
      { en: "spider", ru: "паук", emoji: "🕷️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260706_060404_c1f09276-dca1-48dc-a1fd-ce23329a5477.png" },
      { en: "lizard", ru: "ящерица", emoji: "🦎", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260706_060405_d5b19be3-08db-476a-b0e5-5ce7b348e59d.png" },
      { en: "duck", ru: "утка", emoji: "🦆", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260706_060400_60d2de5c-a715-441c-a8ad-0acf783ac11d.png" },
      { en: "elephant", ru: "слон", emoji: "🐘", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260706_060409_dcfb2f41-b6e0-48bb-a9a6-1d00779918eb.png" }
    ]
  },
  {
    id: "u4", unit: "Unit 4", title: "Lunchtime", emoji: "🍎", color: "#fbe6de",
    words: [
      { en: "apple", ru: "яблоко", emoji: "🍎", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_124006_0b0e1c9a-192a-4b0e-9712-606dcbd7d9a2.png" },
      { en: "banana", ru: "банан", emoji: "🍌", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_124009_c9de35d4-b3a2-4544-acfe-8362661767a4.png" },
      { en: "orange", ru: "апельсин", emoji: "🍊", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_124014_660e58d3-4717-4728-9e81-2052f9631f4c.png" },
      { en: "sandwich", ru: "бутерброд", emoji: "🥪", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_124017_39433336-297b-476c-9125-ac752529abbe.png" },
      { en: "cake", ru: "торт", emoji: "🍰", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_124021_8999c958-b0eb-45d9-b5ad-951528d89555.png" },
      { en: "ice cream", ru: "мороженое", emoji: "🍦", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_124024_607ceadf-8b96-4aaa-9a66-fe7be5fc14ba.png" },
      { en: "chicken", ru: "курица", emoji: "🍗", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_124028_dc676a1a-4319-4990-8076-f13ab8473657.png" },
      { en: "egg", ru: "яйцо", emoji: "🥚", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_124031_26198f19-6756-4159-a9b1-5519f122478c.png" },
      { en: "milk", ru: "молоко", emoji: "🥛", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_124034_62e50218-aeeb-4340-88ee-4dd12ef6a5a1.png" },
      { en: "juice", ru: "сок", emoji: "🧃", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_124039_4eefc669-2a5d-47b8-89ae-e1885e28d1ba.png" },
      { en: "bread", ru: "хлеб", emoji: "🍞", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_124042_6956e105-5b43-41e5-ae5b-cf0312e87436.png" },
      { en: "water", ru: "вода", emoji: "💧", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_124045_2b5c2674-6892-48ed-bfb3-72de7e01e569.png" }
    ]
  },
  {
    id: "u5", unit: "Unit 5", title: "Free time", emoji: "⚽", color: "#e7f0e1",
    words: [
      { en: "swim", ru: "плавать", emoji: "🏊", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_125911_2d13d78b-10bd-494e-b72b-0ebafe4bdfc9.png" },
      { en: "sing", ru: "петь", emoji: "🎤", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_125914_7aba3af1-d88c-4243-bfe0-9599df54fcfd.png" },
      { en: "dance", ru: "танцевать", emoji: "💃", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_125919_52bf938c-ad89-4409-a230-656dc543794e.png" },
      { en: "paint", ru: "рисовать красками", emoji: "🎨", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_125923_856c6b6c-b097-4f17-be69-2462519f9ed9.png" },
      { en: "draw", ru: "рисовать", emoji: "✏️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_125927_86b6a5a4-68d3-4c0f-9f17-6e1c28694e3f.png" },
      { en: "read", ru: "читать", emoji: "📚", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_125932_4eabe8ba-a1d4-49ff-a7c5-8ea091f038a9.png" },
      { en: "ride a bike", ru: "кататься на велосипеде", emoji: "🚴", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_125936_69f3ef7b-c3e3-4017-9be4-861c7bf6a2f4.png" },
      { en: "play football", ru: "играть в футбол", emoji: "⚽", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_125939_3c9ef0d3-4692-45ba-927f-4bd2c6b6e735.png" },
      { en: "run", ru: "бегать", emoji: "🏃", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_125942_0e3b8607-0415-4e5d-b903-6d6ea97f07fb.png" },
      { en: "jump", ru: "прыгать", emoji: "🤸", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_125946_cdf8bf2e-0aa7-45d4-8d88-ffe481e56d2f.png" },
      { en: "climb", ru: "лазить", emoji: "🧗", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_125949_2f72f896-f3fd-4d5d-8dd7-b58defc0d6b4.png" },
      { en: "play tennis", ru: "играть в теннис", emoji: "🎾", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_125953_222c3a23-fb6c-4e7a-8688-7a0cd8e4f3b5.png" }
    ]
  },
  {
    id: "u6", unit: "Unit 6", title: "The old house", emoji: "🏠", color: "#f6e2cf",
    words: [
      { en: "kitchen", ru: "кухня", emoji: "🍳", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_130007_78023f55-f7b0-48b6-92ee-58495203b324.png" },
      { en: "bedroom", ru: "спальня", emoji: "🛏️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_130011_ba7be957-dff6-4fdd-a8cc-6b83424a485f.png" },
      { en: "bathroom", ru: "ванная", emoji: "🛁", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_130014_f55afc0b-4465-4b5a-8ee0-4fecd1629d68.png" },
      { en: "living room", ru: "гостиная", emoji: "🛋️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_130018_d8a105f3-d0a6-4c3a-950b-22784f582a09.png" },
      { en: "hall", ru: "прихожая", emoji: "🚪", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_130023_9821c25b-91ad-4b59-b692-5125266c523f.png" },
      { en: "garden", ru: "сад", emoji: "🌳", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_130028_e27630d5-0ed0-4d07-b783-31b4455eed11.png" },
      { en: "bed", ru: "кровать", emoji: "🛏️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_130034_1930c0ef-93e2-4653-a87c-bf32d33d783c.png" },
      { en: "sofa", ru: "диван", emoji: "🛋️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_130954_0780b939-5496-4d33-8803-b623c417c0d9.png" },
      { en: "table", ru: "стол", emoji: "🪑", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_130922_fcb9b066-afe3-4dea-b0bf-cd9a490ab77c.png" },
      { en: "lamp", ru: "лампа", emoji: "💡", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_130927_cc576601-8889-445f-98cf-07fa9e5fff16.png" },
      { en: "clock", ru: "часы", emoji: "🕐", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_130931_1899e839-4822-4551-ad53-2604bc2f2729.png" },
      { en: "cupboard", ru: "шкаф", emoji: "🗄️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_130935_f1ffd6a4-d874-4b5d-8b41-66eaa187101d.png" }
    ]
  },
  {
    id: "u7", unit: "Unit 7", title: "Get dressed!", emoji: "👕", color: "#e4ebf2",
    words: [
      { en: "T-shirt", ru: "футболка", emoji: "👕", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_130958_ee2012ea-3673-40d5-9f84-389582fbe343.png" },
      { en: "shirt", ru: "рубашка", emoji: "👔", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131003_9461f359-8acd-4d22-9495-fc66d71157c9.png" },
      { en: "trousers", ru: "брюки", emoji: "👖", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131748_acc11102-afc9-485b-a24a-6345f5474d30.png" },
      { en: "skirt", ru: "юбка", emoji: "👗", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131753_1e72dbf8-305f-4a1e-b73d-ac32de302b86.png" },
      { en: "dress", ru: "платье", emoji: "👗", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131757_6daeabaf-8e33-4a11-9f1d-26530f2d9add.png" },
      { en: "shoes", ru: "туфли", emoji: "👟", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131813_a003691d-1e6d-46fe-bb15-32197ae0ce5c.png" },
      { en: "socks", ru: "носки", emoji: "🧦", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131817_b8e6ecf7-128b-42ea-8897-783c1993d76b.png" },
      { en: "hat", ru: "шапка", emoji: "🧢", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131821_f563dfbb-c82b-4677-89cc-fcb4dd35bb95.png" },
      { en: "jacket", ru: "куртка", emoji: "🧥", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131826_f71a1fe1-e603-4818-9047-b2158b90bc2a.png" },
      { en: "shorts", ru: "шорты", emoji: "🩳", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131831_73520452-1ed2-4010-86bb-ea57c5a63a07.png" },
      { en: "boots", ru: "ботинки", emoji: "🥾", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131836_aa2bf39b-d732-4b09-90b8-7e7c72e11f26.png" },
      { en: "gloves", ru: "перчатки", emoji: "🧤", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131839_b57445dd-fadd-48b7-8f0e-48fc1c10921a.png" }
    ]
  },
  {
    id: "u8", unit: "Unit 8", title: "The robot · body", emoji: "🤖", color: "#efe0e6",
    words: [
      { en: "head", ru: "голова", emoji: "🗣️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131902_88079afc-7b73-4f2a-a339-264a164918de.png" },
      { en: "arm", ru: "рука", emoji: "💪", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131909_efa1062c-0990-4597-a6ae-be6f87c586ca.png" },
      { en: "hand", ru: "ладонь", emoji: "✋", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131914_ee35d30c-43b6-4ad8-88d7-dfdde407e0a8.png" },
      { en: "leg", ru: "нога", emoji: "🦵", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131919_966d2ac3-cb46-43e4-8a65-aada8a20a06c.png" },
      { en: "foot", ru: "ступня", emoji: "🦶", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131924_e8dcc781-bce3-463a-b676-d750b15e7240.png" },
      { en: "body", ru: "тело", emoji: "🧍", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131905_ee73c196-17d8-444f-a986-7a2863b95e2a.png" },
      { en: "eyes", ru: "глаза", emoji: "👀", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131941_b62a0267-af83-4e56-b598-2f49a65f63a2.png" },
      { en: "ears", ru: "уши", emoji: "👂", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131946_b86b3046-ffaa-458f-97f9-a6f2031ea611.png" },
      { en: "nose", ru: "нос", emoji: "👃", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131950_66a6ccda-d2f6-4e06-bdd3-a57e348f4f84.png" },
      { en: "mouth", ru: "рот", emoji: "👄", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131954_e4ad8297-b0ca-40a6-8473-4e3f7a83e2b4.png" },
      { en: "hair", ru: "волосы", emoji: "💇", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131957_56644b74-2b82-4d93-8746-1288f2eb90b5.png" },
      { en: "fingers", ru: "пальцы", emoji: "🖐️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_132002_ed827039-0fe7-4054-b384-a7d0842bc291.png" }
    ]
  },
  {
    id: "u9", unit: "Unit 9", title: "At the beach", emoji: "🏖️", color: "#faf1d8",
    words: [
      { en: "sea", ru: "море", emoji: "🌊", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_132331_42c18322-fa42-4b20-a28e-a96730f65794.png" },
      { en: "sand", ru: "песок", emoji: "🏖️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_132352_463ef29d-63cf-47f6-8ef4-8e24e557cfdd.png" },
      { en: "sun", ru: "солнце", emoji: "☀️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_132335_b8df4495-34ac-46d2-b127-539a8a960f57.png" },
      { en: "shell", ru: "ракушка", emoji: "🐚", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_132339_ed92b51e-6267-494f-8477-b1d0b4fc770b.png" },
      { en: "boat", ru: "лодка", emoji: "⛵", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_132344_7fcdfb1a-843a-4c22-a2bb-68e198980d7d.png" },
      { en: "crab", ru: "краб", emoji: "🦀", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_132348_db293e70-f094-4fdc-b849-0cc2f29bffaa.png" },
      { en: "bucket", ru: "ведёрко", emoji: "🪣", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_132408_6bbc7742-d3b0-41f7-b59b-5322e36c893b.png" },
      { en: "spade", ru: "лопатка", emoji: "⛏️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_132412_7a555416-c57e-47a2-b46e-1bf181c00b1a.png" },
      { en: "sandcastle", ru: "замок из песка", emoji: "🏰", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_132416_4824ddc7-564c-469d-bed1-822b1aba3a35.png" },
      { en: "starfish", ru: "морская звезда", emoji: "⭐", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_132421_4284d45b-0128-472a-898c-6bbc203b53d5.png" },
      { en: "towel", ru: "полотенце", emoji: "🧺", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_132426_f00405c8-1014-45c0-a5a7-3b5dcf7d9f8a.png" },
      { en: "umbrella", ru: "зонт", emoji: "⛱️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_132430_39be9a6c-b50c-4f62-a3de-ea7cd61def80.png" }
    ]
  }
];

/* ---- Реестр учебников (курсов) ---- */
window.SM_COURSES = [
  { id: "sm1",  title: "Super Minds 1", subtitle: "2nd edition · 6–8 лет", emoji: "📗", color: "#dfeadd", ready: true, img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_054541_850dabec-bbfc-4814-8d79-266c06b5b0b2.png" },
  { id: "sm2",  title: "Super Minds 2", subtitle: "добавим вместе",         emoji: "📘", color: "#e4ebf2", ready: false },
  { id: "own",  title: "Свой учебник",  subtitle: "создай в конструкторе",  emoji: "➕", color: "#f6e2cf", ready: false, admin: true }
];

/* ---- Учебники из облака (создаются в admin.html) ---- */
(function () {
  try {
    var cc = JSON.parse(localStorage.getItem("sm-cloud-cache") || "null");
    if (cc && cc.courses && cc.data) {
      cc.courses.forEach(function (c) {
        if (window.SM_COURSE_DATA[c.id]) return;
        window.SM_COURSE_DATA[c.id] = cc.data[c.id] || [];
        window.SM_COURSES.splice(window.SM_COURSES.length - 1, 0, { id: c.id, title: c.title, subtitle: c.subtitle || "мой учебник", emoji: c.emoji || "📘", color: c.color || "#e4ebf2", img: c.img || null, ready: true, cloud: true });
      });
    }
  } catch (e) {}
})();

/* Обновить кэш облачных учебников (вызывается при загрузке и из admin.html) */
window.SM_refreshCloudCourses = function () {
  var URL_ = "https://kdzpmbuohfjbtjpqrdfx.supabase.co";
  var KEY_ = "sb_publishable_K8vhCVG_jiEyHYQOgp3XWQ_bWobdeBG";
  function j(u) { return fetch(u, { headers: { apikey: KEY_, Authorization: "Bearer " + KEY_ } }).then(function (r) { return r.json(); }); }
  return Promise.all([
    j(URL_ + "/rest/v1/courses?select=slug,title,subtitle,emoji,color,img&order=created_at.asc"),
    j(URL_ + "/rest/v1/units?select=course_slug,slug,unit_label,title,emoji,color,position,words&order=position.asc,created_at.asc")
  ]).then(function (res) {
    var courses = res[0] || [], units = res[1] || [];
    if (!Array.isArray(courses) || !Array.isArray(units)) return;
    var data = {};
    units.forEach(function (u) {
      var w = Array.isArray(u.words) ? u.words : [];
      (data[u.course_slug] = data[u.course_slug] || []).push({ id: u.slug, unit: u.unit_label || "", title: u.title, emoji: u.emoji || "📖", color: u.color || "#f6e2cf", words: w });
    });
    try {
      localStorage.setItem("sm-cloud-cache", JSON.stringify({
        courses: courses.map(function (c) { return { id: c.slug, title: c.title, subtitle: c.subtitle, emoji: c.emoji, color: c.color, img: c.img }; }),
        data: data
      }));
    } catch (e) {}
  }).catch(function (e) {});
};
window.SM_refreshCloudCourses();

/* ---- Выбор текущего курса (localStorage, по умолчанию sm1) ---- */
(function () {
  var cid;
  try { cid = localStorage.getItem("sm-course"); } catch (e) {}
  if (!cid || !window.SM_COURSE_DATA[cid]) cid = "sm1";
  window.SM_COURSE = window.SM_COURSES.filter(function (c) { return c.id === cid; })[0] || window.SM_COURSES[0];
  window.SM_UNITS = window.SM_COURSE_DATA[cid];
  window.SM_ALL_WORDS = window.SM_UNITS.flatMap(function (u) {
    return u.words.map(function (w, i) {
      return { id: u.id + "-" + i, unitId: u.id, unit: u.unit, unitTitle: u.title, unitColor: u.color, en: w.en, ru: w.ru, emoji: w.emoji, img: w.img || null };
    });
  });
})();

/* Отрисовать «лицо» слова: картинка если есть, иначе эмодзи. px — размер. */
window.SM_face = function (w, px) {
  px = px || 64;
  if (w && w.img) return '<img src="' + w.img + '" alt="" style="width:' + px + 'px;height:' + px + 'px;object-fit:contain;vertical-align:middle;border-radius:12px">';
  return '<span style="font-size:' + px + 'px;line-height:1">' + (w ? w.emoji : "") + '</span>';
};
