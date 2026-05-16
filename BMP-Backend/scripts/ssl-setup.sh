#!/usr/bin/env bash
# =============================================================================
# BMP — SSL Certificate Setup (Let's Encrypt via Certbot)
# Gets certificates for BOTH the frontend domain and API subdomain.
#
# Run AFTER:
#   1. DNS A records point to this VPS IP
#   2. Nginx is running (vps-setup.sh completed)
#   3. App is deployed (deploy.sh completed)
#
# Usage:
#   bash scripts/ssl-setup.sh yourdomain.com api.yourdomain.com
# =============================================================================

set -euo pipefail

APP_DOMAIN="${1:-}"
API_DOMAIN="${2:-}"

if [[ -z "$APP_DOMAIN" || -z "$API_DOMAIN" ]]; then
    echo "Usage: bash ssl-setup.sh yourdomain.com api.yourdomain.com"
    exit 1
fi

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[SSL]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

ADMIN_EMAIL="admin@${APP_DOMAIN}"

# ── Verify DNS resolves to this server ───────────────────────────────────────
SERVER_IP=$(curl -sf https://api.ipify.org 2>/dev/null || curl -sf https://ifconfig.me 2>/dev/null || echo "unknown")
log "Server IP: $SERVER_IP"

for DOMAIN in "$APP_DOMAIN" "www.$APP_DOMAIN" "$API_DOMAIN"; do
    DNS_IP=$(dig +short "$DOMAIN" 2>/dev/null | tail -1 || echo "")
    if [[ -z "$DNS_IP" ]]; then
        warn "DNS not resolving for $DOMAIN — make sure A record is set to $SERVER_IP"
    elif [[ "$DNS_IP" != "$SERVER_IP" ]]; then
        warn "$DOMAIN resolves to $DNS_IP, expected $SERVER_IP"
        warn "SSL will fail if DNS is wrong. Continue only if DNS is propagating."
    else
        log "✅ DNS OK: $DOMAIN → $DNS_IP"
    fi
done

read -rp "Continue with SSL setup? (y/N): " CONFIRM
[[ "$CONFIRM" != "y" ]] && exit 0

# ── Update nginx config with actual domains ───────────────────────────────────
log "Updating Nginx config with actual domains..."
NGINX_CONF="/etc/nginx/sites-available/bmp"
if [[ -f "$NGINX_CONF" ]]; then
    sed -i "s/yourdomain\.com/$APP_DOMAIN/g"     "$NGINX_CONF"
    sed -i "s/api\.yourdomain\.com/$API_DOMAIN/g" "$NGINX_CONF"
    nginx -t && systemctl reload nginx
    log "Nginx config updated"
else
    err "Nginx config not found at $NGINX_CONF — run vps-setup.sh first"
fi

# ── Obtain certificates ───────────────────────────────────────────────────────
log "Obtaining SSL certificate for $APP_DOMAIN and www.$APP_DOMAIN..."
certbot --nginx \
    -d "$APP_DOMAIN" \
    -d "www.$APP_DOMAIN" \
    --non-interactive \
    --agree-tos \
    --email "$ADMIN_EMAIL" \
    --redirect

log "Obtaining SSL certificate for $API_DOMAIN..."
certbot --nginx \
    -d "$API_DOMAIN" \
    --non-interactive \
    --agree-tos \
    --email "$ADMIN_EMAIL" \
    --redirect

# ── Enable auto-renewal ───────────────────────────────────────────────────────
log "Enabling auto-renewal timer..."
systemctl enable --now certbot-renew.timer

# ── Test renewal ──────────────────────────────────────────────────────────────
log "Testing renewal (dry run)..."
certbot renew --dry-run

# ── Final nginx reload ────────────────────────────────────────────────────────
nginx -t && systemctl reload nginx

log "✅ SSL setup complete!"
echo ""
echo "  Frontend : https://$APP_DOMAIN"
echo "  API      : https://$API_DOMAIN/api/health"
echo ""
echo "  Test with:"
echo "    curl -I https://$APP_DOMAIN"
echo "    curl -sf https://$API_DOMAIN/api/health"
