"""Generate original lesson audio; saves MP3s without playing system audio."""
import asyncio
import json
from pathlib import Path
import edge_tts

ROOT = Path(__file__).resolve().parent

async def main():
    semaphore = asyncio.Semaphore(3)
    async def generate(item):
        path = ROOT / 'media' / (item['id'] + '.mp3')
        if path.exists() and path.stat().st_size > 1000:
            print('Exists:', item['id'], flush=True)
            return
        async with semaphore:
            for attempt in range(3):
                try:
                    await edge_tts.Communicate(item['text'], item['voice'], rate='-15%').save(str(path))
                    print('Generated:', item['id'], flush=True)
                    return
                except Exception:
                    if attempt == 2:
                        raise
                    await asyncio.sleep(1)
    await asyncio.gather(*(generate(x) for x in json.loads((ROOT / 'audio-scripts.json').read_text())))

if __name__ == '__main__':
    asyncio.run(main())
