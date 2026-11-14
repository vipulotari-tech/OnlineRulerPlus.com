# Comprehensive SEO, Content & GEO Audit — OnlineRulerPlus.com

- **Target Domain**: `https://onlinerulerplus.com`
- **Codebase Stack**: Astro 7.4.12 (`output: "static"`), Tailwind CSS 4.2.1, TypeScript, HTML5 Canvas
- **Audit Date**: November 14, 2026
- **Skills Executed**:
  1. `seo-audit` — Corey Haines / Marketing Skills (`coreyhaines31/marketingskills` v2.2.5)
  2. `claude-seo` — AgriciDaniel (`AgriciDaniel/claude-seo` v2.6.0)
  3. `GEO SEO` — Zubair Trabzada (`zubair-trabzada/geo-seo-claude`)

---

## 1. Skill Discovery, Forensic Verification & Responsibilities

Before auditing the codebase, all three mandatory global SEO skills were located, inspected, verified, and loaded:

| Skill | Author / Repo | Global Installation Path | Role Assigned in This Audit |
| :--- | :--- | :--- | :--- |
| **1. `seo-audit`** | Corey Haines (`coreyhaines31/marketingskills`) | `C:\Users\vipul\.claude\skills\seo-audit-coreyhaines\` (and `C:\Users\vipul\.claude\skills\seo-audit\SKILL.coreyhaines.md`) | Technical SEO audit, crawlability, indexability, `robots.txt` & XML sitemap alignment, canonical URLs, metadata & title tag rules (`references/title-tags.md`), AI writing detection (`references/ai-writing-detection.md`), Core Web Vitals, mobile content parity, and duplicate content. |
| **2. `claude-seo`** | AgriciDaniel (`AgriciDaniel/claude-seo` v2.6.0) | `C:\Users\vipul\.claude\skills\seo\` + 33 `seo-*` sub-skills (`seo-audit`, `seo-technical`, `seo-content`, `seo-schema`, `seo-sitemap`, `seo-geo`, `seo-cluster`, etc.) + 19 `seo-*.md` agents | Keyword research & search intent mapping, SERP & competitor analysis, topical authority & hub-and-spoke architecture, on-page optimization (`scripts/page_checks.py`, `scripts/content_quality.py`, `scripts/content_humanize.py`), E-E-A-T (`references/eeat-framework.md`), quality gates (`references/quality-gates.md`), and Schema.org JSON-LD (`seo-schema`). |
| **3. `GEO SEO`** | Zubair Trabzada (`zubair-trabzada/geo-seo-claude`) | `C:\Users\vipul\.claude\skills\geo\` + 14 `geo-*` sub-skills (`geo-audit`, `geo-citability`, `geo-crawlers`, `geo-llmstxt`, `geo-platform-optimizer`, `geo-schema`, etc.) + 5 `geo-*.md` agents | Google AI Overviews, ChatGPT, Perplexity, and Claude search visibility, passage citability scoring (`scripts/citability_scorer.py`), AI crawler access (`scripts/fetch_page.py`), `/llms.txt` & `/llms-full.txt` deployment, entity graph linking, and `SpeakableSpecification` schema. |

### Forensic Discovery & Skill Restoration Note
During global skill discovery in `C:\Users\vipul\.claude\skills\` and `C:\Users\vipul\.agents\.skill-lock.json`, we uncovered two installation issues and resolved both before executing the audit:
1. **Skill Directory Name Collision (`seo-audit`)**: `coreyhaines31/marketingskills` (`seo-audit` v2.2.5) was installed at `2026-11-14T14:24:04Z`, placing its `evals/evals.json` and 7 reference guides (`ai-writing-detection.md`, `international-seo.md`, `local-seo-pages-and-measurement.md`, `local-seo-profile-and-citations.md`, `local-seo.md`, `rankings-push.md`, `title-tags.md`) into `C:\Users\vipul\.claude\skills\seo-audit\`. Twenty-nine seconds later (`14:24:33Z`), `AgriciDaniel/claude-seo`'s `install.ps1` copied its own sub-skill `skills/seo-audit/SKILL.md` into the same folder, overwriting Corey Haines's `SKILL.md`. We restored Corey Haines's exact `SKILL.md` to `C:\Users\vipul\.claude\skills\seo-audit-coreyhaines\SKILL.md` (with `references/` and `evals/`) and `C:\Users\vipul\.claude\skills\seo-audit\SKILL.coreyhaines.md` so both skills are preserved intact.
2. **Missing Global `GEO SEO` Installation**: `zubair-trabzada/geo-seo-claude` was not yet present in `C:\Users\vipul\.claude\skills\`. We cloned `https://github.com/zubair-trabzada/geo-seo-claude.git` and installed the main skill (`C:\Users\vipul\.claude\skills\geo\`), all 14 `geo-*` sub-skills, all 5 `geo-*.md` agents, and its Python analysis scripts (`citability_scorer.py`, `fetch_page.py`, `llmstxt_generator.py`, `brand_scanner.py`, `generate_pdf_report.py`).

