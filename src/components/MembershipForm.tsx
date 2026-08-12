import { useEffect, useState, type ReactNode } from 'react'
import type { MembershipFormSchema } from '../lib/adnaMembershipApi'
import { loadMembershipFormSchema } from '../lib/membershipFormDynamic'
import { SchemaMembershipForm } from './membership/SchemaMembershipForm'

function MembershipFormShell({ children }: { children: ReactNode }) {
  return (
    <div
      id="membership-form"
      className="mem-pad mem-form-section"
      style={{ background: '#f9fafb', paddingTop: '2rem' }}
    >
      <div className="mem-inner">{children}</div>
    </div>
  )
}

/**
 * Membership registration form.
 * Loads field schema from WordPress (`VITE_ADNA_API_URL`) when configured,
 * otherwise uses the local fallback schema (same fields as before).
 */
export function MembershipForm() {
  const [schema, setSchema] = useState<MembershipFormSchema | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void loadMembershipFormSchema()
      .then((loaded) => {
        if (!cancelled) setSchema(loaded)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load membership form.')
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <MembershipFormShell>
        <p role="alert" style={{ color: '#cc0000' }}>
          {error}
        </p>
      </MembershipFormShell>
    )
  }

  if (!schema) {
    return (
      <MembershipFormShell>
        <p style={{ color: '#6b7280' }}>Loading membership form…</p>
      </MembershipFormShell>
    )
  }

  return (
    <MembershipFormShell>
      <SchemaMembershipForm schema={schema} />
    </MembershipFormShell>
  )
}
