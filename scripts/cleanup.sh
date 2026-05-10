#!/bin/bash

# ============================================================
# Cleanup Script - Remove unused dependencies and cache
# ============================================================
# Usage: ./scripts/cleanup.sh [--dry-run] [--aggressive]
# ============================================================

set -e

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

DRY_RUN=false
AGGRESSIVE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --aggressive)
      AGGRESSIVE=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

echo -e "${BOLD}🧹 Starting cleanup...${NC}\n"

# Clean npm cache
echo -e "${BOLD}1️⃣  NPM Cache${NC}"
if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}[DRY-RUN]${NC} Would run: npm cache clean --force"
else
  npm cache clean --force
  echo -e "${GREEN}✅ NPM cache cleaned${NC}"
fi
echo ""

# Clean node_modules if aggressive
if [ "$AGGRESSIVE" = true ]; then
  echo -e "${BOLD}2️⃣  Node Modules (AGGRESSIVE)${NC}"
  if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}[DRY-RUN]${NC} Would remove: node_modules"
  else
    rm -rf node_modules
    npm install
    echo -e "${GREEN}✅ Node modules reinstalled${NC}"
  fi
  echo ""
fi

# Remove unused dependencies (requires depcheck)
echo -e "${BOLD}3️⃣  Unused Dependencies${NC}"
if command -v depcheck &> /dev/null; then
  UNUSED=$(depcheck --json 2>/dev/null | jq '.dependencies | length' 2>/dev/null || echo "0")
  if [ "$UNUSED" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $UNUSED unused dependencies${NC}"
    depcheck --oneline
    if [ "$DRY_RUN" = false ]; then
      read -p "Remove unused dependencies? (y/n) " -n 1 -r
      echo
      if [[ $REPLY =~ ^[Yy]$ ]]; then
        depcheck --oneline | xargs -I {} npm uninstall {} || true
        echo -e "${GREEN}✅ Unused dependencies removed${NC}"
      fi
    fi
  else
    echo -e "${GREEN}✅ No unused dependencies found${NC}"
  fi
else
  echo -e "${YELLOW}⏭️  depcheck not installed. Install with: npm install -g depcheck${NC}"
fi
echo ""

# Clean build artifacts
echo -e "${BOLD}4️⃣  Build Artifacts${NC}"
if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}[DRY-RUN]${NC} Would remove: dist/"
else
  rm -rf dist/
  echo -e "${GREEN}✅ Build artifacts removed${NC}"
fi
echo ""

# Clean test coverage
echo -e "${BOLD}5️⃣  Test Coverage${NC}"
if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}[DRY-RUN]${NC} Would remove: coverage/"
else
  rm -rf coverage/
  echo -e "${GREEN}✅ Coverage cleaned${NC}"
fi
echo ""

# Python cleanup (if backend exists)
if [ -d "packages/bridge" ]; then
  echo -e "${BOLD}6️⃣  Python Cache${NC}"
  if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}[DRY-RUN]${NC} Would remove: __pycache__, .pytest_cache"
  else
    find packages/bridge -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
    find packages/bridge -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
    echo -e "${GREEN}✅ Python cache cleaned${NC}"
  fi
  echo ""
fi

# Summary
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}[DRY-RUN MODE]${NC} Run without --dry-run to apply changes"
else
  echo -e "${GREEN}${BOLD}✅ Cleanup complete!${NC}"
fi
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
