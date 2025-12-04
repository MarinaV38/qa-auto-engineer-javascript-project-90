import { test, expect } from '@playwright/test'
import Auth from './pages/Auth.js'
import Statuses from './pages/Statuses.js'
import { uniq } from './utils/index.js'

test.beforeEach(async ({ page }) => {
  const login = new Auth(page)
  await login.goto()
  await login.loginAs('qa_user', 'any_password')

  const statuses = new Statuses(page)
  await statuses.goto()
})

test('создание статуса и отображение в списке', async ({ page }) => {
  const statuses = new Statuses(page)

  const name = uniq(test.info(), 'Status')
  const slug = uniq(test.info(), 'slug')

  await statuses.openCreate()
  await statuses.fillStatus({ name, slug })
  await statuses.save()
  await statuses.assertRowVisible(name, slug)
})

test('редактирование статуса и проверка required', async ({ page }) => {
  const statuses = new Statuses(page)

  const name = uniq(test.info(), 'Status')
  const slug = uniq(test.info(), 'slug')
  await statuses.openCreate()
  await statuses.fillStatus({ name, slug })
  await statuses.save()
  await statuses.assertRowVisible(name, slug)

  await statuses.openEdit(name)
  await statuses.inputName.fill('')
  await statuses.saveBtn.click()
  await expect(statuses.saveBtn).toBeVisible()

  const updatedName = uniq(test.info(), 'Updated')
  const updatedSlug = uniq(test.info(), 'updated-slug')
  await statuses.fillStatus({ name: updatedName, slug: updatedSlug })
  await statuses.save()
  await statuses.assertRowVisible(updatedName, updatedSlug)
})

test('удаление одного статуса', async ({ page }) => {
  const statuses = new Statuses(page)

  const name = uniq(test.info(), 'Status')
  const slug = uniq(test.info(), 'slug')
  await statuses.openCreate()
  await statuses.fillStatus({ name, slug })
  await statuses.save()
  await statuses.assertRowVisible(name, slug)

  await statuses.deleteOneByName(name)
  await expect(statuses.rowByName(name)).toHaveCount(0)
})

test('массовое удаление статусов (select all)', async ({ page }) => {
  const statuses = new Statuses(page)

  const first = uniq(test.info(), 'Status1')
  const firstSlug = uniq(test.info(), 'slug1')
  await statuses.openCreate()
  await statuses.fillStatus({ name: first, slug: firstSlug })
  await statuses.save()

  const second = uniq(test.info(), 'Status2')
  const secondSlug = uniq(test.info(), 'slug2')
  await statuses.openCreate()
  await statuses.fillStatus({ name: second, slug: secondSlug })
  await statuses.save()

  await statuses.deleteAll()

  await expect(statuses.rowByName(first)).toHaveCount(0)
  await expect(statuses.rowByName(second)).toHaveCount(0)
})
