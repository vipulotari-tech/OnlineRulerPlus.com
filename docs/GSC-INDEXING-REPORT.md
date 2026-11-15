# Google Search Console & Indexing Audit — OnlineRulerPlus.com

> **Audit Date:** 2026-11-15 (Phase 2 Post-Commit `a60d23e` Verification)  
> **Tooling Used:** `search-console` (`gsc.mjs sites`, `gsc.mjs check`, `gsc.mjs audit`), `claude-seo` (`google_auth.py --check`, `page_checks.py`), `adsense-site-auditor` (`check_technical.py`, `crawl_site.py`), DNS check (`Resolve-DnsName`)  
> **Scope & Authorization Rule:** Read-only inspection only. **No indexing requests were submitted and no GSC property settings were modified.**

---

## 1. Authentication, DNS & Live GSC API Status (`UNKNOWN` Where Unconfigured)

| Area | Check Command / Probe | Observed Result | Status | Root Cause / Next Step |
| :--- | :--- | :--- | :---: | :--- |
| **GSC API Credentials** | `gsc.mjs sites` & `google_auth.py --check` | `No credential found` / `Credential Tier: -1 -- No credentials configured` (`GSC_SERVICE_ACCOUNT_KEY` unset, no OAuth JSON, `gcloud` absent). | `UNKNOWN` | Per `search-console/SKILL.md`, authenticated GSC Search Analytics, URL Inspection API, and Sitemap List API calls cannot run without owner credentials; never bypassed. |
| **Public Domain DNS** | `Resolve-DnsName onlinerulerplus.com` | `DNS_ERROR_RCODE_NAME_ERROR` (`NXDOMAIN`) — `https://onlinerulerplus.com/` does not resolve publicly yet. | `FAIL` | Site exists locally (`dist/` + `http://localhost:4321/`) and awaits public hosting & DNS A/AAAA/CNAME cutover. |
| **Local Server Reachability** | `gsc.mjs check http://localhost:4321/ ...` (13 routes) | All `13/13` local routes returned `HTTP 200`, `0` redirects, `0` `X-Robots-Tag: noindex`, `0` HTML `noindex` tags. | `PASS` | Local static site and Astro routing are healthy; note `gsc.mjs audit --site http://localhost:4321 --sitemap http://localhost:4321/sitemap.xml` follows sitemap `<loc>` URLs to `https://onlinerulerplus.com/...` which fail DNS (`fetch failed`) until live deploy. |
| **GSC Indexing Requests / Settings Changes** | Policy constraint | `0` write calls attempted or executed. | `PASS` | Strict read-only compliance preserved. |

---

## 2. Sitemap Inventory & Structure Inspection

