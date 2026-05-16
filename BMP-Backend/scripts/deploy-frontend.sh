#!/usr/bin/env bash
# =============================================================================
# BMP Frontend — Deploy Script (MONOREPO)
# Builds BMP-FE and copies dist/ to the Nginx-served directory.
#
# Usage:
#   bash scripts/deploy-frontend.sh [branch]
#   bash scripts/deploy-frontend.sh main    # production
#   bash scripts/deploy-frontend.sh stage   # staging
#
# Called by GitHub Actions CI/CD via SSH.
# The frontend is built on the VPS using the production .env.production file.
# =============================================================================

set -euo pipefail

MONOREPO_DIR="/var/www/bmp"
FRONTEND_DIR="$MONOREPO_DIR/BMP-FE"
APP_USER="bmp"
BRANCH="${1:-main}"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()  { echo -e "${GREEN}[DEPLOY-FE]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC}    $1"; }
step() { echo -e "${BLUE}[STEP]${NC}    $1"; }

# Load nvm
export NVM_DIR="/home/$APP_USER/.nvm"
[[ -s "$NVM_DIR/nvm.sh" ]] && source "$NVM_DIR/nvm.sh"

log "Deploying frontend from branch '$BRANCH'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 1. Pull latest monorepo code (if not already done by deploy.sh) ───────────
step "1/4 Pulling latest code..."
if [[ -d "$MONOREPO_DIR/.git" ]]; then
    cd "$MONOREPO_DIR"
    git fetch origin
    git checkout "$BRANCH"
    git reset --hard "origin/$BRANCH"
    git clean -fd
else
    git clone --branch "$BRANCH" --depth 1 \
        "https://github.com/pentasoftwareconsultancy/book-my-parcel.git" \
        "$MONOREPO_DIR"
fi
log "Code: $(git -C $MONOREPO_DIR log -1 --format='%h %s')"

# ── 2. Verify .env.production exists ─────────────────────────────────────────
step "2/4 Checking frontend environment..."
if [[ ! -f "$FRONTEND_DIR/.env.production" ]]; then
    warn ".env.production not found!"
    warn "  cp $FRONTEND_DIR/.env.production.example $FRONTEND_DIR/.env.production"
    warn "  Then fill in VITE_API_URL, VITE_WS_URL, VITE_BASE_URL, and API keys."
    exit 1
fi
log ".env.production found"

# ── 3. Install dependencies and build ────────────────────────────────────────
step "3/4 Installing dependencies and building..."
npm ci --prefer-offline

# Build using .env.production (Vite automatically loads this in production mode)
NODE_ENV=production npm run build

log "Frontend built successfully → $FRONTEND_DIR/dist"

# ── 4. Reload Nginx to serve new files ───────────────────────────────────────
step "4/4 Reloading Nginx..."
nginx -t && systemctl reload nginx
log "Nginx reloaded"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "✅ Frontend deployment complete!"
echo "  Branch  : $BRANCH"
echo "  Dist    : $FRONTEND_DIR/dist"
echo "  Served  : via Nginx from $FRONTEND_DIR/dist"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
