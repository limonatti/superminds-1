# Outcomes exercise audit

The supplied scanned Student’s Book and Workbook and their matching Teacher’s Book
are the sources. Printed page numbers are used throughout; PDF/image IDs have offsets
SB +3 and WB +1. The supplied archives were labelled 3ed, but their book copyright
pages identify the ©2019 materials; the grading bank follows the supplied pages.

The authoritative editable runtime source is **reviewed-tasks.json**. Rebuild with
`python3 scripts/build-outcomes-checks.py`; this validates IDs/labels/modes, derives
per-task rubric revisions and writes assets/exercises.js and coverage.json.

The audit compared the exercise roster against source pages and teacher instructions
for all 12 units of both books, six SB Review spreads, six SB Video sections,
12 WB Vocabulary Builder quizzes and the complete Grammar Reference, pages 114–137.
Listening/repetition, personal writing and discussion remain interactive response
or self-review tasks. They do not become objectively graded just because a response
field exists. File cards, tables, texts and reference pages without numbered
exercises are displayed as source material, not invented exercises.

Source evidence files:

- student-source.json / workbook-source.json: raw extracted teacher-key blocks.
- student-corrections.json / workbook-corrections.json: reviewed overrides and key-to-task mappings.
- hotspot-corrections.json: original OCR target corrections, removals and additions.
- review-keys.json / supplemental-keys.json: reviewed Review keys and transcript-derived answers.
- grammar-keys.json: Grammar Reference keys, with merged A/B personal-response fields.
- reviewed-tasks.json: final corrected coordinates, labels, answer alternatives and grading policy.

Final-source corrections additionally include SB13 negative money sentence (not 35 euros;
29), all eight SB101 exercise 13 answers, SB99 exercise 8 conversation 3, WB4 wordsearch
including ELEVEN (column eight), WB9 capital-letter selection rather than full-sentence
entry, accepted was/were for the isolated verb be, complete grammar sentence variants,
and explicit separation of free answers from objective questions. WB36 danced is
classified /t/ despite the erroneous /d/ grouping in the supplied teacher key.

Some teacher keys provide only fragments, show suggestions or omit a listening answer;
these were resolved against the relevant exercise/transcript or retained as ungraded
models. The checker does not claim semantic grading of arbitrary English responses.
Published scan assets and existing account/cloud save mechanics are unchanged.

## November 2026 interaction refresh

The course now uses its own responsive answer panel; learners no longer position
unmapped fields on the scan. Original exercise IDs, stored array indices and keys
remain intact. `practice` metadata in `reviewed-tasks.json` supplies printed banks,
separate gap controls, optional help and examples. Banks are transcribed from the
printed material, not assembled from the answer key. `check.items[].given` excludes
printed examples; generated `parts` check individual blanks while retaining the
legacy combined answer string. Previously assessed records retain their values,
completion where still valid, timestamp and original assessment in answer history.

| Before | After |
| --- | --- |
| Phone document wider than viewport | Wrapping header, bounded dialog, 44 px controls |
| Learner places fields on a scan | Stable numbered controls beside the original |
| Several blanks share one required string | Independent gap controls and feedback; old strings retained |
| Speaking activities demand typed answers | Personal practice steps and optional notes |
| Some banks remain only in a picture | Source-based tap controls and optional typing |
| Shared trainer uses generated speech | Outcomes cards with original unit recordings and no TTS |

`node scripts/build-outcomes-refresh.cjs` builds `transcripts.js` and the separate
`refresh-coverage.json` inventory. The latter distinguishes original pedagogical
scope, available interaction formats and required typing. It is not a claim that
every exercise has been manually rewritten or that every source scan was corrected.
All 1,324 existing tasks (746 SB, 456 WB, 122 Grammar), 12 units, 63 Vocabulary
Builder pages and 5 vocabulary-reference pages retain their original scope.
The existing 887 word cards remain available, with browser-local self-assessment.

Original audio files are unchanged. All 278 have source text-page links: dedicated
audioscripts where printed, otherwise the material printed with the task. Workbook
transcript regions use the original page image and verified track markers; the
full-page link stays available. The file `resources/scripts.pdf` is teaching advice,
not a transcript, and is not used as one. Missing media-page associations are explicitly
listed in the refresh builder. No new speech is generated.

Validation:

- `python3 check.py`
- `node tests/outcomes-refresh.cjs`, the existing Outcomes and coursework tests
- Local server: `python3 -m http.server 8768 --bind 127.0.0.1`
- `PLAYWRIGHT_MODULE=/path/to/playwright node tests/outcomes-refresh-browser-actions.cjs`
- Same command for `browser-coverage.cjs` and `browser-media.cjs`

Browser tests use a new guest context, block network writes and account services,
and mute media before any test playback. They cover every task opening, real tap
and keyboard actions, mode changes, independent blank feedback, guest reload,
source images/transcripts, portrait/landscape and a reduced-height keyboard proxy.
Physical iOS/Android keyboards and real account synchronization are not exercised;
coursework transport, durability and account isolation are tested separately with mocks.
