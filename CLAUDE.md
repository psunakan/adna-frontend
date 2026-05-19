# A-DNA Web Application — Project Context

## About the project

Building the A-DNA.org web application for the ADNA board.
Approved architecture by Mo and the ADNA board.
Benchmark site: pcna.net and jhpiego.org

## My setup

* OS: Windows with Multipass for local Linux environment
* Local dev: Docker + Docker Compose running inside Multipass
* Database: MariaDB
* Web server: Nginx

## Frontend

* Framework: React (migration in progress — currently HTML/CSS/JS prototype)
* Styling: Tailwind CSS via CDN (v3, JIT mode)
* Fonts: Playfair Display (headings), Montserrat (body/nav)
* Colors: `#116b53` pcna-green, `#c0392b` pcna-red, `#0a3d2e` dark green
* Deployed on: Vercel
* Live site: https://adna-frontend.vercel.app
* Repo: GitHub (adna-frontend)
* Key files: index.html (homepage), event.html (events page)

## Frontend Design System

* Section headings: `text-4xl sm:text-5xl md:text-6xl font-black uppercase`
* Body text: `text-base sm:text-lg md:text-xl font-bold`
* SPA pattern: `showSection(id)` JS function controls page sections
* Hero: parallax (`background-attachment: fixed`), gradient overlay, blur mask via `::before`
* Navigation: sticky top nav, hamburger mobile menu, Contact Us dropdown (JS delay)
* Contact drawer: slide-up panel from footer with all contact info and social links

## Backend

* WordPress as Headless CMS
* REST API connecting frontend to WordPress
* Running locally via Docker Compose on Multipass

## Key features to build

* Member portal with login
* Events and conference registration
* Payment via Stripe
* Email confirmations via SendGrid
* Resource library
* Job board
* Donations page
* Media hosted on Cloudinary
* Mobile responsive

## Infrastructure

* Monorepo on GitHub
* CI/CD via Vercel (auto-deploys on push to main)
* DNS: Wix registrar pointing to Cloudflare (free tier)
* Phase 2: AWS RDS or Azure SQL when traffic scales

## How I work

* I am learning DevOps as I build
* Always explain what you are doing and why
* Give me commands I can copy and paste directly
* Remind me of next steps at the end of every response
* Never skip steps — walk me through everything

## Git Rules

* Never auto-commit or auto-push without permission
* Only commit and push when I say "taking a break" or "end of session"
* Never commit and push mid-task
* Always tell me what you are about to commit before doing it

