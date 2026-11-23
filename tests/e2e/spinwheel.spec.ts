import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'Mobile-360', width: 360, height: 740 },
  { name: 'Mobile-390', width: 390, height: 844 },
  { name: 'Tablet-768', width: 768, height: 1024 },
  { name: 'Laptop-1024', width: 1024, height: 768 },
  { name: 'Desktop-1440', width: 1440, height: 900 },
  { name: 'Projector-1920', width: 1920, height: 1080 },
];

test.describe('AWS Student Builder Group — COMSATS University Islamabad E2E Verification', () => {
  test('renders branding, responsive layout without horizontal overflow across 360px to 1920px viewports', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for splash screen to finish or verify branding
    await expect(page.locator('h1', { hasText: 'AWS Student Builder Group' }).first()).toBeVisible({
      timeout: 8000,
    });
    await expect(page.getByText('COMSATS University Islamabad').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Let the Wheel Decide!' })).toBeVisible({
      timeout: 8000,
    });

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(80);

      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalOverflow, `No horizontal overflow at ${vp.name}`).toBe(false);

      await expect(page.getByTestId('spin-wheel-canvas')).toBeVisible();
      await expect(page.getByTestId('spin-wheel-button')).toBeVisible();
    }
  });

  test('can unlock Organizer Sandbox mode, spin the wheel, announce a winner, and update history', async ({
    page,
  }) => {
    // Emulate reduced motion for fast E2E spin completion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Let the Wheel Decide!' })).toBeVisible({
      timeout: 8000,
    });

    // Open Organizer Controls
    await page.getByRole('button', { name: /Open Organizer Controls/i }).click();
    await expect(page.getByTestId('organizer-panel')).toBeVisible();

    // Unlock with Organizer PIN 2026
    await page.getByTestId('organizer-pin-input').fill('2026');
    await page.getByTestId('organizer-pin-unlock-btn').click();

    // Enable Test Sandbox Mode with 12 students
    await page.getByTestId('toggle-sandbox-mode').click();
    await page.getByTestId('sandbox-size-12').click();

    // Close Organizer Drawer
    await page.getByRole('button', { name: /Close Organizer Controls/i }).click();

    await expect(page.getByTestId('header-participant-count')).toContainText('12');

    // Spin the wheel
    await page.getByTestId('spin-wheel-button').click();

    // Verify Winner Modal appears
    await expect(page.getByTestId('winner-modal')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('CONGRATULATIONS!')).toBeVisible();
    await expect(page.getByText('You are our lucky winner!')).toBeVisible();

    // Close modal and check winner history count incremented to 1 and eligible pool decreased to 11
    await page.getByTestId('winner-close-btn').click();
    await expect(page.getByTestId('winner-history-count')).toHaveText('1');
    await expect(page.getByTestId('header-participant-count')).toContainText('11');
  });
});
