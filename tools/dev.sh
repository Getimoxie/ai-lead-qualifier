#!/bin/bash
# Start Trigger.dev dev server and Next.js frontend concurrently.
# Run from the repo root: bash tools/dev.sh

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Starting Trigger.dev dev server..."
(cd "$ROOT/backend" && npx trigger.dev@latest dev) &
TRIGGER_PID=$!

echo "Starting Next.js frontend..."
(cd "$ROOT/frontend" && npm run dev) &
NEXT_PID=$!

trap "kill $TRIGGER_PID $NEXT_PID 2>/dev/null" EXIT

wait
