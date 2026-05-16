# BMP — Hostinger VPS Deployment Guide (Monorepo)

**Monorepo:** `pentasoftwareconsultancy/book-my-parcel`  
**Server:** Hostinger KVM 4 | Arch Linux | 4 CPU | 16 GB RAM | 200 GB Disk | Mumbai

> **Full deployment guide:** See `DEPLOYMENT.md` in the monorepo root.  
> This file is a quick-reference cheat sheet for the VPS.

---

## Architecture

```
Internet
    │
    ▼
Nginx (port 80/443)
    ├── yourdomain.com      → /var/www/bmp/BMP-FE/dist/   (React SPA)
    └── api.yourdomain.com  → localhost:3000               (Node.js API)
                                    │
                                    ▼
                            PM2 (3 cluster workers)
                                    │
                            PostgreSQL + Redis (local)
```

---

## Directory Structure on VPS

```
/var/www/bmp/                    ← monorepo root
├── BMP-Backend/                 ← Node.js API
│   ├── .env                     ← production env (chmod 600)
│   ├── ecosystem.config.cjs     ← PM2 config
│   ├── uploads/                 ← user uploads
│   │   ├── profiles/
│   │   ├── kyc/                 ← restricted (chmod 750)
│   │   ├── parcels/
│   │   └── proofs/
│   └── logs/
└── BMP-FE/
    └── dist/                    ← built React app (served by Nginx)
```

---

## Quick Commands

```bash
# Deploy backend
bash /var/www/bmp/BMP-Backend/scripts/deploy.sh main

# Deploy frontend
bash /var/www/bmp/BMP-Backend/scripts/deploy-frontend.sh main

# PM2 status
pm2 status

# Live logs
pm2 logs bmp-backend --lines 100

# Zero-downtime reload
pm2 reload /var/www/bmp/BMP-Backend/ecosystem.config.cjs --env production --update-env

# Health check
curl http://127.0.0.1:3000/api/health

# Nginx
nginx -t && systemctl reload nginx

# PostgreSQL
systemctl status postgresql
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"

# Redis
redis-cli ping
redis-cli info memory

# Disk / Memory
df -h && free -h
```

---

## Initial Setup (run once on fresh VPS)

```bash
# 1. SSH in as root
ssh root@<VPS_IP>

# 2. Run setup script
bash <(curl -s https://raw.githubusercontent.com/pentasoftwareconsultancy/book-my-parcel/main/BMP-Backend/scripts/vps-setup.sh)

# 3. Clone monorepo
su - bmp
git clone https://github.com/pentasoftwareconsultancy/book-my-parcel.git /var/www/bmp

# 4. Configure backend env
cp /var/www/bmp/BMP-Backend/.env.example /var/www/bmp/BMP-Backend/.env
vim /var/www/bmp/BMP-Backend/.env
chmod 600 /var/www/bmp/BMP-Backend/.env

# 5. Configure frontend env
vim /var/www/bmp/BMP-FE/.env.production

# 6. Deploy
bash /var/www/bmp/BMP-Backend/scripts/deploy.sh main
bash /var/www/bmp/BMP-Backend/scripts/deploy-frontend.sh main

# 7. SSL (after DNS is pointing to this VPS)
bash /var/www/bmp/BMP-Backend/scripts/ssl-setup.sh yourdomain.com api.yourdomain.com

# 8. PM2 startup on boot
pm2 startup && pm2 save
```

---

## Resource Allocation (KVM 4)

| Resource | Total | Allocation |
|----------|-------|------------|
| CPU | 4 cores | 3 PM2 workers + 1 for DB/Redis/OS |
| RAM | 16 GB | 3×2GB Node + 2GB Redis + 2GB Postgres + 2GB OS + 4GB headroom |
| Swap | 4 GB | Created by vps-setup.sh |
| Disk | 200 GB | OS ~5GB, App ~1GB, DB ~10GB, Uploads ~50GB, Backups ~20GB |

---

## Troubleshooting

**502 Bad Gateway:**
```bash
pm2 status
curl http://127.0.0.1:3000/api/health
nginx -t
```

**App won't start:**
```bash
pm2 logs bmp-backend --lines 50 --nostream
# Check .env exists and NODE_ENV=production
```

**Database connection refused:**
```bash
systemctl status postgresql
# Use DB_HOST=127.0.0.1 (not 'localhost') in .env
```

**SSL expired:**
```bash
certbot renew && systemctl reload nginx
```
