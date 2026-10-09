import { expect, test } from '@playwright/test'

test('demo details stay tied to the selected title', async ({ page }) => {
  await page.goto('./')

  await page.getByRole('button', { name: /^Iron Man 2,/ }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: 'Iron Man 2' })).toBeVisible()
  await expect(dialog.getByText('A weapons manufacturer builds a powered suit after being captured.')).toHaveCount(0)
  await expect(dialog.getByText(/EPISODE 0[12]/)).toHaveCount(0)
  await dialog.getByRole('button', { name: 'Mark as watched' }).click()
  await expect(dialog.getByRole('button', { name: '✓ Watched' })).toBeVisible()
  await dialog.getByRole('button', { name: /Close story details/ }).click()

  await page.getByRole('button', { name: /^Thor,/ }).click()
  const thorDialog = page.getByRole('dialog')
  await expect(thorDialog.getByRole('heading', { name: 'Thor' })).toBeVisible()
  await expect(thorDialog.getByRole('button', { name: 'Mark as watched' })).toBeVisible()
  await expect(thorDialog.getByRole('button', { name: '✓ Watched' })).toHaveCount(0)
})

test('series without their own episode data show a placeholder, not WandaVision episodes', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: /^Loki,/ }).click()

  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: 'Loki' })).toBeVisible()
  await expect(dialog.getByText(/Episode tracking is unavailable for this demo series/)).toBeVisible()
  await expect(dialog.getByText(/Filmed Before a Live Studio Audience/)).toHaveCount(0)
  await expect(dialog.getByText(/Don't Touch That Dial/)).toHaveCount(0)
})
