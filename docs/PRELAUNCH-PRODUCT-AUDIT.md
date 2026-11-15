# OnlineRulerPlus.com — Pre-Launch Product Audit

**Date:** 2026-11-15  
**Scope:** Full-stack codebase, runtime measurement engine, responsive UX, accessibility, SEO/i18n architecture, and verification suite of the local production build (`npm run build` -> `156` static routes; dev/preview runtime on Chromium `1440×900` desktop and `375×667` mobile touch).  
**Policy:** Zero favoritism. All strengths, structural flaws, subtle logic defects, and unverified boundaries below are strictly grounded in inspected source files and observed Chromium/Node outputs.

---

## 1. Architecture & Stack Inventory

| Dimension | Observed Implementation | File Evidence |
|---|---|---|
| **Framework** | Astro `^7.4.12` static build (`output: "static"`, `trailingSlash: "never"`) + Vite + `@tailwindcss/vite ^4.3.5` | [package.json](file:///C:/OnlineRulerPlus.com/package.json), [astro.config.mjs](file:///C:/OnlineRulerPlus.com/astro.config.mjs) |
| **Typography** | Self-hosted `@fontsource-variable/{geist,geist-mono,inter,plus-jakarta-sans}` (zero third-party font requests) | [package.json](file:///C:/OnlineRulerPlus.com/package.json), [BaseLayout.astro](file:///C:/OnlineRulerPlus.com/src/layouts/BaseLayout.astro) |
| **Route Scale** | `13` canonical templates × `12` locales (`en`, `es`, `fr`, `de`, `it`, `pt`, `ja`, `ko`, `nl`, `tr`, `id`, `pl`) = **`156` HTML pages** + `@astrojs/sitemap` | [astro.config.mjs](file:///C:/OnlineRulerPlus.com/astro.config.mjs), build output (`156 page(s) built in 2.46s`) |
| **Measurement Core** | 9 modular TypeScript modules (`units`, `calibration`, `ticks`, `display`, `devices`, `storage`, `resolve`, `protractor`, `canvas-renderer`) | `src/lib/ruler/*.ts` |
| **Interactive Controllers** | Pure TS DOM/Canvas controllers: `CalibrationController`, `WorkspaceController`, `workspace-overlays.ts`, `app.ts` (zero heavy UI framework runtime) | `src/scripts/*.ts` |
| **Performance Profile (Dist)** | `148 KB` transfer, `8` requests, `844 ms` FCP/LCP, `0.0007` CLS, `0` console errors, `0` failed requests, `0` ad slots | Live Chromium audit (`competitor-audit.json`) |
| **Automated Test Coverage** | `21/21` Node unit/build tests passing (`npm test`); Playwright E2E specs (`ruler.spec.ts`, `qa-comprehensive.spec.ts`) using `@axe-core/playwright ^4.14.0` | [package.json](file:///C:/OnlineRulerPlus.com/package.json), `tests/` |

---

## 2. Route, Component & Control Inventory

### 2.1 Route Matrix (per Locale, 12× = 156 Static Pages)

| Route Path | Role / Intent Preset | Schema `@type` Graph | Observed `en` Word Count |
|---|---|---|---|
| `/` | Main Multi-Edge Interactive Workspace (`cm`, `cm/in`, All Edges) | `Organization`, `WebSite`, `WebPage`, `WebApplication`, `FAQPage`, `BreadcrumbList` | `2,779` |
| `/cm-ruler` | Centimeter Spoke (`unit=cm`) | `WebPage`, `WebApplication`, `FAQPage`, `BreadcrumbList` | `2,227` |
| `/mm-ruler` | Millimeter Spoke (`unit=mm`) | `WebPage`, `WebApplication`, `FAQPage`, `BreadcrumbList` | `2,293` |
| `/inch-ruler` | Fractional Inch Spoke (`unit=in`) | `WebPage`, `WebApplication`, `FAQPage`, `BreadcrumbList` | `2,235` |
| `/horizontal-ruler` | Horizontal Spoke (`edges=top,bottom`) | `WebPage`, `WebApplication`, `FAQPage`, `BreadcrumbList` | `2,054` |
| `/vertical-ruler` | Vertical Spoke (`edges=left,right`) | `WebPage`, `WebApplication`, `FAQPage`, `BreadcrumbList` | `2,137` |
| `/how-to-use` | Measurement & Shortcut Manual | `TechArticle`, `HowTo`, `BreadcrumbList` | `1,783` |
| `/calibration-guide` | Display PPI & ID-1 Calibration Manual | `TechArticle`, `HowTo`, `BreadcrumbList` | `1,614` |
| `/faq` | Comprehensive Q&A Index | `FAQPage`, `BreadcrumbList` | `2,135` |
| `/about`, `/contact`, `/privacy`, `/terms` | Trust, Editorial & Legal Pages | `AboutPage`, `ContactPage`, `WebPage` (`lastReviewed: 2026-11-14`), `BreadcrumbList` | Editorial/Legal |

### 2.2 Component & Interactive Control Map

- **Navigation & Header (`Header.astro`, `LanguageSelector.astro`, `HelpModal.astro`):** Sticky dark glass nav with `8` spoke/guide links, `LanguageSelector` (12 locales + flag icons), `Shortcuts` modal (`H`), `Theme` toggle (`D`), mobile drawer tray, plus a secondary sticky utility strip displaying live PPI/calibration status + sub-nav links + a `#calibrate` CTA.
- **Hero (`Hero.astro`):** Badge (`ISO/IEC 7810 ID-1 Reference · 1 in = 25.4 mm`), `H1`, short lead copy, `Calibrate Your Screen` + `How to Measure` CTAs.
- **Interactive Workspace (`RulerWorkspace.astro`, `workspace-controller.ts`, `workspace-overlays.ts`):**
  - Alert banner container (`#display-change-banner`) for runtime zoom/monitor shifts.
  - Controls Row 1: Unit buttons (`cm`, `mm`, `in`, `px`) + `Dual cm/in` (`btn-dual-unit`), Edge toggles (`Top`, `Bottom`, `Left`, `Right`, `All Edges`), Tool toggles (`Guides [G]`, `Crosshair [C]`, `+ Floating Ruler`, `Protractor [P]`, `Fullscreen [F]`), `CalibrationBadge` (`#status-ppi-text`).
  - Controls Row 2: Live `#live-cursor-readout`, `#guide-span-readout`, `Origin: (0,0)` / `Center Zero` (`btn-toggle-origin`), `Reset View`.
  - Stage (`#workspace-stage`): 4 DPR-scaled `<canvas>` edges (`top`, `bottom`, `left`, `right`, `ORIGIN_INSET_PX = 16`), interactive vertical & horizontal hairline guides (`pointerdown`/drag/arrow nudge/delete), crosshair overlay, up to `4` draggable orthogonal (`horizontal` ↔ `vertical`) floating rulers (`44px` thickness), and centered `180°` SVG protractor overlay (`min(320, max(180, stageAvail))`).
- **Calibration Studio (`CalibrationSection.astro`, `calibration-controller.ts`):**
  - 3-method tabbed workflow: **1. ISO/IEC 7810 ID-1 Credit Card** (`Landscape`/`Portrait` toggle, `[120, 900]` px slider, `−1`/`+1`, numeric `input-card-px`, auto `Portrait` `< 500px` viewport), **2. Screen Diagonal** (11 presets `11″–34″` + numeric `[3, 100]` input), **3. Auto-Detect Device** (`DEVICE_SPECS` UA lookup + nominal density fallback).
  - Passive **Verification Shapes** strip (`US Quarter 24.26 mm`, `€1 Coin 23.25 mm`, `US Penny 19.05 mm`, `50 mm bar`) and local **Measurement History** (`MAX_HISTORY_ITEMS = 25`, `orp:history:v1`).

---

## 3. Confirmed Findings: Bugs, UX Defects & Structural Gaps

Every defect below was directly verified by source inspection and/or Chromium runtime probing (`scratch/engine-probe.json`):

### Critical / High Priority Issues

1. **Mobile First-Screen Utility Failure (`y = 694–781 px` below fold on `375×667`):**
   - **Evidence:** On `375×667` touch mobile (`engine-probe.json` & `competitor-interact.json`), Hero + stacked toolbar wrap push `#ruler-workspace` to `top = 645.22 px`, `#ruler-top` canvas top to `646.22 px` (~21 px sliver visible or `781 px` in full-page interactive check), and `#workspace-stage` top to **`694.22 px` — completely below the `667 px` mobile fold**.
   - **Impact:** Mobile users landing to measure something immediately see two headers, hero text, badges, and toolbars instead of a working ruler canvas. Notice competitors like `Ruler.im` (`toolTop = 0`) and `OnlineRulerTool.com` (via `Hide Info` collapse) put the measuring surface right at the top.

2. **Edge Canvas Cursor Projection Disconnected on `pointermove` (`workspace-controller.ts` lines 746–770):**
   - **Evidence:** `canvas-renderer.ts` supports drawing `#2997ff` / `#0066cc` active cursor projection ticks at `cursorPosPx` along the ruler edge, and `updateReadoutDOM()` updates `#live-cursor-readout` (`"X: 5.80 cm · Y: 2.96 cm"`). However, `pointermove` **never triggers `configureEdgeCanvas()` or `syncAll()`**.
   - **Runtime Proof (`engine-probe.json`):** Top edge `<canvas>` pixel hash before pointer move was `1135282569`; after moving pointer to stage center (`dx=200, dy=150`), pixel hash stayed identically `1135282569` (`cursorProjectionUpdatedOnMove: false`). Only DOM crosshair lines move; the graduated edge projection ticks sit stale.

3. **Hardcoded Untranslated Fallback `'ΔY guide span'` (`workspace-overlays.ts` line 177):**
   - **Evidence:** When guides exist only along the Y-axis, `workspace-overlays.ts` falls back to literal English `'ΔY guide span'` instead of calling `formatTemplate(rt.spanGuideLabel, { axis: 'ΔY' })`. Every non-English locale renders raw English text here.

4. **First-Visit Client-Side Forced Locale Redirect on `/` (`BaseLayout.astro` lines 190–214):**
   - **Evidence:** On cold load of `/` (when `localStorage['orp:locale:v1']` is absent), inline script reads `navigator.languages` and executes `window.location.replace('/' + matched)`. Confirmed live (`engine-probe.json`): visiting `/` with Chromium `locale: 'es-ES'` forcibly redirected to `/es`.
   - **UX & SEO Risk:** First-time international users clicking an explicit English `/` bookmark or Google result get yanked off `/`, and client-side JS redirects before hydration create flicker/unexpected URL jumps for travelers/VPN users/testers. Should be a non-intrusive dismissible language suggestion banner (or strictly opt-in) rather than a forced `replace()`.

5. **Device Auto-Detect Mislabeling & Apple-Only Hardware Table (`devices.ts` lines 13–156):**
   - **Evidence:** `DEVICE_SPECS` contains `37` Apple hardware models (`13` iPhones, `10` iPads, `14` Macs) and **`0` Android, Windows laptop, or Chromebook models**. Moreover, Chromium mobile emulation or non-Apple devices matching generic UAs display `"Scaled laptop or desktop display"` (`110.0 PPI`) even when `maxTouchPoints > 0` (`375×667` mobile probe showed `Scaled laptop or desktop display`).

### Medium Priority UX & Feature Defects

6. **Redundant Above-the-Fold Header & Calibrate CTAs (`Header.astro` + `Hero.astro`):**
   - On desktop `1440×900`, stacking the `52px` primary navbar + `52px` sticky sub-nav + Hero puts the primary workspace canvas down at `y ≈ 354 px` (`48 px` tall strip). Both the sub-nav (`Calibrate`) and Hero (`Calibrate Your Screen`) point to `#calibration-studio`, consuming vertical pixels without offering distinct actions.

7. **Calibration Card Has No Direct Drag Handle & Verification Shapes Are Passive:**
   - Card calibration uses `[−1]` / `[+1]` buttons, range slider (`120–900px`), and numeric box rather than letting users drag the physical card outline corner directly on screen (which matches natural touch/mouse ergonomics). Verification coins (`Quarter 24.26mm`, `€1 23.25mm`, `Penny 19.05mm`, `50mm` bar) are static visual references rather than clickable one-tap calibration presets like Ginifab's CD/card options or OnlineRulerTool's `Card / A4 / Letter / Custom` switcher.

8. **Guide & Overlay Functional Ceilings (`workspace-controller.ts`, `workspace-overlays.ts`):**
   - **Guides:** `#guide-span-readout` computes only the distance between the **last two sorted guides** per axis (`xGuides[len-1] - xGuides[len-2]`); placing 3+ guides silently ignores earlier intervals, and no multi-segment chain/area rectangle readout exists.
   - **Floating Rulers:** Max `4` instances, ephemeral (never saved to `localStorage`), fixed `44px` thickness, fixed length, and toggle strictly between `0°` (`horizontal`) and `90°` (`vertical`) — no arbitrary rotation.
   - **Protractor:** Fixed centered (`left-1/2 top-1/2`), baseline locked horizontally (`Math.atan2(Math.max(0, dy), dx)` clamps `0°–180°`), does not translate over off-center objects or measure `0°–360°` / arbitrary baseline angles, and lacks keyboard increment control.
   - **History Export:** Stores max `25` entries locally with Clear/Copy single item, but offers no CSV/JSON/annotated PNG export.

---

## 4. Strengths Baseline to Protect Before Launch

Do **not** regress these validated engineering advantages during Phase 4–7 work:

- **Accessibility Perfection:** `0` Axe-core WCAG violations across desktop & mobile (`onlinerulerplus axe: totalViolations: 0`), proper keyboard shortcuts (`G`, `C`, `P`, `F`, `D`, `H`, `Esc`, arrow nudging), and `focus-trap` help modal — matched only by `Ruler.im` among all 11 audited competitors.
- **Performance & Cleanliness:** `148 KB` transfer, `8` HTTP requests, `CLS 0.0007`, `0` runtime ad scripts/trackers, `0` broken images/console errors (`competitor-audit.json`).
- **Metrology & Persistence Foundations:** Dual-mode unit precision, fractional dyadic reduction (`1/2"` down to `1/16"` on canvas, `1/32"` in unit helpers), adaptive subdivision label decluttering (`ticks.ts`), per-display `displaySignature` (`L×S@dpr`) + `matchesPhysicalPanel()` rescaling across browser zoom (`storage.ts`), and `21` passing automated checks (`npm test`).
- **Technical SEO & i18n Rigor:** Complete `156`-page static build, reciprocal `13` `hreflang` entries (`12` locales + `x-default`), rich non-spammy JSON-LD (`Organization`, `WebSite`, `WebApplication`, `FAQPage`, `TechArticle`, `HowTo`, `BreadcrumbList`), self-hosted variable fonts, `llms.txt`, and `robots.txt`.
