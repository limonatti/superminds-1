/* Мультиучебники: данные курсов + выбор текущего курса.
   Каждый юнит: { id, unit, title, emoji, color, words:[{en, ru, emoji}] }
   id слова: unitId + "-" + индекс — используется для прогресса.
   Добавить новый учебник = добавить SM_COURSE_DATA["xxx"]=[...] и запись в SM_COURSES. */
window.SM_COURSE_DATA = window.SM_COURSE_DATA || {};
window.SM_COURSE_DATA["sm1"] = [
  {
    id: "welcome", unit: "Welcome", title: "Friends · цвета", emoji: "👋", color: "#f6e2cf",
    words: [
      { en: "red", ru: "красный", emoji: "🔴", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260727_070925_722a4074-6337-4deb-8e43-c9f833cfc506_min.webp" },
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
      { en: "three", ru: "три", emoji: "3️⃣", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260727_070936_2bcfeb6f-06bc-434e-b85a-34cc36a3a74a_min.webp" },
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
      { en: "pen", ru: "ручка", emoji: "🖊️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_060447_dd402818-9ccf-4b49-bdc7-cbd963438045_min.webp" },
      { en: "pencil", ru: "карандаш", emoji: "✏️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_060449_144713dd-4453-40f8-8b41-764ad7aee97d_min.webp" },
      { en: "rubber", ru: "ластик", emoji: "🧽", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_060452_a00c96ba-2c54-44ea-9433-77bb43cee445_min.webp" },
      { en: "ruler", ru: "линейка", emoji: "📏", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_060454_42db52f9-cd9f-4183-a484-ed6926020649_min.webp" },
      { en: "book", ru: "книга", emoji: "📖", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_060530_33da6804-3cf7-42a6-a767-34ed1cef39c5_min.webp" },
      { en: "bag", ru: "рюкзак", emoji: "🎒", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_060532_c7c89dc3-1f0c-4654-9bab-9f448b768edd_min.webp" },
      { en: "pencil case", ru: "пенал", emoji: "🖍️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260714_180624_1a520775-e80b-4352-8a29-ddc1964f7d1b_min.webp" },
      { en: "desk", ru: "парта", emoji: "🪑", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_060538_966f120f-ada1-4dc2-b098-82665383a842_min.webp" },
      { en: "chair", ru: "стул", emoji: "💺", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_060552_27e81608-380a-4a04-b4c9-14069dca915a_min.webp" },
      { en: "notebook", ru: "тетрадь", emoji: "📓", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_060555_ad92feb8-c638-48ec-8c6e-bb4249cb2bea_min.webp" },
      { en: "teacher", ru: "учитель", emoji: "👩‍🏫", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_060557_2aaed4b0-0b83-4dc6-aa21-89a10b599260_min.webp" },
      { en: "board", ru: "доска", emoji: "📋", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_060600_502a7f21-cce4-4b80-bc5c-ad2f7134f4ce_min.webp" }
    ]
  },
  {
    id: "u2", unit: "Unit 2", title: "Play time!", emoji: "🧸", color: "#f6e2cf",
    words: [
      { en: "ball", ru: "мяч", emoji: "⚽", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123914_5095b465-c597-409a-b9a1-ef7dba94717f_min.webp" },
      { en: "teddy", ru: "мишка", emoji: "🧸", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123917_475f4319-7c3f-46a6-b3b9-8fa38b890051_min.webp" },
      { en: "doll", ru: "кукла", emoji: "🪆", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123921_20b0a5f8-4c63-4505-9230-7cb2cde73b96_min.webp" },
      { en: "train", ru: "поезд", emoji: "🚂", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123924_f0b25246-661e-4147-b90b-d7f8622bc379_min.webp" },
      { en: "car", ru: "машинка", emoji: "🚗", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123929_78f3af4f-2f11-4717-9e64-cd16f83037a0_min.webp" },
      { en: "plane", ru: "самолёт", emoji: "✈️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123932_d3b2a328-5527-41f0-88f4-839308988915_min.webp" },
      { en: "kite", ru: "воздушный змей", emoji: "🪁", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123935_23cc7431-58fb-4ae5-a84d-820513f415a3_min.webp" },
      { en: "bike", ru: "велосипед", emoji: "🚲", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123939_1c918b06-d42c-41ef-8662-e19fb3633213_min.webp" },
      { en: "computer game", ru: "компьютерная игра", emoji: "🎮", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123942_9163b4d7-47f3-47fd-821a-70a1b7040946_min.webp" },
      { en: "monster", ru: "монстрик", emoji: "👾", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123945_4a62bcab-07c2-4cd3-9bc9-2d0a00610926_min.webp" },
      { en: "robot", ru: "робот", emoji: "🤖", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123948_3fc2f0d0-2d4d-4d54-a096-4309c6920102_min.webp" },
      { en: "go-kart", ru: "картинг", emoji: "🏎️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123951_ca987b7a-1c0d-4a8c-868a-5326485eb630_min.webp" }
    ]
  },
  {
    id: "u3", unit: "Unit 3", title: "Pet show", emoji: "🐸", color: "#dfeadd",
    words: [
      { en: "dog", ru: "собака", emoji: "🐶", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260706_115606_c26927ac-f3ef-4bbe-a91a-2cde0d6f1700_min.webp" },
      { en: "cat", ru: "кошка", emoji: "🐱", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260706_055756_3053d807-f4b9-45d3-9bad-e1a654355513_min.webp" },
      { en: "bird", ru: "птица", emoji: "🐦", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260706_060403_0120dd3b-3fc7-4b7b-9c3d-c097b117d25e_min.webp" },
      { en: "fish", ru: "рыбка", emoji: "🐟", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260706_060401_57070287-b8b1-4221-a16d-cd684fa48acf_min.webp" },
      { en: "mouse", ru: "мышь", emoji: "🐭", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123900_4bb0c5a5-e84f-4f89-a1ba-6cca8fc551f4_min.webp" },
      { en: "horse", ru: "лошадь", emoji: "🐴", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_123903_87861ac5-09ae-4ec0-8606-08d24769c4ea_min.webp" },
      { en: "frog", ru: "лягушка", emoji: "🐸", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260706_060358_348bd60d-29b7-488a-9e4a-9660e858cd64_min.webp" },
      { en: "rabbit", ru: "кролик", emoji: "🐰", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260706_060412_98956f20-08c2-4f45-bbf0-39ac0867ec45_min.webp" },
      { en: "spider", ru: "паук", emoji: "🕷️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260706_060404_c1f09276-dca1-48dc-a1fd-ce23329a5477_min.webp" },
      { en: "lizard", ru: "ящерица", emoji: "🦎", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260706_060405_d5b19be3-08db-476a-b0e5-5ce7b348e59d_min.webp" },
      { en: "duck", ru: "утка", emoji: "🦆", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260706_060400_60d2de5c-a715-441c-a8ad-0acf783ac11d_min.webp" },
      { en: "elephant", ru: "слон", emoji: "🐘", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260706_060409_dcfb2f41-b6e0-48bb-a9a6-1d00779918eb_min.webp" }
    ]
  },
  {
    id: "u4", unit: "Unit 4", title: "Lunchtime", emoji: "🍎", color: "#fbe6de",
    words: [
      { en: "apple", ru: "яблоко", emoji: "🍎", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_124006_0b0e1c9a-192a-4b0e-9712-606dcbd7d9a2_min.webp" },
      { en: "banana", ru: "банан", emoji: "🍌", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_124009_c9de35d4-b3a2-4544-acfe-8362661767a4_min.webp" },
      { en: "orange", ru: "апельсин", emoji: "🍊", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_124014_660e58d3-4717-4728-9e81-2052f9631f4c_min.webp" },
      { en: "sandwich", ru: "бутерброд", emoji: "🥪", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_124017_39433336-297b-476c-9125-ac752529abbe_min.webp" },
      { en: "cake", ru: "торт", emoji: "🍰", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_124021_8999c958-b0eb-45d9-b5ad-951528d89555_min.webp" },
      { en: "ice cream", ru: "мороженое", emoji: "🍦", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_124024_607ceadf-8b96-4aaa-9a66-fe7be5fc14ba_min.webp" },
      { en: "chicken", ru: "курица", emoji: "🍗", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_124028_dc676a1a-4319-4990-8076-f13ab8473657_min.webp" },
      { en: "egg", ru: "яйцо", emoji: "🥚", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_124031_26198f19-6756-4159-a9b1-5519f122478c_min.webp" },
      { en: "milk", ru: "молоко", emoji: "🥛", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_124034_62e50218-aeeb-4340-88ee-4dd12ef6a5a1_min.webp" },
      { en: "juice", ru: "сок", emoji: "🧃", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_124039_4eefc669-2a5d-47b8-89ae-e1885e28d1ba_min.webp" },
      { en: "bread", ru: "хлеб", emoji: "🍞", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_124042_6956e105-5b43-41e5-ae5b-cf0312e87436_min.webp" },
      { en: "water", ru: "вода", emoji: "💧", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_124045_2b5c2674-6892-48ed-bfb3-72de7e01e569_min.webp" }
    ]
  },
  {
    id: "u5", unit: "Unit 5", title: "Free time", emoji: "⚽", color: "#e7f0e1",
    words: [
      { en: "swim", ru: "плавать", emoji: "🏊", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_125911_2d13d78b-10bd-494e-b72b-0ebafe4bdfc9_min.webp" },
      { en: "sing", ru: "петь", emoji: "🎤", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_125914_7aba3af1-d88c-4243-bfe0-9599df54fcfd_min.webp" },
      { en: "dance", ru: "танцевать", emoji: "💃", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_125919_52bf938c-ad89-4409-a230-656dc543794e_min.webp" },
      { en: "paint", ru: "рисовать красками", emoji: "🎨", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_125923_856c6b6c-b097-4f17-be69-2462519f9ed9_min.webp" },
      { en: "draw", ru: "рисовать", emoji: "✏️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_125927_86b6a5a4-68d3-4c0f-9f17-6e1c28694e3f_min.webp" },
      { en: "read", ru: "читать", emoji: "📚", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_125932_4eabe8ba-a1d4-49ff-a7c5-8ea091f038a9_min.webp" },
      { en: "ride a bike", ru: "кататься на велосипеде", emoji: "🚴", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_125936_69f3ef7b-c3e3-4017-9be4-861c7bf6a2f4_min.webp" },
      { en: "play football", ru: "играть в футбол", emoji: "⚽", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_125939_3c9ef0d3-4692-45ba-927f-4bd2c6b6e735_min.webp" },
      { en: "run", ru: "бегать", emoji: "🏃", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_125942_0e3b8607-0415-4e5d-b903-6d6ea97f07fb_min.webp" },
      { en: "jump", ru: "прыгать", emoji: "🤸", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_125946_cdf8bf2e-0aa7-45d4-8d88-ffe481e56d2f_min.webp" },
      { en: "climb", ru: "лазить", emoji: "🧗", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_125949_2f72f896-f3fd-4d5d-8dd7-b58defc0d6b4_min.webp" },
      { en: "play tennis", ru: "играть в теннис", emoji: "🎾", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_125953_222c3a23-fb6c-4e7a-8688-7a0cd8e4f3b5_min.webp" }
    ]
  },
  {
    id: "u6", unit: "Unit 6", title: "The old house", emoji: "🏠", color: "#f6e2cf",
    words: [
      { en: "kitchen", ru: "кухня", emoji: "🍳", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_130007_78023f55-f7b0-48b6-92ee-58495203b324_min.webp" },
      { en: "bedroom", ru: "спальня", emoji: "🛏️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_130011_ba7be957-dff6-4fdd-a8cc-6b83424a485f_min.webp" },
      { en: "bathroom", ru: "ванная", emoji: "🛁", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_130014_f55afc0b-4465-4b5a-8ee0-4fecd1629d68_min.webp" },
      { en: "living room", ru: "гостиная", emoji: "🛋️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_130018_d8a105f3-d0a6-4c3a-950b-22784f582a09_min.webp" },
      { en: "hall", ru: "прихожая", emoji: "🚪", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_130023_9821c25b-91ad-4b59-b692-5125266c523f_min.webp" },
      { en: "garden", ru: "сад", emoji: "🌳", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_130028_e27630d5-0ed0-4d07-b783-31b4455eed11_min.webp" },
      { en: "bed", ru: "кровать", emoji: "🛏️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_130034_1930c0ef-93e2-4653-a87c-bf32d33d783c_min.webp" },
      { en: "sofa", ru: "диван", emoji: "🛋️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_130954_0780b939-5496-4d33-8803-b623c417c0d9_min.webp" },
      { en: "table", ru: "стол", emoji: "🪑", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260714_180608_5a87d052-7ae7-4a6e-972a-feec9db28d00_min.webp" },
      { en: "lamp", ru: "лампа", emoji: "💡", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_130927_cc576601-8889-445f-98cf-07fa9e5fff16_min.webp" },
      { en: "clock", ru: "часы", emoji: "🕐", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_130931_1899e839-4822-4551-ad53-2604bc2f2729_min.webp" },
      { en: "cupboard", ru: "шкаф", emoji: "🗄️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_130935_f1ffd6a4-d874-4b5d-8b41-66eaa187101d_min.webp" }
    ]
  },
  {
    id: "u7", unit: "Unit 7", title: "Get dressed!", emoji: "👕", color: "#e4ebf2",
    words: [
      { en: "T-shirt", ru: "футболка", emoji: "👕", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_130958_ee2012ea-3673-40d5-9f84-389582fbe343_min.webp" },
      { en: "shirt", ru: "рубашка", emoji: "👔", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131003_9461f359-8acd-4d22-9495-fc66d71157c9_min.webp" },
      { en: "trousers", ru: "брюки", emoji: "👖", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131748_acc11102-afc9-485b-a24a-6345f5474d30_min.webp" },
      { en: "skirt", ru: "юбка", emoji: "👗", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131753_1e72dbf8-305f-4a1e-b73d-ac32de302b86_min.webp" },
      { en: "dress", ru: "платье", emoji: "👗", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131757_6daeabaf-8e33-4a11-9f1d-26530f2d9add_min.webp" },
      { en: "shoes", ru: "туфли", emoji: "👟", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131813_a003691d-1e6d-46fe-bb15-32197ae0ce5c_min.webp" },
      { en: "socks", ru: "носки", emoji: "🧦", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131817_b8e6ecf7-128b-42ea-8897-783c1993d76b_min.webp" },
      { en: "hat", ru: "шапка", emoji: "🧢", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131821_f563dfbb-c82b-4677-89cc-fcb4dd35bb95_min.webp" },
      { en: "jacket", ru: "куртка", emoji: "🧥", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131826_f71a1fe1-e603-4818-9047-b2158b90bc2a_min.webp" },
      { en: "shorts", ru: "шорты", emoji: "🩳", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131831_73520452-1ed2-4010-86bb-ea57c5a63a07_min.webp" },
      { en: "boots", ru: "ботинки", emoji: "🥾", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131836_aa2bf39b-d732-4b09-90b8-7e7c72e11f26_min.webp" },
      { en: "gloves", ru: "перчатки", emoji: "🧤", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131839_b57445dd-fadd-48b7-8f0e-48fc1c10921a_min.webp" }
    ]
  },
  {
    id: "u8", unit: "Unit 8", title: "The robot · body", emoji: "🤖", color: "#efe0e6",
    words: [
      { en: "head", ru: "голова", emoji: "🗣️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131902_88079afc-7b73-4f2a-a339-264a164918de_min.webp" },
      { en: "arm", ru: "рука", emoji: "💪", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131909_efa1062c-0990-4597-a6ae-be6f87c586ca_min.webp" },
      { en: "hand", ru: "ладонь", emoji: "✋", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131914_ee35d30c-43b6-4ad8-88d7-dfdde407e0a8_min.webp" },
      { en: "leg", ru: "нога", emoji: "🦵", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131919_966d2ac3-cb46-43e4-8a65-aada8a20a06c_min.webp" },
      { en: "foot", ru: "ступня", emoji: "🦶", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131924_e8dcc781-bce3-463a-b676-d750b15e7240_min.webp" },
      { en: "body", ru: "тело", emoji: "🧍", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131905_ee73c196-17d8-444f-a986-7a2863b95e2a_min.webp" },
      { en: "eyes", ru: "глаза", emoji: "👀", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131941_b62a0267-af83-4e56-b598-2f49a65f63a2_min.webp" },
      { en: "ears", ru: "уши", emoji: "👂", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131946_b86b3046-ffaa-458f-97f9-a6f2031ea611_min.webp" },
      { en: "nose", ru: "нос", emoji: "👃", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131950_66a6ccda-d2f6-4e06-bdd3-a57e348f4f84_min.webp" },
      { en: "mouth", ru: "рот", emoji: "👄", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131954_e4ad8297-b0ca-40a6-8473-4e3f7a83e2b4_min.webp" },
      { en: "hair", ru: "волосы", emoji: "💇", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_131957_56644b74-2b82-4d93-8746-1288f2eb90b5_min.webp" },
      { en: "fingers", ru: "пальцы", emoji: "🖐️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_132002_ed827039-0fe7-4054-b384-a7d0842bc291_min.webp" }
    ]
  },
  {
    id: "u9", unit: "Unit 9", title: "At the beach", emoji: "🏖️", color: "#faf1d8",
    words: [
      { en: "sea", ru: "море", emoji: "🌊", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_132331_42c18322-fa42-4b20-a28e-a96730f65794_min.webp" },
      { en: "sand", ru: "песок", emoji: "🏖️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_132352_463ef29d-63cf-47f6-8ef4-8e24e557cfdd_min.webp" },
      { en: "sun", ru: "солнце", emoji: "☀️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_132335_b8df4495-34ac-46d2-b127-539a8a960f57_min.webp" },
      { en: "shell", ru: "ракушка", emoji: "🐚", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_132339_ed92b51e-6267-494f-8477-b1d0b4fc770b_min.webp" },
      { en: "boat", ru: "лодка", emoji: "⛵", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_132344_7fcdfb1a-843a-4c22-a2bb-68e198980d7d_min.webp" },
      { en: "crab", ru: "краб", emoji: "🦀", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_132348_db293e70-f094-4fdc-b849-0cc2f29bffaa_min.webp" },
      { en: "bucket", ru: "ведёрко", emoji: "🪣", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_132408_6bbc7742-d3b0-41f7-b59b-5322e36c893b_min.webp" },
      { en: "spade", ru: "лопатка", emoji: "⛏️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_132412_7a555416-c57e-47a2-b46e-1bf181c00b1a_min.webp" },
      { en: "sandcastle", ru: "замок из песка", emoji: "🏰", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_132416_4824ddc7-564c-469d-bed1-822b1aba3a35_min.webp" },
      { en: "starfish", ru: "морская звезда", emoji: "⭐", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_132421_4284d45b-0128-472a-898c-6bbc203b53d5_min.webp" },
      { en: "towel", ru: "полотенце", emoji: "🧺", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_132426_f00405c8-1014-45c0-a5a7-3b5dcf7d9f8a_min.webp" },
      { en: "umbrella", ru: "зонт", emoji: "⛱️", img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_132430_39be9a6c-b50c-4f62-a3de-ea7cd61def80_min.webp" }
    ]
  }
];

/* ---- Реестр учебников (курсов) ---- */
window.SM_COURSES = [
  { id: "sm1",  title: "Super Minds 1", subtitle: "2nd edition · 6–8 лет", emoji: "📗", color: "#dfeadd", ready: true, img: "https://d8j0ntlcm91z4.cloudfront.net/user_3F1b5KRx5p4EogfpaQRR3sEXIP5/hf_20260713_054541_850dabec-bbfc-4814-8d79-266c06b5b0b2_min.webp" },
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
    /* Свежие данные пришли — подмешиваем курсы, которых ещё нет в списке */
    courses.forEach(function (c) {
      if (window.SM_COURSE_DATA[c.slug]) return;
      window.SM_COURSE_DATA[c.slug] = data[c.slug] || [];
      window.SM_COURSES.splice(window.SM_COURSES.length - 1, 0, {
        id: c.slug, title: c.title, subtitle: c.subtitle || "мой учебник",
        emoji: c.emoji || "📘", color: c.color || "#e4ebf2", img: c.img || null, ready: true, cloud: true
      });
    });
    /* Данные могли обновиться и для уже известных курсов */
    Object.keys(data).forEach(function (slug) { window.SM_COURSE_DATA[slug] = data[slug]; });
  }).catch(function (e) {});
};

/* ---- Текущий курс ----------------------------------------------------------
   Раньше выбор происходил один раз, сразу при загрузке файла. Курсы из базы
   приходят позже, поэтому выбранный учеником курс часто ещё не был известен —
   и молча подменялся на sm1. Тренажёр после этого не находил нужный юнит и
   показывал все юниты чужого учебника.
   Теперь: сначала выбираем из того, что есть (чтобы страница не пустовала),
   а после загрузки из базы пересобираем. Страницы, которым важен точный курс,
   ждут window.SM_ready.
---------------------------------------------------------------------------- */

window.SM_useCourse = function (cid) {
  var known = cid && window.SM_COURSE_DATA[cid];
  if (!known) cid = window.SM_COURSE_DATA["sm1"] ? "sm1" : Object.keys(window.SM_COURSE_DATA)[0];
  window.SM_COURSE = window.SM_COURSES.filter(function (c) { return c.id === cid; })[0] || window.SM_COURSES[0];
  window.SM_UNITS = window.SM_COURSE_DATA[cid] || [];
  window.SM_ALL_WORDS = window.SM_UNITS.flatMap(function (u) {
    return (u.words || []).map(function (w, i) {
      return { id: u.id + "-" + i, unitId: u.id, unit: u.unit, unitTitle: u.title, unitColor: u.color, en: w.en, ru: w.ru, emoji: w.emoji, img: w.img || null };
    });
  });
  return cid;
};

/* Какой курс просил ученик — до всякой подмены */
window.SM_wantedCourse = (function () {
  try { return localStorage.getItem("sm-course") || null; } catch (e) { return null; }
})();

/* Найти курс, в котором есть такой юнит (когда ссылка ведёт в чужой учебник) */
window.SM_courseOfUnit = function (unitId) {
  var d = window.SM_COURSE_DATA;
  for (var slug in d) {
    if (!Object.prototype.hasOwnProperty.call(d, slug)) continue;
    if ((d[slug] || []).some(function (u) { return u.id === unitId; })) return slug;
  }
  return null;
};

/* ---- Курсы Speakout: их слова лежат в speakout-words.js ------------------
   Раньше они были видны только на доске урока и в играх, поэтому словарь и
   тренажёр не могли показать курс ученика. Здесь приводим их к тому же виду,
   что и учебники из конструктора, — и они работают везде наравне.
-------------------------------------------------------------------------- */
window.SM_absorbSpeakout = function () {
  var S = window.SPEAKOUT_WORDS;
  if (!S) return;                      // файл не подключён на этой странице
  var META = {
    "speakout-b1":     { title: "Speakout B1",  subtitle: "разговорный курс · 8 юнитов", emoji: "🗣️", color: "#dfe7f2" },
    "speakout-b1plus": { title: "Speakout B1+", subtitle: "разговорный курс · 8 юнитов", emoji: "🗣️", color: "#e7dff2" }
  };
  Object.keys(S).forEach(function (slug) {
    if (window.SM_COURSE_DATA[slug]) return;
    var meta = META[slug] || { title: slug, subtitle: "курс", emoji: "🗣️", color: "#e4ebf2" };
    var prefix = slug === "speakout-b1plus" ? "sbp-u" : "sb1-u";
    var units = Object.keys(S[slug]).sort(function (a, b) { return (+a) - (+b); }).map(function (n) {
      return {
        id: prefix + n,
        unit: "Unit " + n,
        title: "Unit " + n,
        emoji: meta.emoji,
        color: meta.color,
        words: (S[slug][n] || []).map(function (pair) {
          return { en: pair[0], ru: pair[1], emoji: "💬" };
        })
      };
    });
    window.SM_COURSE_DATA[slug] = units;
    window.SM_COURSES.splice(window.SM_COURSES.length - 1, 0, {
      id: slug, title: meta.title, subtitle: meta.subtitle,
      emoji: meta.emoji, color: meta.color, ready: true, speakout: true
    });
  });
};
/* ---- Остальные курсы: Focus, Solutions, Gateway --------------------------
   Их слова живут в course-words.js (собирается gen_course_words.py).
   Раньше они были только внутри страниц юнитов, поэтому словарь и тренажёр
   этих курсов не видели.
-------------------------------------------------------------------------- */
window.SM_absorbCourseWords = function () {
  var C = window.COURSE_WORDS;
  if (!C) return;
  var PREFIX = { "focus-1": "f1-u", "solutions-pi": "spi-u", "solutions-el": "sel-u", "gateway-a1p": "gwa-u" };
  Object.keys(C).forEach(function (slug) {
    if (window.SM_COURSE_DATA[slug]) return;
    var c = C[slug], pre = PREFIX[slug] || (slug.replace(/[^a-z0-9]/g, "").slice(0, 4) + "-u");
    window.SM_COURSE_DATA[slug] = (c.units || []).map(function (u) {
      return {
        id: pre + u.n,
        unit: "Unit " + u.n,
        title: u.title || ("Unit " + u.n),
        emoji: u.emoji || c.emoji || "📘",
        color: c.color || "#e4ebf2",
        words: (u.words || []).map(function (p) { return { en: p[0], ru: p[1], emoji: "📖" }; })
      };
    });
    window.SM_COURSES.splice(window.SM_COURSES.length - 1, 0, {
      id: slug, title: c.title || slug, subtitle: c.subtitle || "курс",
      emoji: c.emoji || "📘", color: c.color || "#e4ebf2", ready: true
    });
  });
};

window.SM_absorbSpeakout();
window.SM_absorbCourseWords();

/* Первый проход — по тому, что уже есть в кэше */
window.SM_useCourse(window.SM_wantedCourse);

/* Второй проход — после ответа базы. Страницы ждут этот промис. */
window.SM_ready = window.SM_refreshCloudCourses().then(function () {
  window.SM_useCourse(window.SM_wantedCourse);
  return { course: window.SM_COURSE, units: window.SM_UNITS };
}).catch(function () {
  return { course: window.SM_COURSE, units: window.SM_UNITS };
});

/* Эндпоинт карточек: сам рисует фото по слову и навсегда кладёт его в кеш.
   Параметр f=1 в адресе заставляет перерисовать картинку заново. */
window.SM_CARD_EP = "https://img-gen.limonatti.workers.dev/card?w=";

/* Отрисовать «лицо» слова: авторская картинка, иначе фото по слову, иначе эмодзи.
   Крупно (от 56px) — широкая карточка, мелко — квадратная плитка. */
window.SM_face = function (w, px) {
  px = px || 64;
  if (w && w.img) return '<img src="' + w.img + '" alt="" style="width:' + px + 'px;height:' + px + 'px;object-fit:contain;vertical-align:middle;border-radius:12px">';
  /* Фото весит сотни килобайт, поэтому грузим его только там, где картинка
     действительно крупная. На мелких плитках (12 штук на экране) остаётся эмодзи. */
  if (w && w.en && px >= 56) {
    var st;
    if (px >= 80) {
      var bw = Math.round(px * 1.9);
      st = 'width:' + bw + 'px;max-width:100%;height:' + Math.round(bw * 0.72) + 'px;'
         + 'object-fit:cover;border-radius:16px;background:#f4e7db;display:block;margin:0 auto';
    } else {
      var sq = Math.round(px * 1.35);
      st = 'width:' + sq + 'px;height:' + sq + 'px;object-fit:cover;border-radius:10px;'
         + 'background:#f4e7db;vertical-align:middle;display:inline-block';
    }
    /* Без loading="lazy": карточки вставляются в DOM уже готовыми, и браузеры
       (в том числе Safari на телефоне) в этом случае ленивую загрузку часто
       не запускают вовсе — картинка так и остаётся пустой. */
    return '<img src="' + window.SM_CARD_EP + encodeURIComponent(w.en) + '" alt="" decoding="async"'
         + ' data-emo="' + (w.emoji || "") + '" data-px="' + px + '" style="' + st + '"'
         + ' onerror="SM_faceFallback(this)">';
  }
  return '<span style="font-size:' + px + 'px;line-height:1">' + (w ? w.emoji : "") + '</span>';
};

/* Если фото не сгенерировалось — тихо возвращаем эмодзи, без битой иконки. */
window.SM_faceFallback = function (img) {
  var s = document.createElement("span");
  s.style.fontSize = (img.getAttribute("data-px") || 64) + "px";
  s.style.lineHeight = "1";
  s.textContent = img.getAttribute("data-emo") || "";
  img.replaceWith(s);
};

/* ---- Голосовой движок: US/GB, женский/мужской. Выбор хранится в localStorage ---- */
(function () {
  var CHOICES = { "us-f": { lang: "en-US", g: "f" }, "us-m": { lang: "en-US", g: "m" }, "gb-f": { lang: "en-GB", g: "f" }, "gb-m": { lang: "en-GB", g: "m" } };
  var FEM = ["female", "zira", "jenny", "aria", "samantha", "sonia", "libby", "hazel", "karen", "victoria", "susan", "ava", "emma", "joanna", "salli", "kate", "serena", "stephanie", "allison", "michelle", "ana", "clara"];
  var MAL = ["male", "david", "daniel", "guy", "ryan", "george", "alex", "fred", "thomas", "brian", "matthew", "oliver", "james", "arthur", "christopher", "eric", "roger", "william", "aaron", "nathan", "evan", "tom"];
  function score(v, want) {
    var n = (v.name || "").toLowerCase();
    var lang = (v.lang || "").replace("_", "-");
    if (lang.slice(0, 2) !== "en") return -1;
    var s = 0;
    if (lang === want.lang) s += 40;
    var fem = FEM.some(function (x) { return n.indexOf(x) >= 0; });
    var nm = n.replace(/female/g, ""); /* чтобы "male" не находился внутри "female" */
    var mal = MAL.some(function (x) { return nm.indexOf(x) >= 0; });
    if (want.g === "f" && fem) s += 25;
    if (want.g === "m" && mal) s += 25;
    if (want.g === "f" && mal && !fem) s -= 20;
    if (want.g === "m" && fem && !mal) s -= 20;
    if (n.indexOf("natural") >= 0 || n.indexOf("neural") >= 0) s += 30; // голоса Edge — самые живые
    if (n.indexOf("google") >= 0) s += 20;
    if (n.indexOf("premium") >= 0 || n.indexOf("enhanced") >= 0) s += 15;
    if (n.indexOf("compact") >= 0) s -= 15;
    /* системные «шуточные» голоса звучат отвратительно — отсекаем */
    if (/eddy|flo|grandma|grandpa|rocko|sandy|shelley|bubbles|bells|boing|jester|organ|trinoids|whisper|wobble|zarvox|bahh|albert|junior|ralph|superstar|good news|bad news|cellos|deranged|hysterical|novelty|reed|kathy|princess|bruce|agnes|vicki/.test(n)) s -= 200;
    return s;
  }
  window.SM_speak = function (text, rate) {
    try {
      var u = new SpeechSynthesisUtterance(text);
      var key = null; try { key = localStorage.getItem("sm-voice"); } catch (e) {}
      var want = CHOICES[key] || CHOICES["us-f"];
      var best = null, bs = -1;
      (speechSynthesis.getVoices() || []).forEach(function (v) {
        var sc = score(v, want); if (sc > bs) { bs = sc; best = v; }
      });
      if (best) { u.voice = best; u.lang = best.lang; } else u.lang = want.lang;
      u.rate = rate || 0.9;
      u.pitch = 1;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch (e) {}
  };
  try { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = function () {}; } catch (e) {}

  /* плавающий переключатель голоса (внизу справа на каждой странице) */
  function widget() {
    if (document.getElementById("smVoiceBtn") || !document.body) return;
    var LBL = { "us-f": "🇺🇸 👩", "us-m": "🇺🇸 👨", "gb-f": "🇬🇧 👩", "gb-m": "🇬🇧 👨" };
    var b = document.createElement("button");
    b.id = "smVoiceBtn";
    b.style.cssText = "position:fixed;bottom:14px;right:14px;z-index:998;background:#fff;border:2px solid #e3d3ba;border-radius:999px;padding:8px 14px;font:800 13px 'Nunito',sans-serif;color:#5a4f47;cursor:pointer;box-shadow:0 4px 0 #e3d3ba";
    b.title = "Голос озвучки — клик переключает: США/Британия · женский/мужской";
    function refresh() { var k = null; try { k = localStorage.getItem("sm-voice"); } catch (e) {} b.textContent = "🔊 " + (LBL[k] || LBL["us-f"]); }
    refresh();
    b.onclick = function () {
      var order = ["us-f", "us-m", "gb-f", "gb-m"];
      var cur = null; try { cur = localStorage.getItem("sm-voice"); } catch (e) {}
      var next = order[(order.indexOf(cur) + 1) % order.length];
      try { localStorage.setItem("sm-voice", next); } catch (e) {}
      refresh();
      window.SM_speak("Hello! I am your English voice.");
    };
    document.body.appendChild(b);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", widget); else widget();
})();
/* Раздел чтения (Phonics) — карточка в главном меню */
(function () {
  function add() {
    var grid = document.querySelector('.grid');
    if (!grid) return false;
    if (document.getElementById('phonicsCard')) return true;
    var c = document.createElement('div');
    c.className = 'course ready';
    c.id = 'phonicsCard';
    c.style.cursor = 'pointer';
    c.innerHTML =
      '<div class="cover" style="background:#ffe0d6">🔤</div>' +
      '<div class="t">Чтение · Phonics</div>' +
      '<div class="s">буквы и звуки · 42 звука + гласные · игры</div>' +
      '<div class="go">Открыть →</div>';
    c.addEventListener('click', function () { location.href = 'phonics.html'; });
    grid.appendChild(c);
    return true;
  }
  function start(){ if(add())return; var n=0,t=setInterval(function(){ if(add()||++n>40) clearInterval(t); },200); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
