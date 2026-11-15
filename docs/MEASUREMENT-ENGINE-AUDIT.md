# OnlineRulerPlus.com — Measurement Engine & Metrology Audit

**Date:** 2026-11-15  
**Scope:** Exhaustive mathematical and browser-API audit of `src/lib/ruler/*.ts`, `src/scripts/calibration-controller.ts`, `src/scripts/workspace-controller.ts`, and `src/scripts/workspace-overlays.ts`, corroborated by live Chromium runtime tests (`scratch/engine-probe.json`) and unit boundary suites (`tests/measurement-engine.test.mjs`).  
**Epistemic Standard:** Never claim physical glass accuracy without user calibration and physical verification. Browser APIs cannot independently inspect monitor panel dimensions, sub-pixel pitch, or OS fractional DPI overrides.

---

## 1. Core Mathematical Pipeline & Invariants

### 1.1 Fundamental Relationships (`units.ts`, `calibration.ts`)
- **SI Exact Definition:** `MM_PER_INCH = 25.4` (exact international inch), `MM_PER_CM = 10`, `CSS_PX_PER_INCH = 96` (W3C CSS Reference Pixel).
- **Scale Variable:** All rendering scales linearly from `cssPxPerMm`:
  - Diagonal path: `pxPerMmFromDiagonal(screenW, screenH, diagIn) = (Math.hypot(screenW, screenH) / diagIn) / 25.4`.
  - Card width path (`ISO/IEC 7810 ID-1`): `CARD_WIDTH_MM = 85.6`, `CARD_HEIGHT_MM = 53.98`, `CARD_CORNER_RADIUS_MM = 3.18`; `pxPerMmFromCardWidth(px) = px / 85.6`.
  - Normalized storage quantity (`devicePxPerMm`): `cssPxPerMm * dpr`. Rescaled on load via `fromDevicePxPerMm(stored, currentDpr) = stored / currentDpr`.
- **Bounds (`calibration.ts`):** `MIN_DIAGONAL_IN = 3`, `MAX_DIAGONAL_IN = 100`, `MIN_PX_PER_MM = 1` (`25.4 CSS PPI`), `MAX_PX_PER_MM = 20` (`508 CSS PPI`). Card UI slider clamped `[120, 900]` CSS px (`1.402–10.514 px/mm`, i.e., `35.6–267.1 CSS PPI`).

### 1.2 Verified Passes (`npm test` -> `21/21` passing)
- **Zero Tick Accumulation Drift:** `ticks.ts` computes every tick coordinate multiplicatively (`index * stepMm * pxPerMm + originPx`) instead of iterative floating-point addition. Verified drift `< 1e-6 px` across `3,000 px`.
- **Dyadic Fractional Inch Precision:** `toFraction(val, maxDenom=16)` and `formatInchFraction(..., 32)` cleanly reduce `1/2`, `1/4`, `1/8`, `1/16`, `1/32` with carry-over rounding (`32/32 -> +1 in`). On-canvas rendering drops minor ticks cleanly when `minorGapPx < 3 px` (`MIN_TICK_GAP_PX = 3`) and drops labels when `labelSpacingPx < 28 px` (`MIN_LABEL_GAP_PX = 28`).
- **Crisp HiDPI Drawing (`canvas-renderer.ts`):** Backing buffer sized `Math.round(cssW * dpr)` × `Math.round(cssH * dpr)` with `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`.verified visually clean across `dpr = 1`, `1.5`, `2`.

---

## 2. Browser Geometry, Calibration & Display Edge Cases

