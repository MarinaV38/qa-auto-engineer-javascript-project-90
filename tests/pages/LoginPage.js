import { expect } from '@playwright/test';

export class LoginPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
  }

  get usernameInput() {
    return this.page.getByLabel(/username/i);
  }

  get passwordInput() {
    return this.page.getByLabel(/password/i);
  }

  get signInButton() {
    return this.page.getByRole('button', { name: /sign in/i });
  }

  async login({ username = 'admin', password = 'password' } = {}) {
    await this.goto();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async expectVisible() {
    await expect(this.signInButton).toBeVisible();
  }
}
