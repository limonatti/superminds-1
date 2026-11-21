# The Missing Story

Supplementary interactive review for Speakout B1+ Third Edition, Units 1–2.
Ten missions contain 40 activities plus a final sentence and oral reflection.
The museum story and review questions are authored practice, not textbook exercises.
Keep this folder alongside the parent course `media` folder when using it offline.

The audio/video in missions 5, 6, 9 and 10 are original human course recordings.
See AUDIO-SOURCES.md for exact pages, tracks, archive provenance and hashes.
The corresponding eight listening questions were adapted to those recordings on
2026-11-21. Other mission activities and illustration assets are retained.

## Answers and access

State uses `asya-speakout-b1plus-quest-v1` in localStorage, without account or
server synchronisation. All legacy answers, optional notes and checklists remain.
Changed questions use new IDs; old completion is retained in `legacyMediaV1` and
only the four affected mission clues need a new attempt. Other clues stay intact.

Transcripts open after a complete attempt at the listening questions (even wrong).
Teacher keys open per activity after a complete attempt. Oral/writing models are
supports and remain available. These are learning controls, not security barriers.
Open responses use self-/teacher-review, not automatic language grading.
Try this mission again resets just the current mission, with Undo during that visit.
Save answers exports a text copy. Native controls, replay, speed and mute are available;
mute is a session preference and ordinary learner playback starts unmuted.

## Illustrations

The three original AI-created illustrations are retained. Obsolete synthetic speech,
its scripts/timing files and the narrated montage were removed on 2026-11-21 to follow
the current standing human-voices-only instruction. No new speech was generated.

Image prompt set (built-in image_gen, no CLI image-generation fallback):

1. **Objects:** Use case: illustration-story. Create a sophisticated richly detailed
   16:9 editorial illustration for an adult English B1+ mystery learning quest,
   burgundy and warm beige palette, soft cinematic light. Museum archive tabletop,
   exactly three prominent separate objects: a worn burgundy leather shoulder bag
   on the left, a pale striped ceramic mug in the middle, a small black wireless
   speaker on the right. Behind them a closed dark red archival box and sealed cream
   envelope. Objects fully visible, visually clear materials. Beautiful tactile
   illustrated realism, subtle paper texture. No lettering, no numbers, no logos,
   no watermark. These objects are the evidence in a story.
2. **Station:** Use case: illustration-story. Wide 16:9 editorial story illustration
   for adult English learners, warm beige and burgundy accents, cinematic painterly
   realism matching a museum mystery. A railway station ticket queue with three
   adults waiting in line. One other adult clearly steps sideways ahead of the
   queue, and a waiting woman in a burgundy coat looks mildly annoyed. On a bench
   to the right a person plays music from their phone while another person covers
   one ear. A small crumpled paper cup lies on the floor. Clear readable visual
   actions, believable anatomy, no exaggerated caricatures, no text, no logos.
3. **Jungle:** Use case: illustration-story. Wide 16:9 richly detailed editorial
   nature illustration for an adult English B1+ learning quest. A small Draco
   flying lizard glides between two tropical tree trunks, its yellow orange gliding
   membranes clearly extended, green jungle foliage and soft golden sun. A second
   small lizard remains still against bark on the left. Beautiful scientifically
   plausible nature documentary composition. Restrained warm beige highlights,
   natural green, subtle burgundy in distant foliage. No text, no logos, no watermark.

## Checks

- `node tests/speakout-b1plus-review-quest.cjs` (jsdom): all existing activities.
- `node tests/speakout-b1plus-review-human-media.cjs` (jsdom): source answers,
  transcript/key gates, empty/wrong/correct attempts, mute/replay, reset/undo,
  reload and legacy records.
- `python3 check.py`.
- Source review covers the four changed media blocks, not the whole course.
