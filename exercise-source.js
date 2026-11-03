/* A shared, read-only view of complete original tasks. Answer engines stay independent. */
(function(root){
'use strict';
const ns='http://www.w3.org/2000/svg',observed=new Set();
function mount(host,id,fallback){
 for(const old of observed)if(!old.isConnected){old._focusResize.disconnect();observed.delete(old)}
 const model=root.EXERCISE_SOURCES?.[id]||fallback;if(!model?.sources?.length)return null;
 let doc=host.querySelector(':scope > .focus-document');
 if(doc&&doc._focus?.id===id)return doc;
 for(const el of [...host.children])if(el.tagName!=='BUTTON'&&!el.classList.contains('focus-source-controls'))el.classList.add('focus-legacy');
 if(!doc){doc=document.createElement('div');doc.className='focus-document';host.append(doc)}
 doc.classList.remove('focus-legacy');host.classList.add('focus-original');
 if(!host._focusResize){host._focusResize=new ResizeObserver(()=>fit(host));host._focusResize.observe(host);observed.add(host)}
 doc._focus={id,model,zoom:1,full:false};render(doc);const fullButton=host.querySelector('.focus-source-controls button:last-child');if(fullButton){fullButton.textContent='Вся страница';fullButton.setAttribute('aria-pressed','false')}host.scrollTop=0;host.scrollLeft=0;return doc;
}
function render(doc){
 const s=doc._focus;let sources=s.model.sources;
 if(s.full)sources=[{...sources[0],box:[0,0,1,1],context:false}];
 doc.replaceChildren();doc.style.width=(s.zoom*100)+'%';
 for(const source of sources){
  const section=document.createElement('figure');section.className='focus-sheet';
  const caption=document.createElement('figcaption');caption.textContent=(source.context?'Материал к заданию':'Упражнение '+s.model.label)+(source.page?' · стр. '+source.page:'');section.append(caption);
  const [pw,ph]=source.size||[595,842],[x,y,w,h]=source.box;
  const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox',`${x*pw} ${y*ph} ${w*pw} ${h*ph}`);svg.setAttribute('role','img');svg.setAttribute('aria-label',caption.textContent);svg.style.aspectRatio=`${w*pw}/${h*ph}`;section.dataset.aspect=w*pw/(h*ph);section.dataset.context=!!source.context;
  const image=document.createElementNS(ns,'image');image.setAttribute('href',root.SPEAKOUT_FILES?.get(source.image)||root.SPEAKOUT_FILES?.get(source.image.replace(/\.webp$/i,'.jpg'))||source.image);image.setAttribute('width',pw);image.setAttribute('height',ph);svg.append(image);section.append(svg);doc.append(section);
 }
 fit(doc.parentElement);
}
function fit(host){
 const doc=host.querySelector('.focus-document');if(!doc?._focus)return;
 const height=host.clientHeight-(host.querySelector('.focus-source-controls')?.offsetHeight||0)-(doc.querySelector('figcaption')?.offsetHeight||18)-32;for(const figure of doc.querySelectorAll('.focus-sheet')){figure.style.width=innerWidth>760&&height>100&&figure.dataset.context==='false'?Math.min(doc.clientWidth,height*Number(figure.dataset.aspect)*doc._focus.zoom)+'px':'100%'}
}
function change(host,changes){const doc=host?.matches('.focus-document')?host:host?.querySelector('.focus-document');if(!doc?._focus)return;Object.assign(doc._focus,changes);render(doc)}
function columns(dialog,body,left,right){
 if(!dialog||!body||!left||!right)return;
 dialog.classList.add('focus-dialog');body.classList.add('focus-columns');left.classList.add('focus-original');right.classList.add('focus-responses');
}
function controls(host){
 if(host.querySelector('.focus-source-controls'))return host.querySelector('.focus-source-controls');
 const bar=document.createElement('div');bar.className='focus-source-controls';bar.innerHTML='<button type="button" aria-label="Уменьшить задание">−</button><button type="button">По ширине</button><button type="button" aria-label="Увеличить задание">+</button><button type="button" aria-pressed="false">Вся страница</button>';
 const buttons=bar.querySelectorAll('button');const state=()=>host.querySelector('.focus-document')._focus;
 buttons[0].onclick=()=>{change(host,{zoom:Math.max(.5,state().zoom-.25)})};buttons[1].onclick=()=>{change(host,{zoom:1})};buttons[2].onclick=()=>{change(host,{zoom:Math.min(3,state().zoom+.25)})};buttons[3].onclick=()=>{const full=!state().full;buttons[3].textContent=full?'Только задание':'Вся страница';buttons[3].setAttribute('aria-pressed',full);change(host,{full})};
 host.prepend(bar);fit(host);return bar;
}
root.ExerciseSource={mount,change,columns,controls};
})(window);
