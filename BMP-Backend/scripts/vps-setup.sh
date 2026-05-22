#!/usr/bin/env bash
# =============================================================================
# BMP — Hostinger VPS KVM 4 Initial Setup Script (MONOREPO)
# OS: Arch Linux | 4 CPU | 16 GB RAM | 200 GB Disk | Mumbai
#
# Monorepo: https://github.com/pentasoftwareconsultancy/book-my-parcel
#   BMP-Backend/ → Node.js API  → served at api.yourdomain.com
#   BMP-FE/      → React SPA    → served at yourdomain.com
#
# Run as root on a fresh VPS:
#   bash vps-setup.sh
# =============================================================================

set -euo pipefail

# ── Config — EDIT THESE before running ───────────────────────────────────────
APP_USER="bmp"
MONOREPO_DIR="/var/www/bmp"
BACKEND_DIR="$MONOREPO_DIR/BMP-Backend"
FRONTEND_DIR="$MONOREPO_DIR/BMP-FE"
FRONTEND_DIST="$MONOREPO_DIR/BMP-FE/dist"
API_DOMAIN="api.bookmyparcel.co.in"
APP_DOMAIN="bookmyparcel.co.in"
DB_NAME="book_my_parcel"
DB_USER="postgres"
DB_PASSWORD="$(openssl rand -hex 24)"
NODE_VERSION="20"
# ─────────────────────────────────────────────────────────────────────────────

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()  { echo -e "${GREEN}[SETUP]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC}  $1"; }
step() { echo -e "${BLUE}[STEP]${NC}  $1"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

[[ $EUID -ne 0 ]] && err "Run as root: sudo bash vps-setup.sh"

log "Starting BMP monorepo VPS setup on Arch Linux..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── STEP 1: System update + packages ─────────────────────────────────────────
step "1/12 Updating system packages..."
pacman -Syu --noconfirm
pacman -S --noconfirm \
    base-devel git curl wget unzip rsync \
    nginx certbot certbot-nginx \
    postgresql redis \
    ufw fail2ban \
    htop iotop nethogs vnstat tmux vim \
    logrotate

log "System packages installed"

# ── STEP 2: Create app user ───────────────────────────────────────────────────
step "2/12 Creating app user: $APP_USER"
if ! id "$APP_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$APP_USER"
    log "User $APP_USER created"
else
    log "User $APP_USER already exists"
fi

# ── STEP 3: Node.js 20 via nvm ────────────────────────────────────────────────
step "3/12 Installing Node.js $NODE_VERSION via nvm..."
sudo -u "$APP_USER" bash -c "
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR=\"\$HOME/.nvm\"
    [ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\"
    nvm install $NODE_VERSION
    nvm alias default $NODE_VERSION
    nvm use default
    echo \"Node: \$(node --version)\"
    echo \"npm:  \$(npm --version)\"
"
log "Node.js $NODE_VERSION installed"

# ── STEP 4: PM2 ───────────────────────────────────────────────────────────────
step "4/12 Installing PM2..."
sudo -u "$APP_USER" bash -c "
    export NVM_DIR=\"\$HOME/.nvm\"
    [ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\"
    npm install -g pm2
    pm2 --version
"
log "PM2 installed"

# ── STEP 5: PostgreSQL ────────────────────────────────────────────────────────
step "5/12 Configuring PostgreSQL..."
systemctl enable --now postgresql

if [[ ! -d /var/lib/postgres/data/base ]]; then
    sudo -u postgres initdb -D /var/lib/postgres/data
    systemctl restart postgresql
fi

sudo -u postgres psql <<SQL
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
        CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASSWORD';
    END IF;
END
\$\$;

SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
SQL

# Performance tuning for 16 GB RAM
PG_CONF="/var/lib/postgres/data/postgresql.conf"
cat >> "$PG_CONF" <<PGCONF

# ── BMP Performance Tuning (16 GB RAM, SSD) ──────────────────────────────────
shared_buffers = 4GB
effective_cache_size = 12GB
work_mem = 64MB
maintenance_work_mem = 1GB
max_connections = 100
wal_buffers = 64MB
checkpoint_completion_target = 0.9
random_page_cost = 1.1
effective_io_concurrency = 200
PGCONF

systemctl restart postgresql
log "PostgreSQL configured (DB: $DB_NAME, User: $DB_USER)"

# ── STEP 6: Redis ─────────────────────────────────────────────────────────────
step "6/12 Configuring Redis..."
REDIS_CONF="/etc/redis/redis.conf"
sed -i 's/^# maxmemory .*/maxmemory 2gb/'                    "$REDIS_CONF"
sed -i 's/^# maxmemory-policy .*/maxmemory-policy allkeys-lru/' "$REDIS_CONF"
sed -i 's/^bind .*/bind 127.0.0.1 ::1/'                      "$REDIS_CONF"
sed -i 's/^protected-mode yes/protected-mode no/'            "$REDIS_CONF"
systemctl enable --now redis
log "Redis configured (maxmemory 2 GB, localhost only)"

# ── STEP 7: Swap file (4 GB) ──────────────────────────────────────────────────
step "7/12 Creating 4 GB swap file..."
if [[ ! -f /swapfile ]]; then
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    log "Swap file created and enabled"
else
    log "Swap file already exists"
fi

# ── STEP 8: Directory structure ───────────────────────────────────────────────
step "8/12 Creating directory structure..."
mkdir -p "$MONOREPO_DIR"
mkdir -p "$BACKEND_DIR/uploads"/{profiles,kyc,parcels,proofs}
mkdir -p "$BACKEND_DIR/logs"
mkdir -p "$FRONTEND_DIST"
mkdir -p /var/www/certbot
chown -R "$APP_USER:$APP_USER" "$MONOREPO_DIR"
chmod -R 755 "$MONOREPO_DIR"
# KYC uploads: restricted permissions — not world-readable
chmod 750 "$BACKEND_DIR/uploads/kyc"
log "Directory structure created"

# ── STEP 9: Nginx ─────────────────────────────────────────────────────────────
step "9/12 Configuring Nginx..."
mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled

# Add sites-enabled include to nginx.conf if not already there
if ! grep -q "sites-enabled" /etc/nginx/nginx.conf; then
    sed -i '/http {/a\    include /etc/nginx/sites-enabled/*;' /etc/nginx/nginx.conf
fi

# Write the full Nginx config for both backend API and frontend SPA
cat > /etc/nginx/sites-available/bmp <<NGINXCONF
# =============================================================================
# BMP — Nginx config for monorepo deployment
# API:      https://api.yourdomain.com  → Node.js on port 3000
# Frontend: https://yourdomain.com      → Static files from BMP-FE/dist
# =============================================================================

# Rate limiting zones
limit_req_zone \$binary_remote_addr zone=api_general:10m rate=30r/s;
limit_req_zone \$binary_remote_addr zone=api_auth:10m    rate=5r/m;
limit_conn_zone \$binary_remote_addr zone=conn_limit:10m;

# Backend upstream
upstream bmp_backend {
    least_conn;
    server 127.0.0.1:3000;
    keepalive 64;
}

# ── HTTP → HTTPS redirect (both domains) ─────────────────────────────────────
server {
    listen 80;
    listen [::]:80;
    server_name $API_DOMAIN $APP_DOMAIN www.$APP_DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    location / {
        return 301 https://\$host\$request_uri;
    }
}

# ── Frontend SPA — yourdomain.com ─────────────────────────────────────────────
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $APP_DOMAIN www.$APP_DOMAIN;

    ssl_certificate     /etc/letsencrypt/live/$APP_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$APP_DOMAIN/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    root  $FRONTEND_DIST;
    index index.html;

    add_header X-Frame-Options           "SAMEORIGIN"                          always;
    add_header X-Content-Type-Options    "nosniff"                             always;
    add_header Referrer-Policy           "strict-origin-when-cross-origin"     always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # SPA routing — all paths serve index.html
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Vite-generated assets have content hashes — cache aggressively
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Never cache index.html — it must always be fresh
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        expires 0;
    }
}

# ── Backend API — api.yourdomain.com ─────────────────────────────────────────
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $API_DOMAIN;

    ssl_certificate     /etc/letsencrypt/live/$API_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$API_DOMAIN/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    add_header X-Frame-Options           "SAMEORIGIN"                          always;
    add_header X-Content-Type-Options    "nosniff"                             always;
    add_header X-XSS-Protection          "1; mode=block"                       always;
    add_header Referrer-Policy           "strict-origin-when-cross-origin"     always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Permissions-Policy        "geolocation=(self), camera=(), microphone=()" always;

    client_max_body_size  15m;
    client_body_timeout   30s;
    client_header_timeout 10s;
    limit_conn conn_limit 20;

    gzip on; gzip_vary on; gzip_proxied any; gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/javascript;

    # Block sensitive paths
    location ~ /\.(env|git|htaccess|gitignore) { deny all; return 404; }

    # Block direct KYC document access — served via authenticated API only
    location /uploads/kyc/ { deny all; return 403; }

    # Non-sensitive uploads served directly by Nginx
    location /uploads/profiles/ {
        alias $BACKEND_DIR/uploads/profiles/;
        expires 30d; add_header Cache-Control "public, immutable"; access_log off;
    }
    location /uploads/parcels/ {
        alias $BACKEND_DIR/uploads/parcels/;
        expires 30d; add_header Cache-Control "public, immutable"; access_log off;
    }
    location /uploads/proofs/ {
        alias $BACKEND_DIR/uploads/proofs/;
        expires 30d; add_header Cache-Control "public, immutable"; access_log off;
    }

    # WebSocket (Socket.IO)
    location /socket.io/ {
        proxy_pass          http://bmp_backend;
        proxy_http_version  1.1;
        proxy_set_header    Upgrade    \$http_upgrade;
        proxy_set_header    Connection "upgrade";
        proxy_set_header    Host       \$host;
        proxy_set_header    X-Real-IP  \$remote_addr;
        proxy_set_header    X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header    X-Forwarded-Proto \$scheme;
        proxy_read_timeout  3600s;
        proxy_send_timeout  3600s;
    }

    # Auth endpoints — strict rate limit
    location ~ ^/api(/v1)?/auth/(login|signup|request-otp|verify-otp|forgot-password) {
        limit_req  zone=api_auth burst=10 nodelay;
        limit_req_status 429;
        proxy_pass         http://bmp_backend;
        proxy_http_version 1.1;
        proxy_set_header   Connection        "";
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_read_timeout 30s;
    }

    # Health check — no logging, no rate limit
    location = /api/health {
        proxy_pass http://bmp_backend;
        access_log off;
    }

    # General API
    location / {
        limit_req  zone=api_general burst=50 nodelay;
        limit_req_status 429;
        proxy_pass         http://bmp_backend;
        proxy_http_version 1.1;
        proxy_set_header   Connection        "";
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
        proxy_buffering on; proxy_buffer_size 4k; proxy_buffers 8 4k;
    }
}
NGINXCONF

