# Deployment Guide - Elite Events Kenya Backend

This guide covers deploying the Elite Events Kenya backend API to production.

## Prerequisites

- Ubuntu 20.04+ server
- Domain name configured (api.eliteeventskenya.com)
- SSL certificate (Let's Encrypt recommended)
- Node.js 18+ installed
- PostgreSQL 15+ installed
- Redis 7+ installed
- Nginx installed
- PM2 process manager

## Server Setup

### 1. Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install Node.js 18

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 3. Install PostgreSQL 15

```bash
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install -y postgresql-15
```

### 4. Install Redis

```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### 5. Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 6. Install PM2

```bash
sudo npm install -g pm2
```

## Database Setup

### 1. Create PostgreSQL Database

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE elite_events_kenya;
CREATE USER elite_admin WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE elite_events_kenya TO elite_admin;
\q
```

### 2. Configure PostgreSQL for Remote Access (if needed)

Edit `/etc/postgresql/15/main/postgresql.conf`:

```
listen_addresses = 'localhost'
```

Edit `/etc/postgresql/15/main/pg_hba.conf`:

```
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
```

Restart PostgreSQL:

```bash
sudo systemctl restart postgresql
```

## Application Deployment

### 1. Create Application User

```bash
sudo adduser --system --group --home /var/www/elite-backend elite
```

### 2. Clone Repository

```bash
sudo mkdir -p /var/www/elite-backend
sudo chown elite:elite /var/www/elite-backend
cd /var/www/elite-backend
sudo -u elite git clone <repository-url> .
```

### 3. Install Dependencies

```bash
cd /var/www/elite-backend
sudo -u elite npm ci --only=production
```

### 4. Configure Environment

```bash
sudo -u elite cp .env.example .env
sudo -u elite nano .env
```

Update with production values:

```env
NODE_ENV=production
PORT=5000
API_URL=https://api.eliteeventskenya.com
FRONTEND_URL=https://eliteeventskenya.com

DATABASE_URL=postgresql://elite_admin:your_password@localhost:5432/elite_events_kenya
REDIS_URL=redis://localhost:6379

JWT_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-secret>

# AWS S3
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
AWS_REGION=us-east-1
AWS_BUCKET_NAME=elite-events-uploads

# SendGrid
SENDGRID_API_KEY=<your-key>
FROM_EMAIL=noreply@eliteeventskenya.com

# Africa's Talking
AT_API_KEY=<your-key>
AT_USERNAME=<your-username>

# M-Pesa (Production)
MPESA_CONSUMER_KEY=<your-key>
MPESA_CONSUMER_SECRET=<your-secret>
MPESA_SHORTCODE=<your-shortcode>
MPESA_PASSKEY=<your-passkey>
MPESA_CALLBACK_URL=https://api.eliteeventskenya.com/api/payments/mpesa/callback

# Stripe (Production)
STRIPE_SECRET_KEY=sk_live_<your-key>
STRIPE_WEBHOOK_SECRET=whsec_<your-secret>

# PayPal (Production)
PAYPAL_CLIENT_ID=<your-id>
PAYPAL_CLIENT_SECRET=<your-secret>
PAYPAL_MODE=live
```

### 5. Run Database Migrations

```bash
cd /var/www/elite-backend
sudo -u elite npx prisma generate
sudo -u elite npx prisma migrate deploy
```

### 6. Start Application with PM2

```bash
cd /var/www/elite-backend
sudo -u elite pm2 start src/server.js --name elite-backend
sudo -u elite pm2 save
sudo pm2 startup systemd -u elite --hp /var/www/elite-backend
```

## Nginx Configuration

### 1. Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/elite-backend
```

Add configuration:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name api.eliteeventskenya.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.eliteeventskenya.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.eliteeventskenya.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.eliteeventskenya.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Logging
    access_log /var/log/nginx/elite-backend-access.log;
    error_log /var/log/nginx/elite-backend-error.log;

    # File Upload Size
    client_max_body_size 50M;

    # Proxy to Node.js Application
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket Support for Socket.io
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Enable Site and Test

```bash
sudo ln -s /etc/nginx/sites-available/elite-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL Certificate (Let's Encrypt)

### 1. Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obtain Certificate

```bash
sudo certbot --nginx -d api.eliteeventskenya.com
```

### 3. Auto-Renewal

Certbot automatically sets up renewal. Test it:

```bash
sudo certbot renew --dry-run
```

## Firewall Configuration

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Monitoring and Maintenance

### PM2 Monitoring

```bash
pm2 monit
pm2 logs elite-backend
pm2 status
```

### Database Backups

Create backup script `/var/www/elite-backend/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/elite-backend"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
pg_dump -U elite_admin elite_events_kenya | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete
```

Make executable and add to crontab:

```bash
chmod +x /var/www/elite-backend/backup.sh
sudo crontab -e
```

Add daily backup at 2 AM:

```
0 2 * * * /var/www/elite-backend/backup.sh
```

### Log Rotation

Create `/etc/logrotate.d/elite-backend`:

```
/var/log/nginx/elite-backend-*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```

## Deployment Updates

### 1. Pull Latest Code

```bash
cd /var/www/elite-backend
sudo -u elite git pull origin main
```

### 2. Install Dependencies

```bash
sudo -u elite npm ci --only=production
```

### 3. Run Migrations

```bash
sudo -u elite npx prisma migrate deploy
```

### 4. Restart Application

```bash
sudo -u elite pm2 restart elite-backend
```

## Health Checks

Check application health:

```bash
curl https://api.eliteeventskenya.com/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Troubleshooting

### Check Application Logs

```bash
pm2 logs elite-backend
```

### Check Nginx Logs

```bash
sudo tail -f /var/log/nginx/elite-backend-error.log
```

### Check Database Connection

```bash
sudo -u postgres psql -d elite_events_kenya -c "SELECT version();"
```

### Check Redis

```bash
redis-cli ping
```

### Restart Services

```bash
# Restart application
pm2 restart elite-backend

# Restart Nginx
sudo systemctl restart nginx

# Restart PostgreSQL
sudo systemctl restart postgresql

# Restart Redis
sudo systemctl restart redis-server
```

## Performance Optimization

### 1. Enable Gzip in Nginx

Already included in the application via compression middleware.

### 2. Database Connection Pooling

Configured in Prisma schema.

### 3. Redis Caching

Implemented in application services.

### 4. PM2 Cluster Mode

For multiple CPU cores:

```bash
pm2 start src/server.js --name elite-backend -i max
```

## Security Checklist

- [ ] SSL certificate installed and auto-renewal configured
- [ ] Firewall configured (UFW)
- [ ] Strong passwords for database
- [ ] Environment variables secured
- [ ] Regular security updates scheduled
- [ ] Database backups automated
- [ ] Log monitoring configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers enabled

## Support

For deployment issues:
- Check logs: `pm2 logs elite-backend`
- Review Nginx logs: `/var/log/nginx/`
- Contact DevOps team: devops@eliteeventskenya.com
