import { useEffect, useState, type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { adnaLogoUrl } from '../lib/branding'
import { PORTAL_LOGIN_PATH } from '../lib/memberAuth'
import {
  clearPendingCheckout,
  fetchCheckoutStatus,
  readPendingCheckout,
  type CheckoutStatus,
} from '../lib/membershipCheckout'

const POLL_INTERVAL_MS = 3000
const MAX_POLLS = 40

function ThankYouShell({ children }: { children: ReactNode }) {
  const logoUrl = adnaLogoUrl(window.location.origin)

  return (
    <section className="zeffy-thank-you animate-fade-in">
      <div className="zeffy-thank-you__shell">
        <div className="zeffy-thank-you__card">
          <img
            src={logoUrl}
            alt="African-Diaspora Nursing Alliance"
            className="zeffy-thank-you__logo"
          />
          <div className="portal-tricolor" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          {children}
        </div>
      </div>
    </section>
  )
}

function ThankYouActions({
  primary,
  secondary,
}: {
  primary: { to: string; label: string }
  secondary?: { to: string; label: string }
}) {
  return (
    <div className="zeffy-thank-you__actions">
      <Link to={primary.to} className="portal-btn portal-btn--primary zeffy-thank-you__btn">
        {primary.label}
      </Link>
      {secondary && (
        <Link to={secondary.to} className="zeffy-thank-you__link">
          {secondary.label}
        </Link>
      )}
    </div>
  )
}

export function ZeffyThankYouPage() {
  const [checkoutStatus, setCheckoutStatus] = useState<CheckoutStatus | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const hasRegistrationCheckout = Boolean(readPendingCheckout()?.token)

  useEffect(() => {
    const pending = readPendingCheckout()
    if (!pending?.token) return undefined

    let cancelled = false
    let attempts = 0
    let timer: number | undefined
    setIsPolling(true)

    async function poll() {
      try {
        const next = await fetchCheckoutStatus(pending!.token)
        if (cancelled) return

        setCheckoutStatus(next)

        if (next.status === 'confirmed') {
          clearPendingCheckout()
          setIsPolling(false)
          return
        }

        if (next.status === 'pending') {
          attempts += 1
          if (attempts >= MAX_POLLS) {
            setTimedOut(true)
            setIsPolling(false)
            return
          }
          timer = window.setTimeout(() => {
            void poll()
          }, POLL_INTERVAL_MS)
          return
        }

        setIsPolling(false)
      } catch {
        if (!cancelled) setIsPolling(false)
      }
    }

    void poll()

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
  }, [])

  if (hasRegistrationCheckout && (isPolling || checkoutStatus === null)) {
    return (
      <ThankYouShell>
        <p className="zeffy-thank-you__eyebrow">Payment received</p>
        <h1 className="zeffy-thank-you__title font-heading">Confirming your payment…</h1>
        <p className="zeffy-thank-you__lead">
          Thank you for completing checkout on Zeffy. We&apos;re verifying your membership payment
          now — this usually takes less than a minute.
        </p>
      </ThankYouShell>
    )
  }

  if (checkoutStatus?.status === 'confirmed') {
    return (
      <ThankYouShell>
        <div data-testid="membership-confirmation-success">
          <p className="zeffy-thank-you__icon" aria-hidden="true">
            ✅
          </p>
          <h1 className="zeffy-thank-you__title font-heading">Welcome to A-DNA!</h1>
          <p className="zeffy-thank-you__lead">
            {checkoutStatus.firstName ? `${checkoutStatus.firstName}, your` : 'Your'} payment has
            been confirmed
            {checkoutStatus.membershipLabel ? ` for ${checkoutStatus.membershipLabel}` : ''}.
          </p>
          <p className="zeffy-thank-you__copy">
            We have received your membership application and payment. A confirmation email is on its
            way, and we will be in touch shortly.
          </p>
          <ThankYouActions
            primary={{ to: PORTAL_LOGIN_PATH, label: 'Sign in to the Member Portal' }}
            secondary={{ to: '/membership', label: 'Back to membership' }}
          />
        </div>
      </ThankYouShell>
    )
  }

  if (checkoutStatus?.status === 'pending') {
    return (
      <ThankYouShell>
        <div data-testid="membership-confirmation-pending">
          <p className="zeffy-thank-you__icon" aria-hidden="true">
            ⏳
          </p>
          <h1 className="zeffy-thank-you__title font-heading">Thank you — confirming your payment</h1>
          <p className="zeffy-thank-you__lead">
            We&apos;re waiting for Zeffy to confirm your payment
            {checkoutStatus.membershipLabel ? ` for ${checkoutStatus.membershipLabel}` : ''}.
          </p>
          <p className="zeffy-thank-you__copy">
            Please keep this page open while we verify your payment. Use the same email on Zeffy as
            you entered on your application
            {checkoutStatus.email ? ` (${checkoutStatus.email})` : ''}.
          </p>
          {timedOut && (
            <p className="zeffy-thank-you__note">
              Still waiting? Refresh this page in a moment. If payment was completed more than a few
              minutes ago, contact{' '}
              <a href="mailto:info@a-dna.org">info@a-dna.org</a>.
            </p>
          )}
        </div>
      </ThankYouShell>
    )
  }

  return (
    <ThankYouShell>
      <div data-testid="zeffy-thank-you">
        <p className="zeffy-thank-you__icon" aria-hidden="true">
          ✅
        </p>
        <h1 className="zeffy-thank-you__title font-heading">Thank you for your payment</h1>
        <p className="zeffy-thank-you__lead">
          Your transaction with A-DNA was submitted successfully through Zeffy.
        </p>
        <p className="zeffy-thank-you__copy">
          We&apos;re processing your payment now. A receipt or confirmation email may follow from
          Zeffy. If you upgraded your membership, sign in to the member portal and click{' '}
          <strong>Refresh status</strong> if your tier hasn&apos;t updated within a minute.
        </p>
        <ThankYouActions
          primary={{ to: PORTAL_LOGIN_PATH, label: 'Sign in to the Member Portal' }}
          secondary={{ to: '/', label: 'Back to home' }}
        />
        <p className="zeffy-thank-you__footer">
          Questions?{' '}
          <a href="mailto:info@a-dna.org">info@a-dna.org</a>
        </p>
      </div>
    </ThankYouShell>
  )
}
