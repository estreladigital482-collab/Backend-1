#!/bin/bash

# ============================================================
# Pre-commit Hook - Auto-validate before committing
# ============================================================
# Installation: cp scripts/pre-commit.sh .git/hooks/pre-commit
# ============================================================

set -e

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔍 Running pre-commit checks...${NC}\n"

# Get changed files
CHANGED_TS_FILES=$(git diff --cached --name-only | grep -E '\.(ts|tsx)$' || echo "")
CHANGED_PY_FILES=$(git diff --cached --name-only | grep -E '\.py$' || echo "")

# Lint TypeScript files
if [ -n "$CHANGED_TS_FILES" ]; then
  echo "📝 TypeScript files changed:"
  echo "$CHANGED_TS_FILES"
  echo ""
  echo "Checking with ESLint..."
  npm run lint -- $CHANGED_TS_FILES || {
    echo -e "${RED}❌ ESLint failed. Fix issues before committing.${NC}"
    exit 1
  }
fi

# Check Python files
if [ -n "$CHANGED_PY_FILES" ]; then
  echo "🐍 Python files changed:"
  echo "$CHANGED_PY_FILES"
  echo ""
  echo "Checking with Flake8..."
  cd packages/bridge 2>/dev/null || exit 0
  flake8 $CHANGED_PY_FILES --max-line-length=120 || {
    echo -e "${RED}❌ Flake8 failed. Fix issues before committing.${NC}"
    exit 1
  }
  cd - > /dev/null
fi

echo -e "${GREEN}✅ Pre-commit checks passed${NC}\n"
