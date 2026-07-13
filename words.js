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
      { en: "swim", ru: "плавать", emoji: "🏊" },
      { en: "sing", ru: "петь", emoji: "🎤" },
      { en: "dance", ru: "танцевать", emoji: "💃" },
      { en: "paint", ru: "рисовать красками", emoji: "🎨" },
      { en: "draw", ru: "рисовать", emoji: "✏️" },
      { en: "read", ru: "читать", emoji: "📚" },
      { en: "ride a bike", ru: "кататься на велосипеде", emoji: "🚴" },
      { en: "play football", ru: "играть в футбол", emoji: "⚽" },
      { en: "run", ru: "бегать", emoji: "🏃" },
      { en: "jump", ru: "прыгать", emoji: "🤸" },
      { en: "climb", ru: "лазить", emoji: "🧗" },
      { en: "play tennis", ru: "играть в теннис", emoji: "🎾" }
    ]
  },
  {
    id: "u6", unit: "Unit 6", title: "The old house", emoji: "🏠", color: "#f6e2cf",
    words: [
      { en: "kitchen", ru: "кухня", emoji: "🍳" },
      { en: "bedroom", ru: "спальня", emoji: "🛏️" },
      { en: "bathroom", ru: "ванная", emoji: "🛁" },
      { en: "living room", ru: "гостиная", emoji: "🛋️" },
      { en: "hall", ru: "прихожая", emoji: "🚪" },
      { en: "garden", ru: "сад", emoji: "🌳" },
      { en: "bed", ru: "кровать", emoji: "🛏️" },
      { en: "sofa", ru: "диван", emoji: "🛋️" },
      { en: "table", ru: "стол", emoji: "🪑" },
      { en: "lamp", ru: "лампа", emoji: "💡" },
      { en: "clock", ru: "часы", emoji: "🕐" },
      { en: "cupboard", ru: "шкаф", emoji: "🗄️" }
    ]
  },
  {
    id: "u7", unit: "Unit 7", title: "Get dressed!", emoji: "👕", color: "#e4ebf2",
    words: [
      { en: "T-shirt", ru: "футболка", emoji: "👕" },
      { en: "shirt", ru: "рубашка", emoji: "👔" },
      { en: "trousers", ru: "брюки", emoji: "👖" },
      { en: "skirt", ru: "юбка", emoji: "👗" },
      { en: "dress", ru: "платье", emoji: "👗" },
      { en: "shoes", ru: "туфли", emoji: "👟" },
      { en: "socks", ru: "носки", emoji: "🧦" },
      { en: "hat", ru: "шапка", emoji: "🧢" },
      { en: "jacket", ru: "куртка", emoji: "🧥" },
      { en: "shorts", ru: "шорты", emoji: "🩳" },
      { en: "boots", ru: "ботинки", emoji: "🥾" },
      { en: "gloves", ru: "перчатки", emoji: "🧤" }
    ]
  },
  {
    id: "u8", unit: "Unit 8", title: "The robot · body", emoji: "🤖", color: "#efe0e6",
    words: [
      { en: "head", ru: "голова", emoji: "🗣️" },
      { en: "arm", ru: "рука", emoji: "💪" },
      { en: "hand", ru: "ладонь", emoji: "✋" },
      { en: "leg", ru: "нога", emoji: "🦵" },
      { en: "foot", ru: "ступня", emoji: "🦶" },
      { en: "body", ru: "тело", emoji: "🧍" },
      { en: "eyes", ru: "глаза", emoji: "👀" },
      { en: "ears", ru: "уши", emoji: "👂" },
      { en: "nose", ru: "нос", emoji: "👃" },
      { en: "mouth", ru: "рот", emoji: "👄" },
      { en: "hair", ru: "волосы", emoji: "💇" },
      { en: "fingers", ru: "пальцы", emoji: "🖐️" }
    ]
  },
  {
    id: "u9", unit: "Unit 9", title: "At the beach", emoji: "🏖️", color: "#faf1d8",
    words: [
      { en: "sea", ru: "море", emoji: "🌊" },
      { en: "sand", ru: "песок", emoji: "🏖️" },
      { en: "sun", ru: "солнце", emoji: "☀️" },
      { en: "shell", ru: "ракушка", emoji: "🐚" },
      { en: "boat", ru: "лодка", emoji: "⛵" },
      { en: "crab", ru: "краб", emoji: "🦀" },
      { en: "bucket", ru: "ведёрко", emoji: "🪣" },
      { en: "spade", ru: "лопатка", emoji: "⛏️" },
      { en: "sandcastle", ru: "замок из песка", emoji: "🏰" },
      { en: "starfish", ru: "морская звезда", emoji: "⭐" },
      { en: "towel", ru: "полотенце", emoji: "🧺" },
      { en: "umbrella", ru: "зонт", emoji: "⛱️" }
    ]
  }
];

/* ---- Реестр учебников (курсов) ---- */
window.SM_COURSES = [
  { id: "sm1",  title: "Super Minds 1", subtitle: "2nd edition · 6–8 лет", emoji: "📗", color: "#dfeadd", ready: true, img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_054541_850dabec-bbfc-4814-8d79-266c06b5b0b2.png" },
  { id: "sm2",  title: "Super Minds 2", subtitle: "добавим вместе",         emoji: "📘", color: "#e4ebf2", ready: false },
  { id: "own",  title: "Свой учебник",  subtitle: "добавим вместе",         emoji: "➕", color: "#f6e2cf", ready: false }
];

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
