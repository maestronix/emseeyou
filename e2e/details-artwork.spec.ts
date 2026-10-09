import { expect, test } from '@playwright/test'

test('details artwork follows the selected title and uses only local assets', async ({ page }) => {
  await page.goto('./')

  await page.getByRole('button', { name: /^Iron Man,/ }).click()
  const details = page.locator('.details-section')
  const ironManArt = details.getByTestId('details-title-art')
  await expect(ironManArt).toBeVisible()
  await expect(ironManArt).toHaveAttribute('src', /assets\/logos\/iron-man\.svg$/)
  await expect.poll(() => ironManArt.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0)

  await details.getByRole('button', { name: /Close story details/ }).click()
  await page.getByRole('button', { name: /^WandaVision,/ }).click()
  const wandaArt = page.locator('.details-section').getByTestId('details-title-art')
  await expect(wandaArt).toHaveAttribute('src', /assets\/logos\/wandavision\.svg$/)
  await expect.poll(() => wandaArt.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0)

  await page.locator('.detail-close').click()
  await page.getByRole('button', { name: /^Thor,/ }).click()
  const fallbackArt = page.locator('.details-section').getByTestId('details-title-art')
  await expect(fallbackArt).toHaveAttribute('src', /assets\/fallbacks\/title-mark\.svg$/)
  await expect.poll(() => fallbackArt.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0)

  const remoteImages = await page.locator('.details-section img').evaluateAll(images =>
    images.filter(image => !image.getAttribute('src')?.startsWith(window.location.origin)).length,
  )
  expect(remoteImages).toBe(0)
})
