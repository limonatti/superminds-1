# Complete exercise source view

The existing study interface keeps its course colours and typography. This is a
functional two-pane reader: full original task on the left, answer controls on
the right. Design variance 2/10, motion 1/10, density 6/10. No decorative motion
or new design system is introduced.

| Before | After | Why |
| --- | --- | --- |
| Small strips could omit the rest of a task or its printed context. | Complete numbered tasks and their related source regions, sized to the source pane. | The task is readable without opening a separate full-page view. |
| Some A1 inputs and choices covered the printed image. | The same live controls are in the answer pane. | Original text remains unobstructed, with existing answer records and checks retained. |
| Solutions and B2+ stacked the source above all answers. | A common two-column dialog with independent scrolling. | Learners can refer to the original while working. |
| Identical C quiz rubrics always matched the first PDF page. | Rubric matching advances through the document. | Vocabulary and How To tasks open their own original pages. |

`exercise-source.js` and `exercise-source.css` provide the shared viewer. Each
course loads `assets/exercise-sources.js` before its existing answer engine.
The source image files, question IDs, answer schemas and grading keys remain
unchanged. The source viewer contains no editable answer controls.

The same original exercise bounds now act as mouse/touch targets in all six
books. Click an exercise body or its number to open the existing centered dialog.
The shared `ExerciseSource.regions` helper retains each native button and its
keyboard, grading and persistence handlers. Drawing tools keep their existing
priority over exercise targets. B2+ already used whole exercise targets.

A1 has 49 restored page targets, recorded in `audit/regions-restored.json`, using
the supplied PDFs. The existing `wb:21:3B` list entry is retained but has no page
target because page 21 prints exercise 3 without a separate B instruction.
Answer record IDs and grading keys are unchanged.

The desktop dialog uses the available viewport. The original task fits the pane
by default; explicit zoom remains available. Longer supporting texts and images
follow the main task in the source pane. On narrow screens, the complete source
comes before the answer form in one scrollable column. Escape and the close
button remain available.

Coverage: Speakout A1, B1, B1+, B2+, Solutions Intermediate and Outcomes Beginner.
The six manifests contain 7,543 book exercise entries. The B1+ test manifest
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
