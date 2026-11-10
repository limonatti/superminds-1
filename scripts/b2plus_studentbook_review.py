"""Apply documented corrections without changing exercise IDs or Workbook answers."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def apply_review(bank):
    review = json.loads((ROOT / 'scripts/data/b2plus-studentbook-review.json').read_text())
    exercises = {e['id']: e for page, items in bank.items() if page.startswith('sb:') for e in items}
    for exercise_id, change in review['exercises'].items():
        exercise = exercises[exercise_id]
        exercise.update(change.get('properties', {}))
        if 'key' in change:
            exercise['key'] = change['key']
        suffix = change.get('remove_key_suffix')
        if suffix and exercise['key'].endswith(suffix):
            exercise['key'] = exercise['key'][:-len(suffix)].rstrip()
        if 'replace_fields' in change:
            exercise['fields'] = change['replace_fields']
        for field in exercise['fields']:
            field.update(change.get('fields', {}).get(field['n'], {}))
            if 'choices' in change:
                field['choices'] = change['choices'][:]
    for page, additions in review.get('added_exercises', {}).items():
        current = {e['id']: e for e in bank.setdefault(page, [])}
        for exercise in additions:
            if exercise['id'] in current:
                current[exercise['id']].update(exercise)
            else:
                bank[page].append(exercise)
    return bank

if __name__ == '__main__':
    path = ROOT / 'speakout-b2plus-active-teach/data/exercises.js'
    text = path.read_text()
    prefix, raw = text.split('=', 1)
    bank, end = json.JSONDecoder().raw_decode(raw)
    apply_review(bank)
    path.write_text(prefix + '=' + json.dumps(bank, ensure_ascii=False, separators=(',', ':')) + raw[end:])
