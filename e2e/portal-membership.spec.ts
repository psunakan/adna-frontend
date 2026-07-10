import { test, expect } from '@playwright/test'
import {
  buildMockMember,
  membershipCard,
  mockMemberPortalApi,
  openPortalDashboard,
  refreshMembershipStatus,
  seedPortalSession,
  ZEFFY_MEMBERSHIP_URL_PATTERN,
} from './helpers/portalAuth'

test.describe('Member portal membership upgrades', () => {
  test('free member sees Professional and Premium upgrade options', async ({ page }) => {
    await openPortalDashboard(page, 'regular')
    const card = membershipCard(page)

    await expect(card.getByText('Free Member', { exact: true })).toBeVisible()
    await expect(card.getByRole('heading', { name: 'Professional' })).toBeVisible()
    await expect(card.getByRole('heading', { name: 'Premium' })).toBeVisible()
    await expect(card.getByRole('link', { name: 'Pay with Zeffy' })).toHaveCount(2)
    await expect(card.getByText('demo@adna.org')).toBeVisible()
  })

  test('Professional member sees Premium upgrade with correct copy', async ({ page }) => {
    await mockMemberPortalApi(page, {
      profileSequence: [buildMockMember('diaspora', true, true)],
      initialTier: 'diaspora',
    })
    await seedPortalSession(page, 'diaspora')
    await page.goto('/portal')
    await page.getByRole('heading', { name: /Welcome,/i }).waitFor()
    const card = membershipCard(page)

    await expect(card.getByText('Professional Member', { exact: true })).toBeVisible()
    await expect(card.getByText(/Upgrade to Premium anytime/)).toBeVisible()
    await expect(card.getByText(/You registered as a free member/)).not.toBeVisible()
    await expect(card.getByRole('link', { name: 'Pay with Zeffy' })).toHaveCount(1)
    await expect(card.getByRole('heading', { name: 'Premium' })).toBeVisible()
    await expect(card.getByRole('heading', { name: 'Professional' })).not.toBeVisible()
  })

  test('unpaid Professional signup sees only Professional checkout', async ({ page }) => {
    await mockMemberPortalApi(page, {
      profileSequence: [buildMockMember('diaspora', true, false)],
      initialTier: 'diaspora',
    })
    await seedPortalSession(page, 'diaspora')
    await page.goto('/portal')
    await page.getByRole('heading', { name: /Welcome,/i }).waitFor()

    const card = membershipCard(page)
    await expect(card.getByText('Professional — payment pending')).toBeVisible()
    await expect(card.getByText(/Complete your Professional membership payment/)).toBeVisible()
    await expect(card.getByRole('heading', { name: 'Professional' })).toBeVisible()
    await expect(card.getByRole('heading', { name: 'Premium' })).not.toBeVisible()
    await expect(card.getByRole('link', { name: 'Pay with Zeffy' })).toHaveCount(1)
    await expect(page.getByRole('button', { name: 'Print membership letter' })).toHaveCount(0)
  })

  test('Pay with Zeffy opens checkout in a new tab', async ({ page, context }) => {
    await openPortalDashboard(page, 'regular')

    const [zeffyPage] = await Promise.all([
      context.waitForEvent('page'),
      membershipCard(page).getByRole('link', { name: 'Pay with Zeffy' }).first().click(),
    ])

    await expect(zeffyPage).toHaveURL(ZEFFY_MEMBERSHIP_URL_PATTERN)
    await zeffyPage.close()
  })

  test('Zeffy pay links open in a new tab', async ({ page }) => {
    await openPortalDashboard(page, 'regular')

    const payLinks = membershipCard(page).getByRole('link', { name: 'Pay with Zeffy' })
    await expect(payLinks.first()).toHaveAttribute('target', '_blank')
    await expect(payLinks.first()).toHaveAttribute('rel', /noopener/)
    await expect(payLinks.first()).toHaveAttribute('href', /email=demo%40adna\.org/)
    await expect(payLinks.first()).toHaveAttribute('href', /firstname=Demo/)
    await expect(payLinks.first()).toHaveAttribute('href', /lastname=User/)
  })

  test('refresh status upgrades free member to Professional', async ({ page }) => {
    await mockMemberPortalApi(page, {
      profileSequence: [buildMockMember('regular'), buildMockMember('diaspora', true, true)],
    })
    await seedPortalSession(page, 'regular')
    await page.goto('/portal')
    await page.getByRole('heading', { name: /Welcome,/i }).waitFor()

    const card = membershipCard(page)
    await expect(card.getByText('Free Member', { exact: true })).toBeVisible()
    await refreshMembershipStatus(page)
    await expect(card.getByText('Professional Member', { exact: true })).toBeVisible({
      timeout: 10_000,
    })
    await expect(card.getByRole('heading', { name: 'Premium' })).toBeVisible()
    await expect(card.getByRole('link', { name: 'Pay with Zeffy' })).toHaveCount(1)
  })

  test('refresh status upgrades Professional member to Premium', async ({ page }) => {
    await mockMemberPortalApi(page, {
      profileSequence: [
        buildMockMember('diaspora', true, true),
        buildMockMember('premium', true, true),
      ],
    })
    await seedPortalSession(page, 'diaspora')
    await page.goto('/portal')
    await page.getByRole('heading', { name: /Welcome,/i }).waitFor()

    const card = membershipCard(page)
    await expect(card.getByText('Professional Member', { exact: true })).toBeVisible()
    await refreshMembershipStatus(page)
    await expect(card.getByText('Premium Member', { exact: true })).toBeVisible({
      timeout: 10_000,
    })
    await expect(card.getByText('highest membership tier')).toBeVisible()
    await expect(card.getByRole('link', { name: 'Pay with Zeffy' })).toHaveCount(0)
  })

  test('Premium member has no upgrade pay buttons', async ({ page }) => {
    await openPortalDashboard(page, 'premium')
    const card = membershipCard(page)

    await expect(card.getByText('Premium Member', { exact: true })).toBeVisible()
    await expect(card.getByText('highest membership tier')).toBeVisible()
    await expect(card.getByRole('link', { name: 'Pay with Zeffy' })).toHaveCount(0)
  })

  test('paid member can request a membership letter', async ({ page }) => {
    await mockMemberPortalApi(page, {
      profileSequence: [buildMockMember('diaspora', true, true)],
      initialTier: 'diaspora',
    })
    await seedPortalSession(page, 'diaspora')
    await page.goto('/portal')
    await page.getByRole('heading', { name: /Welcome,/i }).waitFor()
    await expect(page.getByRole('heading', { name: 'Membership letter' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Print membership letter' })).toBeVisible()
  })

  test('free member sees letter unavailable message', async ({ page }) => {
    await openPortalDashboard(page, 'regular')
    await expect(page.getByText(/Membership letters are available after your paid/)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Print membership letter' })).toHaveCount(0)
  })

  test('shows tier verification badges on the dashboard', async ({ page }) => {
    await openPortalDashboard(page, 'regular')
    await expect(
      membershipCard(page).getByRole('img', { name: 'Free Member verified' }),
    ).toBeVisible()

    await page.unrouteAll()
    await openPortalDashboard(page, 'diaspora')
    await expect(
      membershipCard(page).getByRole('img', { name: 'Professional Member verified' }),
    ).toBeVisible()

    await page.unrouteAll()
    await openPortalDashboard(page, 'premium')
    await expect(
      membershipCard(page).getByRole('img', { name: 'Premium Member verified' }),
    ).toBeVisible()
  })

  test('login flow reaches portal with mocked member session', async ({ page }) => {
    await mockMemberPortalApi(page, { initialTier: 'regular' })
    await page.goto('/portal/login')

    await page.getByLabel('Email').fill('demo@adna.org')
    await page.getByTestId('portal-login-password').fill('DemoPassword123!')
    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page).toHaveURL(/\/portal$/)
    const card = membershipCard(page)
    await expect(card.getByText('Free Member', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Refresh status' })).toBeVisible()
  })
})
