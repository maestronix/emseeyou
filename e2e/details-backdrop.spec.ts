import { expect, test } from '@playwright/test'

test('details background follows the selected story and changes on selection', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Captain Marvel/i }).click()

  const details = page.locator('#details')
  await expect(details).toBeVisible()
  await expect(details).toHaveCSS('--detail-backdrop', /cosmic\.svg/)

  await page.screenshot({ fullPage: true })

  // The centered details panel covers part of the timeline; use its supported keyboard navigation.
  await page.locator('.timeline-track').press('ArrowLeft')
  await page.locator('.timeline-track').press('ArrowLeft')
  await expect(page.locator('#details')).toHaveCSS('--detail-backdrop', /industrial\.svg/)
})
