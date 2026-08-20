---
version: 1.0
name: English with Asya
description: Two-theme design system for the English with Asya learning platform. The app theme is flat, high-contrast and editorial (Archivo, one red accent, no rounding). The lesson theme is warm, tactile and rounded (Fredoka + Nunito, burgundy and ochre, flat drop-ledges). Both share one 4px spacing base, one set of interaction states, and one accessibility contract.
themes:
  - app
  - lesson
colors:
  app-bg: "#f3f2f2"
  app-surface: "#eae9e9"
  app-text: "#201e1d"
  app-accent: "#ec3013"
  app-accent-2: "#e15b47"
  app-accent-600: "#dd2b0f"
  app-accent-700: "#ae1800"
  app-neutral-300: "#d7d3d3"
  app-neutral-500: "#9b9797"
  app-neutral-700: "#605d5d"
  app-neutral-900: "#2d2b2b"
  lesson-bg: "#f4e9d8"
  lesson-surface: "#fdfaf0"
  lesson-surface-warm: "#fff7ea"
  lesson-surface-sand: "#f6ede0"
  lesson-surface-deep: "#eee3d2"
  lesson-brand: "#7c2340"
  lesson-brand-deep: "#4d1527"
  lesson-accent: "#e0952a"
  lesson-accent-soft: "#ffd27a"
  lesson-text: "#1c1310"
  lesson-muted: "#5a4f47"
  lesson-muted-2: "#8a7a68"
  lesson-ledge: "#e3d3ba"
  lesson-terracotta: "#b5654a"
  success: "#27ae60"
  success-bg: "#c8efc0"
  success-text: "#1b5e20"
  danger: "#c0392b"
  danger-bg: "#ffc9c0"
  danger-text: "#7b190d"
typography:
  app-heading:
    fontFamily: Archivo, system-ui, sans-serif
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: -0.015em
  app-body:
    fontFamily: Archivo, system-ui, sans-serif
    fontSize: 15px
    lineHeight: 1.55
    fontWeight: 400
  lesson-heading:
    fontFamily: Fredoka, system-ui, sans-serif
    fontWeight: 600
    lineHeight: 1.15
  lesson-body:
    fontFamily: Nunito, system-ui, sans-serif
    fontSize: 15px
    lineHeight: 1.6
    fontWeight: 700
  h1:
    fontSize: 42px
  h2:
    fontSize: 32px
  h3:
    fontSize: 25px
  h4:
    fontSize: 20px
  h5:
    fontSize: 16px
  h6:
    fontSize: 13px
    letterSpacing: 0.08em
rounded:
  app-sm: 0px
  app-md: 0px
  app-lg: 0px
  lesson-sm: 12px
  lesson-md: 18px
  lesson-lg: 26px
  lesson-pill: 999px
spacing:
  1: 4px
  2: 8px
  3: 12px
  4: 16px
  6: 24px
  8: 32px
---

## Overview

English with Asya teaches conversational English. The product splits cleanly into two contexts, and the interface follows that split rather than fighting it.

**The app** is where a student or teacher manages things: cabinet, schedule, homework, chat, admin, boards. It is deliberately flat and typographic — weight and rule-work carry hierarchy, never rounding or shadow. One red accent marks every interactive and current-state affordance, so a page can be scanned for "what can I act on" in a single pass.

**The lesson** is where a student actually studies: unit pages, workbooks, grammar drills, games. It is warm, tactile and rounded — paper-like cream surfaces, burgundy headings, chunky flat ledges under cards that make them feel physically pressable. This is where a learner spends the most time, and the softness is doing real work: it lowers the stakes of getting an answer wrong.

The two themes never mix on one screen. A page is either app or lesson, and it commits.

## Colors

### App theme

Body text is `app-text` on `app-bg`. Muted text is `app-text` at 55% opacity — never a separate grey hex.

Use `app-accent` for interactive affordances and current state only. A page carries **one** accent; a second decorative colour competes with it and makes actionable elements harder to find. `app-accent-2` exists for telling content categories apart, not as a second brand voice.

Hover darkens to `app-accent-600`, active to `app-accent-700`.

### Lesson theme

The page is `lesson-bg` — warm cream. Cards sit on `lesson-surface`, the lightest surface, and are the default container. `lesson-surface-warm`, `lesson-surface-sand` and `lesson-surface-deep` step progressively darker for nesting and for banding alternate rows.

