import { test, expect } from '@playwright/test';
import { LabelsPage } from './pages/LabelsPage';

const generateLabel = () => {
  const id = Date.now();
  return {
    name: `Auto Label ${id}`,
  };
};

test.describe.serial('Labels', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('username', 'admin');
      window.localStorage.removeItem('ra.list.labels');
    });
    const labelsPage = new LabelsPage(page);
    await labelsPage.goto();
  });

  test('create label and show in list', async ({ page }) => {
    const labelsPage = new LabelsPage(page);
    const label = generateLabel();

    await labelsPage.expectListColumns();
    await labelsPage.openCreateForm();
    await labelsPage.fillForm(label);
    await labelsPage.saveForm();
    await labelsPage.expectLabelInList(label);
  });

  test('edit label and validate required field', async ({ page }) => {
    const labelsPage = new LabelsPage(page);
    const label = generateLabel();
    const updatedLabel = { name: `${label.name} Updated` };

    await labelsPage.openCreateForm();
    await labelsPage.fillForm(label);
    await labelsPage.saveForm();

    await labelsPage.openEdit(label.name);

    await labelsPage.page.getByLabel(/name/i).fill('');
    await labelsPage.page.getByRole('button', { name: /save/i }).click();
    await expect(labelsPage.page.getByText(/required/i)).toBeVisible();

    await labelsPage.fillForm(updatedLabel);
    await labelsPage.saveForm();
    await labelsPage.expectLabelInList(updatedLabel);
  });

  test('delete single label', async ({ page }) => {
    const labelsPage = new LabelsPage(page);
    const label = generateLabel();

    await labelsPage.openCreateForm();
    await labelsPage.fillForm(label);
    await labelsPage.saveForm();

    await labelsPage.rowCheckbox(label.name).check();
    await labelsPage.bulkDeleteButton().click();
    await labelsPage.confirmDeletion();
    await labelsPage.expectLabelNotInList(label.name);
  });

  test('bulk delete all labels', async ({ page }) => {
    const labelsPage = new LabelsPage(page);
    const firstLabel = generateLabel();
    const secondLabel = generateLabel();

    await labelsPage.openCreateForm();
    await labelsPage.fillForm(firstLabel);
    await labelsPage.saveForm();

    await labelsPage.openCreateForm();
    await labelsPage.fillForm(secondLabel);
    await labelsPage.saveForm();

    const beforeCount = await labelsPage.dataRows().count();
    expect(beforeCount).toBeGreaterThan(0);

    await labelsPage.headerCheckbox().check();
    await labelsPage.bulkDeleteButton().click();
    await labelsPage.confirmDeletion();

    await expect(labelsPage.dataRows()).toHaveCount(0);
  });
});
