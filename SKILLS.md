# Skills — A-DNA Project

## Local development
- Start environment: docker compose up -d
- Stop environment: docker compose down
- Check running containers: docker ps
- View logs: docker compose logs -f

## Deploying frontend
- Commit and push to GitHub
- Vercel auto deploys on every push to main branch
- Check deployment: https://vercel.com/dashboard

## WordPress
- Access local WordPress: http://localhost:8080
- Admin login: http://localhost:8080/wp-admin
- REST API base URL: http://localhost:8080/wp-json/wp/v2

## GitHub workflow
- Always work on a branch, never directly on main
- git checkout -b feature/my-feature
- git add . → git commit -m "message" → git push
- Open pull request on GitHub to merge

## Multipass
- Start VM: multipass start
- Enter VM: multipass shell
- Check status: multipass list

## Troubleshooting
- If Docker won't start: restart Multipass first
- If WordPress unreachable: check docker ps and confirm containers are running
- If Vercel deploy fails: check GitHub Actions logs