import { ZEFFY_MEMBERSHIP_URL } from './membershipTier'
import type { MembershipType } from '../types/database'

const PROFESSIONAL_URL =
  import.meta.env.VITE_ZEFFY_MEMBERSHIP_URL_PROFESSIONAL ?? ZEFFY_MEMBERSHIP_URL
const PREMIUM_URL = import.meta.env.VITE_ZEFFY_MEMBERSHIP_URL_PREMIUM ?? ZEFFY_MEMBERSHIP_URL

export function zeffyCheckoutBaseUrl(tier: Exclude<MembershipType, 'regular'>): string {
  return tier === 'premium' ? PREMIUM_URL : PROFESSIONAL_URL
}

export function buildZeffyCheckoutUrl(params: {
  tier: Exclude<MembershipType, 'regular'>
  email: string
  first_name?: string
  last_name?: string
}): string {
  const url = new URL(zeffyCheckoutBaseUrl(params.tier))
  url.searchParams.set('email', params.email.trim().toLowerCase())

  const firstName = params.first_name?.trim()
  const lastName = params.last_name?.trim()
  if (firstName) url.searchParams.set('firstname', firstName)
  if (lastName) url.searchParams.set('lastname', lastName)

  return url.toString()
}
