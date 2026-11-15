import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_META,
  PAGE_SLUGS,
  UTILITY_SLUGS,
  localizedPath,
} from '../src/i18n/config.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const SITE_ORIGIN = 'https://onlinerulerplus.com';

function distFileForRoute(locale, slug) {
  const rel = localizedPath(locale, slug).replace(/^\/+/, '');
  return rel ? `${rel}.html` : 'index.html';
}

function canonicalForRoute(locale, slug) {
  const p = localizedPath(locale, slug);
  return p === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${p}`;
}

test('Build output covers all 156 localized routes, hreflang alternates, JSON-LD, language selector & sitemap', (t) => {
  if (!fs.existsSync(distDir)) {
    t.skip('dist directory not yet built');
    return;
  }

  const staticArtifacts = [
    'robots.txt',
    '_headers',
    '_routes.json',
    'sitemap.xml',
    '404.html',
    'llms.txt',
    'llms-full.txt',
    'og-image.png',
    'favicon.ico',
    'favicon.svg',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'apple-touch-icon.png',
    'android-chrome-192x192.png',
    'android-chrome-512x512.png',
    'site.webmanifest',
  ];

  for (const rel of staticArtifacts) {
    assert.ok(
      fs.existsSync(path.join(distDir, rel)),
      `Expected build artifact ${rel} to exist`,
    );
  }
  assert.ok(!fs.existsSync(path.join(distDir, 'sitemap-index.xml')), 'Competeing sitemap-index.xml must not exist');
  assert.ok(!fs.existsSync(path.join(distDir, 'sitemap-0.xml')), 'Competing sitemap-0.xml must not exist');

  // Build valid route path set across all indexable + utility URLs + English blog routes
  const BLOG_CATEGORY_SLUGS = [
    'ruler-fundamentals',
    'measuring-without-tools',
    'unit-conversions',
    'screen-calibration',
    'printable-practical',
  ];
  const blogContentDir = path.join(projectRoot, 'src', 'content', 'blog');
  const blogArticleSlugs = fs.existsSync(blogContentDir)
    ? fs
        .readdirSync(blogContentDir)
        .filter((f) => f.endsWith('.md'))
        .map((f) => f.replace(/\.md$/, ''))
    : [];

  const validPaths = new Set();
  const routeEntries = [];
  validPaths.add('/blog');
  for (const cat of BLOG_CATEGORY_SLUGS) {
    validPaths.add(`/blog/${cat}`);
  }
  for (const slug of blogArticleSlugs) {
    validPaths.add(`/blog/${slug}`);
  }
  for (const locale of LOCALES) {
    for (const slug of PAGE_SLUGS) {
      const routePath = localizedPath(locale, slug);
      validPaths.add(routePath);
      routeEntries.push({
        locale,
        slug,
        relFile: distFileForRoute(locale, slug),
        canonical: canonicalForRoute(locale, slug),
      });
    }
    for (const utilSlug of UTILITY_SLUGS) {
      validPaths.add(localizedPath(locale, utilSlug));
    }
  }
  assert.strictEqual(
    routeEntries.length,
    PAGE_SLUGS.length * LOCALES.length,
    `Expected ${PAGE_SLUGS.length} routes × ${LOCALES.length} locales = ${PAGE_SLUGS.length * LOCALES.length} entries`,
  );

  // Verify English homepage workspace markup & Apple tokens
  const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
  assert.match(indexHtml, /id="ruler-workspace"/);
  assert.match(indexHtml, /id="ruler-canvas-top"/);
  assert.match(indexHtml, /id="ruler-canvas-bottom"/);
  assert.match(indexHtml, /id="ruler-canvas-left"/);
  assert.match(indexHtml, /id="ruler-canvas-right"/);
  assert.match(indexHtml, /id="card-calibration-box"/);
  assert.match(indexHtml, /id="input-diagonal"/);
  assert.match(indexHtml, /apple-subnav-frosted/);
  assert.match(indexHtml, /apple-btn-primary/);

  const sitemapXml = fs.readFileSync(path.join(distDir, 'sitemap.xml'), 'utf-8');

  // Sample non-English homepages must differ in <title> and <h1> from English homepage
  const enTitleMatch = indexHtml.match(/<title>([\s\S]*?)<\/title>/);
  const enH1Match = indexHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  assert.ok(enTitleMatch && enH1Match);

  for (const { locale, slug, relFile, canonical } of routeEntries) {
    const fullPath = path.join(distDir, relFile);
    assert.ok(fs.existsSync(fullPath), `Expected built page ${relFile} to exist`);

    const html = fs.readFileSync(fullPath, 'utf-8');
    const meta = LOCALE_META[locale];

    // <html lang="...">
    assert.ok(
      html.includes(`<html lang="${meta.bcp47}">`),
      `Expected ${relFile} to have <html lang="${meta.bcp47}">`,
    );

    // Self-referencing canonical
    assert.ok(
      html.includes(`<link rel="canonical" href="${canonical}">`) ||
        html.includes(`<link rel="canonical" href="${canonical}"/>`),
      `Expected ${relFile} canonical to match ${canonical}`,
    );

    // og:locale
    assert.ok(
      html.includes(`<meta property="og:locale" content="${meta.ogLocale}">`),
      `Expected ${relFile} to have og:locale=${meta.ogLocale}`,
    );

    // All 12 locale hreflang alternates + x-default
    for (const altLocale of LOCALES) {
      const altUrl = canonicalForRoute(altLocale, slug);
      assert.ok(
        html.includes(`hreflang="${altLocale}" href="${altUrl}"`),
        `Expected ${relFile} to contain hreflang="${altLocale}" pointing to ${altUrl}`,
      );
    }
    const xDefaultUrl = canonicalForRoute(DEFAULT_LOCALE, slug);
    assert.ok(
      html.includes(`hreflang="x-default" href="${xDefaultUrl}"`),
      `Expected ${relFile} to contain hreflang="x-default" pointing to ${xDefaultUrl}`,
    );

    // Runtime i18n data script island
    const i18nMatch = html.match(/<script id="orp-i18n-data" type="application\/json">([\s\S]*?)<\/script>/);
    assert.ok(i18nMatch, `Expected #orp-i18n-data in ${relFile}`);
    const i18nPayload = JSON.parse(i18nMatch[1]);
    assert.strictEqual(i18nPayload.locale, locale, `Expected #orp-i18n-data locale=${locale} in ${relFile}`);

    // Language selector markup + 12 options
    assert.ok(
      html.includes(`data-current-locale="${locale}"`),
      `Expected data-current-locale="${locale}" in ${relFile}`,
    );
    const optionCount = (html.match(/data-language-option="/g) || []).length;
    assert.strictEqual(optionCount, 12, `Expected 12 language options in ${relFile}`);

    // JSON-LD parses cleanly and specifies localized inLanguage
    const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(ldMatch, `Expected JSON-LD script in ${relFile}`);
    const parsedLd = JSON.parse(ldMatch[1]);
    assert.ok(Array.isArray(parsedLd) && parsedLd.length >= 3, `Expected JSON-LD array in ${relFile}`);
    const websiteNode = parsedLd.find((n) => n['@type'] === 'WebSite');
    assert.ok(websiteNode && websiteNode.inLanguage === meta.bcp47, `Expected WebSite inLanguage=${meta.bcp47} in ${relFile}`);

    // Non-English homepages genuinely translated title & h1
    if (slug === '/' && locale !== DEFAULT_LOCALE) {
      const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
      assert.ok(titleMatch && titleMatch[1] !== enTitleMatch[1], `Expected localized <title> for ${locale}`);
      assert.ok(h1Match && h1Match[1] !== enH1Match[1], `Expected localized <h1> for ${locale}`);
    }

    // Sitemap entry exists
    assert.ok(
      sitemapXml.includes(`<loc>${canonical}</loc>`),
      `Expected sitemap.xml to contain <loc>${canonical}</loc>`,
    );

    // Favicon & manifest tags present once each (no duplicates)
    for (const iconPath of [
      '/favicon.ico',
      '/favicon.svg',
      '/favicon-32x32.png',
      '/favicon-16x16.png',
      '/apple-touch-icon.png',
      '/site.webmanifest',
    ]) {
      const occurrences = html.split(`href="${iconPath}"`).length - 1;
      assert.strictEqual(occurrences, 1, `Expected single href="${iconPath}" in ${relFile}`);
    }
    assert.ok(html.includes('<meta name="theme-color"'), `Expected theme-color meta in ${relFile}`);

    // Internal hrefs resolve to valid localized routes
    const hrefMatches = html.matchAll(/href="(\/[^"]*)"/g);
    for (const m of hrefMatches) {
      const rawHref = m[1];
      if (
        rawHref.startsWith('/_astro/') ||
        rawHref.startsWith('/favicon') ||
        rawHref === '/apple-touch-icon.png' ||
        rawHref === '/site.webmanifest'
      ) {
        continue;
      }
      const cleanPath = rawHref.split('#')[0].split('?')[0] || '/';
      assert.ok(validPaths.has(cleanPath), `Broken internal link ${rawHref} in ${relFile}`);
    }
  }

  // Verify utility routes (e.g. /embed) exist cleanly with noindex and are excluded from sitemap
  for (const locale of LOCALES) {
    for (const utilSlug of UTILITY_SLUGS) {
      const relFile = distFileForRoute(locale, utilSlug);
      const canonical = canonicalForRoute(locale, utilSlug);
      const fullPath = path.join(distDir, relFile);
      assert.ok(fs.existsSync(fullPath), `Expected utility page ${relFile} to exist`);
      const html = fs.readFileSync(fullPath, 'utf-8');
      assert.ok(html.includes('content="noindex, follow"'), `Expected noindex meta in ${relFile}`);
      assert.ok(!html.includes('<header'), `Expected no header chrome in ${relFile}`);
      assert.ok(!html.includes('<footer'), `Expected no footer chrome in ${relFile}`);
      assert.ok(!sitemapXml.includes(`<loc>${canonical}</loc>`), `Expected ${canonical} excluded from sitemap`);
    }
  }
});

