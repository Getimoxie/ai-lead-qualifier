#!/bin/bash
# Deploy the Trigger.dev backend task to production.
# Run from the repo root: bash tools/deploy-backend.sh

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Deploying Trigger.dev backend..."
cd "$ROOT/backend"
npx trigger.dev@latest deploy

echo "Backend deployed successfully."
