import {
  canUpgradeTo,
  MEMBERSHIP_TIER_META,
  normalizeMembershipTier,
  type MembershipTierAlias,
} from '../lib/membershipTier'
import { buildZeffyCheckoutUrl } from '../lib/zeffyCheckout'
import { MembershipBadge, MemberNameWithBadge } from './MembershipBadge'

type Props = {
  tier: MembershipTierAlias
  hasPaidCurrentYearDues?: boolean
  email: string
  first_name: string
  last_name: string
  onRefresh?: () => void
  isRefreshing?: boolean
}

const CHECKOUT_OPTIONS = [
  {
    tier: 'diaspora' as const,
    title: 'Professional',
    price: '$75/year · 300 GHS/year',
    description: 'Full professional membership with networking, CPD, and outreach benefits.',
  },
  {
    tier: 'premium' as const,
    title: 'Premium',
    price: '$150/year · 600 GHS/year',
    description:
      'Everything in Professional plus preceptorship, mentorship, conference discounts, and more.',
  },
]

export function resolveMembershipCheckoutOptions(tier: MembershipTierAlias, hasPaid: boolean) {
  if (!hasPaid) {
    if (tier === 'regular') {
      return CHECKOUT_OPTIONS
    }
    const selected = CHECKOUT_OPTIONS.find((option) => option.tier === tier)
    return selected ? [selected] : []
  }

  return CHECKOUT_OPTIONS.filter((option) => canUpgradeTo(tier, option.tier))
}

function membershipLeadCopy(tier: MembershipTierAlias, hasPaid: boolean, email: string) {
  if (!hasPaid && tier === 'diaspora') {
    return (
      <>
        Complete your <strong>Professional</strong> membership payment through our secure Zeffy
        checkout. Use <strong>{email}</strong> when you pay so we can match your payment to your
        account.
      </>
    )
  }

  if (!hasPaid && tier === 'premium') {
    return (
      <>
        Complete your <strong>Premium</strong> membership payment through our secure Zeffy checkout.
        Use <strong>{email}</strong> when you pay so we can match your payment to your account.
      </>
    )
  }

  if (tier === 'regular') {
    return (
      <>
        You registered as a free member. Upgrade anytime through our secure Zeffy checkout. Use{' '}
        <strong>{email}</strong> when you pay so we can match your payment to your account.
      </>
    )
  }

  return (
    <>
      Upgrade to Premium anytime through our secure Zeffy checkout. Use <strong>{email}</strong>{' '}
      when you pay so we can match your payment to your account.
    </>
  )
}

export function MembershipUpgradeSection({
  tier,
  hasPaidCurrentYearDues,
  email,
  first_name,
  last_name,
  onRefresh,
  isRefreshing,
}: Props) {
  const current = normalizeMembershipTier(tier)
  const meta = MEMBERSHIP_TIER_META[current]
  const hasPaid = hasPaidCurrentYearDues === true
  const checkoutOptions = resolveMembershipCheckoutOptions(current, hasPaid)

  return (
    <div className="portal-membership-card">
      <div className="portal-membership-card__header">
        <div>
          <p className="portal-membership-card__eyebrow">Membership</p>
          {hasPaid || current === 'regular' ? (
            <MemberNameWithBadge
              name={meta.label}
              tier={current}
              badgeSize={22}
              nameStyle={{ fontSize: '1.35rem', fontWeight: 800, color: '#0D3D2B' }}
            />
          ) : (
            <h2 className="portal-membership-card__title font-heading">
              {meta.shortLabel} — payment pending
            </h2>
          )}
        </div>
        {onRefresh && (
          <button
            type="button"
            className="portal-membership-card__refresh"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing…' : 'Refresh status'}
          </button>
        )}
      </div>

      {checkoutOptions.length > 0 ? (
        <>
          <p className="portal-membership-card__lead">
            {membershipLeadCopy(current, hasPaid, email)}
          </p>
          <div className="portal-membership-card__options">
            {checkoutOptions.map((option) => (
              <div key={option.tier} className="portal-membership-card__option">
                <div className="portal-membership-card__option-head">
                  <MembershipBadge tier={option.tier} size={20} />
                  <div>
                    <h3>{option.title}</h3>
                    <p className="portal-membership-card__price">{option.price}</p>
                  </div>
                </div>
                <p className="portal-membership-card__option-copy">{option.description}</p>
                <a
                  href={buildZeffyCheckoutUrl({
                    tier: option.tier,
                    email,
                    first_name,
                    last_name,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portal-membership-card__pay-btn"
                >
                  Pay with Zeffy
                </a>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="portal-membership-card__lead">
          You&apos;re on our highest membership tier. Thank you for supporting A-DNA.
        </p>
      )}

      <p className="portal-membership-card__footnote">
        After payment, return here and click <strong>Refresh status</strong>. Upgrades usually apply
        within a minute.
      </p>
    </div>
  )
}
