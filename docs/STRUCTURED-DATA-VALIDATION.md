# Structured Data Validation Report — OnlineRulerPlus.com

**Format Used:** JSON-LD (`<script type="application/ld+json">`)  
**Files Updated:** [index.astro](file:///C:/OnlineRulerPlus.com/src/pages/index.astro), [how-to-use.astro](file:///C:/OnlineRulerPlus.com/src/pages/how-to-use.astro), [ContentSections.astro](file:///C:/OnlineRulerPlus.com/src/components/ContentSections.astro)

---

## 1. Changes Applied During Schema Audit

1. **Added `WebPage` Schema on Homepage ([index.astro](file:///C:/OnlineRulerPlus.com/src/pages/index.astro)):**
   - Added `@type: 'WebPage'` (`@id: https://onlinerulerplus.com/#webpage`) linking `isPartOf -> #website`, `about -> #app`, `mainEntity -> #app`, `primaryImageOfPage -> og-image.png (1200×630)`, and `speakable` CSS selectors (`h1`, `.speakable-summary`).
   - Updated `WebApplication` (`#app`) `screenshot` (`https://onlinerulerplus.com/og-image.png`), `inLanguage` (`en-US`), `isAccessibleForFree: true`, `offers` (`price: '0'`, `priceCurrency: 'USD'`), and accurate `featureList` without fabricated ratings, review counts, or false claims.
2. **Removed Deprecated `HowTo` Schema ([how-to-use.astro](file:///C:/OnlineRulerPlus.com/src/pages/how-to-use.astro)):**
   - Removed the retired `HowTo` block (Google removed `HowTo` rich results in September 2023; `claude-seo` classifies `HowTo` as deprecated), preserving valid `Organization`, `WebSite`, `BreadcrumbList`, and `TechArticle` (`headline`, `datePublished`, `dateModified`, `author`, `publisher`, `speakable`) on `/how-to-use/`.
3. **Synchronized `FAQPage` JSON-LD (`/` & `/faq`):**
   - Homepage `FAQPage` maps 1:1 from the 11 visible `faqItems`; `/faq` maps 1:1 from all 20 visible FAQs (`faqItems + extendedFaqs`).
   - Note: Google retired `FAQPage` SERP rich results on May 7, 2026; existing `FAQPage` markup is retained purely as accurate, matching page metadata with zero hidden entries.

---

## 2. Site-Wide Schema Inventory & Validation Results (Post-Edit)

Verified across all **13 generated static HTML files** in `dist/` using `claude-seo` `page_checks.py` and Python `json` + DOM parsing:

| Route | Valid JSON-LD Blocks | Invalid Blocks | Emitted `@type` Entities |
|:---|:---|:---|:---|
| `/` | `1` | `0` | `Organization`, `WebSite`, `WebPage`, `WebApplication`, `FAQPage` |
| `/inch-ruler/` | `1` | `0` | `Organization`, `WebSite`, `BreadcrumbList`, `WebApplication`, `FAQPage` |
| `/cm-ruler/` | `1` | `0` | `Organization`, `WebSite`, `BreadcrumbList`, `WebApplication`, `FAQPage` |
| `/mm-ruler/` | `1` | `0` | `Organization`, `WebSite`, `BreadcrumbList`, `WebApplication`, `FAQPage` |
| `/horizontal-ruler/` | `1` | `0` | `Organization`, `WebSite`, `BreadcrumbList`, `WebApplication`, `FAQPage` |
| `/vertical-ruler/` | `1` | `0` | `Organization`, `WebSite`, `BreadcrumbList`, `WebApplication`, `FAQPage` |
| `/how-to-use/` | `1` | `0` | `Organization`, `WebSite`, `BreadcrumbList`, `TechArticle` |
| `/calibration-guide/` | `1` | `0` | `Organization`, `WebSite`, `BreadcrumbList`, `TechArticle` |
| `/faq/` | `1` | `0` | `Organization`, `WebSite`, `BreadcrumbList`, `FAQPage` |
| `/about/` | `1` | `0` | `Organization`, `WebSite`, `BreadcrumbList`, `AboutPage` |
| `/contact/` | `1` | `0` | `Organization`, `WebSite`, `BreadcrumbList`, `ContactPage` |
| `/privacy/` | `1` | `0` | `Organization`, `WebSite`, `BreadcrumbList`, `WebPage` |
| `/terms/` | `1` | `0` | `Organization`, `WebSite`, `BreadcrumbList`, `WebPage` |

### Summary Assertions
- **JSON Syntax:** `0` parse errors across all 13 routes (`jsonld_invalid: 0`).
- **Fake Claims Check:** `0` invented `aggregateRating`, `review`, paid pricing tiers, or personal author credentials.
- **Breadcrumb Navigation:** All 12 non-home routes automatically emit `BreadcrumbList` via [BaseLayout.astro](file:///C:/OnlineRulerPlus.com/src/layouts/BaseLayout.astro).
