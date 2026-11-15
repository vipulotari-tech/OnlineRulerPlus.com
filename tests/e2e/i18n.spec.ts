import { test, expect } from '@playwright/test';

const NON_EN_LOCALES: Array<{ code: string; bcp47: string; nativeName: string }> = [
  { code: 'es', bcp47: 'es-ES', nativeName: 'Español' },
  { code: 'fr', bcp47: 'fr-FR', nativeName: 'Français' },
  { code: 'de', bcp47: 'de-DE', nativeName: 'Deutsch' },
  { code: 'it', bcp47: 'it-IT', nativeName: 'Italiano' },
  { code: 'pt', bcp47: 'pt-PT', nativeName: 'Português' },
  { code: 'ja', bcp47: 'ja-JP', nativeName: '日本語' },
  { code: 'ko', bcp47: 'ko-KR', nativeName: '한국어' },
  { code: 'nl', bcp47: 'nl-NL', nativeName: 'Nederlands' },
  { code: 'tr', bcp47: 'tr-TR', nativeName: 'Türkçe' },
  { code: 'id', bcp47: 'id-ID', nativeName: 'Bahasa Indonesia' },
  { code: 'pl', bcp47: 'pl-PL', nativeName: 'Polski' },
];

test.describe('Multilingual Language Selector & Full-Site i18n E2E', () => {
  test('dropdown opens, highlights active language, supports full keyboard navigation, and closes on outside click', async ({
    page,
  }) => {
    await page.goto('/');

    const selector = page.locator('[data-language-selector]');
    const trigger = page.locator('[data-language-trigger]');
    const menu = page.locator('[data-language-menu]');
    const enOption = page.locator('[data-language-option="en"]');

    await expect(selector).toHaveAttribute('data-current-locale', 'en');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeHidden();

    // Open via click
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(menu).toBeVisible();
    await expect(menu).toHaveAttribute('data-open', 'true');
    await expect(enOption).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('[data-language-option]')).toHaveCount(12);

    // Keyboard navigation inside menu
    await page.keyboard.press('ArrowDown');
    const esFocused = await page.evaluate(
      () => document.activeElement?.getAttribute('data-language-option'),
    );
    expect(esFocused).toBe('es');

    await page.keyboard.press('End');
    const plFocused = await page.evaluate(
      () => document.activeElement?.getAttribute('data-language-option'),
    );
    expect(plFocused).toBe('pl');

    await page.keyboard.press('Home');
    const firstFocused = await page.evaluate(
      () => document.activeElement?.getAttribute('data-language-option'),
    );
    expect(firstFocused).toBe('en');

    // Escape closes menu and restores focus to trigger
    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeHidden();
    const isTriggerFocused = await page.evaluate(
      () => document.activeElement === document.querySelector('[data-language-trigger]'),
    );
    expect(isTriggerFocused).toBe(true);

    // Re-open via ArrowDown from trigger and close via outside click
    await page.keyboard.press('ArrowDown');
    await expect(menu).toBeVisible();
    await page.locator('main h1').click();
    await expect(menu).toBeHidden();
  });

  test('switching languages genuinely translates UI across all 12 locales with zero console errors', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    const enH1 = (await page.locator('main h1').textContent())?.trim() ?? '';
    const enFullscreen = (await page.locator('#btn-fullscreen span').textContent())?.trim() ?? '';
    const enStatus = (await page.locator('#ruler-tool [data-cal-status-label]').textContent())?.trim() ?? '';

    for (const loc of NON_EN_LOCALES) {
      await page.locator('[data-language-trigger]').click();
      await page.locator(`[data-language-option="${loc.code}"]`).click();

      await page.waitForURL(new RegExp(`/${loc.code}/?$`));
      await expect(page.locator('html')).toHaveAttribute('lang', loc.bcp47);
      await expect(page.locator('[data-language-selector]')).toHaveAttribute(
        'data-current-locale',
        loc.code,
      );
      await expect(page.locator(`[data-language-option="${loc.code}"]`)).toHaveAttribute(
        'aria-checked',
        'true',
      );
      await expect(page.locator('[data-language-trigger]')).toContainText(loc.nativeName);

      const locH1 = (await page.locator('main h1').textContent())?.trim() ?? '';
      const locFullscreen = (await page.locator('#btn-fullscreen span').textContent())?.trim() ?? '';
      const locStatus = (await page.locator('#ruler-tool [data-cal-status-label]').textContent())?.trim() ?? '';

      expect(locH1.length).toBeGreaterThan(5);
      expect(locH1).not.toBe(enH1);
      expect(locFullscreen).not.toBe(enFullscreen);
      expect(locStatus).not.toBe(enStatus);
    }

    expect(errors).toEqual([]);
  });

  test('preserves current sub-route and query string when switching languages', async ({ page }) => {
    await page.goto('/cm-ruler?unit=mm');
    await page.locator('[data-language-trigger]').click();
    await page.locator('[data-language-option="fr"]').click();

    await page.waitForURL(/\/fr\/cm-ruler\?unit=mm$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr-FR');

    await page.locator('[data-language-trigger]').click();
    await page.locator('[data-language-option="en"]').click();
    await page.waitForURL(/\/cm-ruler\?unit=mm$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
  });

  test('auto-detects browser language on first visit to / and respects manual switch back to English', async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: 'es-ES' });
    const page = await context.newPage();

    await page.goto('/');
    await page.waitForURL(/\/es\/?$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es-ES');

    const autoStorage = await page.evaluate(() => ({
      locale: localStorage.getItem('orp:locale:v1'),
      source: localStorage.getItem('orp:locale-source:v1'),
    }));
    expect(autoStorage).toEqual({ locale: 'es', source: 'auto' });

    // Switch manually back to English; reload must NOT auto-redirect back to /es
    await page.locator('[data-language-trigger]').click();
    await page.locator('[data-language-option="en"]').click();
    await page.waitForURL((url) => url.pathname === '/');

    const manualStorage = await page.evaluate(() => ({
      locale: localStorage.getItem('orp:locale:v1'),
      source: localStorage.getItem('orp:locale-source:v1'),
    }));
    expect(manualStorage).toEqual({ locale: 'en', source: 'manual' });

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
    expect(new URL(page.url()).pathname).toBe('/');

    await context.close();
  });

  test('emits self-referencing canonical, 13 hreflang alternates, and localized JSON-LD on localized routes', async ({
    page,
  }) => {
    await page.goto('/ja/calibration-guide');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja-JP');

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBe('https://onlinerulerplus.com/ja/calibration-guide');

    const hreflangs = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((els) =>
      els.map((el) => ({
        hreflang: el.getAttribute('hreflang'),
        href: el.getAttribute('href'),
      })),
    );
    expect(hreflangs).toHaveLength(13);
    expect(hreflangs.find((h) => h.hreflang === 'x-default')?.href).toBe(
      'https://onlinerulerplus.com/calibration-guide',
    );
    expect(hreflangs.find((h) => h.hreflang === 'ja')?.href).toBe(
      'https://onlinerulerplus.com/ja/calibration-guide',
    );

    const ldRaw = await page.locator('script[type="application/ld+json"]').textContent();
    const ld = JSON.parse(ldRaw ?? '[]');
    const website = ld.find((n: Record<string, unknown>) => n['@type'] === 'WebSite');
    const article = ld.find((n: Record<string, unknown>) => n['@type'] === 'TechArticle');
    expect(website?.inLanguage).toBe('ja-JP');
    expect(article?.inLanguage).toBe('ja-JP');
  });

  test('renders cleanly with zero overflow and clickable selector bounds on desktop and 320px mobile', async ({
    page,
  }) => {
    for (const vp of [
      { width: 320, height: 568 },
      { width: 375, height: 667 },
      { width: 1280, height: 800 },
    ]) {
      await page.setViewportSize(vp);
      for (const route of ['/', '/de', '/ja', '/id']) {
        await page.goto(route);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        );
        expect(overflow, `Overflow detected on ${route} at ${vp.width}px`).toBe(false);

        const trigger = page.locator('[data-language-trigger]');
        await expect(trigger).toBeVisible();
        await trigger.click();

        const menuBox = await page.locator('[data-language-menu]').boundingBox();
        expect(menuBox, `Menu missing on ${route} at ${vp.width}px`).not.toBeNull();
        expect(menuBox!.x).toBeGreaterThanOrEqual(0);
        expect(menuBox!.x + menuBox!.width).toBeLessThanOrEqual(vp.width + 1);

        await page.keyboard.press('Escape');
      }
    }
  });

  test('translates runtime calibration status, diagonal preview, and validation errors in Spanish', async ({
    page,
  }) => {
    await page.goto('/es');

    await page.locator('[data-cal-tab="diagonal"]').click();
    const diagInput = page.locator('#input-diagonal');

    await diagInput.fill('-5');
    await page.locator('#form-diagonal button[type="submit"]').click();
    await expect(page.locator('#diagonal-error')).toBeVisible();
    await expect(page.locator('#diagonal-error')).toContainText('Usa un número válido, como 15.6.');

    await diagInput.fill('0');
    await page.locator('#form-diagonal button[type="submit"]').click();
    await expect(page.locator('#diagonal-error')).toBeVisible();
    await expect(page.locator('#diagonal-error')).toContainText('La diagonal debe ser mayor que cero.');

    await diagInput.fill('24');
    await expect(page.locator('#diagonal-preview')).toContainText('Escala calculada:');
    await page.locator('#form-diagonal button[type="submit"]').click();

    await expect(page.locator('#ruler-workspace')).toHaveAttribute('data-calibration-status', 'manual');
    await expect(page.locator('#ruler-tool [data-cal-status-label]')).toHaveText('Calibración manual');
  });
});
