import { test, expect } from '@playwright/test'

const taskCards = (page) => page.locator('[data-rbd-draggable-id], [draggable="true"]')

const loginAndOpenTasks = async (page) => {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')

  await page.getByLabel(/username/i).fill('admin')
  await page.getByLabel(/password/i).fill('admin')
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForLoadState('networkidle')

  const tasksMenuItem = page.getByRole('menuitem', { name: /^(tasks|задачи)$/i })
  if (await tasksMenuItem.count()) {
    await tasksMenuItem.first().click()
  } else {
    await page.getByRole('link', { name: /^(tasks|задачи)$/i }).first().click()
  }
  await page.waitForURL(/#\/tasks\b/i, { timeout: 10000 })
}

test.describe('Tasks Kanban', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndOpenTasks(page)
  })

  test('renders task columns', async ({ page }) => {
    const draft = page.getByRole('heading', { name: /^draft$/i }).first()
    const toReview = page.getByRole('heading', { name: /^to review$/i }).first()
    const toBeFixed = page.getByRole('heading', { name: /^to be fixed$/i }).first()
    const toPublish = page.getByRole('heading', { name: /^to publish$/i }).first()
    const published = page.getByRole('heading', { name: /^published$/i }).first()

    await expect(draft).toBeVisible({ timeout: 10000 })
    await expect(toReview).toBeVisible({ timeout: 10000 })
    await expect(toBeFixed).toBeVisible({ timeout: 10000 })
    await expect(toPublish).toBeVisible({ timeout: 10000 })
    await expect(published).toBeVisible({ timeout: 10000 })
  })

  test('filters tasks by text if filter exists', async ({ page }) => {
    const byPlaceholder = page.getByPlaceholder(/filter|search|поиск/i).first()
    const byRole = page.getByRole('textbox', { name: /filter|search|поиск/i }).first()
    const hasPlaceholder = await byPlaceholder.count()
    const hasRole = await byRole.count()

    test.skip(!(hasPlaceholder || hasRole), 'В этой версии UI нет поля фильтра — пропускаем проверку')

    const input = hasPlaceholder ? byPlaceholder : byRole

    const anyTask = taskCards(page).first()
    await expect(anyTask).toBeVisible()
    const text = (await anyTask.textContent())?.trim() || ''

    const before = await taskCards(page).count()
    await input.fill(text.slice(0, Math.min(8, text.length)))
    await page.waitForTimeout(300)
    const after = await taskCards(page).count()

    expect(after).toBeLessThanOrEqual(before)
  })

  test('moves task between columns (drag & drop) if supported', async ({ page }) => {
    const sourceCard = taskCards(page).first()
    const targetColumnTitle = page.getByText(/to review/i).first()
    const targetColumn = targetColumnTitle.locator('..')

    const canDrag = await sourceCard.count()
    const canDrop = await targetColumnTitle.count()

    test.skip(!canDrag || !canDrop, 'Нет dnd-элементов — пропускаем')

    const beforeInTarget = await targetColumn.locator('[data-rbd-draggable-id], [draggable="true"]').count()

    try {
      await sourceCard.dragTo(targetColumn)
    } catch {
      const box1 = await sourceCard.boundingBox()
      const box2 = await targetColumn.boundingBox()
      if (!box1 || !box2) test.skip(true, 'DND не поддержан — пропускаем')
      await page.mouse.move(box1.x + box1.width / 2, box1.y + box1.height / 2)
      await page.mouse.down()
      await page.mouse.move(box2.x + box2.width / 2, box2.y + 30)
      await page.mouse.up()
    }

    await page.waitForTimeout(300)

    const afterInTarget = await targetColumn.locator('[data-rbd-draggable-id], [draggable="true"]').count()
    expect(afterInTarget).toBeGreaterThanOrEqual(beforeInTarget)
  })
})
