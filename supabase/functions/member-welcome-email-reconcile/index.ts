import { createClient } from 'npm:@supabase/supabase-js@2'
import { deliverWelcomeEmailWithClaim } from '../_shared/sendWelcomeEmail.ts'
import {
  corsHeaders,
  jsonResponse,
  redactEmail,
  verifyInternalFunctionSecret,
} from '../_shared/http.ts'
import { verifySharedSecret } from '../_shared/secrets.ts'

type PendingWelcomeMember = {
  member_id: string
  email: string
  first_name: string
  membership_label: string
}

function verifyReconcileAuth(req: Request): boolean {
  if (verifyInternalFunctionSecret(req)) return true

  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const auth = req.headers.get('authorization') ?? ''
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  return verifySharedSecret(bearer, serviceRoleKey)
}

function resolveLimit(body: Record<string, unknown> | null): number {
  const raw = body?.p_limit ?? body?.limit
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return 50
  return Math.max(1, Math.min(Math.trunc(raw), 200))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed.' }, { status: 405 })
  }

  if (!verifyReconcileAuth(req)) {
    return jsonResponse({ success: false, error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ success: false, error: 'Server misconfigured.' }, { status: 503 })
    }

    let body: Record<string, unknown> | null = null
    try {
      const text = await req.text()
      if (text.trim()) {
        body = JSON.parse(text) as Record<string, unknown>
      }
    } catch {
      return jsonResponse({ success: false, error: 'Invalid JSON body.' }, { status: 400 })
    }

    const limit = resolveLimit(body)
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { data, error } = await supabase.rpc('get_pending_member_welcome_emails', {
      p_limit: limit,
    })

    if (error) {
      console.error('get_pending_member_welcome_emails failed:', error.message)
      return jsonResponse(
        { success: false, error: 'Failed to load pending welcome emails.' },
        { status: 500 },
      )
    }

    const pending = (data ?? []) as PendingWelcomeMember[]
    let sent = 0
    let failed = 0

    for (const member of pending) {
      const memberId = member.member_id?.trim()
      const email = member.email?.trim().toLowerCase()
      const firstName = member.first_name?.trim()
      const membershipLabel = member.membership_label?.trim() || 'Membership'

      if (!memberId || !email || !firstName) {
        console.warn(
          'Skipping pending welcome email: incomplete member row.',
          memberId ?? '[unknown]',
        )
        failed++
        continue
      }

      const delivered = await deliverWelcomeEmailWithClaim(supabase, {
        memberId,
        email,
        firstName,
        membershipLabel,
      })

      if (!delivered) {
        failed++
        continue
      }

      console.log('Welcome email reconciled for', redactEmail(email))
      sent++
    }

    return jsonResponse({
      success: true,
      source: typeof body?.source === 'string' ? body.source : 'manual',
      pending: pending.length,
      sent,
      failed,
    })
  } catch (err) {
    console.error('member-welcome-email-reconcile error:', err)
    return jsonResponse({ success: false, error: 'Unexpected error.' }, { status: 500 })
  }
})
