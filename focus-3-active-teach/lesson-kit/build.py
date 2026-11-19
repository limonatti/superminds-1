"""Build the printable teacher glossary and static lesson audio metadata."""
from pathlib import Path
import csv, html, json

ROOT=Path(__file__).resolve().parent
data=json.loads((ROOT/'data/glossary.json').read_text())
audio=json.loads((ROOT/'data/audio.json').read_text())
esc=html.escape
groups=[]
for i,g in enumerate(data['groups']):
    rows=[]
    for e in g['entries']:
        note=f'<small>{esc(e["note"])}</small>' if e.get('note') else ''
        rows.append(f'<tr><td lang="en">{esc(e["en"])}</td><td>{esc(e["ru"])}{note}</td></tr>')
    groups.append(f'<section class="vocab-group" data-spread="{g["spread"]}" id="group-{i+1}"><h2>Стр. {g["page"]} · {esc(g["section"])} · {esc(g["exercise"])}</h2><h3>{esc(g["title"])}</h3><table class="vocab-table"><thead><tr><th scope="col">English</th><th scope="col">Русский перевод по контексту</th></tr></thead><tbody>{"".join(rows)}</tbody></table></section>')
page='''<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Подробный словарь преподавателя к Focus 3 Second Edition, страницы 6–11: английские слова и выражения с русскими переводами по упражнениям. Поиск и печать."><title>Словарь стр. 6–11 · Focus 3 · English with Asya</title><link rel="icon" href="../../favicon.svg"><link rel="stylesheet" href="assets/lesson-kit.css"></head><body><a class="skip" href="#vocabulary">К словарю</a><header class="site-head"><a class="wordmark" href="../index.html?book=sb&amp;unit=1&amp;page=6">english <span>with Asya</span></a><nav aria-label="Материалы урока"><a href="../index.html?book=sb&amp;unit=1&amp;page=6">К учебнику</a><a href="warm-up-1-1.html">Квест 1.1</a></nav></header><main class="vocab-main"><div class="vocab-intro"><p class="eyebrow">FOCUS 3 · SECOND EDITION · STUDENT’S BOOK</p><h1>Словарь преподавателя</h1><p class="scope">Три разворота после 1.1: страницы 6–11</p><p>6–7: 1.2 Grammar и 1.3 Listening.<br>8–9: 1.4 Reading, «Icons of fashion».<br>10–11: 1.5 Grammar и 1.6 Use of English.</p><p class="scope-note">NOTE</p></div><nav class="spread-nav" aria-label="Развороты"><a href="#group-1" data-spread-link="6–7">Страницы 6–7</a><a href="#group-10" data-spread-link="8–9">Страницы 8–9</a><a href="#group-20" data-spread-link="10–11">Страницы 10–11</a></nav><div class="filters"><label class="search" for="search">Найти слово или перевод<input type="search" id="search" placeholder="Например: look after или очередь"></label><label for="spread">Разворот<select id="spread"><option value="all">Все три разворота</option><option>6–7</option><option>8–9</option><option>10–11</option></select></label><button id="clearSearch">Показать всё</button><button class="primary" id="printVocab">Печать / PDF</button><a href="vocabulary-6-11.csv" download>Скачать CSV</a></div><p id="vocabCount" role="status">COUNT записей по упражнениям.</p><p class="no-print scope-note">Печатаются только видимые строки. Чтобы распечатать весь словарь, сначала нажми «Показать всё».</p><div id="emptySearch" class="empty-search" hidden>Совпадений нет. Попробуй часть слова или другой разворот.</div><div id="vocabulary">GROUPS</div></main><footer class="site-footer"><p>Источник: предоставленный Student’s Book, Focus 3 Second Edition, печатные страницы 6–11. Русские переводы подготовлены по контексту. Формы в таблице упражнения 7 на стр. 11 дополнены для работы преподавателя. Полные тексты аудиозаписей и дополнительные страницы не включены.</p></footer><script src="assets/glossary.js"></script></body></html>'''
page=page.replace('NOTE',esc(data['note'])).replace('COUNT',str(sum(len(g['entries']) for g in data['groups']))).replace('GROUPS','\n'.join(groups))
(ROOT/'vocabulary-6-11.html').write_text(page)
with (ROOT/'vocabulary-6-11.csv').open('w',encoding='utf-8-sig',newline='') as f:
    writer=csv.writer(f);writer.writerow(['Разворот','Страница','Раздел','Упражнение','English','Русский перевод','Примечание'])
    for g in data['groups']:
        for e in g['entries']:writer.writerow([g['spread'],g['page'],g['section'],g['exercise'],e['en'],e['ru'],e.get('note','')])
(ROOT/'assets/audio-data.js').write_text('window.FOCUS3_AUDIO = '+json.dumps(audio,ensure_ascii=False)+';\n')
print('Built glossary:',len(groups),'groups;',sum(len(g['entries']) for g in data['groups']),'entries')
