# Mobile Responsiveness & Touch UX Audit Report

## 1. Executive Summary

OnlineRulerPlus.com underwent a full mobile-first responsiveness, touch ergonomics, visual layout, and Core Web Vitals verification pass across **13 target viewports** (`320px`, `360px`, `375px`, `390px`, `393px`, `414px`, `430px`, `480px`, `768px`, `1024px`, `1280px`, `1440px`, `1920px`).

All **26 unit/integration tests** (`npm test`) and **65 Chrome Playwright E2E tests** (`npx playwright test --project=chrome`, including the new `tests/e2e/mobile-responsiveness.spec.ts` suite) pass after the final edits, alongside a **262-page** static production build (`npm run build`).

---

## 2. Issues Identified & Implemented Fixes

### 2.1 Horizontal Overflow & Viewport Clipping (`circle-ruler` & Language Menu)
- **Observed Issue:** `/circle-ruler` overflowed horizontally on narrow viewports (`+79px` at `320px`, `+39px` at `360px`, `+24px` at `375px`, `+9px` at `390px`) because `#circle-diameter-input`, decrement/increment buttons, and `<input type="range">` sat in a single non-wrapping flex row (`right=399px`).
- **Fix Applied:** Updated `src/pages/[...lang]/circle-ruler.astro` to wrap controls with `flex flex-wrap sm:flex-nowrap items-center gap-2`, place the range slider full-width above the stepper row on mobile (`order-first sm:order-none`, `min-h-[44px]`), and size `#circle-diameter-input` to `44px` height (`text-base sm:text-xs`).
- **Observed Issue & Fix in Dropdowns:** Updated `src/components/LanguageSelector.astro` dropdown width to `w-[min(216px,calc(100vw-16px))]` anchored `-right-16 sm:right-0` so the open language menu fits inside `320px` (`left: 22, right: 238, overflow: 0`) and `375px` (`left: 77, right: 293, overflow: 0`).

### 2.2 Mobile Touch Targets (`>= 44×44px`) & Interactive Ergonomics
- **Header & Navigation (`src/components/Header.astro`, `src/components/LanguageSelector.astro`):**
  - Expanded mobile navbar buttons (`[data-language-trigger]`, `[data-help-toggle]`, `[data-theme-toggle]`, `[data-mobile-menu-toggle]`) to `min-h-[44px] min-w-[44px]` while preserving desktop `sm:h-[32px]` density.
  - Enlarged `#mobile-nav-tray` links to `min-h-[44px]` with `max-h-[calc(100dvh-56px)] overflow-y-auto` and updated `#locale-suggestion-banner` CTA (`min-h-[40px]`) and dismiss button (`h-10 w-10`).
- **Floating Protractor Overlay (`src/scripts/workspace-overlays.ts`):**
  - Enlarged `#btn-protractor-mode` (`50×44px` on `375px` mobile) and close button `×` (`44×44px` on `375px` mobile) while keeping `md:min-h-[26px]` / `md:min-h-[28px]` on desktop.
- **Unit Converter & Photo Studio & Printable Controls:**
  - Rebuilt `src/components/UnitConverterBar.astro` as `grid w-full grid-cols-2 gap-2 sm:w-auto sm:flex` on mobile with `h-[44px] sm:h-[30px]` inputs (`text-base sm:text-xs` to avoid iOS Safari auto-zoom).
  - Enlarged `#photo-cal-length`, `#photo-cal-unit`, `#btn-photo-apply-cal` (`src/components/RulerWorkspace.astro`), `#select-print-paper` (`src/pages/[...lang]/printable-ruler.astro`), `#input-profile-name`, `#btn-save-named-profile`, `#btn-card-minus`, `#btn-card-plus`, `#input-card-px`, and `#card-drag-handle` (`h-11 w-11 sm:h-7 sm:w-7` in `src/components/CalibrationSection.astro`) to `44px` mobile hit areas.
  - Refactored `CalibrationSection.astro` coin verification layout from rigid `grid-cols-3` to `flex flex-wrap sm:grid sm:grid-cols-3` to prevent `320px` crowding.
