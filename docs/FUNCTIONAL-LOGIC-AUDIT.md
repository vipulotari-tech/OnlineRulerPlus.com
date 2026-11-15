# Functional Logic Audit & Feature Inventory — OnlineRulerPlus.com

**Project:** `C:\OnlineRulerPlus.com` (Astro 7.4.12 + Tailwind CSS 4.3.5 + TypeScript)  
**Audit Scope:** Full source inspection, UI-to-calculation trace, live Playwright Chrome & Edge instrumentation  

---

## 1. Route & Page Inventory (13 Routes)

| Route | Component / Template | Primary Functional Configuration | Interactive Workspace | Verification Status |
|:---|:---|:---|:---|:---|
| `/` | `src/pages/index.astro` | `<RulerWorkspace defaultUnit="cm" />` + `<CalibrationSection />` | Yes | **VERIFIED** |
| `/cm-ruler` | `src/pages/cm-ruler.astro` | `defaultUnit="cm" forceUnit="cm"` (non-persistent route override) | Yes | **VERIFIED** |
| `/mm-ruler` | `src/pages/mm-ruler.astro` | `defaultUnit="mm" forceUnit="mm"` (non-persistent route override) | Yes | **VERIFIED** |
| `/inch-ruler` | `src/pages/inch-ruler.astro` | `defaultUnit="in" forceUnit="in"` (non-persistent route override) | Yes | **VERIFIED** |
| `/horizontal-ruler` | `src/pages/horizontal-ruler.astro` | `defaultUnit="cm" forceEdges="horizontal"` (top + bottom edges) | Yes | **VERIFIED** |
| `/vertical-ruler` | `src/pages/vertical-ruler.astro` | `defaultUnit="cm" forceEdges="vertical"` (left + right edges) | Yes | **VERIFIED** |
| `/how-to-use` | `src/pages/how-to-use.astro` | 3-step guide, keyboard reference table, 6-point checklist | Nav + Shortcuts/Theme | **VERIFIED** |
| `/calibration-guide` | `src/pages/calibration-guide.astro` | Screen PPI comparison & HiDPI reference tables | Nav + Shortcuts/Theme | **VERIFIED** |
| `/faq` | `src/pages/faq.astro` | Expandable FAQ accordion list | Nav + Shortcuts/Theme | **VERIFIED** |
| `/about` | `src/pages/about.astro` | Metrology architecture & governance overview | Nav + Shortcuts/Theme | **VERIFIED** |
| `/contact` | `src/pages/contact.astro` | Support email & hardware profile submission guidance | Nav + Shortcuts/Theme | **VERIFIED** |
| `/privacy` | `src/pages/privacy.astro` | Local-storage privacy architecture & policy | Nav + Shortcuts/Theme | **VERIFIED** |
| `/terms` | `src/pages/terms.astro` | Physical accuracy disclaimer & terms of use | Nav + Shortcuts/Theme | **VERIFIED** |

Query-parameter overrides on any ruler route are also supported: `?unit=cm|mm|in|px` and `?edges=horizontal|vertical|all|top-left`.

---

## 2. UI Input -> Calculation Logic -> Rendered Output Trace

