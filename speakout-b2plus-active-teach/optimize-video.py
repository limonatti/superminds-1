"""Prepare the supplied videos for the web; retain frame size up to 720p and duration."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import json
import subprocess

ROOT = Path(__file__).resolve().parent

def probe(path):
    return json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(path)]))

def optimize(path):
    original = probe(path)
    size = path.stat().st_size
    target = path.with_suffix('.web.mp4')
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', str(path),
        '-map', '0:v:0', '-map', '0:a:0?', '-vf', "scale=-2:'min(720,ih)'",
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '25', '-threads', '2',
        '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', str(target)], check=True)
    encoded = probe(target)
    assert abs(float(encoded['format']['duration']) - float(original['format']['duration'])) < .2, str(path)
    if target.stat().st_size < size:
        target.replace(path)
    else:
        target.unlink()
    result = {'path': str(path.relative_to(ROOT)), 'originalBytes': size, 'bytes': path.stat().st_size,
              'duration': float(encoded['format']['duration'])}
    print(path.name, f'{size / 1e6:.1f} → {path.stat().st_size / 1e6:.1f} MB', flush=True)
    return result

if __name__ == '__main__':
    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(optimize, sorted((ROOT / 'content').rglob('*.mp4'))))
    (ROOT / 'audit/video.json').write_text(json.dumps(results, ensure_ascii=False, indent=2) + '\n')
