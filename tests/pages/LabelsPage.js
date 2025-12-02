import { expect } from '@playwright/test';

export class LabelsPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/#/labels');
    await expect(
      this.page.getByRole('columnheader', { name: /name/i }),
    ).toBeVisible();
  }

  async openCreateForm() {
    const createLink = this.page.getByRole('link', { name: /^create/i });
    await Promise.all([
      this.page.waitForURL(/#\/labels\/create/),
      createLink.click(),
    ]);
    await this.expectFormVisible();
  }

  async expectFormVisible() {
    await expect(this.page.getByLabel(/name/i)).toBeVisible();
  }

  async fillForm({ name }) {
    await this.page.getByLabel(/name/i).fill(name);
  }

  async saveForm() {
    await Promise.all([
      this.page.waitForURL(/#\/labels(\/\d+)?/),
      this.page.getByRole('button', { name: /save/i }).click(),
    ]);

    const toast = this.page.getByText(/created|updated/i).first();
    if (await toast.isVisible().catch(() => false)) {
      await expect(toast).toBeVisible({ timeout: 5000 });
    }

    if (/#\/labels\/\d+/.test(this.page.url())) {
      await this.page.evaluate(() => {
        window.location.hash = '#/labels';
      });
      await this.page.waitForURL(/#\/labels$/);
    }
  }

  async expectListColumns() {
    await expect(this.page.getByRole('columnheader', { name: /name/i })).toBeVisible();
  }

  async expectLabelInList({ name }) {
    if (!/#\/labels/.test(this.page.url())) {
      await this.goto();
    } else {
      const refreshButton = this.page.getByRole('button', { name: /refresh/i }).first();
      if (await refreshButton.isVisible().catch(() => false)) {
        await refreshButton.click();
      }
    }

    await expect(this.page.getByRole('columnheader', { name: /name/i })).toBeVisible();
    await expect(this.page.getByText(new RegExp(name, 'i'))).toBeVisible({ timeout: 20000 });
  }

  async expectLabelNotInList(name) {
    await expect(this.page.getByRole('cell', { name: new RegExp(name, 'i') })).toHaveCount(0);
  }

  async openEdit(name) {
    await this.page.getByRole('row', { name: new RegExp(name, 'i') }).click();
    await expect(this.page).toHaveURL(/#\/labels\/\d+/);
    await this.expectFormVisible();
  }

  rowCheckbox(name) {
    return this.page
      .getByRole('row', { name: new RegExp(name, 'i') })
      .getByRole('checkbox');
  }

  headerCheckbox() {
    return this.page.locator('thead input[type="checkbox"]').first();
  }

  bulkDeleteButton() {
    return this.page.getByRole('button', { name: /^delete$/i });
  }

  async confirmDeletion() {
    const confirmButton = this.page.locator('button:has-text("Confirm")').first();
    const isVisible = await confirmButton.isVisible().catch(() => false);
    if (isVisible) {
      await confirmButton.click();
    }
    await expect(this.page.getByText(/deleted/i)).toBeVisible({ timeout: 10000 });
  }

  dataRows() {
    return this.page.locator('tbody tr');
  }
}
