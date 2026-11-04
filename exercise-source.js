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
 fit(doc.parentElement);doc.dispatchEvent(new CustomEvent('exercise-source-render'));
}
function fit(host){
 const doc=host.querySelector('.focus-document');if(!doc?._focus)return;
 if(host.closest('.play-dialog')){const available=host.clientWidth;for(const figure of doc.querySelectorAll('.focus-sheet'))figure.style.width=Math.min(available,Math.max(Math.min(460,available),Math.min(600,innerHeight*.48)*Number(figure.dataset.aspect))*doc._focus.zoom)+'px';return}
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
// Use the existing exercise crop for the click target. Keep the original
// button, label and handlers so keyboard access and saved answer IDs survive.
function regions(host,boxes){
 if(!host)return;
 [...host.children].forEach((button,i)=>{
  const box=boxes[i];if(!box||box.length!==4||!box.every(Number.isFinite))return;
  let [x,y,w,h]=box;x=Math.max(0,x);y=Math.max(0,y);w=Math.min(1-x,w);h=Math.min(1-y,h);
  // Older crops can include a neighbouring column or the next task. They
  // remain useful in the reader but must not cover another clickable task.
  for(const other of boxes){
   if(!other||!other.every(Number.isFinite))continue;
   if(other[0]>x+.17)w=Math.min(w,other[0]-x-.003);
   if(Math.abs(other[0]-x)<.17&&other[1]>y+.012)h=Math.min(h,other[1]-y-.003);
  }
  if(w<=0||h<=0)return;
  button.classList.add('exercise-region');
  Object.assign(button.style,{left:x*100+'%',top:y*100+'%',width:w*100+'%',height:h*100+'%'});
  const label=document.createElement('span');label.className='exercise-region-label';label.textContent=button.textContent;button.replaceChildren(label);
 });
}
root.ExerciseSource={mount,change,columns,controls,regions};
})(window);
