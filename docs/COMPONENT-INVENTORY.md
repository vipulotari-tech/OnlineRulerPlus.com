# Component & Route Inventory — OnlineRulerPlus.com

**Stack:** Astro 7.4 (static SSG) + Tailwind CSS 4 + TypeScript client modules  
**Total Generated Routes:** 156 static HTML pages (`13` route templates × `12` locales: `en`, `es`, `fr`, `de`, `it`, `pt`, `ja`, `ko`, `nl`, `tr`, `id`, `pl`)

---

## 1. Routes (`src/pages/[...lang]/`)

| Route Template | Canonical Path | Purpose & Default Configuration |
| :--- | :--- | :--- |
| `index.astro` | `/` | Primary online ruler landing page (`defaultUnit="cm"`, top + left active edges) |
| `cm-ruler.astro` | `/cm-ruler` | Centimeter ruler spoke (`defaultUnit="cm"`, `forceUnit="cm"`) |
| `mm-ruler.astro` | `/mm-ruler` | Millimeter ruler spoke (`defaultUnit="mm"`, `forceUnit="mm"`) |
| `inch-ruler.astro` | `/inch-ruler` | Fractional/decimal inch ruler spoke (`defaultUnit="in"`, `forceUnit="in"`) |
| `horizontal-ruler.astro` | `/horizontal-ruler` | Horizontal edges pre-selected (`forceEdges="horizontal"`) |
| `vertical-ruler.astro` | `/vertical-ruler` | Vertical edges pre-selected (`forceEdges="vertical"`) |
| `how-to-use.astro` | `/how-to-use` | Step-by-step usage guide and keyboard shortcuts table |
| `calibration-guide.astro` | `/calibration-guide` | ISO/IEC 7810 ID-1 card & diagonal PPI calibration documentation |
| `faq.astro` | `/faq` | Core and extended `<details open>` FAQ accordion + `FAQPage` JSON-LD |
| `about.astro` | `/about` | Project background, standards alignment (`AboutPage` schema) |
| `contact.astro` | `/contact` | Support contact details (`support@onlinerulerplus.com`) & response expectations |
| `privacy.astro` | `/privacy` | Local-storage privacy policy & zero server telemetry commitment |
| `terms.astro` | `/terms` | Terms of use and calibration accuracy disclaimers |

---

## 2. Astro Layouts & Reusable Components (`src/layouts/`, `src/components/`)

