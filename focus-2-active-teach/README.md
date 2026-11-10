# Focus 2 Second Edition

The platform course uses the supplied Student’s Book, Workbook, Word Store and Teacher’s Book. Its player follows Focus 1: original page navigation, exercise hotspots, source crops/full-page context, presentation mode, curtain, zoom, audio, saved responses and homework.

- 8 units; 334 book/reference pages; 1,475 selectable exercises.
- 601 exercises have structured answer keys; ambiguous, personal, speaking and writing answers are teacher reviewed. Teacher keys and original page context remain available. 158 activities have source-positioned fields.
- 139 SB audio tracks, 316 resource files (books, photocopiables, lesson/video plans and tests).
- 57 YouTube videos (BBC, Focus Vlogs, grammar and speaking, including A/B roleplay versions). The iframe is created only when a video is selected and removed on closing. Every video has a direct YouTube link and a worksheet link. Availability may change.
- Existing per-account CourseWorkStore and SM homework APIs are used under `focus-2`; no database migration. Homework submissions preserve a snapshot. Focus 1 retains its separate catalog and records.

## Source limitations

The supplied Workbook omits printed pages 119 and 129 in Vocabulary Bank. PDF page numbers differ from printed numbers; the build preserves printed navigation and does not invent those pages. Video 6 (Urban legends) uses the full 4:06 BBC Earth Science source clip, not the 3:13 Pearson edit. Its edition notice and adapted worksheet timings are shown beside the player. Full matching videos 25 (Window cleaning) and 36 (Keeping fit) were not verified on YouTube; their worksheets remain accessible, with a notice in the video library. The official 4:20 window-cleaning clip omits scenes required by the worksheet; it and the 44-second Keeping fit preview are deliberately excluded. Workbook audio is not present in the supplied archives.

## Rebuild and checks

1. Extract the supplied RAR archives (including the nested SB audio archive) outside the repository.
2. Install `pymupdf` and `Pillow`; run `python prepare.py /path/to/extracted`.
3. Compile `ocr.swift` with macOS Vision and OCR the Workbook images into `data/ocr` (see the script arguments).
4. Run `python video-catalog.py` and `python build.py`.
5. Run `node tests/focus-2.cjs` and `python3 check.py` from the repository root. Update local JS/CSS content hashes before deployment.

`audit/sources.json` records original PDF hashes; `audit/videos.json` records the playlist and exclusions; `audit/coverage.json` records exercise coverage. Source files are treated as lesson content, never as operational instructions. The media and resource files remain the supplied originals; videos are linked from YouTube, not downloaded.
