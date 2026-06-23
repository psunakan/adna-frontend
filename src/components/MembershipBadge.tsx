import type { MembershipTierAlias } from '../lib/membershipTier'
import { MEMBERSHIP_TIER_META } from '../lib/membershipTier'

type BadgeVariant = 'grey' | 'blue' | 'gold'

const BADGE_COLORS: Record<BadgeVariant, { fill: string; check: string }> = {
  grey: { fill: '#94a3b8', check: '#ffffff' },
  blue: { fill: '#1d9bf0', check: '#ffffff' },
  gold: { fill: '#d4a017', check: '#ffffff' },
}

type Props = {
  tier?: MembershipTierAlias | string | null
  size?: number
  title?: string
  className?: string
}

export function MembershipBadge({ tier = 'regular', size = 18, title, className = '' }: Props) {
  const normalized =
    tier === 'diaspora' || tier === 'premium' || tier === 'regular' ? tier : 'regular'
  const variant = MEMBERSHIP_TIER_META[normalized].badge
  const colors = BADGE_COLORS[variant]
  const label = title ?? `${MEMBERSHIP_TIER_META[normalized].label} verified`

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      aria-label={title}
      style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' }}
    >
      <circle cx="12" cy="12" r="11" fill={colors.fill} />
      <path
        d="M7 12.5l3 3 7-7"
        fill="none"
        stroke={colors.check}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type NameWithBadgeProps = {
  name: string
  tier?: MembershipTierAlias | string | null
  badgeSize?: number
  style?: React.CSSProperties
  nameStyle?: React.CSSProperties
}

export function MemberNameWithBadge({
  name,
  tier,
  badgeSize = 18,
  style,
  nameStyle,
}: NameWithBadgeProps) {
  return (
    <span
      className="member-name-with-badge"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', ...style }}
    >
      <span style={nameStyle}>{name}</span>
      <MembershipBadge tier={tier} size={badgeSize} />
    </span>
  )
}
