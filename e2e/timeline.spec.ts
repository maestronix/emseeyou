import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('renders the timeline and allows selecting stories', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'The timeline' })).toBeVisible()
  const ironMan = page.getByRole('button', { name: /Iron Man, 2010/ })
  const wandaVision = page.getByRole('button', { name: /WandaVision, 2023/ })
  await expect(ironMan).toBeVisible()
  await wandaVision.click()
  await expect(wandaVision).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('#details')).toContainText('WandaVision')
})

test('persists movie watch progress after reload', async ({ page }) => {
  await page.getByRole('button', { name: /Iron Man, 2010/ }).click()
  await page.getByRole('button', { name: 'Mark as watched' }).click()
  await expect(page.getByRole('button', { name: '✓ Watched' })).toBeVisible()
  await page.reload()
  await page.getByRole('button', { name: /Iron Man, 2010/ }).click()
  await expect(page.getByRole('button', { name: '✓ Watched' })).toBeVisible()
})

test('supports keyboard navigation and reduced motion', async ({ page }) => {
  const track = page.locator('.timeline-track')
  await track.focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('button', { name: /WandaVision, 2023/ })).toHaveAttribute('aria-pressed', 'true')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto')
})

test('keeps the timeline usable on a narrow viewport', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Every story. One timeline.' })).toBeVisible()
  const track = page.locator('.timeline-track')
  expect(await track.evaluate(element => element.scrollWidth)).toBeGreaterThan(0)
  await expect(page.getByRole('button', { name: /Iron Man, 2010/ })).toBeVisible()
})
