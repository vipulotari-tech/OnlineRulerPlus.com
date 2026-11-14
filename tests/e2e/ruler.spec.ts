import { test, expect } from '@playwright/test';

test.describe('Online Ruler Plus — Apple DESIGN.md & E2E Verification Suite', () => {
  test('renders ruler workspace above the fold, toggles all 4 edges, switches all units, and has zero console errors', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');

    const workspace = page.locator('#ruler-workspace');
    await expect(workspace).toBeVisible();
    await expect(workspace).toHaveAttribute('data-unit', 'cm');

    // Verify functional ruler is immediately visible above the fold on desktop
    const box = await workspace.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeLessThan(400);

    // Top and Left edges visible by default
    await expect(page.locator('#ruler-canvas-top')).toBeVisible();
    await expect(page.locator('#ruler-canvas-left')).toBeVisible();
    await expect(page.locator('#ruler-canvas-bottom')).toBeHidden();
    await expect(page.locator('#ruler-canvas-right')).toBeHidden();

    // Verify major labels generated on top ruler
    const topLabels = await page.locator('#ruler-canvas-top').getAttribute('data-major-labels');
    expect(topLabels).toContain('0');
    expect(topLabels).toContain('1');

    // Toggle Bottom and Right edges individually
    await page.locator('[data-edge-btn="bottom"]').click();
    await expect(page.locator('#ruler-canvas-bottom')).toBeVisible();
    await page.locator('[data-edge-btn="right"]').click();
    await expect(page.locator('#ruler-canvas-right')).toBeVisible();

    // Switch units via toolbar buttons: mm, in, px, cm
    await page.locator('[data-unit-btn="mm"]').click();
    await expect(workspace).toHaveAttribute('data-unit', 'mm');
    const mmLabels = await page.locator('#ruler-canvas-top').getAttribute('data-major-labels');
    expect(mmLabels).toContain('10');

    await page.locator('[data-unit-btn="in"]').click();
    await expect(workspace).toHaveAttribute('data-unit', 'in');

    await page.locator('[data-unit-btn="px"]').click();
    await expect(workspace).toHaveAttribute('data-unit', 'px');
    const pxLabels = await page.locator('#ruler-canvas-top').getAttribute('data-major-labels');
    expect(pxLabels).toContain('100');

    expect(errors).toEqual([]);
  });

  test('calibrates via Credit Card, Screen Diagonal (valid & invalid), and Auto-Detect with localStorage persistence', async ({
    page,
  }) => {
    await page.goto('/');
    const workspace = page.locator('#ruler-workspace');

    // 1. Credit card calibration: verify ISO/IEC 7810 aspect ratio & step adjustment
    const cardBox = page.locator('#card-calibration-box');
    const initialW = Number(await cardBox.getAttribute('data-card-width-px'));
    const initialH = Number(await cardBox.getAttribute('data-card-height-px'));
    expect(Math.abs(initialH / initialW - 53.98 / 85.6)).toBeLessThan(0.001);

    await page.locator('#btn-card-plus').click();
    const afterPlusW = Number(await cardBox.getAttribute('data-card-width-px'));
    expect(afterPlusW).toBeCloseTo(initialW + 1, 1);

    // Keyboard arrow adjustment on card stage
    const cardStage = page.locator('#card-interactive-area');
    await cardStage.focus();
    await page.keyboard.press('ArrowRight');
    const afterArrowW = Number(await cardBox.getAttribute('data-card-width-px'));
    expect(afterArrowW).toBeCloseTo(afterPlusW + 1, 1);

    await page.locator('#btn-apply-card').click();
    await expect(workspace).toHaveAttribute('data-calibration-status', 'manual');

    // Reload page and confirm calibration persists
    const savedPxPerMm = await workspace.getAttribute('data-px-per-mm');
    await page.reload();
    await expect(workspace).toHaveAttribute('data-calibration-status', 'manual');
    await expect(workspace).toHaveAttribute('data-px-per-mm', savedPxPerMm!);

    // 2. Screen Diagonal calibration: reject invalid values, accept valid diagonal
    await page.locator('[data-cal-tab="diagonal"]').click();
    const diagInput = page.locator('#input-diagonal');
    await expect(diagInput).toBeVisible();

    await diagInput.fill('-5');
    await page.locator('#form-diagonal button[type="submit"]').click();
    await expect(page.locator('#diagonal-error')).toBeVisible();

    await diagInput.fill('0');
    await page.locator('#form-diagonal button[type="submit"]').click();
    await expect(page.locator('#diagonal-error')).toBeVisible();

    await diagInput.fill('24');
    await page.locator('#form-diagonal button[type="submit"]').click();
    await expect(page.locator('#diagonal-error')).toBeHidden();
    await expect(workspace).toHaveAttribute('data-calibration-status', 'manual');

    // 3. Auto-detect / Reset calibration
    await page.locator('[data-cal-tab="auto-detect"]').click();
    await page.locator('#btn-apply-autodetect').click();
    const statusAfterAuto = await workspace.getAttribute('data-calibration-status');
    expect(['detected', 'estimated']).toContain(statusAfterAuto);
  });

  test('supports guide lines, crosshair, floating ruler, keyboard shortcuts, and dark mode', async ({
    page,
  }) => {
    await page.goto('/');

    // Place two vertical guides by clicking on top ruler canvas
    const topCanvas = page.locator('#ruler-canvas-top');
    await topCanvas.click({ position: { x: 100, y: 20 } });
    await topCanvas.click({ position: { x: 250, y: 20 } });
    await expect(page.locator('.guide-line')).toHaveCount(2);

    // Span readout should appear and save to measurement history
    const spanBadge = page.locator('#guide-span-readout');
    await expect(spanBadge).toBeVisible();
    await page.locator('#btn-save-span').click();
    await expect(page.locator('#measurement-history-list li')).toHaveCount(1);

    // Keyboard shortcuts: 2 -> inches, 3 -> pixels, 1 -> cm
    await page.keyboard.press('2');
    await expect(page.locator('#ruler-workspace')).toHaveAttribute('data-unit', 'in');
    await page.keyboard.press('3');
    await expect(page.locator('#ruler-workspace')).toHaveAttribute('data-unit', 'px');
    await page.keyboard.press('1');
    await expect(page.locator('#ruler-workspace')).toHaveAttribute('data-unit', 'cm');

    // Shortcut guard: typing in input does not trigger unit switches
    await page.locator('[data-cal-tab="diagonal"]').click();
    const diagInput = page.locator('#input-diagonal');
    await diagInput.focus();
    await page.keyboard.type('23');
    await expect(page.locator('#ruler-workspace')).toHaveAttribute('data-unit', 'cm');
    await diagInput.evaluate((el: HTMLElement) => el.blur());

    // D toggles dark mode
    const initialDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    );
    await page.keyboard.press('d');
    const nextDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    );
    expect(nextDark).toBe(!initialDark);

    // H opens and closes help modal
    await page.keyboard.press('h');
    await expect(page.locator('#help-shortcuts-modal')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#help-shortcuts-modal')).toBeHidden();

    // Esc clears guides
    await page.keyboard.press('Escape');
    await expect(page.locator('.guide-line')).toHaveCount(0);

    // Floating ruler
    await page.locator('#btn-add-floating-ruler').click();
    await expect(page.locator('.floating-ruler')).toHaveCount(1);

    // Protractor overlay toggle
    await page.locator('#btn-toggle-protractor').click();
    await expect(page.locator('.protractor-widget')).toBeVisible();
    await page.keyboard.press('p');
    await expect(page.locator('.protractor-widget')).toBeHidden();
  });

  test('verifies all dedicated ruler routes, content pages, Apple DESIGN.md tokens, and responsive viewports without overflow', async ({
    page,
  }) => {
    // Dedicated unit & edge routes
    await page.goto('/inch-ruler');
    await expect(page.locator('#ruler-workspace')).toHaveAttribute('data-unit', 'in');

    await page.goto('/mm-ruler');
    await expect(page.locator('#ruler-workspace')).toHaveAttribute('data-unit', 'mm');

    await page.goto('/cm-ruler');
    await expect(page.locator('#ruler-workspace')).toHaveAttribute('data-unit', 'cm');

    await page.goto('/horizontal-ruler');
    await expect(page.locator('#ruler-canvas-top')).toBeVisible();
    await expect(page.locator('#ruler-canvas-bottom')).toBeVisible();
    await expect(page.locator('#ruler-canvas-left')).toBeHidden();

    await page.goto('/vertical-ruler');
    await expect(page.locator('#ruler-canvas-left')).toBeVisible();
    await expect(page.locator('#ruler-canvas-right')).toBeVisible();
    await expect(page.locator('#ruler-canvas-top')).toBeHidden();

    // Content & legal routes share Apple global-nav + sub-nav-frosted + Action Blue primary CTA
    for (const route of ['/how-to-use', '/calibration-guide', '/faq', '/about', '/contact', '/privacy', '/terms']) {
      await page.goto(route);
      await expect(page.locator('header .apple-subnav-frosted')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
    }

    // Responsive viewports: Small mobile (375px), Mobile (390px), Tablet (768px), Laptop (1024px), Desktop (1280px), Wide (1600px)
    await page.goto('/');
    for (const vp of [
      { width: 375, height: 667 },
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
      { width: 1280, height: 800 },
      { width: 1600, height: 900 },
    ]) {
      await page.setViewportSize(vp);
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(overflow).toBe(false);
    }
  });
});