- **Editorial Filters, FAQ Accordions & 404 Search:**
  - Added `.apple-chip` and `@media (max-width: 767px)` `min-height: 44px; min-width: 44px;` rules in `src/styles/global.css`.
  - Enlarged FAQ `<summary>` disclosures in `src/components/ContentSections.astro` and `src/pages/[...lang]/faq.astro` to `min-h-[44px] py-1`.
  - Updated `src/pages/404.astro` `#notfound-search` to `min-h-[48px] text-base sm:text-sm` and search result links to `min-h-[44px]`.
  - Enlarged `src/components/Footer.astro` links to `min-h-[36px] sm:min-h-0` on mobile.
- **Documented Fold Trade-off (`RulerWorkspace.astro` Row 3):**
  - Compact Row 3 controls (`data-guide-axis-btn`, `#select-arch-scale`, `#select-thickness`, `[data-open-calibration]`) use `38px` mobile height intentionally so `audit-regressions.spec.ts` P0 first-screen mobile fold invariants (`topCanvasTop < 280` and `visibleStageH >= 220` at `375×667`) continue to pass alongside generous workspace canvas visibility above the fold.

### 2.3 Fluid Typography, Prose Overflow & Media Optimization
- Updated `src/styles/global.css`:
  - Mobile `scroll-padding-top: 64px` and `scroll-margin-top: 68px` (restoring `104px`/`108px` at `sm:` breakpoints).
  - Fluid `clamp()` scales for `.type-hero-display`, `.type-display-lg`, `.type-display-md`, `.type-lead`, and `.type-lead-airy`.
  - `overflow-wrap: anywhere` and `clamp()` prose sizing on `.editorial-prose`, plus touch scrolling on `.editorial-prose table` (`-webkit-overflow-scrolling: touch; max-width: 100%;`).
  - `clamp(1rem, 2.5vw, 1.5rem)` padding on `.apple-utility-card`.
- Updated `src/pages/blog/[slug].astro` breadcrumbs (`max-w-full sm:max-w-[40ch]`) and added `fetchpriority="high"` on article hero diagram SVGs.

---

## 3. Mobile Core Web Vitals Telemetry (Chrome Mobile Emulation, 375×812, 2× DPR, 4× CPU Throttling)

Measured via Playwright CDP `Emulation.setCPUThrottlingRate({ rate: 4 })` + browser `PerformanceObserver` against `astro preview`:

| Route | FCP | LCP | CLS | TBT | Touch Interaction Latency |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `/` | `424 ms` | `424 ms` | `0` | `208 ms` | `141 ms` |
| `/circle-ruler` | `264 ms` | `264 ms` | `0` | `84 ms` | `52 ms` |
| `/blog` | `244 ms` | `244 ms` | `0` | `63 ms` | `60 ms` |
| `/blog/how-to-read-a-ruler-inches-and-cm` | `276 ms` | `276 ms` | `0` | `0 ms` | `153 ms` |

---

## 4. Visual Inspection & Automated E2E Coverage

- **Rendered Screenshot Audit:** Visually inspected PNG captures across `320px` (`/` and `/circle-ruler`), `375px` (`/`, `/photo-ruler`, `/protractor`, `/blog`, `/blog/how-to-read-a-ruler-inches-and-cm`, `/404`, and open `#mobile-nav-tray`), and `430px` (`/contact`). Verified clean wrapping, unobstructed rulers/protractors, `2×2` mobile Unit Converter grid, legible `44px` filter chips, and zero clipping/overlap.
- **Permanent Test Suite (`tests/e2e/mobile-responsiveness.spec.ts`):**
  - Verifies **all 13 viewports** across 12 core routes (`0` horizontal overflow `<= 1px`, `0` clipped interactive elements, `0` overflowing tables/SVGs/images, `0` broken images, `0` page errors).
  - Verifies real touch `.tap()` interactions (`#mobile-nav-tray`, `[data-language-menu]`, `#help-shortcuts-modal`, `#btn-protractor-mode`, `#circle-diameter-input`, `#notfound-search`).
  - Asserts mobile `CLS <= 0.1` on `/`, `/circle-ruler`, and `/blog/how-to-read-a-ruler-inches-and-cm`.

### Post-Edit Verification Results
- `npm run build`: **262 static pages built cleanly**.
- `npm test`: **26 / 26 passed** (`0` failed, `0` skipped).
- `npx playwright test --project=chrome`: **65 / 65 passed** (`0` failed, `0` skipped).
