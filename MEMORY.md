# A-DNA Project — Memory & State

*Last updated: 2026-05-17*

---

## Project Overview

Building the **A-DNA.org** web application for the ADNA (African Diaspora Nurses Association) board.
Architecture approved by Mo and the ADNA board.
Benchmark design references: **pcna.net** and **jhpiego.org**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Antigravity prototype) |
| Frontend hosting | Vercel (auto-deploy on push to main) |
| CMS / Backend | WordPress (Headless) |
| Backend API | WordPress REST API |
| Database | MariaDB |
| Web server | Nginx |
| Local dev env | Docker + Docker Compose inside Multipass (Windows host) |
| Media hosting | Cloudinary (planned) |
| Payments | Stripe (planned) |
| Email | SendGrid (planned) |
| DNS | Wix registrar → Cloudflare (free tier) |
| CI/CD | Cloudflare Pages / Vercel |
| Source control | GitHub monorepo |
| Phase 2 DB | AWS RDS or Azure SQL (when traffic scales) |

**GitHub repos:**
- `psunakan/adna-frontend` — live frontend, Vercel watches this
- `psunakan/a-dna-monorepo` — full monorepo (backend + everything)

**Live site:** https://adna-frontend.vercel.app

---

## Current Progress (as of May 2026)

### Done
- [x] Project architecture approved by ADNA board
- [x] Frontend prototype built using Antigravity (HTML/CSS/JS)
- [x] `index.html` — main homepage
- [x] `event.html` — events page
- [x] `preview_hero.html` — hero section preview
- [x] Image assets organized in `Pictures/` folder
- [x] Partner/sponsor logos collected in `Logo/` and `Pictures/logos/` folders (SVG and PNG)
- [x] Git initialized and connected to GitHub monorepo
- [x] Vercel deployment working — auto-deploys on push to main
- [x] CLAUDE.md and SKILLS.md created for Claude Code context
- [x] TRAINING.md started — DevOps training log in progress
- [x] Claude Code set up as primary AI coding tool (reads CLAUDE.md locally)
- [x] claude.ai A-DNA Build project set up (reads uploaded project files)

### In Progress
- [ ] Migrating Antigravity prototype into React
- [ ] WordPress headless CMS running locally via Docker Compose on Multipass

---

## Key Decisions Made

1. **Headless WordPress** chosen as CMS — gives content team a familiar editor while React handles the frontend.
2. **Vercel** for frontend hosting — zero-config CI/CD, free tier, instant deploys on git push.
3. **Monorepo structure** on GitHub — backend and frontend together for easier coordination.
4. **Cloudflare** for DNS and CDN — free tier, fast, DDoS protection.
5. **Stripe + SendGrid** selected for payments and email — industry standard, good free tiers.
6. **Cloudinary** for media — avoids storing large files in git; CDN delivery for images.
7. **Multipass + Docker** for local dev on Windows — gives a real Linux environment without dual-booting.
8. **Force push strategy** used when recovering from broken environments or workspace moves — accepted senior DevOps practice.
9. **Single shared `Pictures/` folder** for all image assets — shorter paths, fewer AI token errors.
10. **Claude Code reads CLAUDE.md locally; claude.ai reads uploaded project files** — they are separate and must be updated independently.

---

## Key Features Still to Build

| Feature | Status |
|---|---|
| Member portal with login | Not started |
| Events and conference registration | HTML stub exists — not wired up |
| Payment via Stripe | Not started |
| Email confirmations via SendGrid | Not started |
| Resource library | Not started |
| Job board | Not started |
| Donations page | Not started |
| Mobile responsive design | Partial (prototype level) |
| React migration of prototype | In progress |
| WordPress REST API integration | Not started |
| Cloudinary media integration | Not started |
| Custom domain (a-dna.org) on Vercel | Not started |

---

## DevOps Skills Learned (Sonny's Log)

### Session 1 — May 16, 2026
- Git workflow: init, remote add, add, commit, push, force push
- Branch strategy: feature branches → pull request → merge to main
- Claude setup: Project Instructions, CLAUDE.md, SKILLS.md, TRAINING.md
- Token saving: always work inside the A-DNA Build project, never new chats

### Session 2 — May 16, 2026
- Resolving IDE file lock issues — close IDE, use terminal git directly
- Image asset path discipline — consistent folder naming prevents broken images
- Multi-directory git strategy — git init + remote add when moving workspaces
- Vercel custom domains — CNAME records, nameserver delegation
- Force push judgment — when to use vs when to pull request

---

## How Paul ("Sonny") Works

- Learning DevOps as he builds — explain everything step by step
- Give copy-paste-ready commands
- Remind him of next steps at the end of every response
- Short and sharp when moving fast; detailed when learning something new
- Learning style informed by real-world enterprise analogies
- Always remind to update both CLAUDE.md (local) AND project files on claude.ai when context changes

---

## Local Dev Quick Reference

```bash
# Start local environment
multipass start
multipass shell
docker compose up -d

# Stop local environment
docker compose down

# WordPress local URLs
http://localhost:8080          # site
http://localhost:8080/wp-admin # admin
http://localhost:8080/wp-json/wp/v2 # REST API

# Deploy frontend
git add .
git commit -m "message"
git push   # Vercel auto-deploys

# Troubleshooting
docker ps                      # check containers
docker compose logs -f         # view logs
# If Docker won't start → restart Multipass first
```
