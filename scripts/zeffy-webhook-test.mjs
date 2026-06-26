#!/usr/bin/env node
/**
 * Print the Zeffy webhook URL and how to inspect incoming payloads.
 *
 * Usage:
 *   node --env-file=.env scripts/zeffy-webhook-test.mjs
 */
const url = process.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
if (!url) {
  console.error('Missing VITE_SUPABASE_URL in .env')
  process.exit(1)
}

const webhookUrl = `${url}/functions/v1/zeffy-membership-webhook`

console.log('')
console.log('Zeffy webhook URL (paste in Settings → Integrations → Webhook):')
console.log(webhookUrl)
console.log('')
console.log('Test mode (recommended for first payment):')
console.log('  1. supabase secrets set ZEFFY_WEBHOOK_DEBUG=true')
console.log('  2. npm run functions:deploy   # or deploy zeffy-membership-webhook only')
console.log('  3. Make a test payment in Zeffy')
console.log('  4. View logs: Supabase Dashboard → Edge Functions → zeffy-membership-webhook → Logs')
console.log('')
console.log('Turn off debug after testing:')
console.log('  supabase secrets unset ZEFFY_WEBHOOK_DEBUG')
console.log('')
