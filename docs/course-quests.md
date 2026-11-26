# Course quests: publishing standard

Asya requested a distinct, colourful quest after **every actual subsection** of every course, plus a broader connected quest after every complete unit (26 November 2026). This is an authoring and publishing programme, not completion by adding a generic template.

## Release requirements

- Identify the exact course, edition, level, unit, subsection, source pages and studied objectives before authoring. Preserve existing textbook exercises and student answers.
- Write original situations and meaningful challenges using that source scope. A unit finale combines the studied skills in a coherent story. Do not relabel a vocabulary-only subsection quest as a full-unit review.
- Publish a real interactive web quest and a separate printable PDF on `english-with-asya.com`. Provide explicit **Start quest**, **Open / print PDF**, and **Download PDF** actions from the course. A PDF embed is not the web version.
- Use Asya's burgundy and beige style. Include generated illustrations that carry clues, evidence or choices. Keep the approved Focus 4 English PDF unchanged; its approved palette is an exception for that existing artifact.
- B1+/B2 learner text is entirely English, including hints, controls, feedback, transcript labels and outcomes. Adapt other levels to their learners. Teacher notes may be Russian.
- Prefer varied click/keyboard interactions: matching, choices, cards, sequencing, contextual reading and personal responses. No compulsory dragging. Use typing when writing/spelling or a genuinely personal response is the objective. Candidate banks must come from the studied source, with authored distractors, never automatically from answer keys. Never preselect correct responses.
- Check closed answers and accepted variants. Keep open dialogue, speaking and writing answers with explicit criteria and honest teacher-review status. Do not assign a fake automatic mark.
- Provide helpful hints, visible previous/next controls, a station map, recovery from errors and no countdown, penalties or compulsory scores.
- Provide human recordings only, with controls, repeat and a transcript. Reuse the exact original course recording. Do not use TTS, cloned voices, speechSynthesis or generated voices. An optional source recording may support the same tasks without changing their numbering. If the verified subsection assigns no recording, state this in its source notes; do not invent a listening objective or add an unrelated track.
- Preserve account-scoped progress with `CourseWorkStore` and existing server-side rules. Prefix records `quest:<stable-quest-id>:<task-id>` inside the parent course, rather than writing textbook exercise IDs. Guest drafts stay in the guest namespace. An unknown authentication state must not be treated as guest.
- Keep a separate teacher key in the existing teacher resource workflow. Do not place its PDF unconditionally on the learner route. The Future Academy teacher PDF remains the separate source resource supplied by Asya; it is not uploaded with the learner files.
- Verify all tasks, wrong/blank/correct cases, accepted variants, hints, keyboard access, reload, offline recovery, account changes, mobile widths, PDF links and printing. Run `check.py` before any push. Tests must mute media and verify `muted` or zero volume **before** Play. Never play an unmuted QA recording.
- Verify the GitHub Pages deployment and the live content, including the PDF SHA-256. Report exact published links and exact coverage. Keep planned or blocked records in the coverage documentation; never publish empty learner placeholders.

## Implementation

`quests/catalog.js` contains only actual reviewed web/PDF pairs. `quests/course-entry.js` inserts the relevant entry after its source page in the course's activity list and adds a visible Start quest / Open or print PDF shortcut at the top of the current unit. The shortcut stays visible when page 4 is selected; it is not shown in another unit or Word Store. `quests/assets/quest-player.js` provides the shared account-scoped player. Each quest owns its content, illustrations, PDF and source evidence.

The Future Academy is **Focus 4 Second Edition, Unit 1.1 Vocabulary, Live and learn, SB pp. 4–5**. Its insertion point is after `sb-5`, before `sb-6` (Unit 1.2). It is not Word Store 1A and not textbook exercises 10–15: it has twelve new authored challenges. Its optional human conversation is SB track 1.02, with transcript from Teacher's Book printed p. 197 (PDF p. 219).

Track pedagogical coverage and interaction coverage separately. A usable reusable player does not mean any unfilled course or unit is complete.
