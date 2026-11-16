window.HOLIDAY = {
  missions: [
    ['Детектор проблем','Посмотри и реши','6 минут'],
    ['Три голосовых','Послушай и перезвони','8 минут'],
    ['Рулетка извинений','Спаси разговор','6 минут'],
    ['Кастинг отеля','Спроси и выбери','8 минут'],
    ['Ресепшен на связи','Исправь ошибку в брони','8 минут'],
    ['Режиссёр отпуска','Расскажи и удиви','8 минут']
  ],
  problems: [
    {title:'Усталая путешественница',word:'tired',now:'I’m very tired.',past:'I was very tired.',extra:'I went to bed late.',question:'How was your day?'},
    {title:'За окном',word:'rain',now:'There’s a lot of rain.',past:'There was a lot of rain.',extra:'The weather was bad.',question:'How was the weather?'},
    {title:'Все места заняты',word:'nowhere to sit',now:'There’s nowhere to sit.',past:'There was nowhere to sit.',extra:'There were a lot of people.',question:'How was the airport?'},
    {title:'Мужчина с телефоном',word:'the wrong way',now:'I’m going the wrong way.',past:'I went the wrong way.',extra:'I had a problem.',question:'How was your journey?'}
  ],
  voices: [
    {id:'lena',name:'Lena',icon:'01',text:'Hi! It’s Lena. My flight was two hours late. I was very tired. Then I went to the wrong hotel! I had a sandwich at the airport. How was your journey?',choices:['A late flight and the wrong hotel','A small, quiet hotel','A rainy beach and a pizza'],correct:0,evidence:'The flight was two hours late. She went to the wrong hotel.',retell:'Her flight was… She was… She went to…',reply:'My journey was… There was… / I had…',follow:'How was the sandwich?',teacher:'It was OK, but it was very small. I was hungry!'},
    {id:'max',name:'Max',icon:'02',text:'Hi! It’s Max. I stayed in a little hotel in a forest. My room was small, but it was very quiet. There wasn’t any noise. I had a great dinner. How was your hotel?',choices:['A noisy room in the city','A small, quiet hotel','A rainy beach and a pizza'],correct:1,evidence:'The room was small and quiet. There wasn’t any noise.',retell:'His room was… There wasn’t… He had…',reply:'My hotel was… My room was…',follow:'How was the dinner?',teacher:'It was great. I had fish and rice.'},
    {id:'zoe',name:'Zoe',icon:'03',text:'Hi! It’s Zoe. I went to the beach yesterday. It rained a lot. I was cold, so I went to a cafe. I had a very big pizza. It was great! How was your day?',choices:['A late flight and the wrong hotel','A noisy room in the city','A rainy beach and a pizza'],correct:2,evidence:'She went to the beach. It rained. She went to a café and had pizza.',retell:'She went to… The weather was… She had…',reply:'My day was… I went to… I had…',follow:'How was the pizza?',teacher:'It was really good. I loved it!'}
  ],
  excuses: [
    {id:'sorry-late',text:'Sorry I’m late. I went to the wrong hotel.',context:'Ты пришла на встречу в другой отель.',question:'How was your journey?',answer:'It was bad. There was a lot of traffic.'},
    {id:'sorry-dinner',text:'Sorry. I’m not hungry. I had dinner on the plane.',context:'Друг приготовил ужин, а ты уже поела в самолёте.',question:'How was the food?',answer:'It was good. I had pasta.'},
    {id:'sorry-room',text:'Sorry. Your room isn’t very big.',context:'Ты работаешь в отеле. Гостю досталась крошечная комната.',question:'How was your flight?',answer:'It was good, but I’m very tired.'},
    {id:'sorry-tired',text:'Sorry. I don’t want to go out. I did a lot yesterday. I’m very tired.',context:'Тебя зовут гулять, а ты хочешь только спать.',question:'How was your day?',answer:'It was busy. I did a lot of work.'}
  ],
  moods: ['Очень доброжелательно','Сонно, но вежливо','Радостно, как после хорошей новости'],
  guests: [
    {name:'The quiet traveller',text:'I have £50 for one night. I don’t want to share a room. I want a quiet place.',suggested:0,why:'Treehouse: £45, отдельная комната, тихо. Но лестница может изменить выбор.'},
    {name:'The social traveller',text:'I have £30 for one night. I want to talk to people. I love the beach.',suggested:1,why:'Beach Hostel: £20, общая комната, море. Но ночью может быть музыка.'},
    {name:'The city traveller',text:'I have £90 for one night. I want a room in the city. I want a swimming pool.',suggested:2,why:'Sky Hotel: £85, город, бассейн. Но завтрак не входит в цену.'}
  ],
  hotels: [
    {name:'Treehouse',type:'hotel in a forest',price:45,answers:['It’s quiet. There aren’t many people.','No. You have your own room.','Yes. Breakfast is at eight.'],secret:'There’s no lift. Your room is at the top of the stairs.',secretHelp:'no lift = нет лифта; stairs = лестница'},
    {name:'Beach Hostel',type:'hostel by the sea',price:20,answers:['Sometimes there’s music at night.','Yes. There are four beds in your room.','Yes. Breakfast is at nine.'],secret:'There’s a party tonight. The music stops at midnight.',secretHelp:'midnight = полночь'},
    {name:'Sky Hotel',type:'city hotel with a pool',price:85,answers:['There’s a busy street outside.','No. You have your own room.','No. Breakfast is £12.'],secret:'The pool is great, but breakfast is not included.',secretHelp:'not included = не входит в цену'}
  ],
  hotelQuestions:['Is it quiet?','Do I share a room?','Is breakfast included?'],
  reception: [
    {id:'desk-1',text:'Hello. Welcome to the Treehouse Hotel. How can I help you?',goal:'Назови имя и скажи, что у тебя есть бронь.',hint:'Hi. I have a booking. My name’s Mia Fox.'},
    {id:'desk-2',text:'Can I have your passport, please?',goal:'Передай воображаемый паспорт.',hint:'Sure. Here you are.'},
    {id:'desk-3',text:'Thank you. Your booking is for one night. Is that right?',goal:'Сверь с карточкой брони. Исправь ошибку.',hint:'No. Two nights, please.'},
    {id:'desk-4',text:'You’re right. Two nights. Here’s your key. Your room number is twelve. Do you have any questions?',goal:'Поблагодари и спроси, во сколько завтрак.',hint:'Thank you. What time is breakfast?'},
    {id:'desk-5',text:'Breakfast is at eight.',goal:'Узнай время выезда.',hint:'What time do I need to check out?'},
    {id:'desk-6',text:'Check out is at eleven. Is there anything else?',goal:'Спроси пароль от Wi-Fi.',hint:'What’s the password for the Wi-Fi?'},
    {id:'desk-7',text:'The password is Tree twelve. Enjoy your stay!',goal:'Повтори пароль для проверки и попрощайся.',hint:'Tree twelve? Thank you. Goodbye!'}
  ],
  storyHints:['I went to a treehouse hotel. My room was…','I had… There was a goat!','I went to… The weather was…','I was… I went to bed…'],
  twists:['В твоей истории отель был ужасным. Измени два факта.','Ты рассказываешь эту историю от имени козы. Начни: I had a great holiday!','Ты очень довольна поездкой, несмотря на дождь. Закончи: I loved it!','Добавь один неправдивый факт. Ася должна угадать его.'],
  model:'I went to a treehouse hotel. My room was small, but it was nice. I had pizza. There was a goat! I went to the beach. It rained a lot. I was tired, so I went to bed early. It was a very strange holiday. I loved it!'
};
