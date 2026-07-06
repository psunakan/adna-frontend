import { createClient } from 'npm:@supabase/supabase-js@2'
import {
  extractPayment,
  isCompletedPaymentEvent,
  loadCampaignIdSets,
  membershipTypeIdForTier,
  resolveMembershipTier,
  resolvePaymentAmountCents,
  type ZeffyWebhookPayload,
} from '../_shared/zeffy.ts'
import {
  trySendWelcomeEmailAfterPayment,
  type PaymentProcessResult,
} from '../_shared/sendWelcomeEmail.ts'
import { corsHeaders, jsonResponse } from '../_shared/http.ts'

function unauthorized() {
  return jsonResponse({ success: false, error: 'Unauthorized.' }, { status: 401 })
}

function verifyWebhookAuth(req: Request): boolean {
  const secret = Deno.env.get('ZEFFY_WEBHOOK_SECRET')?.trim()
  const allowMissingSecret = Deno.env.get('ALLOW_INSECURE_WEBHOOK_DEV') === 'true'

  if (!secret) {
    return allowMissingSecret
  }

  const auth = req.headers.get('authorization') ?? ''
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  const headerSecret = req.headers.get('x-zeffy-webhook-secret')?.trim() ?? ''

  return bearer === secret || headerSecret === secret
}

function isDebugMode(): boolean {
  const value = Deno.env.get('ZEFFY_WEBHOOK_DEBUG')?.trim().toLowerCase()
  return value === '1' || value === 'true' || value === 'yes'
}

function redactHeaders(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {}
  headers.forEach((value, key) => {
    const lower = key.toLowerCase()
    if (lower === 'authorization' || lower === 'x-zeffy-webhook-secret') {
      out[key] = '[redacted]'
      return
    }
    out[key] = value
  })
  return out
}

function debugSummary(payload: ZeffyWebhookPayload) {
  const payment = extractPayment(payload)
  const tier = payment
    ? resolveMembershipTier(
        payment,
        loadCampaignIdSets({
          professional: Deno.env.get('ZEFFY_CAMPAIGN_PROFESSIONAL'),
          premium: Deno.env.get('ZEFFY_CAMPAIGN_PREMIUM'),
          professionalRates: Deno.env.get('ZEFFY_RATE_PROFESSIONAL'),
          premiumRates: Deno.env.get('ZEFFY_RATE_PREMIUM'),
        }),
      )
    : null

  return {
    event_type: payload.type ?? payload.event ?? null,
    parsed_payment_id: payment?.id ?? null,
    resolved_tier: tier,
    amount_cents: payment ? resolvePaymentAmountCents(payment) : null,
    campaign_id: payment?.campaign_id ?? null,
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed.' }, { status: 405 })
  }

  if (!verifyWebhookAuth(req)) {
    return unauthorized()
  }

  const rawBody = await req.text()
  const debug = isDebugMode()

  console.log('Zeffy webhook received')
  if (debug) {
    console.log('Headers:', JSON.stringify(redactHeaders(req.headers)))
    console.log('Body:', rawBody)
  }

  try {
    let payload: ZeffyWebhookPayload
    try {
      payload = JSON.parse(rawBody) as ZeffyWebhookPayload
    } catch {
      return jsonResponse({ success: false, error: 'Invalid JSON body.' }, { status: 400 })
    }

    if (debug) {
      return jsonResponse({
        success: true,
        debug: true,
        ...debugSummary(payload),
      })
    }

    if (!isCompletedPaymentEvent(payload)) {
      return jsonResponse({ success: true, ignored: true, reason: 'not_payment_completed' })
    }

    const payment = extractPayment(payload)
    if (!payment) {
      return jsonResponse({ success: false, error: 'Missing payment payload.' }, { status: 400 })
    }

    if (payment.status && payment.status !== 'succeeded') {
      return jsonResponse({ success: true, ignored: true, reason: 'payment_not_succeeded' })
    }

    const campaignSets = loadCampaignIdSets({
      professional: Deno.env.get('ZEFFY_CAMPAIGN_PROFESSIONAL'),
      premium: Deno.env.get('ZEFFY_CAMPAIGN_PREMIUM'),
      professionalRates: Deno.env.get('ZEFFY_RATE_PROFESSIONAL'),
      premiumRates: Deno.env.get('ZEFFY_RATE_PREMIUM'),
    })

    const tier = resolveMembershipTier(payment, campaignSets)
    if (!tier) {
      const amountCents = resolvePaymentAmountCents(payment)
      console.warn(
        'Could not resolve membership tier for Zeffy payment',
        payment.id,
        amountCents,
        payment.currency,
      )
      return jsonResponse({
        success: true,
        ignored: true,
        reason: 'unrecognized_membership_payment',
        payment_id: payment.id ?? null,
      })
    }

    const email = payment.buyer?.email?.trim().toLowerCase()
    if (!email) {
      return jsonResponse(
        { success: false, error: 'Payment is missing buyer email.' },
        { status: 400 },
      )
    }

    const paymentId = payment.id?.trim()
    if (!paymentId) {
      return jsonResponse({ success: false, error: 'Payment is missing id.' }, { status: 400 })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase service role configuration.')
      return jsonResponse({ success: false, error: 'Server misconfigured.' }, { status: 503 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const amountCents = resolvePaymentAmountCents(payment)

    const { data, error } = await supabase.rpc('process_zeffy_membership_payment', {
      p_zeffy_payment_id: paymentId,
      p_email: email,
      p_amount_cents: amountCents,
      p_currency: (payment.currency ?? 'usd').toUpperCase(),
      p_status: payment.status ?? 'succeeded',
      p_membership_type_id: membershipTypeIdForTier(tier),
      p_first_name: payment.buyer?.first_name ?? null,
      p_last_name: payment.buyer?.last_name ?? null,
      p_campaign_id: payment.campaign_id ?? null,
      p_description: payment.description ?? `Zeffy ${tier} membership`,
    })

    if (error) {
      console.error('process_zeffy_membership_payment failed:', error.message)
      return jsonResponse({ success: false, error: 'Failed to process payment.' }, { status: 500 })
    }

    const result = data as PaymentProcessResult & {
      success?: boolean
      member_found?: boolean
      membership_updated?: boolean
    }

    if (!result.member_found) {
      console.warn('Zeffy payment recorded but no member matched submitted email.')
    }

    const welcomeEmailSent = await trySendWelcomeEmailAfterPayment(supabase, result)

    return jsonResponse({
      success: true,
      tier,
      duplicate: result.duplicate ?? false,
      member_found: result.member_found ?? false,
      membership_updated: result.membership_updated ?? false,
      welcome_email_sent: welcomeEmailSent,
    })
  } catch (err) {
    console.error('zeffy-membership-webhook error:', err)
    return jsonResponse({ success: false, error: 'Unexpected error.' }, { status: 500 })
  }
})
