#!/bin/bash

# ============================================================
# Docs Validation Script - Ensure docs and OpenAPI files are present
# ============================================================
# Usage: ./scripts/doc-validate.sh
# ============================================================

set -e

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BOLD}📚 Validating documentation files...${NC}\n"

validate_file() {
  local path="$1"
  if [ ! -f "$path" ]; then
    echo -e "${RED}❌ Missing required docs file: $path${NC}"
    exit 1
  fi
}

validate_openapi_yaml() {
  local path="$1"
  if grep -q '^openapi:' "$path" && grep -q '^paths:' "$path"; then
    echo -e "${GREEN}✅ OpenAPI YAML contains required top-level keys${NC}"
  else
    echo -e "${RED}❌ OpenAPI YAML missing required keys (openapi, paths)${NC}"
    exit 1
  fi
}

validate_openapi_json() {
  local path="$1"
  python - <<PY
import json
from pathlib import Path
p = Path(r"""$path""")
with p.open() as f:
    data = json.load(f)
assert 'openapi' in data
assert 'paths' in data
print('✅ OpenAPI JSON contains required top-level keys')
PY
}

validate_file "docs/openapi.yaml"
validate_openapi_yaml "docs/openapi.yaml"
validate_file "docs/openapi.json"
validate_openapi_json "docs/openapi.json"

if [ -f "AUTOMATION_QUICK_START.md" ]; then
  echo -e "${GREEN}✅ Automation quick start document exists${NC}"
else
  echo -e "${YELLOW}⚠️  Automation quick start document not found: AUTOMATION_QUICK_START.md${NC}"
fi

if [ -f "AUTOMATION_IMPLEMENTATION.md" ]; then
  echo -e "${GREEN}✅ Automation implementation document exists${NC}"
else
  echo -e "${YELLOW}⚠️  Automation implementation document not found: AUTOMATION_IMPLEMENTATION.md${NC}"
fi

if [ -f "docs/AUTOMATION_SUMMARY.md" ]; then
  echo -e "${GREEN}✅ Automation summary doc exists${NC}"
else
  echo -e "${YELLOW}⚠️  Automation summary doc not found: docs/AUTOMATION_SUMMARY.md${NC}"
fi

echo -e "\n${GREEN}${BOLD}✅ Docs validation complete!${NC}\n"
