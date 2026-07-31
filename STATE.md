# STATE.md — ADNA Rebuild

_Last synced: 2026-06-16_

## 1. Project Scope & Source of Truth

This folder (`adna-frontend`, remote `git@github.com:psunakan/adna-frontend.git`, branch `main`) is the working repo and is treated as source of truth going forward. Commit history shows two authors: Paul "Sonny" Akan (psunakan@gmail.com) and Molayo Decker (molayodecker@gmail.com). The most recent merge (`8619603`, PR #2 from `develop`) is the React/Vite + Supabase rebuild — this is the "frontend conversion" referenced as Mo's work.

**Discrepancy worth flagging:** a separate, untracked legacy folder (`DevOps Claude/a-dna-monorepo/`, its own nested `.git`) exists alongside this repo — an older monorepo prototype. Per project rules this is deprecated/noise and should not be treated as a reference; flagging its presence here only so it doesn't get mistaken for a second source of truth later.

Core objective: keep this repo authoritative, and concentrate engineering on the sign-up (membership) and email flows (registration confirmation, password reset).

## 2. Current Architecture

**Stack:** React 19 + Vite 6, TypeScript 6, TanStack Router (file-based, `routeTree.gen.ts` generated), Tailwind CSS 4, React Hook Form + Zod for forms/validation, Supabase JS client for auth/data, `react-hot-toast` for notifications.

**Key paths:**
- `src/routes/` — TanStack Router route files (`index`, `about`, `donate`, `events`, `membership`, `portal/{index,login,forgot-password,reset-password}`)
- `src/pages/` — page components rendered by routes (`HomePage`, `MembershipPage`, `PortalLoginPage`, `ForgotPasswordPage`, `ResetPasswordPage`, `PortalDashboardPage`, etc.)
- `src/components/` — `MembershipForm`, `RegistrationModal`, `Header`, `Footer`, `ExecutiveTeam`, `CollaboratorsMarquee`, `MemberProfileButton`, `ContactDrawer`
- `src/lib/` — business logic: `memberAuth.ts` (RPC-based login/session via `localStorage`), `passwordReset.ts`, `submitMembershipApplication.ts`, `sendRegistrationEmail.ts`, schemas (`loginSchema.ts`, `passwordResetSchema.ts`, `membershipFormSchema.ts`), `supabase.ts` (client init)
- `src/types/database.ts` — generated/maintained Supabase table types
- `supabase/migrations/` — schema history: `membership_schema`, `member_portal_auth`, `password_reset`, `demo_member`, `fix_member_portal_rpcs`, `pgcrypto_search_path`
- `supabase/functions/` — Edge Functions: `membership-registration-email`, `password-reset-request`

**Containerization:** Multi-stage `Dockerfile` — `node:22-alpine` build stage (`npm ci && npm run build`, Supabase URL/key baked in as build args) → `nginx:1.27-alpine` production stage serving `dist/` on port 80, with healthcheck. `docker-compose.yml` defines `web` (prod, port 8080) and `dev` (hot-reload Vite, port 5173, profile `dev`).

**Env vars** (`env.example`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (frontend, required to run); `SUPABASE_DB_PASSWORD`, `SUPABASE_POOLER_HOST` (CLI/migrations); Resend email vars (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `SITE_URL`) set as Supabase secrets, not `.env`. Demo portal login: `demo@adna.org` / `DemoPassword123!`.

## 3. Established Decisions

- **Git configuration:** project rule requires all commits use `psunakan@gmail.com`. Checked just now — **neither local nor global `git config user.email` is currently set** in this environment (`git config user.email` returns empty). This needs to be set before any commit is made here: `git config user.email "psunakan@gmail.com"`.
- **Code management:** local layout must match production; no divergence. Note: working tree currently shows ~106 files as "modified" with equal insertions/deletions per file (18,317/18,317) — inspected and confirmed this is a CRLF/LF line-ending artifact (Windows checkout vs LF-committed files), not real content drift. Worth a `.gitattributes` fix or a one-time normalize so `git status` stays legible.

## 4. Current Status

- **Completed:** React/Vite + Supabase rebuild merged to `main` (commit `e9d0204` plus follow-ups through `8619603`) — routing, Tailwind theming, membership form, portal login/dashboard, password reset, registration email all scaffolded and wired.
- **In-progress:** sign-up (membership application) and email flows. Current implementation: `submitMembershipApplication.ts` inserts directly into `members` table then fires `sendRegistrationConfirmationEmail` (via Supabase Edge Function `membership-registration-email`); no client-side duplicate-email check before insert — relies on DB constraint/RPC if any. Email format validation is plain Zod `.email()` in `loginSchema.ts`, `passwordResetSchema.ts`, `membershipFormSchema.ts`.
- **Discrepancy note:** older local copies (including `DevOps Claude/a-dna-monorepo`) are deprecated due to drift — do not pull logic from them without explicit instruction.

## 5. Upcoming Tasks

- [ ] Set `git config user.email "psunakan@gmail.com"` locally before next commit; spin up `docker:dev` (or plain `npm install && npm run dev`) and verify the stack boots against a real Supabase project.
- [ ] Map the full email-flow surface: `MembershipForm` → `submitMembershipApplication` → `members` insert → `sendRegistrationConfirmationEmail` → Edge Function `membership-registration-email`; and `ForgotPasswordPage` → `passwordReset.ts` → Edge Function `password-reset-request`. Confirm which RPCs in `member_portal_auth` / `fix_member_portal_rpcs` migrations back these.
- [ ] Investigate "email validation loops": check for missing duplicate-email guard on membership insert, and confirm Resend secrets (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `SITE_URL`) are actually set in the target Supabase project, since `sendRegistrationConfirmationEmail` only `console.warn`s on failure (silent in UI).
- [ ] Decide whether to normalize line endings (`.gitattributes`) to stop the false 106-file diff noise.

## 6. Key Collaborators

- **psunakan (Sonny)** — Tech lead, repo owner (`psunakan@gmail.com`)
- **molayodecker (Mo)** — Frontend conversion, Supabase integration (`molayodecker@gmail.com`)
