import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  clearPendingCheckout,
  fetchCheckoutStatus,
  readPendingCheckout,
  type CheckoutStatus,
} from '../lib/membershipCheckout'
import { PORTAL_LOGIN_PATH } from '../lib/memberAuth'

const POLL_INTERVAL_MS = 3000
const MAX_POLLS = 40

export function MembershipConfirmationPage() {
  const [status, setStatus] = useState<CheckoutStatus | null>(null)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    let cancelled = false
    let attempts = 0
    let timer: number | undefined

    async function poll() {
      const pending = readPendingCheckout()
      if (!pending?.token) {
        if (!cancelled) setStatus({ status: 'invalid' })
        return
      }

      try {
        const next = await fetchCheckoutStatus(pending.token)
        if (cancelled) return

        setStatus(next)

        if (next.status === 'confirmed') {
          clearPendingCheckout()
          return
        }

        if (next.status === 'pending') {
          attempts += 1
          if (attempts >= MAX_POLLS) {
            setTimedOut(true)
            return
          }
          timer = window.setTimeout(() => {
            void poll()
          }, POLL_INTERVAL_MS)
        }
      } catch {
        if (!cancelled) setStatus({ status: 'invalid' })
      }
    }

    void poll()

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
  }, [])

  if (!status) {
    return (
      <section className="mem-pad" style={{ background: '#f9fafb', paddingTop: '3rem' }}>
        <div className="mem-inner mem-confirmation">
          <p className="mem-confirmation__lead">Confirming your membership payment…</p>
        </div>
      </section>
    )
  }

  if (status.status === 'confirmed') {
    return (
      <section className="mem-pad" style={{ background: '#f9fafb', paddingTop: '3rem' }}>
        <div className="mem-inner mem-confirmation" data-testid="membership-confirmation-success">
          <div className="mem-confirmation__icon" aria-hidden="true">
            ✅
          </div>
          <h1 className="font-heading mem-confirmation__title">Welcome to A-DNA!</h1>
          <p className="mem-confirmation__lead">
            {status.firstName ? `${status.firstName}, your` : 'Your'} payment has been confirmed
            {status.membershipLabel ? ` for ${status.membershipLabel}` : ''}.
          </p>
          <p className="mem-confirmation__copy">
            We have received your membership application and payment. A confirmation email is on its
            way, and we will be in touch shortly.
          </p>
          <div className="mem-confirmation__actions">
            <Link to={PORTAL_LOGIN_PATH} className="mem-form-btn mem-form-btn--primary">
              Sign in to the Member Portal
            </Link>
            <Link to="/membership" className="mem-form-btn mem-form-btn--secondary">
              Back to membership
            </Link>
          </div>
        </div>
      </section>
    )
  }

  if (status.status === 'pending') {
    return (
      <section className="mem-pad" style={{ background: '#f9fafb', paddingTop: '3rem' }}>
        <div className="mem-inner mem-confirmation" data-testid="membership-confirmation-pending">
          <div className="mem-confirmation__icon" aria-hidden="true">
            ⏳
          </div>
          <h1 className="font-heading mem-confirmation__title">Confirming your payment</h1>
          <p className="mem-confirmation__lead">
            We&apos;re waiting for Zeffy to confirm your payment
            {status.membershipLabel ? ` for ${status.membershipLabel}` : ''}.
          </p>
          <p className="mem-confirmation__copy">
            This usually takes less than a minute. Please keep this page open while we verify your
            payment. Use the same email on Zeffy as you entered on your application
            {status.email ? ` (${status.email})` : ''}.
          </p>
          {timedOut && (
            <p className="mem-confirmation__note">
              Still waiting? Refresh this page in a moment. If payment was completed more than a few
              minutes ago, contact{' '}
              <a href="mailto:info@a-dna.org" style={{ color: '#0D3D2B', fontWeight: 700 }}>
                info@a-dna.org
              </a>
              .
            </p>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="mem-pad" style={{ background: '#f9fafb', paddingTop: '3rem' }}>
      <div className="mem-inner mem-confirmation" data-testid="membership-confirmation-error">
        <div className="mem-confirmation__icon" aria-hidden="true">
          ⚠️
        </div>
        <h1 className="font-heading mem-confirmation__title">
          {status.status === 'expired' ? 'Checkout session expired' : 'Unable to confirm payment'}
        </h1>
        <p className="mem-confirmation__copy">
          {status.status === 'expired'
            ? 'Your registration checkout session has expired. Please register again or contact us for help.'
            : 'We could not find your membership checkout session. Complete your application and payment from the membership page.'}
        </p>
        <div className="mem-confirmation__actions">
          <Link to="/membership" className="mem-form-btn mem-form-btn--primary">
            Go to membership
          </Link>
        </div>
      </div>
    </section>
  )
}
