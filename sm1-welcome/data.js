/* Super Minds 1 Second Edition, SB printed pp. 4–5. See SOURCES.md. */
(function(root){
'use strict';
const heroes=['Thunder','Whisper','Flash','Misty'];
const ageOrder=['Misty','Whisper','Flash','Thunder'];
const words=['one','two','three','four','five','six','seven','eight','nine','ten'];
const ageKey=[6,8,8,7]; // Presentation Plus 475000: 6/Six, 8/Eight, 8/Eight, 7/Seven.
const tasks=[
 {id:'sb:welcome:p4:ex1:v1',page:4,exercise:1,title:'Наши герои',format:'picture-pointing-and-oral-marks',track:'01',original:'Listen and look. Then listen and say the words.',instruction:'Послушай запись и рассмотри героев. Нажми на того, чьё имя услышишь. Повтори имена и отметь тех, кого уже назвал.'},
 {id:'sb:welcome:p4:ex2:v1',page:4,exercise:2,title:'Чант',format:'role-cards-and-chant-marks',track:'02',original:'Listen and chant.',instruction:'Послушай чант. Выбери героя и произнеси его реплики вместе с записью. Затем поменяй роль. Можно заниматься с партнёром.'},
 {id:'sb:welcome:p5:ex1:v1',page:5,exercise:1,title:'Числа',format:'number-pointing',track:'03',original:'Listen and point to the numbers.',instruction:'Послушай запись. Нажимай на числа, которые слышишь, как будто показываешь на них пальцем в учебнике. Можно нажимать повторно.'},
 {id:'sb:welcome:p5:ex2:v1',page:5,exercise:2,title:'Сколько лет?',format:'number-card-gaps',track:'04',original:'How old are the Super Friends? Listen and write.',instruction:'Сколько лет героям? Послушай запись. Нажми на пропуск под героем, затем выбери число от 1 до 10. Печатать не нужно. Одно число можно использовать несколько раз.'},
 {id:'sb:welcome:p5:ex3:v1',page:5,exercise:3,title:'Знакомство',format:'question-cards-and-personal-marks',track:null,original:'Ask and answer.',instruction:'Задай партнёру оба вопроса и ответь о себе. Затем поменяйтесь ролями. Отмечай вопросы после разговора. Можно потренироваться вслух самостоятельно.'}
];
const chant={Whisper:['Hi, I’m Whisper.','What’s your name?','What a nice name!'],Thunder:['Hi, I’m Thunder.'],Flash:['Hi, I’m Flash.','What’s your name?','What a nice name!'],Misty:['Hi, I’m Misty.']};
const questions=[{question:'What’s your name?',model:'I’m Carlos.',cue:'I’m …'},{question:'How old are you?',model:'I’m six.',cue:'I’m …'}];
const empty=()=>({values:{},notes:'',results:[],done:false,feedback:''});
const normalize=value=>{const s=String(value??'').trim().toLowerCase();return /^\d+$/.test(s)?Number(s):words.indexOf(s)+1;};
const grade=values=>ageKey.map((key,i)=>String(values[i]??'').trim()===''?'blank':normalize(values[i])===key?'correct':'incorrect');
function ready(task,v){if(task===1||task===2)return heroes.every(h=>v[h]===true);if(task===3)return words.every((_,i)=>v[i+1]===true);if(task===5)return ['ask0','ask1','answer0','answer1'].every(k=>v[k]===true);return false;}
const data={heroes,ageOrder,words,ageKey,tasks,chant,questions,empty,normalize,grade,ready};
root.SM1Welcome=data;if(typeof module!=='undefined')module.exports=data;
})(typeof window==='undefined'?globalThis:window);
