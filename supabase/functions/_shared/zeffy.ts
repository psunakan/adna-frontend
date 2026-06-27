/** Zeffy payment webhook + API shapes (subset used for membership upgrades). */

export type ZeffyBuyer = {
  email?: string
  first_name?: string
  last_name?: string
}

export type ZeffyPaymentItem = {
  id?: string
  type?: string
  amount?: number
  currency?: string
  rate_id?: string
}

export type ZeffyPayment = {
  id?: string
  object?: string
  amount?: number
  eligible_amount?: number
  currency?: string
  status?: string
  description?: string
  campaign_id?: string
  campaign_type?: string
  campaign_category?: string
  created?: number
  buyer?: ZeffyBuyer | string
  items?: ZeffyPaymentItem[]
  metadata?: Record<string, unknown>
}

export type ZeffyWebhookPayload = {
  type?: string
  event?: string
  created?: number
  data?: ZeffyPayment
  payment?: ZeffyPayment
}

export const MEMBERSHIP_TYPE_IDS = {
  /** Professional tier in the UI ($75 / 300 GHS) */
  diaspora: 'd8e37c51-aee6-4f6b-82be-b4bf613cf3ad',
  /** Premium tier ($150 / 600 GHS) */
  premium: '56f6be17-ebcd-43ca-9dc6-0e2545e88cac',
} as const

export type MembershipTier = keyof typeof MEMBERSHIP_TYPE_IDS

/** Zeffy amounts are in minor currency units (cents / pesewas). */
const AMOUNT_TIER: Record<string, MembershipTier> = {
  'usd:7500': 'diaspora',
  'usd:15000': 'premium',
  'ghs:30000': 'diaspora',
  'ghs:60000': 'premium',
}

function parseCsvIds(value: string | undefined): Set<string> {
  if (!value?.trim()) return new Set()
  return new Set(
    value
      .split(',')
      .map((id) => id.trim().toLowerCase())
      .filter(Boolean),
  )
}

export function extractPayment(payload: ZeffyWebhookPayload): ZeffyPayment | null {
  if (payload.data?.id || payload.data?.amount != null) return payload.data
  if (payload.payment?.id || payload.payment?.amount != null) return payload.payment
  if ((payload as ZeffyPayment).id) return payload as ZeffyPayment
  return null
}

export function isCompletedPaymentEvent(payload: ZeffyWebhookPayload): boolean {
  const eventType = (payload.type ?? payload.event ?? '').toLowerCase()
  if (eventType === 'payment.completed') return true
  if (!eventType && extractPayment(payload)?.status === 'succeeded') return true
  return false
}

/** Prefer line-item totals; fall back to payment amount when eligible_amount is 0. */
export function resolvePaymentAmountCents(payment: ZeffyPayment): number {
  const itemTotal = (payment.items ?? []).reduce((sum, item) => sum + (item.amount ?? 0), 0)
  if (itemTotal > 0) return itemTotal

  if (payment.eligible_amount != null && payment.eligible_amount > 0) {
    return payment.eligible_amount
  }

  return payment.amount ?? 0
}

export function resolveMembershipTier(
  payment: ZeffyPayment,
  options: {
    professionalCampaignIds: Set<string>
    premiumCampaignIds: Set<string>
    professionalRateIds: Set<string>
    premiumRateIds: Set<string>
  },
): MembershipTier | null {
  const amountCents = resolvePaymentAmountCents(payment)
  const currency = payment.currency?.toLowerCase()

  if (currency && amountCents > 0) {
    const byAmount = AMOUNT_TIER[`${currency}:${amountCents}`]
    if (byAmount) return byAmount
  }

  for (const item of payment.items ?? []) {
    const rateId = item.rate_id?.toLowerCase()
    if (!rateId) continue

    const inPremium = options.premiumRateIds.has(rateId)
    const inProfessional = options.professionalRateIds.has(rateId)

    // Zeffy may use one rate_id for multiple tiers — amount (checked above) disambiguates.
    if (inPremium && inProfessional) continue

    if (inPremium) return 'premium'
    if (inProfessional) return 'diaspora'
  }

  const campaignId = payment.campaign_id?.toLowerCase()
  if (campaignId && options.premiumCampaignIds.has(campaignId)) return 'premium'
  if (campaignId && options.professionalCampaignIds.has(campaignId)) return 'diaspora'

  const haystack = [payment.metadata?.membership_tier, payment.metadata?.tier]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (/\bpremium\b/.test(haystack)) return 'premium'
  if (/\bprofessional\b/.test(haystack)) return 'diaspora'

  return null
}

export function loadCampaignIdSets(env: {
  professional?: string
  premium?: string
  professionalRates?: string
  premiumRates?: string
}): {
  professionalCampaignIds: Set<string>
  premiumCampaignIds: Set<string>
  professionalRateIds: Set<string>
  premiumRateIds: Set<string>
} {
  return {
    professionalCampaignIds: parseCsvIds(env.professional),
    premiumCampaignIds: parseCsvIds(env.premium),
    professionalRateIds: parseCsvIds(env.professionalRates),
    premiumRateIds: parseCsvIds(env.premiumRates),
  }
}

export function membershipTypeIdForTier(tier: MembershipTier): string {
  return MEMBERSHIP_TYPE_IDS[tier]
}

export function tierLabel(tier: MembershipTier): string {
  if (tier === 'premium') return 'Premium'
  return 'Professional'
}
