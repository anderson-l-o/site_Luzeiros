#!/bin/sh
set -e
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install --production --no-audit --no-fund
fi
echo "Running seeders..."
node ./seeders/run-seeders.js || true
exec "$@"
