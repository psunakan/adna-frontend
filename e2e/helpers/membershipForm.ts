import { expect, type Page } from '@playwright/test'

async function selectStateOrRegion(form: ReturnType<Page['locator']>, countrySelectIndex: number) {
  const stateField = form.getByPlaceholder('State / Province / Region')
  if (await stateField.isVisible()) {
    await stateField.fill('Maryland')
    return
  }

  await form
    .locator('select')
    .nth(countrySelectIndex + 1)
    .selectOption({ index: 1 })
}

export async function fillMembershipFormStep1(
  form: ReturnType<Page['locator']>,
  email = 'jane.doe@example.com',
) {
  await form.getByRole('radio', { name: 'Ms' }).check()
  await form.getByPlaceholder('First name').fill('Jane')
  await form.getByPlaceholder('Last name').fill('Doe')
  await form.locator('select').nth(0).selectOption({ label: 'United States' })
  await selectStateOrRegion(form, 0)
  await form.getByPlaceholder('Phone number').fill('3015550100')
  await form.getByPlaceholder('your@email.com').fill(email)
  await form.getByRole('button', { name: /Next/i }).click()
}

export async function fillMembershipFormStep2(form: ReturnType<Page['locator']>) {
  await expect(form.getByRole('heading', { name: 'Professional Information' })).toBeVisible()
  await form.getByRole('radio', { name: 'No' }).check()
  await form.locator('select').nth(0).selectOption('Bachelors')
  await form.getByRole('checkbox', { name: 'Registered Nurse' }).check()
  await form.locator('select').nth(1).selectOption({ label: 'United States' })
  await selectStateOrRegion(form, 1)
  await form.locator('select').nth(3).selectOption('Active')
  await form.getByRole('button', { name: /Next/i }).click()
}

export async function fillMembershipFormStep3(form: ReturnType<Page['locator']>) {
  await expect(form.getByRole('heading', { name: 'Professional Information Cont.' })).toBeVisible()
  await form.getByPlaceholder('Country / Institution').fill('United States')
  await form.getByRole('radio', { name: 'Full-time' }).check()
  await form.getByRole('checkbox', { name: 'Acute Care' }).check()
  await form.locator('select').nth(0).selectOption('Staff Nurse')
  await form.locator('select').nth(1).selectOption('Hospital')
  await form.getByRole('button', { name: /Next/i }).click()
}

export async function fillMembershipFormStep4(form: ReturnType<Page['locator']>) {
  await expect(form.getByRole('heading', { name: 'Membership Type' })).toBeVisible()
  await form.locator('select').nth(0).selectOption('regular')
}

export async function fillAndSubmitMembershipForm(page: Page, email = 'jane.doe@example.com') {
  const form = page.locator('#membership-form')
  await form.scrollIntoViewIfNeeded()

  await fillMembershipFormStep1(form, email)
  await fillMembershipFormStep2(form)
  await fillMembershipFormStep3(form)
  await fillMembershipFormStep4(form)
  await form.getByRole('button', { name: 'Submit' }).click()
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
