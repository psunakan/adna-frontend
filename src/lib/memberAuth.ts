import { isSupabaseConfigured, supabase } from './supabase'

export const SESSION_STORAGE_KEY = 'adna_member_session'
export const PORTAL_PATH = '/portal'
export const PORTAL_LOGIN_PATH = '/portal/login'
export const PORTAL_FORGOT_PASSWORD_PATH = '/portal/forgot-password'
export const PORTAL_RESET_PASSWORD_PATH = '/portal/reset-password'

export type MemberSession = {
  token: string
  member: {
    id: string
    email: string
    first_name: string
    last_name: string
    is_first_login: boolean
    is_active: boolean
  }
}

export type MemberProfile = MemberSession['member'] & {
  middle_name?: string | null
  phone_number: string
  country_residence: string
  membership_label: string
  membership_tier: 'regular' | 'diaspora' | 'premium'
  last_login_at: string | null
  has_paid_current_year_dues?: boolean
}

export type MembershipRefreshResult = {
  paymentStatus: 'paid' | 'pending'
  paymentMessage: string
  member: MemberProfile
}

type RpcSuccess<T> = { success: true } & T
type RpcFailure = { success: false; error: string }

function isRpcFailure(value: unknown): value is RpcFailure {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    (value as RpcFailure).success === false
  )
}

export function getStoredSession(): MemberSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as MemberSession
  } catch {
    return null
  }
}

export function storeSession(session: MemberSession) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY)
}

export async function loginMember(email: string, password: string): Promise<MemberSession> {
  if (!isSupabaseConfigured) {
    throw new Error('Member portal is not configured. Contact the site administrator.')
  }

  const { data, error } = await supabase.rpc('login_member', {
    p_email: email,
    p_password: password,
  })

  if (error) {
    throw new Error(error.message)
  }

  if (isRpcFailure(data)) {
    throw new Error(data.error)
  }

  const result = data as RpcSuccess<{ token: string; member: MemberSession['member'] }>
  const session: MemberSession = { token: result.token, member: result.member }
  storeSession(session)
  return session
}

export async function fetchMemberProfile(token: string): Promise<MemberProfile> {
  if (!isSupabaseConfigured) {
    throw new Error('Member portal is not configured. Contact the site administrator.')
  }

  const { data, error } = await supabase.rpc('get_member_profile', { p_token: token })

  if (error) {
    throw new Error(error.message)
  }

  if (isRpcFailure(data)) {
    throw new Error(data.error)
  }

  const result = data as RpcSuccess<{ member: MemberProfile }>
  return result.member
}

async function refreshMemberMembershipStatusRpc(token: string): Promise<MembershipRefreshResult> {
  const { data, error } = await supabase.rpc('refresh_member_membership_status', {
    p_token: token,
  })

  if (error) {
    throw new Error(error.message)
  }

  if (isRpcFailure(data)) {
    throw new Error(data.error)
  }

  const result = data as RpcSuccess<{
    payment_status: 'paid' | 'pending'
    payment_message: string
    member: MemberProfile
  }>

  return {
    paymentStatus: result.payment_status,
    paymentMessage: result.payment_message,
    member: result.member,
  }
}

export async function refreshMemberMembershipStatus(
  token: string,
): Promise<MembershipRefreshResult> {
  if (!isSupabaseConfigured) {
    throw new Error('Member portal is not configured. Contact the site administrator.')
  }

  const { data, error } = await supabase.functions.invoke('zeffy-membership-sync', {
    body: { token },
  })

  if (error) {
    return refreshMemberMembershipStatusRpc(token)
  }

  if (isRpcFailure(data)) {
    throw new Error(data.error)
  }

  const result = data as RpcSuccess<{
    payment_status: 'paid' | 'pending'
    payment_message: string
    member: MemberProfile
  }>

  if (!result?.payment_status || !result.member) {
    return refreshMemberMembershipStatusRpc(token)
  }

  return {
    paymentStatus: result.payment_status,
    paymentMessage: result.payment_message,
    member: result.member,
  }
}

export async function logoutMember(token: string) {
  if (isSupabaseConfigured) {
    await supabase.rpc('logout_member', { p_token: token })
  }
  clearStoredSession()
}
