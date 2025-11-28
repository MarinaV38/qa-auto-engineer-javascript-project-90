import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Сохраняем пользователя заранее, чтобы избежать экран логина.
  await page.addInitScript(() => {
    window.localStorage.setItem('username', 'admin');
  });
});

test('application renders dashboard', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Welcome to the administration' }),
  ).toBeVisible();
});
