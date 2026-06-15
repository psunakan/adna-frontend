import { isSupabaseConfigured, supabase } from './supabase'

const GENERIC_MESSAGE =
  'If an account exists for that email, you will receive reset instructions shortly.'

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  if (!isSupabaseConfigured) {
    throw new Error('Member portal is not configured. Contact the site administrator.')
  }

  const { data, error } = await supabase.functions.invoke('password-reset-request', {
    body: { email },
  })

  if (error) {
    throw new Error(error.message || 'Unable to send reset email. Please try again.')
  }

  const message =
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof data.message === 'string'
      ? data.message
      : GENERIC_MESSAGE

  return { message }
}

type RpcFailure = { success: false; error: string }

function isRpcFailure(value: unknown): value is RpcFailure {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    (value as RpcFailure).success === false
  )
}

export async function resetMemberPassword(token: string, password: string): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Member portal is not configured. Contact the site administrator.')
  }

  const { data, error } = await supabase.rpc('reset_member_password', {
    p_token: token,
    p_password: password,
  })

  if (error) {
    throw new Error(error.message)
  }

  if (isRpcFailure(data)) {
    throw new Error(data.error)
  }
}
