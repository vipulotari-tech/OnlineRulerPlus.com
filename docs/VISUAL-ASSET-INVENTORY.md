# Visual Asset Inventory — OnlineRulerPlus.com

All generated visual assets reside under `public/visuals/` and are served with explicit intrinsic dimensions, descriptive localized `alt` text, `<figcaption>` captions, and `loading="lazy" decoding="async"` semantics via [DiagramFigure.astro](file:///C:/OnlineRulerPlus.com/src/components/DiagramFigure.astro).

## 1. Original Technical SVG Diagrams (`public/visuals/diagrams/`)

| ID | File Path | Dimensions | Size (Bytes) | Educational Topic | Key Placements |
|:---|:---|:---|---:|:---|:---|
| `d01` | `public/visuals/diagrams/01-how-to-use-online-ruler.svg` | `720 × 400` | `12,053` | Inset zero datum vs bezel & ΔX guide span subtraction | `/how-to-use` |
| `d02` | `public/visuals/diagrams/02-credit-card-calibration.svg` | `720 × 400` | `6,885` | ISO/IEC 7810 ID-1 card (`85.60 × 53.98 mm`) calibration & `90°` parallax avoidance | `/calibration-guide`, `/screen-size-detector` |
| `d03` | `public/visuals/diagrams/03-cm-mm-inch-comparison.svg` | `720 × 400` | `12,431` | Metric (`cm`/`mm`) vs imperial (`in`) aligned comparison (`1 in = 25.40 mm`) | `/how-to-use`, `/cm-ruler`, `/mm-ruler`, `/inch-ruler` |
| `d04` | `public/visuals/diagrams/04-inch-fractions.svg` | `720 × 400` | `8,594` | Hierarchical dyadic inch fractions (`1/2"` to `1/32"`) & decimals | `/how-to-use`, `/inch-ruler` |
| `d05` | `public/visuals/diagrams/05-photo-measurement.svg` | `720 × 400` | `5,992` | Local 3-step photo measurement & 2-point known span calibration | `/how-to-use`, `/photo-ruler` |
| `d06` | `public/visuals/diagrams/06-xy-guides-crosshair.svg` | `720 × 400` | `11,270` | Paired X/Y draggable guides, `ΔX × ΔY` box, diagonal, & live `[C]` crosshair | `/how-to-use`, `/horizontal-ruler`, `/vertical-ruler` |
| `d07` | `public/visuals/diagrams/07-protractor-angle-measurement.svg` | `720 × 400` | `7,970` | `180°` / `360°` dual-ray protractor, primary `θ`, supplementary, & reflex readout | `/how-to-use`, `/protractor` |
| `d08` | `public/visuals/diagrams/08-ruler-tape-caliper-comparison.svg` | `720 × 400` | `6,777` | Engineering comparison: screen ruler vs measuring tape vs Vernier caliper | `/`, `/faq` |
| `d09` | `public/visuals/diagrams/09-screen-dpi-ppi-accuracy.svg` | `720 × 400` | `4,493` | Physical drift of `378 CSS px` at `81.6 PPI`, `141.2 PPI`, vs calibrated `96 PPI` | `/`, `/calibration-guide`, `/screen-size-detector`, `/faq` |

**Subtotal (9 SVG Diagrams):** `76,465 bytes` (`74.67 KB`).

## 2. Optimized Live UI Captures (`public/visuals/captures/`)

Each product screenshot was captured directly from the production build (`astro preview`) in headless Chrome at `2×` device pixel ratio, scaled cleanly to `1200px` wide via `sharp`, and delivered via `<picture>` with AVIF priority and WebP fallback.

| ID | Asset Base | Dimensions | AVIF Size | WebP Size | Features Captured | Key Placements |
|:---|:---|:---|---:|---:|:---|:---|
| `workspaceGuides` | `public/visuals/captures/workspace-guides` | `1200 × 534` | `19,015 B` | `30,524 B` | Live `/` `#ruler-workspace` with X/Y guides & crosshair delta badge | `/how-to-use`, `/vertical-ruler` |
| `photoMeasure` | `public/visuals/captures/photo-measure` | `1200 × 533` | `15,991 B` | `21,476 B` | `/photo-ruler` calibrated at `3.99 px/mm` on synthetic ID-1 reference + CNC plate (`12.04 cm`) | `/how-to-use`, `/photo-ruler` |
| `protractorOverlay` | `public/visuals/captures/protractor-overlay` | `1200 × 534` | `19,413 B` | `29,258 B` | `/protractor` interactive `360°` circular protractor dial set at `45.0°` | `/how-to-use` |

**Subtotal (3 AVIF + 3 WebP):** `54,419 bytes` AVIF (`53.14 KB`), `81,258 bytes` WebP (`79.35 KB`).

## 3. Inline Vector Motion Scenes (`MotionWalkthrough.astro`)

Instead of large video loops or GIFs, educational motion is authored directly as theme-adaptive SVG scenes in [MotionWalkthrough.astro](file:///C:/OnlineRulerPlus.com/src/components/MotionWalkthrough.astro), styled via [global.css](file:///C:/OnlineRulerPlus.com/src/styles/global.css) and controlled by [visual-walkthrough.ts](file:///C:/OnlineRulerPlus.com/src/scripts/visual-walkthrough.ts) (`1,734 bytes` built chunk):

1. **`ticks`**: Animated ruler tick progression (`1 cm` → `5 mm` → `1 mm` subdivisions + scanning `3.00 cm` cursor).
2. **`line`**: Synchronized measurement line expansion (`scaleX`) and sliding `85.60 mm` datum cursor (`translateX`).
3. **`drag`**: X/Y draggable guide intersection illuminating a shaded `ΔX × ΔY` capture zone.
4. **`protractor`**: Dual-ray angular sweep (`rotate(42deg)` → `0°`) synchronized with live angle telemetry.
5. **`calibration`**: ISO ID-1 card alignment against `(0, 0)` datum with sliding flush handle.

## 4. Internationalization Key Coverage

All diagram `title`, `kicker`, `alt`, `caption`, walkthrough UI controls/scenes, and section headings live under the `visuals` object in `src/i18n/types.ts` and are localized identically across all 12 JSON files in `src/i18n/locales/`.
