# P0 & P1 Implementation Report — OnlineRulerPlus.com

**Scope:** Approved P0 + P1 phases from [PRELAUNCH-DEVELOPMENT-ROADMAP.md](file:///C:/OnlineRulerPlus.com/docs/PRELAUNCH-DEVELOPMENT-ROADMAP.md) and [QA-ACCEPTANCE-CRITERIA.md](file:///C:/OnlineRulerPlus.com/docs/QA-ACCEPTANCE-CRITERIA.md).  
**Excluded (per instructions):** P2, P3, P4, DNS changes, deployment, and publishing.

---

## 1. Executive Summary

Both **P0** (Pre-Launch Must-Fix Foundation) and **P1** (High-ROI Functional & Calibration Differentiation) have been implemented, verified in production builds, unit-tested in Node, and verified across Chrome and Microsoft Edge using Playwright + Axe WCAG 2.1 AA.

- **Build:** `npm run build` compiles all **156 localized static routes** (`12` locales × `13` routes) cleanly.
- **Lazy Code-Splitting:** Core runtime bundle [dist/_astro/] keeps [photo-measure-controller.ts](file:///C:/OnlineRulerPlus.com/src/scripts/photo-measure-controller.ts) in a dedicated on-demand chunk (`photo-measure-controller.BaLc6kwD.js`, **12,685 bytes** alongside main `app.DZ0Q8A2E.js`, **81,386 bytes**), loaded only when the user opens Photo Mode or presses `Ctrl+V` with an image.
- **Client-Side Privacy Guarantee:** Photo loading, clipboard paste (`Ctrl+V` / `navigator.clipboard.read()`), 2-point scaling, and annotated PNG export (`canvas.toBlob()`) execute 100% locally in memory (`blob:` object URLs); Playwright request interception verified **0 external requests or outbound uploads**.

---

## 2. P0 — Implemented Fixes

| ID | Issue / Requirement | Key Changes | Verification |
|:---|:---|:---|:---|
| **P0.1** | Mobile first-screen ruler placement & Focus Mode | Reordered landing layout cleanly via responsive CSS utility classes (`order-1 sm:order-2` on `#ruler-tool` in [index.astro](file:///C:/OnlineRulerPlus.com/src/pages/[...lang]/index.astro) and [SpokeRulerPage.astro](file:///C:/OnlineRulerPlus.com/src/components/SpokeRulerPage.astro)); kept toolbar pods single-row scrollable on `< 640px` (`flex-nowrap overflow-x-auto`) in [RulerWorkspace.astro](file:///C:/OnlineRulerPlus.com/src/components/RulerWorkspace.astro); persisted `#btn-focus-mode` (`html[data-focus-mode]`) via [workspace-controller.ts](file:///C:/OnlineRulerPlus.com/src/scripts/workspace-controller.ts) & [BaseLayout.astro](file:///C:/OnlineRulerPlus.com/src/layouts/BaseLayout.astro). | `375×667` mobile E2E confirms `#ruler-canvas-top` starts `< 280px` from viewport top with `>= 220px` visible stage and `0` horizontal overflow. |
| **P0.2** | Stale edge cursor canvas redraw & `pointerleave` clearing | Added leading + trailing `requestAnimationFrame` scheduling (`scheduleCursorEdgeRedraw()`) on `pointermove` and immediate cancellation/clear redraw on `pointerleave` in [workspace-controller.ts](file:///C:/OnlineRulerPlus.com/src/scripts/workspace-controller.ts). | E2E pixel inspection on `#ruler-canvas-top` confirms Action Blue cursor projection renders on `pointermove` (`>= 40` blue pixels) and clears (`0` blue pixels) immediately on `pointerleave`. |
| **P0.3** | i18n fallback, non-intrusive locale banner, & localized `ΔY` span | Removed forced `window.location.replace(...)` on `/` in [BaseLayout.astro](file:///C:/OnlineRulerPlus.com/src/layouts/BaseLayout.astro); replaced with non-blocking bottom `#locale-suggestion-banner` in [Header.astro](file:///C:/OnlineRulerPlus.com/src/components/Header.astro) & [language-selector.ts](file:///C:/OnlineRulerPlus.com/src/scripts/language-selector.ts); fixed hardcoded `'ΔY guide span'` in [workspace-overlays.ts](file:///C:/OnlineRulerPlus.com/src/scripts/workspace-overlays.ts) to use `rt.spanGuideLabel`. | [i18n.spec.ts](file:///C:/OnlineRulerPlus.com/tests/e2e/i18n.spec.ts) (`14/14` spec cases across specs), `tests/i18n.test.mjs`, and `/es` `ΔY` check pass. |
| **P0.4** | Pinch-zoom detection, Firefox fractional zoom tolerance, & honest touchscreen fallback | Added `visualViewport.scale` detection + resize listener in [display.ts](file:///C:/OnlineRulerPlus.com/src/lib/ruler/display.ts) and [calibration-controller.ts](file:///C:/OnlineRulerPlus.com/src/scripts/calibration-controller.ts) (`pinchZoomBanner`); widened `matchesPhysicalPanel()` pixel tolerance in [storage.ts](file:///C:/OnlineRulerPlus.com/src/lib/ruler/storage.ts); updated uncalibrated touchscreen fallback label in [devices.ts](file:///C:/OnlineRulerPlus.com/src/lib/ruler/devices.ts) to `'Touchscreen device (uncalibrated)'`. | Unit tests (`measurement-engine.test.mjs`) and E2E pinch-zoom mock (`visualViewport.scale = 1.5`) pass cleanly. |

---

## 3. P1 — Implemented Features

### 3.1 Reference Calibration Studio & Direct Corner-Drag
- **Math Engine ([calibration.ts](file:///C:/OnlineRulerPlus.com/src/lib/ruler/calibration.ts)):** Added `REFERENCE_PRESETS`, `getReferencePreset()`, and `pxPerMmFromReference(measuredPx, referenceMm)` supporting **1× Card (85.60 mm)**, **2× Cards (171.20 mm)**, **3× Cards (256.80 mm)**, **A4 Width (210.0 mm)**, **US Letter Width (215.9 mm)**, **CD/DVD (120.0 mm)**, **US Quarter (24.26 mm)**, **€1 Coin (23.25 mm)**, **US Penny (19.05 mm)**, and **Custom (`mm`/`cm`/`in`)** targets.
- **UI & Pointer Interaction ([CalibrationSection.astro](file:///C:/OnlineRulerPlus.com/src/components/CalibrationSection.astro), [calibration-controller.ts](file:///C:/OnlineRulerPlus.com/src/scripts/calibration-controller.ts)):** Added preset selector chips, inline `#custom-ref-row`, dynamic min/max bounds (`[120..900]` preserved for default `card-1x`), circular geometry rendering for coins/discs, and `#card-drag-handle` direct mouse/touch corner dragging (`setPointerCapture`).

### 3.2 Dual `cm+px` / `in+px`, `1/8–1/32` Inch Precision & Bounding-Box Guides
- **Tick & Canvas Engine ([ticks.ts](file:///C:/OnlineRulerPlus.com/src/lib/ruler/ticks.ts), [canvas-renderer.ts](file:///C:/OnlineRulerPlus.com/src/lib/ruler/canvas-renderer.ts), [storage.ts](file:///C:/OnlineRulerPlus.com/src/lib/ruler/storage.ts)):** Added `InchDivisor` (`8 | 16 | 32`) and `DualPairMode` (`'unit' | 'px'`), persisted in `RulerPreferences` (`orp:preferences:v1`).
- **Workspace UI & Bounding Box ([RulerWorkspace.astro](file:///C:/OnlineRulerPlus.com/src/components/RulerWorkspace.astro), [workspace-controller.ts](file:///C:/OnlineRulerPlus.com/src/scripts/workspace-controller.ts), [workspace-overlays.ts](file:///C:/OnlineRulerPlus.com/src/scripts/workspace-overlays.ts)):** Added `#btn-dual-cm-px`, `#btn-dual-in-px`, `#inch-divisor-group` (`1/8`, `1/16`, `1/32`), preserved `#btn-dual-unit` (`Dual cm/in`), and added `[data-bounding-box="true"]` highlight + `Diag:` (`Math.hypot(ΔX, ΔY)`) readout to `#guide-span-readout` when `>= 2` X and `>= 2` Y guides are active.

### 3.3 Client-Side Photo & Clipboard (`Ctrl+V`) Measurement + Annotated PNG Export
- **Pure Geometry Engine ([photo-measure.ts](file:///C:/OnlineRulerPlus.com/src/lib/ruler/photo-measure.ts)):** Implements `distancePx`, `deltaStatsPx`, `calibrateScaleFromTwoPoints`, `photoPxToUnit`, `formatPhotoLength`, and `fitContainRect`.
- **Lazy Studio Controller ([photo-measure-controller.ts](file:///C:/OnlineRulerPlus.com/src/scripts/photo-measure-controller.ts)):** Supports file input, drag-and-drop, global `Ctrl+V` `paste` listener (auto-opening Photo Mode when an image is pasted outside text inputs), `Paste (Ctrl+V)` button (`navigator.clipboard.read()`), Step 1 2-point reference calibration (`mm`/`cm`/`in` + `ID-1` preset), Step 2 point-to-point `Line` and `ΔX / ΔY Box` tools, Zoom In/Out/Fit, Undo/Clear/`Esc`, and full-resolution client-side **Annotated PNG Export**.
- **Full 12-Locale Parity:** Updated [src/i18n/types.ts](file:///C:/OnlineRulerPlus.com/src/i18n/types.ts) and all **12 locale JSONs** (`en`, `es`, `fr`, `de`, `it`, `pt`, `ja`, `ko`, `nl`, `tr`, `id`, `pl`).

---

## 4. Browser Test Evidence & Screenshots

All screenshots captured in Chrome during automated E2E runs under [docs/qa-screenshots/](file:///C:/OnlineRulerPlus.com/docs/qa-screenshots/):

- [p1-photo-measure-desktop.png](file:///C:/OnlineRulerPlus.com/docs/qa-screenshots/p1-photo-measure-desktop.png) — Desktop `1280×860` Photo & `Ctrl+V` studio after 2-point calibration (`4.00 px/mm`), showing Line (`4.98 cm · 200 px`) and `ΔX / ΔY` box annotations.
- [p1-photo-mobile-375.png](file:///C:/OnlineRulerPlus.com/docs/qa-screenshots/p1-photo-mobile-375.png) — Mobile `375×667` Photo Mode with single-row scrollable controls, clear empty canvas stage, and `0` horizontal overflow.
- [p1-reference-presets.png](file:///C:/OnlineRulerPlus.com/docs/qa-screenshots/p1-reference-presets.png) — Calibration section showing `1×–3× Cards`, `A4`, `US Letter`, `CD/DVD`, `US Quarter`, `€1 Coin`, `Custom`, circular coin box, and `#card-drag-handle`.
- [calibration-card-active.png](file:///C:/OnlineRulerPlus.com/docs/qa-screenshots/calibration-card-active.png), [home-desktop-1440-light.png](file:///C:/OnlineRulerPlus.com/docs/qa-screenshots/home-desktop-1440-light.png), [home-desktop-1440-dark.png](file:///C:/OnlineRulerPlus.com/docs/qa-screenshots/home-desktop-1440-dark.png), [mobile-320-ruler.png](file:///C:/OnlineRulerPlus.com/docs/qa-screenshots/mobile-320-ruler.png), [mobile-375-tray.png](file:///C:/OnlineRulerPlus.com/docs/qa-screenshots/mobile-375-tray.png), [protractor-floating-guides.png](file:///C:/OnlineRulerPlus.com/docs/qa-screenshots/protractor-floating-guides.png).

---

## 5. Remaining Bugs, Limitations & Honest Calibration Caveats

1. **Web APIs Cannot Read Physical Display Size Automatically:** Auto-detection relies on OS platform + CSS viewport heuristics and defaults to `Touchscreen device (uncalibrated)` (`Nominal mobile screen density`) on touchscreens or `96.0 CSS PPI` on unprofiled desktops until the user completes card/reference/diagonal calibration.
2. **Perspective Distortion in Photo Mode:** Client-side 2-point reference calibration assumes a co-planar, orthographic (flat top-down) photograph without lens tilt/foreshortening; tilted objects require 4-point homography (deferred from P0/P1 scope).
3. **Browser Clipboard Read Permission:** Clicking the `Paste (Ctrl+V)` UI button calls `navigator.clipboard.read()`, which browsers may block without explicit user permission or HTTPS secure context; direct keyboard `Ctrl+V` (`ClipboardEvent` `paste`) works universally without async permission prompts and falls back cleanly with an inline guidance message if `clipboard.read()` is denied.
4. **Firefox Native Run Scope:** Chrome (**32/32**) and Microsoft Edge (**11/11** P0+P1 regression/feature tests) were executed directly; `matchesPhysicalPanel()` Firefox fractional-zoom tolerance was verified via Node unit tests with realistic `1444×812 @ 1.33` metrics rather than a native Firefox Playwright binary.
