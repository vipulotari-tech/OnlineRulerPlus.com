import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('P2 Features — 360° Protractor, Angled Rulers, Profiles, History Export, Embed, Detector, Printable SVG', () => {
  test('P2.1: 360° protractor toggle, keyboard stepping, reposition drag & angled floating ruler persistence', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    // Toggle protractor via button
    await page.click('#btn-toggle-protractor');
    const widget = page.locator('.protractor-widget');
    await expect(widget).toBeVisible();
    await expect(widget).toHaveAttribute('data-mode', '180');

    // Toggle to 360° mode
    await page.click('#btn-protractor-mode');
    await expect(widget).toHaveAttribute('data-mode', '360');

    // Step angle via keyboard ArrowRight on protractor canvas
    const initialDeg = Number(await widget.getAttribute('data-angle-deg'));
    const pCanvas = widget.locator('canvas');
    await pCanvas.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    const updatedDeg = Number(await widget.getAttribute('data-angle-deg'));
    expect(updatedDeg).not.toBe(initialDeg);

    // Drag protractor header to reposition
    const headerBox = await widget.locator('div').first().boundingBox();
    expect(headerBox).toBeTruthy();
    if (headerBox) {
      await page.mouse.move(headerBox.x + 20, headerBox.y + 8);
      await page.mouse.down();
      await page.mouse.move(headerBox.x + 80, headerBox.y + 45, { steps: 5 });
      await page.mouse.up();
    }

    // Add floating ruler and tilt +15° twice -> 30° and persist across reload
    await page.click('#btn-add-floating-ruler');
    const fr = page.locator('.floating-ruler').first();
    await expect(fr).toBeVisible();
    await fr.locator('[data-floating-tilt-btn]').click();
    await fr.locator('[data-floating-tilt-btn]').click();
    await expect(fr).toHaveAttribute('data-angle-deg', '30.0');

    await page.reload();
    const frReloaded = page.locator('.floating-ruler').first();
    await expect(frReloaded).toBeVisible();
    await expect(frReloaded).toHaveAttribute('data-angle-deg', '30.0');
  });

  test('P2.2: named monitor profiles save/switch and history CSV/JSON export', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    // Apply diagonal 27" and save as "Office 27"
    await page.click('#tab-diagonal');
    await page.fill('#input-diagonal', '27');
    await page.click('#form-diagonal button[type="submit"]');
    const ppi27 = await page.locator('[data-cal-ppi]').first().textContent();

    await page.fill('#input-profile-name', 'Office 27');
    await page.click('#btn-save-named-profile');

    // Apply diagonal 15.6" and save as "Laptop 15"
    await page.fill('#input-diagonal', '15.6');
    await page.click('#form-diagonal button[type="submit"]');
    const ppi15 = await page.locator('[data-cal-ppi]').first().textContent();
    expect(ppi15).not.toBe(ppi27);

    await page.fill('#input-profile-name', 'Laptop 15');
    await page.click('#btn-save-named-profile');

    // Switch back to Office 27 profile chip
    const officeChip = page.locator('#saved-profiles-list [data-select-profile-id]', { hasText: 'Office 27' });
    await expect(officeChip).toBeVisible();
    await officeChip.click();
    await expect(page.locator('[data-cal-ppi]').first()).toHaveText(ppi27!);

    // Place two X guides, save span to history, and test CSV & JSON export buttons
    const stage = page.locator('#ruler-stage');
    await stage.scrollIntoViewIfNeeded();
    const stageBox = await stage.boundingBox();
    expect(stageBox).toBeTruthy();
    if (stageBox) {
      await page.mouse.click(stageBox.x + 80, stageBox.y + 80);
      await page.mouse.click(stageBox.x + 220, stageBox.y + 80);
    }
    await expect(page.locator('#btn-save-span')).toBeVisible();
    await page.click('#btn-save-span');

    const [csvDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#btn-export-history-csv'),
    ]);
    expect(csvDownload.suggestedFilename()).toMatch(/\.csv$/);

    const [jsonDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#btn-export-history-json'),
    ]);
    expect(jsonDownload.suggestedFilename()).toMatch(/\.json$/);
  });

  test('P2.3: compact /embed mode, embed popover, /screen-size-detector, and /printable-ruler SVG', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    // 1. Embed snippet popover on home page
    await page.goto('/');
    await page.click('#btn-embed-code');
    const popover = page.locator('#embed-snippet-popover');
    await expect(popover).toBeVisible();
    await expect(page.locator('#embed-snippet-textarea')).toHaveValue(/\/embed/);

    // 2. /embed route renders zero header/footer and functional unit switching
    await page.goto('/embed');
    expect(await page.locator('header').count()).toBe(0);
    expect(await page.locator('footer').count()).toBe(0);
    await page.click('[data-unit-btn="in"]');
    await expect(page.locator('[data-unit-btn="in"]')).toHaveAttribute('data-active', 'true');

    // 3. ?embed=1 sets data-embed-mode="true" on any route
    await page.goto('/cm-ruler?embed=1');
    await expect(page.locator('html')).toHaveAttribute('data-embed-mode', 'true');

    // 4. /screen-size-detector displays live telemetry & applies diagonal calibration
    await page.goto('/screen-size-detector');
    await expect(page.locator('#det-css-res')).not.toHaveText('—');
    await expect(page.locator('#det-dpr')).not.toHaveText('—');
    await page.click('[data-detector-diag="27"]');
    await expect(page.locator('#det-calc-css-ppi')).toContainText('CSS px/in');
    await page.click('#btn-detector-save-cal');
    await expect(page.locator('#detector-saved-banner')).toBeVisible();
    const a11yDet = await new AxeBuilder({ page }).analyze();
    expect(a11yDet.violations).toEqual([]);

    // 5. /printable-ruler renders SVG templates with mandatory 100.0 mm verification bar
    await page.goto('/printable-ruler');
    const svgSheet = page.locator('#printable-svg-sheet svg');
    await expect(svgSheet).toBeVisible();
    await expect(svgSheet).toContainText('100.0 mm');
    await page.click('[data-print-template="protractor-360"]');
    await expect(svgSheet).toContainText('330°');
    await page.selectOption('#select-print-paper', 'letter');
    await expect(page.locator('#print-sheet-dims')).toContainText('215.9');

    const [svgDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#btn-download-svg'),
    ]);
    expect(svgDownload.suggestedFilename()).toMatch(/\.svg$/);
    const a11yPrint = await new AxeBuilder({ page }).analyze();
    expect(a11yPrint.violations).toEqual([]);
  });
});
