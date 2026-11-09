"""Verified titles/IDs from the public Focus 2 Second Edition YouTube playlist.
Checked 2026-11-09 in YouTube. No video files are downloaded or republished.
"""
import json
from pathlib import Path
R=Path(__file__).resolve().parent
PLAYLIST='https://www.youtube.com/playlist?list=PLdOdDgjDBFfEYuyHbEhr-WkMsvPOtUdv9'
IDS={
 '1':'TAJtplVfngw','2':'uBQnkYxZERA','3':'Sh5S1V42uV8','4':'STy15IGxiKI','5':'o3ccZCHFIHE','5A':'zQx1CdO-8uU','5B':'0lBVtQFb7ks',
 '7':'iw4Ii9yrxe4','8':'WErIcIkFlDI','9':'bNYa8UNH9ZM','10':'C-QNV1Nuj_0','10A':'mI6tmMdiZ40','10B':'5R3Ezx6aBeg',
 '11':'O-AvvgmscXA','12':'kNZpzJAw0OA','13':'mC1W3EFhBY8','14':'yTOqamlKRCQ',
 '15':'dTINBUroGpU','16':'Dtx-zKZ9B4E','17':'qFOJ5UG-Jp4','18':'6VfRYiOdAmg','19':'rWJwgxNMBig','19A':'nByEvADstbo','19B':'OFG8lREb9r0',
 '20':'0oQPGxVZOHI','21':'7Thr1YZT_UE','22':'E4HcYud3CnY','23':'N6LEdck8F0c','24':'V5J5DJcfI5Q','24A':'xZ3O9MBapZk','24B':'z_aWSII4phA',
 '26':'l5bVHJtab-c','27':'A8KZwxn_a-s','28':'KVadNDYGkAU','29':'WBnKNtuTfBU','29A':'0bhvr3DMmug','29B':'zbOGZU-RabI',
 '30':'Gn8UhdPNdtA','31':'C5mV7dSgos8','32':'BzYFyLaO3is','33':'x7qWsfmdbT8','34':'uYvMDPNFP50','34A':'Eo0yab5bIXg','34B':'Qp9NBd61RFE','35':'BvTzw_I_m_4','35A':'lHaTkbXGroA','35B':'Io9W_QGR5v0',
 '37':'QhGl-m5fHUY','38':'pkqGpWvKOJI','39':'7GQadPmPhIA','40':'jWuMLFZn8Kc','40A':'8y8lltojO88','40B':'TiwqzYRNVd8','41':'ye7rM1lD2eU','41A':'bbCz7mNyitE','41B':'rkckSd3ZHA0'
}
BBC={1:(1,'Student accommodation'),6:(2,'Urban legends'),11:(3,'The Musketeers'),15:(4,'Cave houses'),20:(5,'South Korean schools'),25:(6,'Window cleaning'),30:(7,'Cheap shopping'),36:(8,'Keeping fit')}
VLOG={3:(1,'About happiness'),8:(2,'About technology'),14:(3,'About films'),17:(4,'About homes'),23:(5,'About school'),27:(6,'About dream jobs'),33:(7,'About clothes'),38:(8,'About exercise')}
GRAMMAR={2:(1,6,'Present tenses: questions'),4:(1,10,'Verb + -ing / to infinitive'),7:(2,20,'Past Continuous and Past Simple'),9:(2,24,'used to'),12:(3,34,'Comparative and superlative adjectives'),13:(3,38,'Present Perfect and Past Simple'),16:(4,48,'Present Perfect with for and since'),18:(4,52,'Future forms'),21:(5,62,'First Conditional'),22:(5,66,'Defining relative clauses'),26:(6,76,'Second Conditional'),28:(6,80,'Modal verbs'),31:(7,90,'The Passive'),32:(7,94,'Quantifiers'),37:(8,104,'Past Perfect'),39:(8,108,'Reported Speech')}
ROLE={5:(1,14,'Showing interest'),10:(2,28,'Telling a story'),19:(4,56,'Making suggestions'),24:(5,70,'Giving an opinion'),29:(6,84,'Asking for and giving advice'),34:(7,98,'Shopping: dialogue 1'),35:(7,98,'Shopping: dialogue 2'),40:(8,112,'At the doctor’s: dialogue 1'),41:(8,112,'At the doctor’s: dialogue 2')}
videos=[]
for number,youtube in IDS.items():
 n=int(number.rstrip('AB'));variant=number[len(str(n)):]
 if n in BBC:
  unit,title=BBC[n];category='BBC';pages=[4+(unit-1)*14,116+(unit-1)*2]
 elif n in VLOG:
  unit,title=VLOG[n];category='Focus Vlog';pages=[117+(unit-1)*2,4+(unit-1)*14+(6 if unit in [3,5,7] else 2)]
 elif n in GRAMMAR:
  unit,page,title=GRAMMAR[n];category='Grammar';pages=[page]
 else:
  unit,page,title=ROLE[n];category='Speaking';pages=[page];title+=' · '+('Person '+variant if variant else 'Scene')
 videos.append({'number':number,'unit':unit,'title':title,'category':category,'pages':pages,'youtube':youtube,'url':'https://www.youtube.com/watch?v='+youtube})
(R/'data/videos.json').write_text(json.dumps(videos,ensure_ascii=False,indent=2))
(R/'audit/videos.json').write_text(json.dumps({'checked':'2026-11-09','source':PLAYLIST,'channel':"Lavender’s English",'verification':'Public playlist titles, edition, video numbers and lesson numbers matched to the supplied SB/TB; playback availability can change.','included':len(videos),'unavailableFullCourseVideos':[{'number':n,'unit':BBC[n][0],'title':BBC[n][1]} for n in [6,25,36]],'excluded':'Keeping fit 44-second preview; unrelated editions and unverified substitute clips.'},ensure_ascii=False,indent=2))
