# Speakout 3rd Edition B1+

Rebuild from the owner's supplied Student's Book, Workbook, keys, Teacher's Book,
class/workbook audio and video archives. The interface follows the platform's
Speakout A1 course. Original scans are the visible source of every exercise;
the supplied “AI worksheets” were not used.

## Coverage

- Student's Book: printed pages 7–137 and 139–175, all eight units, Grammar,
  Vocabulary, Communication and Mediation Banks, scripts and irregular verbs.
- Workbook: printed pages 4–96, reviews, audioscripts and answer key.
- 151 audio recordings and 16 videos, assigned to their original lessons.
- Missing from supplied PDFs: SB 6 and 138, WB 3. These will be added from
  the owner’s complete files. The course has no external replacement links.
- Original keys remain accessible. Only unambiguous extracted keys enable
  automatic checking; discussion, pronunciation, uncertain OCR and shared
  slash alternatives use written answers and manual review.
- Verified publisher errata are recorded in `audit/errata.json` and displayed
  alongside the original key. Answers and board annotations stay in this browser;
  export/import provides a local backup.

## Rebuild on macOS

Requires Python with pypdf, pypdfium2, Pillow and pdfplumber; Swift/Vision;
and ffmpeg for optional video optimization. Run in this directory:

```sh
python prepare.py '/path/to/Speakout B1+'
python import_supplement.py '/path/to/778449126-Speakout-B1-page-139-175.pdf'
swiftc ocr.swift -o work/ocr-runner
work/ocr-runner assets work/ocr
python extract_pages.py
python optimize_video.py
python build.py
```

`work/` holds source extraction and OCR intermediates and is ignored. `audit/`
records input hashes, source keys, coverage, errata and media durations. Published
scans use embedded source JPEGs where possible; reference pages are rendered at
2000 pixels high (2200 for the photographed supplement). Videos use H.264/AAC with their source duration preserved.

From the repository root, run `python3 check.py` and
`node tests/speakout-b1plus.cjs`. For the browser smoke test, serve the repository
on port 8768 and run the latter with `--browser`. It covers SB/WB grading,
saved answers, source page numbering, navigation, mobile sizing and media.
