(() => {
  const groups=[...document.querySelectorAll('.vocab-group')], search=document.querySelector('#search'), spread=document.querySelector('#spread');
  const norm=s=>s.toLocaleLowerCase().replace(/ё/g,'е').replace(/[’‘]/g,"'");
  function filter(){let count=0;const term=norm(search.value.trim());groups.forEach(group=>{let matches=0;const spreadOK=spread.value==='all'||group.dataset.spread===spread.value;group.querySelectorAll('tbody tr').forEach(row=>{row.hidden=!spreadOK||!norm(row.textContent).includes(term);if(!row.hidden)matches++});group.hidden=matches===0;count+=matches});document.querySelector('#vocabCount').textContent=`Показано ${count} слов и выражений (с повторами по упражнениям).`;document.querySelector('#emptySearch').hidden=count!==0;}
  search.addEventListener('input',filter);spread.addEventListener('change',filter);
  document.querySelector('#clearSearch').onclick=()=>{search.value='';spread.value='all';filter();search.focus();};
  document.querySelector('#printVocab').onclick=()=>window.print();
  document.querySelectorAll('[data-spread-link]').forEach(link=>link.onclick=e=>{e.preventDefault();spread.value=link.dataset.spreadLink;search.value='';filter();groups.find(g=>!g.hidden)?.scrollIntoView({block:'start'});});
  filter();
})();
