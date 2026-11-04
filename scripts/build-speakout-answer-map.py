#!/usr/bin/env python3
"""Recover record-specific workbook keys from the supplied answer-key extraction.
The original parser loses the cumulative/grammar/vocabulary review headings.
"""
import json,re,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];A=ROOT/'speakout-a1-active-teach/assets'
D=json.loads((A/'course-web.js').read_text().partition('=')[2].strip().removesuffix(';'))
rows=json.loads((Path(sys.argv[1])/'wb-parsed-keys.json').read_text());groups={k:[]for k in ['cumulative14','cumulative58','grammar','vocabulary']};group=None
for row in rows:
 if row['pdfPage']==92 and row['label']=='1' and row['raw'].startswith('2 ’s'):group='cumulative14'
 if row['pdfPage']==93 and row['label']=='1' and row['raw'].startswith('2 it'):group='cumulative58'
 if row['pdfPage']==94 and row['label']=='1' and row['raw'].startswith('1 I’m'):group='grammar'
 if row['pdfPage']==95:group='vocabulary'
 if group:groups[group].append(dict(row))
def parse(raw):
 return [{'n':m[1],'answer':m[2].strip()}for m in re.finditer(r'(?:^|\s)(\d{1,2})\s+(.+?)(?=\s+\d{1,2}\s+|$)',raw)]
out={}
for name,pages in {'cumulative14':[60,61],'cumulative58':[62,63],'grammar':[64,65],'vocabulary':[66,67]}.items():
 source={};previous=None
 for row in groups[name]:
  # Overflow lines 10–14 were incorrectly read as new exercise headings.
  if re.fullmatch(r'1[0-4]',row['label'])and not re.match(r'\d+\s',row['raw'])and previous and not re.match(r'^[AB]\s',row['raw']):
   previous['raw']+=' '+row['label']+' '+row['raw'];continue
  label=row['label'];m=re.match(r'^([AB])\s+(\d+\s.*)',row['raw'])
  if m:label+=m[1];row['raw']=m[2]
  source[label]=row;previous=row
 for p in D['books']['wb']['pages']:
  if p['page']not in pages:continue
  for e in p['exercises']:
   row=source.get(e['label'])
   if not row:continue
   items=parse(row['raw'])
   if not items or len({q['n']for q in items})!=len(items):continue
   out[f'wb:{p["page"]}:{e["label"]}']={'raw':row['raw'],'items':items,'pdf':'web/298.pdf','pdfPage':row['pdfPage']}
# A/B headings embedded in the raw key also affect two earlier reviews.
for page,keyPage,label in [(17,83,'12'),(45,89,'11')]:
 for row in rows:
  m=re.match(r'^([AB])\s+(\d+\s.*)',row['raw'])
  if row['pdfPage']==keyPage and row['label']==label and m:out[f'wb:{page}:{label}{m[1]}']={'raw':m[2],'items':parse(m[2]),'pdf':'web/298.pdf','pdfPage':keyPage}
for row in rows:
 if row['pdfPage']==92 and row['label']=='11'and row['raw'].startswith('1 last'):out['wb:59:11']={'raw':row['raw'],'items':parse(row['raw']),'pdf':'web/298.pdf','pdfPage':92}
(A/'answer-map.js').write_text('window.SPEAKOUT_ANSWER_MAP='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
print('Recovered record-specific keys:',len(out))
