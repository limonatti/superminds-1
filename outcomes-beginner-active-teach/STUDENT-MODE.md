# Student practice

The course opens from the existing student course list. Vocabulary is registered in
`course-words.js`, with `assets/words.json` as its generator source: 848 unique
entries within their units, across all 12 Vocabulary Builder units. Repeated
headwords in different units are retained. The shared trainer uses IDs `outc-u1`
through `outc-u12` and supports flashcards and the existing training modes.

`assets/exercises.js` contains click targets derived from the supplied page OCR
on 168 SB/WB unit pages. The original image is the authoritative task wording.
Targets open answer forms, with alphabet choices for matching where detected,
and selectable ordering where detected. Learners can add response fields. An
extra target marked + represents an instruction whose printed number was not
reliably recognised. OCR targets and item counts are not a manually verified
transcription of every exercise. No automatic correctness or grades are claimed.
Speaking and writing responses are also entered as text for teacher review;
there is no speech recording or automatic essay assessment.

Answers are independent of presentation ink. They are stored by account ID in
localStorage and under `progress.data.__coursework['outcomes-beginner']` for
signed-in users. Guests retain answers only in the current browser. Failed
cloud writes retain the local copy, and answers can be downloaded as JSON.
The existing homework assignment status is not automatically changed by marking
an individual exercise complete. Saved responses appear in the existing teacher class page under Outcomes, using
the student progress returned by the existing teacher-authorized class API.
Assignments support all 12 units and SB / Grammar / WB links.

Verification: `node tests/outcomes-student.cjs` and `python3 check.py`.
