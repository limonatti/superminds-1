# Course exercise and account-draft audit — 2026-11-04

The release keeps the B2+ input policy from 0f472be and incorporates the Solutions Elementary upgrade from 09434d07. It changes exercise presentation and draft storage, not assignment completion or teacher submissions.

## Published course inventory

| Course | Exercise surface and saved work |
| --- | --- |
| Speakout A1 | SB/WB dialogs; Review Quest mission dialogs and independent attempts |
| Speakout B1 | SB/WB dialogs |
| Speakout B1+ | SB/WB and supplementary interactive tests/material notes |
| Speakout B2+ | Existing SB/WB dialogs and per-field presentation storage retained; common save action |
| Solutions Elementary | New interactive SB/WB (1,462 exercises), assignments, and earlier practice pages |
| Solutions Pre-Intermediate | Earlier unit/practice pages |
| Solutions Intermediate | SB/WB dialogs and assignments |
| Focus 1 | SB/WB/Word Store dialogs and assignments |
| Outcomes Beginner | SB/WB dialogs, original grading and live lessons |
| Gateway A1+ | Earlier unit/practice pages |
| Super Minds | Teacher-authored exercises via exercises.html |
| Phonics | Existing games and sound dialogs retained; learned-sound checklist stored per account |

105 earlier practice pages use the common renderer. Teacher-authored choice, gap, open, listening, true/false, multi-choice, matching, categorization, cloze, fillbox, ordering, letters, reading, TFNS, word formation and headings use the same dialog and persistence. The wheel retains its gameplay inside a dialog and saves the current sector, unfinished answer and completed sectors. Static audio/video/reading and embedded external games keep their original formats; their playback is not homework submission.

## Interaction

The original task fills the available width. Inputs are compact; formation tasks have editable input rather than answer-derived suggestions. Banks and letter choices come from the printed task or authored source options. Keys inside an exercise become available after a filled attempt is checked/saved; a supplementary test's complete key waits for all sections. Open answers retain teacher review and receive no invented correctness score.

A1 Review Quest stores draft work, first check, corrections, speaking notes and writing separately. The initial record and mutable UI state are copied independently; this prevents an acknowledged save from silently swallowing subsequent edits.

## Account storage

- Every edit is cached immediately under course + authenticated user; pending records survive reloads.
- The explicit **Сохранить ответы** action flushes the queue. Account confirmation appears only after an acknowledged request. Offline work remains pending and retries when connectivity returns or on another save/reopen.
- Opening/reloading a course on another device loads the same account's saved records. An already-open second device is not continuously polled; reopen/reload to retrieve remote changes.
- Switching accounts reloads the interface and freezes writes from the outgoing page. Neither an old unload handler nor an in-flight response can write the previous student's answers into the next account.
- Known account-scoped older caches migrate automatically. Unscoped old Speakout/Quest/Phonics caches remain intact and require the learner's explicit transfer action; they are never silently assigned to a new account.
- Shared adapters merge by exercise revision (`updatedAt`). Simultaneous edits to the same exercise use the newer revision. B2+ keeps its existing finer per-field merge and deletion markers.
- Saving a draft does not call `hwSubmit`. Existing assignment snapshots and teacher-review states are retained. Submission still requires its separate explicit action and successful cloud save.

## Database

`sql/coursework-atomic.sql` was applied in Supabase. The existing `progress.data.__coursework` shape is preserved for reports. `save_course_work` merges only the specified course atomically; `save_learning_progress` preserves coursework when vocabulary progress changes. A BEFORE UPDATE trigger also protects coursework from older cached clients that still upsert whole progress rows.

Verified through the Supabase connector: both RPCs and the trigger function are SECURITY INVOKER, anonymous execution is denied, authenticated execution is permitted, and the `preserve_coursework_progress` trigger is enabled. Existing RLS remains in force. No real student answer rows were edited for testing.

## Verification

- `python3 check.py`: 84 checks, no warnings.
- `coursework-store.cjs`: partial/completed/wrong/open drafts, INITIAL_SESSION/load races, direct mutable adapters, ACK, edits in flight, reload, fresh storage, offline queue/retry, signout/in, account isolation, outgoing-page freeze, independent courses and storage failure.
- `speakout-account-adapter.cjs`: A1/B1/B1+ boot, immediate persistence and account-switch/unload isolation.
- `coursework-sql.cjs` in PGlite: atomic course updates, stale revisions, vocabulary and old-client preservation, owner/RLS isolation and anonymous denial.
- `coursework-models.cjs`: 16 authored models and all 105 earlier page adapters.
- Existing Speakout, Outcomes, Solutions grading/homework and B2+ input/sync/workbook tests passed. B2+ coverage remains 1,114 exercises, including 393 Workbook exercises and 61 open Workbook tasks.
- `exercise-play.cjs --models-only`: source-only suggestions and 3,785 printed gap bounds.
- `solutions-el-active-teach.cjs --models-only`: 293 pages, 1,462 exercises, 748 automatic/mixed schemas, boundaries, accepted/rejected answers and immutable homework snapshots.

Browser checks used local mock accounts and two independent origins sharing only a test backend: account/device restoration, wrong and free answers, offline retry, account switching; representative dialogs for all eight book viewers; earlier Solutions Elementary/Pre-Intermediate/Gateway practice; Super Minds authored tasks and wheel; A1 Review Quest; B1+ supplementary tests; Phonics checklist. Review Quest checks and corrections survive reload. Solutions Elementary draft survives reload and the key remains hidden before a filled attempt.

Media files are unchanged. The isolated checkout excludes most large binaries, so model-only runs explicitly skip on-disk media assertions; the existing full-media test mode remains available. Browser viewport override did not change the observed 774px viewport, so this audit does not claim a fresh 390px runtime test. Responsive CSS and prior B2+ behavior are retained.

Deployment target: GitHub Pages from main. The completion message identifies the published revision and live verification.
