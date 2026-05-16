#!/usr/bin/env bash
# =============================================================================
# BMP — PostgreSQL Backup Script (Monorepo)
# Runs daily via cron. Keeps 7 daily + 4 weekly backups.
#
# Install cron job (as bmp user):
#   crontab -e
#   0 2 * * * /var/www/bmp/BMP-Backend/scripts/backup.sh >> /var/www/bmp/BMP-Backend/logs/backup.log 2>&1
#
# Also backs up uploads directory weekly.
# =============================================================================

set -euo pipefail

MONOREPO_DIR="/var/www/bmp"
BACKEND_DIR="$MONOREPO_DIR/BMP-Backend"
DB_NAME="bmp_production"
DB_USER="bmp_db_user"
BACKUP_DIR="$BACKEND_DIR/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DAY_OF_WEEK=$(date +%u)   # 1=Mon … 7=Sun
KEEP_DAILY=7
KEEP_WEEKLY=4

mkdir -p "$BACKUP_DIR"/{daily,weekly,uploads}

# ── Database backup ───────────────────────────────────────────────────────────
BACKUP_FILE="$BACKUP_DIR/daily/bmp_${DATE}.sql.gz"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting DB backup: $BACKUP_FILE"

sudo -u postgres pg_dump "$DB_NAME" | gzip > "$BACKUP_FILE"

SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] DB backup complete: $SIZE"

# ── Weekly: copy DB backup + backup uploads ───────────────────────────────────
if [[ "$DAY_OF_WEEK" == "7" ]]; then
    cp "$BACKUP_FILE" "$BACKUP_DIR/weekly/bmp_weekly_${DATE}.sql.gz"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Weekly DB backup saved"

    # Backup uploads directory (profiles, parcels, proofs — NOT kyc for size)
    UPLOADS_BACKUP="$BACKUP_DIR/uploads/uploads_${DATE}.tar.gz"
    tar -czf "$UPLOADS_BACKUP" \
        "$BACKEND_DIR/uploads/profiles" \
        "$BACKEND_DIR/uploads/parcels" \
        "$BACKEND_DIR/uploads/proofs" \
        2>/dev/null || true
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Uploads backup saved: $(du -sh $UPLOADS_BACKUP | cut -f1)"
fi

# ── Prune old backups ─────────────────────────────────────────────────────────
find "$BACKUP_DIR/daily"   -name "*.sql.gz"  -mtime "+${KEEP_DAILY}"          -delete
find "$BACKUP_DIR/weekly"  -name "*.sql.gz"  -mtime "+$((KEEP_WEEKLY * 7))"   -delete
find "$BACKUP_DIR/uploads" -name "*.tar.gz"  -mtime "+$((KEEP_WEEKLY * 7))"   -delete

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Cleanup done. Recent backups:"
ls -lh "$BACKUP_DIR/daily/" | tail -5
