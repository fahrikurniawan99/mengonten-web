#!/usr/bin/env bash
set -euo pipefail

cd /opt/mengonten-web

echo "Deploying latest image..."
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --remove-orphans
docker image prune -f

echo "Deploy complete!"
