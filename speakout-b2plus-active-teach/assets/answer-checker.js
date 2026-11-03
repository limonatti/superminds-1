(function(root){
  'use strict';
  const basic=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/[’‘`]/g,"'").replace(/[.,!?;:]/g,'').replace(/\s+/g,' ').trim();
  const spelling={socialise:'socialize',socialised:'socialized',modernised:'modernized',criticising:'criticizing',favourite:'favorite',colour:'color',mould:'mold',cosy:'cozy',programme:'program',summarise:'summarize',pressurise:'pressurize',categorise:'categorize',fulfil:'fulfill',cancelled:'canceled',tranquillity:'tranquility',centre:'center',behaviour:'behavior',travelling:'traveling',organise:'organize',organised:'organized',realise:'realize',realised:'realized'};
  function normalize(s){
    let value=String(s??'').normalize('NFKC').toLowerCase().replace(/[’‘`]/g,"'").replace(/[‐‑–—-]/g,' ');
    value=value.replace(/\bcan't\b/g,'cannot').replace(/\bwon't\b/g,'will not').replace(/\bshan't\b/g,'shall not')
      .replace(/\b(is|are|was|were|do|does|did|have|has|had|should|would|could|must|need)n't\b/g,'$1 not')
      .replace(/'m\b/g,' am').replace(/'re\b/g,' are').replace(/'ve\b/g,' have').replace(/'ll\b/g,' will')
      .replace(/'d\s+(?=(?:have|be|enjoy|pass|organise|organize|play|spend|tell|see|meet|give|accept|find)\b)/g,' would ')
      .replace(/'d\s+(?=(?:forgotten|known|studied|taken|gone|been|had|completed|bought|made)\b)/g,' had ')
      .replace(/\b(it|he|she|that|there|what|who|here)'s\s+(?=(?:been|got|had|done)\b)/g,'$1 has ')
      .replace(/\b(it|he|she|that|there|what|who|here)'s\s+/g,'$1 is ').replace(/^'s\s+/,'is ');
    const numbers=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
    return basic(value).replace(/\b(?:[0-9]|1[0-9]|20)\b/g,n=>numbers[Number(n)])
      .replace(/\b[a-z]+\b/g,w=>spelling[w]||w).replace(/\s+/g,' ').trim();
  }
  const tokens=s=>[...new Set((Array.isArray(s)?s:String(s??'').split(/[,;]+/)).map(normalize).filter(Boolean))].sort();
  function correct(value,field){
    if(!field?.answer)return false;
    if(field.mode==='set')return JSON.stringify(tokens(value))===JSON.stringify(tokens(field.answer));
    const norm=field.grading==='workbook'?normalize:basic;
    const actual=norm(value);
    if(!actual)return false;
    return field.answer.split(/\s*\/\s*/).some(answer=>{
      const variants=[answer];
      if(field.prefix)variants.push(field.prefix+' '+answer);
      if(field.suffix)variants.push(answer+' '+field.suffix);
      if(field.prefix&&field.suffix)variants.push(field.prefix+' '+answer+' '+field.suffix);
      return variants.some(v=>norm(v)===actual);
    });
  }
  root.B2AnswerCheck={correct,normalize};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.B2AnswerCheck;
})(typeof window!=='undefined'?window:globalThis);
