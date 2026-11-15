import { test, expect } from '@playwright/test';

const TARGET_VIEWPORTS = [320, 360, 375, 390, 393, 414, 430, 480, 768, 1024, 1280, 1440, 1920] as const;

const AUDIT_ROUTES = [
  '/',
  '/circle-ruler',
  '/protractor',
  '/photo-ruler',
  '/printable-ruler',
  '/screen-size-detector',
  '/how-to-use',
  '/faq',
  '/contact',
  '/blog',
  '/blog/how-to-read-a-ruler-inches-and-cm',
  '/nonexistent-mobile-check-404',
] as const;

test.describe('Mobile Responsiveness & Touch UX Matrix', () => {
  test('all 12 core routes render cleanly across all 13 viewports without horizontal overflow, clipped elements, or broken media', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const consoleErrors: string[] = [];
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    for (const route of AUDIT_ROUTES) {
      await page.setViewportSize({ width: 320, height: 844 });
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(80);

      for (const width of TARGET_VIEWPORTS) {
        await page.setViewportSize({ width, height: 844 });
        await page.evaluate(
          () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
        );

        const metrics = await page.evaluate(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const overflowX = Math.max(docEl.scrollWidth, body.scrollWidth) - docEl.clientWidth;

          const clippedInteractive: string[] = [];
          const overflowMedia: string[] = [];
          const brokenImages: string[] = [];

          document.querySelectorAll('img').forEach((img) => {
            if (img.complete && img.naturalWidth === 0) {
              brokenImages.push(img.getAttribute('src') || 'img');
            }
          });

          if (window.innerWidth <= 768) {
            document.querySelectorAll('a, button, input, select, textarea, summary').forEach((el) => {
              const rect = el.getBoundingClientRect();
              if (rect.width === 0 || rect.height === 0) return;
              const style = getComputedStyle(el);
              if (style.visibility === 'hidden' || style.display === 'none') return;
              if (el.closest('[hidden]')) return;
              if (rect.right > window.innerWidth + 2 && !el.closest('[class*="overflow-x-auto"]')) {
                clippedInteractive.push(`${el.tagName}#${el.id || ''}`);
              }
            });

            document.querySelectorAll('img, svg, table').forEach((el) => {
              const r = el.getBoundingClientRect();
              if (r.width > 0 && r.right > window.innerWidth + 2 && !el.closest('[class*="overflow-x-auto"]')) {
                const style = getComputedStyle(el);
                if (el.tagName === 'TABLE' && style.overflowX === 'auto') return;
                overflowMedia.push(`${el.tagName}#${el.id || ''}`);
              }
            });
          }

          return { overflowX, clippedInteractive, overflowMedia, brokenImages };
        });

        expect(metrics.overflowX, `${route} at ${width}px overflowX`).toBeLessThanOrEqual(1);
        expect(metrics.clippedInteractive, `${route} at ${width}px clipped interactive`).toEqual([]);
        expect(metrics.overflowMedia, `${route} at ${width}px overflowing media`).toEqual([]);
        expect(metrics.brokenImages, `${route} at ${width}px broken images`).toEqual([]);
      }
    }

    expect(consoleErrors).toEqual([]);
  });

  test('touch ergonomics, mobile overlays, protractor 44px actions, and interactive controls behave reliably', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Mobile drawer toggle & 44px links
    await page.locator('[data-mobile-menu-toggle]').tap();
    const navTray = page.locator('#mobile-nav-tray');
    await expect(navTray).toBeVisible();
    const firstLinkBox = await navTray.locator('a').first().boundingBox();
    expect(firstLinkBox?.height ?? 0).toBeGreaterThanOrEqual(44);
    await page.locator('[data-mobile-menu-toggle]').tap();
    await expect(navTray).toBeHidden();

    // Language dropdown remains inside viewport
    await page.locator('[data-language-trigger]').tap();
    const langMenu = page.locator('[data-language-menu]');
    await expect(langMenu).toBeVisible();
    const langBox = await langMenu.boundingBox();
    expect(langBox?.x ?? -1).toBeGreaterThanOrEqual(0);
    expect((langBox?.x ?? 0) + (langBox?.width ?? 0)).toBeLessThanOrEqual(375);
    await page.keyboard.press('Escape');
    await expect(langMenu).toBeHidden();

    // Help shortcuts modal stays within viewport without overflow
    await page.locator('[data-help-toggle]').tap();
    const helpModal = page.locator('#help-shortcuts-modal');
    await expect(helpModal).toBeVisible();
    const helpOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(helpOverflow).toBeLessThanOrEqual(1);
    await page.locator('#help-shortcuts-modal [data-help-close]').first().tap();
    await expect(helpModal).toBeHidden();

    // Touch unit switching & protractor 44x44 actions on /protractor
    await page.goto('/protractor', { waitUntil: 'domcontentloaded' });
    const modeBtnBox = await page.locator('#btn-protractor-mode').boundingBox();
    expect(modeBtnBox?.height ?? 0).toBeGreaterThanOrEqual(44);
    await page.locator('#btn-protractor-mode').tap();

    // Circle ruler input & filter chips on mobile
    await page.goto('/circle-ruler', { waitUntil: 'domcontentloaded' });
    const diameterBox = await page.locator('#circle-diameter-input').boundingBox();
    expect(diameterBox?.height ?? 0).toBeGreaterThanOrEqual(44);

    // 404 search filtering on mobile
    await page.goto('/nonexistent-mobile-check-404', { waitUntil: 'domcontentloaded' });
    const searchInput = page.locator('#notfound-search');
    await expect(searchInput).toBeVisible();
    const searchBox = await searchInput.boundingBox();
    expect(searchBox?.height ?? 0).toBeGreaterThanOrEqual(44);
    await searchInput.fill('protractor');
    const visibleResults = page.locator('[data-404-results] li:not([hidden]) a');
    await expect(visibleResults.first()).toContainText(/Protractor/i);

    await context.close();
  });

  test('mobile CLS stays <= 0.1 during initial load across homepage, circle gauge, and editorial article', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();

    for (const route of ['/', '/circle-ruler', '/blog/how-to-read-a-ruler-inches-and-cm']) {
      await page.addInitScript(() => {
        (window as unknown as { __testCls: number }).__testCls = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const ls = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
            if (!ls.hadRecentInput) {
              (window as unknown as { __testCls: number }).__testCls += ls.value ?? 0;
            }
          }
        }).observe({ type: 'layout-shift', buffered: true });
      });

      await page.goto(route, { waitUntil: 'load' });
      await page.waitForTimeout(300);
      const cls = await page.evaluate(() => (window as unknown as { __testCls: number }).__testCls);
      expect(cls, `${route} CLS`).toBeLessThanOrEqual(0.1);
    }

    await context.close();
  });
});
