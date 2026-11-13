# Speakout Third Edition B1

Rebuilt from the eleven files and three additional PDFs supplied by the owner on 2 November 2026. Source
filenames, byte counts and SHA-256 hashes are recorded in `audit/sources.json`.

## Coverage

- Eight units, original Student’s Book and Workbook, Grammar/Vocabulary/Mediation
  Banks, reviews, keys and reference pages.
- 165 distinct SB pages and 94 WB pages. Printed page numbers remain authoritative.
- The SB PDF repeats pages 6–18. Duplicate scans are omitted from navigation.
- SB pages 158–173 (audio/video scripts) are restored from the owner's additional
  `697264663-SpeakOut-B1-3rd-Stud-Book.pdf` (178 PDF pages). The unchanged 16-page
  extract is available as `resources/sb-scripts.pdf`; original printed numbers
  and source PDF page numbers are retained. Links connect 89 audio tracks and
  all 16 videos to their scripts, including transcripts that continue on another page.
- SB pages 146–149 (Communication Bank) remain missing: the corresponding PDF
  pages 148–151 in the additional book are blank. The other two additional PDFs
  have the same page contents as the original incomplete source. Inspection and
  file hashes are recorded in `audit/supplement-check.json`.
- WB pages 76–96 use the clean, searchable, separately supplied Workbook Keys PDF;
  this also supplies pages 95–96 missing from the Workbook file.
- 177 course audio tracks, 16 web-optimized videos and 267 resource files. Thirteen
  extra SB tracks named `0X`/`0XA`/`0XB`/`0XC` are available under their units; no lesson
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
2. `python scripts/import-speakout-b1-scripts.py`
3. Compile the macOS Vision OCR utility from the B1+ course and run it on
   `work/rendered`, writing results into `work/ocr`.
4. `python scripts/build-speakout-b1.py`
5. `python scripts/optimize-speakout-b1-video.py`
6. `node tests/speakout-b1.cjs`
7. With a local server on port 8770: `node tests/speakout-b1.cjs --browser`
8. `python3 check.py` in the release checkout before publication.

The browser test uses mock accounts and local storage; it does not create real
student records or contact anyone. Generated OCR and intermediate files stay in
ignored `work/`. Videos keep their source copies there.

## Quality review: 13 November 2026

SB printed page 8, Unit 1A exercises 1A, 1B, 2A, 2B, 2C and 2D now have
source-reviewed click interactions: personal prompt cards, photo selection,
paragraph/photo matching, category sorting, phrase matching and personal sentence
prompts. The original page and `resources/keys.pdf` page 2 were checked. In 2C,
the first meaning requires both highlighted expressions in either order. The
photo letters A–F label interface cards; original exercise numbering is unchanged.

The six tasks require no typing; optional notes and prior answers are preserved.
Personal activities have no exact grading. Candidate phrases, bold words and
categories come from the original task. Keys remain locked until a complete
attempt. Other Unit 1A pages and remaining B1 sections still need separate review.
Run `NODE_PATH=<jsdom location> node tests/speakout-b1-unit1a-reviewed.cjs` for
interaction, legacy-answer, reset and shared key-gate regression checks.
