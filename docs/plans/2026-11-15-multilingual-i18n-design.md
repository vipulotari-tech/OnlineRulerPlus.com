# Multilingual Internationalization & Language Selector Design — OnlineRulerPlus.com

**Date:** 2026-11-15  
**Target Branch:** `master` (local workspace only; no remote push/deploy)  
**Approved Scope:** All **13 pages × 12 locales = 156 static pages** (`prefixDefaultLocale: false`), with first-visit browser language auto-detection + persistent manual selection.

---

## 1. Supported Locales & BCP-47 Mapping

| Native Name | Locale (`path`) | Hreflang / BCP-47 | `og:locale` | Flag |
|:---|:---|:---|:---|:---|
| English *(default)* | `en` (root `/`) | `en` | `en_US` | 🇺🇸 |
| Español | `es` (`/es`) | `es` | `es_ES` | 🇪🇸 |
| Français | `fr` (`/fr`) | `fr` | `fr_FR` | 🇫🇷 |
| Deutsch | `de` (`/de`) | `de` | `de_DE` | 🇩🇪 |
| Italiano | `it` (`/it`) | `it` | `it_IT` | 🇮🇹 |
| Português | `pt` (`/pt`) | `pt` | `pt_PT` | 🇵🇹 |
| 日本語 | `ja` (`/ja`) | `ja` | `ja_JP` | 🇯🇵 |
| 한국어 | `ko` (`/ko`) | `ko` | `ko_KR` | 🇰🇷 |
| Nederlands | `nl` (`/nl`) | `nl` | `nl_NL` | 🇳🇱 |
| Türkçe | `tr` (`/tr`) | `tr` | `tr_TR` | 🇹🇷 |
| Bahasa Indonesia | `id` (`/id`) | `id` | `id_ID` | 🇮🇩 |
| Polski | `pl` (`/pl`) | `pl` | `pl_PL` | 🇵🇱 |

---

## 2. Routing, Astro Config & Multilingual SEO

1. **`astro.config.mjs`:**
   - Enable Astro `i18n`: `defaultLocale: 'en'`, `locales: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'nl', 'tr', 'id', 'pl']`, `routing: { prefixDefaultLocale: false }`.
   - Configure `@astrojs/sitemap` with matching `i18n.defaultLocale: 'en'` and `locales` map so generated `sitemap-0.xml` emits `xhtml:link rel="alternate" hreflang="..."` across all 156 URLs.
   - Maintain `trailingSlash: 'never'` (`/` for English root, `/es`, `/es/cm-ruler`, etc.).
2. **Route Sharing Architecture (Dry, Zero Duplication):**
   - Parameterized localized pages or shared page renderer module (`src/components/pages/*Page.astro` or `src/pages/[...lang]/...` dynamic static routes with `getStaticPaths()`):
     - Using `src/pages/[...localeSlug]` OR `src/pages/[lang]/<page>.astro` alongside root pages OR clean `[...lang]` catch-all routes returning `params: { lang: undefined }` for English and `params: { lang: 'es' | ... }` for the 11 other locales keeps **13 templates total** generating all **156 static HTML pages** cleanly with zero duplicated `.astro` files!
     - Let's verify Astro 7 `getStaticPaths()` + `@astrojs/sitemap` compatibility before committing to `[...lang]` vs explicit root + `[locale]` wrapper routes.
3. **HTML Head & Structured Data (`BaseLayout.astro`):**
   - Dynamic `<html lang={bcp47}>`.
   - Self-referencing `<link rel="canonical" href={canonicalUrl}>`.
   - All 12 `<link rel="alternate" hreflang="..." href="...">` tags + `<link rel="alternate" hreflang="x-default" href={defaultUrl}>`.
   - Localized `<title>`, `<meta name="description">`, `og:locale`, `og:title`, `og:description`, `og:url`, and `twitter:*`.
   - Localized JSON-LD `inLanguage`, `@id` / `url`, `WebPage`, `WebApplication`, `BreadcrumbList`, and `FAQPage`.

---

## 3. Translation Dictionary & Runtime UI String Architecture

