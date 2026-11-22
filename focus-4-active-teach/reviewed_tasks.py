"""Apply exact-source reviews after automatic extraction, without guessing keys."""
from pathlib import Path
import copy
import json
R = Path(__file__).resolve().parent

def apply(pages, sources):
    catalog = {e['id']: e for p in pages for e in p['exercises']}
    for id, review in json.loads((R/'data/reviewed-tasks.json').read_text()).items():
        e = catalog[id]
        for key in review.get('remove', []):
            e.pop(key, None)
        e.update(copy.deepcopy(review['update']))
        sources[id]['sources'] = copy.deepcopy(review['sources'])
    report_path = R/'audit/presentation.json'
    if report_path.exists():
        from collections import Counter
        report = json.loads(report_path.read_text())
        for task in report['tasks']:
            task['type'] = catalog[task['id']]['interaction']['type']
        report['controls'] = dict(Counter(t['type'] for t in report['tasks']))
        report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')

if __name__ == '__main__':
    def read(name):
        return json.JSONDecoder().raw_decode((R/'assets'/name).read_text().split('=', 1)[1].lstrip())[0]
    data, sources = read('course.js'), read('exercise-sources.js')
    apply(data['pages'], sources)
    for file, name, value in [('course.js','FOCUS4',data),('exercise-sources.js','EXERCISE_SOURCES',sources)]:
        (R/'assets'/file).write_text('window.'+name+' = '+json.dumps(value,ensure_ascii=False,separators=(',',':'))+';\n')
