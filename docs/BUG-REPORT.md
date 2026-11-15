# Bug Report — Autonomous QA & Repair Mission

All bugs listed below were discovered during live browser testing (visible Chromium `channel: 'chrome'` and Edge `channel: 'msedge'`), Core Web Vitals CLS profiling, `axe-core` WCAG 2.0/2.1 A/AA audits, and 7-viewport / 12-locale responsive runs. All 9 bugs have been fixed and verified.

| Bug ID | Severity | Area | Status | Summary |
| :--- | :--- | :--- | :--- | :--- |
| **BUG-QA-01** | High | Performance / CLS | **Fixed & Verified** | `#ruler-stage` and edge `<canvas>` elements lacked SSR initial bounds (`CLS = 0.4571` on `/` and `0.3581` on `/cm-ruler` prior to hydration). |
| **BUG-QA-02** | High | Accessibility (WCAG AA) | **Fixed & Verified** | Light-mode muted text tokens (`#7a7a7a`) and soft-badge link (`#0066cc` on `rgba(0,102,204,0.12)`) fell below 4.5:1 contrast (`3.94:1`–`4.32:1`). |
| **BUG-QA-03** | High | Accessibility (WCAG AA) | **Fixed & Verified** | Dark-mode soft-badge link (`#2997ff` on `rgba(41,151,255,0.18)`) blended to `4.29:1` (< 4.5:1 threshold). |
| **BUG-QA-04** | High | Accessibility (WCAG A 2.5.3) | **Fixed & Verified** | `label-content-name-mismatch` on 4 buttons (`[data-language-trigger]`, `[data-help-toggle]`, `[data-theme-toggle]`, `[data-help-close]`) where `aria-label` omitted visible label text (`EN`, `Shortcuts`, `Theme`, `Esc`). |
| **BUG-QA-05** | Medium | Accessibility / CSS | **Fixed & Verified** | Scrollable data tables lacked keyboard focusability (`tabindex="0"` + `role="region"`), and `calibration-guide.astro` + `how-to-use.astro` referenced undefined Tailwind class `bg-surface-primary` with duplicate `overflow-x-auto`. |
| **BUG-QA-06** | Medium | Touch / Mobile UX | **Fixed & Verified** | Draggable guides, floating rulers, and protractor canvas lacked CSS `touch-action: none` (`touch-none`), and multiple floating rulers spawned on 320px viewports could overflow stage bounds. |
| **BUG-QA-07** | High | Performance / Webfont CLS | **Fixed & Verified** | Uncached navigation on content routes (`/calibration-guide` CLS `0.1659`, `/privacy` CLS `0.1485`) suffered font-swap reflow before `@fontsource-variable` `.woff2` files finished decoding. |
| **BUG-QA-08** | High | Responsive (320px Header) | **Fixed & Verified** | On 320px viewports with classic 15px Windows scrollbars (`clientWidth = 305px`), `shrink-0` on the brand link in `Header.astro` pushed the right utility cluster (`309px`) `4px` past the right edge. |
| **BUG-QA-09** | Medium | Responsive / i18n (320px `/id`) | **Fixed & Verified** | The Guide Axis button group (`guideAxisLabel` + 3 axis chips) in `RulerWorkspace.astro` lacked `flex-wrap`, causing Bahasa Indonesia labels (`Sumbu Garis: Vertikal Horizontal Keduanya`, `285px`) to overflow `305px` client width (`scrollWidth = 314px`). |