function readPngDimensions(filePath) {
  const buf = fs.readFileSync(filePath);
  assert.ok(buf.length > 24 && buf.toString('ascii', 1, 4) === 'PNG', `Expected valid PNG at ${filePath}`);
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
  };
}

test('Build output covers English blog index, 5 categories, 15+ articles, unique 1200x630 OG PNGs, JSON-LD & sitemap', (t) => {
  if (!fs.existsSync(distDir)) {
    t.skip('dist directory not yet built');
    return;
  }

  const BLOG_CATEGORY_SLUGS = [
    'ruler-fundamentals',
    'measuring-without-tools',
    'unit-conversions',
    'screen-calibration',
    'printable-practical',
  ];
  const blogContentDir = path.join(projectRoot, 'src', 'content', 'blog');
  const blogArticleSlugs = fs
    .readdirSync(blogContentDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));

  assert.ok(blogArticleSlugs.length >= 15, `Expected >= 15 Phase 1 articles, found ${blogArticleSlugs.length}`);

  const validPaths = new Set(['/blog']);
  for (const cat of BLOG_CATEGORY_SLUGS) validPaths.add(`/blog/${cat}`);
  for (const slug of blogArticleSlugs) validPaths.add(`/blog/${slug}`);
  for (const locale of LOCALES) {
    for (const slug of PAGE_SLUGS) validPaths.add(localizedPath(locale, slug));
    for (const utilSlug of UTILITY_SLUGS) validPaths.add(localizedPath(locale, utilSlug));
  }

  const blogRoutes = [
    { route: '/blog', kind: 'index' },
    ...BLOG_CATEGORY_SLUGS.map((cat) => ({ route: `/blog/${cat}`, kind: 'category' })),
    ...blogArticleSlugs.map((slug) => ({ route: `/blog/${slug}`, kind: 'article' })),
  ];

  const sitemapXml = fs.readFileSync(path.join(distDir, 'sitemap.xml'), 'utf-8');
  const seenTitles = new Set();
  const seenDescs = new Set();
  const seenOgImages = new Set();

  for (const { route, kind } of blogRoutes) {
    const relHtml = `${route.replace(/^\/+/, '')}.html`;
    const fullHtmlPath = path.join(distDir, relHtml);
    assert.ok(fs.existsSync(fullHtmlPath), `Expected built blog HTML ${relHtml}`);
    const html = fs.readFileSync(fullHtmlPath, 'utf-8');
    const canonical = `${SITE_ORIGIN}${route}`;

    assert.ok(
      html.includes(`<link rel="canonical" href="${canonical}">`),
      `Expected self-referencing canonical ${canonical} in ${relHtml}`,
    );
    assert.ok(
      html.includes(`<meta property="og:url" content="${canonical}">`),
      `Expected matching og:url ${canonical} in ${relHtml}`,
    );
    assert.ok(
      !html.includes('<link rel="alternate" hreflang='),
      `Expected no broken hreflang alternate links on English-only route ${relHtml}`,
    );
    const blogUrlBlockPattern = new RegExp(
      `<url>\\s*<loc>${canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>\\s*<lastmod>\\d{4}-\\d{2}-\\d{2}</lastmod>\\s*</url>`,
    );
    assert.match(
      sitemapXml,
      blogUrlBlockPattern,
      `Expected sitemap.xml to include clean <url> with <lastmod> and no bogus alternates for ${canonical}`,
    );

    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
    const descMatch = html.match(/<meta name="description" content="([^"]*)"/);
    const ogImgMatch = html.match(/<meta property="og:image" content="([^"]*)"/);
    assert.ok(titleMatch && titleMatch[1].trim().length > 10, `Expected <title> in ${relHtml}`);
    assert.ok(descMatch && descMatch[1].trim().length >= 80, `Expected <meta name="description"> in ${relHtml}`);
    assert.ok(ogImgMatch && ogImgMatch[1].startsWith(`${SITE_ORIGIN}/og/blog/`), `Expected unique /og/blog/*.png og:image in ${relHtml}`);

    assert.ok(!seenTitles.has(titleMatch[1]), `Duplicate <title> across blog routes: ${titleMatch[1]}`);
    assert.ok(!seenDescs.has(descMatch[1]), `Duplicate meta description across blog routes: ${descMatch[1]}`);
    assert.ok(!seenOgImages.has(ogImgMatch[1]), `Duplicate og:image across blog routes: ${ogImgMatch[1]}`);
    seenTitles.add(titleMatch[1]);
    seenDescs.add(descMatch[1]);
    seenOgImages.add(ogImgMatch[1]);

    const ogRelPath = ogImgMatch[1].replace(`${SITE_ORIGIN}/`, '');
    const ogDiskPath = path.join(distDir, ogRelPath);
    assert.ok(fs.existsSync(ogDiskPath), `Expected OG image ${ogRelPath} in dist/`);
    const dims = readPngDimensions(ogDiskPath);
    assert.deepStrictEqual(dims, { width: 1200, height: 630 }, `Expected 1200x630 PNG for ${ogRelPath}`);

    const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(ldMatch, `Expected JSON-LD script in ${relHtml}`);
    const parsedLd = JSON.parse(ldMatch[1]);
    assert.ok(Array.isArray(parsedLd), `Expected JSON-LD array in ${relHtml}`);

    if (kind === 'article') {
      assert.ok(parsedLd.some((n) => n['@type'] === 'Article'), `Expected Article schema in ${relHtml}`);
      assert.ok(parsedLd.some((n) => n['@type'] === 'BreadcrumbList'), `Expected BreadcrumbList schema in ${relHtml}`);
      assert.ok(html.includes('property="article:published_time"'), `Expected article:published_time in ${relHtml}`);
    } else if (kind === 'category') {
      assert.ok(parsedLd.some((n) => n['@type'] === 'CollectionPage'), `Expected CollectionPage schema in ${relHtml}`);
      assert.ok(parsedLd.some((n) => n['@type'] === 'BreadcrumbList'), `Expected BreadcrumbList schema in ${relHtml}`);
    } else {
      assert.ok(parsedLd.some((n) => n['@type'] === 'CollectionPage'), `Expected CollectionPage schema in ${relHtml}`);
    }

    const hrefMatches = html.matchAll(/href="(\/[^"]*)"/g);
    for (const m of hrefMatches) {
      const rawHref = m[1];
      if (
        rawHref.startsWith('/_astro/') ||
        rawHref.startsWith('/favicon') ||
        rawHref === '/apple-touch-icon.png' ||
        rawHref === '/site.webmanifest'
      ) {
        continue;
      }
      const cleanPath = rawHref.split('#')[0].split('?')[0] || '/';
      assert.ok(validPaths.has(cleanPath), `Broken internal link ${rawHref} in ${relHtml}`);
    }
  }
});

