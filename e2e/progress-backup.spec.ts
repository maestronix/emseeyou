import { expect, test } from '@playwright/test'

test('watch progress can be exported and imported as a versioned backup', async ({ page }) => {
  await page.goto('/')
  await page.locator('button.timeline-item').first().click()
  await page.getByRole('button', { name: 'Mark as watched' }).click()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export progress' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('emseeyou-progress.json')
  const path = await download.path()
  expect(path).toBeTruthy()

  const backup = JSON.parse(await (await import('node:fs/promises')).readFile(path!, 'utf8'))
  expect(backup.schemaVersion).toBe(1)
  expect(Object.values(backup.movies).some((value) => value === true)).toBe(true)
  expect(backup.episodes).toBeDefined()

  page.once('dialog', (dialog) => dialog.accept())
  await page.locator('input[aria-label="Import progress backup"]').setInputFiles(path!)
  await expect(page.getByRole('button', { name: '✓ Watched' })).toBeVisible()
})

test('invalid progress backup is rejected without replacing current progress', async ({ page }) => {
  await page.goto('/')
  await page.locator('button.timeline-item').first().click()
  await page.getByRole('button', { name: 'Mark as watched' }).click()

  page.once('dialog', (dialog) => dialog.accept())
  page.once('dialog', (dialog) => dialog.dismiss())
  await page.locator('input[aria-label="Import progress backup"]').setInputFiles({
    name: 'invalid.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ schemaVersion: 999, movies: {}, episodes: {} })),
  })
  await expect(page.getByRole('button', { name: '✓ Watched' })).toBeVisible()
})
