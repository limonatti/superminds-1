# The Future Academy

Original vocabulary quest for Focus 4 **Second Edition**, Unit **1.1 Vocabulary / Live and learn**, after Student's Book pages 4–5.

- 6 stations, 12 original challenges, 47 closed answers; separate dialogue and 60–80-word writing with learner criteria and teacher feedback.
- 3 generated illustrations from the approved source package. `assets/image-prompts.md` retains provenance.
- The approved English student PDF is copied byte-for-byte, not regenerated. SHA-256 is recorded in the release evidence under `docs/quest-releases/`.
- The teacher key remains a separate private working resource. It is not part of this learner route.
- Source authoring file: `build_english.py` in Asya's supplied Focus 4 quest package, updated 26 November 2026. Its 12 tasks and answer variants are represented in `quest.js`.
- Human audio: the existing Pearson SB track `focus-4-active-teach/media/sb-1.02.mp3`; transcript extracted from the supplied Teacher's Book, printed page 197 / PDF page 219. This optional support does not add a thirteenth challenge or change PDF numbering.
- CourseWorkStore records use `quest:focus4-live-and-learn:*` inside `focus-4`. Existing textbook answers are untouched.

Web: `/quests/focus4-live-and-learn/`.
PDF: `/quests/focus4-live-and-learn/focus4-live-and-learn-quest.pdf`.

Checks: `node tests/future-academy.cjs`, `node tests/future-academy-browser.cjs`, existing Focus 4 regression and coursework durability tests, and `python3 check.py`.
