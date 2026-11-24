/* Plain message text stays text. Only validated web addresses become links. */
(function(root){
  'use strict';
  function parts(value){
    const text=String(value||''), result=[];
    const pattern=/(?:https?:\/\/|www\.)[^\s<>"'«»“”\u0000-\u001f\u007f]+/gi;
    let cursor=0;
    for(const match of text.matchAll(pattern)){
      const start=match.index;
      if(start && /[\p{L}\p{N}_@./:+-]/u.test(text[start-1]))continue;
      let label=match[0], previous;
      do{
        previous=label;
        label=label.replace(/[.,!?;:…]+$/u,'');
        for(const [open,close] of [['(',')'],['[',']'],['{','}']]){
          while(label.endsWith(close) && label.split(close).length>label.split(open).length)label=label.slice(0,-1);
        }
      }while(label!==previous);
      let url;
      try{url=new URL(/^www\./i.test(label)?'https://'+label:label);}catch(e){continue;}
      if(!['https:','http:'].includes(url.protocol)||!url.hostname||url.username||url.password)continue;
      if(start>cursor)result.push({text:text.slice(cursor,start)});
      result.push({text:label,href:url.href,host:url.hostname.replace(/^www\./,'')});
      cursor=start+label.length;
    }
    if(cursor<text.length)result.push({text:text.slice(cursor)});
    return result;
  }
  function render(value,doc){
    doc=doc||document;
    const span=doc.createElement('span');span.className='message-text';
    const tokens=parts(value);
    if(tokens.length===1&&tokens[0].href){
      const host=doc.createElement('span');host.className='link-host';host.textContent=tokens[0].host+' ↗';
      span.classList.add('link-message');span.appendChild(host);
    }
    for(const token of tokens){
      if(!token.href){span.appendChild(doc.createTextNode(token.text));continue;}
      const a=doc.createElement('a');
      a.className='message-link';a.href=token.href;a.target='_blank';a.rel='noopener noreferrer';
      a.textContent=token.text;a.setAttribute('aria-label','Открыть ссылку: '+token.text+' (в новой вкладке)');
      span.appendChild(a);
    }
    return span;
  }
  root.SMChatContent={parts,render};
  if(typeof module!=='undefined')module.exports=root.SMChatContent;
})(typeof window==='undefined'?globalThis:window);
