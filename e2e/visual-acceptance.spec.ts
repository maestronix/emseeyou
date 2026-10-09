import { expect, test } from '@playwright/test'

async function attachScreenshot(page: import('@playwright/test').Page, testInfo: import('@playwright/test').TestInfo, name: string) {
  const screenshot = await page.screenshot({ fullPage: true, animations: 'disabled' })
  await testInfo.attach(name, { body: screenshot, contentType: 'image/png' })
}

test('visual acceptance: timeline and selected details render without page overflow', async ({ page }, testInfo) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /MCU Chronology/i })).toBeVisible()
  await expect(page.locator('.timeline-item').first()).toBeVisible()
  await page.evaluate(() => document.fonts.ready)

  const timelineScreenshot = await page.screenshot({ fullPage: true, animations: 'disabled' })
  await testInfo.attach(`timeline-${testInfo.project.name}`, { body: timelineScreenshot, contentType: 'image/png' })

  const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth)
  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth)
  expect(pageWidth, 'the document must not overflow horizontally; timeline scrolling stays inside its track').toBeLessThanOrEqual(viewportWidth)

  await page.locator('.timeline-item').first().click()
  await expect(page.locator('.details-section')).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'Iron Man' })).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await attachScreenshot(page, testInfo, `details-${testInfo.project.name}`)

  const brokenImages = await page.locator('img').evaluateAll(images => images
    .filter(image => image instanceof HTMLImageElement && (!image.complete || image.naturalWidth === 0))
    .map(image => (image as HTMLImageElement).getAttribute('src')))
  expect(brokenImages, 'all visible and bundled artwork must load').toEqual([])
})
