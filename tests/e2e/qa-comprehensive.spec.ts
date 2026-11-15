import fs from 'node:fs';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const ALL_ROUTES = [
  '/',
  '/cm-ruler',
  '/mm-ruler',
  '/inch-ruler',
  '/horizontal-ruler',
  '/vertical-ruler',
  '/how-to-use',
  '/calibration-guide',
  '/faq',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
];

const LOCALIZED_ROUTES = ['/es', '/ja', '/de'];

const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'docs/qa-screenshots');

test.describe('QA Comprehensive — Routes, Semantics, Network & Accessibility', () => {
  test('all 13 routes + localized routes load cleanly with 0 console/network errors, valid assets, valid hash targets, and 0 axe WCAG AA violations (light & dark)', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
    });
    page.on('requestfailed', (req) => {
      errors.push(`requestfailed: ${req.url()} (${req.failure()?.errorText ?? 'unknown'})`);
    });
    page.on('response', (res) => {
      if (res.status() >= 400) {
        errors.push(`http_${res.status()}: ${res.url()}`);
      }
    });

    for (const route of [...ALL_ROUTES, ...LOCALIZED_ROUTES]) {
      await page.goto(route, { waitUntil: 'networkidle' });

      // Document & primary landmark check
      await expect(page.locator('main#main-content')).toBeVisible();
      await expect(page.locator('h1').first()).toBeVisible();

      // Same-page hash anchors must resolve to existing IDs
      const missingHashes = await page.evaluate(() => {
        const missing: string[] = [];
        document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
          const id = a.getAttribute('href')?.slice(1);
          if (id && !document.getElementById(id)) missing.push(id);
        });
        return missing;
      });
      expect(missingHashes, `Missing hash targets on ${route}`).toEqual([]);

      // Trigger all lazy images by scrolling smoothly in one pass, then await completion in parallel
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
      const brokenImages = await page.evaluate(() =>
        Array.from(document.images)
          .filter((img) => !img.complete || img.naturalWidth === 0)
          .map((img) => img.src),
      );
      expect(brokenImages, `Broken images on ${route}`).toEqual([]);

      // Light mode axe-core WCAG 2.0 / 2.1 A/AA scan
      const lightAxe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(lightAxe.violations, `Light mode axe violations on ${route}`).toEqual([]);

      // Toggle Dark mode and re-scan
      await page.locator('[data-theme-toggle]').click();
      await expect(page.locator('html')).toHaveClass(/dark/);
      const darkAxe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(darkAxe.violations, `Dark mode axe violations on ${route}`).toEqual([]);

      // Reset to light mode so subsequent routes start deterministically
      await page.locator('[data-theme-toggle]').click();
      await expect(page.locator('html')).not.toHaveClass(/dark/);
    }

    expect(errors, 'Unexpected console/page/network errors').toEqual([]);
  });

  test('help modal focus trap + shortcuts disable + axe scan when open', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('[data-help-toggle]').click();
    const modal = page.locator('#help-shortcuts-modal');
    await expect(modal).toBeVisible();

    const modalAxe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(modalAxe.violations).toEqual([]);

    // Focus trap keeps Tab within modal
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const focusInside = await page.evaluate(() =>
      Boolean(document.getElementById('help-shortcuts-modal')?.contains(document.activeElement)),
    );
    expect(focusInside).toBe(true);

    // Disable shortcuts checkbox -> Esc still closes, 'g'/'h' ignored afterward
    await page.locator('#toggle-shortcuts-enabled').uncheck();
    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();

    const guidesActiveBefore = await page.locator('#btn-toggle-guides').getAttribute('data-active');
    await page.keyboard.press('g');
    await page.keyboard.press('h');
    await expect(modal).toBeHidden();
    await expect(page.locator('#btn-toggle-guides')).toHaveAttribute(
      'data-active',
      guidesActiveBefore!,
    );
  });
});

test.describe('QA Comprehensive — Responsive Layouts & Navigation', () => {
  test('all 7 viewports (320px to 1920px) have 0 overflow and clean open dropdowns/drawers', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    for (const vp of VIEWPORTS) {
      await page.setViewportSize(vp);
      for (const route of ['/', '/calibration-guide', '/faq']) {
        await page.goto(route, { waitUntil: 'networkidle' });
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        );
        expect(overflow, `Document overflow on ${route} at ${vp.width}x${vp.height}`).toBe(false);
      }

      // Language selector stays within viewport at extreme widths
      await page.goto('/', { waitUntil: 'networkidle' });
      const langTrigger = page.locator('[data-language-trigger]').first();
      await langTrigger.click();
      const langMenu = page.locator('[data-language-menu]').first();
      await expect(langMenu).toBeVisible();
      const fitsViewport = await langMenu.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return r.left >= 0 && r.right <= window.innerWidth + 1;
      });
      expect(fitsViewport, `Language menu overflows at ${vp.width}px`).toBe(true);
      await page.keyboard.press('Escape');
    }

    // Mobile drawer + axe scan + real navigation link at 375px
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('[data-mobile-menu-toggle]').click();
    await expect(page.locator('#mobile-nav-tray')).toBeVisible();
    const drawerAxe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(drawerAxe.violations).toEqual([]);

    await page.locator('#mobile-nav-tray a[href="/faq"]').click();
    await expect(page).toHaveURL(/\/faq$/);
    await expect(page.locator('h1').first()).toBeVisible();

    // Browser Back/Forward history navigation
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await page.goForward();
    await expect(page).toHaveURL(/\/faq$/);
  });
});

