import { test, expect } from '@playwright/test'
import Auth from './pages/Auth.js'
import Labels from './pages/Labels.js'
import { uniq } from './utils/index.js'

test.beforeEach(async ({ page }) => {
  const login = new Auth(page)
  await login.goto()
  await login.loginAs('qa_user', 'any_password')

  const labels = new Labels(page)
  await labels.goto()
})

test('создание метки и отображение в списке', async ({ page }) => {
  const labels = new Labels(page)

  const name = uniq(test.info(), 'Label')
  await labels.openCreate()
  await labels.fillLabel({ name })
  await labels.save()

  await labels.assertRowVisible(name)
})

test('редактирование метки и проверка required', async ({ page }) => {
  const labels = new Labels(page)

  const name = uniq(test.info(), 'Label')
  await labels.openCreate()
  await labels.fillLabel({ name })
  await labels.save()
  await labels.assertRowVisible(name)

  await labels.openEdit(name)
  await labels.name.fill('')
  await labels.saveBtn.click()
  await expect(labels.saveBtn).toBeVisible()

  const updated = uniq(test.info(), 'Updated')
  await labels.fillLabel({ name: updated })
  await labels.save()
  await labels.assertRowVisible(updated)
})

test('удаление одной метки', async ({ page }) => {
  const labels = new Labels(page)

  const name = uniq(test.info(), 'Label')
  await labels.openCreate()
  await labels.fillLabel({ name })
  await labels.save()

  await labels.deleteOneByName(name)
  await expect(labels.rowByName(name)).toHaveCount(0)
})

test('массовое удаление меток (select all)', async ({ page }) => {
  const labels = new Labels(page)

  const first = uniq(test.info(), 'Label1')
  await labels.openCreate()
  await labels.fillLabel({ name: first })
  await labels.save()

  const second = uniq(test.info(), 'Label2')
  await labels.openCreate()
  await labels.fillLabel({ name: second })
  await labels.save()

  await labels.deleteAll()

  await expect(labels.rowByName(first)).toHaveCount(0)
  await expect(labels.rowByName(second)).toHaveCount(0)
})
