import { spawnSync } from 'node:child_process'

const keys = ['RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'SITE_URL']

for (const key of keys) {
  if (!process.env[key]?.trim()) {
    console.error(`Missing ${key} in .env`)
    process.exit(1)
  }
}

const args = ['secrets', 'set', ...keys.map((key) => `${key}=${process.env[key]}`)]

console.log('Setting Supabase secrets:', keys.join(', '))

const result = spawnSync('node_modules/.bin/supabase', args, {
  stdio: 'inherit',
  env: process.env,
})

process.exit(result.status ?? 1)
