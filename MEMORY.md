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
| Frontend | HTML/CSS/JS prototype (migrating to React) |
| Frontend styling | Tailwind CSS via CDN (v3, JIT) |
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
| CI/CD | Vercel |
| Source control | GitHub monorepo |
| Phase 2 DB | AWS RDS or Azure SQL (when traffic scales) |

**GitHub repos:**
- `psunakan/adna-frontend` — live frontend, Vercel watches this
- `psunakan/a-dna-monorepo` — full monorepo (backend + everything)

**Live site:** https://adna-frontend.vercel.app

---

## Design System

| Element | Value |
|---|---|
| Primary green | `#116b53` (pcna-green) |
| Dark green | `#0a3d2e` |
| Red | `#c0392b` (pcna-red) |
| Heading font | Playfair Display |
| Body/nav font | Montserrat |
| Section headings | `text-4xl sm:text-5xl md:text-6xl font-black uppercase` |
| Body text | `text-base sm:text-lg md:text-xl font-bold` |
| Subheadings | `text-2xl sm:text-3xl md:text-4xl font-black` |

---

## Current Progress (as of May 2026)

### Done
- [x] Project architecture approved by ADNA board
- [x] Frontend prototype built (HTML/CSS/JS + Tailwind)
- [x] `index.html` — full homepage with all sections
- [x] `event.html` — events page
- [x] Hero section: parallax, gradient overlay, blur mask, centered text box
- [x] Navigation: sticky nav, hamburger mobile menu, Contact Us dropdown
- [x] Contact drawer: slide-up panel from footer
- [x] Stats bar: animated counters (4500+, 19, 3+, 5) with IntersectionObserver
- [x] Empowering section: heading, red divider, swoosh, split image/text, 3 cards
- [x] About page: Mission, Vision, Core Values (parallax), Five Pillars, Executive Team
- [x] Events page: upcoming events, sidebar
- [x] Footer: social links (all 6), Member Portal, Contact Us, copyright
- [x] Image assets organized in `Pictures/` folder
- [x] Partner/sponsor logos in `Logo/` and `Pictures/logos/`
- [x] Git initialized and connected to GitHub monorepo
- [x] Vercel deployment working — auto-deploys on push to main
- [x] CLAUDE.md, SKILLS.md, TRAINING.md, MEMORY.md created and maintained
- [x] Claude Code set up as primary AI coding tool

### In Progress
- [ ] Migrating HTML prototype into React
- [ ] WordPress headless CMS running locally via Docker Compose on Multipass

---

## Homepage Section Order (index.html)

1. Top utility bar (Member Portal | Contact Us dropdown)
2. Sticky nav (logo, Home, About Us, Events, Education, Donate, hamburger)
3. Hero (parallax image, gradient, blur, centered text + buttons)
4. Empowering section (heading, swoosh, split layout)
5. Stats bar (4500+ Members, 19 Leaders, 3+ Years, 5 Strategies)
6. Three cards (Global Connectivity, Advancement, Global Health Impact)
7. Join the Alliance CTA
8. Latest News feed
9. Global Collaborators marquee
10. Sticky footer (Member Portal, Contact Us, social icons, copyright)

---

## Key Decisions Made

1. **Headless WordPress** — content team uses familiar editor, React handles frontend
2. **Vercel** — zero-config CI/CD, free tier, instant deploys on git push
3. **Monorepo** — backend and frontend together for easier coordination
4. **Cloudflare** — DNS and CDN, free tier, DDoS protection
5. **Stripe + SendGrid** — payments and email, industry standard
6. **Cloudinary** — media CDN, avoids large files in git
7. **Multipass + Docker** — real Linux environment on Windows without dual-booting
8. **Force push strategy** — used when recovering from broken environments (senior DevOps practice)
9. **Single `Pictures/` folder** — all image assets, shorter paths, fewer AI token errors
10. **SPA pattern** — `showSection(id)` JS function, no page reloads
11. **Tailwind via CDN** — fast prototyping, JIT mode, no build step needed for prototype phase
12. **Font system** — Playfair Display headings + Montserrat body, established size scale

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
- Resolving IDE file lock issues
- Image asset path discipline
- Multi-directory git strategy
- Vercel custom domains — CNAME records, nameserver delegation
- Force push judgment — when to use vs when to pull request

### Session 3 — May 17, 2026
- Hero section: parallax, gradient overlay, blur mask, text positioning
- Navigation: hamburger mobile menu, JS dropdown with delay, contact drawer
- Responsive design: Tailwind prefixes, mobile-first approach
- Font system: established heading and body scale for whole site
- JS animations: IntersectionObserver, requestAnimationFrame, easing functions
- SVG: inline icons, decorative swoosh lines, mirror with scaleY(-1)
- Section redesign: Empowering section rebuilt from scratch
- Git: force push pattern, commit trigger phrases

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
git push origin master:main   # or --force if rejected

# Troubleshooting
docker ps                      # check containers
docker compose logs -f         # view logs
# If Docker won't start → restart Multipass first
```
