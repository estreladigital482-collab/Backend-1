#!/bin/bash

# ============================================================
# Deploy Script - Automated deployment with Docker
# ============================================================
# Usage: ./scripts/deploy.sh [--environment staging|prod] [--skip-tests]
# ============================================================

set -e

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ENVIRONMENT="staging"
SKIP_TESTS=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --environment)
      ENVIRONMENT=$2
      shift 2
      ;;
    --skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

echo -e "${BOLD}🚀 Starting deployment to $ENVIRONMENT...${NC}\n"

# Validate environment
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "prod" ]; then
  echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
  echo "Valid options: staging, prod"
  exit 1
fi

# Safety check for production
if [ "$ENVIRONMENT" = "prod" ]; then
  read -p "⚠️  You are about to deploy to PRODUCTION. Continue? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 1
  fi
fi

# Load environment file
ENV_FILE=".env.$ENVIRONMENT"
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${YELLOW}⚠️  Environment file not found: $ENV_FILE${NC}"
  echo "Creating from template..."
  cp .env.example "$ENV_FILE" 2>/dev/null || {
    echo -e "${RED}❌ Could not create environment file${NC}"
    exit 1
  }
fi

echo -e "${BOLD}1️⃣  Validation${NC}"
if [ "$SKIP_TESTS" = false ]; then
  echo "Running tests..."
  npm run test || {
    echo -e "${RED}❌ Tests failed. Cannot deploy.${NC}"
    exit 1
  }
  echo -e "${GREEN}✅ Tests passed${NC}\n"
else
  echo -e "${YELLOW}⏭️  Tests skipped${NC}\n"
fi

echo -e "${BOLD}2️⃣  Building${NC}"
npm run build || {
  echo -e "${RED}❌ Build failed${NC}"
  exit 1
}
echo -e "${GREEN}✅ Build successful${NC}\n"

echo -e "${BOLD}3️⃣  Docker Setup${NC}"
COMPOSE_FILE="docker-compose.$ENVIRONMENT.yml"
if [ ! -f "$COMPOSE_FILE" ]; then
  COMPOSE_FILE="docker-compose.yml"
fi

if command -v docker &> /dev/null; then
  echo "Docker detected. Building image..."
  docker-compose -f "$COMPOSE_FILE" build || {
    echo -e "${YELLOW}⚠️  Docker build encountered issues${NC}"
  }
  echo -e "${GREEN}✅ Docker ready${NC}\n"
else
  echo -e "${YELLOW}⏭️  Docker not installed. Skipping Docker setup.${NC}\n"
fi

echo -e "${BOLD}4️⃣  Pre-deployment Checks${NC}"
if [ -f "supabase/.env" ]; then
  echo -e "${GREEN}✅ Supabase configured${NC}"
else
  echo -e "${YELLOW}⚠️  Supabase not configured${NC}"
fi

# Check API connectivity
echo "Checking API connectivity..."
if curl -s "http://localhost:8000/api/v1/health" > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Backend API is running${NC}\n"
else
  echo -e "${YELLOW}⚠️  Backend API not reachable. It may not be running.${NC}\n"
fi

# Summary
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}${BOLD}✅ Deployment prepared!${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

if command -v docker &> /dev/null; then
  echo -e "Next step: ${BOLD}docker-compose -f $COMPOSE_FILE up -d${NC}"
else
  echo -e "Next step: Deploy ${BOLD}dist/${NC} to your hosting"
fi
echo ""