`lesson-brand` (burgundy) carries all headings and primary buttons. `lesson-brand-deep` is its pressed state and the ledge colour under burgundy elements. `lesson-accent` (ochre) is the secondary action — "workbook", "grammar", anything that is an alternative route rather than the main one. `lesson-accent-soft` is its tint for highlights and badges.

Text is `lesson-text`. `lesson-muted` is for descriptions under a heading; `lesson-muted-2` is for the smallest metadata labels. Do not add a third grey.

`lesson-terracotta` is available for illustration and decorative fills only — never for text or controls.

### Shared answer states

Both themes use the same three-part answer feedback, because a student learns the colour once:

- Correct: `success-bg` fill, `success` border, `success-text` text
- Wrong: `danger-bg` fill, `danger` border, `danger-text` text
- Untouched: theme surface, theme divider border

Never signal correctness by colour alone — pair it with an icon or a text label.

## Typography

### App

Archivo carries both roles. Headings are always weight 800 with `-0.015em` tracking and 1.12 line height; body is weight 400 at 1.55. Hierarchy comes from the size ramp and this weight jump, not from colour.

`h6` is the label style: 13px, uppercase, `0.08em` tracking. Use it for the one kind of section label a page needs, not above every section.

### Lesson

Fredoka carries headings, Nunito carries everything else. This pairing is the single strongest signal that a page is a lesson — it must not be substituted.

Fredoka runs at 500–700; 600 is the default heading weight. Nunito runs at 700–900: 700 for body, 800 for buttons and labels, 900 for numbers and emphasis. Lesson text is never lighter than 700 — Nunito at 400 reads thin against cream and breaks the tone.

Hero headings scale fluidly: `clamp(26px, 5vw, 38px)`. Section headings sit at 24px. Metadata labels at 13px in `lesson-muted-2`.

## Layout

Spacing follows a 4px base in both themes. Content columns cap at 860px in lessons and at the app's own container width elsewhere.

In the app, structural separation uses a 2px rule in the divider colour; separation inside a component (table rows, input borders) uses 1px. Those two weights are what tells "between sections" apart from "within a component".

In lessons, separation comes from surface change and the ledge shadow, not from rules. Sections are separated by 30px of space above the heading and 12px below it.

## Elevation & Depth

### App

Shadows are opt-in through `.elev-sm`, `.elev-md`, `.elev-lg`, and they are ink-tinted rather than black. Surfaces separate by background and rule by default. Reach for elevation only when something genuinely floats above the page, such as a dialog.

### Lesson

Elevation is a **flat ledge**, not a blur: `box-shadow: 0 Npx 0 <ledge colour>`. It reads as a solid edge under the card, like a printed sticker.

- `0 3px 0` — small chips and inline tags
- `0 4px 0` — the default for buttons and small cards
- `0 6px 0` — emphasised cards
- `0 8px 0` — hero blocks

The ledge colour is `lesson-ledge` on cream surfaces and `lesson-brand-deep` under burgundy elements. Never use a blurred shadow in the lesson theme — it flattens the tactile effect that the whole theme is built on.

Pressing a ledge element moves it down by its ledge height and shrinks the ledge to 0, so the button visibly depresses.

## Shapes

App radius is `0px` at all three steps. The system has no rounding. True circles (radio dots, avatars) are the exception and use `50%`.

Lesson radius has four steps: `12px` for chips, inputs and small tiles; `18px` for the default card; `26px` for hero blocks; `999px` for buttons and pills. Buttons in lessons are always fully rounded — a square button reads as app chrome and breaks context.

## Components

### App

Buttons use Archivo at weight 800, 14px, matching `.input`'s 14px so the pair aligns when side by side. `btn-primary` fills with `app-accent`, darkening to `app-accent-600` on hover and `app-accent-700` on active.

Inputs sit on `app-surface` with a 1px divider border, taking the accent as both caret and focus border. Labels are 12px above the field.

Tables use a 2px header rule and 1px row rules, with uppercase 11px headers in muted text.

### Lesson

Buttons are pills: `999px` radius, `0 4px 0` ledge, Nunito 800 at 13–14px, padding `11px 20px`. Primary fills `lesson-brand` with a `lesson-brand-deep` ledge; secondary fills `lesson-accent` with a `lesson-ledge` ledge.

Cards are `18px` radius on `lesson-surface` with a `0 4px 0` ledge and `18px 22px` padding. Hero blocks are `26px` radius with `overflow: hidden`, a `3/2` image or emoji cover, and `0 8px 0`.

