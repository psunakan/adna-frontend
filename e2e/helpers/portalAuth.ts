import type { Page } from '@playwright/test'

export const DEMO_SESSION_TOKEN = 'a1111111-1111-1111-1111-111111111111'
export const ZEFFY_MEMBERSHIP_URL_PATTERN = /zeffy\.com.*memberships/i

export type MockMemberTier = 'regular' | 'diaspora' | 'premium'

const MEMBERSHIP_LABELS: Record<MockMemberTier, string> = {
  regular: 'Regular Membership (FREE)',
  diaspora: 'Diaspora Membership ($75)',
  premium: 'Premium Membership ($150)',
}

export function buildMockMember(tier: MockMemberTier) {
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
    },
  }
}

type MockPortalOptions = {
  /** Profiles returned on successive get_member_profile calls (last entry repeats). */
  profileSequence?: ReturnType<typeof buildMockMember>[]
  initialTier?: MockMemberTier
}

/** Portal loads profile on mount; dashboard may fetch again on window focus before a manual refresh. */
function resolveProfileSequence(
  profileSequence: ReturnType<typeof buildMockMember>[],
): ReturnType<typeof buildMockMember>[] {
  if (profileSequence.length < 2) return profileSequence
  return [profileSequence[0], profileSequence[0], ...profileSequence.slice(1)]
}

export async function mockMemberPortalApi(page: Page, options: MockPortalOptions = {}) {
  const initialTier = options.initialTier ?? 'regular'
  const rawSequence =
    options.profileSequence ??
    (options.initialTier ? [buildMockMember(options.initialTier)] : [buildMockMember('regular')])
  const profileSequence = resolveProfileSequence(rawSequence)

  let profileCallIndex = 0

  await page.route('**/rest/v1/rpc/get_member_profile', async (route) => {
    const profile =
      profileSequence[Math.min(profileCallIndex, profileSequence.length - 1)] ??
      buildMockMember(initialTier)
    profileCallIndex += 1

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, member: profile }),
    })
  })

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
}

export async function seedPortalSession(page: Page, tier: MockMemberTier = 'regular') {
  const session = buildMockSession(tier)
  await page.addInitScript((value) => {
    localStorage.setItem('adna_member_session', value)
  }, JSON.stringify(session))
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
