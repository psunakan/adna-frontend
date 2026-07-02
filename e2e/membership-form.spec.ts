import { test, expect } from '@playwright/test'
import {
  fillAndSubmitMembershipForm,
  fillMembershipFormStep1,
  fillMembershipFormStep2,
  fillMembershipFormStep3,
  fillMembershipFormStep4,
  mockCheckoutStatus,
  mockDuplicateMemberEmail,
  mockSuccessfulMembershipRegistration,
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
    await form.getByTestId('country-residence-select').click()
    await page.getByTestId('country-residence-select-search').fill('United')
    await page.getByRole('option', { name: 'United States', exact: true }).click()
    await form.getByRole('button', { name: /Next/i }).click()

    await expect(form.getByText('State / province / region is required.')).toBeVisible()

    await form.getByTestId('state-residence-select').click()
    await page.getByTestId('state-residence-select-search').fill('Mary')
    await page.getByRole('option', { name: 'Maryland', exact: true }).click()
    await expect(form.getByText('State / province / region is required.')).not.toBeVisible()
  })

  test('keeps United States selected in country code dropdown', async ({ page }) => {
    const form = page.locator('#membership-form')
    await form.getByTestId('phone-code-select').click()
    await page.getByTestId('phone-code-select-search').fill('United')
    await page.getByRole('option', { name: 'United States (+1)', exact: true }).click()
    await expect(form.getByTestId('phone-code-select')).toContainText('United States (+1)')
  })

  test('restores saved progress after page reload', async ({ page }) => {
    const form = page.locator('#membership-form')
    await form.getByRole('radio', { name: 'Ms' }).check()
    await form.getByPlaceholder('First name').fill('Resume')
    await form.getByPlaceholder('Last name').fill('Test')
    await page.waitForTimeout(500)
    await page.reload()
    await page.locator('#membership-form').scrollIntoViewIfNeeded()
    await expect(form.getByPlaceholder('First name')).toHaveValue('Resume')
    await expect(form.getByTestId('membership-form-resume-banner')).toBeVisible()
  })

  test('rejects invalid phone number on step 1', async ({ page }) => {
    const form = page.locator('#membership-form')
    await form.getByRole('radio', { name: 'Ms' }).check()
    await form.getByPlaceholder('First name').fill('Jane')
    await form.getByPlaceholder('Last name').fill('Doe')
    await form.getByTestId('country-residence-select').click()
    await page.getByTestId('country-residence-select-search').fill('United')
    await page.getByRole('option', { name: 'United States', exact: true }).click()
    await form.getByTestId('state-residence-select').click()
    await page.getByTestId('state-residence-select-search').fill('Mary')
    await page.getByRole('option', { name: 'Maryland', exact: true }).click()
    await form.getByPlaceholder('Phone number').fill('123')
    await form.getByPlaceholder('your@email.com').fill('jane.doe@example.com')
    await form.locator('#membership-password').fill('SecurePass123!')
    await form.locator('#membership-confirm-password').fill('SecurePass123!')
    await form.getByRole('button', { name: /Next/i }).click()

    await expect(form.getByText(/valid phone number/i)).toBeVisible()
  })

  test('rejects mismatched passwords on step 1', async ({ page }) => {
    const form = page.locator('#membership-form')
    await form.getByRole('radio', { name: 'Ms' }).check()
    await form.getByPlaceholder('First name').fill('Jane')
    await form.getByPlaceholder('Last name').fill('Doe')
    await form.getByTestId('country-residence-select').click()
    await page.getByTestId('country-residence-select-search').fill('United')
    await page.getByRole('option', { name: 'United States', exact: true }).click()
    await form.getByTestId('state-residence-select').click()
    await page.getByTestId('state-residence-select-search').fill('Mary')
    await page.getByRole('option', { name: 'Maryland', exact: true }).click()
    await form.getByPlaceholder('Phone number').fill('3015550100')
    await form.getByPlaceholder('your@email.com').fill('jane.doe@example.com')
    await form.locator('#membership-password').fill('SecurePass123!')
    await form.locator('#membership-confirm-password').fill('DifferentPass456!')
    await form.getByRole('button', { name: /Next/i }).click()

    await expect(form.getByText('Passwords do not match.')).toBeVisible()
  })

  test('shows duplicate email message with login and reset links', async ({ page }) => {
    await mockDuplicateMemberEmail(page)
    await fillAndSubmitMembershipForm(page, 'existing@example.com')

    const form = page.locator('#membership-form')
    await expect(form.getByRole('heading', { name: 'Personal Information' })).toBeVisible()
    await expect(form.getByRole('alert')).toContainText('An account with this email already exists')
    await expect(form.getByRole('link', { name: 'sign in to the Member Portal' })).toHaveAttribute(
      'href',
      '/portal/login',
    )
    await expect(form.getByRole('link', { name: 'reset your password' })).toHaveAttribute(
      'href',
      '/portal/forgot-password?email=existing%40example.com',
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

  test('shows review step before submit and supports section editing', async ({ page }) => {
    const form = page.locator('#membership-form')
    await fillMembershipFormStep1(form)
    await fillMembershipFormStep2(form)
    await fillMembershipFormStep3(form)
    await fillMembershipFormStep4(form)

    await expect(form.getByTestId('membership-form-review')).toBeVisible()
    await expect(form.getByText('Ms Jane Doe')).toBeVisible()
    await expect(form.getByText('Diaspora Membership ($75)')).toBeVisible()

    await form.getByTestId('review-edit-step-1').click()
    await expect(form.getByRole('heading', { name: 'Personal Information' })).toBeVisible()
    await form.getByPlaceholder('First name').fill('Janet')
    await form.getByTestId('edit-section-done').click()

    await expect(form.getByTestId('membership-form-review')).toBeVisible()
    await expect(form.getByText('Ms Janet Doe')).toBeVisible()
  })

  test('redirects to Zeffy after review submit', async ({ page }) => {
    await mockSuccessfulMembershipRegistration(page)
    let zeffyUrl = ''

    await page.route(/zeffy\.com/i, async (route) => {
      zeffyUrl = route.request().url()
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body>Zeffy checkout</body></html>',
      })
    })

    await fillAndSubmitMembershipForm(page)

    await expect.poll(() => zeffyUrl).toContain('zeffy.com')
    expect(zeffyUrl).toContain('email=jane.doe%40example.com')
    expect(zeffyUrl).toContain('firstname=Jane')
    expect(zeffyUrl).toContain('lastname=Doe')
  })
})

test.describe('Membership confirmation', () => {
  test('shows success after payment is confirmed', async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem(
        'adna_membership_checkout',
        JSON.stringify({
          token: 'test-checkout-token',
          email: 'jane.doe@example.com',
          tier: 'diaspora',
          firstName: 'Jane',
        }),
      )
    })

    await mockCheckoutStatus(page, 'confirmed')
    await page.goto('/membership/confirmation')

    await expect(page.getByTestId('membership-confirmation-success')).toBeVisible()
    await expect(page.getByText('Welcome to A-DNA!')).toBeVisible()
    await expect(page.getByText(/payment has been confirmed/i)).toBeVisible()
  })

  test('shows pending state while waiting for webhook', async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem(
        'adna_membership_checkout',
        JSON.stringify({
          token: 'test-checkout-token',
          email: 'jane.doe@example.com',
          tier: 'diaspora',
          firstName: 'Jane',
        }),
      )
    })

    await mockCheckoutStatus(page, 'pending')
    await page.goto('/membership/confirmation')

    await expect(page.getByTestId('membership-confirmation-pending')).toBeVisible()
    await expect(page.getByText(/waiting for Zeffy/i)).toBeVisible()
  })
})