Answer options are `12px` radius tiles that switch to the shared answer states on check. Fill-in-the-gap inputs are inline, `12px` radius, and use the same states.

### Both

Focus is visible on every interactive element: a 2px outline in the theme's accent at 2px offset, applied through `:focus-visible` so it appears for keyboard users without firing on mouse click. `:focus` clears the default outline only because `:focus-visible` replaces it.

Every tap target is at least 44px. Lesson pages are used on phones far more than the app is.

## Do's and Don'ts

- Do decide the theme before anything else. Ask "is this studying, or is this managing?" — studying is lesson, everything else is app.
- Do retune the app theme in `modernist.css`. It is the source of truth for that look; page-level overrides drift.
- Don't mix the themes on one screen. No Fredoka in the cabinet, no Archivo body text in a unit page.
- Don't round corners in the app theme. Radius is 0 by design, and `sm-skin.css` enforces it with `border-radius: 0 !important` on legacy pages.
- Don't use blurred shadows in the lesson theme, or flat ledges in the app theme. Each theme's depth model is exclusive.
- Don't use Nunito below weight 700, and don't set lesson headings in anything but Fredoka.
- Don't add a second accent to either theme.
- Don't invent metrics, counts, or student names for mockups. Use bracketed placeholders such as `[количество]`.

## 6. Design System Notes for Stitch Generation

Copy the block for the theme you need into the Stitch prompt. Give Stitch layout and content; the tokens below carry all the visual styling.

### App theme block

```
DESIGN SYSTEM (REQUIRED):
- Platform: Web, desktop-first, works down to 375px
- Theme: light, flat, editorial, high contrast
- Background: Warm Off-White (#f3f2f2); cards and panels Soft Grey (#eae9e9)
- Text: Near-Black Ink (#201e1d); muted text is the same ink at 55% opacity
- Accent: Signal Red (#ec3013) for every interactive element and current state,
  darkening to #dd2b0f on hover and #ae1800 when pressed. Exactly one accent per page.
- Typography: Archivo throughout. Headings weight 800, tight tracking (-0.015em),
  line height 1.12. Body weight 400 at 1.55. Section labels 13px uppercase, 0.08em tracking.
- Shape: zero rounding everywhere. Sharp, squared-off corners. Circles only for avatars and radio dots.
- Depth: no decorative shadows. Separation comes from background change and rules —
  2px rules between sections, 1px rules inside components.
- Spacing: 4px base scale (4, 8, 12, 16, 24, 32)
```

### Lesson theme block

```
DESIGN SYSTEM (REQUIRED):
- Platform: Web, mobile-first, content column caps at 860px
- Theme: warm, tactile, rounded, paper-like
- Background: Warm Cream (#f4e9d8); cards Pale Ivory (#fdfaf0);
  nested surfaces Sand (#f6ede0) and Deep Sand (#eee3d2)
- Brand: Deep Burgundy (#7c2340) for headings and primary buttons,
  pressing to Dark Burgundy (#4d1527)
- Secondary: Warm Ochre (#e0952a) for alternative routes such as workbook and grammar
- Text: Dark Cocoa (#1c1310); descriptions Muted Brown (#5a4f47);
  small labels Soft Taupe (#8a7a68)
- Typography: Fredoka for all headings (weight 600, hero scales clamp(26px, 5vw, 38px));
  Nunito for everything else, never below weight 700 — 800 for buttons, 900 for numbers
- Shape: generously rounded. Cards 18px, hero blocks 26px, chips and inputs 12px,
  buttons fully rounded pills at 999px
- Depth: flat solid ledges, never blurred shadows — box-shadow 0 4px 0 #e3d3ba on cards
  and buttons, 0 8px 0 on hero blocks, 0 6px 0 #4d1527 under burgundy elements.
  Pressed elements move down by the ledge height and the ledge collapses to 0.
- Answer states: correct is #c8efc0 fill with #27ae60 border and #1b5e20 text;
  wrong is #ffc9c0 fill with #c0392b border and #7b190d text. Always pair colour with an icon or label.
- Spacing: 4px base scale; 30px above section headings, 12px below
```

### Prompt hygiene

- Never put hex codes or font names in a Stitch prompt when the project already has a design system applied — Stitch holds the tokens at project level and duplicating them causes conflicts. Use the blocks above only when generating into a project with no design system attached.
- Describe layout and content: what each section contains, in what order, and what the user can do there.
- Interface copy is Russian; example English sentences inside exercises stay English.
- Ask for one screen at a time, then refine with targeted edits rather than regenerating.
