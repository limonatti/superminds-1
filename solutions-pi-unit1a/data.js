/* Solutions Third Edition Pre-Intermediate, SB printed pp. 8–9, 1A ex. 1–5. */
(function(root){
'use strict';
const words=['anxious','ashamed','bored','confused','cross','delighted','disappointed','embarrassed','envious','excited','frightened','proud','relieved','shocked','suspicious','upset'];
const translations=['тревожный','испытывающий стыд','скучающий','растерянный','сердитый','очень довольный','разочарованный','смущённый','завидующий','радостно взволнованный','испуганный','гордый','испытывающий облегчение','потрясённый','подозревающий неладное','расстроенный'];
const photos=['A','B','C','D'];
const cues=[['watch','match','team','lose'],['exam results','pass','marks'],['plane','late','luggage'],['school work','difficult','boring']];
const quiz=[['anxious','delighted','shocked'],['bored','proud','suspicious'],['ashamed','embarrassed','excited'],['confused','cross','envious']];
// The printed key is upside down at the bottom of SB p. 9: 1a 2c 3c 4b.
const key=['anxious','suspicious','excited','cross'];
const tweets=[['Stella P','Jules has got that new phone that I really want …'],['Amy Price','There’s nothing to do here.'],['Student Voice','It’s our end-of-term party tonight!!'],['MaryGG','Our English teacher is away so we haven’t got a test :D'],['Music Mad','My new MP3 player doesn’t work.'],['Dan B','Oops! Dropped a plate of food in the school canteen …']];
const titles=['Опиши фотографии','Чувства и фотографии','Разложи слова','Прочитай эмоции','Хештеги'];
const instructions=[
 'Look at the photos and answer the questions. Use the words below to help you answer question 2.',
 'Check the meaning of all the adjectives below. Can you match any of them with the photos in exercise 1?',
 'Work in pairs. Put the adjectives in exercise 2 into categories A and B below. Do you know any other adjectives that you could add to the categories?',
 'In pairs, do the test below. Then check the answers at the bottom of the page. How many did you get right?',
 'Read the tweets and complete the hashtags with adjectives from exercise 2. Then compare answers in pairs. More than one answer may be possible.'
];
const empty=()=>({values:{},done:false,results:[],reveal:false,notes:''});
const grade=values=>key.map((answer,i)=>!values[i]?'blank':values[i]===answer?'correct':'incorrect');
const ready=(task,values)=>task===1?photos.every(p=>values[p]):task===3?words.every(w=>['A','B'].includes(values[w])):task===5?[1,2,3,4,5].every(i=>words.includes(values[i])):true;
const data={words,translations,photos,cues,quiz,key,tweets,titles,instructions,empty,grade,ready};
if(typeof module!=='undefined')module.exports=data;
root.SPI1A=data;
})(typeof window==='undefined'?globalThis:window);
