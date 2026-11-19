(() => {
  const groups=[...document.querySelectorAll('.vocab-group')], search=document.querySelector('#search'), spread=document.querySelector('#spread'), lesson=document.querySelector('#lesson');
  const norm=s=>s.toLocaleLowerCase().replace(/ё/g,'е').replace(/[’‘]/g,"'");
  const params=new URLSearchParams(location.search), requested=params.get('lesson');
  if([...lesson.options].some(option=>option.value===requested)) lesson.value=requested;
  function filter(){
    let count=0;const term=norm(search.value.trim());
    groups.forEach(group=>{
      let matches=0;const groupOK=(spread.value==='all'||group.dataset.spread===spread.value)&&(lesson.value==='all'||group.dataset.lesson===lesson.value);
      group.querySelectorAll('tbody tr').forEach(row=>{row.hidden=!groupOK||!norm(row.textContent).includes(term);if(!row.hidden)matches++});
      group.hidden=matches===0;count+=matches;
    });
    document.querySelector('#vocabCount').textContent=`Показано ${count} слов и выражений (с повторами по упражнениям).`;
    document.querySelector('#emptySearch').hidden=count!==0;
    const url=new URL(location.href);if(lesson.value==='all')url.searchParams.delete('lesson');else url.searchParams.set('lesson',lesson.value);history.replaceState(null,'',url);
  }
  search.addEventListener('input',filter);spread.addEventListener('change',filter);
  lesson.addEventListener('change',()=>{spread.value='all';filter();});
  document.querySelector('#clearSearch').onclick=()=>{search.value='';spread.value='all';lesson.value='all';filter();search.focus();};
  document.querySelector('#printVocab').onclick=()=>window.print();
  document.querySelectorAll('[data-spread-link]').forEach(link=>link.onclick=e=>{e.preventDefault();spread.value=link.dataset.spreadLink;lesson.value='all';search.value='';filter();groups.find(g=>!g.hidden)?.scrollIntoView({block:'start'});});
  filter();
})();
