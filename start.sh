#!/bin/bash

# Smart Home - Service Startup Script
# Starts: Backend (3001), Frontend (5173), Roborock Bridge (3002)

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PIDS_FILE="$PROJECT_DIR/.service-pids"
LOGS_DIR="$PROJECT_DIR/logs"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

mkdir -p "$LOGS_DIR"

start_services() {
    if [ -f "$PIDS_FILE" ]; then
        echo -e "${YELLOW}Services may already be running. Run './start.sh stop' first.${NC}"
        exit 1
    fi

    echo -e "${GREEN}Starting Smart Home services...${NC}"

    # Backend
    echo "Starting backend (port 3001)..."
    cd "$PROJECT_DIR/backend"
    bun run src/index.ts > "$LOGS_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo "backend:$BACKEND_PID" >> "$PIDS_FILE"

    # Frontend (dev mode)
    echo "Starting frontend (port 5173)..."
    cd "$PROJECT_DIR/frontend"
    bun run dev > "$LOGS_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    echo "frontend:$FRONTEND_PID" >> "$PIDS_FILE"

    # Roborock Bridge
    echo "Starting roborock-bridge (port 3002)..."
    cd "$PROJECT_DIR/roborock-bridge"
    if [ -d ".venv" ]; then
        source .venv/bin/activate
    fi
    python main.py > "$LOGS_DIR/roborock.log" 2>&1 &
    ROBOROCK_PID=$!
    echo "roborock:$ROBOROCK_PID" >> "$PIDS_FILE"

    sleep 2
    echo ""
    echo -e "${GREEN}Services started:${NC}"
    echo "  Backend:    http://localhost:3001 (PID: $BACKEND_PID)"
    echo "  Frontend:   http://localhost:5173 (PID: $FRONTEND_PID)"
    echo "  Roborock:   http://localhost:3002 (PID: $ROBOROCK_PID)"
    echo ""
    echo "Logs: $LOGS_DIR/"
    echo "Stop: ./start.sh stop"
}

stop_services() {
    if [ ! -f "$PIDS_FILE" ]; then
        echo -e "${YELLOW}No services running (no PID file found).${NC}"
        exit 0
    fi

    echo -e "${RED}Stopping services...${NC}"
    while IFS=: read -r name pid; do
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null
            echo "Stopped $name (PID: $pid)"
        else
            echo "$name already stopped"
        fi
    done < "$PIDS_FILE"

    rm -f "$PIDS_FILE"
    echo -e "${GREEN}All services stopped.${NC}"
}

status_services() {
    if [ ! -f "$PIDS_FILE" ]; then
        echo -e "${YELLOW}No services running.${NC}"
        exit 0
    fi

    echo "Service status:"
    while IFS=: read -r name pid; do
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "  $name: ${GREEN}running${NC} (PID: $pid)"
        else
            echo -e "  $name: ${RED}stopped${NC}"
        fi
    done < "$PIDS_FILE"
}

logs_services() {
    SERVICE=${2:-all}
    if [ "$SERVICE" = "all" ]; then
        tail -f "$LOGS_DIR"/*.log
    else
        tail -f "$LOGS_DIR/$SERVICE.log"
    fi
}

case "${1:-start}" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        sleep 1
        start_services
        ;;
    status)
        status_services
        ;;
    logs)
        logs_services "$@"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs [service]}"
        echo "  logs service: backend, frontend, roborock, or all (default)"
        exit 1
        ;;
esac
