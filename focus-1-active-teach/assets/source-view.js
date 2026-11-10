/* Complete original pages: focusing an exercise scrolls the page, never crops it. */
window.FocusSource=(()=>{
 const NS='http://www.w3.org/2000/svg',states=new WeakMap();
 function draw(host){
  const s=states.get(host),doc=host.querySelector('.focus-document');
  const sources=s.model.sources.filter((v,i,all)=>all.findIndex(x=>x.image===v.image)===i);
  doc.replaceChildren();
  for(const item of sources){
   const figure=document.createElement('figure');figure.className='focus-sheet';
   const caption=document.createElement('figcaption');caption.textContent=(item.caption||'Оригинал целиком')+' · стр. '+item.page;figure.append(caption);
   const [W,H]=item.size,svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.setAttribute('role','img');svg.setAttribute('aria-label',caption.textContent);svg.dataset.box='[0,0,1,1]';svg.style.aspectRatio=`${W}/${H}`;
   const image=document.createElementNS(NS,'image');image.setAttribute('href',item.image);image.setAttribute('width',W);image.setAttribute('height',H);svg.append(image);figure.append(svg);doc.append(figure);
  }
  const width=host.clientWidth-16,available=host.clientHeight-host.querySelector('.focus-source-controls').offsetHeight-20;
  const naturalHeight=sources.reduce((sum,v)=>sum+v.size[1]/v.size[0]*width,0);
  const fitted=Math.min(1,Math.max(.12,(available-sources.length*45)/Math.max(1,naturalHeight)));
  s.actualZoom=s.fit==='contain'?fitted:s.fit==='width'?1:s.zoom;doc.style.width=`${s.actualZoom*100}%`;
  host.querySelector('[data-fit]').textContent=s.fit==='contain'?'По ширине':'Целиком';
  if(s.focusPending&&host.clientWidth&&host.clientHeight){s.focusPending=false;focus(host);}
 }
 function focus(host){
  const s=states.get(host),first=host.querySelector('svg'),[x,y]=s.model.sources[0].box,bar=host.querySelector('.focus-source-controls');
  host.scrollTop=Math.max(0,first.parentElement.offsetTop+y*first.getBoundingClientRect().height-bar.offsetHeight-16);
  host.scrollLeft=Math.max(0,x*first.getBoundingClientRect().width-12);
 }
 function mount(host,id){
  const model=window.EXERCISE_SOURCES[id];if(!model?.sources?.length)throw Error('Нет оригинала задания '+id);
  states.get(host)?.observer?.disconnect();states.set(host,{model,zoom:1,actualZoom:1,fit:'width',focusPending:true});host.replaceChildren();
  const bar=document.createElement('div');bar.className='focus-source-controls';bar.innerHTML='<button type="button" data-minus aria-label="Уменьшить оригинал">−</button><button type="button" data-fit>Целиком</button><button type="button" data-plus aria-label="Увеличить оригинал">+</button><button type="button" data-full>К заданию</button>';
  const doc=document.createElement('div');doc.className='focus-document';host.append(bar,doc);
  bar.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;const s=states.get(host);if(b.hasAttribute('data-full')){s.fit='width';draw(host);focus(host);return}if(b.hasAttribute('data-minus')){s.zoom=Math.max(.12,s.actualZoom-.2);s.fit=null}if(b.hasAttribute('data-plus')){s.zoom=Math.min(3,s.actualZoom+.2);s.fit=null}if(b.hasAttribute('data-fit')){s.fit=s.fit==='contain'?'width':'contain';host.scrollTop=0;host.scrollLeft=0}draw(host)});
  const observer=new ResizeObserver(()=>{if(host.clientWidth&&host.clientHeight)draw(host)});states.get(host).observer=observer;observer.observe(host);host.scrollTop=0;host.scrollLeft=0;draw(host);
 }
 return {mount};
})();
