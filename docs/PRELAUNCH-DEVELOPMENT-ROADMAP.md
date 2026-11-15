# OnlineRulerPlus.com — Pre-Launch Development Roadmap

**Date:** 2026-11-15  
**Execution Principle (per `GEMINI.md`):** No speculative over-engineering; fix verified trust/UX/metrology gaps before launch, keep every change incremental and covered by unit + Playwright regression tests, and defer speculative nice-to-haves cleanly to post-MVP phases.

---

## P0 — Must-Fix Before Public Launch (Broken Flows, Mobile Fold Failure, Trust & i18n Bugs)

### P0.1 Fix Mobile First-Screen Fold Failure (`375×667`) + Desktop Compact "Focus Mode"
- **Evidence:** On `375×667` mobile (`engine-probe.json`), `#workspace-stage` starts at `y = 694.22 px` (`canvasTop = 646.22–781 px`), hiding the ruler completely below the fold. On `1440×900` desktop, double sticky bars + Hero push top ruler to `y = 354 px`, compared to `Ruler.im` (`y = 0`) and `OnlineRulerTool.com` (`y = 9`, `Hide Info`).
- **User Benefit:** Instant zero-scroll measuring on phones and a distraction-free full-canvas mode on desktop.
- **Competitor Benchmark:** `Ruler.im`, `OnlineRulerTool.com`.
- **Technical Approach:** Reorder mobile flex/CSS visibility so `#ruler-workspace` appears above Hero marketing copy on `< 640px` (without breaking semantic `<h1>` accessibility — place compact single-line `<h1>` directly above toolbar), collapse secondary sub-nav + duplicate `Calibrate` CTA on mobile, and add a persistent `"Focus Mode / Hide Info"` toggle (`orp:preferences:v1`).
- **Complexity:** Low–Medium (`RulerWorkspace.astro`, `Header.astro`, `Hero.astro`, `index.astro`, `global.css`).
- **Dependencies:** None.
- **Acceptance Criteria:** On `375×667` load, top ruler canvas & stage (`>= 240px` usable height) are visible inside the initial viewport (`top < 280px`) with `0` horizontal overflow (`scrollWidth <= 375`).
- **Test Requirements:** Playwright viewport bounding-box assertion (`320px`, `375px`, `390px`, `1440px`) + CLS `< 0.01`.

### P0.2 Connect Live Edge Canvas Cursor Projection on `pointermove`
- **Evidence:** `workspace-controller.ts` lines 746–770 update DOM crosshair/readout without calling `configureEdgeCanvas()` / `syncAll()`; top canvas pixel hash stayed identically `1135282569` on pointer movement (`engine-probe.json`).
- **User Benefit:** Real-time blue cursor marker moves smoothly along the ruler ticks under the object edge — key precision feedback.
- **Competitor Benchmark:** Matches/surpasses `Ginifab` red tracking line and `OnlineRulerTool` crosshair projection.
- **Technical Approach:** Schedule `requestAnimationFrame` edge-canvas redraws inside `WorkspaceController` on `pointermove` (guarded so only active enabled edges redraw when cursor deltas change ≥ `0.5px`).
- **Complexity:** Low (`workspace-controller.ts`).
- **Dependencies:** None.
- **Acceptance Criteria:** Moving pointer inside `#workspace-stage` updates `#ruler-top` and `#ruler-left` canvas pixel buffer dynamically without frame drops (`< 16ms` per draw).
- **Test Requirements:** Playwright pixel-hash comparison before/after `page.mouse.move` (hash MUST change) + pointer leave resets marker cleanly.

### P0.3 Fix Hardcoded `'ΔY guide span'` Translation Bug & Replace Forced Cold `/` JS Redirect
- **Evidence:** `workspace-overlays.ts:177` outputs raw English `'ΔY guide span'`; `BaseLayout.astro:190-214` forces `window.location.replace('/' + matched)` on cold `/` load (`es-ES` -> `/es` verified live).
- **User Benefit:** True 12-locale UI completeness and predictable `/` URLs for international users & search crawlers.
- **Technical Approach:** Use `formatTemplate(rt.spanGuideLabel, { axis: 'ΔY' })`; replace forced `/` redirect with a dismissible non-redirecting localization suggestion pill (`localStorage` persisted).
- **Complexity:** Low.
- **Dependencies:** Update translation parity check in `tests/`.
- **Acceptance Criteria:** All 12 locales show localized `ΔY` span readout; `/` stays at `/` with `es-ES` browser language while displaying a clean switch pill to `/es`.
- **Test Requirements:** Node unit test + Playwright `locale: 'es-ES'` cold root load assertion.

