"""Refresh course assets, lazy homework imports, and shared HTML cache versions."""
from pathlib import Path
import hashlib,re,subprocess,sys
R=Path(__file__).resolve().parent
hashof=lambda p:hashlib.md5(p.read_bytes()).hexdigest()[:8]
helper=R.parent/'focus-3-homework.js'
s=helper.read_text()
for name in ['course.js','marking.js']:
 s=re.sub(r'(focus-3-active-teach/assets/'+re.escape(name)+r'\?v=)[a-f0-9]+',lambda m:m[1]+hashof(R/'assets'/name),s)
helper.write_text(s)
p=R/'index.html'
s=p.read_text()
pattern=r'((?:src|href)=")([^"?]+\.(?:js|css))(?:\?v=[a-f0-9]+)?(")'
def replace(m):
 target=(R/m[2]).resolve()
 return m[1]+m[2]+'?v='+hashof(target)+m[3] if target.is_file() else m[0]
p.write_text(re.sub(pattern,replace,s))
subprocess.run([sys.executable,str(R.parent/'stamp.py')],check=True)
