import { devices, expect, test } from '@playwright/test'
import {
  fillMembershipFormStep1,
  fillMembershipFormStep2,
  pickDropdownOption,
  pickSearchableOption,
} from './helpers/membershipForm'

const { defaultBrowserType: _ignored, ...iPhoneChrome } = devices['iPhone 13']

test.describe('SearchableSelect — desktop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/membership')
    await page.locator('#membership-form').scrollIntoViewIfNeeded()
  })

  test('autofocuses search input when opening a searchable country dropdown', async ({ page }) => {
    const form = page.locator('#membership-form')
    await form.getByTestId('country-residence-select').click()

    const panel = page.getByTestId('country-residence-select-panel')
    await expect(panel).toBeVisible()
    await expect(page.getByTestId('country-residence-select-search')).toBeFocused()
  })

  test('keeps dropdown panel above the sticky nav', async ({ page }) => {
    const form = page.locator('#membership-form')
    await form.getByTestId('country-residence-select').click()

    const panel = page.getByTestId('country-residence-select-panel')
    await expect(panel).toBeVisible()

    const zIndex = await panel.evaluate((el) => Number.parseInt(getComputedStyle(el).zIndex, 10))
    expect(zIndex).toBeGreaterThanOrEqual(10050)
  })

  test('selects a country and shows the chosen label on the trigger', async ({ page }) => {
    const form = page.locator('#membership-form')
    await pickSearchableOption(form, 'country-residence-select', 'United States')
    await expect(form.getByTestId('country-residence-select')).toContainText('United States')
    await expect(page.getByTestId('country-residence-select-panel')).toHaveCount(0)
  })

  test('plain (non-searchable) dropdown still selects an option', async ({ page }) => {
    const form = page.locator('#membership-form')
    await fillMembershipFormStep1(form)
    await pickDropdownOption(form, 'education-select', 'Bachelors')
    await expect(form.getByTestId('education-select')).toContainText('Bachelors')
  })
})

test.describe('SearchableSelect — mobile', () => {
  test.use(iPhoneChrome)

  test.beforeEach(async ({ page }) => {
    await page.goto('/membership')
    await page.locator('#membership-form').scrollIntoViewIfNeeded()
  })

  test('does not autofocus search on touch devices', async ({ page }) => {
    const form = page.locator('#membership-form')
    await form.getByTestId('country-residence-select').tap()

    const panel = page.getByTestId('country-residence-select-panel')
    await expect(panel).toBeVisible()
    await expect(page.getByTestId('country-residence-select-search')).not.toBeFocused()
  })

  test('keeps dropdown panel above the sticky nav on mobile', async ({ page }) => {
    const form = page.locator('#membership-form')
    await form.getByTestId('country-residence-select').tap()

    const panel = page.getByTestId('country-residence-select-panel')
    await expect(panel).toBeVisible()

    const zIndex = await panel.evaluate((el) => Number.parseInt(getComputedStyle(el).zIndex, 10))
    expect(zIndex).toBeGreaterThanOrEqual(10050)
  })

  test('can select a searchable country with a tap and keep the value', async ({ page }) => {
    const form = page.locator('#membership-form')
    await pickSearchableOption(form, 'country-residence-select', 'United States', { touch: true })
    await expect(form.getByTestId('country-residence-select')).toContainText('United States')
    await expect(page.getByTestId('country-residence-select-panel')).toHaveCount(0)
  })

  test('can select nursing education country on mobile without losing the value', async ({
    page,
  }) => {
    test.setTimeout(60_000)
    const form = page.locator('#membership-form')

    await fillMembershipFormStep1(form, 'mobile.select@example.com', { touch: true })
    await fillMembershipFormStep2(form, { touch: true })

    // Force-closing Next near the fixed footer can open the contact drawer; dismiss it.
    const contactClose = page.getByRole('button', { name: 'Close contact drawer' })
    if (await contactClose.isVisible().catch(() => false)) {
      await contactClose.click({ force: true })
    }

    await expect(
      form.getByRole('heading', { name: 'Professional Information Cont.' }),
    ).toBeVisible()
    await pickSearchableOption(form, 'nursing-education-select', 'United States', { touch: true })
    await expect(form.getByTestId('nursing-education-select')).toContainText('United States')
    await expect(page.getByTestId('nursing-education-select-panel')).toHaveCount(0)
  })

  test('plain dropdown selection works with tap on mobile', async ({ page }) => {
    test.setTimeout(60_000)
    const form = page.locator('#membership-form')
    await fillMembershipFormStep1(form, 'mobile.plain@example.com', { touch: true })

    const contactClose = page.getByRole('button', { name: 'Close contact drawer' })
    if (await contactClose.isVisible().catch(() => false)) {
      await contactClose.click({ force: true })
    }

    await expect(form.getByRole('heading', { name: 'Professional Information' })).toBeVisible()
    await pickDropdownOption(form, 'education-select', 'Masters', { touch: true })
    await expect(form.getByTestId('education-select')).toContainText('Masters')
  })
})
