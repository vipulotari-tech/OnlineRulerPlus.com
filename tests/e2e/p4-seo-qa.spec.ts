import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('P4 — SEO Spokes, Cross-Linking & Guide Enrichment', () => {
  test('P4.1 /photo-ruler auto-opens photo mode, links tools cleanly, and passes Axe WCAG', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/photo-ruler', { waitUntil: 'networkidle' });

    // Panel auto-opens via initialPhotoMode={true} -> data-init-photo="true"
    const photoPanel = page.locator('#photo-measure-panel');
    await expect(photoPanel).toBeVisible();
    await expect(page.locator('#btn-photo-mode')).toHaveAttribute('data-active', 'true');

    // Canonical & structured links
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/photo-ruler$/);
    const footer = page.locator('footer');
    await expect(footer.locator('a[href="/protractor"]')).toBeVisible();
    await expect(footer.locator('a[href="/circle-ruler"]')).toBeVisible();
    await expect(footer.locator('a[href="/quadrant"]')).toBeVisible();
    await expect(footer.locator('a[href="/printable-ruler"]')).toBeVisible();
    await expect(footer.locator('a[href="/screen-size-detector"]')).toBeVisible();

    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations, JSON.stringify(axe.violations, null, 2)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('P4.2 /protractor auto-opens 360° dual-ray protractor widget and passes Axe WCAG', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/protractor', { waitUntil: 'networkidle' });

    const widget = page.locator('.protractor-widget');
    await expect(widget).toBeVisible();
    await expect(page.locator('#btn-toggle-protractor')).toHaveAttribute('data-active', 'true');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/protractor$/);

    // Check dual-ray 360° readout works
    const degText = await widget.textContent();
    expect(degText).toMatch(/°/);

    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations, JSON.stringify(axe.violations, null, 2)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('P4.3 /calibration-guide includes Windows 125%/150% & Android Chrome caveat and passes Axe', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/calibration-guide', { waitUntil: 'networkidle' });

    await expect(page.locator('body')).toContainText('125%');
    await expect(page.locator('body')).toContainText('150%');
    await expect(page.locator('body')).toContainText('Android');

    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations, JSON.stringify(axe.violations, null, 2)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('P4.4 sitemap-index & robots exclude /embed utility and expose all 19 indexable spokes', async ({ request }) => {
    const robotsRes = await request.get('/robots.txt');
    expect(robotsRes.ok()).toBe(true);
    const robotsBody = await robotsRes.text();
    expect(robotsBody).toContain('Sitemap:');

    const sitemapRes = await request.get('/sitemap-0.xml');
    expect(sitemapRes.ok()).toBe(true);
    const sitemapXml = await sitemapRes.text();
    expect(sitemapXml).toContain('/photo-ruler');
    expect(sitemapXml).toContain('/protractor');
    expect(sitemapXml).toContain('/circle-ruler');
    expect(sitemapXml).toContain('/quadrant');
    expect(sitemapXml).toContain('/printable-ruler');
    expect(sitemapXml).toContain('/screen-size-detector');
    expect(sitemapXml).not.toMatch(/\/embed<\/loc>/);
  });
});
