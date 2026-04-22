#!/bin/bash
# First-time Let's Encrypt certificate setup for back.seqprojects.com
# Run this ONCE on the server before starting the stack normally.

set -e

DOMAIN="back.seqprojects.com"
EMAIL="Moosaabdullahi45@gmail.com"   # used for expiry notifications
COMPOSE_FILE="$(dirname "$0")/docker-compose.yml"

# ── 1. Create a temporary self-signed cert so nginx can start ─────────────────
echo ">>> Creating temporary self-signed cert so nginx can boot..."
docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
    -out    /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
    -subj '/CN=localhost'" certbot

# ── 2. Start nginx (and the rest of the stack) ────────────────────────────────
echo ">>> Starting services..."
docker compose -f "$COMPOSE_FILE" up -d nginx backend db

# ── 3. Obtain the real certificate via webroot ────────────────────────────────
echo ">>> Requesting Let's Encrypt certificate for $DOMAIN..."
docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN" certbot

# ── 4. Reload nginx to pick up the real cert ──────────────────────────────────
echo ">>> Reloading nginx..."
docker compose -f "$COMPOSE_FILE" exec nginx nginx -s reload

# ── 5. Start certbot renewal daemon ──────────────────────────────────────────
echo ">>> Starting certbot renewal daemon..."
docker compose -f "$COMPOSE_FILE" up -d certbot

echo ""
echo "Done! https://$DOMAIN is now live with a valid TLS certificate."
echo "Certbot will auto-renew every 12 hours when the cert is near expiry."
