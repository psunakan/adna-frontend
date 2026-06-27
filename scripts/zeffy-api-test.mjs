#!/usr/bin/env node
/**
 * Test Zeffy API connectivity and list payments for an email.
 *
 * Usage:
 *   node --env-file=.env scripts/zeffy-api-test.mjs [email]
 */
const key = process.env.ZEFFY_API_KEY?.trim()
const email = (process.argv[2] ?? 'molayodecker@gmail.com').trim().toLowerCase()

if (!key) {
  console.error('Missing ZEFFY_API_KEY in .env')
  process.exit(1)
}

async function zeffyGet(path) {
  const res = await fetch(`https://api.zeffy.com${path}`, {
    headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
  })
  const text = await res.text()
  let body
  try {
    body = JSON.parse(text)
  } catch {
    body = text
  }
  return { status: res.status, ok: res.ok, body }
}

function parseList(body) {
  if (Array.isArray(body)) return body
  if (body?.data && Array.isArray(body.data)) return body.data
  if (body?.items && Array.isArray(body.items)) return body.items
  return []
}

console.log('Zeffy API test')
console.log('Email:', email)
console.log('---')

const contacts = await zeffyGet(`/api/v1/contacts?email=${encodeURIComponent(email)}`)
console.log('Contacts:', contacts.status)
if (!contacts.ok) {
  console.error(JSON.stringify(contacts.body, null, 2))
  process.exit(1)
}

const contactList = parseList(contacts.body)
console.log('Found:', contactList.length)
for (const c of contactList.slice(0, 3)) {
  console.log(' -', { id: c.id, email: c.email, name: `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim() })
}

const contactId = contactList[0]?.id
if (!contactId) {
  console.log('No contact for this email.')
  process.exit(0)
}

const payments = await zeffyGet(
  `/api/v1/payments?contact=${encodeURIComponent(contactId)}&status=succeeded&limit=20`,
)
console.log('')
console.log('Payments:', payments.status)
const paymentList = parseList(payments.body)
console.log('Succeeded:', paymentList.length)
for (const p of paymentList.slice(0, 10)) {
  const buyer =
    typeof p.buyer === 'string' ? p.buyer : (p.buyer?.email ?? p.buyer?.first_name ?? '-')
  console.log(' -', {
    id: p.id,
    amount: p.amount,
    currency: p.currency,
    buyer,
    created: p.created,
    category: p.campaign_category,
  })
}

console.log('---')
console.log('Done. Use npm run zeffy:apply-payment to import a specific payment into Supabase.')
