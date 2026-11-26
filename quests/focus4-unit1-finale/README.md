# The Academy Open Day

Original unit finale for **Focus 4 Second Edition, Unit 1: Live and learn**, sections **1.1–1.8**, B2. The entry follows Focus Review 1, SB p. 19; an additional shortcut is visible at the top of Unit 1. This is separate from the vocabulary-only Future Academy.

Six connected stations contain twelve authored challenges and fifty closed responses. Tasks cover education collocations and phrasal verbs; present/past habits; listening for main points; restoring a text through cohesion; verb patterns and meaning; interpreting pictures and speaking; formal register; and a CV with covering email. The reading story is fictional and original. Its relationship between injury and improvement is explicitly questioned rather than asserted as a medical fact.

Source map is stored on every task in `quest.js`, based on the current course data and supplied Teacher's Book. Banks and distractors were authored in context, not generated automatically from textbook answer keys. Open picture description, CV and email use learner criteria and teacher feedback, without automatic language marks. Only these personal responses require typing; picture description also supports an oral mode.

- Web: `/quests/focus4-unit1-finale/`
- Printable PDF: `/quests/focus4-unit1-finale/focus4-unit1-finale.pdf` (generated from the same task data by `scripts/build-quest-pdf.py`). It is a paper worksheet, not a fillable form.
- Required listening: the existing original human recording `focus-4-active-teach/media/sb-1.08.mp3`, SB p. 7. Four speakers, repeat/download controls, exact supplied transcript from Teacher's Book printed pp. 197–198 / PDF pp. 219–220. The transcript is also included in the PDF for paper use.
- Optional vocabulary support: existing human SB track 1.02 with transcript, as in the first quest.
- One generated four-scene illustration participates directly in challenges 9 and 10. See `assets/image-prompts.md`.
- Progress uses `quest:focus4-unit1-finale:*` within the existing `focus-4` CourseWorkStore. No textbook IDs or existing answers are overwritten.
- No teacher-key PDF is exposed in this student route.

Validation: `tests/focus4-unit1-finale.cjs`, `tests/focus4-unit1-finale-browser.cjs`, shared-player regressions, course navigation check and `check.py`; deployment/live verification evidence in `docs/quest-releases/`.
