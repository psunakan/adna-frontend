import { test, expect } from '@playwright/test'
import {
  fillAndSubmitMembershipForm,
  fillMembershipFormStep1,
  mockDuplicateMemberEmail,
} from './helpers/membershipForm'

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
    await fillMembershipFormStep1(page.locator('#membership-form'))
    await expect(page.getByText('Professional Information')).toBeVisible()
  })

  test('clears state validation error after selecting a state', async ({ page }) => {
    const form = page.locator('#membership-form')
    await form.getByRole('radio', { name: 'Ms' }).check()
    await form.getByPlaceholder('First name').fill('Jane')
    await form.getByPlaceholder('Last name').fill('Doe')
    await form.locator('select').nth(0).selectOption({ label: 'United States' })
    await form.getByRole('button', { name: /Next/i }).click()

    await expect(form.getByText('State / province / region is required.')).toBeVisible()

    await form.locator('select').nth(1).selectOption({ label: 'Maryland' })
    await expect(form.getByText('State / province / region is required.')).not.toBeVisible()
  })

  test('shows duplicate email message with login link', async ({ page }) => {
    await mockDuplicateMemberEmail(page)
    await fillAndSubmitMembershipForm(page, 'existing@example.com')

    const form = page.locator('#membership-form')
    await expect(form.getByRole('heading', { name: 'Personal Information' })).toBeVisible()
    await expect(form.getByRole('alert')).toContainText('An account with this email already exists')
    await expect(form.getByRole('link', { name: 'sign in to the Member Portal' })).toHaveAttribute(
      'href',
      '/portal/login',
    )
  })

  test('clears duplicate email message when email is edited', async ({ page }) => {
    await mockDuplicateMemberEmail(page)
    await fillAndSubmitMembershipForm(page, 'existing@example.com')

    const form = page.locator('#membership-form')
    await expect(form.getByRole('alert')).toBeVisible()
    await form.getByPlaceholder('your@email.com').fill('another@example.com')
    await expect(form.getByRole('alert')).not.toBeVisible()
  })
})