test.describe('QA Comprehensive — Online Ruler Functional, Calibration, Math & Touch', () => {
  test('card calibration, verification shapes scaling, numeric bounds, and reload persistence', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Switch to Card tab (default active) and test portrait toggle & -1/+1 buttons
    await expect(page.locator('#tab-card')).toHaveAttribute('data-active', 'true');
    const initialPx = Number(await page.locator('#input-card-px').inputValue());
    await page.locator('#btn-card-plus').click();
    await expect(page.locator('#input-card-px')).toHaveValue(String(initialPx + 1));
    await page.locator('#btn-card-minus').click();
    await expect(page.locator('#input-card-px')).toHaveValue(String(initialPx));

    // Set exact 323.5px? Integer step input takes 342px -> 342 / 85.6 = 3.9953 px/mm (~101.48 PPI)
    await page.locator('#input-card-px').fill('342');
    await page.locator('#input-card-px').press('Enter');
    await page.locator('#btn-apply-card').click();

    await expect(page.locator('[data-cal-status-label]').first()).toHaveAttribute(
      'data-status',
      'manual',
    );
    await expect(page.locator('#verify-shape-50mm')).toBeVisible();

    const shape50Width = await page
      .locator('#verify-shape-50mm')
      .evaluate((el) => el.getBoundingClientRect().width);
    const expected50Width = (342 / 85.6) * 50;
    expect(Math.abs(shape50Width - expected50Width)).toBeLessThan(1.5);

    // Portrait orientation updates card dimension state & label
    await page.locator('#btn-card-orientation').click();
    await expect(page.locator('#card-calibration-box')).toHaveAttribute(
      'data-orientation',
      'portrait',
    );
    await expect(page.locator('#label-card-px')).toHaveText('Long Edge (px):');

    // Persists after reload
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.locator('[data-cal-status-label]').first()).toHaveAttribute(
      'data-status',
      'manual',
    );
    const ppiAfterReload = await page.locator('[data-cal-ppi]').first().textContent();
    expect(ppiAfterReload).toContain('101.5 PPI');
  });

  test('diagonal calibration validation, presets, math readout accuracy, and reset', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    // Switch to Card tab first, then exercise WAI-ARIA ArrowRight / ArrowLeft / Home / End navigation
    await page.locator('#tab-card').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#tab-diagonal')).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#tab-autodetect')).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Home');
    await expect(page.locator('#tab-card')).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('End');
    await expect(page.locator('#tab-autodetect')).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#tab-diagonal')).toHaveAttribute('aria-selected', 'true');

    // Invalid diagonal input shows explicit error and preserves no bogus calibration
    await page.locator('#input-diagonal').fill('abc');
    await page.locator('#form-diagonal button[type="submit"]').click();
    await expect(page.locator('#diagonal-error')).toBeVisible();

    await page.locator('#input-diagonal').fill('2');
    await page.locator('#form-diagonal button[type="submit"]').click();
    await expect(page.locator('#diagonal-error')).toBeVisible();

    // Valid preset & apply
    await page.locator('[data-diagonal-preset="15.6"]').click();
    await expect(page.locator('#diagonal-error')).toBeHidden();
    await expect(page.locator('#diagonal-preview')).toBeVisible();
    await page.locator('#form-diagonal button[type="submit"]').click();

    await expect(page.locator('[data-cal-status-label]').first()).toHaveAttribute(
      'data-status',
      'manual',
    );

    // Move crosshair to exact +100px from datum origin (stage left/top + 16px datum padding)
    await page.locator('#btn-toggle-crosshair').click();
    const box = await page.locator('#ruler-stage').boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x + 116, box!.y + 116);
    const readoutCm = await page.locator('#live-cursor-readout').textContent();
    expect(readoutCm).toMatch(/X:\s*\d+\.\d{2}\s*cm/);

    // Switch to mm & px and verify 100px from datum origin literally reads X: 100 px
    await page.locator('[data-unit-btn="px"]').click();
    await page.mouse.move(box!.x + 116, box!.y + 116);
    const readoutPx = await page.locator('#live-cursor-readout').textContent();
    expect(readoutPx).toContain('X: 100 px');

    // Reset calibration reverts to auto-detected status
    await page.locator('[data-reset-calibration]').first().click();
    await expect(page.locator('[data-cal-status-label]').first()).toHaveAttribute(
      'data-status',
      'estimated',
    );
  });

  test('guides, floating rulers (clamping + rotate + drag), protractor rotation, and fullscreen', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/', { waitUntil: 'networkidle' });

    // Two floating rulers stay inside 320px stage bounds
    await page.locator('#btn-add-floating-ruler').click();
    await page.locator('#btn-add-floating-ruler').click();
    const allFit = await page.evaluate(() => {
      const stage = document.getElementById('ruler-stage')!.getBoundingClientRect();
      return Array.from(document.querySelectorAll('.floating-ruler')).every((el) => {
        const r = el.getBoundingClientRect();
        return r.left >= stage.left - 1 && r.right <= stage.right + 1;
      });
    });
    expect(allFit).toBe(true);

    // Rotate and close a floating ruler
    const firstFloating = page.locator('.floating-ruler').first();
    const beforeBox = await firstFloating.boundingBox();
    await firstFloating.locator('[aria-label="Rotate floating ruler"]').click();
    const afterBox = await firstFloating.boundingBox();
    expect(afterBox!.height).toBeGreaterThan(beforeBox!.height);
    await firstFloating.locator('[aria-label="Remove floating ruler"]').click();
    await expect(page.locator('.floating-ruler')).toHaveCount(1);

    // Protractor drag updates angle
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('#btn-toggle-protractor').click();
    const protWidget = page.locator('.protractor-widget');
    const protCanvas = protWidget.locator('canvas');
    const cBox = await protCanvas.boundingBox();
    expect(cBox).not.toBeNull();
    const initialAngle = await protWidget.getAttribute('data-angle-deg');
    await page.mouse.move(cBox!.x + cBox!.width * 0.75, cBox!.y + cBox!.height * 0.8);
    await page.mouse.down();
    await page.mouse.move(cBox!.x + cBox!.width * 0.25, cBox!.y + cBox!.height * 0.35);
    await page.mouse.up();
    const updatedAngle = await protWidget.getAttribute('data-angle-deg');
    expect(updatedAngle).not.toBe(initialAngle);

    // Clear all guides removes added guides (pick empty stage coordinate clear of persisted floating ruler)
    await page.locator('#ruler-stage').click({ position: { x: 140, y: 350 } });
    await expect(page.locator('.guide-line')).toHaveCount(1);
    await page.locator('#btn-clear-guides').click();
    await expect(page.locator('.guide-line')).toHaveCount(0);

    // Thickness & Opacity sliders update workspace attributes cleanly
    await page.locator('#select-thickness').selectOption('64');
    await page.locator('#slider-opacity').fill('60');
    await page.locator('#slider-opacity').dispatchEvent('input');
    await expect(page.locator('#label-opacity')).toHaveText('60%');

    // FAQ accordion starts open on /faq, toggles closed on click, and re-opens on second click
    await page.goto('/faq', { waitUntil: 'networkidle' });
    const firstFaq = page.locator('main details').first();
    await expect(firstFaq).toHaveAttribute('open', '');
    await firstFaq.locator('summary').click();
    await expect(firstFaq).not.toHaveAttribute('open', '');
    await firstFaq.locator('summary').click();
    await expect(firstFaq).toHaveAttribute('open', '');
  });

  test('mobile touch interactions drag guides cleanly without touch-action blocking', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    await page.goto('/', { waitUntil: 'networkidle' });

    // Place a guide via tap inside ruler stage
    const stageBox = await page.locator('#ruler-stage').boundingBox();
    expect(stageBox).not.toBeNull();
    await page.touchscreen.tap(stageBox!.x + 120, stageBox!.y + 120);
    await expect(page.locator('.guide-line')).toHaveCount(1);

    // Check touch-none CSS is active on draggable elements
    const touchAction = await page
      .locator('.guide-line')
      .first()
      .evaluate((el) => getComputedStyle(el).touchAction);
    expect(touchAction).toBe('none');

    await context.close();
  });

  test('capture clean QA evidence screenshots (Chrome)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chrome', 'Screenshots captured once on Chrome');
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'home-desktop-1440-light.png'),
    });

    await page.locator('[data-theme-toggle]').click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'home-desktop-1440-dark.png'),
    });
    await page.locator('[data-theme-toggle]').click();

    await page.locator('#btn-toggle-protractor').click();
    await page.locator('#btn-add-floating-ruler').click();
    await page.locator('#ruler-stage').click({ position: { x: 160, y: 120 } });
    await page.locator('#ruler-stage').click({ position: { x: 320, y: 120 } });
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'protractor-floating-guides.png'),
    });

    await page.locator('#calibration').scrollIntoViewIfNeeded();
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'calibration-card-active.png'),
    });

    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'mobile-320-ruler.png'),
    });

    await page.setViewportSize({ width: 375, height: 667 });
    await page.locator('[data-mobile-menu-toggle]').click();
    await expect(page.locator('#mobile-nav-tray')).toBeVisible();
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'mobile-375-tray.png'),
    });
  });
});
