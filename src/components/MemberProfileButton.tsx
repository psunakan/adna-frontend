import { Link } from '@tanstack/react-router'
import { MembershipBadge } from './MembershipBadge'
import { useMemberAuth } from '../lib/MemberAuthProvider'
import { getMemberInitials } from '../lib/memberInitials'
import { PORTAL_LOGIN_PATH, PORTAL_PATH } from '../lib/memberAuth'
import { normalizeMembershipTier } from '../lib/membershipTier'

type Variant = 'light' | 'dark'

type Props = {
  variant?: Variant
  showName?: boolean
  size?: 'sm' | 'md'
  onNavigate?: () => void
  className?: string
}

const sizeStyles = {
  sm: { circle: 28, fontSize: '0.65rem' },
  md: { circle: 36, fontSize: '0.8rem' },
} as const

export function MemberProfileButton({
  variant = 'dark',
  showName = false,
  size = 'md',
  onNavigate,
  className = '',
}: Props) {
  const { profile, isAuthenticated, isLoading } = useMemberAuth()
  const { circle, fontSize } = sizeStyles[size]

  if (isLoading) {
    return null
  }

  if (!isAuthenticated || !profile) {
    return (
      <Link
        to={PORTAL_LOGIN_PATH}
        onClick={onNavigate}
        className={`hover:underline ${className}`}
        style={{
          color: variant === 'light' ? '#fff' : '#0D3D2B',
          fontSize: variant === 'light' ? '0.875rem' : undefined,
          fontWeight: variant === 'light' ? 400 : 700,
          textDecoration: 'none',
        }}
      >
        Member Portal
      </Link>
    )
  }

  const initials = getMemberInitials(profile.first_name, profile.last_name)
  const isLight = variant === 'light'
  const tier = normalizeMembershipTier(profile.membership_tier)

  return (
    <Link
      to={PORTAL_PATH}
      onClick={onNavigate}
      title={`View ${profile.first_name}'s profile`}
      aria-label={`View profile for ${profile.first_name} ${profile.last_name}`}
      className={`inline-flex items-center gap-2 no-underline transition-opacity hover:opacity-90 ${className}`}
      style={{ textDecoration: 'none' }}
    >
      <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: circle,
            height: circle,
            borderRadius: '50%',
            fontSize,
            fontWeight: 800,
            letterSpacing: '0.02em',
            background: isLight ? '#fff' : '#0D3D2B',
            color: isLight ? '#0D3D2B' : '#fff',
            border: isLight ? '2px solid rgba(255,255,255,0.85)' : '2px solid #0D3D2B',
            boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.15)' : '0 1px 4px rgba(0,0,0,0.08)',
          }}
        >
          {initials}
        </span>
        <span
          style={{
            position: 'absolute',
            right: -3,
            bottom: -3,
            lineHeight: 0,
            background: isLight ? '#116b53' : '#fff',
            borderRadius: '999px',
            padding: 1,
          }}
        >
          <MembershipBadge tier={tier} size={size === 'sm' ? 12 : 14} />
        </span>
      </span>
      {showName && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: isLight ? '0.875rem' : '0.9rem',
            fontWeight: 700,
            color: isLight ? '#fff' : '#0D3D2B',
            maxWidth: 140,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {profile.first_name}
        </span>
      )}
    </Link>
  )
}
