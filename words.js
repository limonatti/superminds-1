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
      { en: "ball", ru: "мяч", emoji: "⚽" },
      { en: "teddy", ru: "мишка", emoji: "🧸" },
      { en: "doll", ru: "кукла", emoji: "🪆" },
      { en: "train", ru: "поезд", emoji: "🚂" },
      { en: "car", ru: "машинка", emoji: "🚗" },
      { en: "plane", ru: "самолёт", emoji: "✈️" },
      { en: "kite", ru: "воздушный змей", emoji: "🪁" },
      { en: "bike", ru: "велосипед", emoji: "🚲" },
      { en: "computer game", ru: "компьютерная игра", emoji: "🎮" },
      { en: "monster", ru: "монстрик", emoji: "👾" },
      { en: "robot", ru: "робот", emoji: "🤖" },
      { en: "go-kart", ru: "картинг", emoji: "🏎️" }
    ]
  },
  {
    id: "u3", unit: "Unit 3", title: "Pet show", emoji: "🐸", color: "#dfeadd",
    words: [
      { en: "dog", ru: "собака", emoji: "🐶" },
      { en: "cat", ru: "кошка", emoji: "🐱" },
      { en: "bird", ru: "птица", emoji: "🐦" },
      { en: "fish", ru: "рыбка", emoji: "🐟" },
      { en: "mouse", ru: "мышь", emoji: "🐭" },
      { en: "horse", ru: "лошадь", emoji: "🐴" },
      { en: "frog", ru: "лягушка", emoji: "🐸" },
      { en: "rabbit", ru: "кролик", emoji: "🐰" },
      { en: "spider", ru: "паук", emoji: "🕷️" },
      { en: "lizard", ru: "ящерица", emoji: "🦎" },
      { en: "duck", ru: "утка", emoji: "🦆" },
      { en: "elephant", ru: "слон", emoji: "🐘" }
    ]
  },
  {
    id: "u4", unit: "Unit 4", title: "Lunchtime", emoji: "🍎", color: "#fbe6de",
    words: [
      { en: "apple", ru: "яблоко", emoji: "🍎" },
      { en: "banana", ru: "банан", emoji: "🍌" },
      { en: "orange", ru: "апельсин", emoji: "🍊" },
      { en: "sandwich", ru: "бутерброд", emoji: "🥪" },
      { en: "cake", ru: "торт", emoji: "🍰" },
      { en: "ice cream", ru: "мороженое", emoji: "🍦" },
      { en: "chicken", ru: "курица", emoji: "🍗" },
      { en: "egg", ru: "яйцо", emoji: "🥚" },
      { en: "milk", ru: "молоко", emoji: "🥛" },
      { en: "juice", ru: "сок", emoji: "🧃" },
      { en: "bread", ru: "хлеб", emoji: "🍞" },
      { en: "water", ru: "вода", emoji: "💧" }
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
