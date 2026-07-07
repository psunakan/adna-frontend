import { Resend } from 'npm:resend@4'
import {
  buildRegistrationEmailHtml,
  buildRegistrationEmailText,
  REGISTRATION_EMAIL_SUBJECT,
} from './email/registrationEmailTemplate.ts'
import { resolveSiteUrl } from './http.ts'

export type WelcomeEmailPayload = {
  email: string
  firstName: string
  membershipLabel: string
}

export async function sendWelcomeEmail(payload: WelcomeEmailPayload): Promise<boolean> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL')
  const siteUrl = resolveSiteUrl() ?? 'http://localhost:5173'

  if (!resendApiKey || !fromEmail) {
    console.warn('Welcome email skipped: RESEND_API_KEY / RESEND_FROM_EMAIL not configured.')
    return false
  }

  const emailData = {
    firstName: payload.firstName.trim(),
    membershipLabel: payload.membershipLabel.trim(),
    siteUrl,
  }

  const resend = new Resend(resendApiKey)
  const { error: sendError } = await resend.emails.send({
    from: fromEmail,
    to: payload.email.trim().toLowerCase(),
    subject: REGISTRATION_EMAIL_SUBJECT,
    html: buildRegistrationEmailHtml(emailData),
    text: buildRegistrationEmailText(emailData),
  })

  if (sendError) {
    console.error('Welcome email send failed:', sendError)
    return false
  }

  return true
}

export type PaymentProcessResult = {
  duplicate?: boolean
  send_welcome_email?: boolean
  member_id?: string
  email?: string
  first_name?: string
  membership_label?: string
}

/** Send welcome email once after first successful payment; marks sent in DB. */
export async function trySendWelcomeEmailAfterPayment(
  supabase: {
    rpc: (
      name: string,
      args: Record<string, unknown>,
    ) => Promise<{ data: unknown; error: { message: string } | null }>
  },
  result: PaymentProcessResult,
): Promise<boolean> {
  if (!result.send_welcome_email) return false

  const email = result.email?.trim()
  const firstName = result.first_name?.trim()
  const membershipLabel = result.membership_label?.trim()
  const memberId = result.member_id

  if (!email || !firstName || !membershipLabel || !memberId) {
    console.warn('Welcome email skipped: missing member details from payment RPC.')
    return false
  }

  const sent = await sendWelcomeEmail({ email, firstName, membershipLabel })
  if (!sent) return false

  const { data, error } = await supabase.rpc('mark_member_welcome_email_sent', {
    p_member_id: memberId,
  })

  if (error) {
    console.error('mark_member_welcome_email_sent failed:', error.message)
    return false
  }

  return data === true
}
