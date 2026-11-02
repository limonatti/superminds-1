# Speakout B2+ Presentation Tool

Adaptation of the owner's complete Claude `SpeakoutPT` build dated 2026-09-03.
The source copy is preserved on the owner's Mac. This is a classroom presentation
tool. Exercise regions now open in a centered dialog over the original page.
There is no platform vocabulary deck.

## Contents

- 139 Student's Book pages and 94 Workbook pages. 35 SB pages were restored from
  the complete original PDF: the supplied JPEGs omitted text/vector layers.
- 32 lessons across eight units; Writing, Grammar and Vocabulary banks.
- 105 Student's Book tracks (including six previously unlisted Review tracks),
  75 Workbook tracks and 16 BBC videos.
- Original books, teacher notes, answer keys, audioscripts, photocopiables and tests.
- Drawing, highlighting, exercise regions, reveal/gap/matching/quiz activities,
  curtain, spotlight, timer, random student picker, teams and A–B audio repeat.

`audit/source-files.json` records source checksums; `audit/page-restoration.json`
records the corrected pages and renderer. Other page images are unchanged.
Videos use H.264/AAC, at most 720 pixels high, with fast-start
metadata; `audit/video.json` records sizes and verified durations. The 16 videos
were reduced from 850 MB to 213 MB. `optimize-video.py` documents the encoding.

## Platform integration

The course is registered as `speakout-b2plus`. The catalog, course assignment and
homework links open this tool. Other course levels remain independent.

- `index.html?unit=3&book=wb` opens Unit 3A in the Workbook.
- `index.html?lesson=3B&book=sb` opens lesson 3B.
- `index.html?book=sb&page=8` uses the **printed page number**.
- `sheet=7` uses the 1-based source image index instead.
- `section=grammar` opens the Grammar Bank.
- Root `speakout-b2plus*.html` routes and `speakout-book.html?course=speakout-b2plus`
  redirect here, preserving query parameters.

The page counter displays the source image index; the lesson bar displays the
printed number. Corrected the supplied UI's one-page offset and refreshed lesson
context when moving between pages. Workbook no longer displays Student's Book keys.

## Saving and portability

Drawings, custom regions and exercise answers use the platform's existing account.
Apply `sql/presentation-pages.sql` in the platform Supabase project before enabling
cloud operation. Until that migration is applied, the UI explicitly reports that
account saving is unavailable and retains edits locally; it never claims success.
Private rows are owned by `auth.uid()` and isolated with RLS. They do not touch
vocabulary progress. The RPC atomically merges changed strokes/regions/answer fields.
Deletions remain tombstones; distinct edits from other devices are preserved. For
the same answer or region, the last successful save wins.

Each account has a separate local queue. Offline edits retry automatically. The
current page refreshes every 30 seconds, on focus and on reconnect. Old browser
marks migrate once into the first account, without replacing existing cloud keys.
Switching accounts/signing out clears the displayed marks. Team names and other
classroom settings remain local per account. Export/import includes exercise answers;
original `speakout-pt-backup.json` exports are supported. File:// browser storage
cannot be read by the website; use an export from that offline copy.

## Interactive exercises

`data/exercises.js` maps 1,113 regions on 181 pages to the original page crops.
Inputs, selection fields, matching/custom quiz tasks and notes open in a native
centered dialog. Keyboard focus stays in the dialog; Escape closes it.
534 fields have conservative exact checks derived from unambiguous supplied SB keys.
Open questions are saved for discussion, without a fabricated correct/incorrect grade.
The workbook PDF's appended keys refer to a different course (e.g. Lesson 1A
is about daily routines, while this workbook's Lesson 1A is about relationships).
They are deliberately excluded from automatic checks. A teacher can add custom
gap/matching/quiz regions with verified answers. Missing response fields can be
added with **+ Ответ**.

`scripts/build-speakout-b2plus-exercises.py` rebuilds regions from local Vision OCR;
`audit/exercises.json` records coverage. Rendering full PDF pages uses
`scripts/render-presentation-pages.swift`.

`Tab` moves keyboard focus; `Alt+L` toggles the lesson menu. Dialogs use native
focus handling. On small screens the lesson list and materials open as drawers.

## Validation

From the repository root:

```sh
python3 check.py
node tests/speakout-b2plus.cjs
node tests/speakout-b2plus-sync.cjs
python3 -m http.server 8772 --bind 127.0.0.1
# In another terminal (set PLAYWRIGHT_PATH if needed):
node tests/speakout-b2plus.cjs --browser
node tests/speakout-b2plus-exercises.cjs
```

Tests cover file references, page checksums, printed page numbering, all units,
SB/WB navigation, audio/video metadata, keys, saved drawings, backup validation,
keyboard/dialog behavior, mobile sizing and platform redirects.
