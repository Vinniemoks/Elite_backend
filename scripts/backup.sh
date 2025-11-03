#!/bin/bash

# Database Backup Script for Elite Events Kenya
# Run this script daily via cron: 0 2 * * * /path/to/backup.sh

BACKUP_DIR="/var/backups/elite-backend"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="elite_events_kenya"
DB_USER="elite_admin"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup PostgreSQL database
echo "Starting database backup..."
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

if [ $? -eq 0 ]; then
    echo "Database backup completed: db_$DATE.sql.gz"
else
    echo "Database backup failed!"
    exit 1
fi

# Backup uploaded files (if stored locally)
# tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /path/to/uploads

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete
echo "Old backups cleaned up"

# Optional: Upload to S3
# aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://your-backup-bucket/

echo "Backup process completed successfully"