| Component | Source Path | Interactive Elements & Responsibilities |
| :--- | :--- | :--- |
| `BaseLayout.astro` | [BaseLayout.astro](file:///C:/OnlineRulerPlus.com/src/layouts/BaseLayout.astro) | `<head>` SEO/hreflang/OG/JSON-LD metadata, font preloads (`interLatinWoff2`, `jakartaLatinWoff2`), dark theme & locale bootstrap script, skip link |
| `Header.astro` | [Header.astro](file:///C:/OnlineRulerPlus.com/src/components/Header.astro) | Brand link, desktop nav (`8` links), `LanguageSelector`, `[data-help-toggle]`, `[data-theme-toggle]`, `[data-mobile-menu-toggle]`, sub-nav anchor bar, `#mobile-nav-tray` drawer |
| `LanguageSelector.astro` | [LanguageSelector.astro](file:///C:/OnlineRulerPlus.com/src/components/LanguageSelector.astro) | `[data-language-trigger]`, `[data-language-menu]` (`role="menu"`), `12` `[role="menuitemradio"]` locale links with keyboard arrow/Home/End support |
| `LocaleFlag.astro` | [LocaleFlag.astro](file:///C:/OnlineRulerPlus.com/src/components/LocaleFlag.astro) | Crisp inline SVG country flags per locale |
| `Hero.astro` | [Hero.astro](file:///C:/OnlineRulerPlus.com/src/components/Hero.astro) | Eyebrow badge, `<h1>`, speakable summary description, calibration & how-to CTAs |
| `RulerWorkspace.astro` | [RulerWorkspace.astro](file:///C:/OnlineRulerPlus.com/src/components/RulerWorkspace.astro) | Unit buttons (`cm`, `mm`, `in`, `px`, `#btn-dual-unit`), Edge toggles (`top`, `bottom`, `left`, `right`, `all`), Tools (`#btn-toggle-guides`, `#btn-toggle-crosshair`, `#btn-add-floating-ruler`, `#btn-toggle-protractor`, `#btn-fullscreen`, `#btn-clear-guides`), Guide Axis (`x`, `y`, `both`), `#select-thickness`, `#slider-opacity`, 4 edge `<canvas>` elements, `#ruler-stage`, `#live-cursor-readout`, `#guide-span-readout` + `#btn-save-span`, `#display-change-banner` |
| `CalibrationSection.astro` | [CalibrationSection.astro](file:///C:/OnlineRulerPlus.com/src/components/CalibrationSection.astro) | WAI-ARIA tablist (`#tab-card`, `#tab-diagonal`, `#tab-autodetect`), card sizer (`#card-interactive-area`, `#card-calibration-box`, `#btn-card-minus`, `#slider-card-width`, `#btn-card-plus`, `#input-card-px`, `#btn-card-orientation`, `#btn-apply-card`), diagonal form (`[data-diagonal-preset]`, `#form-diagonal`, `#input-diagonal`, `#diagonal-error`, `#diagonal-preview`), auto-detect telemetry panel (`#btn-apply-autodetect`), verification shapes (`#verify-shape-quarter`, `#verify-shape-euro`, `#verify-shape-penny`, `#verify-shape-50mm`), measurement history (`#measurement-history-list`, `#btn-clear-history`), `[data-reset-calibration]` |
| `HelpModal.astro` | [HelpModal.astro](file:///C:/OnlineRulerPlus.com/src/components/HelpModal.astro) | `#help-shortcuts-modal` (`role="dialog"`), `[data-help-close]` (`Esc` + footer close), `#toggle-shortcuts-enabled` |
| `ContentSections.astro` | [ContentSections.astro](file:///C:/OnlineRulerPlus.com/src/components/ContentSections.astro) | Homepage guide cards, accessible PPI table (`role="region" tabindex="0"`), unit/axis mode cards, FAQ accordion |
| `SpokeRulerPage.astro` | [SpokeRulerPage.astro](file:///C:/OnlineRulerPlus.com/src/components/SpokeRulerPage.astro) | Shared template for the 5 ruler spoke routes (`cm`, `mm`, `in`, `horizontal`, `vertical`) with localized `WebApplication` & `FAQPage` schemas |
| `RulerSpokeContent.astro` | [RulerSpokeContent.astro](file:///C:/OnlineRulerPlus.com/src/components/RulerSpokeContent.astro) | Spoke feature grid, unit comparison table (`role="region" tabindex="0"`), spoke FAQ list |
| `Footer.astro` | [Footer.astro](file:///C:/OnlineRulerPlus.com/src/components/Footer.astro) | 5-column sitemap navigation across modes, guides, tools, and legal pages |

---

## 3. Client Controllers & Measurement Engine (`src/scripts/`, `src/lib/ruler/`)

- [app.ts](file:///C:/OnlineRulerPlus.com/src/scripts/app.ts): Global bootstrap, theme toggle (`D`), mobile nav drawer toggle, Help Modal open/close & keyboard Tab focus trap, non-workspace shortcut dispatch.
- [workspace-controller.ts](file:///C:/OnlineRulerPlus.com/src/scripts/workspace-controller.ts): Workspace toolbar state, 4-edge canvas sizing & HiDPI rendering, cursor crosshair telemetry, fullscreen API, keyboard shortcuts (`1/2/3/G/C/P/F`), floating ruler edge clamping.
- [workspace-overlays.ts](file:///C:/OnlineRulerPlus.com/src/scripts/workspace-overlays.ts): Draggable X/Y guide lines (`touch-none`), span measurement & history persistence, draggable/rotatable floating rulers (`touch-none`), interactive 180° protractor `<canvas>` (`touch-none`).
- [calibration-controller.ts](file:///C:/OnlineRulerPlus.com/src/scripts/calibration-controller.ts): Tab keyboard navigation (`ArrowLeft`/`ArrowRight`/`Home`/`End`), ISO/IEC 7810 ID-1 card alignment slider/input/portrait toggle, diagonal PPI validation & presets, verification coin/bar dynamic scaling, display/DPR change banner watcher.
- [language-selector.ts](file:///C:/OnlineRulerPlus.com/src/scripts/language-selector.ts): Dropdown toggle, ARIA arrow/Home/End/Escape handling, outside-click dismissal, local preference persistence.
- `src/lib/ruler/*`: `calibration.ts`, `canvas-renderer.ts`, `devices.ts`, `display.ts`, `index.ts`, `protractor.ts`, `resolve.ts`, `storage.ts`, `ticks.ts`, `units.ts`.
