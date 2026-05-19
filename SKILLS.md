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
- Force push when recovering from environment issues:
  git push origin master:main --force

## Multipass
- Start VM: multipass start
- Enter VM: multipass shell
- Check status: multipass list

## Tailwind CSS
- Responsive prefixes: sm: (640px+), md: (768px+), lg: (1024px+), xl: (1280px+)
- Font weight scale: font-bold (700), font-extrabold (800), font-black (900)
- Sizing: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl … text-8xl
- Hover: hover:shadow-md, hover:-translate-y-1, hover:underline
- Transition: transition-all duration-200 (fast), duration-300 (normal)

## CSS techniques learned
- Parallax: background-attachment: fixed on hero background
- Blur mask: ::before pseudo-element with backdrop-filter + mask-image gradient
- Gradient overlay on background image: multiple values in background-image
- Sliding drawer: transform: translateY(100%) → translateY(0) with transition
- Equal height cards: grid items-stretch + flex flex-col + mt-auto on bottom element

## JavaScript patterns
- SPA navigation: showSection(id) hides all sections, shows target
- Hover dropdown with delay: setTimeout/clearTimeout on mouseenter/mouseleave
- IntersectionObserver: fires callback when element enters viewport
- Counter animation: IntersectionObserver + requestAnimationFrame + ease-out cubic
- Mobile menu toggle: classList.toggle('hidden')
- Slide-up drawer: style.transform + setTimeout for overlay hide

## SVG
- Inline SVG for icons (heroicons paths)
- Decorative SVG swoosh lines: wavy path with fill + stroke, preserveAspectRatio="none"
- Mirror SVG: transform: scaleY(-1)

## Troubleshooting
- If Docker won't start: restart Multipass first
- If WordPress unreachable: check docker ps and confirm containers are running
- If Vercel deploy fails: check GitHub Actions logs
- If stats counters stuck at 0: check IntersectionObserver JS is wired up in window.onload
- If dropdown disappears when hovering: use JS delay timer not CSS hover gap
