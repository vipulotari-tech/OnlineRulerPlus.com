# Premium Visual Design Report — OnlineRulerPlus.com

## Executive Summary

OnlineRulerPlus.com has been upgraded into a visual measurement platform following an editorial, technical-drafting design language inspired by Apple and Vercel developer documentation. All enhancements strictly preserve the core ruler workspace above the fold on desktop and mobile while eliminating text-heavy monotony across tool and learning routes.

- **Design System Adherence (`DESIGN.md`)**: Every diagram, animation card, and interactive studio uses restrained surfaces (`--surface-canvas`, `--surface-elevated`, `--surface-parchment`, `--border-hairline`), Action Blue (`#0066cc`) and Focus/Link Blue (`#0071e3` / `#2997ff`) accents, crisp 1–2px drafting strokes, zero decorative gradients, and zero synthetic blobs.
- **No Thin SEO Pages Added**: All visual assets integrate naturally into existing high-intent measurement tools and educational routes (`/` homepage, `/how-to-use`, `/calibration-guide`, `/cm-ruler`, `/mm-ruler`, `/inch-ruler`, `/horizontal-ruler`, `/vertical-ruler`, `/photo-ruler`, `/protractor`, `/screen-size-detector`, `/faq`) and all 12 localized language trees (`en`, `es`, `fr`, `de`, `it`, `pt`, `ja`, `ko`, `nl`, `tr`, `id`, `pl`).
- **Above-the-Fold Workspace Protection**: On desktop (`1440×900`) and mobile (`375×667`), all visuals sit strictly inside below-the-workspace `order-3` sections or dedicated documentation sections so `#ruler-workspace` remains immediately interactive at first paint.

## Architectural & Visual Principles Applied

### 1. Consistent Drafting Plate Geometry
All 9 original vector diagrams in `public/visuals/diagrams/` share an exact `720×400` (`9:5` aspect ratio) architectural plate specification:
- Outer chamfered frame (`rx="14"`) on an explicit `#fafafc` plate background with `#d8d8de` stroke and `20×20` `#ededf2` hairline coordinate grid.
- Monospace uppercase plate pill (`FIG. 01` – `FIG. 09`) with an Action Blue (`#0066cc`) datum indicator dot.
- Self-contained drafting colors inside standalone `.svg` files ensure sharp legibility across both Light Mode (`#ffffff` / `#f5f5f7`) and Dark Mode (`#000000` / `#272729`), while parent card shells in `DiagramFigure.astro` use `--surface-elevated` (`bg-canvas-elevated`) to guarantee WCAG 2.1 AA contrast even when placed inside charcoal `.apple-tile-dark` sections.

### 2. Purposeful Information Hierarchy Across Routes

| Route(s) | Visual Assets Placed | Pedagogical Role |
|:---|:---|:---|
| `/` (Homepage) | `MotionWalkthrough` (5 scenes) in `#how-it-works`; `Fig. 08` & `Fig. 09` in `#accuracy-guide` | Demonstrates ruler mechanics immediately below `#calibration` and pairs visual DPI physics with the hardware PPI table. |
| `/how-to-use` | `MotionWalkthrough` (5 scenes) + `Fig. 01`, `03`, `04`, `05`, `06`, `07` + 3 live UI `<picture>` captures | Acts as the visual tutorial hub covering workflow, dual-unit math, fractions, photo scaling, 2D guides, angles, and real UI captures. |
| `/calibration-guide` | `MotionWalkthrough` (`calibration`, `ticks`) + `Fig. 02`, `Fig. 09` | Visually explains parallax avoidance (`90°` viewing angle), ISO/IEC 7810 ID-1 card dimensions (`85.60 × 53.98 mm`), and uncalibrated 96 PPI error. |
| `/cm-ruler`, `/mm-ruler` | `Fig. 03` + `MotionWalkthrough` (`ticks`/`line` or `ticks`/`calibration`) | Connects centimeter/millimeter graduations and calibration precision to the metric tool workspace. |
| `/inch-ruler` | `Fig. 04` + `Fig. 03` | Maps dyadic inch fractions (`1/2"` down to `1/32"`) alongside metric equivalents. |
| `/horizontal-ruler`, `/vertical-ruler` | `Fig. 06` + `MotionWalkthrough` (`line`, `drag`) or `workspace-guides` capture | Shows draggable X/Y guide alignment, ΔX/ΔY span locking, and crosshair telemetry. |
| `/photo-ruler` | `Fig. 05` + `photo-measure` live UI capture | Demonstrates private browser-local 2-point reference calibration on flat tabletop photos without any upload to external servers. |
| `/protractor` | `Fig. 07` + `MotionWalkthrough` (`protractor`) | Illustrates dual-ray angle reading (`θ`, `180° − θ`, `360° − θ`) on a movable vertex. |
| `/screen-size-detector` | `Fig. 09` + `Fig. 02` | Visualizes how effective CSS PPI changes drawn physical size and how single-card calibration fixes it. |
| `/faq` | `Fig. 08` + `Fig. 09` | Provides a quick-scan visual comparison for tool tolerances and display scaling. |

### 3. Privacy & Media Restraint
- **No external video bloat or auto-playing background video**: Concept explanations that depend on motion are handled by GPU-composited inline SVG + CSS `@keyframes` inside `MotionWalkthrough.astro` plus crisp high-DPI live UI AVIF/WebP captures.
- **No private user photo leakage**: The `photo-measure` product capture was generated using a clean synthetic specimen target processed strictly client-side in `#photo-measure-panel`.

## Components & Internationalization Summary
- `src/components/DiagramFigure.astro`: Reusable `<figure>` frame supporting both standalone SVG diagrams and dual-format `<picture>` (`AVIF` + `WebP`) product captures with explicit dimensions, `loading="lazy"`, `decoding="async"`, `alt` text, and localized captions.
- `src/components/MotionWalkthrough.astro` & `src/scripts/visual-walkthrough.ts`: Interactive 5-scene animated diagram studio with keyboard-accessible `role="tab"` switching, Play/Pause control, automatic offscreen pausing via `IntersectionObserver`, and theme-reactive CSS variables (`var(--surface-elevated)`, `var(--text-ink)`, `var(--accent-link)`).
- Full 12-locale coverage in `src/i18n/types.ts` and `src/i18n/locales/*.json` (`visuals` namespace verified by `tests/i18n.test.mjs`).