test('Technical SEO: single sitemap.xml, compliant robots.txt, _headers, branded 404, WebApplication offers & zero orphans', (t) => {
  if (!fs.existsSync(distDir)) {
    t.skip('dist directory not yet built');
    return;
  }

  // 1. robots.txt compliance
  const robotsTxt = fs.readFileSync(path.join(distDir, 'robots.txt'), 'utf-8');
  assert.ok(robotsTxt.includes('User-agent: Googlebot'), 'robots.txt should explicitly allow Googlebot');
  assert.ok(robotsTxt.includes('User-agent: Googlebot-Image'), 'robots.txt should allow Googlebot-Image');
  assert.ok(robotsTxt.includes('User-agent: Mediapartners-Google'), 'robots.txt should allow Mediapartners-Google');
  assert.ok(robotsTxt.includes('User-agent: AdsBot-Google'), 'robots.txt should allow AdsBot-Google');
  assert.ok(robotsTxt.includes('Sitemap: https://onlinerulerplus.com/sitemap.xml'), 'robots.txt must reference /sitemap.xml');
  assert.ok(!robotsTxt.includes('sitemap-index.xml'), 'robots.txt must not reference removed sitemap-index.xml');
  assert.ok(!/^Disallow:\s*\/(_astro|assets|blog|embed)/im.test(robotsTxt), 'robots.txt must not block CSS/JS/blog/embed');

  // 2. _headers security, embed framing & .pages.dev noindex rules
  const headersFile = fs.readFileSync(path.join(distDir, '_headers'), 'utf-8');
  assert.ok(headersFile.includes('X-Content-Type-Options: nosniff'), '_headers must set X-Content-Type-Options');
  assert.ok(headersFile.includes('X-Frame-Options: SAMEORIGIN'), '_headers must set SAMEORIGIN globally');
  assert.ok(
    headersFile.includes('/embed\n  ! X-Frame-Options') ||
      headersFile.includes('/embed\r\n  ! X-Frame-Options'),
    '_headers must detach X-Frame-Options on /embed',
  );
  assert.ok(
    headersFile.includes('https://onlinerulerplus.pages.dev/*\n  X-Robots-Tag: noindex') ||
      headersFile.includes('https://onlinerulerplus.pages.dev/*\r\n  X-Robots-Tag: noindex'),
    '_headers must add X-Robots-Tag: noindex for onlinerulerplus.pages.dev',
  );
  assert.ok(
    headersFile.includes('https://:version.onlinerulerplus.pages.dev/*\n  X-Robots-Tag: noindex') ||
      headersFile.includes('https://:version.onlinerulerplus.pages.dev/*\r\n  X-Robots-Tag: noindex'),
    '_headers must add X-Robots-Tag: noindex for preview subdomains on onlinerulerplus.pages.dev',
  );
  assert.doesNotMatch(
    headersFile,
    /^\/\*\r?\n(?:  [^\r\n]+\r?\n)*  X-Robots-Tag:\s*noindex/m,
    '_headers must never apply X-Robots-Tag: noindex globally to onlinerulerplus.com',
  );

  // 3. Branded 404.html (noindex, nofollow, no canonical, search & links)
  const html404 = fs.readFileSync(path.join(distDir, '404.html'), 'utf-8');
  assert.ok(html404.includes('content="noindex, nofollow"'), '404.html must include noindex, nofollow');
  assert.ok(!html404.includes('<link rel="canonical"'), '404.html must omit canonical link');
  assert.ok(!html404.includes('property="og:url"'), '404.html must omit og:url');
  assert.ok(html404.includes('data-404-search'), '404.html must include search input');
  assert.ok(html404.includes('href="/blog"'), '404.html must link to /blog');

  // 4. WebApplication offers & speakable on all tool routes
  for (const toolSlug of ['circle-ruler', 'quadrant', 'printable-ruler', 'screen-size-detector']) {
    const html = fs.readFileSync(path.join(distDir, `${toolSlug}.html`), 'utf-8');
    const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(ldMatch, `Expected JSON-LD on ${toolSlug}`);
    const nodes = JSON.parse(ldMatch[1]);
    const app = nodes.find((n) => n['@type'] === 'WebApplication');
    assert.ok(app, `Expected WebApplication schema on ${toolSlug}`);
    assert.ok(app.offers && app.offers.price === '0', `Expected free Offer schema on ${toolSlug}`);
    assert.ok(app.browserRequirements, `Expected browserRequirements on ${toolSlug}`);
    assert.ok(app.speakable, `Expected speakable on ${toolSlug}`);
  }

  // 5. Full internal link graph BFS from '/' reaches all 249 indexable pages (zero orphans)
  const sitemapXml = fs.readFileSync(path.join(distDir, 'sitemap.xml'), 'utf-8');
  const sitemapLocs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.strictEqual(sitemapLocs.length, 249, `Expected 249 URLs in sitemap.xml, found ${sitemapLocs.length}`);

  const visited = new Set(['/']);
  const queue = ['/'];
  while (queue.length > 0) {
    const route = queue.shift();
    const rel = route === '/' ? 'index.html' : `${route.replace(/^\/+/, '')}.html`;
    const filePath = path.join(distDir, rel);
    if (!fs.existsSync(filePath)) continue;
    const html = fs.readFileSync(filePath, 'utf-8');
    for (const m of html.matchAll(/href="(\/[^"]*)"/g)) {
      const target = m[1].split('#')[0].split('?')[0] || '/';
      if (
        target.startsWith('/_astro/') ||
        target.startsWith('/favicon') ||
        target === '/apple-touch-icon.png' ||
        target === '/site.webmanifest' ||
        target.endsWith('/embed') ||
        target === '/embed'
      ) {
        continue;
      }
      if (!visited.has(target)) {
        visited.add(target);
        queue.push(target);
      }
    }
  }

  for (const loc of sitemapLocs) {
    const pathOnly = new URL(loc).pathname;
    assert.ok(visited.has(pathOnly), `Orphaned sitemap URL not reachable from internal HTML links: ${pathOnly}`);
  }
});

