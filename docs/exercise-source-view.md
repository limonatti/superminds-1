# Complete exercise source view

The seven courses use a compact, single-column exercise dialog. The complete
original task appears above a shared bank of coloured word cards. Reviewed A1
coordinates and conservative generated gap coordinates put answer slots directly
on printed blanks; other answer types use a numbered strip just below the source.
Click a slot and card, or drag with mouse or touch. Keyboard selection and manual
entry remain available. Free writing and speaking keep their appropriate inputs.

`exercise-source.js` and `exercise-source.css` provide the complete original
viewer. `exercise-play.js` and `exercise-play.css` provide the shared interaction
surface. Each course passes its existing answer controls to the shared adapter.
Those original controls still own serialization, grading, hints and cloud sync;
there are no new answer IDs, answer keys, database tables or account rules.

The same original exercise bounds now act as mouse/touch targets in all six
books. Click an exercise body or its number to open the existing centered dialog.
The shared `ExerciseSource.regions` helper retains each native button and its
keyboard, grading and persistence handlers. Drawing tools keep their existing
priority over exercise targets. B2+ already used whole exercise targets.

A1 has 49 restored page targets, recorded in `audit/regions-restored.json`, using
the supplied PDFs. The existing `wb:21:3B` list entry is retained but has no page
target because page 21 prints exercise 3 without a separate B instruction.
Answer record IDs and grading keys are unchanged.

The dialog is at most 860 px wide and 820 px tall, with internal scrolling for
long tasks. The card bank stays within reach beneath the source. Explicit zoom,
full-page view, Escape and close remain available. On mobile the same surface
uses the available width. Motion is limited to card hover/press feedback and
respects reduced-motion preferences.

Coverage: Speakout A1, B1, B1+, B2+, Solutions Intermediate Outcomes Beginner and Focus 1.
The seven manifests contain 8,854 book exercise entries. The B1+ test manifest
covers all 739 sections of the 75 supplied test documents. Reading follow-ups
include the preceding reading source. General notes on tests remain available
in a disclosure below the test, including notes saved before this change.

Rebuild source manifests with Python and Pillow:

```sh
python3 scripts/build-exercise-sources.py
```

A1 uses its reviewed inline/choice source boxes where available; the static
regression check verifies that every printed blank and choice is included.
Other tasks join numbered substeps and explicit references, using source-column
boundaries and the original image dimensions. The audit records the page-level
coverage and any detected gutters. Rebuild B1+ test sources with pypdfium2:

```sh
python3 speakout-b1plus-active-teach/build_material_interactions.py
python3 scripts/build-test-exercise-sources.py
```

The second script locates the printed rubrics in the original PDFs, preserving
all pages of a task. `audit/material-sources.json` must have no unresolved issues.
Refresh index and lazy-loader asset version hashes after regenerating files.

Verification:

- `python3 check.py`
- `node tests/exercise-source-view.cjs --browser` with the repository on port 8768
- Existing A1 inline and choice browser tests: input, grading, keyboard, hints,
  retry, backup/import, all units, and exhaustive grading of 137 choice sets
- B1+ book, materials and interactive test browser suites
- B2+ exercise browser suite, including account isolation and two-device restore

Original task images are never edited. Supplemental photocopiables and literature
readers keep their original navigation; the complete-source view is for exercises
that already have interactive answer controls.

Check page-body clicks in both books and all 49 restored A1 targets:

```sh
COURSE_TEST_BASE=http://127.0.0.1:8768 node tests/exercise-regions-browser.cjs
```

## Word-card interaction and printed gaps

New geometry maps contain 3,785 book blanks and 1,235 test blanks, in addition to
A1's reviewed coordinates. Detected rules must match a complete numbered set or
an unambiguous reading-order set. Uncertain positions fall back to numbered slots
below the original; no image is modified and no answer is inferred from geometry.
Multi-part keys keep their original combined storage value and grading weight.

Rebuild geometry with Node, NumPy, Pillow and pypdfium2, with the source workspace
containing the existing OCR caches:

```sh
node scripts/export-exercise-play-models.cjs
python3 scripts/build-exercise-gaps.py /private/tmp/exercise-play-models.json --source-workspace /path/to/source/workspace
```

`tests/fixtures/exercise-gaps-audit.json` records mapped and unmapped fields.
`node tests/exercise-play.cjs --browser` checks actual mouse/touch dragging,
keyboard cards, seven compact layouts, grading/retry, persisted values, multi-part
answers, mobile overflow and B1+ test selection. The A1 inline/choice suites use
the new surface while retaining their original exhaustive answer-engine checks.

Focus 1 shares the compact card adapter and retains its marking, homework,
assignment and live-lesson contracts. A1 printed pair connections and multi-select
activities retain their dedicated gesture engine inside the same compact window.
