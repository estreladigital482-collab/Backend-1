#!/bin/bash

# ============================================================
# Setup Git Hooks - Install pre-commit and other hooks
# ============================================================
# Usage: ./scripts/setup-hooks.sh
# ============================================================

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BOLD}🔗 Setting up Git hooks...${NC}\n"

# Create hooks directory if it doesn't exist
HOOKS_DIR=".git/hooks"
mkdir -p "$HOOKS_DIR"

# Copy pre-commit hook
echo "📝 Installing pre-commit hook..."
cp scripts/pre-commit.sh "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/pre-commit"
echo -e "${GREEN}✅ Pre-commit hook installed${NC}"

# Create commit-msg hook for conventional commits
echo "📝 Installing commit-msg hook..."
cat > "$HOOKS_DIR/commit-msg" << 'EOF'
#!/bin/bash

# Validate commit message format (conventional commits)
# Format: type(scope): message
# Example: feat(chat): add message search

COMMIT_MSG=$(cat $1)
COMMIT_REGEX='^(feat|fix|docs|style|refactor|perf|test|chore|ci)(\(.+\))?: .{1,}$'

if ! [[ $COMMIT_MSG =~ $COMMIT_REGEX ]]; then
  echo "❌ Invalid commit message format!"
  echo ""
  echo "Expected format: type(scope): message"
  echo "Example: feat(chat): add message search"
  echo ""
  echo "Valid types: feat, fix, docs, style, refactor, perf, test, chore, ci"
  exit 1
fi
EOF
chmod +x "$HOOKS_DIR/commit-msg"
echo -e "${GREEN}✅ Commit-msg hook installed${NC}"

# Create post-merge hook
echo "📝 Installing post-merge hook..."
cat > "$HOOKS_DIR/post-merge" << 'EOF'
#!/bin/bash

# Auto-reinstall dependencies if package.json changed
if git diff HEAD@{1} --name-only | grep -q "package.json"; then
    echo "📦 package.json changed. Reinstalling dependencies..."
    npm ci
fi
EOF
chmod +x "$HOOKS_DIR/post-merge"
echo -e "${GREEN}✅ Post-merge hook installed${NC}"

echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}${BOLD}✅ Git hooks installed!${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo "📋 Installed hooks:"
echo "  • pre-commit: Runs linting and type checks before commits"
echo "  • commit-msg: Validates commit message format (conventional commits)"
echo "  • post-merge: Auto-reinstalls dependencies if package.json changed"
