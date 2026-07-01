import { expect, type Page } from '@playwright/test'

async function pickDropdownOption(
  form: ReturnType<Page['locator']>,
  testId: string,
  optionLabel: string,
) {
  const page = form.page()
  await form.getByTestId(testId).click()
  await page.getByRole('option', { name: optionLabel, exact: true }).click()
}

async function pickSearchableOption(
  form: ReturnType<Page['locator']>,
  testId: string,
  optionLabel: string,
) {
  const page = form.page()
  await form.getByTestId(testId).click()
  await page.getByTestId(`${testId}-search`).fill(optionLabel.split(' ')[0])
  await page.getByRole('option', { name: optionLabel, exact: true }).click()
}

async function selectStateOrRegion(form: ReturnType<Page['locator']>) {
  const stateField = form.getByPlaceholder('State / Province / Region')
  if (await stateField.isVisible()) {
    await stateField.fill('Maryland')
    return
  }

  await pickSearchableOption(form, 'state-residence-select', 'Maryland')
}

export async function fillMembershipFormStep1(
  form: ReturnType<Page['locator']>,
  email = 'jane.doe@example.com',
) {
  await form.getByRole('radio', { name: 'Ms' }).check()
  await form.getByPlaceholder('First name').fill('Jane')
  await form.getByPlaceholder('Last name').fill('Doe')
  await pickSearchableOption(form, 'country-residence-select', 'United States')
  await selectStateOrRegion(form)
  await form.getByPlaceholder('Phone number').fill('3015550100')
  await form.getByPlaceholder('your@email.com').fill(email)
  await form.locator('#membership-password').fill('SecurePass123!')
  await form.locator('#membership-confirm-password').fill('SecurePass123!')
  await form.getByRole('button', { name: /Next/i }).click()
}

export async function fillMembershipFormStep2(form: ReturnType<Page['locator']>) {
  await expect(form.getByRole('heading', { name: 'Professional Information' })).toBeVisible()
  await form.getByRole('radio', { name: 'No' }).check()
  await pickDropdownOption(form, 'education-select', 'Bachelors')
  await form.getByRole('checkbox', { name: 'Registered Nurse' }).check()
  await pickSearchableOption(form, 'country-practice-select', 'United States')
  await pickSearchableOption(form, 'state-practice-select', 'Maryland')
  await pickDropdownOption(form, 'licence-status-select', 'Active')
  await form.getByRole('button', { name: /Next/i }).click()
}

export async function fillMembershipFormStep3(form: ReturnType<Page['locator']>) {
  await expect(form.getByRole('heading', { name: 'Professional Information Cont.' })).toBeVisible()
  await pickSearchableOption(form, 'nursing-education-select', 'United States')
  await form.getByRole('radio', { name: 'Full-time' }).check()
  await form.getByRole('checkbox', { name: 'Acute Care' }).check()
  await pickDropdownOption(form, 'position-title-select', 'Staff Nurse')
  await pickDropdownOption(form, 'practice-setting-select', 'Hospital')
  await form.getByRole('button', { name: /Next/i }).click()
}

export async function fillMembershipFormStep4(form: ReturnType<Page['locator']>) {
  await expect(form.getByRole('heading', { name: 'Membership Type' })).toBeVisible()
  await pickDropdownOption(form, 'membership-type-select', 'Diaspora Membership ($75)')
  await form.getByTestId('membership-form-go-review').click()
}

export async function fillMembershipFormReview(form: ReturnType<Page['locator']>) {
  await expect(form.getByTestId('membership-form-review')).toBeVisible()
}

export async function fillAndSubmitMembershipForm(page: Page, email = 'jane.doe@example.com') {
  const form = page.locator('#membership-form')
  await form.scrollIntoViewIfNeeded()

  await fillMembershipFormStep1(form, email)
  await fillMembershipFormStep2(form)
  await fillMembershipFormStep3(form)
  await fillMembershipFormStep4(form)
  await fillMembershipFormReview(form)
  await form.getByTestId('membership-form-submit').click()
}

export function mockSuccessfulMembershipRegistration(page: Page, token = 'test-checkout-token') {
  return Promise.all([
    page.route('**/rest/v1/members**', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify([{ id: 'member-test-id' }]),
        })
        return
      }
      await route.continue()
    }),
    page.route('**/rest/v1/rpc/create_membership_checkout**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token, expected_tier: 'diaspora' }),
      })
    }),
    page.route('**/rest/v1/rpc/register_member_credentials**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    }),
  ])
}

export function mockCheckoutStatus(
  page: Page,
  status: 'pending' | 'confirmed' | 'invalid' | 'expired',
) {
  return page.route('**/rest/v1/rpc/get_membership_checkout_status**', async (route) => {
    if (status === 'confirmed') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'confirmed',
          first_name: 'Jane',
          membership_label: 'Diaspora Membership ($75)',
          email: 'jane.doe@example.com',
        }),
      })
      return
    }

    if (status === 'pending') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'pending',
          first_name: 'Jane',
          membership_label: 'Diaspora Membership ($75)',
          email: 'jane.doe@example.com',
        }),
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status }),
    })
  })
}

export function mockDuplicateMemberEmail(page: Page) {
  return page.route('**/rest/v1/members**', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          code: '23505',
          message: 'duplicate key value violates unique constraint "members_email_unique"',
          details: null,
          hint: null,
        }),
      })
      return
    }

    await route.continue()
  })
}
