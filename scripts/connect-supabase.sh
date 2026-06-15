#!/usr/bin/env bash
set -euo pipefail

PROJECT_REF="${1:-lqtsbmarfejvuexcjito}"

cd "$(dirname "$0")/.."

echo "→ Linking Supabase project ${PROJECT_REF}..."
npm run db:link -- --project-ref "$PROJECT_REF"

echo "→ Pushing migrations..."
npm run db:push

echo ""
echo "✓ Supabase connected and migrations pushed."
echo "Restart the dev server if .env changed."
