import { test, expect } from '@playwright/test';

const SITE_ORIGIN = 'https://onlinerulerplus.com';

test.describe('Technical SEO, Crawling, Indexing & Error Handling', () => {
  test('robots.txt and single /sitemap.xml return 200 with valid content types and all 249 indexable URLs return HTTP 200', async ({
    request,
  }) => {
    const robotsRes = await request.get('/robots.txt');
    expect(robotsRes.status()).toBe(200);
    expect(robotsRes.headers()['content-type']).toContain('text/plain');
    const robotsText = await robotsRes.text();
    expect(robotsText).toContain('User-agent: Googlebot');
    expect(robotsText).toContain('User-agent: Mediapartners-Google');
    expect(robotsText).toContain('User-agent: AdsBot-Google');
    expect(robotsText).toContain(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`);
    expect(robotsText).not.toContain('sitemap-index.xml');

    const oldSitemapRes = await request.get('/sitemap-index.xml');
    expect(oldSitemapRes.status()).toBe(404);

    const sitemapRes = await request.get('/sitemap.xml');
    expect(sitemapRes.status()).toBe(200);
    expect(sitemapRes.headers()['content-type']).toMatch(/xml/i);
    const xml = await sitemapRes.text();
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(xml).not.toContain('<sitemapindex');

    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBe(249);

    for (const loc of locs) {
      const pathOnly = new URL(loc).pathname;
      const res = await request.get(pathOnly, { maxRedirects: 0 });
      expect(res.status(), `Expected 200 without redirect for ${pathOnly}`).toBe(200);
    }
  });

  test('Canonical URLs, robots meta, JSON-LD, and AdSense trust pages pass on core routes', async ({
    page,
  }) => {
    const routesToCheck = [
      '/',
      '/cm-ruler',
      '/inch-ruler',
      '/mm-ruler',
      '/circle-ruler',
      '/quadrant',
      '/printable-ruler',
      '/screen-size-detector',
      '/es',
      '/es/cm-ruler',
      '/about',
      '/contact',
      '/privacy',
      '/terms',
      '/blog',
      '/blog/ruler-fundamentals',
      '/blog/how-to-read-a-ruler-inches-and-cm',
    ];

    for (const route of routesToCheck) {
      const errors: string[] = [];
      const pageErrHandler = (e: Error) => errors.push(e.message);
      page.on('pageerror', pageErrHandler);

      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), `HTTP status for ${route}`).toBe(200);

      const expectedCanonical = route === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${route}`;
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBe(expectedCanonical);

      const robotsMeta = await page.locator('meta[name="robots"]').getAttribute('content');
      expect(robotsMeta).toBe('index, follow');

      const ldText = await page.locator('script[type="application/ld+json"]').first().textContent();
      expect(() => JSON.parse(ldText || '')).not.toThrow();

      expect(errors, `Runtime errors on ${route}`).toEqual([]);
      page.off('pageerror', pageErrHandler);
    }
  });

  test('Utility /embed route renders with noindex and nonexistent URLs return HTTP 404 with interactive search', async ({
    page,
    request,
  }) => {
    const embedRes = await request.get('/embed');
    expect(embedRes.status()).toBe(200);
    const embedHtml = await embedRes.text();
    expect(embedHtml).toContain('content="noindex, follow"');

    const badRes = await page.goto('/nonexistent-technical-seo-route-12345', {
      waitUntil: 'domcontentloaded',
    });
    expect(badRes?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText('Page Not Found');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);

    const searchInput = page.locator('[data-404-search]');
    await searchInput.fill('protractor');
    await expect(page.locator('[data-404-results] a[href="/protractor"]')).toBeVisible();
  });
});
