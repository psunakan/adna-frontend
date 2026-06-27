import { useEffect, useState } from 'react'
import { useSearch } from '@tanstack/react-router'
import toast from 'react-hot-toast'
import {
  formatVerificationDate,
  verifyMembershipCode,
  type MembershipVerificationLookup,
} from '../lib/membershipVerification'

const CODE_PATTERN = /^ADNA-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/

function normalizeInput(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, '')
}

export function MembershipVerifyPage() {
  const search = useSearch({ from: '/membership/verify' })
  const [code, setCode] = useState(typeof search.code === 'string' ? search.code : '')
  const [result, setResult] = useState<MembershipVerificationLookup | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    if (typeof search.code === 'string' && search.code.trim()) {
      void runVerification(search.code)
    }
    // Only auto-run when landing with ?code=
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function runVerification(rawCode: string) {
    const normalized = normalizeInput(rawCode)
    setCode(normalized)

    if (!CODE_PATTERN.test(normalized)) {
      setResult({
        valid: false,
        message: 'Enter a valid verification code in the format ADNA-XXXX-XXXX-XXXX-XXXX.',
      })
      return
    }

    setIsChecking(true)
    try {
      const lookup = await verifyMembershipCode(normalized)
      setResult(lookup)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Verification failed.')
      setResult(null)
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <section
      className="animate-fade-in"
      style={{ background: '#f9fafb', minHeight: 'calc(100vh - 180px)', padding: '3rem 1rem 6rem' }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1
          className="font-heading"
          style={{
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: 900,
            color: '#0D3D2B',
            marginBottom: '0.75rem',
          }}
        >
          Verify membership
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>
          Enter the verification code from an A-DNA membership letter. Codes are issued only through
          the official member portal and checked against live membership records.
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            void runVerification(code)
          }}
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: '1.5rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            marginBottom: '1.5rem',
          }}
        >
          <label
            htmlFor="verification-code"
            style={{ display: 'block', fontWeight: 700, color: '#0D3D2B', marginBottom: '0.5rem' }}
          >
            Verification code
          </label>
          <input
            id="verification-code"
            name="code"
            value={code}
            onChange={(event) => setCode(normalizeInput(event.target.value))}
            placeholder="ADNA-XXXX-XXXX-XXXX-XXXX"
            autoComplete="off"
            spellCheck={false}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '12px 14px',
              borderRadius: 8,
              border: '1.5px solid #cbd5e1',
              fontFamily: '"Courier New", monospace',
              fontSize: '1rem',
              letterSpacing: '0.05em',
              marginBottom: '1rem',
            }}
          />
          <button
            type="submit"
            disabled={isChecking}
            style={{
              background: '#0D3D2B',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 8,
              fontWeight: 700,
              cursor: isChecking ? 'wait' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {isChecking ? 'Checking…' : 'Verify code'}
          </button>
        </form>

        {result && (
          <div
            style={{
              background: result.valid ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${result.valid ? '#86efac' : '#fecaca'}`,
              borderRadius: 12,
              padding: '1.25rem 1.5rem',
              color: result.valid ? '#065f46' : '#991b1b',
            }}
          >
            <p style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: 0 }}>
              {result.valid ? 'Verified membership' : 'Not verified'}
            </p>
            <p style={{ margin: '0 0 1rem', lineHeight: 1.6 }}>{result.message}</p>

            {result.valid && result.member_display_name && (
              <dl style={{ margin: 0, display: 'grid', gap: '0.65rem' }}>
                <div>
                  <dt style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.8 }}>
                    Member
                  </dt>
                  <dd style={{ margin: 0, fontWeight: 700 }}>{result.member_display_name}</dd>
                </div>
                <div>
                  <dt style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.8 }}>
                    Membership
                  </dt>
                  <dd style={{ margin: 0, fontWeight: 700 }}>{result.membership_label}</dd>
                </div>
                <div>
                  <dt style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.8 }}>
                    Year
                  </dt>
                  <dd style={{ margin: 0, fontWeight: 700 }}>{result.membership_year}</dd>
                </div>
                {result.issued_at && (
                  <div>
                    <dt style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.8 }}>
                      Issued
                    </dt>
                    <dd style={{ margin: 0, fontWeight: 700 }}>
                      {formatVerificationDate(result.issued_at)}
                    </dd>
                  </div>
                )}
                {result.verification_code && (
                  <div>
                    <dt style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.8 }}>
                      Code
                    </dt>
                    <dd
                      style={{
                        margin: 0,
                        fontFamily: '"Courier New", monospace',
                        fontWeight: 700,
                      }}
                    >
                      {result.verification_code}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
