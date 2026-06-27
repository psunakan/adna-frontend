#!/usr/bin/env node
/**
 * Diagnose a member's payment / activation status by email.
 *
 * Usage:
 *   node --env-file=.env scripts/member-payment-status.mjs molayodecker@gmail.com
 */
import { createClient } from '@supabase/supabase-js'

const email = process.argv[2]?.trim().toLowerCase()
if (!email) {
  console.error('Usage: node --env-file=.env scripts/member-payment-status.mjs <email>')
  process.exit(1)
}

const supabaseUrl = process.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('Member payment status for:', email)
console.log('---')

const { data: members, error: memberError } = await supabase
  .from('members')
  .select('id, email, first_name, last_name, is_active, membership_type_id, created_at')
  .ilike('email', email)
  .limit(5)

if (memberError) {
  console.error('Could not read members (RLS may block anon):', memberError.message)
  console.log('')
  console.log('Try logging into the portal and clicking Refresh status after db:push.')
  process.exit(1)
}

if (!members?.length) {
  console.log('No member found with this email.')
  process.exit(0)
}

for (const member of members) {
  console.log('Member:', {
    id: member.id,
    name: `${member.first_name} ${member.last_name}`,
    is_active: member.is_active,
    created_at: member.created_at,
  })

  const { data: dues, error: duesError } = await supabase
    .from('member_dues')
    .select('id, order_id, amount, currency, status, year, member_id, created_at')
    .or(`member_id.eq.${member.id},member_email.ilike.${email}`)
    .order('created_at', { ascending: false })
    .limit(10)

  if (duesError) {
    console.log('  Dues: (not readable via anon key —', duesError.message + ')')
  } else if (!dues?.length) {
    console.log('  Dues: none recorded — payment webhook may not have run yet.')
  } else {
    console.log('  Dues:')
    for (const due of dues) {
      console.log('   -', {
        status: due.status,
        amount: due.amount,
        currency: due.currency,
        year: due.year,
        linked: due.member_id ? 'yes' : 'no',
        order_id: due.order_id,
        created_at: due.created_at,
      })
    }
  }
}

console.log('---')
console.log('If is_active is false but COMPLETED dues exist, run: npm run db:push')
console.log('Then click Refresh status in the member portal.')