### P0.4 Pinch-Zoom (`visualViewport.scale`) Detection & Honest Device Fallback Labeling
- **Evidence:** `display.ts:74-82` ignores `visualViewport.scale`; `devices.ts` lacks Windows/Android distinctions and labels touch emulation as `"Scaled laptop or desktop display"`.
- **User Benefit:** Prevents silent 2×–4× measurement corruption when pinch-zoomed on mobile/trackpad and removes misleading Apple/desktop assumptions.
- **Technical Approach:** Read `window.visualViewport?.scale ?? 1` in `readDisplayInfo()`, warn prominently inside `#display-change-banner` when `Math.abs(vvScale - 1) > 0.02`, and improve `detectCalibration()` copy to accurately label touch mobile vs desktop CSS baseline (`96`/`110`/`160` fallback labeled honestly as uncalibrated estimate).
- **Complexity:** Low (`display.ts`, `devices.ts`, `calibration-controller.ts`).
- **Dependencies:** Locale dictionary strings in `src/i18n/locales/*.json`.
- **Acceptance Criteria:** Pinch-zoom scale `!= 1` displays warning banner; `readDisplayInfo` cleanly defaults in Node/non-browser tests.
- **Test Requirements:** Unit tests for `visualViewport` edge cases & non-Apple touch UAs.

---

## P1 — High-Impact Core Differentiators (Ship Before Major Promotion)

### P1.1 Complete Calibration Studio: Drag-Resize Card + A4 / Letter / Custom Length / Coins & Multi-Card (`1×–3×`)
- **Evidence:** `OnlineRulerTool.com` offers `Card/A4/Letter/Custom` presets; `Ginifab` offers `1×/2×/3×` cards + `120mm` CD + coins; OnlineRulerPlus card uses slider/buttons only and passive coin verification shapes (`CalibrationSection.astro:470-499`).
- **User Benefit:** Lets anyone calibrate cleanly on small phones (using a US Quarter `24.26mm`, €1 `23.25mm`, ₹5 `23mm`, or Penny `19.05mm`), laptops (`1× ID-1 Card` with direct corner drag handle), large monitors (`2×/3× Card`, `CD 120mm`, `A4`, `US Letter`), or any arbitrary ruler (`Custom mm/in`).
- **Technical Approach:** Add pointer corner-drag handle on `#card-cal-preview` synced bidirectionally with `input-card-px` and `[120, 900]` bounds; add reference target selector (`1× ID-1 Card`, `2× Cards (171.2mm)`, `CD/DVD (120mm)`, `A4 Width (210mm)`, `US Letter Width (215.9mm)`, `Quarter (24.26mm)`, `€1 Coin (23.25mm)`, `Custom Target mm/in`); include non-square pixel diagnostic note if user verifies Landscape & Portrait card separately.
- **Complexity:** Medium.
- **Dependencies:** P0.4 clean scale pipeline; `calibration.ts` generalized `pxPerMmFromReference(px, refMm)`.
- **Acceptance Criteria:** Selecting any preset and setting exact pixel width stores exact `pxPerMm = targetPx / refMm` and survives reload.
- **Test Requirements:** Unit boundary checks on `pxPerMmFromReference` (clamped `[MIN_PX_PER_MM, MAX_PX_PER_MM]`) + E2E Playwright interaction across presets + drag handle.

### P1.2 Photo & Clipboard (`Ctrl+V`) On-Screen Image Measurement Tool
- **Evidence:** `Ruler.im`, `Ginifab`, `RapidTables`, and `Virtual-Ruler` all capture image-measurement demand; **none** combine privacy-first `Ctrl+V` paste + 2-point scale calibration + `Δx × Δy` bounding box + annotated PNG download.
- **User Benefit:** Measure floor plans, screenshots, eBay photos, UI mockups, and microscope images purely in-browser with zero server uploads.
- **Technical Approach:** Lazy-loaded dedicated module (`src/lib/image-measure/` + `/photo-ruler` spoke + tab/mode button in workspace): supports `FileReader`/`createObjectURL`, clipboard `paste` event + Paste button, zoom/pan, **Step 1: Draw 2-point Reference Line** (enter known `mm`/`cm`/`in`/`px`), **Step 2: Measure Lengths, Rectangles (`Δx × Δy`, Area, Diagonal), & Multi-Segment Polylines**, **Step 3: Export Annotated PNG**.
- **Complexity:** Medium-High (keep initial bundle impact ~`0 KB` via dynamic import on interaction / dedicated route).
- **Dependencies:** Shared `units.ts` formatting helpers.
- **Acceptance Criteria:** Pasting or dropping a PNG/JPEG allows setting a `100 px = 10 cm` reference, verifying a `50 px` test line reports `5.00 cm` within `±0.05 cm`, and exporting an annotated PNG download.
- **Test Requirements:** Synthetic HTML5 Canvas PNG fixture in Playwright -> verify reference calibration math, polyline span, and non-empty PNG download.

