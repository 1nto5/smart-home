#!/bin/bash
# Deploy script for smart-home
# Usage: ./scripts/deploy.sh

set -e

echo "Building frontend..."
cd frontend
bun install
bun run build
cd ..

echo "Committing changes..."
git add -A
if git diff --staged --quiet; then
  echo "No changes to commit"
else
  git commit -m "build: frontend dist

Co-Authored-By: deploy-script <noreply@local>"
fi

echo "Pushing to GitHub..."
git push

echo "Deploying to server..."
sshpass -p '@dria^522' ssh -o StrictHostKeyChecking=no administrator@10.10.10.10 \
  'wsl -e bash -c "cd /mnt/c/smart-home && git pull origin main && docker compose build --parallel && docker compose up -d"'

echo "Deploy complete!"
