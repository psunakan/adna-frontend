import { test, expect } from '@playwright/test'

const MOCK_VALID = {
  success: true,
  valid: true,
  verification_code: 'ADNA-TEST-1234-5678-9ABC',
  member_display_name: 'Demo User',
  membership_label: 'Diaspora Membership ($75)',
  membership_tier: 'diaspora',
  membership_year: 2026,
  issued_at: '2026-06-28T12:00:00.000Z',
  message: 'This verification code confirms an active A-DNA membership for the stated year.',
}

const MOCK_INVALID = {
  success: true,
  valid: false,
  message: 'No matching verification record was found. The code may be incorrect or revoked.',
}

async function mockVerifyRpc(page: import('@playwright/test').Page, response: object) {
  await page.route('**/rest/v1/rpc/verify_membership_code', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    })
  })
}

test.describe('Membership verification', () => {
  test('verify page loads and validates code format', async ({ page }) => {
    await page.goto('/membership/verify')
    await expect(page.getByRole('heading', { name: 'Verify membership' })).toBeVisible()

    await page.getByLabel('Verification code').fill('not-a-real-code')
    await page.getByRole('button', { name: 'Verify code' }).click()

    await expect(page.getByText('Not verified')).toBeVisible()
    await expect(page.getByText(/ADNA-XXXX-XXXX-XXXX-XXXX/)).toBeVisible()
  })

  test('shows verified member details for a valid code', async ({ page }) => {
    await mockVerifyRpc(page, MOCK_VALID)
    await page.goto('/membership/verify?code=ADNA-TEST-1234-5678-9ABC')

    await expect(page.getByText('Verified membership')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Demo User')).toBeVisible()
    await expect(page.getByText('Diaspora Membership ($75)')).toBeVisible()
    await expect(page.getByText('ADNA-TEST-1234-5678-9ABC')).toBeVisible()
  })

  test('shows not verified for unknown code', async ({ page }) => {
    await mockVerifyRpc(page, MOCK_INVALID)
    await page.goto('/membership/verify')

    await page.getByLabel('Verification code').fill('ADNA-AAAA-BBBB-CCCC-DDDD')
    await page.getByRole('button', { name: 'Verify code' }).click()

    await expect(page.getByText('Not verified')).toBeVisible()
    await expect(page.getByText(/No matching verification record/)).toBeVisible()
  })
})