### P1.3 Dual Unit Upgrades (`cm+px`, `in+px`, `1/8–1/32` Inch Selector) & Bounding Box Guide Readout
- **Evidence:** `OnlineRulerTool.com` provides `cm+px` and `in+px`; `Ginifab` provides `8/16/32` fraction granularity; `workspace-overlays.ts` only calculates the last 2 guides on one axis instead of multi-interval + `ΔX × ΔY` box.
- **User Benefit:** UI/frontend engineers see physical mm alongside exact CSS pixels simultaneously; makers choose clean `1/8"` vs `1/16"` vs `1/32"` tick density; 2+ guides on X & Y compute full rectangle `W × H`, diagonal `√(W²+H²)`, and area.
- **Complexity:** Low–Medium (`ticks.ts`, `canvas-renderer.ts`, `workspace-overlays.ts`).
- **Dependencies:** P0.3 localized guide readout templates.
- **Acceptance Criteria:** `cm+px` and `in+px` render cleanly without label overlap; placing 2 X + 2 Y guides displays `ΔX`, `ΔY`, and `Diagonal` cleanly in active unit.
- **Test Requirements:** Unit tests for `ticks.ts` density presets (`8/16/32`) and bounding box math + Playwright guide drag check.

---

## P2 — Growth, Portability & Precision Workbench Upgrades

### P2.1 Movable, Rotatable (`0°–360°`) Protractor & Arbitrary-Angle Floating Ruler
- **Evidence:** Protractor currently locked center-stage (`0°–180°` only); floating rulers strictly orthogonal (`0°`/`90°`).
- **Technical Approach:** Add center vertex drag handle + two independent ray handles for interior angle `[0°, 360°]` (`θ₂ - θ₁`) + keyboard `←/→` (`0.5°` steps) in `protractor.ts`; add `angleDeg` handle on floating rulers + `localStorage` persistence (`orp:preferences:v1`).
- **Complexity:** Medium.
- **Test Requirements:** Pure geometry unit tests (`protractor.ts` dual-ray & reflex wrapping) + Playwright handle drag verification.

### P2.2 Named Multi-Monitor Profiles + `matchesPhysicalPanel()` Tolerance Tuning + CSV/JSON Export
- **Evidence:** `1920×1080@1` 24" & 27" monitors share `displaySignature`; `150%` fractional zoom broke `matchesPhysicalPanel` `±2px` tolerance (`engine-probe.json`); history only allows single-item copy.
- **Technical Approach:** Allow renaming/selecting saved calibration profiles manually (`Office 27"`, `Home Laptop`), add fuzzy matching/tolerance guard for fractional DPR zoom (`dpr` rescale prompt rather than wiping profile silently), and export history as `.csv` / `.json`.
- **Complexity:** Low–Medium.
- **Test Requirements:** Storage unit tests for manual named profile switching & fractional scaling + Playwright CSV export download check.

### P2.3 Pop-Out Compact Window, Clean `<iframe>` Embed Mode (`/embed`), Screen Size Detector (`/screen-size-detector`), & Printable Vector Ruler Generator (`/printable-ruler`)
- **Evidence:** Directly closes feature and organic acquisition advantages held by `PiliApp` (`drag it`, `iframe embed`, `/what-is-my-monitor-size`), `Ginifab` (`Popup`), and `TheOnlineRuler` (printable PDFs).
- **Technical Approach:** Minimal static Astro routes reusing existing `canvas-renderer` SVG/Canvas math and `display.ts` diagnostics; printable page renders vector SVG rules sized cleanly in `mm`/`in` (`@media print` `size: auto; margin: 10mm`) with mandatory `100 mm / 4 in` verification scale bar.
- **Complexity:** Medium.
- **Test Requirements:** Route build verification + Playwright embed `?embed=1` (`0` header/footer, functional unit toggle) + print preview DOM verification.

---

## P3 — High-Value Expansion (Post-Launch / Fast-Follow)
- **Concentric Circle / Ring / Screw Diameter Gauge (`/circle-ruler`):** Matches `Ruler.im/concentric-circle` with real-time diameter slider (`1–150 mm`), radius, circumference, and US/EU ring size lookup table.
- **Quadrant Coordinate Plane (`/quadrant`) & Architectural Scale Modes (`1:20`, `1:50`, `1:100`, Imperial Arch):** Matches `Ruler.im/quadrant` and `Ginifab` architectural metric ruler.
- **Unit & Fractional Inch Converter Bar (`mm ↔ cm ↔ in ↔ frac ↔ px @ PPI`):** Lightweight inline calculator shared across spokes.
- **Optional Locale Expansion:** Consider high-opportunity locales beyond the current `12` (`zh-CN`, `zh-TW`, `ar` RTL, `hi`, `vi`, `uk`) — noting `ar` requires explicit RTL CSS audit before launch.

## P4 — Explicit Rejects / Anti-Bloat Guardrails
- **Do NOT add browser-permissioned WebRTC/Camera AR measurement** unless accuracy can be guaranteed (monocular camera depth without reference markers produces unacceptable `15–50%` error and privacy friction).
- **Do NOT add third-party ad networks (`34` ad slots like Ginifab) or heavy analytics SDKs** pre-launch — keeping `CLS ~0.0007` and `148 KB` transfer is our clearest competitive moat.
- **Do NOT build server-side image storage or user accounts** — client-only `localStorage` + `URL.createObjectURL` is faster, zero-cost, and privacy-superior.
- **Do NOT inflate `DEVICE_SPECS` with hundreds of brittle scraped laptop/Android strings**; rely instead on transparent `"Estimated"` status + interactive `Screen Size Detector` + 1-tap `Coin/Card` calibration.