| Feature / Tool | UI Controls & Events (`src/components/*`) | Controller Logic (`src/scripts/*`) | Pure Engine (`src/lib/ruler/*`) | Rendered / Persisted Output |
|:---|:---|:---|:---|:---|
| **Unit Selector & Dual Scale** | `[data-unit-btn="cm\|mm\|in\|px"]`, `#btn-dual-unit`, Keys `1`, `2`, `3`, `4`/`M` | `WorkspaceController.setUnit()`, `toggleDualUnit()` | `pxPerUnit()`, `pxToUnit()`, `formatNumber()`, `formatInchFraction()` | `#ruler-workspace[data-unit]`, 4 edge canvases, stage readout, crosshair badge, `orp:preferences:v1` (except forced routes) |
| **Edge Selection** | `[data-edge-btn="top\|bottom\|left\|right\|all"]` | `WorkspaceController.toggleEdge()`, `setAllEdges()`, `setEdgePreset()` | — | Edge `<canvas>` visibility & dimensions, corner cells (`#corner-top-left`..`#corner-bottom-right`), enforces >= 1 active edge |
| **Ruler Canvas Rendering** | Resize, unit, thickness (`#select-thickness` 36/48/64), opacity (`#slider-opacity` 40–100%), theme (`[data-theme-toggle]`, `D`) | `WorkspaceController.renderEdgeCanvases()` | `generateTicks()`, `renderRulerToCanvas()` | High-DPR scaled `<canvas>` ticks, minor/med/major heights, numbered labels, `data-major-labels`, `data-tick-count` |
| **Guides & Span Measurement** | `#btn-toggle-guides` (`G`), `[data-guide-axis-btn="x\|y\|both"]`, canvas/stage clicks, `#btn-clear-guides` (`Esc`), `#btn-save-span` | `WorkspaceController.addGuide()`, drag listeners in `workspace-overlays.ts` | `pxToUnit()`, `formatValue()`, `appendHistoryRecord()` | `.guide-line` elements, `#guide-span-readout` (`ΔX` and `ΔY`), `#measurement-history-list`, `orp:history:v1` |
| **Cursor Crosshair** | `#btn-toggle-crosshair` (`C`), stage pointermove | `WorkspaceController.bindStageEvents()`, `updateReadoutDOM()` | `pxToUnit()`, `formatCoord()` | `#crosshair-x`, `#crosshair-y`, `#crosshair-badge`, `#live-cursor-readout` |
| **Floating Rulers** | `#btn-add-floating-ruler`, drag handle, rotate (`↻`), close (`×`) | `WorkspaceController.addFloatingRuler()`, `renderFloatingRulersLayer()` | `renderRulerToCanvas()` | Up to 4 draggable/rotatable `.floating-ruler` overlays clamped inside `#ruler-stage` |
| **180° Angle Protractor** | `#btn-toggle-protractor` (`P`), canvas drag/tap, `×` | `WorkspaceController.toggleProtractor()`, `renderProtractorOverlay()` | `pointToProtractorAngle()` | `.protractor-widget` (responsive `180–320 px` canvas width), `#protractor-angle-readout` (`0.0°–180.0°`) |
| **Fullscreen Mode** | `#btn-fullscreen` (`F`) | `WorkspaceController.toggleFullscreen()` | — | Native Fullscreen API with pseudo-fullscreen CSS fallback, `Esc` exit |
| **Credit Card Calibration (ID-1)** | `#slider-card-width`, `#input-card-px`, `#btn-card-minus`/`+`, `←`/`→` (`Shift` 5 px), `#btn-card-orientation`, `#btn-apply-card` | `CalibrationController.bindCardControls()`, `setCardWidth()` | `CARD_WIDTH_MM = 85.6`, `CARD_HEIGHT_MM = 53.98`, `cardHeightForWidth()`, `pxPerMmFromCardWidth()`, `pxPerMmFromCardHeight()`, `createManualProfile()` | `#card-calibration-box` scaled outline, `#card-scale-readout`, coin/50 mm verification shapes, `orp:calibration:v1` |
| **Screen Diagonal Calibration** | `[data-diagonal-preset]`, `#input-diagonal`, `#form-diagonal` submit | `CalibrationController.bindDiagonalControls()`, `updateDiagonalPreview()` | `parseDiagonal()`, `pxPerMmFromDiagonal()`, `createManualProfile()` | `#diagonal-preview`, `#diagonal-error`, workspace scale update, `orp:calibration:v1` |
| **Auto-Detect & Reset Calibration** | `#btn-apply-autodetect`, `[data-reset-calibration]` | `CalibrationController.bindAutoDetectControls()`, `bindResetButtons()` | `readDisplayInfo()`, `detectCalibration()`, `resolveCalibration()`, `removeProfileForDisplay()` | `#auto-detected-*` telemetry grid, `#display-change-banner` on zoom/display/orientation changes |
| **Shortcuts Modal & Navigation** | `[data-help-toggle]` (`H`), `[data-help-close]` (`Esc`), `#toggle-shortcuts-enabled`, `[data-mobile-menu-toggle]` | `app.ts` `initHelpDialog()`, `initMobileNav()`, `WorkspaceController.bindKeyboardShortcuts()` | `parsePreferences()` | `#help-shortcuts-modal` with focus trap & unconditional `Esc` close, `#mobile-nav-tray` |

---

## 3. Architectural & Code Quality Observations

- **Centralized Pure Math Core:** All metrology conversions (`units.ts`), adaptive tick placement (`ticks.ts`), calibration equations (`calibration.ts`), hardware table lookups (`devices.ts`), display fingerprinting (`display.ts`), protractor geometry (`protractor.ts`), and JSON storage parsers (`storage.ts`) live in framework-free `src/lib/ruler/*.ts` modules exported through `index.ts`. No duplicate mathematical formulas were found in UI controllers or Astro templates.
- **No Duplication Across Spoke Routes:** `/cm-ruler`, `/mm-ruler`, `/inch-ruler`, `/horizontal-ruler`, and `/vertical-ruler` share `<RulerWorkspace>` and `<CalibrationSection>` cleanly via Astro props (`defaultUnit`, `forceUnit`, `forceEdges`).
- **Controller File Size Note:** `src/scripts/workspace-controller.ts` stands at ~890 lines (above the 800-line soft ceiling in `GEMINI.md`), although overlay rendering was already split out into `workspace-overlays.ts`. Further modularization of fullscreen/canvas lifecycle into a dedicated helper is recommended if new workspace features are added later, though avoided during bug fixing to minimize diff risk.
