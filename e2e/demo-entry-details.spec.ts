import { expect, test } from '@playwright/test'

test('demo details stay tied to the selected title', async ({ page }) => {
  await page.goto('./')

  await page.getByRole('button', { name: /^Iron Man 2,/ }).click()
  const details = page.locator('.details-section')
  await expect(details.getByRole('heading', { name: 'Iron Man 2' })).toBeVisible()
  await expect(details.getByText('A weapons manufacturer builds a powered suit after being captured.')).toHaveCount(0)
  await expect(details.getByText(/EPISODE 0[12]/)).toHaveCount(0)
  await details.getByRole('button', { name: 'Mark as watched' }).click()
  await expect(details.getByRole('button', { name: '✓ Watched' })).toBeVisible()
  await details.getByRole('button', { name: /Close story details/ }).click()

  await page.getByRole('button', { name: /^Thor,/ }).click()
  const thorDetails = page.locator('.details-section')
  await expect(thorDetails.getByRole('heading', { name: 'Thor' })).toBeVisible()
  await expect(thorDetails.getByRole('button', { name: 'Mark as watched' })).toBeVisible()
  await expect(thorDetails.getByRole('button', { name: '✓ Watched' })).toHaveCount(0)
})

test('series without their own episode data show a placeholder, not WandaVision episodes', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: /^Loki,/ }).click()

  const details = page.locator('.details-section')
  await expect(details.getByRole('heading', { name: 'Loki' })).toBeVisible()
  await expect(details.getByText(/Episode tracking is unavailable for this demo series/)).toBeVisible()
  await expect(details.getByText(/Filmed Before a Live Studio Audience/)).toHaveCount(0)
  await expect(details.getByText(/Don't Touch That Dial/)).toHaveCount(0)
})
