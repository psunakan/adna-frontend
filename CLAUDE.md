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

* Framework: React (built with Antigravity prototype)
* Deployed on: Vercel
* Live site: https://adna-frontend.vercel.app
* Repo: GitHub (adna-frontend)

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
* CI/CD via Cloudflare Pages
* DNS: Wix registrar pointing to Cloudflare (free tier)
* Phase 2: AWS RDS or Azure SQL when traffic scales

## How I work

* I am learning DevOps as I build
* Always explain what you are doing and why
* Give me commands I can copy and paste directly
* Remind me of next steps at the end of every response
* Never skip steps — walk me through everything

