import { test, expect } from '@playwright/test'
import Auth from './pages/Auth'

test('приложение рендерится и дашборд доступен', async ({ page }) => {
  const auth = new Auth(page)
  await auth.goto()
  await auth.loginAs('qa_user', 'any_password')

  await expect(page.getByRole('heading', { name: /welcome to the administration/i })).toBeVisible()
})
