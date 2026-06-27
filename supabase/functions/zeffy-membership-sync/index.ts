import { createClient } from 'npm:@supabase/supabase-js@2'
import { syncZeffyPaymentsForEmail } from '../_shared/zeffyApi.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type RefreshPayload = {
  success?: boolean
  error?: string
  payment_status?: 'paid' | 'pending'
  payment_message?: string
  member?: Record<string, unknown>
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

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ success: false, error: 'Server misconfigured.' }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let token: string | undefined
  try {
    const body = await req.json()
    token = typeof body?.token === 'string' ? body.token.trim() : undefined
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!token) {
    return new Response(JSON.stringify({ success: false, error: 'Session token is required.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  async function callRefresh() {
    const { data, error } = await supabase.rpc('refresh_member_membership_status', {
      p_token: token,
    })
    if (error) {
      throw new Error(error.message)
    }
    return data as RefreshPayload
  }

  try {
    let refresh = await callRefresh()

    if (refresh.success === false) {
      return new Response(JSON.stringify(refresh), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const alreadyPaid =
      refresh.payment_status === 'paid' || refresh.member?.is_active === true

    let zeffySync = { synced: 0, skipped: 0, errors: [] as string[] }

    if (!alreadyPaid) {
      const email = typeof refresh.member?.email === 'string' ? refresh.member.email : null
      if (email) {
        zeffySync = await syncZeffyPaymentsForEmail(supabase, email, {
          apiKey: Deno.env.get('ZEFFY_API_KEY'),
          campaignProfessional: Deno.env.get('ZEFFY_CAMPAIGN_PROFESSIONAL'),
          campaignPremium: Deno.env.get('ZEFFY_CAMPAIGN_PREMIUM'),
          rateProfessional: Deno.env.get('ZEFFY_RATE_PROFESSIONAL'),
          ratePremium: Deno.env.get('ZEFFY_RATE_PREMIUM'),
        })

        if (zeffySync.synced > 0) {
          refresh = await callRefresh()
        }
      }
    }

    return new Response(
      JSON.stringify({
        ...refresh,
        zeffy_synced: zeffySync.synced,
        zeffy_skipped: zeffySync.skipped,
        zeffy_errors: zeffySync.errors.length ? zeffySync.errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('zeffy-membership-sync error:', err)
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : 'Unexpected error.',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
