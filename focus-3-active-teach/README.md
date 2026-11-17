# Focus 3 Second Edition

Live entry: `https://english-with-asya.com/focus-3-active-teach/index.html`.
The course uses the existing Focus player, account storage, homework snapshots and live lesson integration. It has its own `focus-3` data namespace and marking helper.

## Included

- All 8 units, Student’s Book printed pages 2–159, Workbook 1–175 and Word Store 1–18: 351 page views.
- 1,528 exercise entries with original task images, editable answers and saved progress. 894 have automatic checks; free responses and ambiguous answer keys remain available for teacher review.
- 151 tasks use native word banks, choice buttons, multiple selection or personal response controls. Other closed exercises use numbered answer fields beside the source page.
- 140 Student’s Book audio tracks, 64 Wordlist tracks, and 19 test audio files. All eight Workbook Listening Language Practice recording references link to the corresponding supplied Student’s Book tracks.
- 227 resource files, including the books, photocopiable worksheets and test package. The large Workbook PDF is split losslessly into units and reference material to stay below the GitHub per-file limit.
- 54 YouTube entries, mapped to the book’s video numbers and worksheet pages, with Person A/B variants one separate teacher explanation, and one partial BBC clip. `videos.html` is the shareable link index.
- Teacher exercise selection across books, homework assignment, student submissions, immutable submitted snapshots, classroom reports and live room course selection.

## Known source limits

Workbook pages 7, 21, 35, 49, 63, 77, 91 and 105 explicitly use extracts from Student’s Book recordings, not a separate Workbook audio set. These eight links are mapped from the printed source. Two BBC videos (10, *A hotel in the clouds*, and 24, *Caffeine alternatives*) were not found in their complete textbook form on YouTube as of 2026-11-17. Video 1 uses the original BBC documentary segment at 29:15–32:33; it has different editing and narration from the textbook version, and is explicitly labelled. Other video links were matched by book number/title, topic and/or visible original animation; third-party availability can change. Video 10D is an official BBC excerpt covering Exercise 5 questions 6–8 on page 120, but not the full lesson video. No remote videos were downloaded.

Automatic keys are derived from the supplied Teacher’s Book and Word Store, with conservative handling of ambiguous tasks. 41 exercise overrides have individual editorial corrections. `audit/coverage.json` records the current coverage; it does not claim that every open task has only one possible answer or that every source key received individual manual review.

## Rebuild

Use Python with PyMuPDF and Pillow. Source extraction is local in `/tmp/focus3-source`; original archive hashes and page mappings are recorded in `audit/sources.json`.

1. `python3 focus-3-active-teach/prepare.py` extracts source pages, text geometry, audio and resources. Workbook OCR JSON is preserved in `data/ocr/`.
2. `python3 focus-3-active-teach/evidence.py` extracts red teacher circles and answer margins.
3. `python3 focus-3-active-teach/video-catalog.py` builds the video catalogue and public link index.
4. `python3 focus-3-active-teach/build.py` builds course data, exercise sources and coverage. It also runs `enrich.py`, `appendix.py` and `variants.py` and applies reviewed overrides.
5. `python3 focus-3-active-teach/stamp.py` refreshes course and shared cache versions.

## Validation

Run `python3 check.py` before publishing, plus:

- `node tests/focus-3.cjs`: all page/crop/field/media integrity, samples from all units and appendix sections, normalization, gated keys, immutable homework and shared dispatch.
- `node tests/focus-3-click-interactions.cjs`: empty/correct/wrong answers, multiple selection, input events, restore and reset for all 151 native tasks / 917 fields (requires jsdom).
- `node tests/focus-3-assign.cjs`: teacher-only multi-book selection, correct course/recipient payload, video cleanup, timed BBC segment and worksheet navigation (requires jsdom).

Browser checks cover first-unit word-bank marking and reload persistence, oral completion, multiple selection, native Student’s Book and Wordlist playback, all-book navigation, materials and the video player. Assignment tests use mocks and do not send homework to real students.
