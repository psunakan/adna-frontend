import { verifySharedSecret } from './secrets.ts'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-internal-function-secret, x-zeffy-webhook-secret',
}

type JsonResponseInit = {
  status?: number
  headers?: Record<string, string>
}

export function jsonResponse(body: unknown, init?: JsonResponseInit): Response {
  return new Response(JSON.stringify(body), {
    status: init?.status ?? 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...(init?.headers ?? {}),
    },
  })
}

export function verifyInternalFunctionSecret(req: Request): boolean {
  const secret = Deno.env.get('INTERNAL_FUNCTION_SECRET')
  const headerSecret = req.headers.get('x-internal-function-secret') ?? ''
  return verifySharedSecret(headerSecret, secret)
}

export function normalizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

export function redactEmail(email: string): string {
  const normalized = email.trim().toLowerCase()
  const at = normalized.indexOf('@')
  if (at <= 0) return '[redacted]'
  const local = normalized.slice(0, at)
  const domain = normalized.slice(at + 1)
  const visible = local.slice(0, Math.min(2, local.length))
  return `${visible}***@${domain}`
}

export function resolveSiteUrl(): string | null {
  const raw = Deno.env.get('SITE_URL')?.trim()
  if (raw) return raw.replace(/\/$/, '')

  if (Deno.env.get('ALLOW_LOCAL_SITE_URL') === 'true') {
    return 'http://localhost:5173'
  }

  return null
}

export function isProductionEnvironment(): boolean {
  const env = Deno.env.get('ENVIRONMENT')?.trim().toLowerCase()
  return env === 'production' || env === 'prod'
}
