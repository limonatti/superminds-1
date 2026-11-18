# Focus learning flow — 18 November 2026

The user reported that Focus 3 still looked and behaved like the previous player. This release makes the working question the main surface and lets learners check one response before completing the entire exercise.

## Design review

| Before | After | Why |
|---|---|---|
| Entire unit shown as a long exercise list | One printed page at a time, previous/next arrows, page selector and an explicit all-pages option | Faster access on phones without losing the original sequence |
| Small response controls beside a large scan, including self-contained questions | Large current question and touch controls; original material remains available through “Задание” | The learner can read and answer in the same area |
| Focus/Solutions check demanded every answer first | “Проверить пункт” uses the existing field grader; a complete exercise still reaches the existing full grader | Immediate feedback without changing accepted answers or progress semantics |
| Choice cards offered one presentation | Authored single choices also have a list mode; printed word cards can be hidden for typing | Device and learner preference without duplicate answer storage |
| Focus 2/3 gap rows contained only a number | Conservative printed-source prompts; eligible single gaps also offer the actual printed word bank | Less scan switching and less compulsory typing |
| Older course hubs and unit pages retained their prior palette and controls | Scoped beige/burgundy shell on 109 legacy/hub pages, readable controls and preserved instructional imagery | The approved format is visible outside the exercise dialog too |

## Scope and content boundaries

Shared Focus presentation serves 10 active players. The additional shell covers 105 existing practice pages and the Gateway A1+, Solutions Pre-Intermediate, Super Minds and Phonics hubs. Course IDs, exercise IDs, accepted answers, answer revisions and stored values are unchanged.

Focus 2 has 73 source presentation models (224 prompts, 36 extracted banks); Focus 3 has 124 (463 prompts, 47 extracted banks). A model is not a claim that a complete exercise has been pedagogically rewritten. Banks render only for eligible single-gap text fields, never multi-gap answers or lists. Source-linked duplicates are included in these counts. Writing, spelling and personal responses retain their appropriate text or teacher-review semantics. Existing course interactions remain authoritative.

Candidate generation reads printed spans, excludes red and invisible white teacher-answer spans, and never reads accepted answer values. Ambiguous boxes are omitted. The source page remains accessible. No new audio or speech synthesis is introduced.

## Validation

- Shared DOM regression: original input nodes, order, values, keyboard events, blank initial state and remount cleanup.
- Flow regression: partial correct/incorrect/blank checking, Enter handling, one full native submission, source-only candidates, card/list event ordering, page-scoped Start, and avoiding collisions with legacy page attributes.
- Source regression: poisoned grading keys cannot change candidates; red/white teacher text cannot appear in prompts or banks.
- Browser traversal: 614 representative tasks across all 10 players and all numbered book/unit sections, at 320, 820 and 1440 pixels. This is sampling by section, not a claim that every exercise was manually completed.
- Focus 3 detailed flow: original sorting task and SB16 Exercise1; wrong/right partial checks, locked keys, click/keyboard choice, typing/cards and cards/list modes, one visible item, close/Escape, saved answers after reload; 320/390/820/1440 pixels.
- Saved-answer/browser actions: all 10 players plus three legacy practice dialogs.
- Speakout B2+ Vocabulary Bank 1A Exercise 2A: correct/wrong/key gating, one visible question, close/Escape and saved responses after reload pass at 320/820/1440px.
- Original Outcomes WB Unit 5: 148 task layouts pass; authentic audio playback verified muted at volume zero.
- Four legacy hubs and three representative teaching pages checked at 320/820/1440 pixels.
- Test browser blocks non-GET/HEAD requests and starts muted; learner records are not altered.

Publication checks and exact release identifiers are recorded in the workspace output folder after deployment.