- **`src/i18n/locales/<locale>.json` (12 files):** Complete, structured JSON dictionaries covering:
  - `meta`, `nav`, `footer`, `hero`, `workspace`, `calibration`, `helpModal`, `banners`, `errors`
  - `homeContent` (guides, comparison cards, PPI table headings, FAQ items)
  - `spokes` (`cm`, `mm`, `inch`, `horizontal`, `vertical` — cards, dark cards, tables, FAQs)
  - `pages` (`howToUse`, `calibrationGuide`, `faq`, `about`, `contact`, `privacy`, `terms`)
- **`src/i18n/index.ts`:** Typed translation helpers (`SUPPORTED_LOCALES`, `LOCALE_META`, `isLocale`, `getLocaleFromPath`, `stripLocalePrefix`, `localizedPath`, `getTranslations(locale)`, `createClientStrings(locale)`), strict key fallback checking during unit tests so zero keys can ever go missing across all 12 JSON files.
- **Client Runtime Strings (`window.__ORP_I18N__` / inline JSON script):** Passing the compact `runtime` slice (toolbar labels, readout prefixes like `Range:`, `X:`, `Y:`, `ΔX`, `ΔY`, floating ruler / protractor `Angle:` & aria labels, calibration errors, banner notifications, history labels, status labels) via a small `#orp-i18n-data` `<script type="application/json">` keeps client JS bundles tiny (`0` extra JSON shipped per page for the other 11 locales!) while keeping 100% of dynamic TS behavior natively translated and preserving `src/lib/ruler/*` math untouched!

---

## 4. Language Selector UI/UX (`src/components/LanguageSelector.astro`)

- **Trigger Button:** Compact pill inside Header right utility cluster (next to Shortcuts / Theme / Mobile Menu, sized cleanly so desktop AND `320px` mobile never overflow): Flag icon + native language name (or compact native name/code on ultra-narrow viewports `<=380px`) + animated downward chevron.
- **Dropdown Menu:** Clean elevated white panel (`bg-canvas-elevated` / crisp `#ffffff` surface in light mode), `rounded-[14px]`, soft elevation shadow, hairline border, scrollable compact list/2-col or clean vertical menu with comfortable touch height (`min-h-[40px]`), check/highlight badge on current locale, `role="menu"` / `role="menuitemradio"`, `aria-expanded`, keyboard ArrowUp/ArrowDown/Home/End/Escape navigation, outside-click dismissal, and closes on selection while navigating cleanly to the equivalent route in the chosen locale.

---

## 5. Persistence & First-Visit Browser Detection

- Storage key: `localStorage['orp:locale:v1']`.
- **Manual selection:** Clicking any language in the selector stores `orp:locale:v1 = '<locale>'` and sets `orp:locale-source:v1 = 'manual'`, then navigates to `localizedPath(locale, currentBasePath)` (preserving `?unit=` / `?edges=` / `#hash` if present).
- **First-time visitor auto-detection:** Tiny inline script in `<head>` (or early boot on root `/` / default paths only when NO `orp:locale:v1` exists): checks `navigator.languages` / `navigator.language`, matches against supported locales (`es-* -> es`, `pt-* -> pt`, `ja -> ja`, etc.), saves `'auto'`, and if matched non-English (`!= 'en'`), redirects once to `localizedPath(detected, pathname)`. Subsequent visits respect saved preference without forced redirects; manual switch to English sets `orp:locale:v1 = 'en'` (`manual`) and stops any redirect.

---

## 6. Strict Preservation & Verification Plan

- Zero edits to metrology math in `src/lib/ruler/units.ts`, `ticks.ts`, `protractor.ts`, `devices.ts`, `resolve.ts`, `display.ts`, `canvas-renderer.ts` (keep `calibration.ts` calculations identical; localize error messages via error code or translator map cleanly without altering validation/math).
- Unit test verifying **100% key parity** across all 12 `src/i18n/locales/*.json` files (zero missing/empty keys).
- Playwright E2E verifying dropdown UX, keyboard/outside-click/Esc, real DOM translation across all 12 locales, persistence + reload + manual override of auto-detection, canonical + `hreflang` + `x-default` + `<html lang>` + sitemap links, desktop & `320px` mobile zero-overflow, and existing ruler math/E2E suites across Chrome & Edge.
