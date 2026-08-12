/**
 * WordPress ADNA Membership REST client.
 */

export type MembershipFormFieldOption = {
  value: string
  label: string
  amount?: number
}

export type MembershipFormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'tel'
  | 'textarea'
  | 'select'
  | 'searchable_select'
  | 'radio'
  | 'checkbox'
  | 'checkbox_group'
  | 'yes_no'
  | 'country'
  | 'state'
  | 'membership_type'

export type MembershipFormField = {
  key: string
  label: string
  type: MembershipFormFieldType
  step: number
  sortOrder: number
  required: boolean
  placeholder?: string | null
  helpText?: string | null
  options?: MembershipFormFieldOption[]
  defaultValue?: unknown
  validation?: {
    minLength?: number
    maxLength?: number
    matchField?: string
    minSelections?: number
    format?: string
  }
  width?: 'full' | 'half'
  config?: {
    countryField?: string
    paidOnly?: boolean
    showWhen?: {
      field: string
      value: unknown
      requiredWhenVisible?: boolean
    }
  }
  isSystem?: boolean
}

export type MembershipFormStep = {
  number: number
  title: string
  description?: string | null
}

export type MembershipFormSchema = {
  version: string
  steps: MembershipFormStep[]
  fields: MembershipFormField[]
}

export type AdnaRegisterResponse = {
  member: {
    id: string
    email: string
    first_name: string
    last_name: string
    is_active?: boolean
  }
  checkout_token: string
  checkout_url: string
}

export type AdnaApiErrorBody = {
  code?: string
  message?: string
  errors?: Record<string, string>
}

const rawBase = (import.meta.env.VITE_ADNA_API_URL as string | undefined)?.trim() ?? ''

export const adnaApiBaseUrl = rawBase.replace(/\/$/, '')

export const isAdnaApiConfigured = adnaApiBaseUrl.length > 0

async function adnaFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!isAdnaApiConfigured) {
    throw new Error('ADNA API is not configured. Set VITE_ADNA_API_URL.')
  }

  const response = await fetch(`${adnaApiBaseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  const text = await response.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text) as unknown
    } catch {
      body = { message: text }
    }
  }

  if (!response.ok) {
    const errorBody = (body ?? {}) as AdnaApiErrorBody
    const error = new Error(errorBody.message ?? `Request failed (${response.status})`)
    Object.assign(error, {
      status: response.status,
      code: errorBody.code,
      fieldErrors: errorBody.errors,
    })
    throw error
  }

  return body as T
}

export async function fetchMembershipFormSchema(): Promise<MembershipFormSchema> {
  return adnaFetch<MembershipFormSchema>('/form-schema')
}

export async function registerMemberViaAdnaApi(
  values: Record<string, unknown>,
): Promise<AdnaRegisterResponse> {
  return adnaFetch<AdnaRegisterResponse>('/register', {
    method: 'POST',
    body: JSON.stringify(values),
  })
}

export async function getCheckoutStatus(token: string): Promise<{
  status: 'paid' | 'pending'
  is_active: boolean
  member: { id: string; email: string; first_name: string; last_name: string }
}> {
  return adnaFetch(`/checkout/${encodeURIComponent(token)}`)
}
