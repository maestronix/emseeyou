import { expect, test } from '@playwright/test'

test('details use the selected story backdrop and reveal as a split-screen page', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Captain Marvel/i }).click()

  const details = page.locator('#details')
  await expect(details).toBeVisible()
  await expect(details).toHaveCSS('--detail-backdrop', /cosmic\.svg/)
  await expect(details).toHaveCSS('position', 'fixed')
  await expect(details).toHaveCSS('top', '0px')
  await expect(details).toHaveCSS('left', '0px')
  await expect(details).toHaveCSS('width', `${await page.evaluate(() => window.innerWidth)}px`)
  await expect(page.locator('.detail-shutter-top')).toBeVisible()
  await expect(page.locator('.detail-shutter-bottom')).toBeVisible()
  await expect(page.locator('.detail-shutter-top .timeline-line')).toBeAttached()
  await expect(page.locator('.detail-shutter-bottom .timeline-line')).toBeAttached()
  await expect(page.locator('.detail-shutter-top')).toHaveCSS('animation-name', 'split-open-top')
  await expect(page.locator('.detail-shutter-bottom')).toHaveCSS('animation-name', 'split-open-bottom')

  const splitY = await page.locator('.detail-shutter-top').evaluate(element => Number.parseFloat(getComputedStyle(element).getPropertyValue('--split-y')))
  expect(splitY).toBeGreaterThan(24)
  expect(splitY).toBeLessThan((await page.evaluate(() => window.innerHeight)) - 24)

  await page.getByRole('button', { name: /Close story details/i }).click()
  await expect(details).toBeHidden()

  await page.getByRole('button', { name: /Iron Man, 2008/i }).click()
  await expect(page.locator('#details')).toHaveCSS('--detail-backdrop', /industrial\.svg/)
})
