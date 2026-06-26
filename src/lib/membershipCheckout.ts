import { isSupabaseConfigured, supabase } from './supabase'
import type { MembershipType } from '../types/database'

const STORAGE_KEY = 'adna_membership_checkout'

export type PendingCheckout = {
  token: string
  email: string
  tier: Exclude<MembershipType, 'regular'>
  firstName: string
}

export type CheckoutStatus =
  | { status: 'invalid' }
  | { status: 'expired' }
  | { status: 'pending'; firstName?: string; membershipLabel?: string; email?: string }
  | {
      status: 'confirmed'
      firstName?: string
      membershipLabel?: string
      email?: string
    }

export function savePendingCheckout(data: PendingCheckout) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function readPendingCheckout(): PendingCheckout | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PendingCheckout
  } catch {
    return null
  }
}

export function clearPendingCheckout() {
  sessionStorage.removeItem(STORAGE_KEY)
}

export async function createMembershipCheckout(email: string): Promise<PendingCheckout['token']> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Contact the site administrator.')
  }

  const { data, error } = await supabase.rpc('create_membership_checkout', {
    p_email: email.trim().toLowerCase(),
  })

  if (error) {
    throw new Error(error.message)
  }

  const result = data as { token?: string; expected_tier?: string } | null
  if (!result?.token || !result.expected_tier) {
    throw new Error('Unable to start membership checkout.')
  }

  if (result.expected_tier !== 'diaspora' && result.expected_tier !== 'premium') {
    throw new Error('Invalid membership tier for checkout.')
  }

  return result.token
}

export async function fetchCheckoutStatus(token: string): Promise<CheckoutStatus> {
  if (!isSupabaseConfigured) {
    return { status: 'invalid' }
  }

  const { data, error } = await supabase.rpc('get_membership_checkout_status', {
    p_token: token,
  })

  if (error) {
    throw new Error(error.message)
  }

  const result = data as {
    status?: string
    first_name?: string
    membership_label?: string
    email?: string
  } | null

  if (!result?.status || result.status === 'invalid') {
    return { status: 'invalid' }
  }

  if (result.status === 'expired') {
    return { status: 'expired' }
  }

  const shared = {
    firstName: result.first_name,
    membershipLabel: result.membership_label,
    email: result.email,
  }

  if (result.status === 'confirmed') {
    return { status: 'confirmed', ...shared }
  }

  return { status: 'pending', ...shared }
}
