#!/usr/bin/env bash
# =============================================================================
# BMP Backend — Deploy Script (MONOREPO)
# Monorepo: https://github.com/pentasoftwareconsultancy/book-my-parcel
#
# Usage:
#   bash scripts/deploy.sh [branch]
#   bash scripts/deploy.sh main    # production
#   bash scripts/deploy.sh stage   # staging
#
# Called by GitHub Actions CI/CD via SSH.
# =============================================================================

set -euo pipefail

MONOREPO_DIR="/var/www/bmp"
APP_DIR="$MONOREPO_DIR/BMP-Backend"
APP_USER="bmp"
BRANCH="${1:-main}"
REPO_URL="https://github.com/pentasoftwareconsultancy/book-my-parcel.git"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()  { echo -e "${GREEN}[DEPLOY-BE]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC}    $1"; }
step() { echo -e "${BLUE}[STEP]${NC}    $1"; }

# Load nvm
export NVM_DIR="/home/$APP_USER/.nvm"
[[ -s "$NVM_DIR/nvm.sh" ]] && source "$NVM_DIR/nvm.sh"

log "Deploying backend from branch '$BRANCH'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 1. Pull latest monorepo code ──────────────────────────────────────────────
step "1/6 Pulling latest code..."
if [[ -d "$MONOREPO_DIR/.git" ]]; then
    cd "$MONOREPO_DIR"
    git fetch origin
    git checkout "$BRANCH"
    git reset --hard "origin/$BRANCH"
    git clean -fd
else
    git clone --branch "$BRANCH" --depth 1 "$REPO_URL" "$MONOREPO_DIR"
    cd "$MONOREPO_DIR"
fi
log "Code updated to: $(git log -1 --format='%h %s (%ci)')"

# ── 2. Install backend dependencies ──────────────────────────────────────────
step "2/6 Installing backend dependencies..."
cd "$APP_DIR"
npm ci --omit=dev --prefer-offline
log "Backend dependencies installed"

# ── 3. Verify .env exists ─────────────────────────────────────────────────────
step "3/6 Checking environment..."
if [[ ! -f "$APP_DIR/.env" ]]; then
    warn ".env not found!"
    warn "  cp $APP_DIR/.env.example $APP_DIR/.env && vim $APP_DIR/.env"
    exit 1
fi
log ".env found"

# ── 4. Ensure upload directories exist ───────────────────────────────────────
step "4/6 Ensuring upload directories..."
mkdir -p "$APP_DIR/uploads"/{profiles,kyc,parcels,proofs}
mkdir -p "$APP_DIR/logs"
chmod 750 "$APP_DIR/uploads/kyc"   # KYC docs: restricted
log "Directories ready"

# ── 5. Start / reload PM2 ────────────────────────────────────────────────────
step "5/6 Starting/reloading PM2..."
cd "$APP_DIR"
if pm2 list | grep -q "bmp-backend"; then
    pm2 reload ecosystem.config.cjs --env production --update-env
    log "PM2 reloaded (zero-downtime)"
else
    pm2 start ecosystem.config.cjs --env production
    pm2 save
    log "PM2 started"
fi

# ── 6. Health check ───────────────────────────────────────────────────────────
step "6/6 Health check..."
sleep 5

MAX_RETRIES=12
RETRY=0
until curl -sf http://127.0.0.1:3000/api/health > /dev/null 2>&1; do
    RETRY=$((RETRY + 1))
    if [[ $RETRY -ge $MAX_RETRIES ]]; then
        warn "Health check failed after ${MAX_RETRIES} attempts"
        pm2 logs bmp-backend --lines 30 --nostream
        exit 1
    fi
    echo "  Waiting... ($RETRY/$MAX_RETRIES)"
    sleep 5
done

log "✅ Health check passed"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "✅ Backend deployment complete!"
echo "  Branch : $BRANCH"
echo "  Commit : $(git -C $MONOREPO_DIR log -1 --format='%h %s')"
pm2 status bmp-backend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
