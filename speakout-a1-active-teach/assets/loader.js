/* Course source files stay on the teacher's computer. No files are uploaded. */
'use strict';
(async function(){
  function start(){const s=document.createElement('script');s.src='assets/app.js';document.body.appendChild(s);}
  function parse(text){const prefix='window.COURSE=';if(!text.startsWith(prefix))throw Error('Неверный файл курса');return JSON.parse(text.slice(prefix.length).replace(/;\s*$/, ''));}
  const local=document.createElement('script');local.src='assets/course.js';
  local.onload=()=>{if(window.COURSE)start();else choose();};local.onerror=choose;document.head.appendChild(local);
  function choose(){
    const layer=document.createElement('section');layer.className='source-picker';
    layer.innerHTML='<div><p class="eyebrow">English with Asya · Speakout A1</p><h1>Подключите материалы курса</h1><p>Выберите папку <b>speakout-a1-active-teach</b> на компьютере. В ней должны быть assets и source. Книги, аудио и видео откроются здесь, на платформе.</p><p>Файлы читаются только в браузере и не отправляются на сервер. После перезагрузки страницы папку нужно выбрать снова. Ответы сохраняются в этом браузере.</p><label class="folder-button">Выбрать папку<input type="file" webkitdirectory multiple aria-label="Выбрать папку материалов"></label><p role="status" class="source-status"></p><a href="../speakout-a1-course.html">← К юнитам</a></div>';
    document.body.appendChild(layer);
    layer.querySelector('input').onchange=async ev=>{
      const status=layer.querySelector('.source-status');status.textContent='Подключаю материалы…';
      const files=[...ev.target.files],course=files.find(f=>f.webkitRelativePath.endsWith('/assets/course.js'));
      if(!course){status.textContent='В папке нет assets/course.js. Выберите папку speakout-a1-active-teach целиком.';return;}
      try{
        const data=parse(await course.text()),prefix=course.webkitRelativePath.slice(0,-'assets/course.js'.length);
        const map=new Map(files.filter(f=>f.webkitRelativePath.startsWith(prefix)).map(f=>[f.webkitRelativePath.slice(prefix.length),f]));
        const required=[...Object.values(data.books).flatMap(b=>[b.path,...b.pages.map(p=>p.image)]),...data.media.map(m=>m.path),...data.resources.map(r=>r.path)];
        const missing=required.filter(path=>!map.has(path));
        if(missing.length){status.textContent='Не хватает файлов: '+missing.length+'. Выберите полную папку курса с assets и source.';return;}
        window.COURSE=data;window.SPEAKOUT_FILES=new Map([...map].map(([path,file])=>[path,URL.createObjectURL(file)]));
        layer.remove();start();
      }catch(e){status.textContent='Не удалось открыть материалы: '+e.message;}
    };
  }
})();
