#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: docker is not installed. Install Docker Desktop: https://www.docker.com/products/docker-desktop/" >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Error: Docker daemon is not running." >&2
  echo "Start Docker Desktop, wait until it shows 'Running', then retry." >&2
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "Warning: .env not found. Copy env.example to .env and set VITE_* variables." >&2
  echo "         Build will continue with empty Supabase config." >&2
fi

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

case "${1:-up}" in
  build)
    docker compose build --progress=plain web
    ;;
  up)
    docker compose up --build web
    ;;
  dev)
    docker compose --profile dev up dev
    ;;
  *)
    echo "Usage: $0 [build|up|dev]" >&2
    exit 1
    ;;
esac
