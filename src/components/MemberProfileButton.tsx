import { Link } from '@tanstack/react-router'
import { useMemberAuth } from '../lib/MemberAuthProvider'
import { getMemberInitials } from '../lib/memberInitials'
import { PORTAL_LOGIN_PATH, PORTAL_PATH } from '../lib/memberAuth'

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

  return (
    <Link
      to={PORTAL_PATH}
      onClick={onNavigate}
      title={`View ${profile.first_name}'s profile`}
      aria-label={`View profile for ${profile.first_name} ${profile.last_name}`}
      className={`inline-flex items-center gap-2 no-underline transition-opacity hover:opacity-90 ${className}`}
      style={{ textDecoration: 'none' }}
    >
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
          flexShrink: 0,
          background: isLight ? '#fff' : '#0D3D2B',
          color: isLight ? '#0D3D2B' : '#fff',
          border: isLight ? '2px solid rgba(255,255,255,0.85)' : '2px solid #0D3D2B',
          boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.15)' : '0 1px 4px rgba(0,0,0,0.08)',
        }}
      >
        {initials}
      </span>
      {showName && (
        <span
          style={{
            fontSize: isLight ? '0.875rem' : '0.9rem',
            fontWeight: 700,
            color: isLight ? '#fff' : '#0D3D2B',
            maxWidth: 120,
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