---

## 2. Executive Baseline vs. Post-Implementation Scorecard

All measurements below were captured directly from the compiled production HTML (`dist/`) and live local server (`http://localhost:4321`) using `claude-seo`'s `page_checks.py` and `content_quality.py`, `GEO SEO`'s `citability_scorer.py` and `fetch_page.py`, and Playwright E2E browser checks:

| Metric / Dimension | Baseline (Before Fixes) | Post-Implementation (Verified) | Tool / Standard Used |
| :--- | :--- | :--- | :--- |
| **Sitemap vs. Canonical URL Alignment** | **1 / 13 pages aligned** (12 inner URLs had trailing slash in `sitemap-0.xml` vs. no trailing slash in `<link rel="canonical">`) | **13 / 13 pages (100% exact match)** | `@astrojs/sitemap` + `tests/site-build.test.mjs` |
| **`claude-seo` `page_checks.py` Warnings** | **10 Medium findings across 8 pages** (7 `title-too-long`, 2 `meta-description-too-long`, 1 `thin-content`) | **0 findings across all 13 pages** (585 / 585 checks passed cleanly) | `claude-seo/scripts/page_checks.py` |
| **Spoke Ruler Page Content Duplication (`dup_vs_home`)** | **98.1% – 98.8% trigram overlap** on `/cm-ruler`, `/mm-ruler`, `/inch-ruler`, `/horizontal-ruler`, `/vertical-ruler` | **32.5% – 35.9% trigram overlap** (only shared interactive workspace/calibration UI controls; 100% unique editorial & tabular content) | Trigram overlap audit (`run_seo_checks.py`) + `claude-seo` `quality-gates.md` |
| **JSON-LD Structured Data Coverage** | **4 / 13 pages** (`0` JSON-LD blocks on 9 pages; no `Organization`, `WebSite`, or `BreadcrumbList` anywhere) | **13 / 13 pages (100%)** with connected `@id` entity graph (`Organization`, `WebSite`, `BreadcrumbList`, `WebApplication`, `TechArticle`, `FAQPage`, `AboutPage`, `ContactPage`) | `claude-seo` (`seo-schema`) + `GEO SEO` (`geo-schema`) |
| **Open Graph / Social Preview Image** | Invalid SVG (`https://onlinerulerplus.com/favicon.svg`) with missing dimensions | Valid `1200×630` PNG (`https://onlinerulerplus.com/og-image.png`) with `og:image:width`, `og:image:height`, `og:image:type`, `og:image:alt` | `seo-audit` + `claude-seo` |
| **Mobile-First Indexing Content Parity** | **Failed** (`Hero.astro` hid primary `<p>{description}</p>` on mobile via `hidden sm:block`) | **Passed** (Hero lead description visible on all viewports; `.speakable-summary` active on mobile & desktop) | `seo-audit` + `claude-seo` (`seo-technical`) |
| **GEO Citability Score (`index.html`)** | **33.6 / 100** (`0` Grade A blocks, `0` Grade B blocks, `0` optimal 134–167w passages) | **51.6 / 100 overall (`7` Grade A blocks, `4` Grade B blocks)**; top FAQ/guide passages score **80–85 / 100 (Grade A)** | `GEO SEO` (`geo/scripts/citability_scorer.py`) |
| **GEO Citability Score (`faq/index.html`)** | **60.0 / 100** (`1` merged block, `0` Grade A/B blocks, 95% duplicate of homepage) | **63.2 / 100 across 17 blocks (`5` Grade A, `3` Grade B, `0` Grade F)**; expanded from 7 to 16 Q&As | `GEO SEO` (`geo/scripts/citability_scorer.py`) |
| **AI Crawler Policy & `/llms.txt`** | Implicit wildcard only; `/llms.txt` & `/llms-full.txt` **404 Missing** | Explicit `Allow: /` for 16 AI crawlers + `Content-Signal: search=yes, ai-input=yes` + `/llms.txt` & `/llms-full.txt` deployed | `GEO SEO` (`geo-crawlers` & `geo-llmstxt`) |

