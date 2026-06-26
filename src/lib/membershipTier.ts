/** Membership tiers, Zeffy checkout, and badge styling. */

export type MembershipTierAlias = 'regular' | 'diaspora' | 'premium'

export const ZEFFY_MEMBERSHIP_URL =
  import.meta.env.VITE_ZEFFY_MEMBERSHIP_URL ??
  'https://www.zeffy.com/en-US/ticketing/ghanaian-diaspora-nursing-alliances-memberships-2'

export const MEMBERSHIP_TIER_META: Record<
  MembershipTierAlias,
  { label: string; shortLabel: string; badge: 'grey' | 'blue' | 'gold' }
> = {
  regular: {
    label: 'Free Member',
    shortLabel: 'Free',
    badge: 'grey',
  },
  diaspora: {
    label: 'Professional Member',
    shortLabel: 'Professional',
    badge: 'blue',
  },
  premium: {
    label: 'Premium Member',
    shortLabel: 'Premium',
    badge: 'gold',
  },
}

export function normalizeMembershipTier(value: string | null | undefined): MembershipTierAlias {
  if (value === 'diaspora' || value === 'premium') return value
  return 'regular'
}

export function tierRank(tier: MembershipTierAlias): number {
  if (tier === 'premium') return 2
  if (tier === 'diaspora') return 1
  return 0
}

export function canUpgradeTo(
  current: MembershipTierAlias,
  target: 'diaspora' | 'premium',
): boolean {
  return tierRank(target) > tierRank(current)
}