ln -sf /etc/nginx/sites-available/bmp /etc/nginx/sites-enabled/bmp
nginx -t && systemctl enable --now nginx
log "Nginx configured for both API and frontend"

# ── STEP 10: Firewall ─────────────────────────────────────────────────────────
step "10/12 Configuring firewall (UFW)..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny 3000/tcp   # Block direct Node.js access — only Nginx should reach it
ufw deny 5432/tcp   # Block direct PostgreSQL access
ufw deny 6379/tcp   # Block direct Redis access
ufw --force enable
log "Firewall active: 80, 443, SSH open; 3000, 5432, 6379 blocked"

# ── STEP 11: Fail2Ban ─────────────────────────────────────────────────────────
step "11/12 Configuring Fail2Ban..."
cat > /etc/fail2ban/jail.local <<'FAIL2BAN'
[DEFAULT]
bantime  = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port    = ssh
logpath = %(sshd_log)s

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled  = true
filter   = nginx-limit-req
logpath  = /var/log/nginx/error.log
maxretry = 10
FAIL2BAN

systemctl enable --now fail2ban
log "Fail2Ban configured"

# ── STEP 12: Log rotation ─────────────────────────────────────────────────────
step "12/12 Setting up log rotation..."
cat > /etc/logrotate.d/bmp <<'LOGROTATE'
/var/www/bmp/BMP-Backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    sharedscripts
    postrotate
        su bmp -c "pm2 reloadLogs" 2>/dev/null || true
    endscript
}
LOGROTATE

