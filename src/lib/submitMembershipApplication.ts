import { isSupabaseConfigured, supabase } from './supabase'
import { sendRegistrationConfirmationEmail } from './sendRegistrationEmail'
import { MEMBERSHIP_TYPE_IDS, type MemberInsert, type MembershipType } from '../types/database'

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
  return {
    title: data.title,
    first_name: data.first_name.trim(),
    middle_name: data.middle_name?.trim() || null,
    last_name: data.last_name.trim(),
    phone_number: `${data.phone_code}${data.phone.trim()}`,
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
    is_active: true,
    is_first_login: true,
  }
}

export async function submitMembershipApplication(data: MembershipFormData) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Contact the site administrator.')
  }

  const { error } = await supabase.from('members').insert(toMemberInsert(data))

  if (error) {
    throw new Error(error.message)
  }

  await sendRegistrationConfirmationEmail({
    email: data.email,
    first_name: data.first_name,
    membership_type: data.membership_type,
  })
}