| Scenario | Observed Engine Behavior | Technical Limitation / Gap Severity |
|---|---|---|
| **Browser Zoom (`Ctrl +` / `Ctrl -`)** | `window.devicePixelRatio` scales linearly with zoom while `screen.width/height` may shrink inversely (Chromium) or stay physical/vary (Firefox/Safari). Confirmed live (`engine-probe.json`): overriding `150%` DPR (`800×600`, `dpr: 1.5`) triggered `matchesPhysicalPanel()` failure when CSS screen area did not match stored `1280×720@1`, dropping `15.6″` manual calibration (`4.2856` -> `4.3307 px/mm`) with `"Monitor change detected"`. | **High.** `matchesPhysicalPanel` relies on `screen.width * dpr` matching stored `longDevicePx` within `±2 px`. Rounding under fractional scaling (`125%`, `133%`, `150%`) or CDP/browser quirks easily breaks `±2 px`, unexpectedly invalidating valid manual calibration. |
| **Pinch-Zoom (`visualViewport.scale`)** | `readDisplayInfo()` (`display.ts` lines 74–82) **never reads `window.visualViewport?.scale`**. | **High (Mobile/Trackpad).** Pinch-zooming to `2.0x` on iOS/Android visually doubles every millimeter on screen without changing `devicePixelRatio` or triggering a warning banner or scale compensation. |
| **OS Fractional Scaling (Windows `125%` / `150%`, macOS Scaled)** | Browser exposes scaled CSS pixels in `screen.width/height` and fractional/rounded `dpr`. On uncalibrated loads (`devices.ts` lines 131–143), Windows `125%` falls back to `NOMINAL_CSS_PPI.scaledWindows = 110`. | **Medium-High.** If a monitor is physically `96 PPI` at `125%` scaling (`effective CSS PPI = 76.8`), `110 PPI` yields a **~43% length error** until manually calibrated! Furthermore, **Diagonal calibration cannot compensate if OS underscans/overscans or clamps reported `screen.width`**. |
| **Dual Identical-Resolution Monitors (`1920×1080@1` 24" + 27")** | `displaySignature(info)` encodes `"1920x1080@1"`. Moving browser window across `screenX` boundary polls every `1500 ms` (`calibration-controller.ts:574`), computes identical signature, and calls `classifyDisplayChange() -> 'none'`. | **High (Unavoidable Hardware Blindspot + UX Fix Needed).** Web browsers cannot read EDID physical panel width/model (`window.getScreenDetails()` requires explicit permission and isn't universal; even Screen Details doesn't guarantee physical mm). The engine must let users **manually name/switch saved profiles** (`Office 27"`, `Laptop 14"`) rather than trusting `displaySignature` alone. |
| **Non-Square Pixels / Aspect Stretch** | All axes share a single scalar `pxPerMm` (`xScale === yScale`). | **Low on modern LCD/OLED; High on stretched projectors / legacy CRT / RDP VMs.** Adding optional independent `xPxPerMm` & `yPxPerMm` calibration (via Card Landscape `85.6mm` vs Portrait `53.98mm` check!) would detect aspect distortion immediately. |
| **Auto-Detect Bias (`devices.ts`)** | `37` hardcoded Apple specs (`iPhone`, `iPad`, `MacBook/iMac/Studio Display`) and **`0` Android, Windows, Surface, ThinkPad, Galaxy, or Pixel specs**. Touch mobile with desktop/emulated UA displays `"Scaled laptop or desktop display"` (`110 PPI`). | **Medium-High.** Over-confident UX wording risks users trusting uncalibrated auto-detect on Android tablets, Chromebooks, and Windows Ultrabooks where error routinely reaches `15%–40%`. |
| **Touchscreen Paralax & Edge Bezel Interference** | Top/Left rulers start at `ORIGIN_INSET_PX = 16` (`workspace-controller.ts`), keeping zero inside screen bezels. Touch drag guides work without `overflowX`, though `pointermove` fails to update edge projection ticks. | **Medium.** Parallax error (viewing thick cover glass at an angle) and rounded OLED phone corners obscure `x=0` if `0` is pinned to the outer frame; toggling `Center Zero` helps, and movable floating rulers bypass rounded corners cleanly. |

---

## 3. Canvas, Projection & Overlay Engineering Defects

### 3.1 Live Cursor Projection Bug (`workspace-controller.ts` lines 746–770)
- `renderEdgeRuler()` in `canvas-renderer.ts` renders the live cursor tick projection line on the ruler edge whenever `cursorPosPx != null`.
- Yet `WorkspaceController` only calls `this.updateReadoutDOM()` on `pointermove`, skipping edge canvas redraws.
- **Confirmed Live Result (`engine-probe.json`):** Moving pointer `(0,0)` -> `(center)` updated DOM readout (`"X: 5.80 cm · Y: 2.96 cm"`) while top `<canvas>` pixel hash stayed stuck at `1135282569`. Fix cost is minimal (~`6` lines + `requestAnimationFrame` throttle), giving immediate sub-millimeter visual tick alignment.

### 3.2 Floating Ruler & Guide Multi-Span Limitations (`workspace-overlays.ts`)
- **Guide Span Calculation (`#guide-span-readout`):** Slices only `xGuides[length - 2]` and `xGuides[length - 1]` (or `yGuides`), discarding all intervals between earlier guides (`1↔2`, `2↔3`). Also contains hardcoded English `'ΔY guide span'` at line `177`.
- **Floating Ruler Geometry:** Hardcoded `44px` height, clamped orthogonal (`0°` / `90°`), max `4`, ephemeral across reloads. Lacks arbitrary angle rotation (`0°–360°`) needed when measuring angled parts or skewed PDFs/images on glass.

### 3.3 Protractor Limitations (`protractor.ts`, `workspace-overlays.ts`)
- `computeProtractorAngle(originX, originY, ptX, ptY)` enforces `Math.atan2(Math.max(0, dy), dx)`, clamping output to **`[0°, 180°]`** relative to horizontal right (`+X`).
- **Missing Capabilities:**
  1. Cannot move protractor vertex across the stage (pinned to `left-1/2 top-1/2`).
  2. Cannot measure reflex angles (`180°–360°`) or rotate the `0°` reference baseline to align with a tilted line on screen.
  3. Does not compute complementary `180° - θ` or 2-ray interior angle `|θ₂ - θ₁|`, nor support keyboard fine-stepping (`±0.1°` / `±1°`).

---

## 4. Honest Metrology & Trust Boundaries (Non-Negotiable Disclosures)

OnlineRulerPlus **must never** claim out-of-the-box physical accuracy without user calibration. Required pre-launch invariants:
1. Uncalibrated fallback scales (`96` / `110` / `120` / `132` / `153` / `160` CSS PPI) **must always** carry a clear `"Estimated"` visual state and non-alarmist prompt to verify with a physical card or known length.
2. Pinch zoom (`visualViewport.scale !== 1`) **must** surface an explicit warning badge (`"Pinch zoom active — reset to 100% or recalibrate"`) rather than silently mis-reporting physical cm/inches.
3. Exact pixel measurements (`px`) require **no** physical calibration — explicitly distinguish exact CSS pixel counting (`100%` deterministic) from physical `mm`/`cm`/`in` estimation.
4. Credit card (`85.60 × 53.98 mm`) and paper (`A4 210 × 297 mm`, `US Letter 215.9 × 279.4 mm`) are fundamentally superior to OS diagonal lookup on multi-monitor/fractional-scaled setups because browser pixels directly match physical glass at active zoom.
