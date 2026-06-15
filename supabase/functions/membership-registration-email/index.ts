import { Resend } from 'npm:resend@4'
import {
  buildRegistrationEmailHtml,
  buildRegistrationEmailText,
  REGISTRATION_EMAIL_SUBJECT,
} from '../_shared/email/registrationEmailTemplate.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed.' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await req.json()
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    const firstName = typeof body?.first_name === 'string' ? body.first_name.trim() : ''
    const membershipLabel =
      typeof body?.membership_label === 'string' ? body.membership_label.trim() : 'Membership'

    if (!email || !firstName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email and first name are required.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL')
    const siteUrl = (Deno.env.get('SITE_URL') ?? 'http://localhost:5173').replace(/\/$/, '')

    if (!resendApiKey || !fromEmail) {
      console.error('Resend is not configured (RESEND_API_KEY / RESEND_FROM_EMAIL).')
      return new Response(
        JSON.stringify({ success: false, error: 'Email service not configured.' }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const emailData = { firstName, membershipLabel, siteUrl }
    const resend = new Resend(resendApiKey)
    const { error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: REGISTRATION_EMAIL_SUBJECT,
      html: buildRegistrationEmailHtml(emailData),
      text: buildRegistrationEmailText(emailData),
    })

    if (sendError) {
      console.error('Resend send failed:', sendError)
      return new Response(JSON.stringify({ success: false, error: 'Failed to send email.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('membership-registration-email error:', err)
    return new Response(JSON.stringify({ success: false, error: 'Unexpected error.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
