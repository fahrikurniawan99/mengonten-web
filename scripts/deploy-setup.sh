#!/usr/bin/env bash
set -euo pipefail

DOMAIN="mengonten.tiroe.io"
APP_DIR="/opt/mengonten-web"

echo "=== Mengonten Web - VPS Initial Setup ==="

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker "$USER"
fi

# Install Docker Compose plugin if not present
if ! docker compose version &> /dev/null; then
    echo "Installing Docker Compose plugin..."
    apt-get update
    apt-get install -y docker-compose-plugin
fi

# Clone repository if not exists
if [ ! -d "$APP_DIR" ]; then
    git clone -b staging https://github.com/<your-username>/mengonten-web.git "$APP_DIR"
fi

cd "$APP_DIR"

# Pull and start containers
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# Install Nginx if not present
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    apt-get update
    apt-get install -y nginx
fi

# Copy Nginx config
cp nginx/mengonten-web.conf /etc/nginx/sites-available/mengonten-web

# Enable site
if [ ! -L /etc/nginx/sites-enabled/mengonten-web ]; then
    ln -s /etc/nginx/sites-available/mengonten-web /etc/nginx/sites-enabled/
fi

# Remove default site if present
if [ -L /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
fi

# Test and reload Nginx
nginx -t
systemctl reload nginx

# Install Certbot for SSL
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Obtain SSL certificate
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m admin@"$DOMAIN" --redirect

echo "=== Setup complete! https://$DOMAIN ==="
