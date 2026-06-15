import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import toast from 'react-hot-toast'
import { useMemberAuth } from '../lib/MemberAuthProvider'
import { PORTAL_LOGIN_PATH } from '../lib/memberAuth'

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function PortalDashboardPage() {
  const navigate = useNavigate()
  const { profile, logout, isLoading, isAuthenticated } = useMemberAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: PORTAL_LOGIN_PATH, replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  if (isLoading) {
    return (
      <section
        style={{ background: '#f9fafb', minHeight: 'calc(100vh - 180px)', padding: '4rem 1rem' }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', color: '#64748b' }}>
          Loading your account…
        </div>
      </section>
    )
  }

  if (!profile) {
    return null
  }

  const fullName = [profile.first_name, profile.middle_name, profile.last_name]
    .filter(Boolean)
    .join(' ')

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Signed out successfully.')
      navigate({ to: PORTAL_LOGIN_PATH })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not sign out.')
    }
  }

  return (
    <section
      className="animate-fade-in"
      style={{ background: '#f9fafb', minHeight: 'calc(100vh - 180px)', padding: '3rem 1rem 6rem' }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <h1
              className="font-heading"
              style={{
                fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                fontWeight: 900,
                color: '#0D3D2B',
                marginBottom: '0.35rem',
              }}
            >
              Welcome, {profile.first_name}
            </h1>
            <p style={{ color: '#64748b', fontSize: '1.05rem' }}>Your A-DNA member account</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: '#fff',
              color: '#0D3D2B',
              border: '1.5px solid #0D3D2B',
              padding: '10px 24px',
              borderRadius: 8,
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Sign Out
          </button>
        </div>

        {profile.is_first_login && (
          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #86efac',
              borderRadius: 10,
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              color: '#065f46',
              fontSize: '0.95rem',
            }}
          >
            This is your first login. If you have not changed your password yet, please update it
            when that option becomes available.
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {[
            { label: 'Full Name', value: fullName },
            { label: 'Email', value: profile.email },
            { label: 'Phone', value: profile.phone_number },
            { label: 'Country of Residence', value: profile.country_residence },
            { label: 'Membership', value: profile.membership_label },
            { label: 'Last Login', value: formatDate(profile.last_login_at) },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: '1.25rem 1.5rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              <p
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#94a3b8',
                  marginBottom: '0.5rem',
                }}
              >
                {item.label}
              </p>
              <p
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  margin: 0,
                  wordBreak: 'break-word',
                }}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
