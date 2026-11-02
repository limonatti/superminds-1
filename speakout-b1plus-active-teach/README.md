# Speakout 3rd Edition B1+

Rebuild from the owner's supplied Student's Book, Workbook, keys, Teacher's Book,
class/workbook audio and video archives. The interface follows the platform's
Speakout A1 course. Original scans are the visible source of every exercise;
the supplied “AI worksheets” were not used.

## Coverage

- Student's Book: printed pages 6–137 and 139–175, all eight units, Grammar,
  Vocabulary, Communication and Mediation Banks, scripts and irregular verbs.
- Workbook: printed pages 3–96 (page 3 is labelled iii), reviews, audioscripts and answer key.
- 151 audio recordings and 16 videos, assigned to their original lessons.
  Lead-in track L.01 is absent from the supplied audio archive and is marked
  as unavailable; the page and its original answer key are included.
- Missing from supplied PDFs: SB 138. SB 6 and WB 3 were restored from
  the owner’s additional samples. The course has no external replacement links.
- Original keys remain accessible. Only unambiguous extracted keys enable
  automatic checking; discussion, pronunciation, uncertain OCR and shared
  slash alternatives use written answers and manual review.
- Verified publisher errata are recorded in `audit/errata.json` and displayed
  alongside the original key. Answers and board annotations stay in this browser;
  export/import provides a local backup.
- Supplemental materials: 75 test documents (including A/B/C variants), 40
  photocopiable activities, four literature lessons suitable for B1+, 13 teacher
  documents and 18 supplied test audio files. The library filters by category
  and unit, displays original pages locally, saves written answers, and links
  original keys and editable test documents. Test audio is matched by the
  recording codes printed in the PDFs; it is separate from SB/WB media.
- Literature lessons 7–10 cover B1–B2 and B1+–B2+. Their nine referenced audio
  recordings are absent from the supplied ZIP and explicitly marked missing.
  The six lower-level lessons and their notes are not included in this course.

## Rebuild on macOS

Requires Python with pypdf, pypdfium2, Pillow and pdfplumber; Swift/Vision;
and ffmpeg for optional video optimization. Run in this directory:

```sh
python prepare.py '/path/to/Speakout B1+'
python import_supplement.py '/path/to/778449126-Speakout-B1-page-139-175.pdf'
python import_frontmatter.py '/path/to/798882975-Speakout-3-B1.pdf' '/path/to/975523717-Speakout-3rd-B1-WB-Key-OCR-RMF-Sample.pdf'
swiftc ocr.swift -o work/ocr-runner
work/ocr-runner assets work/ocr
python extract_pages.py
python optimize_video.py
python build.py
python import_materials.py '/path/to/Tests.zip' '/path/to/Photocopiables.zip' '/path/to/Literature Lessons.zip'
```

`work/` holds source extraction and OCR intermediates and is ignored. `audit/`
records input hashes, source keys, coverage, errata and media durations. Published
scans use embedded source JPEGs where possible; reference pages are rendered at
2000 pixels high (2200 for the photographed supplement). Videos use H.264/AAC with their source duration preserved.

From the repository root, run `python3 check.py` and
`node tests/speakout-b1plus.cjs`. For the browser smoke test, serve the repository
on port 8768 and run the latter with `--browser`. It covers SB/WB grading,
saved answers, source page numbering, navigation, mobile sizing and media.

Run `node tests/speakout-b1plus-materials.cjs` (optionally `--browser`) to verify
supplemental source hashes, level selection, key/audio mappings, the library,
mobile page viewing and answer backup/import. `audit/materials.json` records
archive hashes, every retained original and the twelve excluded lower-level PDFs.
Supplement previews are rendered directly from the PDFs at 2000 pixels high.
