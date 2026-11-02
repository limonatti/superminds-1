# Speakout B2+ Presentation Tool

Adaptation of the owner's complete Claude `SpeakoutPT` build dated 2026-09-03.
The source copy is preserved on the owner's Mac. This is a classroom presentation
tool: exercises are marked by the teacher; the supplied build does not contain
pre-marked exercise regions or a platform vocabulary deck.

## Contents

- 139 Student's Book scans and 94 Workbook scans, unchanged from the supplied files.
- 32 lessons across eight units; Writing, Grammar and Vocabulary banks.
- 105 Student's Book tracks (including six previously unlisted Review tracks),
  75 Workbook tracks and 16 BBC videos.
- Original books, teacher notes, answer keys, audioscripts, photocopiables and tests.
- Drawing, highlighting, exercise regions, reveal/gap/matching/quiz activities,
  curtain, spotlight, timer, random student picker, teams and A–B audio repeat.

`audit/source-files.json` records source checksums. The page images are identical
to those checksums. Videos use H.264/AAC, at most 720 pixels high, with fast-start
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

Drawings, custom exercise regions and classroom tools are saved in this browser
under `ewa_speakout_b2plus_*`. They are not uploaded to the student's cloud progress.
Use **Экспорт разметки и заметок** / **Импорт разметки** in the lesson menu to move
work between computers. Original `speakout-pt-backup.json` exports are supported.
A website cannot automatically read storage belonging to the offline file.

`Tab` moves keyboard focus; `Alt+L` toggles the lesson menu. Dialogs use native
focus handling. On small screens the lesson list and materials open as drawers.

## Validation

From the repository root:

```sh
python3 check.py
node tests/speakout-b2plus.cjs
python3 -m http.server 8772 --bind 127.0.0.1
# In another terminal (set PLAYWRIGHT_PATH if needed):
node tests/speakout-b2plus.cjs --browser
```

Tests cover file references, page checksums, printed page numbering, all units,
SB/WB navigation, audio/video metadata, keys, saved drawings, backup validation,
keyboard/dialog behavior, mobile sizing and platform redirects.
