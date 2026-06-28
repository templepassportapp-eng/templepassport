#!/bin/bash
# Creates or updates an admin user in the production database.
# Run on the GCE VM after first deploy (or any time you need to reset a password).
#
# Usage: bash /opt/temple-passport/scripts/create-admin.sh <username>

set -euo pipefail

USERNAME=${1:?Usage: create-admin.sh <username>}
APP_DIR=/opt/temple-passport

echo -n "Password for '$USERNAME': "
read -rs PASSWORD
echo ""
echo -n "Confirm password: "
read -rs PASSWORD2
echo ""

if [ "$PASSWORD" != "$PASSWORD2" ]; then
  echo "ERROR: Passwords do not match."
  exit 1
fi

if [ ${#PASSWORD} -lt 10 ]; then
  echo "ERROR: Password must be at least 10 characters."
  exit 1
fi

# Install python3-bcrypt if not present
if ! python3 -c "import bcrypt" 2>/dev/null; then
  echo "Installing python3-bcrypt..."
  apt-get install -y -q python3-bcrypt
fi

HASH=$(python3 - "$PASSWORD" <<'EOF'
import bcrypt, sys
pw = sys.argv[1].encode()
hashed = bcrypt.hashpw(pw, bcrypt.gensalt(10))
print(hashed.decode())
EOF
)

# Escape single quotes in username for SQL safety
USERNAME_SQL=$(printf "%s" "$USERNAME" | sed "s/'/''/g")

docker compose --env-file "$APP_DIR/.env.prod" \
  -f "$APP_DIR/docker-compose.prod.yml" exec -T postgres \
  psql -U templepassport -d templepassport -c \
  "INSERT INTO admin_users (username, password_hash, name)
   VALUES ('$USERNAME_SQL', '$HASH', '$USERNAME_SQL')
   ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;"

echo ""
echo "Admin user '$USERNAME' created. Log in at https://templepassport.in/admin/login"