---

## 3. Prioritized Issue-by-Issue Audit Log

Every issue discovered across the 13 routes and shared Astro components is documented below with **Problem**, **Evidence**, **SEO impact**, **Recommended fix**, **Implementation status**, and **Verification result**.

---

### ISSUE-01 (CRITICAL — Technical SEO): XML Sitemap vs. `<link rel="canonical">` Trailing-Slash Mismatch on 12 of 13 Pages
- **Problem**: `@astrojs/sitemap` generated trailing-slash URLs (`https://onlinerulerplus.com/cm-ruler/`) in `dist/sitemap-0.xml`, while `src/layouts/BaseLayout.astro` and all internal `<a href="...">` links used non-trailing-slash URLs (`https://onlinerulerplus.com/cm-ruler`).
- **Evidence**:
  - Baseline `dist/sitemap-0.xml` contained `<loc>https://onlinerulerplus.com/cm-ruler/</loc>`, `<loc>https://onlinerulerplus.com/inch-ruler/</loc>`, etc. for all 12 inner routes.
  - Baseline `dist/cm-ruler/index.html` contained `<link rel="canonical" href="https://onlinerulerplus.com/cm-ruler">` and `<meta property="og:url" content="https://onlinerulerplus.com/cm-ruler">`.
- **SEO Impact**: Sending conflicting URL canonicalization signals between the XML sitemap and `<link rel="canonical">` across 92.3% of the site causes Google Search Console to report *"Non-canonical URL in sitemap"* and *"Page with redirect / Alternate page with proper canonical tag"*, splitting crawl equity and delaying indexation.
- **Recommended Fix**: Configure `trailingSlash: 'never'` in `astro.config.mjs` (while preserving default directory build output `dist/<route>/index.html`) and normalize `canonicalUrl` in `src/layouts/BaseLayout.astro` so root is `https://onlinerulerplus.com/` and all inner routes strip trailing slashes consistently across sitemap, canonical tags, Open Graph URLs, and internal links.
- **Implementation Status**: **Implemented** in [astro.config.mjs](file:///C:/OnlineRulerPlus.com/astro.config.mjs#L7-L11) and [src/layouts/BaseLayout.astro](file:///C:/OnlineRulerPlus.com/src/layouts/BaseLayout.astro#L22-L26).
- **Verification Result**: **Verified PASS**. `dist/sitemap-0.xml` now outputs `<loc>https://onlinerulerplus.com/cm-ruler</loc>` for all 12 inner pages, matching `<link rel="canonical">` 100%, and `tests/site-build.test.mjs` asserts exact canonical-to-sitemap parity on every build.

---

### ISSUE-02 (CRITICAL — Content & Cannibalization): 98.1%–98.8% Duplicate Content Across All 5 Spoke Ruler Pages & 95.0% on `/faq`
- **Problem**: `cm-ruler.astro`, `mm-ruler.astro`, `inch-ruler.astro`, `horizontal-ruler.astro`, and `vertical-ruler.astro` rendered the exact same `<CalibrationSection />` and `<ContentSections />` components as `index.astro`, changing only the `<Hero>` headline and default unit prop. Similarly, `faq.astro` rendered only the 7 `faqItems` imported from `ContentSections.astro`.
- **Evidence**:
  - Baseline trigram overlap check (`run_seo_checks.py`) measured body text duplication against `index.html` at **98.5%** on `/cm-ruler`, **98.8%** on `/mm-ruler`, **98.1%** on `/inch-ruler`, **98.8%** on `/horizontal-ruler`, **98.7%** on `/vertical-ruler`, and **95.0%** on `/faq`.
- **SEO Impact**: Violates `claude-seo` (`references/quality-gates.md`, which mandates 80–100% unique content on product/feature landing pages) and Corey Haines's `seo-audit` duplicate content rules. Google's deduplication systems fold near-identical spoke URLs into the homepage canonical cluster ("Duplicate, Google chose different canonical than user"), preventing `/cm-ruler` and `/inch-ruler` from ranking independently for `cm ruler online`, `centimeter to inch`, `inches ruler online`, and `12 inch online ruler`.
- **Recommended Fix**: Create a modular spoke content component (`src/components/RulerSpokeContent.astro`) and author 100% unique, intent-specific guides, reference conversion tables, and page-specific FAQs for `/cm-ruler` (1–30 cm to inch/mm conversion table & metric verification), `/inch-ruler` (1/16″ to 1″ fractional conversion chart & 12-inch foot ruler screen-fit guide), `/mm-ruler` (M2–M10 fastener, watch lug 18–22 mm, & sub-millimeter pitch table), `/horizontal-ruler` (16:9/16:10/21:9 horizontal screen width table & CSS pixel inspector guide), and `/vertical-ruler` (standing height ΔY guide & portrait smartphone ergonomics table). Expand `/faq` from 7 to 16 categorized Q&As.
- **Implementation Status**: **Implemented** in [src/components/RulerSpokeContent.astro](file:///C:/OnlineRulerPlus.com/src/components/RulerSpokeContent.astro), [src/pages/cm-ruler.astro](file:///C:/OnlineRulerPlus.com/src/pages/cm-ruler.astro), [src/pages/inch-ruler.astro](file:///C:/OnlineRulerPlus.com/src/pages/inch-ruler.astro), [src/pages/mm-ruler.astro](file:///C:/OnlineRulerPlus.com/src/pages/mm-ruler.astro), [src/pages/horizontal-ruler.astro](file:///C:/OnlineRulerPlus.com/src/pages/horizontal-ruler.astro), [src/pages/vertical-ruler.astro](file:///C:/OnlineRulerPlus.com/src/pages/vertical-ruler.astro), and [src/pages/faq.astro](file:///C:/OnlineRulerPlus.com/src/pages/faq.astro).
- **Verification Result**: **Verified PASS**. Trigram overlap with `index.html` dropped from **98.1%–98.8%** down to **32.5%–35.9%** across all 5 spoke ruler pages (the remaining ~33% is strictly the shared interactive ruler toolbar and calibration widget UI controls). `/faq` word count increased from 622 to **2,092 words** across 16 Q&As.

---

### ISSUE-03 (HIGH — Structured Data / Entity Graph): Missing JSON-LD on 9 of 13 Pages & Missing `Organization`, `WebSite`, `BreadcrumbList`, and `speakable` Schema
- **Problem**: Nine of the 13 pages (`cm-ruler`, `mm-ruler`, `inch-ruler`, `horizontal-ruler`, `vertical-ruler`, `about`, `contact`, `privacy`, `terms`) emitted zero JSON-LD structured data (`jsonld_blocks: 0`). `index.astro` emitted `WebApplication` and `FAQPage` without `Organization` or `WebSite` entities, `how-to-use.astro` relied solely on `HowTo` (deprecated by Google for rich results in September 2023 per `claude-seo` `seo-schema`), and `calibration-guide.astro` lacked `datePublished`, `dateModified`, `publisher`, and `speakable`.
- **Evidence**:
  - Baseline `page_checks.py` output showed `jsonld_blocks: 0` on 9 of 13 built HTML files.
- **SEO Impact**: Deprives search engines and AI answer engines of machine-readable entity relationships (`Organization` → `WebSite` → `WebApplication` / `TechArticle`), breadcrumb hierarchy (`BreadcrumbList`), freshness timestamps (`datePublished` / `dateModified`), and voice/assistant extraction selectors (`SpeakableSpecification`).
- **Recommended Fix**: Upgrade `src/layouts/BaseLayout.astro` and `src/pages/index.astro` to emit a unified JSON-LD entity graph on every page containing `Organization` (`#organization` with `knowsAbout`, `logo`, `contactPoint`), `WebSite` (`#website`), `BreadcrumbList` (automatically generated for all 12 inner pages), and page-specific `WebApplication`, `TechArticle` (with `datePublished`, `dateModified`, `speakable`), `FAQPage`, `AboutPage`, `ContactPage`, and `WebPage` schemas.
- **Implementation Status**: **Implemented** across [src/layouts/BaseLayout.astro](file:///C:/OnlineRulerPlus.com/src/layouts/BaseLayout.astro#L31-L108) and all 13 page files in `src/pages/`.
- **Verification Result**: **Verified PASS**. `page_checks.py` confirms `jsonld_blocks: 1` and `jsonld_invalid: 0` across all 13 pages (100% valid JSON-LD), verified by `tests/site-build.test.mjs`.

---

### ISSUE-04 (HIGH — Open Graph & Social Metadata): Invalid SVG `og:image` / `twitter:image` (`favicon.svg`)
- **Problem**: Both `BaseLayout.astro` and `index.astro` set `og:image` and `twitter:image` to `https://onlinerulerplus.com/favicon.svg` with `twitter:card="summary_large_image"`.
- **Evidence**:
  - Baseline `BaseLayout.astro` lines 41 & 45: `<meta property="og:image" content={new URL('/favicon.svg', siteOrigin).toString()} />`.
- **SEO Impact**: Open Graph consumers (Google Discover, X/Twitter, LinkedIn, Slack, Discord, Facebook, iMessage) do not support `.svg` files for `og:image` / `twitter:image`, resulting in broken or blank social cards and missing image previews in search/discover surfaces.
- **Recommended Fix**: Generate a dedicated `1200×630` PNG image (`public/og-image.png`) styled with Apple DESIGN.md tokens and update `BaseLayout.astro` and `index.astro` to include `og:image`, `og:image:type="image/png"`, `og:image:width="1200"`, `og:image:height="630"`, `og:image:alt`, `twitter:image`, and `twitter:image:alt`.
- **Implementation Status**: **Implemented** in [public/og-image.png](file:///C:/OnlineRulerPlus.com/public/og-image.png), [src/layouts/BaseLayout.astro](file:///C:/OnlineRulerPlus.com/src/layouts/BaseLayout.astro#L123-L138), and [src/pages/index.astro](file:///C:/OnlineRulerPlus.com/src/pages/index.astro#L118-L133).
- **Verification Result**: **Verified PASS**. `dist/og-image.png` exists (`1200×630` PNG) and all 13 pages output complete Open Graph and Twitter image tags.

---

### ISSUE-05 (HIGH — Mobile-First Indexing): Primary Hero Description Hidden on Mobile Viewports (`hidden sm:block`)
- **Problem**: `src/components/Hero.astro` applied `hidden sm:block` (`display: none` below `640px`) to the hero `<p>{description}</p>` element immediately following `<h1>`.
- **Evidence**:
  - Baseline `src/components/Hero.astro` line 26: `<p class="mt-1 max-w-2xl type-caption text-ink-muted-80 hidden sm:block">{description}</p>`.
- **SEO Impact**: Under Google's Mobile-First Indexing (`Googlebot Smartphone`), hiding the introductory definition paragraph on mobile viewports violates mobile/desktop content parity (`seo-audit` & `claude-seo` `seo-technical`) and strips the primary above-the-fold summary on smartphones.
- **Recommended Fix**: Remove `hidden sm:block` from the hero `<p>` tag in `Hero.astro`, style it with compact responsive typography (`text-xs sm:text-sm leading-snug`), and attach `.speakable-summary` so both mobile users and `Googlebot Smartphone` render the full lead summary while keeping `#ruler-workspace` well above the fold (`y < 400px`).
- **Implementation Status**: **Implemented** in [src/components/Hero.astro](file:///C:/OnlineRulerPlus.com/src/components/Hero.astro#L26-L28).
- **Verification Result**: **Verified PASS**. Playwright E2E test confirms `#ruler-workspace` renders above the fold (`box.y < 400`) and zero horizontal overflow occurs across `375×667`, `390×844`, `768×1024`, `1024×768`, `1280×800`, and `1600×900` viewports.

---

### ISSUE-06 (MEDIUM — On-Page Metadata & AI Writing Tells): 7 Titles > 60 Characters, 2 Meta Descriptions > 160 Characters, and Em-Dash Overuse in `<title>` Tags
- **Problem**: `claude-seo`'s `page_checks.py` flagged 7 pages with `title-too-long` (up to 72 characters on `index.html`) and 2 pages with `meta-description-too-long` (up to 175 characters on `how-to-use/index.html`). All 13 `<title>` tags also used em-dashes (`—`), which Corey Haines's `seo-audit/references/ai-writing-detection.md` identifies as the most common punctuation signal of AI-generated copy.
- **Evidence**:
  - Baseline `page_checks.py` findings: `index.html` (`72c`), `cm-ruler` (`62c`), `inch-ruler` (`66c`), `horizontal-ruler` (`62c`), `vertical-ruler` (`66c`), `how-to-use` (`61c` title, `175c` description), `calibration-guide` (`62c`), `about` (`164c` description).
- **SEO Impact**: Titles exceeding 60 characters (~600px) are truncated or rewritten by Google in SERPs, and descriptions over 160 characters are clipped mid-sentence.
- **Recommended Fix**: Rewrite all 13 `<title>` tags to 49–59 characters using the pipe (`|`) separator with primary keywords front-loaded (`Online Ruler | Actual-Size Screen Ruler (cm, mm, Inches)`), and rewrite all `<meta name="description">` tags to 143–160 characters.
- **Implementation Status**: **Implemented** across all 13 pages in `src/pages/`.
- **Verification Result**: **Verified PASS**. `page_checks.py` now reports `0` title or meta description warnings across all 13 pages (`title_length` 49–59 chars; `meta_description_length` 143–160 chars).

---

### ISSUE-07 (MEDIUM — Crawl Budget, Internal Linking & Thin Content): Parameterized Footer Links (`/?unit=...`) & Thin Content on `/contact` (185 Words)
- **Problem**:
  1. `src/components/Footer.astro` linked to parameterized homepage URLs (`/?unit=cm#ruler-tool`, `/?unit=in#ruler-tool`, `/?unit=px#ruler-tool`) instead of the dedicated canonical spoke pages (`/cm-ruler`, `/inch-ruler`, `/horizontal-ruler`).
  2. `src/components/Header.astro` omitted `/terms` from `#mobile-nav-tray`.
  3. `src/pages/contact.astro` contained only 185 words, triggering a `thin-content(Medium)` warning in `page_checks.py` (`thin_content_min_words: 200`).
- **Evidence**:
  - Baseline `Footer.astro` lines 57–59 (`href="/?unit=cm#ruler-tool"`).
  - Baseline `page_checks.py` on `contact/index.html`: `word_count: 185`, `findings: ['thin-content(Medium)']`.
- **SEO Impact**: Linking to query-parameter URLs wastes internal link equity on non-canonical URLs rather than reinforcing canonical spoke pages; sub-200-word utility/contact pages risk soft-404 or thin-content classification.
- **Recommended Fix**: Replace parameterized footer links with `/cm-ruler#ruler-tool`, `/inch-ruler#ruler-tool`, and `/horizontal-ruler#ruler-tool`; add `/terms` to `#mobile-nav-tray` in `Header.astro`; expand `contact.astro` to 445 words with structured hardware display profile submission instructions (`screen.width × screen.height`, `devicePixelRatio`) and self-service calibration troubleshooting links.
- **Implementation Status**: **Implemented** in [src/components/Footer.astro](file:///C:/OnlineRulerPlus.com/src/components/Footer.astro#L56-L61), [src/components/Header.astro](file:///C:/OnlineRulerPlus.com/src/components/Header.astro#L189-L193), and [src/pages/contact.astro](file:///C:/OnlineRulerPlus.com/src/pages/contact.astro).
- **Verification Result**: **Verified PASS**. `contact/index.html` now has **445 words** with `findings=[]` in `page_checks.py`, and all internal links resolve directly to canonical routes.

---

### ISSUE-08 (HIGH — GEO / AI Search Visibility): Low Passage Citability Scores (`33.6/100`), Un-headed `<summary>` Elements, Missing `/llms.txt` & `/llms-full.txt`, and Implicit-Only `robots.txt`
- **Problem**:
  1. `GEO SEO`'s `citability_scorer.py` scored `index.html` at `33.6 / 100` with `0` Grade A (`80+`) blocks, `0` Grade B (`65+`) blocks, and `0` optimal-length (`134–167` word) passages because content was split into short 35–60 word cards and FAQ `<summary>` tags used `<span>` instead of `<h3>` (causing DOM extractors to merge all 7 FAQ answers into a single >400-word block).
  2. `public/llms.txt` and `public/llms-full.txt` were missing (`exists: false` in `fetch_page.py`).
  3. `public/robots.txt` lacked explicit `Allow: /` blocks for AI search crawlers (`OAI-SearchBot`, `GPTBot`, `ChatGPT-User`, `Claude-SearchBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`) and lacked `Content-Signal: search=yes, ai-input=yes`.
- **Evidence**:
  - Baseline `citability_scorer.py` on `index.html`: `geo_avg=33.6, opt=0, {'A': 0, 'B': 0, 'C': 4, 'D': 5, 'F': 11}`.
  - Baseline `fetch_page.py` on `http://localhost:4321/`: `llms_txt.exists = false`, `llms_full_txt.exists = false`, `ai_crawler_status = ALLOWED_BY_DEFAULT`.
- **SEO Impact**: Limits passage extraction and citation rates in Google AI Overviews, ChatGPT Search, Perplexity, and Claude when users ask questions like *"Why is an online ruler inaccurate without calibration?"*, *"How many mm is 1/16 inch?"*, or *"How to calibrate an online ruler with a credit card?"*.
- **Recommended Fix**:
  1. Wrap FAQ questions inside `<summary>` with `<h3 class="type-body-strong text-ink">{item.q}</h3>` across `ContentSections.astro`, `RulerSpokeContent.astro`, and `faq.astro`.
  2. Rewrite guide cards and FAQ answers as self-contained **130–167 word** answer blocks featuring question headings (`?`), direct `"X is a/an/the..."` definitions in the first 60 words, authoritative standard citations (`ISO/IEC 7810`, `W3C CSS Values and Units Level 4`, `NIST / BIPM`), concrete numerical examples, and low pronoun density.
  3. Update `public/robots.txt` with explicit `Allow: /` directives for all major AI search crawlers and `Content-Signal: search=yes, ai-input=yes`.
  4. Create `public/llms.txt` and `public/llms-full.txt` with complete metrology constants, calibration formulas, conversion tables, and canonical URLs.
- **Implementation Status**: **Implemented** in [public/robots.txt](file:///C:/OnlineRulerPlus.com/public/robots.txt), [public/llms.txt](file:///C:/OnlineRulerPlus.com/public/llms.txt), [public/llms-full.txt](file:///C:/OnlineRulerPlus.com/public/llms-full.txt), [src/components/ContentSections.astro](file:///C:/OnlineRulerPlus.com/src/components/ContentSections.astro), [src/components/RulerSpokeContent.astro](file:///C:/OnlineRulerPlus.com/src/components/RulerSpokeContent.astro), and all 13 pages in `src/pages/`.
- **Verification Result**: **Verified PASS**. `index.html` now achieves **7 Grade A (`80+`) blocks and 4 Grade B (`65+`) blocks** (`geo_avg=51.6`), `faq/index.html` achieves **5 Grade A and 3 Grade B blocks** (`geo_avg=63.2`, `0` Grade F blocks), and `fetch_page.py` confirms `llms.txt` and `llms-full.txt` are live and all 14 tracked AI crawlers are `EXPLICITLY_ALLOWED`.
