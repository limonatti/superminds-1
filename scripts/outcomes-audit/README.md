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
