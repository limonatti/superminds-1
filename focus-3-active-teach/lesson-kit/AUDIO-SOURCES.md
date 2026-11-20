# Focus 3 1.1 warm-up: original course recordings

The warm-up uses the supplied **Focus 3 Second Edition**, Student's Book pp. 4–5,
Word Store printed p. 3 (PDF p. 4), and the corresponding Teacher's Book Word Store
key (PDF p. 312). It does not extend into lesson 1.2 or 1.3.

- Step 4: SB p. 5 exercise 7 / Word Store 1B, original CD1 track 03 (`../media/sb-1.03.mp3`).
  The printed example 1 remains fixed. Gaps 2–8 are filled with click/keyboard cards.
  The bank is selected from the printed Style trial quiz on SB p. 4; `look`, `in`,
  and `appearance` are context distractors. Correct mappings follow the supplied
  teacher key. After a complete attempt, students listen, check and repeat as in
  the original instruction. Empty/partial checks do not expose completed phrases.
- Step 10: original CD1 track 04 (`../media/sb-1.04.mp3`), SB p. 5 exercise 9 /
  Word Store 1C, is a pronunciation aid for the existing personal oral description.
  It is labelled as vocabulary support, not an invented recording of a full answer.
  The visible text is the printed Word Store vocabulary/definitions, not a claimed
  word-for-word transcription of the recording's announcements.

The media bytes match the supplied archive files:
`Focus 3 2E Global CLCD 1_03.mp3` and `Focus 3 2E Global CLCD 1_04.mp3`.
SHA-256 checksums are recorded in `data/audio.json`. Both are original human course
recordings. The two synthetic warm-up MP3s and their generation metadata have been
removed. `build.py` copies the audio metadata; it does not generate speech.

The changed listening activity has a new task ID, `listen-ws1b`. Existing `listen`
answers remain untouched under the existing localStorage key and are not reused
or marked correct for the new exercise. The other nine task IDs are unchanged.
Neither activity requires typing. The oral description remains teacher/self-reviewed.

Validation: `tests/focus-3-quest-human-audio.cjs` covers empty, partial, wrong and
correct answers; card replacement; player identity; transcript/recording gating;
reset/reload; preservation of earlier task records; oral completion; and original
media hashes. Media play is mocked and mute-checked in this model test. Browser QA
must mute and verify silence before any actual playback.
