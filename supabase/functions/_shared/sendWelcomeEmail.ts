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

type WelcomeEmailSupabase = {
  rpc: (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { message: string } | null }>
}

export async function sendWelcomeEmail(payload: WelcomeEmailPayload): Promise<boolean> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL')
  const siteUrl = resolveSiteUrl()

  if (!resendApiKey || !fromEmail) {
    console.warn('Welcome email skipped: RESEND_API_KEY / RESEND_FROM_EMAIL not configured.')
    return false
  }

  if (!siteUrl) {
    console.error('Welcome email skipped: SITE_URL is not configured.')
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

export type WelcomeEmailDeliveryPayload = {
  memberId: string
  email: string
  firstName: string
  membershipLabel: string
}

/** Claim lease, send welcome email, then mark sent or clear claim on failure. */
export async function deliverWelcomeEmailWithClaim(
  supabase: WelcomeEmailSupabase,
  payload: WelcomeEmailDeliveryPayload,
): Promise<boolean> {
  const memberId = payload.memberId.trim()
  const email = payload.email.trim().toLowerCase()
  const firstName = payload.firstName.trim()
  const membershipLabel = payload.membershipLabel.trim()

  if (!memberId || !email || !firstName || !membershipLabel) {
    console.warn('Welcome email skipped: missing member delivery fields.')
    return false
  }

  const { data: claimToken, error: claimError } = await supabase.rpc(
    'claim_member_welcome_email_send',
    { p_member_id: memberId },
  )

  if (claimError) {
    console.error('claim_member_welcome_email_send failed:', claimError.message)
    return false
  }

  if (typeof claimToken !== 'string' || !claimToken.trim()) {
    return false
  }

  const token = claimToken.trim()
  const sent = await sendWelcomeEmail({ email, firstName, membershipLabel })

  if (!sent) {
    const { error: clearError } = await supabase.rpc('clear_member_welcome_email_claim', {
      p_member_id: memberId,
      p_claim_token: token,
    })

    if (clearError) {
      console.error('clear_member_welcome_email_claim failed:', clearError.message)
    }

    return false
  }

  const { data: marked, error: markError } = await supabase.rpc('mark_member_welcome_email_sent', {
    p_member_id: memberId,
    p_claim_token: token,
  })

  if (markError) {
    console.error('mark_member_welcome_email_sent failed after send:', markError.message)
    return false
  }

  if (marked !== true) {
    console.error('mark_member_welcome_email_sent returned unexpected result after send:', marked)
    return false
  }

  return true
}

/** Send welcome email once after first successful payment; uses claim lease before send. */
export async function trySendWelcomeEmailAfterPayment(
  supabase: WelcomeEmailSupabase,
  result: PaymentProcessResult,
): Promise<boolean> {
  if (!result.send_welcome_email) return false

  const email = result.email?.trim()
  const firstName = result.first_name?.trim()
  const membershipLabel = result.membership_label?.trim()
  const memberId = result.member_id?.trim()

  if (!email || !firstName || !membershipLabel || !memberId) {
    console.warn('Welcome email skipped: missing member details from payment RPC.')
    return false
  }

  return deliverWelcomeEmailWithClaim(supabase, {
    memberId,
    email,
    firstName,
    membershipLabel,
  })
}
