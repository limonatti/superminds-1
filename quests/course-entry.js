(function(root){
'use strict';
function card(q){
 const article=document.createElement('article');article.className='course-quest-entry';article.lang='en';article.dataset.quest=q.id;
 const image=document.createElement('img');image.src=q.image;image.alt='The gates of the Future Academy';image.loading='lazy';image.width=180;image.height=120;
 const text=document.createElement('div'),label=document.createElement('p'),title=document.createElement('h3'),description=document.createElement('p'),links=document.createElement('div');
 label.className='quest-context';label.textContent='After '+q.section;title.textContent=q.title;description.textContent=q.description;
 for(const [name,href]of [['Start quest →',q.web],['Open / print PDF ↗',q.pdf],['Download PDF ↓',q.pdf]]){const a=document.createElement('a');a.textContent=name;a.href=href;if(name.startsWith('Open')){a.target='_blank';a.rel='noopener';}if(name.startsWith('Download'))a.download='';links.append(a);}
 text.append(label,title,description,links);article.append(image,text);return article;
}
function mount({course,book,page,host=document}){
 host.querySelectorAll('.course-quest-entry').forEach(el=>el.remove());
 for(const q of root.QuestCatalog||[]){if(q.course!==course||q.book!==book)continue;
  const group=host.querySelector(`.cf-home-list>[data-cf-home-page="${q.afterPage}"]`);if(group)group.append(card(q));
  if(Number(page)===q.afterPage){const list=host.querySelector('#exerciseList');if(list)list.after(card(q));}
 }
}
root.CourseQuests={mount};
})(window);
