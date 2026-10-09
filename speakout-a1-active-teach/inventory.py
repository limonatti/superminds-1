from pathlib import Path
import json,re
root=Path(__file__).resolve().parent
exec((root/'build.py').read_text().split('titles=')[0])
for book,needle in [('sb','Students_Book_www'),('wb','Workbook_with_Keys_www')]:
 out={}
 with pdfplumber.open(find(needle)) as pdf:
  for pn in range(6 if book=='sb' else 3,176 if book=='sb' else 94):
   out[pn]=words(pdf.pages[pn+1])
 (root/'extracted'/f'{book}-words.json').write_text(json.dumps(out,ensure_ascii=False))
 print(book,'cached',flush=True)
