#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Рабочие тетради к юниту 1 Solutions Elementary.

Плотность и типы заданий повторяют Workbook: на каждый урок 5–8 упражнений
разных форматов. Содержание авторское.

Запуск: python3 lessons/_wb_u1.py
"""
import json, os

WB = {}

WB["A"] = [
 {"type":"gap","title":"1 · Кто это?","sec":"wb-voc",
  "note":"Впиши название родственника одним словом.",
  "items":[
   {"q":"My son’s son is my ___ .","a":["grandson"]},
   {"q":"My dad’s brother is my ___ .","a":["uncle"]},
   {"q":"My mum’s father and mother are my ___ .","a":["grandparents"]},
   {"q":"My parents’ daughter is my ___ .","a":["sister"]},
   {"q":"My father’s father is my ___ .","a":["grandfather","grandad"]},
   {"q":"My father’s sister’s children are my ___ .","a":["cousins"]},
   {"q":"My brother’s daughter is my ___ .","a":["niece"]},
   {"q":"My daughter’s daughter is my ___ .","a":["granddaughter"]},
   {"q":"My sister’s son is my ___ .","a":["nephew"]}]},

 {"type":"gap","title":"2 · Родство через брак","sec":"wb-voc",
  "note":"Здесь нужны step-, half- и -in-law.",
  "items":[
   {"q":"My mother’s new husband is my ___ .","a":["stepfather"]},
   {"q":"My sister’s husband is my ___ .","a":["brother-in-law"]},
   {"q":"My son’s wife is my ___ .","a":["daughter-in-law"]},
   {"q":"My father’s wife’s daughter is my ___ .","a":["stepsister"]},
   {"q":"My brother and I have got the same mum but different dads. He is my ___ .","a":["half-brother"]},
   {"q":"My grandmother’s mother is my ___ .","a":["great-grandmother"]}]},

 {"type":"mc","title":"3 · Где апостроф?","sec":"wb-gram",
  "items":[
   {"q":"Дом моих бабушки и дедушки:","o":["my grandparents’ house","my grandparent’s house","my grandparents house"],"a":0},
   {"q":"Собака детей:","o":["the children’s dog","the childrens’ dog","the childrens dog"],"a":0},
   {"q":"Машина сестры моей жены:","o":["my wife’s sister’s car","my wifes’ sister’s car","my wife’s sisters car"],"a":0},
   {"q":"Мама моего племянника:","o":["my nephew’s mother","my nephews’ mother","my nephews mother"],"a":0},
   {"q":"Комната моих двух братьев:","o":["my brothers’ room","my brother’s room","my brothers room"],"a":0},
   {"q":"Работа Джеймса:","o":["James’s job","Jame’s job","Jamess job"],"a":0}]},

 {"type":"mc","title":"4 · Какое предложение верное?","sec":"wb-gram",
  "items":[
   {"q":"Выбери верное:","o":["My children’s school is near my parents’ house.","My childrens’ school is near my parent’s house.","My children school is near my parents house."],"a":0},
   {"q":"Выбери верное:","o":["That is my wife’s sister’s car.","That is my wifes’ sister’s car.","That is my wife’s sisters car."],"a":0},
   {"q":"Выбери верное:","o":["My nephew’s mother is my brother’s wife.","My nephews’ mother is my brothers wife.","My nephew mother is my brother wife."],"a":0}]},

 {"type":"note","title":"5 · Семейное древо",
  "html":"<b>Поколение 1:</b> Rob и Ellie — женаты.<br>"
         "<b>Поколение 2:</b> их дети — Sam, Joanna и Mark. Joanna замужем за Andy. "
         "Mark женат на Anna.<br>"
         "<b>Поколение 3:</b> у Joanna и Andy — Lucy и Zak. У Mark и Anna — Ben.<br><br>"
         "Смотри на древо и отвечай в упражнении ниже."},

 {"type":"gap","title":"6 · Кто кому кто по древу","sec":"wb-voc",
  "items":[
   {"q":"Mark is Joanna’s ___ .","a":["brother"]},
   {"q":"Ben is Lucy’s ___ .","a":["cousin"]},
   {"q":"Rob is Zak’s ___ .","a":["grandfather","grandad"]},
   {"q":"Anna is Ben’s ___ .","a":["mother","mum"]},
   {"q":"Lucy is Ellie’s ___ .","a":["granddaughter"]},
   {"q":"Andy is Rob’s ___ .","a":["son-in-law"]},
   {"q":"Ben is Joanna’s ___ .","a":["nephew"]},
   {"q":"Sam is Zak’s ___ .","a":["uncle"]},
   {"q":"Anna is Ellie’s ___ .","a":["daughter-in-law"]},
   {"q":"Lucy and Zak are Rob and Ellie’s ___ .","a":["grandchildren"]}]},

 {"type":"listen","title":"7 · Послушай и ответь","h3":"Whose photo is this?",
  "intro":"Короткий диалог. Кликни на реплику, чтобы слушать с неё.",
  "script":[["f","Is this your family, Lucy?","Ben"],
            ["f2","Yes! That’s me on the left, next to my brother Zak.","Lucy"],
            ["f","And who’s the man with the beard?","Ben"],
            ["f2","That’s my dad, Andy. And the woman next to him is my mum, Joanna.","Lucy"],
            ["f","So your mum is my dad’s sister.","Ben"],
            ["f2","Exactly. That makes us cousins!","Lucy"]],
  "q":[{"q":"Who is talking to Lucy?","o":["her cousin Ben","her brother Zak","her uncle Sam"],"a":0},
       {"q":"Who has got a beard?","o":["Andy","Zak","Rob"],"a":0},
       {"q":"Joanna is Ben’s…","o":["aunt","mother","grandmother"],"a":0},
       {"q":"How many people are in the photo?","o":["four","three","five"],"a":0}]},

 {"type":"free","title":"8 · Напиши о своей семье",
  "html":"Напиши <b>три предложения</b> о членах своей семьи. В каждом используй "
         "притяжательный ’s или have got.<br><br><i>Образец: I’ve got a sister. "
         "Her name is Olivia. My sister’s room is next to mine.</i>"}]

WB["B"] = [
 {"type":"gap","title":"1 · Формы третьего лица","sec":"wb-gram",
  "note":"Напиши форму he / she / it.",
  "items":[
   {"q":"enjoy → he ___","a":["enjoys"]},{"q":"have → she ___","a":["has"]},
   {"q":"finish → it ___","a":["finishes"]},{"q":"study → he ___","a":["studies"]},
   {"q":"know → she ___","a":["knows"]},{"q":"go → he ___","a":["goes"]},
   {"q":"use → she ___","a":["uses"]},{"q":"watch → he ___","a":["watches"]},
   {"q":"fly → it ___","a":["flies"]},{"q":"do → she ___","a":["does"]}]},

 {"type":"gap","title":"2 · Поставь форму из упражнения 1","sec":"wb-gram",
  "items":[
   {"q":"My uncle is from Paris and he ___ the city really well.","a":["knows"]},
   {"q":"My brother ___ to a music club every Monday.","a":["goes"]},
   {"q":"My little sister ___ a computer for her homework.","a":["uses"]},
   {"q":"This lesson ___ at 3.05 p.m.","a":["finishes"]},
   {"q":"My grandad ___ TV every evening.","a":["watches"]},
   {"q":"Our dog really ___ his walks.","a":["enjoys"]},
   {"q":"My best friend ___ at university in Istanbul.","a":["studies"]},
   {"q":"My cousin ___ two brothers.","a":["has"]}]},

 {"type":"cloze","title":"3 · Заполни рассказ","sec":"wb-cloze",
  "note":"Поставь глагол в скобках в present simple.",
  "parts":["Marek ",{"a":["lives"],"hint":"live"}," in Kraków with his family. He ",
           {"a":["goes"],"hint":"go"}," to school by tram every morning. His sister Ela ",
           {"a":["studies"],"hint":"study"}," biology at university, so she ",
           {"a":["has"],"hint":"have"}," lectures every day. Their mum ",
           {"a":["works"],"hint":"work"}," in a bookshop and their dad ",
           {"a":["teaches"],"hint":"teach"}," maths. On Friday evenings the family ",
           {"a":["watches"],"hint":"watch"}," a sitcom together and Marek always ",
           {"a":["makes"],"hint":"make"}," the popcorn."]},

 {"type":"cloze","title":"4 · Ещё один рассказ","sec":"wb-cloze",
  "parts":["I’m from Perth, in Australia. My family and I ",
           {"a":["live"],"hint":"live"}," near the sea. In summer I ",
           {"a":["go"],"hint":"go"}," to the beach every day and I ",
           {"a":["swim"],"hint":"swim"}," before breakfast. My brother ",
           {"a":["plays"],"hint":"play"}," cricket for the juniors and he ",
           {"a":["trains"],"hint":"train"}," three times a week. My grandmother ",
           {"a":["lives"],"hint":"live"}," in the same street and she ",
           {"a":["visits"],"hint":"visit"}," us every day."]},

 {"type":"mc","title":"5 · Выбери верную форму","sec":"wb-gram",
  "items":[
   {"q":"My mum ___ the dishes every evening.","o":["washes","washs","wash"],"a":0},
   {"q":"He ___ his homework after school.","o":["does","do","dos"],"a":0},
   {"q":"They ___ in a small village.","o":["live","lives","living"],"a":0},
   {"q":"Water ___ at 100 degrees.","o":["boils","boil","boiles"],"a":0},
   {"q":"My aunt ___ to Spain every summer.","o":["flies","flys","fly"],"a":0},
   {"q":"She ___ always late for the bus.","o":["is","are","be"],"a":0}]},

 {"type":"free","title":"6 · Напиши о себе",
  "html":"Напиши <b>короткое сообщение о себе</b> (5–6 предложений) по образцу "
         "упражнений 3 и 4: где живёшь, с кем, что делаешь каждый день, "
         "чем занимаются твои близкие. Следи за <b>-s</b> в третьем лице."}]

WB["C"] = [
 {"type":"gap","title":"1 · Домашние дела","sec":"wb-voc",
  "note":"Впиши глагол: clean · cook · do · go · load · set · tidy · make · take",
  "items":[
   {"q":"___ my bedroom (убирать)","a":["tidy"]},
   {"q":"___ dinner (готовить)","a":["cook"]},
   {"q":"___ the washing (стирать)","a":["do"]},
   {"q":"___ to the supermarket (ходить)","a":["go"]},
   {"q":"___ the table (накрывать)","a":["set"]},
   {"q":"___ the dishwasher (загружать)","a":["load"]},
   {"q":"___ the house (убирать)","a":["clean"]},
   {"q":"___ the ironing (гладить)","a":["do"]},
   {"q":"___ my bed (заправлять)","a":["make"]},
   {"q":"___ out the rubbish (выносить)","a":["take"]}]},

 {"type":"sort","title":"2 · Разложи по звуку","sec":"wb-sound",
  "note":"Нажми на слово, потом на нужную колонку. Ориентируйся на звук, а не на написание.",
  "groups":[{"label":"как в school /uː/","words":["cool","June","pool","music"]},
            {"label":"как в foot /ʊ/","words":["good","book","look","put"]},
            {"label":"как в bus /ʌ/","words":["run","month","mother","much"]}],
  "words":["cool","June","pool","music","good","book","look","put","run","month","mother","much"]},

 {"type":"mc","title":"3 · Найди лишнее по гласному","sec":"wb-sound",
  "items":[
   {"q":"a book · b look · c good · d food","o":["food","book","good"],"a":0},
   {"q":"a car · b cat · c bag · d am","o":["car","cat","bag"],"a":0},
   {"q":"a big · b sit · c child · d is","o":["child","big","sit"],"a":0},
   {"q":"a one · b phone · c come · d love","o":["phone","one","come"],"a":0},
   {"q":"a ruler · b student · c computer · d Sunday","o":["Sunday","ruler","student"],"a":0}]},

 {"type":"mc","title":"4 · Какое слово подходит по смыслу?","sec":"wb-sound",
  "note":"Слова звучат похоже — помогает контекст.",
  "items":[
   {"q":"I’d like bread ___ cheese, please.","o":["and","end"],"a":0},
   {"q":"There’s a football ___ on Saturday.","o":["match","much"],"a":0},
   {"q":"Can you ___ the door, please?","o":["shut","shot"],"a":0},
   {"q":"Please ___ me help you.","o":["let","late"],"a":0},
   {"q":"What do you want to ___ for lunch?","o":["eat","it"],"a":0},
   {"q":"My birthday is in ___ .","o":["March","match"],"a":0}]},

 {"type":"listen","title":"5 · Послушай и отметь","h3":"Anna and the dishwasher",
  "intro":"Кликни на реплику, чтобы слушать с неё.",
  "script":[["f","Anna, can you unload the dishwasher, please?","Mum"],
            ["f2","Again? I did it yesterday. Why can’t Tom do it?","Anna"],
            ["f","Tom loads it every evening. That’s his job.","Mum"],
            ["f2","But he never tidies his room. It’s a disaster in there.","Anna"],
            ["f","That’s a different argument. Come on, it takes four minutes.","Mum"],
            ["f2","Fine. But then can you help me with my maths?","Anna"],
            ["f","Maths? Ask your father, love. I’m hopeless at it.","Mum"],
            ["f2","Where is he?","Anna"],
            ["f","At the supermarket with Tom. They’ll be back soon.","Mum"]],
  "q":[{"q":"What does Mum ask Anna to do?","o":["unload the dishwasher","cook dinner","do the ironing"],"a":0},
       {"q":"What is Tom’s job?","o":["loading the dishwasher","tidying the kitchen","the washing"],"a":0},
       {"q":"Who is good at maths?","o":["Anna’s father","Anna’s mum","Tom"],"a":0},
       {"q":"Where is Tom now?","o":["at the supermarket","in his room","at school"],"a":0}]},

 {"type":"tf","title":"6 · True or False","sec":"wb-tf",
  "items":[{"q":"Anna is happy to unload the dishwasher.","a":False},
           {"q":"Tom loads the dishwasher every evening.","a":True},
           {"q":"Anna thinks her brother isn’t tidy.","a":True},
           {"q":"Anna’s mum wants her to cook dinner.","a":False},
           {"q":"Anna’s mum can’t help her with maths.","a":True},
           {"q":"Tom isn’t at home.","a":True}]},

 {"type":"mc","title":"7 · Одинаковый звук или разный?","sec":"wb-sound",
  "items":[
   {"q":"pl<u>ea</u>se — cl<u>ea</u>n","o":["одинаковый","разный"],"a":0},
   {"q":"unl<u>oa</u>d — s<u>u</u>permarket","o":["разный","одинаковый"],"a":0},
   {"q":"bedr<u>oo</u>m — c<u>oo</u>k","o":["разный","одинаковый"],"a":0},
   {"q":"b<u>a</u>throom — m<u>a</u>ths","o":["одинаковый","разный"],"a":0},
   {"q":"n<u>i</u>ce — t<u>i</u>red","o":["одинаковый","разный"],"a":0},
   {"q":"m<u>o</u>ther — br<u>o</u>ther","o":["одинаковый","разный"],"a":0}]}]

WB["D"] = [
 {"type":"gap","title":"1 · Составь предложение","sec":"wb-gram",
  "note":"Впиши предложение целиком, слова в правильном порядке.",
  "items":[
   {"q":"doesn’t / Tom / like / ice cream","a":["tom doesn't like ice cream","tom doesn’t like ice cream"]},
   {"q":"geography / at school / study / we / don’t","a":["we don't study geography at school","we don’t study geography at school"]},
   {"q":"work / don’t / my parents / at the weekend","a":["my parents don't work at the weekend","my parents don’t work at the weekend"]},
   {"q":"the piano / doesn’t / Josh / play","a":["josh doesn't play the piano","josh doesn’t play the piano"]},
   {"q":"from / doesn’t / Manuela / Spain / come","a":["manuela doesn't come from spain","manuela doesn’t come from spain"]}]},

 {"type":"gap","title":"2 · Поставь в отрицание","sec":"wb-gram",
  "items":[
   {"q":"We ___ in London. (not live)","a":["don't live","don’t live"]},
   {"q":"I’m sorry, I ___ this word. (not understand)","a":["don't understand","don’t understand"]},
   {"q":"David ___ TV in his bedroom. (not watch)","a":["doesn't watch","doesn’t watch"]},
   {"q":"My parents ___ in an office. (not work)","a":["don't work","don’t work"]},
   {"q":"Sally ___ her bike to school. (not ride)","a":["doesn't ride","doesn’t ride"]},
   {"q":"Sam and Ben ___ ice hockey. (not play)","a":["don't play","don’t play"]}]},

 {"type":"gap","title":"3 · Утверждение или отрицание?","sec":"wb-gram",
  "note":"Глаголы: argue · know · like · listen · play · sing · walk · do",
  "items":[
   {"q":"«What’s the capital of Peru?» «Sorry, I ___ .»","a":["don't know","don’t know"]},
   {"q":"I haven’t got a bike. I ___ to school every day.","a":["walk"]},
   {"q":"I ___ geography and history. They’re really interesting.","a":["like"]},
   {"q":"I like my sister, but I sometimes ___ with her.","a":["argue"]},
   {"q":"Emma ___ the washing, but she does the ironing.","a":["doesn't do","doesn’t do"]},
   {"q":"My brother ___ in a band — he’s a drummer, not a singer.","a":["doesn't sing","doesn’t sing"]}]},

 {"type":"gap","title":"4 · Вопрос и короткий ответ","sec":"wb-gram",
  "items":[
   {"q":"___ Harry work in London? — Yes, he ___ . (два слова через пробел)","a":["does does"]},
   {"q":"___ Mario and Helen live in Paris? — Yes, they ___ .","a":["do do"]},
   {"q":"___ you do the ironing? — Yes, I ___ .","a":["do do"]},
   {"q":"___ you go to the supermarket on Saturdays? — No, I ___ .","a":["do don't","do don’t"]},
   {"q":"___ Catherine sing in a band? — No, she ___ .","a":["does doesn't","does doesn’t"]}]},

 {"type":"gap","title":"5 · Собери вопрос","sec":"wb-gram",
  "items":[
   {"q":"best friend / Arabic / speak / does / your","a":["does your best friend speak arabic"]},
   {"q":"get up / you / on Sundays / do / early","a":["do you get up early on sundays"]},
   {"q":"wash / does / the dishes / your dad","a":["does your dad wash the dishes"]}]},

 {"type":"free","title":"6 · Ответь честно",
  "html":"Ответь на три вопроса из упражнения 5 <b>полными предложениями</b> о себе. "
         "Если ответ «нет» — используй don’t или doesn’t.<br><br>"
         "<i>Образец: No, my best friend doesn’t speak Arabic. He speaks Turkish.</i>"}]

WB["E"] = [
 {"type":"gap","title":"1 · Правила множественного числа","sec":"wb-gram",
  "note":"Впиши окончание: -s · -es · -ies · -ves",
  "items":[
   {"q":"Большинство существительных: singer → singer___","a":["-s","s"]},
   {"q":"После -s, -sh, -ch, -z, -x: box → box___","a":["-es","es"]},
   {"q":"Согласная + y: baby → bab___","a":["-ies","ies"]},
   {"q":"Гласная + y: day → day___","a":["-s","s"]},
   {"q":"-f / -fe: knife → kni___","a":["-ves","ves"]},
   {"q":"После -o чаще всего: photo → photo___","a":["-s","s"]}]},

 {"type":"mc","title":"2 · По какому правилу?","sec":"wb-gram",
  "items":[
   {"q":"dictionary →","o":["согласная + y → -ies","гласная + y → -s","-f / -fe → -ves"],"a":0},
   {"q":"day →","o":["гласная + y → -s","согласная + y → -ies","после -o"],"a":0},
   {"q":"knife →","o":["-f / -fe → -ves","обычное -s","после шипящих -es"],"a":0},
   {"q":"box →","o":["после -s, -sh, -ch, -z, -x → -es","обычное -s","-f / -fe → -ves"],"a":0},
   {"q":"potato →","o":["после -o → -es","гласная + y → -s","-f / -fe → -ves"],"a":0},
   {"q":"brother →","o":["обычное -s","согласная + y → -ies","после -o"],"a":0}]},

 {"type":"gap","title":"3 · Впиши множественное число","sec":"wb-gram",
  "items":[
   {"q":"There are seven ___ in a week. (day)","a":["days"]},
   {"q":"We’ve got fifteen English ___ on the shelf. (dictionary)","a":["dictionaries"]},
   {"q":"I’ve got a sister and two ___ . (brother)","a":["brothers"]},
   {"q":"I keep my CDs in two ___ under my bed. (box)","a":["boxes"]},
   {"q":"Let’s have steak and ___ for dinner. (potato)","a":["potatoes"]},
   {"q":"Can you put the ___ and forks on the table? (knife)","a":["knives"]}]},

 {"type":"sort","title":"4 · Разложи по типу","sec":"wb-gram",
  "note":"Нажми на слово, потом на нужную колонку.",
  "groups":[{"label":"неправильное мн. ч.","words":["children","teeth","people","mice"]},
            {"label":"всегда множественное","words":["scissors","jeans","trousers","sunglasses"]},
            {"label":"неисчисляемое","words":["information","advice","homework","luggage"]}],
  "words":["children","teeth","people","mice","scissors","jeans","trousers","sunglasses",
           "information","advice","homework","luggage"]},

 {"type":"gap","title":"5 · Впиши слово в нужной форме","sec":"wb-gram",
  "note":"Слова: help · jeans · man · sunglasses · tooth · water",
  "items":[
   {"q":"My ___ are too tight — I need a bigger size.","a":["jeans"]},
   {"q":"Three ___ are waiting outside the shop.","a":["men"]},
   {"q":"I brush my ___ twice a day.","a":["teeth"]},
   {"q":"Can I have a glass of ___ , please?","a":["water"]},
   {"q":"Thanks for your ___ with my homework.","a":["help"]},
   {"q":"Where are my ___ ? It’s so bright today.","a":["sunglasses"]}]},

 {"type":"mc","title":"6 · Найди ошибку","sec":"wb-gram",
  "items":[
   {"q":"Какое предложение верное?","o":["My jeans are very old.","My jeans is very old.","My jean are very old."],"a":0},
   {"q":"Какое предложение верное?","o":["I’d like some information about trains.","I’d like some informations about trains.","I’d like an information about trains."],"a":0},
   {"q":"Какое предложение верное?","o":["She gave me some good advice.","She gave me some good advices.","She gave me a good advice."],"a":0},
   {"q":"Какое предложение верное?","o":["How many people are in your class?","How many peoples are in your class?","How many persons are in your class?"],"a":0}]}]

WB["F"] = [
 {"type":"gap","title":"1 · Впиши предлог","sec":"wb-voc",
  "note":"Предлоги: about · at · from · in · of · on · to · with",
  "items":[
   {"q":"Is the teacher angry ___ your homework?","a":["about"]},
   {"q":"My brother is really good ___ maths.","a":["at"]},
   {"q":"We aren’t very keen ___ cold beaches.","a":["on"]},
   {"q":"My sister is very proud ___ her exam results.","a":["of"]},
   {"q":"I’m not very interested ___ sport.","a":["in"]},
   {"q":"Are you keen ___ music?","a":["on"]},
   {"q":"Jake is very different ___ his father.","a":["from"]},
   {"q":"Please be nice ___ your little cousin.","a":["to"]},
   {"q":"Are you pleased ___ your new bike?","a":["with"]},
   {"q":"My aunt is married ___ a musician.","a":["to"]}]},

 {"type":"read","title":"2 · Текст с пропусками","h3":"The sibling effect","sec":"wb-read",
  "html":"<p><b>[1]</b> We don’t always get on well with our brothers and sisters — but "
         "we get a lot from them. Research shows that siblings have a big effect on our "
         "personalities, and in general it’s a good effect.</p>"
         "<p><b>[2]</b> When you’re young, you argue with your brothers and sisters. "
         "<b>[A] ___</b> You learn to defend your opinion, to say sorry and to share. "
         "According to research, you don’t get these skills from friends — only from siblings.</p>"
         "<p><b>[3]</b> A big brother or sister is also an advantage at school. "
         "<b>[B] ___</b> They explain things you don’t understand and they know which "
         "teachers are strict.</p>"
         "<p><b>[4]</b> And sisters? <b>[C] ___</b> Research suggests that boys with sisters "
         "are better at talking about feelings — and better at talking to girls.</p>"
         "<p><b>[5]</b> Step-brothers and step-sisters come later, and the relationship is "
         "different. <b>[D] ___</b> But after a few years, most of them say it works.</p>",
  "q":[{"q":"Пропуск [A]","o":["Nobody is keen on arguments, but they can be a good thing.","This is because they help you with homework.","Do they offer the same advantages?"],"a":0},
       {"q":"Пропуск [B]","o":["This is because they help you with homework.","Boys with sisters are also good at talking to girls.","It’s part of life."],"a":0},
       {"q":"Пропуск [C]","o":["Do they offer the same advantages?","Research shows siblings change our personalities.","You learn to share."],"a":0},
       {"q":"Пропуск [D]","o":["At first it isn’t easy for anybody.","They explain things you don’t understand.","You argue when you are young."],"a":0}]},

 {"type":"mc","title":"3 · Подбери заголовок к абзацу","sec":"wb-read",
  "items":[
   {"q":"Абзац 1","o":["Introduction","Girl power","Step-siblings"],"a":0},
   {"q":"Абзац 2","o":["Learning important skills","Educational advantages","Introduction"],"a":0},
   {"q":"Абзац 3","o":["Educational advantages","Step-siblings","Girl power"],"a":0},
   {"q":"Абзац 4","o":["Girl power","Introduction","Learning important skills"],"a":0},
   {"q":"Абзац 5","o":["Step-siblings","Educational advantages","Girl power"],"a":0}]},

 {"type":"mc","title":"4 · Понимание","sec":"wb-read",
  "items":[
   {"q":"Согласно тексту, навыки спора приходят…","o":["только от братьев и сестёр","от друзей","от учителей"],"a":0},
   {"q":"Старший брат или сестра помогают…","o":["в учёбе","с деньгами","со спортом"],"a":0},
   {"q":"Мальчики с сёстрами лучше…","o":["говорят о чувствах","играют в футбол","учат языки"],"a":0}]}]

WB["G"] = [
 {"type":"cloze","title":"1 · Опиши человека на фото","sec":"wb-cloze",
  "note":"Слова: beard · dark · fair · glasses · moustache · short",
  "parts":["Фото A: He’s got ",{"a":["short"],"hint":"длина"}," , ",
           {"a":["dark"],"hint":"цвет"}," hair and ",{"a":["glasses"],"hint":"на лице"},
           " . Фото B: He’s got ",{"a":["fair"],"hint":"цвет"}," hair, a ",
           {"a":["beard"],"hint":"на подбородке"}," and a ",
           {"a":["moustache"],"hint":"над губой"}," ."]},

 {"type":"mc","title":"2 · be или have got?","sec":"wb-gram",
  "items":[
   {"q":"She ___ tall and slim.","o":["is","has got","have"],"a":0},
   {"q":"He ___ green eyes.","o":["has got","is","are"],"a":0},
   {"q":"They ___ curly hair.","o":["have got","are","is"],"a":0},
   {"q":"My brother ___ quite shy.","o":["is","has got","have got"],"a":0},
   {"q":"Kate ___ freckles.","o":["has got","is","are"],"a":0},
   {"q":"We ___ medium height.","o":["are","have got","has"],"a":0}]},

 {"type":"listen","title":"3 · Кто есть кто","h3":"Four people at the party",
  "intro":"Послушай и определи, о ком речь.",
  "script":[["f","Who’s the girl with the long red hair?","Zoe"],
            ["m","That’s Camilla. She’s in my English class — very talkative.","Marcus"],
            ["f","And the boy next to her, the tall one?","Zoe"],
            ["m","George. He’s wearing glasses and a green jumper. He’s quite shy.","Marcus"],
            ["f","There are two boys by the door.","Zoe"],
            ["m","The one with the beard is my brother. The other one is his friend.","Marcus"]],
  "q":[{"q":"Camilla has got…","o":["long red hair","short fair hair","curly dark hair"],"a":0},
       {"q":"What is George wearing?","o":["glasses and a green jumper","a black jacket","a red T-shirt"],"a":0},
       {"q":"What is George like?","o":["quite shy","very talkative","unfriendly"],"a":0},
       {"q":"Who has got a beard?","o":["Marcus’s brother","George","Camilla’s friend"],"a":0}]},

 {"type":"gap","title":"4 · Где кто стоит","sec":"wb-voc",
  "note":"Предлоги места: next to · between · behind · in front of · on the left · on the right",
  "items":[
   {"q":"Camilla is standing ___ to George. (рядом)","a":["next"]},
   {"q":"George is ___ Camilla and the door. (между)","a":["between"]},
   {"q":"The two boys are ___ the door. (перед)","a":["in front of"]},
   {"q":"Marcus is on the ___ of the photo. (слева)","a":["left"]}]},

 {"type":"free","title":"5 · Опиши четверых",
  "html":"Представь фотографию с четырьмя людьми: <b>Max, Amy, Charlotte, Ollie</b>.<br><br>"
         "Опиши каждого — <b>внешность</b> (волосы, лицо, одежда) и <b>место</b> "
         "(next to…, between…, on the left…). По два предложения на человека.<br><br>"
         "<i>Образец: Amy is on the left. She’s got long wavy hair and she’s wearing "
         "a yellow dress. She’s standing next to Max.</i>"}]

WB["H"] = [
 {"type":"gap","title":"1 · Восстанови прилагательное","sec":"wb-voc",
  "note":"Пропущены гласные.",
  "items":[
   {"q":"cr__t__v__ (творческий)","a":["creative"]},
   {"q":"fr__ndly (дружелюбный)","a":["friendly"]},
   {"q":"h__rd-w__rk__ng (трудолюбивый)","a":["hard-working"]},
   {"q":"h__n__st (честный)","a":["honest"]},
   {"q":"p__t__nt (терпеливый)","a":["patient"]},
   {"q":"p__l__t__ (вежливый)","a":["polite"]},
   {"q":"s__ns__bl__ (здравомыслящий)","a":["sensible"]}]},

 {"type":"gap","title":"2 · Перепиши с сокращениями","sec":"wb-gram",
  "items":[
   {"q":"My name is Megan and I am sixteen. → My name___ Megan and I___ sixteen. (два сокращения через пробел)","a":["'s 'm","’s ’m"]},
   {"q":"My dad is not English. → My dad ___ English.","a":["isn't","isn’t"]},
   {"q":"I have got two brothers. → ___ got two brothers.","a":["I've","I’ve"]},
   {"q":"They are ten and twelve. → ___ ten and twelve.","a":["They're","They’re"]},
   {"q":"We have got two dogs. → ___ got two dogs.","a":["We've","We’ve"]},
   {"q":"She does not like maths. → She ___ like maths.","a":["doesn't","doesn’t"]}]},

 {"type":"mc","title":"3 · Что можно сократить?","sec":"wb-gram",
  "note":"В личном профиле полные формы звучат сухо.",
  "items":[
   {"q":"«They are twelve and fourteen.»","o":["They’re","Theyre","They´are"],"a":0},
   {"q":"«It is a large school.»","o":["It’s","Its","It´s"],"a":0},
   {"q":"«I am in Year eleven.»","o":["I’m","Im","I´am"],"a":0}]},

 {"type":"sort","title":"4 · План профиля по абзацам","sec":"wb-plan",
  "note":"Разложи пункты по абзацам будущего профиля.",
  "groups":[{"label":"1 · Дом и семья","words":["two brothers","pet dog"]},
            {"label":"2 · Школа","words":["Westford School","Year 11"]},
            {"label":"3 · Хобби","words":["football and rugby","listen to music"]},
            {"label":"4 · Мечта","words":["become a doctor","travel around the world"]}],
  "words":["two brothers","pet dog","Westford School","Year 11",
           "football and rugby","listen to music","become a doctor","travel around the world"]},

 {"type":"mc","title":"5 · Абзацы","sec":"wb-plan",
  "items":[
   {"q":"Сколько предложений минимум в абзаце?","o":["два","одно","четыре"],"a":0},
   {"q":"Новый абзац начинают, когда…","o":["меняется тема","строка закончилась","прошло три предложения"],"a":0},
   {"q":"Что лишнее в абзаце про школу?","o":["I’ve got a pet dog.","My favourite subject is art.","Our school is quite small."],"a":0}]},

 {"type":"free","title":"6 · Напиши профиль",
  "html":"Напиши <b>личный профиль о себе</b> для школьного сайта — <b>100–130 слов, "
         "четыре абзаца</b> по плану из упражнения 4.<br><br>"
         "<b>Проверь перед сдачей:</b><br>"
         "• Везде ли сокращения (I’m, I’ve got, don’t)?<br>"
         "• Четыре абзаца, каждый об одном?<br>"
         "• Два-три прилагательных характера про себя?<br>"
         "• Present simple: третье лицо с <b>-s</b>?<br>"
         "• Заглавные буквы у имён, стран и языков?"}]


if __name__ == "__main__":
    p = os.path.join(os.path.dirname(__file__), "solutions-el-u1.json")
    d = json.load(open(p, encoding="utf-8"))
    for L, blocks in WB.items():
        d["lessons"][L]["workbook"] = blocks
        # убираем старый бедный блок wb из самого урока
        d["lessons"][L]["blocks"] = [b for b in d["lessons"][L]["blocks"] if b.get("type") != "wb"]
    json.dump(d, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    for L in sorted(WB):
        n = sum(len(b.get("items", b.get("q", b.get("words", b.get("parts", []))))) for b in WB[L])
        print("  1%s: упражнений %d, заданий ~%d" % (L, len(WB[L]), n))
