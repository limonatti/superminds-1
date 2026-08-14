---
version: alpha
name: English with Asya
description: Design system for the English with Asya learning platform. Flat, high-contrast, editorial. Archivo throughout, one red accent, no rounding.
colors:
  bg: "#f3f2f2"
  surface: "#eae9e9"
  text: "#201e1d"
  accent: "#ec3013"
  accent-2: "#e15b47"
  neutral-100: "#f8f4f4"
  neutral-200: "#eae7e7"
  neutral-300: "#d7d3d3"
  neutral-400: "#bab6b6"
  neutral-500: "#9b9797"
  neutral-600: "#7d7979"
  neutral-700: "#605d5d"
  neutral-800: "#444141"
  neutral-900: "#2d2b2b"
  accent-100: "#fff2ef"
  accent-200: "#ffe0d9"
  accent-300: "#ffc4b8"
  accent-400: "#ff9783"
  accent-500: "#ff563c"
  accent-600: "#dd2b0f"
  accent-700: "#ae1800"
  accent-800: "#7c1405"
  accent-900: "#4d170e"
  accent-2-100: "#fff2ef"
  accent-2-200: "#ffe0da"
  accent-2-300: "#ffc4b9"
  accent-2-400: "#ff9784"
  accent-2-500: "#ef6853"
  accent-2-600: "#c94b39"
  accent-2-700: "#9e3526"
  accent-2-800: "#71261b"
  accent-2-900: "#471d16"
typography:
  body:
    fontFamily: Archivo, system-ui, sans-serif
    fontSize: 15px
    lineHeight: 1.55
    fontWeight: 400
  heading:
    fontFamily: Archivo, system-ui, sans-serif
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: -0.015em
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

## Overview

English with Asya teaches conversational English through lessons, boards, and a student↔teacher chat. The interface is deliberately flat and typographic: weight and rule-work carry hierarchy, not rounding or shadow. One red accent marks every interactive and current-state affordance, so a learner can scan a page for "what can I act on" in a single pass.

## Colors

Use `accent` for interactive affordances and current state only. A page carries one accent; a second decorative color competes with it and makes the actionable elements harder to find.

`accent-2` and its ramp exist for content categories that must be told apart from each other, not for a second brand voice.

The neutral, accent, and accent-2 ramps sit on one shared lightness scale, so the same step of any ramp matches the others in visual value. Pick a step by role, not by eye: swapping `accent-600` for `neutral-600` keeps the value and changes only the hue.

Body text is `text` on `bg`. Muted text is `text` mixed to 55% opacity, which holds contrast on both `bg` and `surface`. Do not introduce a separate grey hex for secondary text.

## Typography

Archivo carries both roles. Headings are always weight 800 with `-0.015em` tracking and 1.12 line height; body is weight 400 at 1.55. Hierarchy comes from the size ramp and this weight jump, not from color.

`h6` is the label style: 13px, uppercase, `0.08em` tracking. Use it for the one kind of section label the page needs, not above every section.

## Layout

Spacing follows a 4px base. Structural separation uses a 2px rule in `divider`; separation inside a component (table rows, input borders) uses 1px. The two weights are what tells "between sections" apart from "within a component".

## Elevation & Depth

Shadows are opt-in through `.elev-sm`, `.elev-md`, and `.elev-lg`. They are ink-tinted, not black. Surfaces separate by background and rule by default; reach for elevation only when something genuinely floats above the page, such as a dialog.

## Shapes

All three radius steps are `0px`. The system has no rounding. True circles (radio dots, avatars) are the exception and use `50%`.

## Components

Buttons use the heading font at weight 800, 14px, matching `.input`'s 14px so the pair aligns when they sit side by side in a sign-up row. `btn-primary` fills with `accent`, darkening to `accent-600` on hover and `accent-700` on active.

Inputs sit on `surface` with a 1px `divider` border, and take the accent as both caret and focus border. Labels are 12px above the field.

Focus is visible on every interactive element: a 2px `accent` outline at 2px offset, applied through `:focus-visible` so it appears for keyboard users without showing on mouse click. `:focus` clears the default outline only because `:focus-visible` replaces it.

Tables use a 2px header rule and 1px row rules, with uppercase 11px headers in muted text.

## Do's and Don'ts

- Do retune the system in `modernist.css`. It is the source of truth for the look; page-level overrides drift.
- Don't round corners. Radius is 0 by design, and `sm-skin.css` enforces it with `border-radius: 0 !important` on legacy pages.
- Don't add box shadows for decoration. `sm-skin.css` strips them with `box-shadow: none !important` and replaces them with 2px borders.
- Don't use a font other than Archivo for interface text.
