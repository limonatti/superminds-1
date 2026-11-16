# A wonderfully wrong holiday

Created 16 November 2026 for Asya's 13:00 lesson. Six original speaking activities, 44 minutes nominally, adjustable to 40–50 minutes. No required typing, microphone capture, automatic speech grading, account, or cloud persistence.

## Syllabus mapping

Source checked in the platform's local `assets/course.js` page text: Outcomes Beginner, Student's Book with the Spark platform, Hugh Dellar & Andrew Walkley, ISBN 979-8-214-17926-1. Printed pages 50–55, digital page IDs 53–58. These are the opening three spreads of Unit 6, Away from home. Edition label intentionally omitted because the platform's existing metadata is inconsistent with the cover.

1. Problem detective: pp.50–53; tired, rain, nowhere to sit, wrong way, was/were/went; personal decisions and four scene descriptions.
2. Voice postcards: pp.52–55; How was…?, had/went/was, regular past in listening; three new messages, two-fact retelling, personal reply and follow-up question.
3. Apology roulette: pp.52–53; Sorry…, Don't worry, That's OK, did/had/went; random situation and delivery, four-turn dialogue, role swap.
4. Hotel casting: pp.51 and 54–55; hotel/hostel, sharing a room, quiet/noise, lift, breakfast; guest requirements, ask-to-reveal information and a hidden drawback. Added phrases (included, midnight, stairs) have support. Preference questions use already familiar present forms.
5. Reception on the radio: p.54; booking, passport, room number, breakfast, check-out, Wi-Fi; seven new audio prompts, spoken replies, deliberate one-night vs two-night error, role swap.
6. Holiday director: pp.52–55; six-sentence first-person story from an original four-panel comic. Basic path uses was/were/had/went. Optional advanced path adds stayed/rained/loved and past negatives. Hide picture, introduce twist/fiction, retell with fewer supports.

No past-simple did questions from pp.56–57 are required. If only opening and first teaching spreads (50–53) have been covered, tasks 4–5 are a supported preview, as stated in the teacher guide.

## Media

All media is new, generated for this lesson, not textbook media.

Images made with the built-in image_gen tool, visually inspected and copied into this project:
- `media/airport.png`: coherent airport problem scene; 1536×1024.
- `media/hotels.png`: three accommodation options; 1774×887.
- `media/holiday.png`: four-panel holiday story with a goat; 1536×1024.
Exact generation prompts are in IMAGE-PROMPTS.md. Original tool outputs remain in the Codex generated_images directory.

Audio: 15 MP3s generated with edge-tts using en-GB-SoniaNeural, en-GB-RyanNeural and en-GB-LibbyNeural, rate -15%. All exact generation scripts are in `audio-scripts.json`; reproducible generator in `generate-audio.py`. Generation saves files without system playback. AI voice provenance is disclosed in the lesson footer.

## Usage and persistence

Open index.html. All required media is relative and included in offline.zip. Teacher notes: teacher-guide.html or the Для Аси button. Local storage key: `asya-outcomes-u6-speaking-v1`; existing platform coursework is untouched. Save failures are non-blocking and reported. Completion is a learner/teacher checkbox, not automatic grading. Only the three audio headline selections have factual feedback; open speaking responses accept multiple answers.

## Verification

- `python3 check.py`: 88 platform checks passed.
- `node --check`: app.js and data.js passed.
- All 15 MP3s decode, durations 2.6–20.0 seconds; scripts cross-checked against displayed transcripts.
- Browser: all six activities, answer retry and correct feedback, voice tabs, speed 0.85×, situation/mood/role switches, hotel questions and secret, seven receptionist steps, final twist and image hide, teacher dialog, hint toggle, and reload persistence checked.
- All six screens at 390px: no horizontal overflow; all three images load. Browser error/warning log empty.
- Audio metadata loads in the browser, including all seven reception clips. No qualitative auditory listening or automatic speech recognition check was performed.

The guest names, prices, booking and password are fictional. The task is classroom speaking practice; it does not contact hotels or transmit personal data.