# ── PM2 startup on boot ───────────────────────────────────────────────────────
log "Configuring PM2 startup on boot..."
sudo -u "$APP_USER" bash -c "
    export NVM_DIR=\"\$HOME/.nvm\"
    [ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\"
    pm2 startup systemd -u $APP_USER --hp /home/$APP_USER
" | grep "sudo" | bash || warn "Run the pm2 startup command manually if shown above"

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "✅ VPS setup complete!"
echo ""
echo "  Monorepo dir  : $MONOREPO_DIR"
echo "  Backend dir   : $BACKEND_DIR"
echo "  Frontend dist : $FRONTEND_DIST"
echo "  App user      : $APP_USER"
echo "  Node.js       : v$NODE_VERSION (via nvm)"
echo "  PostgreSQL    : running (tuned for 16 GB RAM)"
echo "  Redis         : running (maxmemory 2 GB)"
echo "  Nginx         : running"
echo "  Firewall      : active"
echo "  Fail2Ban      : active"
echo "  Swap          : 4 GB"
echo ""
echo "  ⚠️  SAVE THESE CREDENTIALS NOW:"
echo "  DB Name     : $DB_NAME"
echo "  DB User     : $DB_USER"
echo "  DB Password : $DB_PASSWORD"
echo ""
echo "  Next steps:"
echo "  1. Point DNS A records:"
echo "       $APP_DOMAIN     → <your VPS IP>"
echo "       $API_DOMAIN     → <your VPS IP>"
echo "  2. Clone monorepo:  git clone https://github.com/pentasoftwareconsultancy/book-my-parcel.git $MONOREPO_DIR"
echo "  3. Create .env:     cp $BACKEND_DIR/.env.example $BACKEND_DIR/.env && vim $BACKEND_DIR/.env"
echo "  4. Deploy backend:  bash $BACKEND_DIR/scripts/deploy.sh main"
echo "  5. Build frontend:  bash $BACKEND_DIR/scripts/deploy-frontend.sh main"
echo "  6. Get SSL certs:   bash $BACKEND_DIR/scripts/ssl-setup.sh $APP_DOMAIN $API_DOMAIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
