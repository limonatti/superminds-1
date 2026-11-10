/* Focus uses authored source rectangles, never movable answer overlays. */
window.FocusSource=(()=>{
 const NS='http://www.w3.org/2000/svg',states=new WeakMap();
 function draw(host){
  const s=states.get(host),doc=host.querySelector('.focus-document');doc.replaceChildren();
  let sources=s.model.sources;
  if(s.full)sources=sources.filter((v,i)=>sources.findIndex(x=>x.image===v.image)===i).map(v=>({...v,box:[0,0,1,1]}));
  for(const item of sources){
   const figure=document.createElement('figure');figure.className='focus-sheet';figure.dataset.context=!!item.context;
   const caption=document.createElement('figcaption');caption.textContent=(item.caption||(item.continuation?'Продолжение упражнения':item.context?'Материал к заданию':'Упражнение '+s.model.label))+(item.page?' · стр. '+item.page:'');figure.append(caption);
   const [W,H]=item.size,[x,y,w,h]=item.box,svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox',[x*W,y*H,w*W,h*H].join(' '));svg.setAttribute('role','img');svg.setAttribute('aria-label',caption.textContent);svg.dataset.box=JSON.stringify(item.box);svg.style.aspectRatio=`${w*W}/${h*H}`;
   const image=document.createElementNS(NS,'image');image.setAttribute('href',item.image);image.setAttribute('width',W);image.setAttribute('height',H);svg.append(image);figure.append(svg);if(item.context&&!s.full){const details=document.createElement('details'),summary=document.createElement('summary');details.className='focus-context';summary.textContent='Контекст · страница '+item.page;details.append(summary,figure);doc.append(details)}else doc.append(figure);
  }
  // Fit the complete activity into the visible pane; zoom remains available for small print.
  const visible=sources.filter(v=>!v.context||s.full),width=host.clientWidth-16,available=host.clientHeight-host.querySelector('.focus-source-controls').offsetHeight-12;
  const naturalHeight=visible.reduce((sum,v)=>sum+(v.box[3]*v.size[1])/(v.box[2]*v.size[0])*width,0);
  const fitted=Math.min(1,Math.max(.12,(available-visible.length*45)/Math.max(1,naturalHeight)));
  s.actualZoom=s.fit==='contain'?fitted:s.fit==='width'?1:s.zoom;
  doc.style.width=`${s.actualZoom*100}%`;
  host.querySelector('[data-full]').textContent=s.full?'Только задание':'Вся страница';host.querySelector('[data-full]').setAttribute('aria-pressed',String(s.full));host.querySelector('[data-fit]').textContent=s.fit==='contain'?'По ширине':'Целиком';
 }
 function mount(host,id){
  const model=window.EXERCISE_SOURCES[id];if(!model?.sources?.length)throw Error('Нет оригинала задания '+id);
  states.get(host)?.observer?.disconnect();states.set(host,{model,zoom:1,actualZoom:1,fit:'width',full:false});host.replaceChildren();
  const bar=document.createElement('div');bar.className='focus-source-controls';bar.innerHTML='<button type="button" data-minus aria-label="Уменьшить оригинал">−</button><button type="button" data-fit>По ширине</button><button type="button" data-plus aria-label="Увеличить оригинал">+</button><button type="button" data-full aria-pressed="false">Вся страница</button>';
  const doc=document.createElement('div');doc.className='focus-document';host.append(bar,doc);
  bar.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;const s=states.get(host);if(b.hasAttribute('data-minus')){s.zoom=Math.max(.12,s.actualZoom-.2);s.fit=null}if(b.hasAttribute('data-plus')){s.zoom=Math.min(3,s.actualZoom+.2);s.fit=null}if(b.hasAttribute('data-fit'))s.fit=s.fit==='contain'?'width':'contain';if(b.hasAttribute('data-full')){s.full=!s.full;s.fit='contain'}draw(host)});
  const observer=new ResizeObserver(()=>{if(host.clientWidth&&host.clientHeight)draw(host)});states.get(host).observer=observer;observer.observe(host);draw(host);host.scrollTop=0;host.scrollLeft=0;
 }
 return {mount};
})();
