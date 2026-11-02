"""Make web copies of supplied videos, retaining originals in ignored work/."""
from pathlib import Path
import subprocess,concurrent.futures,shutil
ROOT=Path(__file__).resolve().parents[1]/'speakout-b1-active-teach'
backup=ROOT/'work/original-video';backup.mkdir(exist_ok=True)
def encode(p):
    source=backup/p.name
    if not source.exists():shutil.copyfile(p,source)
    out=ROOT/'work'/p.name
    subprocess.run(['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-y','-i',str(source),'-vf','scale=trunc(min(1280\\,iw)/2)*2:-2','-c:v','libx264','-preset','veryfast','-crf','27','-threads','2','-c:a','aac','-b:a','96k','-movflags','+faststart',str(out)],check=True)
    # Keep the smaller playable version.
    if out.stat().st_size<source.stat().st_size:shutil.move(out,p)
    else:out.unlink()
    print(p.name,round(p.stat().st_size/1e6,1),'MB',flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:list(pool.map(encode,sorted((ROOT/'media').glob('*.mp4'))))
