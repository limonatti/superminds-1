(function(root){
'use strict';
function card(q){
 const article=document.createElement('article');article.className='course-quest-entry';article.lang='en';article.dataset.quest=q.id;
 const image=document.createElement('img');image.src=q.image;image.alt=q.imageAlt||'Illustrated scenes from '+q.title;image.loading='lazy';image.width=180;image.height=120;
 const text=document.createElement('div'),label=document.createElement('p'),title=document.createElement('h3'),description=document.createElement('p'),links=document.createElement('div');
 label.className='quest-context';label.textContent='After '+q.section;title.textContent=q.title;description.textContent=q.description;
 for(const [name,href]of [['Start quest →',q.web],['Open / print PDF ↗',q.pdf],['Download PDF ↓',q.pdf]]){const a=document.createElement('a');a.textContent=name;a.href=href;if(name.startsWith('Open')){a.target='_blank';a.rel='noopener';}if(name.startsWith('Download'))a.download='';links.append(a);}
 text.append(label,title,description,links);article.append(image,text);return article;
}
function mount({course,book,page,host=document}){
 host.querySelectorAll('.course-quest-entry').forEach(el=>el.remove());
 host.querySelectorAll('.course-quest-shortcuts').forEach(el=>el.remove());
 const home=host.querySelector('.cf-home'),intro=home?.querySelector('.cf-home-intro');
 const currentUnit=host.querySelector('[data-cf-unit]')?.value;
 const available=(root.QuestCatalog||[]).filter(q=>q.course===course&&q.book===book&&String(q.unit)===String(currentUnit));
 if(intro&&available.length){
  const nav=document.createElement('nav');nav.className='course-quest-shortcuts';nav.lang='en';nav.setAttribute('aria-label','Quests for this unit');
  for(const q of available){const row=document.createElement('div'),label=document.createElement('span');label.textContent=q.title+' · '+(q.scope==='unit'?'After the complete Unit '+q.unit:'After Unit '+q.section.split(' · ')[0]);row.append(label);
   const play=document.createElement('a');play.href=q.web;play.textContent='Start quest →';play.setAttribute('aria-label','Start '+q.title);
   const pdf=document.createElement('a');pdf.href=q.pdf;pdf.textContent='Open / print PDF ↗';pdf.target='_blank';pdf.rel='noopener';pdf.setAttribute('aria-label','Open or print '+q.title+' PDF');row.append(play,pdf);nav.append(row);}
  intro.after(nav);
 }
 for(const q of root.QuestCatalog||[]){if(q.course!==course||q.book!==book)continue;
  // A reading spread can end on a text-only page, omitted from the exercise
  // list. Anchor to its last actual task page, within the verified spread.
  const anchorPages=[q.afterPage,...(q.sourcePages||[]).filter(p=>p!==q.afterPage).sort((a,b)=>b-a)];
  const group=anchorPages.map(p=>host.querySelector(`.cf-home-list>[data-cf-home-page="${p}"]`)).find(Boolean);if(group)group.append(card(q));
  if(Number(page)===q.afterPage){const list=host.querySelector('#exerciseList');if(list)list.after(card(q));}
 }
}
root.CourseQuests={mount};
})(window);
