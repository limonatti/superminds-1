# Focus 4 Second Edition

Focus 4 is a separate course on the existing English with Asya platform, with
its own progress namespace, homework helper and live classroom registration.
The course uses the supplied Second Edition books; Focus 3 remains unchanged.

## Contents and interaction

- Eight units; Student’s Book, Workbook and Word Store, including reference pages.
- 389 page entries and 1,527 source-linked exercise entries.
- Every one of the 1,527 entries has interactive controls: 188 choices/matching,
  28 word banks, 1,152 editable written tasks, 154 oral tasks with saved notes,
  three card-ordering tasks, one multiple-selection task and one opinion task.
  The shared Focus player provides item navigation, individual checks and reset.
  Original task images and adjoining-page context remain accessible.
- 359 source presentation models supply 2,032 item prompts and nine additional
  printed banks. Matching cards show the printed phrases when segmentation is
  complete. Ambiguous inline numbering, missing OCR labels and mixed columns
  retain the original image with editable answers. No options come from keys.
- 1,198 exercises have source-aligned automatic keys: 553 Student’s Book,
  589 Workbook and all 56 Word Store exercises, with 7,209 checked fields.
  The complete Workbook catalogue contains 598 records; its nine explicit
  “Students’ own answers” tasks remain manual. Personal and creative responses
  remain for teacher review; mixed tasks check their fixed part automatically.
- The checker handles printed alternatives, optional words, unordered lists,
  separate subparts, corrections, punctuation and stress. Factual text responses
  are checked against the supplied key formulations, without an AI semantic grader.
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
The interactivity audit precedes linked Word Store copies; `audit/key-coverage.json`
records final coverage and asserts that every finite Workbook key and Word Store
task is graded. The builder rejects orphaned, duplicate and ungraded extracted keys.
`data/key-overrides.json` preserves reviewed tables, cross-page keys, correction
keys and complete words reconstructed from printed initials. `data/answer-variants.json`
preserves ambiguous shared-prefix alternatives. Every override cites its Teacher
page. Changed field schemas preserve existing answers in the previous-answer section.
`presentation.py` runs after key alignment and linked worksheets. It preserves all
answer fields and versions; a presentation-only change does not invalidate saved
checks. `data/presentation-overrides.json` records reviewed printed cards, fixes
OCR word-box pollution and adds ordering/multiple-selection formats.
`audit/presentation.json` records the control type of every exercise. Oral notes
autosave without marking the task completed and appear in the teacher report;
completion can be toggled without losing the note.

## Rebuild

Requires Python with PyMuPDF and Pillow. Extract the nine Focus 4 archives into
`/tmp/focus4-source` after checking archive members for unsafe paths. Run from
the repository root:

```sh
python3 focus-4-active-teach/prepare.py /tmp/focus4-source
python3 focus-4-active-teach/evidence.py
python3 focus-4-active-teach/key_catalog.py
python3 focus-4-active-teach/build.py
python3 focus-4-active-teach/stamp.py
node tests/focus-4.cjs
node tests/focus-4-assign.cjs
node tests/focus-4-player.cjs
python3 tests/focus-4-presentation.py
python3 check.py
```

The two browser-runtime tests require `jsdom`. The importer uses checked-in
Workbook OCR and `data/workbook-heading-repairs.json` to recover reviewed headings
with missing PDF numerals. To
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
player audit opens every task, selects choices/word cards, assembles sequences,
toggles multiple answers or fills responses, checks finite keys, saves, reopens
and resets. It also checks oral-note autosave and completion undo. The source
test poisons hidden answers and checks ambiguous-layout fallbacks.
`audit/browser-interactivity.json` records the desktop and phone Chrome smoke
checks of actual buttons, source prompts, ordering, marking and persistent notes.
The assignment test checks the
teacher gate, course, recipient and multi-book payload without sending real
homework. The existing Focus 3 regression suite is also run after integration.

Publish through the existing repository’s GitHub Pages workflow only after the
checks and actual browser verification pass.
