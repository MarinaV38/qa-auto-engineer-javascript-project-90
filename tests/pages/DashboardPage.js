import { expect } from '@playwright/test';

export class DashboardPage {
  constructor(page) {
    this.page = page;
  }

  get heading() {
    return this.page.getByRole('heading', {
      name: /welcome to the administration/i,
    });
  }

  get userMenuButton() {
    // В интерфейсе есть кнопка открытия сайдбара и кнопка профиля.
    // Берём именно кнопку профиля, у неё aria-label = "Profile".
    return this.page.getByRole('button', { name: /profile/i });
  }

  get logoutMenuItem() {
    return this.page.getByRole('menuitem', { name: /logout/i });
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible();
  }

  async openUserMenu() {
    await this.userMenuButton.click();
  }

  async logout() {
    await this.openUserMenu();
    await this.logoutMenuItem.click();
  }
}
