# A-DNA Frontend

Website for the **African-Diaspora Nursing Alliance (A-DNA)**.

Built with React 19, TanStack Router, Vite, Tailwind CSS v4, Supabase, and Playwright.

---

## Prerequisites

| Tool             | Version | Notes                                               |
| ---------------- | ------- | --------------------------------------------------- |
| **Node.js**      | 22.22.3 | Pinned in `.tool-versions`                          |
| **npm**          | 10+     | Bundled with Node                                   |
| **Supabase CLI** | 2.x     | Installed via `npm install` (project devDependency) |
| **Python 3**     | 3.x     | Only for `npm run import:membership`                |
| **Docker**       | 20+     | Optional — see [Option C](#option-c--docker)        |

Pick **one** setup path below.

---

### Option A — Simple (no asdf)

Use any Node 22 install and a local `.env` file. This is enough to run the app.

1. **Install Node.js 22**

   - Download from [nodejs.org](https://nodejs.org/) (LTS 22.x), **or**
   - macOS with Homebrew: `brew install node@22`

2. **Verify**

   ```bash
   node -v   # should be v22.x
   npm -v
   ```

3. **Create `.env`**

   ```bash
   cp env.example .env
   # Edit .env with your Supabase values (see Configuration)
   ```

4. **Run the app**

   ```bash
   npm ci
   npm run dev
   ```

Vite and the Supabase CLI scripts read `.env` automatically (`npm run db:push` uses Node's `--env-file=.env`). No extra tooling required.

---

### Option B — asdf + direnv (recommended for teams)

[asdf](https://asdf-vm.com/) reads `.tool-versions` and installs the exact Node version. [direnv](https://direnv.net/) loads `.env` when you `cd` into the project.

#### Install asdf (macOS)

**Homebrew:**

```bash
brew install asdf
echo -e "\n. $(brew --prefix asdf)/libexec/asdf.sh" >> ~/.zshrc
source ~/.zshrc
```

**Or manual (any OS):** follow [asdf getting started](https://asdf-vm.com/guide/getting-started.html).

#### Install plugins and project tools

```bash
# Node.js plugin (requires gpg on macOS: brew install gpg)
asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git
asdf plugin add direnv https://github.com/asdf-community/asdf-direnv.git

# Install Node version from .tool-versions
cd /path/to/adna-frontend
asdf install

# Wire direnv into your shell (zsh)
asdf direnv setup --shell zsh --version system
source ~/.zshrc
```

#### Enable per-project env

```bash
cd /path/to/adna-frontend
cp env.example .env
# Edit .env with your Supabase values

direnv allow    # approves .envrc — loads .env on every cd into this folder
```

`.envrc` contains:

```bash
use asdf
dotenv_if_exists .env
```

After `direnv allow`, opening a new terminal in this directory activates Node 22 and exports your `.env` variables.

---

### Option C — Docker

Run the app in containers without installing Node locally. Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose).

1. **Create `.env`**

   ```bash
   cp env.example .env
   # Edit .env — at minimum VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
   ```

2. **Production** — static build served by nginx at **http://localhost:8080**

   ```bash
   docker compose up --build web
   ```

3. **Development** — Vite hot reload at **http://localhost:5173**

   ```bash
   docker compose --profile dev up dev
   ```

See the full [Docker](#docker) section for manual `docker build` commands, rebuild notes, and what to run locally vs in containers.

---

## Quick start

```bash
git clone <repo-url>
cd adna-frontend

cp env.example .env
# Edit .env — see Configuration below

npm ci
npm run dev
```

Open **http://localhost:5173**

> `.env` and all `.env*` files are gitignored. Never commit secrets.

---

## Configuration

Create a `.env` file in the project root. Use `env.example` as a template:

```bash
cp env.example .env
```

### Environment variables

| Variable                        | Required               | Used by              | Description                                                                                                                           |
| ------------------------------- | ---------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`             | Yes (for forms/portal) | Browser app          | Project URL, e.g. `https://abcdefgh.supabase.co`                                                                                      |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes (for forms/portal) | Browser app          | Publishable/anon key from Supabase Dashboard                                                                                          |
| `SUPABASE_DB_PASSWORD`          | Yes (for migrations)   | `db:link`, `db:push` | Database password from Dashboard → Settings → Database                                                                                |
| `SUPABASE_POOLER_HOST`          | Optional               | Deploy scripts       | Pooler hostname if direct DB host fails (IPv6). From Dashboard → Connect → Session pooler, e.g. `aws-0-us-east-1.pooler.supabase.com` |
| `SUPABASE_SERVICE_ROLE_KEY`     | Admin scripts only     | Local CLI            | Service role key — **never** commit or prefix with `VITE_`. Used by `zeffy:apply-payment`, `zeffy:sync-test`, and `zeffy:api-test`.   |
| `RESEND_API_KEY`                | Edge functions         | `secrets:set`        | Resend API key for registration and password-reset emails (Supabase secret, not browser)                                              |
| `RESEND_FROM_EMAIL`             | Edge functions         | `secrets:set`        | From address for transactional email, e.g. `A-DNA <noreply@yourdomain.com>`                                                           |
| `SITE_URL`                      | Edge functions         | `secrets:set`        | Public site URL used in email links and branding (e.g. `https://a-dna.org`)                                                           |
| `ZEFFY_WEBHOOK_SECRET`          | Optional               | Edge function        | Shared secret for Zeffy webhook auth (set via `npm run secrets:set`)                                                                  |
| `ZEFFY_API_KEY`                 | Optional               | Edge function        | Zeffy API key for portal **Refresh status** backfill when webhook missed a payment (Supabase secret only)                             |
| `ZEFFY_RATE_PROFESSIONAL`       | Optional               | Edge function        | Zeffy `rate_id` for Professional tier — may be the same UUID as Premium (see [Zeffy](#zeffy-membership-payments))                     |
| `ZEFFY_RATE_PREMIUM`            | Optional               | Edge function        | Zeffy `rate_id` for Premium tier — tier is resolved from payment amount when both rates share the same ID                             |
| `ZEFFY_CAMPAIGN_PROFESSIONAL`   | Optional               | Edge function        | Comma-separated Zeffy campaign UUIDs for Professional ($75 / 300 GHS)                                                                 |
| `ZEFFY_CAMPAIGN_PREMIUM`        | Optional               | Edge function        | Comma-separated Zeffy campaign UUIDs for Premium ($150 / 600 GHS)                                                                     |

**Where to find values:**

- **API keys:** Supabase Dashboard → **Settings → API Keys** (use the **Publishable** key)
- **Database password:** Supabase Dashboard → **Settings → Database** → Reset/view password
- **Pooler host:** Supabase Dashboard → **Connect → Session pooler** (port 5432)
- **Project ref:** The subdomain in your project URL (`https://<project-ref>.supabase.co`)

### Why `VITE_`?

Vite only exposes variables prefixed with `VITE_` to browser code via `import.meta.env`. The publishable Supabase key is safe to expose client-side (like Stripe publishable keys).

**Never** prefix secrets with `VITE_` — do not put service role keys or database passwords in `VITE_` variables.

### Loading `.env` without direnv

If you skipped asdf/direnv, you only need `.env` in the project root:

- **`npm run dev` / `npm run build`** — Vite loads `.env` automatically.
- **`npm run db:push` / `npm run db:link`** — scripts pass `--env-file=.env` to Node.
- **Manual Supabase CLI** — export vars first:

  ```bash
  export $(grep -v '^#' .env | xargs)
  npx supabase db push
  ```

  Or prefix a single command: `SUPABASE_DB_PASSWORD=... npx supabase db push`

### Loading `.env` with direnv

If you use Option B, `direnv allow` loads `.env` whenever you enter the project directory — no manual export needed.

---

## Supabase setup

The app uses a linked Supabase project for membership registration and the member portal.

### 1. Log in to Supabase CLI

```bash
npx supabase login
```

### 2. Link project and push migrations

Ensure `.env` contains `SUPABASE_DB_PASSWORD`, then:

```bash
npm run connect:supabase -- <project-ref>
```

Or step by step:

```bash
npm run db:link -- --project-ref <project-ref>
npm run db:push
```

This applies all SQL migrations in `supabase/migrations/` — membership tables, member portal, password reset, and Zeffy payment handling.

### 3. Import legacy membership data (optional)

If you have the legacy SQL backup:

```bash
npm run import:membership
```

Then run the generated `supabase/seed/legacy_membership_data.sql` in the Supabase SQL Editor. The seed directory is gitignored (contains member PII).

### 4. Deploy edge functions and secrets

Email, Zeffy webhook, and portal refresh sync run as Supabase Edge Functions. Requires project **Owner** or **Developer** access on the Supabase CLI account.

Add Resend, Zeffy, and site URL values to `.env` (see `env.example`), then:

```bash
npm run secrets:set       # push secrets to Supabase (RESEND_*, SITE_URL, ZEFFY_*)
npm run functions:deploy  # deploy all edge functions
```

| Edge function                   | Purpose                                                                  |
| ------------------------------- | ------------------------------------------------------------------------ |
| `password-reset-request`        | Sends password reset email via Resend                                    |
| `membership-registration-email` | Sends welcome email after registration                                   |
| `zeffy-membership-webhook`      | Receives Zeffy payment webhooks → writes `member_dues`, activates member |
| `zeffy-membership-sync`         | Portal **Refresh status** — DB check + optional Zeffy API backfill       |

### Troubleshooting database connection

| Error                                        | Fix                                                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `ENOTFOUND db.<ref>.supabase.co`             | Direct DB host is IPv6-only. Set `SUPABASE_POOLER_HOST` in `.env`.                                |
| `password authentication failed`             | Reset database password in Dashboard, update `SUPABASE_DB_PASSWORD` in `.env`.                    |
| `Invalid URL` with special chars in password | Do not paste a full connection URI. Use separate `SUPABASE_DB_PASSWORD` + `SUPABASE_POOLER_HOST`. |

---

## Zeffy membership payments

Paid memberships are collected on **Zeffy**. When a payment succeeds, Zeffy should POST to the Supabase edge function **`zeffy-membership-webhook`**, which records **`member_dues`** and activates the member (`is_active = true`). Matching is by **email only** — the payer must use the same email they registered with.

### Payment flow

```
Register on site → redirect to Zeffy checkout (email prefilled)
       ↓
Pay on Zeffy (same email as registration)
       ↓
Zeffy POSTs webhook → zeffy-membership-webhook → member_dues + is_active
       ↓
Member signs in → portal shows paid status
```

If the webhook is missed, a member can click **Refresh status** in the portal. That calls **`zeffy-membership-sync`**, which checks the database first and — when `ZEFFY_API_KEY` is configured — queries the Zeffy API for succeeded payments matching their email.

### Where Zeffy is involved

| Step                      | Calls Zeffy API?     | What happens                                                                                      |
| ------------------------- | -------------------- | ------------------------------------------------------------------------------------------------- |
| Registration submit       | No                   | Browser redirects to a Zeffy checkout URL (`buildZeffyCheckoutUrl` in `src/lib/zeffyCheckout.ts`) |
| Portal “Pay with Zeffy”   | No                   | Link opens `zeffy.com` in a new tab                                                               |
| **Payment completes**     | **Zeffy → us**       | Zeffy POSTs to `zeffy-membership-webhook`; edge function writes `member_dues`                     |
| **Refresh status**        | **Server-side only** | `zeffy-membership-sync` reads DB; if still pending, imports from Zeffy API by email               |
| **`zeffy:apply-payment`** | **No**               | Admin writes to DB via `process_zeffy_membership_payment` — does **not** verify with Zeffy        |

There is **no outbound Zeffy API call** from the browser. Registration and checkout are plain redirects/links.

The app treats a payment as verified when a **`member_dues`** row exists with `status = COMPLETED` for the current year and matching email.

### Tier resolution

When a webhook or API sync imports a payment, tier is determined in this order:

1. **Payment amount** (primary) — amounts in minor units (cents / pesewas):

   | Amount (USD) | Amount (GHS) | Tier         |
   | ------------ | ------------ | ------------ |
   | $75 (7500)   | 300 (30000)  | Professional |
   | $150 (15000) | 600 (60000)  | Premium      |

2. **`rate_id`** on line items — only when amount does not match a known tier
3. **`campaign_id`** — if mapped via `ZEFFY_CAMPAIGN_*` secrets
4. **Metadata** — `membership_tier` / `tier` fields on the payment

**Shared rate ID:** A-DNA uses the same Zeffy `rate_id` for both Professional and Premium. Set both secrets to the same UUID:

```bash
ZEFFY_RATE_PROFESSIONAL=0f769222-6e47-4cdf-b38e-3919c78004ca
ZEFFY_RATE_PREMIUM=0f769222-6e47-4cdf-b38e-3919c78004ca
```

When the rate is shared, tier always comes from the payment amount. Non-standard test amounts (e.g. $1) will not auto-sync — use full tier amounts or manual replay.

### How manual replay “verification” works

`npm run zeffy:apply-payment` does **not** contact Zeffy. An **admin** verifies payment offline (Zeffy dashboard, receipt email, transaction ID), then the script **creates** the database record the app expects.

- `--payment-id` is stored as `order_id` in `member_dues` for **audit trail** and **duplicate prevention** (same ID → ignored).
- After apply-payment, **Refresh status** reads that DB row — no Zeffy API call needed.

**Preferred order when a payment is missing:**

1. Member clicks **Refresh status** (triggers API backfill if configured)
2. Fix the webhook so future payments arrive automatically
3. Admin runs **`zeffy:apply-payment`** as a last resort

### Webhook setup

```bash
npm run zeffy:webhook-url    # print the URL to paste in Zeffy → Settings → Integrations → Webhook
npm run secrets:set          # push RESEND_*, SITE_URL, ZEFFY_* secrets to Supabase
npm run functions:deploy     # deploy webhook, sync, and email edge functions
```

Configure Zeffy to redirect buyers after payment to:

`https://your-site.com/membership/confirmation`

All Zeffy-related Supabase secrets are listed in `env.example`. At minimum for production payments:

- `ZEFFY_WEBHOOK_SECRET` — verify webhook authenticity
- `ZEFFY_RATE_PROFESSIONAL` / `ZEFFY_RATE_PREMIUM` — same shared rate ID (see [Tier resolution](#tier-resolution))
- `ZEFFY_API_KEY` — enables portal Refresh backfill when webhook is missed

### Checking payment status (members & support)

**Do not re-run the admin apply script to “re-evaluate”.**

| Action                             | Who              | What it does                                                                                                 |
| ---------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------ |
| **Refresh status** (member portal) | Logged-in member | Calls `zeffy-membership-sync` — reads `member_dues`, then optionally imports from Zeffy API if still pending |
| Sign out / sign in                 | Member           | Loads profile; same dues sync on profile fetch.                                                              |

If payment was completed on Zeffy but the portal still shows “pending”:

1. Ask the member to click **Refresh status** (requires `ZEFFY_API_KEY` deployed for API backfill)
2. Confirm the webhook URL and secrets are configured in Zeffy and Supabase
3. Use **Manual replay** below if the payment still does not appear

### Membership verification letters

Paid Professional and Premium members can print an official letter from the member portal (**Print membership letter**). Each letter includes a unique code (format `ADNA-XXXX-XXXX-XXXX-XXXX`) registered in Supabase when the member requests it.

Third parties verify codes at **`/membership/verify`**. Verification checks live membership and payment records — a copied letter cannot be validated without a code issued by the system, and codes show as invalid if membership lapses.

Apply migration `202606281200_membership_verification.sql` via `npm run db:push` before using this feature in production.

### Manual replay (admin only)

Use this **once** after an admin has **confirmed payment in Zeffy** (receipt/dashboard) and the payment is **missing from `member_dues`**. The script does not validate the transaction with Zeffy. It creates a `member_dues` row via `process_zeffy_membership_payment` — it is **not** for routine re-checks.

**CLI** (requires `SUPABASE_SERVICE_ROLE_KEY` in `.env` — local only, never commit):

```bash
# Professional ($75) — run once per missing payment
npm run zeffy:apply-payment -- user@example.com diaspora

# Premium ($150) — prefer the Zeffy transaction id when you have it
npm run zeffy:apply-payment -- user@example.com premium --payment-id zeffy_abc123
```

**Supabase SQL Editor** (project admins): adapt and run `scripts/sql/apply-manual-payment.example.sql`.

Re-running with a **new** payment id can duplicate dues records. Re-running with the **same** `--payment-id` is ignored as a duplicate.

### Developer scripts

```bash
npm run zeffy:webhook-url     # print webhook URL for Zeffy dashboard
npm run zeffy:api-test        # list Zeffy contacts/payments for an email (requires ZEFFY_API_KEY in .env)
npm run zeffy:sync-test       # integration test: register → mock webhook → verify activation
npm run zeffy:apply-payment   # admin manual replay (see above)
```

Example — inspect payments for a member email:

```bash
npm run zeffy:api-test -- user@example.com
```

---

## Development

```bash
npm run dev       # Vite dev server at http://localhost:5173
npm run build     # Production build → dist/
npm run preview   # Serve dist/ locally
```

After changing `.env`, restart the dev server.

---

## Docker

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose).

Create `.env` first — Docker Compose reads it for build-time `VITE_*` variables:

```bash
cp env.example .env
# Edit .env with your Supabase URL and publishable key
```

### Production (nginx)

Builds the static site and serves it on **http://localhost:8080**:

```bash
docker compose up --build web
```

Or manually:

```bash
docker build \
  --build-arg VITE_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key \
  -t adna-frontend .

docker run --rm -p 8080:80 adna-frontend
```

> **Important:** `VITE_*` variables are baked in at **build time**. Changing `.env` after building requires `docker compose up --build` again. Database passwords (`SUPABASE_DB_PASSWORD`) are not needed in the production image — only the browser-facing Supabase URL and publishable key.

### Development (hot reload)

Runs Vite inside a container on **http://localhost:5173**:

```bash
docker compose --profile dev up dev
```

Source is mounted as a volume; `node_modules` uses a named volume so installs stay inside the container.

### What runs in Docker vs locally

| Task                   | Docker                                | Notes                            |
| ---------------------- | ------------------------------------- | -------------------------------- |
| Dev server             | `docker compose --profile dev up dev` | Needs `.env` mounted via compose |
| Production site        | `docker compose up web`               | nginx + static `dist/`           |
| E2E tests              | Local recommended                     | Playwright needs browser deps    |
| `db:push` / migrations | Local recommended                     | Needs Supabase CLI + DB password |

---

## Testing

End-to-end tests use [Playwright](https://playwright.dev/). The config starts the Vite dev server automatically.

```bash
# First run only — install browser
npx playwright install chromium

# Run tests
npm run test:e2e

# Interactive UI
npm run test:e2e:ui

# Headed (visible browser)
npm run test:e2e:headed

# View last HTML report
npm run test:e2e:report
```

Tests live in `e2e/`:

- `navigation.spec.ts` — routes and nav links
- `membership-form.spec.ts` — registration form validation
- `portal-login.spec.ts` — member portal login form
- `portal-membership.spec.ts` — portal dashboard, refresh status, Zeffy pay link
- `forgot-password.spec.ts` — password reset request flow

---

## CI

GitHub Actions runs on every push/PR to `main` (`.github/workflows/ci.yml`):

1. `npm ci`
2. `npm run lint`
3. `npm run format:check`
4. `npm run build`
5. `npm run test:e2e` (Playwright + Chromium)

No `.env` is required in CI — current tests cover UI/navigation only.

---

## Routes

| Path                       | Description                                       |
| -------------------------- | ------------------------------------------------- |
| `/`                        | Home                                              |
| `/about`                   | Mission, vision, team                             |
| `/events`                  | Events and registration modal                     |
| `/membership`              | Membership tiers and multi-step registration form |
| `/membership/confirmation` | Post-checkout confirmation page                   |
| `/membership/verify`       | Public membership letter verification             |
| `/donate`                  | Donation page                                     |
| `/portal/login`            | Member portal sign-in                             |
| `/portal/forgot-password`  | Request password reset email                      |
| `/portal/reset-password`   | Set new password from email link                  |
| `/portal`                  | Member dashboard (requires login)                 |

---

## Scripts reference

| Command                               | Description                                          |
| ------------------------------------- | ---------------------------------------------------- |
| `npm run dev`                         | Start Vite dev server                                |
| `npm run build`                       | Production build                                     |
| `npm run preview`                     | Preview production build                             |
| `npm run db:link`                     | Link local project to remote Supabase (reads `.env`) |
| `npm run db:push`                     | Push migrations to remote Supabase                   |
| `npm run connect:supabase`            | Link + push migrations in one step                   |
| `npm run secrets:set`                 | Push edge function secrets to Supabase               |
| `npm run functions:deploy`            | Deploy all Supabase edge functions                   |
| `npm run import:membership`           | Generate legacy seed SQL from local backup           |
| `npm run test:e2e`                    | Run Playwright tests                                 |
| `npm run test:e2e:ui`                 | Playwright interactive UI                            |
| `npm run test:e2e:headed`             | Playwright with visible browser                      |
| `npm run test:e2e:report`             | Open Playwright HTML report                          |
| `npm run lint`                        | Run ESLint                                           |
| `npm run lint:fix`                    | Run ESLint with auto-fix                             |
| `npm run format`                      | Format all files with Prettier                       |
| `npm run format:check`                | Check formatting without writing                     |
| `npm run zeffy:webhook-url`           | Print Zeffy webhook URL for Supabase edge function   |
| `npm run zeffy:api-test`              | List Zeffy contacts/payments for an email            |
| `npm run zeffy:sync-test`             | Integration test: checkout + webhook + activation    |
| `npm run zeffy:apply-payment`         | **Admin:** manually record a missed Zeffy payment    |
| `docker compose up --build web`       | Production container (nginx, port 8080)              |
| `docker compose --profile dev up dev` | Dev container (Vite, port 5173)                      |

---

## Project structure

```
adna-frontend/
├── e2e/                    # Playwright tests
├── public/                 # Static assets (images, logos)
├── src/
│   ├── routes/             # TanStack Router file routes
│   ├── pages/              # Page components
│   ├── components/         # Shared UI
│   ├── lib/                # Supabase client, auth, form schemas
│   ├── data/               # Static content (team, countries, etc.)
│   ├── styles.css          # Global styles + Tailwind theme
│   └── main.tsx            # App entry
├── supabase/
│   ├── migrations/         # SQL migrations (applied via db:push)
│   ├── functions/          # Edge functions (webhook, sync, email)
│   └── seed/               # Generated legacy data (gitignored)
├── scripts/                # Supabase connect, Zeffy tools, legacy import
├── legacy/                 # Original static HTML (reference)
├── env.example             # Environment template (copy to .env)
├── Dockerfile              # Production multi-stage build (Node → nginx)
├── docker-compose.yml      # web (prod) + dev (profile) services
├── nginx.conf              # SPA routing for production container
├── eslint.config.js          # ESLint flat config
├── .prettierrc               # Prettier formatting rules
├── playwright.config.ts
├── vite.config.ts
└── .github/workflows/ci.yml
```

`src/routeTree.gen.ts` is auto-generated by TanStack Router — do not edit manually.

---

## Tech stack

- [React 19](https://react.dev/)
- [TanStack Router](https://tanstack.com/router)
- [Vite 6](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) — membership data + member portal auth
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) — form validation
- [Playwright](https://playwright.dev/) — E2E tests
- TypeScript

---

## Legacy site

The original single-page HTML site is in `legacy/` for reference. The React app replaces its section-based navigation with proper URL routes.
