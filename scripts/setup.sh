#! /bin/bash

cd "$(dirname "$BASH_SOURCE[0]")"

if ! command -v pnpm >/dev/null 2>&1; then
    echo "pnpm not found, make sure to install it first"
    exit 1
else
    echo "pnpm found"
fi

if ! command -v nx >/dev/null 2>&1; then
    echo "nx not found in path, I recommend installing it with 'pnpm i -g nx' if you will be doing development"
fi

cat <<EOF >../.env
ENVIRONMENT=development
EOF

pnpm i
pnpm nx sync
pnpm nx setup environments
chmod +x ./create-local-db.sh
./create-local-db.sh
pnpm nx migrate:run inventory-db-utils
