import { expect, test } from '@playwright/test'

test('details background follows the selected story and changes on selection', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Captain Marvel/i }).click()

  const details = page.locator('#details')
  await expect(details).toBeVisible()
  await expect(details).toHaveCSS('--detail-backdrop', /cosmic\.svg/)

  await page.screenshot({ fullPage: true })

  await page.getByRole('button', { name: /Iron Man/i }).first().click()
  await expect(page.locator('#details')).toHaveCSS('--detail-backdrop', /industrial\.svg/)
})
