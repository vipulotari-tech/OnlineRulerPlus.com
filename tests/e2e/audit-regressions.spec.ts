import { test, expect } from '@playwright/test';

test.describe('Audit Regressions — Functional, Responsive & Accessibility Invariants', () => {
  test('BUG-01: spoke routes do not overwrite user home preferences in localStorage', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-unit-btn="in"]').click();
    await page.locator('[data-edge-btn="all"]').click();

    await page.goto('/cm-ruler');
    await expect(page.locator('#ruler-workspace')).toHaveAttribute('data-unit', 'cm');

    await page.goto('/horizontal-ruler');
    await expect(page.locator('#ruler-canvas-left')).toBeHidden();

    await page.goto('/');
    await expect(page.locator('#ruler-workspace')).toHaveAttribute('data-unit', 'in');
    await expect(page.locator('#ruler-canvas-bottom')).toBeVisible();
    await expect(page.locator('#ruler-canvas-left')).toBeVisible();
  });

  test('BUG-02: at least one edge ruler always remains active', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-edge-btn="top"]').click();
    await expect(page.locator('#ruler-canvas-top')).toBeHidden();

    // Attempting to turn off the last remaining edge (left) must keep it visible
    await page.locator('[data-edge-btn="left"]').click();
    await expect(page.locator('#ruler-canvas-left')).toBeVisible();
    const activeEdges = await page.evaluate(() =>
      ['top', 'bottom', 'left', 'right'].filter((e) => {
        const el = document.getElementById(`ruler-canvas-${e}`);
        return el && !el.classList.contains('hidden');
      }),
    );
    expect(activeEdges.length).toBeGreaterThanOrEqual(1);
  });

  test('BUG-03 & BUG-07: dual axis guide span displays both ΔX and ΔY, and dual crosshair formats both axes', async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('[data-guide-axis-btn="both"]').click();
    await page.locator('#ruler-stage').click({ position: { x: 100, y: 100 } });
    await page.locator('#ruler-stage').click({ position: { x: 220, y: 180 } });

    const spanText = await page.locator('#guide-span-value').textContent();
    expect(spanText).toContain('ΔX:');
    expect(spanText).toContain('ΔY:');

    // Saving span records both X and Y axes in history
    await page.locator('#btn-save-span').click();
    const histTexts = await page.locator('#measurement-history-list li').allTextContents();
    expect(histTexts.some((t) => t.includes('ΔX guide span'))).toBe(true);
    expect(histTexts.some((t) => t.includes('ΔY guide span'))).toBe(true);

    // Dual mode crosshair badge formats both X and Y with cm + fractional in
    await page.locator('#btn-toggle-crosshair').click();
    await page.locator('#btn-dual-unit').click();
    const box = await page.locator('#ruler-stage').boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x + 150, box!.y + 120);
    const badge = await page.locator('#crosshair-badge').textContent();
    const inMatches = badge?.match(/\bin\b/g) ?? [];
    expect(inMatches.length).toBe(2);
  });

  test('BUG-04 & BUG-05: 320px/844px mobile viewports have no horizontal doc overflow and protractor fits inside stage', async ({
    page,
  }) => {
    for (const vp of [
      { width: 320, height: 568 },
      { width: 375, height: 667 },
      { width: 844, height: 390 },
    ]) {
      await page.setViewportSize(vp);
      await page.goto('/');
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `Expected no document overflow at ${vp.width}x${vp.height}`).toBe(false);
    }

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.locator('#btn-toggle-protractor').click();
    const fitsStage = await page.evaluate(() => {
      const stage = document.getElementById('ruler-stage')!.getBoundingClientRect();
      const widget = document.querySelector('.protractor-widget')!.getBoundingClientRect();
      return widget.left >= stage.left - 1 && widget.right <= stage.right + 1;
    });
    expect(fitsStage).toBe(true);
  });

  test('BUG-06: Escape always closes help shortcuts modal even when checkbox focused or shortcuts disabled', async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('[data-help-toggle]').click();
    await expect(page.locator('#help-shortcuts-modal')).toBeVisible();

    await page.locator('#toggle-shortcuts-enabled').uncheck();
    await page.locator('#toggle-shortcuts-enabled').focus();
    await page.keyboard.press('Escape');
    await expect(page.locator('#help-shortcuts-modal')).toBeHidden();
  });

  test('BUG-08: invalid diagonal clears stale preview and out-of-range card px input clamps on change', async ({
    page,
  }) => {
    await page.goto('/');
    const cardInput = page.locator('#input-card-px');
    await cardInput.fill('50');
    await cardInput.dispatchEvent('change');
    expect(Number(await cardInput.inputValue())).toBe(120);
    expect(Number(await page.locator('#card-calibration-box').getAttribute('data-card-width-px'))).toBeCloseTo(120, 1);

    await page.locator('[data-cal-tab="diagonal"]').click();
    await page.locator('#input-diagonal').fill('15.6');
    await expect(page.locator('#diagonal-preview')).toContainText('CSS PPI');

    await page.locator('#input-diagonal').fill('1,234');
    await expect(page.locator('#diagonal-error')).toBeVisible();
    await expect(page.locator('#diagonal-preview')).not.toContainText('Calculated scale:');

    // Card orientation adapts automatically on viewport rotation when not manually overridden
    await page.locator('[data-cal-tab="card"]').click();
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    await expect(page.locator('#card-calibration-box')).toHaveAttribute('data-orientation', 'landscape');
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('#card-calibration-box')).toHaveAttribute('data-orientation', 'portrait');
  });

  test('BUG-09: /how-to-use shortcut table documents D as Dark/Light Theme toggle', async ({ page }) => {
    await page.goto('/how-to-use');
    const actionText = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      const dRow = rows.find((r) => r.querySelector('td')?.textContent?.trim() === 'D');
      return dRow?.textContent?.trim() ?? '';
    });
    expect(actionText).toMatch(/theme|dark/i);
    expect(actionText).not.toMatch(/Toggle Dual/i);
  });
});
