import {
  loadCampaignIdSets,
  membershipTypeIdForTier,
  resolveMembershipTier,
  resolvePaymentAmountCents,
  type ZeffyPayment,
} from './zeffy.ts'

const ZEFFY_API_BASE = 'https://api.zeffy.com'

type ZeffyContact = {
  id?: string
  email?: string
  first_name?: string
  last_name?: string
}

function parseList<T>(body: unknown): T[] {
  if (Array.isArray(body)) return body as T[]
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>
    if (Array.isArray(record.data)) return record.data as T[]
    if (Array.isArray(record.items)) return record.items as T[]
  }
  return []
}

export async function zeffyApiGet(apiKey: string, path: string): Promise<unknown> {
  const res = await fetch(`${ZEFFY_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Zeffy API ${res.status}: ${text.slice(0, 200)}`)
  }

  return await res.json()
}

export async function fetchContactByEmail(
  apiKey: string,
  email: string,
): Promise<ZeffyContact | null> {
  const body = await zeffyApiGet(apiKey, `/api/v1/contacts?email=${encodeURIComponent(email)}`)
  const contacts = parseList<ZeffyContact>(body)
  return contacts.find((c) => c.email?.toLowerCase() === email.toLowerCase()) ?? contacts[0] ?? null
}

export async function fetchPaymentById(apiKey: string, paymentId: string): Promise<ZeffyPayment> {
  const body = await zeffyApiGet(apiKey, `/api/v1/payments/${encodeURIComponent(paymentId)}`)
  if (body && typeof body === 'object' && 'id' in (body as object)) {
    return body as ZeffyPayment
  }
  throw new Error(`Unexpected Zeffy payment response for ${paymentId}`)
}

type PaymentListItem = {
  id?: string
  status?: string
  created?: number
  campaign_category?: string
}

export async function listSucceededPaymentIdsForContact(
  apiKey: string,
  contactId: string,
): Promise<string[]> {
  const body = await zeffyApiGet(
    apiKey,
    `/api/v1/payments?contact=${encodeURIComponent(contactId)}&status=succeeded&limit=50`,
  )
  const payments = parseList<PaymentListItem>(body)
  return payments.filter((p) => p.id && p.status === 'succeeded').map((p) => p.id!)
}

export function paymentIsInCurrentYear(payment: ZeffyPayment, year: number): boolean {
  const created = payment.created
  if (typeof created !== 'number') return true
  return new Date(created * 1000).getUTCFullYear() === year
}

export function normalizeBuyerEmail(payment: ZeffyPayment): string | null {
  const buyer = payment.buyer
  if (typeof buyer === 'string') return buyer.trim().toLowerCase() || null
  return buyer?.email?.trim().toLowerCase() ?? null
}

export type ZeffySyncEnv = {
  apiKey?: string
  campaignProfessional?: string
  campaignPremium?: string
  rateProfessional?: string
  ratePremium?: string
}

export type ZeffySyncResult = {
  synced: number
  skipped: number
  errors: string[]
}

/** Import succeeded Zeffy membership payments for an email into member_dues. */
export async function syncZeffyPaymentsForEmail(
  supabase: {
    rpc: (
      name: string,
      args: Record<string, unknown>,
    ) => Promise<{ data: unknown; error: { message: string } | null }>
  },
  email: string,
  env: ZeffySyncEnv,
): Promise<ZeffySyncResult> {
  const result: ZeffySyncResult = { synced: 0, skipped: 0, errors: [] }
  const apiKey = env.apiKey?.trim()
  if (!apiKey) return result

  const campaignSets = loadCampaignIdSets({
    professional: env.campaignProfessional,
    premium: env.campaignPremium,
    professionalRates: env.rateProfessional,
    premiumRates: env.ratePremium,
  })

  const year = new Date().getUTCFullYear()
  let paymentIds: string[] = []

  try {
    const contact = await fetchContactByEmail(apiKey, email)
    if (contact?.id) {
      paymentIds = await listSucceededPaymentIdsForContact(apiKey, contact.id)
    }
  } catch (err) {
    result.errors.push(err instanceof Error ? err.message : String(err))
    return result
  }

  for (const paymentId of paymentIds) {
    try {
      const payment = await fetchPaymentById(apiKey, paymentId)
      if (payment.status !== 'succeeded') {
        result.skipped += 1
        continue
      }
      if (payment.campaign_category && payment.campaign_category.toLowerCase() !== 'membership') {
        result.skipped += 1
        continue
      }
      if (!paymentIsInCurrentYear(payment, year)) {
        result.skipped += 1
        continue
      }

      const buyerEmail = normalizeBuyerEmail(payment)
      if (buyerEmail && buyerEmail !== email.toLowerCase()) {
        result.skipped += 1
        continue
      }

      const tier = resolveMembershipTier(payment, campaignSets)
      if (!tier) {
        result.skipped += 1
        continue
      }

      const amountCents = resolvePaymentAmountCents(payment)
      const buyer =
        typeof payment.buyer === 'object' && payment.buyer
          ? payment.buyer
          : { email: buyerEmail ?? email }

      const { data, error } = await supabase.rpc('process_zeffy_membership_payment', {
        p_zeffy_payment_id: paymentId,
        p_email: email,
        p_amount_cents: amountCents,
        p_currency: (payment.currency ?? 'usd').toUpperCase(),
        p_status: 'succeeded',
        p_membership_type_id: membershipTypeIdForTier(tier),
        p_first_name: buyer.first_name ?? null,
        p_last_name: buyer.last_name ?? null,
        p_campaign_id: payment.campaign_id ?? null,
        p_description: payment.description ?? `Zeffy ${tier} membership (API sync)`,
      })

      if (error) {
        result.errors.push(`${paymentId}: ${error.message}`)
        continue
      }

      const payload = data as { duplicate?: boolean; membership_updated?: boolean }
      if (payload.duplicate) {
        result.skipped += 1
      } else {
        result.synced += 1
      }
    } catch (err) {
      result.errors.push(`${paymentId}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return result
}
