#!/usr/bin/env node
/**
 * Admin-only: manually record a Zeffy membership payment (webhook replay).
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env — never expose in the frontend.
 *
 * Usage:
 *   node --env-file=.env scripts/apply-zeffy-payment.mjs <email> <tier>
 *
 * Examples:
 *   npm run zeffy:apply-payment -- molayodecker@gmail.com diaspora
 *   npm run zeffy:apply-payment -- user@example.com premium --payment-id zeffy_abc123
 *
 * Tiers: diaspora (Professional $75) | premium ($150)
 */
import { createClient } from '@supabase/supabase-js'

const TIERS = {
  diaspora: {
    label: 'Professional (diaspora)',
    membershipTypeId: 'd8e37c51-aee6-4f6b-82be-b4bf613cf3ad',
    amountCents: 7500,
    currency: 'USD',
  },
  premium: {
    label: 'Premium',
    membershipTypeId: '56f6be17-ebcd-43ca-9dc6-0e2545e88cac',
    amountCents: 15000,
    currency: 'USD',
  },
}

function parseArgs(argv) {
  const positional = []
  const flags = {}

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--payment-id') {
      flags.paymentId = argv[++i]
    } else if (arg === '--first-name') {
      flags.firstName = argv[++i]
    } else if (arg === '--last-name') {
      flags.lastName = argv[++i]
    } else if (arg === '--amount-cents') {
      flags.amountCents = Number(argv[++i])
    } else if (arg === '--currency') {
      flags.currency = argv[++i]
    } else if (arg === '--description') {
      flags.description = argv[++i]
    } else if (arg.startsWith('--')) {
      console.error(`Unknown flag: ${arg}`)
      process.exit(1)
    } else {
      positional.push(arg)
    }
  }

  return { positional, flags }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  console.error('Get the service role key from Supabase Dashboard → Settings → API Keys.')
  console.error('Never commit it or use it in the browser.')
  process.exit(1)
}

const { positional, flags } = parseArgs(process.argv.slice(2))
const email = positional[0]?.trim().toLowerCase()
const tierKey = positional[1]?.trim().toLowerCase()

if (!email || !tierKey || !TIERS[tierKey]) {
  console.error('Usage: npm run zeffy:apply-payment -- <email> <diaspora|premium> [flags]')
  console.error(
    'Flags: --payment-id --first-name --last-name --amount-cents --currency --description',
  )
  process.exit(1)
}

const tier = TIERS[tierKey]
const paymentId =
  flags.paymentId?.trim() || `manual-${email.replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`
const amountCents = Number.isFinite(flags.amountCents) ? flags.amountCents : tier.amountCents
const currency = (flags.currency ?? tier.currency).toUpperCase()
const description = flags.description?.trim() || `Manual admin replay — ${tier.label} membership`

const supabase = createClient(supabaseUrl, serviceRoleKey)

console.log('Apply Zeffy payment (admin)')
console.log('Email:', email)
console.log('Tier:', tier.label)
console.log('Payment ID:', paymentId)
console.log('---')

const { data: memberBefore, error: memberError } = await supabase
  .from('members')
  .select('id, email, first_name, last_name, is_active, membership_type_id')
  .ilike('email', email)
  .maybeSingle()

if (memberError) {
  console.error('Could not load member:', memberError.message)
  process.exit(1)
}

if (!memberBefore) {
  console.error('No member found for this email. They must register on the site first.')
  process.exit(1)
}

console.log('Before:', {
  name: `${memberBefore.first_name} ${memberBefore.last_name}`,
  is_active: memberBefore.is_active,
})

const { data: rpcData, error: rpcError } = await supabase.rpc('process_zeffy_membership_payment', {
  p_zeffy_payment_id: paymentId,
  p_email: email,
  p_amount_cents: amountCents,
  p_currency: currency,
  p_status: 'succeeded',
  p_membership_type_id: tier.membershipTypeId,
  p_first_name: flags.firstName?.trim() || null,
  p_last_name: flags.lastName?.trim() || null,
  p_campaign_id: null,
  p_description: description,
})

if (rpcError) {
  console.error('RPC failed:', rpcError.message)
  process.exit(1)
}

console.log('RPC result:', rpcData)

if (rpcData?.duplicate) {
  console.log('Note: This payment ID was already recorded (duplicate). Checking current status…')
}

const { data: memberAfter, error: afterError } = await supabase
  .from('members')
  .select('id, email, first_name, last_name, is_active')
  .eq('id', memberBefore.id)
  .single()

if (afterError) {
  console.error('Could not reload member:', afterError.message)
  process.exit(1)
}

const { data: dues } = await supabase
  .from('member_dues')
  .select('id, status, amount, currency, year, order_id, created_at')
  .eq('member_id', memberBefore.id)
  .order('created_at', { ascending: false })
  .limit(3)

console.log('After:', {
  name: `${memberAfter.first_name} ${memberAfter.last_name}`,
  is_active: memberAfter.is_active,
})

if (dues?.length) {
  console.log('Recent dues:')
  for (const due of dues) {
    console.log(' -', due)
  }
}

if (memberAfter.is_active) {
  console.log('---')
  console.log('Done. Member can click Refresh status in the portal (or sign in again).')
} else {
  console.error('Member is still inactive. Check RPC result and member_dues.')
  process.exit(1)
}
