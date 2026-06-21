#!/bin/sh
set -e

echo "========================================"
echo "  Ecvaultz - Docker Setup"
echo "========================================"

# Create .env from environment variables if .env doesn't exist
if [ ! -f /var/www/.env ]; then
    echo "[0/4] Creating .env from environment..."
    cat > /var/www/.env << EOF
APP_NAME="${APP_NAME:-Ecvaultz}"
APP_ENV="${APP_ENV:-production}"
APP_DEBUG="${APP_DEBUG:-false}"
APP_URL="${APP_URL:-http://localhost:8080}"
APP_KEY="${APP_KEY:-}"
ASSET_URL="${ASSET_URL:-}"

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=${DB_CONNECTION:-mariadb}
DB_HOST=${DB_HOST:-db}
DB_PORT=${DB_PORT:-3306}
DB_DATABASE=${DB_DATABASE:-ecvaultz}
DB_USERNAME=${DB_USERNAME:-ecvaultz}
DB_PASSWORD=${DB_PASSWORD:-ecvaultz_secret}

REDIS_HOST=${REDIS_HOST:-redis}
REDIS_PASSWORD="${REDIS_PASSWORD:-}"
REDIS_PORT=${REDIS_PORT:-6379}

MAIL_MAILER=${MAIL_MAILER:-smtp}
MAIL_HOST=${MAIL_HOST:-mailpit}
MAIL_PORT=${MAIL_PORT:-1025}
MAIL_USERNAME="${MAIL_USERNAME:-}"
MAIL_PASSWORD="${MAIL_PASSWORD:-}"
MAIL_ENCRYPTION="${MAIL_ENCRYPTION:-}"
MAIL_FROM_ADDRESS="${MAIL_FROM_ADDRESS:-noreply@ecvaultz.test}"
MAIL_FROM_NAME="${APP_NAME:-Ecvaultz}"

SESSION_DRIVER=${SESSION_DRIVER:-database}
SESSION_LIFETIME=30
SESSION_SECURE_COOKIE=false
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax

CACHE_DRIVER=${CACHE_DRIVER:-redis}
FILESYSTEM_DISK=${FILESYSTEM_DISK:-private}
QUEUE_CONNECTION=${QUEUE_CONNECTION:-database}

CLAMAV_SOCKET=unix:///var/run/clamav/clamd.ctl
SCAN_UPLOADS=${SCAN_UPLOADS:-false}

MAX_UPLOAD_SIZE=52428800
ALLOWED_EXTENSIONS=pdf,docx,xlsx,jpg,png,7z
UPLOAD_RATE_LIMIT=10
DOWNLOAD_RATE_LIMIT=20
RESET_REQUEST_LIMIT=3

TWO_FACTOR_REQUIRED=${TWO_FACTOR_REQUIRED:-false}
TWO_FACTOR_ISSUER=Ecvaultz
RECOVERY_CODES_COUNT=8

PASSWORD_MIN_LENGTH=12
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_NUMERIC=true
PASSWORD_REQUIRE_SYMBOL=true

SOFT_DELETE_RETENTION_DAYS=30
MAX_BULK_DELETE=100
CONFIRMATION_BULK_DELETE_THRESHOLD=10

CACHE_TTL_FILES=300
SESSION_IDLE_TIMEOUT=1800

ACCOUNT_LOCKOUT_THRESHOLD=5
ACCOUNT_LOCKOUT_MINUTES=15
PASSWORD_EXPIRY_DAYS=90

HSTS_MAX_AGE=${HSTS_MAX_AGE:-0}
HSTS_INCLUDE_SUBDOMAINS=true

TRUSTED_PROXIES=${TRUSTED_PROXIES:-*}
EOF
    echo "      .env created from environment variables."
fi

# Wait for MySQL
echo "[1/4] Waiting for database..."
ATTEMPTS=0
MAX_ATTEMPTS=30
until php -r "try { new PDO('mysql:host=${DB_HOST};dbname=${DB_DATABASE}','${DB_USERNAME}','${DB_PASSWORD}'); echo 'connected'; } catch (Exception \$e) { exit(1); }" 2>/dev/null; do
    ATTEMPTS=$((ATTEMPTS + 1))
    if [ "$ATTEMPTS" -ge "$MAX_ATTEMPTS" ]; then
        echo "      ERROR: Database not available after ${MAX_ATTEMPTS} attempts. Exiting."
        exit 1
    fi
    echo "      Attempt ${ATTEMPTS}/${MAX_ATTEMPTS} - waiting..."
    sleep 2
done
echo "      Database connected."

# Generate key if not set
echo "[2/4] Checking APP_KEY..."
if [ -z "${APP_KEY}" ]; then
    echo "      Generating new APP_KEY..."
    php artisan key:generate --force --no-interaction
else
    echo "      APP_KEY is already set."
fi

# Migrate
echo "[3/4] Running migrations..."
php artisan migrate --force --no-interaction || {
    echo "      WARNING: Migration failed. Checking connection..."
    php artisan migrate:status 2>&1 || true
}

# Seed if first run
USER_COUNT=$(php artisan tinker --execute="echo \App\Models\User::count();" 2>/dev/null || echo "0")
if [ "${USER_COUNT}" = "0" ]; then
    echo "      First run - seeding database..."
    php artisan db:seed --force --no-interaction || echo "      WARNING: Seeding failed."
fi

# Optimize
echo "[4/4] Optimizing..."
php artisan config:cache 2>/dev/null && echo "      Config cached." || echo "      Skipping config cache (may need .env)."
php artisan route:cache 2>/dev/null && echo "      Routes cached." || echo "      Skipping route cache."
php artisan view:cache 2>/dev/null && echo "      Views cached." || echo "      Skipping view cache."

echo ""
echo "========================================"
echo "  Ecvaultz Ready!"
echo "  http://localhost:8080"
echo "  admin@ecvaultz.test"
echo "  Admin@Ecvaultz#2024!"
echo "========================================"
echo ""

exec /usr/bin/supervisord -n -c /etc/supervisord.conf
