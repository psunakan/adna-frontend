import { sendWelcomeEmail } from '../_shared/sendWelcomeEmail.ts'

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
    const memberId = typeof body?.member_id === 'string' ? body.member_id.trim() : ''

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

    const sent = await sendWelcomeEmail({ email, firstName, membershipLabel })
    if (!sent) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to send email.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (memberId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      if (supabaseUrl && serviceRoleKey) {
        const { createClient } = await import('npm:@supabase/supabase-js@2')
        const supabase = createClient(supabaseUrl, serviceRoleKey)
        await supabase.rpc('mark_member_welcome_email_sent', { p_member_id: memberId })
      }
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
