---
name: EWA App
description: Flat, high-contrast, editorial theme for the managing side of English with Asya — cabinet, schedule, homework, chat, admin, boards. Archivo throughout, one red accent, zero rounding.
colors:
  bg: "#f3f2f2"
  surface: "#eae9e9"
  text: "#201e1d"
  accent: "#ec3013"
  accent-2: "#e15b47"
  neutral-300: "#d7d3d3"
  neutral-500: "#9b9797"
  neutral-700: "#605d5d"
  neutral-900: "#2d2b2b"
  accent-600: "#dd2b0f"
  accent-700: "#ae1800"
  success: "#27ae60"
  success-bg: "#c8efc0"
  success-text: "#1b5e20"
  danger: "#c0392b"
  danger-bg: "#ffc9c0"
  danger-text: "#7b190d"
typography:
  heading:
    fontFamily: Archivo, system-ui, sans-serif
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: -0.015em
  body:
    fontFamily: Archivo, system-ui, sans-serif
    fontSize: 15px
    lineHeight: 1.55
    fontWeight: 400
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
  sm: 0px
  md: 0px
  lg: 0px
spacing:
  1: 4px
  2: 8px
  3: 12px
  4: 16px
  6: 24px
  8: 32px
---

## 1. Visual Theme & Atmosphere

Flat, typographic and unsentimental — closer to a well-set printed timetable than to a consumer app. Weight and rule-work carry all hierarchy; nothing is rounded and nothing floats. The density is moderate: enough air to read comfortably, tight enough that a teacher can see a week of schedule without scrolling.

The atmosphere is calm and businesslike. This is the side of the product where people manage their time and their students, and it should feel like an instrument rather than a toy.

## 2. Color Palette & Roles

- **Warm Off-White** (#f3f2f2) — the page background
- **Soft Grey** (#eae9e9) — cards, panels, input fills
- **Near-Black Ink** (#201e1d) — all body and heading text; muted text is this same ink at 55% opacity
- **Signal Red** (#ec3013) — the single accent: every interactive affordance and current state
- **Signal Red Hover** (#dd2b0f) — hover on accent fills
- **Signal Red Pressed** (#ae1800) — active state on accent fills
- **Muted Coral** (#e15b47) — content-category differentiation only, never a second brand voice
- **Pale Grey** (#d7d3d3) / **Mid Grey** (#9b9797) / **Slate Grey** (#605d5d) / **Charcoal** (#2d2b2b) — the neutral ramp for rules, borders and disabled states

Exactly one accent per page. A second decorative colour competes with the red and makes actionable elements harder to find.

Answer and status feedback: correct is **Mint Fill** (#c8efc0) with **Green Border** (#27ae60) and **Forest Text** (#1b5e20); wrong is **Blush Fill** (#ffc9c0) with **Brick Border** (#c0392b) and **Oxblood Text** (#7b190d). Never signal state by colour alone.

## 3. Typography Rules

Archivo carries both roles. Headings are weight 800 with -0.015em tracking and 1.12 line height. Body is weight 400 at 1.55. Hierarchy comes from the size ramp and that weight jump, never from colour.

The size ramp: 42 / 32 / 25 / 20 / 16 / 13. The smallest step doubles as the label style — 13px uppercase with 0.08em tracking, used for the one kind of section label a page needs, not above every section.

## 4. Component Stylings

- **Buttons:** Archivo weight 800 at 14px, sharp corners, matching the 14px of inputs so the pair aligns side by side. Primary fills with Signal Red, darkening to #dd2b0f on hover and #ae1800 when pressed.
- **Cards and panels:** Soft Grey fill, sharp corners, separated by rules rather than shadow.
- **Inputs:** Soft Grey fill with a 1px divider border; the accent serves as both caret and focus border. Labels are 12px above the field.
- **Tables:** 2px header rule, 1px row rules, uppercase 11px headers in muted ink.
- **Focus:** a 2px Signal Red outline at 2px offset via :focus-visible on every interactive element.

## 5. Layout Principles

A 4px spacing base: 4, 8, 12, 16, 24, 32. Structural separation between sections uses a 2px rule; separation inside a component uses 1px. Those two weights are what distinguishes "between sections" from "within a component".

Depth is opt-in and rare. Surfaces separate by background and rule; elevation appears only when something genuinely floats, such as a dialog, and its shadow is ink-tinted rather than black.

Single-column collapse below 768px. Tap targets at least 44px.

## 6. Design System Notes for Stitch Generation

Describe layout and content only. Do not repeat hex codes or font names in prompts once this design system is applied at project level.

Language to use: "flat", "editorial", "squared-off", "rule-separated", "one red accent", "weight-driven hierarchy".

Never ask for: rounded corners, drop shadows for decoration, gradients, a second accent colour, emoji in the interface.

Interface copy is Russian. Do not invent metrics, counts or student names — use bracketed placeholders such as `[количество]`.
