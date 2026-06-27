#!/usr/bin/env node
/**
 * Integration test: Zeffy checkout URL + webhook buyer name sync.
 *
 * Usage:
 *   node --env-file=.env scripts/zeffy-sync-test.mjs
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env')
  process.exit(1)
}

const DIASPORA_TYPE_ID = 'd8e37c51-aee6-4f6b-82be-b4bf613cf3ad'
const timestamp = Date.now()
const testEmail = `zeffy-sync-test-${timestamp}@example.com`
const testPassword = 'TestPassword123!'
const paymentId = `test-pay-${timestamp}`

const supabase = createClient(supabaseUrl, supabaseKey)

function assert(condition, message) {
  if (!condition) {
    console.error('FAIL:', message)
    process.exit(1)
  }
}

console.log('Zeffy sync integration test')
console.log('Test email:', testEmail)
console.log('---')

console.log('1. Checkout URL (email only, no name params)')
const checkoutUrl = new URL(
  process.env.VITE_ZEFFY_MEMBERSHIP_URL ??
    'https://www.zeffy.com/en-US/ticketing/ghanaian-diaspora-nursing-alliances-memberships-2',
)
checkoutUrl.searchParams.set('email', testEmail)
const urlStr = checkoutUrl.toString()
assert(urlStr.includes(`email=${encodeURIComponent(testEmail)}`), 'checkout URL includes email')
assert(!urlStr.includes('firstname='), 'checkout URL must not include firstname')
assert(!urlStr.includes('lastname='), 'checkout URL must not include lastname')
console.log('   OK:', urlStr.slice(0, 80) + '…')

console.log('2. Register pending member (is_active=false)')
const { error: insertError } = await supabase.from('members').insert({
  title: 'Ms',
  first_name: 'RegFirst',
  last_name: 'RegLast',
  phone_number: '+15555550999',
  country_residence: 'United States',
  state_residence: 'Maryland',
  email: testEmail,
  is_student: false,
  education_level: 'Bachelors',
  employment_status: 'Full-time',
  licence_status: 'Active',
  nurse_licences: ['Registered Nurse'],
  country_practice: 'United States',
  state_practice: 'Maryland',
  nursing_education_country: 'United States',
  position_title: 'Staff Nurse',
  practice_setting: 'Hospital',
  specialties: ['Acute Care'],
  membership_type_id: DIASPORA_TYPE_ID,
  status: 1,
  is_active: false,
  is_first_login: true,
})

if (insertError) {
  console.error('Insert failed:', insertError.message)
  process.exit(1)
}
console.log('   Member inserted.')

console.log('3. Save portal credentials')
const { data: credsData, error: credsError } = await supabase.rpc('register_member_credentials', {
  p_email: testEmail,
  p_password: testPassword,
})

if (credsError || !credsData?.success) {
  console.error('Credentials failed:', credsError?.message ?? credsData?.error)
  process.exit(1)
}
console.log('   Credentials saved.')

console.log('4. Create checkout token')
const { data: checkoutData, error: checkoutError } = await supabase.rpc(
  'create_membership_checkout',
  { p_email: testEmail },
)

if (checkoutError || !checkoutData?.token) {
  console.error('Checkout failed:', checkoutError?.message ?? checkoutData)
  process.exit(1)
}
const checkoutToken = checkoutData.token
console.log('   Token:', checkoutToken.slice(0, 12) + '…')

console.log('5. Simulate Zeffy webhook (buyer name from checkout form)')
const webhookPayload = {
  type: 'payment.completed',
  data: {
    id: paymentId,
    amount: 7500,
    currency: 'usd',
    status: 'succeeded',
    buyer: {
      email: testEmail,
      first_name: 'ZeffyFirst',
      last_name: 'ZeffyLast',
    },
  },
}

const webhookHeaders = { 'Content-Type': 'application/json' }
const webhookSecret = process.env.ZEFFY_WEBHOOK_SECRET?.trim()
if (webhookSecret) {
  webhookHeaders['x-zeffy-webhook-secret'] = webhookSecret
}

const webhookRes = await fetch(`${supabaseUrl}/functions/v1/zeffy-membership-webhook`, {
  method: 'POST',
  headers: webhookHeaders,
  body: JSON.stringify(webhookPayload),
})

const webhookBody = await webhookRes.json().catch(() => ({}))
if (!webhookRes.ok) {
  console.error('Webhook HTTP', webhookRes.status, webhookBody)
  process.exit(1)
}
assert(webhookBody.success === true, 'webhook returned success')
assert(webhookBody.member_found === true, 'webhook matched member by email')
assert(webhookBody.membership_updated === true, 'webhook activated membership')
console.log('   Webhook response:', JSON.stringify(webhookBody))

console.log('6. Checkout status should be confirmed')
const { data: statusData, error: statusError } = await supabase.rpc(
  'get_membership_checkout_status',
  { p_token: checkoutToken },
)

if (statusError || statusData?.status !== 'confirmed') {
  console.error('Checkout status failed:', statusError?.message ?? statusData)
  process.exit(1)
}
console.log('   Status: confirmed')

console.log('7. Portal profile should reflect Zeffy buyer name + active')
const { data: loginData, error: loginError } = await supabase.rpc('login_member', {
  p_email: testEmail,
  p_password: testPassword,
})

if (loginError || !loginData?.success || !loginData?.token) {
  console.error('Login failed:', loginError?.message ?? loginData?.error)
  process.exit(1)
}

const { data: profileData, error: profileError } = await supabase.rpc('get_member_profile', {
  p_token: loginData.token,
})

if (profileError || !profileData?.success) {
  console.error('Profile failed:', profileError?.message ?? profileData?.error)
  process.exit(1)
}

const member = profileData.member
assert(member.first_name === 'ZeffyFirst', `first_name is ZeffyFirst (got ${member.first_name})`)
assert(member.last_name === 'ZeffyLast', `last_name is ZeffyLast (got ${member.last_name})`)
assert(member.is_active === true, 'member is active')
assert(member.membership_tier === 'diaspora', `tier is diaspora (got ${member.membership_tier})`)

console.log('   Profile:', {
  name: `${member.first_name} ${member.last_name}`,
  tier: member.membership_tier,
  is_active: member.is_active,
})

console.log('---')
console.log('All checks passed.')
console.log('Test member left in DB:', testEmail, '(safe to ignore or delete manually)')
