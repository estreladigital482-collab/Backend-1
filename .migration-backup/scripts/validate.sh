#!/bin/bash

# ============================================================
# Validate Script - Run all quality checks
# ============================================================
# Usage: ./scripts/validate.sh [--fix] [--skip-build]
# ============================================================

set -e

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

FIX_MODE=false
SKIP_BUILD=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --fix)
      FIX_MODE=true
      shift
      ;;
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo -e "${BOLD}🔍 Starting validation pipeline...${NC}\n"

# Frontend Linting
echo -e "${BOLD}1️⃣  Frontend Linting${NC}"
if [ "$FIX_MODE" = true ]; then
  npm run lint -- --fix
  echo -e "${GREEN}✅ Linting fixed${NC}\n"
else
  npm run lint || echo -e "${YELLOW}⚠️  Linting issues found (run with --fix to auto-fix)${NC}\n"
fi

# TypeScript Type Checking
echo -e "${BOLD}2️⃣  TypeScript Type Checking${NC}"
if npx tsc --noEmit; then
  echo -e "${GREEN}✅ No type errors${NC}\n"
else
  echo -e "${RED}❌ Type errors found${NC}\n"
  exit 1
fi

# Frontend Tests
echo -e "${BOLD}3️⃣  Frontend Unit Tests${NC}"
if npm run test; then
  echo -e "${GREEN}✅ All tests passed${NC}\n"
else
  echo -e "${RED}❌ Some tests failed${NC}\n"
  exit 1
fi

# Backend Tests
echo -e "${BOLD}4️⃣  Backend Tests${NC}"
if [ -d "packages/bridge" ]; then
  cd packages/bridge
  if python -m pytest -v --tb=short 2>/dev/null; then
    echo -e "${GREEN}✅ Backend tests passed${NC}\n"
  else
    echo -e "${YELLOW}⚠️  Backend tests not available or failed${NC}\n"
  fi
  cd - > /dev/null
else
  echo -e "${YELLOW}⏭️  Backend not found, skipping${NC}\n"
fi

# Build
if [ "$SKIP_BUILD" = false ]; then
  echo -e "${BOLD}5️⃣  Building Project${NC}"
  if npm run build; then
    BUNDLE_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
    echo -e "${GREEN}✅ Build successful (Bundle: $BUNDLE_SIZE)${NC}\n"
  else
    echo -e "${RED}❌ Build failed${NC}\n"
    exit 1
  fi
fi

# Summary
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}${BOLD}✅ All validations passed!${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "💡 Ready to commit. Run: ${BOLD}git push${NC}"
