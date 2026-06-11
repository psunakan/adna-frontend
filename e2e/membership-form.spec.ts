import { test, expect } from '@playwright/test'

test.describe('Membership form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/membership')
    await page.locator('#membership-form').scrollIntoViewIfNeeded()
  })

  test('shows registration form on step 1', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Register' })).toBeVisible()
    await expect(page.getByText('Personal Information')).toBeVisible()
  })

  test('validates required fields on step 1', async ({ page }) => {
    await page.getByRole('button', { name: /Next/i }).click()
    await expect(page.locator('#membership-form').getByText('Please select a title.')).toBeVisible()
  })

  test('advances to step 2 when step 1 is valid', async ({ page }) => {
    await page.getByRole('radio', { name: 'Ms' }).check()
    await page.getByPlaceholder('First name').fill('Jane')
    await page.getByPlaceholder('Last name').fill('Doe')
    await page.locator('select').first().selectOption({ label: 'United States' })
    await page.getByPlaceholder('Phone number').fill('3015550100')
    await page.getByPlaceholder('your@email.com').fill('jane.doe@example.com')

    const stateField = page.getByPlaceholder('State / Province / Region')
    if (await stateField.isVisible()) {
      await stateField.fill('Maryland')
    } else {
      await page.locator('#membership-form select').nth(1).selectOption({ index: 1 })
    }

    await page.getByRole('button', { name: /Next/i }).click()
    await expect(page.getByText('Professional Information')).toBeVisible()
  })
})
