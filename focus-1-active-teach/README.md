# Focus 1 · Second Edition

Original Student’s Book (142 pages), Workbook (printed pp. 0–143), and Word Store (17 printed pages), from the owner-provided Second Edition PDFs. Intro + eight units, reference sections and video worksheets are retained. Workbook duplicates and the Word Store booklet order are normalized to printed page numbers.

The reader uses `exercise-source.js` for large original task images and a narrow response column. `assets/course.js` contains 1,310 tasks, of which 614 currently have automatic checking from unambiguous teacher keys. Speaking, writing, picture captions and keys which cannot be unambiguously mapped to fields use saved free responses and teacher review. Teacher keys remain available for comparison. Do not imply that every closed task is automatically graded.

Included media: 163 Student’s Book audio tracks. The 403 source resources include teacher/photocopiable books, lesson/video plans, tests and word lists (with their own audio). No verified Second Edition video files were available; video worksheets and plans are included, without substituting First Edition video.

Responses are isolated per account under `focus-1`, synchronized through the existing coursework API, and retained locally on network failure. Homework uses `focusExercises` metadata, immutable submitted snapshots and existing teacher reports. LiveCourse synchronizes pages, tasks and student responses with the room. The original authored practice pages remain in `legacy/`; their prior data is not migrated or deleted.

## Rebuild and validate

With Python 3 and Pillow installed, run `python3 focus-1-active-teach/build.py`. This consumes the checked-in OCR, teacher spans, answer keys and page images. `compile-wordstore.py` is invoked automatically. `audit/coverage.json` is the final coverage; `audit/build.json` describes the initial SB/WB compilation. Source PDF hashes are in `audit/sources.json`.

Run `node tests/focus-1.cjs` and `python3 check.py`. For browser checks, serve the repository on localhost:8784 and run `node tests/focus-1-browser.cjs` with Playwright and Chrome installed; `PLAYWRIGHT_MODULE` and `FOCUS_TEST_BASE` can override the module location and server URL. Browser tests mock accounts and never write to Supabase. They cover grading, local restore, cloud failure/retry, homework snapshots, teacher assignment, audio, mobile layout and the live iframe adapter.

After rebuilding generated JS, refresh the content hashes in `focus-homework.js` and this reader’s `index.html`; root page dependencies use `stamp.py`. Root `focus-1-u*.html` pages redirect to this reader, preserving query parameters. Do not rerun the old Focus page generator over those redirects.
