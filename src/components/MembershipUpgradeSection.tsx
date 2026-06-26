import {
  canUpgradeTo,
  MEMBERSHIP_TIER_META,
  normalizeMembershipTier,
  ZEFFY_MEMBERSHIP_URL,
  type MembershipTierAlias,
} from '../lib/membershipTier'
import { MembershipBadge, MemberNameWithBadge } from './MembershipBadge'

type Props = {
  tier: MembershipTierAlias
  email: string
  onRefresh?: () => void
  isRefreshing?: boolean
}

const UPGRADE_OPTIONS = [
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

export function MembershipUpgradeSection({ tier, email, onRefresh, isRefreshing }: Props) {
  const current = normalizeMembershipTier(tier)
  const meta = MEMBERSHIP_TIER_META[current]
  const availableUpgrades = UPGRADE_OPTIONS.filter((option) => canUpgradeTo(current, option.tier))

  return (
    <div className="portal-membership-card">
      <div className="portal-membership-card__header">
        <div>
          <p className="portal-membership-card__eyebrow">Membership</p>
          <MemberNameWithBadge
            name={meta.label}
            tier={current}
            badgeSize={22}
            nameStyle={{ fontSize: '1.35rem', fontWeight: 800, color: '#0D3D2B' }}
          />
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

      {availableUpgrades.length > 0 ? (
        <>
          <p className="portal-membership-card__lead">
            {current === 'regular'
              ? 'You registered as a free member. Upgrade anytime through our secure Zeffy checkout.'
              : 'Upgrade to Premium anytime through our secure Zeffy checkout.'}{' '}
            Use <strong>{email}</strong> when you pay so we can match your payment to your
            account.
          </p>
          <div className="portal-membership-card__options">
            {availableUpgrades.map((option) => (
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
                  href={ZEFFY_MEMBERSHIP_URL}
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
