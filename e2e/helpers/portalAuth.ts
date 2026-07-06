import { expect, type Page } from '@playwright/test'

export const DEMO_SESSION_TOKEN = 'a1111111-1111-1111-1111-111111111111'
export const ZEFFY_MEMBERSHIP_URL_PATTERN = /zeffy\.com.*memberships/i

const MOCK_PROFILE_INDEX_KEY = '__adnaMockProfileIndex'
const MOCK_PROFILES_KEY = '__adnaMockProfiles'

export type MockMemberTier = 'regular' | 'diaspora' | 'premium'

const MEMBERSHIP_LABELS: Record<MockMemberTier, string> = {
  regular: 'Regular Membership (FREE)',
  diaspora: 'Diaspora Membership ($75)',
  premium: 'Premium Membership ($150)',
}

export function buildMockMember(
  tier: MockMemberTier,
  isActive = true,
  hasPaidCurrentYearDues = tier !== 'regular',
) {
  return {
    id: 'a1111111-1111-1111-1111-111111111111',
    email: 'demo@adna.org',
    first_name: 'Demo',
    middle_name: null,
    last_name: 'User',
    phone_number: '+15555550100',
    country_residence: 'USA',
    membership_label: MEMBERSHIP_LABELS[tier],
    membership_tier: tier,
    last_login_at: '2026-06-23T12:00:00.000Z',
    is_first_login: false,
    is_active: isActive,
    has_paid_current_year_dues: hasPaidCurrentYearDues,
  }
}

export function buildMockSession(tier: MockMemberTier = 'regular') {
  const member = buildMockMember(tier)
  return {
    token: DEMO_SESSION_TOKEN,
    member: {
      id: member.id,
      email: member.email,
      first_name: member.first_name,
      last_name: member.last_name,
      is_first_login: member.is_first_login,
      is_active: member.is_active,
    },
  }
}

type MockPortalOptions = {
  /** Profiles indexed for manual refresh simulation (see refreshMembershipStatus). */
  profileSequence?: ReturnType<typeof buildMockMember>[]
  initialTier?: MockMemberTier
}

declare global {
  interface Window {
    [MOCK_PROFILE_INDEX_KEY]?: number
    [MOCK_PROFILES_KEY]?: ReturnType<typeof buildMockMember>[]
  }
}

export async function mockMemberPortalApi(page: Page, options: MockPortalOptions = {}) {
  const initialTier = options.initialTier ?? 'regular'
  const profiles =
    options.profileSequence ??
    (options.initialTier ? [buildMockMember(options.initialTier)] : [buildMockMember('regular')])

  await page.addInitScript(
    ({ profileIndexKey, profilesKey, seededProfiles }) => {
      window[profileIndexKey] = 0
      window[profilesKey] = seededProfiles
    },
    {
      profileIndexKey: MOCK_PROFILE_INDEX_KEY,
      profilesKey: MOCK_PROFILES_KEY,
      seededProfiles: profiles,
    },
  )

  await page.route('**/rest/v1/rpc/get_member_profile', async (route) => {
    const { index, sequence } = await page.evaluate(
      ({ profileIndexKey, profilesKey }) => ({
        index: window[profileIndexKey] ?? 0,
        sequence: window[profilesKey] ?? [],
      }),
      { profileIndexKey: MOCK_PROFILE_INDEX_KEY, profilesKey: MOCK_PROFILES_KEY },
    )

    const profile = sequence[Math.min(index, sequence.length - 1)] ?? buildMockMember(initialTier)

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, member: profile }),
    })
  })

  const fulfillRefresh = async (
    route: Parameters<Page['route']>[1] extends (r: infer R) => unknown ? R : never,
  ) => {
    const { index, sequence } = await page.evaluate(
      ({ profileIndexKey, profilesKey }) => ({
        index: window[profileIndexKey] ?? 0,
        sequence: window[profilesKey] ?? [],
      }),
      { profileIndexKey: MOCK_PROFILE_INDEX_KEY, profilesKey: MOCK_PROFILES_KEY },
    )

    const profile = sequence[Math.min(index, sequence.length - 1)] ?? buildMockMember(initialTier)
    const paid = profile.has_paid_current_year_dues === true

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        payment_status: paid ? 'paid' : 'pending',
        payment_message: paid
          ? 'We found a completed membership payment for your account.'
          : 'No completed payment found for this year. Pay on Zeffy using the same email as your account, then refresh again.',
        member: profile,
      }),
    })
  }

  await page.route('**/functions/v1/zeffy-membership-sync', fulfillRefresh)

  await page.route('**/rest/v1/rpc/refresh_member_membership_status', fulfillRefresh)

  await page.route('**/rest/v1/rpc/login_member', async (route) => {
    const session = buildMockSession(initialTier)
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, token: session.token, member: session.member }),
    })
  })

  await page.route('**/rest/v1/rpc/logout_member', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    })
  })

  await page.route('**/rest/v1/rpc/issue_membership_verification', async (route) => {
    const { index, sequence } = await page.evaluate(
      ({ profileIndexKey, profilesKey }) => ({
        index: window[profileIndexKey] ?? 0,
        sequence: window[profilesKey] ?? [],
      }),
      { profileIndexKey: MOCK_PROFILE_INDEX_KEY, profilesKey: MOCK_PROFILES_KEY },
    )

    const profile = sequence[Math.min(index, sequence.length - 1)] ?? buildMockMember(initialTier)
    const tier = profile.membership_tier
    const eligible = profile.is_active && (tier === 'diaspora' || tier === 'premium')

    if (!eligible) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error:
            'Complete your membership payment for the current year before requesting a letter.',
        }),
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        verification: {
          verification_code: 'ADNA-TEST-1234-5678-9ABC',
          member_display_name: [profile.first_name, profile.last_name].filter(Boolean).join(' '),
          membership_tier: tier,
          membership_label: profile.membership_label,
          membership_year: new Date().getUTCFullYear(),
          issued_at: new Date().toISOString(),
          member_id: profile.id,
        },
      }),
    })
  })
}

export async function seedPortalSession(page: Page, tier: MockMemberTier = 'regular') {
  const session = buildMockSession(tier)
  await page.addInitScript((value) => {
    localStorage.setItem('adna_member_session', value)
  }, JSON.stringify(session))
}

/** Simulates a Zeffy payment clearing: next profile fetch returns the upgraded tier. */
export async function refreshMembershipStatus(page: Page) {
  await page.evaluate((profileIndexKey) => {
    window[profileIndexKey] = (window[profileIndexKey] ?? 0) + 1
  }, MOCK_PROFILE_INDEX_KEY)

  await page.getByRole('button', { name: 'Refresh status' }).click()
  await expect(
    page.getByText(/completed membership payment|No completed payment found/i),
  ).toBeVisible()
}

export async function openPortalDashboard(
  page: Page,
  tier: MockMemberTier = 'regular',
  options?: { profileSequence?: ReturnType<typeof buildMockMember>[] },
) {
  await mockMemberPortalApi(page, {
    initialTier: tier,
    profileSequence: options?.profileSequence,
  })
  await seedPortalSession(page, tier)
  await page.goto('/portal')
  await page.getByRole('heading', { name: /Welcome,/i }).waitFor()
}

export function membershipCard(page: Page) {
  return page.locator('.portal-membership-card')
}
