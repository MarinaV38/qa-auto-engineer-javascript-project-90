import { expect } from '@playwright/test';

export class UsersPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/#/users');
    await expect(this.page.getByRole('heading', { name: /users/i })).toBeVisible();
  }

  async openCreateForm() {
    const createLink = this.page.getByRole('link', {
      name: /^create/i,
    });
    await Promise.all([
      this.page.waitForURL(/#\/users\/create/),
      createLink.click(),
    ]);
    await this.expectFormVisible();
  }

  async expectFormVisible() {
    await expect(this.page.getByLabel(/email/i)).toBeVisible();
    await expect(this.page.getByLabel(/first name/i)).toBeVisible();
    await expect(this.page.getByLabel(/last name/i)).toBeVisible();
  }

  async fillUserForm({ email, firstName, lastName }) {
    await this.page.getByLabel(/email/i).fill(email);
    await this.page.getByLabel(/first name/i).fill(firstName);
    await this.page.getByLabel(/last name/i).fill(lastName);
  }

  async saveForm() {
    await Promise.all([
      this.page.waitForURL(/#\/users(\/\d+)?/),
      this.page.getByRole('button', { name: /save/i }).click(),
    ]);

    // После сохранения нас может вернуть на шоу/редактирование. Возвращаемся в список.
    if (/#\/users\/\d+/.test(this.page.url())) {
      await this.goto();
    }
  }

  async expectListColumns() {
    await expect(this.page.getByRole('columnheader', { name: /email/i })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: /first name/i })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: /last name/i })).toBeVisible();
  }

  async expectUserInList({ email, firstName, lastName }) {
    if (!/#\/users/.test(this.page.url())) {
      await this.goto();
    } else {
      const refreshButton = this.page.getByRole('button', { name: /refresh/i }).first();
      if (await refreshButton.isVisible().catch(() => false)) {
        await refreshButton.click();
      }
    }

    const timeout = 15000;
    const refreshButton = this.page.getByRole('button', { name: /refresh/i }).first();
    if (await refreshButton.isVisible().catch(() => false)) {
      await refreshButton.click();
    }
    await expect(this.page.getByText(new RegExp(email, 'i'))).toBeVisible({ timeout });
    await expect(this.page.getByText(new RegExp(firstName, 'i'))).toBeVisible({ timeout });
    await expect(this.page.getByText(new RegExp(lastName, 'i'))).toBeVisible({ timeout });
  }

  async expectUserNotInList(email) {
    await expect(this.page.getByRole('cell', { name: new RegExp(email, 'i') })).toHaveCount(0);
  }

  async openEdit(email) {
    await this.page.getByRole('row', { name: new RegExp(email, 'i') }).click();
    await expect(this.page).toHaveURL(/#\/users\/\d+/);
    await this.expectFormVisible();
  }

  rowCheckbox(email) {
    return this.page
      .getByRole('row', { name: new RegExp(email, 'i') })
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
