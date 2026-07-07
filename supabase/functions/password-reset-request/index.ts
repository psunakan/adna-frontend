import { createClient } from 'npm:@supabase/supabase-js@2'
import { Resend } from 'npm:resend@4'
import {
  buildPasswordResetEmailHtml,
  buildPasswordResetEmailText,
  PASSWORD_RESET_EMAIL_SUBJECT,
} from '../_shared/email/passwordResetEmailTemplate.ts'
import {
  corsHeaders,
  jsonResponse,
  normalizeEmail,
  redactEmail,
  resolveSiteUrl,
} from '../_shared/http.ts'

const GENERIC_MESSAGE =
  'If an account exists for that email, you will receive reset instructions shortly.'

function genericResponse() {
  return jsonResponse({ success: true, message: GENERIC_MESSAGE })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed.' }, { status: 405 })
  }

  try {
    const body = await req.json()
    const email = normalizeEmail(body?.email)

    if (!email) {
      return jsonResponse({ success: false, error: 'Email is required.' }, { status: 400 })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL')
    const siteUrl = resolveSiteUrl()

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase environment variables.')
      return genericResponse()
    }

    if (!resendApiKey || !fromEmail) {
      console.error('Resend is not configured (RESEND_API_KEY / RESEND_FROM_EMAIL).')
      return genericResponse()
    }

    if (!siteUrl) {
      console.error('SITE_URL is not configured.')
      return genericResponse()
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { data, error } = await supabase.rpc('create_member_password_reset', {
      p_email: email,
    })

    if (error) {
      console.error('create_member_password_reset failed:', error.message)
      return genericResponse()
    }

    const resetData = data as { token: string; email: string; first_name: string } | null

    if (!resetData?.token) {
      console.info('password-reset-request: no matching portal account for submitted email.')
      return genericResponse()
    }

    const resetUrl = `${siteUrl}/portal/reset-password?token=${encodeURIComponent(resetData.token)}`
    const resend = new Resend(resendApiKey)
    const emailData = {
      firstName: resetData.first_name,
      resetUrl,
      siteUrl,
    }

    const { error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: resetData.email,
      subject: PASSWORD_RESET_EMAIL_SUBJECT,
      html: buildPasswordResetEmailHtml(emailData),
      text: buildPasswordResetEmailText(emailData),
    })

    if (sendError) {
      console.error('Resend send failed:', JSON.stringify(sendError))
      return genericResponse()
    }

    console.info('password-reset-request: reset email sent.', {
      email: redactEmail(resetData.email),
    })

    return genericResponse()
  } catch (err) {
    console.error('password-reset-request error:', err)
    return genericResponse()
  }
})
