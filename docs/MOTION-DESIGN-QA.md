# Motion Design QA Report — OnlineRulerPlus.com

## 1. Motion Architecture & Implementation

All purposeful animations run exclusively through CSS `@keyframes` (in [global.css](file:///C:/OnlineRulerPlus.com/src/styles/global.css)), inline vector SVG groups (in [MotionWalkthrough.astro](file:///C:/OnlineRulerPlus.com/src/components/MotionWalkthrough.astro)), and a tiny progressively enhanced controller ([visual-walkthrough.ts](file:///C:/OnlineRulerPlus.com/src/scripts/visual-walkthrough.ts), `1,734 bytes` in the built bundle). Zero external animation libraries were added.

### GPU-Composited Properties Only
Every `@keyframes` rule avoids layout-thrashing properties (`width`, `height`, `top`, `left`, `margin`, `padding`) and animates only `transform` (`translateX`, `translateY`, `scaleX`, `scaleY`, `rotate`) and `opacity`:

| Keyframe Name | Animated Properties | Target Class | Pedagogical Purpose |
|:---|:---|:---|:---|
| `orp-tick-grow` | `transform: scaleY()`, `opacity` | `.orp-anim-tick-cm`, `.orp-anim-tick-half`, `.orp-anim-tick-mm` | Staggered progression from 1 cm primary ticks to 5 mm and 1 mm subdivisions |
| `orp-line-expand` | `transform: scaleX()`, `opacity` | `.orp-anim-line` | Measurement span expanding continuously from inset zero datum to target edge |
| `orp-cursor-scan` | `transform: translateX()` | `.orp-anim-cursor` | Synchronized datum marker tracking across ticks (`3.00 cm`) or span end (`85.60 mm`) |
| `orp-guide-slide-x` | `transform: translateX()` | `.orp-anim-guide-x` | Draggable vertical X2 guide snapping flush to an object edge |
| `orp-guide-slide-y` | `transform: translateY()` | `.orp-anim-guide-y` | Draggable horizontal Y2 guide locking height alongside X2 |
| `orp-zone-reveal` | `opacity` | `.orp-anim-zone` | Highlights captured `ΔX × ΔY` area and protractor sector upon alignment |
| `orp-protractor-sweep` | `transform: rotate()` | `.orp-anim-ray` | Sweeps protractor ray around vertex `(210, 186)` from `42°` baseline shift to `0°` target |
| `orp-cal-handle` | `transform: translateX()` | `.orp-anim-cal-handle` | Demonstrates dragging calibration edge flush to `85.60 × 53.98 mm` ID-1 reference |
| `orp-fade-slide-in` | `opacity`, `transform: translateY()` | `.orp-scene-panel[data-active="true"]` | Subtle `200ms` cubic-bezier tab panel transition (`forwards`, never paused offscreen) |

## 2. Reduced-Motion & Accessibility Safeguards

- **`prefers-reduced-motion: reduce`**:
  - CSS rule `@media (prefers-reduced-motion: reduce)` forces `animation: none !important`, `transform: none !important`, and `opacity: 1 !important` on all `.orp-anim` and `.orp-scene-panel` elements so reduced-motion users see each diagram cleanly settled in its complete annotated target position.
  - [visual-walkthrough.ts](file:///C:/OnlineRulerPlus.com/src/scripts/visual-walkthrough.ts) evaluates `window.matchMedia('(prefers-reduced-motion: reduce)')` on initialization and sets `data-motion-paused="true"` and `aria-pressed="true"` on `[data-motion-toggle]`.
- **Keyboard & Screen Reader Controls**:
  - Tab switching uses `role="tablist"` + `role="tab"` (`aria-selected`, roving `tabindex`) supporting `ArrowRight`, `ArrowLeft`, `Home`, and `End` keys.
  - Play/Pause toggle button (`[data-motion-toggle]`) updates `aria-pressed` and synchronized visually hidden live status text (`[data-motion-status]`).
  - Offscreen auto-pause via `IntersectionObserver` (`threshold: 0.15`) pauses keyframe execution (`animation-play-state: paused`) whenever a walkthrough scrolls out of view.
  - Bug caught & fixed during QA: `.orp-scene-panel[data-active="true"]` initially shared `animation-play-state: paused` when `[data-motion-paused="true"]` triggered offscreen, which halted its opacity fade-in mid-flight and triggered a WCAG contrast failure in Axe (`3.38:1` on dark tile / `4.35:1` on light card). Decoupling `.orp-scene-panel` from `data-motion-paused` resolved the issue across both Chrome and Edge.

## 3. Motion & E2E Test Verification Summary

Verified via [visual-storytelling.spec.ts](file:///C:/OnlineRulerPlus.com/tests/e2e/visual-storytelling.spec.ts) and the full `npx playwright test` suite across **Chromium (Chrome)** and **Microsoft Edge**:
- **Tab switching, `ArrowRight` keyboard navigation, and Play/Pause state toggling**: Passed (`Chrome` + `Edge`).
- **`prefers-reduced-motion: reduce` emulation**: Verified `data-motion-paused="true"` and computed `animationName === "none"` (`Chrome` + `Edge`).
- **Light & Dark theme WCAG 2.1 AA Axe scans on `/`, `/how-to-use`, and all tool/guide routes**: `0` violations across Chrome and Edge (`95 passed, 1 Chrome-only screenshot skipped in Edge, 0 failed`).
