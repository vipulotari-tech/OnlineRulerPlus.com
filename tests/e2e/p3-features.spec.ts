import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('P3 Features — Architectural Scale, Live Unit Converter, Circle Gauge, 4-Quadrant Plane', () => {
  test('P3.1: architectural scale selector updates ruler scale, shows safety badge, persists & resets to 1:1', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    const ws = page.locator('#ruler-workspace');
    await expect(ws).toHaveAttribute('data-scale-preset', '1:1');
    await expect(page.locator('#scale-active-badge')).toBeHidden();

    // Select 1:50 architectural scale
    await page.selectOption('#select-arch-scale', '1:50');
    await expect(ws).toHaveAttribute('data-scale-preset', '1:50');
    await expect(ws).toHaveAttribute('data-scale-factor', '50');
    await expect(page.locator('#scale-active-badge')).toBeVisible();
    await expect(page.locator('#scale-active-text')).toContainText('1:50');

    // Reload persists 1:50 safety warning badge
    await page.reload();
    await expect(page.locator('#scale-active-badge')).toBeVisible();

    // 1-click Reset 1:1 restores actual scale & hides warning badge
    await page.click('#btn-reset-scale');
    await expect(ws).toHaveAttribute('data-scale-preset', '1:1');
    await expect(page.locator('#scale-active-badge')).toBeHidden();
  });

  test('P3.2: bidirectional Unit Converter bar updates mm/cm/in/px & 1/16 fraction accurately', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    const bar = page.locator('#unit-converter-bar');
    await expect(bar).toBeVisible();

    await page.fill('#conv-in', '2');
    await page.locator('#conv-in').dispatchEvent('input');
    await expect(page.locator('#conv-mm')).toHaveValue('50.80');
    await expect(page.locator('#conv-cm')).toHaveValue('5.08');
    await expect(page.locator('#conv-frac-readout')).toContainText('2 in');
  });

  test('P3.3: /circle-ruler diameter presets, slider, canvas drag & WCAG accessibility', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/circle-ruler');

    const canvas = page.locator('#circle-gauge-canvas');
    await expect(canvas).toBeVisible();

    // Select US Ring 7 preset -> shows US 7 / EU match
    await page.click('[data-circle-preset="17.35"]');
    await expect(page.locator('#cg-dia-mm')).toHaveText('17.35 mm');
    await expect(page.locator('#cg-ring-match')).toContainText('US 7');

    // Fine adjust +0.5 mm
    await page.click('#circle-plus-btn');
    await expect(page.locator('#cg-dia-mm')).toHaveText('17.85 mm');

    const a11y = await new AxeBuilder({ page }).analyze();
    expect(a11y.violations).toEqual([]);
  });

  test('P3.4: /quadrant coordinate plane plots clicks, computes r & θ, resets to origin & passes WCAG', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/quadrant');

    const canvas = page.locator('#quadrant-canvas');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box).toBeTruthy();

    if (box) {
      // Click in upper-left quadrant II (-X, +Y)
      await page.mouse.click(box.x + box.width * 0.25, box.y + box.height * 0.25);
      await expect(page.locator('#quad-label-val')).toContainText('II');
      await expect(page.locator('#quad-x-val')).toContainText('−');
    }

    await page.click('#btn-quadrant-reset');
    await expect(page.locator('#quad-label-val')).toHaveText('Origin');

    const a11y = await new AxeBuilder({ page }).analyze();
    expect(a11y.violations).toEqual([]);
  });
});
