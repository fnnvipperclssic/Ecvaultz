#!/bin/sh
set -e

# Wait for MariaDB to be ready
echo "Waiting for MariaDB..."
until mariadb-admin ping -h "${DB_HOST:-mariadb}" -u "${DB_USERNAME:-root}" -p"${DB_PASSWORD:-rootpassword}" --silent 2>/dev/null; do
    sleep 2
done
echo "MariaDB is ready."

# Wait for frontend build to complete (vite container creates manifest.json)
echo "Waiting for frontend build..."
until [ -f /var/www/public/build/manifest.json ]; do
    sleep 2
done
echo "Frontend build is ready."

exec "$@"
