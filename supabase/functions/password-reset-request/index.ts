import { createClient } from 'npm:@supabase/supabase-js@2'
import { Resend } from 'npm:resend@4'
import {
  buildPasswordResetEmailHtml,
  buildPasswordResetEmailText,
  PASSWORD_RESET_EMAIL_SUBJECT,
} from '../_shared/email/passwordResetEmailTemplate.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GENERIC_MESSAGE =
  'If an account exists for that email, you will receive reset instructions shortly.'

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

    if (!email) {
      return new Response(JSON.stringify({ success: false, error: 'Email is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL')
    const siteUrl = (Deno.env.get('SITE_URL') ?? 'http://localhost:5173').replace(/\/$/, '')

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase environment variables.')
      return new Response(JSON.stringify({ success: true, message: GENERIC_MESSAGE }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!resendApiKey || !fromEmail) {
      console.error('Resend is not configured (RESEND_API_KEY / RESEND_FROM_EMAIL).')
      return new Response(JSON.stringify({ success: true, message: GENERIC_MESSAGE }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { data, error } = await supabase.rpc('create_member_password_reset', {
      p_email: email,
    })

    if (error) {
      console.error('create_member_password_reset failed:', error.message)
      return new Response(JSON.stringify({ success: true, message: GENERIC_MESSAGE }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const resetData = data as { token: string; email: string; first_name: string } | null

    if (!resetData?.token) {
      console.info('password-reset-request: no matching portal account for email.')
      return new Response(JSON.stringify({ success: true, message: GENERIC_MESSAGE }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const resetUrl = `${siteUrl}/portal/reset-password?token=${resetData.token}`
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
      return new Response(JSON.stringify({ success: true, message: GENERIC_MESSAGE }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.info('password-reset-request: reset email sent.', { email: resetData.email })

    return new Response(JSON.stringify({ success: true, message: GENERIC_MESSAGE }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('password-reset-request error:', err)
    return new Response(JSON.stringify({ success: true, message: GENERIC_MESSAGE }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