All three sitemap XML formats are verified across [astro.config.mjs](file:///C:/OnlineRulerPlus.com/astro.config.mjs), [public/robots.txt](file:///C:/OnlineRulerPlus.com/public/robots.txt), and built output in `dist/`:

- **`dist/sitemap-index.xml`** (`@astrojs/sitemap`): Declares `<sitemap><loc>https://onlinerulerplus.com/sitemap-0.xml</loc></sitemap>` (matching [public/robots.txt](file:///C:/OnlineRulerPlus.com/public/robots.txt) directive `Sitemap: https://onlinerulerplus.com/sitemap-index.xml`).
- **`dist/sitemap-0.xml`** (`@astrojs/sitemap`): Enumerates all **13** canonical routes with zero trailing slashes on subpages (`trailingSlash: 'never'`) and trailing slash `/` on homepage.
- **[public/sitemap.xml](file:///C:/OnlineRulerPlus.com/public/sitemap.xml)** *(added during audit)*: Direct single-hop `<urlset>` containing the same 13 canonical `<loc>` URLs so both `astro dev` (`http://localhost:4321/sitemap.xml` -> `HTTP 200`) and standard `/sitemap.xml` probes resolve without `404`.

### Complete 13-URL Sitemap & Local HTTP / Canonical Matrix

| # | Sitemap `<loc>` URL | Local HTTP (`gsc.mjs check`) | Redirects (`crawl_site.py`) | Meta Robots (`page_checks.py`) | `<link rel="canonical">` Match (`page_checks.py`) | Live Prod Status (`gsc.mjs audit`) |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| 1 | `https://onlinerulerplus.com/` | `200` | `0` | `index, follow` | `self` (`https://onlinerulerplus.com/`) | `UNKNOWN` (`NXDOMAIN` until DNS deploy) |
| 2 | `https://onlinerulerplus.com/cm-ruler` | `200` | `0` | `index, follow` | `self` (`.../cm-ruler`) | `UNKNOWN` (`NXDOMAIN` until DNS deploy) |
| 3 | `https://onlinerulerplus.com/mm-ruler` | `200` | `0` | `index, follow` | `self` (`.../mm-ruler`) | `UNKNOWN` (`NXDOMAIN` until DNS deploy) |
| 4 | `https://onlinerulerplus.com/inch-ruler` | `200` | `0` | `index, follow` | `self` (`.../inch-ruler`) | `UNKNOWN` (`NXDOMAIN` until DNS deploy) |
| 5 | `https://onlinerulerplus.com/horizontal-ruler` | `200` | `0` | `index, follow` | `self` (`.../horizontal-ruler`) | `UNKNOWN` (`NXDOMAIN` until DNS deploy) |
| 6 | `https://onlinerulerplus.com/vertical-ruler` | `200` | `0` | `index, follow` | `self` (`.../vertical-ruler`) | `UNKNOWN` (`NXDOMAIN` until DNS deploy) |
| 7 | `https://onlinerulerplus.com/how-to-use` | `200` | `0` | `index, follow` | `self` (`.../how-to-use`) | `UNKNOWN` (`NXDOMAIN` until DNS deploy) |
| 8 | `https://onlinerulerplus.com/calibration-guide` | `200` | `0` | `index, follow` | `self` (`.../calibration-guide`) | `UNKNOWN` (`NXDOMAIN` until DNS deploy) |
| 9 | `https://onlinerulerplus.com/faq` | `200` | `0` | `index, follow` | `self` (`.../faq`) | `UNKNOWN` (`NXDOMAIN` until DNS deploy) |
| 10 | `https://onlinerulerplus.com/about` | `200` | `0` | `index, follow` | `self` (`.../about`) | `UNKNOWN` (`NXDOMAIN` until DNS deploy) |
| 11 | `https://onlinerulerplus.com/contact` | `200` | `0` | `index, follow` | `self` (`.../contact`) | `UNKNOWN` (`NXDOMAIN` until DNS deploy) |
| 12 | `https://onlinerulerplus.com/privacy` | `200` | `0` | `index, follow` | `self` (`.../privacy`) | `UNKNOWN` (`NXDOMAIN` until DNS deploy) |
| 13 | `https://onlinerulerplus.com/terms` | `200` | `0` | `index, follow` | `self` (`.../terms`) | `UNKNOWN` (`NXDOMAIN` until DNS deploy) |

---

## 3. Canonical Selection, Crawlability & Redirect Hygiene

- **Consistent Trailing-Slash Policy:** Configured once in [astro.config.mjs](file:///C:/OnlineRulerPlus.com/astro.config.mjs) (`site: 'https://onlinerulerplus.com'`, `trailingSlash: 'never'`). All internal links in navigation, footer, cards, and JSON-LD omit trailing slashes (verified via [tests/site-build.test.mjs](file:///C:/OnlineRulerPlus.com/tests/site-build.test.mjs) link checker across all 13 built pages — `0` broken links).
- **Zero Canonical Conflicts:** `claude-seo/scripts/page_checks.py` verified `canonical_status: "self"` across `13/13` built pages, `0` `noindex` meta tags, and `1` valid JSON-LD block (`jsonld_invalid: 0`) per page.
- **Crawler Permissions ([robots.txt](file:///C:/OnlineRulerPlus.com/public/robots.txt)):** Explicitly allows `User-agent: *`, `Googlebot`, `GoogleOther`, `Google-Extended`, `bingbot`, `Applebot`, `OAI-SearchBot`, `PerplexityBot`, `ClaudeBot`, plus default allowance for `Mediapartners-Google` and `AdsBot-Google`. Note that `check_technical.py` flagged `http://localhost:4321/` -> `https://onlinerulerplus.com/` canonical host mismatch solely because the audit ran against `localhost:4321` while public DNS is not live yet.

---

## 4. GSC Indexing Coverage, Sitemap Errors, Search Performance & Queries

Because **GSC credentials are unconfigured (`UNKNOWN`) and `onlinerulerplus.com` is not yet live on public DNS (`NXDOMAIN`)**, live Search Console telemetry cannot be retrieved or fabricated:

| GSC Metric / Dimension | Status | Observed Finding |
| :--- | :---: | :--- |
| **Indexing Coverage (`Indexed` vs `Excluded`)** | `UNKNOWN` | No GSC property/credential available; domain not live publicly yet. |
| **Sitemap Submission & Processing Errors** | `UNKNOWN` (live) / `PASS` (XML validity) | Local/built sitemaps (`sitemap-index.xml`, `sitemap-0.xml`, `sitemap.xml`) parse cleanly with `13` valid `<loc>` URLs; live GSC submission status requires owner setup after DNS cutover. |
| **Google-Selected Canonical vs User-Declared** | `UNKNOWN` | Every HTML file declares matching self-canonical tags; Google-selected canonical requires live crawling + URL Inspection API. |
| **Search Performance (Clicks, Impressions, CTR, Avg Position)** | `UNKNOWN` | Not observable without GSC API credentials and post-launch search traffic. **Zero impressions or traffic claims are fabricated.** |
| **Top Queries & Pages / Indexing Losses / Newly Indexed** | `UNKNOWN` | Cannot be observed until domain goes live, is verified in GSC, and accumulates search impressions. |

---

## 5. Owner Post-Launch GSC Verification Steps

1. Deploy `dist/` to production HTTPS hosting with HTTP->HTTPS and `www`->apex single-hop 301 redirects, confirming `https://onlinerulerplus.com/sitemap-index.xml` returns `HTTP 200`.
2. Add and verify `sc-domain:onlinerulerplus.com` in [Google Search Console](https://search.google.com/search-console) via DNS TXT record.
3. Submit `https://onlinerulerplus.com/sitemap-index.xml` (and optionally verify `/sitemap.xml`) inside **Sitemaps** in GSC.
4. Once `search-console` credentials are configured (`GSC_SERVICE_ACCOUNT_KEY` or OAuth client), re-run read-only diagnostics:
   - `node C:\Users\vipul\.claude\skills\search-console\scripts\gsc.mjs audit --site https://onlinerulerplus.com`
   - `node C:\Users\vipul\.claude\skills\search-console\scripts\gsc.mjs inspect --site https://onlinerulerplus.com --url https://onlinerulerplus.com/`
   - `node C:\Users\vipul\.claude\skills\search-console\scripts\gsc.mjs status --site https://onlinerulerplus.com`
