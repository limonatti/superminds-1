# Focus 3 Second Edition

Live entry: `https://english-with-asya.com/focus-3-active-teach/index.html`.
The course uses the existing Focus player, account storage, homework snapshots and live lesson integration. It has its own `focus-3` data namespace and marking helper.

## Included

- All 8 units, Student’s Book printed pages 2–159, Workbook 1–175 and Word Store 1–18: 351 page views.
- 1,528 exercise entries with original task images and saved progress: 1,322 written/choice tasks and 206 oral tasks with a completion control. 914 have automatic checks; free responses and ambiguous answer keys remain available for teacher review.
- 175 tasks use word banks, choice buttons, multiple selection or personal response controls. Other written exercises use labeled answer fields beside the source page or accurately positioned inline blanks. Printed alternatives and item labels supply controls independently of answer keys.
- 140 Student’s Book audio tracks, 64 Wordlist tracks, and 19 test audio files. All eight Workbook Listening Language Practice recording references link to the corresponding supplied Student’s Book tracks.
- 227 resource files, including the books, photocopiable worksheets and test package. The large Workbook PDF is split losslessly into units and reference material to stay below the GitHub per-file limit.
- 55 video entries (52 YouTube and 3 VK Video), covering all 38 textbook video numbers, 16 Person A/B variants and one separate teacher explanation. `videos.html` is the shareable link index.
- Teacher exercise selection across books, homework assignment, student submissions, immutable submitted snapshots, classroom reports and live room course selection.

## Known source limits

Workbook pages 7, 21, 35, 49, 63, 77, 91 and 105 explicitly use extracts from Student’s Book recordings, not a separate Workbook audio set. These eight links are mapped from the printed source. Complete textbook edits of BBC videos 1 (*Distressing jeans*), 10 (*A hotel in the clouds*) and 24 (*Caffeine alternatives*) open on VK Video in a new tab, with English subtitles. The VK iframe returned “video unavailable” in local testing; the browser site-safety gate subsequently blocked vk.ru, so embedded playback could not be validated. The course uses an explicit watch-page link instead of a non-working iframe. Playback and opening/middle/closing scenes were checked against the supplied scripts on 2026-11-17. The former alternative edit of video 1 and partial clip 10D have been replaced. All 38 core video numbers are present. Other links were matched by book number/title, topic and/or visible original animation; third-party availability can change. No remote videos were downloaded.

Automatic keys are derived from the supplied Teacher’s Book and Word Store, with conservative handling of ambiguous tasks. 41 exercise overrides have individual editorial corrections. `audit/coverage.json` records the current coverage; `audit/interactivity.json` records source-based control repairs by book and unit. These reports do not claim that every open task has only one possible answer or that every source key received individual manual review.

## Rebuild

Use Python with PyMuPDF and Pillow. Source extraction is local in `/tmp/focus3-source`; original archive hashes and page mappings are recorded in `audit/sources.json`.

1. `python3 focus-3-active-teach/prepare.py` extracts source pages, text geometry, audio and resources. Workbook OCR JSON is preserved in `data/ocr/`.
2. `python3 focus-3-active-teach/evidence.py` extracts red teacher circles and answer margins.
3. `python3 focus-3-active-teach/video-catalog.py` builds the video catalogue and public link index.
4. `python3 focus-3-active-teach/build.py` builds course data, exercise sources and coverage. It also runs `enrich.py`, `appendix.py`, `variants.py` and `interactivity.py` and applies reviewed overrides.
5. `python3 focus-3-active-teach/stamp.py` refreshes course and shared cache versions.

## Validation

Run `python3 check.py` before publishing, plus:

- `node tests/focus-3.cjs`: all page/crop/field/media integrity, samples from all units and appendix sections, normalization, gated keys, immutable homework and shared dispatch.
- `node tests/focus-3-click-interactions.cjs`: empty/correct/wrong answers, multiple selection, input events, restore and reset for all 1,322 written tasks / 6,948 fields (requires jsdom).
- `node tests/focus-3-player.cjs`: all 1,528 tasks in the actual player with shared exercise helpers, including marking, save/reopen/reset and oral completion persistence. Storage and classroom transport are mocked; optional `FOCUS3_AUDIT_REPORT=focus-3-active-teach/audit/player-validation.json` writes the full per-unit result (requires jsdom).
- `node tests/focus-3-assign.cjs`: teacher-only multi-book selection, correct course/recipient payload, video cleanup, all three full VK BBC watch links, switching between VK and YouTube and worksheet navigation (requires jsdom).

Browser checks cover a representative task from every unit in each of the three books, all three repaired option ranges, source-choice reload persistence, oral completion, mobile source/answer switching and marking. Earlier checks also cover first-unit word banks, multiple selection, native Student’s Book and Wordlist playback, materials and the video player. Assignment tests use mocks and do not send homework to real students.
