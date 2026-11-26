# The Memory Museum

Focus 4 **Second Edition**, **Unit 1.3 Listening: Memory**, Student's Book p. 7, B2. The course entry follows page 7 and is also visible at the top of Unit 1.

Three stations, six original challenges and twenty checked responses: memory expressions, a visual route, specific listening details, six vowel sounds of **ea**, a personal interview and a 60–90-word mnemonic story. The generated picture supplies four object pairs. Its optional Hide / Show control works by mouse and keyboard, has no timer and saves its state. Open speaking and writing tasks retain the learner's response and criteria without an automatic grade.

Original human recordings **SB 1.08** (four speakers on memory) and **SB 1.10** (pronunciation) belong to this subsection. Each has playback, repeat, download and a transcript. Sources: Teacher's Book printed pp. 197–198 / PDF pp. 219–220 for 1.08; SB p. 7, exercise 8 for the 1.10 word list. The pronunciation matching uses newly authored rhyming partners. The generated four-room route and exact image prompt are in `assets/`.

- Web: `/quests/focus4-memory-museum/`
- PDF: `/quests/focus4-memory-museum/focus4-memory-museum.pdf` — 9-page printable worksheet, including the listening transcript; not an electronic form.
- Content and accepted answers: `quest.js`.
- Build: `scripts/build-quest-pdf.py focus4-memory-museum`.
- Saved records: `quest:focus4-memory-museum:*` in the existing `focus-4` store. No textbook answer IDs changed.
- Checks: `tests/focus4-memory-museum.cjs`, `tests/focus4-memory-museum-browser.cjs`, shared-player regressions and `check.py`.

The video audit remains a separate queued task; this release makes no video-coverage claim.
