#!/bin/bash
# Auto-deploy script for smart-home
# Pulls latest changes from GitHub and rebuilds Docker containers

set -e

cd /mnt/c/smart-home

echo "[$(date)] Checking for updates..."

# Fetch latest changes
git fetch origin main

# Check if there are new commits
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    echo "[$(date)] Already up to date."
    exit 0
fi

echo "[$(date)] New commits found. Deploying..."

# Pull changes
git pull origin main

# Rebuild and restart containers
docker compose build --parallel
docker compose up -d

echo "[$(date)] Deployment complete!"
