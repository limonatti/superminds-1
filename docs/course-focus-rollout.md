# Focus presentation rollout, 18 November 2026

The approved Outcomes Workbook Unit 5 presentation now supplies a shared learning surface for the ten active course players and 105 legacy course pages. Shared authored exercises also use it. This is an interface rollout, not a claim that every existing open task has become automatically gradable.

Design read: an adult/teen learning workspace in Asya's approved burgundy and beige style, with one readable question and direct access to the original material. Variance 5, motion 1, density 4. The light surface follows the approved reference. Motion is limited to native interactions with reduced-motion support.

| Before | After | Why |
| --- | --- | --- |
| Long answer forms and fields positioned over book scans | One native answer row at a time, previous/next, optional all-items view | Stable touch and keyboard entry, independent of scan coordinates |
| Answer controls beside an unreadably narrow image on phones | Source/answer tabs on phones, two columns on larger screens | Use the available width for the active task |
| Unit picker hidden with the old book toolbar | Visible section selector on the Focus home | A mobile learner can move between units |
| Mixed course chrome and purple save bars | Shared paper, burgundy controls, explicit focus rings and 44px targets | Consistent approved appearance and keyboard access |
| Truncated OCR instruction headings | Joined instruction lines plus original source context | Preserve task instructions without inventing new content |
| B2+ fixed-width second column surviving mobile layout rules | Scoped Focus layout overrides | Prevent a 72px answer column on a 390px screen |
| Vocabulary Bank 1A Exercise 2A had eight empty grading keys | Publisher-supplied key and full question labels, keeping eight storage keys | Correct/wrong feedback and a key after a checked attempt |
| Vocabulary Bank 2A source included the unrelated 1B exercise with the same number | Original 1A 2A crop and its explicitly referenced 1A prerequisite | Show the relevant source material |

## Scope and contracts

- Players: Focus 1/2/3, Solutions Elementary/Intermediate, Speakout A1/B1/B1+/B2+, Outcomes Beginner.
- Legacy imports follow `audit/coursework-legacy-pages.json` (Gateway A1+, Solutions Elementary and Pre-Intermediate). The shared authored exercise renderer is included.
- Original input nodes, IDs, storage, account isolation, source numbering, native grading and authored interactions remain authoritative. Native selects gain tap/keyboard cards built from their original options. Source banks can supply cards; grading keys do not supply distractors.
- Writing and word-form tasks retain typing. Source images and existing authentic audio remain available. The old synthetic-speech fallback in the shared legacy renderer is removed; text is shown where no human recording exists.
- Original book/tools surfaces remain accessible. Reference sections without exercises fall back to the original page surface.
- The 37 bespoke Outcomes Workbook Unit 5 exercises keep their approved implementation.
- Speakout B2+ `sb-133-2A-1`: verified against Student's Book printed page 134, Teacher's Book page 31, and the extracted 1A vocabulary answer key. Items 4 and 5 retain combined responses in their existing numbered fields; the prompt explains entering both gaps in order. Old extra answers remain available. All other B2+ exercise records and page-version hashes are unchanged.

## Verification

- `python3 check.py`: 91 checks; syntax, references and cache-version markers.
- `tests/course-focus.cjs`: original nodes/values/order, initial blank choice state, source-only options, keyboard-compatible native events, step navigation, cleanup, empty-reference fallback and all 105 imports.
- Browser coverage: first/middle/last task in each numeric course section, Student's Book/Workbook and Focus Word Store, at 320/820/1440px. Focus/Solutions: 344 sampled tasks, 1032 layouts. Speakout A1/B1/B1+: 150 tasks, 450 layouts. B2+/Outcomes: 120 tasks, 360 layouts. Outcomes Workbook reference pages checked separately for accessible original content.
- Dedicated Outcomes Unit 5 regression: all 37 tasks at four widths (148 layouts), choices, compound answers, typing, navigation and reload. Audio muted with zero volume before playback.
- `tests/course-focus-actions.cjs`: choice/typing, item navigation and reload in all ten players; three representative legacy pages. Test network blocks remote writes.
- `tests/speakout-b2plus-vocabulary-1a.cjs --browser`: publisher key, correct/wrong responses, key gating and invalidation after edits, one visible row, compound answers, mobile width, close/Escape, and reload preservation. No floating scan editors remain in Focus.
- Existing storage/durability/authentication isolation, grading, source-bank and draft-restoration suites were run during integration. B2+ sync regression passed after the targeted repair.
- Full Workbook media-existence test cannot run in this sparse checkout because its binary files are deliberately absent. No Workbook content or media was changed. Browser preview resolves real original media separately; this is not substituted by dummy media or generated audio.

Browser checks use desktop Chrome viewport/touch emulation, not physical iOS/Android devices. Account and fresh-device persistence are covered by existing store mocks; QA does not write to real learner accounts. Long original readings still require scrolling. Individual exercise redesign beyond the shared presentation remains a separate content task.