test('Cloudflare Pages middleware permanently redirects *.pages.dev and www to canonical apex domain', async () => {
  const { onRequest } = await import('../functions/_middleware.js');
  const nextSentinel = new Response('ok', { status: 200 });

  for (const [inputUrl, expectedLocation, expectNoIndex] of [
    ['https://onlinerulerplus.pages.dev/', 'https://onlinerulerplus.com/', true],
    ['https://onlinerulerplus.pages.dev/cm-ruler?u=mm', 'https://onlinerulerplus.com/cm-ruler?u=mm', true],
    ['https://eea1dcc0.onlinerulerplus.pages.dev/blog', 'https://onlinerulerplus.com/blog', true],
    ['https://www.onlinerulerplus.com/inch-ruler', 'https://onlinerulerplus.com/inch-ruler', false],
  ]) {
    let calledNext = false;
    const res = await onRequest({
      request: new Request(inputUrl),
      next: async () => {
        calledNext = true;
        return nextSentinel;
      },
    });
    assert.strictEqual(calledNext, false, `Expected middleware to short-circuit ${inputUrl}`);
    assert.strictEqual(res.status, 301, `Expected 301 redirect for ${inputUrl}`);
    assert.strictEqual(res.headers.get('location'), expectedLocation);
    assert.strictEqual(res.headers.get('x-robots-tag'), expectNoIndex ? 'noindex' : null);
  }

  let canonicalCalledNext = false;
  const canonicalRes = await onRequest({
    request: new Request('https://onlinerulerplus.com/cm-ruler'),
    next: async () => {
      canonicalCalledNext = true;
      return nextSentinel;
    },
  });
  assert.strictEqual(canonicalCalledNext, true, 'Canonical apex host must pass through to static assets');
  assert.strictEqual(canonicalRes.status, 200);
});
