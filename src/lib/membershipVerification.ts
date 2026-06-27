import { isSupabaseConfigured, supabase } from './supabase'

export type MembershipVerification = {
  verification_code: string
  member_display_name: string
  membership_tier: 'diaspora' | 'premium'
  membership_label: string
  membership_year: number
  issued_at: string
  member_id: string
}

export type MembershipVerificationLookup = {
  valid: boolean
  verification_code?: string
  member_display_name?: string
  membership_label?: string
  membership_tier?: 'diaspora' | 'premium'
  membership_year?: number
  issued_at?: string
  message: string
}

type RpcSuccess<T> = { success: true } & T
type RpcFailure = { success: false; error: string }

function isRpcFailure(value: unknown): value is RpcFailure {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    (value as RpcFailure).success === false
  )
}

export function buildVerificationUrl(code: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://a-dna.org'
  const params = new URLSearchParams({ code: code.trim().toUpperCase() })
  return `${origin}/membership/verify?${params.toString()}`
}

export async function issueMembershipVerification(token: string): Promise<MembershipVerification> {
  if (!isSupabaseConfigured) {
    throw new Error('Member portal is not configured. Contact the site administrator.')
  }

  const { data, error } = await supabase.rpc('issue_membership_verification', {
    p_token: token,
  })

  if (error) {
    throw new Error(error.message)
  }

  if (isRpcFailure(data)) {
    throw new Error(data.error)
  }

  const result = data as RpcSuccess<{ verification: MembershipVerification }>
  if (!result.verification?.verification_code) {
    throw new Error('Unable to issue membership verification.')
  }

  return result.verification
}

export async function verifyMembershipCode(code: string): Promise<MembershipVerificationLookup> {
  if (!isSupabaseConfigured) {
    throw new Error('Verification is not configured. Contact the site administrator.')
  }

  const { data, error } = await supabase.rpc('verify_membership_code', {
    p_code: code.trim().toUpperCase(),
  })

  if (error) {
    throw new Error(error.message)
  }

  if (isRpcFailure(data)) {
    throw new Error(data.error)
  }

  const result = data as RpcSuccess<MembershipVerificationLookup>
  return {
    valid: Boolean(result.valid),
    verification_code: result.verification_code,
    member_display_name: result.member_display_name,
    membership_label: result.membership_label,
    membership_tier: result.membership_tier,
    membership_year: result.membership_year,
    issued_at: result.issued_at,
    message: result.message ?? (result.valid ? 'Verified.' : 'Not verified.'),
  }
}

export function formatVerificationDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
