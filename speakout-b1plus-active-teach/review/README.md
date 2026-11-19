# The Missing Story

Original interactive review for Speakout B1+ Third Edition, Units 1–2.
Open `index.html` directly or serve this directory. The course links to it from its navigation.

Ten missions contain 40 activities: image matching, narrative tenses, verb patterns,
housework and polite requests, voicemail and gadgets, habit changes and Present
Perfect Continuous, relative clauses and feelings, declining invitations, annoying
behaviour, imagined reactions and clarification. The final activity assembles ten
collected words and prompts a personal story. Source scope was checked against
`../assets/course.js`, Student’s Book pages 8–29. This is supplementary practice,
not a reproduction of the textbook exercises.

Answers and checklists are stored under `asya-speakout-b1plus-quest-v1` in browser
localStorage. There is no account synchronisation. Export downloads a text copy.
Open speaking/writing responses are self-/teacher-reviewed and never automatically
assigned a language grade. Hints and retries have no penalty. Teacher notes contain
all keys and are intentionally accessible.

## Generated media

Created on 2026-11-19 at Asya’s explicit request for new audio, video and images.
This task-specific instruction supersedes the earlier human-recording preference.

- `assets/objects.jpg`, `assets/station.jpg`, `assets/jungle.jpg`: built-in image_gen;
  original generated PNGs converted to JPEG without changing composition.
- `assets/voicemail.mp3`, `assets/habit.mp3`, `assets/station.mp3`: synthetic British
  female voice, Microsoft en-GB-SoniaNeural, rate -6%. Each exact script is in the
  matching `.txt`, with service-generated timing in `.srt`.
- `assets/story.mp4`: 67-second illustrated story, 1280×720 H.264/AAC. Three generated
  still scenes with slow camera motion, narrated using `film-1`–`film-3`. This is an
  animated illustration montage, not generated live-action footage.
- `assets/story.vtt`: selectable English captions, synchronised from narration.

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

- `node tests/speakout-b1plus-review-quest.cjs` from repository root (requires jsdom).
- `python3 check.py` from repository root.
- Headless Chrome: desktop 1365×1000 and mobile 390×844; no overflow or JS exceptions;
  audio metadata, video dimensions/duration and 17 subtitle cues verified.
- All six narration files decode; every script word matches the generated subtitle
  text. The entire video decodes. QA was muted; subjective voice naturalness was
  not assessed by listening.
