import { test } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

test.describe('Authentication', () => {
  test('user can sign in with any credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.login();
    await dashboardPage.expectVisible();
  });

  test('user can log out from the dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.login();
    await dashboardPage.expectVisible();

    await dashboardPage.logout();
    await loginPage.expectVisible();
  });
});
