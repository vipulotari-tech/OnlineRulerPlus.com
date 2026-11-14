# Online Ruler Plus — Architecture & Measurement Engine Spec

Status: accepted · Date: 2026-11-14

## 1. Product findings (competitor research)

realonlineruler.com (fetched 2026-11-14) offers: cm / in / px units, edge rulers
(top/bottom/left/right), a calibration modal (auto-detect, device list, diagonal,
card), click-to-drop guides, crosshair, fullscreen and the G/C/F/Esc/1-3/D/H
shortcut set. It loads AdSense and Google Analytics.

Gaps we target (original implementation, original design):

| Area | Online Ruler Plus |
|---|---|
| Privacy | No ads, no analytics, no network calls for measuring |
| Units | cm, **mm**, in (fractional readout to 1/16), px |
| Measuring | Drag-to-measure tool (dx, dy, length) + guide-to-guide distances |
| History | Local measurement history |
| Calibration | Per-display profiles; automatic re-scaling on zoom / OS-scaling change; warning on monitor change; built-in card verification |
| Rulers | Edge rulers + floating draggable rulers + dual cm/in scale, adjustable opacity & thickness |

## 2. Core invariant

The engine stores one scale: **CSS pixels per millimetre (`pxPerMm`)**.

- `1 in = 25.4 mm`, `1 cm = 10 mm`, CSS reference `1 in = 96 CSS px`.
- The 96 px/in reference is only the *uncalibrated fallback estimate*; it is never
  presented as a physical calibration.
- `px` readouts are CSS pixels and are independent of calibration.

Calibrations are persisted as **device pixels per millimetre**
(`devicePxPerMm = pxPerMm × devicePixelRatio`). The physical panel does not change
when the user zooms the browser or changes OS scaling, so on the same panel
`pxPerMm = devicePxPerMm / currentDpr` stays correct automatically.

## 3. Calibration maths

- **Diagonal**: `cssPpi = √(screen.width² + screen.height²) / diagonalIn`,
  `pxPerMm = cssPpi / 25.4`. `screen.*` are CSS px at 100 % zoom, so the UI
  asks for 100 % zoom. Accepted diagonal: 3–100 in.
- **Card** (ISO/IEC 7810 ID-1, 85.60 × 53.98 mm): `pxPerMm = cardWidthPx / 85.60`,
  height is always `width × 53.98 / 85.60`. Card rotates to portrait on narrow screens.
- **Auto-detect**: exact match against a curated device table (screen CSS size,
  DPR, platform). A match counts only if every candidate agrees to within 2 %.
  Ambiguous matches → mean, labelled *estimated*. Otherwise typical-display
  heuristics, falling back to the CSS reference, labelled *estimated*.
- Sanity range for any result: 1–20 CSS px/mm (≈25–508 CSS px/in).

## 4. Display-change handling

`classifyDisplayChange(prev, next)`:

- `orientation`: the same dimensions swapped → re-render only.
- `zoom`: DPR changed while CSS screen size is unchanged (Chromium zoom), or the
  device-pixel size is unchanged (Firefox zoom / OS scaling) → re-scale from
  `devicePxPerMm`, show an informational notice.
- `display`: anything else → look up that display's profile, else auto-detect; warn.

Profile key: `long×short@dpr` from the CSS screen size.

## 5. Modules

```
src/lib/ruler/      pure, framework-free, unit-tested with node:test
  units.ts          constants, conversion, formatting, inch fractions
  ticks.ts          tick generation (adaptive density, label spacing)
  calibration.ts    diagonal / card maths, validation, scale conversions
  devices.ts        device table, detection, estimation
  display.ts        DisplayInfo, platform detection, signature, change classification
  storage.ts        validated parse/serialise for calibration, preferences, history
  resolve.ts        choose active calibration from store + display
src/scripts/        browser-only UI wiring (vanilla TS, no framework runtime)
src/components/     Astro components (static HTML)
```

## 6. Verification

- `npm test`: node:test unit tests for every `src/lib/ruler` module (Node strips TS types).
- `npm run test:e2e`: Playwright on Chrome and Edge channels covers the ruler,
  calibration, shortcuts, persistence and the mobile viewport.
- `npm run build` and `astro check` (types).
