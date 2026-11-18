"""Reviewed task boundaries for pages whose exercise numbers occupy one column.

Automatic column detection must not include an unrelated neighbouring task or
grammar reference. Coordinates were checked against the supplied page images.
Answer IDs and existing marking contracts are preserved.
"""
import hashlib
import json
from pathlib import Path

R = Path(__file__).resolve().parent
BOXES = {
    'sb-87-7': [.07, .09, .425, .065],
    'sb-87-8': [.07, .202, .425, .063],
    'sb-87-9': [.07, .274, .425, .19],
    'sb-87-10': [.07, .515, .425, .421],
    'sb-106-1': [.049, .154, .481, .145],
    'sb-106-2': [.049, .306, .481, .072],
    'sb-106-3': [.049, .386, .481, .025],
    'sb-106-4': [.049, .439, .481, .507],
    'wb-97-6': [.01, .038, .452, .816],
    'wb-97-7': [.01, .863, .452, .035],
    'wb-97-8': [.486, .073, .454, .428],
    'wb-145-4': [.01, .06, .465, .184],
    'wb-145-5': [.01, .249, .465, .292],
    'wb-145-6': [.01, .545, .465, .283],
}
TEXT1 = [('sb-106', [.557, .038, .435, .658]), ('sb-107', [.004, .28, .488, .414])]
TEXT2 = [('sb-106', [.557, .702, .435, .266]), ('sb-107', [.004, .711, .488, .253])]
MATERIALS = {
    'sb-87-10': [('sb-87', [.507, .058, .44, .88])],
    'sb-106-2': TEXT1,
    'sb-106-3': TEXT2,
    'sb-106-4': TEXT1 + TEXT2,
    'wb-97-7': [('wb-97', [.014, .246, .447, .608])],
}


def apply_task_views(pages, sources, texts):
    by_page = {p['id']: p for p in pages}
    writing = {
        'id': 'wb-97-8', 'label': '8', 'answerSpec': [], 'key': '',
        'keySource': None, 'teacherRegion': None, 'answers': [],
        'answerVersion': hashlib.sha256(b'focus-3:wb-97-8:written:v1').hexdigest()[:12],
        'responseFields': [{'label': 'Мой отзыв', 'long': True}],
        'interaction': {'type': 'fields'}, 'nativeInteraction': True,
        'marking': {'mode': 'open', 'instruction': 'Напиши отзыв о событии по условию. Ответ проверит преподаватель.'},
    }
    by_page['wb-97']['exercises'].append(writing)
    cache = {}

    def rows(page):
        if page['id'] not in cache:
            if page['book'] == 'wb':
                cache[page['id']] = json.loads((R / f"data/ocr/wb-{page['pdfPage']}.jpg.json").read_text())
            else:
                data = texts[page['book']][str(page['pdfPage'])]
                cache[page['id']] = [{'x': s['bbox'][0] / data['width'], 'y': s['bbox'][1] / data['height'], 'text': s['text']} for s in data['spans']]
        return cache[page['id']]

    def source(page, box):
        # Existing page sources carry the actual raster dimensions.
        size = next(s['size'] for model in sources.values() for s in model['sources'] if s['image'] == page['image'])
        return {'image': page['image'], 'page': page['page'], 'size': size, 'box': box}

    for page in pages:
        for exercise in page['exercises']:
            key = exercise['id']
            if key not in BOXES:
                continue
            box = BOXES[key]
            x, y, width, height = box
            exercise.update(box=box, x=x + .006, y=y + .004)
            clipped = [r for r in rows(page) if x <= r['x'] < x + width and y <= r['y'] < y + height]
            exercise['text'] = '\n'.join(r['text'] for r in sorted(clipped, key=lambda r: (round(r['y'] / .006), r['x'])))
            context = [s for s in sources.get(key, {}).get('sources', []) if s.get('context')]
            if not context:
                context = [dict(source(page, [.01, .01, .98, .97]), context=True)]
            sources[key] = {'label': exercise['label'], 'sources': [source(page, box)] + [source(by_page[page_id], crop) for page_id, crop in MATERIALS.get(key, [])] + context}
    (R / 'audit/task-views.json').write_text(json.dumps({'reviewedBoxes': BOXES, 'relatedMaterials': MATERIALS, 'restoredTasks': ['wb-97-8']}, ensure_ascii=False, indent=2) + '\n')
