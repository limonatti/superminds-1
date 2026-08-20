---
name: EWA Lesson
description: Warm, tactile, rounded theme for the studying side of English with Asya — unit pages, workbooks, grammar drills, games. Fredoka and Nunito, burgundy and ochre on cream, flat solid ledges instead of blurred shadows.
colors:
  bg: "#f4e9d8"
  surface: "#fdfaf0"
  surface-warm: "#fff7ea"
  surface-sand: "#f6ede0"
  surface-deep: "#eee3d2"
  text: "#1c1310"
  muted: "#5a4f47"
  muted-2: "#8a7a68"
  accent: "#7c2340"
  accent-deep: "#4d1527"
  accent-2: "#e0952a"
  accent-2-soft: "#ffd27a"
  ledge: "#e3d3ba"
  terracotta: "#b5654a"
  success: "#27ae60"
  success-bg: "#c8efc0"
  success-text: "#1b5e20"
  danger: "#c0392b"
  danger-bg: "#ffc9c0"
  danger-text: "#7b190d"
typography:
  heading:
    fontFamily: Fredoka, system-ui, sans-serif
    fontWeight: 600
    lineHeight: 1.15
  body:
    fontFamily: Nunito, system-ui, sans-serif
    fontSize: 15px
    lineHeight: 1.6
    fontWeight: 700
  h1:
    fontSize: 38px
  h2:
    fontSize: 24px
  h3:
    fontSize: 20px
  h4:
    fontSize: 17px
  h5:
    fontSize: 15px
  h6:
    fontSize: 13px
rounded:
  sm: 12px
  md: 18px
  lg: 26px
  pill: 999px
spacing:
  1: 4px
  2: 8px
  3: 12px
  4: 16px
  6: 24px
  8: 32px
---

## 1. Visual Theme & Atmosphere

Warm, tactile and paper-like — cream surfaces that read as pressed card stock, with chunky solid ledges under every card that make elements feel physically pressable. Generously rounded throughout.

The softness is doing real work. This is where a student spends the most time and where they get answers wrong; a warm, rounded, slightly playful surface lowers the stakes of a mistake. The mood is a well-made workbook, not a quiz app.

Density is relaxed — a single content column, generous vertical rhythm between sections, one idea per block.

## 2. Color Palette & Roles

- **Warm Cream** (#f4e9d8) — the page background
- **Pale Ivory** (#fdfaf0) — the default card surface
- **Warm Ivory** (#fff7ea) / **Sand** (#f6ede0) / **Deep Sand** (#eee3d2) — progressively darker surfaces for nesting and alternating rows
- **Deep Burgundy** (#7c2340) — headings and primary buttons; the brand colour
- **Dark Burgundy** (#4d1527) — pressed burgundy, and the ledge colour beneath burgundy elements
- **Warm Ochre** (#e0952a) — the secondary route: workbook, grammar, alternative paths
- **Soft Ochre** (#ffd27a) — tints, highlights, badges
- **Dark Cocoa** (#1c1310) — body text
- **Muted Brown** (#5a4f47) — descriptions beneath a heading
- **Soft Taupe** (#8a7a68) — the smallest metadata labels
- **Biscuit Ledge** (#e3d3ba) — the flat shadow colour beneath cream surfaces
- **Terracotta** (#b5654a) — illustration and decorative fills only, never text or controls

Answer feedback: correct is **Mint Fill** (#c8efc0) with **Green Border** (#27ae60) and **Forest Text** (#1b5e20); wrong is **Blush Fill** (#ffc9c0) with **Brick Border** (#c0392b) and **Oxblood Text** (#7b190d). Always pair the colour with an icon or a text label — never colour alone.

## 3. Typography Rules

Fredoka carries headings, Nunito carries everything else. This pairing is the strongest single signal that a page is a lesson and must not be substituted.

Fredoka runs at 500–700, with 600 as the default heading weight. Hero headings scale fluidly between 26px and 38px. Section headings sit at 24px.

Nunito runs at 700–900 and never lighter: 700 for body, 800 for buttons and labels, 900 for numbers and emphasis. Nunito at 400 reads thin against cream and breaks the tone.

Metadata labels are 13px in Soft Taupe.

## 4. Component Stylings

- **Buttons:** fully rounded pills at 999px, Nunito 800 at 13–14px, padding 11px 20px, with a `0 4px 0` ledge. Primary fills Deep Burgundy over a Dark Burgundy ledge; secondary fills Warm Ochre over a Biscuit ledge. Pressing moves the button down 4px and collapses the ledge to 0.
- **Cards:** 18px radius on Pale Ivory, `0 4px 0` Biscuit ledge, 18px 22px padding.
- **Hero blocks:** 26px radius with overflow hidden, a 3:2 image or oversized emoji cover, and a `0 8px 0` ledge.
- **Answer options:** 12px radius tiles that switch to the shared answer states when checked.
- **Gap inputs:** inline, 12px radius, same answer states.
- **Chips and tags:** 12px radius with a `0 3px 0` ledge.
- **Focus:** a 2px Deep Burgundy outline at 2px offset via :focus-visible on every interactive element.

## 5. Layout Principles

Content column caps at 860px, centred, with 24px 18px padding and 70px of bottom space for thumb reach.

Separation comes from surface change and ledge depth, never from rules. Sections get 30px above the heading and 12px below it. Spacing follows a 4px base.

Depth is a **flat ledge**, not a blur: `box-shadow: 0 Npx 0 <ledge colour>` at 3px for chips, 4px for the default, 6px for emphasis, 8px for heroes. Blurred shadows are forbidden — they destroy the tactile effect the whole theme rests on.

Mobile-first. Everything collapses to a single column below 768px, and every tap target is at least 44px; these pages are used on phones far more than the app is.

## 6. Design System Notes for Stitch Generation

Describe layout and content only. Do not repeat hex codes or font names in prompts once this design system is applied at project level.

Language to use: "warm", "tactile", "paper-like", "generously rounded", "solid flat ledge under cards", "pressable", "cream and burgundy".

Never ask for: blurred drop shadows, sharp corners, cool greys, thin text weights, a third accent colour, gradients.

Interface copy is Russian; example English sentences inside exercises stay English. Do not invent metrics, counts or student names — use bracketed placeholders such as `[количество]`.
