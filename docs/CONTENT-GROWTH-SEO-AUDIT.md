# Content Growth & Technical SEO Audit — OnlineRulerPlus.com

**Audit Date:** 2026-11-15  
**Target Markets:** United States, United Kingdom, Canada, Australia (`en-US` primary with US/UK/CA/AU unit & standards coverage)  
**Framework:** Astro 7.4.12 (`output: "static"`), Tailwind CSS 4.3.5, TypeScript, HTML5 Canvas

---

## 1. Current-State Architecture Audit

### 1.1 Existing Routes & Localization Surface
- **Total Pre-Existing Routes:** `19` indexable page slugs + `1` utility slug (`/embed`, `noindex, follow`) across `12` locales (`en`, `es`, `fr`, `de`, `it`, `pt`, `ja`, `ko`, `nl`, `tr`, `id`, `pl`) = `228` indexable pages + `12` embed pages.
- **Core Ruler & Utility Pages:**
  - `/` (`[...lang]/index.astro`) — Primary Interactive Online Ruler (All-Edge Top/Bottom/Left/Right, `cm`, `mm`, `in` `1/8–1/32`, `px`, `Dual cm/in`, `cm+px`, `in+px`, Guides, Crosshair, Floating Ruler, 360° Protractor, Photo/Ctrl+V mode, Focus mode, Calibration Studio).
  - `/inch-ruler` — Dedicated Imperial Inch Ruler (`forceUnit="in"`, 1/16″ & 12-inch scale).
  - `/cm-ruler` — Dedicated Metric Centimeter Ruler (`forceUnit="cm"`, cm-to-inch conversion chart).
  - `/mm-ruler` — Dedicated Fine-Pitch Millimeter Ruler (`forceUnit="mm"`, M2–M10 fastener & watch lug benchmarks).
  - `/horizontal-ruler`, `/vertical-ruler`, `/photo-ruler`, `/protractor`, `/circle-ruler`, `/quadrant`, `/screen-size-detector`, `/printable-ruler`.
  - Supporting Guides & Trust Pages: `/calibration-guide`, `/how-to-use`, `/faq`, `/about`, `/contact`, `/privacy`, `/terms`.
- **Gap Identified:** **Zero editorial blog infrastructure** (`/blog`, `/blog/[category]`, `/blog/[slug]`) existed in `src/content/` or `src/pages/`.

### 1.2 Sitemap, Robots, Canonicals & Structured Data
- **`astro.config.mjs`:** Uses `site: 'https://onlinerulerplus.com'`, `trailingSlash: 'never'`, and `@astrojs/sitemap` filtering out `/embed`.
- **`public/robots.txt`:** Cleanly allows all search and AI crawlers and references `Sitemap: https://onlinerulerplus.com/sitemap-index.xml`. No duplicate sitemap indexes exist.
- **`src/layouts/BaseLayout.astro` Gaps Found:**
  1. **Generic Reused Social Image:** `ogImageUrl` was hardcoded to `https://onlinerulerplus.com/og-image.png` for every route. Editorial blog articles and category archives require unique `1200×630` PNG images with matching `og:image:alt` and `twitter:image:alt`.
  2. **Global `hreflang` Injection:** `BaseLayout.astro` automatically emitted 13 `hreflang` links (`12` locales + `x-default`) on every page. For English-only `/blog/...` routes targeting US/UK/CA/AU, emitting `hreflang="es"` pointing to `/es/blog/...` would create broken alternate URLs unless `BaseLayout.astro` supports `disableHreflang` / English-only canonical handling.
  3. **Article Timestamps:** `ogType="article"` lacked `<meta property="article:published_time">` and `<meta property="article:modified_time">` tags.

### 1.3 Homepage SEO Copy, Keyword Mapping & FAQ Hygiene Audit
- **Homepage Prose (`src/i18n/locales/en.json` -> `home.howCards`):**
  - Existing `#how-it-works` section contained 8 brief cards (~480 words) without a cohesive overview paragraph (`howLead`) and omitted explicit explanation of newer shipped features (`cm+px`, `in+px`, coin calibration presets, `Photo / Ctrl+V` offline image measurement, and `360°` dual-ray protractor).
  - Expanding `#how-it-works` with a concise `howLead` and refined 8-card guide (~600–620 words total) addresses all 10 homepage editorial requirements cleanly without fluff or keyword stuffing.
- **FAQ Placement & Product Accuracy Findings (CRITICAL):**
  1. **Misplaced Microsoft Office Questions on `/`:** `home.faqs` on the homepage previously included *"How do you view or add a ruler in Word Online?"* and *"How do you show a ruler in PowerPoint Online?"*. Placing Office document-editor questions on the primary physical screen ruler homepage dilutes topical focus and violates FAQ placement hygiene. **Action:** Move both Office questions off `/` onto `/faq` and cover them thoroughly in a dedicated editorial guide (`/blog/how-to-show-ruler-word-online-powerpoint-online`).
  2. **Outdated PowerPoint Online Instruction:** The existing `en.json` FAQ for PowerPoint Online instructed users to open `View` and enable a `Ruler` toggle. Per verified Microsoft Support documentation, **PowerPoint for the web does not include the traditional desktop layout Ruler**; it uses automatic red **Smart Guides**, an ink **Draw > Ruler** straightedge tool, or **Editing > Open in Desktop App**. **Action:** Correct this instruction everywhere it appears.
  3. **Camera Ruler Claim Hygiene:** OnlineRulerPlus does **not** support live camera / WebRTC / AR distance measurement. It supports flat calibrated screen-glass measurement and static image/screenshot measurement via 2-point reference on `/photo-ruler`. Copy across `/`, `/photo-ruler`, `/faq`, and `/blog/can-you-use-camera-as-a-ruler` must state this distinction transparently.

### 1.4 Dedicated Landing Pages Audit
- Existing routes already cover:
  - **Online Ruler + Actual Size Online Ruler:** `/` (anti-cannibalization verified: creating a separate `/actual-size-ruler` would split head-term equity with `/`).
  - **Online Ruler in Inches + 12 Inch Online Ruler:** `/inch-ruler` (co-targets `online ruler inches`, `online ruler inches actual size`, `12 inch online ruler`, `online ruler 12 inch`).
  - **Online Ruler in Centimeters:** `/cm-ruler` (`online ruler cm`, `online ruler in cm`).
  - **Online Ruler in Millimeters:** `/mm-ruler` (`online ruler mm`, `online ruler in mm`, `mm online ruler`).
  - **Online Ruler Calibration:** `/calibration-guide` (supported by `/screen-size-detector` and `/#calibration`).
- **Action:** Preserve all existing URLs and add contextual internal links from these tool spokes to the new `/blog` cluster without altering tool functionality.
