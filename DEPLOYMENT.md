# BMP — Production Deployment Guide
## Hostinger KVM 4 VPS (Arch Linux, Mumbai)

Monorepo: `https://github.com/pentasoftwareconsultancy/book-my-parcel`

---

## Architecture

```
Internet
    │
    ▼
Nginx (port 80/443)
    ├── yourdomain.com      → /var/www/bmp/BMP-FE/dist/     (static SPA)
    └── api.yourdomain.com  → localhost:3000                 (Node.js API)
                                    │
                                    ▼
                            PM2 (3 cluster workers)
                                    │
                                    ▼
                            PostgreSQL (local)
                            Redis (local)
```

---

## Step 1 — Point DNS

In your domain registrar / Hostinger DNS panel:

| Type | Name | Value |
|------|------|-------|
| A | `@` (or `yourdomain.com`) | `<VPS IP>` |
| A | `www` | `<VPS IP>` |
| A | `api` | `<VPS IP>` |

Wait for DNS propagation (5–30 minutes) before running SSL setup.

---

## Step 2 — Initial VPS Setup (run once)

SSH into the VPS as root:
```bash
ssh root@<VPS_IP>
```

Edit the config variables at the top of the script, then run:
```bash
# Download and run the setup script
curl -o vps-setup.sh https://raw.githubusercontent.com/pentasoftwareconsultancy/book-my-parcel/main/BMP-Backend/scripts/vps-setup.sh
# Edit config variables first:
vim vps-setup.sh
bash vps-setup.sh
```

**Save the DB credentials printed at the end.**

---

## Step 3 — Clone the Monorepo

```bash
su - bmp
git clone https://github.com/pentasoftwareconsultancy/book-my-parcel.git /var/www/bmp
```

---

## Step 4 — Configure Backend Environment

```bash
cp /var/www/bmp/BMP-Backend/.env.example /var/www/bmp/BMP-Backend/.env
vim /var/www/bmp/BMP-Backend/.env
```

Fill in ALL values. Key ones:
```bash
NODE_ENV=production
JWT_SECRET=<64-char hex — generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
DB_HOST=localhost
DB_NAME=bmp_production
DB_USER=bmp_db_user
DB_PASSWORD=<password from vps-setup.sh output>
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=https://yourdomain.com
DEFAULT_ADMIN_EMAIL=admin@yourdomain.com
DEFAULT_ADMIN_PASSWORD=<strong password>
DEFAULT_ADMIN_PHONE=<phone number>
```

Set file permissions:
```bash
chmod 600 /var/www/bmp/BMP-Backend/.env
```

---

## Step 5 — Configure Frontend Environment

```bash
cp /var/www/bmp/BMP-FE/.env.production /var/www/bmp/BMP-FE/.env.production.local
vim /var/www/bmp/BMP-FE/.env.production
```

Fill in:
```bash
VITE_API_URL=https://api.yourdomain.com/api
VITE_WS_URL=https://api.yourdomain.com
VITE_BASE_URL=https://api.yourdomain.com
VITE_GOOGLE_MAPS_API_KEY=<your key>
VITE_GEOAPIFY_KEY=<your key>
# ... other Google API keys
```

---

## Step 6 — Deploy Backend

```bash
su - bmp
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
bash /var/www/bmp/BMP-Backend/scripts/deploy.sh main
```

---

## Step 7 — Deploy Frontend

```bash
bash /var/www/bmp/BMP-Backend/scripts/deploy-frontend.sh main
```

---

## Step 8 — SSL Certificates

```bash
bash /var/www/bmp/BMP-Backend/scripts/ssl-setup.sh yourdomain.com api.yourdomain.com
```

---

## Step 9 — PM2 Startup on Boot

```bash
su - bmp
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
pm2 startup
# Run the command it outputs (starts with "sudo env PATH=...")
pm2 save
```

---

## Step 10 — Verify Everything

```bash
# Backend health
curl https://api.yourdomain.com/api/health

# Frontend
curl -I https://yourdomain.com

# PM2 status
pm2 status

# Nginx status
systemctl status nginx

# PostgreSQL
systemctl status postgresql

# Redis
redis-cli ping
```

---

## GitHub Actions Setup

See `GITHUB-SECRETS.md` for the complete list of secrets to add.

**CI/CD Flow:**
```
feature/* → testing → stage → main
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
            Backend deploy            Frontend deploy
            (PM2 reload)              (npm build + Nginx)
```

Both backend and frontend workflows trigger independently based on which
directory changed (`paths:` filter in each workflow).

---

## Rollback

```bash
# Backend rollback to previous commit
su - bmp
cd /var/www/bmp
git log --oneline -10          # find the commit to roll back to
git checkout <commit-hash>
bash BMP-Backend/scripts/deploy.sh

# Frontend rollback
git checkout <commit-hash>
bash BMP-Backend/scripts/deploy-frontend.sh
```

---

## Monitoring

```bash
# Live PM2 logs
pm2 logs bmp-backend --lines 100

# PM2 monitoring dashboard
pm2 monit

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log

# System resources
htop

# Disk usage
df -h

# PostgreSQL connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## Backup

```bash
# Manual DB backup
pg_dump -U bmp_db_user bmp_production | gzip > /var/backups/bmp/db_$(date +%Y%m%d_%H%M%S).sql.gz

# Set up automated daily backups (add to crontab as bmp user)
crontab -e
# Add:
# 0 2 * * * pg_dump -U bmp_db_user bmp_production | gzip > /var/backups/bmp/db_$(date +\%Y\%m\%d).sql.gz
# 0 4 * * 0 tar -czf /var/backups/bmp/uploads_$(date +\%Y\%m\%d).tar.gz /var/www/bmp/BMP-Backend/uploads/
```
