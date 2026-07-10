import { useState } from 'react'
import toast from 'react-hot-toast'
import { getStoredSession } from '../lib/memberAuth'
import {
  openMembershipLetterPrintWindow,
  showMembershipLetterLoading,
  writeMembershipLetterPrint,
} from '../lib/membershipLetterPrint'
import { issueMembershipVerification } from '../lib/membershipVerification'
import type { MemberProfile } from '../lib/memberAuth'
import { normalizeMembershipTier } from '../lib/membershipTier'

type Props = {
  profile: MemberProfile
}

export function MembershipLetterCard({ profile }: Props) {
  const [isIssuing, setIsIssuing] = useState(false)
  const tier = normalizeMembershipTier(profile.membership_tier)
  const eligible =
    profile.has_paid_current_year_dues === true &&
    (tier === 'diaspora' || tier === 'premium')

  const handleDownloadLetter = async () => {
    const session = getStoredSession()
    if (!session) {
      toast.error('Your session has expired. Please sign in again.')
      return
    }

    // Must open before await — browsers block window.open after async work.
    const printWindow = openMembershipLetterPrintWindow()
    if (!printWindow) {
      toast.error('Allow pop-ups to print your membership letter.')
      return
    }
    showMembershipLetterLoading(printWindow)

    setIsIssuing(true)
    try {
      const verification = await issueMembershipVerification(session.token)
      writeMembershipLetterPrint(printWindow, verification)
      toast.success('Verification letter ready to print.')
    } catch (error) {
      printWindow.close()
      toast.error(error instanceof Error ? error.message : 'Could not issue membership letter.')
    } finally {
      setIsIssuing(false)
    }
  }

  return (
    <div className="portal-membership-card">
      <div className="portal-membership-card__header">
        <div>
          <p className="portal-membership-card__eyebrow">Verification</p>
          <h2 className="portal-membership-card__title font-heading">Membership letter</h2>
        </div>
      </div>

      {eligible ? (
        <>
          <p className="portal-membership-card__lead">
            Download an official verification letter for employers, credentialing, or other
            third-party requests. Each letter includes a unique code registered in A-DNA&apos;s
            system. Anyone can confirm authenticity at{' '}
            <a href="/membership/verify" style={{ color: '#116b53', fontWeight: 700 }}>
              a-dna.org/membership/verify
            </a>
            .
          </p>
          <button
            type="button"
            className="portal-membership-card__pay-btn"
            onClick={() => {
              handleDownloadLetter().catch(() => undefined)
            }}
            disabled={isIssuing}
            style={{ border: 'none', cursor: isIssuing ? 'wait' : 'pointer' }}
          >
            {isIssuing ? 'Preparing letter…' : 'Print membership letter'}
          </button>
        </>
      ) : (
        <p className="portal-membership-card__lead">
          Membership letters are available after your paid Professional or Premium membership is
          active for the current year. Complete payment on Zeffy, then click{' '}
          <strong>Refresh status</strong> above.
        </p>
      )}

      <p className="portal-membership-card__footnote">
        Letters cannot be forged without a valid code in A-DNA&apos;s verification database. Codes
        are checked live against current membership status.
      </p>
    </div>
  )
}
