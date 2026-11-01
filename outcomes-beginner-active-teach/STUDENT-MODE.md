# Student practice

The course opens from the existing student course list and assigned homework.
The shared word trainer retains all 848 Vocabulary Builder entries in 12 units
(`outc-u1` through `outc-u12`), including flashcards.

## Audited exercises and checking

`assets/exercises.js` is generated from `scripts/outcomes-audit/reviewed-tasks.json`
by `python3 scripts/build-outcomes-checks.py`. It contains 1,324 interactive targets:
746 on Student’s Book unit/review/video pages, 456 on Workbook unit/quiz pages,
and 122 in the Student’s Book Grammar Reference (printed pages 114–137).
The original page remains visible beside each response form. The bank replaces
heuristic OCR response counts and stray numbered-list/audio-track targets with
reviewed exercise targets and numbered answer fields. See the audit directory
for source-key extraction, corrections, coverage and provenance.

Closed answers have deterministic checking: errors and blanks are identified per
field, correct answers are retained, and editing invalidates the old result.
After the first check, leaving an edited field rechecks the exercise. Learners can
reveal/hide the key after attempting it. The record retains that a key was revealed.
Each rubric has a content revision so stale results cannot be shown against changed
keys. Examples printed in the books remain part of the numbered response form.

The checker accepts declared alternatives, contractions/full forms, punctuation
and capitalization differences, and reordered sets where appropriate. Explicit
contraction/capital-letter tasks preserve their respective constraints. Numeric
values, negative signs, grammar changes, missing words and spelling differences
are not silently treated as correct.

Personal writing, discussion and other open answers use a model/checklist; they
are not automatically scored. Reading responses with multiple valid formulations
are marked for comparison rather than wrong solely because of different wording.
Mixed exercises score only the closed fields and separately require self-review.
There is no automatic speech/essay assessment. Video tasks retain their keys and
original instructions; this release does not supply missing video files.

## Saving

Answers are independent of presentation ink. They are stored by account ID in
localStorage and under `progress.data.__coursework['outcomes-beginner']` for
signed-in users. Guests retain answers only in the current browser. Failed cloud
writes retain the local copy, and learners can download their responses as JSON.
Existing saved answers are preserved; surplus legacy fields are retained in
`legacyValues` when a reviewed form has fewer fields. Automatic completion cannot
be set with the manual checkbox. Free responses use an explicit self-review checkbox.
The existing homework assignment status is not automatically changed by completing
an individual exercise. The teacher class page displays saved responses, checking
results and whether the learner revealed the key.

Verification: `node tests/outcomes-grader.cjs`, `node tests/outcomes-student.cjs`,
`python3 check.py`, and browser testing of wrong/correct answers, repeated attempts,
key reveal, persistence after navigation and ungraded self-review.

## Presentation interactions (November 2026)

Clicking the exercise number opens a focused modal showing a crop of that exercise.
The window includes previous/next exercises on the page, zoom, full-page context,
a source curtain, and audio playback speed/repeat. Keyboard focus returns to the
exercise trigger when the window closes. All 1,324 exercise IDs retain their stored
answer strings and existing grading rubrics.

`assets/interactions-data.js` supplies source text/crop geometry, generated with
`scripts/build-outcomes-interactions.py` from the supplied SB/WB OCR JSON files.
`assets/interactions.js` selects conservative controls using the printed task:
choice buttons, matching, word banks, multi-selection and sentence building.
The current corpus has 1,047 enhanced response fields; other fields remain text
inputs for gap filling, spelling, writing and tasks whose choices cannot be safely
reconstructed. Distractors come from the supplied exercise, not invented alternatives.
Sentence banks are shuffled and preserve repeated tokens. Buttons support keyboard
and touch activation; matching/bank/sentence tiles additionally support pointer drag.
Free responses keep the existing self-review policy. This is a platform-native
presentation interface, not the publisher's proprietary ActiveTeach software.

Verification also includes `node tests/outcomes-interactions.cjs` and browser checks
of the printed-number hotspot, choices, correction, sentence tile add/remove/drag,
saved responses, navigation, zoom, full-page context and the source curtain.
