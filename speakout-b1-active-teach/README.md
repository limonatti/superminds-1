# Speakout Third Edition B1

Rebuilt from the eleven files supplied by the owner on 2 November 2026. Source
filenames, byte counts and SHA-256 hashes are recorded in `audit/sources.json`.

## Coverage

- Eight units, original Student’s Book and Workbook, Grammar/Vocabulary/Mediation
  Banks, reviews, keys and reference pages.
- 149 distinct SB pages and 94 WB pages. Printed page numbers remain authoritative.
- The SB PDF repeats pages 6–18. Duplicate scans are omitted from navigation.
- SB pages 146–149 (Communication Bank) and 158–173 (audio/video scripts) are absent
  from the supplied book. They are not reconstructed or silently renumbered.
  The separate video scripts and Teacher’s Book remain available in Materials.
- WB pages 76–96 use the clean, searchable, separately supplied Workbook Keys PDF;
  this also supplies pages 95–96 missing from the Workbook file.
- 177 course audio tracks, 16 web-optimized videos and 266 resource files. Nine
  extra SB tracks named `0XA`/`0XB`/`0XC` are available under their units; no lesson
  association is invented when the book does not name the track.
- `audit/coverage.json` records page-to-PDF mapping, duplicates, missing pages,
  task counts and media coverage. SB pages 25 and 69 are reading texts without
  their own exercise numbers; activities link to other pages of their lesson.

## Answers and lessons

Tasks retain the original source image. Short, unambiguous source keys enable
automatic marking; open answers, pronunciation and ambiguous keys use manual
review. Grammar, workbook and unit links from the previous course now redirect
to the corresponding original pages.

Drafts are stored separately per signed-in user, with a separate guest namespace.
Account synchronization uses `SM.loadCourseWork` / `SM.saveCourseWork` and the
existing `progress.__coursework['speakout-b1']` namespace. Ink stays local.
Teacher-class displays saved student answers. The online lesson adapter follows
the existing room protocol, keeping the teacher's and student's answers separate.

## Rebuild and verification

Use Python with `pypdf`, `pypdfium2`, `pdfplumber` and Pillow:

1. `python scripts/prepare-speakout-b1.py`
2. Compile the macOS Vision OCR utility from the B1+ course and run it on
   `work/rendered`, writing results into `work/ocr`.
3. `python scripts/build-speakout-b1.py`
4. `python scripts/optimize-speakout-b1-video.py`
5. `node tests/speakout-b1.cjs`
6. With a local server on port 8770: `node tests/speakout-b1.cjs --browser`
7. `python3 check.py` in the release checkout before publication.

The browser test uses mock accounts and local storage; it does not create real
student records or contact anyone. Generated OCR and intermediate files stay in
ignored `work/`. Videos keep their source copies there.
