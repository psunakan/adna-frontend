import { test, expect } from '@playwright/test'

test.describe('Site navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test('homepage loads with main heading', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/A-DNA/)
  })

  test('main nav links route to expected pages', async ({ page }) => {
    await page.goto('/')

    const mainNav = page.locator('nav.bg-white')
    await mainNav.getByRole('link', { name: 'About Us', exact: true }).click()
    await expect(page).toHaveURL(/\/about/)

    await mainNav.getByRole('link', { name: 'Events', exact: true }).click()
    await expect(page).toHaveURL(/\/events/)

    await mainNav.getByRole('link', { name: 'Membership', exact: true }).click()
    await expect(page).toHaveURL(/\/membership/)

    await mainNav.getByRole('link', { name: 'Donate to A-DNA' }).click()
    await expect(page).toHaveURL(/\/donate/)
  })

  test('member portal link opens login page', async ({ page }) => {
    await page.goto('/')
    await page
      .locator('div.bg-pcna-green.text-sm')
      .getByRole('link', { name: 'Member Portal' })
      .click()
    await expect(page).toHaveURL(/\/portal\/login/)
    await expect(page.getByRole('heading', { name: 'Member Portal' })).toBeVisible()
  })
})
