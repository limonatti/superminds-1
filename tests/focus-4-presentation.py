"""Regression checks for source-only cards, ambiguous layouts and full coverage."""
from pathlib import Path
import copy
import importlib.util
import json

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT/'focus-4-active-teach'
spec = importlib.util.spec_from_file_location('presentation', BASE/'presentation.py')
p = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p)
read = lambda path: json.JSONDecoder().raw_decode(path.read_text().split('=', 1)[1].lstrip())[0]
data = read(BASE/'assets/course.js')
models = read(BASE/'assets/focus-models.js')
catalog = {e['id']: (pg, e) for pg in data['pages'] for e in pg['exercises']}
texts = {b: json.loads((BASE/f'data/{b}-text.json').read_text()) for b in ['sb', 'wb', 'ws']}
report = json.loads((BASE/'audit/presentation.json').read_text())
assert len(report['tasks']) == len(catalog) == 1527
assert sum(report['controls'].values()) == len(catalog)
for pg, e in catalog.values():
    assert e['nativeInteraction']
    assert e['interaction']['type'] in {'fields', 'choices', 'multi', 'bank', 'order', 'opinion', 'oral'}
    if e.get('responseMode') == 'oral':
        assert e['interaction']['type'] == 'oral'
    else:
        fields = e['answerSpec'] or e['responseFields']
        assert fields
        if 'rows' in e['interaction']:
            assert len(fields) == len(e['interaction']['rows'])
for id in ['sb-4-1', 'sb-5-6', 'sb-13-8', 'sb-88-3']:
    pg, e = catalog[id]
    spans, source = p.region(pg, e, texts)
    before = p.numbered_spans(spans, source, e)
    poisoned = copy.deepcopy(e)
    for field in poisoned['answerSpec']:
        field['accepted'] = ['SECRET_KEY']
    assert p.numbered_spans(spans, source, poisoned) == before
    hidden = copy.deepcopy(spans)
    for span in hidden:
        if span['color'] in p.HIDDEN:
            span['text'] = 'SECRET_TEACHER_TEXT'
    assert p.numbered_spans(hidden, source, e) == before
    assert 'SECRET_' not in json.dumps(before)
assert catalog['sb-4-1'][1]['interaction']['rows'][0]['options'][0] == {'label': 'a. career', 'value': 'a'}
assert models['sb-5-6']['prompts']['10'] == 'The father scraped through / failed his exams.'
assert 'Collocations' not in json.dumps(catalog['sb-8-4'][1]['interaction'])
assert not models.get('sb-59-3', {}).get('prompts'), 'inline numbers must not become chopped sentences'
assert 'wb-6-1' not in models, 'missing OCR item 2 must not merge questions 1 and 2'
assert 'sb-136-5' not in models, 'a running article is not a list of independent prompts'
for id, forbidden in [('sb-59-3', 'Comparing'), ('sb-91-4', 'Beginning'), ('sb-153-3', 'Empty'), ('wb-7-3', 'forget'), ('wb-55-4', 'Have')]:
    assert forbidden not in catalog[id][1]['interaction']['items']
assert 'find' in catalog['sb-82-1'][1]['interaction']['items']
assert 'childhood' in catalog['wb-148-1'][1]['interaction']['items']
for id, model in models.items():
    assert model['source']['book'] in ['sb', 'wb', 'ws']
    assert set(model.get('prompts', {})) <= {f['label'] for f in catalog[id][1]['answerSpec'] or catalog[id][1].get('responseFields', [])}
    for text in list(model.get('prompts', {}).values()) + model.get('bank', []):
        assert not any(ord(ch) < 32 for ch in text), id
print('PASS Focus 4 presentation: every task has controls; source text/cards exclude hidden keys; ambiguous layouts fall back to original.')
