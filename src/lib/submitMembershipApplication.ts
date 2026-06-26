import { callingCodeForIso } from '../data/phoneCodeOptions'
import { formatMemberPhoneE164 } from './phoneNumber'
import { isSupabaseConfigured, supabase } from './supabase'
import { sendRegistrationConfirmationEmail } from './sendRegistrationEmail'
import { createMembershipCheckout } from './membershipCheckout'
import { buildZeffyCheckoutUrl } from './zeffyCheckout'
import { MEMBERSHIP_TYPE_IDS, type MemberInsert, type MembershipType } from '../types/database'

export class DuplicateMemberEmailError extends Error {
  constructor() {
    super('An account with this email already exists. Please sign in instead.')
    this.name = 'DuplicateMemberEmailError'
  }
}

function isDuplicateEmailError(error: { code?: string; message?: string }): boolean {
  if (error.code === '23505') return true
  const message = error.message?.toLowerCase() ?? ''
  return message.includes('members_email_unique') || message.includes('duplicate key')
}

export type MembershipFormData = {
  title: string
  first_name: string
  middle_name?: string | null
  last_name: string
  country_residence: string
  state_residence: string
  phone_code: string
  phone: string
  email: string
  password: string
  is_student: boolean
  education: string
  licences: string[]
  licence_speciality?: string | null
  country_practice: string
  state_practice: string
  licence_status: string
  nursing_education: string
  employment_status: string
  specialties: string[]
  position_title: string
  practice_setting: string
  membership_type: MembershipType
}

function toMemberInsert(data: MembershipFormData): MemberInsert {
  const phoneCountryIso = data.phone_code
  const callingCode = callingCodeForIso(phoneCountryIso)
  const phoneNumber =
    formatMemberPhoneE164(data.phone, phoneCountryIso, data.country_residence) ??
    `${callingCode}${data.phone.trim()}`

  return {
    title: data.title,
    first_name: data.first_name.trim(),
    middle_name: data.middle_name?.trim() || null,
    last_name: data.last_name.trim(),
    phone_number: phoneNumber,
    country_residence: data.country_residence,
    state_residence: data.state_residence.trim() || null,
    email: data.email.trim().toLowerCase(),
    is_student: data.is_student,
    education_level: data.education,
    employment_status: data.employment_status,
    licence_status: data.licence_status,
    nurse_licences: data.licences,
    licence_speciality: data.licence_speciality?.trim() || null,
    country_practice: data.country_practice,
    state_practice: data.state_practice.trim() || null,
    nursing_education_country: data.nursing_education.trim(),
    position_title: data.position_title,
    practice_setting: data.practice_setting,
    specialties: data.specialties,
    membership_type_id: MEMBERSHIP_TYPE_IDS[data.membership_type],
    status: 1,
    is_active: false,
    is_first_login: true,
  }
}

export type MembershipCheckoutResult = {
  checkoutToken: string
  zeffyUrl: string
}

export async function submitMembershipApplication(
  data: MembershipFormData,
): Promise<MembershipCheckoutResult> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Contact the site administrator.')
  }

  const email = data.email.trim().toLowerCase()
  const membershipType = data.membership_type

  if (membershipType !== 'diaspora' && membershipType !== 'premium') {
    throw new Error('Please select a paid membership type.')
  }

  const { error } = await supabase.from('members').insert(toMemberInsert(data))

  if (error) {
    if (isDuplicateEmailError(error)) {
      throw new DuplicateMemberEmailError()
    }
    throw new Error(error.message)
  }

  const { data: credsResult, error: credsError } = await supabase.rpc('register_member_credentials', {
    p_email: email,
    p_password: data.password,
  })

  if (credsError) {
    throw new Error(credsError.message)
  }

  const credsPayload = credsResult as { success?: boolean; error?: string } | null
  if (!credsPayload?.success) {
    throw new Error(credsPayload?.error ?? 'Unable to save account password.')
  }

  const checkoutToken = await createMembershipCheckout(email)

  await sendRegistrationConfirmationEmail({
    email,
    first_name: data.first_name,
    membership_type: membershipType,
  })

  return {
    checkoutToken,
    zeffyUrl: buildZeffyCheckoutUrl({
      tier: membershipType,
      email,
      firstName: data.first_name,
      lastName: data.last_name,
    }),
  }
}
