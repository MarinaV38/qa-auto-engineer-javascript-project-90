import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { UsersPage } from './pages/UsersPage';
import { mockLogin } from './utils/session';

const generateUser = () => {
  const id = Date.now();
  return {
    email: `auto-user-${id}@example.com`,
    firstName: `Auto${id}`,
    lastName: `Tester${id}`,
  };
};

test.describe.serial('Users', () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page);
    const usersPage = new UsersPage(page);
    await usersPage.goto();
  });

  test('create user and show in list', async ({ page }) => {
    const usersPage = new UsersPage(page);
    const user = generateUser();

    await usersPage.expectListColumns();
    await usersPage.openCreateForm();
    await usersPage.fillUserForm(user);
    await usersPage.saveForm();
    await usersPage.expectUserInList(user);
  });

  test('edit user and validate email', async ({ page }) => {
    const usersPage = new UsersPage(page);
    const user = generateUser();
    const updatedUser = {
      email: `updated-${user.email}`,
      firstName: `${user.firstName}-upd`,
      lastName: `${user.lastName}-upd`,
    };

    await usersPage.openCreateForm();
    await usersPage.fillUserForm(user);
    await usersPage.saveForm();

    await usersPage.openEdit(user.email);

    // Проверяем валидацию email.
    await usersPage.page.getByLabel(/email/i).fill('invalid-email');
    await usersPage.page.getByRole('button', { name: /save/i }).click();
    await expect(usersPage.page.getByText(/incorrect email format/i)).toBeVisible();

    // Вводим корректные данные и сохраняем.
    await usersPage.fillUserForm(updatedUser);
    await usersPage.saveForm();
    await usersPage.expectUserInList(updatedUser);
  });

  test('delete single user', async ({ page }) => {
    const usersPage = new UsersPage(page);
    const user = generateUser();

    await usersPage.openCreateForm();
    await usersPage.fillUserForm(user);
    await usersPage.saveForm();

    await usersPage.rowCheckbox(user.email).check();
    await usersPage.bulkDeleteButton().click();
    await usersPage.confirmDeletion();
    await usersPage.expectUserNotInList(user.email);
  });

  test('bulk delete all users', async ({ page }) => {
    const usersPage = new UsersPage(page);
    const firstUser = generateUser();
    const secondUser = generateUser();

    // Добавим несколько пользователей, чтобы было что удалять.
    await usersPage.openCreateForm();
    await usersPage.fillUserForm(firstUser);
    await usersPage.saveForm();

    await usersPage.openCreateForm();
    await usersPage.fillUserForm(secondUser);
    await usersPage.saveForm();

    const beforeCount = await usersPage.dataRows().count();
    expect(beforeCount).toBeGreaterThan(0);

    await usersPage.headerCheckbox().check();
    await usersPage.bulkDeleteButton().click();
    await usersPage.confirmDeletion();

    await expect(usersPage.dataRows()).toHaveCount(0);
  });
});
