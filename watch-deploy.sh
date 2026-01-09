#!/bin/bash
# Auto-deploy watcher for smart-home
# Polls GitHub for changes and deploys automatically
# Usage: ./watch-deploy.sh [interval_seconds]
# Default interval: 60 seconds

INTERVAL=${1:-60}
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="$SCRIPT_DIR/deploy.log"

echo "[$(date)] Starting deploy watcher (interval: ${INTERVAL}s)"
echo "[$(date)] Logs: $LOG_FILE"

while true; do
    "$SCRIPT_DIR/deploy.sh" >> "$LOG_FILE" 2>&1
    sleep "$INTERVAL"
done
