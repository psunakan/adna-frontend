# Sonny's DevOps Training Log

## About me
- Name: Paul "Sonny" Akan
- Goal: Become a senior DevOps engineer
- Project: A-DNA.org web application for ADNA board
- Learning style: Short and sharp when moving fast, 
  detailed when understanding something new deeply

---

## Session 1 — May 16, 2026 (Part 1)
### Topic: AI tools, token saving, git workflow, GitHub

### Claude setup
- Memory turned ON in Settings → Capabilities
- A-DNA Build project created on claude.ai
- Project Instructions added with full project scope
- Files uploaded: index.html, event.html, CLAUDE.md, SKILLS.md
- CLAUDE.md and SKILLS.md created locally in frontend-prototype folder
- Claude browser reads from Project files (cloud)
- Claude Code reads from CLAUDE.md on local computer
- They are separate — like PST vs Exchange. Must update both manually.

### Key concepts learned

#### Token saving
- Always work inside the A-DNA Build project — not new chats
- Claude already knows your stack from project instructions
- End of every session: ask Claude to summarise → paste into TRAINING.md
- Re-upload CLAUDE.md to project when it changes

#### Git and GitHub
- git init = start tracking a folder with git
- git remote add origin [url] = link folder to GitHub repo
- git add . = stage all changes
- git commit -m "message" = save a snapshot
- git push = send to GitHub
- First push ever creates a new branch → pull request needed
- Every push after goes straight to main → no pull request
- --force = overwrite GitHub with your local version (use carefully)
- git push origin master:main --force = push local master into remote main

#### Branches
- main = official filing cabinet (production)
- master = your local working copy
- pull request = approval process before merging into main
- In a team: nobody pushes directly to main without approval
- Branch protection = the rule that enforces this in an org
- Senior DevOps interview answer: "Developers work on feature 
  branches, raise a pull request, senior engineer reviews and 
  approves, then merges into main. Main is protected."

#### Directories
- DevOps Claude = working directory for Claude Code
- DevOps 3 = working directory for Antigravity and other IDEs
- Always tell Claude which directory you are working in
- GitHub is the single source of truth — everything flows from there

#### Repos
- psunakan/adna-frontend = live frontend, Vercel watches this
- psunakan/a-dna-monorepo = full monorepo, backend + everything

### Commands used today
- git status
- git remote -v
- git remote add origin [url]
- git add .
- git commit -m "message"
- git push -u origin master
- git push origin master:main --force
- New-Item CLAUDE.md (Windows — creates a file)
- code CLAUDE.md (opens in VS Code)

### Real world connection
- Pull requests in enterprise = gatekeeper workflow
- You as DevOps lead = you approve all merges to main
- Knowledge base from training logs = foundation for future AI agent

---

## Session 2 — May 16, 2026 (Part 2)
### Topic: IDE sync issues, dynamic UI engineering, Vercel deployment

### Key concepts learned

#### Resolving IDE file lock issues
- When an IDE locks a file and blocks saving, do not fight it inside the IDE
- Close the IDE completely first
- Then use git directly from the terminal to commit and push
- Never rely on the IDE's built-in git tools when files are locked
- Real world: this happens in team environments when multiple tools 
  compete for the same file — always use terminal git as your fallback

#### Image asset integrity and paths
- Broken images almost always trace back to missing file extensions 
  or folder casing mismatches (e.g. Pictures/ vs pictures/)
- Keep all assets in one shared Pictures/ folder
- Shorter relative paths = cleaner codebase = fewer token mistakes 
  when working with AI tools

#### Moving workspaces — multi-directory git strategy
- When moving production work to a new folder, always run git init first
- Then point it back to your GitHub repo with git remote add origin
- To overwrite stale remote code with your updated local version:
  git push -f origin master
- This bypasses history conflicts and triggers Vercel to redeploy instantly
- Real world: senior DevOps engineers do this when recovering from 
  broken environments — knowing when to force push is a key skill

#### Custom domains in Vercel (CI/CD)
- To serve your site on a-dna.org instead of adna-frontend.vercel.app:
  Option 1 — Add domain in Vercel Project Settings → Domains
  Option 2 — Update nameservers at your domain registrar (Wix) 
              to point to Vercel's edge network
- A CNAME record maps your domain to Vercel automatically
- Real world: this is standard practice for every production deployment

### Commands used today
- git config --local --unset extensions.worktreeConfig
  (clears isolated local workspace config causing conflicts)
- git init
  (initializes git in a brand new directory)
- git push -f origin master
  (forces local code to overwrite remote — use carefully)

### Real world connection
- Multi-directory environments are common in enterprise DevOps
- Mastering force pushes, remote resets, and Vercel integration 
  prepares you to build and fix automated deployment pipelines
- Knowing WHEN to force push vs when to pull request = senior judgment

---
