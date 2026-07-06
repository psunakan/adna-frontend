import { sendWelcomeEmail } from '../_shared/sendWelcomeEmail.ts'
import { corsHeaders, jsonResponse, normalizeEmail, verifyInternalFunctionSecret } from '../_shared/http.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed.' }, { status: 405 })
  }

  if (!verifyInternalFunctionSecret(req)) {
    return jsonResponse({ success: false, error: 'Unauthorized.' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  try {
    const email = normalizeEmail(body?.email)
    const firstName = typeof body?.first_name === 'string' ? body.first_name.trim() : ''
    const membershipLabel =
      typeof body?.membership_label === 'string' ? body.membership_label.trim() : 'Membership'
    const memberId = typeof body?.member_id === 'string' ? body.member_id.trim() : ''

    if (!email || !firstName) {
      return jsonResponse({ success: false, error: 'Email and first name are required.' }, { status: 400 })
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL')

    if (!resendApiKey || !fromEmail) {
      console.error('Resend is not configured (RESEND_API_KEY / RESEND_FROM_EMAIL).')
      return jsonResponse({ success: false, error: 'Email service not configured.' }, { status: 503 })
    }

    const sent = await sendWelcomeEmail({ email, firstName, membershipLabel })
    if (!sent) {
      return jsonResponse({ success: false, error: 'Failed to send email.' }, { status: 500 })
    }

    if (memberId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      if (supabaseUrl && serviceRoleKey) {
        const { createClient } = await import('npm:@supabase/supabase-js@2')
        const supabase = createClient(supabaseUrl, serviceRoleKey)
        const { data, error } = await supabase.rpc('mark_member_welcome_email_sent', {
          p_member_id: memberId,
        })

        if (error) {
          console.error('mark_member_welcome_email_sent failed:', error.message)
        } else if (data !== true) {
          console.warn('mark_member_welcome_email_sent returned unexpected result:', data)
        }
      }
    }

    return jsonResponse({ success: true })
  } catch (err) {
    console.error('membership-registration-email error:', err)
    return jsonResponse({ success: false, error: 'Unexpected error.' }, { status: 500 })
  }
})
