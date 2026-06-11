import { createClient } from 'npm:@supabase/supabase-js@2'
import { Resend } from 'npm:resend@4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GENERIC_MESSAGE =
  'If an account exists for that email, you will receive reset instructions shortly.'

function buildEmailHtml(firstName: string, resetUrl: string) {
  return `<!DOCTYPE html>
<html>
  <body style="font-family: 'Open Sans', Arial, sans-serif; line-height: 1.6; color: #1f2937;">
    <p>Hello ${firstName},</p>
    <p>We received a request to reset your A-DNA Member Portal password.</p>
    <p>
      <a href="${resetUrl}" style="display:inline-block;background:#0D3D2B;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;">
        Reset password
      </a>
    </p>
    <p>Or copy this link into your browser:</p>
    <p style="word-break:break-all;color:#64748b;">${resetUrl}</p>
    <p>This link expires in 1 hour. If you did not request a reset, you can ignore this email.</p>
    <p style="color:#64748b;font-size:14px;">African-Diaspora Nursing Alliance (A-DNA)</p>
  </body>
</html>`
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
    const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173'

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase environment variables.')
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

    if (resetData?.token && resendApiKey && fromEmail) {
      const resetUrl = `${siteUrl.replace(/\/$/, '')}/portal/reset-password?token=${resetData.token}`
      const resend = new Resend(resendApiKey)

      const { error: sendError } = await resend.emails.send({
        from: fromEmail,
        to: resetData.email,
        subject: 'Reset your A-DNA Member Portal password',
        html: buildEmailHtml(resetData.first_name, resetUrl),
      })

      if (sendError) {
        console.error('Resend send failed:', sendError)
      }
    } else if (resetData?.token) {
      console.error('Resend is not configured (RESEND_API_KEY / RESEND_FROM_EMAIL).')
    }

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
