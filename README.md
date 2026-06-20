# 🔐 Ecvaultz — Digital Vault

> **Enterprise-grade digital vault for secure file storage, management, and sharing.**
> AES-256-GCM encryption · Two-Factor Authentication · Defense-in-Depth Security
> Built with Laravel 11 + React + Inertia.js — OWASP Top 10 Compliant

<p align="center">
  <img src="https://img.shields.io/badge/PHP-8.2%2B-7c22ff?logo=php" alt="PHP">
  <img src="https://img.shields.io/badge/Laravel-11.x-7c22ff?logo=laravel" alt="Laravel">
  <img src="https://img.shields.io/badge/React-18.x-7c22ff?logo=react" alt="React">
  <img src="https://img.shields.io/badge/Tailwind-3.4-7c22ff?logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/Encryption-AES--256--GCM-10b981" alt="Encryption">
  <img src="https://img.shields.io/badge/Auth-2FA%20TOTP-10b981" alt="2FA">
  <img src="https://img.shields.io/badge/OWASP-Compliant-10b981" alt="OWASP">
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="License">
</p>

---

## 📖 Table of Contents

- [What is Ecvaultz?](#-what-is-ecvaultz)
- [Features](#-features)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Quick Start (Local)](#-quick-start-local-development)
- [Production Deployment (Ubuntu)](#-production-deployment-ubuntu-2204-lts)
- [Docker Deployment](#-docker-deployment)
- [Environment Variables](#-environment-variables-reference)
- [Security Architecture](#-security-architecture)
- [Project Structure](#-project-structure)
- [Default Accounts](#-default-accounts)
- [Scheduled Tasks](#-scheduled-tasks)
- [Documentation Files](#-documentation-files)
- [Common Commands](#-common-artisan-commands)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [Security Policy](#-security-policy)
- [License](#-license)

---

## 🎯 What is Ecvaultz?

Ecvaultz is a **self-hosted digital vault** — a secure web application for storing, managing, and sharing sensitive digital files. Think of it as your personal bank vault, but for digital documents.

### Why Ecvaultz?

| Problem | Ecvaultz Solution |
|---|---|
| Files stored in plaintext on cloud | AES-256-GCM encryption with per-user keys |
| Weak authentication | TOTP 2FA + Account lockout + Password policies |
| No audit trail | Complete activity logging with IP tracking |
| Uncontrolled sharing | Password-protected links with expiry dates |
| No access control | 28 granular permissions via Spatie RBAC |

### Use Cases
- **Personal:** Store sensitive documents (passports, contracts, tax records)
- **Business:** Secure file sharing with clients and team members
- **Enterprise:** Compliance-ready storage with full audit trails
- **Legal/Medical:** HIPAA-ready architecture with chain of custody tracking

---

## ✨ Features

### Core
- **🔒 File Encryption** — AES-256-GCM with per-user encryption keys. Files encrypted at rest, decrypted on-demand. Keys stored separately from data.
- **📂 File Management** — Upload (drag-and-drop), download, preview (PDF/images), rename, move between folders, search with debounce, sortable columns.
- **📁 Folder Hierarchy** — Nested folders with breadcrumb navigation. Folder tree API for sidebar navigation.
- **🔗 Secure Sharing** — Internal sharing (user-to-user, read/write permissions) and external share links (password-protected, expiry dates, SHA-256 token hashing).
- **🗑️ Trash & Recovery** — Soft-delete with 30-day retention. Restore with one click. Permanent deletion requires password confirmation.

### Security
- **🛡️ Two-Factor Authentication** — TOTP-based (Google Authenticator, Authy). 8 recovery codes. Requires TOTP verification to disable 2FA or regenerate recovery codes.
- **🔐 Account Protection** — Brute-force lockout (5 attempts → 15 min lock). Per-account + per-IP rate limiting. Security questions for password reset fallback.
- **🦠 Malware Scanning** — Optional ClamAV integration. MIME validation via finfo (magic bytes). SHA-256 checksum verification on download.
- **📋 Complete Audit Trail** — Every action logged: logins, uploads, downloads, shares, deletions. IP addresses, user agents, timestamps. CSV export for compliance.
- **🛡️ OWASP Top 10 Compliant** — CSRF protection, XSS prevention (CSP + React escaping), SQL injection prevention (Eloquent ORM), input validation (server-side), security headers, HSTS, file upload security, path traversal protection.

### Administration
- **👑 Role-Based Access Control** — Admin & User roles via Spatie Laravel Permission. 28 granular permissions covering files, folders, shares, logs, users, admin, settings.
- **📊 Admin Dashboard** — Global stats (users, files, storage, shares). User management (view, edit roles, ban/unban). Activity log viewer with filters and CSV export. System settings management.
- **🔔 Notifications** — In-app notification system. File shared alerts. New device login alerts. Mark as read / mark all read.

### User Experience
- **🎨 Premium Dark Theme** — Glass morphism design with backdrop blur. Animated glow orbs and particle network background. Smooth scroll-triggered reveal animations.
- **⚡ Command Palette** — `Ctrl+K` quick navigation. Keyboard shortcuts for power users.
- **📱 Responsive Design** — Mobile-friendly with adaptive sidebar. Touch-optimized interactions. PWA manifest for installable web app.

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend** | PHP 8.2+, Laravel 11 | Application framework |
| **Frontend** | React 18, Inertia.js | SPA with server-driven routing |
| **CSS** | Tailwind CSS 3 | Utility-first design system |
| **Database** | MariaDB 10.11+ / MySQL 8.0+ | Primary data store |
| **Cache** | Redis 7+ (predis) | Session, cache, queue |
| **Auth** | Laravel Sanctum, pragmarx/google2fa | Token auth + TOTP 2FA |
| **RBAC** | Spatie Laravel Permission 6.x | Role-based access control |
| **Encryption** | OpenSSL AES-256-GCM | File encryption at rest |
| **Queue** | Database / Redis | Async job processing |
| **Mail** | SMTP (Mailtrap/Resend/Mailpit) | Email notifications |
| **Container** | Docker, Docker Compose | Production deployment |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- PHP 8.2+ with extensions: `pdo_mysql`, `mbstring`, `gd`, `zip`, `exif`, `intl`, `bcmath`, `openssl`
- Composer 2.x
- Node.js 20+ & npm 10+
- MariaDB 10.11+ or MySQL 8.0+
- Redis 7+ (optional for dev, required for production)

### Steps

```bash
# 1. Clone repository
git clone https://github.com/your-username/ecvaultz.git
cd ecvaultz

# 2. Install dependencies
composer install
npm install

# 3. Configure environment
cp .env.example .env
php artisan key:generate

# 4. Create database (MySQL/MariaDB)
mysql -u root -e "CREATE DATABASE ecvaultz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 5. Edit .env with your database credentials
# DB_CONNECTION=mariadb
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=ecvaultz
# DB_USERNAME=root
# DB_PASSWORD=

# 6. Run migrations and seed
php artisan migrate --seed

# 7. Build frontend assets
npm run build

# 8. Start development server
php artisan serve --host=127.0.0.1 --port=8000
```

Open **http://127.0.0.1:8000** in your browser.

### Hot Module Replacement (Dev)

In a second terminal:
```bash
npm run dev
```
Frontend changes reflected instantly without manual rebuild.

---

## 🏭 Production Deployment (Ubuntu 22.04 LTS)

Complete step-by-step guide for deploying Ecvaultz on a production Ubuntu server.

### Step 1: Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Set timezone
sudo timedatectl set-timezone UTC

# Create swap file (recommended for 1-2GB RAM)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Step 2: Install System Packages

```bash
# Add PHP repository
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

# Install all required packages
sudo apt install -y \
    nginx \
    mysql-server \
    redis-server \
    php8.2-fpm \
    php8.2-mysql \
    php8.2-mbstring \
    php8.2-gd \
    php8.2-zip \
    php8.2-exif \
    php8.2-intl \
    php8.2-bcmath \
    php8.2-redis \
    php8.2-opcache \
    php8.2-cli \
    composer \
    nodejs \
    npm \
    certbot \
    python3-certbot-nginx \
    unzip \
    git \
    supervisor
```

### Step 3: Configure MySQL/MariaDB

```bash
# Secure MySQL installation
sudo mysql_secure_installation
# Answer: Y (validate password), 2 (STRONG), set root password, Y (remove anonymous), Y (disallow remote root), Y (remove test DB), Y (reload privileges)

# Create database and user
sudo mysql -u root -p <<EOF
CREATE DATABASE ecvaultz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ecvaultz'@'localhost' IDENTIFIED BY 'YOUR_SECURE_DB_PASSWORD';
GRANT ALL PRIVILEGES ON ecvaultz.* TO 'ecvaultz'@'localhost';
FLUSH PRIVILEGES;
EOF
```

### Step 4: Configure Redis

```bash
# Enable Redis persistence
sudo sed -i 's/^appendonly no/appendonly yes/' /etc/redis/redis.conf

# Set Redis password (optional but recommended)
sudo sed -i 's/^# requirepass foobared/requirepass YOUR_REDIS_PASSWORD/' /etc/redis/redis.conf

# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

### Step 5: Clone & Setup Application

```bash
# Create application directory
sudo mkdir -p /var/www/ecvaultz
sudo chown $USER:$USER /var/www/ecvaultz

# Clone repository
git clone https://github.com/your-username/ecvaultz.git /var/www/ecvaultz
cd /var/www/ecvaultz

# Install PHP dependencies (production only)
composer install --no-dev --optimize-autoloader --no-interaction

# Install and build frontend
npm ci --no-audit
npm run build

# Configure environment
cp .env.example .env
php artisan key:generate

# Edit .env for production
nano .env
```

**Production `.env` values:**
```env
APP_NAME=Ecvaultz
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mariadb
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ecvaultz
DB_USERNAME=ecvaultz
DB_PASSWORD=YOUR_SECURE_DB_PASSWORD

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=YOUR_REDIS_PASSWORD
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-smtp-username
MAIL_PASSWORD=your-smtp-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@your-domain.com

SESSION_DRIVER=database
SESSION_SECURE_COOKIE=true
CACHE_DRIVER=redis
QUEUE_CONNECTION=database

SCAN_UPLOADS=true
HSTS_MAX_AGE=31536000
TRUSTED_PROXIES=*
```

### Step 6: Set Permissions

```bash
# Set ownership
sudo chown -R www-data:www-data /var/www/ecvaultz/storage
sudo chown -R www-data:www-data /var/www/ecvaultz/bootstrap/cache

# Set permissions
sudo chmod -R 775 /var/www/ecvaultz/storage
sudo chmod -R 775 /var/www/ecvaultz/bootstrap/cache

# Create storage directories if needed
sudo -u www-data mkdir -p /var/www/ecvaultz/storage/framework/views
sudo -u www-data mkdir -p /var/www/ecvaultz/storage/framework/cache/data
sudo -u www-data mkdir -p /var/www/ecvaultz/storage/app/private
```

### Step 7: Run Migrations & Optimize

```bash
# Run database migrations and seed
php artisan migrate --seed --force

# Cache configuration for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

### Step 8: Configure PHP-FPM

Edit `/etc/php/8.2/fpm/php.ini`:
```ini
# Security
expose_php = Off
display_errors = Off
log_errors = On

# Upload
upload_max_filesize = 52M
post_max_size = 52M
max_execution_time = 300

# Session
session.cookie_secure = On
session.cookie_httponly = On
session.cookie_samesite = Lax
```

```bash
sudo systemctl restart php8.2-fpm
sudo systemctl enable php8.2-fpm
```

### Step 9: Configure Nginx

Create `/etc/nginx/sites-available/ecvaultz`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/ecvaultz/public;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # File upload limit
    client_max_body_size 52M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    # Main application
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Static assets (cached)
    location /build/ {
        access_log off;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # PHP-FPM
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
        fastcgi_buffers 16 16k;
        fastcgi_buffer_size 32k;
    }

    # Block sensitive files
    location ~ /\.(?!well-known).* { deny all; }
    location ~ /(composer\.(json|lock)|package\.(json|lock)|\.env|README\.md|Dockerfile|docker-compose\.yml) { deny all; }
    location ~ /(storage/logs|storage/framework|vendor) { deny all; }

    # Deny access to storage directory
    location /storage { deny all; }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/ecvaultz /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
sudo systemctl enable nginx
```

### Step 10: SSL with Let's Encrypt

```bash
# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

### Step 11: Configure Queue Worker (Supervisor)

Create `/etc/supervisor/conf.d/ecvaultz-worker.conf`:

```ini
[program:ecvaultz-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/ecvaultz/artisan queue:work --queue=default --tries=3 --sleep=3 --timeout=300
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/ecvaultz/storage/logs/worker.log
stopwaitsecs=3600
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start ecvaultz-worker:*
```

### Step 12: Configure Scheduler (Cron)

```bash
sudo crontab -u www-data -e
```

Add:
```cron
* * * * * php /var/www/ecvaultz/artisan schedule:run >> /dev/null 2>&1
```

### Step 13: Verify Deployment

```bash
# Check all services
sudo systemctl status nginx php8.2-fpm mysql redis-server supervisor

# Check application
curl -I https://your-domain.com

# Expected: HTTP/2 200
```

### Step 14: Post-Deployment Security Checklist

- [ ] Change default admin password: `admin@ecvaultz.test`
- [ ] Enable 2FA on admin account
- [ ] Set `APP_DEBUG=false` in `.env`
- [ ] Configure SMTP mail settings
- [ ] Enable ClamAV: `SCAN_UPLOADS=true`
- [ ] Set `TRUSTED_PROXIES=*` (behind Cloudflare/load balancer)
- [ ] Verify SSL: https://www.ssllabs.com/ssltest/
- [ ] Verify security headers: https://securityheaders.com/
- [ ] Configure firewall: `sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw enable`
- [ ] Setup automated backups (database + storage)

---

## 🐳 Docker Deployment

For quick deployment using Docker Compose:

```bash
# Clone repository
git clone https://github.com/your-username/ecvaultz.git
cd ecvaultz

# Configure environment
cp .env.example .env
# Edit .env with production values (see Step 5 above)

# Start services
docker compose up -d

# Generate app key
docker compose exec app php artisan key:generate

# Run migrations
docker compose exec app php artisan migrate --seed

# Verify
docker compose ps
# Expected: app (Up), db (Up), redis (Up)
```

Services included:
- **app:** PHP 8.2-FPM + Nginx + Supervisor (queue worker + scheduler)
- **db:** MariaDB 10.11
- **redis:** Redis 7 Alpine
- **mailpit:** Email testing UI (dev profile only, port 8025)

Access at `http://localhost:8080` (or configure reverse proxy for port 80/443).

---

## 🔧 Environment Variables Reference

### Application
| Variable | Default | Description |
|---|---|---|
| `APP_NAME` | Ecvaultz | Application name |
| `APP_ENV` | production | `local`, `staging`, `production` |
| `APP_DEBUG` | false | **MUST be false in production** |
| `APP_URL` | http://localhost | Full application URL |
| `APP_KEY` | (required) | Generate: `php artisan key:generate` |

### Database
| Variable | Default | Description |
|---|---|---|
| `DB_CONNECTION` | mariadb | `mariadb` or `mysql` |
| `DB_HOST` | 127.0.0.1 | Database host |
| `DB_PORT` | 3306 | Database port |
| `DB_DATABASE` | ecvaultz | Database name |
| `DB_USERNAME` | — | Database user |
| `DB_PASSWORD` | — | Database password |

### Redis
| Variable | Default | Description |
|---|---|---|
| `REDIS_HOST` | 127.0.0.1 | Redis host |
| `REDIS_PORT` | 6379 | Redis port |
| `REDIS_PASSWORD` | null | Redis password |
| `REDIS_PREFIX` | ecvaultz_ | Key namespace prefix |

### Mail
| Variable | Default | Description |
|---|---|---|
| `MAIL_MAILER` | smtp | `smtp`, `log`, `mailgun`, `resend` |
| `MAIL_HOST` | — | SMTP server hostname |
| `MAIL_PORT` | 587 | SMTP port |
| `MAIL_USERNAME` | — | SMTP username |
| `MAIL_PASSWORD` | — | SMTP password |
| `MAIL_ENCRYPTION` | tls | `tls`, `ssl`, or `null` |
| `MAIL_FROM_ADDRESS` | — | Sender email address |

### Security
| Variable | Default | Description |
|---|---|---|
| `MAX_UPLOAD_SIZE` | 52428800 | Max file size in bytes (50MB) |
| `ALLOWED_EXTENSIONS` | pdf,docx,xlsx,jpg,png,7z | Allowed file extensions |
| `SCAN_UPLOADS` | false | Enable ClamAV virus scanning |
| `PASSWORD_MIN_LENGTH` | 12 | Minimum password length |
| `PASSWORD_EXPIRY_DAYS` | 90 | Password expiry in days (0=never) |
| `TWO_FACTOR_REQUIRED` | false | Force 2FA for all users |
| `ACCOUNT_LOCKOUT_THRESHOLD` | 5 | Failed logins before lockout |
| `ACCOUNT_LOCKOUT_MINUTES` | 15 | Lockout duration in minutes |
| `SESSION_DRIVER` | database | `database` or `redis` |
| `SESSION_LIFETIME` | 30 | Session lifetime (minutes) |
| `SESSION_SECURE_COOKIE` | true | HTTPS-only cookies |
| `SESSION_IDLE_TIMEOUT` | 1800 | Idle timeout (seconds) |
| `SOFT_DELETE_RETENTION_DAYS` | 30 | Trash retention (days) |
| `TRUSTED_PROXIES` | null | Proxy IPs (`*` behind LB) |
| `HSTS_MAX_AGE` | 31536000 | HSTS duration (0=disable) |

### Rate Limiting
| Variable | Default | Description |
|---|---|---|
| `UPLOAD_RATE_LIMIT` | 10 | Uploads/min per user |
| `DOWNLOAD_RATE_LIMIT` | 20 | Downloads/min per user |
| `RESET_REQUEST_LIMIT` | 3 | Password resets/hour |

---

## 🔐 Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────────┐
│              NETWORK LAYER                   │
│  HTTPS (TLS 1.3) + HSTS + Trusted Proxies   │
├─────────────────────────────────────────────┤
│           APPLICATION LAYER                  │
│  CSP + X-Frame-Options + CSRF + Rate Limits  │
├─────────────────────────────────────────────┤
│          AUTHENTICATION LAYER                │
│  Password Policy + 2FA TOTP + Account Lockout│
├─────────────────────────────────────────────┤
│          AUTHORIZATION LAYER                 │
│  Spatie RBAC (28 permissions) + Gates        │
├─────────────────────────────────────────────┤
│            DATA LAYER                        │
│  AES-256-GCM Encryption + SHA-256 Checksums  │
├─────────────────────────────────────────────┤
│           STORAGE LAYER                      │
│  Per-User Private Disk + Path Traversal Prot │
├─────────────────────────────────────────────┤
│           MONITORING LAYER                   │
│  Complete Activity Audit Trail + Logging     │
└─────────────────────────────────────────────┘
```

### File Encryption Flow
1. User registers → per-user 256-bit AES-256-GCM key generated
2. Per-user key encrypted with `APP_KEY` via Laravel Crypt facade
3. File uploaded → validated (extension + MIME finfo + size + ClamAV) → stored to private disk → SHA-256 checksum calculated → encrypted with per-user key
4. File downloaded → authorization check → path traversal protection → decrypted on-the-fly → checksum verified → streamed to browser → temp file auto-cleaned

### File Isolation
Each user's files are stored in `storage/app/private/user_{id}/` with:
- **Physical isolation** — separate directories per user
- **Encryption isolation** — different encryption key per user
- **Policy isolation** — FilePolicy enforces ownership checks
- **Path protection** — realpath() validation prevents traversal attacks

### Authentication Flow
1. Login → credentials verified → rate limit check → lockout check
2. 2FA enabled? → TOTP challenge (or 10-char recovery code)
3. Session created → regenerated → `2fa.verified` flag set with idle timeout
4. Each request → RequireTwoFactor middleware verifies 2FA session

---

## 📂 Project Structure

```
ecvaultz/
├── app/
│   ├── Console/Commands/         # 3 Artisan commands (cleanup)
│   ├── Http/
│   │   ├── Controllers/          # 15+ controllers
│   │   │   ├── Admin/            # Admin dashboard, user mgmt, settings
│   │   │   └── Auth/             # Login, register, 2FA, password reset
│   │   ├── Middleware/           # SecurityHeaders, Require2FA, CheckPermission
│   │   └── Requests/             # Form request validation
│   ├── Jobs/                     # ProcessFileUpload queue job
│   ├── Mail/                     # AccountLockout, SecurityAlert mailables
│   ├── Models/                   # 10 Eloquent models
│   ├── Policies/                 # FilePolicy, FolderPolicy
│   ├── Providers/                # App, Auth, Route service providers
│   └── Services/                 # 8 business logic services
├── bootstrap/                    # Application bootstrap
├── config/                       # 8 config files
├── database/
│   ├── migrations/               # 12 migration files
│   └── seeders/                  # Role, admin, demo user seeders
├── docker/                       # Nginx, PHP, Supervisor configs
├── public/                       # Web root + PWA manifest
├── resources/
│   ├── css/app.css               # 280+ line design system
│   ├── js/
│   │   ├── Components/           # 10 reusable React components
│   │   ├── Hooks/                # 4 custom React hooks
│   │   ├── Layouts/              # 3 page layouts
│   │   └── Pages/                # 28 Inertia.js pages
│   └── views/app.blade.php       # Root Blade view
├── routes/
│   ├── web.php                   # 75+ web routes
│   └── api.php                   # API routes (Sanctum)
├── storage/                      # Logs, cache, encrypted files
├── .env.example                  # Full environment template
├── Dockerfile                    # Multi-stage production build
├── docker-compose.yml            # 4-service orchestration
├── doc-dev.md                    # Complete documentation (merged)
├── doc-vuln.md                   # Security vulnerability assessment
├── Rekomendasi-up.md             # 2000+ design/UI/UX recommendations
├── tailwind.config.js            # 28 keyframes + design tokens
└── vite.config.js                # Vite + React plugin
```

---

## 📦 Default Accounts

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@ecvaultz.test` | `Admin@Ecvaultz#2024!` | All 28 permissions |
| **User** | `user@ecvaultz.test` | `User@Ecvaultz#2024!` | Standard file operations |
| **Demo** | `demo@ecvaultz.test` | `Demo@Ecvaultz#2024!` | Standard file operations |

> ⚠️ **SECURITY WARNING:** Change ALL default passwords immediately after deployment. Delete demo accounts in production.

---

## 🔄 Scheduled Tasks

| Command | Schedule | Purpose |
|---|---|---|
| `ecvaultz:cleanup-expired-files` | Daily 02:00 | Permanently delete files past retention period |
| `ecvaultz:cleanup-expired-shares` | Hourly | Remove expired share links |
| `ecvaultz:cleanup-activity-logs --days=90` | Daily 03:00 | Purge activity logs older than 90 days |

---

## 📚 Documentation Files

| File | Content |
|---|---|
| `doc-dev.md` | Complete merged documentation: setup guide + project analysis + security audit + implementation results + design recommendations |
| `doc-vuln.md` | 1001+ verified security vulnerabilities with CVSS scores and remediation |
| `Rekomendasi-up.md` | 2000+ design, UI/UX, and animation upgrade recommendations |
| `Cara-Jalankan.txt` | (Merged into doc-dev.md Section 1) |

---

## 🛠️ Common Artisan Commands

| Command | Purpose |
|---|---|
| `php artisan migrate:fresh --seed` | Reset database + seed default accounts |
| `php artisan config:cache` | Cache config for production |
| `php artisan route:cache` | Cache routes for production |
| `php artisan view:cache` | Cache Blade views |
| `php artisan optimize` | Full production optimization |
| `php artisan down --secret="token"` | Maintenance mode with bypass URL |
| `php artisan up` | Disable maintenance mode |
| `php artisan queue:work` | Process queue jobs |
| `php artisan schedule:work` | Run scheduler (development) |
| `php artisan tinker` | Interactive PHP REPL |
| `php artisan route:list` | List all registered routes |
| `php artisan migrate:status` | Check migration status |

---

## 🚨 Troubleshooting

### "Please provide a valid cache path"
```bash
mkdir -p storage/framework/views storage/framework/cache/data bootstrap/cache
php artisan config:clear && php artisan view:clear
```

### Database connection refused
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Start if needed
sudo systemctl start mysql

# Verify connection
mysql -u ecvaultz -p -e "SELECT 1"
```

### 404 on all routes except homepage
```bash
# Nginx: ensure try_files is configured (see Nginx config above)
# Apache: enable mod_rewrite
sudo a2enmod rewrite && sudo systemctl restart apache2
```

### File upload fails
- Check `MAX_UPLOAD_SIZE` in `.env`
- Verify `upload_max_filesize` and `post_max_size` in `php.ini` (≥ 52M)
- Check `client_max_body_size` in Nginx config (≥ 52M)

### Permission denied on storage
```bash
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### SSL certificate not renewing
```bash
sudo certbot renew --dry-run
sudo systemctl status certbot.timer
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following code standards
4. Commit: `git commit -m 'feat: add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Standards
- **PHP:** PSR-12, strict type declarations, PHPDoc for public methods
- **JavaScript:** ES6+, functional components with hooks, PropTypes
- **CSS:** Tailwind utility classes, custom components in `@layer components`
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `security:`)

---

## ⚠️ Security Policy

### Reporting a Vulnerability

If you discover a security vulnerability, **DO NOT** open a public GitHub issue.

Email: `security@ecvaultz.test` (replace with actual contact)

Please include:
- Detailed description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

We follow responsible disclosure and will respond within 48 hours.

### Security Headers (Production)

| Header | Value |
|---|---|
| `Content-Security-Policy` | Strict (script-src 'self', no unsafe-eval in production) |
| `X-Frame-Options` | DENY |
| `X-Content-Type-Options` | nosniff |
| `Strict-Transport-Security` | max-age=31536000; includeSubDomains |
| `Referrer-Policy` | strict-origin-when-cross-origin |
| `Permissions-Policy` | camera=(), microphone=(), geolocation=() |
| `Cross-Origin-Opener-Policy` | same-origin |
| `Cross-Origin-Resource-Policy` | same-origin |

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<p align="center">
  <b>Ecvaultz</b> — Your files. Your control. Our security.<br>
  <sub>Protected by AES-256-GCM encryption. OWASP Top 10 compliant.</sub>
</p>
