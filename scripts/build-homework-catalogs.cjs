/* Extract only real exercise identities and navigation from checked-in textbooks. */
const fs=require('node:fs'),vm=require('node:vm');
const load=(paths)=>{const window={};for(const p of paths)vm.runInNewContext(fs.readFileSync(p,'utf8'),{window});return window;};
const exact={'solutions-int':['SOLUTIONS','solutionsExercises'],'solutions-el':['SOLUTIONS_EL','solutionsExercises'],'focus-1':['FOCUS','focusExercises'],'focus-2':['FOCUS2','focusExercises'],'focus-3':['FOCUS3','focusExercises'],'focus-4':['FOCUS4','focusExercises']};
function write(course,items,key){if(new Set(items.map(e=>e.id)).size!==items.length)throw Error('Duplicate '+course);fs.writeFileSync('homework-catalog-'+course+'.json',JSON.stringify({course,key,items}));console.log(course,items.length);}
function url(course,params){return course+'-active-teach/index.html?'+new URLSearchParams(params);}
for(const [course,[global,key]] of Object.entries(exact)){
 const w=load([course+'-active-teach/assets/course.js']),d=w[global]||Object.values(w)[0];
 write(course,d.pages.flatMap(p=>p.exercises.map(e=>({id:e.id,unit:String(p.unit),book:p.book,page:p.page,section:p.title||p.bank||'Страницы юнита',label:e.label,prompt:(e.instructionText||e.text||'').replace(/\s+/g,' ').slice(0,140),href:url(course,{book:p.book,page:p.page,ex:e.id})}))),key);
}
for(const course of ['speakout-a1','speakout-b1','speakout-b1plus']){
 const d=load([course+'-active-teach/assets/'+(course==='speakout-a1'?'course-web.js':'course.js')]).COURSE;
 write(course,Object.entries(d.books).filter(([b])=>['sb','wb'].includes(b)).flatMap(([book,b])=>b.pages.flatMap(p=>p.exercises.map(e=>({id:`${book}:${p.page}:${e.label}`,unit:String(p.group||(/^\d+/.exec(p.lesson||'')?.[0])||(p.lesson==='Lead-in'?'0':'extra')),book,page:p.page,section:p.lesson||'Другие страницы',label:e.displayLabel||e.label,prompt:(e.text||'').replace(/\s+/g,' ').slice(0,140),href:url(course,{book,page:p.page,exercise:e.label})})))),'textbookExercises');
}
{
 const course='outcomes-beginner',w=load([course+'-active-teach/assets/course.js',course+'-active-teach/assets/exercises.js']),d=w.OUTCOMES;
 write(course,Object.entries(w.OUTCOMES_EXERCISES).flatMap(([pk,items])=>items.map(e=>{const[book,num]=pk.split(':'),p=d.books[book]?.pages.find(p=>p.id===+num);return {id:e.id,unit:String(e.unit||p?.unit||0),book:e.grammar?'grammar':book,page:e.page||p?.page,section:e.section||'Стр. '+(e.page||p?.page),label:String(e.n),prompt:(e.instruction||'').replace(/\s+/g,' ').slice(0,140),href:url(course,{book:e.grammar?'grammar':book,page:num,exercise:e.id})};})),'textbookExercises');
}
{
 const course='speakout-b2plus',w=load([course+'-active-teach/data/index.js',course+'-active-teach/data/exercises.js']);
 write(course,Object.entries(w.SPEAKOUT_EXERCISES).flatMap(([pk,items])=>items.map(e=>{const[book,sheet]=pk.split(':'),lesson=w.SPEAKOUT.lessons.find(l=>l.code===e.lesson);return {id:e.id,unit:String(lesson?.unit||'extra'),book,page:+sheet+(book==='sb'?1:2),sourcePage:pk,section:e.lesson||'Другие страницы',label:e.label,prompt:(e.text||'').replace(/\s+/g,' ').slice(0,140),href:url(course,{book,sheet,exercise:e.id})};})),'textbookExercises');
}
