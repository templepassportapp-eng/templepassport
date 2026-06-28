#!/bin/bash
# One-time setup script for a fresh GCE e2-micro instance.
# Run as root (or with sudo) after creating the VM.
#
# Usage: sudo bash gce-setup.sh <GCP_PROJECT_ID>
#
# What it does:
#   - Installs Docker + Compose plugin
#   - Creates the app directory structure
#   - Creates the .env.prod template (fill in real secrets after)
#   - Creates the 'deploy' user for GitHub Actions SSH
#   - Configures Artifact Registry auth

set -euo pipefail

GCP_PROJECT_ID=${1:?Usage: bash gce-setup.sh <GCP_PROJECT_ID>}
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
echo "    GCP project: $GCP_PROJECT_ID"

echo "==> [5/6] Creating .env.prod template..."
ENV_FILE=$APP_DIR/.env.prod
if [ ! -f "$ENV_FILE" ]; then
  cat > "$ENV_FILE" << EOF
GCP_PROJECT_ID=$GCP_PROJECT_ID
IMAGE_TAG=latest

# PostgreSQL — use a strong random password
DB_PASSWORD=CHANGE_ME_STRONG_PASSWORD

# JWT signing key — must be at least 32 characters
JWT_SECRET=CHANGE_ME_MUST_BE_32_CHARS_OR_MORE!
EOF
  chmod 600 "$ENV_FILE"
  chown $DEPLOY_USER:$DEPLOY_USER "$ENV_FILE"
  echo "    Created $ENV_FILE — fill in real secrets before first deploy:"
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
echo " GCE setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Fill in production secrets:"
echo "   sudo nano $APP_DIR/.env.prod"
echo ""
echo "2. Add the GitHub Actions deploy key:"
echo "   (generate with: ssh-keygen -t ed25519 -C 'github-actions-deploy')"
echo "   sudo nano /home/$DEPLOY_USER/.ssh/authorized_keys"
echo ""
echo "3. In GCP Console, create the Artifact Registry repository:"
echo "   gcloud artifacts repositories create temple-passport \\"
echo "     --repository-format=docker \\"
echo "     --location=asia-south1 \\"
echo "     --project=$GCP_PROJECT_ID"
echo ""
echo "4. Grant the GitHub Actions service account these roles:"
echo "   - Artifact Registry Writer (roles/artifactregistry.writer)"
echo "   - Compute Instance Admin (roles/compute.instanceAdmin) — if using deploy from GCP"
echo ""
echo "5. Add GitHub Secrets to your repository:"
echo "   GCP_PROJECT_ID  = $GCP_PROJECT_ID"
echo "   GCP_SA_KEY      = <service account JSON key>"
echo "   GCE_HOST        = <VM external IP>"
echo "   GCE_USER        = $DEPLOY_USER"
echo "   GCE_SSH_KEY     = <private SSH key matching the authorized_keys above>"
echo "   DB_PASSWORD     = <same as in .env.prod>"
echo "   JWT_SECRET      = <same as in .env.prod>"
echo ""
echo "6. Push to main to trigger the first deployment."
