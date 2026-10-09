import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('./')
})

test('renders the timeline and allows selecting stories', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'The timeline' })).toBeVisible()
  const ironMan = page.getByRole('button', { name: /Iron Man, 2008/ })
  const wandaVision = page.getByRole('button', { name: /WandaVision, 2023/ })
  await expect(ironMan).toBeVisible()
  await wandaVision.click()
  await expect(wandaVision).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.details-section')).toContainText('WandaVision')
})

test('persists movie watch progress after reload', async ({ page }) => {
  await page.getByRole('button', { name: /Iron Man, 2008/ }).click()
  await page.getByRole('button', { name: 'Mark as watched' }).click()
  await expect(page.getByRole('button', { name: '✓ Watched' })).toBeVisible()
  await page.reload()
  await page.getByRole('button', { name: /Iron Man, 2008/ }).click()
  await expect(page.getByRole('button', { name: '✓ Watched' })).toBeVisible()
})

test('isolates watched state between demo timeline entries and persists each entry', async ({ page }) => {
  const ironMan = page.getByRole('button', { name: /Iron Man, 2008/ })
  const ironMan2 = page.getByRole('button', { name: /Iron Man 2, 2010/ })

  await ironMan.click()
  await page.getByRole('button', { name: 'Mark as watched' }).click()
  await expect(ironMan).toHaveClass(/is-watched/)
  await expect(ironMan2).not.toHaveClass(/is-watched/)

  await page.reload()
  await expect(page.getByRole('button', { name: /Iron Man, 2008/ })).toHaveClass(/is-watched/)
  await expect(page.getByRole('button', { name: /Iron Man 2, 2010/ })).not.toHaveClass(/is-watched/)
})

test('supports keyboard navigation and reduced motion', async ({ page }) => {
  const track = page.locator('.timeline-track')
  await track.focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('button', { name: /Captain America: The First Avenger, 1943/ })).toHaveAttribute('aria-pressed', 'true')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto')
})

test('keeps the timeline usable on a narrow viewport', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'MCU Chronology' })).toBeVisible()
  const track = page.locator('.timeline-track')
  expect(await track.evaluate(element => element.scrollWidth)).toBeGreaterThan(0)
  await expect(page.getByRole('button', { name: /Iron Man, 2008/ })).toBeVisible()
})

test('reveals details inline and closes with Escape', async ({ page }) => {
  const ironMan = page.getByRole('button', { name: /Iron Man, 2008/ })
  await ironMan.click()
  const details = page.locator('.details-section')
  await expect(details).toBeVisible()
  await expect(page.getByRole('button', { name: 'Close story details' })).toBeFocused()
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  await page.keyboard.press('Escape')
  await expect(details).toHaveCount(0)
  await expect(ironMan).toBeFocused()
})

test('closes details with the close button and allows selecting another story', async ({ page }) => {
  await page.getByRole('button', { name: /Iron Man, 2008/ }).click()
  await page.getByRole('button', { name: 'Close story details' }).click()
  await expect(page.locator('.details-section')).toHaveCount(0)
  await page.getByRole('button', { name: /WandaVision, 2023/ }).click()
  await expect(page.locator('.details-section')).toContainText('WandaVision')
})

test('reveals series title artwork in proportion to episode progress', async ({ page }) => {
  const wandaVision = page.getByRole('button', { name: /WandaVision, 2023/ })
  await expect(wandaVision.locator('.title-art-color')).toHaveCSS('width', '0px')
  await wandaVision.click()
  const firstEpisode = page.locator('.episode-row input[type="checkbox"]').first()
  await firstEpisode.check()
  const colorReveal = wandaVision.locator('.title-art-color')
  await expect(colorReveal).toHaveCSS('width', /.+/)
  await expect(wandaVision).toContainText('WandaVision')
})
