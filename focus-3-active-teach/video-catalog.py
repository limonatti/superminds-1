"""Public video embeds, mapped against the supplied Teacher's Book contents.
No remote video files are downloaded or republished.
"""
from pathlib import Path
import json,re
R=Path(__file__).resolve().parent
IDS={'2':'apssL15W3hs','3':'_sQaUaYrGVo','4':'IawtTkuC7ao','5':'mz46fYG8nlg','8':'dPIfvIIcoQU','9':'qQzWkiNDA1g','9A':'byIeAJLS8h0','9B':'tRrpT0-qnGU','13':'QUYPRqy1ieI','14':'HOWl_mMnLU0','14A':'Y6nFfs6ipRI','14B':'dScNaiiEJlw','16':'LlCv3H3KlqM','18':'-zOPuNrjlHM','18A':'-IWx6MNvk74','18B':'bv2JGeXnGds','21':'UvpN-9jkKuQ','23':'eUX2tWb5JnE','23A':'uh-cadq64YY','23B':'F4ouiIVHLfE','25':'ZYrocyEeCoU','26':'KyF1Awxj978','27':'4V_zDVmWfRI','28':'yIWejFgEqBc','30':'UbhFRlnVjYk','31':'JnmzWaJ7zC0','31A':'XDdmGF9uyNs','31B':'kIX7Hc8cuhg','32':'aCg74mStcB8','32A':'aGrwZfRs2os','32B':'n4D0OVSF5NQ','33':'VBIZZM7RAXE','33A':'YP3t6f2qP18','33B':'SP0DyfB-dwo','34':'GNEtp6bIbLc','35':'JQFib8bVCNk','37':'_8Qr79Zwe8s','38':'xalbOzqd8as','38A':'aseSVpLXbGY','38B':'EYTEaCiZkaI'}
BBC={1:(1,'Distressing jeans'),5:(2,'The Brujas'),10:(3,'A hotel in the clouds'),15:(4,'Umami'),19:(5,'Chameleons'),24:(6,'Caffeine alternatives'),28:(7,'Shakespeare’s avatars'),34:(8,'Coffee stalls')}
VLOG={4:(1,10,'About clothes'),8:(2,25,'About sport'),13:(3,38,'About holidays'),16:(4,48,'About food'),21:(5,62,'About the environment'),27:(6,81,'About health and sleep'),30:(7,95,'About television'),37:(8,109,'About social media')}
GRAMMAR={2:(1,[6],'Dynamic and state verbs'),3:(1,[10],'Present Perfect Continuous'),6:(2,[20],'Narrative tenses'),7:(2,[24],'Verb patterns'),11:(3,[34],'Present and past speculation'),12:(3,[38],'Used to and would'),17:(4,[52],'Future Continuous and Future Perfect'),20:(5,[62],'Articles'),22:(5,[66],'Non-defining relative clauses'),25:(6,[76],'Second Conditional; wish / if only'),26:(6,[80],'Third Conditional'),29:(7,[90,94],'Reported Speech'),35:(8,[104],'The Passive'),36:(8,[108],'Have something done')}
ROLE={9:(2,28,'Asking for and giving an opinion'),14:(3,42,'Asking for and giving advice'),18:(4,56,'In a restaurant'),23:(5,70,'Describing and contrasting pictures'),31:(7,98,'Asking for permission: scene 1'),32:(7,98,'Asking for permission: scene 2'),33:(7,98,'Asking for permission: scene 3'),38:(8,112,'Advantages and disadvantages')}
videos=[]
extra=json.loads((R/'data/video-additions.json').read_text()) if (R/'data/video-additions.json').exists()else{}
entries={n:{'provider':'youtube','youtube':youtube,'url':'https://www.youtube.com/watch?v='+youtube} for n,youtube in IDS.items()}
for number,entry in extra.items():
 entry=dict(entry)
 entry.setdefault('provider','youtube')
 if entry['provider']=='youtube':entry.setdefault('url','https://www.youtube.com/watch?v='+entry['youtube'])
 entries[number]=entry
