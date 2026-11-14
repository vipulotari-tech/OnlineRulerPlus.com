# Monetization Readiness & Ad Architecture Plan — OnlineRulerPlus.com

> **Assessment Date:** 2026-11-14  
> **Overall Verdict:** **`READY AFTER FIXES`** *(Codebase technically compliant after fixes; live public hosting/DNS, Google-certified CMP activation, and post-onboarding `ads.txt` remain owner prerequisites prior to AdSense submission.)*  
> **Notice:** **Approval cannot be guaranteed by any technical audit; only Google can make the final AdSense approval decision.**

---

## 1. Readiness Summary: Codebase vs. External Launch Prerequisites

### A. Completed Codebase Remediations (Verified After Final Edit)
- **AdSense Privacy Policy Alignment ([privacy.astro](file:///C:/OnlineRulerPlus.com/src/pages/privacy.astro)):** Removed contradictory *"never embeds third-party advertising networks"* claim across [privacy.astro](file:///C:/OnlineRulerPlus.com/src/pages/privacy.astro), [Footer.astro](file:///C:/OnlineRulerPlus.com/src/components/Footer.astro), [ContentSections.astro](file:///C:/OnlineRulerPlus.com/src/components/ContentSections.astro), [about.astro](file:///C:/OnlineRulerPlus.com/src/pages/about.astro), and [llms.txt](file:///C:/OnlineRulerPlus.com/public/llms.txt). Added explicit Google AdSense cookie, web beacon, IP signal, My Ad Center / `aboutads.info/choices` opt-out, Google Partner Sites (`policies.google.com/technologies/partner-sites`), GDPR/IAB TCF CMP, CCPA/CPRA, and COPPA disclosures (`591` main words).
- **3 Substantive Guides at `1,200+` Words (`ADS-COMPLETE-02`):** Expanded [how-to-use.astro](file:///C:/OnlineRulerPlus.com/src/pages/how-to-use.astro) (`1,588` main words) and [calibration-guide.astro](file:///C:/OnlineRulerPlus.com/src/pages/calibration-guide.astro) (`1,426` main words) alongside [faq.astro](file:///C:/OnlineRulerPlus.com/src/pages/faq.astro) (`2,026` main words).
- **All 13 Routes Substantive (`ADS-CONTENT-03`, `ADS-UX-05`):** Trust pages `/about` (`564` main words), `/contact` (`498`), `/privacy` (`591`), and `/terms` (`504`) clear `analyze_text_depth.py --min-words 300` with `13/13` `[PASS]`.
- **Sitemap Dev & Build Parity:** Added [public/sitemap.xml](file:///C:/OnlineRulerPlus.com/public/sitemap.xml) matching `@astrojs/sitemap` (`dist/sitemap-index.xml`, `dist/sitemap-0.xml`).
- **Full Automated Verification Post-Final-Edit:**
  - `npm run build`: `13` pages + sitemaps built cleanly.
  - `npm test`: `15/15` unit, build, link-integrity, and smoke tests passing.
  - `npx playwright test --reporter=list`: `8/8` E2E tests passing across Chrome & Edge (`0` console errors, responsive desktop/mobile overflow-free).
  - `claude-seo/scripts/page_checks.py`: `13/13` built pages report `0` findings (`meta_description` `135–158` chars, `title` `49–59` chars, valid `JSON-LD` `1/0`, `canonical_status=self`).

### B. Remaining External / Owner Prerequisites Before Clicking "Apply" in AdSense
1. **Deploy Production Build & Bind Public HTTPS DNS (`ADS-CRAWL-01`, `ADS-CRAWL-06`):** `onlinerulerplus.com` currently fails public DNS resolution (`NXDOMAIN`). Deploy `dist/` to production static hosting (Cloudflare Pages, Vercel, Netlify, or origin server with TLS) so `Mediapartners-Google`, `AdsBot-Google`, and `Googlebot` receive `HTTP 200` with valid HTTPS.
2. **Verify Google Search Console & Sitemap Indexing (`ADS-CRAWL-07`):** Submit `https://onlinerulerplus.com/sitemap-index.xml` and confirm organic crawlability and indexing stability cleanly.
3. **Owner Account & Policy Attestation (`ADS-ELIG-01`, `ADS-ELIG-02`, `ADS-PROG-01`, `ADS-PROG-04`):** Confirm applicant is 18+, holds at most one AdSense account per entity, uses organic/direct legitimate traffic only, and maintains operational email delivery for `support@onlinerulerplus.com`.
4. **Google-Certified CMP Activation (`ADS-PRIV-04`):** Enable Google's Privacy & Messaging GDPR/IAB TCF v2.2 consent dialog (or an equivalent Google-certified CMP) when adding the site in AdSense so EEA/UK/Switzerland visitors grant or refuse personalized cookie consent before ad tags fire.
5. **Publish `public/ads.txt` Upon ID Assignment (`ADS-TXT-01`, `ADS-TXT-02`):** Once Google issues your real `pub-XXXXXXXXXXXXXXXX` publisher ID, add `public/ads.txt`:
   ```text
   google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
   ```
   *(Never deploy a dummy `pub-0000000000000000` line ahead of onboarding.)*

---

## 2. User-First Ad Placement Architecture (Zero Interference With Ruler Precision)

To uphold Google Publisher Policies (`ADS-PROG-03`, `ADS-PUB-10`, `ADS-PUB-12`, `ADS-REST-08`) and protect user measurement usability, follow these strict placement rules when inserting AdSense code:

### Prohibited Zones (NEVER Place Ads Here)
- **NEVER above the fold above `#ruler-tool`:** First-screen users arrive to measure immediately; pushing the workspace below an ad violates usability and triggers above-the-fold ad-heaviness flags (`tool-site-rubric.md`).
- **NEVER inside or adjacent to `#ruler-workspace`, `#calibration`, `#ruler-canvas-*`, floating ruler bars, guide readouts, or `#help-modal`:** Even `16px` of accidental overlap or button-like ad styling beside segmented pods (`cm`/`mm`/`in`/`px`) risks accidental clicks (`ADS-PUB-10`) and deceptive UI flags (`ADS-UX-03`).
- **NEVER enable Auto Ads Anchor / Vignette overlays on interactive tool routes** if they obscure bottom delta readouts, touch edge strips, or mobile Portrait Card Calibration controls (`ADS-REST-08`).
- **NEVER place ads on `/privacy`, `/terms`, `/contact`, or any future 404/error screen.**

### Recommended Safe Ad Zones (Post-Approval Rollout)

| Slot Location | Pages | Visual Isolation & CLS Prevention | Max Ad Density Target |
| :--- | :--- | :--- | :--- |
| **Zone 1 · Mid-Page Content Separator** | `/`, `/cm-ruler`, `/mm-ruler`, `/inch-ruler`, `/horizontal-ruler`, `/vertical-ruler` | Positioned *below* `#calibration` and *above* `#accuracy-guide` (well separated from interactive ruler controls by `>= 32px` margin, a thin hairline rule, and explicit `Advertisement` caption in `type-fine-print` `text-ink-muted-48`). Reserve fixed desktop/mobile container `min-height` (`90px` desktop / `100px` mobile) to keep CLS `= 0`. | `< 10%` of vertical height |
| **Zone 2 · Guide In-Article Slot** | `/how-to-use`, `/calibration-guide`, `/faq` | Single responsive display unit between major thematic sections (e.g., between Core Foundations and Worked Calibration Calculations), clearly labeled `Advertisement` with generous padding (`py-6 border-y border-hairline`). | `< 15%` of total guide scroll height |

*(Keep total ad viewport share well below `30%` on every route at all times, favoring 1–2 cleanly spaced responsive units per page over aggressive Auto Ads injection.)*

---

## 3. Recommended Pre-Submission Go/No-Go Order

1. Deploy `dist/` to live HTTPS production domain `https://onlinerulerplus.com` + verify `support@onlinerulerplus.com` inbox receives mail.
2. Confirm HTTP `200` on `https://onlinerulerplus.com/`, `/privacy`, `/about`, `/contact`, `/terms`, `/robots.txt`, and `/sitemap-index.xml`.
3. Verify property in Google Search Console, submit `sitemap-index.xml`, and observe initial indexing stabilization cleanly.
4. Connect site in Google AdSense, place the official `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-..." crossorigin="anonymous"></script>` tag into [BaseLayout.astro](file:///C:/OnlineRulerPlus.com/src/layouts/BaseLayout.astro) `<head>`, enable Google GDPR/US State Privacy Messaging (CMP), publish real `public/ads.txt`, and run Playwright with ad requests verified non-blocking before awaiting Google's review.
