#!/bin/bash

# ============================================================
# Monitor Script - Health checks and API monitoring
# ============================================================
# Usage: ./scripts/monitor.sh [--continuous] [--interval 30]
# ============================================================

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

CONTINUOUS=false
INTERVAL=30

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --continuous)
      CONTINUOUS=true
      shift
      ;;
    --interval)
      INTERVAL=$2
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

check_health() {
  echo -e "${YELLOW}🏥 Running health checks...${NC} ($(date '+%Y-%m-%d %H:%M:%S'))\n"
  
  # Backend health check
  echo "🔹 Backend API:"
  if [ -z "$BACKEND_URL" ]; then
    BACKEND_URL="http://localhost:8000"
  fi
  
  if curl -s "$BACKEND_URL/api/v1/health" > /dev/null 2>&1; then
    echo -e "${GREEN}  ✅ Backend is running${NC}"
  else
    echo -e "${RED}  ❌ Backend is down or unreachable${NC}"
  fi
  
  # Frontend dev server check
  echo "🔹 Frontend Dev Server:"
  if curl -s "http://localhost:5173" > /dev/null 2>&1; then
    echo -e "${GREEN}  ✅ Frontend dev server is running${NC}"
  else
    echo -e "${YELLOW}  ⏸️  Frontend dev server not running${NC}"
  fi
  
  # Database check
  echo "🔹 Database:"
  if [ -f "supabase/.env" ]; then
    echo -e "${GREEN}  ✅ Supabase configured${NC}"
  else
    echo -e "${YELLOW}  ⚠️  Supabase not configured${NC}"
  fi
  
  # Disk space
  echo "🔹 Disk Usage:"
  DISK_USAGE=$(df -h . | tail -1 | awk '{print $(NF-1)}')
  echo "  Disk used: $DISK_USAGE"
  
  # Node processes
  echo "🔹 Active Node Processes:"
  NODE_PROCS=$(pgrep -f "node|vite|npm" | wc -l)
  echo "  Count: $NODE_PROCS"
  
  echo ""
}

if [ "$CONTINUOUS" = true ]; then
  while true; do
    check_health
    echo -e "⏳ Next check in ${INTERVAL}s... (Press Ctrl+C to stop)\n"
    sleep "$INTERVAL"
  done
else
  check_health
fi
