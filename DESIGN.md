# DESIGN.md — 瞬間Deutsch作文

Inspired by the Figma design system. Typographic precision and chromatic restraint.

---

## 1. Visual Theme & Atmosphere

- **Mood**: White gallery wall. The German text is the art — the UI is the frame.
- **Density**: Generous whitespace, light touch, nothing competes with content.
- **Philosophy**: Color lives in the product output (German text). The chrome is black and white only.

---

## 2. Color Palette

| Role           | Value       | Usage                          |
|----------------|-------------|--------------------------------|
| Background     | `#ffffff`   | Page background                |
| Surface        | `#f8f8f8`   | Cards, input areas             |
| Border         | `#e8e8e8`   | Dividers, card outlines        |
| Text primary   | `#000000`   | All primary text               |
| Text secondary | `#999999`   | Labels, hints, placeholders    |
| Pill bg        | `#f0f0f0`   | Tab switcher background        |

**Rule**: No accent colors in UI chrome. Black and white only.

---

## 3. Typography

| Element        | Font                 | Size            | Weight | Letter-spacing |
|----------------|----------------------|-----------------|--------|----------------|
| Logo           | DM Serif Display     | 18px            | 400    | -0.4px         |
| Japanese text  | DM Serif Display     | clamp(22–32px)  | 400    | -0.26px        |
| German text    | IBM Plex Mono        | clamp(18–26px)  | 600    | -0.26px        |
| Body / message | Barlow               | 14px            | 400    | -0.14px        |
| Labels / mono  | IBM Plex Mono        | 10–12px         | 400/600| +0.54px        |
| Score display  | IBM Plex Mono        | 24px            | 600    | -0.4px         |
| Completion     | DM Serif Display     | 56px            | 400    | -1.72px        |

**Rule**: Negative letter-spacing on display and body text. Positive tracking only on uppercase mono labels.

---

## 4. Component Styling

### Buttons

```
Primary (solid pill):
  background: #000000
  color: #ffffff
  border-radius: 50px
  font: IBM Plex Mono, 12px, uppercase, letter-spacing 0.54px

Ghost (outline pill):
  background: transparent
  border: 1px solid #e8e8e8
  color: #999999
  border-radius: 50px

Active ghost:
  border-color: #000000
  color: #000000
```

### Cards

```
background: #f8f8f8
border: 1px solid #e8e8e8
padding: 36px 32px
border-radius: 0  (sharp corners — content blocks, not UI controls)
```

### Input

```
background: #ffffff
border: 1px solid #e8e8e8
font: IBM Plex Mono, 16px
border-radius: 4px
caret-color: #000000
```

### Audio Button

```
border: 1px dashed #000000  (idle)
border: 1px solid #000000   (speaking)
opacity: 1 → 0.4 when speaking
border-radius: 50px
```

### Tab Switcher

```
container: background #f0f0f0, border-radius 50px, padding 3px
active tab: background #000000, color #ffffff
inactive tab: background transparent, color #666666
```

---

## 5. Layout Principles

- Max content width: `640px`
- Page padding: `32px 24px`
- Component gap: `12–20px`
- Header padding: `16px 28px`
- Progress bar: `1px` height, black on light grey track

---

## 6. Do's and Don'ts

**Do**
- Use pill shapes (border-radius: 50px) for all interactive controls
- Apply negative letter-spacing to display and body text
- Keep the UI chrome in black/white/grey
- Use dashed borders for secondary/passive states (audio button idle)
- Use italic DM Serif Display for proper nouns and German words in headings

**Don't**
- Use color for UI feedback (green/red for correct/incorrect) — use black/white contrast instead
- Add gradients or decorative bars to cards
- Use colored accent highlights in the interface chrome
- Mix multiple typeface weights aggressively — hierarchy comes from size and spacing

---

## 7. Agent Prompt Guide

When building new screens or components for this app, follow these rules:

- Background: `#ffffff`, surface: `#f8f8f8`, all text: `#000000` / `#999999`
- Buttons: pill shape (`borderRadius: 50`), black solid or white ghost
- Typography: DM Serif Display for Japanese/display, IBM Plex Mono for German/labels, Barlow for body
- Letter-spacing: negative on all body/display text, `0.54px` only on uppercase mono labels
- No color accents in UI — color belongs to content only
