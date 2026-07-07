import { createClient } from 'npm:@supabase/supabase-js@2'
import { syncZeffyPaymentsForEmail } from '../_shared/zeffyApi.ts'
import { corsHeaders, jsonResponse, normalizeEmail } from '../_shared/http.ts'

const ZEFFY_SYNC_COOLDOWN_SECONDS = 60

type RefreshPayload = {
  success?: boolean
  error?: string
  payment_status?: 'paid' | 'pending'
  payment_message?: string
  member?: Record<string, unknown>
}

type SyncSlotPayload = {
  success?: boolean
  error?: string
  allowed?: boolean
  email?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed.' }, { status: 405 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ success: false, error: 'Server misconfigured.' }, { status: 503 })
  }

  let token: string | undefined
  try {
    const body = await req.json()
    token = typeof body?.token === 'string' ? body.token.trim() : undefined
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  if (!token) {
    return jsonResponse({ success: false, error: 'Session token is required.' }, { status: 400 })
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
      return jsonResponse(refresh, { status: 401 })
    }

    const alreadyPaid = refresh.payment_status === 'paid'

    let zeffySync = { synced: 0, skipped: 0, errors: [] as string[] }
    let zeffySyncError = false
    let zeffySyncSkippedCooldown = false

    if (!alreadyPaid) {
      const { data: slotData, error: slotError } = await supabase.rpc('try_acquire_zeffy_sync', {
        p_token: token,
        p_cooldown_seconds: ZEFFY_SYNC_COOLDOWN_SECONDS,
      })

      if (slotError) {
        console.error('try_acquire_zeffy_sync failed:', slotError.message)
        zeffySyncError = true
      } else {
        const slot = slotData as SyncSlotPayload

        if (slot.success === false) {
          return jsonResponse(slot, { status: 401 })
        }

        if (slot.allowed) {
          const email = normalizeEmail(slot.email ?? refresh.member?.email)
          if (email) {
            zeffySync = await syncZeffyPaymentsForEmail(supabase, email, {
              apiKey: Deno.env.get('ZEFFY_API_KEY'),
              campaignProfessional: Deno.env.get('ZEFFY_CAMPAIGN_PROFESSIONAL'),
              campaignPremium: Deno.env.get('ZEFFY_CAMPAIGN_PREMIUM'),
              rateProfessional: Deno.env.get('ZEFFY_RATE_PROFESSIONAL'),
              ratePremium: Deno.env.get('ZEFFY_RATE_PREMIUM'),
            })

            if (zeffySync.errors.length > 0) {
              console.error('Zeffy sync errors:', zeffySync.errors)
              zeffySyncError = true
            }

            if (zeffySync.synced > 0) {
              refresh = await callRefresh()
            }
          }
        } else {
          zeffySyncSkippedCooldown = true
        }
      }
    }

    return jsonResponse({
      ...refresh,
      zeffy_synced: zeffySync.synced,
      zeffy_skipped: zeffySync.skipped,
      zeffy_sync_error: zeffySyncError ? true : undefined,
      zeffy_sync_skipped_cooldown: zeffySyncSkippedCooldown ? true : undefined,
    })
  } catch (err) {
    console.error('zeffy-membership-sync error:', err)
    return jsonResponse({ success: false, error: 'Unexpected error.' }, { status: 500 })
  }
})
