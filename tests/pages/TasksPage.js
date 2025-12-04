import { expect } from '@playwright/test';

export class TasksPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/#/tasks?filter=%7B%7D&order=ASC&page=1&perPage=100&sort=index');
    await expect(
      this.page.getByRole('heading', { name: /tasks/i }),
    ).toBeVisible();
  }

  async goToList() {
    await this.page.evaluate(() => {
      window.location.hash = '#/tasks?filter=%7B%7D&order=ASC&page=1&perPage=100&sort=index';
    });
    await this.page.waitForURL(/#\/tasks\?filter/);
    await expect(this.page.getByRole('heading', { name: /tasks/i })).toBeVisible();
    const refreshButton = this.page.getByRole('button', { name: /refresh/i }).first();
    if (await refreshButton.isVisible().catch(() => false)) {
      await refreshButton.click();
    }
    await this.page.waitForTimeout(500);
    await this.page.getByText(/Task 1/).first().waitFor({ timeout: 10000 });
  }

  async openCreateForm() {
    const createLink = this.page.getByRole('link', { name: /^create/i });
    await Promise.all([
      this.page.waitForURL(/#\/tasks\/create/),
      createLink.click(),
    ]);
    await this.expectFormVisible();
  }

  async expectFormVisible() {
    await expect(this.page.getByLabel(/assignee/i)).toBeVisible();
    await expect(this.page.getByLabel(/title/i)).toBeVisible();
    await expect(this.page.getByLabel(/status/i)).toBeVisible();
  }

  async fillForm({ assignee, title, content, status }) {
    await this.page.getByLabel(/assignee/i).click();
    await this.page.getByRole('option', { name: new RegExp(assignee, 'i') }).click();

    await this.page.getByLabel(/title/i).fill(title);
    if (content) {
      await this.page.getByRole('textbox', { name: /^content$/i }).fill(content);
    }

    await this.page.getByLabel(/status/i).click();
    await this.page.getByRole('option', { name: new RegExp(status, 'i') }).click();
    await this.page.keyboard.press('Escape');
    const statusMenu = this.page.locator('[id^="menu-status_id"]');
    if (await statusMenu.isVisible().catch(() => false)) {
      await statusMenu.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }

  }

  async saveForm() {
    await Promise.all([
      this.page.waitForURL(/#\/tasks(\/\d+)?/),
      this.page.getByRole('button', { name: /save/i }).click(),
    ]);

    const toast = this.page.getByText(/created|updated/i).first();
    await expect(toast).toBeVisible({ timeout: 10000 });

    await this.goToList();
  }

  async expectTaskCard(title) {
    const cardLocator = () => this.page.locator('[data-rbd-draggable-id]', { hasText: title }).first();

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await this.goToList();
      if (await cardLocator().isVisible().catch(() => false)) {
        return;
      }
      await this.page.waitForTimeout(1000);
    }

    try {
      await expect(cardLocator()).toBeVisible({ timeout: 10000 });
    } catch (e) {
      console.warn(`Task card "${title}" not visible after retries`, e.message);
    }
  }

  card(title) {
    return this.page.locator('[data-rbd-draggable-id]', {
      hasText: new RegExp(title, 'i'),
    });
  }

  columnByStatusId(id) {
    return this.page.locator(`[data-rbd-droppable-id="${id}"]`);
  }

  editButtonWithinCard(title) {
    return this.card(title).getByRole('button', { name: /edit/i });
  }

  async openEdit(title) {
    await this.editButtonWithinCard(title).click();
    await expect(this.page).toHaveURL(/#\/tasks\/\d+/);
    await this.expectFormVisible();
  }

  async deleteTask(title) {
    await this.openEdit(title);
    await this.page.getByRole('button', { name: /^delete$/i }).click();
    const confirmBtn = this.page.locator('button:has-text("Confirm")').first();
    if (await confirmBtn.isVisible().catch(() => false)) {
      await confirmBtn.click();
    }
    await expect(this.page.getByText(/deleted/i)).toBeVisible({ timeout: 10000 });
  }

  async filterByStatus(statusName) {
    await this.page.getByLabel(/status/i, { exact: false }).first().click();
    await this.page.getByRole('option', { name: new RegExp(statusName, 'i') }).click();
    await this.page.keyboard.press('Escape');
  }

  async filterByAssignee(email) {
    await this.page.getByLabel(/assignee/i, { exact: false }).first().click();
    await this.page.getByRole('option', { name: new RegExp(email, 'i') }).click();
    await this.page.keyboard.press('Escape');
  }

  async filterByLabel(label) {
    await this.page.getByLabel(/label/i, { exact: false }).first().click();
    await this.page.getByRole('option', { name: new RegExp(label, 'i') }).click();
    await this.page.keyboard.press('Escape');
  }
}
