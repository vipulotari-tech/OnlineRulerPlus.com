import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const CATEGORY_SLUGS = [
  'ruler-fundamentals',
  'measuring-without-tools',
  'unit-conversions',
  'screen-calibration',
  'printable-practical',
];

const ARTICLE_SLUGS = [
  'how-to-read-a-ruler-inches-and-cm',
  'ruler-tick-marks-explained-1-8-1-16-1-32',
  'how-to-show-ruler-word-online-powerpoint-online',
  'how-to-measure-without-a-ruler',
  'can-i-use-my-phone-as-a-ruler',
  'can-you-use-camera-as-a-ruler',
  'how-many-cm-in-an-inch-and-12-inch-ruler',
  'mm-to-inches-fraction-conversion-chart',
  'cm-to-inches-on-a-ruler-guide',
  'why-online-rulers-need-calibration-96-ppi',
  'how-to-calibrate-online-ruler-credit-card',
  'windows-macos-display-scaling-screen-ruler',
  'how-to-print-actual-size-ruler-100-percent-scale',
  'measuring-packages-boxes-shipping-usps-royal-mail',
  'how-to-measure-angles-with-online-protractor',
];

test.describe('Blog, Editorial SEO, Open Graph & FAQ Isolation', () => {
  test('Homepage SEO metadata, ~600-word #how-it-works copy & Microsoft Office FAQ isolation', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/', { waitUntil: 'networkidle' });

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://onlinerulerplus.com/');
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://onlinerulerplus.com/');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://onlinerulerplus.com/og-image.png');
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');

    const howText = (await page.locator('#how-it-works').textContent()) ?? '';
    const howWords = howText.trim().split(/\s+/).filter(Boolean).length;
    expect(howWords).toBeGreaterThanOrEqual(520);

    // Microsoft Office questions were intentionally isolated off the homepage onto /faq and the blog guide
    const faqText = (await page.locator('#faq').textContent()) ?? '';
    expect(faqText).not.toMatch(/Word Online/i);
    expect(faqText).not.toMatch(/PowerPoint Online/i);

    await page.goto('/faq', { waitUntil: 'networkidle' });
    const fullFaqText = (await page.locator('main').textContent()) ?? '';
    expect(fullFaqText).toMatch(/Word Online/i);
    expect(fullFaqText).toMatch(/PowerPoint Online/i);

    expect(errors).toEqual([]);
  });

  test('/blog index renders search, category filters, metadata, OG tags & passes Axe WCAG', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/blog', { waitUntil: 'networkidle' });

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://onlinerulerplus.com/blog');
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://onlinerulerplus.com/blog');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://onlinerulerplus.com/og/blog/index.png');
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);

    const gridCards = page.locator('#blog-article-grid > article');
    await expect(gridCards).toHaveCount(15);

    // Interactive category filter chip
    await page.click('[data-blog-filter="screen-calibration"]');
    await expect(page.locator('#blog-results-count')).toContainText('Showing 3 of 15');

    // Reset filter and test search
    await page.click('[data-blog-filter="all"]');
    await page.fill('#blog-search-input', 'PowerPoint');
    await expect(page.locator('#blog-results-count')).toContainText('Showing 1 of 15');

    await page.fill('#blog-search-input', '');
    await expect(page.locator('#blog-results-count')).toContainText('Showing 15 of 15');

    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations, JSON.stringify(axe.violations, null, 2)).toEqual([]);
    expect(errors).toEqual([]);
  });

  for (const category of CATEGORY_SLUGS) {
    test(`Category archive /blog/${category} renders canonical, unique OG, JSON-LD & passes Axe`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));

      const res = await page.goto(`/blog/${category}`, { waitUntil: 'networkidle' });
      expect(res?.status()).toBe(200);

      const expectedUrl = `https://onlinerulerplus.com/blog/${category}`;
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', expectedUrl);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', expectedUrl);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        'content',
        `https://onlinerulerplus.com/og/blog/cat-${category}.png`,
      );
      await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();

      const ldJsonRaw = await page.locator('script[type="application/ld+json"]').first().textContent();
      const ldJson = JSON.parse(ldJsonRaw || '[]');
      expect(ldJson.some((node: { '@type'?: string }) => node['@type'] === 'CollectionPage')).toBe(true);
      expect(ldJson.some((node: { '@type'?: string }) => node['@type'] === 'BreadcrumbList')).toBe(true);

      const axe = await new AxeBuilder({ page }).analyze();
      expect(axe.violations, JSON.stringify(axe.violations, null, 2)).toEqual([]);
      expect(errors).toEqual([]);
    });
  }

  test('All 15 blog articles render diagrams, TOC, FAQs, unique OG/canonical, JSON-LD & zero broken images', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    const seenOg = new Set<string>();

    for (const slug of ARTICLE_SLUGS) {
      const res = await page.goto(`/blog/${slug}`, { waitUntil: 'networkidle' });
      expect(res?.status(), `Expected HTTP 200 for /blog/${slug}`).toBe(200);

      const expectedUrl = `https://onlinerulerplus.com/blog/${slug}`;
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('.speakable-summary')).toBeVisible();
      await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();

      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', expectedUrl);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', expectedUrl);
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');

      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
      expect(ogImage).toBe(`https://onlinerulerplus.com/og/blog/${slug}.png`);
      expect(seenOg.has(ogImage!)).toBe(false);
      seenOg.add(ogImage!);

      // Verify diagram <img> loaded cleanly without broken asset
      const imgLoaded = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('article img'));
        return imgs.length > 0 && imgs.every((img) => img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0);
      });
      expect(imgLoaded, `Expected hero diagram loaded on /blog/${slug}`).toBe(true);

      // Verify FAQs & TOC render
      await expect(page.locator('#article-faqs details').first()).toBeVisible();
      await expect(page.locator('aside a[href^="#"]').first()).toBeVisible();

      // Verify Article + BreadcrumbList JSON-LD
      const ldJsonRaw = await page.locator('script[type="application/ld+json"]').first().textContent();
      const ldJson = JSON.parse(ldJsonRaw || '[]');
      expect(ldJson.some((n: { '@type'?: string }) => n['@type'] === 'Article')).toBe(true);
      expect(ldJson.some((n: { '@type'?: string }) => n['@type'] === 'BreadcrumbList')).toBe(true);
    }

    expect(errors).toEqual([]);
  });

  test('Mobile (375x667) & Desktop (1440x900) layout has zero horizontal overflow and passes Axe WCAG on sample articles', async ({ page }) => {
    const sampleRoutes = [
      '/blog',
      '/blog/how-to-read-a-ruler-inches-and-cm',
      '/blog/how-to-show-ruler-word-online-powerpoint-online',
      '/blog/measuring-packages-boxes-shipping-usps-royal-mail',
    ];

    for (const route of sampleRoutes) {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route, { waitUntil: 'networkidle' });
      const desktopOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      );
      expect(desktopOverflow, `Desktop overflow detected on ${route}`).toBe(false);

      const axe = await new AxeBuilder({ page }).analyze();
      expect(axe.violations, JSON.stringify(axe.violations, null, 2)).toEqual([]);

      await page.setViewportSize({ width: 375, height: 667 });
      const mobileOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      );
      expect(mobileOverflow, `Mobile overflow detected on ${route}`).toBe(false);
    }
  });

  test('XML sitemap includes /blog, all 5 category archives, and all 15 Phase 1 articles without broken alternates', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.ok()).toBe(true);
    const xml = await res.text();

    expect(xml).toMatch(/<url>\s*<loc>https:\/\/onlinerulerplus\.com\/blog<\/loc>\s*<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>\s*<\/url>/);
    for (const category of CATEGORY_SLUGS) {
      expect(xml).toMatch(new RegExp(`<url>\\s*<loc>https://onlinerulerplus\\.com/blog/${category}</loc>\\s*<lastmod>\\d{4}-\\d{2}-\\d{2}</lastmod>\\s*</url>`));
    }
    for (const slug of ARTICLE_SLUGS) {
      expect(xml).toMatch(new RegExp(`<url>\\s*<loc>https://onlinerulerplus\\.com/blog/${slug}</loc>\\s*<lastmod>\\d{4}-\\d{2}-\\d{2}</lastmod>\\s*</url>`));
    }
  });
});
