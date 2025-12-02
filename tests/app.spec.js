import { test, expect } from '@playwright/test';
import { mockLogin } from './utils/session';

test.beforeEach(async ({ page }) => {
  await mockLogin(page);
});

test('application renders dashboard', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Welcome to the administration' }),
  ).toBeVisible();
});
