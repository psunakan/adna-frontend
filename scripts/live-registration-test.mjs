import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env')
  process.exit(1)
}

const timestamp = Date.now()
const recipient =
  process.env.TEST_REGISTRATION_EMAIL ?? `molayodecker+adna-test-${timestamp}@gmail.com`

const member = {
  title: 'Ms',
  first_name: 'Live',
  middle_name: null,
  last_name: 'Test',
  phone_number: '+13015550199',
  country_residence: 'United States',
  state_residence: 'Maryland',
  email: recipient.toLowerCase(),
  is_student: false,
  education_level: 'Bachelors',
  employment_status: 'Full-time',
  licence_status: 'Active',
  nurse_licences: ['Registered Nurse'],
  licence_speciality: null,
  country_practice: 'United States',
  state_practice: 'Maryland',
  nursing_education_country: 'United States',
  position_title: 'Staff Nurse',
  practice_setting: 'Hospital',
  specialties: ['Acute Care'],
  membership_type_id: 'b9aabd89-7ea5-4da2-aa66-ef09dfb7b4a0',
  status: 1,
  is_active: true,
  is_first_login: true,
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('Live registration test')
console.log('Recipient:', recipient)
console.log('---')

console.log('1. Inserting member...')
const { error: insertError } = await supabase.from('members').insert(member)

if (insertError) {
  console.error('Insert failed:', insertError.message)
  process.exit(1)
}

console.log('   Member inserted successfully.')

console.log('2. Sending registration confirmation email...')
const internalSecret = process.env.INTERNAL_FUNCTION_SECRET?.trim()
if (!internalSecret) {
  console.error('INTERNAL_FUNCTION_SECRET is not set in .env')
  process.exit(1)
}

const { data: emailData, error: emailError } = await supabase.functions.invoke(
  'membership-registration-email',
  {
    body: {
      email: member.email,
      first_name: member.first_name,
      membership_label: 'Regular Membership (FREE)',
    },
    headers: { 'x-internal-function-secret': internalSecret },
  },
)

if (emailError) {
  console.error('Email function failed:', emailError.message)
  process.exit(1)
}

if (emailData && emailData.success === false) {
  console.error('Email function returned error:', emailData.error ?? emailData)
  process.exit(1)
}

console.log('   Email sent successfully.')
console.log('---')
console.log('Done. Check the inbox for:', recipient)
