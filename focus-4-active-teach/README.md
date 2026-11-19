# Focus 4 Second Edition

Focus 4 is a separate course on the existing English with Asya platform, with
its own progress namespace, homework helper and live classroom registration.
The course uses the supplied Second Edition books; Focus 3 remains unchanged.

## Contents and interaction

- Eight units; Student’s Book, Workbook and Word Store, including reference pages.
- 389 page entries and 1,498 source-linked exercise entries.
- 135 exercises with clickable alternatives/matching, 20 printed word banks,
  editable response fields, and oral completion. Original task images and
  adjoining-page context remain accessible from each exercise.
- 619 exercises have finite, source-aligned automatic keys (including linked
  Word Store tasks). Open responses, ambiguous keys and fragmented letter keys
  remain for teacher review. Automatic coverage is deliberately incomplete.
- 123 supplied audio tracks and 315 downloadable resources: books, tests with
  audio, photocopiable materials, lesson plans and video lesson plans.
  Video recordings were not supplied; the player does not promise playback.
- Saved answers, per-item checks, teacher-only assignment, immutable submitted
  homework snapshots and classroom reports use the existing platform services.

The nine original archives were found in the user's Downloads folder because
the referenced Desktop folder was empty. Originals were not modified.
`audit/sources.json` records source PDF hashes. `data/teacher-evidence.json`
records red answer circles and margin panels from the Teacher’s Book.
`audit/coverage.json` and `audit/interactivity.json` record import coverage.
The interactivity audit precedes the linked Word Store copies.

## Rebuild

Requires Python with PyMuPDF and Pillow. Extract the nine Focus 4 archives into
`/tmp/focus4-source` after checking archive members for unsafe paths. Run from
the repository root:

```sh
python3 focus-4-active-teach/prepare.py /tmp/focus4-source
python3 focus-4-active-teach/evidence.py
python3 focus-4-active-teach/build.py
python3 focus-4-active-teach/stamp.py
node tests/focus-4.cjs
node tests/focus-4-assign.cjs
node tests/focus-4-player.cjs
python3 check.py
```

The two browser-runtime tests require `jsdom`. The importer uses checked-in
Workbook OCR to recover reviewed headings with missing PDF numerals. To
regenerate that OCR on macOS (requires Apple Vision):

```sh
swift focus-3-active-teach/ocr.swift focus-4-active-teach/assets/pages focus-4-active-teach/data/ocr
```

`prepare.py` validates rendered JPEGs and replaces partial output atomically.
`--metadata-only` does not materialize resources and is insufficient to publish.
Workbook downloads are split into Units 1–4, Units 5–8 and reference material,
keeping every file below GitHub’s individual file size limit.

## Verification

The course checks validate source crops, all unit mappings, actual assets and
audio references, printed choice options, source-verified marking samples,
recovered headings, isolated progress and immutable homework snapshots. The
player audit opens every task, selects choices/word cards or fills responses,
checks finite keys, saves, reopens and resets. The assignment test checks the
teacher gate, course, recipient and multi-book payload without sending real
homework. The existing Focus 3 regression suite is also run after integration.

Publish through the existing repository’s GitHub Pages workflow only after the
checks and actual browser verification pass.
