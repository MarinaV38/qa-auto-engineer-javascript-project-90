import { test, expect } from '@playwright/test';
import { StatusesPage } from './pages/StatusesPage';
import { mockLogin } from './utils/session';

const generateStatus = () => {
  const id = Date.now();
  return {
    name: `Auto Status ${id}`,
    slug: `auto-status-${id}`,
  };
};

test.describe.serial('Task Statuses', () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page);
    const statusesPage = new StatusesPage(page);
    await statusesPage.goto();
  });

  test('create status and show in list', async ({ page }) => {
    const statusesPage = new StatusesPage(page);
    const status = generateStatus();

    await statusesPage.expectListColumns();
    await statusesPage.openCreateForm();
    await statusesPage.fillForm(status);
    await statusesPage.saveForm();
    await statusesPage.expectStatusInList(status);
  });

  test('edit status and validate required fields', async ({ page }) => {
    const statusesPage = new StatusesPage(page);
    const status = generateStatus();
    const updatedStatus = {
      name: `${status.name} Updated`,
      slug: `${status.slug}-updated`,
    };

    await statusesPage.openCreateForm();
    await statusesPage.fillForm(status);
    await statusesPage.saveForm();

    await statusesPage.openEdit(status.name);

    // Проверка required для имени.
    await statusesPage.page.getByLabel(/name/i).fill('');
    await statusesPage.page.getByRole('button', { name: /save/i }).click();
    await expect(statusesPage.page.getByText(/required/i)).toBeVisible();

    await statusesPage.fillForm(updatedStatus);
    await statusesPage.saveForm();
    await statusesPage.expectStatusInList(updatedStatus);
  });

  test('delete single status', async ({ page }) => {
    const statusesPage = new StatusesPage(page);
    const status = generateStatus();

    await statusesPage.openCreateForm();
    await statusesPage.fillForm(status);
    await statusesPage.saveForm();

    await statusesPage.rowCheckbox(status.name).check();
    await statusesPage.bulkDeleteButton().click();
    await statusesPage.confirmDeletion();
    await statusesPage.expectStatusNotInList(status.name);
  });

  test('bulk delete all statuses', async ({ page }) => {
    const statusesPage = new StatusesPage(page);
    const firstStatus = generateStatus();
    const secondStatus = generateStatus();

    await statusesPage.openCreateForm();
    await statusesPage.fillForm(firstStatus);
    await statusesPage.saveForm();

    await statusesPage.openCreateForm();
    await statusesPage.fillForm(secondStatus);
    await statusesPage.saveForm();

    const beforeCount = await statusesPage.dataRows().count();
    expect(beforeCount).toBeGreaterThan(0);

    await statusesPage.headerCheckbox().check();
    await statusesPage.bulkDeleteButton().click();
    await statusesPage.confirmDeletion();

    await expect(statusesPage.dataRows()).toHaveCount(0);
  });
});
