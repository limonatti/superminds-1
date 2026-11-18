# Approved Focus rollout

Asya chose the Focus prototype on 2026-11-18 and confirmed: «это то что я хотела».

## Direction

Adult burgundy/beige interface, one item at a time by default, source context next to the response, tap and keyboard controls, clear supportive feedback. Keep original human recordings with repeat and transcript. Never use synthetic speech. Preserve writing/spelling tasks and source-specific learning objectives.

Design read: calm adult learning workspace, light paper for normal classroom use. Variance 5, motion 1, density 4. The palette is an explicit brand preference.

## First integrated release

All 37 Workbook Unit 5 tasks on printed pages 28–33, including Vocabulary Builder Quiz 5. This is not a claim that Student’s Book or the other units have the new design yet.

- `focus-data.js`: manually reviewed learner-page prompts, source choices and image crops. No answer-key-generated distractors.
- `focus.js` and `focus.css`: presentation over existing fields, course navigation, custom human-audio player and Unit 5 task entry.
- `student.js` and `practice.js`: narrow lifecycle hooks. Stored exercise IDs, response indices, rubric revisions, account store and live-room transport remain authoritative.
- Original pages, full reading context, optional typing and existing answers remain accessible.
- Actual physical iPhone/iPad/Android testing and authenticated cross-device saves are still to be verified. Browser checks use isolated guest state and block external writes.

## Validation

`node tests/outcomes-focus.cjs` preserves all 37 IDs, response counts and original rubrics.
`node tests/outcomes-focus-browser.cjs` checks all 37 tasks at 320, 390, 820 and 1440px; source ordering, overflow, keyboard selection, retry, per-item transitions, compound gaps, letter building, word insertion, personal writing, reload, answer-mode switches, course entry and scope isolation. Audio playback and replay are tested only after verifying mute and zero volume.

Existing `outcomes-refresh`, `outcomes-interactions`, `outcomes-grader`, `outcomes-student` and `outcomes-live` tests pass. `python3 check.py` passes 90 checks.

## Design review

| Before | After | Why |
| --- | --- | --- |
| A scan and a long answer form dominate the lesson | Readable current prompt, meaningful controls, original available on request | Keeps task and response together |
| Small photo letters in a separate form | Original photographs themselves are choice buttons | Comfortable touch and keyboard selection |
| Multiple stacked response areas | One item by default, direct item and exercise navigation | Reduces unnecessary scrolling |
| Fixed text instructions sometimes stop at an OCR line break | Full directions checked against the original pages | Preserves the intended task |
| Dense sound controls compete with the question | Compact original-audio player, speed and loop in settings | Gives the response more space |

Next rollout: review the first integrated unit, then apply source-reviewed prompts and suitable interaction controls to the remaining Outcomes materials. Do not claim full-course visual completion from the earlier technical refresh.