for number,entry in sorted(entries.items(),key=lambda p:(int(re.sub('[A-Z]','',p[0])),p[0])):
 n=int(re.sub('[A-Z]','',number));variant=number[len(str(n)):]
 if n in BBC:
  unit,title=BBC[n];category='BBC';pages=[4+(unit-1)*14,116+(unit-1)*2]
 elif n in VLOG:
  unit,page,title=VLOG[n];category='Focus Vlog';pages=[page,117+(unit-1)*2]
 elif n in GRAMMAR:unit,pages,title=GRAMMAR[n];category='Grammar'
 else:
  unit,page,title=ROLE[n];category='Speaking';pages=[page];title+=' · '+('Person '+variant if variant else 'Scene')
 videos.append({'number':number,'unit':unit,'title':title,'category':category,'pages':pages,**entry})
(R/'data/videos.json').write_text(json.dumps(videos,ensure_ascii=False,indent=2))
missing=[n for n in range(1,39)if str(n)not in {v['number']for v in videos}]
(R/'audit/videos.json').write_text(json.dumps({'checked':'2026-11-17','playlist':'https://www.youtube.com/playlist?list=PLdOdDgjDBFfGwN8PZm8yGsKRuKvHTLrvd','channel':"Lavender’s English",'additionalSources':'See sourceNote in data/video-additions.json for Pearson and individual teacher uploads.', 'alternateEditNumbers':[], 'partialNumbers':[], 'verification':'Playlist titles and video numbers inspected in YouTube, mapped against the supplied SB/TB. Individual grammar/BBC additions checked against book topics and animation footage. Complete textbook edits of BBC 1, 10 and 24 found on VK Video: playback, opening/middle/closing scenes and visible English subtitles checked against supplied SB/TB videoscripts. Public watch pages play successfully; the embed endpoint returned unavailable during local testing and vk.ru was blocked by browser site-safety on retest. The course therefore opens VK watch pages in a new tab and does not load a VK iframe. The former alternative edit of 1 and partial clip 10D are replaced. Three duplicate uploads of video 38 excluded. The lesson numbers in some uploader titles are incorrect; page mapping follows the book.','included':len(videos),'providers':{p:sum(v['provider']==p for v in videos)for p in sorted({v['provider']for v in videos})},'missingNumbers':missing},ensure_ascii=False,indent=2))
print('Videos:',len(videos))

# A shareable, searchable list of direct links, independent of the lesson dialog.
from html import escape
names=['A new look','It’s just a game','On the go','Eat, drink and be healthy','Planet Earth','Good health','Entertain me','Modern society']
sections=[]
for unit,name in enumerate(names,1):
 rows=[]
 for v in videos:
  if v['unit']!=unit:continue
  note='<p class="note">'+escape(v['editionNote'])+'</p>' if v.get('editionNote') else ''
  rows.append('<li><a target="_blank" rel="noopener" href="'+escape(v['url'],quote=True)+'">'+escape(v['number']+' · '+v['category']+' · '+v['title'])+'</a>'+note+'</li>')
 for number in [n for n in missing if n in BBC]:
  if BBC[number][0]==unit:rows.append('<li class="note">'+str(number)+' · BBC · '+escape(BBC[number][1])+' — полная учебная версия пока не найдена.</li>')
 sections.append('<section><h2>Unit '+str(unit)+' · '+escape(name)+'</h2><ul>'+''.join(rows)+'</ul></section>')
(R/'videos.html').write_text('<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Видео Focus 3 · English with Asya</title><link rel="icon" href="../favicon.svg"><style>body{font:17px/1.6 system-ui,sans-serif;margin:0;color:#202526;background:#f4f4ee}main{max-width:860px;margin:auto;padding:32px 24px}a{color:#087e8b;text-underline-offset:3px}h1{font-size:42px;line-height:1.15}h2{font-size:23px;margin-top:36px}li{margin:10px 0}.note{font-size:14px;color:#596466}section{border-top:1px solid #d3d8d6;margin-top:28px}ul{padding-left:22px}</style></head><body><main><a href="index.html">← Открыть курс Focus 3</a><h1>Видео Focus 3<br>Second Edition</h1><p>'+str(len(videos))+' видео: BBC, Focus Vlog, грамматика и Speaking, включая варианты Person A/B.</p><p class="note">Проверено 17 ноября 2026. Уроки сопоставлены со страницами учебника. Все 38 номеров видео из учебника представлены. Полные учебные версии BBC №1, №10 и №24 открываются на VK Видео в новой вкладке с английскими субтитрами; остальные ролики — на YouTube.</p>'+''.join(sections)+'</main></body></html>')
