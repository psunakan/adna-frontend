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

This applies migrations in `supabase/migrations/`:

| Migration                             | Purpose                                                            |
| ------------------------------------- | ------------------------------------------------------------------ |
| `202604280001_membership_schema.sql`  | `members`, `member_credentials`, `membership_types`, `member_dues` |
| `202604291200_member_portal_auth.sql` | Member sessions, login/logout/profile RPC functions                |

### 3. Import legacy membership data (optional)

If you have the legacy SQL backup:

```bash
npm run import:membership
```

Then run the generated `supabase/seed/legacy_membership_data.sql` in the Supabase SQL Editor. The seed directory is gitignored (contains member PII).

### Troubleshooting database connection

| Error                                        | Fix                                                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `ENOTFOUND db.<ref>.supabase.co`             | Direct DB host is IPv6-only. Set `SUPABASE_POOLER_HOST` in `.env`.                                |
| `password authentication failed`             | Reset database password in Dashboard, update `SUPABASE_DB_PASSWORD` in `.env`.                    |
| `Invalid URL` with special chars in password | Do not paste a full connection URI. Use separate `SUPABASE_DB_PASSWORD` + `SUPABASE_POOLER_HOST`. |

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

| Path            | Description                                       |
| --------------- | ------------------------------------------------- |
| `/`             | Home                                              |
| `/about`        | Mission, vision, team                             |
| `/events`       | Events and registration modal                     |
| `/membership`   | Membership tiers and multi-step registration form |
| `/donate`       | Donation page                                     |
| `/portal/login` | Member portal sign-in                             |
| `/portal`       | Member dashboard (requires login)                 |

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
| `npm run import:membership`           | Generate legacy seed SQL from local backup           |
| `npm run test:e2e`                    | Run Playwright tests                                 |
| `npm run test:e2e:ui`                 | Playwright interactive UI                            |
| `npm run test:e2e:headed`             | Playwright with visible browser                      |
| `npm run test:e2e:report`             | Open Playwright HTML report                          |
| `npm run lint`                        | Run ESLint                                           |
| `npm run lint:fix`                    | Run ESLint with auto-fix                             |
| `npm run format`                      | Format all files with Prettier                       |
| `npm run format:check`                | Check formatting without writing                     |
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
│   └── seed/               # Generated legacy data (gitignored)
├── scripts/                # Supabase connect, legacy import
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
