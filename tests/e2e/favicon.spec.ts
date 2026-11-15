import { test, expect } from '@playwright/test';

const FAVICON_ASSETS = [
  { path: '/favicon.ico', width: 48, height: 48, checkExactSize: false },
  { path: '/favicon.svg', width: 32, height: 32, checkExactSize: false },
  { path: '/favicon-16x16.png', width: 16, height: 16, checkExactSize: true },
  { path: '/favicon-32x32.png', width: 32, height: 32, checkExactSize: true },
  { path: '/apple-touch-icon.png', width: 180, height: 180, checkExactSize: true },
  { path: '/android-chrome-192x192.png', width: 192, height: 192, checkExactSize: true },
  { path: '/android-chrome-512x512.png', width: 512, height: 512, checkExactSize: true },
] as const;

for (const viewport of [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 375, height: 667 },
]) {
  test.describe(`Favicon & webmanifest (${viewport.name})`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test('renders non-duplicate favicon, theme-color, and manifest metadata with valid image assets', async ({
      page,
      request,
    }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      for (const route of ['/', '/es', '/ja']) {
        await page.goto(route, { waitUntil: 'networkidle' });

        // Verify <head> link tags and absence of duplicates
        const headMeta = await page.evaluate(() => {
          const iconLinks = Array.from(document.querySelectorAll('head link[rel="icon"]')).map((el) => ({
            href: el.getAttribute('href'),
            type: el.getAttribute('type'),
            sizes: el.getAttribute('sizes'),
          }));
          const appleLinks = Array.from(document.querySelectorAll('head link[rel="apple-touch-icon"]')).map((el) => ({
            href: el.getAttribute('href'),
            sizes: el.getAttribute('sizes'),
          }));
          const manifestLinks = Array.from(document.querySelectorAll('head link[rel="manifest"]')).map((el) =>
            el.getAttribute('href'),
          );
          const themeColors = Array.from(document.querySelectorAll('head meta[name="theme-color"]')).map((el) => ({
            media: el.getAttribute('media'),
            content: el.getAttribute('content'),
          }));
          return { iconLinks, appleLinks, manifestLinks, themeColors };
        });

        expect(headMeta.iconLinks).toEqual([
          { href: '/favicon.ico', type: null, sizes: '48x48' },
          { href: '/favicon.svg', type: 'image/svg+xml', sizes: null },
          { href: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
          { href: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
        ]);
        expect(headMeta.appleLinks).toEqual([{ href: '/apple-touch-icon.png', sizes: '180x180' }]);
        expect(headMeta.manifestLinks).toEqual(['/site.webmanifest']);
        expect(headMeta.themeColors).toEqual([
          { media: '(prefers-color-scheme: light)', content: '#ffffff' },
          { media: '(prefers-color-scheme: dark)', content: '#000000' },
        ]);
      }

      // Verify manifest JSON & HTTP status for all 8 assets
      const manifestRes = await request.get('/site.webmanifest');
      expect(manifestRes.status()).toBe(200);
      const manifest = await manifestRes.json();
      expect(manifest.name).toBe('OnlineRulerPlus.com');
      expect(manifest.short_name).toBe('Online Ruler');
      expect(manifest.start_url).toBe('/');
      expect(manifest.icons.map((i: { src: string; sizes: string }) => [i.src, i.sizes])).toEqual([
        ['/android-chrome-192x192.png', '192x192'],
        ['/android-chrome-512x512.png', '512x512'],
      ]);

      // Verify SVG markup validity
      const svgRes = await request.get('/favicon.svg');
      expect(svgRes.status()).toBe(200);
      const svgBody = await svgRes.text();
      expect(svgBody).toContain('viewBox="0 0 32 32"');
      expect(svgBody).toContain('#2997ff');

      // Verify every icon asset returns 200 OK and actually decodes in browser <img>
      await page.goto('/', { waitUntil: 'networkidle' });
      for (const asset of FAVICON_ASSETS) {
        const res = await request.get(asset.path);
        expect(res.status(), `HTTP 200 for ${asset.path}`).toBe(200);

        const decoded = await page.evaluate(async (src) => {
          return new Promise<{ complete: boolean; naturalWidth: number; naturalHeight: number }>((resolve, reject) => {
            const img = new Image();
            img.onload = () =>
              resolve({ complete: img.complete, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight });
            img.onerror = () => reject(new Error(`Failed to decode ${src}`));
            img.src = src;
          });
        }, asset.path);

        expect(decoded.complete, `${asset.path} complete`).toBe(true);
        expect(decoded.naturalWidth, `${asset.path} naturalWidth`).toBeGreaterThan(0);
        expect(decoded.naturalHeight, `${asset.path} naturalHeight`).toBeGreaterThan(0);
        if (asset.checkExactSize) {
          expect(decoded.naturalWidth, `${asset.path} exact width`).toBe(asset.width);
          expect(decoded.naturalHeight, `${asset.path} exact height`).toBe(asset.height);
        }
      }

      expect(consoleErrors).toEqual([]);
    });
  });
}
