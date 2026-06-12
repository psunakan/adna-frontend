const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function buildEmailHtml(firstName: string, membershipLabel: string, siteUrl: string) {
  const safeName = escapeHtml(firstName)
  const safeLabel = escapeHtml(membershipLabel)
  const safeSite = escapeHtml(siteUrl)

  return `<!DOCTYPE html>
<html>
  <body style="font-family: 'Open Sans', Arial, sans-serif; line-height: 1.6; color: #1f2937;">
    <p>Hello ${safeName},</p>
    <p>Thank you for registering with the <strong>African-Diaspora Nursing Alliance (A-DNA)</strong>.</p>
    <p>We have received your membership application for:</p>
    <p style="background:#f0faf6;border-left:4px solid #0D3D2B;padding:12px 16px;border-radius:4px;">
      <strong>${safeLabel}</strong>
    </p>
    <p>Our team will review your application and follow up if anything else is needed. In the meantime, you can visit our website:</p>
    <p>
      <a href="${safeSite}" style="display:inline-block;background:#0D3D2B;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;">
        Visit A-DNA
      </a>
    </p>
    <p>If you have questions, reply to this email or contact us at <a href="mailto:info@a-dna.org">info@a-dna.org</a>.</p>
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

    const resend = new Resend(resendApiKey)
    const { error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Your A-DNA membership application',
      html: buildEmailHtml(firstName, membershipLabel, siteUrl),
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
