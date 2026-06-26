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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-zeffy-webhook-secret',
}

function unauthorized() {
  return new Response(JSON.stringify({ success: false, error: 'Unauthorized.' }), {
    status: 401,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function verifyWebhookAuth(req: Request): boolean {
  const secret = Deno.env.get('ZEFFY_WEBHOOK_SECRET')?.trim()
  if (!secret) return true

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
    if (key.toLowerCase() === 'authorization') {
      out[key] = '[redacted]'
      return
    }
    out[key] = value
  })
  return out
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed.' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!verifyWebhookAuth(req)) {
    return unauthorized()
  }

  const rawBody = await req.text()
  const debug = isDebugMode()

  console.log('Zeffy webhook received')
  console.log('Headers:', JSON.stringify(redactHeaders(req.headers)))
  console.log('Body:', rawBody)

  try {
    let payload: ZeffyWebhookPayload
    try {
      payload = JSON.parse(rawBody) as ZeffyWebhookPayload
    } catch {
      return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (debug) {
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

      return new Response(
        JSON.stringify(
          {
            success: true,
            debug: true,
            message: 'Payload captured. Check Supabase function logs for the full body.',
            event_type: payload.type ?? payload.event ?? null,
            parsed_payment: payment ?? null,
            resolved_tier: tier,
            payload,
          },
          null,
          2,
        ),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    if (!isCompletedPaymentEvent(payload)) {
      return new Response(
        JSON.stringify({ success: true, ignored: true, reason: 'not_payment_completed' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const payment = extractPayment(payload)
    if (!payment) {
      return new Response(JSON.stringify({ success: false, error: 'Missing payment payload.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (payment.status && payment.status !== 'succeeded') {
      return new Response(
        JSON.stringify({ success: true, ignored: true, reason: 'payment_not_succeeded' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
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
      return new Response(
        JSON.stringify({
          success: true,
          ignored: true,
          reason: 'unrecognized_membership_payment',
          payment_id: payment.id ?? null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const email = payment.buyer?.email?.trim()
    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Payment is missing buyer email.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const paymentId = payment.id?.trim()
    if (!paymentId) {
      return new Response(JSON.stringify({ success: false, error: 'Payment is missing id.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase service role configuration.')
      return new Response(JSON.stringify({ success: false, error: 'Server misconfigured.' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
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
      return new Response(JSON.stringify({ success: false, error: 'Failed to process payment.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const result = data as {
      success?: boolean
      duplicate?: boolean
      member_found?: boolean
      membership_updated?: boolean
    }

    if (!result.member_found) {
      console.warn(`Zeffy payment recorded but no member matched email: ${email}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        tier,
        duplicate: result.duplicate ?? false,
        member_found: result.member_found ?? false,
        membership_updated: result.membership_updated ?? false,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('zeffy-membership-webhook error:', err)
    return new Response(JSON.stringify({ success: false, error: 'Unexpected error.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
