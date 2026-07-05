#!/bin/bash
# Vyaktrix 2.0 - Hostinger Deployment Script
# Usage: bash deploy.sh

set -e

echo "🚀 Vyaktrix 2.0 Deployment Starting..."

# Configuration
DOMAIN="${DOMAIN:-yourdomain.com}"
APP_DIR="${APP_DIR:-/var/www/vyaktrix}"
DB_NAME="${DB_NAME:-vyaktrix}"
DB_USER="${DB_USER:-vyaktrix_user}"
DB_PASS="${DB_PASS:-$(openssl rand -base64 32)}"

echo "📦 Installing system dependencies..."
sudo apt update -y
sudo apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx postgresql postgresql-contrib redis-server git curl

echo "🔧 Setting up PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database exists"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || echo "User exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

echo "📂 Cloning application..."
sudo mkdir -p $APP_DIR
cd $APP_DIR

# If running from local, skip git clone and use uploaded files

echo "🐳 Starting Docker services..."
sudo docker-compose up -d --build

echo "⚙️ Setting up Nginx..."
sudo cp docker/nginx.conf /etc/nginx/sites-available/vyaktrix
sudo ln -sf /etc/nginx/sites-available/vyaktrix /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo "🔐 Setting up SSL..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || true

echo "📊 Running database migrations..."
sudo docker exec vyaktrix_backend_1 npm run db:migrate

echo "✅ Deployment Complete!"
echo "🌐 Website: https://$DOMAIN"
echo "📡 API: https://$DOMAIN/api"
echo "🗄️ Database: postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"
