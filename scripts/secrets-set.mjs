import { spawnSync } from 'node:child_process'

const keys = [
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'SITE_URL',
  'INTERNAL_FUNCTION_SECRET',
  'ZEFFY_WEBHOOK_SECRET',
  'ZEFFY_CAMPAIGN_PROFESSIONAL',
  'ZEFFY_CAMPAIGN_PREMIUM',
  'ZEFFY_API_KEY',
  'ZEFFY_RATE_PROFESSIONAL',
  'ZEFFY_RATE_PREMIUM',
]

const optionalKeys = new Set([
  'ZEFFY_CAMPAIGN_PROFESSIONAL',
  'ZEFFY_CAMPAIGN_PREMIUM',
  'ZEFFY_API_KEY',
  'ZEFFY_RATE_PROFESSIONAL',
  'ZEFFY_RATE_PREMIUM',
])

for (const key of keys) {
  if (!process.env[key]?.trim()) {
    if (optionalKeys.has(key)) continue
    console.error(`Missing ${key} in .env`)
    process.exit(1)
  }
}

const args = [
  'secrets',
  'set',
  ...keys.filter((key) => process.env[key]?.trim()).map((key) => `${key}=${process.env[key]}`),
]

console.log('Setting Supabase secrets:', keys.join(', '))

const result = spawnSync('node_modules/.bin/supabase', args, {
  stdio: 'inherit',
  env: process.env,
})

process.exit(result.status ?? 1)
