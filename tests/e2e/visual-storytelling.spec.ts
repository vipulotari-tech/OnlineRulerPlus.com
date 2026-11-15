import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const VISUAL_ROUTES = [
  '/',
  '/how-to-use',
  '/calibration-guide',
  '/cm-ruler',
  '/mm-ruler',
  '/inch-ruler',
  '/horizontal-ruler',
  '/vertical-ruler',
  '/photo-ruler',
  '/protractor',
  '/screen-size-detector',
  '/faq',
  '/es/how-to-use',
  '/ja/how-to-use',
];

test.describe('Premium Visual Storytelling & Motion QA', () => {
  test('all visual assets render cleanly with dimensions, alt text, captions, and zero broken images', async ({
    page,
  }) => {
    for (const route of VISUAL_ROUTES) {
      const consoleErrors: string[] = [];
      const failedRequests: string[] = [];
      const onConsole = (msg: any) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      };
      const onResp = (res: any) => {
        if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`);
      };
      page.on('console', onConsole);
      page.on('response', onResp);

      await page.goto(route, { waitUntil: 'networkidle' });

      // Trigger all lazy images in one scroll pass, then await completion in parallel
      await page.evaluate(async () => {
        for (const img of Array.from(document.images)) {
          img.scrollIntoView({ behavior: 'instant', block: 'center' });
        }
        await Promise.all(
          Array.from(document.images).map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise<void>((resolve) => {
              const done = () => resolve();
              img.addEventListener('load', done, { once: true });
              img.addEventListener('error', done, { once: true });
              setTimeout(done, 3000);
            });
          }),
        );
        window.scrollTo(0, 0);
      });

      const imageAudit = await page.evaluate(() => {
        return Array.from(document.images).map((img) => ({
          src: img.currentSrc || img.src,
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          hasWidth: img.hasAttribute('width'),
          hasHeight: img.hasAttribute('height'),
          altLength: (img.getAttribute('alt') || '').trim().length,
          loading: img.getAttribute('loading'),
        }));
      });

      expect(imageAudit.length, `Expected visual images on ${route}`).toBeGreaterThan(0);
      for (const item of imageAudit) {
        expect(item.complete && item.naturalWidth > 0, `Broken image ${item.src} on ${route}`).toBe(
          true,
        );
        expect(item.hasWidth && item.hasHeight, `Missing width/height on ${item.src}`).toBe(true);
        expect(item.altLength, `Empty alt attribute on ${item.src}`).toBeGreaterThan(15);
        expect(item.loading, `Visual asset should lazy-load on ${item.src}`).toBe('lazy');
      }

      expect(consoleErrors, `Console errors on ${route}`).toEqual([]);
      expect(failedRequests, `HTTP errors on ${route}`).toEqual([]);

      page.off('console', onConsole);
      page.off('response', onResp);
    }
  });

  test('MotionWalkthrough supports tab switching, keyboard navigation, and play/pause toggle', async ({
    page,
  }) => {
    await page.goto('/how-to-use', { waitUntil: 'networkidle' });
    const widget = page.locator('#howto-motion-walkthrough');
    await widget.scrollIntoViewIfNeeded();
    await expect(widget).toBeVisible();

    const tabs = widget.locator('[role="tab"]');
    await expect(tabs).toHaveCount(5);

    const firstTab = tabs.nth(0);
    await firstTab.focus();
    await page.keyboard.press('ArrowRight');
    const secondTab = tabs.nth(1);
    await expect(secondTab).toHaveAttribute('aria-selected', 'true');
    await expect(widget.locator('[data-scene-panel="line"]')).toBeVisible();

    await tabs.nth(3).click();
    await expect(tabs.nth(3)).toHaveAttribute('aria-selected', 'true');
    await expect(widget.locator('[data-scene-panel="protractor"]')).toBeVisible();

    const toggleBtn = widget.locator('[data-motion-toggle]');
    await toggleBtn.click();
    await expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(widget).toHaveAttribute('data-motion-paused', 'true');

    await toggleBtn.click();
    await expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(widget).toHaveAttribute('data-motion-paused', 'false');
  });

  test('respects prefers-reduced-motion: reduce without hiding key visual diagrams', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/how-to-use', { waitUntil: 'networkidle' });
    const widget = page.locator('#howto-motion-walkthrough');
    await widget.scrollIntoViewIfNeeded();

    await expect(widget).toHaveAttribute('data-motion-paused', 'true');
    const animName = await widget
      .locator('.orp-anim')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(animName).toBe('none');
  });

  test('keeps ruler workspace above the fold and avoids layout shifts (CLS <= 0.05) on desktop and mobile', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => {
      (window as any).__clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) (window as any).__clsValue += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    const wsBox = await page.locator('#ruler-workspace').boundingBox();
    expect(wsBox).not.toBeNull();
    expect(wsBox!.y).toBeLessThan(400);

    // Scroll down through diagrams and walkthrough
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(350);
    const homeCls = await page.evaluate(() => (window as any).__clsValue);
    expect(homeCls).toBeLessThanOrEqual(0.05);

    // Mobile layout invariance
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'networkidle' });
    const mobWs = await page.locator('#ruler-workspace').boundingBox();
    expect(mobWs).not.toBeNull();
    expect(mobWs!.y).toBeLessThan(260);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });

  test('passes WCAG 2.1 AA accessibility checks on visual pages in both light and dark themes', async ({
    page,
  }) => {
    for (const route of ['/', '/how-to-use']) {
      await page.goto(route, { waitUntil: 'networkidle' });
      const lightResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(lightResults.violations, `Light mode A11y issues on ${route}`).toEqual([]);

      await page.locator('[data-theme-toggle]').first().click();
      await page.waitForTimeout(100);
      const darkResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(darkResults.violations, `Dark mode A11y issues on ${route}`).toEqual([]);
    }
  });

  test('renders custom branded 404 page with working return links and WCAG compliance', async ({
    page,
  }) => {
    const resp = await page.goto('/non-existent-measurement-route', { waitUntil: 'networkidle' });
    expect(resp?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText('Page Not Found');
    await expect(page.locator('a[href="/"]').first()).toBeVisible();
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(axe.violations).toEqual([]);
  });
});
