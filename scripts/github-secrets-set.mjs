#!/usr/bin/env node
/**
 * Push repository secrets to GitHub Actions from .env (and optional Vercel vars).
 *
 * Usage:
 *   node --env-file=.env scripts/github-secrets-set.mjs
 *
 * Optional extra env vars (not in .env by default):
 *   VERCEL_TOKEN
 *   VERCEL_ORG_ID
 *   VERCEL_PROJECT_ID
 *
 * Optional auth (if `gh auth login` not done):
 *   GH_TOKEN or GITHUB_TOKEN — fine-grained or classic PAT with repo secrets write
 *
 * Requires: gh CLI + repo access to psunakan/adna-frontend
 */
import { spawnSync } from 'node:child_process'

const REPO = 'psunakan/adna-frontend'

const SECRETS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'VERCEL_TOKEN',
  'VERCEL_ORG_ID',
  'VERCEL_PROJECT_ID',
]

function gh(args) {
  const result = spawnSync('gh', args, {
    stdio: 'inherit',
    env: process.env,
  })
  return result.status ?? 1
}

function ensureGhAuth() {
  const status = spawnSync('gh', ['auth', 'status'], { encoding: 'utf8' })
  if (status.status === 0) return

  const token = process.env.GH_TOKEN?.trim() || process.env.GITHUB_TOKEN?.trim()
  if (!token) {
    console.error('GitHub CLI is not authenticated.')
    console.error('Run: gh auth login')
    console.error('Or add GH_TOKEN to .env (PAT with repo + secrets scope).')
    process.exit(1)
  }

  const login = spawnSync('gh', ['auth', 'login', '--with-token'], {
    input: token,
    encoding: 'utf8',
  })
  if (login.status !== 0) {
    console.error('Failed to authenticate gh with GH_TOKEN/GITHUB_TOKEN from .env')
    process.exit(login.status ?? 1)
  }
}

ensureGhAuth()

const toSet = []
const missing = []

for (const key of SECRETS) {
  const value = process.env[key]?.trim()
  if (value) {
    toSet.push({ key, value })
  } else {
    missing.push(key)
  }
}

if (toSet.length === 0) {
  console.error('No secrets found in environment. Load .env with: node --env-file=.env')
  process.exit(1)
}

console.log(`Setting ${toSet.length} secret(s) on ${REPO}:`)
console.log(toSet.map(({ key }) => `  - ${key}`).join('\n'))

for (const { key, value } of toSet) {
  const status = gh(['secret', 'set', key, '--body', value, '--repo', REPO])
  if (status !== 0) {
    console.error(`Failed to set ${key}`)
    process.exit(status)
  }
}

if (missing.length > 0) {
  console.log('\nSkipped (not in environment):')
  for (const key of missing) {
    console.log(`  - ${key}`)
  }
  if (missing.some((k) => k.startsWith('VERCEL_'))) {
    console.log('\nVercel deploy secrets:')
    console.log('  VERCEL_TOKEN      → Vercel → Account Settings → Tokens')
    console.log('  VERCEL_ORG_ID     → run `vercel link`, then see .vercel/project.json')
    console.log('  VERCEL_PROJECT_ID → run `vercel link`, then see .vercel/project.json')
    console.log('\nAdd them to .env temporarily, then re-run this script.')
  }
}

console.log('\nDone.')
