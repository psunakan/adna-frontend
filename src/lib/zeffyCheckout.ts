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
  firstName: string
  lastName: string
}): string {
  const url = new URL(zeffyCheckoutBaseUrl(params.tier))
  url.searchParams.set('email', params.email.trim().toLowerCase())
  url.searchParams.set('firstname', params.firstName.trim())
  url.searchParams.set('lastname', params.lastName.trim())
  return url.toString()
}
