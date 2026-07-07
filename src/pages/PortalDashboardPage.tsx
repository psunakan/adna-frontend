import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import toast from 'react-hot-toast'
import { MembershipUpgradeSection } from '../components/MembershipUpgradeSection'
import { MembershipLetterCard } from '../components/MembershipLetterCard'
import { MemberNameWithBadge } from '../components/MembershipBadge'
import { useMemberAuth } from '../lib/MemberAuthProvider'
import { PORTAL_LOGIN_PATH } from '../lib/memberAuth'
import { adnaLogoUrl } from '../lib/branding'
import { MEMBERSHIP_TIER_META, normalizeMembershipTier } from '../lib/membershipTier'

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function membershipStatus(profile: {
  is_active: boolean
  membership_tier: string | null
}) {
  const tier = normalizeMembershipTier(profile.membership_tier)
  if (profile.is_active && tier !== 'regular') {
    return {
      label: 'Active — paid member',
      className: 'portal-status portal-status--active',
    }
  }
  if (profile.is_active) {
    return {
      label: 'Active — free member',
      className: 'portal-status portal-status--free',
    }
  }
  return {
    label: 'Payment pending',
    className: 'portal-status portal-status--pending',
  }
}

export function PortalDashboardPage() {
  const navigate = useNavigate()
  const { profile, logout, isLoading, isAuthenticated, refreshMembershipStatus } = useMemberAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: PORTAL_LOGIN_PATH, replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  useEffect(() => {
    const onFocus = () => {
      if (isAuthenticated) void refreshMembershipStatus().catch(() => undefined)
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [isAuthenticated, refreshMembershipStatus])

  if (isLoading) {
    return (
      <section className="portal-page">
        <div className="portal-shell portal-shell--loading">
          <p className="portal-loading">Loading your account…</p>
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

  const membershipTier = normalizeMembershipTier(profile.membership_tier)
  const tierMeta = MEMBERSHIP_TIER_META[membershipTier]
  const status = membershipStatus(profile)
  const logoUrl = adnaLogoUrl(window.location.origin)

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Signed out successfully.')
      navigate({ to: PORTAL_LOGIN_PATH })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not sign out.')
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const result = await refreshMembershipStatus()
      if (!result) {
        toast.error('Your session has expired. Please sign in again.')
        navigate({ to: PORTAL_LOGIN_PATH, replace: true })
        return
      }

      if (result.paymentStatus === 'paid' || result.member.is_active) {
        toast.success(result.paymentMessage)
      } else {
        toast.error(result.paymentMessage, { duration: 6000 })
      }
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === 'Session expired. Please log in again.' ||
          error.message === 'Member account not found.')
      ) {
        toast.error('Your session has expired. Please sign in again.')
        navigate({ to: PORTAL_LOGIN_PATH, replace: true })
        return
      }
      toast.error(error instanceof Error ? error.message : 'Could not refresh membership status.')
    } finally {
      setIsRefreshing(false)
    }
  }

  const profileFields = [
    { label: 'Full name', value: fullName },
    { label: 'Email', value: profile.email },
    { label: 'Phone', value: profile.phone_number },
    { label: 'Country', value: profile.country_residence },
    { label: 'Membership', value: profile.membership_label },
    { label: 'Last login', value: formatDate(profile.last_login_at) },
  ]

  return (
    <section className="portal-page animate-fade-in">
      <div className="portal-shell">
        <header className="portal-hero">
          <div className="portal-hero__brand">
            <img
              src={logoUrl}
              alt="African-Diaspora Nursing Alliance"
              className="portal-hero__logo"
            />
            <div className="portal-tricolor" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className="portal-hero__body">
            <p className="portal-hero__eyebrow">Member Portal</p>
            <h1 className="portal-hero__title font-heading">
              Welcome,{' '}
              <MemberNameWithBadge
                name={profile.first_name}
                tier={membershipTier}
                badgeSize={26}
                nameStyle={{ fontWeight: 900 }}
              />
            </h1>
            <p className="portal-hero__subtitle">
              {tierMeta.label} · {profile.email}
            </p>
            <div className="portal-hero__badges">
              <span className={status.className}>{status.label}</span>
            </div>
          </div>

          <button type="button" className="portal-btn portal-btn--outline" onClick={handleLogout}>
            Sign out
          </button>
        </header>

        {profile.is_first_login && (
          <div className="portal-alert portal-alert--info" role="status">
            <strong>First login</strong> — If you have not changed your password yet, please update
            it when that option becomes available.
          </div>
        )}

        {profile.is_active === false && (
          <div className="portal-alert portal-alert--warning" role="alert">
            Your membership payment is still pending. Complete payment on Zeffy using{' '}
            <strong>{profile.email}</strong>, then click <strong>Refresh status</strong> in your
            membership card.
          </div>
        )}

        <div className="portal-grid">
          <div className="portal-main">
            <MembershipUpgradeSection
              tier={membershipTier}
              email={profile.email}
              first_name={profile.first_name}
              last_name={profile.last_name}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
            <MembershipLetterCard profile={profile} />
          </div>

          <aside className="portal-sidebar">
            <div className="portal-panel">
              <p className="portal-panel__eyebrow">Your profile</p>
              <h2 className="portal-panel__title font-heading">Account details</h2>
              <dl className="portal-profile-list">
                {profileFields.map((field) => (
                  <div key={field.label} className="portal-profile-list__row">
                    <dt>{field.label}</dt>
                    <dd>{field.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="portal-panel portal-panel--muted">
              <p className="portal-panel__eyebrow">Quick links</p>
              <h2 className="portal-panel__title font-heading">Need something?</h2>
              <ul className="portal-links">
                <li>
                  <Link to="/membership/verify">Verify a membership letter</Link>
                </li>
                <li>
                  <Link to="/membership">View membership tiers</Link>
                </li>
                <li>
                  <Link to="/events">Events &amp; registration</Link>
                </li>
                <li>
                  <a href="mailto:info@a-dna.org">Email info@a-dna.org</a>
                </li>
              </ul>
              <p className="portal-panel__hint">
                Use the chat widget for membership support while you&apos;re in the portal.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
