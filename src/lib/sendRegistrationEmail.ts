import { isSupabaseConfigured, supabase } from './supabase'
import type { MembershipType } from '../types/database'

const MEMBERSHIP_LABELS: Record<MembershipType, string> = {
  premium: 'Premium Membership ($150)',
  diaspora: 'Diaspora Membership ($75)',
  regular: 'Regular Membership (FREE)',
}

export async function sendRegistrationConfirmationEmail(data: {
  email: string
  first_name: string
  membership_type: MembershipType
}): Promise<void> {
  if (!isSupabaseConfigured) return

  const { error } = await supabase.functions.invoke('membership-registration-email', {
    body: {
      email: data.email.trim().toLowerCase(),
      first_name: data.first_name.trim(),
      membership_label: MEMBERSHIP_LABELS[data.membership_type],
    },
  })

  if (error) {
    console.warn('Registration confirmation email failed:', error.message)
  }
}
