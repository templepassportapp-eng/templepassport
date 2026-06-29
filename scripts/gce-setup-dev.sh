#!/bin/bash
# One-time setup for the free-tier GCE e2-micro dev VM.
# Run as root after creating the VM in us-central1 (free tier region).
#
# Usage: sudo bash gce-setup-dev.sh <GCP_PROJECT_ID>
#
# Differences from gce-setup.sh (prod):
#   - Targets the dev environment (docker-compose.dev.yml, nginx.dev.conf)
#   - Uses .env.dev instead of .env.prod
#   - No production hardening (UFW rules are the same, but no strict resource limits)

set -euo pipefail

GCP_PROJECT_ID=${1:?Usage: bash gce-setup-dev.sh <GCP_PROJECT_ID>}
APP_DIR=/opt/temple-passport
DEPLOY_USER=deploy

echo "==> [1/6] Installing Docker..."
apt-get update -q
apt-get install -y -q ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update -q
apt-get install -y -q docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl enable docker
systemctl start docker
echo "    Docker $(docker --version) installed."

echo "==> [2/6] Creating app directory structure..."
mkdir -p $APP_DIR/nginx
mkdir -p $APP_DIR/homepage
mkdir -p $APP_DIR/admin-dist
mkdir -p $APP_DIR/scripts
mkdir -p $APP_DIR/certbot/conf
mkdir -p $APP_DIR/certbot/www
mkdir -p /data/postgres
chmod 700 /data/postgres
echo "    Directories created."

echo "==> [3/6] Creating deploy user..."
if ! id "$DEPLOY_USER" &>/dev/null; then
  useradd --system --shell /bin/bash --create-home $DEPLOY_USER
fi
usermod -aG docker $DEPLOY_USER
mkdir -p /home/$DEPLOY_USER/.ssh
touch /home/$DEPLOY_USER/.ssh/authorized_keys
chmod 700 /home/$DEPLOY_USER/.ssh
chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys
chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh
chown -R $DEPLOY_USER:$DEPLOY_USER $APP_DIR
echo "    User '$DEPLOY_USER' created. Add GitHub Actions SSH public key to:"
echo "    /home/$DEPLOY_USER/.ssh/authorized_keys"

echo "==> [4/6] Configuring gcloud for '$DEPLOY_USER'..."
sudo -u $DEPLOY_USER gcloud auth configure-docker asia-south1-docker.pkg.dev --quiet || \
  echo "    Warning: gcloud config failed — run manually as $DEPLOY_USER after VM setup."

echo "==> [5/6] Creating .env.dev template..."
ENV_FILE=$APP_DIR/.env.dev
if [ ! -f "$ENV_FILE" ]; then
  cat > "$ENV_FILE" << EOF
GCP_PROJECT_ID=$GCP_PROJECT_ID
IMAGE_TAG=dev

DB_PASSWORD=CHANGE_ME_DEV_PASSWORD

JWT_SECRET=CHANGE_ME_DEV_SECRET_32_CHARS_MIN!
EOF
  chmod 600 "$ENV_FILE"
  chown $DEPLOY_USER:$DEPLOY_USER "$ENV_FILE"
  echo "    Created $ENV_FILE — fill in secrets before first deploy:"
  echo "    sudo nano $ENV_FILE"
else
  echo "    $ENV_FILE already exists, skipping."
fi

echo "==> [6/6] Opening firewall ports (if UFW is active)..."
if command -v ufw &>/dev/null && ufw status | grep -q "Status: active"; then
  ufw allow 22/tcp
  ufw allow 80/tcp
  ufw allow 443/tcp
fi

echo ""
echo "=========================================="
echo " Dev VM setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Fill in dev secrets:"
echo "   sudo nano $APP_DIR/.env.dev"
echo ""
echo "2. Add the GitHub Actions deploy key:"
echo "   sudo nano /home/$DEPLOY_USER/.ssh/authorized_keys"
echo ""
echo "3. Add a DNS A record:  dev.templepassport.in → this VM's external IP"
echo ""
echo "4. Add GitHub Secrets:"
echo "   DEV_GCE_HOST    = <this VM's external IP>"
echo "   DEV_GCE_USER    = $DEPLOY_USER"
echo "   DEV_GCE_SSH_KEY = <private SSH key>"
echo ""
echo "5. Get SSL cert (after DNS propagates):"
echo "   docker run --rm -v $APP_DIR/certbot/conf:/etc/letsencrypt \\"
echo "     -p 80:80 certbot/certbot certonly --standalone \\"
echo "     --email your@email.com --agree-tos --no-eff-email \\"
echo "     -d dev.templepassport.in"
echo ""
echo "6. Push to the dev branch to trigger first deployment."
