# Solutions Elementary interactive Active Teach

The existing ready-made Claude ActiveBook is the source: 164 Student’s Book pages, 129 Workbook pages, 199 audio tracks, nine videos and Workbook keys. Printed page numbers are PDF/image numbers minus one. The SB and WB unit boundaries intentionally differ.

The platform player reuses the Solutions Intermediate exercise UI, marking rules, saved-answer versioning and teacher assignment workflow. Elementary has its own `SOLUTIONS_EL`, `SolutionsElHW`, `SolutionsElAssign` and `solutions-el` coursework namespace. Shared student/teacher pages recognize Elementary assignments without mixing their catalogs with Intermediate or Focus.

- 1,462 exercise cards across the original books and reference pages.
- 748 cards have closed-answer checking (15 also require a personal answer).
- 995 printed gaps in 147 exercises have verified-count image overlays. Other closed tasks use the same interactive answer strip and word bank.
- Open, personal, pronunciation and ambiguous key formats use saved written answers for teacher review. They are not assigned a guessed automatic score.
- When OCR cannot safely locate an exercise, its known teacher-guide ID remains available in the sidebar with the full source page; no guessed hotspot is drawn.
- The full-page toggle and source context preserve access to illustrations, tables and related tasks.

Teacher Guide PDFs supply Student’s Book keys; `workbook_answer_keys_and_transcripts.pdf` supplies Workbook keys. `data/source-keys.json` preserves extracted keys and provenance. Reviewed corrections are in `data/overrides.json`; counts and unresolved page anchors are in `data/audit.json`. Printed media and page images are unchanged from the imported viewer.

## Rebuilding the catalog

The local OCR work directory contains `ocr-sb/001.jpg.json` …, `ocr-wb/001.jpg.json` … and `keys/sb-columns.txt`, `keys/wb-columns.txt`. OCR rows have text and normalized top-origin `x,y,w,h` coordinates. Teacher PDFs must be extracted in **left column → right column** reading order; native PDF content-stream order mixes some answer continuations.

```sh
python build_interactive.py --work /path/to/elementary-work
python build_gaps.py /path/to/elementary-work/models.json --source-workspace /path/to/elementary-work
```

Requires Pillow for the catalog, and numpy/pypdfium2 for gap geometry. The shared `solutions-int-active-teach/marking_parser.py` parses numbered keys. Builders write only Elementary assets/audits.

Run from the repository root:

```sh
node tests/solutions-el-active-teach.cjs
node tests/solutions-el-active-teach.cjs --browser
node tests/solutions-el-homework-browser.cjs
node tests/solutions-el-assign-browser.cjs
python3 check.py
```

Browser tests use a local server on port 8897 and mock authentication/database methods. They never create real students or assignments. The smoke test can also use `SOLUTIONS_EL_ORIGIN` to inspect the deployed site in guest mode.
